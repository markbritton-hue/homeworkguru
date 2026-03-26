"use client"

import { Button } from "@/components/ui/Button"

interface ImagePreviewProps {
  dataUrl: string
  onClear: () => void
  onParse: () => void
  isParsing: boolean
}

export function ImagePreview({ dataUrl, onClear, onParse, isParsing }: ImagePreviewProps) {
  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} alt="Homework preview" className="w-full max-h-72 object-contain"
          style={{ background: "var(--surface)" }} />
        <button
          onClick={onClear}
          disabled={isParsing}
          className="absolute top-2 right-2 rounded-lg p-1.5 transition-opacity hover:opacity-80"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
          aria-label="Remove image"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {isParsing ? (
        <div className="flex items-center justify-center gap-3 py-3">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" style={{ color: "var(--accent)" }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            Reading your homework…
          </span>
        </div>
      ) : (
        <Button onClick={onParse} size="lg" className="w-full">
          Find My Problems
        </Button>
      )}
    </div>
  )
}
