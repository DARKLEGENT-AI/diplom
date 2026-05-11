import { Link, useNavigate } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { routes } from '@src/app/constants/routes'
import { login } from '@src/shared/api/auth'
import { setAuthToken } from '@src/shared/constants/auth'

const LoginPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Введите логин и пароль')
      return
    }
    try {
      setIsSubmitting(true)
      const response = await login({ email, password })
      setAuthToken(response.accessToken)
      toast.success('Вход выполнен')
      navigate(routes.app.url())
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Не удалось войти. Проверьте данные.'
      toast.error(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-[#e5e7eb] bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold">Вход в МедУчет</h2>
      <p className="mt-2 text-sm text-[#4b5563]">Введите логин и пароль для доступа к системе учета.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-[#4b5563]">Логин или email</span>
          <input
            type="text"
            placeholder="mail@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-[#4b5563]">Пароль</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]"
          />
        </label>
        <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-[#dc2626] px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? 'Входим...' : 'Войти'}
        </button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link to={routes.register.url()} className="text-[#111827] hover:text-[#1f1f1f]">Регистрация</Link>
        <Link to={routes.reset.url()} className="text-[#4b5563] hover:text-[#1f1f1f]">Восстановление пароля</Link>
      </div>
    </div>
  )
}

export default LoginPage
