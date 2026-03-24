export function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" />
    </div>
  )
}
