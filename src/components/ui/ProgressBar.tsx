interface ProgressBarProps {
  value: number // 0-100
  green?: boolean
}

export function ProgressBar({ value, green = false }: ProgressBarProps) {
  return (
    <div className="w-full rounded-full h-2" style={{ background: "rgba(255,255,255,0.1)" }}>
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: green ? "var(--green)" : "var(--accent)",
          boxShadow: green
            ? "0 0 8px rgba(16,185,129,0.4)"
            : "0 0 8px rgba(96,165,250,0.4)",
        }}
      />
    </div>
  )
}
