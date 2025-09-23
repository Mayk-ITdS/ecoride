import db from "../../db/postgres.js";
import mongo from "../../db/mongo.js";
function has3Sentences(text = "") {
  const sentences = text
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.length >= 3;
}

class ReviewService {
  async queuePendingForTripEnd(t, trajetId, idChauffeur) {
    const passengers = await t.any(
      `SELECT p.id_user AS id_user
       FROM participations p
       WHERE p.id_trajet=$1 AND p.status='confirmé'`,
      [trajetId]
    );
    if (!passengers.length) return;

    await mongo.collection("avis").insertMany(
      passengers.map((p) => ({
        type: "driver_review",
        id_trajet: trajetId,
        id_chauffeur: idChauffeur,
        id_passager: p.id_user,
        status: "pending",
        created_at: new Date(),
      }))
    );

    await mongo.collection("app_feedback_tasks").insertMany(
      passengers.map((p) => ({
        id_user: p.id_user,
        source: "trip_end",
        status: "pending",
        created_at: new Date(),
      }))
    );
  }

  async getPendingForUser(userId) {
    const driverReviews = await mongo
      .collection("avis")
      .find({
        type: "driver_review",
        id_passager: userId,
        status: "pending",
      })
      .toArray();

    const enriched = [];
    for (const r of driverReviews) {
      const meta = await db.oneOrNone(
        `SELECT u.pseudo AS chauffeur, t.depart_ville, t.arrivee_ville, t.depart_ts
         FROM trajets t JOIN users u ON u.id_user=t.id_chauffeur
         WHERE t.id_trajet=$1`,
        [r.id_trajet]
      );
      enriched.push({ ...r, meta });
    }

    const appFeedback = await mongo
      .collection("app_feedback_tasks")
      .find({
        id_user: userId,
        status: "pending",
      })
      .toArray();

    return { driverReviews: enriched, appFeedback };
  }

  async submitDriverReview({ userId, trajetId, note, commentaire }) {
    const doc = await mongo.collection("avis").findOne({
      type: "driver_review",
      id_passager: userId,
      id_trajet: trajetId,
      status: "pending",
    });
    if (!doc) throw new Error("Aucune review en attente");

    if (!has3Sentences(commentaire)) {
      throw new Error("Le commentaire doit contenir au moins trois phrases.");
    }

    await mongo.collection("avis").updateOne(
      { _id: doc._id },
      {
        $set: {
          note,
          commentaire,
          status: "pending",
          submitted_at: new Date(),
        },
      }
    );
    return { success: true };
  }

  async submitAppFeedback({ userId, note, commentaire }) {
    const task = await mongo.collection("app_feedback_tasks").findOne({
      id_user: userId,
      status: "pending",
    });
    if (!task) throw new Error("Aucun feedback en attente");

    if (!has3Sentences(commentaire)) {
      throw new Error("Le commentaire doit contenir au moins trzy zdania.");
    }

    await mongo.collection("app_feedback").insertOne({
      id_user: userId,
      note,
      commentaire,
      status: "pending",
      created_at: new Date(),
    });

    await mongo
      .collection("app_feedback_tasks")
      .updateOne(
        { _id: task._id },
        { $set: { status: "done", done_at: new Date() } }
      );

    return { success: true };
  }
}

export default new ReviewService();
