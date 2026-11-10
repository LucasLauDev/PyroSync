"use client";

import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconCalendar, IconWaveSine } from "@tabler/icons-react";
import { CalendarYear, DailyRecord } from "../types";
import {
  darkTooltipOptions,
  darkGridOptions,
  darkTickOptions,
} from "./analytics-chart-theme";

interface AnalyticsHistoryDailyChartsProps {
  calendarData: CalendarYear[];
  targetYear: number;
  totalFiresTarget: number;
  annualTotals: number[];
  medianAnnual: number;
  dailySeries: DailyRecord[];
}

export function AnalyticsHistoryDailyCharts({
  calendarData,
  targetYear,
  totalFiresTarget,
  annualTotals,
  medianAnnual,
  dailySeries,
}: AnalyticsHistoryDailyChartsProps) {
  // Chart 6: 26-Year Historical Annual Burdens (2000–2026) (Bar Chart)
  const timelineChartData = useMemo(() => {
    return {
      labels: calendarData.map((y) => y.year.toString()),
      datasets: [
        {
          label: "Annual Harmonized Detections",
          data: calendarData.map((y) => y.annual_total_harmonized),
          backgroundColor: calendarData.map((y) => {
            if (y.year === targetYear) return "#f43f5e";
            if (y.annual_total_harmonized === Math.max(...annualTotals)) return "#eab308";
            return "#475569";
          }),
          hoverBackgroundColor: "#fb923c",
          borderRadius: 3,
        },
      ],
    };
  }, [calendarData, targetYear, annualTotals]);

  const timelineChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...darkTooltipOptions,
        callbacks: {
          label: (context) => {
            const val = Number(context.raw);
            const pctOfMedian = Math.round((val / medianAnnual) * 100);
            return ` Total: ${val.toLocaleString()} (${pctOfMedian}% of 26-yr median)`;
          },
        },
      },
    },
    scales: {
      x: { grid: darkGridOptions, ticks: { ...darkTickOptions, maxRotation: 45 } },
      y: {
        grid: darkGridOptions,
        ticks: {
          ...darkTickOptions,
          callback: (value) => {
            const num = Number(value);
            return num >= 1_000_000
              ? `${(num / 1_000_000).toFixed(1)}M`
              : num >= 1_000
              ? `${(num / 1_000).toFixed(0)}k`
              : num;
          },
        },
      },
    },
  };

  // Chart 7: 2026 Daily NRT Observations (Bar Chart)
  const dailySeriesChartData = useMemo(() => {
    return {
      labels: dailySeries.map((d) => d.date.slice(5)),
      datasets: [
        {
          label: "Daily Harmonized Fires",
          data: dailySeries.map((d) => d.harmonized_count),
          backgroundColor: dailySeries.map((d) => {
            const isPostNPP = d.date >= "2026-11-03" || d.viirs_npp_count === 0;
            return isPostNPP ? "#06b6d4" : "#f97316";
          }),
          borderRadius: 2,
        },
      ],
    };
  }, [dailySeries]);

  const dailySeriesChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...darkTooltipOptions,
        callbacks: {
          title: (items) => {
            const idx = items[0]?.dataIndex;
            return idx !== undefined && dailySeries[idx] ? dailySeries[idx].date : "";
          },
          label: (context) => {
            const idx = context.dataIndex;
            const rec = dailySeries[idx];
            if (!rec) return "";
            const isPostNPP = rec.date >= "2026-11-03" || rec.viirs_npp_count === 0;
            return [
              ` Harmonized: ${rec.harmonized_count.toLocaleString()} fires`,
              ` FRP: ${rec.harmonized_frp_mw.toLocaleString()} MW`,
              ` Satellites: ${
                isPostNPP ? "NOAA-20 & NOAA-21 (Post-NPP)" : "MODIS + Suomi-NPP + JPSS"
              }`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { ...darkTickOptions, maxRotation: 90, autoSkip: true, maxTicksLimit: 25 },
      },
      y: {
        grid: darkGridOptions,
        ticks: {
          ...darkTickOptions,
          callback: (value) => {
            const num = Number(value);
            return num >= 1_000 ? `${(num / 1_000).toFixed(0)}k` : num;
          },
        },
      },
    },
  };

  const peakYear = calendarData.reduce((max, y) =>
    y.annual_total_harmonized > max.annual_total_harmonized ? y : max
  ).year;

  return (
    <>
      {/* Chart 6: 26-Year Historical Annual Burdens (2000–2026) (Bar) */}
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl flex flex-col">
        <CardHeader className="p-4 pb-2 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <IconCalendar className="size-4 text-emerald-400" />
                <span>26-Year Annual Fire Burdens (2000–2026)</span>
              </CardTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Interannual variability benchmarked against the 26-year median baseline
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
            >
              26-Year Time Series
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
          <div className="h-64 sm:h-72 w-full">
            <Bar data={timelineChartData} options={timelineChartOptions} />
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>
              Multi-Year Median:{" "}
              <strong className="text-slate-300">{medianAnnual.toLocaleString()}</strong>
            </span>
            <span>
              Peak Year: <strong className="text-amber-400">{peakYear}</strong>
            </span>
            <span>
              Current ({targetYear}):{" "}
              <strong className="text-rose-400">{totalFiresTarget.toLocaleString()}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Chart 7: 2026 Daily NRT Fire Activity Series (Full Width) */}
      <Card className="lg:col-span-2 bg-slate-900/80 border-slate-800 shadow-xl flex flex-col">
        <CardHeader className="p-4 pb-2 border-b border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <IconWaveSine className="size-4 text-amber-500" />
                <span>61-Day Operational Daily Fire Activity (Sept 10, 2026 – Nov 9, 2026)</span>
              </CardTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                High-resolution NRT detections with DOY 306 (Nov 2) Suomi-NPP cessation distinction and
                NOAA-20/21 continuity handover
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] border-orange-500/40 text-orange-400 bg-orange-500/10"
              >
                Warm: Suomi-NPP Active
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] border-cyan-500/40 text-cyan-400 bg-cyan-500/10"
              >
                Cyan: NOAA-20/21 Post-NPP
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
          {dailySeries.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 font-mono text-xs">
              No daily records for this region
            </div>
          ) : (
            <div className="h-64 sm:h-72 w-full">
              <Bar data={dailySeriesChartData} options={dailySeriesChartOptions} />
            </div>
          )}
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400 font-mono">
            <span>
              Period Detections:{" "}
              <strong className="text-white">
                {dailySeries.reduce((acc, d) => acc + d.harmonized_count, 0).toLocaleString()} fires
              </strong>
            </span>
            <span>
              Operational Transition Date:{" "}
              <strong className="text-cyan-400">November 2, 2026 (DOY 306)</strong>
            </span>
            <span>
              Total Series Window: <strong className="text-slate-300">61 consecutive days</strong>
            </span>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
