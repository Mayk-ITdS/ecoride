import api from '../services/api.js'

export const createVoiture = async (voitureData) => {
  const mappedData = {
    id_user: voitureData.id_user,
    marque: voitureData.marque,
    modele: voitureData.modele,
    couleur: voitureData.couleur,
    immatriculation: voitureData.plaque || voitureData.immatriculation,
    nb_places: voitureData.places || voitureData.nb_places,
    is_electric: voitureData.electrique ?? false,
    annee: voitureData.annee ? Number(voitureData.annee) : undefined,
    date_premiere_immatriculation:
      voitureData.date_premiere_immatriculation || null,
  }

  const res = await api.post('/voitures', mappedData)
  return res.data
}
export const getUserVoitures = async (userId) => {
  const res = await api.get(`/voitures/user/${userId}`)
  return res.data
}
