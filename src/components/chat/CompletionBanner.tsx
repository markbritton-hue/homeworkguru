import Link from "next/link"
import ReactMarkdown from "react-markdown"
import type { Problem } from "@/types"

interface CompletionBannerProps {
  sessionId: string
  nextProblem: Problem | null
  totalProblems: number
  solvedCount: number
  finalAnswer?: string
}

export function CompletionBanner({ sessionId, nextProblem, totalProblems, solvedCount, finalAnswer }: CompletionBannerProps) {
  const allDone = solvedCount >= totalProblems

  return (
    <div className="mx-4 mb-4 rounded-2xl p-4"
      style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.4)", boxShadow: "0 4px 12px rgba(16,185,129,0.15)", backdropFilter: "blur(10px)" }}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "var(--green)", boxShadow: "0 0 16px rgba(16,185,129,0.5)" }}>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: "var(--green)" }}>
            {allDone ? "Assignment complete!" : "Problem solved!"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {solvedCount} of {totalProblems} solved
          </p>
          {finalAnswer && (
            <div className="mt-3 rounded-xl px-4 py-3"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--green)" }}>Final Answer</p>
              <div className="prose prose-sm max-w-none prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1 text-xs" style={{ color: "var(--text)" }}>
                <ReactMarkdown>{finalAnswer}</ReactMarkdown>
              </div>
            </div>
          )}
          <div className="mt-3 flex gap-2 flex-wrap">
            {nextProblem && (
              <Link
                href={`/session/${sessionId}/problem/${nextProblem.index}`}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full text-white transition-all hover:-translate-y-0.5"
                style={{ background: "var(--green)", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}
              >
                Next problem
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            <Link
              href={`/session/${sessionId}`}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--green)" }}
            >
              All problems
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
