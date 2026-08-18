"use client"

import { useMemo, useState } from "react"
import { Inbox, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react"
import { DashboardShell } from "@/components/dashboard-shell"
import { StatCard } from "@/components/dashboard/stat-card"
import { VerificationDesk } from "@/components/employee/verification-desk"
import { Button } from "@/components/ui/button"
import { governmentRequests } from "@/lib/mock-data"
import { applyDecisionToServiceRequest, decisionLabel, type DecisionKind, type DecisionMap } from "@/lib/decisions"
import { downloadCsv } from "@/lib/export"
import type { ServiceRequest } from "@/lib/types"

export default function GovernmentEmployeePage() {
  // Decisions live here, not inside the desk, so the queue and the stat cards
  // above it read from the same source of truth.
  const [decisions, setDecisions] = useState<DecisionMap>({})

  const requests = useMemo(
    () => governmentRequests.map((r) => (decisions[r.id] ? applyDecisionToServiceRequest(r, decisions[r.id]) : r)),
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

  const pending = requests.filter((r) => r.status === "ai-verified" || r.status === "employee-review").length
  const warnings = requests.filter((r) => r.verification === "warning" || r.verification === "failed").length
  const decidedToday = Object.keys(decisions).length

  function exportQueue() {
    downloadCsv<ServiceRequest>(
      "verification-queue.csv",
      [
        { key: "id", label: "Request ID", value: (r) => r.id },
        { key: "citizen", label: "Citizen", value: (r) => r.citizen },
        { key: "service", label: "Service", value: (r) => r.service },
        { key: "department", label: "Department", value: (r) => r.department },
        { key: "submittedAt", label: "Submitted", value: (r) => r.submittedAt },
        { key: "status", label: "Status", value: (r) => r.status },
        { key: "aiConfidence", label: "AI confidence", value: (r) => r.aiConfidence },
        { key: "decision", label: "Your decision", value: (r) => (decisions[r.id] ? decisionLabel[decisions[r.id]] : "") },
      ],
      requests,
    )
  }

  return (
    <DashboardShell
      sector="Government"
      role="Employee"
      roleName="Meera Nair"
      roleInitials="MN"
      nav="government"
      breadcrumb={["Government", "Employee", "Verification Desk"]}
      title="Verification Desk"
      subtitle="Review AI-verified requests and make the final call. AI assists — you decide."
      actions={
        <Button variant="outline" onClick={exportQueue}>
          Export queue
        </Button>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="In your queue" value={pending} icon={Inbox} />
        <StatCard label="Decided by you today" value={decidedToday} icon={ShieldCheck} tone="success" />
        <StatCard label="Needs attention" value={warnings} icon={AlertTriangle} tone="warning" />
        <StatCard
          label="Approved this week"
          value={64 + requests.filter((r) => decisions[r.id] === "approved").length}
          icon={CheckCircle2}
          tone="success"
          trend={{ value: "+8%", up: true }}
        />
      </div>
      <VerificationDesk
        requests={requests}
        subjectLabel="Citizen"
        decisions={decisions}
        onDecide={handleDecide}
        onReopen={handleReopen}
      />
    </DashboardShell>
  )
}
