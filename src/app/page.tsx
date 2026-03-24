"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UploadZone } from "@/components/upload/UploadZone"
import { ImagePreview } from "@/components/upload/ImagePreview"
import { compressImage } from "@/lib/image-utils"
import { saveSession } from "@/lib/session-storage"
import type { HomeworkSession } from "@/types"

export default function HomePage() {
  const router = useRouter()
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<"image/jpeg" | "image/png" | "image/webp" | "image/gif">("image/jpeg")
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelected = (dataUrl: string, mime: typeof mimeType) => {
    setImageDataUrl(dataUrl)
    setMimeType(mime)
    setError(null)
  }

  const handleParse = async () => {
    if (!imageDataUrl) return
    setIsParsing(true)
    setError(null)

    try {
      const response = await fetch("/api/parse-homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: imageDataUrl, mimeType }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to read homework. Please try again.")
        return
      }

      const compressed = await compressImage(imageDataUrl)

      const session: HomeworkSession = {
        sessionId: crypto.randomUUID(),
        createdAt: Date.now(),
        imageDataUrl: compressed,
        problems: data.problems.map((p: { index: number; text: string; subject: string }) => ({
          ...p,
          status: "not_started" as const,
        })),
        chatHistory: {},
      }

      saveSession(session)
      router.push(`/session/${session.sessionId}`)
    } catch {
      setError("Something went wrong. Please check your connection and try again.")
    } finally {
      setIsParsing(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Homework Guru</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Upload your homework and work through each problem with your AI tutor.
            <br />
            No answers given — only guidance to help you learn.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {imageDataUrl ? (
            <ImagePreview
              dataUrl={imageDataUrl}
              onClear={() => { setImageDataUrl(null); setError(null) }}
              onParse={handleParse}
              isParsing={isParsing}
            />
          ) : (
            <UploadZone onImageSelected={handleImageSelected} />
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Your homework is processed securely and never stored on our servers.
        </p>
      </div>
    </main>
  )
}
