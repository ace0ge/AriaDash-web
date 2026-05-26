import { useState } from 'react'
import { Plus } from 'lucide-react'

interface AddUrlFormProps {
  onSubmit: (uri: string) => void
}

export function AddUrlForm({ onSubmit }: AddUrlFormProps) {
  const [uri, setUri] = useState('')

  const handleSubmit = () => {
    const trimmed = uri.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setUri('')
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <input
        value={uri}
        onChange={(e) => setUri(e.target.value)}
        placeholder="输入下载链接"
        className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50"
      />
      <button
        onClick={handleSubmit}
        disabled={!uri.trim()}
        className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 py-3 text-sm font-medium text-white active:bg-blue-600 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        开始下载
      </button>
    </div>
  )
}
