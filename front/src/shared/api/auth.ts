import { axiosInstance } from '../constants/axios'
import { API_ROUTES } from '../constants/api'

export type AuthResponse = {
  accessToken: string
}

export type UserProfile = {
  id: string
  email: string
  name?: string
  role: string
  region?: string
  city?: string
  avatarUrl?: string
  specialty?: string
  doctorDescription?: string
  office?: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  email: string
  password: string
  name?: string
  city?: string
  role?: string
  specialty?: string
}

export const login = async (payload: LoginPayload) => {
  const response = await axiosInstance.post<AuthResponse>(API_ROUTES.auth.login, payload)
  return response.data
}

export const register = async (payload: RegisterPayload) => {
  const response = await axiosInstance.post<AuthResponse>(API_ROUTES.auth.register, payload)
  return response.data
}

export const getMe = async () => {
  const response = await axiosInstance.get<UserProfile>(API_ROUTES.auth.me)
  return response.data
}
