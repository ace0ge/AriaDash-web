import { Pause, Play, Trash2 } from 'lucide-react'
import type { DownloadTask } from '../api/types'
import { useI18n } from '../i18n'

interface TaskActionsProps {
  task: DownloadTask
  onPause: (gid: string) => void
  onUnpause: (gid: string) => void
  onRemove: (gid: string) => void
}

export function TaskActions({ task, onPause, onUnpause, onRemove }: TaskActionsProps) {
  const { t } = useI18n()
  return (
    <div className="flex gap-3">
      {(task.status === 'active' || task.status === 'waiting') && (
        <button
          onClick={() => onPause(task.gid)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-800 py-3 text-sm text-white active:bg-slate-700"
        >
          <Pause className="h-4 w-4" />
          {t('task.pause')}
        </button>
      )}
      {task.status === 'paused' && (
        <button
          onClick={() => onUnpause(task.gid)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500/20 py-3 text-sm text-blue-400 active:bg-blue-500/30"
        >
          <Play className="h-4 w-4" />
          {t('task.resume')}
        </button>
      )}
      <button
        onClick={() => onRemove(task.gid)}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500/20 py-3 text-sm text-red-400 active:bg-red-500/30"
      >
        <Trash2 className="h-4 w-4" />
        {t('task.delete')}
      </button>
    </div>
  )
}
