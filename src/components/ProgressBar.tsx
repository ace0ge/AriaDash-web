interface ProgressBarProps {
  percent: number
}

export function ProgressBar({ percent }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
      <div
        className="h-full rounded-full bg-blue-500 transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
