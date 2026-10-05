import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/card";
import { Target, Compass } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="mx-auto max-w-[900px] px-4 py-14 lg:px-8">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
        {t("title")}
      </p>
      <h1 className="mb-6 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">{t("tagline")}</h1>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardBody>
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary-soft)] text-[var(--primary)]">
              <Compass className="h-5 w-5" />
            </span>
            <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">{t("visionHeading")}</h2>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{t("visionBody")}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--info-soft)] text-[var(--info)]">
              <Target className="h-5 w-5" />
            </span>
            <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">{t("missionHeading")}</h2>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{t("missionBody")}</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
