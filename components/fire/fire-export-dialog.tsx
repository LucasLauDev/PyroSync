"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RemarkArea } from "./types";
import {
  IconDownload,
  IconCalendar,
  IconFlame,
  IconMapPin,
  IconCheck,
  IconSun,
  IconMoon,
  IconClock,
  IconFilter,
  IconFileSpreadsheet,
} from "@tabler/icons-react";

interface FireExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegion: string;
  remarkArea: RemarkArea;
  sensorFilter: string;
  minFrpFilter: number;
  daynightFilter: string;
  totalHotspotsCount: number;
  startDate?: string;
  endDate?: string;
}

export function FireExportDialog({
  isOpen,
  onClose,
  selectedRegion,
  remarkArea,
  sensorFilter,
  minFrpFilter,
  daynightFilter,
  totalHotspotsCount,
  startDate = "2026-09-10",
  endDate = "2026-11-09",
}: FireExportDialogProps) {
  const [exportType, setExportType] = useState<"hotspots" | "calendar">("hotspots");
  const [isExporting, setIsExporting] = useState(false);

  // Local filter states allowing verification and adjustment
  const [activeSensor, setActiveSensor] = useState<string>(sensorFilter);
  const [activeDaynight, setActiveDaynight] = useState<string>(daynightFilter);
  const [activeStartDate, setActiveStartDate] = useState<string>(startDate);
  const [activeEndDate, setActiveEndDate] = useState<string>(endDate);
  const [activeMinFrp, setActiveMinFrp] = useState<number>(minFrpFilter);

  // Synchronize when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveSensor(sensorFilter);
      setActiveDaynight(daynightFilter);
      setActiveStartDate(startDate);
      setActiveEndDate(endDate);
      setActiveMinFrp(minFrpFilter);
    }
  }, [isOpen, sensorFilter, daynightFilter, startDate, endDate, minFrpFilter]);

  const handleDownload = () => {
    setIsExporting(true);

    const params = new URLSearchParams();
    params.set("type", exportType);
    params.set("region", selectedRegion);
    params.set("sensor", activeSensor);
    if (activeMinFrp > 0) params.set("minFrp", activeMinFrp.toString());
    if (activeDaynight !== "all") params.set("daynight", activeDaynight);
    if (activeStartDate) params.set("startDate", activeStartDate);
    if (activeEndDate) params.set("endDate", activeEndDate);

    if (remarkArea.type === "bbox" && remarkArea.bbox) {
      params.set("bbox", remarkArea.bbox.join(","));
    } else if (remarkArea.type === "circle" && remarkArea.circle) {
      const lon = remarkArea.circle.lon ?? remarkArea.circle.lng ?? 0;
      params.set("remarkCenter", `${remarkArea.circle.lat},${lon}`);
      params.set("radiusKm", remarkArea.circle.radiusKm.toString());
    }

    const downloadUrl = `/api/export-csv?${params.toString()}`;

    // Trigger download in browser
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsExporting(false);
      onClose();
    }, 1200);
  };

  const diurnalLabel =
    activeDaynight === "D"
      ? "Day Flaming (D)"
      : activeDaynight === "N"
      ? "Night Smoldering (N)"
      : "Day & Night (All)";

  const sensorLabel =
    activeSensor === "MODIS"
      ? "MODIS Only (Terra/Aqua)"
      : activeSensor === "VIIRS"
      ? "VIIRS Only (S-NPP/JPSS)"
      : "All Sensors (Harmonized)";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700 text-slate-100 max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
            <IconDownload className="size-4" />
            <span>NASA FIRMS Data Export</span>
          </div>
          <DialogTitle className="text-base font-bold text-white">
            Export Harmonized Fire Dataset (CSV)
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Export NASA Earth observation records strictly respecting all your active temporal, sensor, diurnal phase, and spatial filters.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          {/* Format Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Option 1: Point-Level Hotspots */}
            <button
              type="button"
              onClick={() => setExportType("hotspots")}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                exportType === "hotspots"
                  ? "border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/70"
                  : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="size-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <IconFlame className="size-4" />
                </div>
                <Badge
                  variant="outline"
                  className={`text-[9px] font-mono ${
                    exportType === "hotspots"
                      ? "text-emerald-300 border-emerald-400 bg-emerald-500/10 font-bold"
                      : "text-slate-400 border-slate-700"
                  }`}
                >
                  16 Columns
                </Badge>
              </div>
              <div>
                <span className="font-bold text-xs text-white block">
                  Point-Level Hotspots
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                  Every detection with Lat/Lon, raw & harmonized FRP, brightness, sensor & diurnal phase.
                </p>
              </div>
            </button>

            {/* Option 2: 26-Year Calendar Matrix */}
            <button
              type="button"
              onClick={() => setExportType("calendar")}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                exportType === "calendar"
                  ? "border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/70"
                  : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="size-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <IconCalendar className="size-4" />
                </div>
                <Badge
                  variant="outline"
                  className={`text-[9px] font-mono ${
                    exportType === "calendar"
                      ? "text-cyan-300 border-cyan-400 bg-cyan-500/10 font-bold"
                      : "text-slate-400 border-slate-700"
                  }`}
                >
                  2000–2026
                </Badge>
              </div>
              <div>
                <span className="font-bold text-xs text-white block">
                  Calendar & Anomaly Matrix
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                  Monthly time series with historical medians, IQRs, robust Z-scores & climatology.
                </p>
              </div>
            </button>
          </div>

          {/* Active Filter Criteria Panel */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <IconFilter className="size-3.5 text-emerald-400" />
                <span>Filters Applied to Export:</span>
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                {totalHotspotsCount.toLocaleString()} Points Matched
              </Badge>
            </div>

            {/* Filter 1: Date Range */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <IconCalendar className="size-3.5 text-amber-500" />
                <span>Date Range:</span>
              </span>
              <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {activeStartDate} → {activeEndDate}
              </span>
            </div>

            {/* Filter 2: Sensor Origin */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <IconFlame className="size-3.5 text-rose-500" />
                <span>Sensors:</span>
              </span>
              <div className="flex items-center gap-1">
                {(["all", "MODIS", "VIIRS"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setActiveSensor(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                      activeSensor === s
                        ? "bg-amber-600 text-white font-bold"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 3: Diurnal Phase */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <IconSun className="size-3.5 text-amber-400" />
                <span>Diurnal Phase:</span>
              </span>
              <div className="flex items-center gap-1">
                {[
                  { id: "all", label: "Day & Night" },
                  { id: "D", label: "Day (D)" },
                  { id: "N", label: "Night (N)" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveDaynight(id)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                      activeDaynight === id
                        ? "bg-amber-600 text-white font-bold"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 4: Minimum FRP Threshold */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <IconFlame className="size-3.5 text-amber-500" />
                <span>Minimum FRP:</span>
              </span>
              <span className="text-slate-200 font-bold">
                {activeMinFrp > 0 ? `≥ ${activeMinFrp} MW` : "0 MW (All Intensities)"}
              </span>
            </div>

            {/* Filter 5: Spatial Region / AOI */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <IconMapPin className="size-3.5 text-cyan-400" />
                <span>Spatial Scope:</span>
              </span>
              <span className="text-cyan-300 font-semibold truncate max-w-[200px]">
                {remarkArea.type !== "none" ? (remarkArea.name || "Custom Drawn AOI") : selectedRegion}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-800/80">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 font-semibold shadow-lg shadow-emerald-950/50 cursor-pointer"
          >
            <IconDownload className="size-4" />
            {isExporting ? "Generating Filtered CSV..." : "Download Filtered CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
