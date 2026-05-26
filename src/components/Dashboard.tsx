import { ArrowDown, ArrowUp, Activity } from 'lucide-react'
import { useI18n } from '../i18n'
import type { GlobalStat } from '../api/types'

interface DashboardProps {
  globalStat: GlobalStat | null
}

function formatSpeed(bytesPerSec: string): string {
  const v = Number(bytesPerSec)
  if (v === 0) return '0 B/s'
  if (v < 1024) return `${v} B/s`
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB/s`
  return `${(v / (1024 * 1024)).toFixed(1)} MB/s`
}

export function Dashboard({ globalStat }: DashboardProps) {
  const { t } = useI18n()
  if (!globalStat) return null
  return (
    <div className="grid grid-cols-3 gap-2 px-2 py-3">
      <div className="flex flex-col items-center rounded-xl bg-slate-900 p-3">
        <ArrowDown className="h-5 w-5 text-blue-400" />
        <span className="mt-1 text-base font-semibold text-white">
          {formatSpeed(globalStat.downloadSpeed)}
        </span>
        <span className="text-[10px] text-slate-500">{t('dashboard.download')}</span>
      </div>
      <div className="flex flex-col items-center rounded-xl bg-slate-900 p-3">
        <ArrowUp className="h-5 w-5 text-green-400" />
        <span className="mt-1 text-base font-semibold text-white">
          {formatSpeed(globalStat.uploadSpeed)}
        </span>
        <span className="text-[10px] text-slate-500">{t('dashboard.upload')}</span>
      </div>
      <div className="flex flex-col items-center rounded-xl bg-slate-900 p-3">
        <Activity className="h-5 w-5 text-amber-400" />
        <span className="mt-1 text-base font-semibold text-white">
          {globalStat.numActive}
        </span>
        <span className="text-[10px] text-slate-500">{t('dashboard.active')}</span>
      </div>
    </div>
  )
}
