"use client"

import { useState } from "react"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Bot,
  Pencil,
  MessageSquareWarning,
  ThumbsUp,
  ThumbsDown,
  FileText,
  ShieldCheck,
  Undo2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge, VerificationBadge, ConfidenceMeter } from "@/components/status-badge"
import { verificationChecks } from "@/lib/mock-data"
import type { DecisionKind, DecisionMap } from "@/lib/decisions"
import type { ServiceRequest, VerificationState } from "@/lib/types"
import { cn } from "@/lib/utils"

const checkIcon: Record<VerificationState, typeof CheckCircle2> = {
  verified: CheckCircle2,
  warning: AlertTriangle,
  failed: XCircle,
  pending: Clock,
}

const checkTone: Record<VerificationState, string> = {
  verified: "text-success-strong",
  warning: "text-warning-foreground",
  failed: "text-destructive-strong",
  pending: "text-muted-foreground",
}

export function VerificationDesk({
  requests,
  subjectLabel,
  decisions,
  onDecide,
  onReopen,
}: {
  requests: ServiceRequest[]
  subjectLabel: string
  /** Decisions taken so far, owned by the page so the queue and stat cards stay in sync. */
  decisions: DecisionMap
  onDecide: (id: string, kind: DecisionKind) => void
  onReopen: (id: string) => void
}) {
  const reviewable = requests.filter((r) => r.status !== "approved" && r.status !== "rejected")
  const [selectedId, setSelectedId] = useState(reviewable[0]?.id ?? requests[0].id)

  const selected = requests.find((r) => r.id === selectedId)!
  const overall = Math.round(verificationChecks.reduce((a, c) => a + c.confidence, 0) / verificationChecks.length)
  const currentDecision = decisions[selectedId]

  function decide(kind: DecisionKind) {
    onDecide(selectedId, kind)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(280px,340px)_1fr]">
      {/* Queue */}
      <Card className="h-fit">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center justify-between">
            Review Queue
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
              {requests.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ul className="max-h-[560px] space-y-1 overflow-y-auto">
            {requests.map((r) => {
              const active = r.id === selectedId
              return (
                <li key={r.id}>
                  <button
                    onClick={() => setSelectedId(r.id)}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-colors",
                      active
                        ? "border-accent/50 bg-accent/8"
                        : "border-transparent hover:bg-muted/60",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="mt-1.5 truncate text-sm font-medium">{r.citizen}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.service}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <VerificationBadge state={r.verification} />
                      <ConfidenceMeter value={r.aiConfidence} />
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Workspace */}
      <div className="space-y-5">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{selected.service}</CardTitle>
                <StatusBadge status={selected.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-mono">{selected.id}</span> · {subjectLabel}:{" "}
                <span className="text-foreground">{selected.citizen}</span> · {selected.department}
              </p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-muted-foreground">Overall AI confidence</p>
              <p className="font-mono text-lg font-semibold tabular-nums">{overall}%</p>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-accent/25 bg-accent/8 p-3 text-sm">
              <Bot className="size-4 shrink-0 text-accent-foreground" />
              <p className="text-pretty">
                AI has completed all checks. It assists your review — you make the final decision.
              </p>
            </div>

            <p className="mb-3 flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="size-4 text-primary" />
              AI Verification Workspace
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {verificationChecks.map((c) => {
                const Icon = checkIcon[c.state]
                return (
                  <div key={c.id} className="rounded-xl border border-border bg-background p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <Icon className={cn("mt-0.5 size-4.5 shrink-0", checkTone[c.state])} />
                        <div>
                          <p className="text-sm font-medium leading-tight">{c.label}</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <VerificationBadge state={c.state} />
                      <ConfidenceMeter value={c.confidence} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Decision */}
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle>Your Decision</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {currentDecision ? (
              <DecisionResult
                kind={currentDecision}
                subjectLabel={subjectLabel}
                onReopen={() => onReopen(selectedId)}
              />
            ) : (
              <>
                <label htmlFor="feedback" className="text-sm font-medium">
                  Notes / feedback {"(shared with the applicant on correction or rejection)"}
                </label>
                <textarea
                  id="feedback"
                  rows={3}
                  placeholder="Add context for your decision…"
                  className="mt-2 w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline">
                    <Pencil />
                    Edit fields
                  </Button>
                  <Button variant="outline" onClick={() => decide("correction")}>
                    <MessageSquareWarning />
                    Request correction
                  </Button>
                  <div className="ml-auto flex gap-2">
                    <Button variant="destructive" onClick={() => decide("rejected")}>
                      <ThumbsDown />
                      Reject
                    </Button>
                    <Button onClick={() => decide("approved")} className="bg-success-strong text-success-foreground hover:bg-success-strong/90">
                      <ThumbsUp />
                      Approve
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DecisionResult({
  kind,
  subjectLabel,
  onReopen,
}: {
  kind: DecisionKind
  subjectLabel: string
  onReopen: () => void
}) {
  const config = {
    approved: {
      icon: CheckCircle2,
      tone: "text-success-strong",
      bg: "bg-success/8 border-success/30",
      title: "Request approved",
      desc: `The request has been approved and the ${subjectLabel.toLowerCase()} has been notified automatically.`,
    },
    rejected: {
      icon: XCircle,
      tone: "text-destructive-strong",
      bg: "bg-destructive/8 border-destructive/30",
      title: "Request rejected",
      desc: `The request was rejected. Your feedback has been sent to the ${subjectLabel.toLowerCase()}.`,
    },
    correction: {
      icon: MessageSquareWarning,
      tone: "text-warning-foreground",
      bg: "bg-warning/8 border-warning/35",
      title: "Correction requested",
      desc: `The ${subjectLabel.toLowerCase()} has been asked to correct and resubmit the flagged fields.`,
    },
  }[kind]
  const Icon = config.icon
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-4", config.bg)}>
      <Icon className={cn("mt-0.5 size-6 shrink-0", config.tone)} />
      <div className="flex-1">
        <p className="font-medium">{config.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{config.desc}</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="size-3.5" />
          Decision logged to the request lifecycle.
        </p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onReopen}>
          <Undo2 />
          Reopen for review
        </Button>
      </div>
    </div>
  )
}
