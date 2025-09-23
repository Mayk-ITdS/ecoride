import RoleService from "../services/RoleService.js";

const uiToDbRole = (ui) => (ui === "passager" ? "passager" : "chauffeur");

export const getMyRoles = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Non autorisé" });
    const roles = await RoleService.listForUser(userId);
    res.json({ roles });
  } catch (e) {
    console.error("getMyRoles:", e);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const setMyRole = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Non autorisé" });

    const { role: uiRole } = req.body;
    if (!["passager", "chauffeur", "both"].includes(uiRole)) {
      return res.status(400).json({ error: "Bad role" });
    }

    const dbRole = uiToDbRole(uiRole);
    await RoleService.setExclusive(userId, dbRole);
    res.json({ ok: true, savedRole: dbRole });
  } catch (e) {
    console.error("setMyRole:", e);
    res.status(400).json({ error: e.message });
  }
};
