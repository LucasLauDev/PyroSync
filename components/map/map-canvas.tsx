"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Map as LeafletMap,
  TileLayer,
  Circle,
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
import {
  renderCustomMarkers,
  renderHotspotMarkers,
  renderRemarkArea,
  renderMeasurePoints,
} from "./canvas/map-canvas-layers";

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

  const [boxStart, setBoxStart] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new LeafletMap(containerRef.current, {
      center: [4.2, 108.0],
      zoom: 6,
      minZoom: 2,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: true,
    });

    const scale = new ScaleControl({ imperial: true, metric: true, position: "bottomright" });
    scale.addTo(map);

    const initialConfig = AVAILABLE_LAYERS.find((l) => l.id === activeLayerId) || AVAILABLE_LAYERS[0];
    const tile = new TileLayer(initialConfig.url, {
      attribution: initialConfig.attribution,
      maxZoom: initialConfig.maxZoom,
      minZoom: initialConfig.minZoom ?? 1,
      subdomains: initialConfig.subdomains ?? ["a", "b", "c"],
    });
    tile.addTo(map);
    tileLayerRef.current = tile;

    const markersGroup = new LayerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    const measureGroup = new LayerGroup().addTo(map);
    measureLayerRef.current = measureGroup;

    const hotspotsGroup = new LayerGroup().addTo(map);
    hotspotsLayerRef.current = hotspotsGroup;

    const remarkGroup = new LayerGroup().addTo(map);
    remarkLayerRef.current = remarkGroup;

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
    if (onMapReady) onMapReady(map);

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
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);

    const newTile = new TileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      minZoom: config.minZoom ?? 1,
      subdomains: config.subdomains ?? ["a", "b", "c"],
    });
    newTile.addTo(map);
    tileLayerRef.current = newTile;
  }, [activeLayerId]);

  // Update Markers
  useEffect(() => {
    if (markersLayerRef.current) {
      renderCustomMarkers(markersLayerRef.current, markers, showPresets, showCustomMarkers);
    }
  }, [markers, showPresets, showCustomMarkers]);

  // Update Hotspots
  useEffect(() => {
    if (hotspotsLayerRef.current) {
      renderHotspotMarkers(hotspotsLayerRef.current, hotspots, showHotspots, colorRamp);
    }
  }, [hotspots, showHotspots, colorRamp]);

  // Update Remark Area
  useEffect(() => {
    if (remarkLayerRef.current) {
      renderRemarkArea(remarkLayerRef.current, remarkArea);
    }
  }, [remarkArea]);

  // Update Measurement Path
  useEffect(() => {
    if (measureLayerRef.current) {
      renderMeasurePoints(measureLayerRef.current, measurePoints);
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
        const prevPoint = measurePoints[measurePoints.length - 1];
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
    if (
      activeTool === "measure" ||
      activeTool === "radius" ||
      activeTool === "remark-box" ||
      activeTool === "remark-circle"
    )
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
