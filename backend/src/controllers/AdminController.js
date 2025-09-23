import db_pg from "../../db/postgres.js";
import bcrypt from "bcrypt";

class AdminController {
  async getMetrics(req, res) {
    try {
      const tripsPerDay = await db_pg.any(`
        SELECT t.depart_ts::date AS day, COUNT(*)::int AS trips
        FROM trajets t
        GROUP BY day
        ORDER BY day DESC
        LIMIT 30
      `);

      const creditsPerDay = await db_pg.any(`
        SELECT p.date_reservation::date AS day, (COUNT(*) * 2)::int AS credits
        FROM participations p
        GROUP BY day
        ORDER BY day DESC
        LIMIT 30
      `);

      const total = await db_pg.one(`
        SELECT COALESCE(COUNT(*) * 2, 0)::int AS total
        FROM participations
      `);

      res.json({
        tripsPerDay,
        creditsPerDay,
        totalCredits: total.total,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Impossible de calculer les métriques." });
    }
  }

  async listUsers(req, res) {
    try {
      const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit ?? "20", 10), 1),
        100
      );
      const q = (req.query.q ?? "").trim();
      const offset = (page - 1) * limit;

      const items = await db_pg.any(
        `
        SELECT u.id_user, u.pseudo, u.email, u.is_suspended,
               COALESCE(array_agg(r.nom) FILTER (WHERE r.nom IS NOT NULL), '{}') AS roles
        FROM users u
        LEFT JOIN user_roles ur ON ur.user_id = u.id_user
        LEFT JOIN roles r ON r.role_id = ur.role_id
        WHERE ($1 = '' OR u.pseudo ILIKE '%'||$1||'%' OR u.email ILIKE '%'||$1||'%')
        GROUP BY u.id_user
        ORDER BY u.id_user
        LIMIT $2 OFFSET $3
        `,
        [q, limit, offset]
      );

      const total = await db_pg.one(
        `
        SELECT COUNT(*)::int AS count
        FROM users u
        WHERE ($1 = '' OR u.pseudo ILIKE '%'||$1||'%' OR u.email ILIKE '%'||$1||'%')
        `,
        [q]
      );

      res.json({ items, total: total.count, page, limit });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Impossible de lister les utilisateurs." });
    }
  }

  async setSuspended(req, res) {
    try {
      const id = parseInt(req.params.userId, 10);
      const { suspended } = req.body;
      const row = await db_pg.oneOrNone(
        `UPDATE users SET is_suspended = $1 WHERE id_user = $2
         RETURNING id_user, is_suspended`,
        [!!suspended, id]
      );
      if (!row)
        return res.status(404).json({ error: "Utilisateur introuvable" });
      res.json(row);
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .json({ error: "Impossible de modifier l'état du compte." });
    }
  }
  async createEmployee(req, res) {
    try {
      const { pseudo, email, password } = req.body || {};
      if (!pseudo || !email || !password) {
        return res
          .status(400)
          .json({ error: "pseudo, email, password requis" });
      }
      const hash = await bcrypt.hash(password, 10);
      const user = await db_pg.one(
        `INSERT INTO users(pseudo, email, mot_de_passe) 
         VALUES ($1,$2,$3) 
         RETURNING id_user, pseudo, email`,
        [pseudo, email, hash]
      );
      const role = await db_pg.one(
        `SELECT role_id FROM roles WHERE nom = 'employee' LIMIT 1`
      );
      await db_pg.none(
        `INSERT INTO user_roles(user_id, role_id) VALUES ($1,$2)`,
        [user.id_user, role.role_id]
      );

      res.status(201).json(user);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Impossible de créer l'employé." });
    }
  }
}

export default new AdminController();
