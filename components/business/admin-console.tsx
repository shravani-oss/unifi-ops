"use client"

import { useMemo, useState } from "react"
import {
  Search,
  FileText,
  Check,
  X,
  RotateCcw,
  Download,
  Sparkles,
  ChevronRight,
  Paperclip,
  Undo2,
  MessageSquareWarning,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge, VerificationBadge } from "@/components/status-badge"
import {
  workflowFields,
  formatCurrency,
  type BusinessRequest,
  type WorkflowKey,
} from "@/lib/business-data"
import type { RequestStatus } from "@/lib/types"
import type { DecisionKind, DecisionMap } from "@/lib/decisions"
import { downloadCsv } from "@/lib/export"
import { SourceBadge } from "@/components/status-badge"
import { cn } from "@/lib/utils"

type Filter = "all" | "needs-action" | RequestStatus

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "needs-action", label: "Needs action" },
  { key: "submitted", label: "New" },
  { key: "ai-verified", label: "Automated" },
  { key: "employee-review", label: "In review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
]

const workflowToKey: Record<string, WorkflowKey> = {
  "Expense Claim": "expense",
  "Invoice Submission": "invoice",
  "Purchase Request": "purchase",
  "Vendor Registration": "vendor",
  "Purchase Order Request": "po",
}

const decisionReceipt: Record<
  DecisionKind,
  { icon: typeof CheckCircle2; tone: string; box: string; title: string; desc: string }
> = {
  approved: {
    icon: CheckCircle2,
    tone: "text-success-strong",
    box: "border-success/30 bg-success/8",
    title: "Approved",
    desc: "The voucher and audit record have been generated and filed.",
  },
  rejected: {
    icon: XCircle,
    tone: "text-destructive-strong",
    box: "border-destructive/30 bg-destructive/8",
    title: "Rejected",
    desc: "The submitter has been notified with your reason.",
  },
  correction: {
    icon: MessageSquareWarning,
    tone: "text-warning-foreground",
    box: "border-warning/35 bg-warning/8",
    title: "Fix requested",
    desc: "The submitter has been asked to correct the flagged fields and resubmit.",
  },
}

export function AdminConsole({
  requests,
  decisions,
  onDecide,
  onReopen,
}: {
  requests: BusinessRequest[]
  /** Decisions taken so far, owned by the page so the table and stat cards stay in sync. */
  decisions: DecisionMap
  onDecide: (id: string, kind: DecisionKind) => void
  onReopen: (id: string) => void
}) {
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  // Track the id, not the object — otherwise the drawer keeps showing a stale
  // copy of the request after a decision changes its status.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showDocument, setShowDocument] = useState(false)

  const rows = useMemo(() => {
    return requests.filter((r) => {
      const matchFilter =
        filter === "all" ? true : filter === "needs-action" ? r.needsAction : r.status === filter
      const matchQuery =
        query.trim() === "" ||
        `${r.id} ${r.submitter} ${r.workflow}`.toLowerCase().includes(query.toLowerCase())
      return matchFilter && matchQuery
    })
  }, [requests, filter, query])

  const selected = requests.find((r) => r.id === selectedId) ?? null
  const selectedDecision = selectedId ? decisions[selectedId] : undefined

  function open(id: string) {
    setSelectedId(id)
    setShowDocument(false)
  }

  function exportRows() {
    downloadCsv<BusinessRequest>(
      "operations-report.csv",
      [
        { key: "id", label: "Request ID", value: (r) => r.id },
        { key: "submitter", label: "Submitter", value: (r) => r.submitter },
        { key: "workflow", label: "Workflow", value: (r) => r.workflow },
        { key: "documentType", label: "Source document", value: (r) => r.documentType },
        { key: "amount", label: "Amount (INR)", value: (r) => r.amount },
        { key: "submittedAt", label: "Submitted", value: (r) => r.submittedAt },
        { key: "automation", label: "Automation", value: (r) => r.automation },
        { key: "status", label: "Status", value: (r) => r.status },
      ],
      rows,
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className={cn("space-y-4", selected ? "lg:col-span-2" : "lg:col-span-3")}>
        <Card className="p-4 sm:p-5">
          {/* Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <label htmlFor="request-search" className="sr-only">
                Search requests
              </label>
              <input
                id="request-search"
                data-page-search
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search requests, people…"
                className="w-full rounded-lg border border-input bg-card py-2 pl-9 pr-3 text-sm outline-none ring-ring/40 transition focus:border-ring focus:ring-2"
              />
            </div>
            <Button variant="outline" size="sm" onClick={exportRows}>
              <Download className="size-4" />
              Generate report
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  filter === f.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Business requests. Choose a request ID to open its review panel.
              </caption>
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Request</th>
                  <th className="pb-2 font-medium">Workflow</th>
                  <th className="hidden pb-2 font-medium md:table-cell">Amount</th>
                  <th className="hidden pb-2 font-medium sm:table-cell">Automation</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    // Convenience for mouse users; the button below is the
                    // keyboard- and screen-reader-accessible path.
                    onClick={() => open(r.id)}
                    className={cn(
                      "cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/50",
                      selectedId === r.id && "bg-muted/60",
                    )}
                  >
                    <td className="py-3">
                      {/* A real button, so the row is reachable by keyboard and
                          announced with the request id as its name. */}
                      <button
                        onClick={() => open(r.id)}
                        aria-expanded={selectedId === r.id}
                        className="rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="font-medium hover:underline">{r.id}</span>
                        <span className="block text-xs text-muted-foreground">{r.submitter}</span>
                      </button>
                    </td>
                    <td className="py-3 text-muted-foreground">{r.workflow}</td>
                    <td className="hidden py-3 tabular-nums md:table-cell">
                      {r.amount > 0 ? formatCurrency(r.amount) : "—"}
                    </td>
                    <td className="hidden py-3 sm:table-cell">
                      <VerificationBadge state={r.automation} />
                    </td>
                    <td className="py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3 text-right">
                      <ChevronRight className="ml-auto size-4 text-muted-foreground" aria-hidden />
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No requests match this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Review drawer */}
      {selected && (
        <div className="lg:col-span-1">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{selected.id}</p>
                <p className="text-xs text-muted-foreground">
                  {selected.workflow} · {selected.submitter}
                </p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={`Close ${selected.id}`}
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent/8 p-3 text-xs">
              <Sparkles className="size-4 shrink-0 text-accent" aria-hidden />
              <span className="text-muted-foreground">
                Automation captured this from a {selected.documentType.toLowerCase()} — review the extracted fields
                below.
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground">Extracted information</p>
              <div className="mt-2 space-y-2.5">
                {(workflowFields[workflowToKey[selected.workflow]] ?? []).slice(0, 5).map((f) => (
                  <div key={f.key} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="flex items-center gap-2 text-right font-medium">
                      {f.value || <span className="text-warning-foreground">Needs input</span>}
                      <SourceBadge source={f.source} />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowDocument((v) => !v)}
              aria-expanded={showDocument}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Paperclip className="size-3.5" aria-hidden />
              {showDocument ? "Hide supporting document" : "View supporting document"}
            </button>
            {showDocument && (
              <div className="mt-2 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-center">
                <FileText className="mx-auto size-6 text-muted-foreground" aria-hidden />
                <p className="mt-2 text-xs font-medium">{selected.documentType}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Uploaded {new Date(selected.submittedAt).toLocaleString()} · original file preview appears here once
                  document storage is connected.
                </p>
              </div>
            )}

            {selectedDecision ? (
              <DecisionReceipt kind={selectedDecision} onReopen={() => onReopen(selected.id)} />
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button size="sm" className="col-span-2" onClick={() => onDecide(selected.id, "approved")}>
                  <Check className="size-4" aria-hidden />
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDecide(selected.id, "correction")}>
                  <RotateCcw className="size-4" aria-hidden />
                  Request fix
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive-strong hover:text-destructive-strong"
                  onClick={() => onDecide(selected.id, "rejected")}
                >
                  <X className="size-4" aria-hidden />
                  Reject
                </Button>
              </div>
            )}
          </Card>

          <Card className="mt-4 p-5">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" aria-hidden />
              <p className="text-sm font-medium">Generated documents</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {selected.status === "approved"
                ? "Voucher and audit record filed automatically."
                : "Approving will generate the standardized document and record."}
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}

function DecisionReceipt({ kind, onReopen }: { kind: DecisionKind; onReopen: () => void }) {
  const config = decisionReceipt[kind]
  const Icon = config.icon
  return (
    <div className={cn("mt-5 rounded-xl border p-4", config.box)} role="status">
      <div className="flex items-start gap-2.5">
        <Icon className={cn("mt-0.5 size-5 shrink-0", config.tone)} aria-hidden />
        <div>
          <p className="text-sm font-medium">{config.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{config.desc}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="mt-3" onClick={onReopen}>
        <Undo2 className="size-4" aria-hidden />
        Undo decision
      </Button>
    </div>
  )
}
