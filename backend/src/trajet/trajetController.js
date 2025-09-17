import TrajetService from "./trajetService.js";

const trajetService = new TrajetService();

export const findTrajets = async (req, res) => {
  try {
    const { depart, arrivee, date, prixMax, minAvisScore, isEco, maxDuree } =
      req.query;

    const trajets = await trajetService.findManyWithFilters(
      depart || null,
      arrivee || null,
      date || null,
      prixMax ? Number(prixMax) : null,
      minAvisScore ? Number(minAvisScore) : null,
      isEco === "true",
      maxDuree ? Number(maxDuree) : null
    );
    res.json(trajets);
  } catch (error) {
    console.error("Erreur findTrajets:", error);
    res.status(500).json({ error: "Impossible de récupérer les trajets" });
  }
};

export const getTrajetById = async (req, res) => {
  try {
    const id_trajet = parseInt(req.params.id, 10);
    const trajet = await trajetService.findOneById({ id_trajet });
    if (!trajet) {
      return res.status(404).json({ error: "Trajet non trouve" });
    }
    res.json(trajet);
  } catch (error) {
    console.error("Erreur getTrajetById:", error);
    res.status(500).json({ error: "Impossible de récupérer le trajet" });
  }
};
