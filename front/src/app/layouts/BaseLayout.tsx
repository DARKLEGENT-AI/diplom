import { Outlet, ScrollRestoration, useNavigate } from 'react-router-dom'
import { useCallback, useMemo, useState } from 'react'

import { Footer } from '@src/features/Footer'
import { Header } from '@src/features/Header'
import { AuthModals, type ModalType } from '@src/features/auth/AuthModals'
import { routes } from '@src/app/constants/routes'
import { clearAuthToken, getAuthToken } from '@src/shared/constants/auth'

export const BaseLayout = () => {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAuthToken()))
  const navigate = useNavigate()

  const openModal = useCallback((type: ModalType) => {
    setActiveModal(type)
  }, [])

  const outletContext = useMemo(() => ({ openModal }), [openModal])
  const handleAuthSuccess = useCallback(() => {
    setIsAuthenticated(true)
  }, [])

  const handleLogout = useCallback(() => {
    clearAuthToken()
    setIsAuthenticated(false)
    navigate(routes.home.url())
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <div className="mx-auto flex max-w-screen-2xl flex-col px-4 sm:px-8 lg:px-12">
        <div className="min-h-screen">
          <Header
            className="mb-6"
            onLogin={() => openModal('login')}
            onRegister={() => openModal('register')}
            onProfile={() => navigate(routes.dashboard.url())}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
          />
          <main className="flex-1">
            <Outlet context={outletContext} />
          </main>
        </div>
        <Footer onDemo={() => openModal('demo')} />
        <ScrollRestoration />
      </div>
      <AuthModals
        active={activeModal}
        onClose={() => setActiveModal(null)}
        onSwitch={openModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}
