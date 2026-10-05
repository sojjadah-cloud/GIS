"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalysisTabs, type AnalysisTab } from "./analysis-tabs";

export function MobileAnalysisDrawer({
  tabs,
  activeId,
  onChangeTab,
  expanded,
  onToggleExpanded,
  peek,
  children,
}: {
  tabs: AnalysisTab[];
  activeId: string;
  onChangeTab: (id: string) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
  peek?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-[var(--radius-lg)] border-t border-[var(--border)] bg-[var(--surface)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-[height] duration-200 ease-out lg:hidden",
        expanded ? "h-[70%]" : "h-[132px]"
      )}
    >
      <button
        onClick={onToggleExpanded}
        className="flex shrink-0 items-center justify-center gap-2 py-2 text-[var(--text-tertiary)]"
        aria-expanded={expanded}
      >
        <span className="h-1 w-9 rounded-full bg-[var(--border-strong)]" aria-hidden />
      </button>

      {!expanded && peek && <div className="px-4 pb-2">{peek}</div>}

      <AnalysisTabs tabs={tabs} activeId={activeId} onChange={(id) => { onChangeTab(id); if (!expanded) onToggleExpanded(); }} />

      {expanded && <div className="flex-1 overflow-y-auto">{children}</div>}

      <button
        onClick={onToggleExpanded}
        aria-label={expanded ? "Collapse" : "Expand"}
        className="absolute end-3 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[var(--text-secondary)]"
      >
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>
    </div>
  );
}
