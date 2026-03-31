import { NextRequest, NextResponse } from "next/server"
import { anthropic } from "@/lib/claude"
import { PARSE_HOMEWORK_PROMPT } from "@/lib/prompts"
import { stripDataUrlPrefix } from "@/lib/image-utils"
import { incrementStatsAdmin } from "@/lib/stats-admin"
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

  const imageBlocks = images.map((img) => {
    const raw = stripDataUrlPrefix(img.imageBase64)
    return {
      type: "image" as const,
      source: { type: "base64" as const, media_type: img.mimeType, data: raw },
    }
  })

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            { type: "text", text: PARSE_HOMEWORK_PROMPT },
          ],
        },
      ],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

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

    incrementStatsAdmin({
      sessions: 1,
      parseInputTokens: response.usage.input_tokens,
      parseOutputTokens: response.usage.output_tokens,
    }).catch(console.error)

    return NextResponse.json({ problems })
  } catch (err) {
    console.error("parse-homework error:", err)
    return NextResponse.json({ error: "Failed to analyze image. Please try again." }, { status: 500 })
  }
}
