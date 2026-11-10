import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Distance helper
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sensor = searchParams.get("sensor") || "all";
    const minFrp = parseFloat(searchParams.get("minFrp") || "0");
    const daynight = searchParams.get("daynight") || "all";

    // Bbox & Remark
    const bboxStr = searchParams.get("bbox");
    let bbox: { minLon: number; minLat: number; maxLon: number; maxLat: number } | null = null;
    if (bboxStr) {
      const parts = bboxStr.split(",").map(Number);
      if (parts.length === 4 && !parts.some(isNaN)) {
        bbox = { minLon: parts[0], minLat: parts[1], maxLon: parts[2], maxLat: parts[3] };
      }
    }

    const centerStr = searchParams.get("remarkCenter");
    const radiusKm = parseFloat(searchParams.get("radiusKm") || "0");
    let remarkCenter: { lat: number; lon: number } | null = null;
    if (centerStr) {
      const parts = centerStr.split(",").map(Number);
      if (parts.length === 2 && !parts.some(isNaN)) {
        remarkCenter = { lat: parts[0], lon: parts[1] };
      }
    }

    if (type === "calendar") {
      // Export 26-year calendar CSV
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

      const rows: string[] = [];
      // Research Metadata headers
      rows.push(`# NASA FIRMS 26-Year Harmonized Burning Activity Calendar (2000-2026)`);
      rows.push(`# Region: ${region}`);
      rows.push(`# Overlap Continuity Scaling Factor: ${regionData.overlap_continuity_factor}x`);
      rows.push(`# Climatological Baseline: 2000-2025 (Terra/Aqua MODIS & S-NPP/JPSS VIIRS)`);
      rows.push(`# Export Timestamp: ${new Date().toISOString()}`);
      rows.push(
        [
          "year",
          "month",
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
        for (const m of yearRec.months) {
          rows.push(
            [
              yearRec.year,
              m.month,
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
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="burning_activity_calendar_2000_2026_${region}.csv"`,
        },
      });
    }

    // Default: Export Hotspots CSV
    const hotspotPath = path.join(process.cwd(), "public", "data", "hotspots", `${region}.json`);
    let points: any[] = [];
    if (fs.existsSync(hotspotPath)) {
      points = JSON.parse(fs.readFileSync(hotspotPath, "utf-8"));
    }

    const filtered = points.filter((pt) => {
      if (startDate && pt.date < startDate) return false;
      if (endDate && pt.date > endDate) return false;
      if (sensor !== "all" && pt.sensor !== sensor) return false;
      if (minFrp > 0 && (pt.harmonized_frp || pt.frp) < minFrp) return false;
      if (daynight !== "all" && pt.daynight !== daynight) return false;
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
      if (remarkCenter && radiusKm > 0) {
        const dist = haversineDistanceKm(remarkCenter.lat, remarkCenter.lon, pt.lat, pt.lon);
        if (dist > radiusKm) return false;
      }
      return true;
    });

    const rows: string[] = [];
    // 15-column schema specified in research paper
    rows.push(
      [
        "hotspot_id",
        "latitude",
        "longitude",
        "acq_date",
        "acq_time_utc",
        "sensor",
        "satellite",
        "frp_raw_mw",
        "frp_harmonized_mw",
        "brightness_kelvin",
        "daynight",
        "confidence_level",
        "region",
        "remark_flag",
        "hotspot_type",
      ].join(",")
    );

    filtered.forEach((pt, idx) => {
      const id = `FIRMS-${pt.sensor}-${pt.date.replace(/-/g, "")}-${idx + 1}`;
      const isRemarked = bbox || (remarkCenter && radiusKm > 0) ? "USER_REMARK_AOI" : "STANDARD_REGION";
      rows.push(
        [
          id,
          pt.lat,
          pt.lon,
          pt.date,
          pt.time,
          pt.sensor,
          pt.satellite || "N/A",
          pt.frp,
          pt.harmonized_frp,
          pt.bright,
          pt.daynight,
          pt.confidence,
          region,
          isRemarked,
          "presumed_vegetation_fire",
        ].join(",")
      );
    });

    const csvContent = rows.join("\r\n");
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="firms_harmonized_hotspots_${region}_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    if (error?.digest?.startsWith?.("NEXT_")) throw error;
    console.error("Export CSV Error:", error);
    return new NextResponse(`Error generating CSV: ${error.message}`, { status: 500 });
  }
}
