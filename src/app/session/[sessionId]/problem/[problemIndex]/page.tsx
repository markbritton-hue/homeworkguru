"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { loadSession } from "@/lib/session-storage"
import { ProblemStatement } from "@/components/chat/ProblemStatement"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { Calculator } from "@/components/ui/Calculator"
import { CroppedImage } from "@/components/ui/CroppedImage"
import Link from "next/link"
import type { HomeworkSession } from "@/types"

export default function ProblemPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const problemIndex = parseInt(params.problemIndex as string, 10)
  const [session, setSession] = useState<HomeworkSession | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [showImage, setShowImage] = useState(true)

  // Draggable float position
  const [pos, setPos] = useState({ x: 12, y: 200 })
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const s = loadSession(sessionId)
    if (s && s.problems[problemIndex]) { setSession(s) } else { setNotFound(true) }
  }, [sessionId, problemIndex])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    e.preventDefault()
  }, [pos])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragging.current = true
    dragOffset.current = { x: e.touches[0].clientX - pos.x, y: e.touches[0].clientY - pos.y }
  }, [pos])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y })
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return
      setPos({ x: e.touches[0].clientX - dragOffset.current.x, y: e.touches[0].clientY - dragOffset.current.y })
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    window.addEventListener("touchmove", onTouchMove)
    window.addEventListener("touchend", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onUp)
    }
  }, [])

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
  const hasCrop = !!problem.bbox && session.imageDataUrls.length > 0

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <ProblemStatement
        problemNumber={problemIndex + 1}
        subject={problem.subject}
        text={problem.text}
        sessionId={sessionId}
      />

      <ChatInterface sessionId={sessionId} problemIndex={problemIndex} />

      {/* Floating draggable image */}
      {hasCrop && showImage && (
        <div
          className="fixed z-30 rounded-2xl overflow-hidden shadow-2xl select-none"
          style={{
            left: pos.x,
            top: pos.y,
            width: 200,
            border: "1px solid rgba(96,165,250,0.35)",
            background: "rgba(10,18,35,0.95)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Drag handle */}
          <div
            className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing"
            style={{ borderBottom: "1px solid rgba(96,165,250,0.2)", background: "rgba(15,30,60,0.9)" }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
          >
            {/* Grip dots */}
            <div className="flex gap-0.5 flex-wrap w-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full" style={{ background: "rgba(96,165,250,0.5)" }} />
              ))}
            </div>
            <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Problem {problemIndex + 1}</span>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setShowImage(false)}
              className="transition-opacity hover:opacity-60"
              style={{ color: "var(--muted)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cropped image */}
          <CroppedImage
            src={session.imageDataUrls[problem.page ?? 0] ?? session.imageDataUrls[0]}
            bbox={problem.bbox!}
            alt={`Problem ${problemIndex + 1}`}
          />
        </div>
      )}

      {/* Show image button (when closed) */}
      {hasCrop && !showImage && (
        <button
          onClick={() => setShowImage(true)}
          className="fixed z-30 bottom-44 right-4 w-16 h-16 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1 active:scale-95"
          style={{
            background: "rgba(15,30,60,0.95)",
            border: "2px solid rgba(96,165,250,0.4)",
            color: "var(--accent)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)",
          }}
          aria-label="Show problem image"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      )}

      {/* Floating calculator button */}
      <button
        onClick={() => setShowCalculator((v) => !v)}
        className="fixed bottom-24 right-4 z-40 w-16 h-16 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1 active:scale-95"
        style={{
          background: showCalculator ? "var(--accent)" : "rgba(15,30,60,0.95)",
          border: `2px solid ${showCalculator ? "var(--accent)" : "rgba(96,165,250,0.4)"}`,
          color: showCalculator ? "#fff" : "var(--accent)",
          boxShadow: showCalculator ? "0 8px 24px rgba(96,165,250,0.5)" : "0 8px 20px rgba(0,0,0,0.5)",
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
    </main>
  )
}
