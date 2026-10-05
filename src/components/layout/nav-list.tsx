"use client";

import { navItems } from "@/config/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function NavList({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label={t("home")}>
      {navItems.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? t(item.labelKey) : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium outline-none transition-colors",
              "hover:bg-[var(--surface-secondary)] focus-visible:bg-[var(--surface-secondary)]",
              active
                ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
            {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
            {active && !collapsed && (
              <span className="ms-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
