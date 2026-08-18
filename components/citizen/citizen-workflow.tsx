"use client"

import { useState } from "react"
import {
  QrCode,
  MapPin,
  FileText,
  UploadCloud,
  ScanText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  ClipboardList,
  BadgeCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SourceBadge } from "@/components/status-badge"
import { birthCertificateFields } from "@/lib/mock-data"
import type { ExtractedField } from "@/lib/types"
import { cn } from "@/lib/utils"

const stepLabels = ["Scan QR", "Select Service", "Upload", "Auto-Populate", "Review", "Submit"]

/** Short code per service, so a reference ID says which service it belongs to. */
const servicePrefix: Record<string, string> = {
  "Birth Certificate": "BIR",
  "Death Certificate": "DTH",
  "Marriage Registration": "MRG",
  "Name Correction": "NMC",
}

/**
 * Stand-in for the reference the backend will mint on submission. Generated per
 * submission so running the flow twice never shows the same number twice.
 */
function generateReferenceId(service: string | null): string {
  const prefix = (service && servicePrefix[service]) || "REQ"
  const serial = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${serial}`
}

const services = [
  { name: "Birth Certificate", desc: "Register a new birth and get an official certificate.", available: true },
  { name: "Death Certificate", desc: "Register a death record.", available: true },
  { name: "Marriage Registration", desc: "Register a marriage.", available: true },
  { name: "Name Correction", desc: "Amend an existing civil record.", available: false },
]

export function CitizenWorkflow() {
  const [step, setStep] = useState(0)
  const [scanned, setScanned] = useState(false)
  const [service, setService] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState(false)
  const [fields, setFields] = useState<ExtractedField[]>(birthCertificateFields)
  const [referenceId, setReferenceId] = useState<string | null>(null)

  function runExtraction() {
    setExtracting(true)
    setExtracted(false)
    setTimeout(() => {
      setExtracting(false)
      setExtracted(true)
    }, 1800)
  }

  function updateField(key: string, value: string) {
    setFields((prev) =>
      prev.map((f) =>
        f.key === key
          ? { ...f, value, source: f.source === "missing" && value ? "manual" : f.source }
          : f,
      ),
    )
  }

  function submitOrContinue() {
    if (step === 4) setReferenceId(generateReferenceId(service))
    setStep((s) => Math.min(5, s + 1))
  }

  const missingCount = fields.filter((f) => f.source === "missing" || (f.source === "manual" && !f.value)).length
  const canProceed =
    (step === 0 && scanned) ||
    (step === 1 && service) ||
    (step === 2 && uploaded) ||
    (step === 3 && extracted) ||
    step === 4 ||
    step === 5

  return (
    <div className="mx-auto max-w-3xl">
      {/* Stepper */}
      <ol className="mb-8 flex items-center">
        {stepLabels.map((label, i) => {
          const done = i < step
          const active = i === step
          return (
            <li
              key={label}
              className="flex flex-1 items-center last:flex-none"
              aria-current={active ? "step" : undefined}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div
                  aria-hidden
                  className={cn(
                    "grid size-8 place-items-center rounded-full border text-xs font-medium transition-colors",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-accent bg-accent/15 text-accent-foreground",
                    !done && !active && "border-border bg-card text-muted-foreground",
                  )}
                >
                  {done ? <CheckCircle2 className="size-4" aria-hidden /> : i + 1}
                </div>
                {/* Visible label is decorative — it disappears on small screens,
                    so the accessible name comes from the sr-only text below. */}
                <span
                  aria-hidden
                  className={cn(
                    "hidden text-[11px] font-medium sm:block",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
                <span className="sr-only">
                  {`Step ${i + 1} of ${stepLabels.length}: ${label}`}
                  {done ? " (completed)" : active ? " (current step)" : ""}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className={cn("mx-1 h-px flex-1", i < step ? "bg-primary" : "bg-border")} />
              )}
            </li>
          )
        })}
      </ol>

      <Card>
        <CardContent className="p-6">
          {/* Step 0 — Scan QR */}
          {step === 0 && (
            <div className="text-center">
              <StepHeading
                icon={QrCode}
                title="Scan the department QR code"
                desc="Point your camera at the QR displayed at the department counter to identify the location and available services."
              />
              <div className="mx-auto mt-6 flex max-w-xs flex-col items-center">
                <div
                  className={cn(
                    "relative grid aspect-square w-56 place-items-center rounded-2xl border-2 border-dashed transition-colors",
                    scanned ? "border-success/50 bg-success/5" : "border-border bg-muted/40",
                  )}
                >
                  {scanned ? (
                    <div className="flex flex-col items-center gap-2 text-success-strong">
                      <BadgeCheck className="size-12" />
                      <span className="text-sm font-medium">QR recognised</span>
                    </div>
                  ) : (
                    <QrCode className="size-24 text-muted-foreground/40" />
                  )}
                </div>
                {!scanned ? (
                  <Button className="mt-5" onClick={() => setScanned(true)}>
                    <ScanText />
                    Simulate scan
                  </Button>
                ) : (
                  <div className="mt-5 w-full rounded-xl border border-border bg-secondary/50 p-4 text-left">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="size-4 text-accent-foreground" />
                      District Office — Bengaluru Urban
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Department: <span className="font-medium text-foreground">Civil Registration</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 1 — Select Service */}
          {step === 1 && (
            <div>
              <StepHeading
                icon={ClipboardList}
                title="Select a service"
                desc="Services available at Civil Registration, Bengaluru Urban."
              />
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {services.map((s) => (
                  <button
                    key={s.name}
                    disabled={!s.available}
                    onClick={() => setService(s.name)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                      service === s.name
                        ? "border-accent bg-accent/10"
                        : "border-border bg-background hover:border-accent/40 hover:bg-accent/5",
                    )}
                  >
                    <span className="flex w-full items-center justify-between font-medium">
                      {s.name}
                      {service === s.name && <CheckCircle2 className="size-4 text-accent-foreground" />}
                    </span>
                    <span className="text-sm text-muted-foreground">{s.desc}</span>
                    {!s.available && <span className="text-xs text-muted-foreground">Currently unavailable</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Upload */}
          {step === 2 && (
            <div>
              <StepHeading
                icon={UploadCloud}
                title="Upload supporting document"
                desc="Upload your Aadhaar or a supported identity document. We use it to auto-fill your form."
              />
              <label
                className={cn(
                  "mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
                  uploaded ? "border-success/50 bg-success/5" : "border-border bg-muted/40 hover:bg-muted/60",
                )}
              >
                {uploaded ? (
                  <>
                    <div className="flex items-center gap-2 text-success-strong">
                      <FileText className="size-6" />
                      <span className="font-medium">aadhaar_front.jpg</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Uploaded · 1.2 MB · ready for extraction</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-8 text-muted-foreground/60" />
                    <div>
                      <p className="font-medium">Click to upload or drag a file</p>
                      <p className="text-sm text-muted-foreground">JPG, PNG or PDF up to 10 MB</p>
                    </div>
                  </>
                )}
                <input
                  type="file"
                  className="sr-only"
                  onChange={() => setUploaded(true)}
                  accept="image/*,application/pdf"
                />
              </label>
              {!uploaded && (
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  No document handy?{" "}
                  <button className="font-medium text-accent-foreground underline" onClick={() => setUploaded(true)}>
                    Use a sample Aadhaar
                  </button>
                </p>
              )}
            </div>
          )}

          {/* Step 3 — Auto-Populate */}
          {step === 3 && (
            <div className="text-center">
              <StepHeading
                icon={Sparkles}
                title="AI is reading your document"
                desc="We extract details and populate your form. You can review and edit everything in the next step."
              />
              <div className="mt-6">
                {!extracted && !extracting && (
                  <Button onClick={runExtraction}>
                    <Sparkles />
                    Start extraction
                  </Button>
                )}
                {extracting && (
                  <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
                    <Loader2 className="size-8 animate-spin text-accent-foreground" />
                    <p className="text-sm">Extracting fields from aadhaar_front.jpg…</p>
                  </div>
                )}
                {extracted && (
                  <div className="mx-auto max-w-md rounded-xl border border-success/30 bg-success/5 p-5 text-left">
                    <p className="flex items-center gap-2 font-medium text-success-strong">
                      <CheckCircle2 className="size-5" />
                      Extraction complete
                    </p>
                    <ul className="mt-3 space-y-1.5 text-sm text-foreground">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Fields extracted by AI</span>
                        <span className="font-medium">{fields.filter((f) => f.source === "ai").length}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Auto-calculated</span>
                        <span className="font-medium">{fields.filter((f) => f.source === "derived").length}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Needs your input</span>
                        <span className="font-medium text-warning-foreground">
                          {fields.filter((f) => f.source === "missing").length}
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 4 && (
            <div>
              <StepHeading
                icon={ClipboardList}
                title="Review & edit your details"
                desc="Fields are labelled by source. Please complete anything marked as missing before submitting."
              />
              <div className="mt-4 flex flex-wrap gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-xs">
                <LegendDot label="AI extracted" className="bg-accent" />
                <LegendDot label="Manually entered" className="bg-chart-2" />
                <LegendDot label="Auto-calculated" className="bg-primary" />
                <LegendDot label="Missing" className="bg-warning" />
              </div>
              <div className="mt-4 space-y-3">
                {fields.map((f) => {
                  const isMissing = f.source === "missing" || (f.source === "manual" && !f.value)
                  return (
                    <div
                      key={f.key}
                      className={cn(
                        "rounded-xl border p-3",
                        isMissing ? "border-warning/40 bg-warning/5" : "border-border bg-background",
                      )}
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <label htmlFor={f.key} className="text-sm font-medium">
                          {f.label}
                        </label>
                        <div className="flex items-center gap-2">
                          {f.source === "ai" && f.confidence && (
                            <span className="font-mono text-[11px] text-muted-foreground">{f.confidence}%</span>
                          )}
                          <SourceBadge source={isMissing ? "missing" : f.source} />
                        </div>
                      </div>
                      <input
                        id={f.key}
                        value={f.value}
                        onChange={(e) => updateField(f.key, e.target.value)}
                        readOnly={f.source === "derived"}
                        placeholder={isMissing ? "Enter value…" : undefined}
                        className={cn(
                          "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
                          f.source === "derived" && "bg-muted/50 text-muted-foreground",
                        )}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 5 — Submit */}
          {step === 5 && (
            <div className="py-4 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-success/12 text-success-strong">
                <CheckCircle2 className="size-9" />
              </div>
              <h2 className="mt-4 text-xl font-semibold tracking-tight">Application submitted</h2>
              <p className="mx-auto mt-2 max-w-md text-pretty text-muted-foreground">
                Your {service} application has been submitted to Civil Registration. It will be AI-verified and
                reviewed by an officer. You will be notified of the decision.
              </p>
              <div className="mx-auto mt-6 max-w-sm rounded-xl border border-border bg-secondary/40 p-4 text-left text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Reference ID</span>
                  <span className="font-mono font-medium">{referenceId}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">Submitted → awaiting AI verification</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Estimated review</span>
                  <span className="font-medium">Within 3 working days</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nav */}
      {step < 5 && (
        <div className="mt-5 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft />
            Back
          </Button>
          <div className="flex items-center gap-3">
            {step === 4 && missingCount > 0 && (
              <span className="text-sm text-warning-foreground">{missingCount} field(s) need attention</span>
            )}
            <Button onClick={submitOrContinue} disabled={!canProceed}>
              {step === 4 ? "Confirm & submit" : "Continue"}
              <ArrowRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function StepHeading({ icon: Icon, title, desc }: { icon: typeof QrCode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="grid size-11 place-items-center rounded-xl bg-primary/8 text-primary">
        <Icon className="size-5" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="max-w-md text-pretty text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}

function LegendDot({ label, className }: { label: string; className: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className={cn("size-2.5 rounded-full", className)} />
      {label}
    </span>
  )
}
