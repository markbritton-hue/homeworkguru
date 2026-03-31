import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

const STATS_DOC = doc(db, "appStats", "totals")

export async function incrementStats(updates: {
  sessions?: number
  parseInputTokens?: number
  parseOutputTokens?: number
  tutorInputTokens?: number
  tutorOutputTokens?: number
}) {
  // Ensure document exists first
  const snap = await getDoc(STATS_DOC)
  if (!snap.exists()) {
    await setDoc(STATS_DOC, {
      sessions: 0,
      parseInputTokens: 0,
      parseOutputTokens: 0,
      tutorInputTokens: 0,
      tutorOutputTokens: 0,
      lastUpdated: serverTimestamp(),
    })
  }

  const data: Record<string, unknown> = { lastUpdated: serverTimestamp() }
  if (updates.sessions)           data.sessions           = increment(updates.sessions)
  if (updates.parseInputTokens)   data.parseInputTokens   = increment(updates.parseInputTokens)
  if (updates.parseOutputTokens)  data.parseOutputTokens  = increment(updates.parseOutputTokens)
  if (updates.tutorInputTokens)   data.tutorInputTokens   = increment(updates.tutorInputTokens)
  if (updates.tutorOutputTokens)  data.tutorOutputTokens  = increment(updates.tutorOutputTokens)
  await updateDoc(STATS_DOC, data)
}

export async function loadStats() {
  const snap = await getDoc(STATS_DOC)
  if (!snap.exists()) return null
  return snap.data() as {
    sessions: number
    parseInputTokens: number
    parseOutputTokens: number
    tutorInputTokens: number
    tutorOutputTokens: number
    lastUpdated: { toDate: () => Date }
  }
}
