"use client";

import ReactECharts from "echarts-for-react";
import { useChartColors, useChartFontFamily } from "@/lib/chart-theme";

export function GaugeChart({
  value,
  max,
  height = 180,
  color,
}: {
  value: number;
  max: number;
  height?: number;
  /** "success" | "warning" | "danger" — defaults to a value-based ramp */
  color?: "success" | "warning" | "danger";
}) {
  const colors = useChartColors();
  const fontFamily = useChartFontFamily();
  const ratio = max > 0 ? value / max : 0;
  const resolvedColor =
    color === "success"
      ? colors.success
      : color === "warning"
        ? colors.warning
        : color === "danger"
          ? colors.danger
          : ratio < 0.34
            ? colors.success
            : ratio < 0.67
              ? colors.warning
              : colors.danger;

  const option = {
    textStyle: { fontFamily },
    series: [
      {
        type: "gauge",
        min: 0,
        max: Math.max(max, 1),
        startAngle: 210,
        endAngle: -30,
        radius: "90%",
        center: ["50%", "62%"],
        progress: { show: true, width: 14, itemStyle: { color: resolvedColor } },
        axisLine: { lineStyle: { width: 14, color: [[1, colors.border]] } },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 26,
          fontWeight: 700,
          color: colors.textPrimary,
          offsetCenter: [0, "10%"],
          formatter: () => `${value}`,
        },
        data: [{ value }],
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} notMerge />;
}
