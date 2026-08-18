/** Client-side CSV export — no backend required. */
export interface CsvColumn<T> {
  key: string
  label: string
  value: (row: T) => string | number
}

function escapeCell(value: string | number): string {
  const text = String(value ?? "")
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const header = columns.map((c) => escapeCell(c.label)).join(",")
  const body = rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(","))
  return [header, ...body].join("\n")
}

export function downloadCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]): void {
  const blob = new Blob([toCsv(columns, rows)], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
