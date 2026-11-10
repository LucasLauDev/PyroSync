"use client";

import React from "react";
import { REGION_PRESETS } from "../constants";
import { Badge } from "@/components/ui/badge";
import {
  IconWorld,
  IconCalendar,
  IconSun,
  IconFilter,
  IconLayersSubtract,
  IconScale,
} from "@tabler/icons-react";
import { ComparisonFilters, AVAILABLE_YEARS } from "./comparison-types";

interface ComparisonControlsProps {
  filters1: ComparisonFilters;
  onChangeFilters1: (updates: Partial<ComparisonFilters>) => void;
  filters2: ComparisonFilters;
  onChangeFilters2: (updates: Partial<ComparisonFilters>) => void;
  preset1: (typeof REGION_PRESETS)[0];
  preset2: (typeof REGION_PRESETS)[0];
  onSelectPrimaryRegion?: (reg: string) => void;
  onApplyPreset: (config: {
    r1: string;
    y1: number;
    r2: string;
    y2: number;
    dn1?: "all" | "D" | "N";
    dn2?: "all" | "D" | "N";
  }) => void;
}

export function ComparisonControls({
  filters1,
  onChangeFilters1,
  filters2,
  onChangeFilters2,
  preset1,
  preset2,
  onSelectPrimaryRegion,
  onApplyPreset,
}: ComparisonControlsProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <IconScale className="size-5 text-cyan-400" />
            Dual-Region Comparative Analysis Engine
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select and customize filters for both Input 1 and Input 2 independently (region, year, diurnal phase, sensor, and metric).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-500/10 font-mono text-[10px]">
            Input 1: {preset1.name} ({filters1.year})
          </Badge>
          <span className="text-slate-500 font-bold">vs</span>
          <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 bg-cyan-500/10 font-mono text-[10px]">
            Input 2: {preset2.name} ({filters2.year})
          </Badge>
        </div>
      </div>

      {/* The Two Independent Input Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* INPUT 1 CONFIGURATION PANEL (Amber Theme) */}
        <div className="p-4 rounded-xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-slate-950/80 space-y-3 relative shadow-lg shadow-amber-950/20">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400/50" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400">
                Input 1 Parameters
              </span>
            </div>
            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
              Baseline Entity
            </Badge>
          </div>

          {/* Region 1 Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <IconWorld className="size-3 text-amber-400" /> Bio-Climatic Regime:
              </span>
              <span className="font-mono text-[10px] text-amber-400/80">
                ×{preset1.continuityFactor} factor
              </span>
            </label>
            <select
              value={filters1.region}
              onChange={(e) => {
                const newReg = e.target.value;
                onChangeFilters1({ region: newReg });
                onSelectPrimaryRegion?.(newReg);
              }}
              className="w-full bg-slate-950 border border-amber-500/40 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            >
              {REGION_PRESETS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Row: Year + Diurnal Phase */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                <IconCalendar className="size-3 text-amber-400" /> Year:
              </label>
              <select
                value={filters1.year}
                onChange={(e) => onChangeFilters1({ year: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {AVAILABLE_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr} {yr === 2026 ? "(NRT)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                <IconSun className="size-3 text-amber-400" /> Diurnal Phase:
              </label>
              <select
                value={filters1.daynight}
                onChange={(e) => onChangeFilters1({ daynight: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">Day & Night (Total)</option>
                <option value="D">Day Flaming (D)</option>
                <option value="N">Night Smoldering (N)</option>
              </select>
            </div>
          </div>

          {/* Sensor Stream & Display Metric */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                <IconFilter className="size-3 text-amber-400" /> Sensor Stream:
              </label>
              <select
                value={filters1.sensor}
                onChange={(e) => onChangeFilters1({ sensor: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">All Sensors (Harmonized)</option>
                <option value="MODIS">MODIS Only (1km)</option>
                <option value="VIIRS">VIIRS Only (375m)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                <IconLayersSubtract className="size-3 text-amber-400" /> Metric Mode:
              </label>
              <select
                value={filters1.metric}
                onChange={(e) => onChangeFilters1({ metric: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="harmonized_count">Harmonized Hotspots Count</option>
                <option value="hex_days">Active Fire Hex-Days</option>
                <option value="frp_mw">Radiative Power (MW)</option>
              </select>
            </div>
          </div>
        </div>

        {/* INPUT 2 CONFIGURATION PANEL (Cyan Theme) */}
        <div className="p-4 rounded-xl border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-950/20 via-slate-900/60 to-slate-950/80 space-y-3 relative shadow-lg shadow-cyan-950/20">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400/50" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-400">
                Input 2 Parameters
              </span>
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
              Comparative Target
            </Badge>
          </div>

          {/* Region 2 Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <IconWorld className="size-3 text-cyan-400" /> Bio-Climatic Regime:
              </span>
              <span className="font-mono text-[10px] text-cyan-400/80">
                ×{preset2.continuityFactor} factor
              </span>
            </label>
            <select
              value={filters2.region}
              onChange={(e) => onChangeFilters2({ region: e.target.value })}
              className="w-full bg-slate-950 border border-cyan-500/40 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
            >
              {REGION_PRESETS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Row: Year + Diurnal Phase */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                <IconCalendar className="size-3 text-cyan-400" /> Year:
              </label>
              <select
                value={filters2.year}
                onChange={(e) => onChangeFilters2({ year: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                {AVAILABLE_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr} {yr === 2026 ? "(NRT)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                <IconSun className="size-3 text-cyan-400" /> Diurnal Phase:
              </label>
              <select
                value={filters2.daynight}
                onChange={(e) => onChangeFilters2({ daynight: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="all">Day & Night (Total)</option>
                <option value="D">Day Flaming (D)</option>
                <option value="N">Night Smoldering (N)</option>
              </select>
            </div>
          </div>

          {/* Sensor Stream & Display Metric */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                <IconFilter className="size-3 text-cyan-400" /> Sensor Stream:
              </label>
              <select
                value={filters2.sensor}
                onChange={(e) => onChangeFilters2({ sensor: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="all">All Sensors (Harmonized)</option>
                <option value="MODIS">MODIS Only (1km)</option>
                <option value="VIIRS">VIIRS Only (375m)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                <IconLayersSubtract className="size-3 text-cyan-400" /> Metric Mode:
              </label>
              <select
                value={filters2.metric}
                onChange={(e) => onChangeFilters2({ metric: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="harmonized_count">Harmonized Hotspots Count</option>
                <option value="hex_days">Active Fire Hex-Days</option>
                <option value="frp_mw">Radiative Power (MW)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Comparison Presets Strip */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
          <span>Quick Comparison Scenarios:</span>
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            {
              label: "SE Asia vs South America",
              r1: "SouthEast_Asia",
              y1: 2026,
              r2: "South_America",
              y2: 2026,
            },
            {
              label: "2026 vs 2015 El Niño (Global)",
              r1: "Global",
              y1: 2026,
              r2: "Global",
              y2: 2015,
            },
            {
              label: "Day vs Night (Amazon)",
              r1: "South_America",
              y1: 2026,
              r2: "South_America",
              y2: 2026,
              dn1: "D" as const,
              dn2: "N" as const,
            },
            {
              label: "USA vs Canada (Boreal)",
              r1: "North_America",
              y1: 2023,
              r2: "Boreal_North_America",
              y2: 2023,
            },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onApplyPreset(preset)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-[11px] font-mono transition-all cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
