"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MapToolMode } from "./types";
import {
  IconPlus,
  IconMinus,
  IconCurrentLocation,
  IconWorld,
  IconRuler,
  IconCircleDot,
  IconMapPin,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLoader2,
  IconFlame,
  IconCalendar,
  IconDownload,
  IconSquare,
  IconCrosshair,
} from "@tabler/icons-react";

interface MapControlsProps {
  activeTool: MapToolMode;
  onSetTool: (tool: MapToolMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onLocateMe: () => void;
  isLocating: boolean;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  // NASA Fire Controls
  showHotspots?: boolean;
  onToggleHotspots?: () => void;
  onToggleFireCalendar?: () => void;
  isFireCalendarOpen?: boolean;
  onOpenRemarkDialog?: () => void;
  onOpenExportDialog?: () => void;
}

export function MapControls({
  activeTool,
  onSetTool,
  onZoomIn,
  onZoomOut,
  onResetView,
  onLocateMe,
  isLocating,
  isSidebarOpen,
  onToggleSidebar,
  showHotspots = true,
  onToggleHotspots,
  onToggleFireCalendar,
  isFireCalendarOpen = false,
  onOpenRemarkDialog,
  onOpenExportDialog,
}: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2.5 pointer-events-none">
      {/* Primary Action Clusters */}
      <div className="pointer-events-auto flex items-center gap-1.5 bg-background/90 backdrop-blur-md p-1 rounded-xl border border-border shadow-lg">
        {/* Toggle 26-Year Harmonized Fire Calendar Button */}
        {onToggleFireCalendar && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={isFireCalendarOpen ? "default" : "outline"}
                  size="sm"
                  onClick={onToggleFireCalendar}
                  className={`h-8 px-2.5 text-xs font-semibold gap-1.5 shadow-sm transition-all ${
                    isFireCalendarOpen
                      ? "bg-amber-600 hover:bg-amber-500 text-white"
                      : "bg-background/80 hover:bg-amber-950/20 text-amber-500 hover:text-amber-400 border-amber-500/40"
                  }`}
                  aria-label="Toggle 26-Year Fire Calendar"
                >
                  <IconFlame className="size-4 animate-pulse" />
                  <span className="hidden sm:inline">26-Yr Calendar</span>
                </Button>
              }
            />
            <TooltipContent side="left">
              {isFireCalendarOpen ? "Close Calendar Matrix" : "Open 26-Year Harmonized Fire Calendar (2000–2026)"}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Sidebar Toggle */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={isSidebarOpen ? "secondary" : "ghost"}
                size="icon-sm"
                onClick={onToggleSidebar}
                className="size-8"
                aria-label="Toggle Sidebar"
              >
                {isSidebarOpen ? (
                  <IconLayoutSidebarLeftCollapse className="size-4" />
                ) : (
                  <IconLayoutSidebarLeftExpand className="size-4" />
                )}
              </Button>
            }
          />
          <TooltipContent side="left">
            {isSidebarOpen ? "Collapse Panel" : "Open Search & Tools Panel"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Fire Tools Dock */}
      <div className="pointer-events-auto flex flex-col gap-1 bg-background/90 backdrop-blur-md p-1 rounded-xl border border-border shadow-lg">
        {/* Toggle Hotspots on Map */}
        {onToggleHotspots && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={showHotspots ? "default" : "ghost"}
                  size="icon-sm"
                  onClick={onToggleHotspots}
                  className={`size-8 ${showHotspots ? "bg-amber-600 hover:bg-amber-500 text-white" : ""}`}
                  aria-label="Toggle Hotspots Layer"
                >
                  <IconFlame className="size-4" />
                </Button>
              }
            />
            <TooltipContent side="left">
              {showHotspots ? "Hide Active Hotspots Layer" : "Show NASA FIRMS Hotspots Layer"}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Draw Remark Box */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={activeTool === "remark-box" ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => onSetTool(activeTool === "remark-box" ? "pan" : "remark-box")}
                className={`size-8 ${activeTool === "remark-box" ? "bg-cyan-600 hover:bg-cyan-500 text-white" : ""}`}
                aria-label="Draw Remark Box"
              >
                <IconSquare className="size-4" />
              </Button>
            }
          />
          <TooltipContent side="left">
            {activeTool === "remark-box" ? "Cancel Remark Box" : "Draw Remark Bounding Box (Click 2 corners)"}
          </TooltipContent>
        </Tooltip>

        {/* Enter Lat / Lon Remark Coordinates */}
        {onOpenRemarkDialog && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onOpenRemarkDialog}
                  className="size-8 text-cyan-500 hover:text-cyan-400"
                  aria-label="Enter Lat / Lon Coordinates"
                >
                  <IconCrosshair className="size-4" />
                </Button>
              }
            />
            <TooltipContent side="left">
              Enter Latitude & Longitude Coordinates
            </TooltipContent>
          </Tooltip>
        )}

        {/* Export CSV Button */}
        {onOpenExportDialog && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onOpenExportDialog}
                  className="size-8 text-emerald-500 hover:text-emerald-400"
                  aria-label="Export Data to CSV"
                >
                  <IconDownload className="size-4" />
                </Button>
              }
            />
            <TooltipContent side="left">
              Download Searched & Filtered Data (CSV)
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Measurement & Navigation Tools */}
      <div className="pointer-events-auto flex flex-col gap-1 bg-background/90 backdrop-blur-md p-1 rounded-xl border border-border shadow-lg">
        {/* Drop Pin Mode */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={activeTool === "add-marker" ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => onSetTool(activeTool === "add-marker" ? "pan" : "add-marker")}
                className="size-8"
                aria-label="Drop Pin Mode"
              >
                <IconMapPin className="size-4" />
              </Button>
            }
          />
          <TooltipContent side="left">
            {activeTool === "add-marker" ? "Cancel Pin Mode" : "Drop Custom Pin"}
          </TooltipContent>
        </Tooltip>

        {/* Measure Tool */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={activeTool === "measure" ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => onSetTool(activeTool === "measure" ? "pan" : "measure")}
                className="size-8"
                aria-label="Measure Distance"
              >
                <IconRuler className="size-4" />
              </Button>
            }
          />
          <TooltipContent side="left">
            {activeTool === "measure" ? "Exit Measure Tool" : "Measure Distance"}
          </TooltipContent>
        </Tooltip>

        {/* Radius Buffer Tool */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={activeTool === "radius" ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => onSetTool(activeTool === "radius" ? "pan" : "radius")}
                className="size-8"
                aria-label="Radius Tool"
              >
                <IconCircleDot className="size-4" />
              </Button>
            }
          />
          <TooltipContent side="left">
            {activeTool === "radius" ? "Exit Radius Tool" : "Inspect Area Radius"}
          </TooltipContent>
        </Tooltip>

        {/* Zoom Controls */}
        <div className="h-px bg-border my-0.5" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onZoomIn}
                className="size-8"
                aria-label="Zoom In"
              >
                <IconPlus className="size-4" />
              </Button>
            }
          />
          <TooltipContent side="left">Zoom In</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onZoomOut}
                className="size-8"
                aria-label="Zoom Out"
              >
                <IconMinus className="size-4" />
              </Button>
            }
          />
          <TooltipContent side="left">Zoom Out</TooltipContent>
        </Tooltip>

        {/* GPS Geolocation */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onLocateMe}
                disabled={isLocating}
                className="size-8"
                aria-label="Locate Me"
              >
                {isLocating ? (
                  <IconLoader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <IconCurrentLocation className="size-4" />
                )}
              </Button>
            }
          />
          <TooltipContent side="left">Locate My GPS Position</TooltipContent>
        </Tooltip>

        {/* Reset Camera to Default */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onResetView}
                className="size-8"
                aria-label="Reset View"
              >
                <IconWorld className="size-4" />
              </Button>
            }
          />
          <TooltipContent side="left">Reset Camera View</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
