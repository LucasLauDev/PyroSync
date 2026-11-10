import {
  CircleMarker,
  Circle,
  Rectangle,
  LayerGroup,
} from "leaflet";
import { Hotspot, RemarkArea } from "../types";

export const MAP_LAYERS = [
  {
    id: "carto-dark",
    name: "Dark Matter (Recommended for Fires)",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap &copy; CARTO",
  },
  {
    id: "esri-satellite",
    name: "Esri World Imagery (Satellite)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri, Maxar, Earthstar Geographics",
  },
  {
    id: "osm-standard",
    name: "OpenStreetMap Standard",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
];

export function renderFireHotspots(
  group: LayerGroup,
  hotspots: Hotspot[]
) {
  group.clearLayers();
  const pointsToRender = hotspots.slice(0, 2000);

  pointsToRender.forEach((pt) => {
    const isViirs = pt.sensor === "VIIRS";
    const isHighFrp = (pt.harmonized_frp || pt.frp) >= 40;

    const color = isHighFrp ? "#f43f5e" : isViirs ? "#e11d48" : "#f59e0b";
    const radius = isHighFrp ? 7 : isViirs ? 5 : 6;

    const circle = new CircleMarker([pt.lat, pt.lon], {
      radius,
      fillColor: color,
      color: isHighFrp ? "#ffffff" : "#000000",
      weight: 1,
      opacity: 0.9,
      fillOpacity: 0.75,
    });

    const popupHtml = `
      <div style="font-family: monospace; font-size: 11px; color: #f8fafc; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155; min-width: 220px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
          <strong style="color: ${color};">${pt.sensor} Hotspot</strong>
          <span style="background: #1e293b; color: #94a3b8; padding: 2px 5px; border-radius: 3px; font-size: 10px;">
            ${pt.satellite || "FIRMS"}
          </span>
        </div>
        <div><strong>Date:</strong> ${pt.date} ${pt.time} UTC</div>
        <div><strong>Coordinates:</strong> ${pt.lat.toFixed(4)}°, ${pt.lon.toFixed(4)}°</div>
        <div><strong>FRP Energy:</strong> <span style="color: #fbbf24; font-weight: bold;">${pt.frp} MW</span> (Harmonized: ${pt.harmonized_frp || pt.frp} MW)</div>
        <div><strong>Brightness Temp:</strong> ${pt.bright} K</div>
        <div><strong>Confidence:</strong> <span style="text-transform: capitalize; color: ${pt.confidence === "high" ? "#10b981" : "#38bdf8"};">${pt.confidence}</span></div>
        <div><strong>Observation:</strong> ${pt.daynight === "D" ? "Daytime Orbit" : "Nighttime Smoldering"}</div>
      </div>
    `;

    circle.bindPopup(popupHtml, { className: "custom-firms-popup" });
    group.addLayer(circle);
  });
}

export function renderFireRemarkArea(
  group: LayerGroup,
  remarkArea: RemarkArea
) {
  group.clearLayers();

  if (remarkArea.type === "bbox" && remarkArea.bbox) {
    const [minLon, minLat, maxLon, maxLat] = remarkArea.bbox;
    const rect = new Rectangle(
      [
        [minLat, minLon],
        [maxLat, maxLon],
      ],
      {
        color: "#38bdf8",
        weight: 2,
        dashArray: "6 4",
        fillColor: "#0284c7",
        fillOpacity: 0.15,
      }
    );
    rect.bindTooltip(remarkArea.name || "Remarked Area (AOI)", {
      permanent: true,
      direction: "top",
    });
    group.addLayer(rect);
  } else if (remarkArea.type === "circle" && remarkArea.circle) {
    const lat = remarkArea.circle.lat;
    const lon = remarkArea.circle.lon ?? remarkArea.circle.lng ?? 0;
    const radiusKm = remarkArea.circle.radiusKm;
    const circle = new Circle([lat, lon], {
      radius: radiusKm * 1000,
      color: "#38bdf8",
      weight: 2,
      dashArray: "6 4",
      fillColor: "#0284c7",
      fillOpacity: 0.15,
    });
    circle.bindTooltip(`${remarkArea.name || "Remark Center"} (r = ${radiusKm} km)`, {
      permanent: true,
      direction: "top",
    });
    group.addLayer(circle);
  }
}
