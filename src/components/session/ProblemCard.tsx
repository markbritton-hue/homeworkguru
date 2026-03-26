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
      className="block rounded-lg p-4 transition-all group"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = problem.status === "solved" ? "var(--green)" : "var(--accent)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
            style={{
              background: problem.status === "solved" ? "rgba(0,255,136,0.12)" : "rgba(255,69,0,0.12)",
              color: problem.status === "solved" ? "var(--green)" : "var(--accent)",
              fontFamily: "var(--font-orbitron)",
            }}>
            {problem.index + 1}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--muted)" }}>
              {problem.subject}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{preview}</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <Badge status={problem.status} />
          <svg className="w-4 h-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            style={{ color: "var(--border)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
