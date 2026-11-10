"use client";

import React from "react";
import {
  IconAdjustmentsHorizontal,
  IconLayersSubtract,
  IconChartBar,
  IconSparkles,
  IconCheck,
} from "@tabler/icons-react";
import { ColorRampType, HarmonizationMode, ViewMetric } from "@/components/fire/types";

interface SidebarCalibrationSectionProps {
  currentPreset: { continuityFactor: number };
  harmonizationMode?: HarmonizationMode;
  onChangeHarmonizationMode?: (mode: HarmonizationMode) => void;
  viewMetric?: ViewMetric;
  onChangeViewMetric?: (metric: ViewMetric) => void;
  colorRamp?: ColorRampType;
  onChangeColorRamp?: (ramp: ColorRampType) => void;
}

export function SidebarCalibrationSection({
  currentPreset,
  harmonizationMode = "overlap_scaled",
  onChangeHarmonizationMode,
  viewMetric = "harmonized_count",
  onChangeViewMetric,
  colorRamp = "flame",
  onChangeColorRamp,
}: SidebarCalibrationSectionProps) {
  return (
    <div className="space-y-3 pt-2 border-t border-slate-800/80">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <IconAdjustmentsHorizontal className="size-3.5 text-amber-400" />
          <span>Harmonization & Display Calibration</span>
        </label>
        <span className="text-[10px] text-slate-400 font-mono">Analysis Sync</span>
      </div>

      {/* 1. Harmonization Model */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <IconLayersSubtract className="size-3 text-slate-400" />
            <span>Harmonization Model</span>
          </span>
          <span className="text-[10px] text-amber-400 font-mono font-bold">
            {harmonizationMode === "overlap_scaled"
              ? `×${currentPreset.continuityFactor} k_ratio`
              : ""}
          </span>
        </div>
        <select
          value={harmonizationMode}
          onChange={(e) =>
            onChangeHarmonizationMode?.(e.target.value as HarmonizationMode)
          }
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
            {
              id: "flame",
              label: "Flame (Thermal)",
              gradient: "from-amber-500 via-rose-500 to-red-600",
            },
            {
              id: "viridis",
              label: "Viridis (Colorblind)",
              gradient: "from-indigo-600 via-teal-500 to-yellow-400",
            },
            {
              id: "inferno",
              label: "Inferno (Contrast)",
              gradient: "from-purple-900 via-rose-600 to-yellow-300",
            },
            {
              id: "diverging_anomaly",
              label: "Diverging Anomaly",
              gradient: "from-blue-500 via-slate-400 to-red-500",
            },
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
                  <span
                    className={`size-3 rounded-full bg-gradient-to-r ${ramp.gradient} shrink-0`}
                  />
                  <span className="text-[11px] font-mono leading-none">{ramp.label}</span>
                </div>
                {isSelected && <IconCheck className="size-3 text-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
