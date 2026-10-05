"use client";

import { NavList } from "./nav-list";
import { useUIStore } from "@/store/ui-store";
import { PanelLeftClose, PanelLeftOpen, Waves } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const t = useTranslations("meta");
  const common = useTranslations("common");

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-e border-[var(--border)] bg-[var(--surface)] transition-[width] duration-200 lg:flex",
        collapsed ? "w-[76px]" : "w-[260px]"
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-[var(--border)] px-4">
        <Link href="/" aria-label={common("goHome")} className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary-soft)] text-[var(--primary)]">
            <Waves className="h-5 w-5" aria-hidden />
          </span>
          {!collapsed && <span className="truncate text-base font-semibold text-[var(--text-primary)]">{t("siteName")}</span>}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavList collapsed={collapsed} />
      </div>

      <div className="border-t border-[var(--border)] p-3">
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
        >
          {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
