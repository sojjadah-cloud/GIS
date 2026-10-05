// Bilingual label + semantic color mappings for coded-value domains used across
// the dashboard. Centralized here so every chart, table, badge and map legend
// stays consistent. Colors reference the semantic CSS tokens defined in
// globals.css (success/warning/danger/info/neutral) rather than raw hex, so
// they stay correct in both themes.

export type Locale = "en" | "ar";

export interface DomainOption {
  code: string;
  label: { en: string; ar: string };
  color: string; // CSS variable name, e.g. "--color-success"
}

export const damageLevelDomain: DomainOption[] = [
  {
    code: "Destroyed (permanently uninhabi",
    label: { en: "Destroyed (permanently uninhabitable)", ar: "مدمر (غير صالح للسكن بشكل دائم)" },
    color: "--color-danger",
  },
  {
    code: "Major (uninhabitable, major rep",
    label: { en: "Major (uninhabitable, major repairs needed)", ar: "ضرر كبير (غير صالح للسكن، يتطلب إصلاحات كبيرة)" },
    color: "--color-danger",
  },
  {
    code: "Minor (uninhabitable, minor rep",
    label: { en: "Minor (uninhabitable, minor repairs needed)", ar: "ضرر طفيف (غير صالح للسكن، يتطلب إصلاحات بسيطة)" },
    color: "--color-warning",
  },
  {
    code: "Affected (habitable)",
    label: { en: "Affected (habitable)", ar: "متضرر (صالح للسكن)" },
    color: "--color-warning",
  },
  {
    code: "Not affected",
    label: { en: "Not affected", ar: "غير متضرر" },
    color: "--color-success",
  },
];

export const buildingTypeDomain: DomainOption[] = [
  { code: "Villa", label: { en: "Villa", ar: "فيلا" }, color: "--color-info" },
  { code: "Apartment", label: { en: "Apartment", ar: "شقة" }, color: "--color-primary" },
  { code: "House", label: { en: "House", ar: "منزل" }, color: "--color-success" },
  { code: "other", label: { en: "Other", ar: "أخرى" }, color: "--color-neutral" },
];

export const residenceDomain: DomainOption[] = [
  { code: "Less than 5 years", label: { en: "Less than 5 years", ar: "أقل من 5 سنوات" }, color: "--color-info" },
  { code: "5 - 10 years", label: { en: "5 - 10 years", ar: "5 - 10 سنوات" }, color: "--color-warning" },
  { code: "More than 10 years", label: { en: "More than 10 years", ar: "أكثر من 10 سنوات" }, color: "--color-success" },
];

export const yesNoDomain: DomainOption[] = [
  { code: "Yes", label: { en: "Yes", ar: "نعم" }, color: "--color-danger" },
  { code: "No", label: { en: "No", ar: "لا" }, color: "--color-success" },
];

// damage_type is a multi-select field; raw values are comma-joined codes.
export const damageTypeDomain: DomainOption[] = [
  {
    code: "Damage_to_property",
    label: { en: "Property Damage", ar: "أضرار الممتلكات" },
    color: "--color-chart-1",
  },
  {
    code: "Financial_losses_(vehicles_belo",
    label: { en: "Financial Losses (Vehicles & Belongings)", ar: "خسائر مالية (مركبات وممتلكات)" },
    color: "--color-chart-2",
  },
  {
    code: "Infrastructure_damage_(sanitati",
    label: { en: "Infrastructure Damage (Sanitation & Other)", ar: "أضرار البنية التحتية (الصرف الصحي وغيرها)" },
    color: "--color-chart-3",
  },
  {
    code: "other",
    label: { en: "Other", ar: "أخرى" },
    color: "--color-neutral",
  },
];

export function splitMultiValue(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

// Flood Risk_Level domain — raw values are "<arabic> - <english>" pairs.
export const riskLevelDomain: DomainOption[] = [
  { code: "آمن - Safe", label: { en: "Safe", ar: "آمن" }, color: "--color-success" },
  { code: "خطر منخفض - Low Risk", label: { en: "Low Risk", ar: "خطر منخفض" }, color: "--color-info" },
  { code: "خطر متوسط - Medium Risk", label: { en: "Medium Risk", ar: "خطر متوسط" }, color: "--color-warning" },
  { code: "خطر مرتفع - High Risk", label: { en: "High Risk", ar: "خطر مرتفع" }, color: "--color-danger" },
  {
    code: "خطر مرتفع جدًا - Very High Risk",
    label: { en: "Very High Risk", ar: "خطر مرتفع جدًا" },
    color: "--color-danger-strong",
  },
];

// Land-use codes (Arabic source values) shown in the flood-risk priority table.
export const landUseDomain: DomainOption[] = [
  { code: "سكني", label: { en: "Residential", ar: "سكني" }, color: "--color-info" },
  { code: "سكني/تجاري", label: { en: "Residential / Commercial", ar: "سكني/تجاري" }, color: "--color-chart-3" },
  { code: "حكومي", label: { en: "Government", ar: "حكومي" }, color: "--color-neutral" },
  { code: "تجاري", label: { en: "Commercial", ar: "تجاري" }, color: "--color-warning" },
  { code: "مسجد", label: { en: "Mosque", ar: "مسجد" }, color: "--color-success" },
  { code: "زراعى", label: { en: "Agricultural", ar: "زراعى" }, color: "--color-chart-5" },
  { code: "صناعي", label: { en: "Industrial", ar: "صناعي" }, color: "--color-chart-2" },
  { code: "كسارة", label: { en: "Quarry", ar: "كسارة" }, color: "--color-chart-6" },
  { code: " ", label: { en: "Unspecified", ar: "غير محدد" }, color: "--color-neutral" },
];

export const responseRatingDomain: DomainOption[] = ["1", "2", "3", "4", "5"].map((n) => ({
  code: n,
  label: { en: n, ar: n },
  color: "--color-neutral",
}));

function lookup(domain: DomainOption[], code: string | null | undefined): DomainOption | undefined {
  if (!code) return undefined;
  return domain.find((d) => d.code === code);
}

export function domainLabel(domain: DomainOption[], code: string | null | undefined, locale: Locale): string {
  const found = lookup(domain, code);
  if (found) return found.label[locale];
  return code ?? "—";
}

export function domainColor(domain: DomainOption[], code: string | null | undefined): string {
  return lookup(domain, code)?.color ?? "--color-neutral";
}
