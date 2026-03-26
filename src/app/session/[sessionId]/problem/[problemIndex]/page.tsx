"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { loadSession } from "@/lib/session-storage"
import { ProblemStatement } from "@/components/chat/ProblemStatement"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { Calculator } from "@/components/ui/Calculator"
import { CroppedImage } from "@/components/ui/CroppedImage"
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
  const [showCalculator, setShowCalculator] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)

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

      {/* Homework image panel */}
      {session.imageDataUrls.length > 0 && (
        <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", backdropFilter: "blur(10px)" }}>
          {/* Header row */}
          <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: imageExpanded ? "1px solid var(--border)" : undefined }}>
            {/* Cropped problem preview (if bbox available) */}
            {problem.bbox && !imageExpanded ? (
              <button
                onClick={() => setShowLightbox(true)}
                className="rounded-lg overflow-hidden flex-shrink-0 transition-all hover:opacity-90 hover:scale-105 active:scale-95"
                style={{ width: 100, border: "1px solid var(--border)", cursor: "zoom-in" }}
                aria-label="Enlarge problem image"
              >
                <CroppedImage
                  src={session.imageDataUrls[problem.page ?? 0] ?? session.imageDataUrls[0]}
                  bbox={problem.bbox}
                  alt="Problem region"
                />
              </button>
            ) : (
              <button
                onClick={() => { setImageExpanded((v) => !v); setZoom(1) }}
                className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: "var(--muted)" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {imageExpanded ? "Hide" : "Show"} homework sheet
              </button>
            )}

            {imageExpanded && (
              <button onClick={() => setImageExpanded(false)} className="transition-opacity hover:opacity-60 flex-shrink-0" style={{ color: "var(--muted)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Full sheet expanded */}
          {imageExpanded && (
            <div>
              {/* Zoom controls */}
              <div className="flex items-center justify-between px-4 py-2" style={{ background: "var(--input-bg)", borderBottom: "1px solid var(--border)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                  Zoom: {Math.round(zoom * 100)}%
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={zoomOut} disabled={zoom <= MIN_ZOOM}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                    </svg>
                  </button>
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
              <div className="overflow-auto" style={{ maxHeight: "380px", background: "var(--input-bg)" }}>
                {session.imageDataUrls.map((url, i) => (
                  <div key={i}>
                    {session.imageDataUrls.length > 1 && (
                      <p className="text-xs font-semibold px-3 py-1" style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>Page {i + 1}</p>
                    )}
                    <div className="flex items-start justify-center p-2" style={{ minWidth: zoom > 1 ? `${zoom * 100}%` : "100%" }}>
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

      {/* Floating calculator button */}
      <button
        onClick={() => setShowCalculator((v) => !v)}
        className="fixed bottom-24 right-4 z-40 w-16 h-16 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1 active:scale-95"
        style={{
          background: showCalculator ? "var(--accent)" : "rgba(15,30,60,0.95)",
          border: `2px solid ${showCalculator ? "var(--accent)" : "rgba(96,165,250,0.4)"}`,
          color: showCalculator ? "#fff" : "var(--accent)",
          boxShadow: showCalculator
            ? "0 8px 24px rgba(96,165,250,0.5)"
            : "0 8px 20px rgba(0,0,0,0.5)",
          backdropFilter: "blur(12px)",
        }}
        aria-label="Toggle calculator"
      >
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <circle cx="8"  cy="10" r=".6" fill="currentColor" stroke="none" />
          <circle cx="12" cy="10" r=".6" fill="currentColor" stroke="none" />
          <circle cx="16" cy="10" r=".6" fill="currentColor" stroke="none" />
          <circle cx="8"  cy="14" r=".6" fill="currentColor" stroke="none" />
          <circle cx="12" cy="14" r=".6" fill="currentColor" stroke="none" />
          <circle cx="16" cy="14" r=".6" fill="currentColor" stroke="none" />
          <circle cx="8"  cy="18" r=".6" fill="currentColor" stroke="none" />
          <circle cx="12" cy="18" r=".6" fill="currentColor" stroke="none" />
          <circle cx="16" cy="18" r=".6" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}

      {/* Lightbox */}
      {showLightbox && problem.bbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute -top-10 right-0 transition-opacity hover:opacity-70"
              style={{ color: "#fff" }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(96,165,250,0.3)" }}>
              <CroppedImage
                src={session.imageDataUrls[problem.page ?? 0] ?? session.imageDataUrls[0]}
                bbox={problem.bbox}
                alt="Problem region enlarged"
              />
            </div>
            <p className="text-center text-xs mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>Tap anywhere to close</p>
          </div>
        </div>
      )}
    </main>
  )
}
