import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from './Button'

interface Props {
  src: string
  alt: string
  /** CSS aspect-ratio like "4/5". Omit when the parent already sizes the box. */
  aspect?: string
  className?: string
  imgClassName?: string
  eager?: boolean
  onError?: () => void
}

/** Never shows a broken image: falls back to a blush gradient + icon. */
export function SafeImage({ src, alt, aspect, className, imgClassName, eager, onError }: Props) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  return (
    <div
      className={cn(!className?.includes('absolute') && 'relative', 'overflow-hidden bg-gradient-to-br from-blush via-cream to-blush', className)}
      style={aspect ? { aspectRatio: aspect } : undefined}
    >
      {failed ? (
        <div className="absolute inset-0 grid place-items-center text-rose" role="img" aria-label={alt}>
          <Sparkles size={34} strokeWidth={1.4} />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true)
            onError?.()
          }}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      )}
    </div>
  )
}
