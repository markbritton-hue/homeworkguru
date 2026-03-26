import Link from "next/link"

interface ProblemStatementProps {
  problemNumber: number
  subject: string
  text: string
  sessionId: string
}

export function ProblemStatement({ problemNumber, subject, text, sessionId }: ProblemStatementProps) {
  return (
    <div className="px-4 py-3" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          <Link href={`/session/${sessionId}`} className="transition-colors hover:opacity-70"
            style={{ color: "var(--accent)" }}>
            ← Problems
          </Link>
          <span>/</span>
          <span style={{ color: "var(--muted)" }}>{subject}</span>
        </div>
        <div className="rounded-lg px-4 py-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-widest mb-1"
            style={{ color: "var(--accent)", fontFamily: "var(--font-orbitron)" }}>
            Problem {problemNumber}
          </p>
          <p className="text-sm leading-relaxed font-medium" style={{ color: "var(--text)" }}>{text}</p>
        </div>
      </div>
    </div>
  )
}
