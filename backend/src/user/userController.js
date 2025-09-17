import UserService from "./userService.js";

class UserController {
  async register(req, res) {
    try {
      const { pseudo, email, password } = req.body;
      const user = await UserService.register({ pseudo, email, password });
      res.status(201).json({ message: "Utilisateur créé avec succès", user });
    } catch (error) {
      console.error("Erreur register", error);
      if (error.code === "23505") {
        return res.status(409).json({ error: "Email déjà utilisé" });
      }

      res.status(500).json({ error: "Erreur serveur" });
    }
  }
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const data = await UserService.login(email, password);
      res.json(data);
    } catch (error) {
      console.error("Erreur login:", error);
      res.status(401).json({ error: "Identifiants invalides" });
    }
  }
}
export default new UserController();
