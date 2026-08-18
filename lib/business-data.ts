import type { ExtractedField, RequestStatus, VerificationState } from "./types"

export type WorkflowKey = "expense" | "invoice" | "purchase" | "vendor" | "po"

export interface AutomationWorkflow {
  key: WorkflowKey
  title: string
  tagline: string
  captureLabel: string
  generates: string
  flagship?: boolean
}

export const automationWorkflows: AutomationWorkflow[] = [
  {
    key: "expense",
    title: "Expense Claim",
    tagline: "Snap a receipt, get a ready-to-file voucher.",
    captureLabel: "Upload receipt",
    generates: "Expense voucher PDF",
    flagship: true,
  },
  {
    key: "invoice",
    title: "Invoice Submission",
    tagline: "Drop a vendor invoice, we log the payable.",
    captureLabel: "Upload invoice",
    generates: "Payable record",
  },
  {
    key: "purchase",
    title: "Purchase Request",
    tagline: "Turn a quote into an approval-ready request.",
    captureLabel: "Upload quote",
    generates: "Purchase request",
  },
  {
    key: "vendor",
    title: "Vendor Registration",
    tagline: "Onboard a supplier from their GST & PAN.",
    captureLabel: "Upload documents",
    generates: "Vendor profile",
  },
  {
    key: "po",
    title: "Purchase Order Request",
    tagline: "Convert an approved request into a PO draft.",
    captureLabel: "Select request",
    generates: "Purchase order",
  },
]

// Fields extracted from a scanned expense receipt
export const receiptFields: ExtractedField[] = [
  { key: "merchant", label: "Merchant", value: "Blue Tokai Coffee Roasters", source: "ai", confidence: 97 },
  { key: "date", label: "Date", value: "2026-08-16", source: "ai", confidence: 95 },
  { key: "amount", label: "Amount", value: "₹2,480.00", source: "ai", confidence: 96 },
  { key: "tax", label: "GST (18%)", value: "₹378.31", source: "derived" },
  { key: "category", label: "Category", value: "Client Meeting — Meals", source: "ai", confidence: 88 },
  { key: "payment", label: "Payment Method", value: "Corporate Card ••4417", source: "ai", confidence: 91 },
  { key: "project", label: "Project / Cost Center", value: "", source: "missing" },
  { key: "gstin", label: "Merchant GSTIN", value: "29AAFCB1234K1ZP", source: "ai", confidence: 84 },
]

export const workflowFields: Record<WorkflowKey, ExtractedField[]> = {
  expense: receiptFields,
  invoice: [
    { key: "vendor", label: "Vendor", value: "Acme Logistics Pvt Ltd", source: "ai", confidence: 96 },
    { key: "invoiceNo", label: "Invoice Number", value: "AL-2026-1184", source: "ai", confidence: 94 },
    { key: "date", label: "Invoice Date", value: "2026-08-14", source: "ai", confidence: 93 },
    { key: "amount", label: "Total Amount", value: "₹1,48,500.00", source: "ai", confidence: 95 },
    { key: "tax", label: "GST", value: "₹22,652.54", source: "derived" },
    { key: "due", label: "Due Date (Net 30)", value: "2026-09-13", source: "derived" },
    { key: "po", label: "Linked PO", value: "", source: "missing" },
  ],
  purchase: [
    { key: "vendor", label: "Suggested Vendor", value: "Northwind Supplies", source: "ai", confidence: 90 },
    { key: "item", label: "Line Item", value: '24" Monitors × 12', source: "ai", confidence: 92 },
    { key: "amount", label: "Estimated Cost", value: "₹62,000.00", source: "ai", confidence: 89 },
    { key: "category", label: "Category", value: "IT Hardware", source: "ai", confidence: 87 },
    { key: "budget", label: "Budget Line", value: "", source: "missing" },
  ],
  vendor: [
    { key: "name", label: "Legal Name", value: "Northwind Supplies", source: "ai", confidence: 95 },
    { key: "gstin", label: "GSTIN", value: "29AAECN4521P1ZX", source: "ai", confidence: 93 },
    { key: "pan", label: "PAN", value: "AAECN4521P", source: "ai", confidence: 94 },
    { key: "address", label: "Registered Address", value: "18 Industrial Layout, Pune, MH 411001", source: "ai", confidence: 82 },
    { key: "bank", label: "Bank Account", value: "", source: "missing" },
  ],
  po: [
    { key: "request", label: "Source Request", value: "PR-2203 (approved)", source: "ai", confidence: 98 },
    { key: "vendor", label: "Vendor", value: "Northwind Supplies", source: "ai", confidence: 95 },
    { key: "amount", label: "Order Value", value: "₹62,000.00", source: "ai", confidence: 96 },
    { key: "delivery", label: "Delivery By", value: "2026-09-05", source: "derived" },
    { key: "terms", label: "Payment Terms", value: "", source: "missing" },
  ],
}

export interface BusinessRequest {
  id: string
  submitter: string
  workflow: string
  documentType: string
  amount: number
  submittedAt: string
  status: RequestStatus
  automation: VerificationState
  needsAction: boolean
}

export const businessQueue: BusinessRequest[] = [
  {
    id: "EXP-4471",
    submitter: "Rohan Kapoor",
    workflow: "Expense Claim",
    documentType: "Receipt",
    amount: 2480,
    submittedAt: "2026-08-18T09:30:00",
    status: "employee-review",
    automation: "verified",
    needsAction: false,
  },
  {
    id: "INV-8842",
    submitter: "Acme Logistics Pvt Ltd",
    workflow: "Invoice Submission",
    documentType: "Tax Invoice",
    amount: 148500,
    submittedAt: "2026-08-18T09:12:00",
    status: "ai-verified",
    automation: "verified",
    needsAction: false,
  },
  {
    id: "PR-2203",
    submitter: "Priya Nair",
    workflow: "Purchase Request",
    documentType: "Vendor Quote",
    amount: 62000,
    submittedAt: "2026-08-18T08:40:00",
    status: "ai-verified",
    automation: "warning",
    needsAction: true,
  },
  {
    id: "VEN-1190",
    submitter: "Northwind Supplies",
    workflow: "Vendor Registration",
    documentType: "GST + PAN",
    amount: 0,
    submittedAt: "2026-08-18T08:05:00",
    status: "employee-review",
    automation: "warning",
    needsAction: true,
  },
  {
    id: "EXP-4468",
    submitter: "Meera Iyer",
    workflow: "Expense Claim",
    documentType: "Receipt",
    amount: 1150,
    submittedAt: "2026-08-17T17:20:00",
    status: "approved",
    automation: "verified",
    needsAction: false,
  },
  {
    id: "PO-7742",
    submitter: "Operations",
    workflow: "Purchase Order Request",
    documentType: "Approved Request",
    amount: 210000,
    submittedAt: "2026-08-17T15:40:00",
    status: "approved",
    automation: "verified",
    needsAction: false,
  },
  {
    id: "EXP-4462",
    submitter: "Sana Qureshi",
    workflow: "Expense Claim",
    documentType: "Receipt",
    amount: 8900,
    submittedAt: "2026-08-17T13:10:00",
    status: "rejected",
    automation: "failed",
    needsAction: true,
  },
  {
    id: "INV-8838",
    submitter: "Pioneer Textiles",
    workflow: "Invoice Submission",
    documentType: "Tax Invoice",
    amount: 54300,
    submittedAt: "2026-08-17T11:05:00",
    status: "submitted",
    automation: "pending",
    needsAction: false,
  },
]

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
}

export function formatCompactCurrency(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)} L`
  return formatCurrency(n)
}
