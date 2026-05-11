export type Routes =
  | 'home'
  | 'dashboard'
  | 'features'
  | 'builder'
  | 'analytics'
  | 'templates'
  | 'session'
  | 'login'
  | 'register'
  | 'reset'
  | 'app'
  | 'reports'
  | 'profile'
  | 'support'
  | 'faq'

export type IRoute = {
  title: string
  url: (param?: string) => string
}

export const routes: Record<Routes, IRoute> = {
  home: {
    title: 'Вход',
    url: () => '/',
  },
  dashboard: {
    title: 'Дашборд',
    url: () => '/app',
  },
  features: {
    title: 'Отчеты',
    url: () => '/app/reports',
  },
  builder: {
    title: 'Запись',
    url: () => '/app',
  },
  analytics: {
    title: 'Поддержка',
    url: () => '/app/support',
  },
  templates: {
    title: 'FAQ',
    url: () => '/app/faq',
  },
  session: {
    title: 'Раздел',
    url: (code: string = ':code') => `/app/${code}`,
  },
  login: {
    title: 'Вход',
    url: () => '/',
  },
  register: {
    title: 'Регистрация',
    url: () => '/register',
  },
  reset: {
    title: 'Восстановление пароля',
    url: () => '/reset',
  },
  app: {
    title: 'Дашборд',
    url: () => '/app',
  },
  reports: {
    title: 'Отчеты',
    url: () => '/app/reports',
  },
  profile: {
    title: 'Личный кабинет',
    url: () => '/app/profile',
  },
  support: {
    title: 'Поддержка',
    url: () => '/app/support',
  },
  faq: {
    title: 'FAQ',
    url: () => '/app/faq',
  },
}
