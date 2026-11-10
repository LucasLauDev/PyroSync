"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Map as LeafletMap,
  TileLayer,
  CircleMarker,
  Circle,
  Rectangle,
  DivIcon,
  ScaleControl,
  LayerGroup,
  LatLng,
  type LeafletPointerEvent,
} from "leaflet";
import { Hotspot, RemarkArea } from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconFlame,
  IconMapPin,
  IconCircleDot,
  IconSquare,
  IconTrash,
  IconDownload,
  IconSatellite,
  IconLayersSubtract,
  IconZoomIn,
  IconZoomOut,
  IconFocusCentered,
  IconCrosshair,
  IconSearch,
} from "@tabler/icons-react";

interface FireMapCanvasProps {
  hotspots: Hotspot[];
  center: [number, number];
  zoom: number;
  activeLayerId: string;
  onChangeLayer: (layerId: string) => void;
  remarkArea: RemarkArea;
  onSetRemarkArea: (area: RemarkArea) => void;
  onClearRemarkArea: () => void;
  onExportRemarkCsv: () => void;
  sensorFilter: "all" | "MODIS" | "VIIRS";
  onChangeSensorFilter: (s: "all" | "MODIS" | "VIIRS") => void;
  minFrpFilter: number;
  onChangeMinFrp: (val: number) => void;
  daynightFilter: "all" | "D" | "N";
  onChangeDaynight: (dn: "all" | "D" | "N") => void;
  selectedMonthName?: string;
  selectedYear?: number | null;
  regionName: string;
}

export const MAP_LAYERS = [
  {
    id: "carto-dark",
    name: "Dark Matter (Recommended for Fires)",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap &copy; CARTO",
  },
  {
    id: "esri-satellite",
    name: "Esri World Imagery (Satellite)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri, Maxar, Earthstar Geographics",
  },
  {
    id: "osm-standard",
    name: "OpenStreetMap Standard",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
];

export function FireMapCanvas({
  hotspots,
  center,
  zoom,
  activeLayerId,
  onChangeLayer,
  remarkArea,
  onSetRemarkArea,
  onClearRemarkArea,
  onExportRemarkCsv,
  sensorFilter,
  onChangeSensorFilter,
  minFrpFilter,
  onChangeMinFrp,
  daynightFilter,
  onChangeDaynight,
  selectedMonthName,
  selectedYear,
  regionName,
}: FireMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileLayerRef = useRef<TileLayer | null>(null);
  const hotspotsLayerRef = useRef<LayerGroup | null>(null);
  const remarkLayerRef = useRef<LayerGroup | null>(null);

  // Drawing state
  const [drawingMode, setDrawingMode] = useState<"none" | "box" | "circle">("none");
  const [boxStartCoords, setBoxStartCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Manual Coordinate Input state
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [manualRadiusKm, setManualRadiusKm] = useState("50");
  const [showCoordinateBar, setShowCoordinateBar] = useState(false);

  // Mouse telemetry
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new LeafletMap(containerRef.current, {
      center: center,
      zoom: zoom,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
    });

    const scale = new ScaleControl({ imperial: true, metric: true, position: "bottomright" });
    scale.addTo(map);

    const layerCfg = MAP_LAYERS.find((l) => l.id === activeLayerId) || MAP_LAYERS[0];
    const tile = new TileLayer(layerCfg.url, {
      attribution: layerCfg.attribution,
      maxZoom: 19,
      subdomains: ["a", "b", "c", "d"],
    });
    tile.addTo(map);
    tileLayerRef.current = tile;

    const hotspotsGroup = new LayerGroup();
    hotspotsGroup.addTo(map);
    hotspotsLayerRef.current = hotspotsGroup;

    const remarkGroup = new LayerGroup();
    remarkGroup.addTo(map);
    remarkLayerRef.current = remarkGroup;

    map.on("pointermove" as any, (e: any) => {
      setMouseCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Center & Zoom when region changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom]);

  // Update Base Tile Layer
  useEffect(() => {
    if (!mapRef.current) return;
    const layerCfg = MAP_LAYERS.find((l) => l.id === activeLayerId) || MAP_LAYERS[0];
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }
    const newTile = new TileLayer(layerCfg.url, {
      attribution: layerCfg.attribution,
      maxZoom: 19,
      subdomains: ["a", "b", "c", "d"],
    });
    newTile.addTo(mapRef.current);
    tileLayerRef.current = newTile;
  }, [activeLayerId]);

  // Render Hotspots onto Leaflet
  useEffect(() => {
    if (!mapRef.current || !hotspotsLayerRef.current) return;
    const group = hotspotsLayerRef.current;
    group.clearLayers();

    // Render up to 2000 points cleanly
    const pointsToRender = hotspots.slice(0, 2000);

    pointsToRender.forEach((pt) => {
      const isViirs = pt.sensor === "VIIRS";
      const isHighFrp = (pt.harmonized_frp || pt.frp) >= 40;

      // Color coding:
      // High FRP: glowing magenta-red
      // MODIS: bright amber/orange
      // VIIRS: intense fire crimson
      const color = isHighFrp
        ? "#f43f5e"
        : isViirs
        ? "#e11d48"
        : "#f59e0b";

      const radius = isHighFrp ? 7 : isViirs ? 5 : 6;

      const circle = new CircleMarker([pt.lat, pt.lon], {
        radius,
        fillColor: color,
        color: isHighFrp ? "#ffffff" : "#000000",
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.75,
      });

      // Formatted Tooltip / Popup
      const popupHtml = `
        <div style="font-family: monospace; font-size: 11px; color: #f8fafc; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155; min-width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: ${color};">${pt.sensor} Hotspot</strong>
            <span style="background: #1e293b; color: #94a3b8; padding: 2px 5px; border-radius: 3px; font-size: 10px;">
              ${pt.satellite || "FIRMS"}
            </span>
          </div>
          <div><strong>Date:</strong> ${pt.date} ${pt.time} UTC</div>
          <div><strong>Coordinates:</strong> ${pt.lat.toFixed(4)}°, ${pt.lon.toFixed(4)}°</div>
          <div><strong>FRP Energy:</strong> <span style="color: #fbbf24; font-weight: bold;">${pt.frp} MW</span> (Harmonized: ${pt.harmonized_frp || pt.frp} MW)</div>
          <div><strong>Brightness Temp:</strong> ${pt.bright} K</div>
          <div><strong>Confidence:</strong> <span style="text-transform: capitalize; color: ${pt.confidence === "high" ? "#10b981" : "#38bdf8"};">${pt.confidence}</span></div>
          <div><strong>Observation:</strong> ${pt.daynight === "D" ? "Daytime Orbit" : "Nighttime Smoldering"}</div>
        </div>
      `;

      circle.bindPopup(popupHtml, { className: "custom-firms-popup" });
      group.addLayer(circle);
    });
  }, [hotspots]);

  // Render Remark Area (Bounding Box or Circle)
  useEffect(() => {
    if (!mapRef.current || !remarkLayerRef.current) return;
    const group = remarkLayerRef.current;
    group.clearLayers();

    if (remarkArea.type === "bbox" && remarkArea.bbox) {
      const [minLon, minLat, maxLon, maxLat] = remarkArea.bbox;
      const rect = new Rectangle(
        [
          [minLat, minLon],
          [maxLat, maxLon],
        ],
        {
          color: "#38bdf8",
          weight: 2,
          dashArray: "6 4",
          fillColor: "#0284c7",
          fillOpacity: 0.15,
        }
      );
      rect.bindTooltip(remarkArea.name || "Remarked Area (AOI)", { permanent: true, direction: "top" });
      group.addLayer(rect);
    } else if (remarkArea.type === "circle" && remarkArea.circle) {
      const lat = remarkArea.circle.lat;
      const lon = remarkArea.circle.lon ?? remarkArea.circle.lng ?? 0;
      const radiusKm = remarkArea.circle.radiusKm;
      const circle = new Circle([lat, lon], {
        radius: radiusKm * 1000,
        color: "#38bdf8",
        weight: 2,
        dashArray: "6 4",
        fillColor: "#0284c7",
        fillOpacity: 0.15,
      });
      circle.bindTooltip(
        `${remarkArea.name || "Remark Center"} (r = ${radiusKm} km)`,
        { permanent: true, direction: "top" }
      );
      group.addLayer(circle);
    }
  }, [remarkArea]);

  // Handle Map Clicks for Remark Drawing
  const handleMapClick = useCallback(
    (e: LeafletPointerEvent) => {
      const { lat, lng } = e.latlng;

      if (drawingMode === "circle") {
        const radius = parseFloat(manualRadiusKm) || 50;
        onSetRemarkArea({
          type: "circle",
          circle: { lat, lon: lng, radiusKm: radius },
          name: `Remark Circle (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
        });
        setDrawingMode("none");
      } else if (drawingMode === "box") {
        if (!boxStartCoords) {
          // First corner
          setBoxStartCoords({ lat, lng });
        } else {
          // Second corner -> finish box
          const minLat = Math.min(boxStartCoords.lat, lat);
          const maxLat = Math.max(boxStartCoords.lat, lat);
          const minLon = Math.min(boxStartCoords.lng, lng);
          const maxLon = Math.max(boxStartCoords.lng, lng);

          onSetRemarkArea({
            type: "bbox",
            bbox: [minLon, minLat, maxLon, maxLat],
            name: `Remark BBox [${minLat.toFixed(2)}° to ${maxLat.toFixed(2)}°]`,
          });
          setBoxStartCoords(null);
          setDrawingMode("none");
        }
      }
    },
    [drawingMode, boxStartCoords, manualRadiusKm, onSetRemarkArea]
  );

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [handleMapClick]);

  // Manual Coordinate Jump & Remark Handler
  const handleApplyManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    const radius = parseFloat(manualRadiusKm) || 50;

    if (isNaN(lat) || isNaN(lon)) {
      alert("Please enter valid decimal latitude and longitude (e.g. Lat: -3.46, Lon: -62.21)");
      return;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      alert("Coordinates out of range. Latitude: -90 to +90, Longitude: -180 to +180.");
      return;
    }

    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 9, { duration: 1.5 });
    }

    onSetRemarkArea({
      type: "circle",
      circle: { lat, lon, radiusKm: radius },
      name: `User Remark [${lat.toFixed(4)}°, ${lon.toFixed(4)}°]`,
    });
    setShowCoordinateBar(false);
  };

  // Count hotspots inside remark area
  const countInsideRemark = hotspots.length;

  return (
    <div className="relative w-full h-[540px] sm:h-[600px] lg:h-[680px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none">
      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left cluster: Remark drawing tools & Coordinate launcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 shadow-lg pointer-events-auto">
          <Badge variant="outline" className="text-[10px] font-mono text-cyan-400 border-cyan-500/30 mr-1">
            <IconMapPin className="size-3 mr-1" />
            Remark Tools
          </Badge>

          <Button
            size="sm"
            variant={drawingMode === "box" ? "default" : "ghost"}
            onClick={() => {
              setDrawingMode(drawingMode === "box" ? "none" : "box");
              setBoxStartCoords(null);
            }}
            className={`h-7 px-2.5 text-xs gap-1 ${
              drawingMode === "box" ? "bg-cyan-600 hover:bg-cyan-500 text-white" : "text-slate-300 hover:text-white"
            }`}
            title="Click two corners on map to draw a Remark Bounding Box"
          >
            <IconSquare className="size-3.5" />
            <span className="hidden sm:inline">Draw Box</span>
          </Button>

          <Button
            size="sm"
            variant={drawingMode === "circle" ? "default" : "ghost"}
            onClick={() => {
              setDrawingMode(drawingMode === "circle" ? "none" : "circle");
            }}
            className={`h-7 px-2.5 text-xs gap-1 ${
              drawingMode === "circle" ? "bg-cyan-600 hover:bg-cyan-500 text-white" : "text-slate-300 hover:text-white"
            }`}
            title="Click a point on map to place a Remark Circle Buffer"
          >
            <IconCircleDot className="size-3.5" />
            <span className="hidden sm:inline">Draw Circle</span>
          </Button>

          <Button
            size="sm"
            variant={showCoordinateBar ? "default" : "ghost"}
            onClick={() => setShowCoordinateBar(!showCoordinateBar)}
            className={`h-7 px-2.5 text-xs gap-1 ${
              showCoordinateBar ? "bg-amber-600 hover:bg-amber-500 text-white" : "text-slate-300 hover:text-white"
            }`}
            title="Enter Latitude and Longitude coordinates manually"
          >
            <IconCrosshair className="size-3.5" />
            <span>Enter Lat Lon</span>
          </Button>

          {remarkArea.type !== "none" && (
            <Button
              size="sm"
              variant="destructive"
              onClick={onClearRemarkArea}
              className="h-7 px-2 text-xs gap-1 bg-rose-600/80 hover:bg-rose-500 text-white"
              title="Clear active remark area"
            >
              <IconTrash className="size-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>

        {/* Right cluster: Basemap switcher & Quick filters */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 shadow-lg pointer-events-auto">
          {/* Basemap selector */}
          <select
            value={activeLayerId}
            onChange={(e) => onChangeLayer(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none"
          >
            {MAP_LAYERS.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </select>

          {/* Sensor Filter */}
          <select
            value={sensorFilter}
            onChange={(e) => onChangeSensorFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none hidden sm:block"
          >
            <option value="all">All Sensors (MODIS + VIIRS)</option>
            <option value="VIIRS">VIIRS Only (375m)</option>
            <option value="MODIS">MODIS Only (1km)</option>
          </select>
        </div>
      </div>

      {/* Drawing Mode Banner if active */}
      {drawingMode !== "none" && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-amber-500 text-slate-950 font-bold px-4 py-1.5 rounded-full text-xs shadow-xl animate-pulse flex items-center gap-2">
          <IconCrosshair className="size-4" />
          <span>
            {drawingMode === "box"
              ? boxStartCoords
                ? "Click second corner to complete Remark Bounding Box"
                : "Click map to set first corner of Remark Box"
              : "Click any location on map to place Remark Circle Buffer"}
          </span>
          <button
            type="button"
            onClick={() => {
              setDrawingMode("none");
              setBoxStartCoords(null);
            }}
            className="ml-2 text-slate-950 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Manual Latitude & Longitude Input Bar */}
      {showCoordinateBar && (
        <div className="absolute top-16 left-3 right-3 sm:left-auto sm:right-3 sm:w-96 z-[1000] bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-2xl space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <IconCrosshair className="size-4" /> Enter Coordinates & Remark Area
            </span>
            <button
              type="button"
              onClick={() => setShowCoordinateBar(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400">Latitude (-90 to 90):</label>
              <input
                type="number"
                step="0.0001"
                placeholder="e.g. -3.4659"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs focus:ring-1 focus:ring-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400">Longitude (-180 to 180):</label>
              <input
                type="number"
                step="0.0001"
                placeholder="e.g. -62.2159"
                value={manualLon}
                onChange={(e) => setManualLon(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs focus:ring-1 focus:ring-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400">Remark Radius (km):</label>
            <input
              type="number"
              min="1"
              max="1000"
              placeholder="50"
              value={manualRadiusKm}
              onChange={(e) => setManualRadiusKm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleApplyManualCoordinates}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs h-7"
            >
              Jump to Coordinates & Create Remark Zone
            </Button>
          </div>
        </div>
      )}

      {/* Remark Area Active Status Pill */}
      {remarkArea.type !== "none" && (
        <div className="absolute bottom-10 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-lg p-2.5 shadow-xl text-xs font-mono max-w-xs space-y-1">
          <div className="flex items-center justify-between text-cyan-400 font-bold">
            <span className="flex items-center gap-1">
              <IconFocusCentered className="size-3.5" />
              {remarkArea.name || "Active Remark Area"}
            </span>
          </div>
          <div className="text-[11px] text-slate-300">
            Fires in Remark AOI: <strong className="text-amber-400">{countInsideRemark.toLocaleString()}</strong>
          </div>
          <Button
            size="sm"
            onClick={onExportRemarkCsv}
            className="w-full h-6 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-medium mt-1 gap-1"
          >
            <IconDownload className="size-3" />
            Download Remark AOI CSV
          </Button>
        </div>
      )}

      {/* Leaflet Map Canvas Container */}
      <div ref={containerRef} className="w-full h-full z-0 cursor-crosshair" />

      {/* Bottom Telemetry HUD */}
      <div className="absolute bottom-2 right-2 z-[1000] bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-3">
        {mouseCoords && (
          <span>
            {mouseCoords.lat >= 0 ? `${mouseCoords.lat.toFixed(4)}°N` : `${Math.abs(mouseCoords.lat).toFixed(4)}°S`},{" "}
            {mouseCoords.lng >= 0 ? `${mouseCoords.lng.toFixed(4)}°E` : `${Math.abs(mouseCoords.lng).toFixed(4)}°W`}
          </span>
        )}
        <span className="text-slate-500">|</span>
        <span>
          Hotspots Rendered: <strong className="text-amber-400">{hotspots.length.toLocaleString()}</strong>
        </span>
      </div>
    </div>
  );
}
