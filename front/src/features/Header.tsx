import { LogIn, Menu, Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { cn } from '@src/shared/utils/cn'
import { Button } from '@src/shared/ui/button'
import { routes } from '@src/app/constants/routes'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@src/shared/ui/sheet'

type HeaderProps = {
  className?: string
  onLogin?: () => void
  onRegister?: () => void
  onProfile?: () => void
  onLogout?: () => void
  isAuthenticated?: boolean
}

export const Header = ({
  className,
  onLogin,
  onRegister,
  onProfile,
  onLogout,
  isAuthenticated = false,
}: HeaderProps) => {
  const location = useLocation()
  const isProfileActive = location.pathname === routes.dashboard.url()
  const isFeaturesActive = location.pathname === routes.features.url()
  const isBuilderActive = location.pathname === routes.builder.url()
  const isAnalyticsActive = location.pathname === routes.analytics.url()
  const isTemplatesActive = location.pathname === routes.templates.url()

  return (
    <header className={cn('flex flex-col gap-4 py-6 sm:py-8', className)}>
      <div className="flex items-center justify-between gap-4">
        <Link
          to={routes.home.url()}
          className="flex items-center gap-3 transition hover:opacity-90"
          aria-label="На главную"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#1b2538] text-white">
            <Sparkles className="size-5" />
          </span>
          <div>
            <p className="text-lg font-semibold text-[#1b2538]">МедУчет</p>
            <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Live polling</p>
          </div>
        </Link>

      <nav className="hidden items-center gap-6 text-sm text-[#475569] lg:flex">
        <Link
          className={cn(
            'transition hover:text-[#1b2538]',
            isFeaturesActive && 'text-[#1b2538] font-semibold',
          )}
          to={routes.features.url()}
        >
          Возможности
        </Link>
        <Link
          className={cn(
            'transition hover:text-[#1b2538]',
            isBuilderActive && 'text-[#1b2538] font-semibold',
          )}
          to={routes.builder.url()}
        >
          Конструктор
        </Link>
        <Link
          className={cn(
            'transition hover:text-[#1b2538]',
            isAnalyticsActive && 'text-[#1b2538] font-semibold',
          )}
          to={routes.analytics.url()}
        >
          Аналитика
        </Link>
        <Link
          className={cn(
            'transition hover:text-[#1b2538]',
            isTemplatesActive && 'text-[#1b2538] font-semibold',
          )}
          to={routes.templates.url()}
        >
          Шаблоны
        </Link>
      </nav>

      <div className="hidden items-center gap-3 sm:flex">
        {isAuthenticated ? (
          <>
            <Button
              variant="outline"
              className={cn(
                'border-[#1b2538]/20 text-[#1b2538]',
                isProfileActive && 'bg-[#1b2538] text-white hover:bg-[#28324a]',
              )}
              onClick={onProfile}
            >
              Профиль
            </Button>
            <Button className="bg-[#1b2538] text-white hover:bg-[#28324a]" onClick={onLogout}>
              Выйти
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              className="border-[#1b2538]/20 text-[#1b2538]"
              onClick={onLogin}
            >
              Войти
              <LogIn className="ml-2 size-4" />
            </Button>
            <Button className="bg-[#1b2538] text-white hover:bg-[#28324a]" onClick={onRegister}>
              Регистрация
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-[#1b2538]/20 text-[#1b2538]"
              aria-label="Открыть меню"
            >
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-white">
            <SheetHeader className="border-b border-[#e2e8f0]">
              <SheetTitle className="text-lg text-[#1b2538]">МедУчет</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 px-4 pt-2">
              <SheetClose asChild>
                <Link
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm transition hover:bg-[#f1f5f9] hover:text-[#1b2538]',
                    isFeaturesActive && 'bg-[#f1f5f9] text-[#1b2538] font-semibold',
                  )}
                  to={routes.features.url()}
                >
                  Возможности
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm transition hover:bg-[#f1f5f9] hover:text-[#1b2538]',
                    isBuilderActive && 'bg-[#f1f5f9] text-[#1b2538] font-semibold',
                  )}
                  to={routes.builder.url()}
                >
                  Конструктор
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm transition hover:bg-[#f1f5f9] hover:text-[#1b2538]',
                    isAnalyticsActive && 'bg-[#f1f5f9] text-[#1b2538] font-semibold',
                  )}
                  to={routes.analytics.url()}
                >
                  Аналитика
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm transition hover:bg-[#f1f5f9] hover:text-[#1b2538]',
                    isTemplatesActive && 'bg-[#f1f5f9] text-[#1b2538] font-semibold',
                  )}
                  to={routes.templates.url()}
                >
                  Шаблоны
                </Link>
              </SheetClose>
            </div>
            <div className="mt-auto grid gap-2 border-t border-[#e2e8f0] p-4">
              {isAuthenticated ? (
                <>
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'border-[#1b2538]/20 text-[#1b2538]',
                        isProfileActive && 'bg-[#1b2538] text-white hover:bg-[#28324a]',
                      )}
                      onClick={onProfile}
                    >
                      Профиль
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button className="bg-[#1b2538] text-white hover:bg-[#28324a]" onClick={onLogout}>
                      Выйти
                    </Button>
                  </SheetClose>
                </>
              ) : (
                <>
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="border-[#1b2538]/20 text-[#1b2538]"
                      onClick={onLogin}
                    >
                      Войти
                      <LogIn className="ml-2 size-4" />
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      className="bg-[#1b2538] text-white hover:bg-[#28324a]"
                      onClick={onRegister}
                    >
                      Регистрация
                    </Button>
                  </SheetClose>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      </div>

      <nav className="flex flex-wrap gap-2 text-sm text-[#475569] lg:hidden">
        <Link
          className={cn(
            'basis-[calc(50%-0.25rem)] rounded-full border border-[#e2e8f0] px-3 py-2 text-center transition hover:border-[#cbd5e1] hover:text-[#1b2538]',
            isFeaturesActive && 'border-[#1b2538]/40 bg-[#f1f5f9] text-[#1b2538] font-semibold',
          )}
          to={routes.features.url()}
        >
          Возможности
        </Link>
        <Link
          className={cn(
            'basis-[calc(50%-0.25rem)] rounded-full border border-[#e2e8f0] px-3 py-2 text-center transition hover:border-[#cbd5e1] hover:text-[#1b2538]',
            isBuilderActive && 'border-[#1b2538]/40 bg-[#f1f5f9] text-[#1b2538] font-semibold',
          )}
          to={routes.builder.url()}
        >
          Конструктор
        </Link>
        <Link
          className={cn(
            'basis-[calc(50%-0.25rem)] rounded-full border border-[#e2e8f0] px-3 py-2 text-center transition hover:border-[#cbd5e1] hover:text-[#1b2538]',
            isAnalyticsActive && 'border-[#1b2538]/40 bg-[#f1f5f9] text-[#1b2538] font-semibold',
          )}
          to={routes.analytics.url()}
        >
          Аналитика
        </Link>
        <Link
          className={cn(
            'basis-[calc(50%-0.25rem)] rounded-full border border-[#e2e8f0] px-3 py-2 text-center transition hover:border-[#cbd5e1] hover:text-[#1b2538]',
            isTemplatesActive && 'border-[#1b2538]/40 bg-[#f1f5f9] text-[#1b2538] font-semibold',
          )}
          to={routes.templates.url()}
        >
          Шаблоны
        </Link>
      </nav>
    </header>
  )
}
