"use client";

import { Menu, Waves } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { navItems } from "@/config/navigation";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { useUIStore } from "@/store/ui-store";
import { Link } from "@/i18n/navigation";

export function Header() {
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const pathname = usePathname();
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);

  const current = navItems.find((item) =>
    item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/80 lg:px-6">
      <button
        onClick={() => setMobileNavOpen(true)}
        aria-label={common("menu")}
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label={common("goHome")}>
        <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary-soft)] text-[var(--primary)]">
          <Waves className="h-4 w-4" />
        </span>
      </Link>

      <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-[var(--text-primary)]">
        {current ? t(current.labelKey) : ""}
      </h1>

      <div className="flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
