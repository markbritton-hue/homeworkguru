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
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mx-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-800">
            {allDone ? "You finished all your problems!" : "Great work! Problem solved!"}
          </p>
          <p className="text-xs text-emerald-600 mt-0.5">
            {solvedCount} of {totalProblems} solved
          </p>
          <div className="mt-3 flex gap-2">
            {nextProblem && (
              <Link
                href={`/session/${sessionId}/problem/${nextProblem.index}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Next problem
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            <Link
              href={`/session/${sessionId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-50 transition-colors"
            >
              All problems
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
