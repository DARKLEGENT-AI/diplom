import { axiosInstance } from '../constants/axios'
import { API_ROUTES } from '../constants/api'

export type SurveyAnalytics = {
  surveyId: string
  totalSessions: number
  totalResponses: number
  perQuestion: { questionId: string; count: string }[]
}

export const getSurveyAnalytics = async (surveyId: string) => {
  const response = await axiosInstance.get<SurveyAnalytics>(API_ROUTES.analytics.survey(surveyId))
  return response.data
}

export const exportSurveyAnalytics = async (surveyId: string, format: 'pdf' | 'xlsx' | 'csv') => {
  const response = await axiosInstance.get(API_ROUTES.analytics.export(surveyId), {
    params: { format },
    responseType: 'blob',
  })
  return response
}
