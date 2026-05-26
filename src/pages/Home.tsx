import { useState } from 'react'
import { ArrowDownToLine } from 'lucide-react'
import { Dashboard } from '../components/Dashboard'
import { DownloadList } from '../components/DownloadList'
import { Header } from '../components/Header'
import { AddDownloadSheet } from '../components/AddDownloadSheet'
import { useAria2Context } from '../context/Aria2Context'

export function Home() {
  const { config, globalStat, connecting, error } = useAria2Context()
  const [batchMode, setBatchMode] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)
  const [sheetOpen, setSheetOpen] = useState(false)

  const isNotConfigured = !config.host || config.port === 0

  if (isNotConfigured) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <ArrowDownToLine className="h-12 w-12 text-slate-700" />
        <h2 className="text-lg font-semibold text-white">欢迎使用 AriaDash</h2>
        <p className="text-center text-sm text-slate-500">配置你的 aria2 服务器连接，开始远程管理下载任务</p>
        <a
          href="#/settings"
          className="rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white"
        >
          开始配置
        </a>
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
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <p className="text-sm text-red-400">{error}</p>
        <a href="#/settings" className="text-sm text-blue-400">修改设置</a>
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
