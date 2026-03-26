import type { HomeworkSession, ChatMessage, ProblemStatus } from "@/types"

const PREFIX = "hwguru_session_"

export function saveSession(session: HomeworkSession): void {
  try {
    localStorage.setItem(PREFIX + session.sessionId, JSON.stringify(session))
  } catch {
    // localStorage full — try to free space by removing old sessions
    pruneOldSessions()
    try {
      localStorage.setItem(PREFIX + session.sessionId, JSON.stringify(session))
    } catch {
      console.warn("Could not save session to localStorage")
    }
  }
}

export function loadSession(sessionId: string): HomeworkSession | null {
  try {
    const raw = localStorage.getItem(PREFIX + sessionId)
    if (!raw) return null
    const session = JSON.parse(raw) as HomeworkSession & { imageDataUrl?: string }
    // backfill name for older sessions that didn't have one
    if (!session.name) {
      const subjects = [...new Set(session.problems.map((p) => p.subject))]
      session.name = subjects.slice(0, 2).join(" & ") || "Homework"
    }
    // backfill imageDataUrls for older single-image sessions
    if (!session.imageDataUrls && session.imageDataUrl) {
      session.imageDataUrls = [session.imageDataUrl]
    }
    if (!session.imageDataUrls) session.imageDataUrls = []
    return session as HomeworkSession
  } catch {
    return null
  }
}

export function updateProblemStatus(
  sessionId: string,
  problemIndex: number,
  status: ProblemStatus
): void {
  const session = loadSession(sessionId)
  if (!session) return
  session.problems[problemIndex].status = status
  saveSession(session)
}

export function appendChatMessage(
  sessionId: string,
  problemIndex: number,
  message: ChatMessage
): void {
  const session = loadSession(sessionId)
  if (!session) return
  if (!session.chatHistory[problemIndex]) {
    session.chatHistory[problemIndex] = []
  }
  session.chatHistory[problemIndex].push(message)
  saveSession(session)
}

export function deleteSession(sessionId: string): void {
  localStorage.removeItem(PREFIX + sessionId)
}

export function listSessions(): string[] {
  const ids: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(PREFIX)) {
      ids.push(key.replace(PREFIX, ""))
    }
  }
  return ids
}

function pruneOldSessions(): void {
  const ids = listSessions()
  if (ids.length === 0) return
  // Remove the oldest session
  let oldest: { id: string; ts: number } | null = null
  for (const id of ids) {
    const s = loadSession(id)
    if (s && (!oldest || s.createdAt < oldest.ts)) {
      oldest = { id, ts: s.createdAt }
    }
  }
  if (oldest) {
    localStorage.removeItem(PREFIX + oldest.id)
  }
}
