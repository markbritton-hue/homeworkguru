import { NextRequest, NextResponse } from "next/server"
import { anthropic } from "@/lib/claude"
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

  const { imageBase64, mimeType } = body

  if (!imageBase64 || !mimeType) {
    return NextResponse.json({ error: "imageBase64 and mimeType are required" }, { status: 400 })
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 })
  }

  const rawBase64 = stripDataUrlPrefix(imageBase64)

  if (!rawBase64 || rawBase64.length < 100) {
    return NextResponse.json({ error: "Invalid image data" }, { status: 400 })
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: rawBase64,
              },
            },
            {
              type: "text",
              text: PARSE_HOMEWORK_PROMPT,
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    // Try direct JSON parse first
    let problems
    try {
      problems = JSON.parse(text)
    } catch {
      // Fallback: extract JSON array via regex
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

    return NextResponse.json({ problems })
  } catch (err) {
    console.error("parse-homework error:", err)
    return NextResponse.json({ error: "Failed to analyze image. Please try again." }, { status: 500 })
  }
}
