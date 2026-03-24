import Link from "next/link"

interface ProblemStatementProps {
  problemNumber: number
  subject: string
  text: string
  sessionId: string
}

export function ProblemStatement({ problemNumber, subject, text, sessionId }: ProblemStatementProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
          <Link href={`/session/${sessionId}`} className="hover:text-indigo-600 transition-colors">
            ← All problems
          </Link>
          <span>/</span>
          <span className="text-indigo-600 font-medium">{subject}</span>
        </div>
        <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Problem {problemNumber}
          </p>
          <p className="text-slate-800 text-sm leading-relaxed font-medium">{text}</p>
        </div>
      </div>
    </div>
  )
}
