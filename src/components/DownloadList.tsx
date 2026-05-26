import { useState, useMemo, useEffect } from 'react'
import { DownloadItem } from './DownloadItem'
import { BatchActionBar } from './BatchActionBar'
import { useAria2Context } from '../context/Aria2Context'
import { Plus } from 'lucide-react'

type FilterTab = 'all' | 'active' | 'waiting' | 'paused' | 'complete' | 'error'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '活跃' },
  { key: 'waiting', label: '等待' },
  { key: 'paused', label: '暂停' },
  { key: 'complete', label: '完成' },
  { key: 'error', label: '错误' },
]

interface DownloadListProps {
  batchMode: boolean
  onBatchModeChange: (batchMode: boolean, count: number) => void
  onAddClick: () => void
}

export function DownloadList({ batchMode, onBatchModeChange, onAddClick }: DownloadListProps) {
  const { tasks, pause, unpause, remove, batchPause, batchUnpause, batchRemove } = useAria2Context()
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    if (filterTab === 'all') return tasks
    return tasks.filter((t) => t.status === filterTab)
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

  const hasActive = [...selected].some((gid) => tasks.find((t) => t.gid === gid)?.status === 'active')
  const hasPaused = [...selected].some((gid) => tasks.find((t) => t.gid === gid)?.status === 'paused')

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
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
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-24">
        <div className="flex flex-col gap-2">
          {filtered.map((task) => (
            <DownloadItem
              key={task.gid}
              task={task}
              batchMode={batchMode}
              selected={selected.has(task.gid)}
              onSelect={handleSelect}
              onPause={pause}
              onUnpause={unpause}
              onRemove={remove}
            />
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-600">暂无任务</p>
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
          aria-label="新建下载"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
