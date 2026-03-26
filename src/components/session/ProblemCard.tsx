import Link from "next/link"
import { Badge } from "@/components/ui/Badge"
import type { Problem } from "@/types"

interface ProblemCardProps {
  problem: Problem
  sessionId: string
}

export function ProblemCard({ problem, sessionId }: ProblemCardProps) {
  const preview = problem.text.length > 100 ? problem.text.slice(0, 100) + "…" : problem.text

  return (
    <Link
      href={`/session/${sessionId}/problem/${problem.index}`}
      className="block rounded-2xl p-4 transition-all group"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        backdropFilter: "blur(10px)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)"
        ;(e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)"
        ;(e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"
        ;(e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)"
        ;(e.currentTarget as HTMLElement).style.transform = ""
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: "var(--accent)", boxShadow: "0 0 12px rgba(96,165,250,0.4)" }}>
            {problem.index + 1}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--muted)" }}>{problem.subject}</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{preview}</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <Badge status={problem.status} />
          <svg className="w-4 h-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            style={{ color: "var(--muted2)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
