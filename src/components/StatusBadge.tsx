import { Activity, AlertCircle, CheckCircle, Clock, Pause, XCircle } from 'lucide-react'
import type { TaskStatus } from '../api/types'

interface StatusBadgeProps {
  status: TaskStatus
}

const CONFIG: Record<TaskStatus, { icon: React.ComponentType<{ className?: string }>; label: string; style: string }> = {
  active: { icon: Activity, label: '下载中', style: 'bg-blue-500/20 text-blue-400' },
  waiting: { icon: Clock, label: '等待中', style: 'bg-slate-500/20 text-slate-400' },
  paused: { icon: Pause, label: '已暂停', style: 'bg-amber-500/20 text-amber-400' },
  error: { icon: AlertCircle, label: '错误', style: 'bg-red-500/20 text-red-400' },
  complete: { icon: CheckCircle, label: '已完成', style: 'bg-green-500/20 text-green-400' },
  removed: { icon: XCircle, label: '已删除', style: 'bg-slate-500/20 text-slate-500' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { icon: Icon, label, style } = CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}
