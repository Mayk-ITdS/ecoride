import express from "express";
import ParticipationController from "../controllers/ParticipationController.js";
import { verifyToken } from "../middleware/authentication.js";

const router = express.Router();

router.patch("/:participationId/confirm", verifyToken, (req, res) =>
  ParticipationController.confirm(req, res)
);

router.patch("/:participationId/refuse", verifyToken, (req, res) =>
  ParticipationController.refuse(req, res)
);

router.patch("/:participationId/status", verifyToken, (req, res) =>
  ParticipationController.updateStatus(req, res)
);
router.patch("/:participationId/annuler", verifyToken, async (req, res) => {
  try {
    const out = await ParticipationService.annulerParPassager({
      participationId: Number(req.params.participationId),
      userId: req.user.id,
    });
    res.json(out);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
