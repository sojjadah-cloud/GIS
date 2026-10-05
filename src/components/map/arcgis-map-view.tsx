"use client";

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import "@arcgis/core/assets/esri/themes/light/main.css";
import esriConfig from "@arcgis/core/config";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Point from "@arcgis/core/geometry/Point";
import Legend from "@arcgis/core/widgets/Legend";
import Extent from "@arcgis/core/geometry/Extent";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import type Graphic_t from "@arcgis/core/Graphic";
import type Layer from "@arcgis/core/layers/Layer";
import { Loader2, RotateCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

esriConfig.apiKey = process.env.NEXT_PUBLIC_ARCGIS_API_KEY ?? "";

export interface MapPoint {
  id: string | number;
  x: number;
  y: number;
  colorRgb?: [number, number, number];
  attributes: Record<string, unknown>;
}

export interface ManagedLayer {
  id: string;
  title: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export interface MapViewStatus {
  scale: number;
  zoom: number;
  center: { lat: number; lon: number } | null;
  visiblePointCount: number;
}

export type BasemapId = "gray-vector" | "dark-gray-vector" | "satellite" | "topo-vector";

export interface ArcgisMapViewHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  goHome: () => void;
  goToPoints: () => void;
}

export interface ArcgisMapViewProps {
  webmapId: string;
  className?: string;
  heightClassName?: string;
  basemap?: BasemapId;
  onFeatureClick?: (attributes: Record<string, unknown> | null, layerTitle?: string) => void;
  onExtentChange?: (extent: Extent | null) => void;
  onViewStatus?: (status: MapViewStatus) => void;
  onLayersReady?: (layers: ManagedLayer[]) => void;
  legendContainerRef?: React.RefObject<HTMLDivElement | null>;
  /** Point to highlight/zoom to, e.g. when a table row is selected. */
  focusPoint?: { x: number; y: number } | null;
  /** Custom point markers rendered on top of the web map (e.g. survey reports). */
  points?: MapPoint[];
  pointsLayerTitle?: string;
  selectedPointId?: string | number | null;
  /** Titles of real web map layers to hit-test on click (e.g. a plot layer), in addition to the points layer. */
  identifyLayerTitles?: string[];
}

export const ArcgisMapView = forwardRef<ArcgisMapViewHandle, ArcgisMapViewProps>(function ArcgisMapView(
  {
    webmapId,
    className,
    heightClassName = "h-full min-h-[360px]",
    basemap,
    onFeatureClick,
    onExtentChange,
    onViewStatus,
    onLayersReady,
    legendContainerRef,
    focusPoint,
    points,
    pointsLayerTitle = "Survey Reports",
    selectedPointId,
    identifyLayerTitles,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const highlightRef = useRef<Graphic_t | null>(null);
  const pointsLayerRef = useRef<GraphicsLayer | null>(null);
  const legendRef = useRef<Legend | null>(null);
  const didFitPointsRef = useRef(false);
  const identifyLayersRef = useRef<Layer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const locale = useLocale();
  const t = useTranslations("common");
  const gis = useTranslations("gis");

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    setLoading(true);
    setError(false);

    const webmap = new WebMap({ portalItem: { id: webmapId } });
    const pointsLayer = new GraphicsLayer({ title: pointsLayerTitle });
    pointsLayerRef.current = pointsLayer;
    webmap.add(pointsLayer);

    const view = new MapView({
      container: containerRef.current,
      map: webmap,
      popupEnabled: false,
      ui: { components: [] },
    });
    viewRef.current = view;

    view.when(
      () => {
        if (cancelled) return;
        setLoading(false);

        if (legendContainerRef?.current) {
          legendRef.current = new Legend({ view, container: legendContainerRef.current });
        }

        if (identifyLayerTitles && identifyLayerTitles.length > 0) {
          identifyLayersRef.current = webmap.layers
            .toArray()
            .filter((l: Layer) => identifyLayerTitles.includes(l.title ?? ""));
        }

        if (onLayersReady) {
          const managed: ManagedLayer[] = webmap.layers.toArray().map((layer: Layer) => ({
            id: layer.id,
            title: layer.title || layer.id,
            visible: layer.visible,
            setVisible: (v: boolean) => {
              layer.visible = v;
            },
          }));
          onLayersReady(managed);
        }
      },
      (err: Error) => {
        // Expected on unmount / Fast Refresh remount — the in-flight load is
        // intentionally aborted, not a real failure.
        if (cancelled || err?.name === "AbortError") return;
        setLoading(false);
        setError(true);
      }
    );

    if (onFeatureClick) {
      view.on("click", async (event) => {
        try {
          const include = [pointsLayer, ...identifyLayersRef.current];
          const response = await view.hitTest(event, { include });
          const graphicHit = response.results.find(
            (r): r is __esri.GraphicHit => "graphic" in r && !!r.graphic.attributes
          );
          onFeatureClick(
            graphicHit ? graphicHit.graphic.attributes : null,
            graphicHit?.graphic.layer?.title ?? undefined
          );
        } catch {
          // View was destroyed mid-hitTest (e.g. fast navigation) — ignore.
        }
      });
    }

    let statusTimer: ReturnType<typeof setTimeout>;
    const reportStatus = () => {
      if (!onViewStatus) return;
      const extent = view.extent;
      let visiblePointCount = 0;
      if (extent && pointsLayerRef.current) {
        visiblePointCount = pointsLayerRef.current.graphics.filter((g) => {
          const geom = g.geometry as __esri.Point | undefined;
          return geom ? extent.contains(geom) : false;
        }).length;
      }
      onViewStatus({
        scale: Math.round(view.scale),
        zoom: Math.round(view.zoom * 10) / 10,
        center:
          view.center && view.center.latitude != null && view.center.longitude != null
            ? { lat: view.center.latitude, lon: view.center.longitude }
            : null,
        visiblePointCount,
      });
    };

    const handle = reactiveUtils.watch(
      () => view.stationary,
      (stationary: boolean) => {
        if (!stationary) return;
        clearTimeout(statusTimer);
        statusTimer = setTimeout(() => {
          reportStatus();
          onExtentChange?.(view.extent ?? null);
        }, 150);
      }
    );

    return () => {
      cancelled = true;
      clearTimeout(statusTimer);
      handle.remove();
      legendRef.current?.destroy();
      view.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webmapId, retryKey]);

  // Basemap switching.
  useEffect(() => {
    const view = viewRef.current;
    if (!view || loading || !basemap) return;
    if (view.map) view.map.basemap = basemap as unknown as __esri.Basemap;
  }, [basemap, loading]);

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

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const view = viewRef.current;
      if (view) view.goTo({ zoom: view.zoom + 1 }, { duration: 200 });
    },
    zoomOut: () => {
      const view = viewRef.current;
      if (view) view.goTo({ zoom: view.zoom - 1 }, { duration: 200 });
    },
    goHome: () => {
      const view = viewRef.current;
      const layer = pointsLayerRef.current;
      if (view && layer && layer.graphics.length > 0) {
        view.goTo(layer.graphics.toArray(), { duration: 400 }).catch(() => {});
      }
    },
    goToPoints: () => {
      const view = viewRef.current;
      const layer = pointsLayerRef.current;
      if (view && layer && layer.graphics.length > 0) {
        view.goTo(layer.graphics.toArray(), { duration: 400 }).catch(() => {});
      }
    },
  }));

  const onContainerKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Prevent the map's internal keyboard nav from trapping Tab focus.
    if (e.key === "Tab") return;
  }, []);

  return (
    <div className={"relative " + heightClassName + " " + (className ?? "")} dir="ltr">
      <div
        ref={containerRef}
        className="h-full w-full"
        lang={locale}
        onKeyDown={onContainerKeyDown}
      />
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-secondary)]">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" aria-hidden />
          <span className="sr-only">{t("loadingMap")}</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--surface-secondary)] p-6 text-center">
          <p className="text-sm text-[var(--text-secondary)]">{gis("mapLoadError")}</p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
          >
            <RotateCw className="h-3.5 w-3.5" />
            {gis("retry")}
          </button>
        </div>
      )}
    </div>
  );
});

export type { Extent };
