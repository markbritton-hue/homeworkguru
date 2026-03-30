import { NextRequest } from "next/server"
import { groq } from "@/lib/groq"
import { buildTutorSystemPrompt } from "@/lib/prompts"
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
    const stream = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: "system", content: buildTutorSystemPrompt(subject, problemText) },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
    })

    const readable = new ReadableStream({
      async start(controller) {
        let inputTokens = 0
        let outputTokens = 0
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content
            if (delta) {
              controller.enqueue(new TextEncoder().encode(delta))
            }
            if (chunk.x_groq?.usage) {
              inputTokens = chunk.x_groq.usage.prompt_tokens ?? 0
              outputTokens = chunk.x_groq.usage.completion_tokens ?? 0
            }
          }
          controller.enqueue(
            new TextEncoder().encode(
              `[[TOKENS:${JSON.stringify({ input_tokens: inputTokens, output_tokens: outputTokens })}]]`
            )
          )
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
  } catch (err) {
    console.error("tutor error:", err)
    return new Response("Failed to get response. Please try again.", { status: 500 })
  }
}
