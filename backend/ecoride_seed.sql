--
-- PostgreSQL database dump
--

\restrict Hw4tVxMmlUfB1Kh5qBk4RxUZYkgTkfPHaZoqkPF1dyUVNaO4sAcHveKibm7b6uW

-- Dumped from database version 14.19 (Ubuntu 14.19-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.19 (Ubuntu 14.19-0ubuntu0.22.04.1)

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
  -- zakres nowego/edytowanego kursu
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
      AND (TG_OP <> 'UPDATE' OR t.id_trajet <> NEW.id_trajet)   -- nie łap samego siebie
      AND s.status = 'en_cours'
      AND tstzrange(t.depart_ts, t.arrivee_ts, '[)')            -- półotwarty
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
-- Data for Name: historique_trajets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.historique_trajets (id_trajet, id_chauffeur, id_voiture, depart_ville, arrivee_ville, duree_estimee, prix, places_disponibles, depart_ts, arrivee_ts, status_id) FROM stdin;
9	8	1	Paris	Marseille	466	45.00	4	2025-09-19 13:12:00	\N	3
8	8	1	Paris	Marseille	4343	45.00	4	2025-09-23 11:38:00	\N	3
7	8	1	Paris	Marseille	4343	45.00	4	2025-09-23 11:38:00	\N	3
6	8	1	Paris	Marseille	4343	45.00	4	2025-09-23 11:38:00	\N	3
5	8	1	Paris	Marseille	360	60.00	4	2025-09-26 11:08:00	\N	3
\.


--
-- Data for Name: modeles_voiture; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.modeles_voiture (id_modele, marque, modele, annee, type_carburant) FROM stdin;
1	mercedes	CLK	2012	essence
2	tesla	wazari	2020	electrique
3	Ilina	Grozna	2025	electrique
4	Merol	CLK	2025	electrique
7	Ilina	CLK	2025	diesel
8	Melex	R2D2	2018	electrique
\.


--
-- Data for Name: paiements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.paiements (id_paiement, id_user, id_trajet, montant, date_paiement, mode) FROM stdin;
\.


--
-- Data for Name: participations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.participations (id_participation, id_trajet, id_passager, date_reservation, status) FROM stdin;
3	1	2	2025-09-14 02:30:44.799277	en_attente
4	1	3	2025-09-14 02:30:44.799277	en_attente
5	3	4	2025-09-14 02:30:44.799277	en_attente
6	4	2	2025-09-14 02:30:44.799277	en_attente
9	4	8	2025-09-20 12:47:12.940109	en_attente
10	3	8	2025-09-21 14:46:25.41491	en_attente
11	10	6	2025-09-21 17:16:26.277274	confirmé
12	10	7	2025-09-22 02:03:20.212607	confirmé
13	13	23	2025-09-23 12:24:35.839765	en_attente
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (role_id, nom) FROM stdin;
1	chauffeur
2	passager
3	admin
4	employee
\.


--
-- Data for Name: status_trajet; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.status_trajet (status_id, status) FROM stdin;
3	terminé
4	annulé
5	en_attente
2	confirme
1	en_cours
\.


--
-- Data for Name: trajets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.trajets (id_trajet, id_chauffeur, id_voiture, depart_ville, arrivee_ville, duree_estimee, prix, places_disponibles, depart_ts, arrivee_ts, status_id) FROM stdin;
2	5	1	Marseille	Nice	120	30.00	4	2025-09-16 02:19:05.099062	2025-09-16 04:19:05.099062	1
1	5	1	Paris	Lyon	180	50.00	2	2025-09-15 02:19:05.099062	2025-09-15 05:19:05.099062	1
4	6	2	Lille	Bruxelles	60	20.00	3	2025-09-18 02:19:05.099062	2025-09-18 03:19:05.099062	1
3	6	2	Toulouse	Bordeaux	120	40.00	3	2025-09-17 02:19:05.099062	2025-09-17 04:19:05.099062	1
10	8	2	Paris	Tooulouse	400	24.00	0	2025-09-25 13:37:00	\N	5
11	21	2	Paris	Marseille	360	23.00	0	2025-09-25 06:56:00	\N	5
12	21	1	Marseille	Paris	360	34.00	4	\N	\N	5
13	21	1	Paris	Toulon	560	23.00	3	2025-09-30 08:18:00	2025-09-30 17:38:00	5
14	21	2	Toulouse	Lyon	500	34.00	2	2025-10-16 08:24:00	2025-10-16 16:44:00	5
15	21	2	Toulouse	Lyon	500	34.00	2	2025-11-08 09:24:00	2025-11-08 17:44:00	5
16	21	2	Toulouse	Lyon	500	34.00	2	2025-11-08 09:24:00	2025-11-08 17:44:00	5
17	21	2	Toulouse	Lyon	500	34.00	2	2025-11-08 09:24:00	2025-11-08 17:44:00	5
18	21	2	Toulouse	Lyon	500	34.00	2	2025-11-08 09:24:00	2025-11-08 17:44:00	5
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (user_id, role_id) FROM stdin;
1	1
1	2
2	2
3	2
4	2
5	1
6	2
7	3
41	4
8	2
7	2
5	2
11	2
12	2
13	2
14	2
15	2
16	2
17	2
18	2
19	2
20	2
21	2
22	2
23	2
24	2
25	2
26	2
27	2
28	2
29	2
30	2
31	2
32	2
33	2
34	2
35	2
36	2
37	2
38	2
39	2
40	2
41	2
11	1
12	1
13	1
14	1
15	1
16	1
17	1
18	1
19	1
20	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id_user, pseudo, email, mot_de_passe, date_inscription, credits, is_suspended) FROM stdin;
6	Fiona	fiona@mail.com	$2a$06$K4wyu8MYXSs1DkkEdIk8EOl9u7XdsCPgp3Bc9HgrWmh.9k3m3LZjm	2025-09-14 01:34:25.652634	16	f
8	Wojtek	duck@jumping.fr	$2a$06$HlVmg8MbndkV2KT5jnRyY.O.o/0v4KcqjKtQcJOD6lK/OXTEVLyya	2025-09-17 13:23:12.266	62	f
1	Alice	alice@mail.com	$2a$06$RAgS/I..nsDVwaR03kxKVuqp1ZOl0U3Ig/uxB9EDNalfwb/ypfBDK	2025-09-14 01:34:25.652634	20	f
7	admin	admin@ecoride.fr	$2a$06$Hrrz1y9SVZqm2d22NSzJi.eApzNAXhxFWbeemKBN96oxrDy9b.rBa	2025-09-15 16:42:03.311516	18	f
3	Charlie	charlie@mail.com	$2a$06$QIiBa.8CgeMXDn5Url/qcudbEYP1VzqKzd5sd3g3B5m8Sgtw0K0Te	2025-09-14 01:34:25.652634	20	f
4	Diana	diana@mail.com	$2a$06$e1Keoya9Tw4Z3PYYoRPddeJFkClKUEq3BZfRxzPyIySEfbfAlXKNa	2025-09-14 01:34:25.652634	20	t
2	Bob	bob@mail.com	$2a$06$MbIuFEgLeb26FwazEpOdMeXiiiUR0NxRLPbL3AeSxyCyoZb7LdJFa	2025-09-14 01:34:25.652634	20	t
5	Ethan	ethan@mail.com	$2a$06$y7E6Mo0IKmRyE638gxBU7u6X4bGRqz5cxiNctZwb/e0Nv5eTux7zm	2025-09-14 01:34:25.652634	20	f
11	JeanMartin	conducteur01@demo.fr	$2a$06$8gl0zUypaciC4t4l.slKEOwhWJC7OtW2eJQOGjU.R2jeeB3/m3Zm6	2025-09-20 16:59:11.076375	20	f
12	SophieBernard	conducteur02@demo.fr	$2a$06$19UW8d50r4nhNh9MWvXmxu0.xE18r7sFhYaG1fyXQLdT/wE75Rmoa	2025-09-20 16:59:11.076375	20	f
13	PierreDubois	conducteur03@demo.fr	$2a$06$97kJzCLUGmLMqnx5jvx/.uBrEJeoR55ZzpFeqnshNX3NiIGI9lg0K	2025-09-20 16:59:11.076375	20	f
14	CamillePetit	conducteur04@demo.fr	$2a$06$WSnpToI2dqR5nPx.oxIiyOC/zqQKxPuWzvZ5pfxHMgYDJq5qWSI.q	2025-09-20 16:59:11.076375	20	f
15	NicolasLeroy	conducteur05@demo.fr	$2a$06$EsvTX9suuWU1IzGQ2rDxmeczaX0Q7zmqQGpo5oRfTHWRJVEHwEU8e	2025-09-20 16:59:11.076375	20	f
16	ClaireMoreau	conducteur06@demo.fr	$2a$06$9.8yAFCVrI0qZ3tWQBUDM.w1FW8fC8F/BxdFOyNaahK2ioSmGng6e	2025-09-20 16:59:11.076375	20	f
17	ThomasSimon	conducteur07@demo.fr	$2a$06$r7dePhODuOeIiCrmR0rCCOwwxuxz9UmV7NBDq86Dr9/qmmtY6V7fG	2025-09-20 16:59:11.076375	20	f
18	LucieLaurent	conducteur08@demo.fr	$2a$06$x2jkoJIHiZXEvgieZZLcM.0QVFvrGxlDYIT/x9zZ1qGdiq7esiyw6	2025-09-20 16:59:11.076375	20	f
19	HugoGarcia	conducteur09@demo.fr	$2a$06$j/kyS08Cm3NbfcIm3tEO6e8nOA5bl0SEO9NMmJXyPFyrCERtwTlGq	2025-09-20 16:59:11.076375	20	f
20	EmmaFournier	conducteur10@demo.fr	$2a$06$LdhM6mQ5ytw5HLDR5aeS1.pwPPlSA.NC8IMnmdjiCYDDZ7s2oB35.	2025-09-20 16:59:11.076375	20	f
21	LouisMercier	passager01@demo.fr	$2a$06$kWOrDGrjnpSuPdjPI5XjPeZmXJcFJ/49f/U0537GdFuPGWN2sSO/C	2025-09-20 16:59:11.076375	20	f
22	ManonFaure	passager02@demo.fr	$2a$06$IvD983GSEneR0RUb4lpEMuS98SY67sTncGdbIgLpz76be/BmXIOq.	2025-09-20 16:59:11.076375	20	f
23	JulesBlanc	passager03@demo.fr	$2a$06$zoS3bTlUyWOjUzyqSUa51OX50WuxhBWfV8B3erTqzg1iEvMCLl3V6	2025-09-20 16:59:11.076375	20	f
24	LéaFontaine	passager04@demo.fr	$2a$06$lR3RYrS99GtcSdtleUsUZO.WTmA4wroZo7xlON8WyVuSa7xOXlMfi	2025-09-20 16:59:11.076375	20	f
25	GabrielDupont	passager05@demo.fr	$2a$06$i9rZNJ09fxbmRHGOzyvwYuunnnORmEKzlNG0cP8hC4vJaehG5kvey	2025-09-20 16:59:11.076375	20	f
26	ChloéRoussel	passager06@demo.fr	$2a$06$YQEkvXzpGR9wPvNlZtWK8OrGoK/nPDkymphPXGtluvwjod7fQ9wZ2	2025-09-20 16:59:11.076375	20	f
27	ArthurLambert	passager07@demo.fr	$2a$06$N0xWlSoMFSCn94kBE1/5xud5z67mOiW/FZn51EVqzcS5lg7CCsebS	2025-09-20 16:59:11.076375	20	f
28	ZoéRobin	passager08@demo.fr	$2a$06$rmrWynQX3oi6TYd53Mjgx.7WI9Eiqqy3oas2X1YGZvmxiVtbN2OSK	2025-09-20 16:59:11.076375	20	f
29	RaphaëlNoel	passager09@demo.fr	$2a$06$EvnXsZ8BsU8TFWEiKQMY..0sSMXWCJd96ZF9mT5c3IJyDFYQRet/a	2025-09-20 16:59:11.076375	20	f
30	AnnaHenry	passager10@demo.fr	$2a$06$R4/1V..N00UnUOyG.YxgnuB3mtcRvjUbO7Chsu32qgqfZOjjREm.e	2025-09-20 16:59:11.076375	20	f
31	LucasCharles	passager11@demo.fr	$2a$06$nBrD3cQhclu7arEFUo920OSo52O9Xz7GhXjsNoIxnIVl/w1F6slDW	2025-09-20 16:59:11.076375	20	f
32	InèsVidal	passager12@demo.fr	$2a$06$g4/igki7CzYFLvVUflXh3.4W7N8vgx5Ciyt9l8T54SoC5E51IrrNK	2025-09-20 16:59:11.076375	20	f
33	SachaBourgeois	passager13@demo.fr	$2a$06$0SezwxrNEOphDB2h9GTYsOCtqv0jOaHqA5.wLwdePxrmoa.y2b.ba	2025-09-20 16:59:11.076375	20	f
34	SarahMathieu	passager14@demo.fr	$2a$06$iiHJrvfW.lwy4mVaw9x1geBVi4f5V.iHT7eQs2wUQhKEiAChO1og6	2025-09-20 16:59:11.076375	20	f
35	EthanGuerin	passager15@demo.fr	$2a$06$l.vwGn8HKSyTrJAS/MymhO2ECsbe7dDrG5hiKnQ0F8bOE2AYDh88C	2025-09-20 16:59:11.076375	20	f
36	LinaRoger	passager16@demo.fr	$2a$06$Wny99QtshRUs5iZk0hEXTuq.xg/eYhShsGJONsLhPK..HDlt0SQ/G	2025-09-20 16:59:11.076375	20	f
37	NoahChevalier	passager17@demo.fr	$2a$06$19SXa/6GxUf02SMoM.UQh.OqYHGVrf7D5nPB1EG42A2loQa4Er4E.	2025-09-20 16:59:11.076375	20	f
38	EvaClement	passager18@demo.fr	$2a$06$2YGm67ZcG5kCbAzxCARGwupTsh..KseE/6WVMb3vnmL3haj3N9WTW	2025-09-20 16:59:11.076375	20	f
39	TiméoPires	passager19@demo.fr	$2a$06$B4KMp0LH9S2/yrGZ7ZU08u3CWGtBgXVdeX2.ewBysZyQTOs88fQIe	2025-09-20 16:59:11.076375	20	f
40	RoseCaron	passager20@demo.fr	$2a$06$PodcjWRSA03shLtoPhGsd.H2mm4X2GBvGanYCCVnNACmGf1F.RL8C	2025-09-20 16:59:11.076375	20	f
41	Gabrielle	rubio@studi.fr	$2b$10$nJKGAv34.3WY9DR/dCPF.uQiyJ5et0LoTZijW3mfuqx8klFD/NF0e	2025-09-22 03:23:17.232208	20	f
\.


--
-- Data for Name: voitures; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.voitures (id_voiture, id_user, id_modele, couleur, immatriculation, date_enregistrement, nb_places, is_electric, date_premiere_immatriculation) FROM stdin;
1	5	1	rouge	AA-111-AA	2025-09-14 02:18:55.319106	4	f	\N
2	6	2	noir	BB-222-BB	2025-09-14 02:18:55.319106	5	t	\N
3	8	3	\N	XT4955	2025-09-18 16:01:54.748	3	t	\N
4	8	4	beige	DS95004	2025-09-19 16:06:25.344	4	t	\N
5	8	4	beige	fghfg43442	2025-09-19 16:07:44.459	4	t	\N
6	8	4	beige	WT99802	2025-09-20 22:46:50.257	4	f	1999-12-11
8	6	7	beige	wt9987	2025-09-20 23:40:54.303	4	f	1999-12-31
9	4	8	gris	DS 95008	2025-09-22 01:31:24.951	4	t	2018-01-02
\.


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


--
-- PostgreSQL database dump complete
--

\unrestrict Hw4tVxMmlUfB1Kh5qBk4RxUZYkgTkfPHaZoqkPF1dyUVNaO4sAcHveKibm7b6uW

