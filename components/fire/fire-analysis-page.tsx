"use client";

import React, { useState } from "react";
import {
  RegionalCalendarData,
  ColorRampType,
  ViewMetric,
  HarmonizationMode,
} from "./types";
import { REGION_PRESETS } from "./constants";
import { FireCalendar } from "./fire-calendar";
import { FireAnalytics } from "./fire-analytics";
import { FireComparison } from "./fire-comparison";
import { AnalysisHeaderControls } from "./analysis/analysis-header-controls";
import { AnalysisRegimesView } from "./analysis/analysis-regimes-view";
import {
  IconCalendar,
  IconChartBar,
  IconWorld,
  IconScale,
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
}: FireAnalysisPageProps) {
  const [activeAnalysisSection, setActiveAnalysisSection] = useState<
    "trends" | "calendar" | "compare" | "regimes"
  >("trends");

  const currentPreset =
    REGION_PRESETS.find((r) => r.id === selectedRegion) || REGION_PRESETS[0];

  return (
    <div className="w-full h-full min-h-screen overflow-y-auto bg-slate-950 text-slate-100 pb-16 pt-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Analysis Header & Controls Card */}
        <AnalysisHeaderControls
          calendarData={calendarData}
          selectedRegion={selectedRegion}
          onSelectRegion={onSelectRegion}
          colorRamp={colorRamp}
          onChangeColorRamp={onChangeColorRamp}
          viewMetric={viewMetric}
          onChangeViewMetric={onChangeViewMetric}
          harmonizationMode={harmonizationMode}
          onChangeHarmonizationMode={onChangeHarmonizationMode}
          onOpenExportDialog={onOpenExportDialog}
          onSwitchToMap={onSwitchToMap}
          startDate={startDate}
          endDate={endDate}
          onChangeDateRange={onChangeDateRange}
          sensorFilter={sensorFilter}
          onChangeSensorFilter={onChangeSensorFilter}
          daynightFilter={daynightFilter}
          onChangeDaynightFilter={onChangeDaynightFilter}
        />

        {/* Section Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 flex-wrap">
            <button
              onClick={() => setActiveAnalysisSection("trends")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeAnalysisSection === "trends"
                  ? "bg-amber-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <IconChartBar className="size-3.5" />
              <span>Harmonized Charts (Chart.js)</span>
            </button>

            <button
              onClick={() => setActiveAnalysisSection("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeAnalysisSection === "calendar"
                  ? "bg-amber-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <IconCalendar className="size-3.5" />
              <span>26-Yr Calendar Matrix (2000–2026)</span>
            </button>

            <button
              onClick={() => setActiveAnalysisSection("compare")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeAnalysisSection === "compare"
                  ? "bg-amber-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <IconScale className="size-3.5 text-cyan-400" />
              <span>Dual-Region Comparison</span>
            </button>

            <button
              onClick={() => setActiveAnalysisSection("regimes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeAnalysisSection === "regimes"
                  ? "bg-amber-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <IconWorld className="size-3.5" />
              <span>13 Bio-Regimes Overview</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>
              Current: <strong className="text-white">{currentPreset.name}</strong>
            </span>
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
                    Hover over cells for multi-sensor breakdown; click any cell to inspect
                    that monthly regime.
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

        {/* View 2: Multi-Chart Analytics Dashboard */}
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

        {/* View 3: Dual-Region Comparative Analysis */}
        {activeAnalysisSection === "compare" && (
          <FireComparison
            primaryRegion={selectedRegion}
            primaryCalendarData={calendarData}
            onSelectPrimaryRegion={onSelectRegion}
          />
        )}

        {/* View 4: 13 Bio-Regimes Comparison Grid */}
        {activeAnalysisSection === "regimes" && (
          <AnalysisRegimesView
            selectedRegion={selectedRegion}
            onSelectRegion={onSelectRegion}
          />
        )}
      </div>
    </div>
  );
}
