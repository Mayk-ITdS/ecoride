import db_pg from "../../db/postgres.js";
import mongo from "../../db/mongo.js";

class AdminService {
  async getMetrics() {
    const [{ count: users_total }] = await db_pg.any(
      `SELECT COUNT(*)::int AS count FROM users`
    );
    const [{ count: trips_total }] = await db_pg.any(
      `SELECT COUNT(*)::int AS count FROM trajets`
    );
    const pending = await mongo
      .collection("reviews")
      .countDocuments({ status: "pending" });
    return {
      users_total,
      trips_total,
      pending_reviews: pending,
    };
  }
  async listUsers() {
    const rows = await db_pg.any(`
      SELECT u.id_user, u.pseudo, u.email, array_agg(r.nom) AS roles
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id=u.id_user
      LEFT JOIN roles r ON r.role_id=ur.role_id
      GROUP BY u.id_user
      ORDER BY u.id_user ASC
    `);
    return rows.map((r) => ({
      id_user: r.id_user,
      pseudo: r.pseudo,
      email: r.email,
      roles: r.roles?.filter(Boolean) ?? [],
    }));
  }
  async createEmployee({ pseudo, email, password }) {
    if (!pseudo || !email || !password) {
      throw new Error("Champs requis manquants");
    }
    const role = await db_pg.oneOrNone(
      `SELECT role_id FROM roles WHERE nom = 'employee'`
    );
    if (!role) {
      throw new Error(
        "Rôle 'employee' introuvable. Ajoutez d'abord la ligne dans la table roles."
      );
    }

    const hash = await bcrypt.hash(password, 10);

    return db_pg.tx(async (t) => {
      const existing = await t.oneOrNone(
        `SELECT id_user FROM users WHERE email = $1`,
        [email]
      );
      if (existing) {
        throw new Error("Email déjà utilisé");
      }
      const user = await t.one(
        `INSERT INTO users (pseudo, email, mot_de_passe, credits, date_inscription)
         VALUES ($1, $2, $3, 0, NOW())
         RETURNING id_user, pseudo, email, date_inscription`,
        [pseudo, email, hash]
      );
      await t.none(
        `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
        [user.id_user, role.role_id]
      );

      return user;
    });
  }
}

export default new AdminService();
