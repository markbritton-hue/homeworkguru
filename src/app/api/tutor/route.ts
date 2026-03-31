import { NextRequest } from "next/server"
import { anthropic } from "@/lib/claude"
import { buildTutorSystemPrompt } from "@/lib/prompts"
import { incrementStatsAdmin } from "@/lib/stats-admin"
import type { TutorRequest } from "@/types"

export async function POST(req: NextRequest) {
  let body: TutorRequest
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid request body", { status: 400 })
  }

  const { problemText, subject, messages } = body

  if (!problemText || !subject || !messages || messages.length === 0) {
    return new Response("problemText, subject, and messages are required", { status: 400 })
  }

  try {
    const stream = await anthropic.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: buildTutorSystemPrompt(subject, problemText),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text))
            }
          }
          const msg = await stream.finalMessage()
          controller.enqueue(new TextEncoder().encode(`[[TOKENS:${JSON.stringify(msg.usage)}]]`))
          incrementStatsAdmin({
            tutorInputTokens: msg.usage.input_tokens,
            tutorOutputTokens: msg.usage.output_tokens,
          }).catch(console.error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    console.error("tutor error:", msg)
    return new Response(`Failed to get response: ${msg}`, { status: 500 })
  }
}
