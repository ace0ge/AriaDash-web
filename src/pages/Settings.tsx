import { useEffect, useState } from 'react'
import { ArrowLeft, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ServerConfig } from '../components/ServerConfig'
import { AriaSettings } from '../components/AriaSettings'
import { useAria2Context } from '../context/Aria2Context'
import { useI18n } from '../i18n'
import type { Locale } from '../i18n/index'
import type { VersionInfo } from '../api/types'

export function Settings() {
  const navigate = useNavigate()
  const { config, setConfig, getVersion } = useAria2Context()
  const { t, locale, setLocale } = useI18n()
  const [version, setVersion] = useState<VersionInfo | null>(null)

  useEffect(() => {
    getVersion().then(setVersion)
  }, [getVersion])

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 text-sm text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('task.back')}
      </button>
      <h2 className="text-base font-semibold text-white">{t('settings.title')}</h2>
      <ServerConfig config={config} onSave={(c) => { setConfig(c); navigate('/') }} />
      <AriaSettings />

      {version && (
        <div className="rounded-xl bg-slate-900 p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">{t('settings.version')}</h3>
          <p className="mt-2 text-sm text-slate-300">aria2 {version.version}</p>
          <p className="mt-1 text-xs text-slate-500">{version.enabledFeatures.join(', ')}</p>
        </div>
      )}

      <div className="rounded-xl bg-slate-900 p-4">
        <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <Globe className="h-4 w-4" />
          {t('settings.language')}
        </h3>
        <div className="mt-3 flex gap-2">
          {(['zh', 'en'] as Locale[]).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                locale === l ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {l === 'zh' ? '中文' : 'English'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
