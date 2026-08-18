"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  UploadCloud,
  Sparkles,
  Check,
  FileText,
  Download,
  Loader2,
  RotateCcw,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SourceBadge, ConfidenceMeter } from "@/components/status-badge"
import { workflowFields, type AutomationWorkflow } from "@/lib/business-data"
import { downloadCsv } from "@/lib/export"
import type { ExtractedField } from "@/lib/types"
import { cn } from "@/lib/utils"

type Stage = "capture" | "extracting" | "verify" | "done"

const STEPS = ["Capture", "Extract", "Verify", "Generate"] as const

export function DocumentFlow({
  workflow,
  onClose,
}: {
  workflow: AutomationWorkflow
  onClose: () => void
}) {
  const [stage, setStage] = useState<Stage>("capture")
  const fields = workflowFields[workflow.key]
  const missing = fields.filter((f) => f.source === "missing")
  const [inputs, setInputs] = useState<Record<string, string>>({})

  const activeStep =
    stage === "capture" ? 0 : stage === "extracting" ? 1 : stage === "verify" ? 2 : 3

  function runExtraction() {
    setStage("extracting")
    setTimeout(() => setStage("verify"), 1900)
  }

  const canGenerate = missing.every((f) => (inputs[f.key] ?? "").trim().length > 0)
  // Minted once, when the record is generated — computing it inline made the
  // number change on every keystroke and differ between server and client.
  const [reference, setReference] = useState("")

  function generateRecord() {
    setReference(`${workflow.key.toUpperCase().slice(0, 3)}-${Math.floor(4000 + Math.random() * 900)}`)
    setStage("done")
  }

  /** The finished record: extracted fields plus anything the user filled in. */
  const record: ExtractedField[] = fields.map((f) =>
    f.source === "missing" && inputs[f.key] ? { ...f, value: inputs[f.key], source: "manual" } : f,
  )

  function downloadRecord() {
    downloadCsv<ExtractedField>(
      `${reference}_${workflow.generates.replace(/\s+/g, "_")}.csv`,
      [
        { key: "label", label: "Field", value: (f) => f.label },
        { key: "value", label: "Value", value: (f) => f.value },
        { key: "source", label: "Source", value: (f) => f.source },
        { key: "confidence", label: "AI confidence", value: (f) => f.confidence ?? "" },
      ],
      record,
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All automations
        </button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-accent" />
          Smart Automation
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-semibold tracking-tight text-balance">{workflow.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{workflow.tagline}</p>
      </div>

      {/* Stepper */}
      <ol className="mt-6 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const state = i < activeStep ? "done" : i === activeStep ? "active" : "todo"
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  state === "done" && "border-success/30 bg-success/10 text-success-strong",
                  state === "active" && "border-primary/30 bg-primary/8 text-primary",
                  state === "todo" && "border-border bg-card text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full text-[11px]",
                    state === "done" && "bg-success-strong text-success-foreground",
                    state === "active" && "bg-primary text-primary-foreground",
                    state === "todo" && "bg-muted text-muted-foreground",
                  )}
                >
                  {state === "done" ? <Check className="size-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
            </li>
          )
        })}
      </ol>

      {/* Stage content */}
      <div className="mt-6">
        {stage === "capture" && (
          <Card className="p-8">
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/8 text-primary">
                <UploadCloud className="size-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{workflow.captureLabel}</h3>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                Drop your document here. We read it once and turn it into a {workflow.generates.toLowerCase()} — no
                retyping.
              </p>
              <div className="mt-6 rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-10">
                <p className="text-sm text-muted-foreground">Drag &amp; drop, or</p>
                <Button className="mt-3" onClick={runExtraction}>
                  <UploadCloud className="size-4" />
                  {workflow.captureLabel}
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">PDF, JPG or PNG · up to 10 MB</p>
              </div>
            </div>
          </Card>
        )}

        {stage === "extracting" && (
          <Card className="p-12">
            <div className="flex flex-col items-center text-center">
              <div className="relative grid size-16 place-items-center rounded-2xl bg-accent/12 text-accent">
                <Loader2 className="size-8 animate-spin" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">Reading your document…</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Extracting {workflow.title === "Expense Claim" ? "merchant, date, amount, tax and category" : "the key details"}.
              </p>
            </div>
          </Card>
        )}

        {stage === "verify" && (
          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-success/12 text-success-strong">
                  <Check className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Captured automatically</h3>
                  <p className="text-xs text-muted-foreground">
                    {fields.length - missing.length} of {fields.length} fields ready · review anything flagged below.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {fields
                  .filter((f) => f.source !== "missing")
                  .map((f) => (
                    <div key={f.key} className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{f.label}</p>
                        <p className="mt-0.5 truncate text-sm font-medium">{f.value}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <SourceBadge source={f.source} />
                          {typeof f.confidence === "number" && <ConfidenceMeter value={f.confidence} />}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            {missing.length > 0 && (
              <Card className="border-warning/30 bg-warning/5 p-5">
                <h3 className="text-sm font-semibold">Just a couple of things we couldn&apos;t read</h3>
                <p className="text-xs text-muted-foreground">Only the missing fields need you.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {missing.map((f) => (
                    <label key={f.key} className="block">
                      <span className="text-xs font-medium text-foreground">{f.label}</span>
                      <input
                        value={inputs[f.key] ?? ""}
                        onChange={(e) => setInputs((p) => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={`Enter ${f.label.toLowerCase()}`}
                        className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none ring-ring/40 transition focus:border-ring focus:ring-2"
                      />
                    </label>
                  ))}
                </div>
              </Card>
            )}

            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setStage("capture")}>
                Replace document
              </Button>
              <Button disabled={!canGenerate} onClick={generateRecord}>
                Generate {workflow.generates}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {stage === "done" && (
          <Card className="p-8">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-success/12 text-success-strong">
                <Check className="size-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{workflow.generates} ready</h3>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                Recorded as <span className="font-mono font-medium text-foreground">{reference}</span> and routed for
                approval. The same data now powers your reports — no re-entry.
              </p>

              <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4 text-left">
                <div className="grid size-10 place-items-center rounded-lg bg-primary/8 text-primary">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {reference}_{workflow.generates.replace(/\s+/g, "_")}.csv
                  </p>
                  <p className="text-xs text-muted-foreground">Standardized · generated just now</p>
                </div>
                <Button variant="outline" size="sm" onClick={downloadRecord}>
                  <Download className="size-4" />
                  Download
                </Button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <Button variant="outline" onClick={() => { setStage("capture"); setInputs({}); setReference("") }}>
                  <RotateCcw className="size-4" />
                  New {workflow.title.toLowerCase()}
                </Button>
                <Button onClick={onClose}>Back to automations</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
