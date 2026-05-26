import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, File, Globe, Link, Users, Wifi } from 'lucide-react'
import { useAria2Context } from '../context/Aria2Context'
import type { DownloadTask, PeerInfo, ServerInfo } from '../api/types'
import { ProgressBar } from '../components/ProgressBar'
import { StatusBadge } from '../components/StatusBadge'
import { TaskActions } from '../components/TaskActions'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { useSwipe } from '../hooks/useSwipe'

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
  const { tasks, connected, pause, unpause, remove, getTaskDetail, getPeers, getServers } = useAria2Context()
  const task = tasks.find((t) => t.gid === gid)

  const [detail, setDetail] = useState<DownloadTask | null>(null)
  const [peers, setPeers] = useState<PeerInfo[]>([])
  const [servers, setServers] = useState<ServerInfo[]>([])
  const [loading, setLoading] = useState(false)

  const { revealed, handlers, closeReveal } = useSwipe({
    edgeOnly: true,
    threshold: 60,
  })

  useEffect(() => {
    if (!gid || !task) return
    setLoading(true)
    Promise.all([
      getTaskDetail(gid),
      getPeers(gid),
      getServers(gid),
    ]).then(([d, p, s]) => {
      if (d) setDetail(d)
      setPeers(p)
      setServers(s)
    }).finally(() => setLoading(false))
  }, [gid, task, getTaskDetail, getPeers, getServers])

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

  const current = detail ?? task
  const pct = percent(current.totalLength, current.completedLength)
  const name = fileName(current)
  const hasPeers = peers.length > 0
  const hasServers = servers.length > 0

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4" {...handlers}>
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
              <StatusBadge status={current.status} />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar percent={pct} />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-medium text-white">{formatSpeed(current.downloadSpeed)}</span>
          <span className="text-slate-400">
            ETA {eta(current.totalLength, current.completedLength, current.downloadSpeed)}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {formatSize(Number(current.completedLength))} / {formatSize(Number(current.totalLength))}
        </p>
      </div>

      <TaskActions task={current} onPause={pause} onUnpause={unpause} onRemove={remove} />

      <CollapsibleSection title="连接状态" icon={<Wifi className="h-4 w-4" />}>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-slate-400">WebSocket</span>
            <span className="ml-auto text-right text-slate-300">{connected ? '已连接' : '未连接'}</span>
          </div>
          <DetailRow icon={<Link />} label="协议" value="wss" />
          <DetailRow icon={<Globe />} label="连接数" value={current.connections ?? '0'} />
          {current.bittorrent && (
            <>
              <DetailRow icon={<Users />} label="做种数" value={current.numSeeders ?? '0'} />
              <DetailRow
                icon={<File />}
                label="做种状态"
                value={current.seeder === 'true' ? '做种中' : '下载中'}
              />
            </>
          )}
          {current.errorMessage && (
            <DetailRow icon={<File />} label="错误" value={current.errorMessage} />
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="文件列表" icon={<File className="h-4 w-4" />}>
        <div className="space-y-3">
          {current.files.length === 0 && (
            <p className="text-sm text-slate-500">无文件信息</p>
          )}
          {current.files.map((f) => {
            const fp = percent(f.length, f.completedLength)
            return (
              <div key={f.index}>
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate text-slate-300">{f.path.split('/').pop()}</span>
                  <span className="shrink-0 text-slate-500">{formatSize(Number(f.length))}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1">
                    <ProgressBar percent={fp} />
                  </div>
                  <span className="text-[10px] text-slate-600">{f.uris.length} 个源</span>
                  {f.selected === 'true' ? (
                    <span className="text-[10px] text-green-400">已选</span>
                  ) : (
                    <span className="text-[10px] text-slate-600">未选</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="区块信息" icon={<Globe className="h-4 w-4" />}>
        {loading ? (
          <p className="text-sm text-slate-500">加载中...</p>
        ) : current.numPieces ? (
          <div className="mb-3 space-y-1 text-sm">
            <DetailRow label="总区块" value={current.numPieces} />
            <DetailRow label="区块大小" value={formatSize(Number(current.pieceLength ?? '0'))} />
            {current.verifiedLength && Number(current.verifiedLength) > 0 && (
              <DetailRow label="已验证" value={formatSize(Number(current.verifiedLength))} />
            )}
          </div>
        ) : null}
        {hasPeers && (
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">对等节点</p>
            <div className="space-y-2">
              {peers.map((p, i) => (
                <div key={i} className="rounded-lg bg-slate-950 p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">{p.ip}:{p.port}</span>
                    <span className={`${p.seeder === 'true' ? 'text-green-400' : 'text-blue-400'}`}>
                      {p.seeder === 'true' ? '做种' : '下载'}
                    </span>
                  </div>
                  <div className="mt-1 flex gap-4 text-slate-500">
                    <span>↓{formatSpeed(p.downloadSpeed)}</span>
                    <span>↑{formatSpeed(p.uploadSpeed)}</span>
                    <span>{p.amChoking === 'true' ? '阻塞' : '通畅'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {hasServers && (
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">服务器连接</p>
            <div className="space-y-2">
              {servers.map((s) => (
                <div key={s.index}>
                  <p className="text-xs text-slate-600">文件 #{s.index}</p>
                  <div className="mt-1 space-y-1">
                    {s.servers.map((sv, j) => (
                      <div key={j} className="rounded-lg bg-slate-950 p-2 text-xs">
                        <div className="truncate text-slate-300">{sv.uri}</div>
                        <div className="mt-0.5 text-slate-500">↓{formatSpeed(sv.downloadSpeed)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!hasPeers && !hasServers && !current.numPieces && (
          <p className="text-sm text-slate-500">无区块信息</p>
        )}
      </CollapsibleSection>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="flex h-4 w-4 items-center text-slate-500">{icon}</span>}
      <span className="text-slate-400">{label}</span>
      <span className="ml-auto text-right text-slate-300">{value}</span>
    </div>
  )
}
