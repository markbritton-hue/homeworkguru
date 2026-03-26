"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UploadZone } from "@/components/upload/UploadZone"
import { ImagePreview } from "@/components/upload/ImagePreview"
import { compressImage } from "@/lib/image-utils"
import { saveSession, listSessions, loadSession, deleteSession } from "@/lib/session-storage"
import type { HomeworkSession } from "@/types"

type MimeType = "image/jpeg" | "image/png" | "image/webp" | "image/gif"
interface ImageEntry { dataUrl: string; mimeType: MimeType }

export default function HomePage() {
  const router = useRouter()
  const [images, setImages] = useState<ImageEntry[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<HomeworkSession[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [assignmentName, setAssignmentName] = useState("")

  useEffect(() => {
    const ids = listSessions()
    const loaded = ids.map((id) => loadSession(id)).filter(Boolean) as HomeworkSession[]
    loaded.sort((a, b) => b.createdAt - a.createdAt)
    setSessions(loaded)
    setShowUpload(loaded.length === 0)
  }, [])

  const handleImageSelected = (dataUrl: string, mimeType: MimeType) => {
    setImages([{ dataUrl, mimeType }]); setError(null)
  }

  const handleAddMore = (dataUrl: string, mimeType: MimeType) => {
    setImages((prev) => [...prev, { dataUrl, mimeType }]); setError(null)
  }

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleParse = async () => {
    if (images.length === 0) return
    setIsParsing(true); setError(null)
    try {
      const response = await fetch("/api/parse-homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: images.map((img) => ({ imageBase64: img.dataUrl, mimeType: img.mimeType })) }),
      })
      const data = await response.json()
      if (!response.ok) { setError(data.error || "Failed to read homework. Please try again."); return }
      const compressedUrls = await Promise.all(images.map((img) => compressImage(img.dataUrl)))
      const subjects = [...new Set(data.problems.map((p: { subject: string }) => p.subject))] as string[]
      const autoName = assignmentName.trim() || `${subjects.slice(0, 2).join(" & ")} — ${new Date().toLocaleDateString()}`
      const session: HomeworkSession = {
        sessionId: crypto.randomUUID(), name: autoName, createdAt: Date.now(),
        imageDataUrls: compressedUrls,
        problems: data.problems.map((p: { index: number; text: string; subject: string }) => ({ ...p, status: "not_started" as const })),
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

  const handleDemo = async () => {
    setError(null)
    try {
      const res = await fetch("/gemwork.jpg")
      const blob = await res.blob()
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setImages([{ dataUrl, mimeType: "image/jpeg" }])
        setAssignmentName("Demo Assignment")
      }
      reader.readAsDataURL(blob)
    } catch {
      setError("Could not load demo image.")
    }
  }

  const handleDelete = (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    deleteSession(sessionId)
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId))
  }

  const [lightbox, setLightbox] = useState<string | null>(null)

  const solvedCount = (s: HomeworkSession) => s.problems.filter((p) => p.status === "solved").length

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="relative flex items-center justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/HomeworkguruLogo.png" alt="Homework Guru" style={{ width: "180px", height: "180px", objectFit: "contain" }} />
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            {sessions.length > 0 && !showUpload && (
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full text-white transition-all hover:-translate-y-0.5"
                style={{ background: "var(--accent)", boxShadow: "0 4px 12px rgba(96,165,250,0.3)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Assignment
              </button>
            )}
            {sessions.length > 0 && showUpload && (
              <button
                onClick={() => { setShowUpload(false); setImages([]); setError(null) }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:-translate-y-0.5"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--accent)", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </button>
            )}
          </div>
        </div>

        {/* Upload panel */}
        {showUpload && (
          <div className="rounded-2xl p-6 mb-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 8px 20px rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}>
            <div className="mb-5">
              <h2 className="font-bold text-lg" style={{ color: "var(--text)" }}>New Assignment</h2>
            </div>

            <input
              type="text"
              value={assignmentName}
              onChange={(e) => setAssignmentName(e.target.value)}
              placeholder="Assignment name (optional)"
              className="w-full mb-4 px-4 py-2.5 text-sm rounded-xl focus:outline-none transition-all"
              style={{
                background: "var(--input-bg)",
                border: "2px solid rgba(96,165,250,0.3)",
                color: "var(--text)",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.15)" }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(96,165,250,0.3)"; e.currentTarget.style.boxShadow = "" }}
            />

            {images.length > 0 ? (
              <ImagePreview images={images} onRemove={handleRemove} onAddMore={handleAddMore} onParse={handleParse} isParsing={isParsing} />
            ) : (
              <>
                <UploadZone onImageSelected={handleImageSelected} />
                <div className="mt-3 text-center">
                  <button
                    onClick={handleDemo}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5"
                    style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.35)", color: "#c4b5fd", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Try Demo Assignment
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Assignments list */}
        {sessions.length > 0 && (
          <div className="pb-10">
            <p className="text-xs font-semibold mb-3 px-1" style={{ color: "var(--muted)" }}>Your Assignments</p>
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
                    className="block rounded-2xl p-4 transition-all group"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", backdropFilter: "blur(10px)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = allDone ? "rgba(16,185,129,0.5)" : "var(--border-hover)"
                      ;(e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"
                      ;(e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)"
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"
                      ;(e.currentTarget as HTMLElement).style.transform = ""
                      ;(e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)"
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm truncate" style={{ color: "var(--text)" }}>{session.name}</p>
                          {allDone && (
                            <span className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(16,185,129,0.15)", color: "var(--green)" }}>
                              ✓ Done
                            </span>
                          )}
                        </div>
                        <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                          {new Date(session.createdAt).toLocaleDateString()} · {total} problem{total !== 1 ? "s" : ""}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                            <div className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                background: allDone ? "var(--green)" : "var(--accent)",
                                boxShadow: allDone ? "0 0 6px rgba(16,185,129,0.4)" : "0 0 6px rgba(96,165,250,0.4)",
                              }} />
                          </div>
                          <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>{solved}/{total}</span>
                        </div>

                        {/* Homework image thumbnails */}
                        {session.imageDataUrls.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {session.imageDataUrls.map((url, i) => (
                              <button
                                key={i}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightbox(url) }}
                                className="rounded-lg overflow-hidden transition-all hover:scale-105 hover:opacity-90 flex-shrink-0"
                                style={{ border: "1px solid rgba(96,165,250,0.3)", height: "52px", background: "rgba(0,0,0,0.3)" }}
                                aria-label={`View page ${i + 1}`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt={`Page ${i + 1}`} className="h-full w-auto object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 self-center">
                        <button
                          onClick={(e) => handleDelete(session.sessionId, e)}
                          className="p-1.5 transition-opacity opacity-0 group-hover:opacity-100"
                          style={{ color: "var(--muted2)" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                          onMouseLeave={e => (e.currentTarget.style.color = "var(--muted2)")}
                          aria-label="Delete assignment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <svg className="w-4 h-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          style={{ color: "var(--muted2)" }}>
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
            <p className="text-sm">No assignments yet. Upload your first homework!</p>
          </div>
        )}

        {/* How it works */}
        <div className="mt-10 pb-10">
          <p className="text-xs font-semibold mb-4 px-1" style={{ color: "var(--muted)" }}>How It Works</p>
          <div className="rounded-2xl p-6 space-y-5"
            style={{ background: "rgba(15,30,60,0.85)", border: "1px solid rgba(96,165,250,0.2)", boxShadow: "0 8px 20px rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }}>
            {[
              {
                step: "1",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
                title: "Upload Your Homework",
                desc: "Take a photo or upload an image of your homework sheet. You can add multiple pages for longer assignments.",
              },
              {
                step: "2",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
                title: "AI Finds Your Problems",
                desc: "Our AI reads the image and extracts each individual question, identifying the subject automatically.",
              },
              {
                step: "3",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
                title: "Work With Your AI Tutor",
                desc: "Select any problem to open a chat with your personal tutor. It won't just give you the answer — it guides you with hints and questions so you actually learn.",
              },
              {
                step: "4",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
                title: "Mark Problems as Solved",
                desc: "Once you've worked through a problem and explained your reasoning, it gets marked solved. Track your progress across the whole assignment.",
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.3)", color: "var(--accent)" }}>
                  {step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent)" }}>
                      {icon}
                    </svg>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</p>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
                </div>
              </div>
            ))}

            <div className="pt-3" style={{ borderTop: "1px solid rgba(96,165,250,0.15)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>Handy tools while you work:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "📷 Crop view", desc: "See just your problem zoomed in" },
                  { label: "🧮 Calculator", desc: "Basic & scientific, paste answers to chat" },
                  { label: "🎤 Voice input", desc: "Speak your answers instead of typing" },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)" }}>
                    <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>{label}</span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>— {desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt="Homework" className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain"
              style={{ border: "1px solid rgba(96,165,250,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }} />
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ background: "rgba(30,41,59,0.95)", border: "1px solid rgba(96,165,250,0.4)", color: "var(--muted)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
