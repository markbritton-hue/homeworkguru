import Link from "next/link"

interface ProblemStatementProps {
  problemNumber: number
  subject: string
  text: string
  sessionId: string
}

export function ProblemStatement({ problemNumber, subject, text, sessionId }: ProblemStatementProps) {
  return (
    <div className="px-4 py-2" style={{ background: "rgba(15,23,42,0.9)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(10px)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/HomeworkguruLogo.png" alt="Homework Guru" style={{ height: "40px", width: "auto", objectFit: "contain" }} />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:-translate-y-0.5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--accent)", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          <Link
            href={`/session/${sessionId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:-translate-y-0.5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--accent)", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            All Problems
          </Link>
        </div>
        <div className="rounded-xl px-3 py-2" style={{ background: "var(--input-bg)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-bold mb-1" style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Problem {problemNumber}
          </p>
          <p className="text-sm leading-relaxed font-medium" style={{ color: "var(--text)" }}>{text}</p>
        </div>
      </div>
    </div>
  )
}
