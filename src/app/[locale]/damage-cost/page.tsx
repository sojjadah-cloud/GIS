import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/card";
import { Banknote, Building2, TrendingDown, ShieldCheck } from "lucide-react";

export default function DamageCostPage() {
  const t = useTranslations("damageCost");

  const stats = [
    { label: t("stat1Label"), value: t("stat1Value"), icon: Banknote, tone: "danger" as const },
    { label: t("stat2Label"), value: t("stat2Value"), icon: Building2, tone: "info" as const },
    { label: t("stat3Label"), value: t("stat3Value"), icon: TrendingDown, tone: "warning" as const },
    { label: t("stat4Label"), value: t("stat4Value"), icon: ShieldCheck, tone: "success" as const },
  ];

  const toneClasses = {
    danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
    info: "bg-[var(--info-soft)] text-[var(--info)]",
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
    success: "bg-[var(--success-soft)] text-[var(--success)]",
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 lg:px-8">
      <h1 className="mb-10 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">{t("title")}</h1>

      <div className="mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardBody>
              <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] ${toneClasses[s.tone]}`}>
                <s.icon className="h-4 w-4" />
              </span>
              <p className="mb-1 text-xl font-bold text-[var(--text-primary)] sm:text-2xl">{s.value}</p>
              <p className="text-xs leading-snug text-[var(--text-secondary)]">{s.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">{t("savingsHeading")}</h2>
          <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">{t("savingsBody")}</p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">{t("exposureHeading")}</h2>
          <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">{t("exposureBody")}</p>
        </section>
      </div>
    </div>
  );
}
