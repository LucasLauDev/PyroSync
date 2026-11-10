"use client";

import { useState, useEffect, useMemo } from "react";
import { RegionalCalendarData } from "../types";
import { REGION_PRESETS, MONTH_NAMES } from "../constants";
import {
  IconFlame,
  IconCalendar,
  IconScale,
  IconChartBar,
  IconMoon,
  IconTrendingUp,
  IconActivity,
  IconBolt,
} from "@tabler/icons-react";
import {
  MetricDifferenceRow,
  getMonthlyMetricValue,
  ComparisonFilters,
} from "./comparison-types";

interface UseComparisonDataParams {
  filters1: ComparisonFilters;
  filters2: ComparisonFilters;
  primaryCalendarData: RegionalCalendarData | null;
}

export function useComparisonData({
  filters1,
  filters2,
  primaryCalendarData,
}: UseComparisonDataParams) {
  const { region: region1, year: year1, daynight: daynight1, sensor: sensor1, metric: metric1 } = filters1;
  const { region: region2, year: year2, daynight: daynight2, sensor: sensor2, metric: metric2 } = filters2;

  const [data1, setData1] = useState<RegionalCalendarData | null>(primaryCalendarData);
  const [data2, setData2] = useState<RegionalCalendarData | null>(null);
  const [cache, setCache] = useState<Record<string, RegionalCalendarData>>({});
  const [isLoading1, setIsLoading1] = useState<boolean>(false);
  const [isLoading2, setIsLoading2] = useState<boolean>(false);

  useEffect(() => {
    if (primaryCalendarData?.region) {
      setCache((prev) => ({ ...prev, [primaryCalendarData.region]: primaryCalendarData }));
    }
  }, [primaryCalendarData]);

  // Load Region 1
  useEffect(() => {
    if (!region1) return;
    if (cache[region1]) {
      setData1(cache[region1]);
      return;
    }
    if (primaryCalendarData?.region === region1) {
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

  // Load Region 2
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

  const preset1 = REGION_PRESETS.find((r) => r.id === region1) || REGION_PRESETS[0];
  const preset2 = REGION_PRESETS.find((r) => r.id === region2) || REGION_PRESETS[1];

  // Daily series and diurnal calculation
  const daily1 = data1?.daily_series_2026 || [];
  const dayFires1 = daily1.reduce((sum, d) => sum + (d.day_fires || 0), 0);
  const nightFires1 = daily1.reduce((sum, d) => sum + (d.night_fires || 0), 0);
  const totalDiurnal1 = Math.max(dayFires1 + nightFires1, 1);
  const nightRatio1 = nightFires1 / totalDiurnal1;
  const nightPct1 = Math.round(nightRatio1 * 100);

  const daily2 = data2?.daily_series_2026 || [];
  const dayFires2 = daily2.reduce((sum, d) => sum + (d.day_fires || 0), 0);
  const nightFires2 = daily2.reduce((sum, d) => sum + (d.night_fires || 0), 0);
  const totalDiurnal2 = Math.max(dayFires2 + nightFires2, 1);
  const nightRatio2 = nightFires2 / totalDiurnal2;
  const nightPct2 = Math.round(nightRatio2 * 100);

  const yData1 = data1?.calendar.find((y) => y.year === year1);
  const yData2 = data2?.calendar.find((y) => y.year === year2);

  const totalBurden1 = useMemo(() => {
    if (!yData1) return 0;
    return yData1.months.reduce(
      (acc, m) => acc + getMonthlyMetricValue(m, sensor1, metric1, daynight1, nightRatio1),
      0
    );
  }, [yData1, sensor1, metric1, daynight1, nightRatio1]);

  const totalBurden2 = useMemo(() => {
    if (!yData2) return 0;
    return yData2.months.reduce(
      (acc, m) => acc + getMonthlyMetricValue(m, sensor2, metric2, daynight2, nightRatio2),
      0
    );
  }, [yData2, sensor2, metric2, daynight2, nightRatio2]);

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

  const meanFrp1 = totalBurden1 > 0 ? (totalFrp1 / totalBurden1).toFixed(1) : "0.0";
  const meanFrp2 = totalBurden2 > 0 ? (totalFrp2 / totalBurden2).toFixed(1) : "0.0";

  const totalHex1 = useMemo(() => {
    if (!yData1) return 0;
    return yData1.months.reduce((acc, m) => acc + (m.active_fire_hex_days || 0), 0);
  }, [yData1]);

  const totalHex2 = useMemo(() => {
    if (!yData2) return 0;
    return yData2.months.reduce((acc, m) => acc + (m.active_fire_hex_days || 0), 0);
  }, [yData2]);

  const seasonDuration1 = yData1?.season_timing?.duration_months || 0;
  const seasonDuration2 = yData2?.season_timing?.duration_months || 0;

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

  const diffPct = useMemo(() => {
    if (totalBurden1 === 0 && totalBurden2 === 0) return 0;
    if (totalBurden2 === 0) return 100;
    return Math.round(((totalBurden1 - totalBurden2) / totalBurden2) * 100);
  }, [totalBurden1, totalBurden2]);

  const metricsDifferences = useMemo<MetricDifferenceRow[]>(() => {
    const dBurden = totalBurden1 - totalBurden2;
    const pBurden =
      totalBurden2 > 0 ? Math.round((dBurden / totalBurden2) * 100) : totalBurden1 > 0 ? 100 : 0;
    const dFrp = totalFrp1 - totalFrp2;
    const pFrp =
      totalFrp2 > 0 ? Math.round((dFrp / totalFrp2) * 100) : totalFrp1 > 0 ? 100 : 0;
    const mFrp1 = parseFloat(meanFrp1);
    const mFrp2 = parseFloat(meanFrp2);
    const dMeanFrp = (mFrp1 - mFrp2).toFixed(1);
    const pMeanFrp = mFrp2 > 0 ? Math.round(((mFrp1 - mFrp2) / mFrp2) * 100) : 0;
    const dHex = totalHex1 - totalHex2;
    const pHex =
      totalHex2 > 0 ? Math.round((dHex / totalHex2) * 100) : totalHex1 > 0 ? 100 : 0;
    const dNightPct = (nightPct1 - nightPct2).toFixed(1);
    const mIdx1 = MONTH_NAMES.indexOf(peak1.month);
    const mIdx2 = MONTH_NAMES.indexOf(peak2.month);
    const monthOffset = mIdx1 >= 0 && mIdx2 >= 0 ? Math.abs(mIdx1 - mIdx2) : 0;
    const dZScore = (peak1.zScore - peak2.zScore).toFixed(2);
    const dDuration = seasonDuration1 - seasonDuration2;
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
        winner: dBurden > 0 ? "input1" : dBurden < 0 ? "input2" : "equal",
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
        diffAbs: `${
          dFrp > 0 ? `+${Math.round(dFrp).toLocaleString()}` : Math.round(dFrp).toLocaleString()
        } MW`,
        diffPct: pFrp > 0 ? `+${pFrp}%` : `${pFrp}%`,
        winner: dFrp > 0 ? "input1" : dFrp < 0 ? "input2" : "equal",
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
        winner:
          parseFloat(dMeanFrp) > 0 ? "input1" : parseFloat(dMeanFrp) < 0 ? "input2" : "equal",
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
        winner: dHex > 0 ? "input1" : dHex < 0 ? "input2" : "equal",
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
        winner:
          parseFloat(dNightPct) > 0 ? "input1" : parseFloat(dNightPct) < 0 ? "input2" : "equal",
        insight:
          parseFloat(dNightPct) > 0
            ? "Input 1 shows elevated nocturnal smoldering (peatland hazard)"
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
        winner: "equal",
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
        winner:
          parseFloat(dZScore) > 0 ? "input1" : parseFloat(dZScore) < 0 ? "input2" : "equal",
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
        winner: dDuration > 0 ? "input1" : dDuration < 0 ? "input2" : "equal",
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
        winner: "equal",
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

  // Chart datasets
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
      if (daynight1 === "D") baseVal *= 1 - nightRatio1;
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
      if (daynight2 === "D") baseVal *= 1 - nightRatio2;
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

  const anomalyData1 = useMemo(() => {
    const scores = (yData1?.months || []).map((m) => Number(m.robust_z_score.toFixed(2)));
    const colors = scores.map((s) =>
      s >= 2.0 ? "#ef4444" : s >= 1.0 ? "#f59e0b" : s <= -1.0 ? "#3b82f6" : "#10b981"
    );
    return {
      labels: MONTH_NAMES.map((m) => m.slice(0, 3)),
      datasets: [
        { label: "Robust Z-Score", data: scores, backgroundColor: colors, borderRadius: 4 },
      ],
    };
  }, [yData1]);

  const anomalyData2 = useMemo(() => {
    const scores = (yData2?.months || []).map((m) => Number(m.robust_z_score.toFixed(2)));
    const colors = scores.map((s) =>
      s >= 2.0 ? "#ef4444" : s >= 1.0 ? "#f59e0b" : s <= -1.0 ? "#3b82f6" : "#10b981"
    );
    return {
      labels: MONTH_NAMES.map((m) => m.slice(0, 3)),
      datasets: [
        { label: "Robust Z-Score", data: scores, backgroundColor: colors, borderRadius: 4 },
      ],
    };
  }, [yData2]);

  const diurnalData1 = useMemo(
    () => ({
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
    }),
    [dayFires1, nightFires1, daynight1]
  );

  const diurnalData2 = useMemo(
    () => ({
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
    }),
    [dayFires2, nightFires2, daynight2]
  );

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

  return {
    preset1,
    preset2,
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
  };
}
