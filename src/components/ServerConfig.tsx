import { useState } from 'react'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import type { Aria2Config } from '../api/types'
import { Aria2Client } from '../api/aria2'

interface ServerConfigProps {
  config: Aria2Config
  onSave: (config: Aria2Config) => void
}

type TestStatus = 'idle' | 'testing' | 'success' | 'error'

export function ServerConfig({ config, onSave }: ServerConfigProps) {
  const [host, setHost] = useState(config.host)
  const [port, setPort] = useState(String(config.port))
  const [secret, setSecret] = useState(config.secret)
  const [protocol, setProtocol] = useState<'ws' | 'http'>(config.protocol)
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')

  const handleTest = async () => {
    setTestStatus('testing')
    const testConfig: Aria2Config = { host, port: Number(port), secret, protocol }
    const client = new Aria2Client(testConfig)
    try {
      await client.connect()
      await client.tellActive()
      client.disconnect()
      setTestStatus('success')
    } catch {
      client.disconnect()
      setTestStatus('error')
    }
  }

  const handleSave = () => {
    onSave({ host, port: Number(port), secret, protocol })
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="rounded-xl bg-slate-900 p-4">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">服务器地址</label>
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="192.168.1.100"
              className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">端口</label>
            <input
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="6800"
              inputMode="numeric"
              className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Secret Token</label>
            <input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="可选"
              type="password"
              className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">协议</label>
            <div className="flex gap-2">
              {(['ws', 'http'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setProtocol(p)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                    protocol === p
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {p === 'ws' ? 'WebSocket' : 'HTTP'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleTest}
        disabled={testStatus === 'testing'}
        className="flex items-center justify-center gap-2 rounded-lg bg-slate-800 py-3 text-sm text-white active:bg-slate-700 disabled:opacity-50"
      >
        {testStatus === 'testing' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : testStatus === 'success' ? (
          <Wifi className="h-4 w-4 text-green-400" />
        ) : testStatus === 'error' ? (
          <WifiOff className="h-4 w-4 text-red-400" />
        ) : null}
        测试连接
      </button>

      {testStatus === 'success' && (
        <p className="text-center text-xs text-green-400">连接成功</p>
      )}
      {testStatus === 'error' && (
        <p className="text-center text-xs text-red-400">连接失败，请检查地址和端口</p>
      )}

      <button
        onClick={handleSave}
        className="rounded-lg bg-blue-500 py-3 text-sm font-medium text-white active:bg-blue-600"
      >
        保存并开始
      </button>
    </div>
  )
}
