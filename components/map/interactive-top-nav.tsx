"use client";

import React from "react";
import { IconMap, IconChartBar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface InteractiveTopNavProps {
  activeMainTab: "map" | "analysis";
  onSwitchMainTab: (tab: "map" | "analysis") => void;
}

export function InteractiveTopNav({
  activeMainTab,
  onSwitchMainTab,
}: InteractiveTopNavProps) {
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center">
      <div className="bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-full p-1 flex items-center gap-1">
        <button
          onClick={() => onSwitchMainTab("map")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer",
            activeMainTab === "map"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          )}
        >
          <IconMap className="size-3.5" />
          <span>Map View</span>
        </button>
        <button
          onClick={() => onSwitchMainTab("analysis")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer",
            activeMainTab === "analysis"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          )}
        >
          <IconChartBar className="size-3.5" />
          <span>Fire Analysis</span>
          <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
        </button>
      </div>
    </div>
  );
}
