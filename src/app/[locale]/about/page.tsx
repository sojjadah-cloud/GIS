import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/card";
import { IconBadge } from "@/components/ui/icon-badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Target, Compass } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="relative mx-auto max-w-[900px] overflow-hidden px-4 py-14 lg:px-8">
      <div
        className="pointer-events-none absolute -end-20 -top-20 h-80 w-80 rounded-full opacity-30 blur-[90px]"
        style={{ background: "var(--primary-soft)" }}
        aria-hidden
      />
      <ScrollReveal>
        <p className="relative mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
          {t("title")}
        </p>
        <h1 className="relative mb-6 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">{t("tagline")}</h1>
      </ScrollReveal>

      <ScrollReveal delayMs={80}>
        <div className="relative grid gap-6 sm:grid-cols-2">
          <Card className="hover-lift">
            <CardBody>
              <IconBadge icon={Compass} tone="primary" className="mb-3" />
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">{t("visionHeading")}</h2>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{t("visionBody")}</p>
            </CardBody>
          </Card>
          <Card className="hover-lift">
            <CardBody>
              <IconBadge icon={Target} tone="info" className="mb-3" />
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">{t("missionHeading")}</h2>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{t("missionBody")}</p>
            </CardBody>
          </Card>
        </div>
      </ScrollReveal>
    </div>
  );
}
