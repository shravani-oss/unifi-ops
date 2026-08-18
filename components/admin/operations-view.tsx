"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge, VerificationBadge, ConfidenceMeter } from "@/components/status-badge"
import { LifecycleTracker } from "@/components/admin/lifecycle-tracker"
import type { ServiceRequest, RequestStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusOptions: { value: RequestStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "ai-verified", label: "AI Verified" },
  { value: "employee-review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

const confidenceOptions = [
  { value: "all", label: "Any confidence" },
  { value: "high", label: "High (85%+)" },
  { value: "medium", label: "Medium (60–84%)" },
  { value: "low", label: "Low (<60%)" },
]

export function OperationsView({ requests }: { requests: ServiceRequest[] }) {
  const departments = useMemo(() => ["all", ...new Set(requests.map((r) => r.department))], [requests])
  const [dept, setDept] = useState("all")
  const [status, setStatus] = useState<RequestStatus | "all">("all")
  const [confidence, setConfidence] = useState("all")
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = requests.filter((r) => {
    if (dept !== "all" && r.department !== dept) return false
    if (status !== "all" && r.status !== status) return false
    if (confidence === "high" && r.aiConfidence < 85) return false
    if (confidence === "medium" && (r.aiConfidence < 60 || r.aiConfidence >= 85)) return false
    if (confidence === "low" && (r.aiConfidence === 0 || r.aiConfidence >= 60)) return false
    return true
  })

  return (
    <Card>
      <CardHeader className="gap-4 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            Requests
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {filtered.length} of {requests.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterSelect label="Department" value={dept} onChange={setDept} options={departments.map((d) => ({ value: d, label: d === "all" ? "All departments" : d }))} />
          <FilterSelect label="Status" value={status} onChange={(v) => setStatus(v as RequestStatus | "all")} options={statusOptions} />
          <FilterSelect label="Confidence" value={confidence} onChange={setConfidence} options={confidenceOptions} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Header row (desktop) */}
        <div className="hidden grid-cols-[1fr_1.4fr_1fr_auto_auto_auto] gap-4 border-b border-border px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:grid">
          <span>Request</span>
          <span>Service / Dept</span>
          <span>Status</span>
          <span>Verification</span>
          <span>Confidence</span>
          <span className="w-6" />
        </div>

        <ul>
          {filtered.map((r) => {
            const open = expanded === r.id
            return (
              <li key={r.id} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => setExpanded(open ? null : r.id)}
                  className="grid w-full grid-cols-2 items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-muted/40 lg:grid-cols-[1fr_1.4fr_1fr_auto_auto_auto]"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-muted-foreground">{r.id}</p>
                    <p className="truncate text-sm font-medium">{r.citizen}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm">{r.service}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.department}</p>
                  </div>
                  <div className="hidden lg:block">
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="hidden lg:block">
                    <VerificationBadge state={r.verification} />
                  </div>
                  <div className="hidden lg:block">
                    <ConfidenceMeter value={r.aiConfidence} />
                  </div>
                  <ChevronDown
                    className={cn("hidden size-4 text-muted-foreground transition-transform lg:block", open && "rotate-180")}
                  />
                  {/* mobile badges */}
                  <div className="col-span-2 flex items-center gap-2 lg:hidden">
                    <StatusBadge status={r.status} />
                    <VerificationBadge state={r.verification} />
                  </div>
                </button>
                {open && (
                  <div className="bg-secondary/30 px-5 py-4">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Request lifecycle
                    </p>
                    <LifecycleTracker status={r.status} />
                    <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                      <Detail label="Document" value={r.documentType} />
                      <Detail label="Assigned to" value={r.assignedTo} />
                      <Detail
                        label="Citizen action"
                        value={r.citizenAction === "none" ? "—" : r.citizenAction.replace("-", " ")}
                      />
                    </div>
                  </div>
                )}
              </li>
            )
          })}
          {filtered.length === 0 && (
            <li className="px-5 py-12 text-center text-sm text-muted-foreground">
              No requests match the current filters.
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-input bg-card py-1.5 pl-3 pr-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium capitalize">{value}</p>
    </div>
  )
}
