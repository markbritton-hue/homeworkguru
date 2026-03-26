"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { loadSession } from "@/lib/session-storage"
import { ProblemStatement } from "@/components/chat/ProblemStatement"
import { ChatInterface } from "@/components/chat/ChatInterface"
import Link from "next/link"
import type { HomeworkSession } from "@/types"

const MIN_ZOOM = 0.5
const MAX_ZOOM = 3
const ZOOM_STEP = 0.25

export default function ProblemPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const problemIndex = parseInt(params.problemIndex as string, 10)
  const [session, setSession] = useState<HomeworkSession | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [imageExpanded, setImageExpanded] = useState(false)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const s = loadSession(sessionId)
    if (s && s.problems[problemIndex]) { setSession(s) } else { setNotFound(true) }
  }, [sessionId, problemIndex])

  const zoomIn = (e: React.MouseEvent) => { e.stopPropagation(); setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2))) }
  const zoomOut = (e: React.MouseEvent) => { e.stopPropagation(); setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2))) }
  const resetZoom = (e: React.MouseEvent) => { e.stopPropagation(); setZoom(1) }

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="mb-4" style={{ color: "var(--muted)" }}>Problem not found.</p>
          <Link href={`/session/${sessionId}`} className="text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: "var(--accent)" }}>← Back</Link>
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

  const problem = session.problems[problemIndex]

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <ProblemStatement
        problemNumber={problemIndex + 1}
        subject={problem.subject}
        text={problem.text}
        sessionId={sessionId}
      />

      {/* Collapsible homework image */}
      {session.imageDataUrls.length > 0 && (
        <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", backdropFilter: "blur(10px)" }}>
          <button
            onClick={() => { setImageExpanded((v) => !v); setZoom(1) }}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: "var(--muted)" }}
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {imageExpanded ? "Hide" : "Show"} homework sheet
            </div>
            <svg className={`w-3.5 h-3.5 transition-transform ${imageExpanded ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {imageExpanded && (
            <div style={{ borderTop: "1px solid var(--border)" }}>
              {/* Zoom controls */}
              <div className="flex items-center justify-between px-4 py-2" style={{ background: "var(--input-bg)", borderBottom: "1px solid var(--border)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                  Zoom: {Math.round(zoom * 100)}%
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { label: "−", action: zoomOut, disabled: zoom <= MIN_ZOOM, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /> },
                  ].map(({ label, action, disabled, icon }) => (
                    <button key={label} onClick={action} disabled={disabled}
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
                    </button>
                  ))}
                  <button onClick={resetZoom}
                    className="px-2 h-7 text-xs font-semibold rounded-lg transition-opacity hover:opacity-70"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>
                    Reset
                  </button>
                  <button onClick={zoomIn} disabled={zoom >= MAX_ZOOM}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="overflow-auto" style={{ maxHeight: "420px", background: "var(--input-bg)" }}>
                {session.imageDataUrls.map((url, i) => (
                  <div key={i}>
                    {session.imageDataUrls.length > 1 && (
                      <p className="text-xs font-semibold px-3 py-1" style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                        Page {i + 1}
                      </p>
                    )}
                    <div className="flex items-start justify-center p-2"
                      style={{ minWidth: zoom > 1 ? `${zoom * 100}%` : "100%" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Homework page ${i + 1}`}
                        style={{ transform: `scale(${zoom})`, transformOrigin: "top center", width: "100%", transition: "transform 0.15s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ChatInterface sessionId={sessionId} problemIndex={problemIndex} />
    </main>
  )
}
