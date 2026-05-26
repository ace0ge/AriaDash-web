import { Pause, Play, Trash2 } from 'lucide-react'

interface BatchActionBarProps {
  selectedCount: number
  hasActive: boolean
  hasPaused: boolean
  onBatchPause: () => void
  onBatchUnpause: () => void
  onBatchRemove: () => void
}

export function BatchActionBar({
  selectedCount,
  hasActive,
  hasPaused,
  onBatchPause,
  onBatchUnpause,
  onBatchRemove,
}: BatchActionBarProps) {
  if (selectedCount === 0) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-[430px] items-center justify-center gap-3 px-4 py-3">
        {hasActive && (
          <button
            onClick={onBatchPause}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white active:bg-slate-700"
          >
            <Pause className="h-4 w-4" />
            暂停({selectedCount})
          </button>
        )}
        {hasPaused && (
          <button
            onClick={onBatchUnpause}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white active:bg-slate-700"
          >
            <Play className="h-4 w-4" />
            恢复({selectedCount})
          </button>
        )}
        <button
          onClick={onBatchRemove}
          className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400 active:bg-red-500/30"
        >
          <Trash2 className="h-4 w-4" />
          删除({selectedCount})
        </button>
      </div>
    </div>
  )
}
