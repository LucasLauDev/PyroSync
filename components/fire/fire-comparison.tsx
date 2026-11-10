"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { RegionalCalendarData, CalendarYear, CalendarMonth } from "./types";
import { REGION_PRESETS, MONTH_NAMES } from "./constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconFlame,
  IconCalendar,
  IconScale,
  IconWorld,
  IconChartBar,
  IconSun,
  IconMoon,
  IconTrendingUp,
  IconArrowsDiff,
  IconActivity,
  IconBolt,
  IconFilter,
  IconLayersSubtract,
  IconInfoCircle,
  IconCheck,
} from "@tabler/icons-react";

// Register Chart.js components
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

interface FireComparisonProps {
  primaryRegion: string;
  primaryCalendarData: RegionalCalendarData | null;
  onSelectPrimaryRegion?: (region: string) => void;
}

const AVAILABLE_YEARS = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017,
  2016, 2015, 2014, 2013, 2012, 2011, 2010, 2005, 2000,
];

// Helper to calculate filtered metric value for a month
function getMonthlyMetricValue(
  m: CalendarMonth,
  sensor: string,
  metric: string,
  daynight: string,
  nightRatio: number
): number {
  let val = 0;
  if (metric === "hex_days") {
    val = m.active_fire_hex_days || 0;
  } else if (metric === "frp_mw") {
    val = m.harmonized_frp_mw || 0;
  } else {
    if (sensor === "MODIS") {
      val = m.modis_count || 0;
    } else if (sensor === "VIIRS") {
      val = m.viirs_count || 0;
    } else {
      val = m.harmonized_count || 0;
    }
  }

  if (daynight === "D") {
    val = Math.round(val * Math.max(1 - nightRatio, 0.05));
  } else if (daynight === "N") {
    val = Math.round(val * Math.max(nightRatio, 0.05));
  }

  return val;
}

export function FireComparison({
  primaryRegion,
  primaryCalendarData,
  onSelectPrimaryRegion,
}: FireComparisonProps) {
  // -----------------------------------------------------------------
  // Input 1 Configuration States (Interactive inside the tab)
  // -----------------------------------------------------------------
  const [region1, setRegion1] = useState<string>(primaryRegion);
  const [year1, setYear1] = useState<number>(2026);
  const [daynight1, setDaynight1] = useState<"all" | "D" | "N">("all");
  const [sensor1, setSensor1] = useState<"all" | "MODIS" | "VIIRS">("all");
  const [metric1, setMetric1] = useState<"harmonized_count" | "hex_days" | "frp_mw">("harmonized_count");

  // -----------------------------------------------------------------
  // Input 2 Configuration States
  // -----------------------------------------------------------------
  const defaultSecondRegion = useMemo(() => {
    if (primaryRegion === "South_America") return "SouthEast_Asia";
    if (primaryRegion === "SouthEast_Asia") return "South_America";
    return "SouthEast_Asia";
  }, [primaryRegion]);

  const [region2, setRegion2] = useState<string>(defaultSecondRegion);
  const [year2, setYear2] = useState<number>(2026);
  const [daynight2, setDaynight2] = useState<"all" | "D" | "N">("all");
  const [sensor2, setSensor2] = useState<"all" | "MODIS" | "VIIRS">("all");
  const [metric2, setMetric2] = useState<"harmonized_count" | "hex_days" | "frp_mw">("harmonized_count");

  // Regional data state & cache
  const [data1, setData1] = useState<RegionalCalendarData | null>(primaryCalendarData);
  const [data2, setData2] = useState<RegionalCalendarData | null>(null);
  const [cache, setCache] = useState<Record<string, RegionalCalendarData>>({});
  const [isLoading1, setIsLoading1] = useState<boolean>(false);
  const [isLoading2, setIsLoading2] = useState<boolean>(false);

  // Sync with primaryRegion prop when parent changes
  useEffect(() => {
    if (primaryRegion && primaryRegion !== region1) {
      setRegion1(primaryRegion);
    }
  }, [primaryRegion]);

  // Seed cache with initial primaryCalendarData
  useEffect(() => {
    if (primaryCalendarData && primaryCalendarData.region) {
      setCache((prev) => ({ ...prev, [primaryCalendarData.region]: primaryCalendarData }));
    }
  }, [primaryCalendarData]);

  // Load Region 1 data when region1 changes
  useEffect(() => {
    if (!region1) return;

    if (cache[region1]) {
      setData1(cache[region1]);
      return;
    }

    if (primaryCalendarData && primaryCalendarData.region === region1) {
      setData1(primaryCalendarData);
      setCache((prev) => ({ ...prev, [region1]: primaryCalendarData }));
      return;
    }

    let isMounted = true;
    setIsLoading1(true);

    fetch(`/api/calendar?region=${encodeURIComponent(region1)}&mode=overlap_scaled`)
      .then((res) => res.json())
      .then((data: RegionalCalendarData) => {
        if (!isMounted) return;
        setData1(data);
        setCache((prev) => ({ ...prev, [region1]: data }));
        setIsLoading1(false);
      })
      .catch((err) => {
        console.error("Failed to load region1 data:", err);
        if (isMounted) setIsLoading1(false);
      });

    return () => {
      isMounted = false;
    };
  }, [region1, cache, primaryCalendarData]);

  // Load Region 2 data when region2 changes
  useEffect(() => {
    if (!region2) return;

    if (cache[region2]) {
      setData2(cache[region2]);
      return;
    }

    let isMounted = true;
    setIsLoading2(true);

    fetch(`/api/calendar?region=${encodeURIComponent(region2)}&mode=overlap_scaled`)
      .then((res) => res.json())
      .then((data: RegionalCalendarData) => {
        if (!isMounted) return;
        setData2(data);
        setCache((prev) => ({ ...prev, [region2]: data }));
        setIsLoading2(false);
      })
      .catch((err) => {
        console.error("Failed to load region2 data:", err);
        if (isMounted) setIsLoading2(false);
      });

    return () => {
      isMounted = false;
    };
  }, [region2, cache]);

  // Metadata presets
  const preset1 = REGION_PRESETS.find((r) => r.id === region1) || REGION_PRESETS[0];
  const preset2 = REGION_PRESETS.find((r) => r.id === region2) || REGION_PRESETS[1];

  // Daily series and diurnal calculation for Input 1
  const daily1 = data1?.daily_series_2026 || [];
  const dayFires1 = daily1.reduce((sum, d) => sum + (d.day_fires || 0), 0);
  const nightFires1 = daily1.reduce((sum, d) => sum + (d.night_fires || 0), 0);
  const totalDiurnal1 = Math.max(dayFires1 + nightFires1, 1);
  const nightRatio1 = nightFires1 / totalDiurnal1;
  const nightPct1 = Math.round(nightRatio1 * 100);

  // Daily series and diurnal calculation for Input 2
  const daily2 = data2?.daily_series_2026 || [];
  const dayFires2 = daily2.reduce((sum, d) => sum + (d.day_fires || 0), 0);
  const nightFires2 = daily2.reduce((sum, d) => sum + (d.night_fires || 0), 0);
  const totalDiurnal2 = Math.max(dayFires2 + nightFires2, 1);
  const nightRatio2 = nightFires2 / totalDiurnal2;
  const nightPct2 = Math.round(nightRatio2 * 100);

  // Year Records
  const yData1 = data1?.calendar.find((y) => y.year === year1);
  const yData2 = data2?.calendar.find((y) => y.year === year2);

  // Total burden
  const totalBurden1 = useMemo(() => {
    if (!yData1) return 0;
    return yData1.months.reduce((acc, m) => {
      return acc + getMonthlyMetricValue(m, sensor1, metric1, daynight1, nightRatio1);
    }, 0);
  }, [yData1, sensor1, metric1, daynight1, nightRatio1]);

  const totalBurden2 = useMemo(() => {
    if (!yData2) return 0;
    return yData2.months.reduce((acc, m) => {
      return acc + getMonthlyMetricValue(m, sensor2, metric2, daynight2, nightRatio2);
    }, 0);
  }, [yData2, sensor2, metric2, daynight2, nightRatio2]);

  // Total FRP Energy
  const totalFrp1 = useMemo(() => {
    if (!yData1) return 0;
    return yData1.months.reduce((acc, m) => {
      let f = m.harmonized_frp_mw || 0;
      if (daynight1 === "D") f *= Math.max(1 - nightRatio1, 0.05);
      if (daynight1 === "N") f *= Math.max(nightRatio1, 0.05);
      return acc + f;
    }, 0);
  }, [yData1, daynight1, nightRatio1]);

  const totalFrp2 = useMemo(() => {
    if (!yData2) return 0;
    return yData2.months.reduce((acc, m) => {
      let f = m.harmonized_frp_mw || 0;
      if (daynight2 === "D") f *= Math.max(1 - nightRatio2, 0.05);
      if (daynight2 === "N") f *= Math.max(nightRatio2, 0.05);
      return acc + f;
    }, 0);
  }, [yData2, daynight2, nightRatio2]);

  // Mean FRP per fire
  const meanFrp1 = totalBurden1 > 0 ? (totalFrp1 / totalBurden1).toFixed(1) : "0.0";
  const meanFrp2 = totalBurden2 > 0 ? (totalFrp2 / totalBurden2).toFixed(1) : "0.0";

  // Total Hex-Days
  const totalHex1 = useMemo(() => {
    if (!yData1) return 0;
    return yData1.months.reduce((acc, m) => acc + (m.active_fire_hex_days || 0), 0);
  }, [yData1]);

  const totalHex2 = useMemo(() => {
    if (!yData2) return 0;
    return yData2.months.reduce((acc, m) => acc + (m.active_fire_hex_days || 0), 0);
  }, [yData2]);

  // Season duration
  const seasonDuration1 = yData1?.season_timing?.duration_months || 0;
  const seasonDuration2 = yData2?.season_timing?.duration_months || 0;

  // Peak months
  const peak1 = useMemo(() => {
    if (!yData1) return { month: "Oct", count: 0, zScore: 0 };
    let max = -1;
    let pk = yData1.months[0];
    yData1.months.forEach((m) => {
      const v = getMonthlyMetricValue(m, sensor1, metric1, daynight1, nightRatio1);
      if (v > max) {
        max = v;
        pk = m;
      }
    });
    return {
      month: MONTH_NAMES[pk.month - 1] || "Oct",
      count: max,
      zScore: pk.robust_z_score,
    };
  }, [yData1, sensor1, metric1, daynight1, nightRatio1]);

  const peak2 = useMemo(() => {
    if (!yData2) return { month: "Aug", count: 0, zScore: 0 };
    let max = -1;
    let pk = yData2.months[0];
    yData2.months.forEach((m) => {
      const v = getMonthlyMetricValue(m, sensor2, metric2, daynight2, nightRatio2);
      if (v > max) {
        max = v;
        pk = m;
      }
    });
    return {
      month: MONTH_NAMES[pk.month - 1] || "Aug",
      count: max,
      zScore: pk.robust_z_score,
    };
  }, [yData2, sensor2, metric2, daynight2, nightRatio2]);

  // Disparity difference
  const diffPct = useMemo(() => {
    if (totalBurden1 === 0 && totalBurden2 === 0) return 0;
    if (totalBurden2 === 0) return 100;
    return Math.round(((totalBurden1 - totalBurden2) / totalBurden2) * 100);
  }, [totalBurden1, totalBurden2]);

  // -----------------------------------------------------------------
  // ALL METRICS DIFFERENTIALS CALCULATION
  // -----------------------------------------------------------------
  const metricsDifferences = useMemo(() => {
    // 1. Total Burden
    const dBurden = totalBurden1 - totalBurden2;
    const pBurden =
      totalBurden2 > 0
        ? Math.round((dBurden / totalBurden2) * 100)
        : totalBurden1 > 0
        ? 100
        : 0;

    // 2. Total FRP
    const dFrp = totalFrp1 - totalFrp2;
    const pFrp =
      totalFrp2 > 0
        ? Math.round((dFrp / totalFrp2) * 100)
        : totalFrp1 > 0
        ? 100
        : 0;

    // 3. Mean FRP
    const mFrp1 = parseFloat(meanFrp1);
    const mFrp2 = parseFloat(meanFrp2);
    const dMeanFrp = (mFrp1 - mFrp2).toFixed(1);
    const pMeanFrp = mFrp2 > 0 ? Math.round(((mFrp1 - mFrp2) / mFrp2) * 100) : 0;

    // 4. Hex-Days
    const dHex = totalHex1 - totalHex2;
    const pHex =
      totalHex2 > 0
        ? Math.round((dHex / totalHex2) * 100)
        : totalHex1 > 0
        ? 100
        : 0;

    // 5. Nocturnal Smoldering
    const dNightPct = (nightPct1 - nightPct2).toFixed(1);

    // 6. Peak Month
    const mIdx1 = MONTH_NAMES.indexOf(peak1.month);
    const mIdx2 = MONTH_NAMES.indexOf(peak2.month);
    const monthOffset = mIdx1 >= 0 && mIdx2 >= 0 ? Math.abs(mIdx1 - mIdx2) : 0;

    // 7. Peak Robust Z-Score
    const dZScore = (peak1.zScore - peak2.zScore).toFixed(2);

    // 8. Season Duration
    const dDuration = seasonDuration1 - seasonDuration2;

    // 9. Continuity Multiplier
    const dContinuity = (preset1.continuityFactor - preset2.continuityFactor).toFixed(1);

    return [
      {
        id: "burden",
        title: "Total Fire Burden",
        category: "Fire Volume",
        icon: IconFlame,
        val1: totalBurden1.toLocaleString(),
        val2: totalBurden2.toLocaleString(),
        diffAbs: dBurden > 0 ? `+${dBurden.toLocaleString()}` : dBurden.toLocaleString(),
        diffPct: pBurden > 0 ? `+${pBurden}%` : `${pBurden}%`,
        winner: dBurden > 0 ? "input1" : dBurden < 0 ? "input2" : "tie",
        insight:
          dBurden > 0
            ? `Input 1 has +${Math.abs(pBurden)}% higher total fire volume`
            : dBurden < 0
            ? `Input 2 has +${Math.abs(pBurden)}% higher total fire volume`
            : "Identical fire activity volume",
      },
      {
        id: "frp",
        title: "Total Radiative Energy (FRP)",
        category: "Thermal Energy",
        icon: IconBolt,
        val1: `${Math.round(totalFrp1).toLocaleString()} MW`,
        val2: `${Math.round(totalFrp2).toLocaleString()} MW`,
        diffAbs: `${dFrp > 0 ? `+${Math.round(dFrp).toLocaleString()}` : Math.round(dFrp).toLocaleString()} MW`,
        diffPct: pFrp > 0 ? `+${pFrp}%` : `${pFrp}%`,
        winner: dFrp > 0 ? "input1" : dFrp < 0 ? "input2" : "tie",
        insight:
          dFrp > 0
            ? "Input 1 released more cumulative thermal radiative energy"
            : "Input 2 released more cumulative thermal radiative energy",
      },
      {
        id: "mean_frp",
        title: "Mean Fire Radiative Intensity",
        category: "Severity",
        icon: IconActivity,
        val1: `${meanFrp1} MW`,
        val2: `${meanFrp2} MW`,
        diffAbs: `${parseFloat(dMeanFrp) > 0 ? `+${dMeanFrp}` : dMeanFrp} MW`,
        diffPct: pMeanFrp > 0 ? `+${pMeanFrp}%` : `${pMeanFrp}%`,
        winner: parseFloat(dMeanFrp) > 0 ? "input1" : parseFloat(dMeanFrp) < 0 ? "input2" : "tie",
        insight:
          parseFloat(dMeanFrp) > 0
            ? "Input 1 exhibits higher radiative severity per active detection"
            : "Input 2 exhibits higher radiative severity per active detection",
      },
      {
        id: "hex_days",
        title: "Active Fire Hex-Days (Res-7)",
        category: "Spatial Footprint",
        icon: IconChartBar,
        val1: totalHex1.toLocaleString(),
        val2: totalHex2.toLocaleString(),
        diffAbs: dHex > 0 ? `+${dHex.toLocaleString()}` : dHex.toLocaleString(),
        diffPct: pHex > 0 ? `+${pHex}%` : `${pHex}%`,
        winner: dHex > 0 ? "input1" : dHex < 0 ? "input2" : "tie",
        insight:
          dHex > 0
            ? "Input 1 burned across a broader spatial extent"
            : "Input 2 burned across a broader spatial extent",
      },
      {
        id: "smoldering",
        title: "Nocturnal Smoldering Ratio",
        category: "Diurnal Behavior",
        icon: IconMoon,
        val1: `${nightPct1}% nocturnal`,
        val2: `${nightPct2}% nocturnal`,
        diffAbs: `${parseFloat(dNightPct) > 0 ? `+${dNightPct}` : dNightPct}% pts`,
        diffPct: "Percentage pts",
        winner: parseFloat(dNightPct) > 0 ? "input1" : parseFloat(dNightPct) < 0 ? "input2" : "tie",
        insight:
          parseFloat(dNightPct) > 0
            ? "Input 1 shows elevated nocturnal smoldering (tropical peatland hazard)"
            : "Input 2 shows elevated nocturnal smoldering",
      },
      {
        id: "peak_month",
        title: "Peak Fire Season Month",
        category: "Season Timing",
        icon: IconCalendar,
        val1: `${peak1.month} (${peak1.count.toLocaleString()})`,
        val2: `${peak2.month} (${peak2.count.toLocaleString()})`,
        diffAbs: monthOffset === 0 ? "Synchronized" : `${monthOffset} mo offset`,
        diffPct: monthOffset === 0 ? "Same Month" : "Asynchronous",
        winner: "neutral",
        insight:
          monthOffset === 0
            ? `Both regions peaked in ${peak1.month}`
            : `Seasonal offset of ${monthOffset} months (${peak1.month} vs ${peak2.month})`,
      },
      {
        id: "anomaly",
        title: "Peak Monthly Robust Z-Score",
        category: "Climatology",
        icon: IconTrendingUp,
        val1: `${peak1.zScore > 0 ? `+${peak1.zScore}` : peak1.zScore}σ`,
        val2: `${peak2.zScore > 0 ? `+${peak2.zScore}` : peak2.zScore}σ`,
        diffAbs: `${parseFloat(dZScore) > 0 ? `+${dZScore}` : dZScore}σ`,
        diffPct: "Z-score delta",
        winner: parseFloat(dZScore) > 0 ? "input1" : parseFloat(dZScore) < 0 ? "input2" : "tie",
        insight:
          parseFloat(dZScore) > 0
            ? "Input 1 experienced a more extreme statistical surge relative to baseline"
            : "Input 2 experienced a more extreme statistical surge relative to baseline",
      },
      {
        id: "duration",
        title: "Active Fire Season Duration",
        category: "Seasonality",
        icon: IconCalendar,
        val1: `${seasonDuration1} months`,
        val2: `${seasonDuration2} months`,
        diffAbs: `${dDuration > 0 ? `+${dDuration}` : dDuration} mo`,
        diffPct: "Duration delta",
        winner: dDuration > 0 ? "input1" : dDuration < 0 ? "input2" : "tie",
        insight:
          dDuration > 0
            ? `Input 1 active burning window lasted ${dDuration} months longer`
            : dDuration < 0
            ? `Input 2 active burning window lasted ${Math.abs(dDuration)} months longer`
            : "Equal seasonal burn window",
      },
      {
        id: "continuity",
        title: "Continuity Multiplier",
        category: "Sensor Calibration",
        icon: IconScale,
        val1: `×${preset1.continuityFactor}`,
        val2: `×${preset2.continuityFactor}`,
        diffAbs: `${parseFloat(dContinuity) > 0 ? `+${dContinuity}` : dContinuity}×`,
        diffPct: "Scaling delta",
        winner: "neutral",
        insight: "Regional MODIS-to-VIIRS sensor footprint scaling factor",
      },
    ];
  }, [
    totalBurden1,
    totalBurden2,
    totalFrp1,
    totalFrp2,
    meanFrp1,
    meanFrp2,
    totalHex1,
    totalHex2,
    nightPct1,
    nightPct2,
    peak1,
    peak2,
    seasonDuration1,
    seasonDuration2,
    preset1,
    preset2,
  ]);

  // -----------------------------------------------------------------
  // 1. Cumulative Curves Data
  // -----------------------------------------------------------------
  const cumulativeData1 = useMemo(() => {
    let running = 0;
    const curve = (yData1?.months || []).map((m) => {
      running += getMonthlyMetricValue(m, sensor1, metric1, daynight1, nightRatio1);
      return running;
    });

    let baseRunning = 0;
    const baseCurve = MONTH_NAMES.map((_, idx) => {
      const b = data1?.monthly_baselines[String(idx + 1)];
      let baseVal = b?.median || 0;
      if (daynight1 === "D") baseVal *= (1 - nightRatio1);
      if (daynight1 === "N") baseVal *= nightRatio1;
      baseRunning += Math.round(baseVal);
      return baseRunning;
    });

    return {
      labels: MONTH_NAMES,
      datasets: [
        {
          label: `${preset1.name} (${year1})`,
          data: curve,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          fill: true,
          tension: 0.3,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: "#f59e0b",
        },
        {
          label: `${preset1.name} 26-Yr Median`,
          data: baseCurve,
          borderColor: "rgba(148, 163, 184, 0.6)",
          borderDash: [5, 5],
          tension: 0.3,
          borderWidth: 1.5,
          pointRadius: 0,
        },
      ],
    };
  }, [yData1, data1, preset1.name, year1, sensor1, metric1, daynight1, nightRatio1]);

  const cumulativeData2 = useMemo(() => {
    let running = 0;
    const curve = (yData2?.months || []).map((m) => {
      running += getMonthlyMetricValue(m, sensor2, metric2, daynight2, nightRatio2);
      return running;
    });

    let baseRunning = 0;
    const baseCurve = MONTH_NAMES.map((_, idx) => {
      const b = data2?.monthly_baselines[String(idx + 1)];
      let baseVal = b?.median || 0;
      if (daynight2 === "D") baseVal *= (1 - nightRatio2);
      if (daynight2 === "N") baseVal *= nightRatio2;
      baseRunning += Math.round(baseVal);
      return baseRunning;
    });

    return {
      labels: MONTH_NAMES,
      datasets: [
        {
          label: `${preset2.name} (${year2})`,
          data: curve,
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.15)",
          fill: true,
          tension: 0.3,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: "#06b6d4",
        },
        {
          label: `${preset2.name} 26-Yr Median`,
          data: baseCurve,
          borderColor: "rgba(148, 163, 184, 0.6)",
          borderDash: [5, 5],
          tension: 0.3,
          borderWidth: 1.5,
          pointRadius: 0,
        },
      ],
    };
  }, [yData2, data2, preset2.name, year2, sensor2, metric2, daynight2, nightRatio2]);

  // -----------------------------------------------------------------
  // 2. Monthly Robust Z-Score Anomalies Data
  // -----------------------------------------------------------------
  const anomalyData1 = useMemo(() => {
    const months = yData1?.months || [];
    const scores = months.map((m) => Number(m.robust_z_score.toFixed(2)));
    const colors = scores.map((s) =>
      s >= 2.0
        ? "#ef4444"
        : s >= 1.0
        ? "#f59e0b"
        : s <= -1.0
        ? "#3b82f6"
        : "#10b981"
    );

    return {
      labels: MONTH_NAMES.map((m) => m.slice(0, 3)),
      datasets: [
        {
          label: "Robust Z-Score",
          data: scores,
          backgroundColor: colors,
          borderRadius: 4,
        },
      ],
    };
  }, [yData1]);

  const anomalyData2 = useMemo(() => {
    const months = yData2?.months || [];
    const scores = months.map((m) => Number(m.robust_z_score.toFixed(2)));
    const colors = scores.map((s) =>
      s >= 2.0
        ? "#ef4444"
        : s >= 1.0
        ? "#f59e0b"
        : s <= -1.0
        ? "#3b82f6"
        : "#10b981"
    );

    return {
      labels: MONTH_NAMES.map((m) => m.slice(0, 3)),
      datasets: [
        {
          label: "Robust Z-Score",
          data: scores,
          backgroundColor: colors,
          borderRadius: 4,
        },
      ],
    };
  }, [yData2]);

  // -----------------------------------------------------------------
  // 3. Diurnal Cycle Data
  // -----------------------------------------------------------------
  const diurnalData1 = useMemo(() => {
    return {
      labels: ["Day Flaming (D)", "Night Smoldering (N)"],
      datasets: [
        {
          data: [dayFires1, nightFires1],
          backgroundColor: [
            daynight1 === "N" ? "rgba(245, 158, 11, 0.2)" : "#f59e0b",
            daynight1 === "D" ? "rgba(139, 92, 246, 0.2)" : "#8b5cf6",
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [dayFires1, nightFires1, daynight1]);

  const diurnalData2 = useMemo(() => {
    return {
      labels: ["Day Flaming (D)", "Night Smoldering (N)"],
      datasets: [
        {
          data: [dayFires2, nightFires2],
          backgroundColor: [
            daynight2 === "N" ? "rgba(6, 182, 212, 0.2)" : "#06b6d4",
            daynight2 === "D" ? "rgba(168, 85, 247, 0.2)" : "#a855f7",
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [dayFires2, nightFires2, daynight2]);

  // -----------------------------------------------------------------
  // 4. Seasonal Climatology (Polar Area)
  // -----------------------------------------------------------------
  const polarData1 = useMemo(() => {
    const values = MONTH_NAMES.map((_, idx) => {
      const b = data1?.monthly_baselines[String(idx + 1)];
      let v = Math.round(b?.median || 0);
      if (daynight1 === "D") v = Math.round(v * (1 - nightRatio1));
      if (daynight1 === "N") v = Math.round(v * nightRatio1);
      return v;
    });
    return {
      labels: MONTH_NAMES.map((m) => m.slice(0, 3)),
      datasets: [
        {
          label: `${preset1.name} Climatology`,
          data: values,
          backgroundColor: "rgba(245, 158, 11, 0.45)",
          borderColor: "#f59e0b",
          borderWidth: 1.5,
        },
      ],
    };
  }, [data1, preset1.name, daynight1, nightRatio1]);

  const polarData2 = useMemo(() => {
    const values = MONTH_NAMES.map((_, idx) => {
      const b = data2?.monthly_baselines[String(idx + 1)];
      let v = Math.round(b?.median || 0);
      if (daynight2 === "D") v = Math.round(v * (1 - nightRatio2));
      if (daynight2 === "N") v = Math.round(v * nightRatio2);
      return v;
    });
    return {
      labels: MONTH_NAMES.map((m) => m.slice(0, 3)),
      datasets: [
        {
          label: `${preset2.name} Climatology`,
          data: values,
          backgroundColor: "rgba(6, 182, 212, 0.45)",
          borderColor: "#06b6d4",
          borderWidth: 1.5,
        },
      ],
    };
  }, [data2, preset2.name, daynight2, nightRatio2]);

  // -----------------------------------------------------------------
  // 5. 26-Year Historical Annual Burdens (2000–2026)
  // -----------------------------------------------------------------
  const annualHistory1 = useMemo(() => {
    const years = data1?.calendar || [];
    return {
      labels: years.map((y) => String(y.year)),
      datasets: [
        {
          label: "Annual Detections",
          data: years.map((y) => y.annual_total_harmonized),
          backgroundColor: years.map((y) =>
            y.year === year1 ? "#f59e0b" : "rgba(245, 158, 11, 0.35)"
          ),
          borderRadius: 3,
        },
      ],
    };
  }, [data1, year1]);

  const annualHistory2 = useMemo(() => {
    const years = data2?.calendar || [];
    return {
      labels: years.map((y) => String(y.year)),
      datasets: [
        {
          label: "Annual Detections",
          data: years.map((y) => y.annual_total_harmonized),
          backgroundColor: years.map((y) =>
            y.year === year2 ? "#06b6d4" : "rgba(6, 182, 212, 0.35)"
          ),
          borderRadius: 3,
        },
      ],
    };
  }, [data2, year2]);

  // Chart options helpers
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Comparison Configuration Card: Inputs 1 & 2 */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <IconScale className="size-5 text-cyan-400" />
              Dual-Region Comparative Analysis Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select and customize filters for both Input 1 and Input 2 independently (region, year, diurnal phase, sensor, and metric).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-500/10 font-mono text-[10px]">
              Input 1: {preset1.name} ({year1})
            </Badge>
            <span className="text-slate-500 font-bold">vs</span>
            <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 bg-cyan-500/10 font-mono text-[10px]">
              Input 2: {preset2.name} ({year2})
            </Badge>
          </div>
        </div>

        {/* The Two Independent Input Control Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ======================================================== */}
          {/* INPUT 1 CONFIGURATION PANEL (Amber Theme) */}
          {/* ======================================================== */}
          <div className="p-4 rounded-xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-slate-950/80 space-y-3 relative shadow-lg shadow-amber-950/20">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400/50" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400">
                  Input 1 Parameters
                </span>
              </div>
              <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                Baseline Entity
              </Badge>
            </div>

            {/* Region 1 Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <IconWorld className="size-3 text-amber-400" /> Bio-Climatic Regime:
                </span>
                <span className="font-mono text-[10px] text-amber-400/80">
                  ×{preset1.continuityFactor} factor
                </span>
              </label>
              <select
                value={region1}
                onChange={(e) => {
                  const newReg = e.target.value;
                  setRegion1(newReg);
                  onSelectPrimaryRegion?.(newReg);
                }}
                className="w-full bg-slate-950 border border-amber-500/40 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
              >
                {REGION_PRESETS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Row: Year + Diurnal Phase */}
            <div className="grid grid-cols-2 gap-2">
              {/* Year 1 */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                  <IconCalendar className="size-3 text-amber-400" /> Year:
                </label>
                <select
                  value={year1}
                  onChange={(e) => setYear1(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  {AVAILABLE_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr} {yr === 2026 ? "(NRT)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Diurnal Phase 1 */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                  <IconSun className="size-3 text-amber-400" /> Diurnal Phase:
                </label>
                <select
                  value={daynight1}
                  onChange={(e) => setDaynight1(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="all">Day & Night (All)</option>
                  <option value="D">Day Flaming (D)</option>
                  <option value="N">Night Smoldering (N)</option>
                </select>
              </div>
            </div>

            {/* Filter Row: Sensor + Metric */}
            <div className="grid grid-cols-2 gap-2">
              {/* Sensor 1 */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                  <IconFlame className="size-3 text-amber-400" /> Sensor:
                </label>
                <select
                  value={sensor1}
                  onChange={(e) => setSensor1(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="all">All (Harmonized)</option>
                  <option value="MODIS">MODIS (Terra/Aqua)</option>
                  <option value="VIIRS">VIIRS (S-NPP/JPSS)</option>
                </select>
              </div>

              {/* Metric 1 */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                  <IconChartBar className="size-3 text-amber-400" /> Metric:
                </label>
                <select
                  value={metric1}
                  onChange={(e) => setMetric1(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="harmonized_count">Hotspots Count</option>
                  <option value="hex_days">Active Hex-Days</option>
                  <option value="frp_mw">FRP Energy (MW)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* INPUT 2 CONFIGURATION PANEL (Cyan Theme) */}
          {/* ======================================================== */}
          <div className="p-4 rounded-xl border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-950/20 via-slate-900/60 to-slate-950/80 space-y-3 relative shadow-lg shadow-cyan-950/20">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-400">
                  Input 2 Parameters
                </span>
              </div>
              <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                Comparison Target
              </Badge>
            </div>

            {/* Region 2 Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <IconWorld className="size-3 text-cyan-400" /> Bio-Climatic Regime:
                </span>
                <span className="font-mono text-[10px] text-cyan-400/80">
                  ×{preset2.continuityFactor} factor
                </span>
              </label>
              <select
                value={region2}
                onChange={(e) => setRegion2(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/40 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
              >
                {REGION_PRESETS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.id === region1 ? "(Same region)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Row: Year + Diurnal Phase */}
            <div className="grid grid-cols-2 gap-2">
              {/* Year 2 */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                  <IconCalendar className="size-3 text-cyan-400" /> Year:
                </label>
                <select
                  value={year2}
                  onChange={(e) => setYear2(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  {AVAILABLE_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr} {yr === 2026 ? "(NRT)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Diurnal Phase 2 */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                  <IconSun className="size-3 text-cyan-400" /> Diurnal Phase:
                </label>
                <select
                  value={daynight2}
                  onChange={(e) => setDaynight2(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="all">Day & Night (All)</option>
                  <option value="D">Day Flaming (D)</option>
                  <option value="N">Night Smoldering (N)</option>
                </select>
              </div>
            </div>

            {/* Filter Row: Sensor + Metric */}
            <div className="grid grid-cols-2 gap-2">
              {/* Sensor 2 */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                  <IconFlame className="size-3 text-cyan-400" /> Sensor:
                </label>
                <select
                  value={sensor2}
                  onChange={(e) => setSensor2(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="all">All (Harmonized)</option>
                  <option value="MODIS">MODIS (Terra/Aqua)</option>
                  <option value="VIIRS">VIIRS (S-NPP/JPSS)</option>
                </select>
              </div>

              {/* Metric 2 */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                  <IconChartBar className="size-3 text-cyan-400" /> Metric:
                </label>
                <select
                  value={metric2}
                  onChange={(e) => setMetric2(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="harmonized_count">Hotspots Count</option>
                  <option value="hex_days">Active Hex-Days</option>
                  <option value="frp_mw">FRP Energy (MW)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Comparison Preset Pairs */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <IconArrowsDiff className="size-3 text-cyan-400" /> Quick Preset Comparisons:
          </span>
          {[
            {
              label: "🌏 SE Asia (2026) vs 🌎 South America (2026)",
              r1: "SouthEast_Asia",
              y1: 2026,
              r2: "South_America",
              y2: 2026,
            },
            {
              label: "🔥 SE Asia 2026 vs ⚡ 2015 El Niño Extreme",
              r1: "SouthEast_Asia",
              y1: 2026,
              r2: "SouthEast_Asia",
              y2: 2015,
            },
            {
              label: "☀️ Day Flaming vs 🌙 Night Peat Smoldering",
              r1: "SouthEast_Asia",
              y1: 2026,
              dn1: "D",
              r2: "SouthEast_Asia",
              y2: 2026,
              dn2: "N",
            },
            {
              label: "🌲 USA vs 🌲 Canada Boreal Megafires",
              r1: "USA_contiguous_and_Hawaii",
              y1: 2026,
              r2: "Canada",
              y2: 2026,
            },
          ].map((pair: any) => (
            <button
              key={pair.label}
              type="button"
              onClick={() => {
                setRegion1(pair.r1);
                setYear1(pair.y1);
                if (pair.dn1) setDaynight1(pair.dn1);
                setRegion2(pair.r2);
                setYear2(pair.y2);
                if (pair.dn2) setDaynight2(pair.dn2);
                onSelectPrimaryRegion?.(pair.r1);
              }}
              className="px-2.5 py-1 rounded bg-slate-950/90 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/50 hover:bg-slate-800 transition-all cursor-pointer font-medium"
            >
              {pair.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Comparative Summary Cards & High-Level Differential */}
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

      {/* 3. Comprehensive Metrics Differential Matrix Table */}
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

      {/* 4. Side-by-Side Chart Comparisons */}

      {/* Comparison 1: Cumulative Season Progression */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IconTrendingUp className="size-4 text-amber-500" />
            <span>Comparison 1: Cumulative Season Progression Curve (DOY 1–365)</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Cumulative trajectory vs 26-year median</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Side A: Input 1 */}
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

          {/* Side B: Input 2 */}
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
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IconActivity className="size-4 text-rose-500" />
            <span>Comparison 2: Monthly Robust Z-Score Anomaly Departures</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Red: Extreme surge (&gt;+2.0σ) | Blue: Deficit</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Side A: Input 1 */}
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

          {/* Side B: Input 2 */}
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
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IconMoon className="size-4 text-purple-400" />
            <span>Comparison 3: Diurnal Cycle & Peatland Smoldering Ratio</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Day Flaming vs Night Smoldering Proportions</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Side A: Input 1 */}
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

          {/* Side B: Input 2 */}
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
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IconFlame className="size-4 text-amber-500" />
            <span>Comparison 4: 12-Month Climatological Seasonal Footprint</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">26-Year Historical Median Fire Seasonality</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Side A: Input 1 */}
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

          {/* Side B: Input 2 */}
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
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <IconCalendar className="size-4 text-emerald-500" />
            <span>Comparison 5: 26-Year Historical Annual Fire Burdens (2000–2026)</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">
            Highlighted: {year1} (Input 1) vs {year2} (Input 2)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Side A: Input 1 */}
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

          {/* Side B: Input 2 */}
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
