interface ProgressBarProps {
  value: number // 0-100
  green?: boolean
}

export function ProgressBar({ value, green = false }: ProgressBarProps) {
  return (
    <div className="w-full rounded-full h-1.5" style={{ background: "var(--border)" }}>
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: green
            ? "var(--green)"
            : "linear-gradient(90deg, var(--accent), var(--accent2))",
        }}
      />
    </div>
  )
}
