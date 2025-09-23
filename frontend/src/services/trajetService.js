import axios from 'axios'

const API_URL = '/api/trajets'

export const getTrajets = async (filters = {}) => {
  const response = await axios.get(API_URL, { params: filters })
  return response.data
}

export const getTrajetById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`)
  return response.data
}
export const createTrajet = async (trajetData = {}) => {
  const response = await axios.post(API_URL, trajetData)
  return response.data
}
