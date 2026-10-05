export interface SurveyRecord {
  objectid: number;
  globalid: string;
  incident_name: string | null;
  date_and_time_of_incident: number | null;
  address_question: string | null;
  building_type: string | null;
  residence: string | null;
  damage_type: string | null;
  damage_level: string | null;
  displacement: string | null;
  government_support_request: string | null;
  response_rating: string | null;
  notes: string | null;
  x: number | null;
  y: number | null;
}

export interface EsriFeature {
  attributes: Omit<SurveyRecord, "x" | "y">;
  geometry?: { x?: number; y?: number };
}

export function toSurveyRecord(f: EsriFeature): SurveyRecord {
  return {
    ...f.attributes,
    x: f.geometry?.x ?? null,
    y: f.geometry?.y ?? null,
  };
}
