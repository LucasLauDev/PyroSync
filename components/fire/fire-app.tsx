"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  RegionalCalendarData,
  Hotspot,
  HarmonizationMode,
  ColorRampType,
  ViewMetric,
  RemarkArea,
} from "./types";
import { REGION_PRESETS, MONTH_NAMES } from "./constants";
import { FireHeader } from "./fire-header";
import { FireCalendar } from "./fire-calendar";
import { FireMap } from "./fire-map";
import { FireAnalytics } from "./fire-analytics";
import { FireExportDialog } from "./fire-export-dialog";
import { FireRemarkDialog } from "./fire-remark-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  IconFlame,
  IconCalendar,
  IconMapPin,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react";

export function FireApp() {
  // Navigation & View Layout
  const [activeTab, setActiveTab] = useState<"overview" | "calendar" | "map" | "analytics">("overview");

  // Region & Harmonization State
  const [selectedRegion, setSelectedRegion] = useState("Global");
  const [harmonizationMode, setHarmonizationMode] = useState<HarmonizationMode>("overlap_scaled");
  const [colorRamp, setColorRamp] = useState<ColorRampType>("flame");
  const [viewMetric, setViewMetric] = useState<ViewMetric>("harmonized_count");

  // Selected cell temporal drilldown
  const [selectedYear, setSelectedYear] = useState<number | null>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(10); // October

  // Filtering State
  const [sensorFilter, setSensorFilter] = useState<"all" | "MODIS" | "VIIRS">("all");
  const [minFrpFilter, setMinFrpFilter] = useState<number>(0);
  const [daynightFilter, setDaynightFilter] = useState<"all" | "D" | "N">("all");
  const [dateRange, setDateRange] = useState({ start: "2026-09-10", end: "2026-11-09" });

  // Map state
  const [activeMapLayerId, setActiveMapLayerId] = useState("carto-dark");
  const currentRegionPreset =
    REGION_PRESETS.find((r) => r.id === selectedRegion) || REGION_PRESETS[0];
  const [mapCenter, setMapCenter] = useState<[number, number]>(currentRegionPreset.center);
  const [mapZoom, setMapZoom] = useState<number>(currentRegionPreset.zoom);

  // Remark Area State
  const [remarkArea, setRemarkArea] = useState<RemarkArea>({ type: "none" });

  // Modal Dialogs
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);

  // API Data State
  const [calendarData, setCalendarData] = useState<RegionalCalendarData | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Calendar Data
  const fetchCalendar = useCallback(async (region: string, mode: string) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await fetch(`/api/calendar?region=${encodeURIComponent(region)}&mode=${mode}`);
      if (!res.ok) throw new Error(`Calendar data error: ${res.statusText}`);
      const data: RegionalCalendarData = await res.json();
      setCalendarData(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to load calendar data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Hotspots Data
  const fetchHotspots = useCallback(
    async (region: string, sensor: string, minFrp: number, daynight: string, remark: RemarkArea) => {
      try {
        const params = new URLSearchParams();
        params.set("region", region);
        params.set("sensor", sensor);
        if (minFrp > 0) params.set("minFrp", minFrp.toString());
        if (daynight !== "all") params.set("daynight", daynight);

        if (remark.type === "bbox" && remark.bbox) {
          params.set("bbox", remark.bbox.join(","));
        } else if (remark.type === "circle" && remark.circle) {
          params.set("remarkCenter", `${remark.circle.lat},${remark.circle.lon}`);
          params.set("radiusKm", remark.circle.radiusKm.toString());
        }

        const res = await fetch(`/api/hotspots?${params.toString()}`);
        if (!res.ok) throw new Error(`Hotspots error: ${res.statusText}`);
        const data = await res.json();
        setHotspots(data.hotspots || []);
      } catch (err: any) {
        console.error("Hotspots fetch error:", err);
      }
    },
    []
  );

  // Trigger data fetches on parameter change
  useEffect(() => {
    fetchCalendar(selectedRegion, harmonizationMode);
  }, [selectedRegion, harmonizationMode, fetchCalendar]);

  useEffect(() => {
    fetchHotspots(selectedRegion, sensorFilter, minFrpFilter, daynightFilter, remarkArea);
  }, [selectedRegion, sensorFilter, minFrpFilter, daynightFilter, remarkArea, fetchHotspots]);

  // Handle Region Change
  const handleSelectRegion = (regionId: string) => {
    setSelectedRegion(regionId);
    const preset = REGION_PRESETS.find((r) => r.id === regionId);
    if (preset) {
      setMapCenter(preset.center);
      setMapZoom(preset.zoom);
    }
    // Clear remark when changing regions
    setRemarkArea({ type: "none" });
  };

  // Quick Date Range Filter Handler
  const handleSelectQuickDateRange = (rangeKey: string) => {
    if (rangeKey === "7d") {
      setDateRange({ start: "2026-11-03", end: "2026-11-09" });
    } else if (rangeKey === "30d") {
      setDateRange({ start: "2026-10-10", end: "2026-11-09" });
    } else if (rangeKey === "all_2026") {
      setDateRange({ start: "2026-09-10", end: "2026-11-09" });
    } else if (rangeKey === "all_time") {
      setDateRange({ start: "2000-01-01", end: "2026-11-09" });
    }
  };

  // Cell Click: temporal drilldown
  const handleSelectCell = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const handleFlyTo = (lat: number, lon: number, zoomLevel = 9) => {
    setMapCenter([lat, lon]);
    setMapZoom(zoomLevel);
  };

  return (
    <TooltipProvider>
      <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
        {/* Top Header & NASA FIRMS Control Bar */}
        <FireHeader
          selectedRegion={selectedRegion}
          onSelectRegion={handleSelectRegion}
          harmonizationMode={harmonizationMode}
          onChangeHarmonizationMode={setHarmonizationMode}
          colorRamp={colorRamp}
          onChangeColorRamp={setColorRamp}
          viewMetric={viewMetric}
          onChangeViewMetric={setViewMetric}
          continuityFactor={calendarData?.overlap_continuity_factor || currentRegionPreset.continuityFactor}
          activeTab={activeTab}
          onChangeActiveTab={setActiveTab}
          onOpenExportDialog={() => setIsExportDialogOpen(true)}
          onOpenRemarkDialog={() => setIsRemarkDialogOpen(true)}
          dateRange={dateRange}
          onSelectQuickDateRange={handleSelectQuickDateRange}
          isLoading={isLoading}
          onRefresh={() => {
            fetchCalendar(selectedRegion, harmonizationMode);
            fetchHotspots(selectedRegion, sensorFilter, minFrpFilter, daynightFilter, remarkArea);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1920px] w-full mx-auto p-3 sm:p-4 flex flex-col gap-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
              <IconAlertCircle className="size-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* VIEW TAB 1: OVERVIEW (SPLIT VIEW) */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-4">
              {/* Split row: Calendar & Map */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                {/* Upper Left: 26-Year Calendar Matrix */}
                <div className="xl:col-span-7 w-full flex flex-col">
                  {calendarData && (
                    <FireCalendar
                      calendarData={calendarData.calendar}
                      selectedYear={selectedYear}
                      selectedMonth={selectedMonth}
                      onSelectCell={handleSelectCell}
                      colorRamp={colorRamp}
                      viewMetric={viewMetric}
                      harmonizationMode={harmonizationMode}
                      regionName={currentRegionPreset.name}
                    />
                  )}
                </div>

                {/* Upper Right: Interactive Leaflet Hotspot Map */}
                <div className="xl:col-span-5 w-full flex flex-col">
                  <FireMap
                    hotspots={hotspots}
                    center={mapCenter}
                    zoom={mapZoom}
                    activeLayerId={activeMapLayerId}
                    onChangeLayer={setActiveMapLayerId}
                    remarkArea={remarkArea}
                    onSetRemarkArea={setRemarkArea}
                    onClearRemarkArea={() => setRemarkArea({ type: "none" })}
                    onExportRemarkCsv={() => setIsExportDialogOpen(true)}
                    sensorFilter={sensorFilter}
                    onChangeSensorFilter={setSensorFilter}
                    minFrpFilter={minFrpFilter}
                    onChangeMinFrp={setMinFrpFilter}
                    daynightFilter={daynightFilter}
                    onChangeDaynight={setDaynightFilter}
                    selectedMonthName={selectedMonth ? MONTH_NAMES[selectedMonth - 1] : undefined}
                    selectedYear={selectedYear}
                    regionName={currentRegionPreset.name}
                  />
                </div>
              </div>

              {/* Lower Section: Multi-Year Trends & Seasonal Progression */}
              {calendarData && (
                <FireAnalytics
                  calendarData={calendarData.calendar}
                  dailySeries={calendarData.daily_series_2026 || []}
                  monthlyBaselines={calendarData.monthly_baselines}
                  regionName={currentRegionPreset.name}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                />
              )}
            </div>
          )}

          {/* VIEW TAB 2: FULL 26-YEAR CALENDAR MATRIX */}
          {activeTab === "calendar" && calendarData && (
            <div className="w-full flex flex-col gap-4">
              <FireCalendar
                calendarData={calendarData.calendar}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onSelectCell={handleSelectCell}
                colorRamp={colorRamp}
                viewMetric={viewMetric}
                harmonizationMode={harmonizationMode}
                regionName={currentRegionPreset.name}
              />
            </div>
          )}

          {/* VIEW TAB 3: FULL HOTSPOT MAP */}
          {activeTab === "map" && (
            <div className="w-full h-[calc(100vh-135px)] flex flex-col">
              <FireMap
                hotspots={hotspots}
                center={mapCenter}
                zoom={mapZoom}
                activeLayerId={activeMapLayerId}
                onChangeLayer={setActiveMapLayerId}
                remarkArea={remarkArea}
                onSetRemarkArea={setRemarkArea}
                onClearRemarkArea={() => setRemarkArea({ type: "none" })}
                onExportRemarkCsv={() => setIsExportDialogOpen(true)}
                sensorFilter={sensorFilter}
                onChangeSensorFilter={setSensorFilter}
                minFrpFilter={minFrpFilter}
                onChangeMinFrp={setMinFrpFilter}
                daynightFilter={daynightFilter}
                onChangeDaynight={setDaynightFilter}
                selectedMonthName={selectedMonth ? MONTH_NAMES[selectedMonth - 1] : undefined}
                selectedYear={selectedYear}
                regionName={currentRegionPreset.name}
              />
            </div>
          )}

          {/* VIEW TAB 4: TRENDS & ANOMALIES */}
          {activeTab === "analytics" && calendarData && (
            <div className="w-full flex flex-col gap-4">
              <FireAnalytics
                calendarData={calendarData.calendar}
                dailySeries={calendarData.daily_series_2026 || []}
                monthlyBaselines={calendarData.monthly_baselines}
                regionName={currentRegionPreset.name}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
              />
            </div>
          )}
        </main>

        {/* Modal Dialog: Export CSV */}
        <FireExportDialog
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          selectedRegion={selectedRegion}
          remarkArea={remarkArea}
          sensorFilter={sensorFilter}
          minFrpFilter={minFrpFilter}
          daynightFilter={daynightFilter}
          totalHotspotsCount={hotspots.length}
        />

        {/* Modal Dialog: Enter Lat / Lon & Remark Area */}
        <FireRemarkDialog
          isOpen={isRemarkDialogOpen}
          onClose={() => setIsRemarkDialogOpen(false)}
          onApplyRemark={(area) => setRemarkArea(area)}
          onFlyTo={handleFlyTo}
        />
      </div>
    </TooltipProvider>
  );
}
