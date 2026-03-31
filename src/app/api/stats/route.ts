import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

const STATS_DOC = adminDb.collection("appStats").doc("totals")

export async function GET() {
  const snap = await STATS_DOC.get()
  if (!snap.exists) return NextResponse.json(null)
  return NextResponse.json(snap.data())
}

export async function POST(req: NextRequest) {
  const updates = await req.json()
  const data: Record<string, unknown> = { lastUpdated: FieldValue.serverTimestamp() }
  if (updates.sessions)           data.sessions           = FieldValue.increment(updates.sessions)
  if (updates.parseInputTokens)   data.parseInputTokens   = FieldValue.increment(updates.parseInputTokens)
  if (updates.parseOutputTokens)  data.parseOutputTokens  = FieldValue.increment(updates.parseOutputTokens)
  if (updates.tutorInputTokens)   data.tutorInputTokens   = FieldValue.increment(updates.tutorInputTokens)
  if (updates.tutorOutputTokens)  data.tutorOutputTokens  = FieldValue.increment(updates.tutorOutputTokens)
  await STATS_DOC.set(data, { merge: true })
  return NextResponse.json({ ok: true })
}
