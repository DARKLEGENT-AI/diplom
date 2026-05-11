import { axiosInstance } from '../constants/axios'
import { API_ROUTES } from '../constants/api'
import type { UserProfile } from './auth'

export type MedicalRegion = {
  id: string
  name: string
  district?: string
  code?: string
}

export type MedicalPatient = {
  id: string
  name: string
  birthDate: string
  contacts: string
  regionId?: string
  region?: MedicalRegion | null
  lastVisit?: string | null
  history: Array<{
    id: string
    serviceId: string
    date: string
    status: string
  }>
}

export type MedicalServiceItem = {
  id: string
  name: string
  description?: string
  department?: string
}

export type MedicalVisit = {
  id: string
  patientId: string
  doctorId?: string
  doctorName?: string
  serviceId: string
  date: string
  status: string
  patient?: MedicalPatient | null
  service?: MedicalServiceItem | null
}

export type MedicalDoctor = UserProfile

export type AppointmentSlot = {
  id: string
  doctorId: string
  serviceId?: string | null
  startsAt: string
  endsAt: string
  patientUserId?: string | null
  status: 'available' | 'booked' | 'cancelled'
  doctor?: MedicalDoctor | null
  service?: MedicalServiceItem | null
}

export type CreateAppointmentSlotPayload = {
  doctorId: string
  serviceId?: string
  startsAt: string
  endsAt: string
}

export type UpdateAppointmentSlotPayload = {
  serviceId?: string
  startsAt?: string
  endsAt?: string
  status?: 'available' | 'booked' | 'cancelled'
}

export type ServiceStatistic = {
  serviceId: string
  count: number
  service?: MedicalServiceItem | null
}

export type RegionStatistic = {
  regionId: string
  region?: MedicalRegion | null
  patientsCount: number
  services: ServiceStatistic[]
}

export type MedicalDashboard = {
  patientsTotal: number
  visitsTotal: number
  completedVisits: number
  plannedVisits: number
  patients: MedicalPatient[]
  visits: MedicalVisit[]
  topService: ServiceStatistic | null
  servicesTotal: number
}

export type CreatePatientPayload = {
  name: string
  birthDate: string
  contacts: string
  regionId?: string
  regionName?: string
}

export const getMedicalDashboard = async () => {
  const response = await axiosInstance.get<MedicalDashboard>(API_ROUTES.medical.dashboard)
  return response.data
}

export const getMedicalPatients = async () => {
  const response = await axiosInstance.get<MedicalPatient[]>(API_ROUTES.medical.patients)
  return response.data
}

export const getMedicalDoctors = async () => {
  const response = await axiosInstance.get<MedicalDoctor[]>(API_ROUTES.medical.doctors)
  return response.data
}

export const getFreeAppointmentSlots = async () => {
  const response = await axiosInstance.get<AppointmentSlot[]>(API_ROUTES.medical.freeAppointmentSlots)
  return response.data
}

export const getMyAppointmentSlots = async () => {
  const response = await axiosInstance.get<AppointmentSlot[]>(API_ROUTES.medical.myAppointmentSlots)
  return response.data
}

export const getMyDoctorAppointmentSlots = async () => {
  const response = await axiosInstance.get<AppointmentSlot[]>(API_ROUTES.medical.myDoctorAppointmentSlots)
  return response.data
}

export const createAppointmentSlot = async (payload: CreateAppointmentSlotPayload) => {
  const response = await axiosInstance.post<AppointmentSlot>(API_ROUTES.medical.appointmentSlots, payload)
  return response.data
}

export const updateAppointmentSlot = async (id: string, payload: UpdateAppointmentSlotPayload) => {
  const response = await axiosInstance.patch<AppointmentSlot>(API_ROUTES.medical.appointmentSlot(id), payload)
  return response.data
}

export const deleteAppointmentSlot = async (id: string) => {
  const response = await axiosInstance.delete<{ deleted: boolean; cancelled: boolean }>(API_ROUTES.medical.appointmentSlot(id))
  return response.data
}

export const bookAppointmentSlot = async (id: string) => {
  const response = await axiosInstance.post<AppointmentSlot>(API_ROUTES.medical.bookAppointmentSlot(id))
  return response.data
}

export const createMedicalPatient = async (payload: CreatePatientPayload) => {
  const response = await axiosInstance.post<MedicalPatient>(API_ROUTES.medical.patients, payload)
  return response.data
}

export const deleteMedicalPatient = async (id: string) => {
  const response = await axiosInstance.delete<{ deleted: boolean }>(API_ROUTES.medical.patient(id))
  return response.data
}

export const getMedicalVisits = async () => {
  const response = await axiosInstance.get<MedicalVisit[]>(API_ROUTES.medical.visits)
  return response.data
}

export const getMedicalServices = async () => {
  const response = await axiosInstance.get<MedicalServiceItem[]>(API_ROUTES.medical.services)
  return response.data
}

export const getMedicalRegions = async () => {
  const response = await axiosInstance.get<MedicalRegion[]>(API_ROUTES.medical.regions)
  return response.data
}

export const getWeeklyMedicalStatistics = async () => {
  const response = await axiosInstance.get<RegionStatistic[]>(API_ROUTES.medical.weeklyStatistics)
  return response.data
}

export const getMonthlyMedicalStatistics = async () => {
  const response = await axiosInstance.get<ServiceStatistic[]>(API_ROUTES.medical.monthlyStatistics)
  return response.data
}
