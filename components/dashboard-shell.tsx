"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  ChevronRight,
  LogOut,
  Search,
  LayoutDashboard,
  ClipboardCheck,
  ScanLine,
  Building2,
  Landmark,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Brand } from "@/components/brand"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV: Record<"government" | "business", NavGroup[]> = {
  government: [
    {
      label: "Government",
      items: [
        { label: "Citizen Services", href: "/government/citizen", icon: ScanLine },
        { label: "Verification Desk", href: "/government/employee", icon: ClipboardCheck },
        { label: "Operations", href: "/government/admin", icon: LayoutDashboard },
      ],
    },
    {
      label: "Platform",
      items: [
        { label: "Switch to Business", href: "/business/admin", icon: Building2 },
        { label: "Back to Home", href: "/", icon: Landmark },
      ],
    },
  ],
  business: [
    {
      label: "Business",
      items: [
        { label: "Automations", href: "/business/employee", icon: ScanLine },
        { label: "Operations", href: "/business/admin", icon: LayoutDashboard },
      ],
    },
    {
      label: "Platform",
      items: [
        { label: "Switch to Government", href: "/government/admin", icon: Landmark },
        { label: "Back to Home", href: "/", icon: Building2 },
      ],
    },
  ],
}

interface DashboardShellProps {
  nav: "government" | "business"
  sector: string
  role: string
  roleInitials: string
  roleName: string
  breadcrumb: string[]
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export function DashboardShell({
  nav,
  sector,
  role,
  roleInitials,
  roleName,
  breadcrumb,
  title,
  subtitle,
  actions,
  children,
}: DashboardShellProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const groups = NAV[nav]

  // Below lg the sidebar is off-canvas. Translating it off-screen still leaves
  // its links focusable, so mark the whole panel inert while it is hidden.
  const [isDesktop, setIsDesktop] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])
  const hidden = !isDesktop && !open

  // ⌘K / Ctrl+K focuses the search box belonging to the current page, if it has one.
  const [hasPageSearch, setHasPageSearch] = useState(false)
  useEffect(() => {
    setHasPageSearch(document.querySelector("[data-page-search]") !== null)
  }, [pathname])

  function focusPageSearch() {
    document.querySelector<HTMLInputElement>("[data-page-search]")?.focus()
  }

  useEffect(() => {
    if (!hasPageSearch) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        focusPageSearch()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [hasPageSearch])

  return (
    <div className="min-h-svh bg-background">
      {/* Sidebar */}
      <aside
        inert={hidden || undefined}
        aria-hidden={hidden || undefined}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Brand variant="light" />
          <button
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="border-b border-sidebar-border px-5 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50">Workspace</p>
          <p className="mt-0.5 text-sm font-medium text-sidebar-foreground">
            {sector} · {role}
          </p>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="size-4 shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3 border-t border-sidebar-border px-4 py-3">
          <div className="grid size-9 place-items-center rounded-full bg-sidebar-primary font-mono text-xs font-bold text-sidebar-primary-foreground">
            {roleInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{roleName}</p>
            <p className="truncate text-xs text-sidebar-foreground/50">{role}</p>
          </div>
          <Link
            href="/"
            className="text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground"
            aria-label="Exit workspace"
          >
            <LogOut className="size-4" />
          </Link>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-foreground/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/85 px-4 backdrop-blur-sm md:px-6">
          <button
            className="text-muted-foreground hover:text-foreground lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <nav aria-label="Breadcrumb" className="hidden md:block">
            <ol className="flex items-center gap-1.5 text-sm">
              {breadcrumb.map((crumb, i) => (
                <li key={crumb} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground/50" aria-hidden />}
                  <span className={i === breadcrumb.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}>
                    {crumb}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {hasPageSearch && (
              <button
                type="button"
                onClick={focusPageSearch}
                className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:flex"
              >
                <Search className="size-4" aria-hidden />
                <span className="pr-8">Search requests…</span>
                <kbd className="rounded border border-border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
              </button>
            )}
          </div>
        </header>

        <main className="px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-muted-foreground text-pretty">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
