"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconScale } from "@tabler/icons-react";
import { MetricDifferenceRow } from "./comparison-types";

interface ComparisonMatrixProps {
  preset1: { name: string };
  preset2: { name: string };
  year1: number;
  year2: number;
  daynight1: "all" | "D" | "N";
  daynight2: "all" | "D" | "N";
  isLoading1: boolean;
  isLoading2: boolean;
  totalBurden1: number;
  totalBurden2: number;
  totalFrp1: number;
  totalFrp2: number;
  peak1: { month: string; count: number; zScore: number };
  peak2: { month: string; count: number; zScore: number };
  nightPct1: number;
  nightPct2: number;
  totalHex1: number;
  totalHex2: number;
  diffPct: number;
  metricsDifferences: MetricDifferenceRow[];
}

export function ComparisonMatrix({
  preset1,
  preset2,
  year1,
  year2,
  daynight1,
  daynight2,
  isLoading1,
  isLoading2,
  totalBurden1,
  totalBurden2,
  totalFrp1,
  totalFrp2,
  peak1,
  peak2,
  nightPct1,
  nightPct2,
  totalHex1,
  totalHex2,
  diffPct,
  metricsDifferences,
}: ComparisonMatrixProps) {
  return (
    <div className="space-y-6">
      {/* 1. Comparative Summary Cards & High-Level Differential */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Input 1 Summary Card */}
        <Card className="bg-slate-900/50 border-amber-500/40 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-400" />
                <span>{preset1.name}</span>
              </CardTitle>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-mono">
                {year1} · {daynight1 === "all" ? "Day+Night" : daynight1 === "D" ? "Day" : "Night"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-mono">Filtered Fire Burden:</span>
              <span className="text-xl font-bold font-mono text-white">
                {isLoading1 ? "Loading..." : totalBurden1.toLocaleString()}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-slate-400">Total Thermal Energy (FRP):</span>
              <span className="text-amber-400 font-semibold">{Math.round(totalFrp1).toLocaleString()} MW</span>
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-slate-400">Peak Month:</span>
              <span className="text-amber-400 font-semibold">
                {peak1.month} ({peak1.count.toLocaleString()})
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-slate-400">Night Smoldering Ratio:</span>
              <span className="text-purple-400 font-semibold">{nightPct1}% nocturnal</span>
            </div>
          </CardContent>
        </Card>

        {/* Center Comparative Differential Overview Card */}
        <Card className="bg-slate-900/70 border-slate-700/80 flex flex-col justify-between p-4 shadow-xl shadow-slate-950/50 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-500" />
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">
                <IconScale className="size-3.5 text-cyan-400" />
                <span>Comparative Differential</span>
              </span>
              <Badge variant="outline" className="text-[9px] font-mono border-slate-700 text-slate-400">
                All Metrics
              </Badge>
            </div>

            <div className="text-lg font-extrabold font-mono leading-tight mb-2">
              {diffPct > 0 ? (
                <span className="text-amber-400">+{diffPct}% Fire Burden in Input 1</span>
              ) : diffPct < 0 ? (
                <span className="text-cyan-400">+{Math.abs(diffPct)}% Fire Burden in Input 2</span>
              ) : (
                <span className="text-slate-300">Equivalent Intensity</span>
              )}
            </div>

            {/* Quick Multi-Metric Mini Pills */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono pt-1">
              <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">⚡ FRP Energy:</span>
                <span className={totalFrp1 >= totalFrp2 ? "text-amber-400 font-bold" : "text-cyan-400 font-bold"}>
                  {totalFrp2 > 0 ? `${Math.round(((totalFrp1 - totalFrp2) / totalFrp2) * 100)}%` : "N/A"}
                </span>
              </div>
              <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">🌙 Smolder:</span>
                <span className={nightPct1 >= nightPct2 ? "text-amber-400 font-bold" : "text-cyan-400 font-bold"}>
                  {nightPct1 - nightPct2 > 0 ? `+${(nightPct1 - nightPct2).toFixed(1)}%` : `${(nightPct1 - nightPct2).toFixed(1)}%`}
                </span>
              </div>
              <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">🗺️ Hex Extent:</span>
                <span className={totalHex1 >= totalHex2 ? "text-amber-400 font-bold" : "text-cyan-400 font-bold"}>
                  {totalHex2 > 0 ? `${Math.round(((totalHex1 - totalHex2) / totalHex2) * 100)}%` : "N/A"}
                </span>
              </div>
              <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">📅 Peak Shift:</span>
                <span className="text-slate-200 font-bold">
                  {peak1.month} vs {peak2.month}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono text-center pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1">
            <span className="text-cyan-400 font-semibold">9 metrics compared below</span>
          </div>
        </Card>

        {/* Input 2 Summary Card */}
        <Card className="bg-slate-900/50 border-cyan-500/40 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-cyan-400" />
                <span>{preset2.name}</span>
              </CardTitle>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] font-mono">
                {year2} · {daynight2 === "all" ? "Day+Night" : daynight2 === "D" ? "Day" : "Night"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-mono">Filtered Fire Burden:</span>
              <span className="text-xl font-bold font-mono text-white">
                {isLoading2 ? "Loading..." : totalBurden2.toLocaleString()}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-slate-400">Total Thermal Energy (FRP):</span>
              <span className="text-cyan-400 font-semibold">{Math.round(totalFrp2).toLocaleString()} MW</span>
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-slate-400">Peak Month:</span>
              <span className="text-cyan-400 font-semibold">
                {peak2.month} ({peak2.count.toLocaleString()})
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-slate-400">Night Smoldering Ratio:</span>
              <span className="text-purple-400 font-semibold">{nightPct2}% nocturnal</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Comprehensive Metrics Differential Matrix Table */}
      <Card className="border border-slate-800 bg-slate-900/70 overflow-hidden shadow-2xl">
        <CardHeader className="py-3 px-4 border-b border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <IconScale className="size-4 text-emerald-400" />
              <span>Comparative Differential Matrix (All Metrics Differences)</span>
            </CardTitle>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Exact quantitative discrepancies, absolute delta (Δ), percentage variance, and climatological dominance between Input 1 and Input 2.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="flex items-center gap-1 text-amber-400">
              <span className="size-2 rounded-full bg-amber-400" /> Input 1 Leads
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="size-2 rounded-full bg-cyan-400" /> Input 2 Leads
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/90 text-slate-400 text-[11px]">
                <th className="py-2.5 px-4 font-semibold">Metric & Classification</th>
                <th className="py-2.5 px-3 font-semibold text-amber-400">
                  Input 1: {preset1.name} ({year1})
                </th>
                <th className="py-2.5 px-3 font-semibold text-cyan-400">
                  Input 2: {preset2.name} ({year2})
                </th>
                <th className="py-2.5 px-3 font-semibold">Absolute Difference (Δ)</th>
                <th className="py-2.5 px-3 font-semibold">Relative Variance (%)</th>
                <th className="py-2.5 px-4 font-semibold">Comparative Analysis & Insight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {metricsDifferences.map((row) => {
                const Icon = row.icon;
                const isInput1 = row.winner === "input1";
                const isInput2 = row.winner === "input2";

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Metric Name */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`size-6 rounded-md flex items-center justify-center shrink-0 ${
                            isInput1
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : isInput2
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          <Icon className="size-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-white block">
                            {row.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-sans">
                            {row.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Value 1 */}
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {row.val1}
                      </span>
                    </td>

                    {/* Value 2 */}
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {row.val2}
                      </span>
                    </td>

                    {/* Absolute Diff */}
                    <td className="py-2.5 px-3 font-bold">
                      <span
                        className={
                          isInput1
                            ? "text-amber-400"
                            : isInput2
                            ? "text-cyan-400"
                            : "text-slate-300"
                        }
                      >
                        {row.diffAbs}
                      </span>
                    </td>

                    {/* Relative % */}
                    <td className="py-2.5 px-3 font-bold">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono ${
                          isInput1
                            ? "border-amber-500/40 text-amber-300 bg-amber-500/10"
                            : isInput2
                            ? "border-cyan-500/40 text-cyan-300 bg-cyan-500/10"
                            : "border-slate-700 text-slate-400"
                        }`}
                      >
                        {row.diffPct}
                      </Badge>
                    </td>

                    {/* Insight */}
                    <td className="py-2.5 px-4 text-[11px] text-slate-300 font-sans">
                      <div className="flex items-center gap-1.5">
                        {isInput1 && (
                          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono px-1 py-0 shrink-0">
                            Input 1 Leads
                          </Badge>
                        )}
                        {isInput2 && (
                          <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono px-1 py-0 shrink-0">
                            Input 2 Leads
                          </Badge>
                        )}
                        <span>{row.insight}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
