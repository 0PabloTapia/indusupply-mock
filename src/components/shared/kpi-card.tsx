import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "default" | "brand" | "success" | "warning" | "danger";

const toneStyles: Record<Tone, string> = {
  default: "border-border bg-card",
  brand: "border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card",
  success: "border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-card",
  warning: "border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-card",
  danger: "border-red-500/25 bg-gradient-to-br from-red-500/10 to-card",
};

const iconStyles: Record<Tone, string> = {
  default: "bg-muted text-muted-foreground",
  brand: "bg-primary/15 text-primary",
  success: "bg-emerald-500/15 text-emerald-700",
  warning: "bg-amber-500/15 text-amber-700",
  danger: "bg-red-500/15 text-red-700",
};

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md",
        toneStyles[tone],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", iconStyles[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
