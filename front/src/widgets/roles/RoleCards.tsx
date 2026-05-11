import { ArrowUpRight } from 'lucide-react'

import { Card } from '@src/shared/ui/card'
import { Button } from '@src/shared/ui/button'
import { roleCards } from '@src/shared/constants/content'

type RoleCardsProps = {
  onCreateSession?: () => void
  onJoinSession?: () => void
}

export const RoleCards = ({ onCreateSession, onJoinSession }: RoleCardsProps) => {
  return (
    <section className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 lg:grid-cols-2">
      {roleCards.map((role, index) => {
        const Icon = role.icon
        const action = index === 0 ? onCreateSession : onJoinSession
        return (
          <Card
            key={role.title}
            className="group relative overflow-hidden border border-[#e2e8f0] bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-[#f1f5f9] transition group-hover:scale-110" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#94a3b8]">Роль</p>
                  <h3 className="text-2xl font-semibold text-[#1b2538]">{role.title}</h3>
                </div>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#1b2538] text-white">
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="text-[#4b5563]">{role.tagline}</p>
              <ul className="grid gap-2 text-sm text-[#475569]">
                {role.bullets.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="mt-2 w-full border-[#1b2538]/20 text-[#1b2538]"
                onClick={action}
              >
                {role.cta}
                <ArrowUpRight className="ml-1 size-4" />
              </Button>
            </div>
          </Card>
        )
      })}
    </section>
  )
}
