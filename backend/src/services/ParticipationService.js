import { getStatusIdMap, ensure } from "./statusHelpers.js";
import db_pg from "../../db/postgres.js";

class ParticipationService {
  async participerAuTrajet({ userId, trajetId }) {
    const trajet = await db_pg.oneOrNone(
      `SELECT id_trajet, id_chauffeur, places_disponibles, prix
       FROM trajets
       WHERE id_trajet = $1`,
      [trajetId]
    );
    if (!trajet) throw new Error("Trajet introuvable");
    if (trajet.id_chauffeur === userId)
      throw new Error(
        "Le chauffeur ne peut pas participer à son propre trajet"
      );

    const places = trajet.places_disponibles ?? 0;
    if (places <= 0) throw new Error("Aucune place disponible");

    const user = await db_pg.oneOrNone(
      `SELECT id_user, credits FROM users WHERE id_user = $1`,
      [userId]
    );
    if (!user) throw new Error("Utilisateur introuvable");

    const prixNet = Number(trajet.prix) - 2;
    if (user.credits < 2) throw new Error("Crédits insuffisants");

    return db_pg.tx(async (t) => {
      const exists = await t.oneOrNone(
        `SELECT 1 FROM participations WHERE id_trajet = $1 AND id_passager = $2`,
        [trajetId, userId]
      );
      if (exists) throw new Error("Déjà inscrit à ce trajet");

      const participation = await t.one(
        `INSERT INTO participations (id_trajet, id_passager, status)
   VALUES ($1, $2, 'en_attente')
   RETURNING id_participation, id_trajet, id_passager, status, date_reservation`,
        [trajetId, userId]
      );

      return { success: true, participation };
    });
  }
  async annulerParPassager({ participationId, userId }) {
    return db_pg.tx(async (t) => {
      const st = await getStatusIdMap(t);
      const row = await t.oneOrNone(
        `SELECT p.id_participation, p.id_passager, p.id_trajet,
                t.prix, t.status_id
         FROM participations p
         JOIN trajets t ON t.id_trajet=p.id_trajet
         WHERE p.id_participation=$1
         FOR UPDATE`,
        [participationId]
      );
      ensure(row, "Participation introuvable");
      ensure(row.id_passager === userId, "Interdit");
      ensure(
        [st.en_attente, st.confirmé].includes(row.status_id),
        "Trop tard pour annuler"
      );
      await t.none(
        `UPDATE users SET credits = credits + ($1 - 2) WHERE id_user=$2`,
        [row.prix, userId]
      );
      await t.none(
        `UPDATE trajets
         SET places_disponibles = places_disponibles + 1
         WHERE id_trajet=$1`,
        [row.id_trajet]
      );
      await t.none(`DELETE FROM participations WHERE id_participation=$1`, [
        participationId,
      ]);

      return { success: true };
    });
  }
  async confirmParticipation({ participationId, driverId }) {
    return db.tx(async (t) => {
      const row = await t.oneOrNone(
        `SELECT p.id_participation, p.id_passager, p.status, p.id_trajet,
              t.id_chauffeur, t.prix, t.places_disponibles
       FROM participations p
       JOIN trajets t ON t.id_trajet = p.id_trajet
       WHERE p.id_participation=$1
       FOR UPDATE`,
        [participationId]
      );
      if (!row) throw new Error("Participation introuvable");
      if (row.id_chauffeur !== driverId) throw new Error("Interdit");
      if (row.status !== "en_attente") throw new Error("Déjà traité");
      if ((row.places_disponibles ?? 0) <= 0)
        throw new Error("Aucune place disponible");
      const prixNet = Number(row.prix) - 2;
      const u = await t.one(`SELECT credits FROM users WHERE id_user=$1`, [
        row.id_passager,
      ]);
      if (u.credits < prixNet) throw new Error("Crédits insuffisants");

      await t.none(`UPDATE users SET credits = credits - $1 WHERE id_user=$2`, [
        prixNet,
        row.id_passager,
      ]);
      await t.none(
        `UPDATE trajets SET places_disponibles = places_disponibles - 1 WHERE id_trajet=$1`,
        [row.id_trajet]
      );
      const updated = await t.one(
        `UPDATE participations SET status='confirmé' WHERE id_participation=$1
       RETURNING id_participation, status`,
        [participationId]
      );
      return { success: true, updated };
    });
  }
  async refuseParticipation({ participationId, driverId }) {
    return db.tx(async (t) => {
      const row = await t.oneOrNone(
        `SELECT p.id_participation, p.status, t.id_chauffeur
       FROM participations p
       JOIN trajets t ON t.id_trajet = p.id_trajet
       WHERE p.id_participation=$1
       FOR UPDATE`,
        [participationId]
      );
      if (!row) throw new Error("Participation introuvable");
      if (row.id_chauffeur !== driverId) throw new Error("Interdit");
      if (row.status !== "en_attente") throw new Error("Déjà traité");

      const updated = await t.one(
        `UPDATE participations SET status='refusé' WHERE id_participation=$1
       RETURNING id_participation, status`,
        [participationId]
      );
      return { success: true, updated };
    });
  }
  async updateParticipationStatus({ participationId, status, byUserId }) {
    return db_pg.tx(async (t) => {
      const row = await t.oneOrNone(
        `SELECT p.id_participation, p.status, p.id_trajet, 
              t.id_chauffeur, t.places_disponibles, t.prix, p.id_passager
       FROM participations p
       JOIN trajets t ON t.id_trajet = p.id_trajet
       WHERE p.id_participation=$1
       FOR UPDATE`,
        [participationId]
      );
      if (!row) throw new Error("Participation introuvable");
      if (row.id_chauffeur !== byUserId) throw new Error("Interdit");
      if (row.p_status !== "en_attente") throw new Error("Déjà traité");

      if (status === "confirmé") {
        if ((row.places_disponibles ?? 0) <= 0)
          throw new Error("Aucune place disponible");

        const prixNet = Number(row.prix) - 2;
        const u = await t.one(`SELECT credits FROM users WHERE id_user=$1`, [
          row.id_passager,
        ]);
        if (u.credits < 2) throw new Error("Crédits insuffisants");

        await t.none(
          `UPDATE users SET credits = credits - 2 WHERE id_user=$2`,
          [prixNet, row.id_passager]
        );
        await t.none(
          `UPDATE trajets SET places_disponibles = places_disponibles - 1 WHERE id_trajet=$1`,
          [row.id_trajet]
        );
        const updated = await t.one(
          `UPDATE participations SET status='confirmé' WHERE id_participation=$1
         RETURNING id_participation, status`,
          [participationId]
        );
        return { success: true, updated };
      }

      if (status === "refusé") {
        const updated = await t.one(
          `UPDATE participations SET status='refusé' WHERE id_participation=$1
         RETURNING id_participation, status`,
          [participationId]
        );
        return { success: true, updated };
      }
      const updated = await t.one(
        `UPDATE participations SET status=$2 WHERE id_participation=$1
         RETURNING id_participation, status`,
        [participationId, status]
      );
      throw new Error("Status inconnu");
    });
  }
  async listPassengers({ trajetId, requesterId }) {
    const own = await db_pg.oneOrNone(
      `SELECT id_trajet, id_chauffeur FROM trajets WHERE id_trajet=$1`,
      [trajetId]
    );
    if (!own) throw new Error("Trajet introuvable");
    if (own.id_chauffeur !== requesterId) throw new Error("Interdit");

    const rows = await db_pg.any(
      `
      SELECT p.id_participation, p.status, u.pseudo
      FROM participations p
      JOIN users u ON u.id_user = p.id_passager
      WHERE p.id_trajet=$1
      ORDER BY p.id_participation ASC
    `,
      [trajetId]
    );

    return rows.map((r) => ({
      id_participation: r.id_participation,
      status: r.status || "en_attente",
      pseudo: r.pseudo,
    }));
  }
  async updateParticipationStatus({ participationId, status, byUserId }) {
    if (!["confirmé", "refusé"].includes(status))
      throw new Error("Status invalide (confirmé|refusé)");

    return db_pg.tx(async (t) => {
      const row = await t.oneOrNone(
        `
        SELECT p.id_participation, p.status, p.id_passager, p.id_trajet,
               tr.id_chauffeur, tr.places_disponibles, tr.prix
        FROM participations p
        JOIN trajets tr ON tr.id_trajet = p.id_trajet
        WHERE p.id_participation=$1
        FOR UPDATE
      `,
        [participationId]
      );
      if (!row) throw new Error("Participation introuvable");
      if (row.id_chauffeur !== byUserId) throw new Error("Interdit");

      if (row.status !== "en_attente")
        throw new Error("Participation déjà traitée");

      if (status === "confirmé") {
        const places = row.places_disponibles ?? 0;
        if (places <= 0) throw new Error("Aucune place disponible");

        const prixNet = Number(row.prix) - 2;
        const u = await t.one(`SELECT credits FROM users WHERE id_user=$1`, [
          row.id_passager,
        ]);
        if (u.credits < 2) throw new Error("Crédits insuffisants");

        await t.none(
          `UPDATE users SET credits = credits - 2 WHERE id_user=$2`,
          [prixNet, row.id_passager]
        );
        await t.none(
          `UPDATE trajets SET places_disponibles = places_disponibles - 1 WHERE id_trajet=$1`,
          [row.id_trajet]
        );
      }

      const updated = await t.one(
        `UPDATE participations SET status=$2 WHERE id_participation=$1
         RETURNING id_participation, status`,
        [participationId, status]
      );

      return { success: true, updated };
    });
  }
}

export default new ParticipationService();
