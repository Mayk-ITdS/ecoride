import { collection } from "../../db/mongo.js";
import db_pg from "../../db/postgres.js";

class TrajetService {
  async findManyWithFilters(
    depart,
    arrivee,
    date,
    prixMax = null,
    minAvisScore = null,
    isEco = false,
    maxDuree = null
  ) {
    let avis_ids = [];
    if (minAvisScore != null) {
      const avis_mongo = await collection("passenger_notes")
        .aggregate([
          { $group: { _id: "$driverId", avgScore: { $avg: "$rating" } } },
          { $match: { avgScore: { $gte: Number(minAvisScore) } } },
        ])
        .toArray();
      avis_ids = avis_mongo.map((a) => Number(a._id)).filter(Number.isFinite);
    }

    const sql = `
  SELECT t.id_trajet,
         t.id_chauffeur,
         t.depart_ville,
         t.arrivee_ville,
         t.depart_ts,
         t.duree_estimee,
         t.places_disponibles,
         t.prix,
         v.couleur,
         v.immatriculation,
         v.nb_places,
         v.is_electric,
         m.marque,
         m.modele,
         u.pseudo AS chauffeur
  FROM trajets t
  JOIN voitures v ON t.id_voiture = v.id_voiture
  JOIN modeles_voiture m ON v.id_modele = m.id_modele
  JOIN users u ON t.id_chauffeur = u.id_user
  WHERE ( $<depart> IS NULL OR t.depart_ville ILIKE '%' || $<depart> || '%' )
    AND ( $<arrivee> IS NULL OR t.arrivee_ville ILIKE '%' || $<arrivee> || '%' )
    AND ( $<date> IS NULL OR t.depart_ts::date = $<date>::date )
    AND ( $<prixMax> IS NULL OR t.prix <= $<prixMax> )
    AND ( $<maxDuree> IS NULL OR t.duree_estimee <= $<maxDuree> )
    AND ( $<isEco> = false OR v.is_electric = true )
    ${minAvisScore != null && avis_ids.length ? "AND u.id_user IN ($<avisIds:csv>)" : ""}
`;

    const params = {
      depart,
      arrivee,
      date,
      prixMax,
      maxDuree,
      isEco,
      avisIds: avis_ids,
    };
    const rows = await db_pg.any(sql, params);

    const mapped = await Promise.all(
      rows.map(async (trajet) => {
        const userData = await collection("preferences").findOne({
          id_user: trajet.driverId,
        });
        const avis = await collection("passenger_notes")
          .find({ id_chauffeur: trajet.driverId })
          .toArray();
        return {
          id: trajet.id_trajet,
          depart: trajet.depart_ville,
          arrivee: trajet.arrivee_ville,
          date: trajet.depart_ts,
          duree: trajet.duree_estimee,
          places: trajet.places_disponibles,
          prix: trajet.prix,
          chauffeur: {
            nom: trajet.chauffeur,
            preferences: userData?.preferences ?? { fumer: false, pets: true },
          },
          voiture: {
            marque: trajet.marque,
            modele: trajet.modele,
            couleur: trajet.couleur,
            immatriculation: trajet.immatriculation,
            places: trajet.nb_places,
            eco: trajet.is_electric,
          },
          avis: avis.map((a) => ({
            author: a.publicName,
            note: a.rating,
            commentaire: a.message,
          })),
        };
      })
    );

    return mapped;
  }
  async findOneById({ id_trajet }) {
    const sql = `
    SELECT t.id_trajet,
           t.id_chauffeur,
           t.depart_ville, 
           t.arrivee_ville,
           t.depart_ts,
           t.duree_estimee,
           t.places_disponibles, 
           t.prix, 
           v.couleur,
           v.immatriculation,
           v.nb_places,
           v.is_electric, 
           m.marque, 
           m.modele,
           u.pseudo AS chauffeur
    FROM trajets t 
    JOIN voitures v on t.id_voiture = v.id_voiture 
    JOIN modeles_voiture m on v.id_modele = m.id_modele 
    JOIN users u on t.id_chauffeur = u.id_user 
    WHERE t.id_trajet = $1
  `;
    const t = await db_pg.oneOrNone(sql, [id_trajet]);
    if (!t) return null;

    const driverId = Number(t.id_chauffeur);

    // Preferencje z Mongo (opcjonalne)
    const prefsDoc = await collection("preferences").findOne({
      id_user: driverId,
    });
    const preferences = prefsDoc?.preferences ?? { fumer: false, pets: true };

    // 🔴 Opinie z Mongo: passenger_notes, po driverId
    const notes = await collection("passenger_notes")
      .find({ driverId })
      .project({ _id: 0, publicName: 1, rating: 1, message: 1 })
      .toArray();

    const avis = notes.map((n) => ({
      author: n.publicName,
      note: Number(n.rating) || 0,
      commentaire: n.message ?? "",
    }));

    return {
      id: t.id_trajet,
      depart: t.depart_ville,
      arrivee: t.arrivee_ville,
      date: t.depart_ts,
      duree: t.duree_estimee,
      places: t.places_disponibles ?? t.nb_places,
      prix: Number(t.prix),
      chauffeur: {
        id: driverId,
        nom: t.chauffeur,
        preferences,
      },
      voiture: {
        marque: t.marque,
        modele: t.modele,
        couleur: t.couleur,
        immatriculation: t.immatriculation,
        places: t.nb_places,
        eco: !!t.is_electric,
      },
      avis, // ✅ to trafia na front
    };
  }
  async createNew(data = {}) {
    const {
      depart,
      arrivee,
      depart_ts,
      arrivee_ts,
      duree,
      prix,
      places,
      chauffeur,
      voiture,
    } = data;

    const sql = `INSERT INTO trajets (
        id_chauffeur,
        id_voiture,
        depart_ville,
        arrivee_ville,
        duree_estimee,
        prix,
        places_disponibles,
        depart_ts,
        arrivee_ts,
        status_id
      )
      VALUES (
        $<chauffeurId>,
        $<voitureId>,
        $<depart>,
        $<arrivee>,
        $<duree>,
        $<prix>,
        $<places>,
        $<depart_ts>,
        $<arrivee_ts>,
        (SELECT status_id FROM status_trajet WHERE status = 'en_attente' LIMIT 1)
      )
      RETURNING *;
    `;

    const params = {
      chauffeurId: chauffeur.id,
      voitureId: voiture.id_voiture,
      depart,
      arrivee,
      duree,
      prix,
      places,
      depart_ts,
      arrivee_ts,
    };
    const new_trajet = await db_pg.one(sql, params);

    const userData = await collection("preferences").findOne({
      id_user: chauffeur.id,
    });
    const preferences = userData?.preferences ?? {
      fumer: false,
      pets: true,
    };
    await collection("preferences").updateOne(
      { id_user: chauffeur.id },
      { $setOnInsert: { preferences } },
      { upsert: true }
    );
    return {
      id: new_trajet.id_trajet,
      depart,
      arrivee,
      date: depart_ts,
      duree,
      prix,
      places,
      chauffeur: {
        id: chauffeur.id,
        preferences,
      },
      voiture,
      status: "en_attente",
    };
  }
  async listForUser(userId) {
    const sql = `
    SELECT t.id_trajet,
           t.depart_ville,
           t.arrivee_ville,
           t.depart_ts,
           COALESCE(s.status, 'en_attente') AS status,
           'chauffeur' AS role_dans_trajet,
           t.prix
    FROM trajets t
    LEFT JOIN status_trajet s ON s.status_id = t.status_id
    WHERE t.id_chauffeur = $1

    UNION ALL

    SELECT t.id_trajet,
           t.depart_ville,
           t.arrivee_ville,
           t.depart_ts,
           COALESCE(s.status, 'en_attente') AS status,
           'passager' AS role_dans_trajet,
           t.prix
    FROM trajets t
    JOIN participations p ON p.id_trajet = t.id_trajet
    LEFT JOIN status_trajet s ON s.status_id = t.status_id
    WHERE p.id_passager = $1

    ORDER BY depart_ts DESC;
  `;
    return db_pg.any(sql, [userId]);
  }
  async getMine(userId) {
    const sql = `
      SELECT
        t.id_trajet,
        t.depart_ville,
        t.arrivee_ville,
        t.depart_ts,
        t.prix,
        s.status AS status,
        'chauffeur'::text AS role_dans_trajet
      FROM trajets t
      JOIN status_trajet s ON s.status_id = t.status_id
      WHERE t.id_chauffeur = $1

      UNION ALL

      SELECT
        t.id_trajet,
        t.depart_ville,
        t.arrivee_ville,
        t.depart_ts,
        t.prix,
        s.status AS status,
        'passager'::text AS role_dans_trajet
      FROM trajets t
      JOIN status_trajet s ON s.status_id = t.status_id
      JOIN participations p ON p.id_trajet = t.id_trajet
      WHERE p.id_passager = $1

      ORDER BY depart_ts DESC NULLS LAST
    `;
    return db.any(sql, [userId]);
  }
  async demarrer({ trajetId, driverId }) {
    return db_pg.tx(async (t) => {
      const trip = await t.oneOrNone(
        `SELECT id_trajet, id_chauffeur, status_id
       FROM trajets WHERE id_trajet=$1 FOR UPDATE`,
        [trajetId]
      );
      if (!trip) throw new Error("Trajet introuvable");
      if (trip.id_chauffeur !== driverId) throw new Error("Interdit");

      const ok = await t.one(
        `SELECT status_id FROM status_trajet WHERE status='confirmé'`
      );
      if (trip.status_id !== ok.status_id)
        throw new Error("Transition invalide");

      const enCours = await t.one(
        `UPDATE trajets
       SET status_id = (SELECT status_id FROM status_trajet WHERE status='en_cours')
       WHERE id_trajet=$1
       RETURNING id_trajet, status_id`,
        [trajetId]
      );
      return enCours;
    });
  }
  async annulerParticipation({ participationId, userId }) {
    return db_pg.tx(async (t) => {
      const p = await t.oneOrNone(
        `SELECT p.id_participation, p.id_passager, p.id_trajet, t.prix, t.status_id
       FROM participations p
       JOIN trajets t ON t.id_trajet=p.id_trajet
       WHERE p.id_participation=$1 FOR UPDATE`,
        [participationId]
      );
      if (!p) throw new Error("Participation introuvable");
      if (p.id_passager !== userId) throw new Error("Interdit");

      const rows = await t.any(`SELECT status, status_id FROM status_trajet`);
      const by = Object.fromEntries(rows.map((r) => [r.status, r.status_id]));
      if (![by.en_attente, by.confirmé].includes(p.status_id))
        throw new Error("Trop tard pour annuler");

      await t.none(
        `UPDATE users SET credits = credits + ($1 - 2) WHERE id_user=$2`,
        [p.prix, userId]
      );
      await t.none(
        `UPDATE trajets SET places_disponibles = places_disponibles + 1
       WHERE id_trajet=$1`,
        [p.id_trajet]
      );
      await t.none(`DELETE FROM participations WHERE id_participation=$1`, [
        participationId,
      ]);
      return { success: true };
    });
  }
}

export default new TrajetService();
