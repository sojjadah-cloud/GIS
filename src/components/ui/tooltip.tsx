"use client";

import { cloneElement, useId, useState } from "react";
import { cn } from "@/lib/utils";

export function Tooltip({
  label,
  children,
  side = "top",
}: {
  label: string;
  children: React.ReactElement;
  side?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {cloneElement(children, { "aria-describedby": id } as Record<string, unknown>)}
      <span
        role="tooltip"
        id={id}
        className={cn(
          "pointer-events-none absolute start-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] bg-[var(--text-primary)] px-2 py-1 text-xs text-[var(--surface)] transition-opacity",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          open ? "opacity-100" : "opacity-0"
        )}
      >
        {label}
      </span>
    </span>
  );
}
