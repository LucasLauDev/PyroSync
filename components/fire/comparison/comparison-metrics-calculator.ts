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
import { MetricDifferenceRow } from "./comparison-types";
import { RegionPreset } from "../types";

export interface ComputeMetricsParams {
  totalBurden1: number;
  totalBurden2: number;
  totalFrp1: number;
  totalFrp2: number;
  meanFrp1: string;
  meanFrp2: string;
  totalHex1: number;
  totalHex2: number;
  nightPct1: number;
  nightPct2: number;
  peak1: { month: string; count: number; zScore: number; monthIdx: number };
  peak2: { month: string; count: number; zScore: number; monthIdx: number };
  seasonDuration1: number;
  seasonDuration2: number;
  preset1: RegionPreset;
  preset2: RegionPreset;
}

export function computeComparisonMetrics(p: ComputeMetricsParams): MetricDifferenceRow[] {
  const dBurden = p.totalBurden1 - p.totalBurden2;
  const pBurden = p.totalBurden2 > 0 ? Math.round((dBurden / p.totalBurden2) * 100) : 0;

  const dFrp = p.totalFrp1 - p.totalFrp2;
  const pFrp = p.totalFrp2 > 0 ? Math.round((dFrp / p.totalFrp2) * 100) : 0;

  const dMeanFrp = (parseFloat(p.meanFrp1) - parseFloat(p.meanFrp2)).toFixed(1);
  const pMeanFrp =
    parseFloat(p.meanFrp2) > 0
      ? Math.round(((parseFloat(p.meanFrp1) - parseFloat(p.meanFrp2)) / parseFloat(p.meanFrp2)) * 100)
      : 0;

  const dHex = p.totalHex1 - p.totalHex2;
  const pHex = p.totalHex2 > 0 ? Math.round((dHex / p.totalHex2) * 100) : 0;

  const dNightPct = (p.nightPct1 - p.nightPct2).toFixed(1);
  const monthOffset = Math.abs(p.peak1.monthIdx - p.peak2.monthIdx);
  const dZScore = (p.peak1.zScore - p.peak2.zScore).toFixed(2);
  const dDuration = p.seasonDuration1 - p.seasonDuration2;
  const dContinuity = (p.preset1.continuityFactor - p.preset2.continuityFactor).toFixed(2);

  return [
    {
      id: "burden",
      title: "Total Fire Hotspot Count",
      category: "Fire Volume",
      icon: IconFlame,
      val1: p.totalBurden1.toLocaleString(),
      val2: p.totalBurden2.toLocaleString(),
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
      val1: `${Math.round(p.totalFrp1).toLocaleString()} MW`,
      val2: `${Math.round(p.totalFrp2).toLocaleString()} MW`,
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
      val1: `${p.meanFrp1} MW`,
      val2: `${p.meanFrp2} MW`,
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
      val1: p.totalHex1.toLocaleString(),
      val2: p.totalHex2.toLocaleString(),
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
      val1: `${p.nightPct1}% nocturnal`,
      val2: `${p.nightPct2}% nocturnal`,
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
      val1: `${p.peak1.month} (${p.peak1.count.toLocaleString()})`,
      val2: `${p.peak2.month} (${p.peak2.count.toLocaleString()})`,
      diffAbs: monthOffset === 0 ? "Synchronized" : `${monthOffset} mo offset`,
      diffPct: monthOffset === 0 ? "Same Month" : "Asynchronous",
      winner: "equal",
      insight:
        monthOffset === 0
          ? `Both regions peaked in ${p.peak1.month}`
          : `Seasonal offset of ${monthOffset} months (${p.peak1.month} vs ${p.peak2.month})`,
    },
    {
      id: "anomaly",
      title: "Peak Monthly Robust Z-Score",
      category: "Climatology",
      icon: IconTrendingUp,
      val1: `${p.peak1.zScore > 0 ? `+${p.peak1.zScore}` : p.peak1.zScore}σ`,
      val2: `${p.peak2.zScore > 0 ? `+${p.peak2.zScore}` : p.peak2.zScore}σ`,
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
      val1: `${p.seasonDuration1} months`,
      val2: `${p.seasonDuration2} months`,
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
      val1: `×${p.preset1.continuityFactor}`,
      val2: `×${p.preset2.continuityFactor}`,
      diffAbs: `${parseFloat(dContinuity) > 0 ? `+${dContinuity}` : dContinuity}×`,
      diffPct: "Scaling delta",
      winner: "equal",
      insight: "Regional MODIS-to-VIIRS sensor footprint scaling factor",
    },
  ];
}
