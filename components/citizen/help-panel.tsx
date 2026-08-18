"use client"

import { useState } from "react"
import { HelpCircle, X } from "lucide-react"

const topics = [
  {
    q: "What happens to my documents?",
    a: "Your upload is read once to fill the form. You can see every field it produced, edit any of them, and nothing is submitted until you confirm.",
  },
  {
    q: "What does the confidence percentage mean?",
    a: "It is how sure the reader is that it captured a field correctly. Anything below 85% is worth a second look before you submit — you can always correct it yourself.",
  },
  {
    q: "The reader got a field wrong.",
    a: "Type over it. The field is then marked as manually entered, so the reviewing officer can see the correction came from you.",
  },
  {
    q: "What happens after I submit?",
    a: "Your application is checked automatically, then reviewed by an officer. You are notified of the decision, and if a correction is needed you can resubmit the flagged fields only.",
  },
]

export function HelpPanel() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <HelpCircle className="size-4" aria-hidden />
        Help
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-4 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium">Help with this application</p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close help"
              className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
          <dl className="mt-3 space-y-3">
            {topics.map((t) => (
              <div key={t.q}>
                <dt className="text-xs font-medium">{t.q}</dt>
                <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
