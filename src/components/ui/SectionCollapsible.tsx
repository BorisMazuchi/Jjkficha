import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionCollapsibleProps {
  title: string
  children: React.ReactNode
  /** Em telas md e maiores, a seção fica sempre expandida. Em mobile, colapsável. */
  defaultOpen?: boolean
  className?: string
}

export function SectionCollapsible({
  title,
  children,
  defaultOpen = false,
  className,
}: SectionCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={cn("rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-2 px-4 py-3 text-left md:cursor-default md:py-2",
          "min-h-[44px] touch-manipulation"
        )}
        aria-expanded={open}
      >
        <span className="section-title text-[var(--color-accent-cyan)]">{title}</span>
        <span className="block shrink-0 md:hidden">
          {open ? (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-slate-400" />
          )}
        </span>
      </button>
      <div
        className={cn(
          "border-t border-[var(--color-border)] px-4 py-4",
          "max-md:overflow-hidden max-md:transition-[max-height] max-md:duration-200",
          "md:!max-h-none",
          open ? "max-md:max-h-[3000px]" : "max-md:max-h-0 max-md:py-0"
        )}
      >
        {children}
      </div>
    </div>
  )
}
