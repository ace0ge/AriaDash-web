import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, File, Globe, Link, Users, Wifi, CheckSquare } from 'lucide-react'
import { useAria2Context } from '../context/Aria2Context'
import type { DownloadTask, PeerInfo, ServerInfo } from '../api/types'
import { ProgressBar } from '../components/ProgressBar'
import { StatusBadge } from '../components/StatusBadge'
import { TaskActions } from '../components/TaskActions'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { useSwipe } from '../hooks/useSwipe'
import { useI18n } from '../i18n'

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

function etaStr(total: string, completed: string, speed: string): string {
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
  const { tasks, connected, pause, unpause, remove, getTaskDetail, getPeers, getServers, changeTaskOption } = useAria2Context()
  const { t } = useI18n()
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
        <p className="text-sm text-slate-500">{t('task.notFound')}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-sm text-blue-400">{t('task.back')}</button>
      </div>
    )
  }

  const current = detail ?? task
  const pct = percent(current.totalLength, current.completedLength)
  const name = fileName(current)
  const hasPeers = peers.length > 0
  const hasServers = servers.length > 0
  const isBt = !!current.bittorrent

  const [btSelected, setBtSelected] = useState<Set<string>>(
    new Set(current.files.filter((f) => f.selected === 'true').map((f) => f.index))
  )

  const toggleBtFile = (index: string) => {
    setBtSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const applyBtSelection = () => {
    const indices = [...btSelected].join(',')
    changeTaskOption(current.gid, { 'select-file': indices })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4" {...handlers}>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('task.back')}
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
            ETA {etaStr(current.totalLength, current.completedLength, current.downloadSpeed)}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {formatSize(Number(current.completedLength))} / {formatSize(Number(current.totalLength))}
        </p>
      </div>

      <TaskActions task={current} onPause={pause} onUnpause={unpause} onRemove={remove} />

      <CollapsibleSection title={t('detail.connection')} icon={<Wifi className="h-4 w-4" />}>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-slate-400">WebSocket</span>
            <span className="ml-auto text-right text-slate-300">{connected ? t('settings.connected') : t('settings.disconnected')}</span>
          </div>
          <DetailRow icon={<Link />} label={t('detail.protocol')} value="wss" />
          <DetailRow icon={<Globe />} label={t('detail.connections')} value={current.connections ?? '0'} />
          {current.bittorrent && (
            <>
              <DetailRow icon={<Users />} label={t('detail.seeders')} value={current.numSeeders ?? '0'} />
              <DetailRow
                icon={<File />}
                label={t('detail.seeder')}
                value={current.seeder === 'true' ? t('detail.seeding') : t('detail.downloading')}
              />
            </>
          )}
          {current.errorMessage && (
            <DetailRow icon={<File />} label="Error" value={current.errorMessage} />
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t('detail.files')} icon={<File className="h-4 w-4" />}>
        <div className="space-y-3">
          {current.files.length === 0 && (
            <p className="text-sm text-slate-500">{t('task.empty')}</p>
          )}
          {current.files.map((f) => {
            const fp = percent(f.length, f.completedLength)
            const isSel = btSelected.has(f.index)
            return (
              <div key={f.index}>
                <div className="flex items-center gap-2">
                  {isBt && (current.status === 'paused' || current.status === 'waiting') && (
                    <button
                      onClick={() => toggleBtFile(f.index)}
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 ${
                        isSel ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                      }`}
                    >
                      {isSel && <span className="text-[8px] text-white">✓</span>}
                    </button>
                  )}
                  <span className="truncate text-sm text-slate-300">{f.path.split('/').pop()}</span>
                  <span className="shrink-0 text-sm text-slate-500">{formatSize(Number(f.length))}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1">
                    <ProgressBar percent={fp} />
                  </div>
                  <span className="text-[10px] text-slate-600">{t('detail.sources', { n: f.uris.length })}</span>
                  {f.selected === 'true' ? (
                    <span className="text-[10px] text-green-400">{t('detail.selected')}</span>
                  ) : (
                    <span className="text-[10px] text-slate-600">{t('detail.unselected')}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        {isBt && (current.status === 'paused' || current.status === 'waiting') && (
          <button
            onClick={applyBtSelection}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-400"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            {t('detail.applySelection')}
          </button>
        )}
      </CollapsibleSection>

      <CollapsibleSection title={t('detail.blocks')} icon={<Globe className="h-4 w-4" />}>
        {loading ? (
          <p className="text-sm text-slate-500">{t('detail.loading')}</p>
        ) : current.numPieces ? (
          <div className="mb-3 space-y-1 text-sm">
            <DetailRow label={t('detail.totalPieces')} value={current.numPieces} />
            <DetailRow label={t('detail.pieceSize')} value={formatSize(Number(current.pieceLength ?? '0'))} />
            {current.verifiedLength && Number(current.verifiedLength) > 0 && (
              <DetailRow label={t('detail.verified')} value={formatSize(Number(current.verifiedLength))} />
            )}
          </div>
        ) : null}
        {hasPeers && (
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">{t('detail.peers')}</p>
            <div className="space-y-2">
              {peers.map((p, i) => (
                <div key={i} className="rounded-lg bg-slate-950 p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">{p.ip}:{p.port}</span>
                    <span className={`${p.seeder === 'true' ? 'text-green-400' : 'text-blue-400'}`}>
                      {p.seeder === 'true' ? t('detail.seeding') : t('detail.downloading')}
                    </span>
                  </div>
                  <div className="mt-1 flex gap-4 text-slate-500">
                    <span>↓{formatSpeed(p.downloadSpeed)}</span>
                    <span>↑{formatSpeed(p.uploadSpeed)}</span>
                    <span>{p.amChoking === 'true' ? t('detail.choked') : t('detail.unchoked')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {hasServers && (
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">{t('detail.servers')}</p>
            <div className="space-y-2">
              {servers.map((s) => (
                <div key={s.index}>
                  <p className="text-xs text-slate-600">{t('detail.files')} #{s.index}</p>
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
          <p className="text-sm text-slate-500">{t('detail.noPeers')}</p>
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
