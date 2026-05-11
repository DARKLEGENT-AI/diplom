import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import { routes } from '@src/app/constants/routes'
import { getMe } from '@src/shared/api/auth'
import {
  getFreeAppointmentSlots,
  getMedicalDoctors,
  type AppointmentSlot,
  type MedicalDoctor,
} from '@src/shared/api/medical'

const appVersion = 'v1.0.0'

const RedCrossLogo = () => (
  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
    <span className="absolute h-7 w-3 rounded-sm bg-[#d71920]" />
    <span className="absolute h-3 w-7 rounded-sm bg-[#d71920]" />
  </div>
)

export const AppLayout = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(() => localStorage.getItem('theme') === 'dark')
  const [query, setQuery] = useState('')
  const [profileCity, setProfileCity] = useState('')
  const [profileRegion, setProfileRegion] = useState('')
  const [profileRole, setProfileRole] = useState('')
  const [doctors, setDoctors] = useState<MedicalDoctor[]>([])
  const [slots, setSlots] = useState<AppointmentSlot[]>([])
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkTheme)
    document.documentElement.classList.toggle('light', !isDarkTheme)
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light')
  }, [isDarkTheme])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getMe()
        setProfileCity(profile.city || '')
        setProfileRegion(profile.region || '')
        setProfileRole(profile.role || 'patient')
      } catch {
        setProfileCity('')
        setProfileRegion('')
        setProfileRole('patient')
      }
    }
    loadProfile()
  }, [])

  useEffect(() => {
    const loadSearchData = async () => {
      try {
        const [nextDoctors, nextSlots] = await Promise.all([getMedicalDoctors(), getFreeAppointmentSlots()])
        setDoctors(nextDoctors)
        setSlots(nextSlots)
      } catch {
        setDoctors([])
        setSlots([])
      }
    }
    loadSearchData()
  }, [])

  useEffect(() => {
    const patientAllowedPaths = [routes.app.url(), routes.profile.url(), routes.support.url(), routes.faq.url()]
    if (profileRole === 'patient' && !patientAllowedPaths.includes(location.pathname)) {
      navigate(routes.app.url(), { replace: true })
    }
  }, [location.pathname, navigate, profileRole])

  const navTabs = useMemo(() => {
    const tabs = [{ label: profileRole === 'doctor' ? 'Расписание' : 'Запись к врачу', to: routes.app.url(), end: true }]
    if (profileRole && profileRole !== 'patient') {
      tabs.push({ label: 'Отчеты', to: routes.reports.url(), end: false })
    }
    return tabs
  }, [profileRole])

  const sideActions = [
    { label: 'Личный кабинет', to: routes.profile.url() },
    { label: 'Поддержка', to: routes.support.url() },
    { label: 'FAQ', to: routes.faq.url() },
  ]

  const searchResults = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) {
      return {
        doctors: doctors.slice(0, 4),
        slots: slots.slice(0, 4),
      }
    }

    return {
      doctors: doctors.filter(
        (doctor) =>
          (doctor.name || '').toLowerCase().includes(value) ||
          (doctor.specialty || '').toLowerCase().includes(value) ||
          doctor.email.toLowerCase().includes(value) ||
          (doctor.city || '').toLowerCase().includes(value),
      ),
      slots: slots.filter(
        (slot) =>
          (slot.doctor?.name || '').toLowerCase().includes(value) ||
          (slot.doctor?.email || '').toLowerCase().includes(value) ||
          (slot.service?.name || '').toLowerCase().includes(value),
      ),
    }
  }, [doctors, query, slots])

  const locationLabel = useMemo(() => {
    if (profileCity) return profileCity
    if (profileRegion) return profileRegion
    return 'Город не выбран'
  }, [profileCity, profileRegion])

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1f1f1f]">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col lg:flex-row">
        <aside className="border-b border-[#e5e7eb] bg-white px-4 py-4 shadow-sm lg:sticky lg:top-0 lg:h-screen lg:w-[280px] lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <button type="button" onClick={() => navigate(routes.app.url())} className="flex w-full items-center gap-3 text-left">
            <RedCrossLogo />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#111827]">МедУчет</p>
              <p className="text-base font-semibold text-[#1f1f1f]">Система учреждения</p>
            </div>
          </button>

          <nav className="mt-6 grid gap-2">
            {navTabs.map((tab) => (
              <NavLink
                key={tab.label}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'border-[#dc2626] bg-[#dc2626] text-white shadow-sm'
                      : 'border-[#e5e7eb] bg-white text-[#2f2f2f] hover:border-[#ef4444] hover:text-[#111827]'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}

            {profileRole !== 'doctor' && (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-left text-sm font-semibold text-[#2f2f2f] transition hover:border-[#ef4444] hover:text-[#111827]"
              >
                Поиск
              </button>
            )}

            {sideActions.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.to)}
                className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-left text-sm font-semibold text-[#2f2f2f] transition hover:border-[#ef4444] hover:text-[#111827]"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-6 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 text-xs text-[#4b5563]">
            Версия системы: {appVersion}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col px-4 pb-10 pt-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 border-b border-[#e5e7eb] bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#111827]">{profileRole === 'doctor' ? 'Кабинет врача' : 'Пациентский кабинет'}</p>
              <h1 className="mt-1 text-2xl font-semibold text-[#1f1f1f]">{profileRole === 'doctor' ? 'Управление расписанием' : 'Запись и расписание'}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <div className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-xs text-[#4b5563]">
                {locationLabel}
              </div>
              <button
                type="button"
                onClick={() => setIsDarkTheme((value) => !value)}
                className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-xs font-semibold text-[#1f1f1f] transition hover:border-[#dc2626]"
                aria-pressed={isDarkTheme}
              >
                {isDarkTheme ? 'Светлая тема' : 'Темная тема'}
              </button>
            </div>
          </header>

          <div className="mt-6 flex-1">
            <Outlet />
          </div>
        </div>
      </div>

      {profileRole !== 'doctor' && isSearchOpen && (
        <button
          type="button"
          aria-label="Закрыть поиск"
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 z-20 bg-[#4b5563]/20"
        />
      )}

      {profileRole !== 'doctor' && (
        <aside
          className={`fixed left-0 top-0 z-30 h-full w-[360px] max-w-[90vw] border-r border-[#e5e7eb] bg-white p-6 shadow-xl transition-transform duration-300 ${
            isSearchOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#111827]">Поиск</p>
            <button type="button" onClick={() => setIsSearchOpen(false)} className="text-[#111827]">
              X
            </button>
          </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Врач, услуга, город"
              className="mt-4 w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2 text-sm text-[#1f1f1f] placeholder:text-[#6b7280] outline-none focus:border-[#dc2626]"
            />
            <p className="mt-5 text-xs uppercase tracking-[0.25em] text-[#4b5563]">Врачи</p>
            <div className="mt-3 space-y-3">
              {searchResults.doctors.map((doctor) => (
                <div key={doctor.id} className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2">
                  <p className="text-sm font-semibold text-[#1f1f1f]">{doctor.name || doctor.email}</p>
                  <p className="text-xs text-[#4b5563]">{doctor.specialty || 'Врач'} · {doctor.email}{doctor.city ? ` · ${doctor.city}` : ''}</p>
                </div>
              ))}
              {searchResults.doctors.length === 0 && <p className="text-xs text-[#6b7280]">Врачи не найдены</p>}
            </div>
            <p className="mt-5 text-xs uppercase tracking-[0.25em] text-[#4b5563]">Свободное время</p>
            <div className="mt-3 space-y-3">
              {searchResults.slots.map((slot) => (
                <div key={slot.id} className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2">
                  <p className="text-sm font-semibold text-[#1f1f1f]">{slot.service?.name || 'Консультация'}</p>
                  <p className="text-xs text-[#4b5563]">{slot.doctor?.name || slot.doctor?.email || 'Врач'} · {new Date(slot.startsAt).toLocaleString('ru-RU')}</p>
                </div>
              ))}
              {searchResults.slots.length === 0 && <p className="text-xs text-[#6b7280]">Свободных окон не найдено</p>}
            </div>
        </aside>
      )}
    </div>
  )
}
