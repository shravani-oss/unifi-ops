import Link from "next/link"
import {
  ArrowRight,
  Landmark,
  Building2,
  ScanLine,
  ClipboardCheck,
  LayoutDashboard,
  ShieldCheck,
  Eye,
  Layers,
  Zap,
} from "lucide-react"
import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { PipelineFlow } from "@/components/pipeline-flow"
import { cn } from "@/lib/utils"

const governmentRoles = [
  {
    icon: ScanLine,
    role: "Citizen",
    desc: "Scan a department QR, pick a service, upload documents and let AI auto-fill your forms.",
    href: "/government/citizen",
  },
  {
    icon: ClipboardCheck,
    role: "Employee",
    desc: "Human-in-the-loop verification workspace with AI confidence scores on every check.",
    href: "/government/employee",
  },
  {
    icon: LayoutDashboard,
    role: "Admin",
    desc: "Operational monitoring across departments, services and the full request lifecycle.",
    href: "/government/admin",
  },
]

const businessRoles = [
  {
    icon: ClipboardCheck,
    role: "Employee",
    desc: "Extract, validate and verify vendor, invoice and contract documents with AI assistance.",
    href: "/business/employee",
  },
  {
    icon: LayoutDashboard,
    role: "Admin",
    desc: "Monitor throughput, exceptions and analytics across teams and document workflows.",
    href: "/business/admin",
  },
]

const trustPoints = [
  {
    icon: Eye,
    title: "Transparent by design",
    desc: "Every field is labelled AI-extracted, manual, derived or missing — nothing is hidden.",
  },
  {
    icon: ShieldCheck,
    title: "Human oversight",
    desc: "AI assists, but people make the final decision. Approvals, corrections and rejections stay in human hands.",
  },
  {
    icon: Layers,
    title: "Configurable platform",
    desc: "One engine for many departments, organisations, forms and workflows — government or business.",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-svh">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Brand />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#sectors" className="transition-colors hover:text-foreground">Sectors</a>
            <a href="#trust" className="transition-colors hover:text-foreground">Trust</a>
          </nav>
          <Button size="sm" nativeButton={false} render={<Link href="#sectors" />}>
            Launch platform
            <ArrowRight />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/50 px-3 py-1 text-xs font-medium text-sidebar-foreground/80">
              <Zap className="size-3.5 text-sidebar-primary" />
              Smart Automation · Document-to-Action
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Turn documents into decisions, with humans in control.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-sidebar-foreground/70 md:text-lg">
              UnifiOps is a configurable, AI-powered platform that reads documents, populates forms, validates
              against rules and routes them to people for verification — across government and business operations.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="default" nativeButton={false} render={<Link href="#sectors" />} className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
                Choose your workspace
                <ArrowRight />
              </Button>
              <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/government/citizen" />} className="border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground">
                Try the citizen flow
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section id="how" className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent-foreground">The flow</p>
            <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              One transparent pipeline, end to end
            </h2>
          </div>
          <PipelineFlow />
        </div>
      </section>

      {/* Sectors */}
      <section id="sectors" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            Start with Smart Automation
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
            Pick a sector, then choose your role. The same engine powers every workspace.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectorCard
            icon={Landmark}
            sector="Government Sector"
            tagline="Citizen · Employee · Admin"
            roles={governmentRoles}
            tone="primary"
          />
          <SectorCard
            icon={Building2}
            sector="Business"
            tagline="Employee · Admin"
            roles={businessRoles}
            tone="accent"
          />
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              AI you can audit, oversight you can trust
            </h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              Automation should be accountable. UnifiOps keeps every extraction, check and decision visible and
              reversible.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {trustPoints.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="rounded-xl border border-border bg-card p-6">
                  <div className="grid size-10 place-items-center rounded-lg bg-primary/8 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:px-6">
          <Brand />
          <p>Unified Operations Platform — configurable document-to-action automation.</p>
        </div>
      </footer>
    </div>
  )
}

function SectorCard({
  icon: Icon,
  sector,
  tagline,
  roles,
  tone,
}: {
  icon: typeof Landmark
  sector: string
  tagline: string
  roles: { icon: typeof ScanLine; role: string; desc: string; href: string }[]
  tone: "primary" | "accent"
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "grid size-11 place-items-center rounded-xl",
            tone === "primary" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground",
          )}
        >
          <Icon className="size-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{sector}</h3>
          <p className="text-sm text-muted-foreground">{tagline}</p>
        </div>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-2">
        {roles.map((r) => {
          const RoleIcon = r.icon
          return (
            <li key={r.role}>
              <Link
                href={r.href}
                className="group flex items-start gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-accent/50 hover:bg-accent/5"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground/70 group-hover:bg-accent/15 group-hover:text-accent-foreground">
                  <RoleIcon className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{r.role}</span>
                    <ArrowRight className="size-3.5 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
