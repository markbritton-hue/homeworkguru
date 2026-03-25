"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChatMessage } from "./ChatMessage"
import { ChatInput, type ChatInputHandle } from "./ChatInput"
import { LoadingDots } from "@/components/ui/LoadingDots"
import { CompletionBanner } from "./CompletionBanner"
import { appendChatMessage, loadSession, updateProblemStatus } from "@/lib/session-storage"
import { INITIAL_USER_MESSAGE } from "@/lib/prompts"
import type { ChatMessage as ChatMessageType, HomeworkSession, Problem } from "@/types"

const SOLVED_SENTINEL = "[[SOLVED]]"

interface ChatInterfaceProps {
  sessionId: string
  problemIndex: number
}

export function ChatInterface({ sessionId, problemIndex }: ChatInterfaceProps) {
  const [session, setSession] = useState<HomeworkSession | null>(null)
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSolved, setIsSolved] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<ChatInputHandle>(null)
  const initialized = useRef(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // Focus input whenever loading finishes and problem isn't solved
  useEffect(() => {
    if (!isLoading && !isSolved) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const ta = document.querySelector<HTMLTextAreaElement>("textarea")
          ta?.focus()
        })
      })
    }
  }, [isLoading, isSolved])

  const sendMessage = useCallback(
    async (userText: string, isInitial = false) => {
      if (!session) return

      const problem = session.problems[problemIndex]
      const userMsg: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "user",
        content: userText,
        timestamp: Date.now(),
        isInitial,
      }

      const updatedMessages = isInitial ? [] : [...messages]
      if (!isInitial) {
        updatedMessages.push(userMsg)
        setMessages(updatedMessages)
        appendChatMessage(sessionId, problemIndex, userMsg)
      }

      setIsLoading(true)

      // Build API messages (include the initial message but never show it in UI)
      const apiMessages: Array<{ role: "user" | "assistant"; content: string }> = [
        ...updatedMessages
          .filter((m) => !m.isInitial)
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ]

      if (isInitial) {
        apiMessages.push({ role: "user", content: userText })
      }

      // Placeholder AI message for streaming
      const aiMsgId = crypto.randomUUID()
      const aiMsg: ChatMessageType = {
        id: aiMsgId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMsg])

      try {
        const response = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemText: problem.text,
            subject: problem.subject,
            messages: apiMessages,
          }),
        })

        if (!response.ok || !response.body) {
          throw new Error("Failed to get response")
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullText = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          fullText += chunk

          // Strip sentinel from display
          const displayText = fullText.replace(SOLVED_SENTINEL, "").trim()
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, content: displayText } : m))
          )
        }

        // Check for solved sentinel
        const solved = fullText.includes(SOLVED_SENTINEL)
        const finalContent = fullText.replace(SOLVED_SENTINEL, "").trim()

        const finalAiMsg: ChatMessageType = {
          id: aiMsgId,
          role: "assistant",
          content: finalContent,
          timestamp: Date.now(),
        }
        appendChatMessage(sessionId, problemIndex, finalAiMsg)

        if (solved) {
          updateProblemStatus(sessionId, problemIndex, "solved")
          setIsSolved(true)
          // Refresh session
          const updated = loadSession(sessionId)
          if (updated) setSession(updated)
        }
      } catch (err) {
        console.error("tutor fetch error:", err)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, content: "Sorry, something went wrong. Please try again." }
              : m
          )
        )
      } finally {
        setIsLoading(false)
      }
    },
    [session, messages, sessionId, problemIndex]
  )

  // Load session and init chat
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const s = loadSession(sessionId)
    if (!s) return
    setSession(s)

    const existing = s.chatHistory[problemIndex] || []
    const visible = existing.filter((m) => !m.isInitial)
    setMessages(visible)

    const alreadySolved = s.problems[problemIndex]?.status === "solved"
    setIsSolved(alreadySolved)

    if (existing.length === 0 && !alreadySolved) {
      updateProblemStatus(sessionId, problemIndex, "in_progress")
      sendMessage(INITIAL_USER_MESSAGE, true)
    } else if (!alreadySolved && s.problems[problemIndex]?.status === "not_started") {
      updateProblemStatus(sessionId, problemIndex, "in_progress")
    }
  }, [sessionId, problemIndex, sendMessage])

  const handleSubmit = () => {
    const text = input.trim()
    if (!text || isLoading || isSolved) return
    setInput("")
    sendMessage(text)
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    )
  }

  const problem = session.problems[problemIndex]
  const nextProblem =
    session.problems.find((p) => p.index > problemIndex && p.status !== "solved") || null
  const solvedCount = session.problems.filter((p) => p.status === "solved").length

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
        <div className="max-w-2xl mx-auto">
          {messages.length === 0 && isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm">
                <LoadingDots />
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {messages.length > 0 && isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm">
                <LoadingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Completion banner */}
      {isSolved && (
        <CompletionBanner
          sessionId={sessionId}
          nextProblem={nextProblem}
          totalProblems={session.problems.length}
          solvedCount={solvedCount}
        />
      )}

      {/* Input */}
      {!isSolved && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50">
          <div className="max-w-2xl mx-auto">
            <ChatInput
              key={isLoading ? "loading" : "ready"}
              ref={chatInputRef}
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              disabled={isLoading}
            />
            <p className="text-xs text-slate-400 text-center mt-2">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
