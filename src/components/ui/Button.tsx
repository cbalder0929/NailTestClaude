import { forwardRef } from 'react'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LinkProps } from 'react-router-dom'

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

type Variant = 'primary' | 'secondary' | 'ghost' | 'light'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none ' +
  'transition-[transform,box-shadow,background-color,color,border-color] duration-300 ease-[var(--ease-soft)] ' +
  'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:hover:translate-y-0 ' +
  'active:scale-[0.985]'

const variants: Record<Variant, string> = {
  primary:
    'bg-rose-deep text-white shadow-[0_10px_24px_-10px_rgb(194_24_91/0.65)] hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-10px_rgb(194_24_91/0.7)]',
  secondary:
    'border-[1.5px] border-rose-deep/70 bg-transparent text-rose-deep hover:bg-blush hover:border-rose-deep',
  ghost: 'bg-transparent text-ink hover:bg-blush',
  light:
    'bg-white text-rose-deep shadow-[0_10px_24px_-12px_rgb(43_31_36/0.35)] hover:-translate-y-0.5',
}
const sizes: Record<Size, string> = {
  md: 'min-h-12 px-6 text-[0.95rem]',
  lg: 'min-h-14 px-8 text-base',
}

interface Common {
  variant?: Variant
  size?: Size
  full?: boolean
  className?: string
  children?: ReactNode
}
type BtnProps = Common & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined }
type RouterProps = Common & Omit<LinkProps, 'className' | 'children'> & { href?: undefined }
type AnchorProps = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { to?: undefined; href: string }

export const Button = forwardRef<HTMLElement, BtnProps | RouterProps | AnchorProps>(function Button(
  { variant = 'primary', size = 'md', full, className, children, ...rest },
  ref,
) {
  const cls = cn(base, variants[variant], sizes[size], full && 'w-full', className)
  if ('to' in rest && rest.to !== undefined) {
    return (
      <Link ref={ref as React.Ref<HTMLAnchorElement>} className={cls} {...(rest as LinkProps)}>
        {children}
      </Link>
    )
  }
  if ('href' in rest && rest.href !== undefined) {
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    )
  }
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      className={cls}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  )
})
