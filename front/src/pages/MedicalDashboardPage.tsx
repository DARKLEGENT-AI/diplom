import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { getMe, type UserProfile } from '@src/shared/api/auth'
import {
  bookAppointmentSlot,
  createAppointmentSlot,
  getFreeAppointmentSlots,
  getMedicalDoctors,
  getMyAppointmentSlots,
  getMyDoctorAppointmentSlots,
  type AppointmentSlot,
  type MedicalDoctor,
} from '@src/shared/api/medical'
import { API_BASE_URL } from '@src/shared/constants/axios'

const formatSlotTime = (slot: AppointmentSlot) => {
  const start = new Date(slot.startsAt)
  const end = new Date(slot.endsAt)
  return `${start.toLocaleDateString('ru-RU')} · ${start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}-${end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
}

const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return ''
  const base = API_BASE_URL.replace(/\/v1$/, '')
  return `${base}${avatarUrl}`
}

const getInitials = (value?: string) => {
  const words = (value || 'Врач').trim().split(/\s+/)
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join('')
}

const getDayKey = (date: Date) => date.toISOString().slice(0, 10)
const getTimeKey = (date: Date) => date.toTimeString().slice(0, 5)

const MedicalDashboardPage = () => {
  const [doctors, setDoctors] = useState<MedicalDoctor[]>([])
  const [freeSlots, setFreeSlots] = useState<AppointmentSlot[]>([])
  const [mySlots, setMySlots] = useState<AppointmentSlot[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [doctorSlots, setDoctorSlots] = useState<AppointmentSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [bookingId, setBookingId] = useState('')
  const [newSlotDate, setNewSlotDate] = useState('')
  const [newSlotTime, setNewSlotTime] = useState('09:00')
  const [isCreatingSlot, setIsCreatingSlot] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [selectedDay, setSelectedDay] = useState('')

  const loadPage = useCallback(async () => {
    try {
      const currentProfile = await getMe()
      setProfile(currentProfile)

      if (currentProfile.role === 'doctor') {
        const [nextDoctors, nextDoctorSlots] = await Promise.all([getMedicalDoctors(), getMyDoctorAppointmentSlots()])
        setDoctors(nextDoctors)
        setDoctorSlots(nextDoctorSlots)
        setFreeSlots([])
        setMySlots([])
        return
      }

      const [nextDoctors, nextFreeSlots, nextMySlots] = await Promise.all([
        getMedicalDoctors(),
        getFreeAppointmentSlots(),
        getMyAppointmentSlots(),
      ])
      setDoctors(nextDoctors)
      setFreeSlots(nextFreeSlots)
      setMySlots(nextMySlots)
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Не удалось загрузить расписание'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
      setDoctors([])
      setFreeSlots([])
      setMySlots([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPage()
  }, [loadPage])

  const bookedDoctorSlots = useMemo(() => doctorSlots.filter((slot) => slot.status === 'booked'), [doctorSlots])
  const freeDoctorSlots = useMemo(() => doctorSlots.filter((slot) => slot.status === 'available'), [doctorSlots])
  const doctorCalendarDays = useMemo(() => {
    const days = new Map<string, Date>()
    doctorSlots.forEach((slot) => {
      const date = new Date(slot.startsAt)
      days.set(getDayKey(date), date)
    })
    return [...days.entries()]
      .sort((a, b) => a[1].getTime() - b[1].getTime())
      .slice(0, 14)
      .map(([key, date]) => ({
        key,
        weekday: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
        date: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      }))
  }, [doctorSlots])
  const doctorCalendarTimes = useMemo(() => {
    const times = new Set<string>()
    doctorSlots.forEach((slot) => times.add(getTimeKey(new Date(slot.startsAt))))
    return [...times].sort()
  }, [doctorSlots])
  const doctorSlotByCell = useMemo(() => {
    const slotMap = new Map<string, AppointmentSlot>()
    doctorSlots.forEach((slot) => {
      const date = new Date(slot.startsAt)
      slotMap.set(`${getDayKey(date)}-${getTimeKey(date)}`, slot)
    })
    return slotMap
  }, [doctorSlots])
  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === selectedDoctorId) || null,
    [doctors, selectedDoctorId],
  )
  const selectedDoctorSlots = useMemo(
    () => freeSlots.filter((slot) => slot.doctorId === selectedDoctorId),
    [freeSlots, selectedDoctorId],
  )
  const availableDays = useMemo(() => {
    const uniqueDays = new Map<string, Date>()
    selectedDoctorSlots.forEach((slot) => {
      const date = new Date(slot.startsAt)
      const key = date.toISOString().slice(0, 10)
      uniqueDays.set(key, date)
    })
    return [...uniqueDays.entries()]
      .sort((a, b) => a[1].getTime() - b[1].getTime())
      .map(([key, date]) => ({
        key,
        label: date.toLocaleDateString('ru-RU', { weekday: 'short', day: '2-digit', month: 'long' }),
      }))
  }, [selectedDoctorSlots])
  const selectedDaySlots = useMemo(
    () => selectedDoctorSlots.filter((slot) => new Date(slot.startsAt).toISOString().slice(0, 10) === selectedDay),
    [selectedDay, selectedDoctorSlots],
  )
  const nextDayByDoctorId = useMemo(() => {
    const nextDays = new Map<string, string>()
    freeSlots.forEach((slot) => {
      if (nextDays.has(slot.doctorId)) return
      const date = new Date(slot.startsAt)
      nextDays.set(slot.doctorId, date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' }))
    })
    return nextDays
  }, [freeSlots])

  useEffect(() => {
    if (!selectedDoctorId && doctors.length > 0) {
      setSelectedDoctorId(doctors[0].id)
    }
  }, [doctors, selectedDoctorId])

  useEffect(() => {
    if (!availableDays.length) {
      setSelectedDay('')
      return
    }
    if (!availableDays.some((day) => day.key === selectedDay)) {
      setSelectedDay(availableDays[0].key)
    }
  }, [availableDays, selectedDay])

  const handleBook = async (slotId: string) => {
    setBookingId(slotId)
    try {
      await bookAppointmentSlot(slotId)
      toast.success('Запись подтверждена')
      await loadPage()
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Не удалось записаться'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setBookingId('')
    }
  }

  const handleCreateSlot = async () => {
    if (!profile?.id || !newSlotDate || !newSlotTime) {
      toast.error('Выберите дату и время')
      return
    }

    const startsAt = new Date(`${newSlotDate}T${newSlotTime}`)
    const endsAt = new Date(startsAt)
    endsAt.setMinutes(endsAt.getMinutes() + 45)

    try {
      setIsCreatingSlot(true)
      await createAppointmentSlot({
        doctorId: profile.id,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      })
      toast.success('Окно добавлено')
      await loadPage()
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Не удалось добавить окно'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setIsCreatingSlot(false)
    }
  }

  if (isLoading) {
    return <div className="rounded-lg border border-[#e5e7eb] bg-white p-6 text-sm text-[#4b5563]">Загрузка расписания...</div>
  }

  if (profile?.role === 'doctor') {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Свободные окна', value: freeDoctorSlots.length, hint: 'доступны пациентам' },
            { label: 'Записаны', value: bookedDoctorSlots.length, hint: 'ожидают приема' },
            { label: 'Всего окон', value: doctorSlots.length, hint: 'на ближайшие 2 недели' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-[#e5e7eb] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[#4b5563]">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[#1f1f1f]">{item.value}</p>
              <p className="mt-1 text-sm text-[#4b5563]">{item.hint}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[#4b5563]">Кабинет врача</p>
            <h2 className="mt-2 text-3xl font-semibold">{profile.name || profile.email}</h2>
            <p className="mt-2 text-lg font-semibold text-[#111827]">{profile.specialty || 'Специальность не указана'}</p>
            <p className="mt-3 text-sm leading-6 text-[#4b5563]">{profile.doctorDescription || 'Заполните описание в личном кабинете, чтобы пациент видел профиль врача.'}</p>
            <div className="mt-5 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-4 text-sm text-[#4b5563]">
              Кабинет: {profile.office || 'не указан'} · Город: {profile.city || profile.region || 'не указан'}
            </div>
          </div>

          <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[#4b5563]">Добавить окно</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_140px]">
              <input type="date" value={newSlotDate} onChange={(event) => setNewSlotDate(event.target.value)} className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-3 text-sm outline-none focus:border-[#dc2626]" />
              <input type="time" value={newSlotTime} onChange={(event) => setNewSlotTime(event.target.value)} className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-3 text-sm outline-none focus:border-[#dc2626]" />
            </div>
            <button type="button" onClick={handleCreateSlot} disabled={isCreatingSlot} className="mt-4 rounded-lg bg-[#dc2626] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
              {isCreatingSlot ? 'Добавляем...' : 'Открыть окно приема'}
            </button>
            <p className="mt-4 text-sm text-[#4b5563]">При регистрации врача система сама создает рабочие окна на 2 недели. Здесь можно добавить отдельное время вручную.</p>
          </div>
        </section>

        <section className="rounded-lg border border-[#e5e7eb] bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#4b5563]">Календарь приема</p>
              <h3 className="mt-2 text-2xl font-semibold text-[#1f1f1f]">Таблица расписания</h3>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-[#4b5563]">
              <span className="rounded-md border border-[#e5e7eb] bg-white px-2 py-1">свободно</span>
              <span className="rounded-md border border-[#e5e7eb] bg-[#f3f4f6] px-2 py-1 text-[#991b1b]">занято</span>
              <span className="rounded-md border border-[#e5e7eb] bg-[#f8fafc] px-2 py-1">отменено</span>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto rounded-lg border border-[#e5e7eb]">
            <table className="min-w-[960px] w-full border-collapse bg-white text-sm">
              <thead>
                <tr className="bg-[#f8fafc] text-left text-xs uppercase tracking-[0.18em] text-[#4b5563]">
                  <th className="w-[96px] border-b border-r border-[#e5e7eb] px-3 py-3">Время</th>
                  {doctorCalendarDays.map((day) => (
                    <th key={day.key} className="border-b border-r border-[#e5e7eb] px-3 py-3 last:border-r-0">
                      <span className="block font-semibold text-[#1f1f1f]">{day.weekday}</span>
                      <span className="mt-1 block text-[#4b5563]">{day.date}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doctorCalendarTimes.map((time) => (
                  <tr key={time}>
                    <td className="border-r border-t border-[#e5e7eb] bg-[#f8fafc] px-3 py-3 font-semibold text-[#1f1f1f]">{time}</td>
                    {doctorCalendarDays.map((day) => {
                      const slot = doctorSlotByCell.get(`${day.key}-${time}`)
                      return (
                        <td key={`${day.key}-${time}`} className="h-[76px] border-r border-t border-[#e5e7eb] p-2 align-top last:border-r-0">
                          {slot ? (
                            <div className={`h-full rounded-lg border px-3 py-2 ${
                              slot.status === 'booked'
                                ? 'border-[#fecaca] bg-[#fef2f2]'
                                : slot.status === 'cancelled'
                                  ? 'border-[#e5e7eb] bg-[#f8fafc] opacity-70'
                                  : 'border-[#bbf7d0] bg-[#f0fdf4]'
                            }`}>
                              <p className={`text-xs font-semibold ${slot.status === 'booked' ? 'text-[#991b1b]' : 'text-[#166534]'}`}>
                                {slot.status === 'booked' ? 'Занято' : slot.status === 'cancelled' ? 'Отменено' : 'Свободно'}
                              </p>
                              <p className="mt-1 text-xs text-[rgb(75,85,99)]">{slot.service?.name || 'Консультация'}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-[#cbd5e1]">-</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {doctorSlots.length === 0 && <p className="p-5 text-sm text-[#4b5563]">Расписание пока пустое.</p>}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[#e5e7eb] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-[#4b5563]">Мои записи</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {mySlots.map((slot) => (
            <div key={slot.id} className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-[#1f1f1f]">{slot.service?.name || 'Консультация'}</p>
                <span className="rounded-md bg-white px-2 py-1 text-xs text-[#4b5563]">{slot.status === 'booked' ? 'подтверждена' : slot.status}</span>
              </div>
              <p className="mt-2 text-sm text-[#4b5563]">{slot.doctor?.name || slot.doctor?.email || 'Врач'}</p>
              <p className="mt-1 text-xs text-[#4b5563]">{formatSlotTime(slot)}</p>
            </div>
          ))}
          {mySlots.length === 0 && <p className="text-sm text-[#4b5563]">Вы пока никуда не записаны.</p>}
        </div>
      </section>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-6">
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#4b5563]">Запись к врачу</p>
          <h2 className="mt-2 text-3xl font-semibold">Выберите врача</h2>
          <p className="mt-3 text-sm leading-6 text-[#4b5563]">
            Сначала выберите специалиста, затем день приема. После этого появятся свободные окна для записи.
          </p>

          <div className="mt-5 grid gap-3">
            {doctors.map((doctor) => (
              <button
                key={doctor.id}
                type="button"
                onClick={() => {
                  setSelectedDoctorId(doctor.id)
                  setSelectedDay('')
                }}
                className={`rounded-lg border p-4 text-left transition ${
                  selectedDoctorId === doctor.id
                    ? 'border-[#dc2626] bg-white shadow-sm'
                    : 'border-[#e5e7eb] bg-white hover:border-[#dc2626]'
                }`}
              >
                <div className="flex gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f8fafc] text-xl font-semibold text-[#dc2626]">
                    {doctor.avatarUrl ? (
                      <img src={getAvatarUrl(doctor.avatarUrl)} alt={doctor.name || doctor.email} className="h-full w-full object-cover" />
                    ) : (
                      <span>{getInitials(doctor.name || doctor.email)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[#1f1f1f]">{doctor.name || doctor.email}</p>
                        <p className="mt-1 text-sm font-semibold text-[#111827]">{doctor.specialty || 'Врач'}</p>
                      </div>
                      <span className="rounded-md border border-[#e5e7eb] bg-[#f8fafc] px-2 py-1 text-xs text-[#4b5563]">
                        {nextDayByDoctorId.get(doctor.id) || 'нет окон'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#4b5563]">{[doctor.city, doctor.region].filter(Boolean)[0] || 'Город не указан'} · кабинет {doctor.office || 'не указан'}</p>
                    {doctor.doctorDescription && <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#4b5563]">{doctor.doctorDescription}</p>}
                  </div>
                </div>
              </button>
            ))}
            {doctors.length === 0 && <p className="text-sm text-[#4b5563]">В базе пока нет врачей.</p>}
          </div>
          </div>

          <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-[#4b5563]">День и время</p>
            {selectedDoctor ? (
              <>
                <h3 className="mt-2 text-2xl font-semibold text-[#1f1f1f]">{selectedDoctor.name || selectedDoctor.email}</h3>
                <p className="mt-1 text-sm text-[#4b5563]">{selectedDoctor.specialty || 'Врач'}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {availableDays.map((day) => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setSelectedDay(day.key)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                        selectedDay === day.key
                          ? 'border-[#dc2626] bg-[#dc2626] text-white'
                          : 'border-[#e5e7eb] bg-white text-[#1f1f1f] hover:border-[#dc2626]'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                  {availableDays.length === 0 && <p className="text-sm text-[#4b5563]">У этого врача пока нет свободных дней.</p>}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {selectedDaySlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => handleBook(slot.id)}
                      disabled={bookingId === slot.id}
                      className="rounded-lg border border-[#e5e7eb] bg-white p-4 text-left transition hover:border-[#dc2626] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <p className="text-lg font-semibold text-[#1f1f1f]">
                        {new Date(slot.startsAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="mt-1 text-sm text-[#4b5563]">{slot.service?.name || 'Консультация'}</p>
                      <p className="mt-3 text-xs font-semibold text-[#dc2626]">{bookingId === slot.id ? 'Записываем...' : 'Записаться'}</p>
                    </button>
                  ))}
                  {selectedDay && selectedDaySlots.length === 0 && <p className="text-sm text-[#4b5563]">На этот день свободных окон нет.</p>}
                </div>
              </>
            ) : (
              <p className="text-sm text-[#4b5563]">Выберите врача слева.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default MedicalDashboardPage
