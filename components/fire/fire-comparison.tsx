"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { RegionalCalendarData } from "./types";
import { ComparisonControls } from "./comparison/comparison-controls";
import { ComparisonMatrix } from "./comparison/comparison-matrix";
import { ComparisonCharts } from "./comparison/comparison-charts";
import { useComparisonData } from "./comparison/use-comparison-data";
import { ComparisonFilters } from "./comparison/comparison-types";

interface FireComparisonProps {
  primaryRegion: string;
  primaryCalendarData: RegionalCalendarData | null;
  onSelectPrimaryRegion?: (region: string) => void;
}

export function FireComparison({
  primaryRegion,
  primaryCalendarData,
  onSelectPrimaryRegion,
}: FireComparisonProps) {
  const defaultSecondRegion = useMemo(() => {
    if (primaryRegion === "South_America") return "SouthEast_Asia";
    if (primaryRegion === "SouthEast_Asia") return "South_America";
    return "SouthEast_Asia";
  }, [primaryRegion]);

  const [filters1, setFilters1] = useState<ComparisonFilters>({
    region: primaryRegion,
    year: 2026,
    daynight: "all",
    sensor: "all",
    metric: "harmonized_count",
  });

  const [filters2, setFilters2] = useState<ComparisonFilters>({
    region: defaultSecondRegion,
    year: 2026,
    daynight: "all",
    sensor: "all",
    metric: "harmonized_count",
  });

  // Sync region 1 if primaryRegion changes externally
  useEffect(() => {
    if (primaryRegion && primaryRegion !== filters1.region) {
      setFilters1((prev) => ({ ...prev, region: primaryRegion }));
    }
  }, [primaryRegion, filters1.region]);

  const data = useComparisonData({
    filters1,
    filters2,
    primaryCalendarData,
  });

  const handleChangeFilters1 = useCallback((updates: Partial<ComparisonFilters>) => {
    setFilters1((prev) => ({ ...prev, ...updates }));
    if (updates.region && onSelectPrimaryRegion) {
      onSelectPrimaryRegion(updates.region);
    }
  }, [onSelectPrimaryRegion]);

  const handleChangeFilters2 = useCallback((updates: Partial<ComparisonFilters>) => {
    setFilters2((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleApplyPreset = useCallback((pair: {
    r1: string;
    y1: number;
    r2: string;
    y2: number;
    dn1?: "all" | "D" | "N";
    dn2?: "all" | "D" | "N";
  }) => {
    setFilters1((prev) => ({
      ...prev,
      region: pair.r1,
      year: pair.y1,
      daynight: pair.dn1 || prev.daynight,
    }));
    setFilters2((prev) => ({
      ...prev,
      region: pair.r2,
      year: pair.y2,
      daynight: pair.dn2 || prev.daynight,
    }));
    if (onSelectPrimaryRegion) {
      onSelectPrimaryRegion(pair.r1);
    }
  }, [onSelectPrimaryRegion]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ComparisonControls
        filters1={filters1}
        onChangeFilters1={handleChangeFilters1}
        filters2={filters2}
        onChangeFilters2={handleChangeFilters2}
        preset1={data.preset1}
        preset2={data.preset2}
        onSelectPrimaryRegion={onSelectPrimaryRegion}
        onApplyPreset={handleApplyPreset}
      />

      <ComparisonMatrix
        preset1={data.preset1}
        preset2={data.preset2}
        year1={filters1.year}
        year2={filters2.year}
        daynight1={filters1.daynight}
        daynight2={filters2.daynight}
        isLoading1={data.isLoading1}
        isLoading2={data.isLoading2}
        totalBurden1={data.totalBurden1}
        totalBurden2={data.totalBurden2}
        totalFrp1={data.totalFrp1}
        totalFrp2={data.totalFrp2}
        peak1={data.peak1}
        peak2={data.peak2}
        nightPct1={data.nightPct1}
        nightPct2={data.nightPct2}
        totalHex1={data.totalHex1}
        totalHex2={data.totalHex2}
        diffPct={data.diffPct}
        metricsDifferences={data.metricsDifferences}
      />

      <ComparisonCharts
        preset1={data.preset1}
        preset2={data.preset2}
        year1={filters1.year}
        year2={filters2.year}
        totalBurden1={data.totalBurden1}
        totalBurden2={data.totalBurden2}
        peak1={data.peak1}
        peak2={data.peak2}
        nightPct1={data.nightPct1}
        nightPct2={data.nightPct2}
        cumulativeData1={data.cumulativeData1}
        cumulativeData2={data.cumulativeData2}
        anomalyData1={data.anomalyData1}
        anomalyData2={data.anomalyData2}
        diurnalData1={data.diurnalData1}
        diurnalData2={data.diurnalData2}
        polarData1={data.polarData1}
        polarData2={data.polarData2}
        annualHistory1={data.annualHistory1}
        annualHistory2={data.annualHistory2}
      />
    </div>
  );
}
