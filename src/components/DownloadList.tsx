import { useState, useMemo, useEffect } from 'react'
import { DownloadItem } from './DownloadItem'
import { BatchActionBar } from './BatchActionBar'
import { useAria2Context } from '../context/Aria2Context'
import { useI18n } from '../i18n'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import type { DownloadTask } from '../api/types'

type FilterTab = 'all' | 'active' | 'waiting' | 'paused' | 'complete' | 'error'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '活跃' },
  { key: 'waiting', label: '等待' },
  { key: 'paused', label: '暂停' },
  { key: 'complete', label: '完成' },
  { key: 'error', label: '错误' },
]

const TAB_KEYS: Record<FilterTab, string> = {
  all: 'status.all',
  active: 'status.active',
  waiting: 'status.waiting',
  paused: 'status.paused',
  complete: 'status.complete',
  error: 'status.error',
}

interface DownloadListProps {
  batchMode: boolean
  onBatchModeChange: (batchMode: boolean, count: number) => void
  onAddClick: () => void
}

export function DownloadList({ batchMode, onBatchModeChange, onAddClick }: DownloadListProps) {
  const { tasks, pause, unpause, remove, batchPause, batchUnpause, batchRemove, moveTask, purgeDownloadResult } = useAria2Context()
  const { t } = useI18n()
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    if (filterTab === 'all') return tasks
    return tasks.filter((task) => task.status === filterTab)
  }, [tasks, filterTab])

  useEffect(() => {
    onBatchModeChange(batchMode, selected.size)
  }, [batchMode, selected.size, onBatchModeChange])

  const handleSelect = (gid: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(gid)) next.delete(gid)
      else next.add(gid)
      return next
    })
  }

  const closeBatch = () => {
    setSelected(new Set())
    onBatchModeChange(false, 0)
  }

  const hasActive = [...selected].some((gid) => tasks.find((task) => task.gid === gid)?.status === 'active')
  const hasPaused = [...selected].some((gid) => tasks.find((task) => task.gid === gid)?.status === 'paused')

  const handleMove = (task: DownloadTask, dir: -1 | 1) => {
    moveTask(task.gid, dir, 'POS_CUR')
  }

  return (
    <div className="flex flex-1 flex-col overflow-x-hidden">
      <div className="flex gap-1 overflow-x-auto px-2 pb-2 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filterTab === tab.key
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t(TAB_KEYS[tab.key])}
          </button>
        ))}
        {filterTab === 'complete' && (
          <button
            onClick={() => { purgeDownloadResult(); setFilterTab('all') }}
            className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-red-400"
          >
            <Trash2 className="h-3 w-3" />
            {t('batch.purge')}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-24">
        <div className="flex flex-col gap-2">
          {filtered.map((task, idx) => (
            <div key={task.gid} className="flex items-start gap-1">
              {filterTab === 'waiting' && (
                <div className="flex flex-col gap-0.5 pt-3">
                  <button
                    onClick={() => handleMove(task, -1)}
                    className="rounded p-0.5 text-slate-600 hover:text-slate-400"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(task, 1)}
                    disabled={idx === filtered.length - 1}
                    className="rounded p-0.5 text-slate-600 hover:text-slate-400 disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <div className="flex-1">
                <DownloadItem
                  task={task}
                  batchMode={batchMode}
                  selected={selected.has(task.gid)}
                  onSelect={handleSelect}
                  onPause={pause}
                  onUnpause={unpause}
                  onRemove={remove}
                />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-600">{t('task.empty')}</p>
          )}
        </div>
      </div>
      {batchMode && (
        <BatchActionBar
          selectedCount={selected.size}
          hasActive={hasActive}
          hasPaused={hasPaused}
          onBatchPause={() => { batchPause([...selected]); closeBatch() }}
          onBatchUnpause={() => { batchUnpause([...selected]); closeBatch() }}
          onBatchRemove={() => { batchRemove([...selected]); closeBatch() }}
        />
      )}
      {!batchMode && (
        <button
          onClick={onAddClick}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30 active:bg-blue-600"
          aria-label={t('sheet.title')}
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
