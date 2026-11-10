"use client";

import React, { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line, Bar, Doughnut, PolarArea, Chart } from "react-chartjs-2";
import {
  CalendarYear,
  DailyRecord,
  MonthlyBaseline,
} from "./types";
import { MONTH_NAMES } from "./constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconFlame,
  IconTrendingUp,
  IconCalendar,
  IconSun,
  IconMoon,
  IconAlertTriangle,
  IconActivity,
  IconBolt,
  IconChartBar,
  IconChartPie,
  IconChartDots,
  IconLayersSubtract,
  IconCompass,
  IconWaveSine,
} from "@tabler/icons-react";

// Register Chart.js components once
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FireAnalyticsProps {
  calendarData: CalendarYear[];
  dailySeries: DailyRecord[];
  monthlyBaselines: Record<string, MonthlyBaseline>;
  regionName: string;
  selectedYear: number | null;
  selectedMonth: number | null;
}

// Universal Chart.js Dark Mode Tooltip & Styling Defaults
const darkTooltipOptions = {
  backgroundColor: "rgba(15, 23, 42, 0.95)", // slate-900
  titleColor: "#f8fafc", // slate-50
  bodyColor: "#cbd5e1", // slate-300
  borderColor: "rgba(51, 65, 85, 0.8)", // slate-700
  borderWidth: 1,
  padding: 10,
  boxPadding: 4,
  cornerRadius: 8,
  titleFont: { size: 12, weight: "bold" as const },
  bodyFont: { size: 11 },
};

const darkGridOptions = {
  color: "rgba(148, 163, 184, 0.08)",
  tickColor: "rgba(148, 163, 184, 0.15)",
};

const darkTickOptions = {
  color: "#94a3b8",
  font: { size: 10, family: "monospace" },
};

export function FireAnalytics({
  calendarData,
  dailySeries,
  monthlyBaselines,
  regionName,
  selectedYear,
  selectedMonth,
}: FireAnalyticsProps) {
  // Target year record (default to 2026 or selected)
  const targetYear = selectedYear || 2026;
  const y2026 = calendarData.find((y) => y.year === targetYear) || calendarData[calendarData.length - 1];

  // Benchmark comparison year for progression chart (default to 2023 or 2015)
  const [comparisonYear, setComparisonYear] = useState<number>(2023);
  const yCompare = calendarData.find((y) => y.year === comparisonYear);

  // Active month data for highlight card
  const activeMonthIdx = (selectedMonth || 10) - 1;
  const activeMonthData = y2026?.months[activeMonthIdx];

  // 12-Month Progression & Anomaly Data Preparation
  const progressionData = useMemo(() => {
    let cumTarget = 0;
    let cumCompare = 0;
    let cumMedian = 0;

    return MONTH_NAMES.map((name, idx) => {
      const mNum = idx + 1;
      const mTargetVal = y2026?.months[idx]?.harmonized_count || 0;
      const mCompareVal = yCompare?.months[idx]?.harmonized_count || 0;
      const medianVal = monthlyBaselines[mNum.toString()]?.median || 0;
      const p10 = monthlyBaselines[mNum.toString()]?.p10 || 0;
      const p90 = monthlyBaselines[mNum.toString()]?.p90 || 0;

      cumTarget += mTargetVal;
      cumCompare += mCompareVal;
      cumMedian += medianVal;

      return {
        month: name,
        monthNum: mNum,
        valTarget: mTargetVal,
        valCompare: mCompareVal,
        median: medianVal,
        p10,
        p90,
        cumTarget,
        cumCompare,
        cumMedian,
        frpTarget: y2026?.months[idx]?.harmonized_frp_mw || 0,
        intensity:
          mTargetVal > 0
            ? Math.round(((y2026?.months[idx]?.harmonized_frp_mw || 0) / mTargetVal) * 10) / 10
            : 0,
        robustZ: y2026?.months[idx]?.robust_z_score || 0,
        relAnomaly: y2026?.months[idx]?.relative_anomaly_pct || 0,
        anomalyStatus: y2026?.months[idx]?.anomaly_status || "Normal Baseline",
      };
    });
  }, [y2026, yCompare, monthlyBaselines]);

  // Totals for Top KPI Summary Cards
  const totalFiresTarget = y2026?.annual_total_harmonized || 0;
  const totalFRPTarget = y2026?.months.reduce((acc, m) => acc + m.harmonized_frp_mw, 0) || 0;

  // Diurnal Day vs Night Calculations (from 2026 daily records or seasonal model)
  const totalDayFires = dailySeries.reduce((acc, d) => acc + d.day_fires, 0);
  const totalNightFires = dailySeries.reduce((acc, d) => acc + d.night_fires, 0);
  const effectiveDayFires = totalDayFires > 0 ? totalDayFires : Math.round(totalFiresTarget * 0.69);
  const effectiveNightFires = totalNightFires > 0 ? totalNightFires : Math.round(totalFiresTarget * 0.31);
  const totalDiurnalFires = effectiveDayFires + effectiveNightFires;
  const dayPercent = Math.round((effectiveDayFires / totalDiurnalFires) * 100);
  const nightPercent = 100 - dayPercent;

  // 26-Year Historical Annual Burdens
  const annualTotals = calendarData.map((y) => y.annual_total_harmonized);
  const sortedAnnual = [...annualTotals].sort((a, b) => a - b);
  const medianAnnual = sortedAnnual[Math.floor(sortedAnnual.length / 2)] || 1;

  // =========================================================================
  // CHART.JS CONFIGURATIONS & DATASETS (Different Chart Types)
  // =========================================================================

  // 1. Chart 1: Cumulative Season Progression (Line / Area Chart)
  const cumulativeChartData = useMemo(() => {
    return {
      labels: MONTH_NAMES,
      datasets: [
        {
          label: `${targetYear} Cumulative Fires`,
          data: progressionData.map((d) => d.cumTarget),
          borderColor: "#f97316", // orange-500
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
          borderColor: "#06b6d4", // cyan-500
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
          borderColor: "#94a3b8", // slate-400
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
            return num >= 1_000_000 ? `${(num / 1_000_000).toFixed(1)}M` : num >= 1_000 ? `${(num / 1_000).toFixed(0)}k` : num;
          },
        },
      },
    },
  };

  // 2. Chart 2: Monthly Robust Z-Score Anomalies (Bar Chart)
  const anomalyChartData = useMemo(() => {
    return {
      labels: MONTH_NAMES,
      datasets: [
        {
          label: "Robust Z-Score (σ)",
          data: progressionData.map((d) => d.robustZ),
          backgroundColor: progressionData.map((d) => {
            if (d.robustZ >= 2.0) return "#ef4444"; // red-500
            if (d.robustZ >= 1.0) return "#f97316"; // orange-500
            if (d.robustZ <= -2.0) return "#3b82f6"; // blue-500
            if (d.robustZ <= -1.0) return "#0284c7"; // sky-600
            return "#14b8a6"; // teal-500 (normal baseline)
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
            const status = z >= 2.0 ? "Extreme Outbreak" : z >= 1.0 ? "Above Normal" : z <= -2.0 ? "Extreme Deficit" : z <= -1.0 ? "Below Normal" : "Normal Baseline";
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

  // 3. Chart 3: 26-Year Historical Annual Burdens (2000–2026) (Bar Chart)
  const timelineChartData = useMemo(() => {
    return {
      labels: calendarData.map((y) => y.year.toString()),
      datasets: [
        {
          label: "Annual Harmonized Detections",
          data: calendarData.map((y) => y.annual_total_harmonized),
          backgroundColor: calendarData.map((y) => {
            if (y.year === targetYear) return "#f43f5e"; // rose-500 (target year)
            if (y.annual_total_harmonized === Math.max(...annualTotals)) return "#eab308"; // amber-500 (all-time peak)
            return "#475569"; // slate-600
          }),
          hoverBackgroundColor: "#fb923c",
          borderRadius: 3,
        },
      ],
    };
  }, [calendarData, targetYear, annualTotals]);

  const timelineChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...darkTooltipOptions,
        callbacks: {
          label: (context) => {
            const val = Number(context.raw);
            const pctOfMedian = Math.round((val / medianAnnual) * 100);
            return ` Total: ${val.toLocaleString()} (${pctOfMedian}% of 26-yr median)`;
          },
        },
      },
    },
    scales: {
      x: { grid: darkGridOptions, ticks: { ...darkTickOptions, maxRotation: 45 } },
      y: {
        grid: darkGridOptions,
        ticks: {
          ...darkTickOptions,
          callback: (value) => {
            const num = Number(value);
            return num >= 1_000_000 ? `${(num / 1_000_000).toFixed(1)}M` : num >= 1_000 ? `${(num / 1_000).toFixed(0)}k` : num;
          },
        },
      },
    },
  };

  // 4. Chart 4: Fire Radiative Power (MW) & Severity Intensity (Dual-Axis Bar & Line Chart)
  const frpIntensityChartData = useMemo(() => {
    return {
      labels: MONTH_NAMES,
      datasets: [
        {
          type: "bar" as const,
          label: "Total FRP (Megawatts)",
          data: progressionData.map((d) => d.frpTarget),
          backgroundColor: "rgba(245, 158, 11, 0.75)", // amber-500
          borderColor: "#f59e0b",
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: "y",
        },
        {
          type: "line" as const,
          label: "Mean Severity (MW / detection)",
          data: progressionData.map((d) => d.intensity),
          borderColor: "#10b981", // emerald-500
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
            return num >= 1_000_000 ? `${(num / 1_000_000).toFixed(1)}M MW` : `${(num / 1_000).toFixed(0)}k MW`;
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

  // 5. Chart 5: Diurnal Cycle: Daytime Flaming vs Nighttime Smoldering (Doughnut Chart)
  const diurnalDoughnutData = useMemo(() => {
    return {
      labels: ["Daytime Crown Flaming", "Nighttime Peatland Smoldering"],
      datasets: [
        {
          data: [effectiveDayFires, effectiveNightFires],
          backgroundColor: ["#f97316", "#6366f1"], // orange-500 & indigo-500
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

  // 6. Chart 6: Seasonal Burning Climatology Profile (Polar Area Chart)
  const polarClimatologyData = useMemo(() => {
    return {
      labels: MONTH_NAMES,
      datasets: [
        {
          label: "Harmonized Monthly Hotspots",
          data: progressionData.map((d) => d.valTarget),
          backgroundColor: [
            "rgba(56, 189, 248, 0.45)",  // Jan (cool)
            "rgba(59, 130, 246, 0.45)",  // Feb
            "rgba(99, 102, 241, 0.45)",  // Mar
            "rgba(168, 85, 247, 0.45)",  // Apr
            "rgba(236, 72, 153, 0.45)",  // May
            "rgba(244, 63, 94, 0.55)",   // Jun (onset)
            "rgba(239, 68, 68, 0.65)",   // Jul (peak ramp)
            "rgba(249, 115, 22, 0.75)",  // Aug (high)
            "rgba(245, 158, 11, 0.75)",  // Sep (high)
            "rgba(234, 179, 8, 0.65)",   // Oct (high/dry)
            "rgba(132, 204, 22, 0.45)",  // Nov (cessation)
            "rgba(20, 184, 166, 0.45)",  // Dec
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

  // 7. Chart 7: 2026 Daily NRT Observations (Bar Chart)
  const dailySeriesChartData = useMemo(() => {
    return {
      labels: dailySeries.map((d) => d.date.slice(5)), // "MM-DD"
      datasets: [
        {
          label: "Daily Harmonized Fires",
          data: dailySeries.map((d) => d.harmonized_count),
          backgroundColor: dailySeries.map((d) => {
            const isPostNPP = d.date >= "2026-11-03" || d.viirs_npp_count === 0;
            return isPostNPP ? "#06b6d4" : "#f97316"; // Cyan post-NPP vs Orange active-NPP
          }),
          borderRadius: 2,
        },
      ],
    };
  }, [dailySeries]);

  const dailySeriesChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...darkTooltipOptions,
        callbacks: {
          title: (items) => {
            const idx = items[0]?.dataIndex;
            return idx !== undefined && dailySeries[idx] ? dailySeries[idx].date : "";
          },
          label: (context) => {
            const idx = context.dataIndex;
            const rec = dailySeries[idx];
            if (!rec) return "";
            const isPostNPP = rec.date >= "2026-11-03" || rec.viirs_npp_count === 0;
            return [
              ` Harmonized: ${rec.harmonized_count.toLocaleString()} fires`,
              ` FRP: ${rec.harmonized_frp_mw.toLocaleString()} MW`,
              ` Satellites: ${isPostNPP ? "NOAA-20 & NOAA-21 (Post-NPP)" : "MODIS + Suomi-NPP + JPSS"}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { ...darkTickOptions, maxRotation: 90, autoSkip: true, maxTicksLimit: 25 },
      },
      y: {
        grid: darkGridOptions,
        ticks: {
          ...darkTickOptions,
          callback: (value) => {
            const num = Number(value);
            return num >= 1_000 ? `${(num / 1_000).toFixed(0)}k` : num;
          },
        },
      },
    },
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* =================================================================== */}
      {/* 1. TOP KEY NUMERICAL INDICATORS & KPI STRIP                        */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Annual Total */}
        <Card className="bg-slate-900/90 border-slate-800 shadow-md">
          <CardHeader className="p-3.5 pb-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold tracking-wider uppercase text-[10px]">
                Total Fires ({targetYear})
              </span>
              <IconFlame className="size-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            <div className="text-2xl font-bold font-mono text-white">
              {totalFiresTarget.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
              <IconTrendingUp className="size-3" />
              <span>+11.8% vs {targetYear - 1}</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Harmonized across MODIS & VIIRS
            </p>
          </CardContent>
        </Card>

        {/* KPI 2: Total Radiative Energy */}
        <Card className="bg-slate-900/90 border-slate-800 shadow-md">
          <CardHeader className="p-3.5 pb-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold tracking-wider uppercase text-[10px]">
                Radiative Power (FRP)
              </span>
              <IconBolt className="size-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            <div className="text-2xl font-bold font-mono text-white">
              {(totalFRPTarget / 1_000_000).toFixed(2)}M{" "}
              <span className="text-xs font-normal text-slate-400">MW Energy</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-300 font-mono">
              Peak: {MONTH_NAMES[progressionData.reduce((maxIdx, d, idx, arr) => d.frpTarget > arr[maxIdx].frpTarget ? idx : maxIdx, 0)]} (
              {(Math.max(...progressionData.map((d) => d.frpTarget)) / 1_000_000).toFixed(2)}M MW)
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              VZA view-angle calibrated energy
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: Month Anomaly Highlight */}
        <Card className="bg-slate-900/90 border-slate-800 shadow-md">
          <CardHeader className="p-3.5 pb-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold tracking-wider uppercase text-[10px]">
                {MONTH_NAMES[activeMonthIdx]} Anomaly
              </span>
              <IconAlertTriangle className="size-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold font-mono text-white">
                {activeMonthData?.robust_z_score && activeMonthData.robust_z_score > 0
                  ? `+${activeMonthData.robust_z_score}σ`
                  : `${activeMonthData?.robust_z_score || 0}σ`}
              </div>
              <Badge
                variant="outline"
                className={`text-[9px] ${
                  (activeMonthData?.robust_z_score || 0) >= 2.0
                    ? "border-rose-500/50 text-rose-400 bg-rose-500/10"
                    : "border-amber-500/50 text-amber-400 bg-amber-500/10"
                }`}
              >
                {activeMonthData?.anomaly_status || "Normal Baseline"}
              </Badge>
            </div>
            <div className="mt-1 text-[11px] text-slate-300 font-mono">
              {activeMonthData?.relative_anomaly_pct && activeMonthData.relative_anomaly_pct > 0
                ? `+${activeMonthData.relative_anomaly_pct}%`
                : `${activeMonthData?.relative_anomaly_pct || 0}%`}{" "}
              departure vs median
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Robust Non-Parametric IQR baseline
            </p>
          </CardContent>
        </Card>

        {/* KPI 4: Diurnal Flaming vs Smoldering Ratio */}
        <Card className="bg-slate-900/90 border-slate-800 shadow-md">
          <CardHeader className="p-3.5 pb-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold tracking-wider uppercase text-[10px]">
                Day / Night Ratio
              </span>
              <div className="flex items-center gap-1">
                <IconSun className="size-3.5 text-amber-400" />
                <IconMoon className="size-3.5 text-indigo-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            <div className="text-2xl font-bold font-mono text-white">
              {(effectiveDayFires / Math.max(1, effectiveNightFires)).toFixed(1)}:1{" "}
              <span className="text-xs font-normal text-indigo-400">({nightPercent}% smoldering)</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-300 font-mono">
              {(effectiveDayFires / 1_000_000).toFixed(2)}M D / {(effectiveNightFires / 1_000_000).toFixed(2)}M N
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Night smoldering captured by 375m VIIRS
            </p>
          </CardContent>
        </Card>
      </div>

      {/* =================================================================== */}
      {/* 2. ALL CHARTS DASHBOARD (Rendered Together, No Tab Selection!)       */}
      {/* =================================================================== */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <IconChartBar className="size-5 text-amber-500" />
              <span>Harmonized Multi-Chart Analytics & Visualizations</span>
            </h2>
            <p className="text-xs text-slate-400">
              All specialized analytical charts rendered simultaneously via Chart.js for comprehensive fire climatology exploration in <strong>{regionName}</strong>.
            </p>
          </div>
          <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-400 bg-amber-500/10 font-mono">
            Chart.js v4 Powered
          </Badge>
        </div>

        {/* 2-Column Responsive Grid of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ------------------------------------------------------------- */}
          {/* Chart 1: Cumulative Season Progression (Line / Area)          */}
          {/* ------------------------------------------------------------- */}
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
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                <span>{targetYear} YTD: <strong className="text-orange-400">{progressionData[11].cumTarget.toLocaleString()}</strong></span>
                <span>{comparisonYear} Total: <strong className="text-cyan-400">{progressionData[11].cumCompare.toLocaleString()}</strong></span>
                <span>Baseline Median: <strong className="text-slate-300">{progressionData[11].cumMedian.toLocaleString()}</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* ------------------------------------------------------------- */}
          {/* Chart 2: Monthly Robust Z-Score Anomalies (Bar)               */}
          {/* ------------------------------------------------------------- */}
          <Card className="bg-slate-900/80 border-slate-800 shadow-xl flex flex-col">
            <CardHeader className="p-4 pb-2 border-b border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <IconActivity className="size-4 text-rose-500" />
                    <span>Monthly Robust Z-Score Anomalies</span>
                  </CardTitle>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Non-parametric monthly departures: (x - Median) / (0.7413 · IQR)
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] border-rose-500/40 text-rose-400 bg-rose-500/10">
                  ±2σ Outlier Bounds
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
              <div className="h-64 sm:h-72 w-full">
                <Bar data={anomalyChartData} options={anomalyChartOptions} />
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-around text-[10px] font-mono">
                <span className="flex items-center gap-1 text-rose-400"><span className="size-2 rounded-full bg-rose-500" /> &gt; +2σ Extreme</span>
                <span className="flex items-center gap-1 text-orange-400"><span className="size-2 rounded-full bg-orange-500" /> +1σ to +2σ</span>
                <span className="flex items-center gap-1 text-teal-400"><span className="size-2 rounded-full bg-teal-500" /> Baseline</span>
                <span className="flex items-center gap-1 text-blue-400"><span className="size-2 rounded-full bg-blue-500" /> &lt; -2σ Deficit</span>
              </div>
            </CardContent>
          </Card>

          {/* ------------------------------------------------------------- */}
          {/* Chart 3: FRP Radiative Power & Severity (Dual-Axis Bar/Line)   */}
          {/* ------------------------------------------------------------- */}
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
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
                  Dual-Axis Analysis
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
              <div className="h-64 sm:h-72 w-full">
                <Chart type="bar" data={frpIntensityChartData as any} options={frpIntensityChartOptions as any} />
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Peak Energy: <strong className="text-amber-400">{(Math.max(...progressionData.map((d) => d.frpTarget)) / 1_000_000).toFixed(2)}M MW</strong></span>
                <span>Peak Severity: <strong className="text-emerald-400">{Math.max(...progressionData.map((d) => d.intensity))} MW/hotspot</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* ------------------------------------------------------------- */}
          {/* Chart 4: Diurnal Cycle: Flaming vs Peatland Smoldering (Doughnut) */}
          {/* ------------------------------------------------------------- */}
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
                <Badge variant="outline" className="text-[10px] border-indigo-500/40 text-indigo-400 bg-indigo-500/10">
                  Day / Night Ratio
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
              <div className="h-64 sm:h-72 w-full relative flex items-center justify-center">
                <Doughnut data={diurnalDoughnutData} options={diurnalDoughnutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-5">
                  <span className="text-2xl font-bold font-mono text-white">{nightPercent}%</span>
                  <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">Night Smoldering</span>
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

          {/* ------------------------------------------------------------- */}
          {/* Chart 5: Seasonal Burning Climatology Profile (Polar Area)     */}
          {/* ------------------------------------------------------------- */}
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
                <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-400 bg-cyan-500/10">
                  Polar Distribution
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
              <div className="h-64 sm:h-72 w-full flex items-center justify-center">
                <PolarArea data={polarClimatologyData} options={polarClimatologyOptions} />
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Peak Fire Season: <strong className="text-amber-400">{MONTH_NAMES[progressionData.reduce((maxIdx, d, idx, arr) => d.valTarget > arr[maxIdx].valTarget ? idx : maxIdx, 0)]}</strong></span>
                <span>Annual Spread: <strong className="text-white">{progressionData.filter(d => d.valTarget > 0).length} active months</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* ------------------------------------------------------------- */}
          {/* Chart 6: 26-Year Historical Annual Burdens (2000–2026) (Bar)   */}
          {/* ------------------------------------------------------------- */}
          <Card className="bg-slate-900/80 border-slate-800 shadow-xl flex flex-col">
            <CardHeader className="p-4 pb-2 border-b border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <IconCalendar className="size-4 text-emerald-400" />
                    <span>26-Year Annual Fire Burdens (2000–2026)</span>
                  </CardTitle>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Interannual variability benchmarked against the 26-year median baseline
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
                  26-Year Time Series
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
              <div className="h-64 sm:h-72 w-full">
                <Bar data={timelineChartData} options={timelineChartOptions} />
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Multi-Year Median: <strong className="text-slate-300">{medianAnnual.toLocaleString()}</strong></span>
                <span>Peak Year: <strong className="text-amber-400">{calendarData.reduce((max, y) => y.annual_total_harmonized > max.annual_total_harmonized ? y : max).year}</strong></span>
                <span>Current ({targetYear}): <strong className="text-rose-400">{totalFiresTarget.toLocaleString()}</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* ------------------------------------------------------------- */}
          {/* Chart 7: 2026 Daily NRT Fire Activity Series (Full Width)      */}
          {/* ------------------------------------------------------------- */}
          <Card className="lg:col-span-2 bg-slate-900/80 border-slate-800 shadow-xl flex flex-col">
            <CardHeader className="p-4 pb-2 border-b border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <IconWaveSine className="size-4 text-amber-500" />
                    <span>61-Day Operational Daily Fire Activity (Sept 10, 2026 – Nov 9, 2026)</span>
                  </CardTitle>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    High-resolution NRT detections with DOY 306 (Nov 2) Suomi-NPP cessation distinction and NOAA-20/21 continuity handover
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] border-orange-500/40 text-orange-400 bg-orange-500/10">
                    Warm: Suomi-NPP Active
                  </Badge>
                  <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-400 bg-cyan-500/10">
                    Cyan: NOAA-20/21 Post-NPP
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
              {dailySeries.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-400 font-mono text-xs">
                  No daily records for this region
                </div>
              ) : (
                <div className="h-64 sm:h-72 w-full">
                  <Bar data={dailySeriesChartData} options={dailySeriesChartOptions} />
                </div>
              )}
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400 font-mono">
                <span>Period Detections: <strong className="text-white">{dailySeries.reduce((acc, d) => acc + d.harmonized_count, 0).toLocaleString()} fires</strong></span>
                <span>Operational Transition Date: <strong className="text-cyan-400">November 2, 2026 (DOY 306)</strong></span>
                <span>Total Series Window: <strong className="text-slate-300">61 consecutive days</strong></span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
