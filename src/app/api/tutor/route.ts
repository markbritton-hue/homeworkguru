import { NextRequest } from "next/server"
import { genAI } from "@/lib/gemini"
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
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
      systemInstruction: buildTutorSystemPrompt(subject, problemText),
    })

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }))

    const lastMessage = messages[messages.length - 1]
    const chat = model.startChat({ history })
    const result = await chat.sendMessageStream(lastMessage.content)

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) controller.enqueue(encoder.encode(text))
          }
          const finalResponse = await result.response
          const usage = finalResponse.usageMetadata
          controller.enqueue(
            encoder.encode(
              `[[TOKENS:${JSON.stringify({
                input_tokens: usage?.promptTokenCount ?? 0,
                output_tokens: usage?.candidatesTokenCount ?? 0,
              })}]]`
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    console.error("tutor error:", msg)
    return new Response(`Failed to get response: ${msg}`, { status: 500 })
  }
}
