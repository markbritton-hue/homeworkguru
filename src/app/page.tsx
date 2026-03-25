"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UploadZone } from "@/components/upload/UploadZone"
import { ImagePreview } from "@/components/upload/ImagePreview"
import { compressImage } from "@/lib/image-utils"
import { saveSession, listSessions, loadSession, deleteSession } from "@/lib/session-storage"
import type { HomeworkSession } from "@/types"

export default function HomePage() {
  const router = useRouter()
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<"image/jpeg" | "image/png" | "image/webp" | "image/gif">("image/jpeg")
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<HomeworkSession[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [assignmentName, setAssignmentName] = useState("")

  useEffect(() => {
    const ids = listSessions()
    const loaded = ids
      .map((id) => loadSession(id))
      .filter(Boolean) as HomeworkSession[]
    loaded.sort((a, b) => b.createdAt - a.createdAt)
    setSessions(loaded)
    setShowUpload(loaded.length === 0)
  }, [])

  const handleImageSelected = (dataUrl: string, mime: typeof mimeType) => {
    setImageDataUrl(dataUrl)
    setMimeType(mime)
    setError(null)
  }

  const handleParse = async () => {
    if (!imageDataUrl) return
    setIsParsing(true)
    setError(null)

    try {
      const response = await fetch("/api/parse-homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: imageDataUrl, mimeType }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to read homework. Please try again.")
        return
      }

      const compressed = await compressImage(imageDataUrl)
      const subjects = [...new Set(data.problems.map((p: { subject: string }) => p.subject))] as string[]
      const autoName = assignmentName.trim() || `${subjects.slice(0, 2).join(" & ")} — ${new Date().toLocaleDateString()}`

      const session: HomeworkSession = {
        sessionId: crypto.randomUUID(),
        name: autoName,
        createdAt: Date.now(),
        imageDataUrl: compressed,
        problems: data.problems.map((p: { index: number; text: string; subject: string }) => ({
          ...p,
          status: "not_started" as const,
        })),
        chatHistory: {},
      }

      saveSession(session)
      router.push(`/session/${session.sessionId}`)
    } catch {
      setError("Something went wrong. Please check your connection and try again.")
    } finally {
      setIsParsing(false)
    }
  }

  const handleDelete = (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    deleteSession(sessionId)
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId))
  }

  const solvedCount = (s: HomeworkSession) => s.problems.filter((p) => p.status === "solved").length

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Homework Guru</h1>
              <p className="text-xs text-slate-500">AI tutor that teaches, not just answers</p>
            </div>
          </div>
          {!showUpload && (
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Assignment
            </button>
          )}
        </div>

        {/* Upload panel */}
        {showUpload && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">New Assignment</h2>
              {sessions.length > 0 && (
                <button onClick={() => { setShowUpload(false); setImageDataUrl(null); setError(null) }} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Optional name field */}
            <input
              type="text"
              value={assignmentName}
              onChange={(e) => setAssignmentName(e.target.value)}
              placeholder="Assignment name (optional, e.g. Chapter 5 Math)"
              className="w-full mb-4 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 placeholder-slate-400"
            />

            {imageDataUrl ? (
              <ImagePreview
                dataUrl={imageDataUrl}
                onClear={() => { setImageDataUrl(null); setError(null) }}
                onParse={handleParse}
                isParsing={isParsing}
              />
            ) : (
              <UploadZone onImageSelected={handleImageSelected} />
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Assignments list */}
        {sessions.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Your Assignments
            </h2>
            <div className="space-y-3">
              {sessions.map((session) => {
                const solved = solvedCount(session)
                const total = session.problems.length
                const pct = total > 0 ? Math.round((solved / total) * 100) : 0
                const allDone = solved === total && total > 0

                return (
                  <Link
                    key={session.sessionId}
                    href={`/session/${session.sessionId}`}
                    className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-800 text-sm truncate">{session.name}</p>
                          {allDone && (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Done
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mb-2">
                          {new Date(session.createdAt).toLocaleDateString()} · {total} problem{total !== 1 ? "s" : ""}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 flex-shrink-0">{solved}/{total}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => handleDelete(session.sessionId, e)}
                          className="p-1.5 text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Delete assignment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {sessions.length === 0 && !showUpload && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm">No assignments yet. Upload your first homework!</p>
          </div>
        )}
      </div>
    </main>
  )
}
