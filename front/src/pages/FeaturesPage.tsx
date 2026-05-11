import { ArrowUpRight } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'

import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card } from '@src/shared/ui/card'
import { featuresHighlights } from '@src/shared/constants/content'
import type { ModalType } from '@src/features/auth/AuthModals'

export const FeaturesPage = () => {
  const { openModal } = useOutletContext<{ openModal: (type: ModalType) => void }>()

  return (
    <div className="space-y-10 pb-16">
      <section className="rounded-[28px] border border-[#e2e8f0] bg-white/80 p-6 sm:p-8">
        <Badge className="bg-[#1b2538] text-white">Возможности</Badge>
        <h1 className="mt-4 text-3xl font-semibold text-[#0f172a] sm:text-4xl">
          Все инструменты для живых опросов в одном пространстве
        </h1>
        <p className="mt-3 text-[#64748b]">
          МедУчет заменяет презентации, формы и чат единым сценарием, где ведущий управляет процессом,
          а участники отвечают синхронно.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            className="w-full bg-[#1b2538] text-white hover:bg-[#28324a] sm:w-auto"
            onClick={() => openModal('create')}
          >
            Создать сценарий
          </Button>
          <Button
            variant="outline"
            className="w-full border-[#1b2538]/20 text-[#1b2538] sm:w-auto"
            onClick={() => openModal('demo')}
          >
            Посмотреть демо
            <ArrowUpRight className="ml-2 size-4" />
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featuresHighlights.map((item) => (
          <Card key={item.title} className="border border-[#e2e8f0] bg-white/90 p-5">
            <h3 className="text-lg font-semibold text-[#0f172a]">{item.title}</h3>
            <p className="mt-2 text-sm text-[#64748b]">{item.description}</p>
          </Card>
        ))}
      </section>
    </div>
  )
}

export default FeaturesPage
