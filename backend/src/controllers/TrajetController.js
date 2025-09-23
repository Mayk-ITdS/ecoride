import TrajetService from "../services/TrajetService.js";
import db_pg from "../../db/postgres.js";
export const findTrajets = async (req, res) => {
  try {
    const { depart, arrivee, date, prixMax, minAvisScore, isEco, maxDuree } =
      req.query;

    const trajets = await TrajetService.findManyWithFilters(
      depart || null,
      arrivee || null,
      date || null,
      prixMax ? Number(prixMax) : null,
      minAvisScore ? Number(minAvisScore) : null,
      isEco === "true",
      maxDuree ? Number(maxDuree) : null
    );
    if (trajets.date && Number.isNaN(new Date(trajets.date).getTime())) {
      return res.status(400).json({ error: "Invalid date (YYYY-MM-DD)" });
    }

    console.log("[findTrajets] filters:", trajets);
    res.json(trajets);
  } catch (error) {
    console.error("findTrajets failed:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

export const getTrajetById = async (req, res) => {
  try {
    const id_trajet = parseInt(req.params.id, 10);
    const trajet = await TrajetService.findOneById({ id_trajet });
    if (!trajet) {
      return res.status(404).json({ error: "Trajet non trouve" });
    }
    res.json(trajet);
  } catch (error) {
    console.error("Erreur getTrajetById:", error);
    res.status(500).json({ error: "Impossible de récupérer le trajet" });
  }
};

export const createTrajet = async (req, res) => {
  try {
    const newTrajet = await TrajetService.createNew(req.body);
    res.status(201).json(newTrajet);
  } catch (err) {
    console.error(console.error("Erreur createTrajet:", err));
    res
      .status(400)
      .json({ error: err.message || "Impossible de créer le trajet." });
  }
};
export const getTripsData = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ error: "Non autorisé" });
    const rows = await TrajetService.listForUser(userId);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
export const getMine = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const rows = await TrajetService.getMine(userId);
    res.json(rows);
  } catch (e) {
    console.error("getMine error:", e);
    res.status(500).json({ error: "Erreur serveur getMine" });
  }
};
export async function listPassengers(req, res) {
  try {
    const rows = await db_pg.any(
      `SELECT p.id_participation, p.id_passager, u.pseudo, p.status
       FROM participations p
       JOIN users u ON u.id_user=p.id_passager
       WHERE p.id_trajet=$1
       ORDER BY p.date_reservation ASC`,
      [Number(req.params.id)]
    );
    res.json(rows);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
