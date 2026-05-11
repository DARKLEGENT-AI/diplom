import { ArrowRight } from 'lucide-react'

import { Button } from '@src/shared/ui/button'
import { Card } from '@src/shared/ui/card'

type ReadySectionProps = {
  onStart?: () => void
}

export const ReadySection = ({ onStart }: ReadySectionProps) => {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#e2e8f0] bg-[#0f172a] px-5 py-10 text-white animate-in fade-in slide-in-from-bottom-4 duration-700 sm:px-8 sm:py-12">
      <div className="pointer-events-none absolute -top-16 right-10 size-48 rounded-full bg-[#38bdf8]/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 size-56 rounded-full bg-[#f97316]/20 blur-3xl" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">Готовы начать?</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Проведите следующую комнату без лишних инструментов.
          </h2>
          <p className="text-white/70">
            Подготовьте сценарий, пригласите аудиторию и управляйте диалогом в одном окне.
          </p>
        </div>

        <Card className="border border-white/10 bg-white/10 p-6 text-white">
          <div className="space-y-4">
            <p className="text-sm text-white/70">Что включено в стартовый план</p>
            <ul className="grid gap-2 text-sm">
              <li>• До 300 участников в одной комнате</li>
              <li>• 9 типов вопросов и логика ветвления</li>
              <li>• Экспорт PDF, Excel, CSV</li>
              <li>• Поддержка в чате 24/7</li>
            </ul>
            <Button className="w-full bg-white text-[#0f172a] hover:bg-white/90" onClick={onStart}>
              Запустить МедУчет
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}
