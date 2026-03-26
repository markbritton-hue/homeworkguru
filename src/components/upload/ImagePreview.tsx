"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/Button"
import { fileToBase64, getImageMimeType } from "@/lib/image-utils"

type MimeType = "image/jpeg" | "image/png" | "image/webp" | "image/gif"

interface ImageEntry {
  dataUrl: string
  mimeType: MimeType
}

interface ImagePreviewProps {
  images: ImageEntry[]
  onRemove: (index: number) => void
  onAddMore: (dataUrl: string, mimeType: MimeType) => void
  onParse: () => void
  isParsing: boolean
  isDemo?: boolean
}

export function ImagePreview({ images, onRemove, onAddMore, onParse, isParsing, isDemo }: ImagePreviewProps) {
  const addInputRef = useRef<HTMLInputElement>(null)

  const handleAddFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) return
    const mimeType = getImageMimeType(file)
    if (!mimeType) return
    const dataUrl = await fileToBase64(file)
    onAddMore(dataUrl, mimeType)
  }

  return (
    <div className="space-y-3">
      {/* Thumbnails */}
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative group">
            <div className="w-24 h-24 rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--border)", background: "var(--input-bg)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.dataUrl} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
            </div>
            <span className="absolute bottom-1 left-1 text-xs font-semibold px-1.5 py-0.5 rounded-md"
              style={{ background: "rgba(15,23,42,0.8)", color: "var(--muted)" }}>
              {i + 1}
            </span>
            {!isParsing && (
              <button
                onClick={() => onRemove(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "#ef4444", color: "#fff" }}
                aria-label={`Remove page ${i + 1}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {/* Add another page tile */}
        {!isParsing && (
          <button
            onClick={() => addInputRef.current?.click()}
            className="w-24 h-24 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all hover:opacity-80"
            style={{ border: "2px dashed rgba(96,165,250,0.4)", background: "var(--input-bg)", color: "var(--accent)" }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-semibold">Add page</span>
          </button>
        )}
      </div>

      <input
        ref={addInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && handleAddFile(e.target.files[0])}
      />

      <p className="text-xs" style={{ color: "var(--muted)" }}>
        {images.length} page{images.length !== 1 ? "s" : ""} · click a thumbnail's × to remove it
      </p>

      {isParsing ? (
        <div className="flex items-center justify-center gap-3 py-3">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" style={{ color: "var(--accent)" }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-semibold" style={{ color: "var(--muted)" }}>Reading your homework…</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {isDemo && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold animate-pulse self-start"
              style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.6)", color: "#10b981", boxShadow: "0 0 12px rgba(16,185,129,0.4)" }}>
              <span className="w-2 h-2 rounded-full animate-ping inline-block" style={{ background: "#10b981" }} />
              Step 2
            </span>
          )}
          <Button onClick={onParse} size="lg" className="w-full">
            Find My Problems
          </Button>
        </div>
      )}
    </div>
  )
}
