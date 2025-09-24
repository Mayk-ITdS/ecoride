

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: check_active_trajet_chauffeur(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_active_trajet_chauffeur() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  new_dep timestamptz;
  new_arr timestamptz;
BEGIN
  
  SELECT depart_ts, arrivee_ts
  INTO   new_dep, new_arr
  FROM   public.trajets
  WHERE  id_trajet = NEW.id_trajet;

  IF new_dep IS NULL OR new_arr IS NULL THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.trajets t
    JOIN public.status_trajet s ON s.status_id = t.status_id
    WHERE t.id_chauffeur = NEW.id_chauffeur
      AND (TG_OP <> 'UPDATE' OR t.id_trajet <> NEW.id_trajet)  
      AND s.status = 'en_cours'
      AND tstzrange(t.depart_ts, t.arrivee_ts, '[)')           
          && tstzrange(new_dep, new_arr, '[)')
  ) THEN
    RAISE EXCEPTION 'Le chauffeur % a déjà un trajet en cours qui chevauche', NEW.id_chauffeur
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END
$$;


--
-- Name: check_active_trajet_passager(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_active_trajet_passager() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM participations p
    JOIN trajets t ON t.id_trajet = p.id_trajet
    JOIN status_trajet s ON s.status_id = t.status_id
    WHERE p.id_passager = NEW.id_passager
      AND s.status = 'en_cours'
      AND tstzrange(t.depart_ts, t.arrivee_ts) 
          && tstzrange(
                (SELECT depart_ts FROM trajets WHERE id_trajet = NEW.id_trajet),
                (SELECT arrivee_ts FROM trajets WHERE id_trajet = NEW.id_trajet)
             )
  ) THEN
    RAISE EXCEPTION 'Le passager % a déjà un trajet en cours', NEW.id_passager
	USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: is_driver_role(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_driver_role(p_role_id integer) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM roles r
    WHERE r.role_id = p_role_id AND r.nom = 'chauffeur'  -- <== ZMIEŃ, jeśli inna nazwa
  );
$$;


--
-- Name: move_to_historique(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.move_to_historique() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.status_id IN (
        SELECT status_id
        FROM public.status_trajet
        WHERE status IN ('terminé','annulé')
    ) THEN
        INSERT INTO public.historique_trajets
        SELECT NEW.*;
        DELETE FROM public.trajets WHERE id_trajet = NEW.id_trajet;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: notify_driver_role_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_driver_role_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  payload jsonb;
  u_id int;
  op text;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF is_driver_role(NEW.role_id) THEN
      u_id := NEW.user_id; op := 'ADD';
    ELSE RETURN NULL; END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF is_driver_role(OLD.role_id) THEN
      u_id := OLD.user_id; op := 'REMOVE';
    ELSE RETURN NULL; END IF;
  ELSE
    RETURN NULL;
  END IF;

  payload := jsonb_build_object('user_id', u_id, 'op', op);
  PERFORM pg_notify('driver_role', payload::text);
  RETURN NULL;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: historique_trajets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historique_trajets (
    id_trajet integer,
    id_chauffeur integer,
    id_voiture integer,
    depart_ville character varying(100),
    arrivee_ville character varying(100),
    duree_estimee integer,
    prix numeric(6,2),
    places_disponibles integer,
    depart_ts timestamp without time zone,
    arrivee_ts timestamp without time zone,
    status_id integer
);


--
-- Name: modeles_voiture; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modeles_voiture (
    id_modele integer NOT NULL,
    marque character varying(50) NOT NULL,
    modele character varying(50) NOT NULL,
    annee integer,
    type_carburant character varying(20),
    CONSTRAINT modeles_voiture_type_carburant_check CHECK (((type_carburant)::text = ANY ((ARRAY['essence'::character varying, 'diesel'::character varying, 'electrique'::character varying, 'hybride'::character varying])::text[])))
);


--
-- Name: modeles_voiture_id_modele_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.modeles_voiture_id_modele_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: modeles_voiture_id_modele_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.modeles_voiture_id_modele_seq OWNED BY public.modeles_voiture.id_modele;


--
-- Name: paiements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paiements (
    id_paiement integer NOT NULL,
    id_user integer,
    id_trajet integer,
    montant numeric(6,2) NOT NULL,
    date_paiement timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    mode character varying(20),
    CONSTRAINT paiements_mode_check CHECK (((mode)::text = ANY ((ARRAY['CB'::character varying, 'PayPal'::character varying, 'Credits'::character varying])::text[])))
);


--
-- Name: paiements_id_paiement_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.paiements_id_paiement_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: paiements_id_paiement_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.paiements_id_paiement_seq OWNED BY public.paiements.id_paiement;


--
-- Name: participations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.participations (
    id_participation integer NOT NULL,
    id_trajet integer,
    id_passager integer,
    date_reservation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'en_attente'::character varying NOT NULL
);


--
-- Name: participations_id_participation_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.participations_id_participation_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: participations_id_participation_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.participations_id_participation_seq OWNED BY public.participations.id_participation;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    nom character varying(50)
);


--
-- Name: roles_id_role_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_role_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_role_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_role_seq OWNED BY public.roles.role_id;


--
-- Name: status_trajet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.status_trajet (
    status_id integer NOT NULL,
    status character varying(50) NOT NULL
);


--
-- Name: status_trajet_status_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.status_trajet_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: status_trajet_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.status_trajet_status_id_seq OWNED BY public.status_trajet.status_id;


--
-- Name: trajets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trajets (
    id_trajet integer NOT NULL,
    id_chauffeur integer,
    id_voiture integer,
    depart_ville character varying(100) NOT NULL,
    arrivee_ville character varying(100) NOT NULL,
    duree_estimee integer,
    prix numeric(6,2) NOT NULL,
    places_disponibles integer DEFAULT 0 NOT NULL,
    depart_ts timestamp without time zone,
    arrivee_ts timestamp without time zone,
    status_id integer NOT NULL,
    CONSTRAINT trajets_places_disponibles_check CHECK ((places_disponibles >= 0))
);


--
-- Name: trajets_id_trajet_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trajets_id_trajet_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trajets_id_trajet_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trajets_id_trajet_seq OWNED BY public.trajets.id_trajet;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    user_id integer NOT NULL,
    role_id integer NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id_user integer NOT NULL,
    pseudo character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    mot_de_passe text NOT NULL,
    date_inscription timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    credits integer DEFAULT 20,
    is_suspended boolean DEFAULT false NOT NULL
);


--
-- Name: users_id_user_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_user_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_user_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_user_seq OWNED BY public.users.id_user;


--
-- Name: voitures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voitures (
    id_voiture integer NOT NULL,
    id_user integer,
    id_modele integer,
    couleur character varying(30),
    immatriculation character varying(20),
    date_enregistrement timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    nb_places smallint NOT NULL,
    is_electric boolean DEFAULT false NOT NULL,
    date_premiere_immatriculation date,
    CONSTRAINT voitures_nb_places_check CHECK (((nb_places >= 1) AND (nb_places <= 8)))
);


--
-- Name: voitures_id_voiture_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.voitures_id_voiture_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: voitures_id_voiture_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.voitures_id_voiture_seq OWNED BY public.voitures.id_voiture;


--
-- Name: modeles_voiture id_modele; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modeles_voiture ALTER COLUMN id_modele SET DEFAULT nextval('public.modeles_voiture_id_modele_seq'::regclass);


--
-- Name: paiements id_paiement; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paiements ALTER COLUMN id_paiement SET DEFAULT nextval('public.paiements_id_paiement_seq'::regclass);


--
-- Name: participations id_participation; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participations ALTER COLUMN id_participation SET DEFAULT nextval('public.participations_id_participation_seq'::regclass);


--
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_id_role_seq'::regclass);


--
-- Name: status_trajet status_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.status_trajet ALTER COLUMN status_id SET DEFAULT nextval('public.status_trajet_status_id_seq'::regclass);


--
-- Name: trajets id_trajet; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trajets ALTER COLUMN id_trajet SET DEFAULT nextval('public.trajets_id_trajet_seq'::regclass);


--
-- Name: users id_user; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id_user SET DEFAULT nextval('public.users_id_user_seq'::regclass);


--
-- Name: voitures id_voiture; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voitures ALTER COLUMN id_voiture SET DEFAULT nextval('public.voitures_id_voiture_seq'::regclass);


--
-- Name: modeles_voiture_id_modele_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.modeles_voiture_id_modele_seq', 8, true);


--
-- Name: paiements_id_paiement_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.paiements_id_paiement_seq', 1, false);


--
-- Name: participations_id_participation_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.participations_id_participation_seq', 13, true);


--
-- Name: roles_id_role_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_role_seq', 4, true);


--
-- Name: status_trajet_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.status_trajet_status_id_seq', 9, true);


--
-- Name: trajets_id_trajet_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.trajets_id_trajet_seq', 18, true);


--
-- Name: users_id_user_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_user_seq', 41, true);


--
-- Name: voitures_id_voiture_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.voitures_id_voiture_seq', 9, true);


--
-- Name: modeles_voiture modeles_voiture_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modeles_voiture
    ADD CONSTRAINT modeles_voiture_pkey PRIMARY KEY (id_modele);


--
-- Name: paiements paiements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paiements
    ADD CONSTRAINT paiements_pkey PRIMARY KEY (id_paiement);


--
-- Name: participations participations_id_trajet_id_passager_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participations
    ADD CONSTRAINT participations_id_trajet_id_passager_key UNIQUE (id_trajet, id_passager);


--
-- Name: participations participations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participations
    ADD CONSTRAINT participations_pkey PRIMARY KEY (id_participation);


--
-- Name: participations participations_uni; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participations
    ADD CONSTRAINT participations_uni UNIQUE (id_trajet, id_passager);


--
-- Name: roles roles_nom_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nom_key UNIQUE (nom);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: status_trajet status_trajet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.status_trajet
    ADD CONSTRAINT status_trajet_pkey PRIMARY KEY (status_id);


--
-- Name: status_trajet status_trajet_status_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.status_trajet
    ADD CONSTRAINT status_trajet_status_key UNIQUE (status);


--
-- Name: trajets trajets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trajets
    ADD CONSTRAINT trajets_pkey PRIMARY KEY (id_trajet);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id_user);


--
-- Name: users users_pseudo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pseudo_key UNIQUE (pseudo);


--
-- Name: voitures voitures_immatriculation_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voitures
    ADD CONSTRAINT voitures_immatriculation_key UNIQUE (immatriculation);


--
-- Name: voitures voitures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voitures
    ADD CONSTRAINT voitures_pkey PRIMARY KEY (id_voiture);


--
-- Name: participations_id_trajet_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX participations_id_trajet_status_idx ON public.participations USING btree (id_trajet, status);


--
-- Name: trajets store_in_history; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER store_in_history AFTER UPDATE OF status_id ON public.trajets FOR EACH ROW EXECUTE FUNCTION public.move_to_historique();


--
-- Name: trajets trg_check_active_trajet_chauffeur; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_check_active_trajet_chauffeur BEFORE INSERT OR UPDATE OF id_chauffeur, depart_ts, arrivee_ts ON public.trajets FOR EACH ROW EXECUTE FUNCTION public.check_active_trajet_chauffeur();


--
-- Name: participations trg_check_active_trajet_passager; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_check_active_trajet_passager BEFORE INSERT OR UPDATE ON public.participations FOR EACH ROW EXECUTE FUNCTION public.check_active_trajet_passager();


--
-- Name: user_roles trg_user_roles_driver_notify_del; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_user_roles_driver_notify_del AFTER DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.notify_driver_role_change();


--
-- Name: user_roles trg_user_roles_driver_notify_ins; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_user_roles_driver_notify_ins AFTER INSERT ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.notify_driver_role_change();


--
-- Name: paiements paiements_id_trajet_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paiements
    ADD CONSTRAINT paiements_id_trajet_fkey FOREIGN KEY (id_trajet) REFERENCES public.trajets(id_trajet);


--
-- Name: paiements paiements_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paiements
    ADD CONSTRAINT paiements_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.users(id_user);


--
-- Name: participations participations_id_passager_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participations
    ADD CONSTRAINT participations_id_passager_fkey FOREIGN KEY (id_passager) REFERENCES public.users(id_user) ON DELETE CASCADE;


--
-- Name: participations participations_id_trajet_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participations
    ADD CONSTRAINT participations_id_trajet_fkey FOREIGN KEY (id_trajet) REFERENCES public.trajets(id_trajet) ON DELETE CASCADE;


--
-- Name: trajets trajets_id_chauffeur_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trajets
    ADD CONSTRAINT trajets_id_chauffeur_fkey FOREIGN KEY (id_chauffeur) REFERENCES public.users(id_user) ON DELETE SET NULL;


--
-- Name: trajets trajets_id_voiture_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trajets
    ADD CONSTRAINT trajets_id_voiture_fkey FOREIGN KEY (id_voiture) REFERENCES public.voitures(id_voiture);


--
-- Name: trajets trajets_status_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trajets
    ADD CONSTRAINT trajets_status_fk FOREIGN KEY (status_id) REFERENCES public.status_trajet(status_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id_user) ON DELETE CASCADE;


--
-- Name: voitures voitures_id_modele_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voitures
    ADD CONSTRAINT voitures_id_modele_fkey FOREIGN KEY (id_modele) REFERENCES public.modeles_voiture(id_modele);


--
-- Name: voitures voitures_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voitures
    ADD CONSTRAINT voitures_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.users(id_user) ON DELETE CASCADE;





