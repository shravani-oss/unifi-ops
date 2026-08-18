export type FieldSource = "ai" | "manual" | "missing" | "derived"

export type RequestStatus =
  | "submitted"
  | "ai-verified"
  | "employee-review"
  | "approved"
  | "rejected"

export type CitizenAction = "none" | "notified" | "correction-requested" | "resubmitted"

export type VerificationState = "verified" | "warning" | "failed" | "pending"

export interface ExtractedField {
  key: string
  label: string
  value: string
  source: FieldSource
  confidence?: number
}

export interface VerificationCheck {
  id: string
  label: string
  description: string
  state: VerificationState
  confidence: number
}

export interface ServiceRequest {
  id: string
  citizen: string
  service: string
  department: string
  documentType: string
  submittedAt: string
  status: RequestStatus
  aiConfidence: number
  verification: VerificationState
  assignedTo: string
  citizenAction: CitizenAction
}
