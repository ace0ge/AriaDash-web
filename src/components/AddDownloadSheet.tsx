import { useState } from 'react'
import { X, Link2, File } from 'lucide-react'
import { AddUrlForm } from './AddUrlForm'
import { TorrentUpload } from './TorrentUpload'
import { useAria2Context } from '../context/Aria2Context'
import { useI18n } from '../i18n'

interface AddDownloadSheetProps {
  open: boolean
  onClose: () => void
}

type Tab = 'url' | 'torrent'

export function AddDownloadSheet({ open, onClose }: AddDownloadSheetProps) {
  const { addUri } = useAria2Context()
  const { t } = useI18n()
  const [tab, setTab] = useState<Tab>('url')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div
        className="w-full rounded-t-2xl bg-slate-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <h3 className="text-base font-medium text-white">{t('sheet.title')}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-2 px-4 pt-3">
          <button
            onClick={() => setTab('url')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
              tab === 'url' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500'
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
            {t('sheet.urlTab')}
          </button>
          <button
            onClick={() => setTab('torrent')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
              tab === 'torrent' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500'
            }`}
          >
            <File className="h-3.5 w-3.5" />
            {t('sheet.torrentTab')}
          </button>
        </div>
        {tab === 'url' ? (
          <AddUrlForm onSubmit={(uri) => { addUri(uri); onClose() }} />
        ) : (
          <TorrentUpload onClose={onClose} />
        )}
      </div>
    </div>
  )
}
