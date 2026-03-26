"use client"

import ReactMarkdown from "react-markdown"
import type { ChatMessage as ChatMessageType } from "@/types"

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/Gurulogo.png" alt="Tutor" className="flex-shrink-0 w-20 h-20 mr-2 mt-0.5" />
      )}
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        {isUser && (
          <span className="text-xs mb-1 px-1" style={{ color: "var(--muted2)" }}>You</span>
        )}
      <div
        className="max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={
          isUser
            ? { background: "var(--accent)", color: "#fff", borderBottomRightRadius: "6px", boxShadow: "0 4px 12px rgba(96,165,250,0.3)" }
            : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", borderBottomLeftRadius: "6px", backdropFilter: "blur(10px)" }
        }
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
