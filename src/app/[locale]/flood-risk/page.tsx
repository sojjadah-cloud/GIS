"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { AlertTriangle, Building2, LandPlot } from "lucide-react";
import { AlertBanner } from "@/components/ui/alert-banner";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { PieChart } from "@/components/dashboard/charts/pie-chart";
import { BarChart } from "@/components/dashboard/charts/bar-chart";
import { GaugeChart } from "@/components/dashboard/charts/gauge-chart";
import { ChartLegend } from "@/components/dashboard/charts/chart-legend";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { MapView } from "@/components/map/map-view";
import { useAsyncData } from "@/hooks/use-async-data";
import { useChartColors } from "@/lib/chart-theme";
import { queryGroupedCounts, queryGroupedCountsMulti } from "@/services/arcgis/query";
import {
  PLOT_RISK_FEATURE_SERVICE_URL,
  PLOT_RISK_LAYER_ID,
  BUILDING_RISK_FEATURE_SERVICE_URL,
  BUILDING_RISK_LAYER_ID,
  WEBMAP_BOWSHER_ID,
} from "@/config/gis";
import { riskLevelDomain, landUseDomain, domainLabel, domainColor } from "@/config/domains";
import { formatNumber } from "@/lib/utils";

const SAFE_CODE = riskLevelDomain[0].code; // "آمن - Safe"
const HIGH_RISK_CODES = riskLevelDomain.slice(3).map((d) => d.code); // High + Very High

function buildInClause(field: string, values: string[]) {
  const escaped = values.map((v) => `'${v.replace(/'/g, "''")}'`).join(",");
  return `${field} IN (${escaped})`;
}

interface PriorityRow {
  id: string;
  landuse: string;
  riskLevel: string;
  count: number;
}

export default function FloodRiskPage() {
  const t = useTranslations("floodRisk");
  const common = useTranslations("common");
  const locale = useLocale() as "en" | "ar";
  const colors = useChartColors();
  const [focusPoint] = useState<{ x: number; y: number } | null>(null);

  const plotsState = useAsyncData(
    () => queryGroupedCounts(PLOT_RISK_FEATURE_SERVICE_URL, PLOT_RISK_LAYER_ID, "Risk_Level"),
    []
  );
  const buildingsState = useAsyncData(
    () => queryGroupedCounts(BUILDING_RISK_FEATURE_SERVICE_URL, BUILDING_RISK_LAYER_ID, "Risk_Level"),
    []
  );
  const priorityState = useAsyncData(
    () =>
      queryGroupedCountsMulti(PLOT_RISK_FEATURE_SERVICE_URL, PLOT_RISK_LAYER_ID, ["LANDUSE", "Risk_Level"], {
        where: buildInClause("Risk_Level", HIGH_RISK_CODES),
        orderByDesc: true,
        resultRecordCount: 12,
      }),
    []
  );

  const plotTotals = useMemo(() => {
    if (plotsState.status !== "success") return null;
    const total = plotsState.data.reduce((sum, d) => sum + d.count, 0);
    const safe = plotsState.data.find((d) => d.value === SAFE_CODE)?.count ?? 0;
    return { total, safe, atRisk: total - safe };
  }, [plotsState]);

  const buildingTotals = useMemo(() => {
    if (buildingsState.status !== "success") return null;
    const total = buildingsState.data.reduce((sum, d) => sum + d.count, 0);
    const safe = buildingsState.data.find((d) => d.value === SAFE_CODE)?.count ?? 0;
    return { total, safe, atRisk: total - safe };
  }, [buildingsState]);

  const plotPieData = useMemo(() => {
    if (plotsState.status !== "success") return [];
    return plotsState.data.map((d) => ({
      name: domainLabel(riskLevelDomain, d.value, locale),
      value: d.count,
      colorVar: domainColor(riskLevelDomain, d.value),
    }));
  }, [plotsState, locale]);

  const buildingBarData = useMemo(() => {
    if (buildingsState.status !== "success") return [];
    return [...buildingsState.data]
      .sort((a, b) => b.count - a.count)
      .map((d) => ({
        name: domainLabel(riskLevelDomain, d.value, locale),
        value: d.count,
        colorVar: domainColor(riskLevelDomain, d.value),
      }));
  }, [buildingsState, locale]);

  const priorityRows: PriorityRow[] = useMemo(() => {
    if (priorityState.status !== "success") return [];
    return priorityState.data.map((row, i) => ({
      id: String(i),
      landuse: domainLabel(landUseDomain, row.LANDUSE as string, locale),
      riskLevel: domainLabel(riskLevelDomain, row.Risk_Level as string, locale),
      count: Number(row.cnt),
    }));
  }, [priorityState, locale]);

  const priorityColumns: DataTableColumn<PriorityRow>[] = [
    { key: "landuse", header: t("landuse"), render: (r) => r.landuse },
    {
      key: "riskLevel",
      header: t("riskLevel"),
      render: (r) => {
        const isVeryHigh = r.riskLevel === domainLabel(riskLevelDomain, HIGH_RISK_CODES[1], locale);
        return (
          <Badge tone="danger" dotColorVar={isVeryHigh ? "--color-danger-strong" : "--color-danger"}>
            {r.riskLevel}
          </Badge>
        );
      },
    },
    { key: "count", header: common("count"), render: (r) => formatNumber(r.count, locale) },
  ];

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">{t("title")}</h1>
      </div>

      <div className="mb-6">
        <AlertBanner title={t("importantNotes")} items={t.raw("notesList")} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label={t("plotsAtRisk")}
          value={plotTotals ? formatNumber(plotTotals.atRisk, locale) : "—"}
          icon={LandPlot}
          tone="danger"
          loading={plotsState.status === "loading"}
        />
        <KpiCard
          label={t("buildingsAtRisk")}
          value={buildingTotals ? formatNumber(buildingTotals.atRisk, locale) : "—"}
          icon={Building2}
          tone="danger"
          loading={buildingsState.status === "loading"}
        />
        <ChartCard title={t("safePlots")} loading={plotsState.status === "loading"} bodyClassName="flex items-center justify-center">
          {plotTotals && <GaugeChart value={plotTotals.safe} max={plotTotals.total} color="success" height={140} />}
        </ChartCard>
        <ChartCard title={t("safeBuildings")} loading={buildingsState.status === "loading"} bodyClassName="flex items-center justify-center">
          {buildingTotals && <GaugeChart value={buildingTotals.safe} max={buildingTotals.total} color="success" height={140} />}
        </ChartCard>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title={t("plotRiskDistribution")} loading={plotsState.status === "loading"} empty={plotPieData.length === 0}>
          <PieChart data={plotPieData} />
          <ChartLegend items={plotPieData} colors={colors} />
        </ChartCard>
        <ChartCard title={t("buildingRiskDistribution")} loading={buildingsState.status === "loading"} empty={buildingBarData.length === 0}>
          <BarChart data={buildingBarData} valueLabel={common("count")} />
        </ChartCard>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <ChartCard title={common("viewMap")} bodyClassName="p-0" className="overflow-hidden">
          <MapView webmapId={WEBMAP_BOWSHER_ID} heightClassName="h-[420px]" focusPoint={focusPoint} />
        </ChartCard>
        <ChartCard
          title={t("priorityTable")}
          loading={priorityState.status === "loading"}
          empty={priorityRows.length === 0}
        >
          <div className="mb-2 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <AlertTriangle className="h-3.5 w-3.5 text-[var(--danger)]" />
            <span>{(t.raw("notesList") as string[])[1]}</span>
          </div>
          <DataTable columns={priorityColumns} rows={priorityRows} />
        </ChartCard>
      </div>
    </div>
  );
}
