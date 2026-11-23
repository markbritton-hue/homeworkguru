import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  runTransaction,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { HomeworkSession, ChatMessage, ProblemStatus, LearningProfile } from "@/types"

function profileDoc(uid: string) {
  return doc(db, "users", uid, "meta", "learningProfile")
}

export async function loadLearningProfile(uid: string): Promise<LearningProfile | null> {
  const snap = await getDoc(profileDoc(uid))
  return snap.exists() ? (snap.data() as LearningProfile) : null
}

export async function recordProblemSolved(uid: string, subject: string, turns: number): Promise<void> {
  const ref = profileDoc(uid)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const profile: LearningProfile = snap.exists()
      ? (snap.data() as LearningProfile)
      : { subjectStats: {}, totalSolved: 0, updatedAt: 0 }
    const existing = profile.subjectStats[subject] ?? { solved: 0, totalTurns: 0 }
    profile.subjectStats[subject] = { solved: existing.solved + 1, totalTurns: existing.totalTurns + turns }
    profile.totalSolved = (profile.totalSolved ?? 0) + 1
    profile.updatedAt = Date.now()
    tx.set(ref, profile)
  })
}

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

export async function deleteProblem(uid: string, sessionId: string, problemIndex: number): Promise<void> {
  const ref = sessionDoc(uid, sessionId)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) return
    const session = snap.data() as HomeworkSession
    const problems = session.problems.filter((p) => p.index !== problemIndex)
    tx.update(ref, { problems })
  })
}

export async function updateProblemStatus(
  uid: string,
  sessionId: string,
  problemIndex: number,
  status: ProblemStatus
): Promise<void> {
  const ref = sessionDoc(uid, sessionId)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) return
    const session = snap.data() as HomeworkSession
    const problem = session.problems.find((p) => p.index === problemIndex)
    if (!problem) return
    problem.status = status
    tx.update(ref, { problems: session.problems })
  })
}

export async function saveWorkedSolution(
  uid: string,
  sessionId: string,
  problemIndex: number,
  working: string
): Promise<void> {
  const ref = sessionDoc(uid, sessionId)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) return
    const session = snap.data() as HomeworkSession
    const workedSolutions = session.workedSolutions ?? {}
    workedSolutions[problemIndex] = working
    tx.update(ref, { workedSolutions })
  })
}

export async function appendChatMessage(
  uid: string,
  sessionId: string,
  problemIndex: number,
  message: ChatMessage
): Promise<void> {
  const ref = sessionDoc(uid, sessionId)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) return
    const session = snap.data() as HomeworkSession
    if (!session.chatHistory[problemIndex]) session.chatHistory[problemIndex] = []
    session.chatHistory[problemIndex].push(message)
    tx.update(ref, { chatHistory: session.chatHistory })
  })
}
