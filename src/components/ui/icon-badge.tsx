import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconBadgeTone = "primary" | "info" | "warning" | "danger" | "success" | "neutral";

const toneGradients: Record<IconBadgeTone, string> = {
  primary: "linear-gradient(135deg, var(--primary-soft), color-mix(in srgb, var(--primary-soft) 40%, transparent))",
  info: "linear-gradient(135deg, var(--info-soft), color-mix(in srgb, var(--info-soft) 40%, transparent))",
  warning: "linear-gradient(135deg, var(--warning-soft), color-mix(in srgb, var(--warning-soft) 40%, transparent))",
  danger: "linear-gradient(135deg, var(--danger-soft), color-mix(in srgb, var(--danger-soft) 40%, transparent))",
  success: "linear-gradient(135deg, var(--success-soft), color-mix(in srgb, var(--success-soft) 40%, transparent))",
  neutral: "linear-gradient(135deg, var(--neutral-soft), color-mix(in srgb, var(--neutral-soft) 40%, transparent))",
};

const toneText: Record<IconBadgeTone, string> = {
  primary: "text-[var(--primary)]",
  info: "text-[var(--info)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
  success: "text-[var(--success)]",
  neutral: "text-[var(--neutral)]",
};

export function IconBadge({
  icon: Icon,
  tone = "primary",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone?: IconBadgeTone;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = { sm: "h-9 w-9", md: "h-10 w-10", lg: "h-12 w-12" }[size];
  const iconSizeClasses = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" }[size];

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)]",
        sizeClasses,
        toneText[tone],
        className
      )}
      style={{ background: toneGradients[tone] }}
    >
      <Icon className={iconSizeClasses} aria-hidden />
    </span>
  );
}
