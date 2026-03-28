export type ProblemStatus = "not_started" | "in_progress" | "solved"

export interface BBox {
  x: number  // left edge % of image width
  y: number  // top edge % of image height
  w: number  // width % of image width
  h: number  // height % of image height
}

export interface Problem {
  index: number
  text: string
  subject: string
  status: ProblemStatus
  page?: number
  bbox?: BBox
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
  workedSolutions?: Record<number, string>
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
