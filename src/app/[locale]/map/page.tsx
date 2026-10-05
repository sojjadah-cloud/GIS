"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import {
  Layers,
  BookOpenText,
  MapIcon,
  Search,
  Plus,
  Minus,
  Compass,
  Maximize2,
  Minimize2,
  Loader2,
  MapPin,
} from "lucide-react";
import { NavRail, type RailTool } from "@/components/gis/nav-rail";
import { MapToolPanel } from "@/components/gis/map-tool-panel";
import { LayerManagerPanel } from "@/components/gis/layer-manager-panel";
import { BasemapGallery } from "@/components/gis/basemap-gallery";
import { MapStatusBar } from "@/components/gis/map-status-bar";
import { MobileAnalysisDrawer } from "@/components/gis/mobile-analysis-drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { MapView } from "@/components/map/map-view";
import type { ManagedLayer, MapViewStatus, BasemapId, ArcgisMapViewHandle } from "@/components/map/arcgis-map-view";
import {
  WEBMAP_BOWSHER_ID,
  PLOT_PLAN_FEATURE_SERVICE_URL,
  PLOT_PLAN_LAYER_ID,
  PLOT_PLAN_SEARCH_FIELD,
} from "@/config/gis";
import { queryFeatures, geometryCentroid } from "@/services/arcgis/query";
import { landUseDomain, domainLabel } from "@/config/domains";
import { cn } from "@/lib/utils";

const PLOT_LAYER_TITLE = "Plot_Plan_Bowsher_2018";

interface PlotAttributes {
  PLOTNUMBER?: string;
  LANDUSE?: string;
  WILLAYAT?: string;
  VILLAGE?: string;
  BLOCKNUMBE?: string;
  FLOOR_N?: string | number;
  BLDG_HT?: string | number;
  SITE?: string;
}

export default function MapPage() {
  const t = useTranslations("map");
  const common = useTranslations("common");
  const gis = useTranslations("gis");
  const locale = useLocale() as "en" | "ar";

  const mapRef = useRef<ArcgisMapViewHandle>(null);
  const legendContainerRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<"layers" | "legend" | "basemap" | "search" | null>(null);
  const [basemap, setBasemap] = useState<BasemapId>("satellite");
  const [viewStatus, setViewStatus] = useState<MapViewStatus | null>(null);
  const [layers, setLayers] = useState<ManagedLayer[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<PlotAttributes | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setNotFound(false);
    try {
      const results = await queryFeatures<PlotAttributes>(PLOT_PLAN_FEATURE_SERVICE_URL, PLOT_PLAN_LAYER_ID, {
        where: `UPPER(${PLOT_PLAN_SEARCH_FIELD}) LIKE UPPER('%${query.trim().replace(/'/g, "''")}%')`,
        returnGeometry: true,
        resultRecordCount: 1,
        outSR: 4326,
      });
      const first = results[0];
      const centroid = geometryCentroid(first?.geometry);
      if (centroid && first) {
        setFocusPoint(centroid);
        setSelectedPlot(first.attributes);
        setActiveTool(null);
      } else {
        setNotFound(true);
        setSelectedPlot(null);
      }
    } catch {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  }

  const railTools: RailTool[] = [
    { id: "search", icon: Search, label: t("searchTool") },
    { id: "layers", icon: Layers, label: gis("layers") },
    { id: "legend", icon: BookOpenText, label: gis("legend") },
    { id: "basemap", icon: MapIcon, label: gis("basemap") },
  ];

  const panelContent = (
    <div className="p-4">
      {selectedPlot ? (
        <PlotDetails plot={selectedPlot} locale={locale} t={t} />
      ) : (
        <EmptyState icon={MapPin} title={t("noPlotSelected")} description={t("noPlotSelectedHint")} />
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "flex flex-col",
        fullscreen ? "fixed inset-0 z-50 bg-[var(--background)]" : "h-[calc(100dvh-4rem)]"
      )}
    >
      <div className="flex min-h-0 flex-1 lg:flex-row">
        <NavRail
          tools={railTools}
          activeId={activeTool}
          onSelect={(id) => setActiveTool((c) => (c === id ? null : (id as typeof activeTool)))}
        />

        <div className="relative min-w-0 flex-1">
          <MapView
            ref={mapRef}
            webmapId={WEBMAP_BOWSHER_ID}
            heightClassName="h-full"
            basemap={basemap}
            focusPoint={focusPoint}
            identifyLayerTitles={[PLOT_LAYER_TITLE]}
            onViewStatus={setViewStatus}
            onLayersReady={setLayers}
            legendContainerRef={legendContainerRef}
            onFeatureClick={(attrs) => {
              if (attrs) {
                setSelectedPlot(attrs as PlotAttributes);
                setDrawerExpanded(true);
              }
            }}
          />

          {activeTool === "search" && (
            <MapToolPanel title={t("searchTool")} onClose={() => setActiveTool(null)}>
              <form onSubmit={handleSearch} className="flex flex-col gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] focus-visible:outline-none"
                  autoFocus
                />
                <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })} disabled={searching}>
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : common("search")}
                </button>
                {notFound && <p className="text-xs text-[var(--warning)]">{t("noPlotFound")}</p>}
                <p className="text-xs text-[var(--text-tertiary)]">{t("clickToInspect")}</p>
              </form>
            </MapToolPanel>
          )}
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
              <BasemapGallery
                value={basemap}
                onChange={setBasemap}
                labels={{ light: gis("light"), dark: gis("dark"), satellite: gis("satellite"), terrain: gis("terrain") }}
              />
            </MapToolPanel>
          )}

          <div className="absolute end-3 top-3 z-10 flex flex-col gap-1.5">
            <button onClick={() => mapRef.current?.zoomIn()} aria-label={gis("zoomIn")} className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-secondary)]">
              <Plus className="h-4 w-4" />
            </button>
            <button onClick={() => mapRef.current?.zoomOut()} aria-label={gis("zoomOut")} className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-secondary)]">
              <Minus className="h-4 w-4" />
            </button>
            <button onClick={() => mapRef.current?.goHome()} aria-label={t("home")} className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-secondary)]">
              <Compass className="h-4 w-4" />
            </button>
            <button onClick={() => setFullscreen((f) => !f)} aria-label={fullscreen ? gis("exitFullscreenMap") : gis("fullscreenMap")} className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-secondary)]">
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>

          <MapStatusBar status={viewStatus} featureLabel={gis("features")} locale={locale} showFeatureCount={false} />

          <MobileAnalysisDrawer
            tabs={[{ id: "details", label: t("plotDetails") }]}
            activeId="details"
            onChangeTab={() => {}}
            expanded={drawerExpanded}
            onToggleExpanded={() => setDrawerExpanded((v) => !v)}
            peek={
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-[var(--primary)]" />
                <span className="font-semibold text-[var(--text-primary)]">
                  {selectedPlot ? `${t("plotNumber")}: ${selectedPlot.PLOTNUMBER ?? "—"}` : t("noPlotSelected")}
                </span>
              </div>
            }
          >
            {panelContent}
          </MobileAnalysisDrawer>
        </div>

        <aside className="hidden w-[340px] shrink-0 flex-col border-s border-[var(--border)] bg-[var(--surface)] lg:flex">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h1 className="truncate text-sm font-semibold text-[var(--text-primary)]">{t("title")}</h1>
            <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{t("plotDetails")}</p>
          </div>
          <div className="flex-1 overflow-y-auto">{panelContent}</div>
        </aside>
      </div>
    </div>
  );
}

function PlotDetails({ plot, locale, t }: { plot: PlotAttributes; locale: "en" | "ar"; t: ReturnType<typeof useTranslations> }) {
  const rows: { label: string; value: string }[] = [
    { label: t("plotNumber"), value: plot.PLOTNUMBER?.trim() || "—" },
    { label: t("landUse"), value: plot.LANDUSE ? domainLabel(landUseDomain, plot.LANDUSE.trim(), locale) : "—" },
    { label: t("wilayat"), value: plot.WILLAYAT?.trim() || "—" },
    { label: t("village"), value: plot.VILLAGE?.trim() || "—" },
    { label: t("blockNumber"), value: plot.BLOCKNUMBE?.trim() || "—" },
    { label: t("floors"), value: plot.FLOOR_N != null && `${plot.FLOOR_N}`.trim() !== "" ? `${plot.FLOOR_N}` : "—" },
    { label: t("buildingHeight"), value: plot.BLDG_HT != null && `${plot.BLDG_HT}`.trim() !== "" ? `${plot.BLDG_HT}` : "—" },
  ];

  return (
    <dl className="space-y-2.5">
      {rows.map((row) => (
        <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
          <dt className="shrink-0 text-[var(--text-tertiary)]">{row.label}</dt>
          <dd className="text-end font-medium text-[var(--text-primary)]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
