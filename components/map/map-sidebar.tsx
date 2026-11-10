"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconFlame,
  IconCalendar,
  IconDownload,
  IconMapPin,
  IconLayersSubtract,
  IconWorld,
  IconSun,
  IconMoon,
  IconX,
  IconCheck,
  IconAdjustments,
  IconAdjustmentsHorizontal,
  IconSparkles,
  IconChartBar,
  IconRotate,
} from "@tabler/icons-react";
import { REGION_PRESETS, MONTH_NAMES } from "@/components/fire/constants";
import { ColorRampType, HarmonizationMode, ViewMetric, RemarkArea } from "@/components/fire/types";
import { AVAILABLE_LAYERS } from "./data/layers";
import { FireDateRangeCalendar } from "@/components/fire/fire-date-range-calendar";

interface MapSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  // Date Range Filtering props
  startDate: string;
  endDate: string;
  onChangeDateRange: (start: string, end: string) => void;
  // NASA Fire props
  selectedRegion?: string;
  onSelectRegion?: (regionId: string) => void;
  showHotspots?: boolean;
  onToggleHotspots?: (show: boolean) => void;
  sensorFilter?: "all" | "MODIS" | "VIIRS";
  onChangeSensorFilter?: (s: "all" | "MODIS" | "VIIRS") => void;
  minFrpFilter?: number;
  onChangeMinFrpFilter?: (frp: number) => void;
  daynightFilter?: "all" | "D" | "N";
  onChangeDaynightFilter?: (dn: "all" | "D" | "N") => void;
  colorRamp?: ColorRampType;
  onChangeColorRamp?: (ramp: ColorRampType) => void;
  harmonizationMode?: HarmonizationMode;
  onChangeHarmonizationMode?: (mode: HarmonizationMode) => void;
  viewMetric?: ViewMetric;
  onChangeViewMetric?: (metric: ViewMetric) => void;
  selectedYear?: number | null;
  selectedMonth?: number | null;
  onResetSelectedPeriod?: () => void;
  remarkArea?: RemarkArea;
  onClearRemarkArea?: () => void;
  onOpenRemarkDialog?: () => void;
  onOpenExportDialog?: () => void;
  hotspotsCount?: number;
  totalFrp?: number;
  // Map Layer props
  activeLayerId: string;
  onSelectLayer: (layerId: string) => void;
}

export function MapSidebar({
  isOpen,
  onClose,
  startDate,
  endDate,
  onChangeDateRange,
  selectedRegion = "Global",
  onSelectRegion,
  showHotspots = true,
  onToggleHotspots,
  sensorFilter = "all",
  onChangeSensorFilter,
  minFrpFilter = 0,
  onChangeMinFrpFilter,
  daynightFilter = "all",
  onChangeDaynightFilter,
  colorRamp = "flame",
  onChangeColorRamp,
  harmonizationMode = "overlap_scaled",
  onChangeHarmonizationMode,
  viewMetric = "harmonized_count",
  onChangeViewMetric,
  selectedYear,
  selectedMonth,
  onResetSelectedPeriod,
  remarkArea = { type: "none" },
  onClearRemarkArea,
  onOpenRemarkDialog,
  onOpenExportDialog,
  hotspotsCount = 0,
  totalFrp = 0,
  activeLayerId,
  onSelectLayer,
}: MapSidebarProps) {
  const currentPreset = REGION_PRESETS.find((r) => r.id === selectedRegion) || REGION_PRESETS[0];

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 left-4 z-30 w-[390px] max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] max-h-[860px] flex flex-col bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-left-4 duration-200 text-slate-100">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-950/50">
            <IconFlame className="size-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white leading-none">
              NASA FIRMS Fire Explorer
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] text-slate-400 font-mono">MODIS & VIIRS Harmonized</span>
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 font-mono text-amber-400 border-amber-500/30 bg-amber-500/10">
                2000–2026
              </Badge>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <IconX className="size-4" />
        </Button>
      </div>

      {/* Tabs navigation: Fire Filters vs Map Layers */}
      <Tabs defaultValue="filters" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 pt-2 border-b border-slate-800/80 bg-slate-900/20">
          <TabsList className="grid grid-cols-2 w-full h-8 p-0.5 bg-slate-900 border border-slate-800">
            <TabsTrigger value="filters" className="text-xs gap-1.5 font-medium data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <IconFlame className="size-3.5" /> Fire Filters & Date
            </TabsTrigger>
            <TabsTrigger value="layers" className="text-xs gap-1.5 font-medium data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              <IconLayersSubtract className="size-3.5" /> Map Layers
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. Fire Filters & Date Range Tab */}
        <TabsContent value="filters" className="flex-1 overflow-y-auto p-3.5 space-y-3.5 m-0 focus-visible:outline-none custom-scrollbar">
          {/* Active Calibration & Synchronization Ribbon */}
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono space-y-1.5">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-300">Synchronized Parameters</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                Live Synced with Analysis
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1 text-[10px]">
              <Badge variant="outline" className="border-slate-700 bg-slate-950 text-slate-300 px-1.5 py-0 font-mono">
                {currentPreset.name}
              </Badge>
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 px-1.5 py-0 font-mono">
                {harmonizationMode === "overlap_scaled"
                  ? "Overlap Scaled"
                  : harmonizationMode === "active_fire_hex_days"
                  ? "Hex-Days"
                  : harmonizationMode === "vza_frp"
                  ? "VZA-FRP"
                  : "MODIS-Equiv"}
              </Badge>
              <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300 px-1.5 py-0 font-mono">
                {viewMetric === "harmonized_count"
                  ? "Hotspots Count"
                  : viewMetric === "active_fire_hex_days"
                  ? "Hex-Days"
                  : viewMetric === "harmonized_frp_mw"
                  ? "FRP MW"
                  : "Anomaly"}
              </Badge>
              <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-300 px-1.5 py-0 font-mono capitalize">
                {colorRamp} Ramp
              </Badge>
            </div>

            {/* Selected Historical Cell Indicator (from Fire Analysis) */}
            {selectedYear && selectedMonth && (
              <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-amber-300 flex items-center gap-1">
                  <IconCalendar className="size-3 text-amber-400" />
                  <span>Inspecting: <strong>{MONTH_NAMES[(selectedMonth || 1) - 1]} {selectedYear}</strong></span>
                </span>
                {onResetSelectedPeriod && (
                  <button
                    type="button"
                    onClick={onResetSelectedPeriod}
                    className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-0.5 cursor-pointer"
                  >
                    <IconRotate className="size-2.5" /> Reset
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section A: Date Range Filter with Interactive Calendar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <IconCalendar className="size-3.5 text-amber-500" />
                <span>Filter Date Range</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Observation Window
              </span>
            </div>

            {/* Embedded Interactive Calendar Date Range Component */}
            <FireDateRangeCalendar
              startDate={startDate}
              endDate={endDate}
              onChangeDateRange={onChangeDateRange}
              minDate="2000-01-01"
              maxDate="2026-11-09"
            />
          </div>

          {/* Section B: Target Bio-Climatic Regime */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <IconWorld className="size-3.5 text-slate-400" />
                <span>Target Bio-Climatic Regime</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-400">
                ×{currentPreset.continuityFactor} scale
              </span>
            </div>
            <select
              value={selectedRegion}
              onChange={(e) => onSelectRegion?.(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {REGION_PRESETS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section C: Harmonization Model & Display Calibration (Standardized with Fire Analysis) */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <IconAdjustmentsHorizontal className="size-3.5 text-amber-400" />
                <span>Harmonization & Display Calibration</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Analysis Sync
              </span>
            </div>

            {/* 1. Harmonization Model */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <IconLayersSubtract className="size-3 text-slate-400" />
                  <span>Harmonization Model</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">
                  {harmonizationMode === "overlap_scaled" ? `×${currentPreset.continuityFactor} k_ratio` : ""}
                </span>
              </div>
              <select
                value={harmonizationMode}
                onChange={(e) => onChangeHarmonizationMode?.(e.target.value as HarmonizationMode)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-mono"
              >
                <option value="overlap_scaled">Overlap Continuity Scaled (k_ratio)</option>
                <option value="active_fire_hex_days">Active Fire Hex-Days (H3 Res 7)</option>
                <option value="vza_frp">VZA-Recalibrated FRP (MW)</option>
                <option value="modis_equivalent">MODIS-Equivalent (&gt;3.7 MW)</option>
              </select>
            </div>

            {/* 2. Display Metric */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <IconChartBar className="size-3 text-slate-400" />
                  <span>Primary Display Metric</span>
                </span>
              </div>
              <select
                value={viewMetric}
                onChange={(e) => onChangeViewMetric?.(e.target.value as ViewMetric)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-mono"
              >
                <option value="harmonized_count">Harmonized Hotspots Count</option>
                <option value="active_fire_hex_days">Active Fire Hex-Days (Spatial footprint)</option>
                <option value="harmonized_frp_mw">Radiative Power Energy (MW)</option>
              </select>
            </div>

            {/* 3. Perceptual Color Ramp */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <IconSparkles className="size-3 text-slate-400" />
                  <span>Map Hotspot Color Ramp</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Perceptual</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "flame", label: "Flame (Thermal)", gradient: "from-amber-500 via-rose-500 to-red-600" },
                  { id: "viridis", label: "Viridis (Colorblind)", gradient: "from-indigo-600 via-teal-500 to-yellow-400" },
                  { id: "inferno", label: "Inferno (Contrast)", gradient: "from-purple-900 via-rose-600 to-yellow-300" },
                  { id: "diverging_anomaly", label: "Diverging Anomaly", gradient: "from-blue-500 via-slate-400 to-red-500" },
                ].map((ramp) => {
                  const isSelected = colorRamp === ramp.id;
                  return (
                    <button
                      key={ramp.id}
                      type="button"
                      onClick={() => onChangeColorRamp?.(ramp.id as ColorRampType)}
                      className={`h-8 px-2 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-800 border-amber-500 ring-1 ring-amber-500/80 shadow-sm"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`size-3 rounded-full bg-gradient-to-r ${ramp.gradient} shrink-0`} />
                        <span className="text-[11px] font-mono leading-none">{ramp.label}</span>
                      </div>
                      {isSelected && <IconCheck className="size-3 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section D: Sensor Stream & Day/Night Filters */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            {/* Sensor Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Satellite Sensor Stream
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(["all", "MODIS", "VIIRS"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChangeSensorFilter?.(s)}
                    className={`h-7 rounded text-xs font-mono font-medium transition-all ${
                      sensorFilter === s
                        ? "bg-amber-600 text-white font-bold shadow-sm"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800/60"
                    }`}
                  >
                    {s === "all" ? "All Sensors" : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Day / Night Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Diurnal Phase
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: "all", label: "Day & Night", icon: null },
                  { id: "D", label: "Day Flaming", icon: IconSun },
                  { id: "N", label: "Night Smolder", icon: IconMoon },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onChangeDaynightFilter?.(id as any)}
                    className={`h-7 rounded text-xs font-mono font-medium flex items-center justify-center gap-1 transition-all ${
                      daynightFilter === id
                        ? "bg-amber-600 text-white font-bold shadow-sm"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800/60"
                    }`}
                  >
                    {Icon && <Icon className="size-3" />}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Min FRP Threshold Filter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Minimum Radiative Power</span>
                <span className="font-mono text-amber-400 font-bold">{minFrpFilter} MW</span>
              </div>
              <Slider
                value={[minFrpFilter]}
                onValueChange={(val) => {
                  const num = Array.isArray(val) ? val[0] : typeof val === "number" ? val : 0;
                  onChangeMinFrpFilter?.(num);
                }}
                min={0}
                max={500}
                step={10}
                className="py-1"
              />
            </div>
          </div>

          {/* Section E: Area of Interest (AOI) & Remark Dialog */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <IconMapPin className="size-3.5 text-rose-500" />
                <span>Area of Interest (AOI)</span>
              </label>
              {remarkArea.type !== "none" && (
                <button
                  type="button"
                  onClick={onClearRemarkArea}
                  className="text-[10px] text-rose-400 hover:underline"
                >
                  Clear AOI
                </button>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenRemarkDialog}
              className="w-full h-8 text-xs font-mono justify-between border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              <span>{remarkArea.name || "Enter Coordinates / Draw AOI"}</span>
              <IconMapPin className="size-3.5 text-amber-500" />
            </Button>
          </div>

          {/* Section F: Live Hotspots Summary & CSV Export */}
          <div className="space-y-2 pt-3 border-t border-slate-800/80">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Filtered Active Hotspots:</span>
                <span className={`font-mono font-bold ${viewMetric === "harmonized_count" ? "text-amber-400 text-sm" : "text-white"}`}>
                  {hotspotsCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Radiative Energy:</span>
                <span className={`font-mono font-bold ${viewMetric === "harmonized_frp_mw" ? "text-amber-400 text-sm" : "text-amber-400"}`}>
                  {totalFrp >= 1000 ? `${(totalFrp / 1000).toFixed(1)}k MW` : `${totalFrp} MW`}
                </span>
              </div>
              {viewMetric === "active_fire_hex_days" && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Est. Active Hex-Days (Res-7):</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">
                    {Math.round(hotspotsCount * 0.42).toLocaleString()} hex-days
                  </span>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={onOpenExportDialog}
              className="w-full border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/20 text-xs h-8 gap-1.5 cursor-pointer"
            >
              <IconDownload className="size-3.5" />
              <span>Download Searched Data (CSV)</span>
            </Button>
          </div>
        </TabsContent>

        {/* 2. Map Layers Tab */}
        <TabsContent value="layers" className="flex-1 overflow-y-auto p-3.5 space-y-4 m-0 focus-visible:outline-none">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Tile Layer Selection</span>
              <span className="text-[10px] text-slate-500 font-mono">Leaflet 2.0-beta</span>
            </label>

            <div className="space-y-1.5">
              {AVAILABLE_LAYERS.map((layer) => {
                const isSelected = layer.id === activeLayerId;
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => onSelectLayer(layer.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-slate-800/90 border-amber-500 ring-1 ring-amber-500"
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/30"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{layer.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{layer.description}</div>
                    </div>
                    {isSelected && <IconCheck className="size-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
