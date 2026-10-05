// Lightweight REST helpers for querying public ArcGIS Feature Services.
// Used by KPI/chart/table widgets that only need JSON attribute data — the
// full @arcgis/core MapView is reserved for the actual map panels, keeping
// non-map pages light.

export interface StatDefinition {
  statisticType: "count" | "sum" | "avg" | "min" | "max";
  onStatisticField: string;
  outStatisticFieldName: string;
}

function layerUrl(serviceUrl: string, layerId: number) {
  return `${serviceUrl.replace(/\/$/, "")}/${layerId}`;
}

export interface EsriGeometry {
  x?: number;
  y?: number;
  rings?: number[][][];
  paths?: number[][][];
}

export async function queryFeatures<T = Record<string, unknown>>(
  serviceUrl: string,
  layerId: number,
  options: {
    where?: string;
    outFields?: string[];
    orderByFields?: string[];
    resultRecordCount?: number;
    returnGeometry?: boolean;
    outSR?: number;
  } = {}
): Promise<{ attributes: T; geometry?: EsriGeometry }[]> {
  const params = new URLSearchParams({
    where: options.where ?? "1=1",
    outFields: (options.outFields ?? ["*"]).join(","),
    f: "json",
    returnGeometry: String(options.returnGeometry ?? false),
  });
  if (options.orderByFields) params.set("orderByFields", options.orderByFields.join(","));
  if (options.resultRecordCount) params.set("resultRecordCount", String(options.resultRecordCount));
  if (options.outSR) params.set("outSR", String(options.outSR));

  const res = await fetch(`${layerUrl(serviceUrl, layerId)}/query?${params.toString()}`);
  if (!res.ok) throw new Error(`ArcGIS query failed: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message ?? "ArcGIS query error");
  return json.features ?? [];
}

/** Centroid of a polygon/point geometry's first ring, for zoom targeting. */
export function geometryCentroid(geometry?: EsriGeometry): { x: number; y: number } | null {
  if (!geometry) return null;
  if (typeof geometry.x === "number" && typeof geometry.y === "number") {
    return { x: geometry.x, y: geometry.y };
  }
  const ring = geometry.rings?.[0] ?? geometry.paths?.[0];
  if (!ring || ring.length === 0) return null;
  const sum = ring.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
  return { x: sum[0] / ring.length, y: sum[1] / ring.length };
}

export async function queryGroupedCounts(
  serviceUrl: string,
  layerId: number,
  groupByField: string,
  options: { where?: string } = {}
): Promise<{ value: string | null; count: number }[]> {
  const outStatisticFieldName = "cnt";
  const statDef: StatDefinition[] = [
    { statisticType: "count", onStatisticField: "OBJECTID", outStatisticFieldName },
  ];
  const params = new URLSearchParams({
    where: options.where ?? "1=1",
    groupByFieldsForStatistics: groupByField,
    outStatistics: JSON.stringify(statDef),
    f: "json",
  });

  const res = await fetch(`${layerUrl(serviceUrl, layerId)}/query?${params.toString()}`);
  if (!res.ok) throw new Error(`ArcGIS query failed: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message ?? "ArcGIS query error");
  return (json.features ?? []).map((f: { attributes: Record<string, unknown> }) => ({
    value: (f.attributes[groupByField] as string | null) ?? null,
    count: Number(f.attributes[outStatisticFieldName]),
  }));
}

export async function queryGroupedCountsMulti(
  serviceUrl: string,
  layerId: number,
  groupByFields: string[],
  options: { where?: string; orderByDesc?: boolean; resultRecordCount?: number } = {}
): Promise<Record<string, unknown>[]> {
  const outStatisticFieldName = "cnt";
  const statDef: StatDefinition[] = [
    { statisticType: "count", onStatisticField: "OBJECTID", outStatisticFieldName },
  ];
  const params = new URLSearchParams({
    where: options.where ?? "1=1",
    groupByFieldsForStatistics: groupByFields.join(","),
    outStatistics: JSON.stringify(statDef),
    f: "json",
  });
  if (options.orderByDesc) params.set("orderByFields", `${outStatisticFieldName} DESC`);
  if (options.resultRecordCount) params.set("resultRecordCount", String(options.resultRecordCount));

  const res = await fetch(`${layerUrl(serviceUrl, layerId)}/query?${params.toString()}`);
  if (!res.ok) throw new Error(`ArcGIS query failed: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message ?? "ArcGIS query error");
  return (json.features ?? []).map((f: { attributes: Record<string, unknown> }) => f.attributes);
}

export async function queryCount(
  serviceUrl: string,
  layerId: number,
  options: { where?: string } = {}
): Promise<number> {
  const params = new URLSearchParams({
    where: options.where ?? "1=1",
    returnCountOnly: "true",
    f: "json",
  });
  const res = await fetch(`${layerUrl(serviceUrl, layerId)}/query?${params.toString()}`);
  if (!res.ok) throw new Error(`ArcGIS query failed: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message ?? "ArcGIS query error");
  return json.count ?? 0;
}
