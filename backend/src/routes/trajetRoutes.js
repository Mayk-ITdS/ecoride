import { verifyToken } from "../middleware/authentication.js";
import express from "express";
import ParticipationController from "../controllers/ParticipationController.js";
import {
  findTrajets,
  getTrajetById,
  createTrajet,
  listPassengers,
  getTripsData,
} from "../controllers/TrajetController.js";

const router = express.Router();
router.post("/:id/rappel", verifyToken, async (req, res) => {
  try {
    const trajetId = Number(req.params.id);
    const n = await MailerService.sendTripReminderEmails(trajetId);
    res.json({ success: true, sent: n });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
router.get("/:id/passagers", verifyToken, (req, res) =>
  listPassengers(req, res)
);
router.get("/", findTrajets);
router.get("/mine", verifyToken, getTripsData);
router.get("/:id", getTrajetById);
router.post("/:id/participer", verifyToken, (req, res) =>
  ParticipationController.participerAuTrajet(req, res)
);
router.post("/", verifyToken, (req, res) => createTrajet(req, res));
export default router;
