"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapCoordinates,
  MapToolMode,
  MeasurePoint,
  RadiusZone,
  RemarkArea,
} from "./types";
import { formatCoordinate, formatDistance, formatArea } from "./utils";
import {
  IconCrosshair,
  IconRuler,
  IconCircleDot,
  IconMapPin,
  IconX,
  IconCompass,
  IconFlame,
  IconCalendar,
  IconSquare,
} from "@tabler/icons-react";

interface TelemetryHUDProps {
  cursorCoords: MapCoordinates | null;
  centerCoords: MapCoordinates | null;
  zoom: number;
  activeTool: MapToolMode;
  measurePoints: MeasurePoint[];
  radiusZone: RadiusZone;
  onResetTool: () => void;
  onClearMeasure: () => void;
  onClearRadius: () => void;
  // NASA Fire telemetry
  remarkArea?: RemarkArea;
  onClearRemarkArea?: () => void;
  onOpenFireCalendar?: () => void;
  hotspotsCount?: number;
}

export function TelemetryHUD({
  cursorCoords,
  centerCoords,
  zoom,
  activeTool,
  measurePoints,
  radiusZone,
  onResetTool,
  onClearMeasure,
  onClearRadius,
  remarkArea = { type: "none" },
  onClearRemarkArea,
  onOpenFireCalendar,
  hotspotsCount = 0,
}: TelemetryHUDProps) {
  const totalMeasureDistance =
    measurePoints.length > 0 ? measurePoints[measurePoints.length - 1].totalDistance : 0;
  const distanceFormatted = formatDistance(totalMeasureDistance);
  const areaFormatted = formatArea(radiusZone.radiusKm);

  return (
    <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-none select-none max-w-[calc(100vw-2rem)]">
      {/* Tool Status Badge: Measure */}
      {activeTool === "measure" && (
        <div className="pointer-events-auto flex items-center gap-2 bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-border shadow-lg text-xs animate-in fade-in slide-in-from-bottom-2">
          <IconRuler className="size-4 text-blue-500 animate-pulse" />
          <span className="font-medium text-foreground">
            Measuring:{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {distanceFormatted.metric}
            </span>{" "}
            <span className="text-muted-foreground text-[11px]">({distanceFormatted.imperial})</span>
          </span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
            {measurePoints.length} pt{measurePoints.length !== 1 ? "s" : ""}
          </Badge>
          {measurePoints.length > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onClearMeasure}
              className="h-5 px-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onResetTool}
            className="rounded-full size-5 text-muted-foreground hover:text-destructive"
          >
            <IconX className="size-3" />
          </Button>
        </div>
      )}

      {/* Tool Status Badge: Radius */}
      {activeTool === "radius" && (
        <div className="pointer-events-auto flex items-center gap-2 bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-border shadow-lg text-xs animate-in fade-in slide-in-from-bottom-2">
          <IconCircleDot className="size-4 text-indigo-500 animate-pulse" />
          <span className="font-medium text-foreground">
            Radius:{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {radiusZone.radiusKm} km
            </span>{" "}
            <span className="text-muted-foreground text-[11px]">(Area: {areaFormatted.metric})</span>
          </span>
          {radiusZone.center && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onClearRadius}
              className="h-5 px-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onResetTool}
            className="rounded-full size-5 text-muted-foreground hover:text-destructive"
          >
            <IconX className="size-3" />
          </Button>
        </div>
      )}

      {/* Tool Status Badge: Pin Drop */}
      {activeTool === "add-marker" && (
        <div className="pointer-events-auto flex items-center gap-2 bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-border shadow-lg text-xs animate-in fade-in slide-in-from-bottom-2">
          <IconMapPin className="size-4 text-rose-500 animate-bounce" />
          <span className="font-medium text-foreground">Click anywhere on the map to drop a pin</span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onResetTool}
            className="rounded-full size-5 text-muted-foreground hover:text-destructive"
          >
            <IconX className="size-3" />
          </Button>
        </div>
      )}

      {/* Tool Status Badge: Drawing Remark Box */}
      {activeTool === "remark-box" && (
        <div className="pointer-events-auto flex items-center gap-2 bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-500/50 shadow-lg text-xs animate-in fade-in slide-in-from-bottom-2 text-cyan-400">
          <IconSquare className="size-4 animate-pulse" />
          <span className="font-medium text-foreground">
            Click two corners on map to complete Remark Bounding Box
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onResetTool}
            className="rounded-full size-5 text-muted-foreground hover:text-destructive"
          >
            <IconX className="size-3" />
          </Button>
        </div>
      )}

      {/* Remark AOI Active Status Badge */}
      {remarkArea.type !== "none" && (
        <div className="pointer-events-auto flex items-center gap-2 bg-cyan-950/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-500/50 shadow-lg text-xs animate-in fade-in">
          <IconCrosshair className="size-4 text-cyan-400" />
          <span className="font-medium text-cyan-200">
            {remarkArea.name || "Remark AOI"}:{" "}
            <strong className="text-amber-400 font-mono">{hotspotsCount.toLocaleString()}</strong> fires
          </span>
          {onClearRemarkArea && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onClearRemarkArea}
              className="h-5 px-1.5 text-xs text-rose-400 hover:text-rose-300"
            >
              Clear
            </Button>
          )}
        </div>
      )}

      {/* 26-Year Fire Calendar Quick Launcher Pill */}
      {onOpenFireCalendar && (
        <div className="pointer-events-auto flex items-center">
          <Button
            size="sm"
            onClick={onOpenFireCalendar}
            className="h-7 px-3 text-xs bg-amber-600/90 hover:bg-amber-500 text-white font-medium gap-1.5 rounded-full shadow-lg shadow-amber-950/40 border border-amber-400/30 backdrop-blur-md"
          >
            <IconFlame className="size-3.5 text-amber-200 animate-pulse" />
            <span>26-Year Fire Calendar (2000–2026)</span>
          </Button>
        </div>
      )}

      {/* Persistent GPS Coordinate & Zoom Pill */}
      <div className="pointer-events-auto flex items-center gap-2 bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-border shadow-lg font-mono text-xs text-muted-foreground">
        <IconCompass className="size-3.5 text-primary" />
        <span className="text-foreground font-medium">
          {cursorCoords
            ? formatCoordinate(cursorCoords.lat, cursorCoords.lng)
            : centerCoords
            ? formatCoordinate(centerCoords.lat, centerCoords.lng)
            : "0.0000°, 0.0000°"}
        </span>
        <span className="text-border">|</span>
        <span>
          Zoom <strong className="text-foreground">{zoom}</strong>
        </span>
      </div>
    </div>
  );
}
