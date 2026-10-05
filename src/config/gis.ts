// Public ArcGIS Online resources used by WadiWise, resolved from the reference
// Experience Builder app (item 80eec2092998480f880272ee7d7b6e89). All items are
// publicly shared (access: "public") and require no API key to read.
export const ARCGIS_PORTAL_URL = "https://www.arcgis.com";

// Primary operational web map: Bowsher_Project_2_2
// Contains the plot/building risk layers, streams, roads, contours, imagery basemap.
export const WEBMAP_BOWSHER_ID = "32d49a55d8354ecfb786307115591515";

// Standalone flood-risk web map (not currently embedded by an active page, kept
// for reference / future use).
export const WEBMAP_FLOODRISK_ID = "19977e33d5404a609adb89dd7005fb8f";

// Property Damage Assessment Survey — Survey123 hosted feature layer.
export const SURVEY_FEATURE_SERVICE_URL =
  "https://services7.arcgis.com/4ntBIvlbmusvw3cv/arcgis/rest/services/survey123_82629c86a3c44d7e90f4928381487fc5/FeatureServer";
export const SURVEY_LAYER_ID = 0;
export const SURVEY_ITEM_ID = "c92bd13c7137493d80b3e54f1915032e";

// Survey123 public form (for the "Survey" page — citizens submit new reports).
export const SURVEY123_FORM_URL = "https://arcg.is/1KX1bO2";

// Flood risk classification layers (within WEBMAP_BOWSHER_ID), used by the
// Wadi Al Ansab Early Warning dashboard.
export const PLOT_RISK_FEATURE_SERVICE_URL =
  "https://services7.arcgis.com/4ntBIvlbmusvw3cv/arcgis/rest/services/Plot_risk_s8/FeatureServer";
export const PLOT_RISK_LAYER_ID = 1;

export const BUILDING_RISK_FEATURE_SERVICE_URL =
  "https://services7.arcgis.com/4ntBIvlbmusvw3cv/arcgis/rest/services/building_risk_s8/FeatureServer";
export const BUILDING_RISK_LAYER_ID = 5;

// Plot plan layer used for "Enter Plot ID" search on the Wadi Al-Ansab Map page.
export const PLOT_PLAN_FEATURE_SERVICE_URL =
  "https://services7.arcgis.com/4ntBIvlbmusvw3cv/arcgis/rest/services/Bowsher_Project_2_WFL1/FeatureServer";
export const PLOT_PLAN_LAYER_ID = 2;
export const PLOT_PLAN_SEARCH_FIELD = "PLOTNUMBER";

// Default map camera over Wadi Al-Ansab / Bawshar, Muscat (matches the
// reference app's saved initial extent).
export const DEFAULT_MAP_CENTER: [number, number] = [58.41, 23.58];
export const DEFAULT_MAP_ZOOM = 13;
