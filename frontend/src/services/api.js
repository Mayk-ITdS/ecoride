import axios from 'axios'
const baseURL = import.meta.env.VITE_API_URL
if (!baseURL) {
  console.error('VITE_API_URL is not defined')
}
console.log('VITE_API_URL =', baseURL)

const api = axios.create({ baseURL })

export default api
