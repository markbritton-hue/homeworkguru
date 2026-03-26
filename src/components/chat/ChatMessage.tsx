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
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-2 mt-0.5"
          style={{ background: "var(--accent)", boxShadow: "0 0 12px rgba(96,165,250,0.4)" }}>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
      )}
      <div
        className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
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
  )
}
