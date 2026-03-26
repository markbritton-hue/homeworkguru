export type ProblemStatus = "not_started" | "in_progress" | "solved"

export interface Problem {
  index: number
  text: string
  subject: string
  status: ProblemStatus
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  isInitial?: boolean
}

export interface HomeworkSession {
  sessionId: string
  name: string
  createdAt: number
  imageDataUrls: string[]
  problems: Problem[]
  chatHistory: Record<number, ChatMessage[]>
}

export interface ParseHomeworkRequest {
  images: Array<{ imageBase64: string; mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" }>
}

export interface ParsedProblem {
  index: number
  text: string
  subject: string
}

export interface ParseHomeworkResponse {
  problems: ParsedProblem[]
}

export interface TutorRequest {
  problemText: string
  subject: string
  messages: Array<{ role: "user" | "assistant"; content: string }>
}
