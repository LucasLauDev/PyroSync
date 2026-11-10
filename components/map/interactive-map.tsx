"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  MapMarker,
  MapToolMode,
  MeasurePoint,
  RadiusZone,
  MapCoordinates,
  HotspotPoint,
  RemarkArea,
  ColorRampType,
  ViewMetric,
  HarmonizationMode,
} from "./types";
import { REGION_PRESETS } from "@/components/fire/constants";
import { RegionalCalendarData } from "@/components/fire/types";
import { MapControls } from "./map-controls";
import { MapSidebar } from "./map-sidebar";
import { TelemetryHUD } from "./telemetry-hud";
import { AddMarkerDialog } from "./add-marker-dialog";
import { FireRemarkDialog } from "@/components/fire/fire-remark-dialog";
import { FireExportDialog } from "@/components/fire/fire-export-dialog";
import { FireAnalysisPage } from "@/components/fire/fire-analysis-page";
import { TooltipProvider } from "@/components/ui/tooltip";
import { IconMap, IconChartBar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { Map as LeafletMap } from "leaflet";

// Dynamically import the Leaflet canvas with SSR disabled
const DynamicMapCanvas = dynamic(
  () => import("./map-canvas").then((mod) => mod.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs font-mono tracking-wider uppercase">Loading OpenStreetMap + Leaflet...</span>
      </div>
    ),
  }
);

export function InteractiveMap() {
  // Map instance reference
  const mapInstanceRef = useRef<LeafletMap | null>(null);

  // Core map states (OpenStreetMap default)
  const [activeLayerId, setActiveLayerId] = useState("osm-standard");
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [activeTool, setActiveTool] = useState<MapToolMode>("pan");

  // Telemetry states
  const [cursorCoords, setCursorCoords] = useState<MapCoordinates | null>(null);
  const [centerCoords, setCenterCoords] = useState<MapCoordinates>({ lat: 4.2, lng: 108.0 });
  const [zoom, setZoom] = useState(6);

  // Measurement tool states
  const [measurePoints, setMeasurePoints] = useState<MeasurePoint[]>([]);

  // Radius buffer tool states
  const [radiusZone, setRadiusZone] = useState<RadiusZone>({
    center: null,
    radiusKm: 25,
  });

  // UI Drawer / Dialog states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [addMarkerCoords, setAddMarkerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isAddMarkerOpen, setIsAddMarkerOpen] = useState(false);

  // Layer visibility toggles
  const [showPresets, setShowPresets] = useState(false);
  const [showCustomMarkers, setShowCustomMarkers] = useState(false);

  // ==========================================
  // NASA FIRMS Fire Harmonization State
  // ==========================================
  const [selectedRegion, setSelectedRegion] = useState("Global");
  const [startDate, setStartDate] = useState<string>("2026-09-10");
  const [endDate, setEndDate] = useState<string>("2026-11-09");
  const [hotspots, setHotspots] = useState<HotspotPoint[]>([]);
  const [showHotspots, setShowHotspots] = useState(true);
  const [colorRamp, setColorRamp] = useState<ColorRampType>("flame");
  const [harmonizationMode, setHarmonizationMode] = useState<HarmonizationMode>("overlap_scaled");
  const [viewMetric, setViewMetric] = useState<ViewMetric>("harmonized_count");
  const [selectedYear, setSelectedYear] = useState<number | null>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(10);
  const [sensorFilter, setSensorFilter] = useState<"all" | "MODIS" | "VIIRS">("all");
  const [minFrpFilter, setMinFrpFilter] = useState<number>(0);
  const [daynightFilter, setDaynightFilter] = useState<"all" | "D" | "N">("all");
  const [remarkArea, setRemarkArea] = useState<RemarkArea>({ type: "none" });

  // Dialog & Modal states for Fire Analytics
  const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [calendarData, setCalendarData] = useState<RegionalCalendarData | null>(null);

  // Top-level View Mode: "map" vs "analysis"
  const [activeMainTab, setActiveMainTab] = useState<"map" | "analysis">("map");

  const handleSwitchMainTab = useCallback((tab: "map" | "analysis") => {
    setActiveMainTab(tab);
    if (tab === "map") {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 50);
    }
  }, []);

  // Handler when map instance is ready
  const handleMapReady = useCallback((map: LeafletMap) => {
    mapInstanceRef.current = map;
  }, []);

  // Smooth camera navigation
  const handleFlyTo = useCallback((lat: number, lng: number, zoomLevel = 13) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoomLevel, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, []);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([4.2, 108.0], 6, { duration: 1.2 });
    }
  };

  // Browser Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setIsLocating(false);
        handleFlyTo(latitude, longitude, 14);

        const userMarker: MapMarker = {
          id: `loc-user-${Date.now()}`,
          title: "My Current Location",
          description: `Detected GPS coordinates (accuracy: ±${Math.round(pos.coords.accuracy)}m)`,
          lat: latitude,
          lng: longitude,
          category: "custom",
          color: "#06b6d4",
          isPreset: false,
          createdAt: new Date().toLocaleTimeString(),
        };

        setMarkers((prev) => [userMarker, ...prev]);
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation warning:", err.message);
        alert(`Could not retrieve location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Marker CRUD
  const handleSaveMarker = (newMarker: Omit<MapMarker, "id">) => {
    const markerWithId: MapMarker = {
      ...newMarker,
      id: `marker-${Date.now()}`,
    };
    setMarkers((prev) => [markerWithId, ...prev]);
    setIsAddMarkerOpen(false);
    setAddMarkerCoords(null);
  };

  const handleDeleteMarker = (id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMapClickToAddMarker = useCallback((coords: { lat: number; lng: number }) => {
    setAddMarkerCoords(coords);
    setIsAddMarkerOpen(true);
  }, []);

  const handleOpenAddMarkerFromSidebar = () => {
    setAddMarkerCoords({ lat: centerCoords.lat, lng: centerCoords.lng });
    setIsAddMarkerOpen(true);
  };

  // ==========================================
  // Fetch NASA FIRMS Calendar Data
  // ==========================================
  const fetchCalendar = useCallback(async (region: string, mode: string) => {
    try {
      const res = await fetch(`/api/calendar?region=${encodeURIComponent(region)}&mode=${mode}`);
      if (!res.ok) return;
      const data: RegionalCalendarData = await res.json();
      setCalendarData(data);
    } catch (err) {
      console.error("Failed to load calendar data:", err);
    }
  }, []);

  // Fetch NASA FIRMS Hotspots Data
  const fetchHotspots = useCallback(
    async (
      region: string,
      sensor: string,
      minFrp: number,
      daynight: string,
      remark: RemarkArea,
      start: string,
      end: string
    ) => {
      try {
        const params = new URLSearchParams();
        params.set("region", region);
        params.set("sensor", sensor);
        if (minFrp > 0) params.set("minFrp", minFrp.toString());
        if (daynight !== "all") params.set("daynight", daynight);
        if (start) params.set("startDate", start);
        if (end) params.set("endDate", end);

        if (remark.type === "bbox" && remark.bbox) {
          params.set("bbox", remark.bbox.join(","));
        } else if (remark.type === "circle" && remark.circle) {
          params.set("remarkCenter", `${remark.circle.lat},${remark.circle.lng}`);
          params.set("radiusKm", remark.circle.radiusKm.toString());
        }

        const res = await fetch(`/api/hotspots?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        setHotspots(data.hotspots || []);
      } catch (err) {
        console.error("Hotspots fetch error:", err);
      }
    },
    []
  );

  useEffect(() => {
    fetchCalendar(selectedRegion, harmonizationMode);
  }, [selectedRegion, harmonizationMode, fetchCalendar]);

  useEffect(() => {
    fetchHotspots(selectedRegion, sensorFilter, minFrpFilter, daynightFilter, remarkArea, startDate, endDate);
  }, [selectedRegion, sensorFilter, minFrpFilter, daynightFilter, remarkArea, startDate, endDate, fetchHotspots]);

  // Handle Region Selection & Map Flight
  const handleSelectRegion = (regionId: string) => {
    setSelectedRegion(regionId);
    const preset = REGION_PRESETS.find((r) => r.id === regionId);
    if (preset) {
      handleFlyTo(preset.center[0], preset.center[1], preset.zoom);
    }
    setRemarkArea({ type: "none" });
  };

  // Cell Click: select specific month and fly
  const handleSelectCalendarCell = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    // If year 2026, keep region focused
    const preset = REGION_PRESETS.find((r) => r.id === selectedRegion);
    if (preset) {
      handleFlyTo(preset.center[0], preset.center[1], preset.zoom);
    }
  };

  // Total FRP from current hotspots
  const totalFrp = Math.round(
    hotspots.reduce((sum, pt) => sum + (pt.harmonized_frp || pt.frp || 0), 0)
  );

  return (
    <TooltipProvider>
      <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
        {/* ========================================================= */}
        {/* MIDDLE TOP GROUP TAB SELECTION (MAP VIEW vs ANALYSIS)     */}
        {/* ========================================================= */}
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center">
          <div className="bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-full p-1 flex items-center gap-1">
            <button
              onClick={() => handleSwitchMainTab("map")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer",
                activeMainTab === "map"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <IconMap className="size-3.5" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => handleSwitchMainTab("analysis")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer",
                activeMainTab === "analysis"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <IconChartBar className="size-3.5" />
              <span>Fire Analysis</span>
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 1. MAP VIEW CONTAINER (OpenStreetMap + Leaflet 2.0 Canvas) */}
        {/* ========================================================= */}
        <div
          className={cn(
            "w-full h-full relative transition-opacity duration-200",
            activeMainTab === "map" ? "opacity-100 z-10" : "opacity-0 pointer-events-none absolute inset-0 z-0"
          )}
        >
          {/* Dynamic Leaflet 2.0 Map Canvas with OpenStreetMap Standard & Hotspots */}
          <DynamicMapCanvas
            activeLayerId={activeLayerId}
            markers={markers}
            activeTool={activeTool}
            onSetTool={setActiveTool}
            measurePoints={measurePoints}
            onAddMeasurePoint={(pt) => setMeasurePoints((prev) => [...prev, pt])}
            radiusZone={radiusZone}
            onSetRadiusCenter={(center) => setRadiusZone((prev) => ({ ...prev, center }))}
            onMapClickToAddMarker={handleMapClickToAddMarker}
            onCursorMove={setCursorCoords}
            onCenterChange={setCenterCoords}
            onZoomChange={setZoom}
            showPresets={showPresets}
            showCustomMarkers={showCustomMarkers}
            onMapReady={handleMapReady}
            // NASA FIRMS Hotspots & Remark Area
            hotspots={hotspots}
            showHotspots={showHotspots}
            remarkArea={remarkArea}
            onSetRemarkArea={setRemarkArea}
            colorRamp={colorRamp}
          />

          {/* Floating Side Drawer (NASA FIRMS Fire Filters, Date Range Calendar, Layers) */}
          <MapSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            startDate={startDate}
            endDate={endDate}
            onChangeDateRange={(s, e) => {
              setStartDate(s);
              setEndDate(e);
            }}
            selectedRegion={selectedRegion}
            onSelectRegion={handleSelectRegion}
            showHotspots={showHotspots}
            onToggleHotspots={setShowHotspots}
            sensorFilter={sensorFilter}
            onChangeSensorFilter={setSensorFilter}
            minFrpFilter={minFrpFilter}
            onChangeMinFrpFilter={setMinFrpFilter}
            daynightFilter={daynightFilter}
            onChangeDaynightFilter={setDaynightFilter}
            colorRamp={colorRamp}
            onChangeColorRamp={setColorRamp}
            harmonizationMode={harmonizationMode}
            onChangeHarmonizationMode={setHarmonizationMode}
            remarkArea={remarkArea}
            onClearRemarkArea={() => setRemarkArea({ type: "none" })}
            onOpenRemarkDialog={() => setIsRemarkDialogOpen(true)}
            onOpenExportDialog={() => setIsExportDialogOpen(true)}
            hotspotsCount={hotspots.length}
            totalFrp={totalFrp}
            activeLayerId={activeLayerId}
            onSelectLayer={setActiveLayerId}
          />

          {/* Floating Action Buttons / Navigation Cluster */}
          <MapControls
            activeTool={activeTool}
            onSetTool={setActiveTool}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetView={handleResetView}
            onLocateMe={handleLocateMe}
            isLocating={isLocating}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            // NASA Fire Controls
            showHotspots={showHotspots}
            onToggleHotspots={() => setShowHotspots(!showHotspots)}
            onOpenRemarkDialog={() => setIsRemarkDialogOpen(true)}
            onOpenExportDialog={() => setIsExportDialogOpen(true)}
          />

          {/* Telemetry HUD & Status Bar */}
          <TelemetryHUD
            cursorCoords={cursorCoords}
            centerCoords={centerCoords}
            zoom={zoom}
            activeTool={activeTool}
            measurePoints={measurePoints}
            radiusZone={radiusZone}
            onResetTool={() => setActiveTool("pan")}
            onClearMeasure={() => setMeasurePoints([])}
            onClearRadius={() => setRadiusZone((prev) => ({ ...prev, center: null }))}
            // NASA Fire telemetry
            remarkArea={remarkArea}
            onClearRemarkArea={() => setRemarkArea({ type: "none" })}
            hotspotsCount={hotspots.length}
          />
        </div>

        {/* ========================================================= */}
        {/* 2. ANALYSIS PAGE VIEW CONTAINER                          */}
        {/* ========================================================= */}
        <div
          className={cn(
            "w-full h-full relative transition-opacity duration-200",
            activeMainTab === "analysis" ? "opacity-100 z-20" : "opacity-0 pointer-events-none absolute inset-0 z-0"
          )}
        >
          <FireAnalysisPage
            calendarData={calendarData}
            selectedRegion={selectedRegion}
            onSelectRegion={handleSelectRegion}
            colorRamp={colorRamp}
            onChangeColorRamp={setColorRamp}
            viewMetric={viewMetric}
            onChangeViewMetric={setViewMetric}
            harmonizationMode={harmonizationMode}
            onChangeHarmonizationMode={setHarmonizationMode}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onSelectCell={handleSelectCalendarCell}
            onOpenExportDialog={() => setIsExportDialogOpen(true)}
            onSwitchToMap={() => handleSwitchMainTab("map")}
          />
        </div>

        {/* Dialog to Name & Style Dropped Marker */}
        <AddMarkerDialog
          isOpen={isAddMarkerOpen}
          coords={addMarkerCoords}
          onClose={() => {
            setIsAddMarkerOpen(false);
            setAddMarkerCoords(null);
          }}
          onSave={handleSaveMarker}
        />

        {/* Modal: Enter Latitude, Longitude & Remark Area */}
        <FireRemarkDialog
          isOpen={isRemarkDialogOpen}
          onClose={() => setIsRemarkDialogOpen(false)}
          onApplyRemark={(area) => {
            setRemarkArea({
              type: area.type,
              bbox: area.bbox,
              circle: area.circle ? { lat: area.circle.lat, lng: area.circle.lon, radiusKm: area.circle.radiusKm } : undefined,
              name: area.name,
            });
          }}
          onFlyTo={handleFlyTo}
        />

        {/* Modal: Export CSV */}
        <FireExportDialog
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          selectedRegion={selectedRegion}
          remarkArea={remarkArea}
          sensorFilter={sensorFilter}
          minFrpFilter={minFrpFilter}
          daynightFilter={daynightFilter}
          totalHotspotsCount={hotspots.length}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </TooltipProvider>
  );
}
