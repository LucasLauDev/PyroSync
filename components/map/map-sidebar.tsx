"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconFlame,
  IconCalendar,
  IconMapPin,
  IconLayersSubtract,
  IconWorld,
  IconSun,
  IconMoon,
  IconX,
  IconRotate,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { REGION_PRESETS, MONTH_NAMES } from "@/components/fire/constants";
import { ColorRampType, HarmonizationMode, ViewMetric, RemarkArea } from "@/components/fire/types";
import { FireDateRangeCalendar } from "@/components/fire/fire-date-range-calendar";
import { SidebarCalibrationSection } from "./sidebar/sidebar-calibration-section";
import { SidebarLayersTab } from "./sidebar/sidebar-layers-tab";
import { SidebarHotspotsSummary } from "./sidebar/sidebar-hotspots-summary";

interface MapSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  onChangeDateRange: (start: string, end: string) => void;
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
  const [isDateRangeExpanded, setIsDateRangeExpanded] = useState<boolean>(true);
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
          className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <IconX className="size-4" />
        </Button>
      </div>

      {/* Tabs navigation: Fire Filters vs Map Layers */}
      <Tabs defaultValue="filters" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 pt-2 border-b border-slate-800/80 bg-slate-900/20">
          <TabsList className="grid grid-cols-2 w-full h-8 p-0.5 bg-slate-900 border border-slate-800">
            <TabsTrigger value="filters" className="text-xs gap-1.5 font-medium data-[state=active]:bg-amber-600 data-[state=active]:text-white cursor-pointer">
              <IconFlame className="size-3.5" /> Fire Filters & Date
            </TabsTrigger>
            <TabsTrigger value="layers" className="text-xs gap-1.5 font-medium data-[state=active]:bg-slate-800 data-[state=active]:text-white cursor-pointer">
              <IconLayersSubtract className="size-3.5" /> Map Layers
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. Fire Filters & Date Range Tab */}
        <TabsContent value="filters" className="flex-1 overflow-y-auto p-3.5 space-y-3.5 m-0 focus-visible:outline-none custom-scrollbar">
          {/* Selected Historical Cell Indicator */}
          {selectedYear && selectedMonth && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
              <span className="text-amber-300 flex items-center gap-1">
                <IconCalendar className="size-3 text-amber-400" />
                <span>Inspecting: <strong>{MONTH_NAMES[(selectedMonth || 1) - 1]} {selectedYear}</strong></span>
              </span>
              {onResetSelectedPeriod && (
                <button
                  type="button"
                  onClick={onResetSelectedPeriod}
                  className="text-[10px] text-amber-400/80 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer underline"
                >
                  <IconRotate className="size-2.5" /> Reset
                </button>
              )}
            </div>
          )}

          {/* Section A: Date Range Filter (Collapsible) */}
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/50 p-2.5 transition-all">
            <div
              onClick={() => setIsDateRangeExpanded((prev) => !prev)}
              className="flex items-center justify-between cursor-pointer select-none group"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsDateRangeExpanded((prev) => !prev);
                }
              }}
            >
              <div className="flex items-center gap-1.5">
                <IconCalendar className="size-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                  Filter Date Range
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold">
                  <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    {startDate}
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    {endDate}
                  </span>
                </div>
                <div className="size-6 rounded-md hover:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                  {isDateRangeExpanded ? (
                    <IconChevronUp className="size-3.5" />
                  ) : (
                    <IconChevronDown className="size-3.5" />
                  )}
                </div>
              </div>
            </div>

            {/* Collapsible Calendar Body */}
            {isDateRangeExpanded && (
              <div className="pt-2 border-t border-slate-800/80 animate-in fade-in slide-in-from-top-1 duration-150">
                <FireDateRangeCalendar
                  startDate={startDate}
                  endDate={endDate}
                  onChangeDateRange={onChangeDateRange}
                  minDate="2000-01-01"
                  maxDate="2026-11-09"
                />
              </div>
            )}
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

          {/* Section C: Harmonization & Display Calibration */}
          <SidebarCalibrationSection
            currentPreset={currentPreset}
            harmonizationMode={harmonizationMode}
            onChangeHarmonizationMode={onChangeHarmonizationMode}
            viewMetric={viewMetric}
            onChangeViewMetric={onChangeViewMetric}
            colorRamp={colorRamp}
            onChangeColorRamp={onChangeColorRamp}
          />

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
                    className={`h-7 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
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
                    className={`h-7 rounded text-xs font-mono font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
                className="py-1 cursor-pointer"
              />
            </div>
          </div>

          {/* Section E: Area of Interest (AOI) */}
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
                  className="text-[10px] text-rose-400 hover:underline cursor-pointer"
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
              className="w-full h-8 text-xs font-mono justify-between border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <span>{remarkArea.name || "Enter Coordinates / Draw AOI"}</span>
              <IconMapPin className="size-3.5 text-amber-500" />
            </Button>
          </div>

          {/* Section F: Live Hotspots Summary & CSV Export */}
          <SidebarHotspotsSummary
            hotspotsCount={hotspotsCount}
            totalFrp={totalFrp}
            viewMetric={viewMetric}
            onOpenExportDialog={onOpenExportDialog}
          />
        </TabsContent>

        {/* 2. Map Layers Tab */}
        <TabsContent value="layers" className="flex-1 overflow-y-auto p-3.5 space-y-4 m-0 focus-visible:outline-none">
          <SidebarLayersTab
            activeLayerId={activeLayerId}
            onSelectLayer={onSelectLayer}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
