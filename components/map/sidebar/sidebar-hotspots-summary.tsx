"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { IconDownload } from "@tabler/icons-react";
import { ViewMetric } from "@/components/fire/types";

interface SidebarHotspotsSummaryProps {
  hotspotsCount: number;
  totalFrp: number;
  viewMetric?: ViewMetric;
  onOpenExportDialog?: () => void;
}

export function SidebarHotspotsSummary({
  hotspotsCount,
  totalFrp,
  viewMetric = "harmonized_count",
  onOpenExportDialog,
}: SidebarHotspotsSummaryProps) {
  return (
    <div className="space-y-2 pt-3 border-t border-slate-800/80">
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Filtered Active Hotspots:</span>
          <span
            className={`font-mono font-bold ${
              viewMetric === "harmonized_count"
                ? "text-amber-400 text-sm"
                : "text-white"
            }`}
          >
            {hotspotsCount.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Total Radiative Energy:</span>
          <span
            className={`font-mono font-bold ${
              viewMetric === "harmonized_frp_mw"
                ? "text-amber-400 text-sm"
                : "text-amber-400"
            }`}
          >
            {totalFrp >= 1000
              ? `${(totalFrp / 1000).toFixed(1)}k MW`
              : `${totalFrp} MW`}
          </span>
        </div>
        {viewMetric === "active_fire_hex_days" && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
            <span className="text-slate-400">Est. Active Hex-Days (Res-7):</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              {Math.round(hotspotsCount * 0.42).toLocaleString()} hex-days
            </span>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        onClick={onOpenExportDialog}
        className="w-full border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/20 text-xs h-8 gap-1.5 cursor-pointer"
      >
        <IconDownload className="size-3.5" />
        <span>Download Searched Data (CSV)</span>
      </Button>
    </div>
  );
}
