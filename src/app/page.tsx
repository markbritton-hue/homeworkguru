"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { UploadZone } from "@/components/upload/UploadZone"
import { ImagePreview } from "@/components/upload/ImagePreview"
import { compressImage } from "@/lib/image-utils"
import { saveSession, listSessions, deleteSession } from "@/lib/firestore"
import { useAuth } from "@/contexts/AuthContext"
import type { HomeworkSession } from "@/types"

type MimeType = "image/jpeg" | "image/png" | "image/webp" | "image/gif"
interface ImageEntry { dataUrl: string; mimeType: MimeType }

function LandingPage() {
  return (
    <main className="min-h-screen px-4 py-10 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>

      {/* Washed-out background logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/HomeworkguruLogo.png"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90vmin",
          height: "90vmin",
          objectFit: "contain",
          opacity: 0.04,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/HomeworkguruLogo.png" alt="Homework Guru" className="mx-auto mb-2" style={{ width: "200px", height: "200px", objectFit: "contain" }} />
          <p className="text-xs mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
          <h1 className="text-4xl font-extrabold mb-4" style={{
            background: "linear-gradient(135deg, #60a5fa, #818cf8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Your Personal AI Homework Guru
          </h1>
          <p className="text-lg max-w-xl mx-auto mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>
            Upload a photo of any homework sheet and get guided through every problem — with hints and questions, not just answers.
          </p>
          <p className="text-base font-semibold mb-8" style={{ color: "rgba(255,255,255,0.75)" }}>
            Sorry, I don&apos;t just give out answers
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/login?mode=signup"
              className="px-8 py-3 rounded-full text-base font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #60a5fa, #818cf8)", boxShadow: "0 4px 20px rgba(96,165,250,0.4)" }}>
              Get Started Free
            </Link>

            <Link href="/demo"
              className="px-8 py-3 rounded-full text-base font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)" }}>
              Try a Demo
            </Link>
          </div>
          <p className="mt-4 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "rgba(255,255,255,0.75)" }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {[
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
              title: "Upload Any Homework",
              desc: "Take a photo or upload an image of any worksheet. Maths, science, English — our AI reads it all.",
            },
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
              title: "Guided, Not Spoon-Fed",
              desc: "Your guru asks questions and gives hints so you actually understand — not just copy an answer.",
            },
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
              title: "Track Your Progress",
              desc: "Every problem is tracked. See exactly how far through each assignment you are at a glance.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-2xl p-6"
              style={{ background: "rgba(30,41,59,0.6)", border: "1px solid rgba(96,165,250,0.15)", backdropFilter: "blur(10px)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#60a5fa" }}>
                  {icon}
                </svg>
              </div>
              <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>{title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="rounded-2xl overflow-hidden mb-16"
          style={{ background: "rgba(30,15,5,0.9)", border: "1px solid rgba(251,146,60,0.3)", boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(251,146,60,0.25)", background: "rgba(251,146,60,0.1)" }}>
            <h2 className="text-xl font-bold" style={{
              background: "linear-gradient(135deg, #fb923c, #f59e0b)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>How It Works</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { step: "1", title: "Upload your homework", desc: "Take a photo or upload an image of your worksheet." },
              { step: "2", title: "AI finds every problem", desc: "Each question is extracted and identified automatically." },
              { step: "3", title: "Chat with your guru", desc: "Get guided hints — not just answers — so you actually learn." },
              { step: "4", title: "Track your progress", desc: "Problems get marked solved as you work through them." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(251,146,60,0.15)", border: "1px solid rgba(251,146,60,0.3)", color: "#fb923c" }}>
                  {step}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text)" }}>{title}</p>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--text)" }}>Ready to get started?</h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Free to use. No credit card required.</p>
          <Link href="/login?mode=signup"
            className="inline-block px-10 py-3 rounded-full text-base font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #60a5fa, #818cf8)", boxShadow: "0 4px 20px rgba(96,165,250,0.4)" }}>
            Create a Free Account
          </Link>
          <p className="mt-4 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold transition-colors hover:underline" style={{ color: "rgba(255,255,255,0.75)" }}>
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </main>
  )
}

function HomePageInner() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const searchParams = useSearchParams()
  const demoTriggered = useRef(false)
  const [images, setImages] = useState<ImageEntry[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<HomeworkSession[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [assignmentName, setAssignmentName] = useState("")
  const [showWelcome, setShowWelcome] = useState(false)

  // No redirect — logged-out users see the landing page instead

  const isDemo = searchParams.get("demo") === "1"

  useEffect(() => {
    if (!user) return
    const uid = user.uid

    const init = async () => {
      let loaded: typeof sessions = []
      try {
        loaded = await listSessions(uid)
        loaded.sort((a, b) => b.createdAt - a.createdAt)
        setSessions(loaded)
      } catch (err) {
        setError("Could not load your assignments: " + (err instanceof Error ? err.message : String(err)))
        setShowUpload(true)
        return
      }

      const shouldAutoOnboard =
        loaded.length === 0 &&
        !demoTriggered.current &&
        (isDemo || (!user.isAnonymous && Date.now() - new Date(user.metadata.creationTime ?? 0).getTime() < 2 * 60 * 1000))

      if (shouldAutoOnboard) {
        demoTriggered.current = true
        autoOnboard(uid)
        return
      }

      setShowUpload(loaded.length === 0)
      if (loaded.length === 0) {
        try { if (!localStorage.getItem("welcome_seen")) setShowWelcome(true) } catch {}
      }
    }

    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isDemo])

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
    if (images.length === 0 || !user) return
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
      const sessionId = crypto.randomUUID()
      const session: HomeworkSession = {
        sessionId, name: autoName, createdAt: Date.now(),
        imageDataUrls: [],
        problems: data.problems.map((p: { index: number; text: string; subject: string }) => ({ ...p, status: "not_started" as const })),
        chatHistory: {},
      }
      await saveSession(user.uid, session, compressedUrls)
      router.push(`/session/${sessionId}`)
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

  const autoOnboard = async (uid: string) => {
    setIsParsing(true)
    setError(null)
    try {
      // Fetch demo image
      const res = await fetch("/gemwork.jpg")
      const blob = await res.blob()
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(blob)
      })
      const compressed = await compressImage(dataUrl)

      // Parse problems
      const response = await fetch("/api/parse-homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: [{ imageBase64: dataUrl, mimeType: "image/jpeg" }] }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Failed to read demo homework.")
        setShowUpload(true)
        return
      }

      const sessionId = crypto.randomUUID()
      const session: HomeworkSession = {
        sessionId, name: "Demo Assignment", createdAt: Date.now(),
        imageDataUrls: [],
        problems: data.problems.map((p: { index: number; text: string; subject: string }) => ({ ...p, status: "not_started" as const })),
        chatHistory: {},
      }

      await saveSession(uid, session, [compressed])

      setSessions([session])
      setShowUpload(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong loading the demo.")
      setShowUpload(true)
    } finally {
      setIsParsing(false)
    }
  }

  const handleDelete = (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) return
    deleteSession(user.uid, sessionId)
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId))
  }

  const [lightbox, setLightbox] = useState<string | null>(null)

  const solvedCount = (s: HomeworkSession) => s.problems.filter((p) => p.status === "solved").length

  if (authLoading) return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Loading…</p>
    </main>
  )

  if (!user) return <LandingPage />

  if (isParsing && sessions.length === 0 && !showUpload) return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/HomeworkguruLogo.png" alt="Homework Guru" style={{ height: "100px", objectFit: "contain" }} />
      <p className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>Setting up your demo assignment…</p>
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Finding problems in your homework</p>
      <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.6)", marginTop: "8px" }}>This is a picture of a Gemomentry Paper</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/gemwork.jpg" alt="Demo homework sheet" style={{ maxWidth: "320px", width: "100%", borderRadius: "12px", border: "1px solid rgba(96,165,250,0.3)", marginTop: "8px", opacity: 0.85 }} />
      <div className="flex gap-1.5 mt-2">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#60a5fa", animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </main>
  )

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Guest banner */}
        {user.isAnonymous && (
          <div className="mb-4 rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
            style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.3)" }}>
            <p className="text-sm" style={{ color: "#fb923c" }}>
              You&apos;re in demo mode — <span style={{ color: "rgba(255,255,255,0.7)" }}>create a free account to save your assignments.</span>
            </p>
            <Link href="/login"
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(251,146,60,0.2)", border: "1px solid rgba(251,146,60,0.4)", color: "#fb923c" }}>
              Sign Up
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="relative flex items-center justify-center mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/HomeworkguruLogo.png" alt="Homework Guru" style={{ width: "260px", height: "260px", objectFit: "contain" }} />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-end gap-2">
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
            <a
              href="mailto:mark.britton@gmail.com?subject=Homework%20Guru%20Feedback"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)", color: "#93c5fd" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Feedback
            </a>
          </div>
        </div>
        <p className="text-xs text-center mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
        <p className="text-xs text-center mb-6" style={{ color: "rgba(255,255,255,0.2)" }}>Image parsing · Claude Sonnet &nbsp;|&nbsp; Tutor chat · Llama 3.3 70b</p>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-10">

          {/* LEFT: Assignments */}
          <div>
            {/* Upload panel */}
            {showUpload && (
              <div className="rounded-2xl p-4 mb-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 8px 20px rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}>
                <div className="mb-3">
                  <h2 className="font-bold text-lg" style={{ color: "var(--text)" }}>New Assignment</h2>
                </div>

                <input
                  type="text"
                  value={assignmentName}
                  onChange={(e) => setAssignmentName(e.target.value)}
                  placeholder="Assignment name (optional)"
                  className="w-full mb-3 px-4 py-2 text-sm rounded-xl focus:outline-none transition-all"
                  style={{
                    background: "var(--input-bg)",
                    border: "2px solid rgba(96,165,250,0.3)",
                    color: "var(--text)",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.15)" }}
                  onBlur={e => { e.currentTarget.style.borderColor = "rgba(96,165,250,0.3)"; e.currentTarget.style.boxShadow = "" }}
                />

                {images.length > 0 ? (
                  <ImagePreview images={images} onRemove={handleRemove} onAddMore={handleAddMore} onParse={handleParse} isParsing={isParsing} isDemo={user.isAnonymous} />
                ) : (
                  <>
                    <UploadZone onImageSelected={handleImageSelected} />
                    <div className="mt-2 text-center">
                      <div className="inline-flex flex-col items-start gap-1.5">
                        {user.isAnonymous && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold animate-pulse"
                            style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.6)", color: "#10b981", boxShadow: "0 0 12px rgba(16,185,129,0.4)" }}>
                            <span className="w-2 h-2 rounded-full animate-ping inline-block" style={{ background: "#10b981" }} />
                            Step 1
                          </span>
                        )}
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
              <div>
                {/* Demo hint badge */}
                {user.isAnonymous && (
                  <div className="mb-3 flex items-center gap-2 px-4 py-3 rounded-2xl animate-pulse"
                    style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.4)" }}>
                    <span className="relative flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75" style={{ background: "#60a5fa" }} />
                      <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "#60a5fa" }} />
                    </span>
                    <p className="text-sm font-semibold" style={{ color: "#93c5fd" }}>
                      👆 Tap the demo assignment below to see your problems
                    </p>
                  </div>
                )}
                <div className="rounded-2xl overflow-hidden mb-3"
                  style={{ background: "rgba(15,30,60,0.85)", border: "1px solid rgba(96,165,250,0.2)", boxShadow: "0 8px 20px rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }}>
                  <div className="px-3 py-2 flex items-center justify-between" style={{ background: "rgba(96,165,250,0.08)" }}>
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/Gurulogo.png" alt="Guru" style={{ height: "70px", width: "auto", objectFit: "contain" }} />
                      <h2 className="text-xl font-bold" style={{
                        background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      }}>Your Assignments</h2>
                    </div>
                    {!showUpload ? (
                      <button
                        onClick={() => setShowUpload(true)}
                        className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full text-white transition-all hover:-translate-y-0.5"
                        style={{ background: "var(--accent)", boxShadow: "0 4px 12px rgba(96,165,250,0.3)" }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                      </button>
                    ) : (
                      <button
                        onClick={() => { setShowUpload(false); setImages([]); setError(null) }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:-translate-y-0.5"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--accent)", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
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

          </div>

          {/* RIGHT: How it works + Feature updates */}
          <div className="space-y-6">

            {/* How it works */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(30,15,5,0.9)", border: "1px solid rgba(251,146,60,0.3)", boxShadow: "0 8px 20px rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(251,146,60,0.25)", background: "rgba(251,146,60,0.1)" }}>
                <h2 className="text-xl font-bold" style={{
                  background: "linear-gradient(135deg, #fb923c, #f59e0b)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>How It Works</h2>
              </div>
              <div className="p-6 space-y-5">
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
                    title: "Work With Your AI Guru",
                    desc: "Select any problem to open a chat with your personal guru. It won't just give you the answer — it guides you with hints and questions so you actually learn.",
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
                      style={{ background: "rgba(251,146,60,0.15)", border: "1px solid rgba(251,146,60,0.3)", color: "#fb923c" }}>
                      {step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#fb923c" }}>
                          {icon}
                        </svg>
                        <p className="text-base font-semibold" style={{ color: "var(--text)" }}>{title}</p>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
                    </div>
                  </div>
                ))}

                <div className="pt-3" style={{ borderTop: "1px solid rgba(251,146,60,0.2)" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>Handy tools while you work:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "📷 Crop view", desc: "See just your problem zoomed in" },
                      { label: "🧮 Calculator", desc: "Basic & scientific, paste answers to chat" },
                      { label: "🎤 Voice input", desc: "Speak your answers instead of typing" },
                    ].map(({ label, desc }) => (
                      <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)" }}>
                        <span className="text-xs font-semibold" style={{ color: "#fb923c" }}>{label}</span>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>— {desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature updates */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(10,20,40,0.9)", border: "1px solid rgba(96,165,250,0.2)", boxShadow: "0 8px 20px rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(96,165,250,0.15)", background: "rgba(96,165,250,0.06)" }}>
                <h2 className="text-xl font-bold" style={{
                  background: "linear-gradient(135deg, #60a5fa, #818cf8)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>What&apos;s New</h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  {
                    version: "v0.2.0",
                    title: "Worked solutions",
                    desc: "After solving a problem, tap 'How we got there' to see the full step-by-step working.",
                  },
                  {
                    version: "v0.1.0",
                    title: "Voice input",
                    desc: "Speak your answers directly into the guru chat — no typing needed.",
                  },
                  {
                    version: "v0.1.0",
                    title: "Built-in calculator",
                    desc: "Basic and scientific calculator available on every problem, with one-tap paste into chat.",
                  },
                  {
                    version: "v0.1.0",
                    title: "Multi-page uploads",
                    desc: "Add multiple images to a single assignment for longer worksheets.",
                  },
                  {
                    version: "v0.1.0",
                    title: "Progress tracking",
                    desc: "See how many problems you've solved at a glance from your assignments list.",
                  },
                ].map(({ version, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <span className="flex-shrink-0 text-xs font-semibold pt-0.5 w-16" style={{ color: "rgba(96,165,250,0.5)" }}>{version}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</p>
                      <p className="text-xs leading-relaxed mt-0.5" style={{ color: "var(--muted)" }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Streamwave footer */}
        <div className="mt-10 pt-6 flex flex-col items-center gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/StreaWaveProd-LogoTrans-White.png" alt="Streamwave" style={{ height: "64px", objectFit: "contain", opacity: 0.7 }} />
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            <a href="mailto:mark.britton@gmail.com" style={{ color: "inherit", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
              mark.britton@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Welcome modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "rgba(10,18,35,0.98)", border: "1px solid rgba(251,146,60,0.35)" }}>

            {/* Header */}
            <div className="px-6 pt-8 pb-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/HomeworkguruLogo.png" alt="Homework Guru" className="mx-auto mb-4" style={{ height: "100px", objectFit: "contain" }} />
              <p className="text-sm" style={{ color: "var(--muted)" }}>Your personal AI homework guru</p>
            </div>

            {/* Steps */}
            <div className="px-6 pb-4 space-y-4">
              {[
                { step: "1", title: "Upload your homework", desc: "Take a photo or upload an image of your worksheet." },
                { step: "2", title: "AI finds every problem", desc: "Each question is extracted and identified automatically." },
                { step: "3", title: "Chat with your guru", desc: "Get guided hints — not just answers — so you actually learn." },
                { step: "4", title: "Track your progress", desc: "Problems get marked solved as you work through them." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "rgba(251,146,60,0.15)", border: "1px solid rgba(251,146,60,0.35)", color: "#fb923c" }}>
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="px-6 pb-8 pt-2">
              <button
                onClick={() => { localStorage.setItem("welcome_seen", "1"); setShowWelcome(false); setShowUpload(true) }}
                className="w-full py-3 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #fb923c, #f59e0b)", boxShadow: "0 4px 16px rgba(251,146,60,0.4)" }}
              >
                Get Started →
              </button>
            </div>
          </div>
        </div>
      )}

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

export default function HomePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Loading…</p>
      </main>
    }>
      <HomePageInner />
    </Suspense>
  )
}
