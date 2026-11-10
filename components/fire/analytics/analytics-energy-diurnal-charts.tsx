"use client";

import React, { useMemo } from "react";
import { Doughnut, PolarArea, Chart } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconBolt, IconChartPie, IconCompass } from "@tabler/icons-react";
import { MONTH_NAMES } from "../constants";
import {
  darkTooltipOptions,
  darkGridOptions,
  darkTickOptions,
} from "./analytics-chart-theme";

interface ProgressionItem {
  month: string;
  valTarget: number;
  frpTarget: number;
  intensity: number;
}

interface AnalyticsEnergyDiurnalChartsProps {
  progressionData: ProgressionItem[];
  effectiveDayFires: number;
  effectiveNightFires: number;
  totalDiurnalFires: number;
  dayPercent: number;
  nightPercent: number;
}

export function AnalyticsEnergyDiurnalCharts({
  progressionData,
  effectiveDayFires,
  effectiveNightFires,
  totalDiurnalFires,
  dayPercent,
  nightPercent,
}: AnalyticsEnergyDiurnalChartsProps) {
  // Chart 3: FRP Radiative Power & Severity (Dual-Axis Bar & Line)
  const frpIntensityChartData = useMemo(() => {
    return {
      labels: MONTH_NAMES,
      datasets: [
        {
          type: "bar" as const,
          label: "Total FRP (Megawatts)",
          data: progressionData.map((d) => d.frpTarget),
          backgroundColor: "rgba(245, 158, 11, 0.75)",
          borderColor: "#f59e0b",
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: "y",
        },
        {
          type: "line" as const,
          label: "Mean Severity (MW / detection)",
          data: progressionData.map((d) => d.intensity),
          borderColor: "#10b981",
          backgroundColor: "#10b981",
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2.5,
          tension: 0.3,
          yAxisID: "y1",
        },
      ],
    };
  }, [progressionData]);

  const frpIntensityChartOptions: ChartOptions<"bar"> = {
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
          label: (context) => {
            if (context.dataset.yAxisID === "y1") {
              return ` Mean Severity: ${context.raw} MW/hotspot`;
            }
            return ` Total FRP: ${Number(context.raw).toLocaleString()} MW`;
          },
        },
      },
    },
    scales: {
      x: { grid: darkGridOptions, ticks: darkTickOptions },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grid: darkGridOptions,
        ticks: {
          ...darkTickOptions,
          callback: (value) => {
            const num = Number(value);
            return num >= 1_000_000
              ? `${(num / 1_000_000).toFixed(1)}M MW`
              : `${(num / 1_000).toFixed(0)}k MW`;
          },
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: { drawOnChartArea: false },
        ticks: {
          ...darkTickOptions,
          callback: (value) => `${value} MW`,
        },
      },
    },
  };

  // Chart 4: Diurnal Cycle (Doughnut)
  const diurnalDoughnutData = useMemo(() => {
    return {
      labels: ["Daytime Crown Flaming", "Nighttime Peatland Smoldering"],
      datasets: [
        {
          data: [effectiveDayFires, effectiveNightFires],
          backgroundColor: ["#f97316", "#6366f1"],
          borderColor: "#0f172a",
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }, [effectiveDayFires, effectiveNightFires]);

  const diurnalDoughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#cbd5e1", font: { size: 11 }, boxWidth: 12 },
      },
      tooltip: {
        ...darkTooltipOptions,
        callbacks: {
          label: (context) => {
            const count = Number(context.raw);
            const pct = Math.round((count / totalDiurnalFires) * 100);
            return ` ${context.label}: ${count.toLocaleString()} (${pct}%)`;
          },
        },
      },
    },
    cutout: "68%",
  };

  // Chart 5: Seasonal Burning Climatology Profile (Polar Area)
  const polarClimatologyData = useMemo(() => {
    return {
      labels: MONTH_NAMES,
      datasets: [
        {
          label: "Harmonized Monthly Hotspots",
          data: progressionData.map((d) => d.valTarget),
          backgroundColor: [
            "rgba(56, 189, 248, 0.45)",
            "rgba(59, 130, 246, 0.45)",
            "rgba(99, 102, 241, 0.45)",
            "rgba(168, 85, 247, 0.45)",
            "rgba(236, 72, 153, 0.45)",
            "rgba(244, 63, 94, 0.55)",
            "rgba(239, 68, 68, 0.65)",
            "rgba(249, 115, 22, 0.75)",
            "rgba(245, 158, 11, 0.75)",
            "rgba(234, 179, 8, 0.65)",
            "rgba(132, 204, 22, 0.45)",
            "rgba(20, 184, 166, 0.45)",
          ],
          borderColor: "#0f172a",
          borderWidth: 1.5,
        },
      ],
    };
  }, [progressionData]);

  const polarClimatologyOptions: ChartOptions<"polarArea"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...darkTooltipOptions,
        callbacks: {
          label: (context) => ` ${context.label}: ${Number(context.raw).toLocaleString()} fires`,
        },
      },
    },
    scales: {
      r: {
        grid: darkGridOptions,
        ticks: { display: false },
        pointLabels: {
          color: "#94a3b8",
          font: { size: 10, weight: "bold" },
        },
      },
    },
  };

  const peakFrpVal = Math.max(...progressionData.map((d) => d.frpTarget), 0);
  const peakIntensity = Math.max(...progressionData.map((d) => d.intensity), 0);
  const peakMonthIdx = progressionData.reduce(
    (maxIdx, d, idx, arr) => (d.valTarget > arr[maxIdx].valTarget ? idx : maxIdx),
    0
  );

  return (
    <>
      {/* Chart 3: FRP Radiative Power & Severity (Dual-Axis Bar/Line) */}
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl flex flex-col">
        <CardHeader className="p-4 pb-2 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <IconBolt className="size-4 text-amber-500" />
                <span>FRP Radiative Power & Mean Severity</span>
              </CardTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Total Radiative Energy (Megawatts) vs Average MW per Active Fire
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
            >
              Dual-Axis Analysis
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
          <div className="h-64 sm:h-72 w-full">
            <Chart
              type="bar"
              data={frpIntensityChartData as any}
              options={frpIntensityChartOptions as any}
            />
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>
              Peak Energy:{" "}
              <strong className="text-amber-400">
                {(peakFrpVal / 1_000_000).toFixed(2)}M MW
              </strong>
            </span>
            <span>
              Peak Severity:{" "}
              <strong className="text-emerald-400">{peakIntensity} MW/hotspot</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Chart 4: Diurnal Cycle: Flaming vs Peatland Smoldering (Doughnut) */}
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl flex flex-col">
        <CardHeader className="p-4 pb-2 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <IconChartPie className="size-4 text-indigo-400" />
                <span>Diurnal Cycle & Peatland Smoldering</span>
              </CardTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Daytime canopy flaming vs nighttime smoldering fraction (375m VIIRS)
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] border-indigo-500/40 text-indigo-400 bg-indigo-500/10"
            >
              Day / Night Ratio
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
          <div className="h-64 sm:h-72 w-full relative flex items-center justify-center">
            <Doughnut data={diurnalDoughnutData} options={diurnalDoughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-5">
              <span className="text-2xl font-bold font-mono text-white">{nightPercent}%</span>
              <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">
                Night Smoldering
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-center text-[11px] font-mono">
            <div className="p-1.5 rounded bg-orange-950/20 border border-orange-500/20 text-orange-300">
              Day: <strong>{effectiveDayFires.toLocaleString()}</strong> ({dayPercent}%)
            </div>
            <div className="p-1.5 rounded bg-indigo-950/20 border border-indigo-500/20 text-indigo-300">
              Night: <strong>{effectiveNightFires.toLocaleString()}</strong> ({nightPercent}%)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart 5: Seasonal Burning Climatology Profile (Polar Area) */}
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl flex flex-col">
        <CardHeader className="p-4 pb-2 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <IconCompass className="size-4 text-cyan-400" />
                <span>Seasonal Burning Climatology Profile</span>
              </CardTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                12-Month distribution showing dry-season concentration & fire seasonality
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] border-cyan-500/40 text-cyan-400 bg-cyan-500/10"
            >
              Polar Distribution
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            <PolarArea data={polarClimatologyData} options={polarClimatologyOptions} />
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>
              Peak Fire Season:{" "}
              <strong className="text-amber-400">{MONTH_NAMES[peakMonthIdx]}</strong>
            </span>
            <span>
              Annual Spread:{" "}
              <strong className="text-white">
                {progressionData.filter((d) => d.valTarget > 0).length} active months
              </strong>
            </span>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
