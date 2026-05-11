import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, Signal } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card } from '@src/shared/ui/card'
import { Progress } from '@src/shared/ui/progress'
import { getSessionByCode, submitAnswer } from '@src/shared/api/sessions'
import { QUERY_KEYS } from '@src/shared/constants/api'

export const SessionPage = () => {
  const { code } = useParams<{ code: string }>()
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState<{ questionId: string; optionIndex: number }[]>([])
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: [QUERY_KEYS.sessions.getByCode, code],
    queryFn: () => getSessionByCode(code ?? ''),
    enabled: Boolean(code),
    refetchInterval: 3000,
  })

  const isActive = data?.status === 'active'
  const questions = useMemo(
    () => (data?.questions ?? []).slice().sort((a, b) => a.orderIndex - b.orderIndex),
    [data?.questions],
  )
  const currentQuestion =
    questions.find((question) => question.id === currentQuestionId) ?? questions[0] ?? null
  const results = data?.question && data?.question.id === currentQuestion?.id ? data?.results ?? [] : []
  const totalVotes = useMemo(
    () => results.reduce((sum, item) => sum + item.value, 0) || 1,
    [results],
  )
  const optionList = useMemo(() => {
    if (!currentQuestion) return []
    if (results.length) return results
    const items = Array.isArray((currentQuestion.options as any)?.items)
      ? ((currentQuestion.options as any).items as Array<string | { label?: string }>)
      : []
    return items.map((item, index) => ({
      label: typeof item === 'string' ? item : item?.label ?? `Вариант ${index + 1}`,
      value: 0,
    }))
  }, [currentQuestion, results])
  const participantId = useMemo(() => {
    if (!code) return undefined
    return localStorage.getItem(`participant:${code}`) ?? undefined
  }, [code])

  useEffect(() => {
    if (!questions.length) return
    setCurrentQuestionId((prev) => prev ?? questions[0]?.id ?? null)
  }, [questions])

  useEffect(() => {
    setAnswered([])
    setSelected(null)
    setCurrentQuestionId(null)
  }, [code])

  const lastAnswered = answered.length ? answered[answered.length - 1] : null
  const canAnswerCurrent = useMemo(() => {
    if (!currentQuestion) return false
    const alreadyAnswered = answered.some((entry) => entry.questionId === currentQuestion.id)
    if (!alreadyAnswered) return true
    return lastAnswered?.questionId === currentQuestion.id
  }, [answered, currentQuestion, lastAnswered])

  const startEditLastAnswer = () => {
    if (!lastAnswered) return
    setCurrentQuestionId(lastAnswered.questionId)
    setSelected(null)
  }

  const handleVote = async (index: number) => {
    if (selected !== null || !code || !currentQuestion || !isActive || !canAnswerCurrent) return
    setSelected(index)
    await submitAnswer(code, { questionId: currentQuestion.id, optionIndex: index, participantId })
    setAnswered((prev) => {
      const existingIndex = prev.findIndex((entry) => entry.questionId === currentQuestion.id)
      if (existingIndex === -1) {
        return [...prev, { questionId: currentQuestion.id, optionIndex: index }]
      }
      return prev.map((entry, idx) =>
        idx === existingIndex ? { questionId: currentQuestion.id, optionIndex: index } : entry,
      )
    })

    const optionRoutes = (currentQuestion.settings as any)?.branching?.optionRoutes ?? {}
    const target = optionRoutes[String(index)]
    const currentIndex = questions.findIndex((item) => item.id === currentQuestion.id)
    const nextByOrder = currentIndex >= 0 ? questions[currentIndex + 1] : undefined
    if (target === '__end__') {
      setCurrentQuestionId(null)
      setSelected(null)
      return
    }
    if (typeof target === 'string' && questions.some((item) => item.id === target)) {
      setCurrentQuestionId(target)
    } else if (nextByOrder) {
      setCurrentQuestionId(nextByOrder.id)
    } else {
      setCurrentQuestionId(null)
    }
    setSelected(null)
    refetch()
  }

  return (
    <div className="space-y-10 pb-16">
      <section className="rounded-[28px] border border-[#e2e8f0] bg-white/80 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <Badge className="bg-[#1b2538] text-white">Синхронный опрос</Badge>
            <h1 className="text-3xl font-semibold text-[#0f172a] sm:text-4xl">
              {data?.surveyTitle ?? 'Опрос'}
            </h1>
            <p className="text-sm text-[#64748b]">Комната: {code ?? data?.code}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#f1f5f9] px-4 py-2 text-sm text-[#475569]">
            <Signal className="size-4 text-[#1b2538]" />
            {isLoading ? 'Подключение...' : 'Live обновление'}
          </div>
        </div>
      </section>

      <section>
        <Card className="border border-[#e2e8f0] bg-white/90 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#0f172a]">Синхронное участие</h2>
              <p className="mt-2 text-sm text-[#64748b]">
                Выберите вариант — результаты обновятся мгновенно для всех участников.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-[#475569]">
              <span className="rounded-full bg-[#f1f5f9] px-3 py-1">Создатель: МедУчет</span>
              <span className="rounded-full bg-[#f1f5f9] px-3 py-1">Статус: {data?.status ?? '—'}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {answered.map((entry, entryIndex) => {
              const answeredQuestion = questions.find((item) => item.id === entry.questionId)
              if (!answeredQuestion) return null
              const optionItems = Array.isArray((answeredQuestion.options as any)?.items)
                ? ((answeredQuestion.options as any).items as Array<string | { label?: string }>)
                : []
              const answerLabel =
                optionItems[entry.optionIndex] && typeof optionItems[entry.optionIndex] === 'string'
                  ? (optionItems[entry.optionIndex] as string)
                  : (optionItems[entry.optionIndex] as any)?.label ?? `Вариант ${entry.optionIndex + 1}`
              return (
                <div key={`${entry.questionId}-${entryIndex}`} className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
                  <p className="text-sm font-semibold text-[#0f172a]">{answeredQuestion.text}</p>
                  <p className="mt-2 text-sm text-[#475569]">Ответ: {answerLabel}</p>
                </div>
              )
            })}

            {currentQuestion && canAnswerCurrent && (
              <div className="grid gap-3">
                <p className="text-base font-semibold text-[#0f172a]">{currentQuestion.text}</p>
                {optionList.map((option, index) => {
                  const percent = Math.round((option.value / totalVotes) * 100)
                  const isSelected = selected === index
                  return (
                    <button
                      key={`${currentQuestion.id}-${option.label}-${index}`}
                      type="button"
                      disabled={!isActive}
                      onClick={() => handleVote(index)}
                      className={
                        "rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4 text-left transition hover:border-[#cbd5e1] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60" +
                        (isSelected ? " border-[#1b2538] bg-white shadow-sm" : "")
                      }
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-[#0f172a]">{option.label}</span>
                        {results.length > 0 && <span className="text-[#475569]">{percent}%</span>}
                      </div>
                      {results.length > 0 && <Progress value={percent} className="mt-3 h-2 bg-[#e2e8f0]" />}
                    </button>
                  )}
                )}
                {!results.length && !Array.isArray((currentQuestion.options as any)?.items) && (
                  <p className="text-sm text-[#64748b]">Ожидаем варианты ответа...</p>
                )}
              </div>
            )}

            {!currentQuestion && (
              <div className="rounded-xl border border-[#dcfce7] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
                Опрос завершен. Спасибо за участие!
              </div>
            )}
            {!currentQuestion && lastAnswered && (
              <Button
                variant="outline"
                className="w-full border-[#1b2538]/20 text-[#1b2538]"
                onClick={startEditLastAnswer}
              >
                Сменить последний ответ
              </Button>
            )}
          </div>

          {!isActive && (
            <div className="mt-4 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]">
              Комната не активна. Дождитесь запуска ведущим.
            </div>
          )}

          {selected !== null && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#dcfce7] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
              <CheckCircle2 className="size-4" />
              Ваш голос учтен. Продолжайте следить за результатами.
            </div>
          )}

          <div className="mt-8 border-t border-[#e2e8f0] pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[#0f172a]">Мгновенные результаты</h3>
                <p className="mt-1 text-sm text-[#64748b]">Данные обновляются каждые несколько секунд.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-[#475569]">
                <span className="rounded-full bg-[#f1f5f9] px-3 py-1">Ответов: {totalVotes}</span>
                <span className="rounded-full bg-[#f1f5f9] px-3 py-1">
                  Участников: {data?.participants ?? 0}
                </span>
                <span className="rounded-full bg-[#f1f5f9] px-3 py-1">Обновлено: сейчас</span>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {(data?.resultsByQuestion ?? []).map((group) => {
                if (!group.counts.length) {
                  return (
                    <div key={group.questionId} className="rounded-xl border border-[#e2e8f0] bg-white p-3">
                      <p className="text-sm font-semibold text-[#0f172a]">{group.text}</p>
                      <p className="mt-2 text-sm text-[#64748b]">Нет данных по вариантам ответа.</p>
                    </div>
                  )
                }
                return (
                  <div key={group.questionId} className="space-y-3">
                    <p className="text-sm font-semibold text-[#0f172a]">{group.text}</p>
                    {group.counts.map((option) => {
                      const percent = group.total ? Math.round((option.value / group.total) * 100) : 0
                      return (
                        <div key={`${group.questionId}-${option.label}`} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#0f172a]">{option.label}</span>
                            <span className="text-[#475569]">{percent}%</span>
                          </div>
                          <Progress value={percent} className="h-2 bg-[#e2e8f0]" />
                        </div>
                      )
                    })}
                  </div>
                )
              })}
              {!data?.resultsByQuestion?.length && (
                <div className="text-sm text-[#64748b]">Результаты пока недоступны.</div>
              )}
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}

export default SessionPage
