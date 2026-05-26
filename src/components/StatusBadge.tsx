import type { TaskStatus } from '../api/types'

interface StatusBadgeProps {
  status: TaskStatus
}

const STYLES: Record<TaskStatus, string> = {
  active: 'bg-blue-500/20 text-blue-400',
  waiting: 'bg-slate-500/20 text-slate-400',
  paused: 'bg-amber-500/20 text-amber-400',
  error: 'bg-red-500/20 text-red-400',
  complete: 'bg-green-500/20 text-green-400',
  removed: 'bg-slate-500/20 text-slate-500',
}

const LABELS: Record<TaskStatus, string> = {
  active: '下载中',
  waiting: '等待中',
  paused: '已暂停',
  error: '错误',
  complete: '已完成',
  removed: '已删除',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  )
}
