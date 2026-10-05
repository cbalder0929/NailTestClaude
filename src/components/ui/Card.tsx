import type { HTMLAttributes } from 'react'
import { cn } from './Button'

interface Props extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  tone?: 'white' | 'blush' | 'cream'
}

export function Card({ interactive, tone = 'white', className, ...rest }: Props) {
  return (
    <div
      className={cn(
        'rounded-[1.25rem] border border-line/70 shadow-soft sm:rounded-3xl',
        tone === 'white' && 'bg-white',
        tone === 'blush' && 'bg-blush',
        tone === 'cream' && 'bg-cream',
        interactive &&
          'transition-[transform,box-shadow] duration-300 ease-[var(--ease-soft)] hover:-translate-y-1 hover:shadow-lift',
        className,
      )}
      {...rest}
    />
  )
}
