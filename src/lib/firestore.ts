import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { HomeworkSession, ChatMessage, ProblemStatus } from "@/types"

function sessionsCol(uid: string) {
  return collection(db, "users", uid, "sessions")
}

function sessionDoc(uid: string, sessionId: string) {
  return doc(db, "users", uid, "sessions", sessionId)
}

export async function saveSession(uid: string, session: HomeworkSession, imageDataUrls?: string[]): Promise<void> {
  const data = { ...session, imageDataUrls: imageDataUrls ?? session.imageDataUrls }
  await setDoc(sessionDoc(uid, session.sessionId), data)
}

export async function loadSession(uid: string, sessionId: string): Promise<HomeworkSession | null> {
  const snap = await getDoc(sessionDoc(uid, sessionId))
  if (!snap.exists()) return null
  const data = snap.data() as HomeworkSession
  if (!data.imageDataUrls) data.imageDataUrls = []
  return data
}

export async function listSessions(uid: string): Promise<HomeworkSession[]> {
  const snap = await getDocs(sessionsCol(uid))
  return snap.docs.map((d) => d.data() as HomeworkSession)
}

export async function deleteSession(uid: string, sessionId: string): Promise<void> {
  await deleteDoc(sessionDoc(uid, sessionId))
}

export async function updateProblemStatus(
  uid: string,
  sessionId: string,
  problemIndex: number,
  status: ProblemStatus
): Promise<void> {
  const session = await loadSession(uid, sessionId)
  if (!session) return
  session.problems[problemIndex].status = status
  await updateDoc(sessionDoc(uid, sessionId), { problems: session.problems })
}

export async function appendChatMessage(
  uid: string,
  sessionId: string,
  problemIndex: number,
  message: ChatMessage
): Promise<void> {
  const session = await loadSession(uid, sessionId)
  if (!session) return
  if (!session.chatHistory[problemIndex]) session.chatHistory[problemIndex] = []
  session.chatHistory[problemIndex].push(message)
  await updateDoc(sessionDoc(uid, sessionId), { chatHistory: session.chatHistory })
}
