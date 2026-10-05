"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useUIStore } from "@/store/ui-store";

export interface ChartColors {
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  surface: string;
  primary: string;
  success: string;
  warning: string;
  danger: string;
  dangerStrong: string;
  info: string;
  neutral: string;
  categorical: string[];
}

function readVar(name: string) {
  if (typeof window === "undefined") return "#000000";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function readColors(): ChartColors {
  return {
    textPrimary: readVar("--text-primary"),
    textSecondary: readVar("--text-secondary"),
    textTertiary: readVar("--text-tertiary"),
    border: readVar("--border"),
    surface: readVar("--surface"),
    primary: readVar("--primary"),
    success: readVar("--success"),
    warning: readVar("--warning"),
    danger: readVar("--danger"),
    dangerStrong: readVar("--danger-strong"),
    info: readVar("--info"),
    neutral: readVar("--neutral"),
    categorical: [
      readVar("--chart-1"),
      readVar("--chart-2"),
      readVar("--chart-3"),
      readVar("--chart-4"),
      readVar("--chart-5"),
      readVar("--chart-6"),
    ],
  };
}

/** Resolves theme-aware chart colors from CSS custom properties, re-reading on theme toggle. */
export function useChartColors(): ChartColors {
  const theme = useUIStore((s) => s.theme);
  const [colors, setColors] = useState<ChartColors>(readColors);

  useEffect(() => {
    setColors(readColors());
  }, [theme]);

  return colors;
}

/**
 * Resolves the actual (canvas-usable) font-family stack for the current
 * locale. ECharts renders to canvas, which can't resolve CSS custom
 * properties like `var(--font-sans-ar)`, so this reads the browser's fully
 * computed font-family off <body> instead of passing the raw var() string.
 */
export function useChartFontFamily(): string {
  const locale = useLocale();
  const [fontFamily, setFontFamily] = useState("sans-serif");

  useEffect(() => {
    if (typeof document === "undefined") return;
    setFontFamily(getComputedStyle(document.body).fontFamily || "sans-serif");
  }, [locale]);

  return fontFamily;
}

export function colorForVar(varName: string, colors: ChartColors): string {
  const map: Record<string, string> = {
    "--color-success": colors.success,
    "--color-warning": colors.warning,
    "--color-danger": colors.danger,
    "--color-danger-strong": colors.dangerStrong,
    "--color-info": colors.info,
    "--color-neutral": colors.neutral,
    "--color-primary": colors.primary,
    "--color-chart-1": colors.categorical[0],
    "--color-chart-2": colors.categorical[1],
    "--color-chart-3": colors.categorical[2],
    "--color-chart-4": colors.categorical[3],
    "--color-chart-5": colors.categorical[4],
    "--color-chart-6": colors.categorical[5],
  };
  return map[varName] ?? colors.neutral;
}
