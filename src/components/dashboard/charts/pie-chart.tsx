"use client";

import ReactECharts from "echarts-for-react";
import { useChartColors, colorForVar } from "@/lib/chart-theme";
import { useLocale } from "next-intl";

export interface PieDatum {
  name: string;
  value: number;
  colorVar?: string;
}

export function PieChart({ data, height = 240 }: { data: PieDatum[]; height?: number }) {
  const colors = useChartColors();
  const locale = useLocale();
  const isRtl = locale === "ar";

  const option = {
    textStyle: { fontFamily: isRtl ? "var(--font-sans-ar)" : "var(--font-sans-en)" },
    tooltip: {
      trigger: "item",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      textStyle: { color: colors.textPrimary },
      confine: true,
    },
    series: [
      {
        type: "pie",
        radius: ["45%", "72%"],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: colors.surface, borderWidth: 2 },
        label: {
          formatter: "{d}%",
          color: colors.textSecondary,
          fontSize: 11,
        },
        labelLine: { lineStyle: { color: colors.border } },
        data: data.map((d, i) => ({
          name: d.name,
          value: d.value,
          itemStyle: {
            color: d.colorVar ? colorForVar(d.colorVar, colors) : colors.categorical[i % colors.categorical.length],
          },
        })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} notMerge />;
}
