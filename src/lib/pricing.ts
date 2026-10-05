import { salon } from '../config/salon'

export function getService(id: string | null | undefined) {
  return salon.services.find((s) => s.id === id)
}
export function getTech(id: string | null | undefined) {
  return salon.technicians.find((t) => t.id === id)
}
export function totals(serviceId: string | null, addOnIds: string[]) {
  const svc = getService(serviceId)
  const adds = salon.addOns.filter((a) => addOnIds.includes(a.id))
  const subtotal = (svc?.price ?? 0) + adds.reduce((n, a) => n + a.price, 0)
  const duration = (svc?.duration ?? 0) + adds.reduce((n, a) => n + a.duration, 0)
  const { percent, minimum } = salon.deposit
  const deposit = subtotal === 0 ? 0 : Math.min(subtotal, Math.max(minimum, Math.round((subtotal * percent) / 100)))
  return { svc, adds, subtotal, duration, deposit, balance: subtotal - deposit }
}
