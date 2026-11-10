"use client";

import React from "react";
import { IconCheck } from "@tabler/icons-react";
import { AVAILABLE_LAYERS } from "../data/layers";

interface SidebarLayersTabProps {
  activeLayerId: string;
  onSelectLayer: (layerId: string) => void;
}

export function SidebarLayersTab({
  activeLayerId,
  onSelectLayer,
}: SidebarLayersTabProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
        <span>Tile Layer Selection</span>
        <span className="text-[10px] text-slate-500 font-mono">Leaflet 2.0-beta</span>
      </label>

      <div className="space-y-1.5">
        {AVAILABLE_LAYERS.map((layer) => {
          const isSelected = layer.id === activeLayerId;
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onSelectLayer(layer.id)}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? "bg-slate-800/90 border-amber-500 ring-1 ring-amber-500"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/30"
              }`}
            >
              <div>
                <div className="text-xs font-semibold text-white">{layer.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {layer.description}
                </div>
              </div>
              {isSelected && <IconCheck className="size-4 text-amber-400 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
