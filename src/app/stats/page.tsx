"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { loadStats } from "@/lib/stats"

const ADMIN_EMAIL = "mark.britton@gmail.com"

type Stats = {
  sessions: number
  parseInputTokens: number
  parseOutputTokens: number
  tutorInputTokens: number
  tutorOutputTokens: number
  lastUpdated: { toDate: () => Date }
}

// Claude pricing (per 1M tokens, as of 2025)
const SONNET_INPUT_PER_M  = 3.00
const SONNET_OUTPUT_PER_M = 15.00
const HAIKU_INPUT_PER_M   = 0.80
const HAIKU_OUTPUT_PER_M  = 4.00

function usd(n: number) {
  return n < 0.01 ? "<$0.01" : `$${n.toFixed(4)}`
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(15,30,60,0.8)", border: "1px solid rgba(96,165,250,0.2)" }}>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: "#60a5fa" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{sub}</p>}
    </div>
  )
}

export default function StatsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user || user.email !== ADMIN_EMAIL) { router.replace("/"); return }
    loadStats(user.uid).then((s) => { setStats(s); setFetching(false) })
  }, [user, loading, router])

  if (loading || fetching) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Loading…</p>
      </main>
    )
  }

  if (!stats) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>No stats recorded yet.</p>
      </main>
    )
  }

  const parseCost = (stats.parseInputTokens / 1_000_000) * SONNET_INPUT_PER_M
                  + (stats.parseOutputTokens / 1_000_000) * SONNET_OUTPUT_PER_M
  const tutorCost = (stats.tutorInputTokens / 1_000_000) * HAIKU_INPUT_PER_M
                  + (stats.tutorOutputTokens / 1_000_000) * HAIKU_OUTPUT_PER_M
  const totalCost = parseCost + tutorCost
  const totalTokens = stats.parseInputTokens + stats.parseOutputTokens + stats.tutorInputTokens + stats.tutorOutputTokens
  const lastUpdated = stats.lastUpdated?._seconds
    ? new Date(stats.lastUpdated._seconds * 1000).toLocaleString()
    : "—"

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#60a5fa" }}>App Stats</h1>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Last updated: {lastUpdated}</p>
          </div>
          <button onClick={() => router.back()} className="text-xs px-3 py-1.5 rounded-full transition-opacity hover:opacity-70"
            style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)", color: "#93c5fd" }}>
            ← Back
          </button>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Stat label="Sessions Created" value={stats.sessions ?? 0} />
          <Stat label="Total Tokens Used" value={(totalTokens).toLocaleString()} />
        </div>

        {/* Image parsing */}
        <h2 className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
          Image Parsing · Claude Sonnet
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Stat label="Input Tokens" value={(stats.parseInputTokens ?? 0).toLocaleString()} />
          <Stat label="Output Tokens" value={(stats.parseOutputTokens ?? 0).toLocaleString()} />
          <Stat label="Est. Cost" value={usd(parseCost)} sub={`$${SONNET_INPUT_PER_M}/M in · $${SONNET_OUTPUT_PER_M}/M out`} />
        </div>

        {/* Tutor chat */}
        <h2 className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
          Tutor Chat · Claude Haiku
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Stat label="Input Tokens" value={(stats.tutorInputTokens ?? 0).toLocaleString()} />
          <Stat label="Output Tokens" value={(stats.tutorOutputTokens ?? 0).toLocaleString()} />
          <Stat label="Est. Cost" value={usd(tutorCost)} sub={`$${HAIKU_INPUT_PER_M}/M in · $${HAIKU_OUTPUT_PER_M}/M out`} />
        </div>

        {/* Total */}
        <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.3)" }}>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Total Est. Claude API Cost</p>
          <p className="text-4xl font-bold" style={{ color: "#60a5fa" }}>{usd(totalCost)}</p>
        </div>
      </div>
    </main>
  )
}
