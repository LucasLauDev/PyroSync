"use client";

import React, { useMemo, useState } from "react";
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
} from "chart.js";
import {
  CalendarYear,
  DailyRecord,
  MonthlyBaseline,
} from "./types";
import { MONTH_NAMES } from "./constants";
import { Badge } from "@/components/ui/badge";
import { IconChartBar } from "@tabler/icons-react";
import { AnalyticsMetricsOverview } from "./analytics/analytics-metrics-overview";
import { AnalyticsProgressionChart } from "./analytics/analytics-progression-chart";
import { AnalyticsEnergyDiurnalCharts } from "./analytics/analytics-energy-diurnal-charts";
import { AnalyticsHistoryDailyCharts } from "./analytics/analytics-history-daily-charts";

// Register Chart.js components once
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

interface FireAnalyticsProps {
  calendarData: CalendarYear[];
  dailySeries: DailyRecord[];
  monthlyBaselines: Record<string, MonthlyBaseline>;
  regionName: string;
  selectedYear: number | null;
  selectedMonth: number | null;
}

export function FireAnalytics({
  calendarData,
  dailySeries,
  monthlyBaselines,
  regionName,
  selectedYear,
  selectedMonth,
}: FireAnalyticsProps) {
  // Target year record (default to 2026 or selected)
  const targetYear = selectedYear || 2026;
  const y2026 =
    calendarData.find((y) => y.year === targetYear) ||
    calendarData[calendarData.length - 1];

  // Benchmark comparison year for progression chart (default to 2023 or 2015)
  const [comparisonYear, setComparisonYear] = useState<number>(2023);
  const yCompare = calendarData.find((y) => y.year === comparisonYear);

  // Active month data for highlight card
  const activeMonthIdx = (selectedMonth || 10) - 1;
  const activeMonthData = y2026?.months[activeMonthIdx];

  // 12-Month Progression & Anomaly Data Preparation
  const progressionData = useMemo(() => {
    let cumTarget = 0;
    let cumCompare = 0;
    let cumMedian = 0;

    return MONTH_NAMES.map((name, idx) => {
      const mNum = idx + 1;
      const mTargetVal = y2026?.months[idx]?.harmonized_count || 0;
      const mCompareVal = yCompare?.months[idx]?.harmonized_count || 0;
      const medianVal = monthlyBaselines[mNum.toString()]?.median || 0;
      const p10 = monthlyBaselines[mNum.toString()]?.p10 || 0;
      const p90 = monthlyBaselines[mNum.toString()]?.p90 || 0;

      cumTarget += mTargetVal;
      cumCompare += mCompareVal;
      cumMedian += medianVal;

      return {
        month: name,
        monthNum: mNum,
        valTarget: mTargetVal,
        valCompare: mCompareVal,
        median: medianVal,
        p10,
        p90,
        cumTarget,
        cumCompare,
        cumMedian,
        frpTarget: y2026?.months[idx]?.harmonized_frp_mw || 0,
        intensity:
          mTargetVal > 0
            ? Math.round(
                ((y2026?.months[idx]?.harmonized_frp_mw || 0) / mTargetVal) * 10
              ) / 10
            : 0,
        robustZ: y2026?.months[idx]?.robust_z_score || 0,
        relAnomaly: y2026?.months[idx]?.relative_anomaly_pct || 0,
        anomalyStatus: y2026?.months[idx]?.anomaly_status || "Normal Baseline",
      };
    });
  }, [y2026, yCompare, monthlyBaselines]);

  // Totals for Top KPI Summary Cards
  const totalFiresTarget = y2026?.annual_total_harmonized || 0;
  const totalFRPTarget =
    y2026?.months.reduce((acc, m) => acc + m.harmonized_frp_mw, 0) || 0;

  // Diurnal Day vs Night Calculations
  const totalDayFires = dailySeries.reduce((acc, d) => acc + d.day_fires, 0);
  const totalNightFires = dailySeries.reduce((acc, d) => acc + d.night_fires, 0);
  const effectiveDayFires =
    totalDayFires > 0 ? totalDayFires : Math.round(totalFiresTarget * 0.69);
  const effectiveNightFires =
    totalNightFires > 0 ? totalNightFires : Math.round(totalFiresTarget * 0.31);
  const totalDiurnalFires = effectiveDayFires + effectiveNightFires;
  const dayPercent = Math.round((effectiveDayFires / totalDiurnalFires) * 100);
  const nightPercent = 100 - dayPercent;

  // 26-Year Historical Annual Burdens
  const annualTotals = calendarData.map((y) => y.annual_total_harmonized);
  const sortedAnnual = [...annualTotals].sort((a, b) => a - b);
  const medianAnnual = sortedAnnual[Math.floor(sortedAnnual.length / 2)] || 1;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. TOP KEY NUMERICAL INDICATORS & KPI STRIP */}
      <AnalyticsMetricsOverview
        targetYear={targetYear}
        totalFiresTarget={totalFiresTarget}
        totalFRPTarget={totalFRPTarget}
        activeMonthIdx={activeMonthIdx}
        activeMonthData={activeMonthData}
        progressionData={progressionData}
        effectiveDayFires={effectiveDayFires}
        effectiveNightFires={effectiveNightFires}
        nightPercent={nightPercent}
      />

      {/* 2. ALL CHARTS DASHBOARD */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <IconChartBar className="size-5 text-amber-500" />
              <span>Harmonized Multi-Chart Analytics & Visualizations</span>
            </h2>
            <p className="text-xs text-slate-400">
              All specialized analytical charts rendered simultaneously via Chart.js for
              comprehensive fire climatology exploration in <strong>{regionName}</strong>.
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-xs border-amber-500/40 text-amber-400 bg-amber-500/10 font-mono"
          >
            Chart.js v4 Powered
          </Badge>
        </div>

        {/* 2-Column Responsive Grid of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AnalyticsProgressionChart
            targetYear={targetYear}
            comparisonYear={comparisonYear}
            setComparisonYear={setComparisonYear}
            progressionData={progressionData}
          />

          <AnalyticsEnergyDiurnalCharts
            progressionData={progressionData}
            effectiveDayFires={effectiveDayFires}
            effectiveNightFires={effectiveNightFires}
            totalDiurnalFires={totalDiurnalFires}
            dayPercent={dayPercent}
            nightPercent={nightPercent}
          />

          <AnalyticsHistoryDailyCharts
            calendarData={calendarData}
            targetYear={targetYear}
            totalFiresTarget={totalFiresTarget}
            annualTotals={annualTotals}
            medianAnnual={medianAnnual}
            dailySeries={dailySeries}
          />
        </div>
      </div>
    </div>
  );
}
