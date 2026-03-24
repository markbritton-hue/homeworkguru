import { clsx } from "clsx"
import type { ProblemStatus } from "@/types"

interface BadgeProps {
  status: ProblemStatus
}

const labels: Record<ProblemStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  solved: "Solved",
}

export function Badge({ status }: BadgeProps) {
  return (
    <span
      className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", {
        "bg-slate-100 text-slate-600": status === "not_started",
        "bg-amber-100 text-amber-700": status === "in_progress",
        "bg-emerald-100 text-emerald-700": status === "solved",
      })}
    >
      {status === "solved" && (
        <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {labels[status]}
    </span>
  )
}
