import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

class UserService {
  async register({ pseudo, email, password }) {
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) throw new Error("Email déjà utilisé");

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
      data: { pseudo, email, mot_de_passe: hashed },
    });

    return {
      id: newUser.id_user,
      pseudo: newUser.pseudo,
      email: newUser.email,
    };
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
}
export default new UserService();
