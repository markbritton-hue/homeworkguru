interface ProgressBarProps {
  value: number // 0-100
}

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="w-full bg-slate-200 rounded-full h-2">
      <div
        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
