import { axiosInstance } from '../constants/axios'
import { API_ROUTES } from '../constants/api'

export type SessionSummary = {
  id: string
  code: string
  status: string
  createdAt: string
  participantsCount?: number
  survey?: {
    id: string
    title: string
  }
}

export type SessionControlPayload = {
  action: 'start' | 'advance' | 'end'
  currentQuestionId?: string
}

export type SessionPublicSnapshot = {
  sessionId: string
  code: string
  status: string
  participants: number
  requireName?: boolean
  surveyTitle?: string
  questions?: {
    id: string
    text: string
    type: string
    options?: Record<string, unknown>
    settings?: Record<string, unknown>
    orderIndex: number
  }[]
  resultsByQuestion?: {
    questionId: string
    text: string
    counts: { label: string; value: number }[]
    total: number
  }[]
  question: {
    id: string
    text: string
    type: string
  } | null
  results: { label: string; value: number }[]
}

export type SessionResponseDetail = {
  id: string
  createdAt: string
  question: {
    id: string
    text: string
    type: string
    options?: Record<string, unknown>
  }
  participant: {
    id: string
    displayName?: string
    anonymousId?: string
  } | null
  answer: Record<string, unknown>
}

export const listSessions = async () => {
  const response = await axiosInstance.get<SessionSummary[]>(API_ROUTES.sessions.list)
  return response.data
}

export const createSession = async (surveyId: string, payload?: { code?: string; settings?: Record<string, unknown> }) => {
  const response = await axiosInstance.post(API_ROUTES.sessions.create(surveyId), payload ?? {})
  return response.data
}

export const getSessionByCode = async (code: string) => {
  const response = await axiosInstance.get<SessionPublicSnapshot>(API_ROUTES.sessions.getByCode(code))
  return response.data
}

export const joinSession = async (code: string, displayName?: string) => {
  const response = await axiosInstance.post(API_ROUTES.sessions.join(code), { displayName })
  return response.data
}

export const submitAnswer = async (code: string, payload: { questionId: string; optionIndex: number; participantId?: string }) => {
  const response = await axiosInstance.post(API_ROUTES.sessions.answer(code), {
    questionId: payload.questionId,
    participantId: payload.participantId,
    answer: { optionIndex: payload.optionIndex },
  })
  return response.data
}

export const getSessionResponses = async (id: string) => {
  const response = await axiosInstance.get<SessionResponseDetail[]>(`${API_ROUTES.sessions.get(id)}/responses`)
  return response.data
}

export const controlSession = async (id: string, payload: SessionControlPayload) => {
  const response = await axiosInstance.patch(API_ROUTES.sessions.control(id), payload)
  return response.data
}

export const deleteSession = async (id: string) => {
  const response = await axiosInstance.delete(API_ROUTES.sessions.delete(id))
  return response.data
}
