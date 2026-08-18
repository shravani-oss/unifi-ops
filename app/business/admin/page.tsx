"use client"

import { useMemo, useState } from "react"
import { Clock, CheckCircle2, XCircle, AlertTriangle, Layers, IndianRupee } from "lucide-react"
import { DashboardShell } from "@/components/dashboard-shell"
import { StatCard } from "@/components/dashboard/stat-card"
import { AdminConsole } from "@/components/business/admin-console"
import { Button } from "@/components/ui/button"
import { businessQueue, formatCompactCurrency, type BusinessRequest } from "@/lib/business-data"
import { applyDecisionToBusinessRequest, decisionLabel, type DecisionKind, type DecisionMap } from "@/lib/decisions"
import { downloadCsv } from "@/lib/export"

export default function BusinessAdminPage() {
  // Decisions live here so the console table and these stat cards never disagree.
  const [decisions, setDecisions] = useState<DecisionMap>({})

  const requests = useMemo(
    () => businessQueue.map((r) => (decisions[r.id] ? applyDecisionToBusinessRequest(r, decisions[r.id]) : r)),
    [decisions],
  )

  function handleDecide(id: string, kind: DecisionKind) {
    setDecisions((prev) => ({ ...prev, [id]: kind }))
  }

  function handleReopen(id: string) {
    setDecisions((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const pending = requests.filter((r) => ["submitted", "ai-verified", "employee-review"].includes(r.status)).length
  const approved = requests.filter((r) => r.status === "approved").length
  const rejected = requests.filter((r) => r.status === "rejected").length
  const needsAction = requests.filter((r) => r.needsAction).length
  const totalProcessed = requests.length
  const totalAmount = requests.reduce((s, r) => s + r.amount, 0)

  function exportReport() {
    downloadCsv<BusinessRequest>(
      "operations-overview.csv",
      [
        { key: "id", label: "Request ID", value: (r) => r.id },
        { key: "submitter", label: "Submitter", value: (r) => r.submitter },
        { key: "workflow", label: "Workflow", value: (r) => r.workflow },
        { key: "amount", label: "Amount (INR)", value: (r) => r.amount },
        { key: "submittedAt", label: "Submitted", value: (r) => r.submittedAt },
        { key: "status", label: "Status", value: (r) => r.status },
        { key: "decision", label: "Your decision", value: (r) => (decisions[r.id] ? decisionLabel[decisions[r.id]] : "") },
      ],
      requests,
    )
  }

  return (
    <DashboardShell
      sector="Business"
      role="Admin"
      roleName="Operations Control"
      roleInitials="OC"
      nav="business"
      breadcrumb={["Business", "Admin", "Operations"]}
      title="Operations overview"
      subtitle="Every request here started as a document — captured once, then turned into records automatically."
      actions={<Button onClick={exportReport}>Generate report</Button>}
    >
      <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Pending" value={pending} icon={Clock} tone="warning" />
        <StatCard label="Approved" value={approved} icon={CheckCircle2} tone="success" />
        <StatCard label="Rejected" value={rejected} icon={XCircle} tone="destructive" />
        <StatCard label="Needs action" value={needsAction} icon={AlertTriangle} tone="warning" />
        <StatCard label="In this queue" value={totalProcessed} icon={Layers} />
        <StatCard label="Queue value" value={formatCompactCurrency(totalAmount)} icon={IndianRupee} tone="success" />
      </div>

      <AdminConsole
        requests={requests}
        decisions={decisions}
        onDecide={handleDecide}
        onReopen={handleReopen}
      />
    </DashboardShell>
  )
}
