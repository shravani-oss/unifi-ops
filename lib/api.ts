import type { ExtractedField } from "./types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

/** Document types the backend's extraction prompt knows how to handle. */
export type BackendDocumentType = "receipt" | "invoice" | "id_card" | "vendor_doc"

export interface ExtractionResponse {
  success: boolean
  filename: string
  document_type: string
  raw_text: string
  data: Record<string, string | null>
}

/**
 * Why the extraction failed, so the UI can say something specific instead of
 * a generic error. `rate-limit` is common on the Gemini free tier (20 req/min).
 */
export type ApiFailureKind = "rate-limit" | "unreadable" | "unsupported" | "offline" | "server"

export class ApiError extends Error {
  kind: ApiFailureKind
  constructor(kind: ApiFailureKind, message: string) {
    super(message)
    this.kind = kind
    this.name = "ApiError"
  }
}

function classify(status: number, detail: string): ApiFailureKind {
  if (status === 400) return "unsupported"
  if (status === 422) return "unreadable"
  if (status === 429 || detail.includes("RESOURCE_EXHAUSTED") || detail.includes("429")) return "rate-limit"
  return "server"
}

async function readDetail(response: Response): Promise<string> {
  try {
    const body = await response.json()
    return typeof body?.detail === "string" ? body.detail : JSON.stringify(body)
  } catch {
    return response.statusText
  }
}

export async function extractDocument(
  file: File,
  documentType: BackendDocumentType,
): Promise<ExtractionResponse> {
  const body = new FormData()
  body.append("file", file)
  body.append("document_type", documentType)

  let response: Response
  try {
    response = await fetch(`${API_BASE}/api/v1/extract-document`, { method: "POST", body })
  } catch {
    throw new ApiError("offline", "Could not reach the document service.")
  }

  if (!response.ok) {
    const detail = await readDetail(response)
    throw new ApiError(classify(response.status, detail), detail)
  }
  return response.json()
}

export async function sendChatMessage(message: string): Promise<string> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}/api/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
  } catch {
    throw new ApiError("offline", "Could not reach the assistant.")
  }

  if (!response.ok) {
    const detail = await readDetail(response)
    throw new ApiError(classify(response.status, detail), detail)
  }
  const body = await response.json()
  return body.response
}

/** Returns the voucher PDF as a blob so the caller can hand it to the user. */
export async function generateVoucher(data: Record<string, unknown>): Promise<Blob> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}/api/v1/generate-voucher`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  } catch {
    throw new ApiError("offline", "Could not reach the document service.")
  }

  if (!response.ok) {
    const detail = await readDetail(response)
    throw new ApiError(classify(response.status, detail), detail)
  }
  return response.blob()
}

/** Human-readable labels for the keys the backend returns, per document type. */
const FIELD_LABELS: Record<string, string> = {
  merchant: "Merchant",
  date: "Date",
  amount: "Amount",
  tax: "Tax",
  category: "Category",
  description: "Description",
  vendor_name: "Vendor",
  invoice_number: "Invoice Number",
  due_date: "Due Date",
  applicant_name: "Full Name",
  father_name: "Father's Name",
  mother_name: "Mother's Name",
  dob: "Date of Birth",
  address: "Address",
  gender: "Gender",
  registration_number: "Registration Number",
  contact_email: "Contact Email",
  bank_account: "Bank Account",
}

function toLabel(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Converts the backend's flat JSON into the field list the UI renders.
 *
 * The backend does not return per-field confidence, so `confidence` is left
 * undefined rather than invented — the UI hides the meter when it is absent.
 * A null/empty value means the model could not find that field, which maps to
 * the existing "missing" source so the user is prompted to fill it in.
 */
export function toExtractedFields(data: Record<string, string | null>): ExtractedField[] {
  return Object.entries(data).map(([key, value]) => {
    const text = value == null ? "" : String(value).trim()
    return {
      key,
      label: toLabel(key),
      value: text,
      source: text ? "ai" : "missing",
    }
  })
}
