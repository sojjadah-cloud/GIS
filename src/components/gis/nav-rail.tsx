"use client";

import type { LucideIcon } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface RailTool {
  id: string;
  icon: LucideIcon;
  label: string;
  toggled?: boolean;
}

export function NavRail({
  tools,
  activeId,
  onSelect,
}: {
  tools: RailTool[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex w-14 shrink-0 flex-col items-center gap-1 border-e border-[var(--border)] bg-[var(--surface)] py-3">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = tool.id === activeId || tool.toggled;
        return (
          <Tooltip key={tool.id} label={tool.label} side="bottom">
            <button
              onClick={() => onSelect(tool.id)}
              aria-label={tool.label}
              aria-pressed={isActive}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] transition-colors",
                isActive
                  ? "bg-[var(--primary)] text-[var(--on-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
