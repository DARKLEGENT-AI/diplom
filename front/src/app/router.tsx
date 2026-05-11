import { createBrowserRouter } from 'react-router-dom'

import { routes } from './constants/routes'

import { AppLayout } from './layouts/AppLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { HydrateFallback } from './components/HydrateFallback'
import { RouteHandler } from './components/RouteHandler'
import { UnknownRoute } from './components/UnknownRoute'

export const router = createBrowserRouter([
  {
    path: routes.login.url(),
    element: (
      <RouteHandler>
        <AuthLayout />
      </RouteHandler>
    ),
    errorElement: <ErrorBoundary />,
    hydrateFallbackElement: <HydrateFallback />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: await import('@src/pages/LoginPage').then((m) => m.default),
          handle: { route: routes.login },
        }),
      },
      {
        path: routes.register.url().slice(1),
        lazy: async () => ({
          Component: await import('@src/pages/RegisterPage').then((m) => m.default),
          handle: { route: routes.register },
        }),
      },
      {
        path: routes.reset.url().slice(1),
        lazy: async () => ({
          Component: await import('@src/pages/ResetPasswordPage').then((m) => m.default),
          handle: { route: routes.reset },
        }),
      },
    ],
  },
  {
    path: routes.app.url(),
    element: (
      <RouteHandler>
        <AppLayout />
      </RouteHandler>
    ),
    errorElement: <ErrorBoundary />,
    hydrateFallbackElement: <HydrateFallback />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: await import('@src/pages/MedicalDashboardPage').then((m) => m.default),
          handle: { route: routes.app },
        }),
      },
      {
        path: routes.reports.url().split('/').slice(2).join('/'),
        lazy: async () => ({
          Component: await import('@src/pages/ReportsPage').then((m) => m.default),
          handle: { route: routes.reports },
        }),
      },
      {
        path: routes.profile.url().split('/').slice(2).join('/'),
        lazy: async () => ({
          Component: await import('@src/pages/ProfilePage').then((m) => m.default),
          handle: { route: routes.profile },
        }),
      },
      {
        path: routes.support.url().split('/').slice(2).join('/'),
        lazy: async () => ({
          Component: await import('@src/pages/SupportPage').then((m) => m.default),
          handle: { route: routes.support },
        }),
      },
      {
        path: routes.faq.url().split('/').slice(2).join('/'),
        lazy: async () => ({
          Component: await import('@src/pages/FaqPage').then((m) => m.default),
          handle: { route: routes.faq },
        }),
      },
      {
        path: '*',
        element: <UnknownRoute />,
      },
    ],
  },
  {
    path: '*',
    element: <UnknownRoute />,
  },
])
