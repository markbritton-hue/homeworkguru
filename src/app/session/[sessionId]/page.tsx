"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { loadSession } from "@/lib/session-storage"
import { SessionHeader } from "@/components/session/SessionHeader"
import { ProblemCard } from "@/components/session/ProblemCard"
import Link from "next/link"
import type { HomeworkSession } from "@/types"

export default function SessionPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [session, setSession] = useState<HomeworkSession | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [imageExpanded, setImageExpanded] = useState(false)

  useEffect(() => {
    const s = loadSession(sessionId)
    if (s) { setSession(s) } else { setNotFound(true) }
  }, [sessionId])

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: "var(--muted)" }}>Session not found or expired.</p>
          <Link href="/" className="text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
            style={{ color: "var(--accent)" }}>← Back</Link>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <p className="text-sm uppercase tracking-widest" style={{ color: "var(--muted)" }}>Loading…</p>
      </main>
    )
  }

  const solved = session.problems.filter((p) => p.status === "solved").length

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: "var(--bg)" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent2))" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-black truncate" style={{ fontFamily: "var(--font-orbitron)", color: "var(--text)" }}>
              {session.name}
            </h1>
            <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              {new Date(session.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <SessionHeader solved={solved} total={session.problems.length} />

        <div className="space-y-3 mb-6">
          {session.problems.map((problem) => (
            <ProblemCard key={problem.index} problem={problem} sessionId={sessionId} />
          ))}
        </div>

        {/* Homework image */}
        {session.imageDataUrl && (
          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <button
              onClick={() => setImageExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm transition-colors"
              style={{ background: "var(--card)", color: "var(--muted)" }}
            >
              <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Homework sheet
              </div>
              <svg className={`w-4 h-4 transition-transform ${imageExpanded ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {imageExpanded && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.imageDataUrl} alt="Original homework"
                className="w-full object-contain"
                style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }} />
            )}
          </div>
        )}

      </div>
    </main>
  )
}
