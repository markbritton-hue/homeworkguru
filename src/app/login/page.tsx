"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const { user, loading, signIn, signUp, signInWithGoogle, signInAsGuest } = useAuth()
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

  const handleGoogle = async () => {
    setError(null)
    setBusy(true)
    try {
      await signInWithGoogle()
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

          {/* Google */}
          <button onClick={handleGoogle} disabled={busy}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
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
