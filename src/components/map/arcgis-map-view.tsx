"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import "@arcgis/core/assets/esri/themes/light/main.css";
import esriConfig from "@arcgis/core/config";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Point from "@arcgis/core/geometry/Point";
import Legend from "@arcgis/core/widgets/Legend";
import Expand from "@arcgis/core/widgets/Expand";
import Zoom from "@arcgis/core/widgets/Zoom";
import Home from "@arcgis/core/widgets/Home";
import Locate from "@arcgis/core/widgets/Locate";
import Extent from "@arcgis/core/geometry/Extent";
import type Graphic_t from "@arcgis/core/Graphic";
import { Maximize2, Minimize2, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

esriConfig.apiKey = process.env.NEXT_PUBLIC_ARCGIS_API_KEY ?? "";

export interface MapPoint {
  id: string | number;
  x: number;
  y: number;
  colorRgb?: [number, number, number];
  attributes: Record<string, unknown>;
}

export interface ArcgisMapViewProps {
  webmapId: string;
  className?: string;
  heightClassName?: string;
  showLegend?: boolean;
  showZoom?: boolean;
  showHome?: boolean;
  showLocate?: boolean;
  showExpand?: boolean;
  onFeatureClick?: (attributes: Record<string, unknown> | null, layerTitle?: string) => void;
  onExtentChange?: (extent: Extent | null) => void;
  /** Point to highlight/zoom to, e.g. when a table row is selected. */
  focusPoint?: { x: number; y: number } | null;
  /** Custom point markers rendered on top of the web map (e.g. survey reports). */
  points?: MapPoint[];
  selectedPointId?: string | number | null;
}

export function ArcgisMapView({
  webmapId,
  className,
  heightClassName = "h-full min-h-[360px]",
  showLegend = true,
  showZoom = true,
  showHome = true,
  showLocate = false,
  showExpand = true,
  onFeatureClick,
  onExtentChange,
  focusPoint,
  points,
  selectedPointId,
}: ArcgisMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const highlightRef = useRef<Graphic_t | null>(null);
  const pointsLayerRef = useRef<GraphicsLayer | null>(null);
  const didFitPointsRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("common");

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const webmap = new WebMap({ portalItem: { id: webmapId } });
    const pointsLayer = new GraphicsLayer({ title: "points" });
    pointsLayerRef.current = pointsLayer;
    webmap.add(pointsLayer);

    const view = new MapView({
      container: containerRef.current,
      map: webmap,
      popupEnabled: false,
    });
    viewRef.current = view;

    view.when(() => {
      if (cancelled) return;
      setLoading(false);

      view.ui.empty("top-left");
      view.ui.empty("top-right");
      view.ui.empty("bottom-left");
      view.ui.empty("bottom-right");

      if (showZoom) view.ui.add(new Zoom({ view }), "top-left");
      if (showHome) view.ui.add(new Home({ view }), "top-left");
      if (showLocate) view.ui.add(new Locate({ view }), "top-left");
      if (showLegend) {
        const legend = new Legend({ view });
        view.ui.add(new Expand({ view, content: legend, expandIcon: "legend" }), "top-right");
      }
    });

    if (onFeatureClick) {
      view.on("click", async (event) => {
        const response = await view.hitTest(event, { include: pointsLayer });
        const graphicHit = response.results.find(
          (r): r is __esri.GraphicHit => "graphic" in r && !!r.graphic.attributes
        );
        onFeatureClick(
          graphicHit ? graphicHit.graphic.attributes : null,
          graphicHit?.graphic.layer?.title ?? undefined
        );
      });
    }

    if (onExtentChange) {
      let timer: ReturnType<typeof setTimeout>;
      const handle = view.watch("stationary", (stationary: boolean) => {
        if (!stationary) return;
        clearTimeout(timer);
        timer = setTimeout(() => onExtentChange(view.extent ?? null), 150);
      });
      return () => {
        cancelled = true;
        clearTimeout(timer);
        handle.remove();
        view.destroy();
      };
    }

    return () => {
      cancelled = true;
      view.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webmapId]);

  // Pan/highlight a focus point (e.g. selected table row).
  useEffect(() => {
    const view = viewRef.current;
    if (!view || loading) return;

    if (highlightRef.current) {
      view.graphics.remove(highlightRef.current);
      highlightRef.current = null;
    }

    if (focusPoint) {
      const point = new Point({ x: focusPoint.x, y: focusPoint.y, spatialReference: { wkid: 4326 } });
      const graphic = new Graphic({
        geometry: point,
        symbol: {
          type: "simple-marker" as const,
          style: "circle",
          color: [14, 124, 134, 0.25],
          size: 36,
          outline: { color: [14, 124, 134, 1], width: 2 },
        },
      });
      view.graphics.add(graphic);
      highlightRef.current = graphic;
      view.goTo({ target: point, zoom: Math.max(view.zoom, 16) }, { duration: 500 });
    }
  }, [focusPoint, loading]);

  // Sync custom point markers (e.g. survey reports) onto their own layer.
  useEffect(() => {
    const layer = pointsLayerRef.current;
    if (!layer || loading) return;
    layer.removeAll();
    if (!points) return;

    const graphics = points.map((p) => {
      const isSelected = selectedPointId != null && p.id === selectedPointId;
      const [r, g, b] = p.colorRgb ?? [14, 124, 134];
      return new Graphic({
        geometry: new Point({ x: p.x, y: p.y, spatialReference: { wkid: 4326 } }),
        attributes: { ...p.attributes, __pointId: p.id },
        symbol: {
          type: "simple-marker" as const,
          style: "circle",
          size: isSelected ? 16 : 11,
          color: [r, g, b, 0.9],
          outline: { color: isSelected ? [255, 255, 255, 1] : [255, 255, 255, 0.9], width: isSelected ? 2.5 : 1.5 },
        },
      });
    });
    layer.addMany(graphics);

    const view = viewRef.current;
    if (view && !didFitPointsRef.current && graphics.length > 0) {
      didFitPointsRef.current = true;
      view.goTo(graphics, { duration: 600 }).catch(() => {});
    }
  }, [points, selectedPointId, loading]);

  const toggleFullscreen = useCallback(() => setFullscreen((f) => !f), []);

  return (
    <div
      className={
        (fullscreen ? "fixed inset-0 z-50 " : "relative ") + heightClassName + " " + (className ?? "")
      }
      dir="ltr"
    >
      <div ref={containerRef} className="h-full w-full" lang={locale} />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-secondary)]">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" aria-hidden />
          <span className="sr-only">{t("loadingMap")}</span>
        </div>
      )}
      {showExpand && (
        <button
          onClick={toggleFullscreen}
          aria-label={fullscreen ? t("exitFullscreen") : t("expandMap")}
          className="absolute bottom-3 end-3 z-10 flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-secondary)]"
        >
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

export type { Extent };
