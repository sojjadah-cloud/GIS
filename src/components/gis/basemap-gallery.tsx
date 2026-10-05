"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BasemapId } from "@/components/map/arcgis-map-view";

const BASEMAPS: { id: BasemapId; labelKey: string; swatch: string }[] = [
  { id: "gray-vector", labelKey: "light", swatch: "linear-gradient(135deg,#e4e7ec,#f6f8fb)" },
  { id: "dark-gray-vector", labelKey: "dark", swatch: "linear-gradient(135deg,#1b2434,#0b1017)" },
  { id: "satellite", labelKey: "satellite", swatch: "linear-gradient(135deg,#5b6b3f,#2f3a26)" },
  { id: "topo-vector", labelKey: "terrain", swatch: "linear-gradient(135deg,#d9c9a0,#8a7a52)" },
];

export function BasemapGallery({
  value,
  onChange,
  labels,
}: {
  value: BasemapId;
  onChange: (id: BasemapId) => void;
  labels: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {BASEMAPS.map((bm) => {
        const active = bm.id === value;
        return (
          <button
            key={bm.id}
            onClick={() => onChange(bm.id)}
            className={cn(
              "relative flex flex-col items-center gap-1.5 rounded-[var(--radius-sm)] border p-1.5 text-xs transition-colors",
              active ? "border-[var(--primary)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"
            )}
          >
            <span
              className="h-12 w-full rounded-[4px]"
              style={{ background: bm.swatch }}
              aria-hidden
            />
            <span className="text-[var(--text-primary)]">{labels[bm.labelKey]}</span>
            {active && (
              <span className="absolute end-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--on-primary)]">
                <Check className="h-2.5 w-2.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
