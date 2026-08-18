import { FileUp, Bot, UserCheck, Gavel, BellRing, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RequestStatus } from "@/lib/types"

const stages = [
  { key: "submitted", label: "Submitted", icon: FileUp },
  { key: "ai-verified", label: "AI Verified", icon: Bot },
  { key: "employee-review", label: "Employee Reviewed", icon: UserCheck },
  { key: "decision", label: "Approved / Rejected", icon: Gavel },
  { key: "notified", label: "Citizen Notified", icon: BellRing },
] as const

function reachedIndex(status: RequestStatus): number {
  switch (status) {
    case "submitted":
      return 0
    case "ai-verified":
      return 1
    case "employee-review":
      return 2
    case "approved":
    case "rejected":
      return 4
  }
}

export function LifecycleTracker({ status }: { status: RequestStatus }) {
  const reached = reachedIndex(status)
  const rejected = status === "rejected"

  return (
    <ol className="flex flex-wrap items-center gap-y-3">
      {stages.map((stage, i) => {
        const done = i <= reached
        const isDecision = stage.key === "decision"
        const Icon = done ? Check : stage.icon
        return (
          <li key={stage.key} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border text-xs",
                  !done && "border-border bg-card text-muted-foreground",
                  done && !isDecision && "border-primary bg-primary text-primary-foreground",
                  done && isDecision && rejected && "border-destructive bg-destructive/10 text-destructive-strong",
                  done && isDecision && !rejected && "border-success bg-success/12 text-success-strong",
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <span className={cn("text-xs font-medium", done ? "text-foreground" : "text-muted-foreground")}>
                {isDecision ? (rejected ? "Rejected" : status === "approved" ? "Approved" : "Decision") : stage.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <span className={cn("mx-2 h-px w-6 sm:w-10", i < reached ? "bg-primary" : "bg-border")} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
