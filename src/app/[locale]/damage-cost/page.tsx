import { useTranslations } from "next-intl";
import { Banknote, Building2, TrendingDown, ShieldCheck } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function DamageCostPage() {
  const t = useTranslations("damageCost");

  const stats = [
    { label: t("stat1Label"), value: t("stat1Value"), icon: Banknote, tone: "danger" as const },
    { label: t("stat2Label"), value: t("stat2Value"), icon: Building2, tone: "info" as const },
    { label: t("stat3Label"), value: t("stat3Value"), icon: TrendingDown, tone: "warning" as const },
    { label: t("stat4Label"), value: t("stat4Value"), icon: ShieldCheck, tone: "success" as const },
  ];

  return (
    <div className="relative mx-auto max-w-[1100px] overflow-hidden px-4 py-14 lg:px-8">
      <div
        className="pointer-events-none absolute -start-24 -top-24 h-80 w-80 rounded-full opacity-25 blur-[90px]"
        style={{ background: "var(--danger-soft)" }}
        aria-hidden
      />
      <h1 className="relative mb-10 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">{t("title")}</h1>

      <ScrollReveal>
        <div className="relative mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <KpiCard key={s.label} label={s.label} value={s.value} icon={s.icon} tone={s.tone} />
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={80}>
        <div className="relative space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">{t("savingsHeading")}</h2>
            <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">{t("savingsBody")}</p>
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">{t("exposureHeading")}</h2>
            <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">{t("exposureBody")}</p>
          </section>
        </div>
      </ScrollReveal>
    </div>
  );
}
