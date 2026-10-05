"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ExternalLink, LayoutDashboard } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { SURVEY123_FORM_URL } from "@/config/gis";

export default function SurveyPage() {
  const t = useTranslations("survey");
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex h-[calc(100dvh-4rem-57px)] flex-col lg:h-[calc(100dvh-4rem-45px)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-4 lg:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-[var(--text-primary)]">{t("title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">{t("intro")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/survey-dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <LayoutDashboard className="h-4 w-4" />
            {t("viewDashboard")}
          </Link>
          <a
            href={SURVEY123_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            <ExternalLink className="h-4 w-4" />
            {t("openFullForm")}
          </a>
        </div>
      </div>

      <div className="relative flex-1 bg-[var(--surface-secondary)]">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <Skeleton className="h-full w-full max-w-2xl" />
          </div>
        )}
        <iframe
          title={t("title")}
          src={SURVEY123_FORM_URL}
          className="h-full w-full border-0"
          onLoad={() => setLoaded(true)}
          allow="geolocation"
        />
      </div>
    </div>
  );
}
