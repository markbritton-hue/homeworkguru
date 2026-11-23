"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChatMessage } from "./ChatMessage"
import { ChatInput, type ChatInputHandle } from "./ChatInput"
import { LoadingDots } from "@/components/ui/LoadingDots"
import { CompletionBanner } from "./CompletionBanner"
import { appendChatMessage, loadLearningProfile, loadSession, recordProblemSolved, saveWorkedSolution, updateProblemStatus } from "@/lib/firestore"
import { useAuth } from "@/contexts/AuthContext"
import { INITIAL_USER_MESSAGE } from "@/lib/prompts"
import type { ChatMessage as ChatMessageType, HomeworkSession, LearningProfile, Problem } from "@/types"

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
  const [workingOut, setWorkingOut] = useState<string | undefined>(undefined)
  const [showHint, setShowHint] = useState(true)
  const [hintIndex, setHintIndex] = useState(0)
  const [learningProfile, setLearningProfile] = useState<LearningProfile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<ChatInputHandle>(null)
  const initialized = useRef(false)
  const demoPrefilledRef = useRef(false)

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

  // First-time nudge: if the student hasn't typed anything 20s after the guru's
  // first reply, offer tappable starter phrases (they fill the input, never send).
  // Demo = anonymous guest, or one of the sample "Demo Assignment" sessions (new signed-up users get those too)
  const isDemo = !!user?.isAnonymous || !!session?.name.startsWith("Demo Assignment")
  const hasUserMessage = messages.some((m) => m.role === "user")
  const [showStarters, setShowStarters] = useState(false)
  useEffect(() => {
    setShowStarters(false)
    if (isLoading || isSolved || hasUserMessage || !session || input) return
    // Demo users are brand new, so show them example prompts right away
    const t = setTimeout(() => setShowStarters(true), isDemo ? 0 : 20000)
    return () => clearTimeout(t)
  }, [isLoading, isSolved, hasUserMessage, session, input, isDemo])

  // Pre-fill input for demo geometry problems so the user just hits Enter
  useEffect(() => {
    if (!session || hasUserMessage || !isDemo || demoPrefilledRef.current) return
    const prob = session.problems.find((p) => p.index === problemIndex)
    if (!prob) return
    demoPrefilledRef.current = true
    if (/geometry/i.test(prob.subject) && /area/i.test(prob.text)) {
      setInput("I'm not sure where to start. What do I need to know to find the area of a triangle?")
    } else if (/civic|government|history|social/i.test(prob.subject)) {
      setInput("I think this question is asking me to think about…")
    }
  }, [session, hasUserMessage, isDemo, problemIndex])

  const sendMessage = useCallback(
    async (userText: string, isInitial = false) => {
      if (!session || !user) return

      const problem = session.problems.find((p) => p.index === problemIndex)
      if (!problem) return
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
        await appendChatMessage(user.uid, sessionId, problemIndex, userMsg)
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
            learningProfile,
          }),
        })

        if (!response.ok || !response.body) {
          const errText = await response.text().catch(() => "unknown error")
          throw new Error(errText || "Failed to get response")
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
        await appendChatMessage(user.uid, sessionId, problemIndex, finalAiMsg)

        if (solved) {
          await updateProblemStatus(user.uid, sessionId, problemIndex, "solved")
          setIsSolved(true)
          // Record to learning profile (skip anonymous/demo users)
          if (!user.isAnonymous) {
            const turns = [...updatedMessages, finalAiMsg].filter((m) => !m.isInitial).length
            recordProblemSolved(user.uid, problem.subject, turns)
              .then(() => loadLearningProfile(user.uid).then((p) => { if (p) setLearningProfile(p) }))
              .catch(() => {})
          }
          // Refresh session
          const updated = await loadSession(user.uid, sessionId)
          if (updated) setSession(updated)
          // Generate worked solution via API
          fetch("/api/worked-solution", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              problemText: problem.text,
              messages: [...updatedMessages, finalAiMsg]
                .filter((m) => !m.isInitial)
                .map((m) => ({ role: m.role, content: m.content })),
            }),
          })
            .then((r) => r.json())
            .then((data) => {
              if (data.working) {
                setWorkingOut(data.working)
                saveWorkedSolution(user.uid, sessionId, problemIndex, data.working).catch(() => {})
              }
            })
            .catch(() => {})
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

    // Load learning profile for non-anonymous users
    if (!user.isAnonymous) {
      loadLearningProfile(user.uid).then((p) => { if (p) setLearningProfile(p) }).catch(() => {})
    }

    loadSession(user.uid, sessionId).then((s) => {
      if (!s) return
      setSession(s)

      const existing = s.chatHistory[problemIndex] || []
      const visible = existing.filter((m) => !m.isInitial)
      setMessages(visible)

      const currentProblem = s.problems.find((p) => p.index === problemIndex)
      const alreadySolved = currentProblem?.status === "solved"
      setIsSolved(alreadySolved)
      if (alreadySolved && s.workedSolutions?.[problemIndex]) {
        setWorkingOut(s.workedSolutions[problemIndex])
      }

      if (existing.length === 0 && !alreadySolved) {
        updateProblemStatus(user.uid, sessionId, problemIndex, "in_progress")
        sendMessage(INITIAL_USER_MESSAGE, true)
      } else if (!alreadySolved && currentProblem?.status === "not_started") {
        updateProblemStatus(user.uid, sessionId, problemIndex, "in_progress")
      }
    })
  }, [sessionId, problemIndex, sendMessage, user])

  const getHint = () => {
    if (!problem) return
    const guruCount = messages.filter((m) => m.role === "assistant").length
    const isGeomArea = /geometry/i.test(problem.subject) && /area/i.test(problem.text)
    const isCivics = /civic|government|social|history/i.test(problem.subject)

    let hints: string[]
    if (isGeomArea) {
      // Extract base and height from problem text for specific hints
      const baseMatch = problem.text.match(/[Bb]ase\s*=\s*([\d.]+\s*\w+)/)
      const heightMatch = problem.text.match(/[Hh]eight\s*=\s*([\d.]+\s*\w+)/)
      const base = baseMatch?.[1] ?? "the base"
      const height = heightMatch?.[1] ?? "the height"
      hints = [
        "I can see there are measurements on the triangle. I think I need the base and the height?",
        "I think the formula for the area of a triangle is ½ × base × height. Is that right?",
        `So I need to multiply ${base} by ${height} and then divide by 2?`,
        `Let me try: ½ × ${base} × ${height} = …`,
      ]
    } else if (isCivics) {
      hints = [
        "I think this question is asking about how citizens interact with their government.",
        "I can rule out some options — let me think about which one is most direct.",
        "I think the answer is the one about elected officials because they directly represent us.",
        "My answer is B because elected officials act on behalf of the citizens who voted for them.",
      ]
    } else {
      hints = [
        "I'm not sure where to start — can you give me a question to think about?",
        "I think the first step is to identify what the question is really asking.",
        "Let me try to work through this step by step.",
      ]
    }

    // Pick hint based on conversation progress, cycling if we run out
    const idx = guruCount < hints.length ? guruCount : hintIndex % hints.length
    setInput(hints[idx])
    setHintIndex((prev) => prev + 1)
    setShowStarters(false)
    requestAnimationFrame(() => chatInputRef.current?.focus())
  }

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

  const problem = session.problems.find((p) => p.index === problemIndex)
  if (!problem) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Problem not found.</p>
      </div>
    )
  }
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

          {/* Demo-only guru pop-up suggesting what to ask first */}
          {isDemo && !isSolved && !isLoading && !hasUserMessage && (
            <div className="flex justify-start mb-4 animate-pulse">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Gurulogo.png" alt="Guru" className="flex-shrink-0 w-20 h-20 mr-2 mt-0.5" />
              <div className="rounded-2xl rounded-bl-sm px-4 py-3 self-center text-sm font-semibold"
                style={{ background: "var(--surface)", border: "1px solid rgba(96,165,250,0.4)", color: "#93c5fd", backdropFilter: "blur(10px)" }}>
                {/civic|government|social|history/i.test(problem.subject)
                  ? "Try asking what this question is really about…"
                  : "👇 Your question is ready — just hit Send!"}
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
          workingOut={workingOut}
        />
      )}

      {/* Input */}
      {!isSolved && (
        <div className="px-4 pt-2" style={{ borderTop: "1px solid var(--border)", background: "var(--surface)", backdropFilter: "blur(10px)", paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
          <div className="max-w-2xl mx-auto">
            {/* First-time hint — hides once guru has responded */}
            {showHint && messages.filter(m => m.role === "assistant").length === 0 && (
              <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl animate-pulse"
                style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.3)" }}>
                <span className="text-lg">👆</span>
                <p className="text-xs font-semibold" style={{ color: "#60a5fa" }}>
                  Type your answer or question to the Guru here!
                </p>
              </div>
            )}
            {showStarters && (
              <div className="mb-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.3)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#60a5fa" }}>
                  {isDemo
                    ? "Ask your guru anything! Tap an example to try it:"
                    : "Not sure what to say? Tap one to get started, then finish it in your own words:"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ...(isDemo && /geometry/i.test(problem.subject) && /area/i.test(problem.text)
                      ? [
                          "I'm not sure where to start. What do I need to know to find the area of a triangle?",
                          "I can see the measurements but I don't know what to do with them.",
                          "Is there a specific formula I should be thinking about?",
                        ]
                      : isDemo && /civic|government|social|history/i.test(problem.subject)
                      ? [
                          "I think this question is asking me to think about…",
                          "I'm not sure what 'civic life' means here.",
                          "Can you help me understand what this is asking?",
                        ]
                      : [
                          "I'm not sure where to start.",
                          "I think this question is asking me to…",
                          "The first thing I notice is…",
                          "Can you help me understand what this is asking?",
                        ]),
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); setShowStarters(false); requestAnimationFrame(() => chatInputRef.current?.focus()) }}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-all hover:-translate-y-0.5"
                      style={{ background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.35)", color: "#93c5fd" }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <ChatInput
                  key={isLoading ? "loading" : "ready"}
                  ref={chatInputRef}
                  value={input}
                  onChange={setInput}
                  onSubmit={handleSubmit}
                  disabled={isLoading}
                  placeholder={isDemo && !hasUserMessage ? "Try: I think this question is asking me to…" : undefined}
                />
              </div>
              {isDemo && !isSolved && (
                <button
                  onClick={getHint}
                  disabled={isLoading}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-40"
                  style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24", marginBottom: "1px" }}
                  title="Get a hint"
                >
                  💡 Hint
                </button>
              )}
            </div>
            <p className="text-xs text-center mt-2" style={{ color: "var(--muted2)" }}>
              Enter to send · Shift+Enter for new line · Gemini Flash Lite
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
