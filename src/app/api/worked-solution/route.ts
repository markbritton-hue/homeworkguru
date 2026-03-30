import { NextRequest, NextResponse } from "next/server"
import { groq } from "@/lib/groq"

export async function POST(req: NextRequest) {
  let body: { problemText: string; messages: Array<{ role: string; content: string }> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { problemText, messages } = body
  if (!problemText || !messages?.length) {
    return NextResponse.json({ error: "problemText and messages are required" }, { status: 400 })
  }

  const chatTranscript = messages
    .map((m) => `${m.role === "user" ? "Student" : "Guru"}: ${m.content}`)
    .join("\n\n")

  const prompt = `Here is a homework problem and the conversation where a student worked through it with a tutor:

Problem: ${problemText}

Conversation:
${chatTranscript}

Now write a clear, concise step-by-step worked solution showing exactly how to get to the answer. Use numbered steps. Be brief — one or two lines per step. Do not address the student, just show the working.`

  try {
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    })

    const working = response.choices[0]?.message?.content ?? ""
    return NextResponse.json({ working })
  } catch {
    return NextResponse.json({ error: "Failed to generate worked solution" }, { status: 500 })
  }
}
