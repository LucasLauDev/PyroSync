import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  try {
    // 1. Reverse geocoding mode
    if (lat && lon) {
      const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lon)}&addressdetails=1`;

      const response = await fetch(reverseUrl, {
        headers: {
          "User-Agent": "InteractiveMapLeafletBeta/2.0 (student-project; educational)",
          "Accept-Language": "en",
        },
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        return NextResponse.json({ error: "Geocoding service unavailable" }, { status: 502 });
      }

      const data = await response.json();
      return NextResponse.json({
        displayName: data.display_name || "Unknown Location",
        address: data.address || {},
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon),
      });
    }

    // 2. Search query mode
    if (!q || q.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q.trim()
    )}&viewbox=99.0,8.0,120.0,0.8&bounded=0&limit=6&addressdetails=1`;

    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "InteractiveMapLeafletBeta/2.0 (student-project; educational)",
        "Accept-Language": "en",
      },
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Search service unavailable" }, { status: 502 });
    }

    const data = await response.json();

    const results = (Array.isArray(data) ? data : []).map((item: any) => ({
      placeId: item.place_id,
      displayName: item.display_name,
      name: item.name || item.display_name.split(",")[0],
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type || "place",
      category: item.class || "boundary",
      importance: item.importance || 0,
      address: item.address || {},
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Geocoding API error:", error);
    return NextResponse.json(
      { error: "Internal server error during search" },
      { status: 500 }
    );
  }
}
