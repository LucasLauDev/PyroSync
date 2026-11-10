import { ComponentType } from "react";
import { RegionalCalendarData, CalendarYear, CalendarMonth } from "../types";

export interface ComparisonFilters {
  region: string;
  year: number;
  daynight: "all" | "D" | "N";
  sensor: "all" | "MODIS" | "VIIRS";
  metric: "harmonized_count" | "hex_days" | "frp_mw";
}

export interface MetricDifferenceRow {
  id: string;
  title: string;
  category: string;
  val1: string;
  val2: string;
  diffAbs: string;
  diffPct: string;
  winner: "input1" | "input2" | "equal";
  insight: string;
  icon: ComponentType<{ className?: string }>;
}

export interface ComparisonDataset {
  filters: ComparisonFilters;
  calendarData: RegionalCalendarData | null;
  yearData: CalendarYear | undefined;
  totalBurden: number;
  totalFrp: number;
  meanFrp: string;
  totalHex: number;
  seasonDuration: number;
  nightPct: number;
  peak: { month: string; count: number; zScore: number };
}

export const AVAILABLE_YEARS = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017,
  2016, 2015, 2014, 2013, 2012, 2011, 2010, 2005, 2000,
];

export function getMonthlyMetricValue(
  m: CalendarMonth,
  sensor: string,
  metric: string,
  daynight: string,
  nightRatio: number
): number {
  let val = 0;
  if (metric === "hex_days") {
    val = m.active_fire_hex_days || 0;
  } else if (metric === "frp_mw") {
    val = m.harmonized_frp_mw || 0;
  } else {
    if (sensor === "MODIS") {
      val = m.modis_count || 0;
    } else if (sensor === "VIIRS") {
      val = m.viirs_count || 0;
    } else {
      val = m.harmonized_count || 0;
    }
  }

  if (daynight === "D") {
    val = Math.round(val * Math.max(1 - nightRatio, 0.05));
  } else if (daynight === "N") {
    val = Math.round(val * Math.max(nightRatio, 0.05));
  }

  return val;
}
