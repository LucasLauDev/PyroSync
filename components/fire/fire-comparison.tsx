"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { Line, Bar, Doughnut, PolarArea } from "react-chartjs-2";
import { RegionalCalendarData, CalendarYear, CalendarMonth } from "./types";
import { REGION_PRESETS, MONTH_NAMES } from "./constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconFlame,
  IconCalendar,
  IconScale,
  IconWorld,
  IconChartBar,
  IconSun,
  IconMoon,
  IconTrendingUp,
  IconArrowsDiff,
  IconActivity,
  IconBolt,
  IconInfoCircle,
} from "@tabler/icons-react";

// Ensure Chart.js components are registered
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

interface FireComparisonProps {
  primaryRegion: string;
  primaryCalendarData: RegionalCalendarData | null;
  onSelectPrimaryRegion?: (region: string) => void;
}

export function FireComparison({
  primaryRegion,
  primaryCalendarData,
  onSelectPrimaryRegion,
}: FireComparisonProps) {
  // Second input: comparison region
  const defaultSecondRegion = useMemo(() => {
    if (primaryRegion === "South_America") return "SouthEast_Asia";
    if (primaryRegion === "SouthEast_Asia") return "South_America";
    return "SouthEast_Asia";
  }, [primaryRegion]);

  const [compareRegion, setCompareRegion] = useState<string>(defaultSecondRegion);
  const [compareCalendarData, setCompareCalendarData] = useState<RegionalCalendarData | null>(null);
  const [isLoadingCompare, setIsLoadingCompare] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // In-memory cache for fast switching
  const [cache, setCache] = useState<Record<string, RegionalCalendarData>>({});

  // Fetch comparison region data
  useEffect(() => {
    if (!compareRegion) return;

    if (cache[compareRegion]) {
      setCompareCalendarData(cache[compareRegion]);
      return;
    }

    let isMounted = true;
    setIsLoadingCompare(true);

    fetch(`/api/calendar?region=${encodeURIComponent(compareRegion)}&mode=overlap_scaled`)
      .then((res) => res.json())
      .then((data: RegionalCalendarData) => {
        if (!isMounted) return;
        setCompareCalendarData(data);
        setCache((prev) => ({ ...prev, [compareRegion]: data }));
        setIsLoadingCompare(false);
      })
      .catch((err) => {
        console.error("Failed to load comparison region data:", err);
        if (isMounted) setIsLoadingCompare(false);
      });

    return () => {
      isMounted = false;
    };
  }, [compareRegion, cache]);

  // Presets info
  const preset1 = REGION_PRESETS.find((r) => r.id === primaryRegion) || REGION_PRESETS[0];
  const preset2 = REGION_PRESETS.find((r) => r.id === compareRegion) || REGION_PRESETS[1];

  // Selected year records
  const yData1 = primaryCalendarData?.calendar.find((y) => y.year === selectedYear);
  const yData2 = compareCalendarData?.calendar.find((y) => y.year === selectedYear);

  const totalFires1 = yData1?.annual_total_harmonized || 0;
  const totalFires2 = yData2?.annual_total_harmonized || 0;

  // Daily series records (for diurnal & progression)
  const daily1 = primaryCalendarData?.daily_series_2026 || [];
  const daily2 = compareCalendarData?.daily_series_2026 || [];

  const dayFires1 = daily1.reduce((sum, d) => sum + (d.day_fires || 0), 0);
  const nightFires1 = daily1.reduce((sum, d) => sum + (d.night_fires || 0), 0);
  const totalDiurnal1 = Math.max(dayFires1 + nightFires1, 1);
  const nightPct1 = Math.round((nightFires1 / totalDiurnal1) * 100);

  const dayFires2 = daily2.reduce((sum, d) => sum + (d.day_fires || 0), 0);
  const nightFires2 = daily2.reduce((sum, d) => sum + (d.night_fires || 0), 0);
  const totalDiurnal2 = Math.max(dayFires2 + nightFires2, 1);
  const nightPct2 = Math.round((nightFires2 / totalDiurnal2) * 100);

  // Peak month determination
  const peakMonth1 = useMemo(() => {
    if (!yData1) return { month: "Oct", count: 0, zScore: 0 };
    let max = -1;
    let pk = yData1.months[9] || yData1.months[0];
    yData1.months.forEach((m) => {
      if (m.harmonized_count > max) {
        max = m.harmonized_count;
        pk = m;
      }
    });
    return {
      month: MONTH_NAMES[pk.month - 1] || "Oct",
      count: pk.harmonized_count,
      zScore: pk.robust_z_score,
    };
  }, [yData1]);

  const peakMonth2 = useMemo(() => {
    if (!yData2) return { month: "Aug", count: 0, zScore: 0 };
    let max = -1;
    let pk = yData2.months[7] || yData2.months[0];
    yData2.months.forEach((m) => {
      if (m.harmonized_count > max) {
        max = m.harmonized_count;
        pk = m;
      }
    });
    return {
      month: MONTH_NAMES[pk.month - 1] || "Aug",
      count: pk.harmonized_count,
      zScore: pk.robust_z_score,
    };
  }, [yData2]);

  // Differential percentage
  const diffPct = useMemo(() => {
    if (totalFires1 === 0 && totalFires2 === 0) return 0;
    if (totalFires2 === 0) return 100;
    return Math.round(((totalFires1 - totalFires2) / totalFires2) * 100);
  }, [totalFires1, totalFires2]);

  // -----------------------------------------------------------------
  // 1. Cumulative Season Progression Data (DOY 1–365)
  // -----------------------------------------------------------------
  const cumulativeData1 = useMemo(() => {
    let running = 0;
    const curve = (yData1?.months || []).map((m) => {
      running += m.harmonized_count;
      return running;
    });

    // 26-year baseline median curve
    let baseRunning = 0;
    const baseCurve = MONTH_NAMES.map((_, idx) => {
      const b = primaryCalendarData?.monthly_baselines[String(idx + 1)];
      baseRunning += b?.median || 0;
      return baseRunning;
    });

    return {
      labels: MONTH_NAMES,
      datasets: [
        {
          label: `${preset1.name} (${selectedYear})`,
          data: curve,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          fill: true,
          tension: 0.3,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: "#f59e0b",
        },
        {
          label: `${preset1.name} 26-Yr Median`,
          data: baseCurve,
          borderColor: "rgba(148, 163, 184, 0.6)",
          borderDash: [5, 5],
          tension: 0.3,
          borderWidth: 1.5,
          pointRadius: 0,
        },
      ],
    };
  }, [yData1, primaryCalendarData, preset1.name, selectedYear]);

  const cumulativeData2 = useMemo(() => {
    let running = 0;
    const curve = (yData2?.months || []).map((m) => {
      running += m.harmonized_count;
      return running;
    });

    let baseRunning = 0;
    const baseCurve = MONTH_NAMES.map((_, idx) => {
      const b = compareCalendarData?.monthly_baselines[String(idx + 1)];
      baseRunning += b?.median || 0;
      return baseRunning;
    });

    return {
      labels: MONTH_NAMES,
      datasets: [
        {
          label: `${preset2.name} (${selectedYear})`,
          data: curve,
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.15)",
          fill: true,
          tension: 0.3,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: "#06b6d4",
        },
        {
          label: `${preset2.name} 26-Yr Median`,
          data: baseCurve,
          borderColor: "rgba(148, 163, 184, 0.6)",
          borderDash: [5, 5],
          tension: 0.3,
          borderWidth: 1.5,
          pointRadius: 0,
        },
      ],
    };
  }, [yData2, compareCalendarData, preset2.name, selectedYear]);

  // -----------------------------------------------------------------
  // 2. Monthly Robust Z-Score Anomalies Data
  // -----------------------------------------------------------------
  const anomalyData1 = useMemo(() => {
    const months = yData1?.months || [];
    const scores = months.map((m) => Number(m.robust_z_score.toFixed(2)));
    const colors = scores.map((s) =>
      s >= 2.0
        ? "#ef4444" // Extreme outbreak
        : s >= 1.0
        ? "#f59e0b" // Above normal
        : s <= -1.0
        ? "#3b82f6" // Below normal
        : "#10b981" // Baseline
    );

    return {
      labels: MONTH_NAMES.map((m) => m.slice(0, 3)),
      datasets: [
        {
          label: "Robust Z-Score",
          data: scores,
          backgroundColor: colors,
          borderRadius: 4,
        },
      ],
    };
  }, [yData1]);

  const anomalyData2 = useMemo(() => {
    const months = yData2?.months || [];
    const scores = months.map((m) => Number(m.robust_z_score.toFixed(2)));
    const colors = scores.map((s) =>
      s >= 2.0
        ? "#ef4444"
        : s >= 1.0
        ? "#f59e0b"
        : s <= -1.0
        ? "#3b82f6"
        : "#10b981"
    );

    return {
      labels: MONTH_NAMES.map((m) => m.slice(0, 3)),
      datasets: [
        {
          label: "Robust Z-Score",
          data: scores,
          backgroundColor: colors,
          borderRadius: 4,
        },
      ],
    };
  }, [yData2]);

  // -----------------------------------------------------------------
  // 3. Diurnal Cycle Data (Doughnut)
  // -----------------------------------------------------------------
  const diurnalData1 = useMemo(() => {
    return {
      labels: ["Day (Flaming)", "Night (Smoldering)"],
      datasets: [
        {
          data: [dayFires1, nightFires1],
          backgroundColor: ["#f59e0b", "#8b5cf6"],
          borderWidth: 0,
        },
      ],
    };
  }, [dayFires1, nightFires1]);

  const diurnalData2 = useMemo(() => {
    return {
      labels: ["Day (Flaming)", "Night (Smoldering)"],
      datasets: [
        {
          data: [dayFires2, nightFires2],
          backgroundColor: ["#06b6d4", "#a855f7"],
          borderWidth: 0,
        },
      ],
    };
  }, [dayFires2, nightFires2]);

  // -----------------------------------------------------------------
  // 4. Seasonal Climatology (Polar Area)
  // -----------------------------------------------------------------
  const polarData1 = useMemo(() => {
    const values = MONTH_NAMES.map((_, idx) => {
      const b = primaryCalendarData?.monthly_baselines[String(idx + 1)];
      return Math.round(b?.median || 0);
    });
    return {
      labels: MONTH_NAMES.map((m) => m.slice(0, 3)),
      datasets: [
        {
          label: `${preset1.name} Climatology`,
          data: values,
          backgroundColor: "rgba(245, 158, 11, 0.45)",
          borderColor: "#f59e0b",
          borderWidth: 1.5,
        },
      ],
    };
  }, [primaryCalendarData, preset1.name]);

  const polarData2 = useMemo(() => {
    const values = MONTH_NAMES.map((_, idx) => {
      const b = compareCalendarData?.monthly_baselines[String(idx + 1)];
      return Math.round(b?.median || 0);
    });
    return {
      labels: MONTH_NAMES.map((m) => m.slice(0, 3)),
      datasets: [
        {
          label: `${preset2.name} Climatology`,
          data: values,
          backgroundColor: "rgba(6, 182, 212, 0.45)",
          borderColor: "#06b6d4",
          borderWidth: 1.5,
        },
      ],
    };
  }, [compareCalendarData, preset2.name]);

  // -----------------------------------------------------------------
  // 5. 26-Year Historical Annual Burdens (2000–2026)
  // -----------------------------------------------------------------
  const annualHistory1 = useMemo(() => {
    const years = primaryCalendarData?.calendar || [];
    return {
      labels: years.map((y) => String(y.year)),
      datasets: [
        {
          label: "Annual Detections",
          data: years.map((y) => y.annual_total_harmonized),
          backgroundColor: years.map((y) =>
            y.year === selectedYear ? "#f59e0b" : "rgba(245, 158, 11, 0.35)"
          ),
          borderRadius: 3,
        },
      ],
    };
  }, [primaryCalendarData, selectedYear]);

  const annualHistory2 = useMemo(() => {
    const years = compareCalendarData?.calendar || [];
    return {
      labels: years.map((y) => String(y.year)),
      datasets: [
        {
          label: "Annual Detections",
          data: years.map((y) => y.annual_total_harmonized),
          backgroundColor: years.map((y) =>
            y.year === selectedYear ? "#06b6d4" : "rgba(6, 182, 212, 0.35)"
          ),
          borderRadius: 3,
        },
      ],
    };
  }, [compareCalendarData, selectedYear]);

  // Chart options helpers
  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#94a3b8", font: { size: 10, family: "monospace" } },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "#334155",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { color: "#94a3b8", font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { color: "#94a3b8", font: { size: 10 } },
      },
    },
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "#334155",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 9 } },
      },
      y: {
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { color: "#94a3b8", font: { size: 9 } },
      },
    },
  };

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#94a3b8", font: { size: 10, family: "monospace" } },
      },
    },
  };

  const polarOptions: ChartOptions<"polarArea"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      r: {
        grid: { color: "rgba(51, 65, 85, 0.4)" },
        ticks: { display: false },
      },
    },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Comparison Configuration Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <IconScale className="size-5 text-cyan-400" />
              Dual-Region Comparative Analysis Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare active fire regimes, seasonal timing, diurnal peatland smoldering, and multi-decadal anomalies side-by-side.
            </p>
          </div>

          {/* Target Year Selector */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <IconCalendar className="size-3.5 text-amber-500" /> Compare Year:
            </span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-slate-900 text-white text-xs font-mono font-bold rounded px-2 py-0.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {[2026, 2025, 2024, 2023, 2020, 2015, 2010, 2005, 2000].map((yr) => (
                <option key={yr} value={yr}>
                  {yr} {yr === 2026 ? "(Operational NRT)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* The Two Inputs Selection Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input 1: Primary Region (Stated at the top header) */}
          <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-950/10 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400">
                  Input 1 (Baseline Region)
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-300">
                Set at Top Header
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">{preset1.name}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Continuity factor: <strong>×{preset1.continuityFactor}</strong> | Center: {preset1.center[0]}°, {preset1.center[1]}°
                </div>
              </div>
            </div>
          </div>

          {/* Input 2: Comparison Target (Selectable right here inside the tab) */}
          <div className="p-3.5 rounded-xl border border-cyan-500/40 bg-cyan-950/10 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-cyan-400" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-400">
                  Input 2 (Comparison Target)
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/30 text-cyan-300">
                Select Inside Tab
              </Badge>
            </div>

            <div className="space-y-1.5">
              <select
                value={compareRegion}
                onChange={(e) => setCompareRegion(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/50 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
              >
                {REGION_PRESETS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.id === primaryRegion ? "(Same as Input 1)" : ""}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Continuity factor: <strong>×{preset2.continuityFactor}</strong></span>
                <span>Coordinates: {preset2.center[0]}°, {preset2.center[1]}°</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Comparison Preset Chips */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <IconArrowsDiff className="size-3 text-cyan-400" /> Quick Pairs:
          </span>
          {[
            { label: "Southeast Asia vs South America", r1: "SouthEast_Asia", r2: "South_America" },
            { label: "North vs Southern Africa", r1: "Northern_and_Central_Africa", r2: "Southern_Africa" },
            { label: "USA vs Canada Boreal", r1: "USA_contiguous_and_Hawaii", r2: "Canada" },
            { label: "Russia Taiga vs Australia Bushfires", r1: "Russia_Asia", r2: "Australia_NewZealand" },
          ].map((pair) => (
            <button
              key={pair.label}
              type="button"
              onClick={() => {
                onSelectPrimaryRegion?.(pair.r1);
                setCompareRegion(pair.r2);
              }}
              className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {pair.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Head-to-Head KPI Comparative Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Input 1 Metrics Card */}
        <Card className="bg-slate-900/50 border-amber-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-mono font-bold text-amber-400">
                {preset1.name} ({selectedYear})
              </CardTitle>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-mono">
                Input 1
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-mono">Harmonized Burden:</span>
              <span className="text-lg font-bold font-mono text-white">
                {totalFires1.toLocaleString()}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-slate-400">Peak Burn Month:</span>
              <span className="text-amber-400 font-semibold">{peakMonth1.month} ({peakMonth1.count.toLocaleString()})</span>
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-slate-400">Night Smoldering Ratio:</span>
              <span className="text-purple-400 font-semibold">{nightPct1}% nocturnal</span>
            </div>
          </CardContent>
        </Card>

        {/* Center Delta Summary Card */}
        <Card className="bg-slate-900/50 border-slate-800 flex flex-col justify-center text-center p-4">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Comparative Disparity
          </div>
          <div className="text-xl font-bold font-mono">
            {diffPct > 0 ? (
              <span className="text-amber-400">+{diffPct}% Burden in Input 1</span>
            ) : diffPct < 0 ? (
              <span className="text-cyan-400">+{Math.abs(diffPct)}% Burden in Input 2</span>
            ) : (
              <span className="text-slate-300">Equivalent Fire Activity</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Season Peaks: <strong className="text-amber-400">{peakMonth1.month}</strong> vs <strong className="text-cyan-400">{peakMonth2.month}</strong>
          </div>
        </Card>

        {/* Input 2 Metrics Card */}
        <Card className="bg-slate-900/50 border-cyan-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-mono font-bold text-cyan-400">
                {preset2.name} ({selectedYear})
              </CardTitle>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] font-mono">
                Input 2
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-mono">Harmonized Burden:</span>
              <span className="text-lg font-bold font-mono text-white">
                {isLoadingCompare ? "Loading..." : totalFires2.toLocaleString()}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-slate-400">Peak Burn Month:</span>
              <span className="text-cyan-400 font-semibold">{peakMonth2.month} ({peakMonth2.count.toLocaleString()})</span>
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-slate-400">Night Smoldering Ratio:</span>
              <span className="text-purple-400 font-semibold">{nightPct2}% nocturnal</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Side-by-Side Chart Comparisons */}

      {/* Comparison Row 1: Cumulative Season Progression */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IconTrendingUp className="size-4 text-amber-500" />
            <span>Comparison 1: Cumulative Season Progression Curve (DOY 1–365)</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Year {selectedYear} vs 26-Yr Median</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Side A: Input 1 */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-amber-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 font-mono">
                  Input 1: {preset1.name}
                </span>
                <Badge variant="outline" className="text-[9px] font-mono text-amber-300 border-amber-500/30">
                  Total: {totalFires1.toLocaleString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 h-[240px]">
              <Line data={cumulativeData1} options={lineOptions} />
            </CardContent>
          </Card>

          {/* Side B: Input 2 */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-cyan-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 font-mono">
                  Input 2: {preset2.name}
                </span>
                <Badge variant="outline" className="text-[9px] font-mono text-cyan-300 border-cyan-500/30">
                  Total: {totalFires2.toLocaleString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 h-[240px]">
              <Line data={cumulativeData2} options={lineOptions} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparison Row 2: Monthly Robust Z-Score Anomalies */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IconActivity className="size-4 text-rose-500" />
            <span>Comparison 2: Monthly Robust Z-Score Anomaly Departures</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Red: Extreme surge (&gt;+2.0σ) | Green: Baseline</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Side A: Input 1 */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-amber-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 font-mono">
                  Input 1: {preset1.name} (Anomalies)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Peak: {peakMonth1.month} ({peakMonth1.zScore > 0 ? `+${peakMonth1.zScore}σ` : `${peakMonth1.zScore}σ`})</span>
              </div>
            </CardHeader>
            <CardContent className="p-3 h-[210px]">
              <Bar data={anomalyData1} options={barOptions} />
            </CardContent>
          </Card>

          {/* Side B: Input 2 */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-cyan-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 font-mono">
                  Input 2: {preset2.name} (Anomalies)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Peak: {peakMonth2.month} ({peakMonth2.zScore > 0 ? `+${peakMonth2.zScore}σ` : `${peakMonth2.zScore}σ`})</span>
              </div>
            </CardHeader>
            <CardContent className="p-3 h-[210px]">
              <Bar data={anomalyData2} options={barOptions} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparison Row 3: Diurnal Cycle & Nocturnal Peatland Smoldering */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IconMoon className="size-4 text-purple-400" />
            <span>Comparison 3: Diurnal Cycle & Peatland Smoldering Ratio</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Day Flaming vs Night Smoldering</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Side A: Input 1 */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-amber-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 font-mono">
                  Input 1: {preset1.name}
                </span>
                <Badge variant="outline" className="text-[10px] font-mono border-purple-500/40 text-purple-300">
                  {nightPct1}% Smoldering
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 h-[200px]">
              <Doughnut data={diurnalData1} options={doughnutOptions} />
            </CardContent>
          </Card>

          {/* Side B: Input 2 */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-cyan-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 font-mono">
                  Input 2: {preset2.name}
                </span>
                <Badge variant="outline" className="text-[10px] font-mono border-purple-500/40 text-purple-300">
                  {nightPct2}% Smoldering
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 h-[200px]">
              <Doughnut data={diurnalData2} options={doughnutOptions} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparison Row 4: Seasonal Climatology (Polar Profile) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IconFlame className="size-4 text-amber-500" />
            <span>Comparison 4: 12-Month Climatological Seasonal Footprint</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">26-Year Historical Median Fire Seasonality</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Side A: Input 1 */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-amber-950/10">
              <span className="text-xs font-bold text-amber-400 font-mono">
                Input 1: {preset1.name} (Seasonal Window)
              </span>
            </CardHeader>
            <CardContent className="p-3 h-[220px]">
              <PolarArea data={polarData1} options={polarOptions} />
            </CardContent>
          </Card>

          {/* Side B: Input 2 */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-cyan-950/10">
              <span className="text-xs font-bold text-cyan-400 font-mono">
                Input 2: {preset2.name} (Seasonal Window)
              </span>
            </CardHeader>
            <CardContent className="p-3 h-[220px]">
              <PolarArea data={polarData2} options={polarOptions} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparison Row 5: 26-Year Multi-Decadal Fire Burdens */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IconCalendar className="size-4 text-emerald-500" />
            <span>Comparison 5: 26-Year Multi-Decadal Historical Fire Burdens (2000–2026)</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Inter-Annual Variability & Trends</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Side A: Input 1 */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-amber-950/10">
              <span className="text-xs font-bold text-amber-400 font-mono">
                Input 1: {preset1.name} (2000–2026)
              </span>
            </CardHeader>
            <CardContent className="p-3 h-[220px]">
              <Bar data={annualHistory1} options={barOptions} />
            </CardContent>
          </Card>

          {/* Side B: Input 2 */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-cyan-950/10">
              <span className="text-xs font-bold text-cyan-400 font-mono">
                Input 2: {preset2.name} (2000–2026)
              </span>
            </CardHeader>
            <CardContent className="p-3 h-[220px]">
              <Bar data={annualHistory2} options={barOptions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
