import { MONTH_NAMES } from "../constants";
import { RegionalCalendarData, CalendarMonth } from "../types";
import { getMonthlyMetricValue } from "./comparison-types";

export interface CumulativeParams {
  months: CalendarMonth[];
  sensor: "all" | "MODIS" | "VIIRS";
  metric: "harmonized_count" | "hex_days" | "frp_mw";
  daynight: "all" | "D" | "N";
  nightRatio: number;
  data: RegionalCalendarData | null;
  regionName: string;
  year: number;
  color: string;
  bgLight: string;
}

export function buildCumulativeDataset(p: CumulativeParams) {
  let running = 0;
  const curve = (p.months || []).map((m) => {
    running += getMonthlyMetricValue(m, p.sensor, p.metric, p.daynight, p.nightRatio);
    return running;
  });
  let baseRunning = 0;
  const baseCurve = MONTH_NAMES.map((_, idx) => {
    const b = p.data?.monthly_baselines[String(idx + 1)];
    let baseVal = b?.median || 0;
    if (p.daynight === "D") baseVal *= 1 - p.nightRatio;
    if (p.daynight === "N") baseVal *= p.nightRatio;
    baseRunning += Math.round(baseVal);
    return baseRunning;
  });
  return {
    labels: MONTH_NAMES,
    datasets: [
      {
        label: `${p.regionName} (${p.year})`,
        data: curve,
        borderColor: p.color,
        backgroundColor: p.bgLight,
        fill: true,
        tension: 0.3,
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: p.color,
      },
      {
        label: `${p.regionName} 26-Yr Median`,
        data: baseCurve,
        borderColor: "rgba(148, 163, 184, 0.6)",
        borderDash: [5, 5],
        tension: 0.3,
        borderWidth: 1.5,
        pointRadius: 0,
      },
    ],
  };
}

export function buildAnomalyDataset(months: CalendarMonth[]) {
  const scores = (months || []).map((m) => Number(m.robust_z_score.toFixed(2)));
  const colors = scores.map((s) =>
    s >= 2.0 ? "#ef4444" : s >= 1.0 ? "#f59e0b" : s <= -1.0 ? "#3b82f6" : "#10b981"
  );
  return {
    labels: MONTH_NAMES.map((m) => m.slice(0, 3)),
    datasets: [
      { label: "Robust Z-Score", data: scores, backgroundColor: colors, borderRadius: 4 },
    ],
  };
}

export function buildDiurnalDataset(
  dayFires: number,
  nightFires: number,
  daynight: "all" | "D" | "N",
  mainColor: string,
  nightColor: string,
  dimMain: string,
  dimNight: string
) {
  return {
    labels: ["Day Flaming (D)", "Night Smoldering (N)"],
    datasets: [
      {
        data: [dayFires, nightFires],
        backgroundColor: [
          daynight === "N" ? dimMain : mainColor,
          daynight === "D" ? dimNight : nightColor,
        ],
        borderWidth: 0,
      },
    ],
  };
}

export function buildPolarDataset(
  data: RegionalCalendarData | null,
  regionName: string,
  daynight: "all" | "D" | "N",
  nightRatio: number,
  borderColor: string,
  bgColor: string
) {
  const values = MONTH_NAMES.map((_, idx) => {
    const b = data?.monthly_baselines[String(idx + 1)];
    let v = Math.round(b?.median || 0);
    if (daynight === "D") v = Math.round(v * (1 - nightRatio));
    if (daynight === "N") v = Math.round(v * nightRatio);
    return v;
  });
  return {
    labels: MONTH_NAMES.map((m) => m.slice(0, 3)),
    datasets: [
      {
        label: `${regionName} Climatology`,
        data: values,
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderWidth: 1.5,
      },
    ],
  };
}

export function buildAnnualDataset(
  data: RegionalCalendarData | null,
  activeYear: number,
  activeColor: string,
  inactiveColor: string
) {
  const years = data?.calendar || [];
  return {
    labels: years.map((y) => String(y.year)),
    datasets: [
      {
        label: "Annual Detections",
        data: years.map((y) => y.annual_total_harmonized),
        backgroundColor: years.map((y) =>
          y.year === activeYear ? activeColor : inactiveColor
        ),
        borderRadius: 3,
      },
    ],
  };
}
