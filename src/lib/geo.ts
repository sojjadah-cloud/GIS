// Minimal WGS84 <-> Web Mercator helpers so we can spatially filter small
// client-side datasets against an @arcgis/core view extent (which reports in
// the view's spatial reference, typically Web Mercator / wkid 102100).

const R = 6378137;

export function lonLatToWebMercator(lon: number, lat: number): [number, number] {
  const x = (lon * Math.PI * R) / 180;
  const y = R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  return [x, y];
}

export function pointInExtent(
  lon: number,
  lat: number,
  extent: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    spatialReference?: { wkid?: number | null } | null;
  } | null
): boolean {
  if (!extent) return true;
  const isGeographic = extent.spatialReference?.wkid === 4326;
  const [x, y] = isGeographic ? [lon, lat] : lonLatToWebMercator(lon, lat);
  return x >= extent.xmin && x <= extent.xmax && y >= extent.ymin && y <= extent.ymax;
}
