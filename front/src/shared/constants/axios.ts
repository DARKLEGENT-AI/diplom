import axios from 'axios'
import { getAuthToken } from './auth'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase() ?? 'GET'
    const url = response.config.url ?? ''
    console.log('[API RESPONSE]', method, url, response.data)
    return response
  },
  (error) => {
    const method = error?.response?.config?.method?.toUpperCase() ?? 'REQUEST'
    const url = error?.response?.config?.url ?? ''
    const payload = error?.response?.data ?? error?.message
    console.error('[API ERROR]', method, url, payload)
    return Promise.reject(error)
  },
)
