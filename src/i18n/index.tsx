import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { zh } from './zh'

export type Locale = 'zh' | 'en'

interface Dict { [key: string]: unknown }

const dicts: Record<Locale, Dict> = {
  zh,
  en: {} as Dict,
}

async function loadEn() {
  const m = await import('./en')
  dicts.en = m.en
}
loadEn()

function loadLocale(): Locale {
  try {
    const stored = localStorage.getItem('ariadash-locale')
    if (stored === 'en' || stored === 'zh') return stored
  } catch {}
  return 'zh'
}

interface I18nContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (path: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function lookup(obj: Dict, path: string): string | undefined {
  const keys = path.split('.')
  let cur: unknown = obj
  for (const key of keys) {
    if (cur && typeof cur === 'object') {
      cur = (cur as Dict)[key]
    } else {
      return undefined
    }
  }
  return typeof cur === 'string' ? cur : undefined
}

function tpl(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(loadLocale)

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('ariadash-locale', l)
  }, [])

  const t = useCallback((path: string, vars?: Record<string, string | number>): string => {
    const dict = dicts[locale]
    const val = lookup(dict, path)
    return tpl(val ?? path, vars)
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
