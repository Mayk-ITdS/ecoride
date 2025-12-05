import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db_pg from "../../db/postgres.js";
const prisma = new PrismaClient();

class UserService {
  async register({ pseudo, email, password }) {
    console.log("UserService.register input:", { pseudo, email });
    const existing = await prisma.users.findUnique({ where: { email } });
    console.log("Existing by email?", existing);
    if (existing) throw new Error("Email déjà utilisé");

    const hashed = await bcrypt.hash(password, 10);
    try {
      const newUser = await prisma.users.create({
        data: { pseudo, email, mot_de_passe: hashed },
      });

      console.log("User created in DB:", newUser);

      return {
        id: newUser.id_user,
        pseudo: newUser.pseudo,
        email: newUser.email,
      };
    } catch (e) {
      console.error("Prisma create error:", e);
      throw e;
    }
  }
  async login(email, password) {
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        user_roles: {
          include: { roles: true },
        },
      },
    });
    if (!user) throw new Error("Utilisateur n'existe pas");
    const validate = await bcrypt.compare(password, user.mot_de_passe);
    if (!validate) throw new Error("Mot de passe incorrect");
    const roles = user.user_roles.map((r) => r.roles.nom);
    const token = jwt.sign(
      {
        id: user.id_user,
        email: user.email,
        roles,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    return {
      user: { id: user.id_user, pseudo: user.pseudo, email: user.email },
      token,
      roles,
    };
  }
  async getUserById(userId) {
    return db_pg.oneOrNone(
      `
      SELECT
        u.id_user,
        u.pseudo,
        u.email,
        u.credits,
        u.is_suspended,
        COALESCE(
          ARRAY_AGG(r.nom ORDER BY r.nom)
          FILTER (WHERE r.nom IS NOT NULL), '{}'
        ) AS roles
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id_user
      LEFT JOIN roles r       ON r.role_id  = ur.role_id
      WHERE u.id_user = $1
      GROUP BY u.id_user
    `,
      [userId]
    );
  }
  async updateUser(userId, data) {
    return prisma.users.update({
      where: { id_user: Number(userId) },
      data,
      select: {
        id_user: true,
        pseudo: true,
        email: true,
      },
    });
  }
}
export default new UserService();
