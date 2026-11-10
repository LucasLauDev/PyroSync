"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line, Bar, Doughnut, PolarArea } from "react-chartjs-2";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconTrendingUp,
  IconActivity,
  IconMoon,
  IconFlame,
  IconCalendar,
} from "@tabler/icons-react";

// Ensure ChartJS components are registered
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ComparisonChartsProps {
  preset1: { name: string };
  preset2: { name: string };
  year1: number;
  year2: number;
  totalBurden1: number;
  totalBurden2: number;
  peak1: { month: string; zScore: number };
  peak2: { month: string; zScore: number };
  nightPct1: number;
  nightPct2: number;
  cumulativeData1: any;
  cumulativeData2: any;
  anomalyData1: any;
  anomalyData2: any;
  diurnalData1: any;
  diurnalData2: any;
  polarData1: any;
  polarData2: any;
  annualHistory1: any;
  annualHistory2: any;
}

const lineOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: "#94a3b8", font: { size: 10, family: "monospace" } },
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "#334155",
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(51, 65, 85, 0.3)" },
      ticks: { color: "#94a3b8", font: { size: 10 } },
    },
    y: {
      grid: { color: "rgba(51, 65, 85, 0.3)" },
      ticks: { color: "#94a3b8", font: { size: 10 } },
    },
  },
};

const barOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "#334155",
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#94a3b8", font: { size: 9 } },
    },
    y: {
      grid: { color: "rgba(51, 65, 85, 0.3)" },
      ticks: { color: "#94a3b8", font: { size: 9 } },
    },
  },
};

const doughnutOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "#94a3b8", font: { size: 10, family: "monospace" } },
    },
  },
};

const polarOptions: ChartOptions<"polarArea"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    r: {
      grid: { color: "rgba(51, 65, 85, 0.4)" },
      ticks: { display: false },
    },
  },
};

export function ComparisonCharts({
  preset1,
  preset2,
  year1,
  year2,
  totalBurden1,
  totalBurden2,
  peak1,
  peak2,
  nightPct1,
  nightPct2,
  cumulativeData1,
  cumulativeData2,
  anomalyData1,
  anomalyData2,
  diurnalData1,
  diurnalData2,
  polarData1,
  polarData2,
  annualHistory1,
  annualHistory2,
}: ComparisonChartsProps) {
  return (
    <div className="space-y-6">
      {/* Comparison 1: Cumulative Season Progression */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IconTrendingUp className="size-4 text-amber-500" />
            <span>Comparison 1: Cumulative Season Progression Curve (DOY 1–365)</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Cumulative trajectory vs 26-year median</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-amber-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 font-mono">
                  Input 1: {preset1.name} ({year1})
                </span>
                <Badge variant="outline" className="text-[9px] font-mono text-amber-300 border-amber-500/30">
                  Total: {totalBurden1.toLocaleString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 h-[240px]">
              <Line data={cumulativeData1} options={lineOptions} />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-cyan-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 font-mono">
                  Input 2: {preset2.name} ({year2})
                </span>
                <Badge variant="outline" className="text-[9px] font-mono text-cyan-300 border-cyan-500/30">
                  Total: {totalBurden2.toLocaleString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 h-[240px]">
              <Line data={cumulativeData2} options={lineOptions} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparison 2: Monthly Robust Z-Score Anomalies */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IconActivity className="size-4 text-rose-500" />
            <span>Comparison 2: Monthly Robust Z-Score Anomaly Departures</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Red: Extreme surge (&gt;+2.0σ) | Blue: Deficit</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-amber-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 font-mono">
                  Input 1: {preset1.name} ({year1} Anomalies)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Peak: {peak1.month} ({peak1.zScore > 0 ? `+${peak1.zScore}σ` : `${peak1.zScore}σ`})
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-3 h-[210px]">
              <Bar data={anomalyData1} options={barOptions} />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-cyan-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 font-mono">
                  Input 2: {preset2.name} ({year2} Anomalies)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Peak: {peak2.month} ({peak2.zScore > 0 ? `+${peak2.zScore}σ` : `${peak2.zScore}σ`})
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-3 h-[210px]">
              <Bar data={anomalyData2} options={barOptions} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparison 3: Diurnal Cycle & Peatland Smoldering */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IconMoon className="size-4 text-purple-400" />
            <span>Comparison 3: Diurnal Cycle & Peatland Smoldering Ratio</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Day Flaming vs Night Smoldering Proportions</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-amber-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 font-mono">
                  Input 1: {preset1.name} (Diurnal)
                </span>
                <Badge variant="outline" className="text-[10px] font-mono border-purple-500/40 text-purple-300">
                  {nightPct1}% Nocturnal Smoldering
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 h-[200px]">
              <Doughnut data={diurnalData1} options={doughnutOptions} />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-cyan-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 font-mono">
                  Input 2: {preset2.name} (Diurnal)
                </span>
                <Badge variant="outline" className="text-[10px] font-mono border-purple-500/40 text-purple-300">
                  {nightPct2}% Nocturnal Smoldering
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 h-[200px]">
              <Doughnut data={diurnalData2} options={doughnutOptions} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparison 4: Seasonal Climatology (Polar Profile) */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IconFlame className="size-4 text-amber-500" />
            <span>Comparison 4: 12-Month Climatological Seasonal Footprint</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">26-Year Historical Median Fire Seasonality</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-amber-950/10">
              <span className="text-xs font-bold text-amber-400 font-mono">
                Input 1: {preset1.name} (Season Profile)
              </span>
            </CardHeader>
            <CardContent className="p-3 h-[220px]">
              <PolarArea data={polarData1} options={polarOptions} />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-cyan-950/10">
              <span className="text-xs font-bold text-cyan-400 font-mono">
                Input 2: {preset2.name} (Season Profile)
              </span>
            </CardHeader>
            <CardContent className="p-3 h-[220px]">
              <PolarArea data={polarData2} options={polarOptions} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparison 5: 26-Year Multi-Decadal Historical Burdens */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IconCalendar className="size-4 text-emerald-500" />
            <span>Comparison 5: 26-Year Historical Annual Fire Burdens (2000–2026)</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">
            Highlighted: {year1} (Input 1) vs {year2} (Input 2)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-amber-950/10">
              <span className="text-xs font-bold text-amber-400 font-mono">
                Input 1: {preset1.name} (Highlighted: {year1})
              </span>
            </CardHeader>
            <CardContent className="p-3 h-[220px]">
              <Bar data={annualHistory1} options={barOptions} />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800/80 bg-cyan-950/10">
              <span className="text-xs font-bold text-cyan-400 font-mono">
                Input 2: {preset2.name} (Highlighted: {year2})
              </span>
            </CardHeader>
            <CardContent className="p-3 h-[220px]">
              <Bar data={annualHistory2} options={barOptions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
