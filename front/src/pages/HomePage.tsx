import { useOutletContext } from 'react-router-dom'

import { AnalyticsOverview } from '@src/widgets/analytics/AnalyticsOverview'
import { BuilderShowcase } from '@src/widgets/builder/BuilderShowcase'
import { ReadySection } from '@src/widgets/cta/ReadySection'
import { FeatureGrid } from '@src/widgets/features/FeatureGrid'
import { HeroSection } from '@src/widgets/hero/HeroSection'
import { RoleCards } from '@src/widgets/roles/RoleCards'
import { LiveSessionPreview } from '@src/widgets/session/LiveSessionPreview'
import { TemplateLibrary } from '@src/widgets/templates/TemplateLibrary'
import type { ModalType } from '@src/features/auth/AuthModals'

export const HomePage = () => {
  const { openModal } = useOutletContext<{ openModal: (type: ModalType) => void }>()

  return (
    <div className="space-y-16 pb-16">
      <HeroSection
        onCreateSession={() => openModal('create')}
        onWatchDemo={() => openModal('demo')}
        onJoinSession={() => openModal('join')}
      />
      <FeatureGrid />
      <RoleCards
        onCreateSession={() => openModal('create')}
        onJoinSession={() => openModal('join')}
      />
      <BuilderShowcase />
      <LiveSessionPreview />
      <AnalyticsOverview onExport={() => openModal('export')} />
      <TemplateLibrary onOpenTemplates={() => openModal('templates')} />
      <ReadySection onStart={() => openModal('register')} />
    </div>
  )
}

export default HomePage
