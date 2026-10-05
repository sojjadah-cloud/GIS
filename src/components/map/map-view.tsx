"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { ArcgisMapViewProps } from "./arcgis-map-view";

function MapLoadingFallback() {
  return (
    <div className="flex h-full min-h-[360px] w-full items-center justify-center bg-[var(--surface-secondary)]">
      <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" aria-hidden />
    </div>
  );
}

// @arcgis/core touches `window` during MapView construction, so it must only
// ever run in the browser.
export const MapView = dynamic<ArcgisMapViewProps>(
  () => import("./arcgis-map-view").then((m) => m.ArcgisMapView),
  { ssr: false, loading: MapLoadingFallback }
);
