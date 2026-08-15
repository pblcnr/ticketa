import type { ReactNode } from 'react'
import { PerforatedDivider } from './PerforatedDivider'

type StubTabOption<T extends string> = {
  label: string
  value: T
}

type StubTabsProps<T extends string> = {
  options: StubTabOption<T>[]
  value: T
  onChange: (value: T) => void
  children: ReactNode
  className?: string
}

export function StubTabs<T extends string>({
  options,
  value,
  onChange,
  children,
  className = '',
}: StubTabsProps<T>) {
  return (
    <div className={`flex min-h-80 ${className}`}>
      <div
        className="flex w-16 shrink-0 flex-col"
        role="tablist"
        aria-orientation="vertical"
      >
        {options.map((option) => {
          const isSelected = option.value === value

          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onChange(option.value)}
              className={[
                'flex flex-1 items-center justify-center border-r border-perf-grey/40 px-1 font-display text-xs uppercase tracking-widest transition-colors',
                isSelected
                  ? 'bg-stage-violet text-paper'
                  : 'bg-kraft/40 text-ink/70 hover:bg-kraft/70',
              ].join(' ')}
            >
              <span className="-rotate-90 whitespace-nowrap">{option.label}</span>
            </button>
          )
        })}
      </div>

      <PerforatedDivider
        orientation="vertical"
        notchColor="bg-paper"
        className="shrink-0 self-stretch"
      />

      <div className="flex flex-1 flex-col" role="tabpanel">
        {children}
      </div>
    </div>
  )
}
