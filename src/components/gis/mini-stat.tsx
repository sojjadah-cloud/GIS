import type { LucideIcon } from "lucide-react";

export function MiniStat({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden />
      <div className="min-w-0">
        <p className="text-base font-bold leading-none tabular-nums text-[var(--text-primary)]">{value}</p>
        <p className="mt-0.5 truncate text-[11px] text-[var(--text-secondary)]">{label}</p>
      </div>
    </div>
  );
}
