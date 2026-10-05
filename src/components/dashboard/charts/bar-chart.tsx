"use client";

import ReactECharts from "echarts-for-react";
import { useChartColors, colorForVar } from "@/lib/chart-theme";
import { useLocale } from "next-intl";

export interface BarDatum {
  name: string;
  value: number;
  colorVar?: string;
}

export function BarChart({
  data,
  height = 240,
  horizontal = true,
  valueLabel,
}: {
  data: BarDatum[];
  height?: number;
  horizontal?: boolean;
  valueLabel?: string;
}) {
  const colors = useChartColors();
  const locale = useLocale();
  const isRtl = locale === "ar";

  const categoryAxis = {
    type: "category" as const,
    data: data.map((d) => d.name),
    axisLine: { lineStyle: { color: colors.border } },
    axisLabel: { color: colors.textSecondary, fontSize: 11, width: 110, overflow: "truncate" as const },
    axisTick: { show: false },
  };
  const valueAxis = {
    type: "value" as const,
    name: valueLabel,
    nameTextStyle: { color: colors.textTertiary, fontSize: 11 },
    axisLine: { show: false },
    axisLabel: { color: colors.textSecondary, fontSize: 11 },
    splitLine: { lineStyle: { color: colors.border, type: "dashed" as const } },
  };

  const option = {
    textStyle: { fontFamily: isRtl ? "var(--font-sans-ar)" : "var(--font-sans-en)" },
    grid: { left: horizontal ? 8 : 8, right: 16, top: 16, bottom: horizontal ? 8 : 32, containLabel: true },
    tooltip: {
      trigger: "item",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      textStyle: { color: colors.textPrimary },
      confine: true,
    },
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    series: [
      {
        type: "bar",
        data: data.map((d, i) => ({
          value: d.value,
          itemStyle: {
            color: d.colorVar ? colorForVar(d.colorVar, colors) : colors.categorical[i % colors.categorical.length],
            borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
          },
        })),
        barMaxWidth: 28,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} notMerge />;
}
