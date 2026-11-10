"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconMapPin,
  IconCircleDot,
  IconSquare,
  IconTrash,
  IconDownload,
  IconFocusCentered,
  IconCrosshair,
} from "@tabler/icons-react";
import { RemarkArea } from "../types";
import { MAP_LAYERS } from "./fire-map-layers";

interface FireMapToolbarProps {
  drawingMode: "none" | "box" | "circle";
  setDrawingMode: (mode: "none" | "box" | "circle") => void;
  boxStartCoords: { lat: number; lng: number } | null;
  setBoxStartCoords: (coords: { lat: number; lng: number } | null) => void;
  showCoordinateBar: boolean;
  setShowCoordinateBar: (show: boolean) => void;
  manualLat: string;
  setManualLat: (lat: string) => void;
  manualLon: string;
  setManualLon: (lon: string) => void;
  manualRadiusKm: string;
  setManualRadiusKm: (r: string) => void;
  handleApplyManualCoordinates: () => void;
  remarkArea: RemarkArea;
  onClearRemarkArea: () => void;
  onExportRemarkCsv: () => void;
  activeLayerId: string;
  onChangeLayer: (layerId: string) => void;
  sensorFilter: "all" | "MODIS" | "VIIRS";
  onChangeSensorFilter: (s: "all" | "MODIS" | "VIIRS") => void;
  hotspotsCount: number;
}

export function FireMapToolbar({
  drawingMode,
  setDrawingMode,
  boxStartCoords,
  setBoxStartCoords,
  showCoordinateBar,
  setShowCoordinateBar,
  manualLat,
  setManualLat,
  manualLon,
  setManualLon,
  manualRadiusKm,
  setManualRadiusKm,
  handleApplyManualCoordinates,
  remarkArea,
  onClearRemarkArea,
  onExportRemarkCsv,
  activeLayerId,
  onChangeLayer,
  sensorFilter,
  onChangeSensorFilter,
  hotspotsCount,
}: FireMapToolbarProps) {
  return (
    <>
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
            className={`h-7 px-2.5 text-xs gap-1 cursor-pointer ${
              drawingMode === "box"
                ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                : "text-slate-300 hover:text-white"
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
            className={`h-7 px-2.5 text-xs gap-1 cursor-pointer ${
              drawingMode === "circle"
                ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                : "text-slate-300 hover:text-white"
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
            className={`h-7 px-2.5 text-xs gap-1 cursor-pointer ${
              showCoordinateBar
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "text-slate-300 hover:text-white"
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
              className="h-7 px-2 text-xs gap-1 bg-rose-600/80 hover:bg-rose-500 text-white cursor-pointer"
              title="Clear active remark area"
            >
              <IconTrash className="size-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>

        {/* Right cluster: Basemap switcher & Quick filters */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 shadow-lg pointer-events-auto">
          <select
            value={activeLayerId}
            onChange={(e) => onChangeLayer(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none cursor-pointer"
          >
            {MAP_LAYERS.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </select>

          <select
            value={sensorFilter}
            onChange={(e) => onChangeSensorFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none hidden sm:block cursor-pointer"
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
            className="ml-2 text-slate-950 hover:text-white cursor-pointer"
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
              className="text-slate-400 hover:text-white cursor-pointer"
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
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs h-7 cursor-pointer"
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
            Fires in Remark AOI: <strong className="text-amber-400">{hotspotsCount.toLocaleString()}</strong>
          </div>
          <Button
            size="sm"
            onClick={onExportRemarkCsv}
            className="w-full h-6 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-medium mt-1 gap-1 cursor-pointer"
          >
            <IconDownload className="size-3" />
            Download Remark AOI CSV
          </Button>
        </div>
      )}
    </>
  );
}
