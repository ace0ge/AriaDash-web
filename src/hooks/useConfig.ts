import { useState, useCallback } from 'react'
import type { Aria2Config } from '../api/types'
import { DEFAULT_CONFIG } from '../api/types'

const STORAGE_KEY = 'ariadash-config'

function loadConfig(): Aria2Config {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored) as Aria2Config
  } catch { /* ignore */ }
  return DEFAULT_CONFIG
}

function saveConfig(config: Aria2Config): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function useConfig() {
  const [config, setConfigState] = useState<Aria2Config>(loadConfig)

  const setConfig = useCallback((next: Aria2Config) => {
    setConfigState(next)
    saveConfig(next)
  }, [])

  return { config, setConfig } as const
}
