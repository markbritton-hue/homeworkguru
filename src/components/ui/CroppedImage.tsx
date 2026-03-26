"use client"

import { useEffect, useRef, useState } from "react"
import type { BBox } from "@/types"

interface CroppedImageProps {
  src: string
  bbox: BBox
  alt?: string
  className?: string
}

export function CroppedImage({ src, bbox, alt = "Problem", className }: CroppedImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [done, setDone] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(0.25)

  useEffect(() => {
    setDone(false)
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Add padding (clamped to image bounds)
      const pad = 2
      const x = Math.max(0, bbox.x - pad)
      const y = Math.max(0, bbox.y - pad)
      const w = Math.min(100 - x, bbox.w + pad * 2)
      const h = Math.min(100 - y, bbox.h + pad * 2)

      const srcX = (x / 100) * img.naturalWidth
      const srcY = (y / 100) * img.naturalHeight
      const srcW = (w / 100) * img.naturalWidth
      const srcH = (h / 100) * img.naturalHeight

      canvas.width = srcW
      canvas.height = srcH
      setAspectRatio(srcH / srcW)

      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH)
      setDone(true)
    }
    img.src = src
  }, [src, bbox])

  return (
    <div className={className} style={{ position: "relative", width: "100%", paddingTop: `${aspectRatio * 100}%` }}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          opacity: done ? 1 : 0,
          transition: "opacity 0.2s",
          objectFit: "contain",
        }}
        aria-label={alt}
      />
      {!done && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" style={{ color: "var(--accent)" }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}
    </div>
  )
}
