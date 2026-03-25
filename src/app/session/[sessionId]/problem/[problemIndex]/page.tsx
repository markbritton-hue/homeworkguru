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
    if (s && s.problems[problemIndex]) {
      setSession(s)
    } else {
      setNotFound(true)
    }
  }, [sessionId, problemIndex])

  const zoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))
  }

  const zoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))
  }

  const resetZoom = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom(1)
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Problem not found.</p>
          <Link href={`/session/${sessionId}`} className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
            ← Back to problems
          </Link>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading...</p>
      </main>
    )
  }

  const problem = session.problems[problemIndex]

  return (
    <main className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <ProblemStatement
        problemNumber={problemIndex + 1}
        subject={problem.subject}
        text={problem.text}
        sessionId={sessionId}
      />

      {/* Collapsible homework image */}
      {session.imageDataUrl && (
        <div className="border-b border-slate-200 bg-white">

          {/* Toggle bar */}
          <button
            onClick={() => { setImageExpanded((v) => !v); setZoom(1) }}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {imageExpanded ? "Hide" : "Show"} homework sheet
            </div>
            <svg
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${imageExpanded ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {imageExpanded && (
            <div className="border-t border-slate-100">

              {/* Zoom controls */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-xs text-slate-400">Zoom: {Math.round(zoom * 100)}%</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={zoomOut}
                    disabled={zoom <= MIN_ZOOM}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Zoom out"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                    </svg>
                  </button>
                  <button
                    onClick={resetZoom}
                    className="px-2 h-7 text-xs rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label="Reset zoom"
                  >
                    Reset
                  </button>
                  <button
                    onClick={zoomIn}
                    disabled={zoom >= MAX_ZOOM}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Zoom in"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Image with zoom */}
              <div className="overflow-auto bg-slate-100" style={{ maxHeight: "420px" }}>
                <div
                  className="flex items-start justify-center p-2"
                  style={{ minWidth: zoom > 1 ? `${zoom * 100}%` : "100%" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={session.imageDataUrl}
                    alt="Homework sheet"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "top center",
                      width: "100%",
                      transition: "transform 0.15s ease",
                    }}
                  />
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      <ChatInterface sessionId={sessionId} problemIndex={problemIndex} />
    </main>
  )
}
