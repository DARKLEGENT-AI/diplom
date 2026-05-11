import { axiosInstance } from '../constants/axios'
import { API_ROUTES } from '../constants/api'

export type Template = {
  id: string
  title: string
  description?: string
  createdAt: string
}

export type TemplateSnapshotQuestion = {
  localId?: string
  type: string
  text: string
  options?: string[]
  settings?: Record<string, unknown>
  orderIndex?: number
}

export type TemplateSnapshot = {
  title?: string
  description?: string
  questions?: TemplateSnapshotQuestion[]
}

export type TemplateDetail = Template & {
  snapshot: TemplateSnapshot
}

export const listTemplates = async () => {
  const response = await axiosInstance.get<Template[]>(API_ROUTES.templates.list)
  return response.data
}

export const getTemplate = async (id: string) => {
  const response = await axiosInstance.get<TemplateDetail>(API_ROUTES.templates.get(id))
  return response.data
}

export const createTemplate = async (payload: { title: string; description?: string; snapshot: TemplateSnapshot }) => {
  const response = await axiosInstance.post<Template>(API_ROUTES.templates.create, payload)
  return response.data
}

export const deleteTemplate = async (id: string) => {
  const response = await axiosInstance.delete(API_ROUTES.templates.delete(id))
  return response.data
}
