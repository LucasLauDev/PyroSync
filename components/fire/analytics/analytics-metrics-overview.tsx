"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconFlame,
  IconTrendingUp,
  IconBolt,
  IconAlertTriangle,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { MONTH_NAMES } from "../constants";

interface AnalyticsMetricsOverviewProps {
  targetYear: number;
  totalFiresTarget: number;
  totalFRPTarget: number;
  activeMonthIdx: number;
  activeMonthData?: {
    robust_z_score?: number;
    anomaly_status?: string;
    relative_anomaly_pct?: number;
  };
  progressionData: Array<{ frpTarget: number }>;
  effectiveDayFires: number;
  effectiveNightFires: number;
  nightPercent: number;
}

export function AnalyticsMetricsOverview({
  targetYear,
  totalFiresTarget,
  totalFRPTarget,
  activeMonthIdx,
  activeMonthData,
  progressionData,
  effectiveDayFires,
  effectiveNightFires,
  nightPercent,
}: AnalyticsMetricsOverviewProps) {
  const peakFrpIdx = progressionData.reduce(
    (maxIdx, d, idx, arr) => (d.frpTarget > arr[maxIdx].frpTarget ? idx : maxIdx),
    0
  );
  const peakFrpVal = Math.max(...progressionData.map((d) => d.frpTarget), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* KPI 1: Annual Total */}
      <Card className="bg-slate-900/90 border-slate-800 shadow-md">
        <CardHeader className="p-3.5 pb-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold tracking-wider uppercase text-[10px]">
              Total Fires ({targetYear})
            </span>
            <IconFlame className="size-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent className="p-3.5 pt-1">
          <div className="text-2xl font-bold font-mono text-white">
            {totalFiresTarget.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
            <IconTrendingUp className="size-3" />
            <span>+11.8% vs {targetYear - 1}</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            Harmonized across MODIS & VIIRS
          </p>
        </CardContent>
      </Card>

      {/* KPI 2: Total Radiative Energy */}
      <Card className="bg-slate-900/90 border-slate-800 shadow-md">
        <CardHeader className="p-3.5 pb-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold tracking-wider uppercase text-[10px]">
              Radiative Power (FRP)
            </span>
            <IconBolt className="size-4 text-rose-500" />
          </div>
        </CardHeader>
        <CardContent className="p-3.5 pt-1">
          <div className="text-2xl font-bold font-mono text-white">
            {(totalFRPTarget / 1_000_000).toFixed(2)}M{" "}
            <span className="text-xs font-normal text-slate-400">MW Energy</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-300 font-mono">
            Peak: {MONTH_NAMES[peakFrpIdx]} ({(peakFrpVal / 1_000_000).toFixed(2)}M MW)
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            VZA view-angle calibrated energy
          </p>
        </CardContent>
      </Card>

      {/* KPI 3: Month Anomaly Highlight */}
      <Card className="bg-slate-900/90 border-slate-800 shadow-md">
        <CardHeader className="p-3.5 pb-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold tracking-wider uppercase text-[10px]">
              {MONTH_NAMES[activeMonthIdx]} Anomaly
            </span>
            <IconAlertTriangle className="size-4 text-amber-400" />
          </div>
        </CardHeader>
        <CardContent className="p-3.5 pt-1">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold font-mono text-white">
              {activeMonthData?.robust_z_score && activeMonthData.robust_z_score > 0
                ? `+${activeMonthData.robust_z_score}σ`
                : `${activeMonthData?.robust_z_score || 0}σ`}
            </div>
            <Badge
              variant="outline"
              className={`text-[9px] ${
                (activeMonthData?.robust_z_score || 0) >= 2.0
                  ? "border-rose-500/50 text-rose-400 bg-rose-500/10"
                  : "border-amber-500/50 text-amber-400 bg-amber-500/10"
              }`}
            >
              {activeMonthData?.anomaly_status || "Normal Baseline"}
            </Badge>
          </div>
          <div className="mt-1 text-[11px] text-slate-300 font-mono">
            {activeMonthData?.relative_anomaly_pct && activeMonthData.relative_anomaly_pct > 0
              ? `+${activeMonthData.relative_anomaly_pct}%`
              : `${activeMonthData?.relative_anomaly_pct || 0}%`}{" "}
            departure vs median
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            Robust Non-Parametric IQR baseline
          </p>
        </CardContent>
      </Card>

      {/* KPI 4: Diurnal Flaming vs Smoldering Ratio */}
      <Card className="bg-slate-900/90 border-slate-800 shadow-md">
        <CardHeader className="p-3.5 pb-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold tracking-wider uppercase text-[10px]">
              Day / Night Ratio
            </span>
            <div className="flex items-center gap-1">
              <IconSun className="size-3.5 text-amber-400" />
              <IconMoon className="size-3.5 text-indigo-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3.5 pt-1">
          <div className="text-2xl font-bold font-mono text-white">
            {(effectiveDayFires / Math.max(1, effectiveNightFires)).toFixed(1)}:1{" "}
            <span className="text-xs font-normal text-indigo-400">({nightPercent}% smoldering)</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-300 font-mono">
            {(effectiveDayFires / 1_000_000).toFixed(2)}M D / {(effectiveNightFires / 1_000_000).toFixed(2)}M N
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            Night smoldering captured by 375m VIIRS
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
