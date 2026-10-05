import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/card";
import { Droplet, Waves, Cpu, Trees } from "lucide-react";

interface RecSection {
  heading: string;
  subheading: string;
  items: { title: string; body: string }[];
}

const sectionIcons = [Droplet, Waves, Cpu, Trees];

export default function RecommendedPage() {
  const t = useTranslations("recommended");
  const sections = t.raw("sections") as RecSection[];

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 lg:px-8">
      <h1 className="mb-3 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">{t("title")}</h1>
      <p className="mb-12 max-w-2xl text-[15px] leading-relaxed text-[var(--text-secondary)]">{t("intro")}</p>

      <div className="space-y-10">
        {sections.map((section, i) => {
          const Icon = sectionIcons[i % sectionIcons.length];
          return (
            <section key={section.heading}>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary-soft)] text-[var(--primary)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">{section.heading}</h2>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                    {section.subheading}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {section.items.map((item) => (
                  <Card key={item.title}>
                    <CardBody>
                      <h3 className="mb-1.5 text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.body}</p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-12 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-secondary)] p-6 lg:p-8">
        <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">{t("caseStudyHeading")}</h2>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{t("caseStudyBody")}</p>
      </section>
    </div>
  );
}
