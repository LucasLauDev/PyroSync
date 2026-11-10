export interface Hotspot {
  lat: number;
  lon: number;
  date: string;
  time: string;
  sensor: "MODIS" | "VIIRS";
  satellite?: string;
  frp: number;
  harmonized_frp: number;
  bright: number;
  daynight: "D" | "N";
  confidence: "high" | "nominal" | "low";
}

export interface CalendarMonth {
  month: number;
  modis_count: number;
  viirs_count: number;
  harmonized_count: number;
  active_fire_hex_days: number;
  harmonized_frp_mw: number;
  historical_median: number;
  historical_iqr: number;
  historical_p10: number;
  historical_p90: number;
  relative_anomaly_pct: number;
  robust_z_score: number;
  trend_diff: number;
  trend_pct: number;
  anomaly_status: "Normal Baseline" | "Above Normal" | "Extreme Outbreak" | "Below Normal" | "Extreme Deficit";
}

export interface SeasonTiming {
  onset_month: number;
  peak_month: number;
  cessation_month: number;
  duration_months: number;
}

export interface CalendarYear {
  year: number;
  annual_total_harmonized: number;
  season_timing: SeasonTiming;
  months: CalendarMonth[];
}

export interface MonthlyBaseline {
  median: number;
  iqr: number;
  q1: number;
  q3: number;
  p10: number;
  p90: number;
  min: number;
  max: number;
}

export interface RegionalCalendarData {
  region: string;
  overlap_continuity_factor: number;
  baseline_period: string;
  monthly_baselines: Record<string, MonthlyBaseline>;
  calendar: CalendarYear[];
  daily_series_2026?: DailyRecord[];
}

export interface DailyRecord {
  date: string;
  modis_count: number;
  viirs_npp_count: number;
  viirs_noaa20_count: number;
  viirs_noaa21_count: number;
  viirs_total_count: number;
  total_raw_count: number;
  harmonized_count: number;
  harmonized_frp_mw: number;
  modis_frp_mw: number;
  viirs_frp_mw: number;
  day_fires: number;
  night_fires: number;
}

export type HarmonizationMode =
  | "overlap_scaled"
  | "active_fire_hex_days"
  | "vza_frp"
  | "modis_equivalent";

export type ColorRampType =
  | "flame"
  | "viridis"
  | "inferno"
  | "diverging_anomaly";

export type ViewMetric =
  | "harmonized_count"
  | "harmonized_frp_mw"
  | "active_fire_hex_days"
  | "relative_anomaly_pct"
  | "robust_z_score";

export interface RemarkArea {
  type: "none" | "bbox" | "circle";
  bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  circle?: {
    lat: number;
    lng?: number;
    lon?: number;
    radiusKm: number;
  };
  name?: string;
}

export interface RegionPreset {
  id: string;
  name: string;
  description: string;
  center: [number, number];
  zoom: number;
  continuityFactor: number;
}
