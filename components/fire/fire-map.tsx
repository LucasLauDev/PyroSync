"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Hotspot, RemarkArea } from "./types";

interface FireMapProps {
  hotspots: Hotspot[];
  center: [number, number];
  zoom: number;
  activeLayerId: string;
  onChangeLayer: (layerId: string) => void;
  remarkArea: RemarkArea;
  onSetRemarkArea: (area: RemarkArea) => void;
  onClearRemarkArea: () => void;
  onExportRemarkCsv: () => void;
  sensorFilter: "all" | "MODIS" | "VIIRS";
  onChangeSensorFilter: (s: "all" | "MODIS" | "VIIRS") => void;
  minFrpFilter: number;
  onChangeMinFrp: (val: number) => void;
  daynightFilter: "all" | "D" | "N";
  onChangeDaynight: (dn: "all" | "D" | "N") => void;
  selectedMonthName?: string;
  selectedYear?: number | null;
  regionName: string;
}

const DynamicFireMapCanvas = dynamic(
  () => import("./fire-map-canvas").then((mod) => mod.FireMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[540px] sm:h-[600px] lg:h-[680px] bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3 border border-slate-800 rounded-xl">
        <div className="size-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono tracking-wider uppercase">Loading NASA FIRMS Hotspot Map...</span>
      </div>
    ),
  }
);

export function FireMap(props: FireMapProps) {
  return <DynamicFireMapCanvas {...props} />;
}
