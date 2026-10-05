import type { LucideIcon } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { KpiCardSkeleton } from "@/components/ui/skeleton";
import { IconBadge, type IconBadgeTone } from "@/components/ui/icon-badge";

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
  tone?: IconBadgeTone;
  loading?: boolean;
}) {
  if (loading) return <KpiCardSkeleton />;

  return (
    <Card className="hover-lift">
      <CardBody className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1.5 text-xs font-medium leading-snug text-[var(--text-secondary)]">{label}</p>
          <p className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{value}</p>
        </div>
        {Icon && <IconBadge icon={Icon} tone={tone} />}
      </CardBody>
    </Card>
  );
}
