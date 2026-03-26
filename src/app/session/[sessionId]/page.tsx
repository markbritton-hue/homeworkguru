"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { loadSession } from "@/lib/firestore"
import { useAuth } from "@/contexts/AuthContext"
import { SessionHeader } from "@/components/session/SessionHeader"
import { ProblemCard } from "@/components/session/ProblemCard"
import Link from "next/link"
import type { HomeworkSession } from "@/types"

function HomeButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--accent)", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      Home
    </Link>
  )
}

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const { user, loading: authLoading } = useAuth()
  const [session, setSession] = useState<HomeworkSession | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [imageExpanded, setImageExpanded] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return }
    if (!user) return
    loadSession(user.uid, sessionId).then((s) => {
      if (s) { setSession(s) } else { setNotFound(true) }
    })
  }, [sessionId, user, authLoading, router])

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="mb-4" style={{ color: "var(--muted)" }}>Session not found or expired.</p>
          <HomeButton />
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading…</p>
      </main>
    )
  }

  const solved = session.problems.filter((p) => p.status === "solved").length

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <HomeButton />
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--accent)", boxShadow: "0 0 16px rgba(96,165,250,0.4)" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold truncate" style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              {session.name}
            </h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
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

        {/* Homework pages */}
        {session.imageDataUrls.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(96,165,250,0.3)", background: "rgba(15,30,60,0.85)", backdropFilter: "blur(10px)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
            {/* Header */}
            <button
              onClick={() => setImageExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 transition-opacity hover:opacity-90"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.25)" }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>Homework Sheet{session.imageDataUrls.length > 1 ? "s" : ""}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {session.imageDataUrls.length} page{session.imageDataUrls.length !== 1 ? "s" : ""} · tap to {imageExpanded ? "collapse" : "view"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Thumbnail strip preview when collapsed */}
                {!imageExpanded && (
                  <div className="flex gap-1.5">
                    {session.imageDataUrls.slice(0, 3).map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt={`Page ${i + 1}`}
                        className="w-10 h-12 object-cover rounded-lg"
                        style={{ border: "1px solid var(--border)" }} />
                    ))}
                    {session.imageDataUrls.length > 3 && (
                      <div className="w-10 h-12 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                        +{session.imageDataUrls.length - 3}
                      </div>
                    )}
                  </div>
                )}
                <svg className={`w-5 h-5 transition-transform flex-shrink-0 ${imageExpanded ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--muted)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded images */}
            {imageExpanded && (
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {session.imageDataUrls.map((url, i) => (
                  <div key={i}>
                    {session.imageDataUrls.length > 1 && (
                      <div className="flex items-center gap-2 px-5 py-2.5" style={{ background: "var(--input-bg)", borderBottom: "1px solid var(--border)" }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: "var(--accent)", color: "#fff" }}>
                          {i + 1}
                        </div>
                        <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Page {i + 1}</p>
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Homework page ${i + 1}`}
                      className="w-full object-contain"
                      style={{ background: "var(--input-bg)", borderBottom: i < session.imageDataUrls.length - 1 ? "1px solid var(--border)" : undefined, maxHeight: "70vh" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </main>
  )
}
