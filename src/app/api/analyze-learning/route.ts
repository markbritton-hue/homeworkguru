import { NextRequest, NextResponse } from "next/server"
import { genAI } from "@/lib/gemini"

const PROMPT = `You are reviewing a tutoring conversation to extract precise learning insights about the student.

The subject is: {subject}

The problem was:
<problem>
{problemText}
</problem>

Analyze only the conversation below. Identify:
1. Specific concepts or steps the student found difficult — where they needed hints, made errors, or showed confusion
2. Specific concepts or steps the student demonstrated clearly — where they answered correctly without prompting

Return ONLY valid JSON on a single line. No markdown, no explanation, no code fences:
{"struggles":["phrase"],"strengths":["phrase"]}

Rules:
- Maximum 3 items per array. Use [] if none.
- Each phrase: 3-7 words, lowercase, specific (e.g. "applying distributive property", "squaring negative numbers")
- Avoid generic phrases like "understanding the problem" or "basic math"
- Base it only on evidence in the conversation — do not infer from the problem text alone

Conversation:
{conversation}`

export async function POST(req: NextRequest) {
  let body: { subject: string; problemText: string; messages: Array<{ role: string; content: string }> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ struggles: [], strengths: [] })
  }

  const { subject, problemText, messages } = body
  if (!subject || !messages?.length) {
    return NextResponse.json({ struggles: [], strengths: [] })
  }

  const conversation = messages
    .map((m) => `${m.role === "user" ? "Student" : "Guru"}: ${m.content}`)
    .join("\n\n")

  const prompt = PROMPT
    .replace("{subject}", subject)
    .replace("{problemText}", problemText ?? "")
    .replace("{conversation}", conversation)

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" })
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    let parsed: { struggles?: unknown; strengths?: unknown } = {}
    try {
      parsed = JSON.parse(text)
    } catch {
      const match = text.match(/\{[\s\S]*?\}/)
      if (match) {
        try { parsed = JSON.parse(match[0]) } catch {}
      }
    }

    const toStringArray = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((s): s is string => typeof s === "string").slice(0, 3) : []

    return NextResponse.json({
      struggles: toStringArray(parsed.struggles),
      strengths: toStringArray(parsed.strengths),
    })
  } catch {
    return NextResponse.json({ struggles: [], strengths: [] })
  }
}
