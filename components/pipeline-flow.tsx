import { FileText, ScanText, ShieldCheck, UserCheck, Gavel, Send, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { icon: FileText, label: "Documents", note: "Upload / QR" },
  { icon: ScanText, label: "AI Extraction", note: "Auto-populate" },
  { icon: ShieldCheck, label: "Validation", note: "Rules & checks" },
  { icon: UserCheck, label: "Human Review", note: "Oversight" },
  { icon: Gavel, label: "Decision", note: "Approve / reject" },
  { icon: Send, label: "Action", note: "Notify & act" },
]

export function PipelineFlow({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-stretch justify-center gap-2", className)}>
      {steps.map((step, i) => {
        const Icon = step.icon
        const isHuman = step.label === "Human Review"
        return (
          <div key={step.label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex min-w-28 flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center",
                isHuman ? "border-accent/40 bg-accent/10" : "border-border bg-card",
              )}
            >
              <div
                className={cn(
                  "grid size-10 place-items-center rounded-lg",
                  isHuman ? "bg-accent text-accent-foreground" : "bg-primary/8 text-primary",
                )}
              >
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">{step.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{step.note}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" aria-hidden />
            )}
          </div>
        )
      })}
    </div>
  )
}
