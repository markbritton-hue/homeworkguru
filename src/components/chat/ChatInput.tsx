"use client"

import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from "react"

// Extend window for cross-browser Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition
    webkitSpeechRecognition: new () => ISpeechRecognition
  }
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  onresult: ((event: ISpeechRecognitionEvent) => void) | null
}

interface ISpeechRecognitionEvent {
  resultIndex: number
  results: ISpeechRecognitionResultList
}

interface ISpeechRecognitionResultList {
  length: number
  [index: number]: ISpeechRecognitionResult
}

interface ISpeechRecognitionResult {
  isFinal: boolean
  [index: number]: { transcript: string }
}

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled: boolean
  placeholder?: string
}

export interface ChatInputHandle {
  focus: () => void
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  function ChatInput({ value, onChange, onSubmit, disabled, placeholder }, ref) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const recognitionRef = useRef<ISpeechRecognition | null>(null)
    const [isListening, setIsListening] = useState(false)
    const [speechSupported, setSpeechSupported] = useState(false)

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
    }))

    useEffect(() => {
      setSpeechSupported(
        typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
      )
    }, [])

    useEffect(() => {
      const el = textareaRef.current
      if (!el) return
      el.style.height = "auto"
      el.style.height = Math.min(el.scrollHeight, 120) + "px"
    }, [value])

    const stopListening = useCallback(() => {
      recognitionRef.current?.stop()
      recognitionRef.current = null
      setIsListening(false)
    }, [])

    const toggleVoice = useCallback(() => {
      if (isListening) {
        stopListening()
        return
      }

      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SR) return

      const recognition = new SR()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      let accumulated = ""

      recognition.onstart = () => setIsListening(true)

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let interim = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            accumulated += t + " "
          } else {
            interim = t
          }
        }
        onChange((accumulated + interim).trim())
      }

      recognition.onend = () => {
        setIsListening(false)
        recognitionRef.current = null
        textareaRef.current?.focus()
      }

      recognition.onerror = () => {
        setIsListening(false)
        recognitionRef.current = null
      }

      recognitionRef.current = recognition
      recognition.start()
    }, [isListening, onChange, stopListening])

    useEffect(() => {
      if (disabled && isListening) stopListening()
    }, [disabled, isListening, stopListening])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (!disabled && value.trim()) onSubmit()
      }
    }

    return (
      <div className={`flex items-end gap-2 bg-white border rounded-2xl px-4 py-3 shadow-sm transition-all ${
        isListening
          ? "border-red-400 ring-1 ring-red-400"
          : "border-slate-200 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400"
      }`}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder={
            isListening ? "Listening…" :
            disabled ? "Waiting for tutor…" :
            (placeholder || "Type or speak your answer…")
          }
          rows={1}
          className="flex-1 resize-none bg-transparent text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
          style={{ minHeight: "24px" }}
        />

        {/* Mic button */}
        {speechSupported && (
          <button
            onClick={toggleVoice}
            onMouseDown={(e) => e.preventDefault()}
            disabled={disabled}
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-slate-100 hover:bg-slate-200 text-slate-500"
            }`}
            aria-label={isListening ? "Stop listening" : "Speak your answer"}
          >
            <svg className="w-4 h-4" fill={isListening ? "white" : "currentColor"} viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h-3v2h8v-2h-3v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
            </svg>
          </button>
        )}

        {/* Send button */}
        <button
          onClick={onSubmit}
          onMouseDown={(e) => e.preventDefault()}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    )
  }
)
