import { Card } from '@src/shared/ui/card'
import { Button } from '@src/shared/ui/button'
import { templateLibrary } from '@src/shared/constants/content'

type TemplateLibraryProps = {
  onOpenTemplates?: () => void
}

export const TemplateLibrary = ({ onOpenTemplates }: TemplateLibraryProps) => {
  return (
    <section
      id="templates"
      className="space-y-6 scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Шаблоны</p>
          <h2 className="text-3xl font-semibold text-[#1b2538] sm:text-4xl">
            Соберите опрос из готовых сценариев.
          </h2>
          <p className="text-[#4b5563]">
            Быстрый запуск за счет проверенных шаблонов для обучения, ретро и стратегических комнат.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full border-[#1b2538]/20 text-[#1b2538] sm:w-auto"
          onClick={onOpenTemplates}
        >
          Открыть библиотеку
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {templateLibrary.map((template) => (
          <Card key={template.title} className="border border-[#e2e8f0] bg-white/85 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">{template.usage}</p>
            <h3 className="mt-3 text-lg font-semibold text-[#1b2538]">{template.title}</h3>
            <p className="mt-2 text-sm text-[#64748b]">{template.questions} вопросов</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
