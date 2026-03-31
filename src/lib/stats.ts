export async function incrementStats(updates: {
  sessions?: number
  parseInputTokens?: number
  parseOutputTokens?: number
  tutorInputTokens?: number
  tutorOutputTokens?: number
}) {
  await fetch("/api/stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
}

export async function loadStats() {
  const res = await fetch("/api/stats")
  if (!res.ok) return null
  return res.json() as Promise<{
    sessions: number
    parseInputTokens: number
    parseOutputTokens: number
    tutorInputTokens: number
    tutorOutputTokens: number
    lastUpdated: { _seconds: number }
  } | null>
}
