"use client"

import { useEffect, useRef, useState } from "react"
import { HelpCircle, X, Send, Loader2, Sparkles } from "lucide-react"
import { sendChatMessage, ApiError } from "@/lib/api"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  text: string
}

/** Starter questions, so the panel is useful before the user types anything. */
const suggestions = [
  "What documents do I need for a birth certificate?",
  "What does the confidence percentage mean?",
  "How long does approval take?",
]

export function HelpPanel() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight })
  }, [messages, pending])

  async function ask(question: string) {
    const text = question.trim()
    if (!text || pending) return

    setMessages((prev) => [...prev, { role: "user", text }])
    setInput("")
    setPending(true)
    setError(null)

    try {
      const reply = await sendChatMessage(text)
      setMessages((prev) => [...prev, { role: "assistant", text: reply }])
    } catch (err) {
      setError(
        err instanceof ApiError && err.kind === "rate-limit"
          ? "The assistant is busy right now. Please wait a few seconds and ask again."
          : err instanceof ApiError && err.kind === "offline"
            ? "Can't reach the assistant. Check your connection and try again."
            : "The assistant couldn't answer that. Please try again.",
      )
    } finally {
      setPending(false)
    }
  }

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
        <div className="absolute right-0 z-30 mt-3 flex h-[28rem] w-[min(24rem,calc(100vw-2rem))] flex-col rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-start justify-between gap-3 border-b border-border p-4">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Sparkles className="size-3.5 text-accent" aria-hidden />
                UnifiOps Assistant
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Answers are AI-generated — check anything official against your department.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close help"
              className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>

          <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Try asking:</p>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="block w-full rounded-lg border border-border bg-background p-2.5 text-left text-xs transition-colors hover:border-accent/50 hover:bg-accent/5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {m.text}
              </div>
            ))}

            {pending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Thinking…
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-lg bg-warning/10 p-2.5 text-xs text-warning-foreground">
                {error}
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              ask(input)
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <label htmlFor="help-input" className="sr-only">
              Ask the assistant a question
            </label>
            <input
              id="help-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Send question"
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
            >
              <Send className="size-3.5" aria-hidden />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
