import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Haversine distance helper (km)
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "hotspots"; // "hotspots" or "calendar"
    const region = searchParams.get("region") || "Global";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const sensor = searchParams.get("sensor") || "all";
    const minFrp = parseFloat(searchParams.get("minFrp") || "0");
    const daynight = searchParams.get("daynight") || "all";

    // Bounding Box AOI
    const bboxStr = searchParams.get("bbox");
    let bbox: { minLon: number; minLat: number; maxLon: number; maxLat: number } | null = null;
    if (bboxStr) {
      const parts = bboxStr.split(",").map(Number);
      if (parts.length === 4 && !parts.some(isNaN)) {
        bbox = { minLon: parts[0], minLat: parts[1], maxLon: parts[2], maxLat: parts[3] };
      }
    }

    // Circle AOI
    const centerStr = searchParams.get("remarkCenter");
    const radiusKm = parseFloat(searchParams.get("radiusKm") || "0");
    let remarkCenter: { lat: number; lon: number } | null = null;
    if (centerStr) {
      const parts = centerStr.split(",").map(Number);
      if (parts.length === 2 && !parts.some(isNaN)) {
        remarkCenter = { lat: parts[0], lon: parts[1] };
      }
    }

    // -------------------------------------------------------------
    // EXPORT TYPE 1: 26-Year Monthly Calendar Matrix CSV
    // -------------------------------------------------------------
    if (type === "calendar") {
      const calPath = path.join(process.cwd(), "public", "data", "calendar_2000_2026.json");
      if (!fs.existsSync(calPath)) {
        return new NextResponse("Calendar data not available", { status: 404 });
      }
      const calData = JSON.parse(fs.readFileSync(calPath, "utf-8"));
      let regionData = calData[region];
      if (!regionData) {
        const qClean = region.toLowerCase().replace(/[^a-z0-9]/g, "");
        for (const k of Object.keys(calData)) {
          if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === qClean) {
            regionData = calData[k];
            break;
          }
        }
      }
      if (!regionData) {
        return new NextResponse(`Region ${region} not found`, { status: 404 });
      }

      // Date Range boundary filters for calendar
      const startYear = startDate ? parseInt(startDate.split("-")[0], 10) : 2000;
      const startMonth = startDate ? parseInt(startDate.split("-")[1], 10) : 1;
      const endYear = endDate ? parseInt(endDate.split("-")[0], 10) : 2026;
      const endMonth = endDate ? parseInt(endDate.split("-")[1], 10) : 12;

      const rows: string[] = [];
      // Research Metadata headers
      rows.push(`# =========================================================================`);
      rows.push(`# PyroSync: 26-Year Harmonized Burning Activity Calendar Matrix (2000-2026)`);
      rows.push(`# Data Source: NASA Earthdata LANCE FIRMS (MODIS & VIIRS)`);
      rows.push(`# Bioclimatic Region: ${region}`);
      rows.push(`# Date Range Filter: ${startDate || "2000-01-01"} to ${endDate || "2026-11-09"}`);
      rows.push(`# Sensor Calibration: MODIS Terra/Aqua & VIIRS S-NPP/JPSS Continuous Model`);
      rows.push(`# Overlap Continuity Scaling Factor: ${regionData.overlap_continuity_factor}x`);
      rows.push(`# Climatological Baseline Period: 2000-2025 (Historical Median & IQR)`);
      rows.push(`# Export Timestamp (UTC): ${new Date().toISOString()}`);
      rows.push(`# =========================================================================`);
      rows.push(
        [
          "year",
          "month",
          "month_name",
          "raw_modis_count",
          "raw_viirs_count",
          "harmonized_fire_count",
          "active_fire_hex_days_res7",
          "total_harmonized_frp_mw",
          "historical_month_median",
          "historical_month_iqr",
          "relative_anomaly_pct",
          "robust_z_score",
          "anomaly_status",
          "trend_diff_prev_month",
        ].join(",")
      );

      for (const yearRec of regionData.calendar) {
        if (yearRec.year < startYear || yearRec.year > endYear) continue;

        for (const m of yearRec.months) {
          // Check start/end month boundary
          if (yearRec.year === startYear && m.month < startMonth) continue;
          if (yearRec.year === endYear && m.month > endMonth) continue;

          rows.push(
            [
              yearRec.year,
              m.month,
              `"${MONTH_NAMES[m.month - 1] || m.month}"`,
              m.modis_count,
              m.viirs_count,
              m.harmonized_count,
              m.active_fire_hex_days,
              m.harmonized_frp_mw,
              m.historical_median,
              m.historical_iqr,
              m.relative_anomaly_pct,
              m.robust_z_score,
              `"${m.anomaly_status}"`,
              m.trend_diff,
            ].join(",")
          );
        }
      }

      const csvContent = rows.join("\r\n");
      const safeRegion = region.replace(/[^a-zA-Z0-9_-]/g, "_");
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="burning_calendar_${safeRegion}_${startYear}_${endYear}.csv"`,
        },
      });
    }

    // -------------------------------------------------------------
    // EXPORT TYPE 2: Point-Level Harmonized Hotspots CSV
    // -------------------------------------------------------------
    // Find matching regional dataset file
    const dataDir = path.join(process.cwd(), "public", "data", "hotspots");
    let targetFileName = `${region}.json`;
    if (!fs.existsSync(path.join(dataDir, targetFileName))) {
      const qClean = region.toLowerCase().replace(/[^a-z0-9]/g, "");
      const files = fs.readdirSync(dataDir);
      for (const f of files) {
        if (f.toLowerCase().replace(/[^a-z0-9]/g, "") === `${qClean}json`) {
          targetFileName = f;
          break;
        }
      }
    }

    const hotspotPath = path.join(dataDir, targetFileName);
    let points: any[] = [];
    if (fs.existsSync(hotspotPath)) {
      points = JSON.parse(fs.readFileSync(hotspotPath, "utf-8"));
    }

    // Apply ALL User Filter Criteria
    const filtered = points.filter((pt) => {
      // 1. Date Range Filter
      if (startDate && pt.date < startDate) return false;
      if (endDate && pt.date > endDate) return false;

      // 2. Sensor Filter (MODIS, VIIRS, or all)
      if (sensor !== "all" && pt.sensor?.toUpperCase() !== sensor.toUpperCase()) {
        return false;
      }

      // 3. Diurnal Phase Filter ("D" = Day, "N" = Night, or "all")
      if (daynight !== "all" && pt.daynight?.toUpperCase() !== daynight.toUpperCase()) {
        return false;
      }

      // 4. Minimum FRP Filter
      const ptFrp = Number(pt.harmonized_frp ?? pt.frp ?? 0);
      if (minFrp > 0 && ptFrp < minFrp) {
        return false;
      }

      // 5. Spatial Bounding Box Filter
      if (bbox) {
        if (
          pt.lon < bbox.minLon ||
          pt.lon > bbox.maxLon ||
          pt.lat < bbox.minLat ||
          pt.lat > bbox.maxLat
        ) {
          return false;
        }
      }

      // 6. Spatial Circle AOI Filter
      if (remarkCenter && radiusKm > 0) {
        const dist = haversineDistanceKm(remarkCenter.lat, remarkCenter.lon, pt.lat, pt.lon);
        if (dist > radiusKm) return false;
      }

      return true;
    });

    const rows: string[] = [];
    const diurnalPhaseLabel =
      daynight === "D"
        ? "Daytime Flaming (D)"
        : daynight === "N"
        ? "Nighttime Smoldering (N)"
        : "All Phases (Day & Night)";

    const sensorLabel =
      sensor === "MODIS"
        ? "MODIS Only (Terra/Aqua)"
        : sensor === "VIIRS"
        ? "VIIRS Only (S-NPP/NOAA-20/NOAA-21)"
        : "All Sensors (Harmonized)";

    const aoiLabel = bboxStr
      ? `Custom BBox [${bboxStr}]`
      : remarkCenter
      ? `Custom Circle (${remarkCenter.lat}, ${remarkCenter.lon}, r=${radiusKm}km)`
      : `Standard Bioclimatic Region (${region})`;

    // PyroSync Metadata Headers
    rows.push(`# =========================================================================`);
    rows.push(`# PyroSync: NASA FIRMS Harmonized Active Fire Hotspot Dataset`);
    rows.push(`# Data Source: NASA Earthdata LANCE FIRMS (MODIS & VIIRS)`);
    rows.push(`# Bioclimatic Region: ${region}`);
    rows.push(`# Temporal Filter (Date Range): ${startDate || "2000-01-01"} to ${endDate || "2026-11-09"}`);
    rows.push(`# Instrument Sensor Filter: ${sensorLabel}`);
    rows.push(`# Diurnal Phase Filter: ${diurnalPhaseLabel}`);
    rows.push(`# Minimum Radiative Power (FRP): >= ${minFrp} MW`);
    rows.push(`# Spatial AOI Extent: ${aoiLabel}`);
    rows.push(`# Total Filtered Hotspot Records: ${filtered.length}`);
    rows.push(`# Harmonization Framework: 173-Month Multi-Decadal Continuity Baseline`);
    rows.push(`# Export Generated UTC: ${new Date().toISOString()}`);
    rows.push(`# =========================================================================`);

    // 16-Column Detailed Schema
    rows.push(
      [
        "hotspot_id",
        "latitude",
        "longitude",
        "acq_date",
        "acq_time_utc",
        "sensor",
        "satellite",
        "diurnal_phase",
        "daynight_code",
        "frp_raw_mw",
        "frp_harmonized_mw",
        "brightness_kelvin",
        "confidence_level",
        "region",
        "spatial_aoi_flag",
        "presumed_fire_nature",
      ].join(",")
    );

    filtered.forEach((pt, idx) => {
      const id = `FIRMS-${pt.sensor}-${pt.date.replace(/-/g, "")}-${String(idx + 1).padStart(5, "0")}`;
      const isCustomAoi = bbox || (remarkCenter && radiusKm > 0) ? "USER_CUSTOM_AOI" : "STANDARD_REGION";
      const phase = pt.daynight === "D" ? "Day (Flaming)" : "Night (Smoldering)";
      const rawFrp = Number(pt.frp || 0).toFixed(2);
      const harmFrp = Number(pt.harmonized_frp || pt.frp || 0).toFixed(2);
      const bright = Number(pt.bright || 0).toFixed(1);

      rows.push(
        [
          id,
          pt.lat,
          pt.lon,
          pt.date,
          pt.time,
          pt.sensor,
          `"${pt.satellite || "N/A"}"`,
          `"${phase}"`,
          pt.daynight,
          rawFrp,
          harmFrp,
          bright,
          `"${pt.confidence}"`,
          `"${region}"`,
          isCustomAoi,
          "presumed_vegetation_fire",
        ].join(",")
      );
    });

    const csvContent = rows.join("\r\n");
    const safeRegion = region.replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeStart = (startDate || "20000101").replace(/-/g, "");
    const safeEnd = (endDate || "20261109").replace(/-/g, "");
    const fileName = `firms_harmonized_${safeRegion}_${sensor}_phase-${daynight}_${safeStart}_to_${safeEnd}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    if (error?.digest?.startsWith?.("NEXT_")) throw error;
    console.error("Export CSV Error:", error);
    return new NextResponse(`Error generating CSV: ${error.message}`, { status: 500 });
  }
}
