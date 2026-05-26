import { useEffect, useRef, useState, useCallback } from 'react'
import { Aria2Client } from '../api/aria2'
import type { Aria2Config, DownloadTask, GlobalStat, RpcNotification } from '../api/types'

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
    await client.addUri([uri], options)
    await fetchAll(client)
  }, [fetchAll])

  const pause = useCallback(async (gid: string) => {
    const client = clientRef.current
    if (!client) return
    await client.pause(gid)
    await fetchAll(client)
  }, [fetchAll])

  const unpause = useCallback(async (gid: string) => {
    const client = clientRef.current
    if (!client) return
    await client.unpause(gid)
    await fetchAll(client)
  }, [fetchAll])

  const remove = useCallback(async (gid: string, force?: boolean) => {
    const client = clientRef.current
    if (!client) return
    if (force) await client.forceRemove(gid)
    else await client.remove(gid)
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
  }
}
