export type MarkerCategory = "space" | "observatory" | "landmark" | "custom" | "search";

export interface MapMarker {
  id: string;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  category: MarkerCategory;
  color: string;
  isPreset?: boolean;
  elevation?: string;
  badge?: string;
  createdAt?: string;
}

export interface TileLayerConfig {
  id: string;
  name: string;
  url: string;
  attribution: string;
  subdomains?: string[];
  maxZoom: number;
  minZoom?: number;
  description: string;
  theme: "standard" | "light" | "dark" | "humanitarian" | "topo";
  badge?: string;
}

export interface SearchResult {
  placeId: number | string;
  displayName: string;
  name: string;
  lat: number;
  lon: number;
  type: string;
  category: string;
}

export type MapToolMode =
  | "pan"
  | "add-marker"
  | "measure"
  | "radius"
  | "remark-box"
  | "remark-circle";

export interface MeasurePoint {
  lat: number;
  lng: number;
  distanceFromPrev: number; // in meters
  totalDistance: number; // in meters
}

export interface RadiusZone {
  center: [number, number] | null;
  radiusKm: number;
}

export interface MapCoordinates {
  lat: number;
  lng: number;
}

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

export interface HotspotPoint {
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
