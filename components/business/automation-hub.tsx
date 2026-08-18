"use client"

import { useState } from "react"
import {
  Receipt,
  FileText,
  ShoppingCart,
  Building2,
  ClipboardList,
  ArrowRight,
  Sparkles,
  Clock,
  Check,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { DocumentFlow } from "@/components/business/document-flow"
import { automationWorkflows, formatCurrency, type WorkflowKey } from "@/lib/business-data"
import { cn } from "@/lib/utils"

const icons: Record<WorkflowKey, LucideIcon> = {
  expense: Receipt,
  invoice: FileText,
  purchase: ShoppingCart,
  vendor: Building2,
  po: ClipboardList,
}

const recent = [
  { id: "EXP-4468", label: "Coffee — client meeting", amount: 1150, when: "Yesterday", done: true },
  { id: "INV-8842", label: "Acme Logistics invoice", amount: 148500, when: "2 days ago", done: true },
  { id: "EXP-4462", label: "Team offsite travel", amount: 8900, when: "2 days ago", done: false },
]

export function AutomationHub() {
  const [active, setActive] = useState<WorkflowKey | null>(null)
  const activeWorkflow = automationWorkflows.find((w) => w.key === active)

  if (activeWorkflow) {
    return <DocumentFlow workflow={activeWorkflow} onClose={() => setActive(null)} />
  }

  const flagship = automationWorkflows.find((w) => w.flagship)!
  const others = automationWorkflows.filter((w) => !w.flagship)
  const FlagshipIcon = icons[flagship.key]

  return (
    <div className="space-y-6">
      {/* Flagship */}
      <Card className="overflow-hidden p-0">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-2.5 py-1 text-xs font-medium text-accent-foreground">
              <Sparkles className="size-3.5" />
              Most used
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance">{flagship.title}</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground text-pretty">
              Upload a receipt and we extract the merchant, date, amount, tax and category, then generate a
              standardized voucher and record the expense. Stop doing the paperwork twice.
            </p>
            <button
              onClick={() => setActive(flagship.key)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <FlagshipIcon className="size-4" />
              Start expense claim
              <ArrowRight className="size-4" />
            </button>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {["Capture", "Extract", "Validate", "Review", "Generate", "Record"].map((s, i) => (
                <span key={s} className="inline-flex items-center gap-1.5">
                  <span className="grid size-4 place-items-center rounded-full bg-primary/10 font-mono text-[10px] text-primary">
                    {i + 1}
                  </span>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="text-xs font-medium text-muted-foreground">Recent claims</p>
            <ul className="mt-3 space-y-2">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center gap-3 rounded-lg bg-card p-2.5">
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-lg",
                      r.done ? "bg-success/12 text-success-strong" : "bg-warning/15 text-warning-foreground",
                    )}
                  >
                    {r.done ? <Check className="size-4" /> : <Clock className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.id} · {r.when}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{formatCurrency(r.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Other automations */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground">More automations</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((w) => {
            const Icon = icons[w.key]
            return (
              <button
                key={w.key}
                onClick={() => setActive(w.key)}
                className="group flex flex-col rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div className="grid size-11 place-items-center rounded-lg bg-primary/8 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </div>
                <h4 className="mt-4 text-sm font-semibold">{w.title}</h4>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground text-pretty">{w.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  {w.captureLabel}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
