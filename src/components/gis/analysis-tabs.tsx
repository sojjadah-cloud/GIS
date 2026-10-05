"use client";

import { cn } from "@/lib/utils";

export interface AnalysisTab {
  id: string;
  label: string;
  badge?: number;
}

export function AnalysisTabs({
  tabs,
  activeId,
  onChange,
}: {
  tabs: AnalysisTab[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="tablist" className="flex shrink-0 border-b border-[var(--border)]">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 px-2 py-3 text-sm font-medium transition-colors",
              active ? "text-[var(--primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {tab.label}
            {!!tab.badge && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--primary-soft)] px-1 text-[10px] text-[var(--primary)]">
                {tab.badge}
              </span>
            )}
            {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--primary)]" />}
          </button>
        );
      })}
    </div>
  );
}
