import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ServerConfig } from '../components/ServerConfig'
import { useAria2Context } from '../context/Aria2Context'

export function Settings() {
  const navigate = useNavigate()
  const { config, setConfig } = useAria2Context()

  return (
    <div className="flex flex-1 flex-col p-4">
      <button
        onClick={() => navigate('/')}
        className="mb-2 flex items-center gap-1 text-sm text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </button>
      <h2 className="mb-4 text-base font-semibold text-white">服务器设置</h2>
      <ServerConfig config={config} onSave={(c) => { setConfig(c); navigate('/') }} />
    </div>
  )
}
