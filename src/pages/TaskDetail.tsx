import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, File, FolderOpen, Link, Wifi } from 'lucide-react'
import { useAria2Context } from '../context/Aria2Context'
import { ProgressBar } from '../components/ProgressBar'
import { StatusBadge } from '../components/StatusBadge'
import { TaskActions } from '../components/TaskActions'
import { useSwipe } from '../hooks/useSwipe'

function formatSize(bytes: string): string {
  const v = Number(bytes)
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

function fileName(task: { bittorrent?: { info?: { name: string }; name?: string }; files: { path: string }[]; gid: string }): string {
  const b = task.bittorrent?.info?.name ?? task.bittorrent?.name
  if (b) return b
  return task.files[0]?.path.split('/').pop() ?? task.gid
}

function percent(total: string, completed: string): number {
  const t = Number(total)
  if (t === 0) return 0
  return (Number(completed) / t) * 100
}

function eta(total: string, completed: string, speed: string): string {
  const remaining = Number(total) - Number(completed)
  const s = Number(speed)
  if (s <= 0) return '--'
  const secs = Math.ceil(remaining / s)
  if (secs < 60) return `${secs}秒`
  if (secs < 3600) return `${Math.ceil(secs / 60)}分钟`
  return `${Math.floor(secs / 3600)}小时${Math.ceil((secs % 3600) / 60)}分`
}

export function TaskDetail() {
  const { gid } = useParams<{ gid: string }>()
  const navigate = useNavigate()
  const { tasks, pause, unpause, remove } = useAria2Context()
  const task = tasks.find((t) => t.gid === gid)

  const { revealed, handlers, closeReveal } = useSwipe({
    edgeOnly: true,
    threshold: 60,
  })

  useEffect(() => {
    if (revealed === 'right') {
      closeReveal()
      navigate(-1)
    }
  }, [revealed, closeReveal, navigate])

  if (!task) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p className="text-sm text-slate-500">任务未找到</p>
        <button onClick={() => navigate('/')} className="mt-4 text-sm text-blue-400">返回列表</button>
      </div>
    )
  }

  const pct = percent(task.totalLength, task.completedLength)
  const name = fileName(task)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4" {...handlers}>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </button>

      <div className="rounded-xl bg-slate-900 p-4">
        <div className="flex items-start gap-3">
          <File className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-medium text-white">{name}</h2>
            <div className="mt-1">
              <StatusBadge status={task.status} />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar percent={pct} />
        </div>

        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-medium text-white">{formatSpeed(task.downloadSpeed)}</span>
          <span className="text-slate-400">
            ETA {eta(task.totalLength, task.completedLength, task.downloadSpeed)}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {formatSize(task.completedLength)} / {formatSize(task.totalLength)}
        </p>
      </div>

      <TaskActions task={task} onPause={pause} onUnpause={unpause} onRemove={remove} />

      <div className="rounded-xl bg-slate-900 p-4">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">详细信息</h3>
        <div className="space-y-2 text-sm">
          <DetailRow icon={<Wifi />} label="连接数" value={task.connections ?? '0'} />
          <DetailRow icon={<Link />} label="协议" value="HTTP" />
          <DetailRow icon={<FolderOpen />} label="下载目录" value={task.dir} />
          {task.errorMessage && (
            <DetailRow icon={<File />} label="错误" value={task.errorMessage} />
          )}
        </div>
      </div>

      {task.files.length > 1 && (
        <div className="rounded-xl bg-slate-900 p-4">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">文件列表</h3>
          <div className="space-y-2">
            {task.files.map((f) => (
              <div key={f.index} className="flex items-center justify-between text-sm">
                <span className="truncate text-slate-300">{f.path.split('/').pop()}</span>
                <span className="shrink-0 text-slate-500">{formatSize(f.length)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-4 w-4 items-center text-slate-500">{icon}</span>
      <span className="text-slate-400">{label}</span>
      <span className="ml-auto text-right text-slate-300">{value}</span>
    </div>
  )
}
