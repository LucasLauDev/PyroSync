import { TileLayerConfig } from "../types";

const CARTO_API_KEY = "cb1_558s_1_dbe3f782c112f2c23212f06b";

export const AVAILABLE_LAYERS: TileLayerConfig[] = [
  {
    id: "osm-standard",
    name: "OpenStreetMap Standard",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
    minZoom: 1,
    description: "The official OpenStreetMap default cartography with full detail and global coverage.",
    theme: "standard",
    badge: "Official",
  },
  {
    id: "carto-positron",
    name: "CartoDB Positron (Light)",
    url: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
    subdomains: ["a", "b", "c", "d"],
    maxZoom: 20,
    minZoom: 1,
    description: "Clean, low-contrast grayscale base layer designed to emphasize data visualizations and markers.",
    theme: "light",
    badge: "Minimalist",
  },
  {
    id: "carto-dark",
    name: "CartoDB Dark Matter (Dark)",
    url: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
    subdomains: ["a", "b", "c", "d"],
    maxZoom: 20,
    minZoom: 1,
    description: "Sleek dark theme map based on OpenStreetMap data, perfect for night mode.",
    theme: "dark",
    badge: "Night Mode",
  },
  {
    id: "osm-hot",
    name: "OSM Humanitarian (HOT)",
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a>',
    subdomains: ["a", "b", "c"],
    maxZoom: 19,
    minZoom: 1,
    description: "Warm, high-contrast map style created for humanitarian mapping and crisis response.",
    theme: "humanitarian",
    badge: "HOT Style",
  },
  {
    id: "opentopo",
    name: "OpenTopoMap (Topographic)",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org" target="_blank">OpenTopoMap</a>',
    subdomains: ["a", "b", "c"],
    maxZoom: 17,
    minZoom: 1,
    description: "Topographic map with elevation contour lines and mountain relief shading.",
    theme: "topo",
    badge: "Topography",
  },
];
