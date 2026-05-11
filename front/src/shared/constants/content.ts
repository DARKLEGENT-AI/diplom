import {
  BarChart3,
  FileDown,
  LayoutGrid,
  MessageCircleMore,
  QrCode,
  ShieldCheck,
  Sparkles,
  Timer,
  Wand2,
  Webhook,
} from 'lucide-react'

export const heroMetrics = [
  { label: 'Средняя вовлеченность', value: '86%' },
  { label: 'Комнаты в день', value: '120+' },
  { label: 'Типы вопросов', value: '9' },
]

export const trustedBy: string[] = []

export const featureHighlights = [
  {
    icon: Sparkles,
    title: 'Интерактивные форматы',
    description: 'Быстрые голосования, рейтинги, шкалы и открытые ответы в одном сценарии.',
  },
  {
    icon: Timer,
    title: 'Таймеры и темп',
    description: 'Управляйте динамикой комнаты с таймерами и автопереходами.',
  },
  {
    icon: Webhook,
    title: 'Логика ветвления',
    description: 'Персонализируйте маршрут опроса в зависимости от ответов.',
  },
  {
    icon: BarChart3,
    title: 'Аналитика в моменте',
    description: 'Смотрите распределение ответов и динамику вовлеченности в реальном времени.',
  },
  {
    icon: FileDown,
    title: 'Экспорт отчетов',
    description: 'PDF, Excel и CSV для отчетности и интеграций.',
  },
  {
    icon: ShieldCheck,
    title: 'Контроль доступа',
    description: 'Коды доступа, приватные комнаты и списки участников.',
  },
]

export const roleCards = [
  {
    title: 'Автор / администратор',
    tagline: 'Создавайте сценарии и управляйте динамикой аудитории.',
    icon: Wand2,
    bullets: [
      'Конструктор вопросов с логикой ветвления',
      'Настройка таймеров и дизайна комнаты',
      'Библиотека шаблонов и повторное использование',
      'Запуск и контроль в реальном времени',
    ],
    cta: 'Создать опрос',
  },
  {
    title: 'Участник',
    tagline: 'Подключение за 10 секунд, ответы синхронно со всеми.',
    icon: QrCode,
    bullets: [
      'Вход по ссылке или коду комнаты',
      'Ответы с любого устройства',
      'Мгновенные результаты на экране',
      'Анонимный или именной режим',
    ],
    cta: 'Войти в комнату',
  },
]

export const questionTypes = [
  {
    value: 'choice',
    title: 'Один вариант',
    description: 'Классические голосования для быстрых решений.',
    sample: ['Да', 'Нет', 'Нужно обсудить'],
  },
  {
    value: 'scale',
    title: 'Шкала/рейтинг',
    description: 'Измеряйте настроение или уверенность группы.',
    sample: ['1', '2', '3', '4', '5'],
  },
  {
    value: 'matrix',
    title: 'Матрица',
    description: 'Собирайте оценки нескольких аспектов сразу.',
    sample: ['Скорость', 'Глубина', 'Практика', 'Полезность'],
  },
]

export const liveSessionPreview = {
  code: 'PS-7421',
  question: 'Что для вас самое ценное в сегодняшнем занятии?',
  options: [
    { label: 'Разбор кейсов', value: 46 },
    { label: 'Практические задания', value: 32 },
    { label: 'Обратная связь', value: 22 },
  ],
  responses: 168,
  participants: 194,
  reactions: 28,
  updatedAt: '12:42',
}

export const analyticsSnapshot = [
  { label: 'Ответили', value: '148', delta: '+8 за минуту' },
  { label: 'Среднее время ответа', value: '18 сек', delta: '-3 сек' },
  { label: 'Полные ответы', value: '92%', delta: '+2%' },
  { label: 'Мгновенные реакции', value: '24', delta: '+6' },
]

export const exportFormats = [
  { title: 'PDF-отчет', description: 'Слайды с графиками и выводами.' },
  { title: 'Excel-таблица', description: 'Детальные ответы по участникам.' },
  { title: 'CSV-выгрузка', description: 'Интеграции с BI и HR-системами.' },
]

export const templateLibrary = [
  { title: 'Разминка перед стартом', usage: 'Лекции и тренинги', questions: 6 },
  { title: 'Опрос обратной связи', usage: 'Командные ретро', questions: 9 },
  { title: 'Оценка вовлеченности', usage: 'HR-опросы', questions: 12 },
  { title: 'Мозговой штурм', usage: 'Стратегические опросы', questions: 7 },
]

export const adminTools = [
  {
    icon: LayoutGrid,
    title: 'Библиотека шаблонов',
    description: 'Сохраняйте сценарии и масштабируйте обучение.',
  },
  {
    icon: MessageCircleMore,
    title: 'Живой чат',
    description: 'Собирайте вопросы аудитории и отвечайте в комнате.',
  },
]

export const builderSteps = [
  {
    title: 'Сценарий и структура',
    description: 'Соберите вопросы в логические блоки и задайте порядок.',
  },
  {
    title: 'Ветвления и условия',
    description: 'Настройте переходы на основе ответов и ролей.',
  },
  {
    title: 'Таймеры и оформление',
    description: 'Добавьте тайминги, брендинг и визуальные акценты.',
  },
]

export const featuresHighlights = [
  {
    title: 'Дизайнер сценариев',
    description: 'Конструктор опросов с ветвлениями, таймерами и готовыми блоками.',
  },
  {
    title: 'Комнаты в реальном времени',
    description: 'Запускайте комнаты и управляйте темпом обсуждения.',
  },
  {
    title: 'Аналитика и экспорт',
    description: 'Сводные отчеты и выгрузки в нужном формате.',
  },
  {
    title: 'Библиотека шаблонов',
    description: 'Сохраняйте лучшие сценарии и делитесь ими с командой.',
  },
  {
    title: 'Контроль доступа',
    description: 'Коды комнат и приватные комнаты для защищенных встреч.',
  },
  {
    title: 'Гибкие типы вопросов',
    description: 'Один вариант, шкала, матрица и открытые ответы.',
  },
]

export const activityFeed = [
  { id: '1', title: 'Запущена новая комната', description: 'Ретро команды «Спринт 12».', time: '12:40' },
  { id: '2', title: 'Экспорт готов', description: 'PDF-отчет по опросу «Пульс».', time: '12:18' },
  { id: '3', title: 'Обновлен шаблон', description: '«Оценка вовлеченности» сохранен.', time: '11:55' },
  { id: '4', title: 'Завершен опрос', description: 'Собрано 142 ответа.', time: '11:40' },
  { id: '5', title: 'Добавлен таймер', description: '15 минут на обсуждение блока.', time: '11:05' },
]

export const exportQueue = [
  { id: '1', title: 'PDF-отчет', status: 'Готов', createdAt: '12:05' },
  { id: '2', title: 'Excel-таблица', status: 'В очереди', createdAt: '11:50' },
  { id: '3', title: 'CSV-выгрузка', status: 'Готов', createdAt: '11:30' },
]
