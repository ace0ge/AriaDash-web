import { useState } from 'react'
import { Dashboard } from '../components/Dashboard'
import { DownloadList } from '../components/DownloadList'
import { Header } from '../components/Header'
import { AddDownloadSheet } from '../components/AddDownloadSheet'
import { useAria2Context } from '../context/Aria2Context'

export function Home() {
  const { globalStat, connected, connecting, error } = useAria2Context()
  const [batchMode, setBatchMode] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)
  const [sheetOpen, setSheetOpen] = useState(false)

  if (!connected && !connecting && !error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p className="text-sm text-slate-500">未连接到 aria2 服务器</p>
        <a href="#/settings" className="mt-4 text-sm text-blue-400">前往设置</a>
      </div>
    )
  }

  if (connecting) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p className="text-sm text-slate-400">正在连接...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p className="text-sm text-red-400">{error}</p>
        <a href="#/settings" className="mt-4 text-sm text-blue-400">修改设置</a>
      </div>
    )
  }

  return (
    <>
      <Header
        batchMode={batchMode}
        selectedCount={selectedCount}
        onToggleBatch={() => setBatchMode((b) => !b)}
      />
      <Dashboard globalStat={globalStat} />
      <DownloadList
        batchMode={batchMode}
        onBatchModeChange={(b, count) => { setBatchMode(b); setSelectedCount(count) }}
        onAddClick={() => setSheetOpen(true)}
      />
      <AddDownloadSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  )
}
