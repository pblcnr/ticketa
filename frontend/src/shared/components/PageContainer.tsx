import type { ReactNode } from 'react'

export const pageContainerClassName = 'mx-auto w-full max-w-6xl px-6'

type PageContainerProps = {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={[pageContainerClassName, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
