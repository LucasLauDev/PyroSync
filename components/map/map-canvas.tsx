"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Map as LeafletMap,
  TileLayer,
  Marker,
  Circle,
  CircleMarker,
  Rectangle,
  Polyline,
  DivIcon,
  ScaleControl,
  LayerGroup,
  LatLng,
  type LeafletPointerEvent,
} from "leaflet";
import {
  MapMarker,
  MapToolMode,
  MeasurePoint,
  RadiusZone,
  MapCoordinates,
  HotspotPoint,
  RemarkArea,
  ColorRampType,
} from "./types";
import { AVAILABLE_LAYERS } from "./data/layers";
import { formatCoordinate, formatDistance } from "./utils";

interface MapCanvasProps {
  activeLayerId: string;
  markers: MapMarker[];
  activeTool: MapToolMode;
  onSetTool: (tool: MapToolMode) => void;
  measurePoints: MeasurePoint[];
  onAddMeasurePoint: (point: MeasurePoint) => void;
  radiusZone: RadiusZone;
  onSetRadiusCenter: (center: [number, number]) => void;
  onMapClickToAddMarker: (coords: { lat: number; lng: number }) => void;
  onCursorMove: (coords: MapCoordinates | null) => void;
  onCenterChange: (coords: MapCoordinates) => void;
  onZoomChange: (zoom: number) => void;
  showPresets: boolean;
  showCustomMarkers: boolean;
  onMapReady?: (map: LeafletMap) => void;
  // NASA Fire & Hotspots props
  hotspots?: HotspotPoint[];
  showHotspots?: boolean;
  remarkArea?: RemarkArea;
  onSetRemarkArea?: (area: RemarkArea) => void;
  colorRamp?: ColorRampType;
}

export function MapCanvas({
  activeLayerId,
  markers,
  activeTool,
  onSetTool,
  measurePoints,
  onAddMeasurePoint,
  radiusZone,
  onSetRadiusCenter,
  onMapClickToAddMarker,
  onCursorMove,
  onCenterChange,
  onZoomChange,
  showPresets,
  showCustomMarkers,
  onMapReady,
  hotspots = [],
  showHotspots = true,
  remarkArea = { type: "none" },
  onSetRemarkArea,
  colorRamp = "flame",
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileLayerRef = useRef<TileLayer | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const measureLayerRef = useRef<LayerGroup | null>(null);
  const radiusLayerRef = useRef<Circle | null>(null);
  const hotspotsLayerRef = useRef<LayerGroup | null>(null);
  const remarkLayerRef = useRef<LayerGroup | null>(null);

  // Drawing state for remark box
  const [boxStart, setBoxStart] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Create map instance centered on Southeast Asia / Malaysia region initially
    const map = new LeafletMap(containerRef.current, {
      center: [4.2, 108.0],
      zoom: 6,
      minZoom: 2,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: true,
    });

    // Add scale bar
    const scale = new ScaleControl({ imperial: true, metric: true, position: "bottomright" });
    scale.addTo(map);

    // Initial tile layer (OpenStreetMap Standard default)
    const initialConfig = AVAILABLE_LAYERS.find((l) => l.id === activeLayerId) || AVAILABLE_LAYERS[0];
    const tile = new TileLayer(initialConfig.url, {
      attribution: initialConfig.attribution,
      maxZoom: initialConfig.maxZoom,
      minZoom: initialConfig.minZoom ?? 1,
      subdomains: initialConfig.subdomains ?? ["a", "b", "c"],
    });
    tile.addTo(map);
    tileLayerRef.current = tile;

    // Layer groups
    const markersGroup = new LayerGroup();
    markersGroup.addTo(map);
    markersLayerRef.current = markersGroup;

    const measureGroup = new LayerGroup();
    measureGroup.addTo(map);
    measureLayerRef.current = measureGroup;

    const hotspotsGroup = new LayerGroup();
    hotspotsGroup.addTo(map);
    hotspotsLayerRef.current = hotspotsGroup;

    const remarkGroup = new LayerGroup();
    remarkGroup.addTo(map);
    remarkLayerRef.current = remarkGroup;

    // Event listeners
    map.on("move", () => {
      const c = map.getCenter();
      onCenterChange({ lat: c.lat, lng: c.lng });
    });

    map.on("zoomend", () => {
      onZoomChange(map.getZoom());
    });

    map.on("pointermove", (e: LeafletPointerEvent) => {
      onCursorMove({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    map.on("pointerout", () => {
      onCursorMove(null);
    });

    mapRef.current = map;
    if (onMapReady) {
      onMapReady(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update base tile layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const config = AVAILABLE_LAYERS.find((l) => l.id === activeLayerId) || AVAILABLE_LAYERS[0];

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTile = new TileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      minZoom: config.minZoom ?? 1,
      subdomains: config.subdomains ?? ["a", "b", "c"],
    });
    newTile.addTo(map);
    tileLayerRef.current = newTile;
  }, [activeLayerId]);

  // Update Markers (Landmarks & Custom Pins)
  useEffect(() => {
    const group = markersLayerRef.current;
    if (!group) return;

    group.clearLayers();

    const visibleMarkers = markers.filter((m) => {
      if (m.isPreset && !showPresets) return false;
      if (!m.isPreset && !showCustomMarkers) return false;
      return true;
    });

    visibleMarkers.forEach((m) => {
      let iconInnerSvg = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 18.5l7 2.5l-7 -18l-7 18z" />
        </svg>
      `;

      if (m.category === "space") {
        iconInnerSvg = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" />
            <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" />
            <circle cx="15" cy="9" r="1" />
          </svg>
        `;
      } else if (m.category === "observatory") {
        iconInnerSvg = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 21l6 -5l6 5" />
            <path d="M12 13v8" />
            <path d="M3.5 10l9 -6l4.5 3" />
            <path d="M19 12l2 -1.5" />
          </svg>
        `;
      }

      const customIcon = new DivIcon({
        className: "custom-map-icon",
        html: `
          <div class="custom-leaflet-marker" style="transform: translate(-50%, -100%);">
            <div class="relative flex items-center justify-center size-8 rounded-full shadow-lg border-2 border-white transition-all duration-200"
                 style="background-color: ${m.color}; color: #ffffff;">
              ${iconInnerSvg}
            </div>
            <div class="w-2.5 h-1 bg-black/35 rounded-full mx-auto blur-[1px] mt-0.5"></div>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -38],
      });

      const marker = new Marker([m.lat, m.lng], { icon: customIcon });

      const popupHtml = `
        <div class="p-3 min-w-[210px] max-w-[260px] font-sans">
          <div class="flex items-center justify-between gap-1 mb-1.5">
            <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style="background-color: ${m.color}25; color: ${m.color}">
              ${m.category}
            </span>
            ${m.elevation ? `<span class="text-[10px] text-gray-500 dark:text-gray-400 font-mono font-medium">Elev: ${m.elevation}</span>` : ""}
          </div>
          <h4 class="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1">
            ${m.title}
          </h4>
          ${
            m.description
              ? `<p class="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed mb-2">${m.description}</p>`
              : ""
          }
          <div class="pt-1.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] font-mono text-gray-500">
            <span>${formatCoordinate(m.lat, m.lng)}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        autoPan: true,
      });

      group.addLayer(marker);
    });
  }, [markers, showPresets, showCustomMarkers]);

  // Update NASA FIRMS Hotspots on Map
  useEffect(() => {
    const group = hotspotsLayerRef.current;
    if (!group) return;

    group.clearLayers();

    if (!showHotspots || hotspots.length === 0) return;

    // Render up to 2000 points cleanly on Leaflet
    const pointsToRender = hotspots.slice(0, 2000);

    pointsToRender.forEach((pt) => {
      const isViirs = pt.sensor === "VIIRS";
      const isHighFrp = (pt.harmonized_frp || pt.frp) >= 40;

      // Color coding based on FRP and sensor
      let color = isHighFrp ? "#f43f5e" : isViirs ? "#e11d48" : "#f59e0b";
      if (colorRamp === "viridis") {
        color = isHighFrp ? "#fde725" : isViirs ? "#35b779" : "#31688e";
      } else if (colorRamp === "inferno") {
        color = isHighFrp ? "#fcffa4" : isViirs ? "#f98e09" : "#bb3754";
      } else if (colorRamp === "diverging_anomaly") {
        color = isHighFrp ? "#ef4444" : isViirs ? "#f97316" : "#38bdf8";
      }

      const radius = isHighFrp ? 7 : isViirs ? 5 : 6;

      const circle = new CircleMarker([pt.lat, pt.lon], {
        radius,
        fillColor: color,
        color: isHighFrp ? "#ffffff" : "#000000",
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.8,
      });

      const popupHtml = `
        <div style="font-family: monospace; font-size: 11px; color: #f8fafc; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155; min-width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: ${color};">${pt.sensor} Active Hotspot</strong>
            <span style="background: #1e293b; color: #94a3b8; padding: 2px 5px; border-radius: 3px; font-size: 10px;">
              ${pt.satellite || "FIRMS"}
            </span>
          </div>
          <div><strong>Date:</strong> ${pt.date} ${pt.time} UTC</div>
          <div><strong>Coordinates:</strong> ${pt.lat.toFixed(4)}°, ${pt.lon.toFixed(4)}°</div>
          <div><strong>FRP Energy:</strong> <span style="color: #fbbf24; font-weight: bold;">${pt.frp} MW</span> (Harmonized: ${pt.harmonized_frp || pt.frp} MW)</div>
          <div><strong>Brightness Temp:</strong> ${pt.bright} K</div>
          <div><strong>Confidence:</strong> <span style="text-transform: capitalize; color: ${pt.confidence === "high" ? "#10b981" : "#38bdf8"};">${pt.confidence}</span></div>
          <div><strong>Orbit:</strong> ${pt.daynight === "D" ? "Daytime Detection" : "Nighttime Smoldering"}</div>
        </div>
      `;

      circle.bindPopup(popupHtml, { autoPan: true });
      group.addLayer(circle);
    });
  }, [hotspots, showHotspots, colorRamp]);

  // Update Remark Area (Bounding Box or Circle)
  useEffect(() => {
    const group = remarkLayerRef.current;
    if (!group) return;

    group.clearLayers();

    if (remarkArea.type === "bbox" && remarkArea.bbox) {
      const [minLon, minLat, maxLon, maxLat] = remarkArea.bbox;
      const rect = new Rectangle(
        [
          [minLat, minLon],
          [maxLat, maxLon],
        ],
        {
          color: "#06b6d4",
          weight: 2.5,
          dashArray: "6 4",
          fillColor: "#0284c7",
          fillOpacity: 0.18,
        }
      );
      rect.bindTooltip(remarkArea.name || "Remark Area AOI", { permanent: true, direction: "top" });
      group.addLayer(rect);
    } else if (remarkArea.type === "circle" && remarkArea.circle) {
      const lat = remarkArea.circle.lat;
      const lng = remarkArea.circle.lng ?? remarkArea.circle.lon ?? 0;
      const radiusKm = remarkArea.circle.radiusKm;
      const circle = new Circle([lat, lng], {
        radius: radiusKm * 1000,
        color: "#06b6d4",
        weight: 2.5,
        dashArray: "6 4",
        fillColor: "#0284c7",
        fillOpacity: 0.18,
      });
      circle.bindTooltip(`${remarkArea.name || "Remark Area"} (r = ${radiusKm} km)`, {
        permanent: true,
        direction: "top",
      });
      group.addLayer(circle);
    }
  }, [remarkArea]);

  // Update Measurement Path
  useEffect(() => {
    const group = measureLayerRef.current;
    if (!group) return;

    group.clearLayers();

    if (measurePoints.length === 0) return;

    measurePoints.forEach((pt, index) => {
      const isStart = index === 0;
      const isEnd = index === measurePoints.length - 1 && measurePoints.length > 1;

      const markerIcon = new DivIcon({
        className: "custom-map-icon",
        html: `
          <div style="transform: translate(-50%, -50%);">
            <div class="size-4 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[9px] font-bold text-white ${
              isStart ? "bg-emerald-500" : isEnd ? "bg-blue-600" : "bg-sky-500"
            }">
              ${index + 1}
            </div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = new Marker([pt.lat, pt.lng], { icon: markerIcon });
      group.addLayer(marker);
    });

    if (measurePoints.length >= 2) {
      const latlngs = measurePoints.map((p) => [p.lat, p.lng] as [number, number]);
      const polyline = new Polyline(latlngs, {
        color: "#3b82f6",
        weight: 3.5,
        opacity: 0.85,
        dashArray: "6, 8",
      });
      group.addLayer(polyline);
    }
  }, [measurePoints]);

  // Update Radius Circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (radiusLayerRef.current) {
      map.removeLayer(radiusLayerRef.current);
      radiusLayerRef.current = null;
    }

    if (radiusZone.center) {
      const radiusMeters = radiusZone.radiusKm * 1000;
      const circle = new Circle(radiusZone.center, {
        radius: radiusMeters,
        color: "#6366f1",
        weight: 2,
        dashArray: "5, 5",
        fillColor: "#818cf8",
        fillOpacity: 0.22,
      });

      circle.addTo(map);
      radiusLayerRef.current = circle;
    }
  }, [radiusZone]);

  // Handle Map Clicks based on activeTool
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: LeafletPointerEvent) => {
      const { lat, lng } = e.latlng;

      if (activeTool === "add-marker") {
        onMapClickToAddMarker({ lat, lng });
        onSetTool("pan");
      } else if (activeTool === "measure") {
        let prevPoint: MeasurePoint | undefined = measurePoints[measurePoints.length - 1];
        let dist = 0;
        let total = 0;

        if (prevPoint) {
          const p1 = new LatLng(prevPoint.lat, prevPoint.lng);
          const p2 = new LatLng(lat, lng);
          dist = p1.distanceTo(p2);
          total = prevPoint.totalDistance + dist;
        }

        onAddMeasurePoint({
          lat,
          lng,
          distanceFromPrev: dist,
          totalDistance: total,
        });
      } else if (activeTool === "radius") {
        onSetRadiusCenter([lat, lng]);
      } else if (activeTool === "remark-circle" && onSetRemarkArea) {
        onSetRemarkArea({
          type: "circle",
          circle: { lat, lng, radiusKm: 50 },
          name: `Remark Circle (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
        });
        onSetTool("pan");
      } else if (activeTool === "remark-box" && onSetRemarkArea) {
        if (!boxStart) {
          setBoxStart({ lat, lng });
        } else {
          const minLat = Math.min(boxStart.lat, lat);
          const maxLat = Math.max(boxStart.lat, lat);
          const minLon = Math.min(boxStart.lng, lng);
          const maxLon = Math.max(boxStart.lng, lng);

          onSetRemarkArea({
            type: "bbox",
            bbox: [minLon, minLat, maxLon, maxLat],
            name: `Remark BBox [${minLat.toFixed(2)}° to ${maxLat.toFixed(2)}°]`,
          });
          setBoxStart(null);
          onSetTool("pan");
        }
      }
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [
    activeTool,
    measurePoints,
    boxStart,
    onAddMeasurePoint,
    onMapClickToAddMarker,
    onSetRadiusCenter,
    onSetTool,
    onSetRemarkArea,
  ]);

  const getCursorClass = () => {
    if (activeTool === "measure" || activeTool === "radius" || activeTool === "remark-box" || activeTool === "remark-circle")
      return "cursor-crosshair";
    if (activeTool === "add-marker") return "cursor-copy";
    return "";
  };

  return (
    <div className={`w-full h-full relative ${getCursorClass()}`}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
