import { PageIntroCard } from '@fullstackmicrostarter/ui'

interface SectionPlaceholderPageProps {
  title: string
  description: string
}

export default function SectionPlaceholderPage({ title, description }: SectionPlaceholderPageProps) {
  return <PageIntroCard badgeLabel="Workspace section" title={title} description={description} />
}
