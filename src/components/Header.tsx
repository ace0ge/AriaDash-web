import { Settings, CheckSquare, X } from 'lucide-react'
import { Link } from 'react-router-dom'

interface HeaderProps {
  batchMode: boolean
  selectedCount: number
  onToggleBatch: () => void
}

export function Header({ batchMode, selectedCount, onToggleBatch }: HeaderProps) {
  return (
    <header className="flex h-12 items-center justify-between px-2">
      {batchMode ? (
        <>
          <span className="text-sm font-medium text-white">
            已选 {selectedCount}
          </span>
          <button
            onClick={onToggleBatch}
            className="flex items-center gap-1 text-sm text-blue-400"
          >
            <X className="h-4 w-4" />
            取消
          </button>
        </>
      ) : (
        <>
          <h1 className="text-base font-semibold text-white">AriaDash</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleBatch}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
              aria-label="多选"
            >
              <CheckSquare className="h-5 w-5" />
            </button>
            <Link
              to="/settings"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
              aria-label="设置"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </>
      )}
    </header>
  )
}
