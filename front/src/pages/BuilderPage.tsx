import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'

import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card } from '@src/shared/ui/card'
import { builderSteps } from '@src/shared/constants/content'
import type { ModalType } from '@src/features/auth/AuthModals'

export const BuilderPage = () => {
  const { openModal } = useOutletContext<{ openModal: (type: ModalType) => void }>()

  return (
    <div className="space-y-10 pb-16">
      <section className="rounded-[28px] border border-[#e2e8f0] bg-white/80 p-6 sm:p-8">
        <Badge className="bg-[#1b2538] text-white">Конструктор</Badge>
        <h1 className="mt-4 text-3xl font-semibold text-[#0f172a] sm:text-4xl">
          Конструктор опросов, который понимает логику комнаты
        </h1>
        <p className="mt-3 text-[#64748b]">
          Добавляйте вопросы, таймеры, переходы и дизайн, чтобы вести аудиторию по сценарию.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {builderSteps.map((step) => (
          <Card key={step.title} className="border border-[#e2e8f0] bg-white/90 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 size-5 text-[#1b2538]" />
              <div>
                <h3 className="text-lg font-semibold text-[#0f172a]">{step.title}</h3>
                <p className="mt-2 text-sm text-[#64748b]">{step.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-4 rounded-[24px] border border-[#e2e8f0] bg-[#0f172a] p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">Быстрый старт</p>
          <h2 className="mt-2 text-2xl font-semibold">Соберите опрос за 7 минут</h2>
        </div>
        <Button
          className="w-full bg-white text-[#0f172a] hover:bg-white/90 sm:w-auto"
          onClick={() => openModal('create')}
        >
          Открыть конструктор
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </section>
    </div>
  )
}

export default BuilderPage
