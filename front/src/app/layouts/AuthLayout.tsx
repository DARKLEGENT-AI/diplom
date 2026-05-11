import { Outlet } from 'react-router-dom'

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1f1f1f]">
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-12">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="flex flex-col justify-center border border-[#e5e7eb] bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
                <span className="absolute h-7 w-3 rounded-sm bg-[#d71920]" />
                <span className="absolute h-3 w-7 rounded-sm bg-[#d71920]" />
              </div>
              <div>
                <h1 className="text-4xl font-semibold">МедУчет</h1>
                <p className="text-sm text-[#4b5563]">Система учета медицинского учреждения</p>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-lg text-[#4b5563]">
              Единая веб-система для учета пациентов, посещений, услуг и отчетности с безопасной авторизацией.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                'Централизованная база пациентов',
                'Журнал посещений и услуг',
                'Месячная статистика услуг',
                'Геопривязка при регистрации',
              ].map((item) => (
                <div key={item} className="border border-[#e5e7eb] bg-[#f8fafc] p-4 text-sm text-[#1f1f1f]">
                  {item}
                </div>
              ))}
            </div>
          </section>
          <div className="flex items-center justify-center">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
