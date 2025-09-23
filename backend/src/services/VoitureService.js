import { PrismaClient } from "@prisma/client";
import db_pg from "../../db/postgres.js";
const prisma = new PrismaClient();

class VoitureService {
  async createVoiture(data) {
    const {
      id_user,
      marque,
      modele,
      couleur,
      immatriculation,
      nb_places,
      is_electric,
      annee,
      type_carburant,
      date_premiere_immatriculation,
    } = data;
    if (!id_user || !marque || !modele || !immatriculation || !nb_places) {
      throw new Error("Champs obligatoires manquants");
    }
    let modeleVoiture = await prisma.modeles_voiture.findFirst({
      where: { marque, modele },
    });

    if (!modeleVoiture) {
      modeleVoiture = await prisma.modeles_voiture.create({
        data: {
          marque,
          modele,
          annee,
          type_carburant,
        },
      });
    }
    const derivedIsElectric = type_carburant === "electrique";
    if (typeof is_electric === "boolean" && is_electric !== derivedIsElectric) {
      throw new Error(
        "Incohérence: is_electric ne correspond pas au type_carburant"
      );
    }
    return prisma.voitures.create({
      data: {
        couleur: couleur ?? null,
        immatriculation: immatriculation.trim(),
        date_premiere_immatriculation: date_premiere_immatriculation
          ? new Date(date_premiere_immatriculation)
          : null,
        nb_places: Number(nb_places),
        is_electric: derivedIsElectric,
        users: { connect: { id_user: Number(id_user) } },
        modeles_voiture: { connect: { id_modele: modeleVoiture.id_modele } },
      },
      include: {
        modeles_voiture: true,
        users: true,
      },
    });
  }

  async getVoituresByUser(userId) {
    if (!userId) throw new Error("UserId invalide");
    const rows = await db_pg.manyOrNone(
      `
        SELECT
          v.id_voiture,
          v.id_user,
          v.id_modele,
          v.couleur,
          v.immatriculation,
          v.date_enregistrement,
          v.nb_places,
          v.is_electric,
          v.date_premiere_immatriculation,
          m.marque,
          m.modele,
          m.type_carburant,
          v.couleur,
          m.annee
        FROM voitures v
        LEFT JOIN modeles_voiture m ON m.id_modele = v.id_modele
        WHERE v.id_user = $1
        ORDER BY v.id_voiture DESC
        `,
      [userId]
    );
    return rows;
  }
}

export default new VoitureService();
