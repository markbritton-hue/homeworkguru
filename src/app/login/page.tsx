"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const { user, loading, signIn, signUp, signInAsGuest } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace("/")
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === "signin") {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      router.replace("/")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      setError(msg.replace("Firebase: ", "").replace(/\(auth\/.*?\)\.?/, "").trim())
    } finally {
      setBusy(false)
    }
  }

  const handleDemo = async () => {
    setError(null)
    setBusy(true)
    try {
      await signInAsGuest()
      router.replace("/?demo=1")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      setError(msg.replace("Firebase: ", "").replace(/\(auth\/.*?\)\.?/, "").trim())
    } finally {
      setBusy(false)
    }
  }

  if (loading || user) return null

  const inputStyle: React.CSSProperties = {
    background: "rgba(15,23,42,0.7)",
    border: "2px solid rgba(96,165,250,0.3)",
    color: "#fff",
    borderRadius: "12px",
    padding: "10px 16px",
    width: "100%",
    fontSize: "14px",
    outline: "none",
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/HomeworkguruLogo.png" alt="Homework Guru" className="mx-auto" style={{ height: "180px", objectFit: "contain" }} />
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>Your personal AI homework tutor</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6"
          style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(96,165,250,0.2)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", backdropFilter: "blur(20px)" }}>

          {/* Toggle */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: "rgba(15,23,42,0.6)" }}>
            {(["signin", "signup"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(null) }}
                className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
                style={mode === m
                  ? { background: "var(--accent)", color: "#fff", boxShadow: "0 4px 12px rgba(96,165,250,0.3)" }
                  : { color: "rgba(255,255,255,0.4)" }}>
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email" required style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = "#60a5fa"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.15)" }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(96,165,250,0.3)"; e.currentTarget.style.boxShadow = "" }}
            />
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" required style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = "#60a5fa"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.15)" }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(96,165,250,0.3)"; e.currentTarget.style.boxShadow = "" }}
            />

            {error && (
              <p className="text-xs px-1" style={{ color: "#f87171" }}>{error}</p>
            )}

            <button type="submit" disabled={busy}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: "var(--accent)", boxShadow: "0 4px 12px rgba(96,165,250,0.35)", marginTop: "8px" }}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>

          {/* Demo */}
          <button onClick={handleDemo} disabled={busy}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.35)", color: "#fb923c" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Try Demo — no account needed
          </button>
        </div>
      </div>
    </main>
  )
}
