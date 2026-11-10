import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// In-memory cache for fast calendar queries
let calendarCache: Record<string, any> | null = null;
let dailyCache: Record<string, any> | null = null;
let metadataCache: any = null;

function loadData() {
  if (!calendarCache) {
    const calPath = path.join(process.cwd(), "public", "data", "calendar_2000_2026.json");
    if (fs.existsSync(calPath)) {
      calendarCache = JSON.parse(fs.readFileSync(calPath, "utf-8"));
    }
  }
  if (!dailyCache) {
    const dailyPath = path.join(process.cwd(), "public", "data", "daily_summary.json");
    if (fs.existsSync(dailyPath)) {
      dailyCache = JSON.parse(fs.readFileSync(dailyPath, "utf-8"));
    }
  }
  if (!metadataCache) {
    const metaPath = path.join(process.cwd(), "public", "data", "metadata.json");
    if (fs.existsSync(metaPath)) {
      metadataCache = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    }
  }
}

function getRegionData(cache: Record<string, any> | null, query: string) {
  if (!cache) return null;
  if (cache[query]) return cache[query];
  const qClean = query.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const k of Object.keys(cache)) {
    if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === qClean) {
      return cache[k];
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    loadData();
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || "Global";
    const startYear = parseInt(searchParams.get("startYear") || "2000", 10);
    const endYear = parseInt(searchParams.get("endYear") || "2026", 10);
    const mode = searchParams.get("mode") || "overlap_scaled"; // overlap_scaled, hex_days, vza_frp, modis_equiv

    const regionData = getRegionData(calendarCache, region);
    if (!regionData) {
      return NextResponse.json({ error: `Region ${region} not found` }, { status: 404 });
    }

    const filteredCalendar = regionData.calendar.filter(
      (y: any) => y.year >= startYear && y.year <= endYear
    );

    // Filtered daily series for the region
    const dailySeries = getRegionData(dailyCache, region) || [];

    return NextResponse.json({
      region: regionData.region,
      overlap_continuity_factor: regionData.overlap_continuity_factor,
      baseline_period: regionData.baseline_period,
      monthly_baselines: regionData.monthly_baselines,
      metadata: metadataCache,
      calendar: filteredCalendar,
      daily_series_2026: dailySeries,
      query: { region, startYear, endYear, mode },
    });
  } catch (error: any) {
    if (error?.digest?.startsWith?.("NEXT_")) throw error;
    console.error("Calendar API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
