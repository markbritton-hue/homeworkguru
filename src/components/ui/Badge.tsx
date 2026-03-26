import type { ProblemStatus } from "@/types"

interface BadgeProps {
  status: ProblemStatus
}

const config: Record<ProblemStatus, { label: string; bg: string; color: string }> = {
  not_started: { label: "Not started", bg: "rgba(255,255,255,0.06)",  color: "rgba(255,255,255,0.5)" },
  in_progress:  { label: "In progress", bg: "rgba(245,158,11,0.15)",  color: "#f59e0b" },
  solved:       { label: "Solved",      bg: "rgba(16,185,129,0.15)",  color: "#10b981"  },
}

export function Badge({ status }: BadgeProps) {
  const { label, bg, color } = config[status]
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: bg, color }}>
      {status === "solved" && (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {label}
    </span>
  )
}
