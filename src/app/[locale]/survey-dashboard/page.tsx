"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Waves, HeartHandshake, MapPin, Info } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { PieChart } from "@/components/dashboard/charts/pie-chart";
import { BarChart } from "@/components/dashboard/charts/bar-chart";
import { GaugeChart } from "@/components/dashboard/charts/gauge-chart";
import { ChartLegend } from "@/components/dashboard/charts/chart-legend";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MapView } from "@/components/map/map-view";
import type { MapPoint } from "@/components/map/arcgis-map-view";
import { useAsyncData } from "@/hooks/use-async-data";
import { useChartColors } from "@/lib/chart-theme";
import { pointInExtent } from "@/lib/geo";
import { queryFeatures } from "@/services/arcgis/query";
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
import { formatDate, formatNumber } from "@/lib/utils";

const EXCLUDED_ADDRESS = "جنوب الباطنة، غلا، غلا الصناعية، 1564";

const DAMAGE_LEVEL_RGB: Record<string, [number, number, number]> = {
  "Destroyed (permanently uninhabi": [122, 39, 26],
  "Major (uninhabitable, major rep": [180, 35, 24],
  "Minor (uninhabitable, minor rep": [181, 71, 8],
  "Affected (habitable)": [181, 71, 8],
  "Not affected": [18, 128, 92],
};

export default function SurveyDashboardPage() {
  const t = useTranslations("surveyDashboard");
  const common = useTranslations("common");
  const locale = useLocale() as "en" | "ar";
  const colors = useChartColors();

  const [extent, setExtent] = useState<__esri.Extent | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

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
    if (!extent) return allRecords;
    return allRecords.filter((r) => r.x != null && r.y != null && pointInExtent(r.x, r.y, extent));
  }, [allRecords, extent]);

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

  const displacementCount = filteredRecords.length;
  const supportRequestCount = filteredRecords.filter((r) => r.government_support_request === "Yes").length;

  const incidentRows = useMemo(
    () => filteredRecords.filter((r) => r.address_question !== EXCLUDED_ADDRESS),
    [filteredRecords]
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

  const buildingColumns: DataTableColumn<SurveyRecord & { id: number }>[] = [
    {
      key: "damage",
      header: t("damageLevel"),
      render: (r) => domainLabel(damageLevelDomain, r.damage_level, locale),
    },
    { key: "building", header: t("buildingType"), render: (r) => domainLabel(buildingTypeDomain, r.building_type, locale) },
  ];

  const mapPoints: MapPoint[] = allRecords.map((r) => ({
    id: r.objectid,
    x: r.x ?? 0,
    y: r.y ?? 0,
    colorRgb: DAMAGE_LEVEL_RGB[r.damage_level ?? ""] ?? [14, 124, 134],
    attributes: { objectid: r.objectid },
  }));

  const focusPoint = selected?.x != null && selected?.y != null ? { x: selected.x, y: selected.y } : null;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">{t("title")}</h1>
        <p dir="rtl" className="text-sm text-[var(--text-secondary)]">
          {t("titleAr")}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label={t("displacement")}
          value={formatNumber(displacementCount, locale)}
          icon={Waves}
          tone="info"
          loading={recordsState.status === "loading"}
        />
        <ChartCard
          title={t("governmentSupportRequest")}
          loading={recordsState.status === "loading"}
          bodyClassName="flex items-center justify-center"
        >
          <GaugeChart value={supportRequestCount} max={Math.max(filteredRecords.length, 1)} color="warning" height={140} />
        </ChartCard>
        <ChartCard title={t("residence")} loading={recordsState.status === "loading"} empty={residenceData.length === 0} bodyClassName="flex flex-col items-center">
          <PieChart data={residenceData} height={160} />
        </ChartCard>
        <KpiCard
          label={common("total")}
          value={formatNumber(filteredRecords.length, locale)}
          icon={HeartHandshake}
          tone="primary"
          loading={recordsState.status === "loading"}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <ChartCard title={common("viewMap")} bodyClassName="p-0" className="overflow-hidden">
          <MapView
            webmapId={WEBMAP_BOWSHER_ID}
            heightClassName="h-[420px]"
            points={mapPoints}
            selectedPointId={selectedId}
            focusPoint={focusPoint}
            onExtentChange={setExtent}
            onFeatureClick={(attrs) => setSelectedId(attrs ? (attrs.objectid as number) : null)}
          />
        </ChartCard>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{t("featureDetails")}</CardTitle>
          </CardHeader>
          <CardBody className="flex-1">
            {selected ? (
              <FeatureDetails record={selected} locale={locale} t={t} />
            ) : (
              <EmptyState icon={MapPin} title={t("selectFeatureHint")} />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title={t("damageType")} loading={recordsState.status === "loading"} empty={damageTypeData.length === 0}>
          <BarChart data={damageTypeData} valueLabel={common("count")} />
        </ChartCard>
        <ChartCard title={t("residence")} loading={recordsState.status === "loading"} empty={residenceData.length === 0}>
          <PieChart data={residenceData} />
          <ChartLegend items={residenceData} colors={colors} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title={t("addressDamageTable")}
          loading={recordsState.status === "loading"}
          empty={incidentRows.length === 0}
          emptyLabel={common("noData")}
        >
          <DataTable
            columns={incidentColumns}
            rows={incidentRows.map((r) => ({ ...r, id: r.objectid }))}
            onRowClick={(r) => setSelectedId(r.objectid)}
            selectedId={selectedId ?? undefined}
          />
        </ChartCard>
        <ChartCard
          title={t("damageBuildingTable")}
          loading={recordsState.status === "loading"}
          empty={filteredRecords.length === 0}
          emptyLabel={common("noData")}
        >
          <DataTable
            columns={buildingColumns}
            rows={filteredRecords.map((r) => ({ ...r, id: r.objectid }))}
            onRowClick={(r) => setSelectedId(r.objectid)}
            selectedId={selectedId ?? undefined}
          />
        </ChartCard>
      </div>
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
