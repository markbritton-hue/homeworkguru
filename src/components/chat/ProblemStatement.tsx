import Link from "next/link"

interface ProblemStatementProps {
  problemNumber: number
  subject: string
  text: string
  sessionId: string
}

const MC_DETECT_RE = /[A-D][).]\s+.+/
const LETTER_COLORS: Record<string, { bg: string; border: string }> = {
  A: { bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.4)" },
  B: { bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.4)" },
  C: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.4)" },
  D: { bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.4)" },
}

function parseMCFromText(text: string): { question: string; options: { letter: string; text: string }[] } | null {
  if (!MC_DETECT_RE.test(text)) return null
  const normalised = text.replace(/\s+([A-D])[).]\s+/g, "\n$1. ")
  const lines = normalised.split("\n")
  const singleRE = /^([A-D])[).]\s+(.+)$/
  const options: { letter: string; text: string }[] = []
  const questionLines: string[] = []

  for (const line of lines) {
    const m = line.trim().match(singleRE)
    if (m) options.push({ letter: m[1], text: m[2] })
    else if (options.length === 0) questionLines.push(line)
  }

  if (options.length < 2) return null
  return { question: questionLines.join(" ").trim(), options }
}

export function ProblemStatement({ problemNumber, subject, text, sessionId }: ProblemStatementProps) {
  const parsed = parseMCFromText(text)

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
          {parsed ? (
            <>
              <p className="text-sm leading-relaxed font-medium mb-2" style={{ color: "var(--text)" }}>{parsed.question}</p>
              <div className="space-y-1.5">
                {parsed.options.map(({ letter, text: optText }) => {
                  const colors = LETTER_COLORS[letter] ?? LETTER_COLORS.A
                  return (
                    <div key={letter} className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5"
                      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: colors.border, color: "#fff" }}>
                        {letter}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text)" }}>{optText}</span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <p className="text-sm leading-relaxed font-medium" style={{ color: "var(--text)" }}>{text}</p>
          )}
        </div>
      </div>
    </div>
  )
}
