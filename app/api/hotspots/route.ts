import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// In-memory cache for hotspots
const hotspotsCache: Record<string, any[]> = {};

function getRegionalHotspots(region: string): any[] {
  if (hotspotsCache[region]) {
    return hotspotsCache[region];
  }
  const filePath = path.join(process.cwd(), "public", "data", "hotspots", `${region}.json`);
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    hotspotsCache[region] = data;
    return data;
  }
  return [];
}

// Distance between two coordinates in km (Haversine formula)
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
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
    const region = searchParams.get("region") || "Global";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sensor = searchParams.get("sensor") || "all"; // all, MODIS, VIIRS
    const minFrp = parseFloat(searchParams.get("minFrp") || "0");
    const daynight = searchParams.get("daynight") || "all"; // all, D, N
    const limit = parseInt(searchParams.get("limit") || "2500", 10);

    // Remark area filters:
    // Bounding box: minLon,minLat,maxLon,maxLat (W, S, E, N)
    const bboxStr = searchParams.get("bbox");
    let bbox: { minLon: number; minLat: number; maxLon: number; maxLat: number } | null = null;
    if (bboxStr) {
      const parts = bboxStr.split(",").map(Number);
      if (parts.length === 4 && !parts.some(isNaN)) {
        bbox = { minLon: parts[0], minLat: parts[1], maxLon: parts[2], maxLat: parts[3] };
      }
    }

    // Remark center + radius: lat,lon,radiusKm
    const centerStr = searchParams.get("remarkCenter");
    const radiusKm = parseFloat(searchParams.get("radiusKm") || "0");
    let remarkCenter: { lat: number; lon: number } | null = null;
    if (centerStr) {
      const parts = centerStr.split(",").map(Number);
      if (parts.length === 2 && !parts.some(isNaN)) {
        remarkCenter = { lat: parts[0], lon: parts[1] };
      }
    }

    const allPoints = getRegionalHotspots(region);

    let filtered = allPoints.filter((pt) => {
      // Date filter
      if (startDate && pt.date < startDate) return false;
      if (endDate && pt.date > endDate) return false;

      // Sensor filter
      if (sensor !== "all" && pt.sensor !== sensor) return false;

      // FRP threshold filter
      if (minFrp > 0 && (pt.harmonized_frp || pt.frp) < minFrp) return false;

      // Day / Night filter
      if (daynight !== "all" && pt.daynight !== daynight) return false;

      // Bounding box filter (Remark area)
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

      // Radius filter (Remark area)
      if (remarkCenter && radiusKm > 0) {
        const dist = haversineDistanceKm(remarkCenter.lat, remarkCenter.lon, pt.lat, pt.lon);
        if (dist > radiusKm) return false;
      }

      return true;
    });

    const totalCount = filtered.length;
    const totalFrp = Math.round(
      filtered.reduce((sum, pt) => sum + (pt.harmonized_frp || pt.frp || 0), 0)
    );

    // Apply response limit
    const results = filtered.slice(0, limit);

    return NextResponse.json({
      region,
      total_matched: totalCount,
      total_harmonized_frp_mw: totalFrp,
      count_returned: results.length,
      hotspots: results,
    });
  } catch (error: any) {
    if (error?.digest?.startsWith?.("NEXT_")) throw error;
    console.error("Hotspots API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
