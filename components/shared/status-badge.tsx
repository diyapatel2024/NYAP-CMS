import { Badge } from "@/components/ui/badge"

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  inactive: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  processing: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
}

export function StatusBadge({ status }: { status: string }) {
  const colorClass = statusColors[status.toLowerCase()] || statusColors.pending
  return (
    <Badge variant="secondary" className={colorClass}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
