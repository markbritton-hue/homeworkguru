"use client"

import ReactMarkdown from "react-markdown"
import type { ChatMessage as ChatMessageType } from "@/types"

interface ChatMessageProps {
  message: ChatMessageType
}

const MC_OPTION_RE = /^([A-D])[).]\s+(.+)$/

function parseMultipleChoice(content: string): { before: string; options: { letter: string; text: string }[]; after: string } | null {
  const lines = content.split("\n")
  let firstIdx = -1
  let lastIdx = -1

  for (let i = 0; i < lines.length; i++) {
    if (MC_OPTION_RE.test(lines[i].trim())) {
      if (firstIdx === -1) firstIdx = i
      lastIdx = i
    }
  }

  if (firstIdx === -1) return null

  const options: { letter: string; text: string }[] = []
  for (let i = firstIdx; i <= lastIdx; i++) {
    const m = lines[i].trim().match(MC_OPTION_RE)
    if (m) options.push({ letter: m[1], text: m[2] })
  }

  if (options.length < 2) return null

  return {
    before: lines.slice(0, firstIdx).join("\n").trim(),
    options,
    after: lines.slice(lastIdx + 1).join("\n").trim(),
  }
}

const LETTER_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  A: { bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.4)", color: "#60a5fa" },
  B: { bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.4)", color: "#a78bfa" },
  C: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.4)", color: "#34d399" },
  D: { bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.4)", color: "#fb923c" },
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const parsed = !isUser ? parseMultipleChoice(message.content) : null

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/Gurulogo.png" alt="Tutor" className="flex-shrink-0 w-20 h-20 mr-2 mt-0.5" />
      )}
      {isUser && (
        <span className="text-xs self-center mr-2 flex-shrink-0" style={{ color: "var(--muted2)" }}>You</span>
      )}
      <div
        className="w-1/2 rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={
          isUser
            ? { background: "var(--accent)", color: "#fff", borderBottomRightRadius: "6px", boxShadow: "0 4px 12px rgba(96,165,250,0.3)" }
            : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", borderBottomLeftRadius: "6px", backdropFilter: "blur(10px)" }
        }
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : parsed ? (
          <div>
            {parsed.before && (
              <div className="prose prose-sm max-w-none prose-invert prose-p:my-1 mb-3">
                <ReactMarkdown>{parsed.before}</ReactMarkdown>
              </div>
            )}
            <div className="space-y-2">
              {parsed.options.map(({ letter, text }) => {
                const colors = LETTER_COLORS[letter] ?? LETTER_COLORS.A
                return (
                  <div key={letter} className="flex items-center gap-3 rounded-xl px-3 py-2"
                    style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: colors.border, color: "#fff" }}>
                      {letter}
                    </span>
                    <span className="text-sm" style={{ color: "var(--text)" }}>{text}</span>
                  </div>
                )
              })}
            </div>
            {parsed.after && (
              <div className="prose prose-sm max-w-none prose-invert prose-p:my-1 mt-3">
                <ReactMarkdown>{parsed.after}</ReactMarkdown>
              </div>
            )}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
