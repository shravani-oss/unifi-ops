import type { CitizenAction, RequestStatus, ServiceRequest } from "./types"
import type { BusinessRequest } from "./business-data"

/** A reviewer's call on a single request. Shared by the government and business review surfaces. */
export type DecisionKind = "approved" | "rejected" | "correction"

/** Decisions taken this session, keyed by request id. */
export type DecisionMap = Record<string, DecisionKind>

/**
 * A "correction" is not a terminal state — the request stays in review until the
 * submitter resubmits, so only approve/reject move the status.
 */
export function statusForDecision(kind: DecisionKind, current: RequestStatus): RequestStatus {
  if (kind === "approved") return "approved"
  if (kind === "rejected") return "rejected"
  return current === "submitted" || current === "ai-verified" ? "employee-review" : current
}

function subjectActionForDecision(kind: DecisionKind): CitizenAction {
  return kind === "correction" ? "correction-requested" : "notified"
}

export function applyDecisionToServiceRequest(request: ServiceRequest, kind: DecisionKind): ServiceRequest {
  return {
    ...request,
    status: statusForDecision(kind, request.status),
    citizenAction: subjectActionForDecision(kind),
  }
}

export function applyDecisionToBusinessRequest(request: BusinessRequest, kind: DecisionKind): BusinessRequest {
  return {
    ...request,
    status: statusForDecision(kind, request.status),
    needsAction: kind === "correction",
  }
}

export const decisionLabel: Record<DecisionKind, string> = {
  approved: "Approved",
  rejected: "Rejected",
  correction: "Correction requested",
}
