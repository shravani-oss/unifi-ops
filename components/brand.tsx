import Link from "next/link"
import { cn } from "@/lib/utils"

export function Brand({
  className,
  href = "/",
  variant = "dark",
}: {
  className?: string
  href?: string
  variant?: "dark" | "light"
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg font-mono text-sm font-bold shadow-sm",
          variant === "dark" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground",
        )}
        aria-hidden
      >
        U
      </span>
      <span
        className={cn(
          "text-[15px] font-semibold tracking-tight",
          variant === "dark" ? "text-foreground" : "text-sidebar-foreground",
        )}
      >
        Unifi<span className={variant === "dark" ? "text-accent-foreground" : "text-sidebar-primary"}>Ops</span>
      </span>
    </Link>
  )
}
