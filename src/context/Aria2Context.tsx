import { createContext, useContext, type ReactNode } from 'react'
import type { Aria2Config, DownloadTask, GlobalOption, GlobalStat, PeerInfo, ServerInfo, VersionInfo } from '../api/types'
import { useConfig } from '../hooks/useConfig'
import { useAria2 } from '../hooks/useAria2'

interface Aria2ContextValue {
  config: Aria2Config
  setConfig: (next: Aria2Config) => void
  connected: boolean
  connecting: boolean
  tasks: DownloadTask[]
  globalStat: GlobalStat | null
  error: string | null
  addUri: (uri: string, options?: Record<string, unknown>) => Promise<void>
  pause: (gid: string) => Promise<void>
  unpause: (gid: string) => Promise<void>
  remove: (gid: string, force?: boolean) => Promise<void>
  batchPause: (gids: string[]) => Promise<void>
  batchUnpause: (gids: string[]) => Promise<void>
  batchRemove: (gids: string[], force?: boolean) => Promise<void>
  getTaskDetail: (gid: string) => Promise<DownloadTask | null>
  getPeers: (gid: string) => Promise<PeerInfo[]>
  getServers: (gid: string) => Promise<ServerInfo[]>
  getGlobalOption: () => Promise<GlobalOption | null>
  changeGlobalOption: (options: Record<string, string>) => Promise<void>
  addTorrent: (base64: string, options?: Record<string, unknown>) => Promise<void>
  changeTaskOption: (gid: string, options: Record<string, string>) => Promise<void>
  moveTask: (gid: string, pos: number, how: string) => Promise<void>
  purgeDownloadResult: () => Promise<void>
  getVersion: () => Promise<VersionInfo | null>
}

const Aria2Context = createContext<Aria2ContextValue | null>(null)

export function Aria2Provider({ children }: { children: ReactNode }) {
  const { config, setConfig } = useConfig()
  const aria2 = useAria2(config)

  return (
    <Aria2Context.Provider value={{ config, setConfig, ...aria2 }}>
      {children}
    </Aria2Context.Provider>
  )
}

export function useAria2Context(): Aria2ContextValue {
  const ctx = useContext(Aria2Context)
  if (!ctx) throw new Error('useAria2Context must be used within Aria2Provider')
  return ctx
}
