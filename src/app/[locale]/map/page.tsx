"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { MapView } from "@/components/map/map-view";
import { WEBMAP_BOWSHER_ID, PLOT_PLAN_FEATURE_SERVICE_URL, PLOT_PLAN_LAYER_ID, PLOT_PLAN_SEARCH_FIELD } from "@/config/gis";
import { queryFeatures, geometryCentroid } from "@/services/arcgis/query";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MapPage() {
  const t = useTranslations("map");
  const common = useTranslations("common");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setNotFound(false);
    try {
      const results = await queryFeatures(PLOT_PLAN_FEATURE_SERVICE_URL, PLOT_PLAN_LAYER_ID, {
        where: `UPPER(${PLOT_PLAN_SEARCH_FIELD}) LIKE UPPER('%${query.trim().replace(/'/g, "''")}%')`,
        returnGeometry: true,
        resultRecordCount: 1,
        outSR: 4326,
      });
      const centroid = geometryCentroid(results[0]?.geometry);
      if (centroid) {
        setFocusPoint(centroid);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-4rem-45px)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 lg:px-6">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">{t("title")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-10 w-48 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] ps-9 pe-3 text-sm text-[var(--text-primary)] focus-visible:outline-none sm:w-64"
            />
          </div>
          <button type="submit" className={cn(buttonVariants({ variant: "primary", size: "md" }))} disabled={searching}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : common("search")}
          </button>
        </form>
      </div>
      {notFound && (
        <p className="border-b border-[var(--border)] bg-[var(--warning-soft)] px-4 py-2 text-sm text-[var(--warning)] lg:px-6">
          {t("noPlotFound")}
        </p>
      )}
      <div className="flex-1">
        <MapView webmapId={WEBMAP_BOWSHER_ID} heightClassName="h-full" focusPoint={focusPoint} />
      </div>
    </div>
  );
}
