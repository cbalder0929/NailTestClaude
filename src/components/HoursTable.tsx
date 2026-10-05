import { salon } from '../config/salon'
import { DAY_NAMES, fmtHM } from '../lib/dates'
import { cn } from './ui/Button'

const order = [1, 2, 3, 4, 5, 6, 0]

export function HoursTable({ compact }: { compact?: boolean }) {
  const today = new Date().getDay()
  return (
    <table className="w-full text-left">
      <caption className="sr-only">Opening hours</caption>
      <tbody>
        {order.map((d) => {
          const h = salon.hours[d]
          const isToday = d === today
          return (
            <tr
              key={d}
              className={cn(
                'border-b border-line/70 last:border-0',
                isToday && 'bg-blush font-semibold',
              )}
            >
              <th
                scope="row"
                className={cn('rounded-l-xl px-3 font-medium', compact ? 'py-2.5' : 'py-3.5', isToday && 'font-semibold text-rose-deep')}
              >
                {DAY_NAMES[d]}
                {isToday && <span className="ml-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em]">Today</span>}
              </th>
              <td className={cn('rounded-r-xl px-3 text-right', compact ? 'py-2.5' : 'py-3.5', !h && 'text-muted')}>
                {h ? `${fmtHM(h.open)} – ${fmtHM(h.close)}` : 'Closed'}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
