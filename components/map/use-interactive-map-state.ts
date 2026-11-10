"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Map as LeafletMap } from "leaflet";
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

export function useInteractiveMapState() {
  const mapInstanceRef = useRef<LeafletMap | null>(null);

  // Core map states
  const [activeLayerId, setActiveLayerId] = useState("osm-standard");
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [activeTool, setActiveTool] = useState<MapToolMode>("pan");

  // Telemetry states
  const [cursorCoords, setCursorCoords] = useState<MapCoordinates | null>(null);
  const [centerCoords, setCenterCoords] = useState<MapCoordinates>({ lat: 4.2, lng: 108.0 });
  const [zoom, setZoom] = useState(6);

  // Measurement & Radius states
  const [measurePoints, setMeasurePoints] = useState<MeasurePoint[]>([]);
  const [radiusZone, setRadiusZone] = useState<RadiusZone>({
    center: null,
    radiusKm: 25,
  });

  // UI Drawer / Dialog states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [addMarkerCoords, setAddMarkerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isAddMarkerOpen, setIsAddMarkerOpen] = useState(false);

  // Layer toggles
  const [showPresets, setShowPresets] = useState(false);
  const [showCustomMarkers, setShowCustomMarkers] = useState(false);

  // NASA FIRMS Fire Harmonization State
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

  const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [calendarData, setCalendarData] = useState<RegionalCalendarData | null>(null);

  const handleMapReady = useCallback((map: LeafletMap) => {
    mapInstanceRef.current = map;
  }, []);

  const handleFlyTo = useCallback((lat: number, lng: number, zoomLevel = 13) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoomLevel, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, []);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([4.2, 108.0], 6, { duration: 1.2 });
    }
  };

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

  const handleSaveMarker = (newMarker: Omit<MapMarker, "id">) => {
    const markerWithId: MapMarker = {
      ...newMarker,
      id: `marker-${Date.now()}`,
    };
    setMarkers((prev) => [markerWithId, ...prev]);
    setIsAddMarkerOpen(false);
    setAddMarkerCoords(null);
  };

  const handleMapClickToAddMarker = useCallback((coords: { lat: number; lng: number }) => {
    setAddMarkerCoords(coords);
    setIsAddMarkerOpen(true);
  }, []);

  // Fetch NASA FIRMS Calendar Data
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
    fetchHotspots(
      selectedRegion,
      sensorFilter,
      minFrpFilter,
      daynightFilter,
      remarkArea,
      startDate,
      endDate
    );
  }, [
    selectedRegion,
    sensorFilter,
    minFrpFilter,
    daynightFilter,
    remarkArea,
    startDate,
    endDate,
    fetchHotspots,
  ]);

  const handleSelectRegion = (regionId: string) => {
    setSelectedRegion(regionId);
    const preset = REGION_PRESETS.find((r) => r.id === regionId);
    if (preset) {
      handleFlyTo(preset.center[0], preset.center[1], preset.zoom);
    }
    setRemarkArea({ type: "none" });
  };

  const handleSelectCalendarCell = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    const mStr = String(month).padStart(2, "0");
    const lastDay = new Date(year, month, 0).getDate();
    setStartDate(`${year}-${mStr}-01`);
    setEndDate(`${year}-${mStr}-${String(lastDay).padStart(2, "0")}`);
    const preset = REGION_PRESETS.find((r) => r.id === selectedRegion);
    if (preset) {
      handleFlyTo(preset.center[0], preset.center[1], preset.zoom);
    }
  };

  const totalFrp = Math.round(
    hotspots.reduce((sum, pt) => sum + (pt.harmonized_frp || pt.frp || 0), 0)
  );

  return {
    mapInstanceRef,
    activeLayerId,
    setActiveLayerId,
    markers,
    setMarkers,
    activeTool,
    setActiveTool,
    cursorCoords,
    setCursorCoords,
    centerCoords,
    setCenterCoords,
    zoom,
    setZoom,
    measurePoints,
    setMeasurePoints,
    radiusZone,
    setRadiusZone,
    isSidebarOpen,
    setIsSidebarOpen,
    isLocating,
    addMarkerCoords,
    setAddMarkerCoords,
    isAddMarkerOpen,
    setIsAddMarkerOpen,
    showPresets,
    setShowPresets,
    showCustomMarkers,
    setShowCustomMarkers,
    selectedRegion,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    hotspots,
    showHotspots,
    setShowHotspots,
    colorRamp,
    setColorRamp,
    harmonizationMode,
    setHarmonizationMode,
    viewMetric,
    setViewMetric,
    selectedYear,
    selectedMonth,
    sensorFilter,
    setSensorFilter,
    minFrpFilter,
    setMinFrpFilter,
    daynightFilter,
    setDaynightFilter,
    remarkArea,
    setRemarkArea,
    isRemarkDialogOpen,
    setIsRemarkDialogOpen,
    isExportDialogOpen,
    setIsExportDialogOpen,
    calendarData,
    totalFrp,
    handleMapReady,
    handleFlyTo,
    handleZoomIn,
    handleZoomOut,
    handleResetView,
    handleLocateMe,
    handleSaveMarker,
    handleMapClickToAddMarker,
    handleSelectRegion,
    handleSelectCalendarCell,
  };
}
