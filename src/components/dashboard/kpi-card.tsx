import type { LucideIcon } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { KpiCardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const toneClasses = {
  primary: "bg-[var(--primary-soft)] text-[var(--primary)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
  neutral: "bg-[var(--neutral-soft)] text-[var(--neutral)]",
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  loading,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: keyof typeof toneClasses;
  loading?: boolean;
}) {
  if (loading) return <KpiCardSkeleton />;

  return (
    <Card>
      <CardBody className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1.5 text-xs font-medium leading-snug text-[var(--text-secondary)]">{label}</p>
          <p className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{value}</p>
        </div>
        {Icon && (
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)]", toneClasses[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </CardBody>
    </Card>
  );
}
