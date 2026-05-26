import type { Aria2Config, DownloadTask, GlobalOption, GlobalStat, PeerInfo, RpcNotification, RpcResponse, ServerInfo, VersionInfo } from './types'

type PendingEntry = {
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
}

export class Aria2Client {
  private ws: WebSocket | null = null
  private connected = false
  private requestId = 0
  private pending = new Map<string, PendingEntry>()
  private notificationHandlers = new Set<(n: RpcNotification) => void>()

  constructor(private config: Aria2Config) {}

  private get baseUrl(): string {
    const { host, port, protocol } = this.config
    const scheme = protocol === 'wss' ? 'wss' : 'https'
    return `${scheme}://${host}:${port}/jsonrpc`
  }

  private get secretParam(): unknown[] {
    return this.config.secret ? ['token:' + this.config.secret] : []
  }

  async connect(): Promise<void> {
    if (this.config.protocol === 'wss') {
      await this.connectWebSocket()
    }
  }

  private connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.baseUrl)
      ws.onopen = () => {
        this.connected = true
        resolve()
      }
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as RpcResponse | RpcNotification
          if ('id' in data && data.id && this.pending.has(data.id)) {
            const entry = this.pending.get(data.id)!
            this.pending.delete(data.id)
            if (data.error) {
              entry.reject(new Error(data.error.message))
            } else {
              entry.resolve(data.result)
            }
          } else if ('method' in data && !('id' in data)) {
            this.notificationHandlers.forEach((h) => h(data as RpcNotification))
          }
        } catch { /* ignore malformed messages */ }
      }
      ws.onclose = () => {
        this.connected = false
        this.rejectAll('Connection closed')
      }
      ws.onerror = () => {
        reject(new Error('WebSocket connection failed'))
      }
      this.ws = ws
    })
  }

  disconnect(): void {
    this.ws?.close()
    this.ws = null
    this.connected = false
    this.rejectAll('Disconnected')
  }

  get isConnected(): boolean {
    return this.connected
  }

  onNotification(handler: (n: RpcNotification) => void): () => void {
    this.notificationHandlers.add(handler)
    return () => this.notificationHandlers.delete(handler)
  }

  private rejectAll(reason: string) {
    this.pending.forEach((entry) => entry.reject(new Error(reason)))
    this.pending.clear()
  }

  private async call<T>(method: string, ...params: unknown[]): Promise<T> {
    if (this.config.protocol === 'wss' && this.ws && this.connected) {
      return this.callWs<T>(method, params)
    }
    return this.callHttp<T>(method, params)
  }

  private callWs<T>(method: string, params: unknown[]): Promise<T> {
    const id = String(++this.requestId)
    const msg: string = JSON.stringify({
      jsonrpc: '2.0',
      id,
      method,
      params: [...this.secretParam, ...params],
    })
    this.ws!.send(msg)
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject })
    }) as Promise<T>
  }

  private async callHttp<T>(method: string, params: unknown[]): Promise<T> {
    const id = String(++this.requestId)
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        params: [...this.secretParam, ...params],
      }),
    })
    const data = (await res.json()) as RpcResponse<T>
    if (data.error) throw new Error(data.error.message)
    return data.result!
  }

  addUri(uris: string[], options?: Record<string, unknown>): Promise<string> {
    return this.call<string>('aria2.addUri', uris, options ?? {})
  }

  remove(gid: string): Promise<string> {
    return this.call<string>('aria2.remove', gid)
  }

  forceRemove(gid: string): Promise<string> {
    return this.call<string>('aria2.forceRemove', gid)
  }

  pause(gid: string): Promise<string> {
    return this.call<string>('aria2.pause', gid)
  }

  pauseAll(): Promise<string> {
    return this.call<string>('aria2.pauseAll')
  }

  forcePause(gid: string): Promise<string> {
    return this.call<string>('aria2.forcePause', gid)
  }

  unpause(gid: string): Promise<string> {
    return this.call<string>('aria2.unpause', gid)
  }

  unpauseAll(): Promise<string> {
    return this.call<string>('aria2.unpauseAll')
  }

  tellStatus(gid: string): Promise<DownloadTask> {
    return this.call<DownloadTask>('aria2.tellStatus', gid)
  }

  tellActive(): Promise<DownloadTask[]> {
    return this.call<DownloadTask[]>('aria2.tellActive')
  }

  tellWaiting(offset: number, num: number): Promise<DownloadTask[]> {
    return this.call<DownloadTask[]>('aria2.tellWaiting', offset, num)
  }

  tellStopped(offset: number, num: number): Promise<DownloadTask[]> {
    return this.call<DownloadTask[]>('aria2.tellStopped', offset, num)
  }

  getGlobalStat(): Promise<GlobalStat> {
    return this.call<GlobalStat>('aria2.getGlobalStat')
  }

  removeDownloadResult(gid: string): Promise<string> {
    return this.call<string>('aria2.removeDownloadResult', gid)
  }

  getPeers(gid: string): Promise<PeerInfo[]> {
    return this.call<PeerInfo[]>('aria2.getPeers', gid)
  }

  getServers(gid: string): Promise<ServerInfo[]> {
    return this.call<ServerInfo[]>('aria2.getServers', gid)
  }

  getGlobalOption(): Promise<GlobalOption> {
    return this.call<GlobalOption>('aria2.getGlobalOption')
  }

  changeGlobalOption(options: Record<string, string>): Promise<string> {
    return this.call<string>('aria2.changeGlobalOption', options)
  }

  addTorrent(torrentBase64: string, uris?: string[], options?: Record<string, unknown>): Promise<string> {
    return this.call<string>('aria2.addTorrent', torrentBase64, uris ?? [], options ?? {})
  }

  changeOption(gid: string, options: Record<string, string>): Promise<string> {
    return this.call<string>('aria2.changeOption', gid, options)
  }

  changePosition(gid: string, pos: number, how: string): Promise<number> {
    return this.call<number>('aria2.changePosition', gid, pos, how)
  }

  purgeDownloadResult(): Promise<string> {
    return this.call<string>('aria2.purgeDownloadResult')
  }

  getVersion(): Promise<VersionInfo> {
    return this.call<VersionInfo>('aria2.getVersion')
  }
}
