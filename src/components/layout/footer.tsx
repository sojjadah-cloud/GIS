import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("common");
  return (
    <footer className="border-t border-[var(--border)] px-4 py-5 text-center text-xs text-[var(--text-tertiary)] lg:px-6">
      {t("footer", { year: new Date().getFullYear() })}
    </footer>
  );
}
