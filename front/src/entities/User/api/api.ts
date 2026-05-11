import { API_ROUTES } from '@src/shared/constants/api'
import { axiosInstance } from '@src/shared/constants/axios'
import type { UserProfile } from '@src/shared/api/auth'

import { encodeSearchParams } from '@src/shared/utils/encodeSearchParams'

import type { UserResponse, UsersListParams, UsersListResponse } from './interfaces'

export const getUsers = async (filters?: UsersListParams) => {
  const response = await axiosInstance.get<UsersListResponse>(API_ROUTES.users.list, {
    params: filters ? encodeSearchParams(filters) : undefined,
  })
  return response.data
}

export const getUser = async (id: number) => {
  const response = await axiosInstance.get<UserResponse>(API_ROUTES.users.get(id))
  return response.data
}

export const uploadAvatar = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axiosInstance.post<UserProfile>(API_ROUTES.users.avatar, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const updateMyLocation = async (payload: { city?: string; region?: string }) => {
  const response = await axiosInstance.post<UserProfile>(API_ROUTES.users.location, payload)
  return response.data
}

export const updateMyDoctorProfile = async (payload: {
  name?: string
  specialty?: string
  doctorDescription?: string
  office?: string
}) => {
  const response = await axiosInstance.post<UserProfile>(API_ROUTES.users.doctorProfile, payload)
  return response.data
}
