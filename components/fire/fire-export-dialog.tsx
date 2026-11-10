"use client";

import React, { useState } from "react";
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
  startDate,
  endDate,
}: FireExportDialogProps) {
  const [exportType, setExportType] = useState<"hotspots" | "calendar">("hotspots");
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = () => {
    setIsExporting(true);

    const params = new URLSearchParams();
    params.set("type", exportType);
    params.set("region", selectedRegion);
    params.set("sensor", sensorFilter);
    if (minFrpFilter > 0) params.set("minFrp", minFrpFilter.toString());
    if (daynightFilter !== "all") params.set("daynight", daynightFilter);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    if (remarkArea.type === "bbox" && remarkArea.bbox) {
      params.set("bbox", remarkArea.bbox.join(","));
    } else if (remarkArea.type === "circle" && remarkArea.circle) {
      params.set("remarkCenter", `${remarkArea.circle.lat},${remarkArea.circle.lon}`);
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
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
            <IconDownload className="size-4" />
            <span>NASA FIRMS Data Export</span>
          </div>
          <DialogTitle className="text-base font-bold text-white">
            Export Harmonized Fire Data to CSV
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Select export format based on your analytical requirements. Data is calibrated using the 173-month MODIS-VIIRS continuity scaling framework.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          {/* Option 1: Point-Level Hotspots */}
          <button
            type="button"
            onClick={() => setExportType("hotspots")}
            className={`p-3 rounded-lg border text-left transition-all flex items-start gap-3 ${
              exportType === "hotspots"
                ? "border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <div className="size-8 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <IconFlame className="size-4 text-amber-400" />
            </div>
            <div className="space-y-1 flex-1 font-sans">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white">
                  Point-Level Harmonized Hotspots
                </span>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30">
                  15-Column Schema
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Exports every active fire detection with coordinates, raw & harmonized FRP (MW), brightness temp, confidence, sensor, satellite, and remark flags.
              </p>
              <div className="text-[10px] font-mono text-slate-500 pt-1">
                Matching filter: {totalHotspotsCount.toLocaleString()} points
              </div>
            </div>
          </button>

          {/* Option 2: 26-Year Monthly Calendar Matrix */}
          <button
            type="button"
            onClick={() => setExportType("calendar")}
            className={`p-3 rounded-lg border text-left transition-all flex items-start gap-3 ${
              exportType === "calendar"
                ? "border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <div className="size-8 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <IconCalendar className="size-4 text-cyan-400" />
            </div>
            <div className="space-y-1 flex-1 font-sans">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white">
                  26-Year Calendar & Anomaly Matrix
                </span>
                <Badge variant="outline" className="text-[10px] font-mono text-cyan-400 border-cyan-500/30">
                  2000–2026
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Exports monthly time series with raw MODIS, raw VIIRS, harmonized counts, Active Fire Hex-Days, historical medians, IQRs, and robust Z-score departures.
              </p>
            </div>
          </button>

          {/* Active Filters Summary */}
          <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-[11px] font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold mb-1">Export Metadata:</div>
            <div>• Region: <span className="text-white">{selectedRegion}</span></div>
            <div>• Sensors: <span className="text-white">{sensorFilter}</span></div>
            {remarkArea.type !== "none" && (
              <div>• Remark AOI: <span className="text-cyan-400">{remarkArea.name || "Active Remark Area"}</span></div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
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
            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
          >
            <IconDownload className="size-4" />
            {isExporting ? "Generating CSV..." : "Download CSV File"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
