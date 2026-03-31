import { doc, getDoc, setDoc, increment, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

const STATS_DOC = doc(db, "appStats", "totals")

export async function incrementStats(_uid: string, updates: {
  sessions?: number
  parseInputTokens?: number
  parseOutputTokens?: number
  tutorInputTokens?: number
  tutorOutputTokens?: number
}) {
  const data: Record<string, unknown> = { lastUpdated: serverTimestamp() }
  if (updates.sessions)           data.sessions           = increment(updates.sessions)
  if (updates.parseInputTokens)   data.parseInputTokens   = increment(updates.parseInputTokens)
  if (updates.parseOutputTokens)  data.parseOutputTokens  = increment(updates.parseOutputTokens)
  if (updates.tutorInputTokens)   data.tutorInputTokens   = increment(updates.tutorInputTokens)
  if (updates.tutorOutputTokens)  data.tutorOutputTokens  = increment(updates.tutorOutputTokens)
  await setDoc(STATS_DOC, data, { merge: true })
}

export async function loadStats(_uid: string) {
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
