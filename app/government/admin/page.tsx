"use client"

import { FileStack, Clock, CheckCircle2, XCircle } from "lucide-react"
import { DashboardShell } from "@/components/dashboard-shell"
import { StatCard } from "@/components/dashboard/stat-card"
import { OperationsView } from "@/components/admin/operations-view"
import { ActivityFeed, DepartmentBreakdown, CitizenActions } from "@/components/admin/side-panels"
import { Button } from "@/components/ui/button"
import { governmentRequests } from "@/lib/mock-data"
import { downloadCsv } from "@/lib/export"
import type { ServiceRequest } from "@/lib/types"

export default function GovernmentAdminPage() {
  // Every number here counts the same rows the table below shows, so a
  // stakeholder cross-checking a stat against the list always reconciles.
  const total = governmentRequests.length
  const pending = governmentRequests.filter((r) =>
    ["submitted", "ai-verified", "employee-review"].includes(r.status),
  ).length
  const approved = governmentRequests.filter((r) => r.status === "approved").length
  const rejected = governmentRequests.filter((r) => r.status === "rejected").length

  const citizenActions = [
    { label: "QR scans today", value: 342, tone: "text-primary" },
    { label: "Documents uploaded", value: 318, tone: "text-accent-foreground" },
    { label: "Corrections resubmitted", value: 41, tone: "text-warning-foreground" },
    { label: "Notified", value: 289, tone: "text-success-strong" },
  ]

  function exportReport() {
    downloadCsv<ServiceRequest>(
      "operations-report.csv",
      [
        { key: "id", label: "Request ID", value: (r) => r.id },
        { key: "citizen", label: "Citizen", value: (r) => r.citizen },
        { key: "service", label: "Service", value: (r) => r.service },
        { key: "department", label: "Department", value: (r) => r.department },
        { key: "documentType", label: "Source document", value: (r) => r.documentType },
        { key: "submittedAt", label: "Submitted", value: (r) => r.submittedAt },
        { key: "status", label: "Status", value: (r) => r.status },
        { key: "verification", label: "Verification", value: (r) => r.verification },
        { key: "aiConfidence", label: "AI confidence", value: (r) => r.aiConfidence },
        { key: "assignedTo", label: "Assigned to", value: (r) => r.assignedTo },
      ],
      governmentRequests,
    )
  }

  return (
    <DashboardShell
      sector="Government"
      role="Admin"
      roleName="Operations Control"
      roleInitials="OC"
      nav="government"
      breadcrumb={["Government", "Admin", "Operations"]}
      title="Operations Monitoring"
      subtitle="Live view across departments, services and the full request lifecycle."
      actions={<Button onClick={exportReport}>Export report</Button>}
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total requests" value={total} icon={FileStack} />
        <StatCard label="Pending" value={pending} icon={Clock} tone="warning" />
        <StatCard label="Approved" value={approved} icon={CheckCircle2} tone="success" />
        <StatCard label="Rejected" value={rejected} icon={XCircle} tone="destructive" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OperationsView requests={governmentRequests} />
        </div>
        <div className="space-y-5">
          <CitizenActions items={citizenActions} />
          <DepartmentBreakdown />
        </div>
      </div>

      <div className="mt-5">
        <ActivityFeed />
      </div>
    </DashboardShell>
  )
}
