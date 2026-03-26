export function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:-0.3s]"  style={{ background: "var(--accent)" }} />
      <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ background: "var(--accent2)" }} />
      <span className="h-2 w-2 rounded-full animate-bounce"                           style={{ background: "var(--accent)" }} />
    </div>
  )
}
