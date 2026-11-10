"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarYear,
  CalendarMonth,
  ColorRampType,
  ViewMetric,
  HarmonizationMode,
} from "./types";
import { MONTH_NAMES, MONTH_FULL_NAMES } from "./constants";
import { getMetricColor, getContrastTextColor } from "./color-ramps";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  IconFlame,
  IconCalendar,
  IconTrendingUp,
  IconTrendingDown,
  IconInfoCircle,
  IconClock,
  IconCheck,
} from "@tabler/icons-react";

interface FireCalendarProps {
  calendarData: CalendarYear[];
  selectedYear: number | null;
  selectedMonth: number | null;
  onSelectCell: (year: number, month: number) => void;
  colorRamp: ColorRampType;
  viewMetric: ViewMetric;
  harmonizationMode: HarmonizationMode;
  regionName: string;
}

export function FireCalendar({
  calendarData,
  selectedYear,
  selectedMonth,
  onSelectCell,
  colorRamp,
  viewMetric,
  harmonizationMode,
  regionName,
}: FireCalendarProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    year: number;
    month: CalendarMonth;
  } | null>(null);

  // Compute min and max values across all cells for color scaling
  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    for (const yr of calendarData) {
      for (const m of yr.months) {
        let val = m.harmonized_count;
        if (viewMetric === "harmonized_frp_mw") val = m.harmonized_frp_mw;
        else if (viewMetric === "active_fire_hex_days") val = m.active_fire_hex_days;
        else if (viewMetric === "relative_anomaly_pct") val = m.relative_anomaly_pct;
        else if (viewMetric === "robust_z_score") val = m.robust_z_score;

        if (val < min) min = val;
        if (val > max) max = val;
      }
    }
    if (min === Infinity) min = 0;
    if (max === -Infinity) max = 100;
    return { minVal: min, maxVal: max };
  }, [calendarData, viewMetric]);

  // Formatter for cell numbers
  const formatCellValue = (m: CalendarMonth) => {
    if (viewMetric === "relative_anomaly_pct") {
      const sign = m.relative_anomaly_pct > 0 ? "+" : "";
      return `${sign}${m.relative_anomaly_pct.toFixed(0)}%`;
    }
    if (viewMetric === "robust_z_score") {
      const sign = m.robust_z_score > 0 ? "+" : "";
      return `${sign}${m.robust_z_score.toFixed(1)}σ`;
    }
    if (viewMetric === "harmonized_frp_mw") {
      if (m.harmonized_frp_mw >= 1000000) return `${(m.harmonized_frp_mw / 1000000).toFixed(1)}M`;
      if (m.harmonized_frp_mw >= 1000) return `${(m.harmonized_frp_mw / 1000).toFixed(0)}k`;
      return `${m.harmonized_frp_mw.toFixed(0)}`;
    }
    const count =
      viewMetric === "active_fire_hex_days" ? m.active_fire_hex_days : m.harmonized_count;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}k`;
    return `${count}`;
  };

  const getMetricRawValue = (m: CalendarMonth) => {
    switch (viewMetric) {
      case "harmonized_frp_mw":
        return m.harmonized_frp_mw;
      case "active_fire_hex_days":
        return m.active_fire_hex_days;
      case "relative_anomaly_pct":
        return m.relative_anomaly_pct;
      case "robust_z_score":
        return m.robust_z_score;
      case "harmonized_count":
      default:
        return m.harmonized_count;
    }
  };

  return (
    <div className="w-full flex flex-col bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Calendar Top Header & Information */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <IconCalendar className="size-5 text-amber-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            26-Year Burning Activity Calendar Matrix (2000–2026)
          </h2>
          <span className="text-xs text-slate-400 font-mono">[{regionName}]</span>
        </div>

        {/* Legend / Info Strip */}
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-slate-400">Min:</span>
            <span className="font-semibold text-white">
              {viewMetric.includes("pct") || viewMetric.includes("score")
                ? minVal.toFixed(1)
                : minVal >= 1000
                ? `${(minVal / 1000).toFixed(0)}k`
                : minVal}
            </span>
            <div
              className="w-24 h-2.5 rounded-sm mx-1 shadow-inner border border-white/10"
              style={{
                background:
                  colorRamp === "viridis"
                    ? "linear-gradient(to right, #440154, #31688e, #35b779, #fde725)"
                    : colorRamp === "inferno"
                    ? "linear-gradient(to right, #0f172a, #57106e, #bb3754, #f98e09, #fcffa4)"
                    : colorRamp === "diverging_anomaly"
                    ? "linear-gradient(to right, #1d4ed8, #60a5fa, #334155, #f97316, #e11d48)"
                    : "linear-gradient(to right, #1e293b, #fef08a, #f97316, #dc2626, #881337)",
              }}
            />
            <span className="text-slate-400">Max:</span>
            <span className="font-semibold text-white">
              {viewMetric.includes("pct") || viewMetric.includes("score")
                ? maxVal.toFixed(1)
                : maxVal >= 1000000
                ? `${(maxVal / 1000000).toFixed(1)}M`
                : maxVal >= 1000
                ? `${(maxVal / 1000).toFixed(0)}k`
                : maxVal}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400">
            <IconInfoCircle className="size-3.5 text-slate-400" />
            <span>Click any cell to inspect and load hotspots</span>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="w-full overflow-x-auto p-3">
        <table className="w-full border-collapse text-left font-mono text-[11px] select-none">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2 px-2 text-center font-bold tracking-wider w-16">Year</th>
              {MONTH_NAMES.map((name, idx) => (
                <th key={name} className="py-2 px-1 text-center font-semibold">
                  <span className="hidden sm:inline">{name}</span>
                  <span className="sm:hidden">{name.charAt(0)}</span>
                </th>
              ))}
              <th className="py-2 px-2 text-right font-bold w-24 hidden md:table-cell">Annual Total</th>
              <th className="py-2 px-2 text-center font-bold w-24 hidden lg:table-cell">Fire Season</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {calendarData.map((yearRec) => {
              const isSelectedYear = selectedYear === yearRec.year;
              const is2026 = yearRec.year === 2026;

              return (
                <tr
                  key={yearRec.year}
                  className={`transition-colors ${
                    is2026
                      ? "bg-amber-950/20 font-semibold"
                      : isSelectedYear
                      ? "bg-slate-900/60"
                      : "hover:bg-slate-900/30"
                  }`}
                >
                  {/* Year Label */}
                  <td className="py-1 px-2 text-center font-bold">
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className={
                          is2026
                            ? "text-amber-400 bg-amber-500/20 px-1 py-0.5 rounded border border-amber-500/30"
                            : isSelectedYear
                            ? "text-white underline decoration-amber-500 decoration-2 underline-offset-4"
                            : "text-slate-300"
                        }
                      >
                        {yearRec.year}
                      </span>
                      {is2026 && (
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-ping hidden sm:inline-block" />
                      )}
                    </div>
                  </td>

                  {/* 12 Month Cells */}
                  {yearRec.months.map((m) => {
                    const rawVal = getMetricRawValue(m);
                    const bgColor = getMetricColor(
                      rawVal,
                      minVal,
                      maxVal,
                      colorRamp,
                      viewMetric
                    );
                    const textColor = getContrastTextColor(bgColor);
                    const isSelected =
                      selectedYear === yearRec.year && selectedMonth === m.month;

                    return (
                      <td key={m.month} className="p-0.5">
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                onClick={() => onSelectCell(yearRec.year, m.month)}
                                onMouseEnter={() =>
                                  setHoveredCell({ year: yearRec.year, month: m })
                                }
                                onMouseLeave={() => setHoveredCell(null)}
                                className={`w-full h-8 rounded sm:rounded-md flex items-center justify-center text-[10px] sm:text-[11px] font-semibold transition-all duration-150 transform hover:scale-105 hover:z-20 shadow-sm relative ${
                                  isSelected
                                    ? "ring-2 ring-white ring-offset-1 ring-offset-slate-950 z-10"
                                    : "hover:ring-1 hover:ring-amber-400"
                                }`}
                                style={{
                                  backgroundColor: bgColor,
                                  color: textColor,
                                }}
                              >
                                <span>{formatCellValue(m)}</span>
                                {/* Extreme outbreak indicator pip */}
                                {m.robust_z_score >= 2.0 && (
                                  <span className="absolute top-0.5 right-0.5 size-1.5 bg-rose-500 rounded-full ring-1 ring-white" />
                                )}
                              </button>
                            }
                          />

                          {/* Hover Tooltip Card */}
                          <TooltipContent
                            side="top"
                            className="bg-slate-900 border border-slate-700 text-slate-100 p-3 rounded-lg shadow-2xl max-w-xs text-xs z-50 font-sans"
                          >
                            <div className="space-y-1.5 font-mono">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                                <span className="font-bold text-amber-400">
                                  {MONTH_FULL_NAMES[m.month - 1]} {yearRec.year}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] px-1 py-0 ${
                                    m.robust_z_score >= 2.0
                                      ? "text-rose-400 border-rose-500 bg-rose-950/40"
                                      : m.robust_z_score >= 1.0
                                      ? "text-amber-400 border-amber-500 bg-amber-950/40"
                                      : m.robust_z_score <= -1.0
                                      ? "text-blue-400 border-blue-500 bg-blue-950/40"
                                      : "text-slate-400 border-slate-700"
                                  }`}
                                >
                                  {m.anomaly_status}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                                <div>
                                  <span className="text-slate-400">Harmonized Count:</span>
                                  <p className="font-bold text-white">
                                    {m.harmonized_count.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-400">Total FRP:</span>
                                  <p className="font-bold text-white">
                                    {m.harmonized_frp_mw.toLocaleString()} MW
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-400">Raw MODIS:</span>
                                  <p className="text-slate-300">
                                    {m.modis_count.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-400">Raw VIIRS:</span>
                                  <p className="text-slate-300">
                                    {m.viirs_count.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-400">Historical Median:</span>
                                  <p className="text-slate-300">
                                    {m.historical_median.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-400">Relative Anomaly:</span>
                                  <p
                                    className={`font-semibold ${
                                      m.relative_anomaly_pct > 0
                                        ? "text-rose-400"
                                        : "text-blue-400"
                                    }`}
                                  >
                                    {m.relative_anomaly_pct > 0 ? "+" : ""}
                                    {m.relative_anomaly_pct}%
                                  </p>
                                </div>
                              </div>

                              <div className="border-t border-slate-800 pt-1 flex items-center justify-between text-[10px] text-slate-400">
                                <span>Robust Z: {m.robust_z_score > 0 ? "+" : ""}{m.robust_z_score}σ</span>
                                <span>Trend: {m.trend_diff >= 0 ? "+" : ""}{m.trend_diff.toLocaleString()} vs prev mo</span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    );
                  })}

                  {/* Annual Total Column */}
                  <td className="py-1 px-2 text-right font-bold text-slate-200 hidden md:table-cell">
                    {yearRec.annual_total_harmonized.toLocaleString()}
                  </td>

                  {/* Fire Season Timing Column (Onset -> Peak -> Cessation) */}
                  <td className="py-1 px-2 text-center hidden lg:table-cell">
                    <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                      {MONTH_NAMES[yearRec.season_timing.onset_month - 1]} →{" "}
                      <span className="text-amber-400 font-bold">
                        {MONTH_NAMES[yearRec.season_timing.peak_month - 1]}
                      </span>{" "}
                      → {MONTH_NAMES[yearRec.season_timing.cessation_month - 1]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
