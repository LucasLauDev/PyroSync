"use client";

import React, { useState } from "react";
import {
  ColorRampType,
  ViewMetric,
  HarmonizationMode,
  RegionalCalendarData,
} from "../types";
import { REGION_PRESETS } from "../constants";
import { FireDateRangeCalendar } from "../fire-date-range-calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconFlame,
  IconCalendar,
  IconMap,
  IconDownload,
  IconSparkles,
  IconAdjustmentsHorizontal,
  IconLayersSubtract,
  IconWorld,
  IconSun,
  IconMoon,
  IconChevronDown,
  IconChevronUp,
  IconX,
} from "@tabler/icons-react";

interface AnalysisHeaderControlsProps {
  calendarData: RegionalCalendarData | null;
  selectedRegion: string;
  onSelectRegion: (regionId: string) => void;
  colorRamp: ColorRampType;
  onChangeColorRamp: (ramp: ColorRampType) => void;
  viewMetric: ViewMetric;
  onChangeViewMetric: (metric: ViewMetric) => void;
  harmonizationMode: HarmonizationMode;
  onChangeHarmonizationMode: (mode: HarmonizationMode) => void;
  onOpenExportDialog: () => void;
  onSwitchToMap: () => void;
  startDate?: string;
  endDate?: string;
  onChangeDateRange?: (start: string, end: string) => void;
  sensorFilter?: "all" | "MODIS" | "VIIRS";
  onChangeSensorFilter?: (sensor: "all" | "MODIS" | "VIIRS") => void;
  daynightFilter?: "all" | "D" | "N";
  onChangeDaynightFilter?: (phase: "all" | "D" | "N") => void;
}

export function AnalysisHeaderControls({
  calendarData,
  selectedRegion,
  onSelectRegion,
  colorRamp,
  onChangeColorRamp,
  viewMetric,
  onChangeViewMetric,
  harmonizationMode,
  onChangeHarmonizationMode,
  onOpenExportDialog,
  onSwitchToMap,
  startDate = "2026-09-10",
  endDate = "2026-11-09",
  onChangeDateRange,
  sensorFilter = "all",
  onChangeSensorFilter,
  daynightFilter = "all",
  onChangeDaynightFilter,
}: AnalysisHeaderControlsProps) {
  const [isDateCalendarOpen, setIsDateCalendarOpen] = useState<boolean>(false);

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 backdrop-blur-xl p-5 sm:p-6 shadow-2xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-amber-500/30 text-amber-400 bg-amber-500/10 font-mono text-[10px] tracking-wider uppercase flex items-center gap-1"
            >
              <IconFlame className="size-3" /> NASA FIRMS Multi-Sensor Climatology
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px] bg-slate-800 text-slate-300">
              173-Month Overlap Era (2012–2026)
            </Badge>
            <Badge
              variant="outline"
              className="font-mono text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
            >
              Continuity Factor:{" "}
              {calendarData?.overlap_continuity_factor
                ? `×${calendarData.overlap_continuity_factor}`
                : "×7.8"}
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
            className="gap-1.5 bg-slate-900/80 border-slate-700 hover:bg-slate-800 text-xs text-slate-200 cursor-pointer"
          >
            <IconMap className="size-3.5 text-blue-400" />
            <span>View on Live Map</span>
          </Button>

          <Button
            size="sm"
            onClick={onOpenExportDialog}
            className="gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 cursor-pointer"
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

      {/* Controls Strip 2: Observation Window with Floating Calendar & Shared Filters */}
      <div className="mt-3 pt-3 border-t border-slate-800/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Observation Date Window with Floating Interactive Calendar */}
          <div className="space-y-1.5 relative">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <IconCalendar className="size-3.5 text-amber-500" />
                <span>Observation Window:</span>
              </span>
              <div className="flex items-center gap-1 font-bold">
                <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  {startDate}
                </span>
                <span className="text-slate-500">→</span>
                <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  {endDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDateCalendarOpen((prev) => !prev)}
                className={`h-7 px-2.5 text-xs font-mono font-semibold gap-1.5 cursor-pointer transition-all shrink-0 ${
                  isDateCalendarOpen
                    ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                    : "bg-slate-950 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800"
                }`}
              >
                <IconCalendar className="size-3.5 text-amber-400 shrink-0" />
                <span>Date Range Calendar</span>
                {isDateCalendarOpen ? (
                  <IconChevronUp className="size-3 text-white shrink-0" />
                ) : (
                  <IconChevronDown className="size-3 text-slate-400 shrink-0" />
                )}
              </Button>

              {/* Quick Preset Buttons */}
              {[
                { label: "7d", s: "2026-11-02", e: "2026-11-09", title: "Last 7 Days" },
                { label: "30d", s: "2026-10-10", e: "2026-11-09", title: "Last 30 Days" },
                { label: "Oct '26", s: "2026-10-01", e: "2026-10-31", title: "Oct 2026 Peak" },
                { label: "Full NRT", s: "2026-09-10", e: "2026-11-09", title: "Full 2026 NRT" },
                { label: "All", s: "2000-01-01", e: "2026-11-09", title: "2000–2026" },
              ].map((preset) => {
                const isActive = startDate === preset.s && endDate === preset.e;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    title={preset.title}
                    onClick={() => onChangeDateRange?.(preset.s, preset.e)}
                    className={`h-7 px-2 rounded text-[11px] font-mono font-semibold transition-all cursor-pointer ${
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

            {/* Floating Calendar Overlay Window */}
            {isDateCalendarOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDateCalendarOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2 z-50 w-[380px] sm:w-[410px] max-w-[calc(100vw-2rem)] bg-slate-950/95 backdrop-blur-2xl border border-slate-800 rounded-2xl p-3 shadow-2xl shadow-black/90 ring-1 ring-amber-500/20 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <IconCalendar className="size-3.5 text-amber-500" />
                      <span>Select Observation Window</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDateCalendarOpen(false)}
                      className="size-5 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                      aria-label="Close calendar"
                    >
                      <IconX className="size-3.5" />
                    </button>
                  </div>

                  <FireDateRangeCalendar
                    startDate={startDate}
                    endDate={endDate}
                    onChangeDateRange={(start, end) => onChangeDateRange?.(start, end)}
                    minDate="2000-01-01"
                    maxDate="2026-11-09"
                  />
                </div>
              </>
            )}
          </div>

          {/* Satellite Sensor Stream */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Satellite Sensor Stream:</span>
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
                  className={`h-7 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
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
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Diurnal Phase:</span>
              <span className="text-amber-400 font-mono font-bold">
                {daynightFilter === "all"
                  ? "Day & Night"
                  : daynightFilter === "D"
                  ? "Day Flaming"
                  : "Night Smoldering"}
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
                  className={`h-7 rounded text-xs font-mono font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    daynightFilter === id
                      ? "bg-amber-600 text-white font-bold shadow-sm"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-900"
                  }`}
                >
                  {Icon && <Icon className="size-3" />}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
