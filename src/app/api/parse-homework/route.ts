import { NextRequest, NextResponse } from "next/server"
import { genAI } from "@/lib/gemini"
import { PARSE_HOMEWORK_PROMPT } from "@/lib/prompts"
import { stripDataUrlPrefix } from "@/lib/image-utils"
import type { ParseHomeworkRequest } from "@/types"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_IMAGES = 10
const MAX_IMAGE_BYTES = 4 * 1024 * 1024

export async function POST(req: NextRequest) {
  let body: ParseHomeworkRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { images } = body

  if (!images || !Array.isArray(images) || images.length === 0) {
    return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
  }

  if (images.length > MAX_IMAGES) {
    return NextResponse.json({ error: `Too many images (max ${MAX_IMAGES})` }, { status: 400 })
  }

  for (const img of images) {
    if (!ALLOWED_MIME_TYPES.includes(img.mimeType)) {
      return NextResponse.json({ error: "Unsupported image type" }, { status: 400 })
    }
    // base64 encodes 3 bytes as 4 chars, so this approximates decoded size
    const approxBytes = (img.imageBase64?.length ?? 0) * 0.75
    if (approxBytes > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image too large (max 4MB)" }, { status: 413 })
    }
  }

  const imageParts = images.map((img) => ({
    inlineData: {
      mimeType: img.mimeType,
      data: stripDataUrlPrefix(img.imageBase64),
    },
  }))

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" })
    const result = await model.generateContent([
      ...imageParts,
      { text: PARSE_HOMEWORK_PROMPT },
    ])

    const text = result.response.text()
    const usage = result.response.usageMetadata

    let problems
    try {
      problems = JSON.parse(text)
    } catch {
      const match = text.match(/\[[\s\S]*\]/)
      if (match) {
        try {
          problems = JSON.parse(match[0])
        } catch {
          return NextResponse.json(
            { error: "Could not read your homework. Try a clearer photo." },
            { status: 422 }
          )
        }
      } else {
        return NextResponse.json(
          { error: "Could not read your homework. Try a clearer photo." },
          { status: 422 }
        )
      }
    }

    if (!Array.isArray(problems) || problems.length === 0) {
      return NextResponse.json(
        { error: "No problems found. Make sure the image shows homework questions." },
        { status: 422 }
      )
    }

    return NextResponse.json({
      problems,
      usage: {
        input_tokens: usage?.promptTokenCount ?? 0,
        output_tokens: usage?.candidatesTokenCount ?? 0,
      },
    })
  } catch (err) {
    console.error("parse-homework error:", err)
    return NextResponse.json({ error: "Failed to analyze image. Please try again." }, { status: 500 })
  }
}
