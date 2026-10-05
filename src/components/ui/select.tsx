import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 pe-9 text-sm text-[var(--text-primary)] focus-visible:outline-none",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
    </div>
  )
);
Select.displayName = "Select";
