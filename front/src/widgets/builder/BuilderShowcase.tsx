import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/ui/tabs'
import { Card } from '@src/shared/ui/card'
import { Badge } from '@src/shared/ui/badge'
import { adminTools, questionTypes } from '@src/shared/constants/content'

export const BuilderShowcase = () => {
  return (
    <section
      id="builder"
      className="grid gap-8 scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-700 lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div className="space-y-4">
        <Badge className="w-fit bg-[#1b2538] text-white">Конструктор опросов</Badge>
        <h2 className="text-3xl font-semibold text-[#1b2538] sm:text-4xl">
          Собирайте сценарии как режиссер.
        </h2>
        <p className="text-[#4b5563]">
          Комбинируйте типы вопросов, добавляйте условия переходов и управляйте таймингом
          прямо в редакторе. Всё сохраняется в библиотеке шаблонов для быстрых запусков.
        </p>

        <Tabs defaultValue={questionTypes[0].value} className="mt-6">
          <TabsList className="grid w-full grid-cols-1 gap-2 bg-[#f1f5f9] sm:grid-cols-3 sm:gap-0">
            {questionTypes.map((type) => (
              <TabsTrigger key={type.value} value={type.value}>
                {type.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {questionTypes.map((type) => (
            <TabsContent key={type.value} value={type.value} className="mt-4">
              <Card className="border border-[#e2e8f0] bg-white/90 p-4">
                <p className="text-sm text-[#475569]">{type.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {type.sample.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#cbd5e1] bg-white px-3 py-1 text-sm text-[#1b2538]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="space-y-4">
        {adminTools.map((tool) => {
          const Icon = tool.icon
          return (
            <Card key={tool.title} className="border border-[#e2e8f0] bg-white/85 p-5">
              <div className="flex items-start gap-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#1b2538]">
                  <Icon className="size-5" />
                </span>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-[#1b2538]">{tool.title}</h3>
                  <p className="text-sm text-[#536071]">{tool.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
        <Card className="border border-dashed border-[#cbd5e1] bg-white/70 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">Логика ветвления</p>
          <p className="mt-2 text-sm text-[#475569]">
            Если участник выбрал «Нужно обсудить», добавьте уточняющий блок и предложите
            голосование за приоритеты.
          </p>
        </Card>
      </div>
    </section>
  )
}
