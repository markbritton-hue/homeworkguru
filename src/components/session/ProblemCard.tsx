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
      className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
            {problem.index + 1}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-slate-500 font-medium mb-0.5">{problem.subject}</p>
            <p className="text-slate-800 text-sm leading-relaxed">{preview}</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <Badge status={problem.status} />
          <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
