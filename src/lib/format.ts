export function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').replace(/^1(?=\d{10})/, '').slice(0, 10)
  if (d.length < 4) return d
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}
export const isPhone = (v: string) => v.replace(/\D/g, '').length === 10
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'
export function cardBrand(num: string): CardBrand {
  const d = num.replace(/\D/g, '')
  if (/^4/.test(d)) return 'visa'
  if (/^(5[1-5]|2(2[2-9][1-9]|2[3-9]|[3-6]|7[01]|720))/.test(d)) return 'mastercard'
  if (/^3[47]/.test(d)) return 'amex'
  if (/^(6011|65|64[4-9])/.test(d)) return 'discover'
  return 'unknown'
}
export function formatCard(v: string) {
  const d = v.replace(/\D/g, '')
  if (cardBrand(d) === 'amex') {
    const a = d.slice(0, 15)
    return [a.slice(0, 4), a.slice(4, 10), a.slice(10)].filter(Boolean).join(' ')
  }
  return (d.slice(0, 16).match(/.{1,4}/g) ?? []).join(' ')
}
export function formatExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length < 3 ? d : `${d.slice(0, 2)}/${d.slice(2)}`
}
export function validExpiry(v: string) {
  const m = /^(\d{2})\/(\d{2})$/.exec(v)
  if (!m) return false
  const mm = +m[1]
  const yy = 2000 + +m[2]
  if (mm < 1 || mm > 12) return false
  const now = new Date()
  return yy > now.getFullYear() || (yy === now.getFullYear() && mm >= now.getMonth() + 1)
}
