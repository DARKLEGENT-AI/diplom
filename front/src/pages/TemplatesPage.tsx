import { useNavigate, useOutletContext } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card } from '@src/shared/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@src/shared/ui/dialog'
import { Input } from '@src/shared/ui/input'
import { Textarea } from '@src/shared/ui/textarea'
import { NativeSelect, NativeSelectOption } from '@src/shared/ui/native-select'
import type { ModalType } from '@src/features/auth/AuthModals'
import { createTemplate, deleteTemplate, getTemplate, listTemplates, type TemplateSnapshot } from '@src/shared/api/templates'
import {
  addSurveyQuestion,
  createSurvey,
  getSurvey,
  listSurveys,
  updateSurveyQuestion,
  type SurveyQuestionType,
} from '@src/shared/api/surveys'
import { createSession, controlSession } from '@src/shared/api/sessions'
import { QUERY_KEYS } from '@src/shared/constants/api'
import { queryClient } from '@src/shared/constants/queryClient'

type QuestionDraft = {
  localId: string
  type: SurveyQuestionType
  text: string
  options: string[]
  settings?: Record<string, unknown>
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
    localId,
    type: baseType,
    text: '',
    options: typeConfig?.defaultOptions ? [...typeConfig.defaultOptions] : [],
    settings: {},
    ...overrides,
  }
}

export const TemplatesPage = () => {
  const { openModal } = useOutletContext<{ openModal: (type: ModalType) => void }>()
  const navigate = useNavigate()
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<'use' | 'delete' | null>(null)
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false)
  const [editTemplateOpen, setEditTemplateOpen] = useState(false)
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editQuestions, setEditQuestions] = useState<QuestionDraft[]>([createQuestionDraft()])
  const [editError, setEditError] = useState<string | null>(null)
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [templateMode, setTemplateMode] = useState<'survey' | 'scratch'>('survey')
  const [templateTitle, setTemplateTitle] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('')
  const [templateQuestions, setTemplateQuestions] = useState<QuestionDraft[]>([createQuestionDraft()])
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [useSurveyTitle, setUseSurveyTitle] = useState('')
  const [isUsingTemplate, setIsUsingTemplate] = useState(false)

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

  const { data: surveyDetail } = useQuery({
    queryKey: [QUERY_KEYS.surveys.get, selectedSurveyId],
    queryFn: () => getSurvey(selectedSurveyId),
    enabled: templateMode === 'survey' && Boolean(selectedSurveyId),
    retry: false,
  })

  const activeTemplate = useMemo(
    () => (templates ?? []).find((template) => template.id === activeTemplateId) ?? null,
    [activeTemplateId, templates],
  )

  useEffect(() => {
    if (templateMode === 'survey' && surveyDetail) {
      setTemplateTitle(surveyDetail.title ?? '')
      setTemplateDescription(surveyDetail.description ?? '')
    }
  }, [templateMode, surveyDetail])

  const handleTemplateQuestionChange = (localId: string, patch: Partial<QuestionDraft>) => {
    setTemplateQuestions((prev) =>
      prev.map((question) => (question.localId === localId ? { ...question, ...patch } : question)),
    )
  }

  const addTemplateQuestion = () => {
    setTemplateQuestions((prev) => [...prev, createQuestionDraft()])
  }

  const removeTemplateQuestion = (localId: string) => {
    setTemplateQuestions((prev) => prev.filter((question) => question.localId !== localId))
  }

  const updateTemplateOption = (localId: string, index: number, value: string) => {
    setTemplateQuestions((prev) =>
      prev.map((question) => {
        if (question.localId !== localId) return question
        const nextOptions = [...question.options]
        nextOptions[index] = value
        return { ...question, options: nextOptions }
      }),
    )
  }

  const addTemplateOption = (localId: string) => {
    setTemplateQuestions((prev) =>
      prev.map((question) =>
        question.localId === localId ? { ...question, options: [...question.options, ''] } : question,
      ),
    )
  }

  const removeTemplateOption = (localId: string, index: number) => {
    setTemplateQuestions((prev) =>
      prev.map((question) => {
        if (question.localId !== localId) return question
        return { ...question, options: question.options.filter((_, optionIndex) => optionIndex !== index) }
      }),
    )
  }

  const resetTemplateForm = () => {
    setTemplateTitle('')
    setTemplateDescription('')
    setSelectedSurveyId('')
    setTemplateQuestions([createQuestionDraft()])
    setTemplateError(null)
  }

  const buildSnapshotFromDraft = (): TemplateSnapshot => {
    const prepared = templateQuestions.map((question) => ({
      localId: question.localId,
      type: question.type,
      text: question.text.trim(),
      options: question.options.map((option) => option.trim()).filter(Boolean),
      settings: question.settings ?? {},
    }))
    return {
      title: templateTitle.trim() || undefined,
      description: templateDescription.trim() || undefined,
      questions: prepared,
    }
  }

  const handleCreateTemplate = async () => {
    setIsSavingTemplate(true)
    setTemplateError(null)
    try {
      if (!templateTitle.trim()) {
        setTemplateError('Введите название шаблона.')
        return
      }

      let snapshot: TemplateSnapshot = { title: templateTitle.trim(), description: templateDescription.trim() || undefined }

      if (templateMode === 'survey') {
        if (!surveyDetail) {
          setTemplateError('Выберите опрос для копирования.')
          return
        }
        snapshot = {
          title: templateTitle.trim(),
          description: templateDescription.trim() || surveyDetail.description || undefined,
          questions:
            surveyDetail.questions?.map((question) => ({
              localId: question.id,
              type: question.type,
              text: question.text,
              options: Array.isArray((question.options as any)?.items)
                ? ((question.options as any).items as string[])
                : [],
              settings: question.settings,
              orderIndex: question.orderIndex,
            })) ?? [],
        }
      }

      if (templateMode === 'scratch') {
        const prepared = buildSnapshotFromDraft()
        const invalidQuestion = (prepared.questions ?? []).find((question) => {
          const typeConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === question.type)
          if (!question.text) return true
          if (typeConfig?.requiresOptions && (question.options?.length ?? 0) < 2) return true
          return false
        })
        if (invalidQuestion) {
          setTemplateError('Заполните текст вопроса и минимум два варианта ответа там, где это нужно.')
          return
        }
        snapshot = prepared
      }

      await createTemplate({
        title: templateTitle.trim(),
        description: templateDescription.trim() || undefined,
        snapshot,
      })

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.templates.list] })
      resetTemplateForm()
      setCreateTemplateOpen(false)
    } catch (error) {
      setTemplateError('Не удалось создать шаблон. Попробуйте снова.')
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const handleUseTemplate = async () => {
    if (!activeTemplateId) return
    setTemplateError(null)
    setIsUsingTemplate(true)
    try {
      const template = await getTemplate(activeTemplateId)
      const snapshot = template.snapshot ?? {}
      const questions = Array.isArray(snapshot.questions) ? snapshot.questions : []
      const normalizedQuestions = questions.map((question, index) => ({
        ...question,
        localId: (question as any).localId ?? `q-${index}-${Date.now()}`,
      }))

      const survey = await createSurvey({
        title: useSurveyTitle.trim() || template.title,
        description: (snapshot.description as string | undefined) ?? template.description,
      })

      const idMap = new Map<string, string>()
      for (const [index, question] of normalizedQuestions.entries()) {
        const type = (question.type as SurveyQuestionType) ?? 'choice'
        const typeConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === type)
        const created = await addSurveyQuestion(survey.id, {
          type,
          text: question.text ?? `Вопрос ${index + 1}`,
          orderIndex: question.orderIndex ?? index,
          options: typeConfig?.requiresOptions
            ? { items: Array.isArray(question.options) ? question.options : [] }
            : undefined,
        })
        idMap.set((question as any).localId, created.id)
      }

      for (const [index, question] of normalizedQuestions.entries()) {
        const type = (question.type as SurveyQuestionType) ?? 'choice'
        const typeConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === type)
        const optionRoutes = (question.settings as any)?.branching?.optionRoutes ?? {}
        const mappedRoutes: Record<string, string> = {}
        Object.entries(optionRoutes).forEach(([key, value]) => {
          if (!value || typeof value !== 'string') return
          if (value === '__end__') {
            mappedRoutes[key] = '__end__'
            return
          }
          const mapped = idMap.get(value)
          if (mapped) {
            mappedRoutes[key] = mapped
          }
        })
        const settings =
          Object.keys(mappedRoutes).length > 0
            ? {
                ...(question.settings ?? {}),
                branching: { optionRoutes: mappedRoutes },
              }
            : (question.settings ?? {})
        if (Object.keys(settings).length > 0) {
          const questionId = idMap.get((question as any).localId)
          if (questionId) {
            await updateSurveyQuestion(survey.id, questionId, {
              type,
              text: question.text ?? `Вопрос ${index + 1}`,
              orderIndex: question.orderIndex ?? index,
              options: typeConfig?.requiresOptions
                ? { items: Array.isArray(question.options) ? question.options : [] }
                : undefined,
              settings,
            })
          }
        }
      }

      const session = await createSession(survey.id)
      if (session?.id) {
        await controlSession(session.id, { action: 'start' })
      }
      closeDialog()
      setUseSurveyTitle('')
      navigate(`/session/${session.code}`)
    } catch (error) {
      setTemplateError('Не удалось создать опрос из шаблона.')
    } finally {
      setIsUsingTemplate(false)
    }
  }

  const handleDeleteTemplate = async () => {
    if (!activeTemplateId) return
    try {
      await deleteTemplate(activeTemplateId)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.templates.list] })
      closeDialog()
    } catch (error) {
      setTemplateError('Не удалось удалить шаблон.')
    }
  }

  const openEditTemplate = async (templateId: string) => {
    setEditError(null)
    setIsEditLoading(true)
    setEditTemplateId(templateId)
    setEditTemplateOpen(true)
    try {
      const template = await getTemplate(templateId)
      const snapshot = template.snapshot ?? {}
      const questions = Array.isArray(snapshot.questions) ? snapshot.questions : []
      setEditTitle(snapshot.title ?? template.title)
      setEditDescription(snapshot.description ?? template.description ?? '')
        if (questions.length) {
          setEditQuestions(
            questions.map((question) =>
              createQuestionDraft({
                localId: (question as any).localId ?? `q-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                type: (question.type as SurveyQuestionType) ?? 'choice',
                text: question.text ?? '',
                options: Array.isArray(question.options) ? question.options : [],
                settings: question.settings ?? {},
              }),
            ),
          )
      } else {
        setEditQuestions([createQuestionDraft()])
      }
    } catch (error) {
      setEditError('Не удалось загрузить шаблон для редактирования.')
    } finally {
      setIsEditLoading(false)
    }
  }

  const handleSaveTemplateEdit = async () => {
    if (!editTemplateId) return
    setIsSavingEdit(true)
    setEditError(null)
    try {
      if (!editTitle.trim()) {
        setEditError('Введите название шаблона.')
        return
      }
        const prepared = editQuestions.map((question) => ({
          localId: question.localId,
          type: question.type,
          text: question.text.trim(),
          options: question.options.map((option) => option.trim()).filter(Boolean),
          settings: question.settings ?? {},
        }))
      const invalidQuestion = prepared.find((question) => {
        const typeConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === question.type)
        if (!question.text) return true
        if (typeConfig?.requiresOptions && (question.options?.length ?? 0) < 2) return true
        return false
      })
      if (invalidQuestion) {
        setEditError('Заполните текст вопроса и минимум два варианта ответа там, где это нужно.')
        return
      }

      await createTemplate({
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        snapshot: {
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
          questions: prepared,
        },
      })
      await deleteTemplate(editTemplateId)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.templates.list] })
      setEditTemplateOpen(false)
      setEditTemplateId(null)
    } catch (error) {
      setEditError('Не удалось сохранить шаблон. Попробуйте снова.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  const closeDialog = () => {
    setActiveAction(null)
    setActiveTemplateId(null)
    setTemplateError(null)
    setUseSurveyTitle('')
  }

  return (
    <div className="space-y-10 pb-16">
      <section className="rounded-[28px] border border-[#e2e8f0] bg-white/80 p-6 sm:p-8">
        <Badge className="bg-[#1b2538] text-white">Шаблоны</Badge>
        <h1 className="mt-4 text-3xl font-semibold text-[#0f172a] sm:text-4xl">
          Готовые сценарии для быстрого запуска
        </h1>
        <p className="mt-3 text-[#64748b]">
          Используйте проверенные шаблоны или создавайте свои, чтобы экономить время на подготовке.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            className="w-full bg-[#1b2538] text-white hover:bg-[#28324a] sm:w-auto"
            onClick={() => {
              resetTemplateForm()
              setCreateTemplateOpen(true)
            }}
          >
            Создать шаблон
          </Button>
          <Button
            variant="outline"
            className="w-full border-[#1b2538]/20 text-[#1b2538] sm:w-auto"
            onClick={() => openModal('templates')}
          >
            Выбрать шаблон для опроса
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(templates ?? []).map((template) => (
          <Card key={template.id} className="border border-[#e2e8f0] bg-white/90 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Библиотека</p>
            <h3 className="mt-3 text-lg font-semibold text-[#0f172a]">{template.title}</h3>
            <p className="mt-2 text-sm text-[#64748b]">
              Создан {new Date(template.createdAt).toLocaleDateString('ru-RU')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                className="bg-[#1b2538] text-white hover:bg-[#28324a]"
                onClick={() => {
                  setTemplateError(null)
                  setUseSurveyTitle(template.title)
                  setActiveTemplateId(template.id)
                  setActiveAction('use')
                }}
              >
                Использовать
              </Button>
              <Button
                variant="outline"
                className="border-[#1b2538]/20 text-[#1b2538]"
                onClick={() => openEditTemplate(template.id)}
              >
                Редактировать
              </Button>
              <Button
                variant="outline"
                className="border-[#ef4444]/40 text-[#ef4444] hover:bg-[#f3f4f6]"
                onClick={() => {
                  setTemplateError(null)
                  setActiveTemplateId(template.id)
                  setActiveAction('delete')
                }}
              >
                Удалить
              </Button>
            </div>
          </Card>
        ))}
        {!templates?.length && (
          <Card className="border border-[#e2e8f0] bg-white/90 p-5 text-sm text-[#64748b]">
            Шаблонов пока нет. Создайте первый.
          </Card>
        )}
      </section>

      <Dialog open={createTemplateOpen} onOpenChange={(open) => (!open ? setCreateTemplateOpen(false) : null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Создать шаблон</DialogTitle>
            <DialogDescription>Сохраните готовый опрос или соберите новый сценарий.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1b2538]">Название шаблона</label>
              <Input
                value={templateTitle}
                onChange={(event) => setTemplateTitle(event.target.value)}
                placeholder="Например, Ретро команды"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1b2538]">Описание (опционально)</label>
              <Textarea
                value={templateDescription}
                onChange={(event) => setTemplateDescription(event.target.value)}
                placeholder="Коротко о назначении шаблона"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1b2538]">Источник</label>
              <NativeSelect
                value={templateMode}
                onChange={(event) => {
                  const nextMode = event.target.value as 'survey' | 'scratch'
                  setTemplateMode(nextMode)
                  if (nextMode === 'scratch' && !templateQuestions.length) {
                    setTemplateQuestions([createQuestionDraft()])
                  }
                }}
              >
                <NativeSelectOption value="survey">Существующий опрос</NativeSelectOption>
                <NativeSelectOption value="scratch">Создать с нуля</NativeSelectOption>
              </NativeSelect>
            </div>

            {templateMode === 'survey' && (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#1b2538]">Выберите опрос</label>
                <NativeSelect value={selectedSurveyId} onChange={(event) => setSelectedSurveyId(event.target.value)}>
                  <NativeSelectOption value="">Выберите опрос</NativeSelectOption>
                  {(surveys ?? []).map((survey) => (
                    <NativeSelectOption key={survey.id} value={survey.id}>
                      {survey.title}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            )}

            {templateMode === 'scratch' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1b2538]">Вопросы</p>
                  <Button variant="outline" onClick={addTemplateQuestion}>
                    Добавить вопрос
                  </Button>
                </div>

                {templateQuestions.map((question, index) => {
                  const typeConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === question.type)
                  const requiresOptions = typeConfig?.requiresOptions ?? false
                  return (
                    <div key={question.localId} className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#0f172a]">Вопрос {index + 1}</p>
                        {templateQuestions.length > 1 && (
                          <Button
                            variant="ghost"
                            className="text-[#ef4444]"
                            onClick={() => removeTemplateQuestion(question.localId)}
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
                              handleTemplateQuestionChange(question.localId, {
                                type: nextType,
                                options: nextConfig?.defaultOptions ? [...nextConfig.defaultOptions] : [],
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
                            onChange={(event) => handleTemplateQuestionChange(question.localId, { text: event.target.value })}
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
                                    onChange={(event) => updateTemplateOption(question.localId, optionIndex, event.target.value)}
                                    placeholder={`Вариант ${optionIndex + 1}`}
                                  />
                                  <Button
                                    variant="ghost"
                                    className="text-[#ef4444]"
                                    onClick={() => removeTemplateOption(question.localId, optionIndex)}
                                  >
                                    Удалить
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <Button variant="outline" onClick={() => addTemplateOption(question.localId)}>
                              Добавить вариант
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {!templateQuestions.length && (
                  <div className="rounded-2xl border border-dashed border-[#cbd5e1] p-4 text-sm text-[#64748b]">
                    Добавьте первый вопрос, чтобы сохранить шаблон.
                  </div>
                )}
              </div>
            )}

            {templateError && <p className="text-sm text-red-600">{templateError}</p>}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setCreateTemplateOpen(false)}>
              Отмена
            </Button>
            <Button
              className="bg-[#1b2538] text-white hover:bg-[#28324a]"
              onClick={handleCreateTemplate}
              disabled={isSavingTemplate}
            >
              Сохранить шаблон
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editTemplateOpen} onOpenChange={(open) => (!open ? setEditTemplateOpen(false) : null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Редактировать шаблон</DialogTitle>
            <DialogDescription>Сохранение перезапишет текущий шаблон.</DialogDescription>
          </DialogHeader>
          {isEditLoading ? (
            <div className="text-sm text-[#64748b]">Загрузка шаблона...</div>
          ) : (
            <div className="grid gap-6">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#1b2538]">Название шаблона</label>
                <Input
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  placeholder="Название шаблона"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#1b2538]">Описание (опционально)</label>
                <Textarea
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  placeholder="Коротко о назначении шаблона"
                />
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1b2538]">Вопросы</p>
                  <Button variant="outline" onClick={() => setEditQuestions((prev) => [...prev, createQuestionDraft()])}>
                    Добавить вопрос
                  </Button>
                </div>

                {editQuestions.map((question, index) => {
                  const typeConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === question.type)
                  const requiresOptions = typeConfig?.requiresOptions ?? false
                  return (
                    <div key={question.localId} className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#0f172a]">Вопрос {index + 1}</p>
                        {editQuestions.length > 1 && (
                          <Button
                            variant="ghost"
                            className="text-[#ef4444]"
                            onClick={() =>
                              setEditQuestions((prev) => prev.filter((item) => item.localId !== question.localId))
                            }
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
                              setEditQuestions((prev) =>
                                prev.map((item) =>
                                  item.localId === question.localId
                                    ? {
                                        ...item,
                                        type: nextType,
                                        options: nextConfig?.defaultOptions ? [...nextConfig.defaultOptions] : [],
                                      }
                                    : item,
                                ),
                              )
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
                            onChange={(event) =>
                              setEditQuestions((prev) =>
                                prev.map((item) =>
                                  item.localId === question.localId ? { ...item, text: event.target.value } : item,
                                ),
                              )
                            }
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
                                    onChange={(event) =>
                                      setEditQuestions((prev) =>
                                        prev.map((item) => {
                                          if (item.localId !== question.localId) return item
                                          const nextOptions = [...item.options]
                                          nextOptions[optionIndex] = event.target.value
                                          return { ...item, options: nextOptions }
                                        }),
                                      )
                                    }
                                    placeholder={`Вариант ${optionIndex + 1}`}
                                  />
                                  <Button
                                    variant="ghost"
                                    className="text-[#ef4444]"
                                    onClick={() =>
                                      setEditQuestions((prev) =>
                                        prev.map((item) => {
                                          if (item.localId !== question.localId) return item
                                          return {
                                            ...item,
                                            options: item.options.filter((_, idx) => idx !== optionIndex),
                                          }
                                        }),
                                      )
                                    }
                                  >
                                    Удалить
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <Button
                              variant="outline"
                              onClick={() =>
                                setEditQuestions((prev) =>
                                  prev.map((item) =>
                                    item.localId === question.localId
                                      ? { ...item, options: [...item.options, ''] }
                                      : item,
                                  ),
                                )
                              }
                            >
                              Добавить вариант
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {!editQuestions.length && (
                  <div className="rounded-2xl border border-dashed border-[#cbd5e1] p-4 text-sm text-[#64748b]">
                    Добавьте первый вопрос, чтобы сохранить шаблон.
                  </div>
                )}
              </div>

              {editError && <p className="text-sm text-red-600">{editError}</p>}
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setEditTemplateOpen(false)}>
              Отмена
            </Button>
            <Button
              className="bg-[#1b2538] text-white hover:bg-[#28324a]"
              onClick={handleSaveTemplateEdit}
              disabled={isSavingEdit || isEditLoading}
            >
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(activeAction)} onOpenChange={(open) => (!open ? closeDialog() : null)}>
        {activeAction === 'use' && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">Использовать шаблон</DialogTitle>
              <DialogDescription>
                {activeTemplate ? `«${activeTemplate.title}» будет развернут как новый опрос.` : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#1b2538]">Название опроса</label>
                <Input
                  placeholder="Например, Ретро команды"
                  value={useSurveyTitle}
                  onChange={(event) => setUseSurveyTitle(event.target.value)}
                />
              </div>
            </div>
            {templateError && <p className="text-sm text-red-600">{templateError}</p>}
            <DialogFooter>
              <Button
                className="bg-[#1b2538] text-white hover:bg-[#28324a]"
                onClick={handleUseTemplate}
                disabled={isUsingTemplate}
              >
                Создать опрос
              </Button>
            </DialogFooter>
          </DialogContent>
        )}

        {activeAction === 'delete' && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">Удалить шаблон?</DialogTitle>
              <DialogDescription>
                {activeTemplate ? `Шаблон «${activeTemplate.title}» будет удален.` : ''}
              </DialogDescription>
            </DialogHeader>
            {templateError && <p className="text-sm text-red-600">{templateError}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Отмена
              </Button>
              <Button className="bg-[#ef4444] text-white hover:bg-[#dc2626]" onClick={handleDeleteTemplate}>
                Удалить
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

export default TemplatesPage
