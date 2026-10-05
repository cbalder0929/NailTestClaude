import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from './Button'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  trailing?: ReactNode
  wrapperClassName?: string
}

const fieldCls = (error?: string) =>
  cn(
    'w-full rounded-2xl border-[1.5px] bg-white px-4 text-base text-ink placeholder:text-muted/60',
    'transition-[border-color,box-shadow] duration-200 outline-none',
    'focus:border-rose-deep focus:shadow-[0_0_0_4px_rgb(232_160_180/0.35)]',
    error ? 'border-[#B3261E]' : 'border-line',
  )

export const Input = forwardRef<HTMLInputElement, FieldProps & InputHTMLAttributes<HTMLInputElement>>(function Input(
  { label, error, hint, trailing, wrapperClassName, className, id, ...rest },
  ref,
) {
  const auto = useId()
  const fid = id ?? auto
  const desc = error ? `${fid}-err` : hint ? `${fid}-hint` : undefined
  return (
    <div className={wrapperClassName}>
      <label htmlFor={fid} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={fid}
          aria-invalid={!!error}
          aria-describedby={desc}
          className={cn(fieldCls(error), 'min-h-12 py-3', !!trailing && 'pr-24', className)}
          {...rest}
        />
        {trailing && <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">{trailing}</div>}
      </div>
      {/* space is always reserved so a validation message never shifts the layout under a tap */}
      <div className="mt-1 min-h-[1.375rem]">
        {error ? (
          <p id={`${fid}-err`} role="alert" className="text-sm font-medium text-[#B3261E]">
            {error}
          </p>
        ) : hint ? (
          <p id={`${fid}-hint`} className="text-sm text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  )
})

export const Textarea = forwardRef<HTMLTextAreaElement, FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ label, error, hint, wrapperClassName, className, id, ...rest }, ref) {
    const auto = useId()
    const fid = id ?? auto
    const desc = error ? `${fid}-err` : hint ? `${fid}-hint` : undefined
    return (
      <div className={wrapperClassName}>
        <label htmlFor={fid} className="mb-1.5 block text-sm font-semibold text-ink">
          {label}
        </label>
        <textarea
          ref={ref}
          id={fid}
          aria-invalid={!!error}
          aria-describedby={desc}
          className={cn(fieldCls(error), 'min-h-28 resize-y py-3', className)}
          {...rest}
        />
        <div className="mt-1 min-h-[1.375rem]">
          {error ? (
            <p id={`${fid}-err`} role="alert" className="text-sm font-medium text-[#B3261E]">
              {error}
            </p>
          ) : hint ? (
            <p id={`${fid}-hint`} className="text-sm text-muted">
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    )
  },
)
