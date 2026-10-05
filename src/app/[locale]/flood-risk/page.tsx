"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import {
  Layers,
  BookOpenText,
  MapIcon,
  Plus,
  Minus,
  Compass,
  Maximize2,
  Minimize2,
  LandPlot,
  Building2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { NavRail, type RailTool } from "@/components/gis/nav-rail";
import { MapToolPanel } from "@/components/gis/map-tool-panel";
import { LayerManagerPanel } from "@/components/gis/layer-manager-panel";
import { BasemapGallery } from "@/components/gis/basemap-gallery";
import { MapStatusBar } from "@/components/gis/map-status-bar";
import { AnalysisTabs, type AnalysisTab } from "@/components/gis/analysis-tabs";
import { MobileAnalysisDrawer } from "@/components/gis/mobile-analysis-drawer";
import { MiniStat } from "@/components/gis/mini-stat";
import { InsightCard } from "@/components/gis/insight-card";
import { AlertBanner } from "@/components/ui/alert-banner";
import { PieChart } from "@/components/dashboard/charts/pie-chart";
import { BarChart } from "@/components/dashboard/charts/bar-chart";
import { GaugeChart } from "@/components/dashboard/charts/gauge-chart";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { MapView } from "@/components/map/map-view";
import type { ManagedLayer, MapViewStatus, BasemapId, ArcgisMapViewHandle } from "@/components/map/arcgis-map-view";
import { useAsyncData } from "@/hooks/use-async-data";
import { queryGroupedCounts, queryGroupedCountsMulti } from "@/services/arcgis/query";
import { buildFloodRiskInsights } from "@/lib/insights";
import {
  PLOT_RISK_FEATURE_SERVICE_URL,
  PLOT_RISK_LAYER_ID,
  BUILDING_RISK_FEATURE_SERVICE_URL,
  BUILDING_RISK_LAYER_ID,
  WEBMAP_BOWSHER_ID,
} from "@/config/gis";
import { riskLevelDomain, landUseDomain, domainLabel, domainColor } from "@/config/domains";
import { formatNumber, cn } from "@/lib/utils";

const SAFE_CODE = riskLevelDomain[0].code;
const HIGH_RISK_CODES = riskLevelDomain.slice(3).map((d) => d.code);

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
  const gis = useTranslations("gis");
  const locale = useLocale() as "en" | "ar";

  const mapRef = useRef<ArcgisMapViewHandle>(null);
  const legendContainerRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<"layers" | "legend" | "basemap" | null>(null);
  const [basemap, setBasemap] = useState<BasemapId>("gray-vector");
  const [viewStatus, setViewStatus] = useState<MapViewStatus | null>(null);
  const [layers, setLayers] = useState<ManagedLayer[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [tab, setTab] = useState<"overview" | "insights" | "details">("overview");
  const [drawerExpanded, setDrawerExpanded] = useState(false);

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

  const loading = plotsState.status === "loading" || buildingsState.status === "loading";

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

  const topLandUse = useMemo(
    () => (priorityRows.length > 0 ? { label: priorityRows[0].landuse, count: priorityRows[0].count } : null),
    [priorityRows]
  );

  const insights = useMemo(
    () => buildFloodRiskInsights(plotTotals, buildingTotals, topLandUse, t as unknown as (key: string, values?: Record<string, string | number>) => string),
    [plotTotals, buildingTotals, topLandUse, t]
  );

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

  const railTools: RailTool[] = [
    { id: "layers", icon: Layers, label: gis("layers") },
    { id: "legend", icon: BookOpenText, label: gis("legend") },
    { id: "basemap", icon: MapIcon, label: gis("basemap") },
  ];

  const analysisTabs: AnalysisTab[] = [
    { id: "overview", label: gis("overview") },
    { id: "insights", label: gis("insights"), badge: insights.length },
    { id: "details", label: gis("details") },
  ];

  const panelContent = (
    <FloodRiskPanelContent
      tab={tab}
      loading={loading}
      locale={locale}
      t={t}
      common={common}
      gis={gis}
      plotTotals={plotTotals}
      buildingTotals={buildingTotals}
      plotPieData={plotPieData}
      buildingBarData={buildingBarData}
      insights={insights}
      priorityState={priorityState.status}
      priorityRows={priorityRows}
      priorityColumns={priorityColumns}
    />
  );

  return (
    <div
      className={cn(
        "flex flex-col",
        fullscreen ? "fixed inset-0 z-50 bg-[var(--background)]" : "h-[calc(100dvh-4rem)]"
      )}
    >
      <div className="flex min-h-0 flex-1 lg:flex-row">
        <NavRail tools={railTools} activeId={activeTool} onSelect={(id) => setActiveTool((c) => (c === id ? null : (id as typeof activeTool)))} />

        <div className="relative min-w-0 flex-1">
          <MapView
            ref={mapRef}
            webmapId={WEBMAP_BOWSHER_ID}
            heightClassName="h-full"
            basemap={basemap}
            onViewStatus={setViewStatus}
            onLayersReady={setLayers}
            legendContainerRef={legendContainerRef}
          />

          <div className="absolute inset-x-3 top-3 z-10">
            <AlertBanner title={t("importantNotes")} items={t.raw("notesList")} />
          </div>

          {activeTool === "layers" && (
            <MapToolPanel title={gis("layers")} onClose={() => setActiveTool(null)}>
              <LayerManagerPanel layers={layers} />
            </MapToolPanel>
          )}
          {activeTool === "legend" && (
            <MapToolPanel title={gis("legend")} onClose={() => setActiveTool(null)}>
              <div ref={legendContainerRef} />
            </MapToolPanel>
          )}
          {activeTool === "basemap" && (
            <MapToolPanel title={gis("basemap")} onClose={() => setActiveTool(null)}>
              <BasemapGallery value={basemap} onChange={setBasemap} labels={{ light: gis("light"), dark: gis("dark"), satellite: gis("satellite"), terrain: gis("terrain") }} />
            </MapToolPanel>
          )}

          <div className="absolute end-3 top-24 z-10 flex flex-col gap-1.5">
            <button onClick={() => mapRef.current?.zoomIn()} aria-label={gis("zoomIn")} className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-secondary)]">
              <Plus className="h-4 w-4" />
            </button>
            <button onClick={() => mapRef.current?.zoomOut()} aria-label={gis("zoomOut")} className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-secondary)]">
              <Minus className="h-4 w-4" />
            </button>
            <button onClick={() => mapRef.current?.goToPoints()} aria-label={gis("goHome")} className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-secondary)]">
              <Compass className="h-4 w-4" />
            </button>
            <button onClick={() => setFullscreen((f) => !f)} aria-label={fullscreen ? gis("exitFullscreenMap") : gis("fullscreenMap")} className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-secondary)]">
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>

          <MapStatusBar status={viewStatus} featureLabel={gis("features")} locale={locale} showFeatureCount={false} />

          <MobileAnalysisDrawer
            tabs={analysisTabs}
            activeId={tab}
            onChangeTab={(id) => setTab(id as typeof tab)}
            expanded={drawerExpanded}
            onToggleExpanded={() => setDrawerExpanded((v) => !v)}
            peek={
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold text-[var(--text-primary)]">
                  {plotTotals ? formatNumber(plotTotals.atRisk, locale) : "—"} {t("plotsAtRisk")}
                </span>
              </div>
            }
          >
            {panelContent}
          </MobileAnalysisDrawer>
        </div>

        <aside className="hidden w-[380px] shrink-0 flex-col border-s border-[var(--border)] bg-[var(--surface)] lg:flex">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h1 className="truncate text-sm font-semibold text-[var(--text-primary)]">{t("title")}</h1>
          </div>
          <AnalysisTabs tabs={analysisTabs} activeId={tab} onChange={(id) => setTab(id as typeof tab)} />
          <div className="flex-1 overflow-y-auto">{panelContent}</div>
        </aside>
      </div>
    </div>
  );
}

function FloodRiskPanelContent({
  tab,
  loading,
  locale,
  t,
  common,
  gis,
  plotTotals,
  buildingTotals,
  plotPieData,
  buildingBarData,
  insights,
  priorityState,
  priorityRows,
  priorityColumns,
}: {
  tab: "overview" | "insights" | "details";
  loading: boolean;
  locale: "en" | "ar";
  t: ReturnType<typeof useTranslations>;
  common: ReturnType<typeof useTranslations>;
  gis: ReturnType<typeof useTranslations>;
  plotTotals: { total: number; safe: number; atRisk: number } | null;
  buildingTotals: { total: number; safe: number; atRisk: number } | null;
  plotPieData: { name: string; value: number; colorVar?: string }[];
  buildingBarData: { name: string; value: number; colorVar?: string }[];
  insights: ReturnType<typeof buildFloodRiskInsights>;
  priorityState: "loading" | "success" | "error";
  priorityRows: PriorityRow[];
  priorityColumns: DataTableColumn<PriorityRow>[];
}) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <span className="text-sm text-[var(--text-tertiary)]">{common("loading")}</span>
      </div>
    );
  }

  if (tab === "overview") {
    return (
      <div className="space-y-5 p-4">
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label={t("plotsAtRisk")} value={plotTotals ? formatNumber(plotTotals.atRisk, locale) : "—"} icon={LandPlot} />
          <MiniStat label={t("buildingsAtRisk")} value={buildingTotals ? formatNumber(buildingTotals.atRisk, locale) : "—"} icon={Building2} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="mb-1 text-xs font-semibold text-[var(--text-secondary)]">{t("safePlots")}</p>
            {plotTotals && <GaugeChart value={plotTotals.safe} max={plotTotals.total} color="success" height={110} />}
          </div>
          <div className="text-center">
            <p className="mb-1 text-xs font-semibold text-[var(--text-secondary)]">{t("safeBuildings")}</p>
            {buildingTotals && <GaugeChart value={buildingTotals.safe} max={buildingTotals.total} color="success" height={110} />}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">{t("plotRiskDistribution")}</p>
          {plotPieData.length === 0 ? <EmptyState title={common("noData")} /> : <PieChart data={plotPieData} height={170} />}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">{t("buildingRiskDistribution")}</p>
          {buildingBarData.length === 0 ? (
            <EmptyState title={common("noData")} />
          ) : (
            <BarChart data={buildingBarData} valueLabel={common("count")} height={170} />
          )}
        </div>
      </div>
    );
  }

  if (tab === "insights") {
    return (
      <div className="space-y-2.5 p-4">
        {insights.length === 0 ? (
          <EmptyState title={gis("noInsights")} />
        ) : (
          insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
        )}
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="mb-2 flex items-center gap-2 px-1 text-xs text-[var(--text-tertiary)]">
        <TriangleAlert className="h-3.5 w-3.5 text-[var(--danger)]" />
        <span>{t("priorityTable")}</span>
      </div>
      <DataTable
        columns={priorityColumns}
        rows={priorityRows}
        emptyLabel={common("noData")}
      />
      {priorityState === "success" && priorityRows.length > 0 && (
        <div className="mt-3 flex items-center gap-2 px-1 text-xs text-[var(--text-tertiary)]">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{(t.raw("notesList") as string[])[2]}</span>
        </div>
      )}
    </div>
  );
}
