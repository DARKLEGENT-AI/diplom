import { Link } from 'react-router-dom'

import { routes } from '@src/app/constants/routes'

const ResetPasswordPage = () => {
  return (
    <div className="w-full max-w-md rounded-3xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold">Восстановление пароля</h2>
      <p className="mt-2 text-sm text-[#4b5563]">Подтвердите почту и задайте новый пароль.</p>

      <form className="mt-6 space-y-4">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-[#4b5563]">Почта для подтверждения</span>
          <input
            type="email"
            placeholder="mail@example.com"
            className="mt-2 w-full rounded-md border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-[#4b5563]">Новый пароль</span>
          <input
            type="password"
            placeholder="••••••••"
            className="mt-2 w-full rounded-md border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#1f1f1f] outline-none focus:border-[#dc2626]"
          />
        </label>
        <button
          type="button"
          className="w-full rounded-md bg-[#dc2626] px-4 py-3 text-sm font-semibold text-white shadow-sm"
        >
          Сменить пароль
        </button>
      </form>

      <div className="mt-6 text-sm text-[#4b5563]">
        Вернуться ко{' '}
        <Link to={routes.login.url()} className="text-[#111827] hover:text-[#1f1f1f]">
          входу
        </Link>
      </div>
    </div>
  )
}

export default ResetPasswordPage

