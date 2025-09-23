import VoitureService from "../services/VoitureService.js";

class VoitureController {
  async createVoiture(req, res) {
    try {
      const id_user = req.user.id;
      const voiture = await VoitureService.createVoiture({
        ...req.body,
        id_user,
      });
      res.status(201).json(voiture);
    } catch (err) {
      console.error("Erreur:", err);
      res.status(400).json({ message: err.message });
    }
  }

  async getVoituresByUser(req, res) {
    try {
      const voitures = await VoitureService.getVoituresByUser(
        req.params.userId
      );
      res.json(voitures);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        error: error.message || "Erreur lors de la récupération des véhicules",
      });
    }
  }
}

export default new VoitureController();
