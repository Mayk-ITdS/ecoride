import axios from 'axios'

export const updatePreferences = async (userId, preferences) => {
  const res = await axios.post(`/api/users/preferences`, {
    userId,
    preferences,
  })
  return res.data
}
