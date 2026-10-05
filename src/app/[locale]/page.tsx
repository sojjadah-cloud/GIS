import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Droplets, Gauge, Timer, Waves, TriangleAlert, Building2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { IconBadge } from "@/components/ui/icon-badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function HomePage() {
  const t = useTranslations("home");

  const rainfallIcons = [Droplets, Gauge, Timer, Waves, Droplets];
  const riskIcons = [TriangleAlert, Building2, TriangleAlert, Building2];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface)]">
        <div
          className="pointer-events-none absolute -start-24 -top-32 h-[420px] w-[420px] rounded-full opacity-40 blur-[90px]"
          style={{ background: "var(--primary-soft)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -end-32 top-10 h-[360px] w-[360px] rounded-full opacity-30 blur-[100px]"
          style={{ background: "var(--chart-2)" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.3] [background-image:radial-gradient(var(--border-strong)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
          aria-hidden
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-[1600px] px-4 py-16 sm:py-20 lg:px-8 lg:py-28">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
            {t("heroSubtitle")}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>
          <div className="mt-8">
            <Link href="/map" className={buttonVariants({ variant: "primary", size: "lg" })}>
              {t("viewMapCta")}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1100px] px-4 py-12 lg:px-8">
        {/* Section 1 */}
        <ScrollReveal>
          <section className="mb-14">
            <h2 className="mb-4 text-2xl font-semibold text-[var(--text-primary)]">{t("section1Heading")}</h2>
            <p className="mb-3 text-[15px] leading-relaxed text-[var(--text-secondary)]">{t("section1Body1")}</p>
            <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">{t("section1Body2")}</p>
          </section>
        </ScrollReveal>

        {/* Key results */}
        <ScrollReveal>
          <section className="mb-14 grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">{t("keyResultsHeading")}</h2>
              <p className="mb-4 text-[15px] text-[var(--text-secondary)]">{t("keyResultsIntro")}</p>
              <ul className="mb-4 space-y-2">
                {t.raw("keyResultsList").map((item: string) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[var(--text-tertiary)]">{t("keyResultsNote")}</p>
            </div>
            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">{t("characteristicsHeading")}</h2>
              <ul className="mb-4 space-y-2">
                {t.raw("characteristicsList").map((item: string) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--danger)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[var(--text-tertiary)]">{t("characteristicsNote")}</p>
            </div>
          </section>
        </ScrollReveal>

        {/* Impacts + planning */}
        <ScrollReveal>
          <section className="mb-14 grid gap-6 sm:grid-cols-2">
            <Card className="hover-lift">
              <CardBody>
                <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">{t("impactsHeading")}</h2>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{t("impactsBody")}</p>
              </CardBody>
            </Card>
            <Card className="hover-lift">
              <CardBody>
                <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">{t("planningHeading")}</h2>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{t("planningBody")}</p>
              </CardBody>
            </Card>
          </section>
        </ScrollReveal>

        {/* Study area */}
        <ScrollReveal>
          <section className="mb-14">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
              {t("studyAreaHeading")}
            </p>
            <h2 className="mb-6 text-2xl font-semibold text-[var(--text-primary)]">{t("rainfallHeading")}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {t.raw("rainfallList").map((item: string, i: number) => {
                const Icon = rainfallIcons[i % rainfallIcons.length];
                return (
                  <Card key={item} className="hover-lift">
                    <CardBody className="flex items-start gap-3">
                      <IconBadge icon={Icon} tone="info" />
                      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item}</p>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </section>
        </ScrollReveal>

        {/* Risk cities */}
        <ScrollReveal>
          <section className="mb-4">
            <h2 className="mb-6 text-2xl font-semibold text-[var(--text-primary)]">{t("riskCitiesHeading")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {t.raw("riskCitiesList").map((item: string, i: number) => {
                const Icon = riskIcons[i % riskIcons.length];
                return (
                  <Card key={item} className="hover-lift">
                    <CardBody className="flex items-start gap-3">
                      <IconBadge icon={Icon} tone="warning" />
                      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item}</p>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
