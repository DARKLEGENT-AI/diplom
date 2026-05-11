import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { routes } from '@src/app/constants/routes'
import { register } from '@src/shared/api/auth'
import { setAuthToken } from '@src/shared/constants/auth'
import { DOCTOR_SPECIALTIES, POPULAR_RUSSIAN_CITIES } from '@src/shared/constants/cities'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('patient')
  const [city, setCity] = useState('')
  const [specialty, setSpecialty] = useState(DOCTOR_SPECIALTIES[0])
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [captchaAccepted, setCaptchaAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedCity = useMemo(() => city.trim(), [city])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!login.trim() || !email.trim() || !password.trim()) {
      toast.error('Заполните логин, email и пароль')
      return
    }
    if (!selectedCity) {
      toast.error('Выберите город')
      return
    }
    if (!termsAccepted) {
      toast.error('Нужно принять правила использования')
      return
    }
    if (!captchaAccepted) {
      toast.error('Подтвердите CAPTCHA')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await register({
        email,
        password,
        name: login,
        city: selectedCity,
        role,
        specialty: role === 'doctor' ? specialty : undefined,
      })
      setAuthToken(response.accessToken)
      toast.success('Аккаунт создан')
      navigate(routes.app.url())
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Не удалось зарегистрироваться. Проверьте данные.'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-[#e5e7eb] bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold">Регистрация</h2>
      <p className="mt-2 text-sm text-[#4b5563]">Создайте учетную запись и выберите город из списка.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input value={login} onChange={(event) => setLogin(event.target.value)} placeholder="Логин" className="w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]" />
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email" className="w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Пароль" className="w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]" />
        <select value={role} onChange={(event) => setRole(event.target.value)} className="w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]">
          <option value="patient">Пациент</option>
          <option value="doctor">Врач</option>
          <option value="admin">Администратор</option>
        </select>

        <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
          <p className="text-sm font-semibold">Город</p>
          <p className="text-xs text-[#4b5563]">Выберите один из 10 крупнейших городов России.</p>
          <select value={city} onChange={(event) => setCity(event.target.value)} className="mt-4 w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]">
            <option value="">Город не выбран</option>
            {POPULAR_RUSSIAN_CITIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          {role === 'doctor' && (
            <select value={specialty} onChange={(event) => setSpecialty(event.target.value)} className="mt-3 w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]">
              {DOCTOR_SPECIALTIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          )}
        </div>

        <label className="flex items-start gap-3 text-sm text-[#4b5563]">
          <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 h-4 w-4" />
          Я согласен с правилами использования и обработкой персональных данных
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-[#e5e7eb] bg-white p-3 text-sm text-[#4b5563]">
          <input type="checkbox" checked={captchaAccepted} onChange={(event) => setCaptchaAccepted(event.target.checked)} className="h-4 w-4" />
          CAPTCHA: я не робот
        </label>

        <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-[#dc2626] px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? 'Создаем...' : 'Создать аккаунт'}
        </button>
      </form>

      <div className="mt-6 text-sm text-[#4b5563]">
        Уже есть аккаунт? <Link to={routes.login.url()} className="text-[#111827] hover:text-[#1f1f1f]">Войти</Link>
      </div>
    </div>
  )
}

export default RegisterPage
