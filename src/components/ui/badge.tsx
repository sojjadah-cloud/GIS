import { cn } from "@/lib/utils";
import React from "react";

const colorMap: Record<string, string> = {
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
  neutral: "bg-[var(--neutral-soft)] text-[var(--neutral)]",
  primary: "bg-[var(--primary-soft)] text-[var(--primary)]",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof colorMap;
  dotColorVar?: string;
}

export function Badge({ className, tone = "neutral", dotColorVar, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-medium",
        colorMap[tone],
        className
      )}
      {...props}
    >
      {dotColorVar && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: `var(${dotColorVar})` }}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
