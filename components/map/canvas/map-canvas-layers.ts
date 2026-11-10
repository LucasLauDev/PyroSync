import {
  Marker,
  Circle,
  CircleMarker,
  Rectangle,
  Polyline,
  DivIcon,
  LayerGroup,
} from "leaflet";
import {
  MapMarker,
  MeasurePoint,
  HotspotPoint,
  RemarkArea,
  ColorRampType,
} from "../types";
import { formatCoordinate } from "../utils";

export function renderCustomMarkers(
  group: LayerGroup,
  markers: MapMarker[],
  showPresets: boolean,
  showCustomMarkers: boolean
) {
  group.clearLayers();

  const visibleMarkers = markers.filter((m) => {
    if (m.isPreset && !showPresets) return false;
    if (!m.isPreset && !showCustomMarkers) return false;
    return true;
  });

  visibleMarkers.forEach((m) => {
    let iconInnerSvg = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 18.5l7 2.5l-7 -18l-7 18z" />
      </svg>
    `;

    if (m.category === "space") {
      iconInnerSvg = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" />
          <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" />
          <circle cx="15" cy="9" r="1" />
        </svg>
      `;
    } else if (m.category === "observatory") {
      iconInnerSvg = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 21l6 -5l6 5" />
          <path d="M12 13v8" />
          <path d="M3.5 10l9 -6l4.5 3" />
          <path d="M19 12l2 -1.5" />
        </svg>
      `;
    }

    const customIcon = new DivIcon({
      className: "custom-map-icon",
      html: `
        <div class="custom-leaflet-marker" style="transform: translate(-50%, -100%);">
          <div class="relative flex items-center justify-center size-8 rounded-full shadow-lg border-2 border-white transition-all duration-200"
               style="background-color: ${m.color}; color: #ffffff;">
            ${iconInnerSvg}
          </div>
          <div class="w-2.5 h-1 bg-black/35 rounded-full mx-auto blur-[1px] mt-0.5"></div>
        </div>
      `,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -38],
    });

    const marker = new Marker([m.lat, m.lng], { icon: customIcon });

    const popupHtml = `
      <div class="p-3 min-w-[210px] max-w-[260px] font-sans">
        <div class="flex items-center justify-between gap-1 mb-1.5">
          <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style="background-color: ${m.color}25; color: ${m.color}">
            ${m.category}
          </span>
          ${
            m.elevation
              ? `<span class="text-[10px] text-gray-500 dark:text-gray-400 font-mono font-medium">Elev: ${m.elevation}</span>`
              : ""
          }
        </div>
        <h4 class="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1">
          ${m.title}
        </h4>
        ${
          m.description
            ? `<p class="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed mb-2">${m.description}</p>`
            : ""
        }
        <div class="pt-1.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span>${formatCoordinate(m.lat, m.lng)}</span>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, {
      closeButton: true,
      autoPan: true,
    });

    group.addLayer(marker);
  });
}

export function renderHotspotMarkers(
  group: LayerGroup,
  hotspots: HotspotPoint[],
  showHotspots: boolean,
  colorRamp: ColorRampType
) {
  group.clearLayers();
  if (!showHotspots || hotspots.length === 0) return;

  const pointsToRender = hotspots.slice(0, 2000);

  pointsToRender.forEach((pt) => {
    const isViirs = pt.sensor === "VIIRS";
    const isHighFrp = (pt.harmonized_frp || pt.frp) >= 40;

    let color = isHighFrp ? "#f43f5e" : isViirs ? "#e11d48" : "#f59e0b";
    if (colorRamp === "viridis") {
      color = isHighFrp ? "#fde725" : isViirs ? "#35b779" : "#31688e";
    } else if (colorRamp === "inferno") {
      color = isHighFrp ? "#fcffa4" : isViirs ? "#f98e09" : "#bb3754";
    } else if (colorRamp === "diverging_anomaly") {
      color = isHighFrp ? "#ef4444" : isViirs ? "#f97316" : "#38bdf8";
    }

    const radius = isHighFrp ? 7 : isViirs ? 5 : 6;

    const circle = new CircleMarker([pt.lat, pt.lon], {
      radius,
      fillColor: color,
      color: isHighFrp ? "#ffffff" : "#000000",
      weight: 1,
      opacity: 0.9,
      fillOpacity: 0.8,
    });

    const popupHtml = `
      <div style="font-family: monospace; font-size: 11px; color: #f8fafc; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155; min-width: 220px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
          <strong style="color: ${color};">${pt.sensor} Active Hotspot</strong>
          <span style="background: #1e293b; color: #94a3b8; padding: 2px 5px; border-radius: 3px; font-size: 10px;">
            ${pt.satellite || "FIRMS"}
          </span>
        </div>
        <div><strong>Date:</strong> ${pt.date} ${pt.time} UTC</div>
        <div><strong>Coordinates:</strong> ${pt.lat.toFixed(4)}°, ${pt.lon.toFixed(4)}°</div>
        <div><strong>FRP Energy:</strong> <span style="color: #fbbf24; font-weight: bold;">${pt.frp} MW</span> (Harmonized: ${pt.harmonized_frp || pt.frp} MW)</div>
        <div><strong>Brightness Temp:</strong> ${pt.bright} K</div>
        <div><strong>Confidence:</strong> <span style="text-transform: capitalize; color: ${pt.confidence === "high" ? "#10b981" : "#38bdf8"};">${pt.confidence}</span></div>
        <div><strong>Orbit:</strong> ${pt.daynight === "D" ? "Daytime Detection" : "Nighttime Smoldering"}</div>
      </div>
    `;

    circle.bindPopup(popupHtml, { autoPan: true });
    group.addLayer(circle);
  });
}

export function renderRemarkArea(group: LayerGroup, remarkArea: RemarkArea) {
  group.clearLayers();

  if (remarkArea.type === "bbox" && remarkArea.bbox) {
    const [minLon, minLat, maxLon, maxLat] = remarkArea.bbox;
    const rect = new Rectangle(
      [
        [minLat, minLon],
        [maxLat, maxLon],
      ],
      {
        color: "#06b6d4",
        weight: 2.5,
        dashArray: "6 4",
        fillColor: "#0284c7",
        fillOpacity: 0.18,
      }
    );
    rect.bindTooltip(remarkArea.name || "Remark Area AOI", {
      permanent: true,
      direction: "top",
    });
    group.addLayer(rect);
  } else if (remarkArea.type === "circle" && remarkArea.circle) {
    const lat = remarkArea.circle.lat;
    const lng = remarkArea.circle.lng ?? remarkArea.circle.lon ?? 0;
    const radiusKm = remarkArea.circle.radiusKm;
    const circle = new Circle([lat, lng], {
      radius: radiusKm * 1000,
      color: "#06b6d4",
      weight: 2.5,
      dashArray: "6 4",
      fillColor: "#0284c7",
      fillOpacity: 0.18,
    });
    circle.bindTooltip(`${remarkArea.name || "Remark Area"} (r = ${radiusKm} km)`, {
      permanent: true,
      direction: "top",
    });
    group.addLayer(circle);
  }
}

export function renderMeasurePoints(group: LayerGroup, measurePoints: MeasurePoint[]) {
  group.clearLayers();
  if (measurePoints.length === 0) return;

  measurePoints.forEach((pt, index) => {
    const isStart = index === 0;
    const isEnd = index === measurePoints.length - 1 && measurePoints.length > 1;

    const markerIcon = new DivIcon({
      className: "custom-map-icon",
      html: `
        <div style="transform: translate(-50%, -50%);">
          <div class="size-4 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[9px] font-bold text-white ${
            isStart ? "bg-emerald-500" : isEnd ? "bg-blue-600" : "bg-sky-500"
          }">
            ${index + 1}
          </div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const marker = new Marker([pt.lat, pt.lng], { icon: markerIcon });
    group.addLayer(marker);
  });

  if (measurePoints.length >= 2) {
    const latlngs = measurePoints.map((p) => [p.lat, p.lng] as [number, number]);
    const polyline = new Polyline(latlngs, {
      color: "#3b82f6",
      weight: 3.5,
      opacity: 0.85,
      dashArray: "6, 8",
    });
    group.addLayer(polyline);
  }
}
