"use client";

import React, { useState } from "react";
import {
  RegionalCalendarData,
  ColorRampType,
  ViewMetric,
  HarmonizationMode,
} from "./types";
import { REGION_PRESETS, MONTH_NAMES } from "./constants";
import { FireCalendar } from "./fire-calendar";
import { FireAnalytics } from "./fire-analytics";
import { FireComparison } from "./fire-comparison";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconFlame,
  IconCalendar,
  IconChartBar,
  IconMap,
  IconDownload,
  IconSparkles,
  IconAdjustmentsHorizontal,
  IconLayersSubtract,
  IconWorld,
  IconTrendingUp,
  IconAlertTriangle,
  IconScale,
  IconSun,
  IconMoon,
  IconClock,
  IconCheck,
} from "@tabler/icons-react";

interface FireAnalysisPageProps {
  calendarData: RegionalCalendarData | null;
  selectedRegion: string;
  onSelectRegion: (regionId: string) => void;
  colorRamp: ColorRampType;
  onChangeColorRamp: (ramp: ColorRampType) => void;
  viewMetric: ViewMetric;
  onChangeViewMetric: (metric: ViewMetric) => void;
  harmonizationMode: HarmonizationMode;
  onChangeHarmonizationMode: (mode: HarmonizationMode) => void;
  selectedYear: number | null;
  selectedMonth: number | null;
  onSelectCell: (year: number, month: number) => void;
  onOpenExportDialog: () => void;
  onSwitchToMap: () => void;
  // Standardized shared filter props
  startDate?: string;
  endDate?: string;
  onChangeDateRange?: (start: string, end: string) => void;
  sensorFilter?: "all" | "MODIS" | "VIIRS";
  onChangeSensorFilter?: (sensor: "all" | "MODIS" | "VIIRS") => void;
  daynightFilter?: "all" | "D" | "N";
  onChangeDaynightFilter?: (phase: "all" | "D" | "N") => void;
  minFrpFilter?: number;
  onChangeMinFrpFilter?: (frp: number) => void;
}

export function FireAnalysisPage({
  calendarData,
  selectedRegion,
  onSelectRegion,
  colorRamp,
  onChangeColorRamp,
  viewMetric,
  onChangeViewMetric,
  harmonizationMode,
  onChangeHarmonizationMode,
  selectedYear,
  selectedMonth,
  onSelectCell,
  onOpenExportDialog,
  onSwitchToMap,
  startDate = "2026-09-10",
  endDate = "2026-11-09",
  onChangeDateRange,
  sensorFilter = "all",
  onChangeSensorFilter,
  daynightFilter = "all",
  onChangeDaynightFilter,
  minFrpFilter = 0,
  onChangeMinFrpFilter,
}: FireAnalysisPageProps) {
  const [activeAnalysisSection, setActiveAnalysisSection] = useState<"trends" | "calendar" | "compare" | "regimes">("trends");

  const currentPreset = REGION_PRESETS.find((r) => r.id === selectedRegion) || REGION_PRESETS[0];

  const y2026 = calendarData?.calendar.find((y) => y.year === 2026);
  const y2025 = calendarData?.calendar.find((y) => y.year === 2025);

  const total2026 = y2026?.annual_total_harmonized || 0;
  const total2025 = y2025?.annual_total_harmonized || 1;
  const yoyDiff = total2026 - total2025;
  const yoyPct = Math.round((yoyDiff / total2025) * 100);

  // Peak month anomaly
  let peakAnomaly = { month: "Oct", zScore: 0, pct: 0, status: "Normal Baseline" };
  if (y2026) {
    let maxZ = -999;
    y2026.months.forEach((m) => {
      if (m.robust_z_score > maxZ) {
        maxZ = m.robust_z_score;
        peakAnomaly = {
          month: MONTH_NAMES[m.month - 1] || "Oct",
          zScore: m.robust_z_score,
          pct: m.relative_anomaly_pct,
          status: m.anomaly_status,
        };
      }
    });
  }

  return (
    <div className="w-full h-full min-h-screen overflow-y-auto bg-slate-950 text-slate-100 pb-16 pt-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Analysis Header Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 backdrop-blur-xl p-5 sm:p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 font-mono text-[10px] tracking-wider uppercase flex items-center gap-1">
                  <IconFlame className="size-3" /> NASA FIRMS Multi-Sensor Climatology
                </Badge>
                <Badge variant="secondary" className="font-mono text-[10px] bg-slate-800 text-slate-300">
                  173-Month Overlap Era (2012–2026)
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  Continuity Factor: {calendarData?.overlap_continuity_factor ? `×${calendarData.overlap_continuity_factor}` : "×7.8"}
                </Badge>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Fire Activity & Harmonization Analysis
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Seamless 26-year cross-sensor climatology combining MODIS 1km and VIIRS 375m active fire detections.
                Includes robust non-parametric anomaly baselines and continuous post-NPP operational series.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onSwitchToMap}
                className="gap-1.5 bg-slate-900/80 border-slate-700 hover:bg-slate-800 text-xs text-slate-200"
              >
                <IconMap className="size-3.5 text-blue-400" />
                <span>View on Live Map</span>
              </Button>

              <Button
                size="sm"
                onClick={onOpenExportDialog}
                className="gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20"
              >
                <IconDownload className="size-3.5" />
                <span>Export CSV Dataset</span>
              </Button>
            </div>
          </div>

          {/* Controls Strip 1: Region, Harmonization Mode, View Metric, Color Ramp */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. World Region Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <IconWorld className="size-3 text-slate-400" /> Target Bio-Climatic Regime
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => onSelectRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {REGION_PRESETS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Harmonization Mode */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <IconLayersSubtract className="size-3 text-slate-400" /> Harmonization Model
              </label>
              <select
                value={harmonizationMode}
                onChange={(e) => onChangeHarmonizationMode(e.target.value as HarmonizationMode)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-mono"
              >
                <option value="overlap_scaled">Overlap Continuity Scaled (k_ratio)</option>
                <option value="active_fire_hex_days">Active Fire Hex-Days (H3 Res 7)</option>
                <option value="vza_frp">VZA-Recalibrated FRP (MW)</option>
                <option value="modis_equivalent">MODIS-Equivalent (&gt;3.7 MW)</option>
              </select>
            </div>

            {/* 3. Metric */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <IconAdjustmentsHorizontal className="size-3 text-slate-400" /> Display Metric
              </label>
              <select
                value={viewMetric}
                onChange={(e) => onChangeViewMetric(e.target.value as ViewMetric)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-mono"
              >
                <option value="harmonized_count">Harmonized Hotspots Count</option>
                <option value="active_fire_hex_days">Active Fire Hex-Days</option>
                <option value="harmonized_frp_mw">Radiative Power Energy (MW)</option>
              </select>
            </div>

            {/* 4. Color Ramp */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <IconSparkles className="size-3 text-slate-400" /> Perceptual Color Ramp
              </label>
              <select
                value={colorRamp}
                onChange={(e) => onChangeColorRamp(e.target.value as ColorRampType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-mono"
              >
                <option value="flame">Flame / Thermal (Orange-Red)</option>
                <option value="viridis">Viridis (Colorblind-Safe)</option>
                <option value="inferno">Inferno (High Contrast Dark)</option>
                <option value="diverging_anomaly">Diverging Anomaly (Blue/Gray/Red)</option>
              </select>
            </div>
          </div>

          {/* Controls Strip 2: Synchronized Shared Filters (Date Window, Sensor, Diurnal Phase) */}
          <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Observation Date Window Presets */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <IconCalendar className="size-3 text-amber-500" />
                  <span>Observation Window:</span>
                </span>
                <span className="text-amber-400 font-bold">
                  {startDate} → {endDate}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {[
                  { label: "7 Days", s: "2026-11-02", e: "2026-11-09" },
                  { label: "30 Days", s: "2026-10-10", e: "2026-11-09" },
                  { label: "Oct 2026", s: "2026-10-01", e: "2026-10-31" },
                  { label: "Full NRT", s: "2026-09-10", e: "2026-11-09" },
                  { label: "2000–2026", s: "2000-01-01", e: "2026-11-09" },
                ].map((preset) => {
                  const isActive = startDate === preset.s && endDate === preset.e;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => onChangeDateRange?.(preset.s, preset.e)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-amber-500 text-slate-950 font-bold border border-amber-300 shadow-sm"
                          : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-900"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Satellite Sensor Stream */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Satellite Sensor Stream:</span>
                <span className="text-amber-400 font-mono font-bold">
                  {sensorFilter === "all" ? "All Sensors" : sensorFilter}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(["all", "MODIS", "VIIRS"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChangeSensorFilter?.(s)}
                    className={`h-6 rounded text-[11px] font-mono font-medium transition-all cursor-pointer ${
                      sensorFilter === s
                        ? "bg-amber-600 text-white font-bold shadow-sm"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-900"
                    }`}
                  >
                    {s === "all" ? "All Sensors" : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Diurnal Phase */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Diurnal Phase:</span>
                <span className="text-amber-400 font-mono font-bold">
                  {daynightFilter === "all" ? "Day & Night" : daynightFilter === "D" ? "Day Flaming" : "Night Smoldering"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: "all", label: "All Phases", icon: null },
                  { id: "D", label: "Day", icon: IconSun },
                  { id: "N", label: "Night", icon: IconMoon },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onChangeDaynightFilter?.(id as any)}
                    className={`h-6 rounded text-[11px] font-mono font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      daynightFilter === id
                        ? "bg-amber-600 text-white font-bold shadow-sm"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-900"
                    }`}
                  >
                    {Icon && <Icon className="size-2.5" />}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Synchronized Status Pill */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold">Standardized Parameters (Live Synced with Map View):</span>
              <span className="text-slate-300">
                {currentPreset.name} • {harmonizationMode} • {viewMetric} • {colorRamp} ramp • {sensorFilter} • {daynightFilter} phase
              </span>
            </div>
            <button
              type="button"
              onClick={onSwitchToMap}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <IconMap className="size-3" /> Inspect on Live Map →
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs (Harmonized Charts vs Calendar Matrix vs Regimes) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 flex-wrap">
            <button
              onClick={() => setActiveAnalysisSection("trends")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeAnalysisSection === "trends"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <IconChartBar className="size-3.5" />
              <span>Harmonized Charts (Chart.js)</span>
            </button>

            <button
              onClick={() => setActiveAnalysisSection("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeAnalysisSection === "calendar"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <IconCalendar className="size-3.5" />
              <span>26-Yr Calendar Matrix (2000–2026)</span>
            </button>

            <button
              onClick={() => setActiveAnalysisSection("compare")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeAnalysisSection === "compare"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <IconScale className="size-3.5 text-cyan-400" />
              <span>Dual-Region Comparison</span>
            </button>

            <button
              onClick={() => setActiveAnalysisSection("regimes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeAnalysisSection === "regimes"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <IconWorld className="size-3.5" />
              <span>13 Bio-Regimes Overview</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Current: <strong className="text-white">{currentPreset.name}</strong></span>
          </div>
        </div>

        {/* View 1: 26-Year Calendar Matrix Heatmap */}
        {activeAnalysisSection === "calendar" && calendarData && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5 backdrop-blur-md">
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <IconCalendar className="size-4 text-amber-500" />
                    Harmonized 26-Year Timeline Grid
                  </h3>
                  <p className="text-xs text-slate-400">
                    Hover over cells for multi-sensor breakdown; click any cell to inspect that monthly regime.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                  <span className="inline-block size-2 rounded-full bg-amber-500" />
                  <span>26 Years (2000–2026) × 12 Months</span>
                </div>
              </div>

              <FireCalendar
                calendarData={calendarData.calendar}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onSelectCell={onSelectCell}
                colorRamp={colorRamp}
                viewMetric={viewMetric}
                harmonizationMode={harmonizationMode}
                regionName={currentPreset.name}
              />
            </div>
          </div>
        )}

        {/* View 2: Multi-Chart Analytics Dashboard (All Chart.js Charts rendered together) */}
        {activeAnalysisSection === "trends" && calendarData && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <FireAnalytics
              calendarData={calendarData.calendar}
              dailySeries={calendarData.daily_series_2026 || []}
              monthlyBaselines={calendarData.monthly_baselines || {}}
              regionName={currentPreset.name}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          </div>
        )}

        {/* View 3: Dual-Region Comparative Analysis (Side-by-side charts) */}
        {activeAnalysisSection === "compare" && (
          <FireComparison
            primaryRegion={selectedRegion}
            primaryCalendarData={calendarData}
            onSelectPrimaryRegion={onSelectRegion}
          />
        )}

        {/* Tab 3: 13 Bio-Regimes Comparison Grid */}
        {activeAnalysisSection === "regimes" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {REGION_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedRegion;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelectRegion(preset.id)}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 relative overflow-hidden group ${
                      isSelected
                        ? "bg-slate-800/90 border-amber-500 ring-1 ring-amber-500 shadow-lg shadow-amber-500/10"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400 bg-amber-500/10">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                      <div className="flex justify-between">
                        <span>Continuity Multiplier:</span>
                        <span className="text-slate-200 font-semibold">×{preset.continuityFactor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Center Coordinates:</span>
                        <span className="text-slate-300">{preset.center[0]}°, {preset.center[1]}°</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
