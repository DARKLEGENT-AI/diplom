import { Card } from '@src/shared/ui/card'
import { featureHighlights } from '@src/shared/constants/content'

export const FeatureGrid = () => {
  return (
    <section id="features" className="space-y-6 scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Почему МедУчет</p>
        <h2 className="text-3xl font-semibold text-[#111827] sm:text-4xl">
          Управляйте живыми опросами, а не инструментами.
        </h2>
        <p className="text-[#475569]">
          Платформа заменяет презентации, формы и мессенджеры единым сценарием. Синхронная
          работа, гибкие настройки и глубокая аналитика — в одном интерфейсе.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featureHighlights.map((feature) => {
          const Icon = feature.icon
          return (
            <Card
              key={feature.title}
              className="flex h-full flex-col gap-3 border border-[#e2e8f0] bg-white/80 p-5"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#1b2538]">
                <Icon className="size-5" />
              </span>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#1b2538]">{feature.title}</h3>
                <p className="text-sm text-[#536071]">{feature.description}</p>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
