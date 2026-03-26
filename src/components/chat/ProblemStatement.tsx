import Link from "next/link"

interface ProblemStatementProps {
  problemNumber: number
  subject: string
  text: string
  sessionId: string
}

export function ProblemStatement({ problemNumber, subject, text, sessionId }: ProblemStatementProps) {
  return (
    <div className="px-4 py-3" style={{ background: "rgba(15,23,42,0.9)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(10px)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-2 text-sm" style={{ color: "var(--muted)" }}>
          <Link href={`/session/${sessionId}`} className="transition-opacity hover:opacity-70 font-semibold"
            style={{ color: "var(--accent)" }}>
            ← All problems
          </Link>
          <span>/</span>
          <span>{subject}</span>
        </div>
        <div className="rounded-xl px-4 py-3" style={{ background: "var(--input-bg)", border: "1px solid var(--border)" }}>
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
