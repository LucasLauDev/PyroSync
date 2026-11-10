import { ColorRampType, ViewMetric } from "./types";

// Linear interpolation between two hex colors
function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 255;
  const g1 = (c1 >> 8) & 255;
  const b1 = c1 & 255;

  const r2 = (c2 >> 16) & 255;
  const g2 = (c2 >> 8) & 255;
  const b2 = c2 & 255;

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Multi-stop color scale interpolation
function getMultiStopColor(stops: { pos: number; color: string }[], t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped >= stops[i].pos && clamped <= stops[i + 1].pos) {
      const localT = (clamped - stops[i].pos) / (stops[i + 1].pos - stops[i].pos);
      return interpolateColor(stops[i].color, stops[i + 1].color, localT);
    }
  }
  return stops[stops.length - 1].color;
}

// Flame / Thermal scale (Pale yellow -> Tangerine -> Crimson -> Deep Maroon)
const FLAME_STOPS = [
  { pos: 0.0, color: "#1e293b" }, // dark slate base for zero/low
  { pos: 0.15, color: "#fef08a" }, // pale yellow
  { pos: 0.45, color: "#f97316" }, // vibrant orange
  { pos: 0.75, color: "#dc2626" }, // fire red
  { pos: 1.0, color: "#881337" }, // deep dark burgundy
];

// Viridis scale (Perceptually uniform colorblind-safe)
const VIRIDIS_STOPS = [
  { pos: 0.0, color: "#1e293b" }, // slate base
  { pos: 0.2, color: "#440154" }, // purple
  { pos: 0.45, color: "#31688e" }, // blue
  { pos: 0.7, color: "#35b779" }, // green
  { pos: 1.0, color: "#fde725" }, // yellow
];

// Inferno scale (Black -> Purple -> Red -> Orange -> Yellow)
const INFERNO_STOPS = [
  { pos: 0.0, color: "#0f172a" },
  { pos: 0.25, color: "#57106e" },
  { pos: 0.55, color: "#bb3754" },
  { pos: 0.8, color: "#f98e09" },
  { pos: 1.0, color: "#fcffa4" },
];

// Diverging Anomaly scale:
// -2.5 (Severe Deficit: Deep Blue #1e40af)
// -1.0 (Mild Deficit: Light Blue #60a5fa)
// 0.0 (Baseline: Slate #475569)
// +1.0 (Mild Outbreak: Orange #f97316)
// +2.5 (Severe Outbreak: Vibrant Magenta-Crimson #e11d48)
const DIVERGING_STOPS = [
  { pos: 0.0, color: "#1d4ed8" }, // Cool Blue
  { pos: 0.25, color: "#60a5fa" }, // Light Blue
  { pos: 0.5, color: "#334155" }, // Slate Neutral
  { pos: 0.75, color: "#f97316" }, // Orange Warning
  { pos: 1.0, color: "#e11d48" }, // Magenta Red Outbreak
];

/**
 * Returns hex color code for a given metric value, scale min/max, and chosen ramp
 */
export function getMetricColor(
  value: number,
  minVal: number,
  maxVal: number,
  ramp: ColorRampType,
  metric: ViewMetric
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "#1e293b";
  }

  // Handle diverging anomaly view (based on Robust Z-Score or Relative Anomaly %)
  if (ramp === "diverging_anomaly" || metric === "robust_z_score" || metric === "relative_anomaly_pct") {
    if (metric === "robust_z_score") {
      // Map Z from -2.5 to +2.5 onto 0.0 to 1.0
      const normZ = (value + 2.5) / 5.0;
      return getMultiStopColor(DIVERGING_STOPS, normZ);
    } else if (metric === "relative_anomaly_pct") {
      // Map % from -100% to +100% onto 0.0 to 1.0
      const normPct = (value + 100) / 200;
      return getMultiStopColor(DIVERGING_STOPS, normPct);
    }
  }

  // Sequential ramps
  const range = maxVal - minVal;
  const t = range > 0 ? (value - minVal) / range : 0;

  switch (ramp) {
    case "viridis":
      return getMultiStopColor(VIRIDIS_STOPS, t);
    case "inferno":
      return getMultiStopColor(INFERNO_STOPS, t);
    case "flame":
    default:
      return getMultiStopColor(FLAME_STOPS, t);
  }
}

/**
 * Returns text contrast color (white or dark) based on background brightness
 */
export function getContrastTextColor(hexColor: string): string {
  const c = parseInt(hexColor.replace("#", ""), 16);
  const r = (c >> 16) & 255;
  const g = (c >> 8) & 255;
  const b = c & 255;
  // Perceived luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#0f172a" : "#f8fafc";
}
