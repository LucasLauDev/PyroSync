"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapControls } from "./map-controls";
import { MapSidebar } from "./map-sidebar";
import { TelemetryHUD } from "./telemetry-hud";
import { AddMarkerDialog } from "./add-marker-dialog";
import { FireRemarkDialog } from "@/components/fire/fire-remark-dialog";
import { FireExportDialog } from "@/components/fire/fire-export-dialog";
import { FireAnalysisPage } from "@/components/fire/fire-analysis-page";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { InteractiveTopNav } from "./interactive-top-nav";
import { useInteractiveMapState } from "./use-interactive-map-state";

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
  const state = useInteractiveMapState();
  const [activeMainTab, setActiveMainTab] = useState<"map" | "analysis">("map");

  const handleSwitchMainTab = useCallback((tab: "map" | "analysis") => {
    setActiveMainTab(tab);
    if (tab === "map") {
      setTimeout(() => {
        if (state.mapInstanceRef.current) {
          state.mapInstanceRef.current.invalidateSize();
        }
      }, 50);
    }
  }, [state.mapInstanceRef]);

  return (
    <TooltipProvider>
      <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
        {/* Top Tab Switcher */}
        <InteractiveTopNav
          activeMainTab={activeMainTab}
          onSwitchMainTab={handleSwitchMainTab}
        />

        {/* 1. MAP VIEW CONTAINER */}
        <div
          className={cn(
            "w-full h-full relative transition-opacity duration-200",
            activeMainTab === "map"
              ? "opacity-100 z-10"
              : "opacity-0 pointer-events-none absolute inset-0 z-0"
          )}
        >
          <DynamicMapCanvas
            activeLayerId={state.activeLayerId}
            markers={state.markers}
            activeTool={state.activeTool}
            onSetTool={state.setActiveTool}
            measurePoints={state.measurePoints}
            onAddMeasurePoint={(pt) => state.setMeasurePoints((prev) => [...prev, pt])}
            radiusZone={state.radiusZone}
            onSetRadiusCenter={(center) => state.setRadiusZone((prev) => ({ ...prev, center }))}
            onMapClickToAddMarker={state.handleMapClickToAddMarker}
            onCursorMove={state.setCursorCoords}
            onCenterChange={state.setCenterCoords}
            onZoomChange={state.setZoom}
            showPresets={state.showPresets}
            showCustomMarkers={state.showCustomMarkers}
            onMapReady={state.handleMapReady}
            hotspots={state.hotspots}
            showHotspots={state.showHotspots}
            remarkArea={state.remarkArea}
            onSetRemarkArea={state.setRemarkArea}
            colorRamp={state.colorRamp}
          />

          {/* Floating Side Drawer */}
          <MapSidebar
            isOpen={state.isSidebarOpen}
            onClose={() => state.setIsSidebarOpen(false)}
            startDate={state.startDate}
            endDate={state.endDate}
            onChangeDateRange={(s, e) => {
              state.setStartDate(s);
              state.setEndDate(e);
            }}
            selectedRegion={state.selectedRegion}
            onSelectRegion={state.handleSelectRegion}
            showHotspots={state.showHotspots}
            onToggleHotspots={state.setShowHotspots}
            sensorFilter={state.sensorFilter}
            onChangeSensorFilter={state.setSensorFilter}
            minFrpFilter={state.minFrpFilter}
            onChangeMinFrpFilter={state.setMinFrpFilter}
            daynightFilter={state.daynightFilter}
            onChangeDaynightFilter={state.setDaynightFilter}
            colorRamp={state.colorRamp}
            onChangeColorRamp={state.setColorRamp}
            harmonizationMode={state.harmonizationMode}
            onChangeHarmonizationMode={state.setHarmonizationMode}
            viewMetric={state.viewMetric}
            onChangeViewMetric={state.setViewMetric}
            selectedYear={state.selectedYear}
            selectedMonth={state.selectedMonth}
            onResetSelectedPeriod={() => {
              state.setStartDate("2026-09-10");
              state.setEndDate("2026-11-09");
            }}
            remarkArea={state.remarkArea}
            onClearRemarkArea={() => state.setRemarkArea({ type: "none" })}
            onOpenRemarkDialog={() => state.setIsRemarkDialogOpen(true)}
            onOpenExportDialog={() => state.setIsExportDialogOpen(true)}
            hotspotsCount={state.hotspots.length}
            totalFrp={state.totalFrp}
            activeLayerId={state.activeLayerId}
            onSelectLayer={state.setActiveLayerId}
          />

          {/* Floating Action Buttons / Navigation Cluster */}
          <MapControls
            activeTool={state.activeTool}
            onSetTool={state.setActiveTool}
            onZoomIn={state.handleZoomIn}
            onZoomOut={state.handleZoomOut}
            onResetView={state.handleResetView}
            onLocateMe={state.handleLocateMe}
            isLocating={state.isLocating}
            isSidebarOpen={state.isSidebarOpen}
            onToggleSidebar={() => state.setIsSidebarOpen((prev) => !prev)}
            showHotspots={state.showHotspots}
            onToggleHotspots={() => state.setShowHotspots(!state.showHotspots)}
            onOpenRemarkDialog={() => state.setIsRemarkDialogOpen(true)}
            onOpenExportDialog={() => state.setIsExportDialogOpen(true)}
          />

          {/* Telemetry HUD & Status Bar */}
          <TelemetryHUD
            cursorCoords={state.cursorCoords}
            centerCoords={state.centerCoords}
            zoom={state.zoom}
            activeTool={state.activeTool}
            measurePoints={state.measurePoints}
            radiusZone={state.radiusZone}
            onResetTool={() => state.setActiveTool("pan")}
            onClearMeasure={() => state.setMeasurePoints([])}
            onClearRadius={() => state.setRadiusZone((prev) => ({ ...prev, center: null }))}
            remarkArea={state.remarkArea}
            onClearRemarkArea={() => state.setRemarkArea({ type: "none" })}
            hotspotsCount={state.hotspots.length}
          />
        </div>

        {/* 2. ANALYSIS PAGE VIEW CONTAINER */}
        <div
          className={cn(
            "w-full h-full relative transition-opacity duration-200",
            activeMainTab === "analysis"
              ? "opacity-100 z-20"
              : "opacity-0 pointer-events-none absolute inset-0 z-0"
          )}
        >
          <FireAnalysisPage
            calendarData={state.calendarData}
            selectedRegion={state.selectedRegion}
            onSelectRegion={state.handleSelectRegion}
            colorRamp={state.colorRamp}
            onChangeColorRamp={state.setColorRamp}
            viewMetric={state.viewMetric}
            onChangeViewMetric={state.setViewMetric}
            harmonizationMode={state.harmonizationMode}
            onChangeHarmonizationMode={state.setHarmonizationMode}
            selectedYear={state.selectedYear}
            selectedMonth={state.selectedMonth}
            onSelectCell={state.handleSelectCalendarCell}
            onOpenExportDialog={() => state.setIsExportDialogOpen(true)}
            onSwitchToMap={() => handleSwitchMainTab("map")}
            startDate={state.startDate}
            endDate={state.endDate}
            onChangeDateRange={(s, e) => {
              state.setStartDate(s);
              state.setEndDate(e);
            }}
            sensorFilter={state.sensorFilter}
            onChangeSensorFilter={state.setSensorFilter}
            daynightFilter={state.daynightFilter}
            onChangeDaynightFilter={state.setDaynightFilter}
            minFrpFilter={state.minFrpFilter}
            onChangeMinFrpFilter={state.setMinFrpFilter}
          />
        </div>

        {/* Marker Modal */}
        <AddMarkerDialog
          isOpen={state.isAddMarkerOpen}
          coords={state.addMarkerCoords}
          onClose={() => {
            state.setIsAddMarkerOpen(false);
            state.setAddMarkerCoords(null);
          }}
          onSave={state.handleSaveMarker}
        />

        {/* Fire Remark Modal */}
        <FireRemarkDialog
          isOpen={state.isRemarkDialogOpen}
          onClose={() => state.setIsRemarkDialogOpen(false)}
          onApplyRemark={(area) => {
            state.setRemarkArea({
              type: area.type,
              bbox: area.bbox,
              circle: area.circle
                ? { lat: area.circle.lat, lng: area.circle.lon, radiusKm: area.circle.radiusKm }
                : undefined,
              name: area.name,
            });
          }}
          onFlyTo={state.handleFlyTo}
        />

        {/* Export CSV Modal */}
        <FireExportDialog
          isOpen={state.isExportDialogOpen}
          onClose={() => state.setIsExportDialogOpen(false)}
          selectedRegion={state.selectedRegion}
          remarkArea={state.remarkArea}
          sensorFilter={state.sensorFilter}
          minFrpFilter={state.minFrpFilter}
          daynightFilter={state.daynightFilter}
          totalHotspotsCount={state.hotspots.length}
          startDate={state.startDate}
          endDate={state.endDate}
        />
      </div>
    </TooltipProvider>
  );
}
