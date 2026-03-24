"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { loadSession } from "@/lib/session-storage"
import { SessionHeader } from "@/components/session/SessionHeader"
import { ProblemCard } from "@/components/session/ProblemCard"
import Link from "next/link"
import type { HomeworkSession } from "@/types"

export default function SessionPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [session, setSession] = useState<HomeworkSession | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const s = loadSession(sessionId)
    if (s) {
      setSession(s)
    } else {
      setNotFound(true)
    }
  }, [sessionId])

  if (notFound) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Session not found or expired.</p>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
            ← Upload new homework
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

  const solved = session.problems.filter((p) => p.status === "solved").length

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Homework Guru</h1>
        </div>

        <SessionHeader solved={solved} total={session.problems.length} />

        <div className="space-y-3">
          {session.problems.map((problem) => (
            <ProblemCard key={problem.index} problem={problem} sessionId={sessionId} />
          ))}
        </div>
      </div>
    </main>
  )
}
