import ReviewService from "../services/MongoReviewService.js";

class ReviewController {
  async getPending(req, res) {
    try {
      const out = await ReviewService.getPendingForUser(req.user.id);
      res.json(out);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
  async submitDriver(req, res) {
    try {
      const trajetId = Number(req.params.trajetId);
      const { note, commentaire } = req.body;
      if (!Number.isInteger(trajetId) || !note || note < 1 || note > 5) {
        return res.status(400).json({ error: "Données invalides" });
      }
      const out = await ReviewService.submitDriverReview({
        userId: req.user.id,
        trajetId,
        note,
        commentaire,
      });
      res.json(out);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
  async submitApp(req, res) {
    try {
      const { note, commentaire } = req.body;
      if (!note || note < 1 || note > 5) {
        return res.status(400).json({ error: "Données invalides" });
      }
      const out = await ReviewService.submitAppFeedback({
        userId: req.user.id,
        note,
        commentaire,
      });
      res.json(out);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
}

export default new ReviewController();
