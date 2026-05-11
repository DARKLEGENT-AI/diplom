export const API_ROUTES = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me',
  },
  users: {
    list: '/users',
    get: (id: number | string) => `/users/${id}`,
    avatar: '/users/me/avatar',
    location: '/users/me/location',
    doctorProfile: '/users/me/doctor-profile',
  },
  surveys: {
    list: '/surveys',
    create: '/surveys',
    get: (id: string) => `/surveys/${id}`,
    update: (id: string) => `/surveys/${id}`,
    delete: (id: string) => `/surveys/${id}`,
    addQuestion: (id: string) => `/surveys/${id}/questions`,
    updateQuestion: (id: string, questionId: string) => `/surveys/${id}/questions/${questionId}`,
    deleteQuestion: (id: string, questionId: string) => `/surveys/${id}/questions/${questionId}`,
  },
  templates: {
    list: '/templates',
    create: '/templates',
    get: (id: string) => `/templates/${id}`,
    delete: (id: string) => `/templates/${id}`,
  },
  sessions: {
    list: '/sessions',
    create: (surveyId: string) => `/surveys/${surveyId}/sessions`,
    get: (id: string) => `/sessions/${id}`,
    delete: (id: string) => `/sessions/${id}`,
    getByCode: (code: string) => `/sessions/code/${code}`,
    control: (id: string) => `/sessions/${id}/control`,
    join: (code: string) => `/sessions/${code}/join`,
    answer: (code: string) => `/sessions/${code}/answers`,
    analytics: (id: string) => `/sessions/${id}/analytics`,
  },
  analytics: {
    survey: (id: string) => `/analytics/surveys/${id}`,
    export: (id: string) => `/analytics/surveys/${id}/export`,
  },
  medical: {
    patients: '/medical/patients',
    patient: (id: string) => `/medical/patients/${id}`,
    doctors: '/medical/doctors',
    appointmentSlots: '/medical/appointment-slots',
    appointmentSlot: (id: string) => `/medical/appointment-slots/${id}`,
    freeAppointmentSlots: '/medical/appointment-slots/free',
    myAppointmentSlots: '/medical/appointment-slots/my',
    myDoctorAppointmentSlots: '/medical/appointment-slots/doctor/my',
    bookAppointmentSlot: (id: string) => `/medical/appointment-slots/${id}/book`,
    visits: '/medical/visits',
    services: '/medical/services',
    regions: '/medical/regions',
    dashboard: '/medical/dashboard',
    weeklyStatistics: '/medical/statistics/week',
    monthlyStatistics: '/medical/statistics/month',
  },
}

export const QUERY_KEYS = {
  auth: {
    me: 'GET:/auth/me',
  },
  users: {
    list: 'GET:/users',
    get: 'GET:/users/:id',
  },
  surveys: {
    list: 'GET:/surveys',
    get: 'GET:/surveys/:id',
  },
  sessions: {
    list: 'GET:/sessions',
    getByCode: 'GET:/sessions/code/:code',
  },
  templates: {
    list: 'GET:/templates',
  },
  analytics: {
    survey: 'GET:/analytics/surveys/:id',
  },
}
