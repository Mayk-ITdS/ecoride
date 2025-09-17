import mongo from "../../db/mongo.js";
import db_pg from "../../db/postgres.js";

class TrajetService {
  async findManyWithFilters(
    depart,
    arrivee,
    date,
    prixMax = null,
    minAvisScore = null,
    isEco = false,
    maxDuree = null
  ) {
    const avis_mongo = await mongo
      .collection("avis")
      .aggregate([
        { $group: { _id: "$id_user", avgScore: { $avg: "$score" } } },
        ...(minAvisScore
          ? [{ $match: { avgScore: { $gte: minAvisScore } } }]
          : []),
      ])
      .toArray();

    const avis_ids = avis_mongo.map((a) => a._id);

    const sql = `
  SELECT t.id_trajet,
         t.id_chauffeur,
         t.depart_ville,
         t.arrivee_ville,
         t.depart_ts,
         t.duree_estimee,
         t.places_disponibles,
         t.prix,
         v.couleur,
         v.immatriculation,
         v.nb_places,
         v.is_electric,
         m.marque,
         m.modele,
         u.pseudo AS chauffeur
  FROM trajets t
  JOIN voitures v ON t.id_voiture = v.id_voiture
  JOIN modeles_voiture m ON v.id_modele = m.id_modele
  JOIN users u ON t.id_chauffeur = u.id_user
  WHERE ( $<depart> IS NULL OR t.depart_ville ILIKE '%' || $<depart> || '%' )
    AND ( $<arrivee> IS NULL OR t.arrivee_ville ILIKE '%' || $<arrivee> || '%' )
    AND ( $<date> IS NULL OR t.depart_ts::date = $<date>::date )
    AND ( $<prixMax> IS NULL OR t.prix <= $<prixMax> )
    AND ( $<maxDuree> IS NULL OR t.duree_estimee <= $<maxDuree> )
    AND ( $<isEco> = false OR v.is_electric = true )
    ${avis_ids.length > 0 ? "AND u.id_user IN ($<avisIds:csv>)" : ""}
`;

    const params = {
      depart,
      arrivee,
      date,
      prixMax,
      maxDuree,
      isEco,
      avisIds: avis_ids,
    };
    const rows = await db_pg.any(sql, params);

    const mapped = await Promise.all(
      rows.map(async (trajet) => {
        const userData = await mongo
          .collection("users_data")
          .findOne({ id_user: trajet.id_chauffeur });
        const avis = await mongo
          .collection("avis")
          .find({ id_chauffeur: trajet.id_chauffeur })
          .toArray();
        return {
          id: trajet.id_trajet,
          depart: trajet.depart_ville,
          arrivee: trajet.arrivee_ville,
          date: trajet.depart_ts,
          duree: trajet.duree_estimee,
          places: trajet.places_disponibles,
          prix: trajet.prix,
          chauffeur: {
            nom: trajet.chauffeur,
            preferences: userData?.preferences ?? { fumer: false, pets: true },
          },
          voiture: {
            marque: trajet.marque,
            modele: trajet.modele,
            couleur: trajet.couleur,
            immatriculation: trajet.immatriculation,
            places: trajet.nb_places,
            eco: trajet.is_electric,
          },
          avis: avis.map((a) => ({
            author: a.author,
            note: a.note,
            commentaire: a.commentaire,
          })),
        };
      })
    );

    return mapped;
  }
  async findOneById({ id_trajet }) {
    const sql = `
      SELECT t.id_trajet,
             t.id_chauffeur,
             t.depart_ville, 
             t.arrivee_ville,
             t.depart_ts,
             t.duree_estimee,
             t.places_disponibles, 
             t.prix, 
             v.couleur,
             v.immatriculation,
             v.nb_places,
             v.is_electric, 
             m.marque, 
             m.modele,
             u.pseudo AS chauffeur
      FROM trajets t 
      JOIN voitures v on t.id_voiture = v.id_voiture 
      JOIN modeles_voiture m on v.id_modele = m.id_modele 
      JOIN users u on t.id_chauffeur = u.id_user 
      WHERE t.id_trajet = $1
    `;

    const trajet = await db_pg.oneOrNone(sql, [id_trajet]);
    if (!trajet) return null;
    const userData = await mongo
      .collection("users_data")
      .findOne({ id_user: trajet.id_chauffeur });
    return {
      id: trajet.id_trajet,
      depart: trajet.depart_ville,
      arrivee: trajet.arrivee_ville,
      date: trajet.depart_ts,
      duree: trajet.duree_estimee,
      places: trajet.places_disponibles ?? trajet.nb_places,
      prix: trajet.prix,
      chauffeur: {
        nom: trajet.chauffeur,
        preferences: userData?.preferences ?? { fumer: false, pets: true },
      },
      voiture: {
        marque: trajet.marque,
        modele: trajet.modele,
        couleur: trajet.couleur,
        immatriculation: trajet.immatriculation,
        places: trajet.nb_places,
        eco: trajet.is_electric,
      },
      avis: userData?.avis ?? [],
    };
  }
}

export default TrajetService;
