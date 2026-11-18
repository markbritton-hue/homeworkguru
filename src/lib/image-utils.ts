export function getImageMimeType(file: File): "image/jpeg" | "image/png" | "image/webp" | "image/gif" | null {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const
  return allowed.includes(file.type as typeof allowed[number])
    ? (file.type as typeof allowed[number])
    : null
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function compressImage(dataUrl: string, maxWidth = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const scale = Math.min(1, maxWidth / img.width)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL("image/jpeg", quality))
    }
    img.src = dataUrl
  })
}

export function stripDataUrlPrefix(dataUrl: string): string {
  return dataUrl.replace(/^data:[^;]+;base64,/, "")
}

let _pdfjsWorkerSet = false

export async function pdfToImages(
  file: File,
  maxPages = 10
): Promise<Array<{ dataUrl: string; mimeType: "image/jpeg" }>> {
  const pdfjsLib = await import("pdfjs-dist")

  if (!_pdfjsWorkerSet) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
    _pdfjsWorkerSet = true
  }

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pageCount = Math.min(pdf.numPages, maxPages)
  const results: Array<{ dataUrl: string; mimeType: "image/jpeg" }> = []

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement("canvas")
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvas, viewport }).promise
    results.push({ dataUrl: canvas.toDataURL("image/jpeg", 0.85), mimeType: "image/jpeg" as const })
  }

  return results
}
