import { type ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="mx-auto flex h-dvh max-w-[430px] flex-col bg-slate-950" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {children}
    </div>
  )
}
