import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Brand } from "@/components/brand"
import { CitizenWorkflow } from "@/components/citizen/citizen-workflow"
import { HelpPanel } from "@/components/citizen/help-panel"

export default function CitizenPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
          <Brand />
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="hidden items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              <ArrowLeft className="size-4" />
              Exit
            </Link>
            <HelpPanel />
          </div>
        </div>
      </header>

      <main className="px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-accent-foreground">Government · Citizen</p>
          <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            Apply for a government service
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-pretty text-muted-foreground">
            A guided, six-step flow. Scan, select, upload — and let AI do the paperwork while you stay in control.
          </p>
        </div>
        <CitizenWorkflow />
      </main>
    </div>
  )
}
