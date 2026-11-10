import { MapMarker, MeasurePoint } from "./types";

export function formatCoordinate(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

export function formatDistance(meters: number): { metric: string; imperial: string } {
  if (meters < 1000) {
    const metric = `${Math.round(meters)} m`;
    const imperial = `${Math.round(meters * 3.28084)} ft`;
    return { metric, imperial };
  }
  const km = (meters / 1000).toFixed(2);
  const miles = (meters * 0.000621371).toFixed(2);
  return { metric: `${km} km`, imperial: `${miles} mi` };
}

export function formatArea(radiusKm: number): { metric: string; imperial: string } {
  const sqKm = Math.PI * radiusKm * radiusKm;
  const sqMiles = sqKm * 0.386102;
  return {
    metric: `${sqKm.toLocaleString(undefined, { maximumFractionDigits: 1 })} km²`,
    imperial: `${sqMiles.toLocaleString(undefined, { maximumFractionDigits: 1 })} mi²`,
  };
}

export function exportMarkersToGeoJSON(markers: MapMarker[], measurePoints: MeasurePoint[] = []) {
  const features: any[] = markers.map((m) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [m.lng, m.lat],
    },
    properties: {
      id: m.id,
      title: m.title,
      description: m.description,
      category: m.category,
      elevation: m.elevation,
      color: m.color,
      badge: m.badge,
    },
  }));

  if (measurePoints.length >= 2) {
    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: measurePoints.map((p) => [p.lng, p.lat]),
      },
      properties: {
        type: "MeasurementRoute",
        totalDistanceMeters: measurePoints[measurePoints.length - 1].totalDistance,
        waypointsCount: measurePoints.length,
      },
    });
  }

  return {
    type: "FeatureCollection",
    metadata: {
      generatedBy: "OpenStreetMap + Leaflet Beta Interactive Viewer",
      generatedAt: new Date().toISOString(),
    },
    features,
  };
}

export function downloadJsonFile(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
