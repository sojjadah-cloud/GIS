import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-OM" : "en-OM").format(value);
}

export function formatDate(value: number | Date, locale: string) {
  const d = typeof value === "number" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-OM" : "en-OM", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}
