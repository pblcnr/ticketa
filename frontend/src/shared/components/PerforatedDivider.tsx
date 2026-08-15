type PerforatedDividerProps = {
  orientation?: 'horizontal' | 'vertical'
  notchColor?: string
  className?: string
}

export function PerforatedDivider({
  orientation = 'horizontal',
  notchColor = 'bg-kraft',
  className = '',
}: PerforatedDividerProps) {
  const isHorizontal = orientation === 'horizontal'

  return (
    <div
      className={[
        'relative flex items-center justify-center',
        isHorizontal ? 'h-6 w-full' : 'h-full w-6 flex-col',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="separator"
      aria-hidden="true"
    >
      <div
        className={
          isHorizontal
            ? `h-6 w-3 shrink-0 rounded-r-full ${notchColor}`
            : `h-3 w-6 shrink-0 rounded-b-full ${notchColor}`
        }
      />
      <div
        className={
          isHorizontal
            ? 'flex-1 border-t-2 border-dashed border-perf-grey'
            : 'flex-1 border-l-2 border-dashed border-perf-grey'
        }
      />
      <div
        className={
          isHorizontal
            ? `h-6 w-3 shrink-0 rounded-l-full ${notchColor}`
            : `h-3 w-6 shrink-0 rounded-t-full ${notchColor}`
        }
      />
    </div>
  )
}
