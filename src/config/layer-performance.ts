// The authored Bowsher_Project_2_2 web map shows several very large layers
// by default (Plot_Plan_Bowsher_2018: ~35k features, Total_Plots_at_Risk:
// ~26.5k, Total_Buildings_at_Risk: ~32.5k, Labling_Safe_VeryHigh: ~12k text
// labels) with no authored scale restriction, so every page that loaded
// this web map was rendering 100k+ features on initial load regardless of
// whether that page actually needed them. This caps the heaviest layers to
// only render once the user has zoomed in close enough that a reasonable
// number of features fall in view, applied regardless of which page/default
// visibility a layer has.
// Only the genuinely huge layers (30k+ features, or 12k individual text
// labels) are capped. Plot_risk_s8_Vector/building_risk_s8_Vector (~10-13k
// features) are a page's actual primary content when shown, so they're left
// uncapped -- scale-capping them would make the Flood Risk page's own
// choropleth require zooming in before it appears, which defeats the point.
export const LAYER_MIN_SCALE_CAPS: Record<string, number> = {
  Plot_Plan_Bowsher_2018: 72223,
  Total_Plots_at_Risk: 72223,
  Total_Buildings_at_Risk: 72223,
  Study_Area_Buildings_2018: 72223,
  Labling_Safe_VeryHigh: 72223,
};
