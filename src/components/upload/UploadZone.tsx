"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { fileToBase64, getImageMimeType } from "@/lib/image-utils"

interface UploadZoneProps {
  onImageSelected: (dataUrl: string, mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif") => void
}

export function UploadZone({ onImageSelected }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10MB."); return }
      const mimeType = getImageMimeType(file)
      if (!mimeType) { setError("Please upload a JPEG, PNG, WebP, or GIF image."); return }
      const dataUrl = await fileToBase64(file)
      onImageSelected(dataUrl, mimeType)
    },
    [onImageSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && handleFile(files[0]),
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] },
    multiple: false,
  })

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className="rounded-2xl p-6 text-center cursor-pointer transition-all"
        style={{
          background: "var(--input-bg)",
          border: `2px dashed ${isDragActive ? "var(--accent)" : "rgba(96,165,250,0.3)"}`,
          boxShadow: isDragActive ? "0 0 20px rgba(96,165,250,0.15)" : undefined,
        }}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "rgba(96,165,250,0.15)", boxShadow: "0 0 20px rgba(96,165,250,0.2)" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ color: "var(--accent)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
              {isDragActive ? "Drop your homework here" : "Drag & drop your homework"}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>or click to browse files</p>
          </div>
          <p className="text-xs" style={{ color: "var(--muted2)" }}>JPEG · PNG · WebP · up to 10MB</p>
        </div>
      </div>

      <div className="text-center">
        <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: "var(--accent)" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Take a photo
          <input type="file" accept="image/*" capture="environment" className="sr-only"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
      </div>

      {error && <p className="text-sm text-center" style={{ color: "#f87171" }}>{error}</p>}
    </div>
  )
}
