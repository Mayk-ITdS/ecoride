import ParticipationService from "../services/ParticipationService.js";

class ParticipationController {
  async participerAuTrajet(req, res) {
    try {
      const trajetId = Number(req.params.id);
      const userId = Number(req.user?.id);
      if (!Number.isInteger(trajetId)) {
        return res.status(400).json({ error: "trajetId invalide" });
      }
      if (!Number.isInteger(userId)) {
        return res.status(401).json({ error: "Non autorisé" });
      }
      const out = await ParticipationService.participerAuTrajet({
        userId,
        trajetId,
      });
      return res.status(201).json(out);
    } catch (err) {
      const map = {
        NO_SEATS: 400,
        INSUFFICIENT_CREDITS: 400,
        ALREADY_JOINED: 409,
        SELF_JOIN: 400,
      };
      const code = map[err.code] ?? 400;
      return res.status(code).json({ error: err.message });
    }
  }
  async getPassengers(req, res) {
    try {
      const trajetId = Number(req.params.id);
      if (!Number.isInteger(trajetId))
        return res.status(400).json({ error: "trajetId invalide" });
      const list = await ParticipationService.listPassengers({
        trajetId,
        requesterId: req.user.id,
      });
      res.json(list);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
  async updateStatus(req, res) {
    try {
      const participationId = Number(req.params.participationId);
      const { status } = req.body;
      if (!Number.isInteger(participationId))
        return res.status(400).json({ error: "participationId invalide" });

      const out = await ParticipationService.updateParticipationStatus({
        participationId,
        status,
        byUserId: req.user.id,
      });
      res.json(out);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const participationId = Number(req.params.participationId);
      const { status } = req.body;
      if (!Number.isInteger(participationId)) {
        return res.status(400).json({ error: "participationId invalide" });
      }
      const out = await ParticipationService.updateParticipationStatus({
        participationId,
        status,
        byUserId: req.user.id,
      });
      return res.json(out);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
  async confirm(req, res) {
    try {
      const out = await ParticipationService.confirmParticipation({
        participationId: Number(req.params.participationId),
        driverId: req.user.id,
      });
      res.json(out);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
  async refuse(req, res) {
    try {
      const out = await ParticipationService.refuseParticipation({
        participationId: Number(req.params.participationId),
        driverId: req.user.id,
      });
      res.json(out);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
}
export default new ParticipationController();
