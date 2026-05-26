import { useNavigate } from 'react-router-dom'
import { Pause, Play, Trash2, File } from 'lucide-react'
import type { DownloadTask } from '../api/types'
import { ProgressBar } from './ProgressBar'
import { StatusBadge } from './StatusBadge'
import { useSwipe } from '../hooks/useSwipe'

interface DownloadItemProps {
  task: DownloadTask
  batchMode: boolean
  selected: boolean
  onSelect: (gid: string) => void
  onPause: (gid: string) => void
  onUnpause: (gid: string) => void
  onRemove: (gid: string) => void
}

function formatSize(v: number): string {
  if (v === 0) return '0 B'
  if (v < 1024) return `${v} B`
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`
  if (v < 1024 * 1024 * 1024) return `${(v / (1024 * 1024)).toFixed(1)} MB`
  return `${(v / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatSpeed(bytesPerSec: string): string {
  const v = Number(bytesPerSec)
  if (v === 0) return '0 B/s'
  if (v < 1024) return `${v} B/s`
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB/s`
  return `${(v / (1024 * 1024)).toFixed(1)} MB/s`
}

function fileName(task: DownloadTask): string {
  const b = task.bittorrent?.info?.name ?? task.bittorrent?.name
  if (b) return b
  return task.files[0]?.path.split('/').pop() ?? task.gid
}

function percent(task: DownloadTask): number {
  const total = Number(task.totalLength)
  if (total === 0) return 0
  return (Number(task.completedLength) / total) * 100
}

function eta(task: DownloadTask): string {
  const remaining = Number(task.totalLength) - Number(task.completedLength)
  const speed = Number(task.downloadSpeed)
  if (speed <= 0) return '--'
  const secs = Math.ceil(remaining / speed)
  if (secs < 60) return `${secs}秒`
  if (secs < 3600) return `${Math.ceil(secs / 60)}分钟`
  return `${Math.floor(secs / 3600)}小时${Math.ceil((secs % 3600) / 60)}分`
}

export function DownloadItem({
  task,
  batchMode,
  selected,
  onSelect,
  onPause,
  onUnpause,
  onRemove,
}: DownloadItemProps) {
  const navigate = useNavigate()
  const pct = percent(task)
  const name = fileName(task)

  const { translateX, isSwiping, revealed, handlers, closeReveal } = useSwipe({
    threshold: 80,
    onClick: () => navigate(`/task/${task.gid}`),
  })

  const showLeftAction = revealed === 'right'
  const showRightAction = revealed === 'left'

  return (
    <div className="relative overflow-hidden rounded-xl">
      {!batchMode && (
        <button
          onClick={() => { onRemove(task.gid); closeReveal() }}
          className="absolute inset-y-0 left-0 flex w-20 items-center justify-center rounded-xl bg-red-500/20"
          style={{ zIndex: showLeftAction ? 1 : 0, pointerEvents: showLeftAction ? 'auto' : 'none' }}
        >
          <Trash2 className="h-5 w-5 text-red-400" />
        </button>
      )}
      {!batchMode && task.status !== 'complete' && task.status !== 'removed' && task.status !== 'error' && (
        <button
          onClick={() => {
            if (task.status === 'paused') onUnpause(task.gid)
            else onPause(task.gid)
            closeReveal()
          }}
          className="absolute inset-y-0 right-0 flex w-20 items-center justify-center rounded-xl bg-blue-500/20"
          style={{ zIndex: showRightAction ? 1 : 0, pointerEvents: showRightAction ? 'auto' : 'none' }}
        >
          {task.status === 'paused' ? (
            <Play className="h-5 w-5 text-blue-400" />
          ) : (
            <Pause className="h-5 w-5 text-blue-400" />
          )}
        </button>
      )}
      <div
        className={`relative rounded-xl bg-slate-900 px-3 py-2.5 select-none ${isSwiping ? '' : 'transition-transform duration-300'}`}
        style={{ transform: `translateX(${batchMode ? 0 : translateX}px)`, touchAction: 'manipulation' }}
        {...(batchMode ? {} : handlers)}
        onClick={batchMode ? () => onSelect(task.gid) : undefined}
      >
        <div className="flex items-start gap-2">
          {batchMode && (
            <button
              onClick={() => onSelect(task.gid)}
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                selected ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
              }`}
            >
              {selected && <span className="text-[10px] text-white">✓</span>}
            </button>
          )}
          <File className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-white">{name}</p>
              <StatusBadge status={task.status} />
            </div>
            <div className="mt-1.5">
              <ProgressBar percent={pct} />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              {task.status === 'active' || task.status === 'paused' ? (
                <>
                  <span>{formatSpeed(task.downloadSpeed)}</span>
                  <span>ETA {eta(task)}</span>
                </>
              ) : (
                <span>{formatSize(Number(task.totalLength))}</span>
              )}
              <span>
                {formatSize(Number(task.completedLength))} / {formatSize(Number(task.totalLength))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
