import express from "express";
import { verifyToken } from "../middleware/authentication.js";
import TrajetStatusController from "../controllers/TrajetStatusController.js";

const r = express.Router();
r.patch("/:id/confirmer", verifyToken, (req, res) =>
  TrajetStatusController.confirmer(req, res)
);
r.patch("/:id/demarrer", verifyToken, (req, res) =>
  TrajetStatusController.demarrer(req, res)
);
r.patch("/:id/terminer", verifyToken, (req, res) =>
  TrajetStatusController.terminer(req, res)
);
r.patch("/:id/annuler", verifyToken, (req, res) =>
  TrajetStatusController.annuler(req, res)
);
export default r;
