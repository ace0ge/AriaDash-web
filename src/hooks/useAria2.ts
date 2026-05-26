import { useEffect, useRef, useState, useCallback } from 'react'
import { Aria2Client } from '../api/aria2'
import type { Aria2Config, DownloadTask, GlobalOption, GlobalStat, PeerInfo, RpcNotification, ServerInfo, VersionInfo } from '../api/types'

export function useAria2(config: Aria2Config) {
  const clientRef = useRef<Aria2Client | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [tasks, setTasks] = useState<DownloadTask[]>([])
  const [globalStat, setGlobalStat] = useState<GlobalStat | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async (client: Aria2Client) => {
    try {
      const [active, waiting, stopped, stat] = await Promise.all([
        client.tellActive(),
        client.tellWaiting(0, 100),
        client.tellStopped(0, 100),
        client.getGlobalStat(),
      ])
      setTasks([...active, ...waiting, ...stopped])
      setGlobalStat(stat)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch tasks')
    }
  }, [])

  useEffect(() => {
    const client = new Aria2Client(config)
    clientRef.current = client
    setConnecting(true)
    setError(null)

    client.connect().then(() => {
      setConnected(true)
      setConnecting(false)
      fetchAll(client)

      const unsubscribe = client.onNotification((n: RpcNotification) => {
        if (n.method.startsWith('aria2.onDownload')) {
          fetchAll(client)
        }
      })

      const interval = setInterval(() => fetchAll(client), 3000)

      return () => {
        unsubscribe()
        clearInterval(interval)
      }
    }).catch((e) => {
      setConnecting(false)
      setError(e instanceof Error ? e.message : 'Connection failed')
    })

    return () => {
      client.disconnect()
      clientRef.current = null
    }
  }, [config, fetchAll])

  const addUri = useCallback(async (uri: string, options?: Record<string, unknown>) => {
    const client = clientRef.current
    if (!client) return
    try { await client.addUri([uri], options) } catch {}
    await fetchAll(client)
  }, [fetchAll])

  const pause = useCallback(async (gid: string) => {
    const client = clientRef.current
    if (!client) return
    try { await client.pause(gid) } catch {}
    await fetchAll(client)
  }, [fetchAll])

  const unpause = useCallback(async (gid: string) => {
    const client = clientRef.current
    if (!client) return
    try { await client.unpause(gid) } catch {}
    await fetchAll(client)
  }, [fetchAll])

  const remove = useCallback(async (gid: string, force?: boolean) => {
    const client = clientRef.current
    if (!client) return
    try {
      if (force) await client.forceRemove(gid)
      else await client.remove(gid)
    } catch {}
    await fetchAll(client)
  }, [fetchAll])

  const batchPause = useCallback(async (gids: string[]) => {
    const client = clientRef.current
    if (!client) return
    await Promise.allSettled(gids.map((g) => client.pause(g)))
    await fetchAll(client)
  }, [fetchAll])

  const batchUnpause = useCallback(async (gids: string[]) => {
    const client = clientRef.current
    if (!client) return
    await Promise.allSettled(gids.map((g) => client.unpause(g)))
    await fetchAll(client)
  }, [fetchAll])

  const batchRemove = useCallback(async (gids: string[], force?: boolean) => {
    const client = clientRef.current
    if (!client) return
    const fn = force ? (g: string) => client.forceRemove(g) : (g: string) => client.remove(g)
    await Promise.allSettled(gids.map(fn))
    await fetchAll(client)
  }, [fetchAll])

  const getTaskDetail = useCallback(async (gid: string): Promise<DownloadTask | null> => {
    const client = clientRef.current
    if (!client) return null
    try { return await client.tellStatus(gid) } catch { return null }
  }, [])

  const getPeers = useCallback(async (gid: string): Promise<PeerInfo[]> => {
    const client = clientRef.current
    if (!client) return []
    try { return await client.getPeers(gid) } catch { return [] }
  }, [])

  const getServers = useCallback(async (gid: string): Promise<ServerInfo[]> => {
    const client = clientRef.current
    if (!client) return []
    try { return await client.getServers(gid) } catch { return [] }
  }, [])

  const getGlobalOption = useCallback(async (): Promise<GlobalOption | null> => {
    const client = clientRef.current
    if (!client) return null
    try { return await client.getGlobalOption() } catch { return null }
  }, [])

  const changeGlobalOption = useCallback(async (options: Record<string, string>): Promise<void> => {
    const client = clientRef.current
    if (!client) return
    try { await client.changeGlobalOption(options) } catch {}
  }, [])

  const addTorrent = useCallback(async (base64: string, options?: Record<string, unknown>): Promise<void> => {
    const client = clientRef.current
    if (!client) return
    try { await client.addTorrent(base64, [], options) } catch {}
    await fetchAll(client)
  }, [fetchAll])

  const changeTaskOption = useCallback(async (gid: string, options: Record<string, string>): Promise<void> => {
    const client = clientRef.current
    if (!client) return
    try { await client.changeOption(gid, options) } catch {}
  }, [])

  const moveTask = useCallback(async (gid: string, pos: number, how: string): Promise<void> => {
    const client = clientRef.current
    if (!client) return
    try { await client.changePosition(gid, pos, how) } catch {}
    await fetchAll(client)
  }, [fetchAll])

  const purgeDownloadResult = useCallback(async (): Promise<void> => {
    const client = clientRef.current
    if (!client) return
    try { await client.purgeDownloadResult() } catch {}
    await fetchAll(client)
  }, [fetchAll])

  const getVersion = useCallback(async (): Promise<VersionInfo | null> => {
    const client = clientRef.current
    if (!client) return null
    try { return await client.getVersion() } catch { return null }
  }, [])

  return {
    connected,
    connecting,
    tasks,
    globalStat,
    error,
    addUri,
    pause,
    unpause,
    remove,
    batchPause,
    batchUnpause,
    batchRemove,
    getTaskDetail,
    getPeers,
    getServers,
    getGlobalOption,
    changeGlobalOption,
    addTorrent,
    changeTaskOption,
    moveTask,
    purgeDownloadResult,
    getVersion,
  }
}
