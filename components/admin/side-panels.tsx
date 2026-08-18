import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { activityIcon } from "@/components/status-badge"
import { recentActivity, departmentBreakdown } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const activityTone: Record<string, string> = {
  ai: "bg-accent/15 text-accent-foreground",
  approve: "bg-success/12 text-success-strong",
  reject: "bg-destructive/10 text-destructive-strong",
  notify: "bg-info/12 text-info-strong",
  submit: "bg-muted text-muted-foreground",
}

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-4">
          {recentActivity.map((a) => {
            const Icon = activityIcon[a.type]
            return (
              <li key={a.id} className="flex gap-3">
                <div className={cn("grid size-8 shrink-0 place-items-center rounded-lg", activityTone[a.type])}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{a.actor}</span> <span className="text-muted-foreground">{a.action}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export function DepartmentBreakdown() {
  const max = Math.max(...departmentBreakdown.map((d) => d.total))
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle>Department & Service Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {departmentBreakdown.map((d) => {
          const rate = Math.round((d.approved / d.total) * 100)
          return (
            <div key={d.name}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium">{d.name}</span>
                <span className="text-muted-foreground">
                  <span className="font-mono tabular-nums text-foreground">{d.total}</span> · {rate}% approved
                </span>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-l-full bg-primary" style={{ width: `${(d.approved / max) * 100}%` }} />
                <div className="h-full bg-chart-3" style={{ width: `${((d.total - d.approved) / max) * 100}%` }} />
              </div>
            </div>
          )
        })}
        <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary" /> Approved
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-chart-3" /> Pending / other
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function CitizenActions({ items }: { items: { label: string; value: number; tone: string }[] }) {
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle>Citizen Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 pt-4">
        {items.map((i) => (
          <div key={i.label} className="rounded-xl border border-border bg-background p-3">
            <p className={cn("font-mono text-xl font-semibold tabular-nums", i.tone)}>{i.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{i.label}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
