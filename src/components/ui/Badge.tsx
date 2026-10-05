import type { ReactNode } from 'react'
import { cn } from './Button'

const tones = {
  blush: 'bg-blush text-rose-deep',
  gold: 'bg-[#F6EBD3] text-[#6B5320]',
  ink: 'bg-ink text-cream',
  white: 'bg-white/90 text-rose-deep',
  success: 'bg-[#E4F4EA] text-[#17603A]',
}

export function Badge({ tone = 'blush', children, className }: { tone?: keyof typeof tones; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
