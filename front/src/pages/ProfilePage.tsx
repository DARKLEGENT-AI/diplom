import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { getMe, type UserProfile } from '@src/shared/api/auth'
import { updateMyDoctorProfile, updateMyLocation, uploadAvatar } from '@src/entities/User/api/api'
import { clearAuthToken } from '@src/shared/constants/auth'
import { API_BASE_URL } from '@src/shared/constants/axios'
import { routes } from '@src/app/constants/routes'
import { DOCTOR_SPECIALTIES, POPULAR_RUSSIAN_CITIES } from '@src/shared/constants/cities'
import {
  deleteAppointmentSlot,
  getMyDoctorAppointmentSlots,
  updateAppointmentSlot,
  type AppointmentSlot,
} from '@src/shared/api/medical'

const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return ''
  const base = API_BASE_URL.replace(/\/v1$/, '')
  return `${base}${avatarUrl}`
}

const toDateInput = (value: string) => new Date(value).toISOString().slice(0, 10)
const toTimeInput = (value: string) => new Date(value).toTimeString().slice(0, 5)
const formatSlotTime = (slot: AppointmentSlot) => {
  const start = new Date(slot.startsAt)
  const end = new Date(slot.endsAt)
  return `${start.toLocaleDateString('ru-RU')} ${start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}-${end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [city, setCity] = useState('')
  const [isSavingLocation, setIsSavingLocation] = useState(false)
  const [doctorName, setDoctorName] = useState('')
  const [specialty, setSpecialty] = useState(DOCTOR_SPECIALTIES[0])
  const [office, setOffice] = useState('')
  const [doctorDescription, setDoctorDescription] = useState('')
  const [isSavingDoctorProfile, setIsSavingDoctorProfile] = useState(false)
  const [doctorSlots, setDoctorSlots] = useState<AppointmentSlot[]>([])
  const [editingSlotId, setEditingSlotId] = useState('')
  const [slotDate, setSlotDate] = useState('')
  const [slotTime, setSlotTime] = useState('')
  const [slotStatus, setSlotStatus] = useState<'available' | 'booked' | 'cancelled'>('available')
  const [isSavingSlot, setIsSavingSlot] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMe()
        setProfile(data)
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Не удалось загрузить профиль'
        toast.error(message)
      }
    }
    loadProfile()
  }, [])

  useEffect(() => {
    if (!profile) return
    setCity(profile.city || profile.region || '')
    setDoctorName(profile.name || '')
    setSpecialty(profile.specialty || DOCTOR_SPECIALTIES[0])
    setOffice(profile.office || '')
    setDoctorDescription(profile.doctorDescription || '')
    if (profile.role === 'doctor') {
      getMyDoctorAppointmentSlots()
        .then(setDoctorSlots)
        .catch(() => setDoctorSlots([]))
    }
  }, [profile])

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Выберите изображение для аватара')
      return
    }
    try {
      setIsUploading(true)
      const updated = await uploadAvatar(file)
      setProfile(updated)
      toast.success('Аватар обновлен')
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Не удалось загрузить аватар'
      toast.error(message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleLogout = () => {
    clearAuthToken()
    navigate(routes.login.url())
  }

  const handleSaveLocation = async () => {
    const selectedCity = city.trim()
    if (!selectedCity) {
      toast.error('Выберите город')
      return
    }

    try {
      setIsSavingLocation(true)
      const updated = await updateMyLocation({ city: selectedCity, region: selectedCity })
      setProfile(updated)
      toast.success('Город обновлен')
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Не удалось обновить регион'
      toast.error(message)
    } finally {
      setIsSavingLocation(false)
    }
  }

  const handleSaveDoctorProfile = async () => {
    try {
      setIsSavingDoctorProfile(true)
      const updated = await updateMyDoctorProfile({
        name: doctorName,
        specialty,
        office,
        doctorDescription,
      })
      setProfile(updated)
      toast.success('Профиль врача обновлен')
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Не удалось обновить профиль врача'
      toast.error(message)
    } finally {
      setIsSavingDoctorProfile(false)
    }
  }

  const startEditingSlot = (slot: AppointmentSlot) => {
    setEditingSlotId(slot.id)
    setSlotDate(toDateInput(slot.startsAt))
    setSlotTime(toTimeInput(slot.startsAt))
    setSlotStatus(slot.status)
  }

  const refreshDoctorSlots = async () => {
    setDoctorSlots(await getMyDoctorAppointmentSlots())
  }

  const handleSaveSlot = async () => {
    if (!editingSlotId || !slotDate || !slotTime) {
      toast.error('Выберите окно для редактирования')
      return
    }
    const startsAt = new Date(`${slotDate}T${slotTime}`)
    const endsAt = new Date(startsAt)
    endsAt.setMinutes(endsAt.getMinutes() + 45)

    try {
      setIsSavingSlot(true)
      await updateAppointmentSlot(editingSlotId, {
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        status: slotStatus,
      })
      await refreshDoctorSlots()
      setEditingSlotId('')
      toast.success('Запись обновлена')
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Не удалось обновить запись'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setIsSavingSlot(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await deleteAppointmentSlot(slotId)
      await refreshDoctorSlots()
      if (editingSlotId === slotId) setEditingSlotId('')
      toast.success('Запись удалена или отменена')
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Не удалось удалить запись'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    }
  }

  const avatarUrl = getAvatarUrl(profile?.avatarUrl)
  const displayName = profile?.name || 'Пользователь'

  return (
    <div className="mx-auto max-w-3xl rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#4b5563]">Личный кабинет</p>
          <h2 className="mt-2 text-3xl font-semibold">Профиль пользователя</h2>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleLogout} className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm text-[#1f1f1f] hover:border-[#ef4444]">
            Выйти
          </button>
          <button type="button" onClick={() => navigate(-1)} className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm text-[#1f1f1f] hover:border-[#ef4444]">
            Назад
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[180px_1fr]">
        <div className="flex flex-col items-center gap-4">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[#cbd5e1] bg-white text-4xl text-[#1f1f1f] disabled:cursor-not-allowed">
            {avatarUrl ? <img src={avatarUrl} alt="Аватар" className="h-full w-full object-cover" /> : <span>{displayName.charAt(0).toUpperCase()}</span>}
            {isUploading && <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-[#1f1f1f]">Загрузка...</span>}
          </button>
          <span className="text-xs text-[#4b5563]">Нажмите, чтобы сменить аватар</span>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
            <p className="text-xs uppercase tracking-widest text-[#4b5563]">Пользователь</p>
            <p className="mt-2 text-lg text-[#1f1f1f]">{displayName}</p>
            <p className="mt-1 text-sm text-[#4b5563]">Роль: {profile?.role || 'patient'}</p>
          </div>
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
            <p className="text-xs uppercase tracking-widest text-[#4b5563]">Электронная почта</p>
            <p className="mt-2 text-lg text-[#1f1f1f]">{profile?.email || '—'}</p>
          </div>
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
            <p className="text-xs uppercase tracking-widest text-[#4b5563]">Город</p>
            <p className="mt-2 text-sm text-[#4b5563]">{profile?.city || profile?.region || 'Город не указан'}</p>
            <div className="mt-3 space-y-2">
              <select value={city} onChange={(event) => setCity(event.target.value)} className="w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]">
                <option value="">Выберите город</option>
                {POPULAR_RUSSIAN_CITIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <button type="button" onClick={handleSaveLocation} disabled={isSavingLocation} className="mt-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-xs text-[#1f1f1f] hover:border-[#ef4444]">
              {isSavingLocation ? 'Сохраняем...' : 'Сохранить город'}
            </button>
          </div>
          {profile?.role === 'doctor' && (
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
              <p className="text-xs uppercase tracking-widest text-[#4b5563]">Профиль врача</p>
              <div className="mt-3 grid gap-3">
                <input value={doctorName} onChange={(event) => setDoctorName(event.target.value)} placeholder="ФИО врача" className="w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]" />
                <select value={specialty} onChange={(event) => setSpecialty(event.target.value)} className="w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]">
                  {DOCTOR_SPECIALTIES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <input value={office} onChange={(event) => setOffice(event.target.value)} placeholder="Кабинет, например 204" className="w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]" />
                <textarea value={doctorDescription} onChange={(event) => setDoctorDescription(event.target.value)} placeholder="Кратко: опыт, направления приема" rows={3} className="w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]" />
              </div>
              <button type="button" onClick={handleSaveDoctorProfile} disabled={isSavingDoctorProfile} className="mt-3 rounded-lg bg-[#dc2626] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
                {isSavingDoctorProfile ? 'Сохраняем...' : 'Сохранить профиль врача'}
              </button>
            </div>
          )}
          {profile?.role === 'doctor' && (
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
              <p className="text-xs uppercase tracking-widest text-[#4b5563]">Редактирование записей</p>
              <div className="mt-3 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-3">
                <div className="grid gap-2 md:grid-cols-[1fr_120px_140px]">
                  <input type="date" value={slotDate} onChange={(event) => setSlotDate(event.target.value)} className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#dc2626]" />
                  <input type="time" value={slotTime} onChange={(event) => setSlotTime(event.target.value)} className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#dc2626]" />
                  <select value={slotStatus} onChange={(event) => setSlotStatus(event.target.value as 'available' | 'booked' | 'cancelled')} className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#dc2626]">
                    <option value="available">Свободно</option>
                    <option value="booked">Занято</option>
                    <option value="cancelled">Отменено</option>
                  </select>
                </div>
                <button type="button" onClick={handleSaveSlot} disabled={!editingSlotId || isSavingSlot} className="mt-3 rounded-lg bg-[#dc2626] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
                  {isSavingSlot ? 'Сохраняем...' : 'Сохранить выбранную запись'}
                </button>
              </div>
              <div className="mt-3 max-h-[420px] space-y-2 overflow-auto pr-1">
                {doctorSlots.map((slot) => (
                  <div key={slot.id} className="rounded-lg border border-[#e5e7eb] bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#1f1f1f]">{formatSlotTime(slot)}</p>
                        <p className="text-xs text-[#4b5563]">{slot.status === 'booked' ? 'Занято пациентом' : slot.status === 'cancelled' ? 'Отменено' : 'Свободно'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEditingSlot(slot)} className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs text-[#1f1f1f] hover:border-[#dc2626]">
                          Изменить
                        </button>
                        <button type="button" onClick={() => handleDeleteSlot(slot.id)} className="rounded-lg border border-[#dc2626] px-3 py-2 text-xs text-[#dc2626]">
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {doctorSlots.length === 0 && <p className="text-sm text-[#4b5563]">Записей пока нет.</p>}
              </div>
            </div>
          )}
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
            <p className="text-xs uppercase tracking-widest text-[#4b5563]">Безопасность</p>
            <button type="button" className="mt-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-xs text-[#1f1f1f] hover:border-[#ef4444]">
              Сменить пароль
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
