import type { TicketStatus } from '../types'

type TicketStatusBadgeProps = {
  status: TicketStatus
}

const statusLabels: Record<TicketStatus, string> = {
  VALID: 'Válido',
  USED: 'Usado',
}

const statusStyles: Record<TicketStatus, string> = {
  VALID: 'bg-gate-green text-paper',
  USED: 'bg-perf-grey text-ink',
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  return (
    <span
      className={[
        'inline-block px-2 py-0.5 font-body text-xs uppercase tracking-widest',
        statusStyles[status],
      ].join(' ')}
    >
      {statusLabels[status]}
    </span>
  )
}
