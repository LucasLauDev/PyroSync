"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Map as LeafletMap,
  TileLayer,
  ScaleControl,
  LayerGroup,
  type LeafletPointerEvent,
} from "leaflet";
import { Hotspot, RemarkArea } from "./types";
import { MAP_LAYERS, renderFireHotspots, renderFireRemarkArea } from "./map/fire-map-layers";
import { FireMapToolbar } from "./map/fire-map-toolbar";

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

export { MAP_LAYERS };

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

    const hotspotsGroup = new LayerGroup().addTo(map);
    hotspotsLayerRef.current = hotspotsGroup;

    const remarkGroup = new LayerGroup().addTo(map);
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

  // Update Center & Zoom
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
    if (hotspotsLayerRef.current) {
      renderFireHotspots(hotspotsLayerRef.current, hotspots);
    }
  }, [hotspots]);

  // Render Remark Area
  useEffect(() => {
    if (remarkLayerRef.current) {
      renderFireRemarkArea(remarkLayerRef.current, remarkArea);
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
          setBoxStartCoords({ lat, lng });
        } else {
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

  return (
    <div className="relative w-full h-[540px] sm:h-[600px] lg:h-[680px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none">
      <FireMapToolbar
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        boxStartCoords={boxStartCoords}
        setBoxStartCoords={setBoxStartCoords}
        showCoordinateBar={showCoordinateBar}
        setShowCoordinateBar={setShowCoordinateBar}
        manualLat={manualLat}
        setManualLat={setManualLat}
        manualLon={manualLon}
        setManualLon={setManualLon}
        manualRadiusKm={manualRadiusKm}
        setManualRadiusKm={setManualRadiusKm}
        handleApplyManualCoordinates={handleApplyManualCoordinates}
        remarkArea={remarkArea}
        onClearRemarkArea={onClearRemarkArea}
        onExportRemarkCsv={onExportRemarkCsv}
        activeLayerId={activeLayerId}
        onChangeLayer={onChangeLayer}
        sensorFilter={sensorFilter}
        onChangeSensorFilter={onChangeSensorFilter}
        hotspotsCount={hotspots.length}
      />

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
