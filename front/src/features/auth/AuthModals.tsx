import { CalendarClock, FileDown, LogIn, Sparkles, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@src/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@src/shared/ui/dialog'
import { Input } from '@src/shared/ui/input'
import { Textarea } from '@src/shared/ui/textarea'
import { NativeSelect, NativeSelectOption } from '@src/shared/ui/native-select'
import { routes } from '@src/app/constants/routes'
import { cn } from '@src/shared/utils/cn'
import { login, register } from '@src/shared/api/auth'
import { setAuthToken } from '@src/shared/constants/auth'
import { joinSession, createSession, controlSession } from '@src/shared/api/sessions'
import {
  addSurveyQuestion,
  createSurvey,
  listSurveys,
  updateSurveyQuestion,
  type SurveyQuestionType,
} from '@src/shared/api/surveys'
import { getTemplate, listTemplates, type TemplateSnapshot } from '@src/shared/api/templates'
import { exportSurveyAnalytics, getSurveyAnalytics } from '@src/shared/api/analytics'
import { QUERY_KEYS } from '@src/shared/constants/api'

export type ModalType =
  | 'login'
  | 'register'
  | 'reset'
  | 'join'
  | 'create'
  | 'demo'
  | 'export'
  | 'templates'

type AuthModalsProps = {
  active: ModalType | null
  onClose: () => void
  onSwitch: (type: ModalType) => void
  onAuthSuccess?: () => void
}

type QuestionDraft = {
  id: string
  type: SurveyQuestionType
  text: string
  options: string[]
  branching?: Record<number, string | null>
}

type TemplateDraft = {
  title?: string
  description?: string
  questions?: QuestionDraft[]
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

export const AuthModals = ({ active, onClose, onSwitch, onAuthSuccess }: AuthModalsProps) => {
  const navigate = useNavigate()
  const isOpen = active !== null
  const [selectedExport, setSelectedExport] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinName, setJoinName] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [createTitle, setCreateTitle] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createRequireName, setCreateRequireName] = useState(false)
  const [questions, setQuestions] = useState<QuestionDraft[]>([])
  const [templateDraft, setTemplateDraft] = useState<TemplateDraft | null>(null)
  const [isTemplateLoading, setIsTemplateLoading] = useState(false)
  const [createdSessionCode, setCreatedSessionCode] = useState<string | null>(null)
  const [createdSessionLink, setCreatedSessionLink] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: templates } = useQuery({
    queryKey: [QUERY_KEYS.templates.list],
    queryFn: listTemplates,
    retry: false,
    enabled: active === 'templates',
  })
  const { data: exportSurveys } = useQuery({
    queryKey: [QUERY_KEYS.surveys.list],
    queryFn: listSurveys,
    retry: false,
    enabled: active === 'export',
  })
  const exportSurvey = exportSurveys?.[0]
  const { data: exportAnalytics } = useQuery({
    queryKey: [QUERY_KEYS.analytics.survey, exportSurvey?.id],
    queryFn: () => getSurveyAnalytics(exportSurvey?.id ?? ''),
    enabled: active === 'export' && Boolean(exportSurvey?.id),
    retry: false,
  })
  void exportAnalytics

  const createQuestionDraft = (overrides?: Partial<QuestionDraft>): QuestionDraft => {
    const fallbackId = `q-${Date.now()}-${Math.random().toString(16).slice(2)}`
    const baseType: SurveyQuestionType = overrides?.type ?? 'choice'
    const typeConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === baseType)
    return {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : fallbackId),
      type: baseType,
      text: '',
      options: typeConfig?.defaultOptions ? [...typeConfig.defaultOptions] : [],
      branching: {},
      ...overrides,
    }
  }

  useEffect(() => {
    if (active !== 'export') {
      setSelectedExport(null)
      setIsExporting(false)
    }
    if (active === 'create') {
      const seededQuestions = templateDraft?.questions?.length ? templateDraft.questions : [createQuestionDraft()]
      setCreateTitle(templateDraft?.title ?? '')
      setCreateDescription(templateDraft?.description ?? '')
      setCreateRequireName(false)
      setQuestions(seededQuestions)
      setCreatedSessionCode(null)
      setCreatedSessionLink(null)
      setCopyStatus(null)
    }
    if (!active) {
      setTemplateDraft(null)
    }
    setErrorMessage(null)
  }, [active, templateDraft])

  const getErrorText = (error: unknown, fallback: string) => {
    const data = (error as { response?: { data?: { message?: unknown } } })?.response?.data
    const message = data?.message
    if (typeof message === 'string' && message.trim()) return message
    if (Array.isArray(message) && message.length > 0) return message.join(', ')
    if (error instanceof Error && error.message) return error.message
    return fallback
  }

  const handleExport = async () => {
    if (!selectedExport) {
      setErrorMessage('Выберите формат экспорта.')
      return
    }
    if (!exportSurvey?.id) {
      setErrorMessage('Нет данных для экспорта.')
      return
    }
    setIsExporting(true)
    setErrorMessage(null)
    try {
      const format = selectedExport === 'excel' ? 'xlsx' : (selectedExport as 'pdf' | 'csv')
      const response = await exportSurveyAnalytics(exportSurvey.id, format)
      const contentDisposition = response.headers?.['content-disposition'] as string | undefined
      const match = contentDisposition?.match(/filename="(.+?)"/i)
      const fallbackName = `meduchet-export.${format}`
      const filename = match?.[1] ?? fallbackName
      const blob = response.data as Blob
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      onClose()
    } finally {
      setIsExporting(false)
    }
  }

  const goDashboard = () => {
    onClose()
    onAuthSuccess?.()
    navigate(routes.dashboard.url())
  }

  const handleLogin = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const data = await login({ email: loginEmail.trim(), password: loginPassword })
      setAuthToken(data.accessToken)
      goDashboard()
    } catch (error) {
      setErrorMessage('Не удалось войти. Проверьте почту и пароль.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const data = await register({
        email: registerEmail.trim(),
        password: registerPassword,
        name: registerName.trim() || undefined,
      })
      setAuthToken(data.accessToken)
      goDashboard()
    } catch (error) {
      setErrorMessage('Не удалось создать аккаунт. Проверьте данные.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const goSession = async () => {
    const code = joinCode.trim()
    if (!code) return
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const participant = await joinSession(code, joinName.trim() || undefined)
      if (participant?.id) {
        localStorage.setItem(`participant:${code}`, participant.id)
      }
      onClose()
      navigate(routes.session.url(code))
    } catch (error) {
      setErrorMessage(getErrorText(error, 'Не удалось войти в комнату. Проверьте код.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateQuestion = (id: string, patch: Partial<QuestionDraft>) => {
    setQuestions((prev) => prev.map((question) => (question.id === id ? { ...question, ...patch } : question)))
  }

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createQuestionDraft()])
  }

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((question) => question.id !== id))
  }

  const updateOption = (id: string, index: number, value: string) => {
    setQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== id) return question
        const nextOptions = [...question.options]
        nextOptions[index] = value
        return { ...question, options: nextOptions }
      }),
    )
  }

  const updateBranching = (id: string, optionIndex: number, target: string | null) => {
    setQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== id) return question
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

  const addOption = (id: string) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === id ? { ...question, options: [...question.options, ''] } : question,
      ),
    )
  }

  const removeOption = (id: string, index: number) => {
    setQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== id) return question
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

  const handleCopyLink = async () => {
    if (!createdSessionLink) return
    try {
      await navigator.clipboard.writeText(createdSessionLink)
      setCopyStatus('Ссылка скопирована.')
    } catch (error) {
      setCopyStatus('Не удалось скопировать. Скопируйте вручную.')
    }
  }

  const handleSelectTemplate = async (templateId: string) => {
    setIsTemplateLoading(true)
    setErrorMessage(null)
    try {
      const template = await getTemplate(templateId)
        const snapshot: TemplateSnapshot = template.snapshot ?? {}
        const snapshotQuestions = Array.isArray(snapshot.questions) ? snapshot.questions : []
        const mappedQuestions = snapshotQuestions.length
          ? snapshotQuestions.map((question, index) => {
              const optionRoutes = (question.settings as any)?.branching?.optionRoutes ?? {}
              const branching: Record<number, string | null> = {}
              Object.entries(optionRoutes).forEach(([key, value]) => {
                branching[Number(key)] = typeof value === 'string' ? value : null
              })
              return createQuestionDraft({
                id: (question as any).localId ?? `q-${index}-${Date.now()}`,
                type: (question.type as SurveyQuestionType) ?? 'choice',
                text: question.text ?? '',
                options: Array.isArray(question.options) ? question.options : [],
                branching,
              })
            })
          : [createQuestionDraft()]

      setTemplateDraft({
        title: snapshot.title ?? template.title,
        description: snapshot.description ?? template.description,
        questions: mappedQuestions,
      })
      onSwitch('create')
    } catch (error) {
      setErrorMessage('Не удалось загрузить шаблон. Попробуйте снова.')
    } finally {
      setIsTemplateLoading(false)
    }
  }

  const handleCreateSession = async () => {
    if (!createTitle.trim()) return
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      setCreatedSessionCode(null)
      setCreatedSessionLink(null)
      setCopyStatus(null)

      const preparedQuestions = questions.map((question) => ({
        ...question,
        text: question.text.trim(),
        options: question.options.map((option) => option.trim()).filter(Boolean),
      }))

      if (!preparedQuestions.length) {
        setErrorMessage('Добавьте хотя бы один вопрос.')
        return
      }

      const invalidQuestion = preparedQuestions.find((question) => {
        const typeConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === question.type)
        if (!question.text) return true
        if (typeConfig?.requiresOptions && question.options.length < 2) return true
        return false
      })

      if (invalidQuestion) {
        setErrorMessage('Заполните текст вопроса и минимум два варианта ответа там, где это нужно.')
        return
      }

      const survey = await createSurvey({
        title: createTitle.trim(),
        description: createDescription.trim() || undefined,
      })

      const idMap = new Map<string, string>()
      for (const [index, question] of preparedQuestions.entries()) {
        const typeConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === question.type)
        const created = await addSurveyQuestion(survey.id, {
          type: question.type,
          text: question.text,
          orderIndex: index,
          options: typeConfig?.requiresOptions ? { items: question.options } : undefined,
        })
        idMap.set(question.id, created.id)
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
        if (Object.keys(settings).length > 0) {
          const questionId = idMap.get(question.id)
          if (questionId) {
            await updateSurveyQuestion(survey.id, questionId, {
              type: question.type,
              text: question.text,
              orderIndex: index,
              options: typeConfig?.requiresOptions ? { items: question.options } : undefined,
              settings,
            })
          }
        }
      }

      const session = await createSession(survey.id, {
        settings: { requireName: createRequireName },
      })
      if (session?.id) {
        await controlSession(session.id, { action: 'start' })
      }
      const code = session?.code ?? ''
      if (!code) {
        throw new Error('Не удалось получить код комнаты')
      }

      const link = `${window.location.origin}${routes.session.url(code)}`
      setCreatedSessionCode(code)
      setCreatedSessionLink(link)
    } catch (error) {
      setErrorMessage(getErrorText(error, 'Не удалось создать комнату. Попробуйте снова.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      {active === 'login' && (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <LogIn className="size-5 text-[#1b2538]" />
              Вход в МедУчет
            </DialogTitle>
            <DialogDescription>
              Введите данные, чтобы управлять комнатами и просматривать аналитику.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1b2538]">Электронная почта</label>
              <Input
                placeholder="name@company.com"
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1b2538]">Пароль</label>
              <Input
                placeholder="Введите пароль"
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
              />
            </div>
            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => onSwitch('reset')}>
              Забыли пароль?
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onSwitch('register')}>
                Регистрация
              </Button>
              <Button
                className="bg-[#1b2538] text-white hover:bg-[#28324a]"
                onClick={handleLogin}
                disabled={isSubmitting}
              >
                Войти
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      )}

      {active === 'register' && (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <UserPlus className="size-5 text-[#1b2538]" />
              Регистрация ведущего
            </DialogTitle>
            <DialogDescription>
              Создайте аккаунт, чтобы запускать живые опросы и управлять участниками.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1b2538]">Имя и роль</label>
              <Input
                placeholder="Анна Смирнова · Преподаватель"
                value={registerName}
                onChange={(event) => setRegisterName(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1b2538]">Электронная почта</label>
              <Input
                placeholder="name@company.com"
                type="email"
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1b2538]">Пароль</label>
              <Input
                placeholder="Минимум 8 символов"
                type="password"
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-[#475569]">
              <input type="checkbox" className="size-4 rounded border-[#cbd5e1]" />
              Принимаю условия обработки данных и правила сервиса
            </label>
            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          </div>
          <DialogFooter className="sm:justify-between">
              <Button variant="ghost" onClick={() => onSwitch('login')}>
                Уже есть аккаунт
              </Button>
            <Button
              className="bg-[#1b2538] text-white hover:bg-[#28324a]"
              onClick={handleRegister}
              disabled={isSubmitting}
            >
              Создать аккаунт
            </Button>
          </DialogFooter>
        </DialogContent>
      )}

      {active === 'reset' && (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="size-5 text-[#1b2538]" />
              Восстановление доступа
            </DialogTitle>
            <DialogDescription>
              Мы отправим ссылку для сброса пароля на вашу почту.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1b2538]">Электронная почта</label>
              <Input placeholder="name@company.com" type="email" />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => onSwitch('login')}>
              Вернуться к входу
            </Button>
            <Button className="bg-[#1b2538] text-white hover:bg-[#28324a]" onClick={onClose}>
              Отправить ссылку
            </Button>
          </DialogFooter>
        </DialogContent>
      )}

      {active === 'join' && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Присоединиться к комнате</DialogTitle>
            <DialogDescription>
              Введите код комнаты или вставьте ссылку, чтобы участвовать синхронно.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1b2538]">Код комнаты</label>
              <Input
                placeholder="PS-7421"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1b2538]">Имя (опционально)</label>
              <Input
                placeholder="Антон"
                value={joinName}
                onChange={(event) => setJoinName(event.target.value)}
              />
            </div>
            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          </div>
          <DialogFooter>
            <Button
              className="bg-[#1b2538] text-white hover:bg-[#28324a]"
              onClick={goSession}
              disabled={isSubmitting || !joinCode.trim()}
            >
              Войти в комнату
            </Button>
          </DialogFooter>
        </DialogContent>
      )}

        {active === 'create' && (
          <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <CalendarClock className="size-5 text-[#1b2538]" />
              Создать новый опрос
            </DialogTitle>
            <DialogDescription>
              Добавьте вопросы, варианты ответов и получите ссылку для участников.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1b2538]">Название опроса</label>
              <Input
                placeholder="Командное ретро Q1"
                value={createTitle}
                onChange={(event) => setCreateTitle(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1b2538]">Описание (опционально)</label>
              <Textarea
                placeholder="Коротко о цели опроса"
                value={createDescription}
                onChange={(event) => setCreateDescription(event.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-[#475569]">
              <input
                type="checkbox"
                className="size-4 rounded border-[#cbd5e1]"
                checked={createRequireName}
                onChange={(event) => setCreateRequireName(event.target.checked)}
              />
              Требовать имя участника при входе
            </label>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#1b2538]">Вопросы</p>
                <Button variant="outline" onClick={addQuestion}>
                  Добавить вопрос
                </Button>
              </div>

                {questions.map((question, index) => {
                  const typeConfig = QUESTION_TYPE_OPTIONS.find((option) => option.value === question.type)
                  const requiresOptions = typeConfig?.requiresOptions ?? false
                  const branchTargets = questions
                    .map((item, order) => ({ ...item, order }))
                    .filter((item) => item.id !== question.id)
                  return (
                    <div key={question.id} className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#0f172a]">Вопрос {index + 1}</p>
                      {questions.length > 1 && (
                        <Button variant="ghost" className="text-[#ef4444]" onClick={() => removeQuestion(question.id)}>
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
                              updateQuestion(question.id, {
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
                          placeholder="Введите формулировку"
                          value={question.text}
                          onChange={(event) => updateQuestion(question.id, { text: event.target.value })}
                        />
                      </div>

                        {requiresOptions && (
                          <div className="grid gap-2">
                            <label className="text-sm font-medium text-[#1b2538]">Варианты ответа</label>
                            <div className="grid gap-2">
                              {question.options.map((option, optionIndex) => (
                              <div key={`${question.id}-option-${optionIndex}`} className="flex items-center gap-2">
                                <Input
                                  placeholder={`Вариант ${optionIndex + 1}`}
                                  value={option}
                                  onChange={(event) =>
                                    updateOption(question.id, optionIndex, event.target.value)
                                  }
                                />
                                <Button
                                  variant="ghost"
                                  className="text-[#ef4444]"
                                  onClick={() => removeOption(question.id, optionIndex)}
                                >
                                  Удалить
                                </Button>
                              </div>
                            ))}
                            </div>
                            <Button variant="outline" onClick={() => addOption(question.id)}>
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
                                      key={`${question.id}-branch-${optionIndex}`}
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
                                            updateBranching(question.id, optionIndex, null)
                                          } else {
                                            updateBranching(question.id, optionIndex, value)
                                          }
                                        }}
                                      >
                                        <NativeSelectOption value="__next__">Следующий по порядку</NativeSelectOption>
                                        <NativeSelectOption value="__end__">Завершить опрос</NativeSelectOption>
                                        {branchTargets.map((target) => (
                                          <NativeSelectOption key={target.id} value={target.id}>
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

              {!questions.length && (
                <div className="rounded-2xl border border-dashed border-[#cbd5e1] p-4 text-sm text-[#64748b]">
                  Добавьте первый вопрос, чтобы собрать опрос.
                </div>
              )}
            </div>

            {createdSessionLink && (
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
                <p className="text-sm font-semibold text-[#0f172a]">Ссылка для участников</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Input readOnly value={createdSessionLink} />
                  <Button variant="outline" onClick={handleCopyLink}>
                    Скопировать
                  </Button>
                </div>
                {copyStatus && <p className="mt-2 text-xs text-[#64748b]">{copyStatus}</p>}
              </div>
            )}

            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => onSwitch('templates')}>
              Выбрать шаблон
            </Button>
            <div className="flex flex-wrap gap-2">
              {createdSessionCode && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose()
                    navigate(routes.session.url(createdSessionCode))
                  }}
                >
                  Открыть комнату
                </Button>
              )}
              <Button
                className="bg-[#1b2538] text-white hover:bg-[#28324a]"
                onClick={handleCreateSession}
                disabled={isSubmitting || !createTitle.trim()}
              >
                Создать и получить ссылку
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      )}

      {active === 'demo' && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Запросить демо</DialogTitle>
            <DialogDescription>
              Оставьте контакт, мы покажем МедУчет в деле.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1b2538]">Имя</label>
              <Input placeholder="Мария" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1b2538]">Почта</label>
              <Input placeholder="name@company.com" type="email" />
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-[#1b2538] text-white hover:bg-[#28324a]" onClick={onClose}>
              Отправить
            </Button>
          </DialogFooter>
        </DialogContent>
      )}

      {active === 'export' && (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <FileDown className="size-5 text-[#1b2538]" />
                Экспорт результатов
              </DialogTitle>
              <DialogDescription>
                Выберите формат отчета. Файлы будут готовы через минуту.
              </DialogDescription>
            </DialogHeader>
            <p className="text-xs text-[#64748b]">Опрос: {exportSurvey?.title ?? '—'}</p>
            <div className="grid gap-3">
            <Button
              variant="outline"
              className={cn(
                'justify-start',
                selectedExport === 'pdf' && 'border-[#1b2538] bg-[#1b2538]/10 text-[#1b2538]',
              )}
              onClick={() => setSelectedExport('pdf')}
            >
              PDF-отчет с графиками
            </Button>
            <Button
              variant="outline"
              className={cn(
                'justify-start',
                selectedExport === 'excel' && 'border-[#1b2538] bg-[#1b2538]/10 text-[#1b2538]',
              )}
              onClick={() => setSelectedExport('excel')}
            >
              Excel-таблица с деталями
            </Button>
            <Button
              variant="outline"
              className={cn(
                'justify-start',
                selectedExport === 'csv' && 'border-[#1b2538] bg-[#1b2538]/10 text-[#1b2538]',
              )}
              onClick={() => setSelectedExport('csv')}
            >
              CSV для BI-систем
            </Button>
            </div>
            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
            <DialogFooter>
              <Button
                className="bg-[#1b2538] text-white hover:bg-[#28324a]"
                onClick={handleExport}
                disabled={isExporting}
              >
                Сформировать экспорт
              </Button>
            </DialogFooter>
        </DialogContent>
      )}

      {active === 'templates' && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Библиотека шаблонов</DialogTitle>
            <DialogDescription>
              Выберите основу и настройте сценарий под аудиторию.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 text-sm text-[#475569]">
            {(templates ?? []).map((template) => (
              <button
                key={template.id}
                type="button"
                className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3 text-left transition hover:border-[#cbd5e1] hover:bg-white"
                onClick={() => handleSelectTemplate(template.id)}
                disabled={isTemplateLoading}
              >
                <p className="text-sm font-semibold text-[#0f172a]">{template.title}</p>
                <p className="mt-1 text-xs text-[#64748b]">
                  Создан {new Date(template.createdAt).toLocaleDateString('ru-RU')}
                </p>
              </button>
            ))}
            {!templates?.length && (
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3 text-sm text-[#64748b]">
                Шаблонов пока нет. Создайте первый во вкладке шаблонов.
              </div>
            )}
          </div>
          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
