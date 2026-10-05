import type { MapViewStatus } from "@/components/map/arcgis-map-view";
import { formatNumber } from "@/lib/utils";

export function MapStatusBar({
  status,
  featureLabel,
  showFeatureCount = true,
}: {
  status: MapViewStatus | null;
  featureLabel: string;
  showFeatureCount?: boolean;
}) {
  if (!status) return null;

  // GIS convention: scale ratios, coordinates and feature counts in a status
  // bar stay in Western numerals regardless of UI language.
  const scaleLabel = `1:${formatNumber(status.scale, "en")}`;
  const coordLabel = status.center
    ? `${status.center.lat.toFixed(4)}°, ${status.center.lon.toFixed(4)}°`
    : "—";

  return (
    <div
      className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)]/90 px-4 py-1.5 text-xs text-[var(--text-secondary)] shadow-sm backdrop-blur"
      dir="ltr"
    >
      <span className="tabular-nums">{scaleLabel}</span>
      <span className="h-3 w-px bg-[var(--border)]" aria-hidden />
      <span className="tabular-nums">{coordLabel}</span>
      {showFeatureCount && (
        <>
          <span className="h-3 w-px bg-[var(--border)]" aria-hidden />
          <span className="font-medium text-[var(--text-primary)] tabular-nums">
            {formatNumber(status.visiblePointCount, "en")} {featureLabel}
          </span>
        </>
      )}
    </div>
  );
}
