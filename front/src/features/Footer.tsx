import { Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@src/shared/utils/cn'
import { Button } from '@src/shared/ui/button'
import { routes } from '@src/app/constants/routes'

type FooterProps = {
  className?: string
  onDemo?: () => void
}

export const Footer = ({ className, onDemo }: FooterProps) => {
  return (
    <footer className={cn('mt-12 border-t border-[#e2e8f0] py-10', className)}>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3">
          <p className="text-lg font-semibold text-[#1b2538]">МедУчет</p>
          <p className="text-sm text-[#64748b]">
            Единая платформа для проведения живых опросов и интерактивных комнат.
          </p>
        </div>
        <div className="space-y-2 text-sm text-[#475569]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Продукт</p>
          <Link className="block transition hover:text-[#1b2538]" to={routes.features.url()}>
            Возможности
          </Link>
          <Link className="block transition hover:text-[#1b2538]" to={routes.analytics.url()}>
            Аналитика
          </Link>
          <Link className="block transition hover:text-[#1b2538]" to={routes.templates.url()}>
            Шаблоны
          </Link>
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Связаться</p>
          <div className="flex items-center gap-2 text-sm text-[#475569]">
            <Mail className="size-4" />
            hello@meduchet.io
          </div>
          <div className="flex items-center gap-2 text-sm text-[#475569]">
            <Phone className="size-4" />
            +7 (800) 555-30-21
          </div>
          <Button
            variant="outline"
            className="mt-2 border-[#1b2538]/20 text-[#1b2538]"
            onClick={onDemo}
          >
            Запросить демо
          </Button>
        </div>
      </div>
    </footer>
  )
}
