import { useState, useRef } from 'react'
import { Upload, Plus } from 'lucide-react'
import { useAria2Context } from '../context/Aria2Context'

interface TorrentUploadProps {
  onClose: () => void
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      resolve(base64!)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function TorrentUpload({ onClose }: TorrentUploadProps) {
  const { addTorrent } = useAria2Context()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    try {
      const base64 = await readAsBase64(file)
      await addTorrent(base64)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <input ref={inputRef} type="file" accept=".torrent" onChange={handleFile} className="hidden" />
      {!file ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-700 py-8"
        >
          <Upload className="h-8 w-8 text-slate-500" />
          <span className="text-sm text-slate-400">点击选择 .torrent 文件</span>
        </button>
      ) : (
        <div className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2">
          <span className="truncate text-sm text-slate-300">{file.name}</span>
          <button
            onClick={() => setFile(null)}
            className="text-sm text-slate-500"
          >
            更换
          </button>
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 py-3 text-sm font-medium text-white active:bg-blue-600 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        {loading ? '上传中...' : '开始下载'}
      </button>
    </div>
  )
}
