import type { SurveyRecord } from "@/types/survey";
import {
  damageLevelDomain,
  buildingTypeDomain,
  residenceDomain,
  domainLabel,
  splitMultiValue,
  damageTypeDomain,
  type Locale,
} from "@/config/domains";

export interface Insight {
  id: string;
  kind: "top" | "share" | "count";
  text: string;
}

type TFn = (key: string, values?: Record<string, string | number>) => string;

function mostCommon<T extends string>(values: (T | null)[]): { value: T; count: number; share: number } | null {
  const present = values.filter((v): v is T => v != null && v !== "");
  if (present.length === 0) return null;
  const counts = new Map<T, number>();
  for (const v of present) counts.set(v, (counts.get(v) ?? 0) + 1);
  const [value, count] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return { value, count, share: count / present.length };
}

/** Generates plain-language observations strictly from the records passed in. */
export function buildInsights(records: SurveyRecord[], locale: Locale, t: TFn): Insight[] {
  if (records.length === 0) return [];
  const insights: Insight[] = [];
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  const damage = mostCommon(records.map((r) => r.damage_level));
  if (damage) {
    insights.push({
      id: "top-damage",
      kind: "top",
      text: t("insightTopDamage", {
        value: domainLabel(damageLevelDomain, damage.value, locale),
        share: pct(damage.share),
        count: damage.count,
      }),
    });
  }

  const building = mostCommon(records.map((r) => r.building_type));
  if (building) {
    insights.push({
      id: "top-building",
      kind: "top",
      text: t("insightTopBuilding", {
        value: domainLabel(buildingTypeDomain, building.value, locale),
        share: pct(building.share),
      }),
    });
  }

  const residence = mostCommon(records.map((r) => r.residence));
  if (residence) {
    insights.push({
      id: "top-residence",
      kind: "top",
      text: t("insightTopResidence", {
        value: domainLabel(residenceDomain, residence.value, locale),
        share: pct(residence.share),
      }),
    });
  }

  const displaced = records.filter((r) => r.displacement === "Yes").length;
  insights.push({
    id: "displacement-share",
    kind: "share",
    text: t("insightDisplacement", {
      count: displaced,
      total: records.length,
      share: pct(displaced / records.length),
    }),
  });

  const supportRequested = records.filter((r) => r.government_support_request === "Yes").length;
  insights.push({
    id: "support-share",
    kind: "share",
    text: t("insightSupport", {
      count: supportRequested,
      total: records.length,
      share: pct(supportRequested / records.length),
    }),
  });

  const damageTypeCounts = new Map<string, number>();
  for (const r of records) {
    for (const code of splitMultiValue(r.damage_type)) {
      damageTypeCounts.set(code, (damageTypeCounts.get(code) ?? 0) + 1);
    }
  }
  const topDamageType = [...damageTypeCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topDamageType) {
    insights.push({
      id: "top-damage-type",
      kind: "top",
      text: t("insightTopDamageType", {
        value: domainLabel(damageTypeDomain, topDamageType[0], locale),
        count: topDamageType[1],
      }),
    });
  }

  return insights;
}

export interface RiskTotals {
  total: number;
  safe: number;
  atRisk: number;
}

export function buildFloodRiskInsights(
  plots: RiskTotals | null,
  buildings: RiskTotals | null,
  topLandUse: { label: string; count: number } | null,
  t: TFn
): Insight[] {
  const insights: Insight[] = [];
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  if (plots && plots.total > 0) {
    insights.push({
      id: "plots-at-risk",
      kind: "share",
      text: t("insightPlotsAtRisk", {
        share: pct(plots.atRisk / plots.total),
        count: plots.atRisk,
        total: plots.total,
      }),
    });
  }

  if (buildings && buildings.total > 0) {
    insights.push({
      id: "buildings-at-risk",
      kind: "share",
      text: t("insightBuildingsAtRisk", {
        share: pct(buildings.atRisk / buildings.total),
        count: buildings.atRisk,
        total: buildings.total,
      }),
    });
  }

  if (topLandUse) {
    insights.push({
      id: "top-landuse",
      kind: "top",
      text: t("insightTopLandUse", { value: topLandUse.label, count: topLandUse.count }),
    });
  }

  if (plots && buildings && plots.total > 0 && buildings.total > 0) {
    const plotShare = plots.atRisk / plots.total;
    const buildingShare = buildings.atRisk / buildings.total;
    if (Math.abs(plotShare - buildingShare) > 0.02) {
      const higherIsPlots = plotShare > buildingShare;
      insights.push({
        id: "risk-comparison",
        kind: "share",
        text: t("insightRiskComparison", {
          higher: t(higherIsPlots ? "plots" : "buildings"),
          lower: t(higherIsPlots ? "buildings" : "plots"),
          higherShare: pct(Math.max(plotShare, buildingShare)),
          lowerShare: pct(Math.min(plotShare, buildingShare)),
        }),
      });
    }
  }

  return insights;
}
