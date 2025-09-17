import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/trajets";

export const getTrajets = async (filters = {}) => {
  const response = await axios.get(API_URL, { params: filters });
  return response.data;
};

export const getTrajetById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};
