import UserService from "../services/UserService.js";
import mongo from "../../db/mongo.js";
import jwt from "jsonwebtoken";
import db_pg from "../../db/postgres.js";
import bcrypt from "bcrypt";

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
    const { email, password } = req.body;

    const user = await db_pg.oneOrNone(
      `
    SELECT u.id_user,
           u.pseudo,
           u.mot_de_passe,
           COALESCE(array_agg(r.nom) FILTER (WHERE r.nom IS NOT NULL), '{}') AS roles
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id_user
    LEFT JOIN roles r       ON r.role_id  = ur.role_id
    WHERE u.email = $1
    GROUP BY u.id_user
    `,
      [email]
    );

    if (!user)
      return res.status(401).json({ error: "Utilisateur introuvable" });

    const ok = await bcrypt.compare(password, user.mot_de_passe);
    if (!ok) return res.status(401).json({ error: "Mot de passe incorrect" });

    const payload = {
      id: user.id_user,
      pseudo: user.pseudo,
      roles: user.roles,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({
      token,
      user: { id: user.id_user, pseudo: user.pseudo, roles: user.roles },
    });
  }

  async updatePreferences(req, res) {
    try {
      const { userId, preferences } = req.body;

      if (!userId || !preferences) {
        return res.status(400).json({ error: "Missing userId or preferences" });
      }
      await mongo
        .collection("users_data")
        .updateOne(
          { id_user: userId },
          { $set: { preferences } },
          { upsert: true }
        );
      res.status(200).json({ success: true, preferences });
    } catch (err) {
      console.error("Erreur updatePreferences:", err);
      res
        .status(500)
        .json({ error: "Impossible de mettre à jour les préférences." });
    }
  }

  async getMe(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Non autorisé" });
      }
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "Utilisateur introuvable" });
      }
      res.json(user);
    } catch (err) {
      console.error("Erreur getMe:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  async updateMe(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Non autorisé" });
      }
      const { pseudo, email } = req.body;
      const updatedUser = await UserService.updateUser(userId, {
        pseudo,
        email,
      });
      res.json(updatedUser);
    } catch (err) {
      console.error("Erreur updateMe:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
}
export default new UserController();
