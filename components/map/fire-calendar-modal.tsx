"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ColorRampType,
  ViewMetric,
  HarmonizationMode,
} from "./types";
import { RegionalCalendarData } from "@/components/fire/types";
import { REGION_PRESETS, MONTH_NAMES } from "@/components/fire/constants";
import { FireCalendar } from "@/components/fire/fire-calendar";
import { FireAnalytics } from "@/components/fire/fire-analytics";
import {
  IconFlame,
  IconCalendar,
  IconTrendingUp,
  IconDownload,
  IconX,
  IconAdjustmentsHorizontal,
  IconLayersSubtract,
} from "@tabler/icons-react";

interface FireCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendarData: RegionalCalendarData | null;
  selectedRegion: string;
  onSelectRegion: (r: string) => void;
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
  onFlyToRegion: (lat: number, lng: number, zoom?: number) => void;
}

export function FireCalendarModal({
  isOpen,
  onClose,
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
  onFlyToRegion,
}: FireCalendarModalProps) {
  const [activeTab, setActiveTab] = useState<"matrix" | "analytics">("matrix");

  const currentPreset =
    REGION_PRESETS.find((r) => r.id === selectedRegion) || REGION_PRESETS[0];

  const handleRegionSelect = (regId: string) => {
    onSelectRegion(regId);
    const p = REGION_PRESETS.find((r) => r.id === regId);
    if (p) {
      onFlyToRegion(p.center[0], p.center[1], p.zoom);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] w-[1400px] max-h-[92vh] h-[92vh] bg-slate-950 border-slate-800 text-slate-100 flex flex-col p-0 overflow-hidden shadow-2xl z-50">
        {/* Top Modal Header */}
        <DialogHeader className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex flex-row flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-gradient-to-br from-amber-500 via-rose-600 to-red-600 flex items-center justify-center shadow-lg shadow-rose-950/40">
              <IconFlame className="size-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono text-amber-400 border-amber-500/30 bg-amber-950/30">
                  NASA FIRMS
                </Badge>
                <DialogTitle className="text-base font-bold text-white tracking-tight">
                  26-Year Harmonized Burning Activity Calendar (2000–2026)
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-400">
                Continuous cross-sensor climatology: MODIS 1km & VIIRS 375m co-observation window (173 months)
              </DialogDescription>
            </div>
          </div>

          {/* Action Tabs & Export */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <Button
                size="sm"
                variant={activeTab === "matrix" ? "default" : "ghost"}
                onClick={() => setActiveTab("matrix")}
                className={`h-7 px-3 text-xs gap-1.5 ${
                  activeTab === "matrix" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <IconCalendar className="size-3.5" />
                <span>26-Yr Matrix Heatmap</span>
              </Button>
              <Button
                size="sm"
                variant={activeTab === "analytics" ? "default" : "ghost"}
                onClick={() => setActiveTab("analytics")}
                className={`h-7 px-3 text-xs gap-1.5 ${
                  activeTab === "analytics" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <IconTrendingUp className="size-3.5" />
                <span>Trends & Anomalies</span>
              </Button>
            </div>

            <Button
              size="sm"
              onClick={onOpenExportDialog}
              className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 font-medium shadow-md"
            >
              <IconDownload className="size-3.5" />
              <span>Download CSV</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Control Sub-bar */}
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            {/* Region Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionSelect(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1 text-slate-100 text-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                {REGION_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Overlap Continuity Factor Badge */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-slate-300">
              <span className="text-slate-400">Continuity Factor:</span>
              <span className="text-amber-400 font-bold">
                ×{(calendarData?.overlap_continuity_factor || currentPreset.continuityFactor).toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Harmonization Mode Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Harmonization:</span>
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
              <span className="text-slate-400 font-medium">Display Metric:</span>
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
              <span className="text-slate-400 font-medium">Color Ramp:</span>
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

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {!calendarData ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400 font-mono text-xs">
              <div className="size-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading NASA FIRMS 26-Year Calendar...</span>
            </div>
          ) : activeTab === "matrix" ? (
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
          ) : (
            <FireAnalytics
              calendarData={calendarData.calendar}
              dailySeries={calendarData.daily_series_2026 || []}
              monthlyBaselines={calendarData.monthly_baselines}
              regionName={currentPreset.name}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
