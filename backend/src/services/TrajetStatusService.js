import db_pg from "../../db/postgres.js";
import { getStatusIdMap, ensure } from "./statusHelpers.js";
import ReviewService from "./MongoReviewService.js";

class TrajetStatusService {
  async _loadTripForUpdate(t, trajetId) {
    return t.oneOrNone(
      `SELECT id_trajet, id_chauffeur, status_id, prix
       FROM trajets
       WHERE id_trajet=$1
       FOR UPDATE`,
      [trajetId]
    );
  }

  async confirmer({ trajetId, driverId }) {
    return db_pg.tx(async (t) => {
      const st = await getStatusIdMap(t);
      const trip = await this._loadTripForUpdate(t, trajetId);
      ensure(trip, "Trajet introuvable");
      ensure(trip.id_chauffeur === driverId, "Interdit (pas le chauffeur)");
      ensure(trip.status_id === st.en_attente, "Transition invalide");
      return t.one(
        `UPDATE trajets
         SET status_id=$2
         WHERE id_trajet=$1
         RETURNING id_trajet, status_id`,
        [trajetId, st.confirmé]
      );
    });
  }

  async demarrer({ trajetId, driverId }) {
    return db_pg.tx(async (t) => {
      const st = await getStatusIdMap(t);
      const trip = await this._loadTripForUpdate(t, trajetId);
      ensure(trip, "Trajet introuvable");
      ensure(trip.id_chauffeur === driverId, "Interdit (pas le chauffeur)");
      ensure(trip.status_id === st.confirmé, "Transition invalide");
      return t.one(
        `UPDATE trajets
         SET status_id=$2
         WHERE id_trajet=$1
         RETURNING id_trajet, status_id`,
        [trajetId, st.en_cours]
      );
    });
  }

  async terminer({ trajetId, driverId }) {
    return db_pg.tx(async (t) => {
      const st = await getStatusIdMap(t);
      const trip = await this._loadTripForUpdate(t, trajetId);
      ensure(trip, "Trajet introuvable");
      ensure(trip.id_chauffeur === driverId, "Interdit (pas le chauffeur)");
      ensure(trip.status_id === st.en_cours, "Transition invalide");

      const updated = await t.one(
        `UPDATE trajets
         SET status_id=$2
         WHERE id_trajet=$1
         RETURNING id_trajet, status_id`,
        [trajetId, st.terminé]
      );
      await ReviewService.queuePendingForTripEnd(
        t,
        trajetId,
        trip.id_chauffeur
      );
      const { nb_confirme } = await t.one(
        `SELECT COUNT(*)::int AS nb_confirme
         FROM participations
        WHERE id_trajet=$1 AND status='confirmé'`,
        [trajetId]
      );
      const prixNet = Number(trip.prix) - 2;
      if (nb_confirme > 0 && prixNet > 0) {
        await t.none(
          `UPDATE users
            SET credits = credits + $1
          WHERE id_user = $2`,
          [nb_confirme * prixNet, trip.id_chauffeur]
        );
      }
      await MailerService.enqueueTripFinishedEmails(trajetId);
      return updated;
    });
  }

  async annuler({ trajetId, driverId }) {
    return db.tx(async (t) => {
      const st = await getStatusIdMap(t);
      const trip = await this._loadTripForUpdate(t, trajetId);
      ensure(trip, "Trajet introuvable");
      ensure(trip.id_chauffeur === driverId, "Interdit (pas le chauffeur)");
      ensure(
        [st.en_attente, st.confirmé].includes(trip.status_id),
        "Trop tard pour annuler"
      );
      const updated = await t.one(
        `UPDATE trajets
         SET status_id=$2
         WHERE id_trajet=$1
         RETURNING id_trajet, status_id`,
        [trajetId, st.annulé]
      );
      await t.none(
        `UPDATE users u
         SET credits = u.credits + (t.prix - 2)
         FROM participations p
         JOIN trajets t ON t.id_trajet = p.id_trajet
         WHERE p.id_trajet=$1 AND u.id_user = p.id_passager`,
        [trajetId]
      );
      await t.none(`DELETE FROM participations WHERE id_trajet=$1`, [trajetId]);

      return updated;
    });
  }
}

export default new TrajetStatusService();
