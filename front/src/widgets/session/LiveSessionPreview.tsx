import { Signal, Users } from 'lucide-react'

import { Card } from '@src/shared/ui/card'
import { Progress } from '@src/shared/ui/progress'
import { liveSessionPreview } from '@src/shared/constants/content'

export const LiveSessionPreview = () => {
  return (
    <section className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="border border-[#e2e8f0] bg-[#0f172a] p-6 text-white shadow-xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span className="rounded-full border border-white/30 px-3 py-1">Комната {liveSessionPreview.code}</span>
            <span className="flex items-center gap-2">
              <Signal className="size-4" />
              Live
            </span>
          </div>
          <h3 className="text-2xl font-semibold">{liveSessionPreview.question}</h3>
          <div className="space-y-3">
            {liveSessionPreview.options.map((option) => (
              <div key={option.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{option.label}</span>
                  <span>{option.value}%</span>
                </div>
                <Progress value={option.value} className="h-2 bg-white/10" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Ответов: {liveSessionPreview.responses}</span>
            <span className="flex items-center gap-2">
              <Users className="size-4" />
              {liveSessionPreview.participants} участников
            </span>
          </div>
          <p className="text-xs text-white/50">Обновлено в {liveSessionPreview.updatedAt}</p>
        </div>
      </Card>

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Комната в реальном времени</p>
        <h2 className="text-3xl font-semibold text-[#1b2538] sm:text-4xl">
          Управляйте опросом в реальном времени.
        </h2>
        <p className="text-[#4b5563]">
          Ведущий видит входящие ответы, реакцию аудитории и может в любой момент
          переключиться на следующий вопрос или запустить живое обсуждение.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="border border-[#e2e8f0] bg-white/80 p-4">
            <p className="text-sm font-semibold text-[#1b2538]">Реакции в моменте</p>
            <p className="mt-2 text-3xl font-semibold text-[#1b2538]">{liveSessionPreview.reactions}</p>
            <p className="text-xs text-[#94a3b8]">за последние 2 минуты</p>
          </Card>
          <Card className="border border-[#e2e8f0] bg-white/80 p-4">
            <p className="text-sm font-semibold text-[#1b2538]">Темп вопросов</p>
            <p className="mt-2 text-3xl font-semibold text-[#1b2538]">90 сек</p>
            <p className="text-xs text-[#94a3b8]">средний тайминг</p>
          </Card>
        </div>
      </div>
    </section>
  )
}
