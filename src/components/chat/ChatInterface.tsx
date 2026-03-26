"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChatMessage } from "./ChatMessage"
import { ChatInput, type ChatInputHandle } from "./ChatInput"
import { LoadingDots } from "@/components/ui/LoadingDots"
import { CompletionBanner } from "./CompletionBanner"
import { appendChatMessage, loadSession, updateProblemStatus } from "@/lib/firestore"
import { useAuth } from "@/contexts/AuthContext"
import { INITIAL_USER_MESSAGE } from "@/lib/prompts"
import type { ChatMessage as ChatMessageType, HomeworkSession, Problem } from "@/types"

const SOLVED_SENTINEL = "[[SOLVED]]"
const TOKENS_RE = /\[\[TOKENS:(\{.*?\})\]\]/

interface ChatInterfaceProps {
  sessionId: string
  problemIndex: number
  pasteValue?: string
}

export function ChatInterface({ sessionId, problemIndex, pasteValue }: ChatInterfaceProps) {
  const { user } = useAuth()
  const [session, setSession] = useState<HomeworkSession | null>(null)
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSolved, setIsSolved] = useState(false)
  const [totalTokens, setTotalTokens] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<ChatInputHandle>(null)
  const initialized = useRef(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // Paste calculator value into input
  useEffect(() => {
    if (pasteValue) setInput(prev => prev ? `${prev} ${pasteValue}` : pasteValue)
  }, [pasteValue])

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
      if (!session || !user) return

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
        appendChatMessage(user.uid, sessionId, problemIndex, userMsg)
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

          // Strip sentinels from display
          const displayText = fullText.replace(SOLVED_SENTINEL, "").replace(TOKENS_RE, "").trim()
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, content: displayText } : m))
          )
        }

        // Extract and accumulate token usage
        const tokenMatch = fullText.match(TOKENS_RE)
        if (tokenMatch) {
          try {
            const usage = JSON.parse(tokenMatch[1])
            setTotalTokens(prev => prev + (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0))
          } catch {}
        }

        // Check for solved sentinel
        const solved = fullText.includes(SOLVED_SENTINEL)
        const finalContent = fullText.replace(SOLVED_SENTINEL, "").replace(TOKENS_RE, "").trim()

        const finalAiMsg: ChatMessageType = {
          id: aiMsgId,
          role: "assistant",
          content: finalContent,
          timestamp: Date.now(),
        }
        appendChatMessage(user.uid, sessionId, problemIndex, finalAiMsg)

        if (solved) {
          updateProblemStatus(user.uid, sessionId, problemIndex, "solved")
          setIsSolved(true)
          // Refresh session
          const updated = await loadSession(user.uid, sessionId)
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
    [session, messages, sessionId, problemIndex, user]
  )

  // Load session and init chat
  useEffect(() => {
    if (initialized.current || !user) return
    initialized.current = true

    loadSession(user.uid, sessionId).then((s) => {
      if (!s) return
      setSession(s)

      const existing = s.chatHistory[problemIndex] || []
      const visible = existing.filter((m) => !m.isInitial)
      setMessages(visible)

      const alreadySolved = s.problems[problemIndex]?.status === "solved"
      setIsSolved(alreadySolved)

      if (existing.length === 0 && !alreadySolved) {
        updateProblemStatus(user.uid, sessionId, problemIndex, "in_progress")
        sendMessage(INITIAL_USER_MESSAGE, true)
      } else if (!alreadySolved && s.problems[problemIndex]?.status === "not_started") {
        updateProblemStatus(user.uid, sessionId, problemIndex, "in_progress")
      }
    })
  }, [sessionId, problemIndex, sendMessage, user])

  const handleSubmit = () => {
    const text = input.trim()
    if (!text || isLoading || isSolved) return
    setInput("")
    sendMessage(text)
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm uppercase tracking-widest" style={{ color: "var(--muted)" }}>Loading…</p>
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Gurulogo.png" alt="Tutor" className="flex-shrink-0 w-20 h-20 mr-2 mt-0.5" />
              <div className="rounded-2xl rounded-bl-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)", backdropFilter: "blur(10px)" }}>
                <LoadingDots />
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {messages.length > 0 && isLoading && (
            <div className="flex justify-start mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Gurulogo.png" alt="Tutor" className="flex-shrink-0 w-20 h-20 mr-2 mt-0.5" />
              <div className="rounded-2xl rounded-bl-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)", backdropFilter: "blur(10px)" }}>
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
          finalAnswer={[...messages].reverse().find(m => m.role === "assistant")?.content}
          totalTokens={totalTokens}
        />
      )}

      {/* Input */}
      {!isSolved && (
        <div className="px-4 pb-4 pt-2" style={{ borderTop: "1px solid var(--border)", background: "var(--surface)", backdropFilter: "blur(10px)" }}>
          <div className="max-w-2xl mx-auto">
            <ChatInput
              key={isLoading ? "loading" : "ready"}
              ref={chatInputRef}
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              disabled={isLoading}
            />
            <p className="text-xs text-center mt-2" style={{ color: "var(--muted2)" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
