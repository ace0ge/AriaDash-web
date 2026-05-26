import { useState, useEffect } from 'react'
import { Settings, Save } from 'lucide-react'
import { useAria2Context } from '../context/Aria2Context'
import { useI18n } from '../i18n'

type OptionKey = 'max-concurrent-downloads' | 'max-overall-download-limit' | 'max-overall-upload-limit' | 'max-connection-per-server' | 'continue'

const KB_KEYS = new Set(['max-overall-download-limit', 'max-overall-upload-limit'])

const FIELDS: { key: OptionKey; labelKey: string; type: 'number' | 'bool' }[] = [
  { key: 'max-concurrent-downloads', labelKey: 'settings.concurrentDownloads', type: 'number' },
  { key: 'max-overall-download-limit', labelKey: 'settings.downloadLimit', type: 'number' },
  { key: 'max-overall-upload-limit', labelKey: 'settings.uploadLimit', type: 'number' },
  { key: 'max-connection-per-server', labelKey: 'settings.connectionsPerServer', type: 'number' },
  { key: 'continue', labelKey: 'settings.continue', type: 'bool' },
]

function bToKb(v: Record<string, string>, keys: Set<string>): Record<string, string> {
  const r: Record<string, string> = {}
  for (const k of Object.keys(v)) {
    const val = v[k] ?? '0'
    r[k] = keys.has(k) ? String(Math.round(Number(val) / 1024)) : val
  }
  return r
}

function kbToB(v: Record<string, string>, keys: Set<string>): Record<string, string> {
  const r: Record<string, string> = {}
  for (const k of Object.keys(v)) {
    const val = v[k] ?? '0'
    r[k] = keys.has(k) ? String(Number(val) * 1024) : val
  }
  return r
}

export function AriaSettings() {
  const { getGlobalOption, changeGlobalOption } = useAria2Context()
  const { t } = useI18n()
  const [values, setValues] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getGlobalOption().then((opt) => {
      if (opt) {
        setValues(bToKb(opt, KB_KEYS))
        setLoaded(true)
      }
    })
  }, [getGlobalOption])

  const handleSave = () => {
    changeGlobalOption(kbToB(values, KB_KEYS))
  }

  if (!loaded) return null

  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
        <Settings className="h-4 w-4" />
        {t('settings.ariaTitle')}
      </h3>
      <div className="mt-3 space-y-3">
        {FIELDS.map(({ key, labelKey, type }) => (
          <div key={key}>
            <label className="mb-1 block text-xs text-slate-400">{t(labelKey)}</label>
            {type === 'bool' ? (
              <button
                onClick={() => setValues((v) => ({ ...v, [key]: v[key] === 'true' ? 'false' : 'true' }))}
                className={`h-7 w-12 rounded-full transition-colors ${values[key] === 'true' ? 'bg-blue-500' : 'bg-slate-700'}`}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white transition-transform ${values[key] === 'true' ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            ) : (
              <input
                value={values[key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                inputMode="numeric"
                className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 py-2.5 text-sm font-medium text-white active:bg-blue-600"
      >
        <Save className="h-4 w-4" />
        {t('settings.ariaSave')}
      </button>
    </div>
  )
}
