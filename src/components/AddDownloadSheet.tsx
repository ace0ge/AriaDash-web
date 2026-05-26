import { X } from 'lucide-react'
import { AddUrlForm } from './AddUrlForm'
import { useAria2Context } from '../context/Aria2Context'

interface AddDownloadSheetProps {
  open: boolean
  onClose: () => void
}

export function AddDownloadSheet({ open, onClose }: AddDownloadSheetProps) {
  const { addUri } = useAria2Context()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div
        className="w-full rounded-t-2xl bg-slate-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <h3 className="text-base font-medium text-white">新建下载</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>
        <AddUrlForm onSubmit={(uri) => { addUri(uri); onClose() }} />
      </div>
    </div>
  )
}
