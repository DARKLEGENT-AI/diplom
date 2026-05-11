import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { getMedicalVisits, getMonthlyMedicalStatistics, type MedicalVisit, type ServiceStatistic } from '@src/shared/api/medical'

const ReportsPage = () => {
  const [statistics, setStatistics] = useState<ServiceStatistic[]>([])
  const [visits, setVisits] = useState<MedicalVisit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [nextStatistics, nextVisits] = await Promise.all([getMonthlyMedicalStatistics(), getMedicalVisits()])
        setStatistics(nextStatistics)
        setVisits(nextVisits)
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Не удалось загрузить отчеты'
        toast.error(Array.isArray(message) ? message.join(', ') : message)
      } finally {
        setIsLoading(false)
      }
    }
    loadReports()
  }, [])

  const totalServices = statistics.reduce((sum, item) => sum + item.count, 0)
  const activePatients = new Set(visits.map((visit) => visit.patientId)).size
  const dayActivity = useMemo(() => {
    const counts = new Map<string, number>()
    visits.forEach((visit) => {
      const label = new Date(visit.date).toLocaleDateString('ru-RU', { weekday: 'long' })
      counts.set(label, (counts.get(label) || 0) + 1)
    })
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [visits])

  if (isLoading) {
    return <div className="rounded-lg border border-[#d7dce2] bg-white p-6 text-sm text-[#4b5563]">Загрузка отчетов...</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[#d7dce2] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#6b7280]">Страница отчетов</p>
            <h2 className="mt-2 text-3xl font-semibold">Аналитика услуг и активности</h2>
          </div>
          <div className="rounded-lg border border-[#d7dce2] bg-white px-4 py-2 text-xs text-[#4b5563]">
            Источник данных: PostgreSQL
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[#d7dce2] bg-white p-5">
            <p className="text-xs uppercase tracking-widest text-[#6b7280]">Услуг за месяц</p>
            <p className="mt-3 text-3xl font-semibold">{totalServices}</p>
          </div>
          <div className="rounded-lg border border-[#d7dce2] bg-white p-5">
            <p className="text-xs uppercase tracking-widest text-[#6b7280]">Активных пациентов</p>
            <p className="mt-3 text-3xl font-semibold">{activePatients}</p>
          </div>
          <div className="rounded-lg border border-[#d7dce2] bg-white p-5">
            <p className="text-xs uppercase tracking-widest text-[#6b7280]">Услуг в рейтинге</p>
            <p className="mt-3 text-3xl font-semibold">{statistics.length}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-[#d7dce2] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-[#6b7280]">100 самых частых услуг</p>
          <div className="mt-5 overflow-hidden rounded-lg border border-[#d7dce2]">
            <div className="grid grid-cols-[60px_1fr_160px_120px] bg-white px-4 py-3 text-xs uppercase tracking-widest text-[#6b7280]">
              <span>#</span>
              <span>Услуга</span>
              <span>Отделение</span>
              <span>Количество</span>
            </div>
            {statistics.slice(0, 100).map((item, index) => (
              <div key={item.serviceId} className="grid grid-cols-[60px_1fr_160px_120px] border-t border-[#e5e7eb] px-4 py-3 text-sm">
                <span className="text-[#6b7280]">{index + 1}</span>
                <span className="font-semibold text-[#1f2933]">{item.service?.name || 'Услуга удалена'}</span>
                <span className="text-[#4b5563]">{item.service?.department || 'Не указано'}</span>
                <span className="text-[#4b5563]">{item.count}</span>
              </div>
            ))}
            {statistics.length === 0 && <p className="border-t border-[#e5e7eb] px-4 py-6 text-sm text-[#6b7280]">Данных для отчета пока нет.</p>}
          </div>
        </div>

        <div className="rounded-lg border border-[#d7dce2] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-[#6b7280]">Активность пациентов</p>
          <div className="mt-5 space-y-4">
            {dayActivity.map(([day, count]) => {
              const value = visits.length ? Math.round((count / visits.length) * 100) : 0
              return (
                <div key={day}>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#4b5563]">{day}</span>
                    <span className="text-[#1f2933]">{value}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#eef1f4]">
                    <div className="h-2 rounded-full bg-[#6b7280]" style={{ width: `${value}%` }} />
                  </div>
                </div>
              )
            })}
            {dayActivity.length === 0 && <p className="text-sm text-[#6b7280]">Активность появится после создания посещений.</p>}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ReportsPage
