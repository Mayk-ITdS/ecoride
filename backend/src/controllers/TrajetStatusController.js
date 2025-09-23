import TrajetStatusService from "../services/TrajetStatusService.js";

class TrajetStatusController {
  async confirmer(req, res) {
    try {
      const out = await TrajetStatusService.confirmer({
        trajetId: Number(req.params.id),
        driverId: req.user.id,
      });
      res.json(out);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
  async demarrer(req, res) {
    try {
      const out = await TrajetStatusService.demarrer({
        trajetId: Number(req.params.id),
        driverId: req.user.id,
      });
      res.json(out);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
  async terminer(req, res) {
    try {
      const trajetId = Number(req.params.id);
      const driverId = req.user.id;
      const updated = await TrajetStatusService.terminer({
        trajetId,
        driverId,
      });
      MailerService.sendTripFinishedEmails(trajetId).catch((e) => {
        console.error("Email send failed:", e);
      });

      return res.json(updated);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
  async annuler(req, res) {
    try {
      const out = await TrajetStatusService.annuler({
        trajetId: Number(req.params.id),
        driverId: req.user.id,
      });
      res.json(out);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
}
export default new TrajetStatusController();
