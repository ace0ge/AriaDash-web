import { type ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-slate-950">
      {children}
    </div>
  )
}
