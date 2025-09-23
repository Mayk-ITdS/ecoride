import db from "../db/postgres.js";
import mongo from "../db/mongo.js";

class EmployeeService {
  async getPendingReviews() {
    const docs = await mongo
      .collection("reviews")
      .find({ status: "pending" })
      .project({
        trajetId: 1,
        chauffeurId: 1,
        passagerId: 1,
        note: 1,
        commentaire: 1,
      })
      .toArray();
    const userIds = [
      ...new Set(docs.flatMap((d) => [d.chauffeurId, d.passagerId])),
    ];
    const users = await db.any(
      `SELECT id_user, pseudo FROM users WHERE id_user IN ($1:csv)`,
      [userIds]
    );
    const byId = Object.fromEntries(users.map((u) => [u.id_user, u.pseudo]));
    return docs.map((d) => ({
      id: String(d._id),
      trajetId: d.trajetId,
      chauffeur_pseudo: byId[d.chauffeurId] ?? `#${d.chauffeurId}`,
      passager_pseudo: byId[d.passagerId] ?? `#${d.passagerId}`,
      note: d.note,
      commentaire: d.commentaire,
    }));
  }

  async setReviewStatus(id, status) {
    const ok = await mongo
      .collection("reviews")
      .updateOne({ _id: new mongo.ObjectId(id) }, { $set: { status } });
    if (!ok.matchedCount) throw new Error("Avis introuvable");
    return { success: true, status };
  }
  async getIncidents() {
    const cancelled = await db.any(`
      SELECT t.id_trajet, t.depart_ville, t.arrivee_ville, t.depart_ts, t.arrivee_ts,
             ch.pseudo AS chauffeur_pseudo, ch.email AS chauffeur_email,
             pa.pseudo AS passager_pseudo, pa.email AS passager_email
      FROM trajets t
      JOIN status_trajet s ON s.status_id = t.status_id
      JOIN participations p ON p.id_trajet = t.id_trajet
      JOIN users ch ON ch.id_user = t.id_chauffeur
      JOIN users pa ON pa.id_user = p.id_passager
      WHERE s.status = 'annulé'
      ORDER BY t.depart_ts DESC NULLS LAST
    `);
    const badReviews = await mongo
      .collection("reviews")
      .find({
        status: "approved",
        note: { $lte: 2 },
      })
      .project({ trajetId: 1, chauffeurId: 1, passagerId: 1 })
      .toArray();

    let lowRated = [];
    if (badReviews.length) {
      const trajetIds = [...new Set(badReviews.map((r) => r.trajetId))];
      const usersNeeded = [
        ...new Set(badReviews.flatMap((r) => [r.chauffeurId, r.passagerId])),
      ];

      const trips = await db.any(
        `
        SELECT t.id_trajet, t.depart_ville, t.arrivee_ville, t.depart_ts, t.arrivee_ts,
               ch.id_user AS chauffeur_id, ch.pseudo AS chauffeur_pseudo, ch.email AS chauffeur_email
        FROM trajets t JOIN users ch ON ch.id_user = t.id_chauffeur
        WHERE t.id_trajet IN ($1:csv)
      `,
        [trajetIds]
      );

      const users = await db.any(
        `SELECT id_user, pseudo, email FROM users WHERE id_user IN ($1:csv)`,
        [usersNeeded]
      );
      const byUid = Object.fromEntries(users.map((u) => [u.id_user, u]));

      lowRated = badReviews
        .map((br) => {
          const trip = trips.find((t) => t.id_trajet === br.trajetId);
          const passager = byUid[br.passagerId];
          if (!trip || !passager) return null;
          return {
            id_trajet: trip.id_trajet,
            depart_ville: trip.depart_ville,
            arrivee_ville: trip.arrivee_ville,
            depart_ts: trip.depart_ts,
            arrivee_ts: trip.arrivee_ts,
            chauffeur_pseudo: trip.chauffeur_pseudo,
            chauffeur_email: trip.chauffeur_email,
            passager_pseudo: passager.pseudo,
            passager_email: passager.email,
          };
        })
        .filter(Boolean);
    }

    return [...cancelled, ...lowRated];
  }
}

export default new EmployeeService();
