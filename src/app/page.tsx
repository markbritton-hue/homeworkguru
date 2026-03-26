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
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}
        className="px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Graduation cap icon */}
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent2))" }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-widest uppercase"
                style={{ fontFamily: "var(--font-orbitron)", color: "var(--accent)" }}>
                Homework Guru
              </h1>
              <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)", letterSpacing: "0.2em" }}>
                AI Tutor · Learn, Don&apos;t Copy
              </p>
            </div>
          </div>

          {sessions.length > 0 && !showUpload && (
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-widest text-white rounded-lg transition-opacity hover:opacity-80"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent2))", fontFamily: "var(--font-rajdhani)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Upload panel */}
        {showUpload && (
          <div className="rounded-lg p-6 mb-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black uppercase tracking-widest text-sm"
                style={{ fontFamily: "var(--font-orbitron)", color: "var(--accent)" }}>
                New Assignment
              </h2>
              {sessions.length > 0 && (
                <button
                  onClick={() => { setShowUpload(false); setImageDataUrl(null); setError(null) }}
                  style={{ color: "var(--muted)" }}
                  className="hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <input
              type="text"
              value={assignmentName}
              onChange={(e) => setAssignmentName(e.target.value)}
              placeholder="Assignment name (optional)"
              className="w-full mb-4 px-3 py-2.5 text-sm rounded-lg focus:outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontFamily: "var(--font-rajdhani)",
              }}
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
              <div className="mt-4 p-3 rounded-lg" style={{ background: "rgba(255,69,0,0.1)", border: "1px solid rgba(255,69,0,0.3)" }}>
                <p className="text-sm" style={{ color: "var(--accent)" }}>{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Assignments list */}
        {sessions.length > 0 && (
          <div className="pb-10">
            <p className="text-xs font-bold uppercase mb-3 px-1"
              style={{ color: "var(--muted)", letterSpacing: "0.2em", fontFamily: "var(--font-rajdhani)" }}>
              Your Assignments
            </p>
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
                    className="block rounded-lg p-4 transition-all group"
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = allDone ? "var(--green)" : "var(--accent)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-sm truncate" style={{ color: "var(--text)", fontFamily: "var(--font-rajdhani)" }}>
                            {session.name}
                          </p>
                          {allDone && (
                            <span className="flex-shrink-0 text-xs font-bold uppercase px-2 py-0.5 rounded"
                              style={{ background: "rgba(0,255,136,0.1)", color: "var(--green)", letterSpacing: "0.1em" }}>
                              ✓ Done
                            </span>
                          )}
                        </div>
                        <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                          {new Date(session.createdAt).toLocaleDateString()} · {total} problem{total !== 1 ? "s" : ""}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-full h-1.5" style={{ background: "var(--border)" }}>
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                background: allDone
                                  ? "var(--green)"
                                  : "linear-gradient(90deg, var(--accent), var(--accent2))",
                              }}
                            />
                          </div>
                          <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>{solved}/{total}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => handleDelete(session.sessionId, e)}
                          className="p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                          style={{ color: "var(--border)" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                          onMouseLeave={e => (e.currentTarget.style.color = "var(--border)")}
                          aria-label="Delete assignment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <svg className="w-4 h-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          style={{ color: "var(--border)" }}>
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
          <div className="text-center py-16" style={{ color: "var(--muted)" }}>
            <p className="text-sm uppercase tracking-widest">No assignments yet. Upload your first homework!</p>
          </div>
        )}
      </div>
    </main>
  )
}
