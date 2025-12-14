import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
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
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        return res
          .status(409)
          .json({
            message: "Immatriculation dejà existante",
            field: "immatricueleation",
          });
      }
    }
    console.error(e);
    req.status(500).json({ message: "Internal server error" });
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
