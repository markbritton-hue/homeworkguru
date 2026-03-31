export async function incrementStats(_uid: string, updates: {
  sessions?: number
  parseInputTokens?: number
  parseOutputTokens?: number
  tutorInputTokens?: number
  tutorOutputTokens?: number
}) {
  fetch("/api/stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  }).catch(() => {})
}

export async function loadStats(_uid: string) {
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
