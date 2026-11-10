"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HarmonizationMode,
  ColorRampType,
  ViewMetric,
} from "./types";
import { REGION_PRESETS } from "./constants";
import {
  IconFlame,
  IconCalendar,
  IconDownload,
  IconMapPin,
  IconAdjustmentsHorizontal,
  IconLayersSubtract,
  IconInfoCircle,
  IconChartBar,
  IconRefresh,
} from "@tabler/icons-react";

interface FireHeaderProps {
  selectedRegion: string;
  onSelectRegion: (regionId: string) => void;
  harmonizationMode: HarmonizationMode;
  onChangeHarmonizationMode: (mode: HarmonizationMode) => void;
  colorRamp: ColorRampType;
  onChangeColorRamp: (ramp: ColorRampType) => void;
  viewMetric: ViewMetric;
  onChangeViewMetric: (metric: ViewMetric) => void;
  continuityFactor: number;
  activeTab: "overview" | "calendar" | "map" | "analytics";
  onChangeActiveTab: (tab: "overview" | "calendar" | "map" | "analytics") => void;
  onOpenExportDialog: () => void;
  onOpenRemarkDialog: () => void;
  dateRange: { start: string; end: string };
  onSelectQuickDateRange: (rangeKey: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export function FireHeader({
  selectedRegion,
  onSelectRegion,
  harmonizationMode,
  onChangeHarmonizationMode,
  colorRamp,
  onChangeColorRamp,
  viewMetric,
  onChangeViewMetric,
  continuityFactor,
  activeTab,
  onChangeActiveTab,
  onOpenExportDialog,
  onOpenRemarkDialog,
  onSelectQuickDateRange,
  isLoading,
  onRefresh,
}: FireHeaderProps) {
  const currentPreset =
    REGION_PRESETS.find((r) => r.id === selectedRegion) || REGION_PRESETS[0];

  return (
    <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 z-30 shrink-0">
      {/* Top Banner & NASA Branding */}
      <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-gradient-to-br from-amber-500 via-rose-600 to-red-600 flex items-center justify-center shadow-lg shadow-rose-950/40 ring-1 ring-white/20">
            <IconFlame className="size-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                NASA FIRMS
              </span>
              <h1 className="text-sm font-bold tracking-tight text-white sm:text-base">
                Harmonized Fire Calendar & Analytics
              </h1>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono text-emerald-400 border-emerald-500/30 bg-emerald-950/30">
                2000–2026 Record
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Continuous multi-sensor fusion: MODIS (Terra/Aqua 1km) & VIIRS (S-NPP, NOAA-20, NOAA-21 375m)
            </p>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          <Button
            size="sm"
            variant={activeTab === "overview" ? "default" : "ghost"}
            onClick={() => onChangeActiveTab("overview")}
            className={`h-7 px-3 text-xs gap-1.5 ${
              activeTab === "overview" ? "bg-amber-600 hover:bg-amber-500 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <IconLayersSubtract className="size-3.5" />
            <span className="hidden sm:inline">Split View</span>
          </Button>
          <Button
            size="sm"
            variant={activeTab === "calendar" ? "default" : "ghost"}
            onClick={() => onChangeActiveTab("calendar")}
            className={`h-7 px-3 text-xs gap-1.5 ${
              activeTab === "calendar" ? "bg-amber-600 hover:bg-amber-500 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <IconCalendar className="size-3.5" />
            <span>26-Yr Calendar</span>
          </Button>
          <Button
            size="sm"
            variant={activeTab === "map" ? "default" : "ghost"}
            onClick={() => onChangeActiveTab("map")}
            className={`h-7 px-3 text-xs gap-1.5 ${
              activeTab === "map" ? "bg-amber-600 hover:bg-amber-500 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <IconMapPin className="size-3.5" />
            <span>Hotspot Map</span>
          </Button>
          <Button
            size="sm"
            variant={activeTab === "analytics" ? "default" : "ghost"}
            onClick={() => onChangeActiveTab("analytics")}
            className={`h-7 px-3 text-xs gap-1.5 ${
              activeTab === "analytics" ? "bg-amber-600 hover:bg-amber-500 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <IconChartBar className="size-3.5" />
            <span>Trends & Anomaly</span>
          </Button>
        </div>

        {/* Action Buttons: Remark Area & Export CSV */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenRemarkDialog}
            className="h-8 px-2.5 text-xs bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200 gap-1.5"
            title="Enter Latitude/Longitude or draw a Remark Area"
          >
            <IconMapPin className="size-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Remark Area / Lat Lon</span>
          </Button>

          <Button
            size="sm"
            onClick={onOpenExportDialog}
            className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1.5 shadow-md shadow-emerald-950/30"
          >
            <IconDownload className="size-3.5" />
            <span>Download CSV</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
            title="Refresh Data"
          >
            <IconRefresh className={`size-3.5 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Primary Control Bar: Region, Harmonization, Color Ramps & Metrics */}
      <div className="max-w-[1920px] mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Region Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => onSelectRegion(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1 text-slate-100 text-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              {REGION_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Overlap Factor Badge */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-slate-300">
            <span className="text-slate-400">Overlap Continuity:</span>
            <span className="text-amber-400 font-bold">×{continuityFactor.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400 hidden lg:inline">(VIIRS/MODIS)</span>
          </div>

          {/* Quick Date Range Filters */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium mr-1 hidden sm:inline">Range:</span>
            <button
              type="button"
              onClick={() => onSelectQuickDateRange("7d")}
              className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              7D
            </button>
            <button
              type="button"
              onClick={() => onSelectQuickDateRange("30d")}
              className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              30D
            </button>
            <button
              type="button"
              onClick={() => onSelectQuickDateRange("all_2026")}
              className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              2026 Season
            </button>
            <button
              type="button"
              onClick={() => onSelectQuickDateRange("all_time")}
              className="px-2 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium"
            >
              2000–2026 (26 Yrs)
            </button>
          </div>
        </div>

        {/* Controls: Harmonization Mode, Metric & Color Ramp */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Harmonization Mode Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium hidden md:inline">Mode:</span>
            <select
              value={harmonizationMode}
              onChange={(e) => onChangeHarmonizationMode(e.target.value as HarmonizationMode)}
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <option value="overlap_scaled">Overlap Continuity Scaled</option>
              <option value="active_fire_hex_days">Active Fire Hex-Days (H3 Res 7)</option>
              <option value="vza_frp">VZA-Recalibrated FRP (MW)</option>
              <option value="modis_equivalent">MODIS Equivalent (&gt;3.7 MW)</option>
            </select>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium hidden lg:inline">Display:</span>
            <select
              value={viewMetric}
              onChange={(e) => onChangeViewMetric(e.target.value as ViewMetric)}
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <option value="harmonized_count">Harmonized Fire Count</option>
              <option value="harmonized_frp_mw">Total FRP Energy (MW)</option>
              <option value="active_fire_hex_days">Active Fire Hex-Days</option>
              <option value="relative_anomaly_pct">Anomaly vs Median (%)</option>
              <option value="robust_z_score">Robust Z-Score Departure</option>
            </select>
          </div>

          {/* Color Ramp Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium hidden xl:inline">Color Ramp:</span>
            <select
              value={colorRamp}
              onChange={(e) => onChangeColorRamp(e.target.value as ColorRampType)}
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <option value="flame">Flame / Thermal (Orange-Red)</option>
              <option value="viridis">Viridis (Colorblind-Safe)</option>
              <option value="inferno">Inferno (High Contrast)</option>
              <option value="diverging_anomaly">Diverging Anomaly (Blue/Gray/Red)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
