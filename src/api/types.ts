export type TaskStatus = 'active' | 'waiting' | 'paused' | 'error' | 'complete' | 'removed'

export interface DownloadTask {
  gid: string
  status: TaskStatus
  totalLength: string
  completedLength: string
  uploadLength: string
  downloadSpeed: string
  uploadSpeed: string
  dir: string
  files: FileInfo[]
  bittorrent?: BittorrentInfo
  errorCode?: string
  errorMessage?: string
  connections?: string
  numSeeders?: string
  seeder?: 'true' | 'false'
  verifiedLength?: string
  verifyIntegrityPending?: string
}

export interface FileInfo {
  index: string
  path: string
  length: string
  completedLength: string
  selected: 'true' | 'false'
  uris: { uri: string; status: string }[]
}

export interface BittorrentInfo {
  name?: string
  info?: { name: string }
}

export interface GlobalStat {
  downloadSpeed: string
  uploadSpeed: string
  numActive: string
  numWaiting: string
  numStopped: string
  numStoppedTotal: string
}

export interface Aria2Config {
  host: string
  port: number
  secret: string
  protocol: 'ws' | 'http'
}

export const DEFAULT_CONFIG: Aria2Config = {
  host: '192.168.1.100',
  port: 6800,
  secret: '',
  protocol: 'ws',
}

export interface RpcRequest {
  jsonrpc: '2.0'
  id: string
  method: string
  params: unknown[]
}

export interface RpcResponse<T = unknown> {
  jsonrpc: '2.0'
  id: string
  result?: T
  error?: { code: number; message: string }
}

export interface RpcNotification<T = unknown> {
  jsonrpc: '2.0'
  method: string
  params: [{}, T]
}
