import { ArrowRight, PlayCircle } from 'lucide-react'

import { Button } from '@src/shared/ui/button'
import { Card } from '@src/shared/ui/card'
import { Badge } from '@src/shared/ui/badge'
import { heroMetrics } from '@src/shared/constants/content'

type HeroSectionProps = {
  onCreateSession?: () => void
  onWatchDemo?: () => void
  onJoinSession?: () => void
}

export const HeroSection = ({ onCreateSession, onWatchDemo, onJoinSession }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-gradient-to-br from-[#f7f2ea] via-[#f4f8f2] to-[#eaf3f5] px-5 py-10 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] animate-in fade-in slide-in-from-bottom-4 duration-700 sm:px-12 sm:py-14">
      <div className="pointer-events-none absolute -left-24 top-10 size-64 rounded-full bg-[#f6c89b]/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-6 size-72 rounded-full bg-[#9fd3c7]/40 blur-3xl" />

      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Badge className="bg-white/80 text-[#1f2a44] shadow-sm">МедУчет · Live Polling</Badge>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-[#1b2538] sm:text-5xl lg:text-6xl">
              Живые опросы, которые ведут аудиторию за собой.
            </h1>
            <p className="text-lg text-[#3a4658] sm:text-xl">
              МедУчет объединяет конструктор опросов, управление комнатой и аналитику в одном
              пространстве. Создавайте сценарии за минуты, запускайте синхронные опросы и
              мгновенно визуализируйте результаты на экране.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              className="h-11 w-full bg-[#1b2538] text-white hover:bg-[#28324a] sm:w-auto"
              onClick={onCreateSession}
            >
              Создать первую комнату
              <ArrowRight className="ml-1 size-4" />
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full border-[#1b2538]/20 text-[#1b2538] sm:w-auto"
              onClick={onWatchDemo}
            >
              <PlayCircle className="mr-1 size-4" />
              Смотреть демо
            </Button>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-[#415067]">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="space-y-1">
                <p className="text-2xl font-semibold text-[#1b2538]">{metric.value}</p>
                <p>{metric.label}</p>
              </div>
            ))}
          </div>


        </div>

        <Card className="border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-[#7b8798]">Быстрое подключение</p>
              <h3 className="text-2xl font-semibold text-[#1b2538]">Войдите в комнату за 10 секунд</h3>
              <p className="text-sm text-[#546073]">
                Участники подключаются по ссылке или коду, отвечают синхронно и видят результаты
                сразу после отправки.
              </p>
            </div>

            <Button
              className="w-full bg-[#1b2538] text-white hover:bg-[#28324a]"
              onClick={onJoinSession}
            >
              Присоединиться
            </Button>

            <div className="grid gap-3 rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4 text-sm">
              <p className="text-[#1b2538]">Ведущий управляет темпом:</p>
              <ul className="grid gap-2 text-[#546073]">
                <li>• Таймеры и автопереходы</li>
                <li>• Встроенные шаблоны сценариев</li>
                <li>• Реакции и вопросы из чата</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
