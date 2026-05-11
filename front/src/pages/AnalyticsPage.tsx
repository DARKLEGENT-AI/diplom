import { Download } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card } from '@src/shared/ui/card'
import type { ModalType } from '@src/features/auth/AuthModals'
import { listSurveys } from '@src/shared/api/surveys'
import { getSurveyAnalytics } from '@src/shared/api/analytics'
import { QUERY_KEYS } from '@src/shared/constants/api'

export const AnalyticsPage = () => {
  const { openModal } = useOutletContext<{ openModal: (type: ModalType) => void }>()

  const { data: surveys } = useQuery({
    queryKey: [QUERY_KEYS.surveys.list],
    queryFn: listSurveys,
    retry: false,
  })
  const surveyId = surveys?.[0]?.id
  const { data: analytics } = useQuery({
    queryKey: [QUERY_KEYS.analytics.survey, surveyId],
    queryFn: () => getSurveyAnalytics(surveyId ?? ''),
    enabled: Boolean(surveyId),
    retry: false,
  })

  const analyticsCards = [
    { id: 'sessions', label: 'Комнат', value: `${analytics?.totalSessions ?? 0}`, delta: 'за все время' },
    { id: 'responses', label: 'Ответов', value: `${analytics?.totalResponses ?? 0}`, delta: 'за все время' },
    {
      id: 'questions',
      label: 'Вопросов с ответами',
      value: `${analytics?.perQuestion?.length ?? 0}`,
      delta: 'в аналитике',
    },
    {
      id: 'survey',
      label: 'Выбранный опрос',
      value: surveys?.[0]?.title ?? '—',
      delta: 'по умолчанию',
    },
  ]

  const analyticsReports = (analytics?.perQuestion ?? []).map((item) => ({
    id: item.questionId,
    title: `Вопрос ${item.questionId.slice(0, 6)} — ${item.count} ответов`,
    updatedAt: 'только что',
  }))

  return (
    <div className="space-y-10 pb-16">
      <section className="rounded-[28px] border border-[#e2e8f0] bg-white/80 p-6 sm:p-8">
        <Badge className="bg-[#1b2538] text-white">Аналитика</Badge>
        <h1 className="mt-4 text-3xl font-semibold text-[#0f172a] sm:text-4xl">
          Глубокая аналитика сразу после комнаты
        </h1>
        <p className="mt-3 text-[#64748b]">
          Отслеживайте динамику вовлеченности, скорость ответов и качество данных в одном отчете.
        </p>
        <Button
          className="mt-6 w-full bg-[#1b2538] text-white hover:bg-[#28324a] sm:w-auto"
          onClick={() => openModal('export')}
        >
          <Download className="mr-2 size-4" />
          Скачать последний отчет
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analyticsCards.map((item) => (
          <Card key={item.id} className="border border-[#e2e8f0] bg-white/90 p-5">
            <p className="text-sm text-[#94a3b8]">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#0f172a]">{item.value}</p>
            <p className="text-xs text-[#64748b]">{item.delta}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {analyticsReports.map((report) => (
          <Card key={report.id} className="border border-[#e2e8f0] bg-white/90 p-5">
            <h3 className="text-lg font-semibold text-[#0f172a]">{report.title}</h3>
            <p className="mt-2 text-sm text-[#64748b]">Обновлен {report.updatedAt}</p>
          </Card>
        ))}
        {!analyticsReports.length && (
          <Card className="border border-[#e2e8f0] bg-white/90 p-5 text-sm text-[#64748b]">
            Пока нет данных аналитики. Запустите комнату и соберите ответы.
          </Card>
        )}
      </section>
    </div>
  )
}

export default AnalyticsPage
