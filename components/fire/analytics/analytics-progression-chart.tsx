"use client";

import React, { useMemo } from "react";
import { Line, Bar } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTrendingUp, IconActivity } from "@tabler/icons-react";
import { MONTH_NAMES } from "../constants";
import {
  darkTooltipOptions,
  darkGridOptions,
  darkTickOptions,
} from "./analytics-chart-theme";

interface ProgressionItem {
  month: string;
  monthNum: number;
  valTarget: number;
  valCompare: number;
  median: number;
  cumTarget: number;
  cumCompare: number;
  cumMedian: number;
  robustZ: number;
}

interface AnalyticsProgressionChartProps {
  targetYear: number;
  comparisonYear: number;
  setComparisonYear: (yr: number) => void;
  progressionData: ProgressionItem[];
}

export function AnalyticsProgressionChart({
  targetYear,
  comparisonYear,
  setComparisonYear,
  progressionData,
}: AnalyticsProgressionChartProps) {
  // Chart 1: Cumulative Progression Data
  const cumulativeChartData = useMemo(() => {
    return {
      labels: MONTH_NAMES,
      datasets: [
        {
          label: `${targetYear} Cumulative Fires`,
          data: progressionData.map((d) => d.cumTarget),
          borderColor: "#f97316",
          backgroundColor: "rgba(249, 115, 22, 0.15)",
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: "#ea580c",
          tension: 0.3,
          fill: false,
        },
        {
          label: `${comparisonYear} Comparison Season`,
          data: progressionData.map((d) => d.cumCompare),
          borderColor: "#06b6d4",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [5, 4],
          pointRadius: 3,
          pointBackgroundColor: "#0891b2",
          tension: 0.3,
        },
        {
          label: "Multi-Year Median Baseline (2000–2025)",
          data: progressionData.map((d) => d.cumMedian),
          borderColor: "#94a3b8",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [2, 2],
          pointRadius: 0,
          tension: 0.3,
        },
      ],
    };
  }, [progressionData, targetYear, comparisonYear]);

  const cumulativeChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#cbd5e1", font: { size: 11 }, boxWidth: 12 },
      },
      tooltip: {
        ...darkTooltipOptions,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${Number(context.raw).toLocaleString()} fires`,
        },
      },
    },
    scales: {
      x: { grid: darkGridOptions, ticks: darkTickOptions },
      y: {
        grid: darkGridOptions,
        ticks: {
          ...darkTickOptions,
          callback: (value) => {
            const num = Number(value);
            return num >= 1_000_000
              ? `${(num / 1_000_000).toFixed(1)}M`
              : num >= 1_000
              ? `${(num / 1_000).toFixed(0)}k`
              : num;
          },
        },
      },
    },
  };

  // Chart 2: Monthly Robust Z-Score Anomalies Data
  const anomalyChartData = useMemo(() => {
    return {
      labels: MONTH_NAMES,
      datasets: [
        {
          label: "Robust Z-Score (σ)",
          data: progressionData.map((d) => d.robustZ),
          backgroundColor: progressionData.map((d) => {
            if (d.robustZ >= 2.0) return "#ef4444";
            if (d.robustZ >= 1.0) return "#f97316";
            if (d.robustZ <= -2.0) return "#3b82f6";
            if (d.robustZ <= -1.0) return "#0284c7";
            return "#14b8a6";
          }),
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [progressionData]);

  const anomalyChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...darkTooltipOptions,
        callbacks: {
          label: (context) => {
            const z = Number(context.raw);
            const status =
              z >= 2.0
                ? "Extreme Outbreak"
                : z >= 1.0
                ? "Above Normal"
                : z <= -2.0
                ? "Extreme Deficit"
                : z <= -1.0
                ? "Below Normal"
                : "Normal Baseline";
            return ` Robust Z: ${z > 0 ? `+${z}` : z}σ (${status})`;
          },
        },
      },
    },
    scales: {
      x: { grid: darkGridOptions, ticks: darkTickOptions },
      y: {
        grid: darkGridOptions,
        ticks: {
          ...darkTickOptions,
          callback: (value) => `${value}σ`,
        },
      },
    },
  };

  return (
    <>
      {/* Chart 1: Cumulative Season Progression (Line / Area) */}
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl flex flex-col">
        <CardHeader className="p-4 pb-2 border-b border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <IconTrendingUp className="size-4 text-orange-500" />
                <span>Cumulative Season Progression</span>
              </CardTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Trajectory comparison against historical baseline and reference year
              </p>
            </div>
            {/* Year Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">Compare to:</span>
              <select
                value={comparisonYear}
                onChange={(e) => setComparisonYear(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {[2025, 2024, 2023, 2022, 2020, 2019, 2015, 2010, 2005, 2000].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr} {yr === 2023 ? "(Megafires)" : yr === 2015 ? "(El Niño)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
          <div className="h-64 sm:h-72 w-full">
            <Line data={cumulativeChartData} options={cumulativeChartOptions} />
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>
              {targetYear} YTD:{" "}
              <strong className="text-orange-400">
                {progressionData[11]?.cumTarget?.toLocaleString() || 0}
              </strong>
            </span>
            <span>
              {comparisonYear} Total:{" "}
              <strong className="text-cyan-400">
                {progressionData[11]?.cumCompare?.toLocaleString() || 0}
              </strong>
            </span>
            <span>
              Baseline Median:{" "}
              <strong className="text-slate-300">
                {progressionData[11]?.cumMedian?.toLocaleString() || 0}
              </strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: Monthly Robust Z-Score Anomalies (Bar) */}
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl flex flex-col">
        <CardHeader className="p-4 pb-2 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <IconActivity className="size-4 text-rose-500" />
                <span>Monthly Robust Z-Score Anomalies</span>
              </CardTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Non-parametric departures: (x - Median) / (0.7413 · IQR)
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] border-rose-500/40 text-rose-400 bg-rose-500/10"
            >
              ±2σ Outlier Bounds
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
          <div className="h-64 sm:h-72 w-full">
            <Bar data={anomalyChartData} options={anomalyChartOptions} />
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-around text-[10px] font-mono gap-1">
            <span className="flex items-center gap-1 text-rose-400">
              <span className="size-2 rounded-full bg-rose-500" /> &gt; +2σ Extreme
            </span>
            <span className="flex items-center gap-1 text-orange-400">
              <span className="size-2 rounded-full bg-orange-500" /> +1σ to +2σ
            </span>
            <span className="flex items-center gap-1 text-teal-400">
              <span className="size-2 rounded-full bg-teal-500" /> Baseline
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <span className="size-2 rounded-full bg-blue-500" /> &lt; -2σ Deficit
            </span>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
