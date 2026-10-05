import type { ReactNode } from 'react'
import { cn } from './Button'

interface Props {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  align?: 'center' | 'left'
  as?: 'h1' | 'h2'
  className?: string
}

export function SectionHeader({ eyebrow, title, subtitle, align = 'center', as: H = 'h2', className }: Props) {
  const center = align === 'center'
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center', className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <H className="text-[2.35rem] sm:text-5xl md:text-[3.4rem]">{title}</H>
      <div className={cn('gold-rule mt-5 w-24', center && 'mx-auto')} aria-hidden />
      {subtitle && <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>}
    </div>
  )
}
