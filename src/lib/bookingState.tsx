import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export interface ClientInfo {
  first: string
  last: string
  phone: string
  email: string
  notes: string
  sms: boolean
}
export interface BookingState {
  step: number
  serviceId: string | null
  addOnIds: string[]
  techId: 'any' | string
  dateKey: string | null
  time: number | null
  assignedTechId: string | null
  info: ClientInfo
  confirmation: string | null
}

const KEY = 'rna.booking.v1'

export const emptyInfo: ClientInfo = { first: '', last: '', phone: '', email: '', notes: '', sms: true }
export const initialState: BookingState = {
  step: 0,
  serviceId: null,
  addOnIds: [],
  techId: 'any',
  dateKey: null,
  time: null,
  assignedTechId: null,
  info: emptyInfo,
  confirmation: null,
}

function load(): BookingState {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) return { ...initialState, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return initialState
}

interface Ctx {
  state: BookingState
  update: (patch: Partial<BookingState>) => void
  setInfo: (patch: Partial<ClientInfo>) => void
  reset: (patch?: Partial<BookingState>) => void
}
const BookingContext = createContext<Ctx | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(load)

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const update = useCallback((patch: Partial<BookingState>) => {
    setState((s) => {
      const next = { ...s, ...patch }
      // anything that changes duration / artist / day invalidates the chosen time
      const affectsTime = 'serviceId' in patch || 'addOnIds' in patch || 'techId' in patch || 'dateKey' in patch
      if (affectsTime && !('time' in patch)) {
        next.time = null
        next.assignedTechId = null
      }
      return next
    })
  }, [])
  const setInfo = useCallback((patch: Partial<ClientInfo>) => setState((s) => ({ ...s, info: { ...s.info, ...patch } })), [])
  const reset = useCallback((patch?: Partial<BookingState>) => setState({ ...initialState, ...patch }), [])

  const value = useMemo(() => ({ state, update, setInfo, reset }), [state, update, setInfo, reset])
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>')
  return ctx
}
