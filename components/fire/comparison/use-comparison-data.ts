"use client";

import { useState, useEffect, useMemo } from "react";
import { RegionalCalendarData } from "../types";
import { REGION_PRESETS, MONTH_NAMES } from "../constants";
import {
  MetricDifferenceRow,
  getMonthlyMetricValue,
  ComparisonFilters,
} from "./comparison-types";
import { computeComparisonMetrics } from "./comparison-metrics-calculator";
import {
  buildCumulativeDataset,
  buildAnomalyDataset,
  buildDiurnalDataset,
  buildPolarDataset,
  buildAnnualDataset,
} from "./comparison-chart-builders";

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
    if (primaryCalendarData?.region === region2) {
      setData2(primaryCalendarData);
      setCache((prev) => ({ ...prev, [region2]: primaryCalendarData }));
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
  }, [region2, cache, primaryCalendarData]);

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

  const yData1 = useMemo(
    () => data1?.calendar?.find((y) => y.year === year1) || null,
    [data1, year1]
  );
  const yData2 = useMemo(
    () => data2?.calendar?.find((y) => y.year === year2) || null,
    [data2, year2]
  );

  const totalBurden1 = useMemo(() => {
    if (!yData1) return 0;
    return (yData1.months || []).reduce((acc, m) => {
      return acc + getMonthlyMetricValue(m, sensor1, metric1, daynight1, nightRatio1);
    }, 0);
  }, [yData1, sensor1, metric1, daynight1, nightRatio1]);

  const totalBurden2 = useMemo(() => {
    if (!yData2) return 0;
    return (yData2.months || []).reduce((acc, m) => {
      return acc + getMonthlyMetricValue(m, sensor2, metric2, daynight2, nightRatio2);
    }, 0);
  }, [yData2, sensor2, metric2, daynight2, nightRatio2]);

  const totalFrp1 = useMemo(() => {
    if (!yData1) return 0;
    return (yData1.months || []).reduce((acc, m) => {
      let f = m.harmonized_frp_mw || 0;
      if (daynight1 === "D") f *= Math.max(1 - nightRatio1, 0.05);
      if (daynight1 === "N") f *= Math.max(nightRatio1, 0.05);
      return acc + f;
    }, 0);
  }, [yData1, daynight1, nightRatio1]);

  const totalFrp2 = useMemo(() => {
    if (!yData2) return 0;
    return (yData2.months || []).reduce((acc, m) => {
      let f = m.harmonized_frp_mw || 0;
      if (daynight2 === "D") f *= Math.max(1 - nightRatio2, 0.05);
      if (daynight2 === "N") f *= Math.max(nightRatio2, 0.05);
      return acc + f;
    }, 0);
  }, [yData2, daynight2, nightRatio2]);

  const meanFrp1 = totalBurden1 > 0 ? (totalFrp1 / totalBurden1).toFixed(1) : "0.0";
  const meanFrp2 = totalBurden2 > 0 ? (totalFrp2 / totalBurden2).toFixed(1) : "0.0";

  const totalHex1 = useMemo(
    () => (yData1?.months || []).reduce((acc, m) => acc + (m.active_fire_hex_days || 0), 0),
    [yData1]
  );
  const totalHex2 = useMemo(
    () => (yData2?.months || []).reduce((acc, m) => acc + (m.active_fire_hex_days || 0), 0),
    [yData2]
  );

  const peak1 = useMemo(() => {
    if (!yData1?.months || yData1.months.length === 0)
      return { month: "N/A", count: 0, zScore: 0, monthIdx: 0 };
    let maxM = yData1.months[0];
    yData1.months.forEach((m) => {
      const val = getMonthlyMetricValue(m, sensor1, metric1, daynight1, nightRatio1);
      const maxVal = getMonthlyMetricValue(maxM, sensor1, metric1, daynight1, nightRatio1);
      if (val > maxVal) maxM = m;
    });
    return {
      month: MONTH_NAMES[maxM.month - 1] || `M${maxM.month}`,
      count: getMonthlyMetricValue(maxM, sensor1, metric1, daynight1, nightRatio1),
      zScore: Number(maxM.robust_z_score.toFixed(2)),
      monthIdx: maxM.month - 1,
    };
  }, [yData1, sensor1, metric1, daynight1, nightRatio1]);

  const peak2 = useMemo(() => {
    if (!yData2?.months || yData2.months.length === 0)
      return { month: "N/A", count: 0, zScore: 0, monthIdx: 0 };
    let maxM = yData2.months[0];
    yData2.months.forEach((m) => {
      const val = getMonthlyMetricValue(m, sensor2, metric2, daynight2, nightRatio2);
      const maxVal = getMonthlyMetricValue(maxM, sensor2, metric2, daynight2, nightRatio2);
      if (val > maxVal) maxM = m;
    });
    return {
      month: MONTH_NAMES[maxM.month - 1] || `M${maxM.month}`,
      count: getMonthlyMetricValue(maxM, sensor2, metric2, daynight2, nightRatio2),
      zScore: Number(maxM.robust_z_score.toFixed(2)),
      monthIdx: maxM.month - 1,
    };
  }, [yData2, sensor2, metric2, daynight2, nightRatio2]);

  const seasonDuration1 = useMemo(
    () => (yData1?.months || []).filter((m) => m.robust_z_score >= 0.5).length,
    [yData1]
  );
  const seasonDuration2 = useMemo(
    () => (yData2?.months || []).filter((m) => m.robust_z_score >= 0.5).length,
    [yData2]
  );

  const diffPct =
    totalBurden2 > 0 ? Math.round(((totalBurden1 - totalBurden2) / totalBurden2) * 100) : 0;

  const metricsDifferences: MetricDifferenceRow[] = useMemo(() => {
    return computeComparisonMetrics({
      totalBurden1, totalBurden2, totalFrp1, totalFrp2, meanFrp1, meanFrp2,
      totalHex1, totalHex2, nightPct1, nightPct2, peak1, peak2,
      seasonDuration1, seasonDuration2, preset1, preset2,
    });
  }, [
    totalBurden1, totalBurden2, totalFrp1, totalFrp2, meanFrp1, meanFrp2,
    totalHex1, totalHex2, nightPct1, nightPct2, peak1, peak2,
    seasonDuration1, seasonDuration2, preset1, preset2,
  ]);

  const cumulativeData1 = useMemo(() => {
    return buildCumulativeDataset({
      months: yData1?.months || [],
      sensor: sensor1,
      metric: metric1,
      daynight: daynight1,
      nightRatio: nightRatio1,
      data: data1,
      regionName: preset1.name,
      year: year1,
      color: "#f59e0b",
      bgLight: "rgba(245, 158, 11, 0.15)",
    });
  }, [yData1, data1, preset1.name, year1, sensor1, metric1, daynight1, nightRatio1]);

  const cumulativeData2 = useMemo(() => {
    return buildCumulativeDataset({
      months: yData2?.months || [],
      sensor: sensor2,
      metric: metric2,
      daynight: daynight2,
      nightRatio: nightRatio2,
      data: data2,
      regionName: preset2.name,
      year: year2,
      color: "#06b6d4",
      bgLight: "rgba(6, 182, 212, 0.15)",
    });
  }, [yData2, data2, preset2.name, year2, sensor2, metric2, daynight2, nightRatio2]);

  const anomalyData1 = useMemo(() => buildAnomalyDataset(yData1?.months || []), [yData1]);
  const anomalyData2 = useMemo(() => buildAnomalyDataset(yData2?.months || []), [yData2]);

  const diurnalData1 = useMemo(
    () =>
      buildDiurnalDataset(
        dayFires1,
        nightFires1,
        daynight1,
        "#f59e0b",
        "#8b5cf6",
        "rgba(245, 158, 11, 0.2)",
        "rgba(139, 92, 246, 0.2)"
      ),
    [dayFires1, nightFires1, daynight1]
  );

  const diurnalData2 = useMemo(
    () =>
      buildDiurnalDataset(
        dayFires2,
        nightFires2,
        daynight2,
        "#06b6d4",
        "#a855f7",
        "rgba(6, 182, 212, 0.2)",
        "rgba(168, 85, 247, 0.2)"
      ),
    [dayFires2, nightFires2, daynight2]
  );

  const polarData1 = useMemo(
    () =>
      buildPolarDataset(
        data1,
        preset1.name,
        daynight1,
        nightRatio1,
        "#f59e0b",
        "rgba(245, 158, 11, 0.45)"
      ),
    [data1, preset1.name, daynight1, nightRatio1]
  );

  const polarData2 = useMemo(
    () =>
      buildPolarDataset(
        data2,
        preset2.name,
        daynight2,
        nightRatio2,
        "#06b6d4",
        "rgba(6, 182, 212, 0.45)"
      ),
    [data2, preset2.name, daynight2, nightRatio2]
  );

  const annualHistory1 = useMemo(
    () => buildAnnualDataset(data1, year1, "#f59e0b", "rgba(245, 158, 11, 0.35)"),
    [data1, year1]
  );

  const annualHistory2 = useMemo(
    () => buildAnnualDataset(data2, year2, "#06b6d4", "rgba(6, 182, 212, 0.35)"),
    [data2, year2]
  );

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
