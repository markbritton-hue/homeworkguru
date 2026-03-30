import { NextRequest, NextResponse } from "next/server"
import { groq } from "@/lib/groq"
import { PARSE_HOMEWORK_PROMPT } from "@/lib/prompts"
import { stripDataUrlPrefix } from "@/lib/image-utils"
import type { ParseHomeworkRequest } from "@/types"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

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

  for (const img of images) {
    if (!ALLOWED_MIME_TYPES.includes(img.mimeType)) {
      return NextResponse.json({ error: "Unsupported image type" }, { status: 400 })
    }
  }

  function parseProblems(text: string): unknown[] | null {
    try {
      const parsed = JSON.parse(text)
      return Array.isArray(parsed) ? parsed : null
    } catch {
      const match = text.match(/\[[\s\S]*\]/)
      if (match) {
        try {
          const parsed = JSON.parse(match[0])
          return Array.isArray(parsed) ? parsed : null
        } catch {
          return null
        }
      }
      return null
    }
  }

  try {
    const perPageResults = await Promise.all(
      images.map(async (img) => {
        const raw = stripDataUrlPrefix(img.imageBase64)
        const response = await groq.chat.completions.create({
          model: "llama-3.2-11b-vision-preview",
          max_tokens: 2048,
          messages: [
            {
              role: "user",
              content: [
                { type: "image_url", image_url: { url: `data:${img.mimeType};base64,${raw}` } },
                { type: "text", text: PARSE_HOMEWORK_PROMPT },
              ],
            },
          ],
        })
        const text = response.choices[0]?.message?.content ?? ""
        return parseProblems(text) ?? []
      })
    )

    const problems = perPageResults.flat()

    if (problems.length === 0) {
      return NextResponse.json(
        { error: "No problems found. Make sure the image shows homework questions." },
        { status: 422 }
      )
    }

    return NextResponse.json({ problems })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    console.error("parse-homework error:", msg)
    return NextResponse.json({ error: `Failed to analyze image: ${msg}` }, { status: 500 })
  }
}
