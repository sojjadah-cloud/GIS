import { Sparkle } from "lucide-react";
import type { Insight } from "@/lib/insights";

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-secondary)] p-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
        <Sparkle className="h-3.5 w-3.5" />
      </span>
      <p className="text-sm leading-relaxed text-[var(--text-primary)]">{insight.text}</p>
    </div>
  );
}
