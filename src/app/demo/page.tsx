"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function DemoPage() {
  const { user, loading, signInAsGuest } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (user) { router.replace("/?demo=1"); return }
    signInAsGuest()
      .then(() => router.replace("/?demo=1"))
      .catch(() => router.replace("/login"))
  }, [loading, user, signInAsGuest, router])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/HomeworkguruLogo.png" alt="Homework Guru" style={{ height: "100px", objectFit: "contain" }} />
      <p className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>Loading your demo…</p>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: "#60a5fa", animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </main>
  )
}
