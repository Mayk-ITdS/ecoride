import db_pg from "../../db/postgres.js";
import { ObjectId } from "mongodb";
import mongo from "../../db/mongo.js";

class EmployeeController {
  getPublicTestimonials = (colInjected) => {
    return async (req, res, next) => {
      try {
        let col;
        if (colInjected?.collectionName) {
          col = colInjected;
        } else {
          col = await mongo.collection("passenger_notes");
        }
        let limit = Math.min(
          Math.max(parseInt(req.query.limit ?? "9", 10) || 9, 1),
          50
        );
        let page = Math.max(parseInt(req.query.page ?? "1", 10) || 1, 1);
        const skip = (page - 1) * limit;

        const items = await col
          .aggregate([
            { $match: { visibility: "public", approved: true } },
            { $sort: { createdAt: -1, _id: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                text: "$message",
                rating: 1,
                author: { $ifNull: ["$publicName", "Utilisateur"] },
                location: 1,
                createdAt: 1,
              },
            },
          ])
          .toArray();

        res.json({ items, page, limit });
      } catch (err) {
        next(err);
      }
    };
  };

  getPendingReviews = (colInjected) => {
    return async (req, res) => {
      try {
        const col = colInjected?.collectionName
          ? colInjected
          : await mongo.collection("passenger_notes");
        const docs = await col
          .find({
            visibility: "public",
            $or: [
              { approved: { $eq: false } },
              { approved: { $exists: false } },
              { approved: null },
            ],
          })
          .sort({ createdAt: -1 })
          .limit(200)
          .toArray();

        const items = docs.map((d) => ({
          id: String(d._id),
          id_user: d.id_user ?? d.userId ?? null,
          id_chauffeur: d.id_chauffeur ?? d.driverId ?? null,
          note: d.note ?? d.score ?? 0,
          commentaire: d.commentaire ?? d.comment ?? "",
          status: d.status ?? "en_attente",
          created_at: d.created_at ?? d.date ?? null,
        }));

        res.json(items);
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Impossible de charger les avis." });
      }
    };
  };

  approveReview = (colInjected) => {
    return async (req, res) => {
      try {
        const id = String(req.params.id || "").trim();
        if (!ObjectId.isValid(id))
          return res.status(400).json({ error: "invalid_id" });
        const _id = new ObjectId(id);

        const col = colInjected?.collectionName
          ? colInjected
          : await mongo.collection("passenger_notes");

        const before = await col.findOne({ _id }, { projection: { _id: 1 } });
        if (!before) return res.status(404).json({ error: "Avis introuvable" });

        const now = new Date();
        await col.updateOne(
          { _id },
          {
            $set: {
              approved: true,
              visibility: "public",
              status: "valide",
              updatedAt: now,
            },
          },
          { upsert: false }
        );

        res.json({
          ok: true,
          review: { id: String(_id), approved: true, visibility: "public" },
        });
      } catch (e) {
        console.error("[approve] error:", e);
        res.status(500).json({ error: "Validation échouée." });
      }
    };
  };

  rejectReview = (colInjected) => {
    return async (req, res) => {
      try {
        const id = String(req.params.id || "").trim();
        if (!ObjectId.isValid(id))
          return res.status(400).json({ error: "invalid_id" });
        const _id = new ObjectId(id);

        const col = colInjected?.collectionName
          ? colInjected
          : await mongo.collection("passenger_notes");

        const before = await col.findOne({ _id }, { projection: { _id: 1 } });
        if (!before) return res.status(404).json({ error: "Avis introuvable" });

        const now = new Date();
        await col.updateOne(
          { _id },
          {
            $set: {
              approved: false,
              visibility: "ops_only",
              status: "rejete",
              updatedAt: now,
            },
          }
        );

        res.json({
          ok: true,
          review: { id: String(_id), approved: false, visibility: "ops_only" },
        });
      } catch (e) {
        console.error("[reject] error:", e);
        res.status(500).json({ error: "Rejet échoué." });
      }
    };
  };

  async getIncidents(req, res) {
    try {
      const rows = await db_pg.any(`
        SELECT t.id_trajet, t.depart_ville, t.arrivee_ville, t.depart_ts,
               s.nom_status AS statut
        FROM trajets t
        JOIN status_trajet s ON s.status_id = t.status_id
        WHERE s.nom_status IN ('annule', 'incident')
        ORDER BY t.depart_ts DESC
        LIMIT 100
      `);
      res.json(rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Impossible de charger les incidents." });
    }
  }
  async listPendingReviews(mongo, { limit = 50, page = 1 } = {}) {
    limit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    page = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const cursor = mongo
      .collection("passenger_notes")
      .find({
        visibility: "public",
        $or: [
          { approved: { $eq: false } },
          { approved: { $exists: false } },
          { approved: null },
        ],
      })
      .project({
        _id: 1,
        passengerId: 1,
        driverId: 1,
        message: 1,
        rating: 1,
        createdAt: 1,
        tags: 1,
        title: 1,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const items = await cursor.toArray();

    const dto = items.map((d) => ({
      id: String(d._id),
      passengerId: d.passengerId ?? null,
      driverId: d.driverId ?? null,
      rating: d.rating ?? null,
      title: d.title ?? "",
      message: d.message ?? "",
      tags: d.tags ?? [],
      createdAt: d.createdAt ?? null,
    }));

    const total = await mongo.collection("passenger_notes").countDocuments({
      visibility: "public",
      $or: [
        { approved: { $eq: false } },
        { approved: { $exists: false } },
        { approved: null },
      ],
    });

    return { items: dto, page, limit, total };
  }
}

export default new EmployeeController();
