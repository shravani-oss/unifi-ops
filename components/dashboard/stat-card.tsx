import type { LucideIcon } from "lucide-react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = "default",
}: {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: { value: string; up: boolean }
  tone?: "default" | "warning" | "success" | "destructive"
}) {
  const toneClasses = {
    default: "bg-primary/8 text-primary",
    warning: "bg-warning/15 text-warning-foreground",
    success: "bg-success/12 text-success-strong",
    destructive: "bg-destructive/10 text-destructive-strong",
  }[tone]

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums xl:text-2xl">{value}</p>
        </div>
        <div className={cn("grid size-9 shrink-0 place-items-center rounded-lg", toneClasses)}>
          <Icon className="size-4.5" />
        </div>
      </div>
      {trend && (
        <p
          className={cn(
            "mt-3 flex items-center gap-1 text-xs font-medium",
            trend.up ? "text-success-strong" : "text-destructive-strong",
          )}
        >
          {trend.up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {trend.value}
          <span className="font-normal text-muted-foreground">vs last week</span>
        </p>
      )}
    </Card>
  )
}
