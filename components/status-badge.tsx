import { Badge } from "@/components/ui/badge"
import type { MintStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: MintStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    live: {
      label: "Live",
      className: "bg-[var(--accent-tertiary)]/20 text-[var(--accent-tertiary)] border-[var(--accent-tertiary)]/50",
    },
    upcoming: {
      label: "Upcoming",
      className: "bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)] border-[var(--accent-secondary)]/50",
    },
    ended: {
      label: "Ended",
      className: "bg-[var(--muted2)]/20 text-[var(--muted)] border-[var(--border)]",
    },
  }

  const { label, className } = config[status]

  return <Badge className={`${className} backdrop-blur-sm font-semibold`}>{label}</Badge>
}
