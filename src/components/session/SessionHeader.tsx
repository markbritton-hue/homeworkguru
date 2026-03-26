import Link from "next/link"
import { ProgressBar } from "@/components/ui/ProgressBar"

interface SessionHeaderProps {
  solved: number
  total: number
}

export function SessionHeader({ solved, total }: SessionHeaderProps) {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0
  const allDone = solved === total && total > 0

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold" style={{ color: allDone ? "var(--green)" : "var(--muted)" }}>
          {allDone ? "All done! Great work!" : `${solved} of ${total} problem${total !== 1 ? "s" : ""} solved`}
        </p>
        <Link href="/" className="text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: "var(--accent)" }}>
          + New homework
        </Link>
      </div>
      <ProgressBar value={pct} green={allDone} />
    </div>
  )
}
