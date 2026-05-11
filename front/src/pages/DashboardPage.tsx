import { ArrowUpRight, Clock, Paintbrush, PlayCircle, PlusCircle, Shuffle, Timer } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'

import { Button } from '@src/shared/ui/button'
import { Card } from '@src/shared/ui/card'
import { Badge } from '@src/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@src/shared/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@src/shared/ui/dialog'
import { Input } from '@src/shared/ui/input'
import { Textarea } from '@src/shared/ui/textarea'
import { NativeSelect, NativeSelectOption } from '@src/shared/ui/native-select'
import { activityFeed, exportQueue } from '@src/shared/constants/content'
import type { ModalType } from '@src/features/auth/AuthModals'
import { deleteSession, getSessionResponses, listSessions } from '@src/shared/api/sessions'
import { listTemplates } from '@src/shared/api/templates'
import {
  addSurveyQuestion,
  deleteSurvey,
  deleteSurveyQuestion,
  getSurvey,
  listSurveys,
  updateSurvey,
  updateSurveyQuestion,
  type SurveyQuestionType,
} from '@src/shared/api/surveys'
import { getMe } from '@src/shared/api/auth'
import { QUERY_KEYS } from '@src/shared/constants/api'
import { queryClient } from '@src/shared/constants/queryClient'

type QuestionDraft = {
  id?: string
  localId: string
  type: SurveyQuestionType
  text: string
  options: string[]
  branching?: Record<number, string | null>
}

const QUESTION_TYPE_OPTIONS: {
  value: SurveyQuestionType
  label: string
  requiresOptions: boolean
  defaultOptions?: string[]
}[] = [
  {
    value: 'choice',
    label: 'Один вариант',
    requiresOptions: true,
    defaultOptions: ['Да', 'Нет'],
  },
  {
    value: 'multi',
    label: 'Несколько вариантов',
    requiresOptions: true,
    defaultOptions: ['Вариант 1', 'Вариант 2'],
  },
  {
    value: 'scale',
    label: 'Шкала 1–5',
    requiresOptions: true,
    defaultOptions: ['1', '2', '3', '4', '5'],
  },
  {
    value: 'text',
    label: 'Свободный текст',
    requiresOptions: false,
  },
  {
    value: 'number',
    label: 'Число',
    requiresOptions: false,
  },
]

const createQuestionDraft = (overrides?: Partial<QuestionDraft>): QuestionDraft => {
  const baseType: SurveyQuestionType = overrides?.type ?? 'choice'
  const typeConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === baseType)
  const fallbackId = `q-${Date.now()}-${Math.random().toString(16).slice(2)}`
  const localId =
    overrides?.localId ??
    (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : fallbackId)
    return {
      id: overrides?.id,
      localId,
      type: baseType,
      text: '',
      options: typeConfig?.defaultOptions ? [...typeConfig.defaultOptions] : [],
      branching: {},
      ...overrides,
    }
  }

export const DashboardPage = () => {
  const { openModal } = useOutletContext<{ openModal: (type: ModalType) => void }>()
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [showFullStats, setShowFullStats] = useState(false)
  const [editSurveyId, setEditSurveyId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editQuestions, setEditQuestions] = useState<QuestionDraft[]>([])
  const [editError, setEditError] = useState<string | null>(null)
  const [isSavingSurvey, setIsSavingSurvey] = useState(false)

  const { data: sessions } = useQuery({
    queryKey: [QUERY_KEYS.sessions.list],
    queryFn: listSessions,
    retry: false,
  })
  const { data: templates } = useQuery({
    queryKey: [QUERY_KEYS.templates.list],
    queryFn: listTemplates,
    retry: false,
  })
  const { data: surveys } = useQuery({
    queryKey: [QUERY_KEYS.surveys.list],
    queryFn: listSurveys,
    retry: false,
  })
  const { data: me } = useQuery({
    queryKey: [QUERY_KEYS.auth.me],
    queryFn: getMe,
    retry: false,
  })

  const { data: surveyDetail } = useQuery({
    queryKey: [QUERY_KEYS.surveys.get, editSurveyId],
    queryFn: () => getSurvey(editSurveyId ?? ''),
    enabled: Boolean(editSurveyId),
    retry: false,
  })

  const deleteSurveyMutation = useMutation({
    mutationFn: deleteSurvey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.surveys.list] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.sessions.list] })
    },
  })
  void deleteSurveyMutation

  const deleteSessionMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.sessions.list] })
    },
  })

  const handleEditQuestion = (localId: string, patch: Partial<QuestionDraft>) => {
    setEditQuestions((prev) =>
      prev.map((question) => (question.localId === localId ? { ...question, ...patch } : question)),
    )
  }

  const addEditQuestion = () => {
    setEditQuestions((prev) => [...prev, createQuestionDraft({})])
  }

  const removeEditQuestion = (localId: string) => {
    setEditQuestions((prev) => prev.filter((question) => question.localId !== localId))
  }

  const updateEditOption = (localId: string, index: number, value: string) => {
    setEditQuestions((prev) =>
      prev.map((question) => {
        if (question.localId !== localId) return question
        const nextOptions = [...question.options]
        nextOptions[index] = value
        return { ...question, options: nextOptions }
      }),
    )
  }

  const updateEditBranching = (localId: string, optionIndex: number, target: string | null) => {
    setEditQuestions((prev) =>
      prev.map((question) => {
        if (question.localId !== localId) return question
        const nextBranching = { ...(question.branching ?? {}) }
        if (!target) {
          delete nextBranching[optionIndex]
        } else {
          nextBranching[optionIndex] = target
        }
        return { ...question, branching: nextBranching }
      }),
    )
  }

  const addEditOption = (localId: string) => {
    setEditQuestions((prev) =>
      prev.map((question) =>
        question.localId === localId ? { ...question, options: [...question.options, ''] } : question,
      ),
    )
  }

  const removeEditOption = (localId: string, index: number) => {
    setEditQuestions((prev) =>
      prev.map((question) => {
        if (question.localId !== localId) return question
        const nextOptions = question.options.filter((_, optionIndex) => optionIndex !== index)
        const nextBranching: Record<number, string | null> = {}
        Object.entries(question.branching ?? {}).forEach(([key, value]) => {
          const optionIndex = Number(key)
          if (optionIndex === index) return
          const shifted = optionIndex > index ? optionIndex - 1 : optionIndex
          nextBranching[shifted] = value
        })
        return { ...question, options: nextOptions, branching: nextBranching }
      }),
    )
  }

  const handleSaveSurvey = async () => {
    if (!editSurveyId) return
    setIsSavingSurvey(true)
    setEditError(null)
    try {
      const preparedQuestions = editQuestions.map((question) => ({
        ...question,
        text: question.text.trim(),
        options: question.options.map((option) => option.trim()).filter(Boolean),
      }))

      if (!preparedQuestions.length) {
        setEditError('Добавьте хотя бы один вопрос.')
        return
      }

      const invalidQuestion = preparedQuestions.find((question) => {
        const typeConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === question.type)
        if (!question.text) return true
        if (typeConfig?.requiresOptions && question.options.length < 2) return true
        return false
      })

      if (invalidQuestion) {
        setEditError('Заполните текст вопроса и минимум два варианта ответа там, где это нужно.')
        return
      }

      await updateSurvey(editSurveyId, { title: editTitle.trim(), description: editDescription.trim() || undefined })

      const existingIds = new Set((surveyDetail?.questions ?? []).map((question) => question.id))
      const draftIds = new Set(preparedQuestions.map((question) => question.id).filter(Boolean) as string[])
      const idMap = new Map<string, string>()

      for (const [index, question] of preparedQuestions.entries()) {
        const typeConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === question.type)
        const payload = {
          type: question.type,
          text: question.text,
          orderIndex: index,
          options: typeConfig?.requiresOptions ? { items: question.options } : undefined,
        }

        if (question.id && existingIds.has(question.id)) {
          await updateSurveyQuestion(editSurveyId, question.id, payload)
          idMap.set(question.localId, question.id)
        } else {
          const created = await addSurveyQuestion(editSurveyId, payload)
          idMap.set(question.localId, created.id)
        }
      }

      for (const [index, question] of preparedQuestions.entries()) {
        const typeConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === question.type)
        const optionRoutes: Record<string, string> = {}
        Object.entries(question.branching ?? {}).forEach(([key, value]) => {
          if (!value) return
          if (value === '__end__') {
            optionRoutes[key] = '__end__'
            return
          }
          const mapped = idMap.get(value)
          if (mapped) {
            optionRoutes[key] = mapped
          }
        })
        const settings =
          Object.keys(optionRoutes).length > 0
            ? {
                branching: {
                  optionRoutes,
                },
              }
            : {}
        const questionId = idMap.get(question.localId)
        if (questionId) {
          await updateSurveyQuestion(editSurveyId, questionId, {
            type: question.type,
            text: question.text,
            orderIndex: index,
            options: typeConfig?.requiresOptions ? { items: question.options } : undefined,
            settings,
          })
        }
      }

      for (const existingId of existingIds) {
        if (!draftIds.has(existingId)) {
          await deleteSurveyQuestion(editSurveyId, existingId)
        }
      }

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.surveys.list] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.surveys.get, editSurveyId] })
      setEditSurveyId(null)
    } catch (error) {
      setEditError('Не удалось сохранить опрос. Проверьте данные и попробуйте снова.')
    } finally {
      setIsSavingSurvey(false)
    }
  }

  const sessionRows = sessions ?? []
  const activeSession = useMemo(
    () => sessionRows.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessionRows],
  )

  const { data: sessionResponses } = useQuery({
    queryKey: ['sessions', activeSessionId, 'responses'],
    queryFn: () => getSessionResponses(activeSessionId ?? ''),
    enabled: Boolean(activeSessionId),
    retry: false,
  })

  const responseRows = useMemo(() => {
    const responses = sessionResponses ?? []
    return showFullStats ? responses : responses.slice(0, 5)
  }, [sessionResponses, showFullStats])

  const responseSummary = useMemo(() => {
    const responses = sessionResponses ?? []
    const participantIds = new Set(
      responses
        .map((response) => response.participant?.id ?? response.participant?.anonymousId ?? null)
        .filter(Boolean),
    )
    return {
      totalResponses: responses.length,
      totalParticipants: participantIds.size,
    }
  }, [sessionResponses])

  useEffect(() => {
    if (!activeSessionId) {
      setShowFullStats(false)
    }
  }, [activeSessionId])


  useEffect(() => {
    if (!surveyDetail) return
    setEditTitle(surveyDetail.title ?? '')
    setEditDescription(surveyDetail.description ?? '')
    const questions = surveyDetail.questions?.slice().sort((a, b) => a.orderIndex - b.orderIndex) ?? []
      setEditQuestions(
        questions.map((question) =>
          createQuestionDraft({
            id: question.id,
            localId: question.id,
            type: question.type,
            text: question.text,
            options: Array.isArray((question.options as any)?.items)
              ? ((question.options as any).items as string[])
              : [],
            branching: (() => {
              const optionRoutes = (question.settings as any)?.branching?.optionRoutes ?? {}
              const branching: Record<number, string | null> = {}
              Object.entries(optionRoutes).forEach(([key, value]) => {
                branching[Number(key)] = typeof value === 'string' ? value : null
              })
              return branching
            })(),
          }),
        ),
      )
    setEditError(null)
  }, [surveyDetail])

  const activeCount = sessionRows.filter((session) => session.status === 'active').length
  const closedCount = sessionRows.filter((session) => session.status === 'closed').length
  const totalCount = sessionRows.length
  const dashboardMetrics = [
    { label: 'Активные комнаты', value: activeCount.toString(), delta: `${activeCount} сейчас` },
    { label: 'Комнат всего', value: totalCount.toString(), delta: 'По всем опросам' },
    {
      label: 'Завершенность',
      value: totalCount ? `${Math.round((closedCount / totalCount) * 100)}%` : '0%',
      delta: `${closedCount} завершено`,
    },
    { label: 'Шаблонов', value: `${templates?.length ?? 0}`, delta: 'В библиотеке' },
  ]

  return (
    <div className="space-y-10 pb-16">
      <section className="rounded-[28px] border border-[#e2e8f0] bg-white/80 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Badge className="bg-[#1b2538] text-white">Панель ведущего</Badge>
            <h1 className="text-3xl font-semibold text-[#0f172a] sm:text-4xl">
              Добро пожаловать, {me?.email ?? 'Пользователь'}
            </h1>
            <p className="text-sm text-[#64748b]">
              Роль: {me?.role ?? 'author'} · Последняя активность в{' '}
              {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="w-full bg-[#1b2538] text-white hover:bg-[#28324a] sm:w-auto"
              onClick={() => openModal('create')}
            >
              <PlusCircle className="mr-2 size-4" />
              Создать опрос
            </Button>
            <Button
              variant="outline"
              className="w-full border-[#1b2538]/20 text-[#1b2538] sm:w-auto"
              onClick={() => openModal('join')}
            >
              <PlayCircle className="mr-2 size-4" />
              Запустить комнату
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <Card key={metric.label} className="border border-[#e2e8f0] bg-white/90 p-5">
            <p className="text-sm text-[#94a3b8]">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#0f172a]">{metric.value}</p>
            <p className="text-xs text-[#64748b]">{metric.delta}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <Card id="active-sessions" className="border border-[#e2e8f0] bg-white/90 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Активные комнаты</p>
              <h2 className="text-2xl font-semibold text-[#0f172a]">Управляйте опросами прямо сейчас</h2>
            </div>
            <Button
              variant="outline"
              className="w-full border-[#1b2538]/20 text-[#1b2538] sm:w-auto"
              onClick={() =>
                document.getElementById('active-sessions')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              }
            >
              Все комнаты
              <ArrowUpRight className="ml-2 size-4" />
            </Button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e2e8f0]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Комната</TableHead>
                  <TableHead>Код</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Участники</TableHead>
                  <TableHead>Старт</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionRows.map((session) => (
                  <TableRow
                    key={session.id}
                    className="cursor-pointer transition hover:bg-[#f8fafc]"
                    onClick={() => setActiveSessionId(session.id)}
                  >
                    <TableCell className="font-medium text-[#0f172a]">{session.survey?.title ?? 'Опрос'}</TableCell>
                    <TableCell>{session.code}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-[#e2e8f0] px-2 py-1 text-xs text-[#1b2538]">
                        {session.status}
                      </span>
                    </TableCell>
                      <TableCell>{session.participantsCount ?? 0}</TableCell>
                    <TableCell>
                      {new Date(session.createdAt).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        className="border-[#ef4444]/40 text-[#ef4444] hover:bg-[#f3f4f6]"
                        disabled={deleteSessionMutation.isPending}
                        onClick={(event) => {
                          event.stopPropagation()
                          if (window.confirm('Удалить комнату? Это удалит все ответы и участников.')) {
                            deleteSessionMutation.mutate(session.id)
                          }
                        }}
                      >
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="border border-[#e2e8f0] bg-white/90 p-6">
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <Clock className="size-4" />
            Лента активности
          </div>
          <div className="mt-4 space-y-4">
            {activityFeed.map((item) => (
              <div key={item.id} className="space-y-1 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                <p className="text-sm font-semibold text-[#0f172a]">{item.title}</p>
                <p className="text-xs text-[#64748b]">{item.description}</p>
                <p className="text-xs text-[#94a3b8]">В {item.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border border-[#e2e8f0] bg-white/90 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Опросы</p>
            <h3 className="mt-2 text-xl font-semibold text-[#0f172a]">История опросов</h3>
            <div className="mt-4 space-y-3">
              {(surveys ?? []).map((survey) => (
                <div
                  key={survey.id}
                  className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#0f172a]">{survey.title}</p>
                    <p className="text-xs text-[#64748b]">Создан {new Date(survey.createdAt).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
              ))}
            {!surveys?.length && <div className="text-sm text-[#64748b]">Опросов пока нет. Создайте первый.</div>}
          </div>
        </Card>

        <Card className="border border-[#e2e8f0] bg-white/90 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Шаблоны</p>
          <h3 className="mt-2 text-xl font-semibold text-[#0f172a]">Часто используемые</h3>
          <div className="mt-4 space-y-3">
            {(templates ?? []).map((template) => (
              <div key={template.id} className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                <p className="text-sm font-semibold text-[#0f172a]">{template.title}</p>
                <p className="text-xs text-[#64748b]">Создан {new Date(template.createdAt).toLocaleDateString('ru-RU')}</p>
              </div>
            ))}
            {!templates?.length && <div className="text-sm text-[#64748b]">Шаблонов пока нет. Создайте первый.</div>}
          </div>
        </Card>
      </section>

      <Card className="border border-[#e2e8f0] bg-white/90 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Экспорт</p>
        <h3 className="mt-2 text-xl font-semibold text-[#0f172a]">Очередь файлов</h3>
        <div className="mt-4 space-y-3">
          {exportQueue.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">{item.title}</p>
                <p className="text-xs text-[#94a3b8]">Создан в {item.createdAt}</p>
              </div>
              <span className="rounded-full bg-[#1b2538]/10 px-2 py-1 text-xs text-[#1b2538]">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={Boolean(activeSession)} onOpenChange={(open) => (!open ? setActiveSessionId(null) : null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Управление комнатой</DialogTitle>
            <DialogDescription>
              {activeSession
                ? `Опрос «${activeSession.survey?.title ?? 'Опрос'}» · Комната ${activeSession.code}`
                : 'Настройте параметры текущей комнаты.'}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Статистика</p>
                <h3 className="mt-2 text-lg font-semibold text-[#0f172a]">Кто за что проголосовал</h3>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-[#475569]">
                <span className="rounded-full bg-white px-3 py-1">Ответов: {responseSummary.totalResponses}</span>
                  <span className="rounded-full bg-white px-3 py-1">
                    Участников: {activeSession?.participantsCount ?? responseSummary.totalParticipants}
                  </span>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[#0f172a]">
              {responseRows.map((response) => {
                const optionItems = Array.isArray((response.question.options as any)?.items)
                  ? (response.question.options as any).items
                  : []
                const optionIndex = Number((response.answer as any)?.optionIndex)
                const optionLabel =
                  Number.isFinite(optionIndex) && optionItems[optionIndex]
                    ? optionItems[optionIndex]
                    : typeof (response.answer as any)?.text === 'string'
                      ? (response.answer as any).text
                      : 'Ответ'
                const participantName =
                  response.participant?.displayName ?? response.participant?.anonymousId ?? 'Гость'
                return (
                  <div key={response.id} className="rounded-xl border border-[#e2e8f0] bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#94a3b8]">{response.question.text}</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{participantName}</p>
                      <span className="rounded-full bg-[#1b2538]/10 px-2 py-1 text-xs text-[#1b2538]">
                        {optionLabel}
                      </span>
                    </div>
                  </div>
                )
              })}
              {!responseRows.length && (
                <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-white p-3 text-sm text-[#64748b]">
                  Ответов пока нет.
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                className="border-[#1b2538]/20 text-[#1b2538]"
                onClick={() => setShowFullStats((prev) => !prev)}
                disabled={!sessionResponses?.length}
              >
                {showFullStats ? 'Скрыть статистику' : 'Полная статистика'}
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                if (!activeSession?.survey?.id) return
                setActiveSessionId(null)
                setEditSurveyId(activeSession.survey.id)
              }}
            >
              <PlusCircle className="mr-2 size-4" />
              Изменить опрос
            </Button>
            <Button variant="outline" className="justify-start">
              <Shuffle className="mr-2 size-4" />
              Логика ветвления
            </Button>
            <Button variant="outline" className="justify-start">
              <Timer className="mr-2 size-4" />
              Таймеры
            </Button>
            <Button variant="outline" className="justify-start">
              <Paintbrush className="mr-2 size-4" />
              Оформление
            </Button>
          </div>
        </DialogContent>
      </Dialog>

        <Dialog open={Boolean(editSurveyId)} onOpenChange={(open) => (!open ? setEditSurveyId(null) : null)}>
          <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Редактировать опрос</DialogTitle>
            <DialogDescription>Обновите вопросы, варианты ответов и описание.</DialogDescription>
          </DialogHeader>
          {!surveyDetail ? (
            <div className="text-sm text-[#64748b]">Загрузка данных опроса...</div>
          ) : (
            <div className="grid gap-6">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#1b2538]">Название опроса</label>
                <Input
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  placeholder="Название опроса"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#1b2538]">Описание (опционально)</label>
                <Textarea
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  placeholder="Коротко о цели опроса"
                />
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1b2538]">Вопросы</p>
                  <Button variant="outline" onClick={addEditQuestion}>
                    Добавить вопрос
                  </Button>
                </div>

                {editQuestions.map((question, index) => {
                  const typeConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === question.type)
                  const requiresOptions = typeConfig?.requiresOptions ?? false
                  const branchTargets = editQuestions
                    .map((item, order) => ({ ...item, order }))
                    .filter((item) => item.localId !== question.localId)
                  return (
                    <div key={question.localId} className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#0f172a]">Вопрос {index + 1}</p>
                        {editQuestions.length > 1 && (
                          <Button
                            variant="ghost"
                            className="text-[#ef4444]"
                            onClick={() => removeEditQuestion(question.localId)}
                          >
                            Удалить
                          </Button>
                        )}
                      </div>
                      <div className="mt-3 grid gap-3">
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-[#1b2538]">Тип вопроса</label>
                          <NativeSelect
                            value={question.type}
                            onChange={(event) => {
                              const nextType = event.target.value as SurveyQuestionType
                              const nextConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === nextType)
                              handleEditQuestion(question.localId, {
                                type: nextType,
                                options: nextConfig?.defaultOptions ? [...nextConfig.defaultOptions] : [],
                                branching: {},
                              })
                            }}
                          >
                            {QUESTION_TYPE_OPTIONS.map((option) => (
                              <NativeSelectOption key={option.value} value={option.value}>
                                {option.label}
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-[#1b2538]">Текст вопроса</label>
                          <Input
                            value={question.text}
                            onChange={(event) => handleEditQuestion(question.localId, { text: event.target.value })}
                            placeholder="Введите формулировку"
                          />
                        </div>

                          {requiresOptions && (
                            <div className="grid gap-2">
                              <label className="text-sm font-medium text-[#1b2538]">Варианты ответа</label>
                              <div className="grid gap-2">
                                {question.options.map((option, optionIndex) => (
                                <div key={`${question.localId}-option-${optionIndex}`} className="flex items-center gap-2">
                                  <Input
                                    value={option}
                                    onChange={(event) => updateEditOption(question.localId, optionIndex, event.target.value)}
                                    placeholder={`Вариант ${optionIndex + 1}`}
                                  />
                                  <Button
                                    variant="ghost"
                                    className="text-[#ef4444]"
                                    onClick={() => removeEditOption(question.localId, optionIndex)}
                                  >
                                    Удалить
                                  </Button>
                                </div>
                              ))}
                            </div>
                              <Button variant="outline" onClick={() => addEditOption(question.localId)}>
                                Добавить вариант
                              </Button>
                            </div>
                          )}

                          {requiresOptions && (
                            <div className="grid gap-2">
                              <label className="text-sm font-medium text-[#1b2538]">Логика ветвления</label>
                              {branchTargets.length ? (
                                <div className="grid gap-2">
                                  {question.options.map((option, optionIndex) => {
                                    const currentValue = question.branching?.[optionIndex] ?? null
                                    const selectValue = currentValue ?? '__next__'
                                    return (
                                      <div
                                        key={`${question.localId}-branch-${optionIndex}`}
                                        className="grid gap-2 rounded-xl border border-[#e2e8f0] bg-white p-3"
                                      >
                                        <p className="text-sm text-[#475569]">
                                          {option || `Вариант ${optionIndex + 1}`}
                                        </p>
                                        <NativeSelect
                                          value={selectValue}
                                          onChange={(event) => {
                                            const value = event.target.value
                                            if (value === '__next__') {
                                              updateEditBranching(question.localId, optionIndex, null)
                                            } else {
                                              updateEditBranching(question.localId, optionIndex, value)
                                            }
                                          }}
                                        >
                                          <NativeSelectOption value="__next__">Следующий по порядку</NativeSelectOption>
                                          <NativeSelectOption value="__end__">Завершить опрос</NativeSelectOption>
                                          {branchTargets.map((target) => (
                                            <NativeSelectOption key={target.localId} value={target.localId}>
                                              {target.text?.trim() ? target.text : `Вопрос ${target.order + 1}`}
                                            </NativeSelectOption>
                                          ))}
                                        </NativeSelect>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-[#94a3b8]">
                                  Добавьте еще вопросы, чтобы настроить ветвление.
                                </p>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  )
                })}

                {!editQuestions.length && (
                  <div className="rounded-2xl border border-dashed border-[#cbd5e1] p-4 text-sm text-[#64748b]">
                    Добавьте первый вопрос, чтобы сохранить опрос.
                  </div>
                )}
              </div>

              {editError && <p className="text-sm text-red-600">{editError}</p>}
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setEditSurveyId(null)}>
              Отмена
            </Button>
            <Button
              className="bg-[#1b2538] text-white hover:bg-[#28324a]"
              onClick={handleSaveSurvey}
              disabled={isSavingSurvey || !editTitle.trim() || !surveyDetail}
            >
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DashboardPage
