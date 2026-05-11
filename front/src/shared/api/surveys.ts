import { axiosInstance } from '../constants/axios'
import { API_ROUTES } from '../constants/api'

export type Survey = {
  id: string
  title: string
  description?: string
  status: string
  createdAt: string
}

export type SurveyQuestionType = 'choice' | 'multi' | 'scale' | 'matrix' | 'text' | 'number'

export type SurveyQuestion = {
  id: string
  type: SurveyQuestionType
  text: string
  options?: Record<string, unknown>
  settings?: Record<string, unknown>
  orderIndex: number
}

export type SurveyDetail = Survey & {
  description?: string
  questions?: SurveyQuestion[]
}

export const listSurveys = async () => {
  const response = await axiosInstance.get<Survey[]>(API_ROUTES.surveys.list)
  return response.data
}

export const createSurvey = async (payload: { title: string; description?: string }) => {
  const response = await axiosInstance.post<Survey>(API_ROUTES.surveys.create, payload)
  return response.data
}

export const getSurvey = async (id: string) => {
  const response = await axiosInstance.get<SurveyDetail>(API_ROUTES.surveys.get(id))
  return response.data
}

export const updateSurvey = async (id: string, payload: { title: string; description?: string }) => {
  const response = await axiosInstance.patch<Survey>(API_ROUTES.surveys.update(id), payload)
  return response.data
}

export const addSurveyQuestion = async (
  surveyId: string,
  payload: {
    type: SurveyQuestionType
    text: string
    options?: Record<string, unknown>
    settings?: Record<string, unknown>
    orderIndex?: number
  },
) => {
  const response = await axiosInstance.post<SurveyQuestion>(API_ROUTES.surveys.addQuestion(surveyId), payload)
  return response.data
}

export const updateSurveyQuestion = async (
  surveyId: string,
  questionId: string,
  payload: {
    type: SurveyQuestionType
    text: string
    options?: Record<string, unknown>
    settings?: Record<string, unknown>
    orderIndex?: number
  },
) => {
  const response = await axiosInstance.patch<SurveyQuestion>(
    API_ROUTES.surveys.updateQuestion(surveyId, questionId),
    payload,
  )
  return response.data
}

export const deleteSurveyQuestion = async (surveyId: string, questionId: string) => {
  const response = await axiosInstance.delete(API_ROUTES.surveys.deleteQuestion(surveyId, questionId))
  return response.data
}

export const deleteSurvey = async (id: string) => {
  const response = await axiosInstance.delete(API_ROUTES.surveys.delete(id))
  return response.data
}
