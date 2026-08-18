import { DashboardShell } from "@/components/dashboard-shell"
import { AutomationHub } from "@/components/business/automation-hub"

export default function BusinessEmployeePage() {
  return (
    <DashboardShell
      sector="Business"
      role="Employee"
      roleName="Rohan Kapoor"
      roleInitials="RK"
      nav="business"
      breadcrumb={["Business", "Employee", "Automations"]}
      title="Your automations"
      subtitle="Capture a document once — we extract, validate and generate the paperwork for you."
    >
      <AutomationHub />
    </DashboardShell>
  )
}
