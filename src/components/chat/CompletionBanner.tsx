import Link from "next/link"
import type { Problem } from "@/types"

interface CompletionBannerProps {
  sessionId: string
  nextProblem: Problem | null
  totalProblems: number
  solvedCount: number
}

export function CompletionBanner({ sessionId, nextProblem, totalProblems, solvedCount }: CompletionBannerProps) {
  const allDone = solvedCount >= totalProblems

  return (
    <div className="mx-4 mb-4 rounded-lg p-4"
      style={{ background: "rgba(0,255,136,0.07)", border: "1px solid rgba(0,255,136,0.25)" }}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(0,255,136,0.15)" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            style={{ color: "var(--green)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black uppercase tracking-widest"
            style={{ color: "var(--green)", fontFamily: "var(--font-orbitron)" }}>
            {allDone ? "Assignment complete!" : "Problem solved!"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {solvedCount} of {totalProblems} solved
          </p>
          <div className="mt-3 flex gap-2">
            {nextProblem && (
              <Link
                href={`/session/${sessionId}/problem/${nextProblem.index}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg text-white transition-opacity hover:opacity-80"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent2))" }}
              >
                Next problem
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            <Link
              href={`/session/${sessionId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-80"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
            >
              All problems
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
