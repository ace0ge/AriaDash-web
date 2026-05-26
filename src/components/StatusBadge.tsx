import { Activity, AlertCircle, CheckCircle, Clock, Pause, XCircle } from 'lucide-react'
import type { TaskStatus } from '../api/types'

const ICONS: Record<TaskStatus, React.ComponentType<{ className?: string }>> = {
  active: Activity,
  waiting: Clock,
  paused: Pause,
  error: AlertCircle,
  complete: CheckCircle,
  removed: XCircle,
}

const STYLES: Record<TaskStatus, string> = {
  active: 'bg-blue-500/20 text-blue-400',
  waiting: 'bg-slate-500/20 text-slate-400',
  paused: 'bg-amber-500/20 text-amber-400',
  error: 'bg-red-500/20 text-red-400',
  complete: 'bg-green-500/20 text-green-400',
  removed: 'bg-slate-500/20 text-slate-500',
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const Icon = ICONS[status]
  return (
    <span className={`inline-flex items-center rounded-full p-1 ${STYLES[status]}`}>
      <Icon className="h-3 w-3" />
    </span>
  )
}
