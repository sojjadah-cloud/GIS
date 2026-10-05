"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import {
  Layers,
  BookOpenText,
  MapIcon,
  ScanEye,
  Plus,
  Minus,
  Compass,
  Maximize2,
  Minimize2,
  Waves,
  HeartHandshake,
  ShieldCheck,
  MapPin,
  Info,
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
import { PieChart } from "@/components/dashboard/charts/pie-chart";
import { BarChart } from "@/components/dashboard/charts/bar-chart";
import { GaugeChart } from "@/components/dashboard/charts/gauge-chart";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { MapView } from "@/components/map/map-view";
import type {
  MapPoint,
  ManagedLayer,
  MapViewStatus,
  BasemapId,
  ArcgisMapViewHandle,
} from "@/components/map/arcgis-map-view";
import { useAsyncData } from "@/hooks/use-async-data";
import { pointInExtent } from "@/lib/geo";
import { queryFeatures } from "@/services/arcgis/query";
import { buildInsights } from "@/lib/insights";
import { SURVEY_FEATURE_SERVICE_URL, SURVEY_LAYER_ID, WEBMAP_BOWSHER_ID } from "@/config/gis";
import {
  residenceDomain,
  damageTypeDomain,
  damageLevelDomain,
  buildingTypeDomain,
  yesNoDomain,
  splitMultiValue,
  domainLabel,
  domainColor,
} from "@/config/domains";
import { toSurveyRecord, type SurveyRecord } from "@/types/survey";
import { formatDate, formatNumber, cn } from "@/lib/utils";

const EXCLUDED_ADDRESS = "جنوب الباطنة، غلا، غلا الصناعية، 1564";

const DAMAGE_LEVEL_RGB: Record<string, [number, number, number]> = {
  "Destroyed (permanently uninhabi": [122, 39, 26],
  "Major (uninhabitable, major rep": [180, 35, 24],
  "Minor (uninhabitable, minor rep": [181, 71, 8],
  "Affected (habitable)": [181, 71, 8],
  "Not affected": [18, 128, 92],
};

type ToolId = "layers" | "legend" | "basemap" | "extent";

export default function SurveyDashboardPage() {
  const t = useTranslations("surveyDashboard");
  const common = useTranslations("common");
  const gis = useTranslations("gis");
  const locale = useLocale() as "en" | "ar";

  const mapRef = useRef<ArcgisMapViewHandle>(null);
  const legendContainerRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [analyzeExtent, setAnalyzeExtent] = useState(true);
  const [basemap, setBasemap] = useState<BasemapId>("satellite");
  const [viewStatus, setViewStatus] = useState<MapViewStatus | null>(null);
  const [layers, setLayers] = useState<ManagedLayer[]>([]);
  const [extent, setExtent] = useState<__esri.Extent | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [tab, setTab] = useState<"overview" | "insights" | "details">("overview");
  const [drawerExpanded, setDrawerExpanded] = useState(false);

  const recordsState = useAsyncData(async () => {
    const features = await queryFeatures<Omit<SurveyRecord, "x" | "y">>(
      SURVEY_FEATURE_SERVICE_URL,
      SURVEY_LAYER_ID,
      { returnGeometry: true, resultRecordCount: 2000 }
    );
    return features.map(toSurveyRecord);
  }, []);

  const allRecords = useMemo(
    () => (recordsState.status === "success" ? recordsState.data : []),
    [recordsState]
  );

  const filteredRecords = useMemo(() => {
    if (!analyzeExtent || !extent) return allRecords;
    return allRecords.filter((r) => r.x != null && r.y != null && pointInExtent(r.x, r.y, extent));
  }, [allRecords, extent, analyzeExtent]);

  const selected = useMemo(
    () => allRecords.find((r) => r.objectid === selectedId) ?? null,
    [allRecords, selectedId]
  );

  const residenceData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of filteredRecords) counts.set(r.residence ?? "null", (counts.get(r.residence ?? "null") ?? 0) + 1);
    return [...counts.entries()].map(([code, value]) => ({
      name: domainLabel(residenceDomain, code === "null" ? null : code, locale),
      value,
      colorVar: domainColor(residenceDomain, code === "null" ? null : code),
    }));
  }, [filteredRecords, locale]);

  const damageTypeData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of filteredRecords) {
      for (const code of splitMultiValue(r.damage_type)) {
        counts.set(code, (counts.get(code) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([code, value]) => ({
        name: domainLabel(damageTypeDomain, code, locale),
        value,
        colorVar: domainColor(damageTypeDomain, code),
      }));
  }, [filteredRecords, locale]);

  const displacementCount = filteredRecords.filter((r) => r.displacement === "Yes").length;
  const supportRequestCount = filteredRecords.filter((r) => r.government_support_request === "Yes").length;

  const incidentRows = useMemo(
    () => filteredRecords.filter((r) => r.address_question !== EXCLUDED_ADDRESS),
    [filteredRecords]
  );

  const insights = useMemo(
    () => buildInsights(filteredRecords, locale, t as unknown as (key: string, values?: Record<string, string | number>) => string),
    [filteredRecords, locale, t]
  );

  const incidentColumns: DataTableColumn<SurveyRecord & { id: number }>[] = [
    { key: "address", header: t("address"), render: (r) => r.address_question ?? "—" },
    {
      key: "damage",
      header: t("damageLevel"),
      render: (r) => (
        <Badge tone="danger" dotColorVar={domainColor(damageLevelDomain, r.damage_level)}>
          {domainLabel(damageLevelDomain, r.damage_level, locale)}
        </Badge>
      ),
    },
  ];

  const mapPoints: MapPoint[] = allRecords.map((r) => ({
    id: r.objectid,
    x: r.x ?? 0,
    y: r.y ?? 0,
    colorRgb: DAMAGE_LEVEL_RGB[r.damage_level ?? ""] ?? [14, 124, 134],
    attributes: { objectid: r.objectid },
  }));

  const focusPoint = selected?.x != null && selected?.y != null ? { x: selected.x, y: selected.y } : null;

  const railTools: RailTool[] = [
    { id: "layers", icon: Layers, label: gis("layers") },
    { id: "legend", icon: BookOpenText, label: gis("legend") },
    { id: "basemap", icon: MapIcon, label: gis("basemap") },
    { id: "extent", icon: ScanEye, label: gis("analyzeVisibleExtent"), toggled: analyzeExtent },
  ];

  function handleRailSelect(id: string) {
    if (id === "extent") {
      setAnalyzeExtent((v) => !v);
      return;
    }
    setActiveTool((cur) => (cur === id ? null : (id as ToolId)));
  }

  function selectFeature(id: number | null) {
    setSelectedId(id);
    setTab("details");
  }

  const analysisTabs: AnalysisTab[] = [
    { id: "overview", label: gis("overview") },
    { id: "insights", label: gis("insights"), badge: insights.length },
    { id: "details", label: gis("details") },
  ];

  const panelContent = (
    <AnalysisPanelContent
      tab={tab}
      loading={recordsState.status === "loading"}
      locale={locale}
      t={t}
      common={common}
      gis={gis}
      filteredCount={filteredRecords.length}
      totalCount={allRecords.length}
      displacementCount={displacementCount}
      supportRequestCount={supportRequestCount}
      residenceData={residenceData}
      damageTypeData={damageTypeData}
      insights={insights}
      selected={selected}
      incidentRows={incidentRows}
      incidentColumns={incidentColumns}
      selectedId={selectedId}
      onSelectFeature={selectFeature}
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
        <NavRail tools={railTools} activeId={activeTool} onSelect={handleRailSelect} />

        <div className="relative min-w-0 flex-1">
          <MapView
            ref={mapRef}
            webmapId={WEBMAP_BOWSHER_ID}
            heightClassName="h-full"
            basemap={basemap}
            points={mapPoints}
            selectedPointId={selectedId}
            focusPoint={focusPoint}
            onExtentChange={setExtent}
            onViewStatus={setViewStatus}
            onLayersReady={setLayers}
            legendContainerRef={legendContainerRef}
            onFeatureClick={(attrs) => selectFeature(attrs ? (attrs.objectid as number) : null)}
          />

          {activeTool === "layers" && (
            <MapToolPanel title={gis("layers")} onClose={() => setActiveTool(null)}>
              <LayerManagerPanel layers={layers} />
            </MapToolPanel>
          )}
          {activeTool === "legend" && (
            <MapToolPanel title={gis("legend")} onClose={() => setActiveTool(null)}>
              <div ref={legendContainerRef} className="esri-legend-host" />
              <DamageLevelLegend locale={locale} />
            </MapToolPanel>
          )}
          {activeTool === "basemap" && (
            <MapToolPanel title={gis("basemap")} onClose={() => setActiveTool(null)}>
              <BasemapGallery value={basemap} onChange={setBasemap} labels={{ light: gis("light"), dark: gis("dark"), satellite: gis("satellite"), terrain: gis("terrain") }} />
            </MapToolPanel>
          )}

          <div className="absolute end-3 top-3 z-10 flex flex-col gap-1.5">
            <button
              onClick={() => mapRef.current?.zoomIn()}
              aria-label={gis("zoomIn")}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-secondary)]"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut()}
              aria-label={gis("zoomOut")}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-secondary)]"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={() => mapRef.current?.goHome()}
              aria-label={gis("goHome")}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-secondary)]"
            >
              <Compass className="h-4 w-4" />
            </button>
            <button
              onClick={() => setFullscreen((f) => !f)}
              aria-label={fullscreen ? gis("exitFullscreenMap") : gis("fullscreenMap")}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-secondary)]"
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>

          <MapStatusBar status={viewStatus} featureLabel={gis("features")} />

          <MobileAnalysisDrawer
            tabs={analysisTabs}
            activeId={tab}
            onChangeTab={(id) => setTab(id as typeof tab)}
            expanded={drawerExpanded}
            onToggleExpanded={() => setDrawerExpanded((v) => !v)}
            peek={
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatNumber(filteredRecords.length, locale)} {gis("records")}
                </span>
                <span className="text-[var(--text-secondary)]">{t("title")}</span>
              </div>
            }
          >
            {panelContent}
          </MobileAnalysisDrawer>
        </div>

        <aside className="hidden w-[380px] shrink-0 flex-col border-s border-[var(--border)] bg-[var(--surface)] lg:flex">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h1 className="truncate text-sm font-semibold text-[var(--text-primary)]">{t("title")}</h1>
            <p dir="rtl" className="truncate text-xs text-[var(--text-secondary)]">
              {t("titleAr")}
            </p>
          </div>
          <AnalysisTabs tabs={analysisTabs} activeId={tab} onChange={(id) => setTab(id as typeof tab)} />
          <div className="flex-1 overflow-y-auto">{panelContent}</div>
        </aside>
      </div>
    </div>
  );
}

function DamageLevelLegend({ locale }: { locale: "en" | "ar" }) {
  return (
    <div className="mt-3 border-t border-[var(--border)] pt-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
        Survey Reports
      </p>
      <ul className="space-y-1.5">
        {damageLevelDomain.map((d) => (
          <li key={d.code} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: `var(${d.color})` }}
              aria-hidden
            />
            <span>{d.label[locale]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnalysisPanelContent({
  tab,
  loading,
  locale,
  t,
  common,
  gis,
  filteredCount,
  totalCount,
  displacementCount,
  supportRequestCount,
  residenceData,
  damageTypeData,
  insights,
  selected,
  incidentRows,
  incidentColumns,
  selectedId,
  onSelectFeature,
}: {
  tab: "overview" | "insights" | "details";
  loading: boolean;
  locale: "en" | "ar";
  t: ReturnType<typeof useTranslations>;
  common: ReturnType<typeof useTranslations>;
  gis: ReturnType<typeof useTranslations>;
  filteredCount: number;
  totalCount: number;
  displacementCount: number;
  supportRequestCount: number;
  residenceData: { name: string; value: number; colorVar?: string }[];
  damageTypeData: { name: string; value: number; colorVar?: string }[];
  insights: ReturnType<typeof buildInsights>;
  selected: SurveyRecord | null;
  incidentRows: SurveyRecord[];
  incidentColumns: DataTableColumn<SurveyRecord & { id: number }>[];
  selectedId: number | null;
  onSelectFeature: (id: number | null) => void;
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
          <MiniStat label={gis("records")} value={formatNumber(filteredCount, locale)} icon={HeartHandshake} />
          <MiniStat label={t("displacement")} value={formatNumber(displacementCount, locale)} icon={Waves} />
          <MiniStat label={t("governmentSupportRequest")} value={formatNumber(supportRequestCount, locale)} icon={ShieldCheck} />
          <MiniStat label={common("total")} value={formatNumber(totalCount, locale)} icon={MapPin} />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">{t("governmentSupportRequest")}</p>
          <div className="flex justify-center">
            <GaugeChart value={supportRequestCount} max={Math.max(filteredCount, 1)} color="warning" height={130} />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">{t("residence")}</p>
          {residenceData.length === 0 ? (
            <EmptyState title={common("noData")} />
          ) : (
            <PieChart data={residenceData} height={170} />
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">{t("damageType")}</p>
          {damageTypeData.length === 0 ? (
            <EmptyState title={common("noData")} />
          ) : (
            <BarChart data={damageTypeData} valueLabel={common("count")} height={160} />
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

  // Details tab: selected feature, or the records list to pick from.
  return (
    <div className="flex flex-col">
      {selected ? (
        <div className="p-4">
          <FeatureDetails record={selected} locale={locale} t={t} />
          <button
            onClick={() => onSelectFeature(null)}
            className="mt-4 text-xs font-medium text-[var(--primary)] hover:underline"
          >
            {gis("records")} ({incidentRows.length})
          </button>
        </div>
      ) : (
        <div className="p-4">
          <EmptyState icon={MapPin} title={gis("noSelection")} description={gis("noSelectionHint")} />
        </div>
      )}
      {!selected && (
        <div className="border-t border-[var(--border)] p-3">
          <p className="mb-2 px-1 text-xs font-semibold text-[var(--text-secondary)]">
            {t("addressDamageTable")}
          </p>
          <DataTable
            columns={incidentColumns}
            rows={incidentRows.map((r) => ({ ...r, id: r.objectid }))}
            onRowClick={(r) => onSelectFeature(r.objectid)}
            selectedId={selectedId ?? undefined}
            emptyLabel={common("noData")}
          />
        </div>
      )}
    </div>
  );
}

function FeatureDetails({
  record,
  locale,
  t,
}: {
  record: SurveyRecord;
  locale: "en" | "ar";
  t: ReturnType<typeof useTranslations>;
}) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t("incidentName"), value: record.incident_name || "—" },
    {
      label: t("dateOfIncident"),
      value: record.date_and_time_of_incident ? formatDate(record.date_and_time_of_incident, locale) : "—",
    },
    { label: t("address"), value: record.address_question || "—" },
    {
      label: t("damageLevel"),
      value: (
        <Badge tone="danger" dotColorVar={domainColor(damageLevelDomain, record.damage_level)}>
          {domainLabel(damageLevelDomain, record.damage_level, locale)}
        </Badge>
      ),
    },
    { label: t("buildingType"), value: domainLabel(buildingTypeDomain, record.building_type, locale) },
    { label: t("residenceDuration"), value: domainLabel(residenceDomain, record.residence, locale) },
    {
      label: t("damageType"),
      value: splitMultiValue(record.damage_type)
        .map((c) => domainLabel(damageTypeDomain, c, locale))
        .join(" · ") || "—",
    },
    { label: t("displacement"), value: domainLabel(yesNoDomain, record.displacement, locale) },
    { label: t("governmentSupportRequest"), value: domainLabel(yesNoDomain, record.government_support_request, locale) },
    { label: t("responseRating"), value: record.response_rating ?? "—" },
  ];

  return (
    <div className="space-y-4">
      <dl className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
            <dt className="shrink-0 text-[var(--text-tertiary)]">{row.label}</dt>
            <dd className="text-end font-medium text-[var(--text-primary)]">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="rounded-[var(--radius-sm)] bg-[var(--surface-secondary)] p-3">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)]">
          <Info className="h-3.5 w-3.5" />
          {t("notes")}
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{record.notes || t("noNotes")}</p>
      </div>
    </div>
  );
}
