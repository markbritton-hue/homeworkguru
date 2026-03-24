"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { loadSession } from "@/lib/session-storage"
import { ProblemStatement } from "@/components/chat/ProblemStatement"
import { ChatInterface } from "@/components/chat/ChatInterface"
import Link from "next/link"
import type { HomeworkSession } from "@/types"

export default function ProblemPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const problemIndex = parseInt(params.problemIndex as string, 10)
  const [session, setSession] = useState<HomeworkSession | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const s = loadSession(sessionId)
    if (s && s.problems[problemIndex]) {
      setSession(s)
    } else {
      setNotFound(true)
    }
  }, [sessionId, problemIndex])

  if (notFound) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Problem not found.</p>
          <Link href={`/session/${sessionId}`} className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
            ← Back to problems
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

  const problem = session.problems[problemIndex]

  return (
    <main className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <ProblemStatement
        problemNumber={problemIndex + 1}
        subject={problem.subject}
        text={problem.text}
        sessionId={sessionId}
      />
      <ChatInterface sessionId={sessionId} problemIndex={problemIndex} />
    </main>
  )
}
