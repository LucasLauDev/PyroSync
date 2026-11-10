"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { REGION_PRESETS } from "../constants";

interface AnalysisRegimesViewProps {
  selectedRegion: string;
  onSelectRegion: (regionId: string) => void;
}

export function AnalysisRegimesView({
  selectedRegion,
  onSelectRegion,
}: AnalysisRegimesViewProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {REGION_PRESETS.map((preset) => {
          const isSelected = preset.id === selectedRegion;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectRegion(preset.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 relative overflow-hidden group cursor-pointer ${
                isSelected
                  ? "bg-slate-800/90 border-amber-500 ring-1 ring-amber-500 shadow-lg shadow-amber-500/10"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
                  {preset.name}
                </span>
                {isSelected && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-amber-500/40 text-amber-400 bg-amber-500/10"
                  >
                    Active
                  </Badge>
                )}
              </div>
              <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Continuity Multiplier:</span>
                  <span className="text-slate-200 font-semibold">
                    ×{preset.continuityFactor}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Center Coordinates:</span>
                  <span className="text-slate-300">
                    {preset.center[0]}°, {preset.center[1]}°
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
