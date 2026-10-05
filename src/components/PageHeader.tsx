import type { ReactNode } from 'react'
import { SectionHeader } from './ui/SectionHeader'

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: ReactNode; subtitle?: ReactNode }) {
  return (
    <header className="bg-blush-fade px-4 pb-14 pt-32 sm:px-6 md:pb-20 md:pt-40 lg:px-8">
      <SectionHeader as="h1" eyebrow={eyebrow} title={title} subtitle={subtitle} />
    </header>
  )
}
