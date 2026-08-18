import { CheckCircle2, AlertTriangle, XCircle, Clock, Bot, User, Bell, FileUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RequestStatus, VerificationState, FieldSource } from "@/lib/types"

const verificationConfig: Record<
  VerificationState,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  verified: { label: "Verified", className: "bg-success/12 text-success-strong border-success/25", icon: CheckCircle2 },
  warning: { label: "Warning", className: "bg-warning/15 text-warning-foreground border-warning/35", icon: AlertTriangle },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive-strong border-destructive/25", icon: XCircle },
  pending: { label: "Pending", className: "bg-muted text-muted-foreground border-border", icon: Clock },
}

export function VerificationBadge({ state, className }: { state: VerificationState; className?: string }) {
  const c = verificationConfig[state]
  const Icon = c.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        c.className,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {c.label}
    </span>
  )
}

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
  submitted: { label: "Submitted", className: "bg-muted text-muted-foreground border-border" },
  "ai-verified": { label: "AI Verified", className: "bg-accent/15 text-accent-foreground border-accent/30" },
  "employee-review": { label: "In Review", className: "bg-info/12 text-info-strong border-info/25" },
  approved: { label: "Approved", className: "bg-success/12 text-success-strong border-success/25" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive-strong border-destructive/25" },
}

export function StatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  const c = statusConfig[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        c.className,
        className,
      )}
    >
      {c.label}
    </span>
  )
}

const sourceConfig: Record<FieldSource, { label: string; className: string }> = {
  ai: { label: "AI extracted", className: "bg-accent/15 text-accent-foreground border-accent/30" },
  manual: { label: "Manually entered", className: "bg-info/12 text-info-strong border-info/25" },
  derived: { label: "Auto-calculated", className: "bg-primary/10 text-primary border-primary/20" },
  missing: { label: "Missing", className: "bg-warning/15 text-warning-foreground border-warning/35" },
}

export function SourceBadge({ source, className }: { source: FieldSource; className?: string }) {
  const c = sourceConfig[source]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        c.className,
        className,
      )}
    >
      {c.label}
    </span>
  )
}

export function ConfidenceMeter({ value, className }: { value: number; className?: string }) {
  const tone =
    value >= 85 ? "bg-success" : value >= 60 ? "bg-warning" : value > 0 ? "bg-destructive" : "bg-muted-foreground/40"
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">{value ? `${value}%` : "—"}</span>
    </div>
  )
}

export const activityIcon = { ai: Bot, approve: CheckCircle2, reject: XCircle, notify: Bell, submit: FileUp, user: User }
