import type { ProblemStatus } from "@/types"

interface BadgeProps {
  status: ProblemStatus
}

const config: Record<ProblemStatus, { label: string; bg: string; color: string }> = {
  not_started: { label: "Not started", bg: "rgba(255,255,255,0.06)", color: "var(--muted)" },
  in_progress:  { label: "In progress", bg: "rgba(255,69,0,0.12)",    color: "var(--accent)" },
  solved:       { label: "Solved",      bg: "rgba(0,255,136,0.12)",   color: "var(--green)"  },
}

export function Badge({ status }: BadgeProps) {
  const { label, bg, color } = config[status]
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-widest"
      style={{ background: bg, color }}
    >
      {status === "solved" && (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {label}
    </span>
  )
}
