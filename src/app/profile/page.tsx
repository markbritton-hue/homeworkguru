"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { loadLearningProfile, listSessions } from "@/lib/firestore"
import type { LearningProfile, HomeworkSession } from "@/types"

function skillLabel(solved: number, avgTurns: number): { label: string; color: string; bg: string } {
  if (solved < 3) return { label: "Getting started", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" }
  if (avgTurns <= 5) return { label: "Strong", color: "#10b981", bg: "rgba(16,185,129,0.12)" }
  if (avgTurns <= 9) return { label: "Developing", color: "#818cf8", bg: "rgba(129,140,248,0.12)" }
  return { label: "Building up", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" }
}

const SUBJECT_ICONS: Record<string, string> = {
  Algebra: "𝑥", Geometry: "△", Calculus: "∫", Statistics: "σ",
  Biology: "🧬", Chemistry: "⚗", Physics: "⚛", Science: "🔬",
  History: "🏛", Civics: "🏛", English: "✍", Literature: "📖",
  default: "📚",
}

function subjectIcon(subject: string) {
  return SUBJECT_ICONS[subject] ?? SUBJECT_ICONS.default
}

function InitialsAvatar({ name, email }: { name: string | null; email: string | null }) {
  const letters = (name ?? email ?? "?")
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")
  return (
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0"
      style={{
        background: "linear-gradient(135deg, #60a5fa, #818cf8)",
        boxShadow: "0 0 32px rgba(96,165,250,0.4)",
        color: "#fff",
      }}
    >
      {letters || "?"}
    </div>
  )
}

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<LearningProfile | null>(null)
  const [sessions, setSessions] = useState<HomeworkSession[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return }
    if (!user || user.isAnonymous) { router.replace("/"); return }

    Promise.all([
      loadLearningProfile(user.uid),
      listSessions(user.uid),
    ]).then(([p, s]) => {
      setProfile(p)
      setSessions(s.sort((a, b) => b.createdAt - a.createdAt))
    }).finally(() => setLoadingData(false))
  }, [user, authLoading, router])

  if (authLoading || loadingData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading…</p>
      </main>
    )
  }

  if (!user) return null

  const totalSolved = profile?.totalSolved ?? 0
  const subjectEntries = Object.entries(profile?.subjectStats ?? {}).sort(
    (a, b) => b[1].solved - a[1].solved
  )
  const totalAssignments = sessions.length
  const memberSince = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--accent)", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* Identity card */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "rgba(15,30,60,0.85)", border: "1px solid rgba(96,165,250,0.2)", backdropFilter: "blur(10px)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
        >
          <div className="flex items-center gap-5">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="Avatar" className="w-20 h-20 rounded-full flex-shrink-0" style={{ boxShadow: "0 0 24px rgba(96,165,250,0.3)" }} />
            ) : (
              <InitialsAvatar name={user.displayName} email={user.email} />
            )}
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold truncate" style={{
                background: "linear-gradient(135deg, #60a5fa, #818cf8)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {user.displayName ?? user.email?.split("@")[0] ?? "Student"}
              </h1>
              <p className="text-sm truncate mt-0.5" style={{ color: "var(--muted)" }}>{user.email}</p>
              {memberSince && (
                <p className="text-xs mt-1" style={{ color: "var(--muted2)" }}>Member since {memberSince}</p>
              )}
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: totalSolved, label: "Problems solved" },
            { value: totalAssignments, label: "Assignments" },
            { value: subjectEntries.length, label: "Subjects" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="rounded-2xl p-4 text-center"
              style={{ background: "rgba(15,30,60,0.85)", border: "1px solid rgba(96,165,250,0.15)", backdropFilter: "blur(10px)" }}
            >
              <p className="text-3xl font-black" style={{
                background: "linear-gradient(135deg, #60a5fa, #818cf8)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {value}
              </p>
              <p className="text-xs mt-1 leading-tight" style={{ color: "var(--muted)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Subject breakdown */}
        {subjectEntries.length > 0 && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(15,30,60,0.85)", border: "1px solid rgba(96,165,250,0.2)", backdropFilter: "blur(10px)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
          >
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(96,165,250,0.1)", background: "rgba(96,165,250,0.06)" }}>
              <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>Subject Progress</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Based on how many exchanges it takes you per problem</p>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(96,165,250,0.08)" }}>
              {subjectEntries.map(([subject, stat]) => {
                const avg = stat.solved > 0 ? Math.round(stat.totalTurns / stat.solved) : 0
                const skill = skillLabel(stat.solved, avg)
                const maxSolved = Math.max(...subjectEntries.map(([, s]) => s.solved))
                const barPct = maxSolved > 0 ? (stat.solved / maxSolved) * 100 : 0
                return (
                  <div key={subject} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg flex-shrink-0">{subjectIcon(subject)}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{subject}</p>
                          <p className="text-xs" style={{ color: "var(--muted)" }}>
                            {stat.solved} problem{stat.solved !== 1 ? "s" : ""} · avg {avg} exchanges
                          </p>
                        </div>
                      </div>
                      <span
                        className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: skill.bg, color: skill.color, border: `1px solid ${skill.color}30` }}
                      >
                        {skill.label}
                      </span>
                    </div>
                    <div className="rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.07)" }}>
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${barPct}%`,
                          background: `linear-gradient(90deg, ${skill.color}99, ${skill.color})`,
                          boxShadow: `0 0 6px ${skill.color}60`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {totalSolved === 0 && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: "rgba(15,30,60,0.85)", border: "1px solid rgba(96,165,250,0.15)", backdropFilter: "blur(10px)" }}
          >
            <p className="text-2xl mb-2">🎓</p>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>No problems solved yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Start working through an assignment and your progress will appear here.
            </p>
            <Link
              href="/"
              className="inline-block mt-4 px-5 py-2 rounded-full text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #60a5fa, #818cf8)", boxShadow: "0 4px 16px rgba(96,165,250,0.35)" }}
            >
              Go to my assignments
            </Link>
          </div>
        )}

        {/* Account */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(15,30,60,0.85)", border: "1px solid rgba(96,165,250,0.15)", backdropFilter: "blur(10px)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(96,165,250,0.08)", background: "rgba(96,165,250,0.04)" }}>
            <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>Account</h2>
          </div>
          <div className="p-5">
            <button
              onClick={async () => { await signOut(); router.replace("/") }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}
