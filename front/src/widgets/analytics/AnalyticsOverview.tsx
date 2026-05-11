import { Download, LineChart } from 'lucide-react'

import { Card } from '@src/shared/ui/card'
import { Button } from '@src/shared/ui/button'
import { analyticsSnapshot, exportFormats } from '@src/shared/constants/content'

type AnalyticsOverviewProps = {
  onExport?: () => void
}

export const AnalyticsOverview = ({ onExport }: AnalyticsOverviewProps) => {
  return (
    <section
      id="analytics"
      className="space-y-6 scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Аналитика</p>
          <h2 className="text-3xl font-semibold text-[#1b2538] sm:text-4xl">
            Все результаты — сразу после комнаты.
          </h2>
        </div>
        <Button
          className="w-full bg-[#1b2538] text-white hover:bg-[#28324a] sm:w-auto"
          onClick={onExport}
        >
          <Download className="mr-2 size-4" />
          Экспортировать отчет
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analyticsSnapshot.map((item) => (
          <Card key={item.label} className="border border-[#e2e8f0] bg-white/85 p-4">
            <p className="text-sm text-[#94a3b8]">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#1b2538]">{item.value}</p>
            <p className="text-xs text-[#4b5563]">{item.delta}</p>
          </Card>
        ))}
      </div>

      <Card className="border border-[#e2e8f0] bg-white/90 p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-[#64748b]">
              <LineChart className="size-4" />
              Динамика вовлеченности
            </div>
            <h3 className="text-xl font-semibold text-[#1b2538]">Глубина ответов растет</h3>
            <p className="text-sm text-[#4b5563]">
              В реальном времени видно, насколько аудитория включена, и где нужно замедлить темп.
            </p>
          </div>
          <div className="grid min-w-0 gap-3 sm:min-w-[220px]">
            {exportFormats.map((format) => (
              <div key={format.title} className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                <p className="text-sm font-semibold text-[#1b2538]">{format.title}</p>
                <p className="text-xs text-[#64748b]">{format.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  )
}
