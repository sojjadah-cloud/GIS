"use client";

import { useState } from "react";
import type { ManagedLayer } from "@/components/map/arcgis-map-view";

export function LayerManagerPanel({ layers }: { layers: ManagedLayer[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(layers.map((l) => [l.id, l.visible]))
  );

  if (layers.length === 0) {
    return <p className="text-xs text-[var(--text-tertiary)]">—</p>;
  }

  return (
    <ul className="space-y-0.5">
      {layers.map((layer) => (
        <li key={layer.id}>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-1.5 py-1.5 text-sm hover:bg-[var(--surface-secondary)]">
            <input
              type="checkbox"
              checked={checked[layer.id] ?? layer.visible}
              onChange={(e) => {
                layer.setVisible(e.target.checked);
                setChecked((c) => ({ ...c, [layer.id]: e.target.checked }));
              }}
              className="h-4 w-4 shrink-0 accent-[var(--primary)]"
            />
            <span className="truncate text-[var(--text-primary)]">{layer.title}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
