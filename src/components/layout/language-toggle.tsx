"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextLocale = locale === "en" ? "ar" : "en";
  const query = searchParams.toString();

  return (
    <button
      onClick={() => router.replace(`${pathname}${query ? `?${query}` : ""}`, { locale: nextLocale })}
      aria-label={t("language")}
      className="flex h-9 items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
    >
      <Languages className="h-4 w-4" />
      <span>{nextLocale === "ar" ? "العربية" : "English"}</span>
    </button>
  );
}
