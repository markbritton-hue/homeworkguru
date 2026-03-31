import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

const STATS_DOC = adminDb.collection("appStats").doc("totals")

export async function incrementStatsAdmin(updates: {
  sessions?: number
  parseInputTokens?: number
  parseOutputTokens?: number
  tutorInputTokens?: number
  tutorOutputTokens?: number
}) {
  const data: Record<string, unknown> = { lastUpdated: FieldValue.serverTimestamp() }
  if (updates.sessions)           data.sessions           = FieldValue.increment(updates.sessions)
  if (updates.parseInputTokens)   data.parseInputTokens   = FieldValue.increment(updates.parseInputTokens)
  if (updates.parseOutputTokens)  data.parseOutputTokens  = FieldValue.increment(updates.parseOutputTokens)
  if (updates.tutorInputTokens)   data.tutorInputTokens   = FieldValue.increment(updates.tutorInputTokens)
  if (updates.tutorOutputTokens)  data.tutorOutputTokens  = FieldValue.increment(updates.tutorOutputTokens)
  await STATS_DOC.set(data, { merge: true })
}
