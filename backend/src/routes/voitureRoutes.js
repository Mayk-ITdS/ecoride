import express from "express";
import VoitureController from "../controllers/VoitureController.js";
import { verifyToken } from "../middleware/authentication.js";

const router = express.Router();

router.post("/", verifyToken, (req, res) =>
  VoitureController.createVoiture(req, res)
);
router.get("/user/:userId", verifyToken, (req, res) =>
  VoitureController.getVoituresByUser(req, res)
);

export default router;
