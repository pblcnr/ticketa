type StatusBadgeProps = {
  status: string
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Encerrado',
}

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-perf-grey text-ink',
  PUBLISHED: 'bg-gate-green text-paper',
  CANCELLED: 'bg-stub-red/15 text-stub-red',
  COMPLETED: 'bg-stage-violet/15 text-stage-violet',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={[
        'inline-block px-2 py-0.5 font-body text-xs uppercase tracking-widest',
        statusStyles[status] ?? 'bg-perf-grey text-ink',
      ].join(' ')}
    >
      {statusLabels[status] ?? status}
    </span>
  )
}
