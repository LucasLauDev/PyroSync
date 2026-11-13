# 🔥 PyroSync: NASA FIRMS Harmonized Fire Activity Calendar & Analytics Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-2.0--beta-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?style=for-the-badge&logo=chart.js)](https://www.chartjs.org/)
[![NASA FIRMS](https://img.shields.io/badge/Data-NASA_FIRMS_LANCE-E03C31?style=for-the-badge&logo=nasa)](https://firms.modaps.eosdis.nasa.gov/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**PyroSync** is an enterprise-grade, responsive Earth observation web application harmonizing **26 years (2000–2026)** of multi-satellite active fire hotspot observations across the globe. Built with **Next.js 16 (Turbopack)**, **Leaflet 2.0**, **Chart.js v4**, and **shadcn/ui**, the platform bridges historical MODIS records with high-resolution VIIRS sensors into an unified burning activity calendar, robust anomaly detection engine, and interactive geospatial telemetry suite.

> 📖 **Comprehensive Stakeholder & Architecture Guide**: For an exhaustive breakdown of all system functionalities, scientific harmonization algorithms, stakeholder value matrices, and technical specifications, see [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md).

---

## 📋 Table of Contents
1. [Key Capabilities](#-key-capabilities)
2. [Scientific Background & Harmonization](#-scientific-background--harmonization)
3. [System Architecture](#-system-architecture)
4. [Visual Tour & Modules](#-visual-tour--modules)
5. [Data Pipeline & Ingestion](#-data-pipeline--ingestion)
6. [API Reference](#-api-reference)
7. [Getting Started](#-getting-started)
8. [Target User Personas](#-target-user-personas)
9. [Acknowledgements](#-acknowledgements)
10. [License](#-license)

---

## 🌟 Key Capabilities

### 🗺️ High-Performance Interactive Map View
* **Hardware-Accelerated Canvas Rendering**: Visualizes thousands of satellite hotspot detections simultaneously using Leaflet 2.0-beta Canvas layers without browser sluggishness.
* **Fire Radiative Power (FRP) & Diurnal Styling**: Hotspots dynamically styled by radiative power (0–500+ MW) and day/night detection status (yellow/orange for daytime flaming, purple/crimson for nocturnal peatland smoldering).
* **Multi-Basemap Engine**: Seamless switching between:
  * **OpenStreetMap Standard** (Default official cartography)
  * **CartoDB Dark Matter** (High-contrast night analysis)
  * **CartoDB Positron** (Clean minimalist light canvas)
  * **OSM Humanitarian (HOT)** (Crisis response & relief mapping)
  * **OpenTopoMap** (Topographical contours & terrain relief)
* **Area of Interest (AOI) Definition**: Filter hotspots via interactive interactive map bounding or custom coordinate input (`North, South, East, West` bounding box).
* **Hotspot Telemetry & Inspection**: Click any fire marker to open a detailed modal showing satellite platform, sensor package, brightness temperatures ($T_{21}$, $T_{31}$, $I_4$, $I_5$), confidence rating, acquisition time (UTC), and FRP.

### 📅 Calendar & Date Range Filtering
* **Dedicated Date Range Calendar Picker**: Custom calendar component covering the full 2000–2026 timeline with month-by-month grid navigation, direct day clicking, active range highlights, and quick presets:
  * *Last 7 Days*
  * *Last 30 Days*
  * *October 2026 Peak Season*
  * *Full 2026 NRT Operational Window*
  * *26-Year Historical Climatology (2000–2026)*

### 📊 26-Year Harmonized Burning Activity Calendar Matrix
* **26-Year $\times$ 12-Month Matrix Grid**: Visualizes monthly fire frequency from 2000 to 2026 across 13 major global bioclimatic regimes.
* **Perceptually Uniform Color Ramps**: Choose between scientific colormaps: **Inferno** (default), **Turbo**, **Magma**, **Plasma**, **Viridis**, and **Cividis** (colorblind-safe).
* **Normalization Modes**: Toggle between **Relative Scaling** (per-region peak normalization) and **Absolute Hotspot Counts**.
* **Cell Inspection**: Hover or click any month/year cell to view exact counts, historical ranking, and climatological variance.

### 📈 Harmonized Analytical Visualizations (Chart.js v4)
All analytical charts render simultaneously in a unified responsive dashboard without hiding behind tabs:
1. **Cumulative Season Progression** *(Line / Filled Area)*: Tracks cumulative fire buildup through Day of Year (DOY 1–365) comparing the current season against the 26-year median envelope.
2. **Monthly Robust Z-Score Anomalies** *(Bar)*: Highlights statistically significant fire surges or suppressions using median/IQR robust statistics ($Z_{\text{robust}} > +2.0\sigma$).
3. **FRP Radiative Power & Mean Severity** *(Dual-Axis Bar + Line)*: Tracks total radiative energy release (MW) alongside mean severity per detection.
4. **Diurnal Cycle & Smoldering Ratio** *(Doughnut)*: Separates flaming daytime fires from smoldering nocturnal fires (critical for tropical peatland tracking).
5. **Seasonal Burning Climatology Profile** *(Polar Area)*: 12-month radar distribution illustrating regional dry season burn windows.
6. **26-Year Annual Fire Burdens (2000–2026)** *(Bar)*: Multi-decade inter-annual variability and long-term trend analysis.
7. **61-Day Operational Daily Fire Activity** *(Bar)*: High-resolution daily tracking across September–November 2026.

### 📥 Data Export & Download
* **Tailored CSV Export**: Download filtered hotspot observations according to selected AOI boundaries, date ranges, sensor sources, and minimum FRP thresholds.
* **Automated Metadata Ingestion**: Pre-calculated summary statistics, bounding envelopes, and temporal metadata included.

---

## 🔬 Scientific Background & Harmonization

Satellite fire detection instruments have evolved substantially over the past three decades:
* **MODIS (Terra & Aqua)**: Operational since 2000, 1 km spatial resolution at nadir, with 4 daily overpasses.
* **VIIRS (Suomi-NPP, NOAA-20, NOAA-21)**: Operational since 2012, 375 m spatial resolution at nadir with enhanced sensitivity to small and cool-smoldering fires.

Because VIIRS detects substantially more low-intensity hotspots than MODIS in the same footprint, directly comparing raw counts across decades produces artificial upward trends.

### Harmonization Methodology
This platform implements the harmonization framework formulated in *Harmonized Fire Calendar Web App* research:
1. **Footprint & Sensitivity Normalization**: VIIRS counts are scaled and cross-calibrated against MODIS historical baselines to ensure long-term time-series continuity.
2. **Diurnal Overpass Synchronization**: Harmonizes solar noon/afternoon observations (MODIS Aqua + VIIRS) and morning observations (MODIS Terra) into consistent daily aggregations.
3. **Robust Climatological Anomaly Detection**:
   $$\text{Anomaly} = \frac{X_{\text{month}} - \widetilde{X}_{\text{hist}}}{\text{IQR}_{\text{hist}} / 1.349}$$
   Using historical median ($\widetilde{X}$) and Interquartile Range ($\text{IQR}$) rather than mean and standard deviation prevents extreme fire years (e.g. 2015 El Niño) from skewing normal baselines.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Next.js 16 (Turbopack)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Top Navigation (Header)                                                    │
│  ├── View Switcher: [🗺️ Map View]  |  [📊 Fire Analysis]                    │
│  ├── Active Bioclimatic Region Badge (e.g., Southeast Asia, Africa)         │
│  └── Telemetry HUD: Active Hotspots | Mean FRP | Sensor Breakdown           │
├──────────────────────────────────────┬──────────────────────────────────────┤
│               MAP VIEW               │            ANALYSIS VIEW             │
├──────────────────────────────────────┼──────────────────────────────────────┤
│  Map Sidebar (Explorer):             │  Harmonized Analytics (4 Tabs):      │
│  ├── Date Range Calendar Component   │  ├── 1. Harmonized Charts (Chart.js) │
│  │   (Quick Presets + Day Picker)    │  ├── 2. 26-Yr Calendar Matrix (Heat) │
│  ├── 13 Bioclimatic Regime Select    │  ├── 3. Dual-Region Comparison Side  │
│  ├── Sensor Filter (MODIS / VIIRS)   │  └── 4. 13 Bio-Regimes Overview      │
│  ├── Diurnal Filter (Day / Night)    │                                      │
│  ├── FRP Threshold Slider (0–500 MW) │                                      │
│  └── Custom AOI Boundary & Export    │                                      │
│                                      │                                      │
│  Interactive Leaflet 2.0 Canvas:     │                                      │
│  ├── Multi-Basemap Switcher (OSM,    │                                      │
│  │   CartoDB Dark/Light, HOT, Topo)  │                                      │
│  ├── Hardware Canvas Hotspot Layer   │                                      │
│  └── Hotspot Detail Inspection Modal │                                      │
├──────────────────────────────────────┴──────────────────────────────────────┤
│  Next.js Server API Routes (/api/hotspots, /api/calendar, /api/export-csv)  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Optimized Static Data Store (public/data/hotspots/*.json, calendar.json)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧭 Visual Tour & Modules

### 1. 13 Bioclimatic Regimes Supported
* 🌏 **SouthEast Asia** (Tropical peatlands & agricultural burning)
* 🌍 **Northern and Central Africa** (Savanna fire belts)
* 🌍 **Southern Africa** (Miombo woodlands & seasonal savanna)
* 🌎 **South America** (Amazon basin & Cerrado biomes)
* 🌎 **Central America**
* 🇺🇸 **USA (Contiguous & Hawaii)**
* 🇨🇦 **Canada** (Boreal forest systems)
* ❄️ **Alaska** (Tundra & subarctic burning)
* 🏰 **Europe** (Mediterranean & temperate fires)
* 🌲 **Russia & Northern Asia** (Siberian taiga)
* 🇮🇳 **South Asia** (Agricultural residue burning)
* 🦘 **Australia & New Zealand** (Bushfire & eucalyptus zones)
* 🌐 **Global Aggregate**

---

## 🛠️ Data Pipeline & Ingestion

The repository includes a Python pipeline ([`scripts/process_nasa_data.py`](file:///c:/Users/lauta/Documents/nasa/scripts/process_nasa_data.py)) that digests raw NASA FIRMS NRT text files from:
- `MODIS_C6_1` (MCD14DL NRT)
- `SUOMI_VIIRS_C2` (VNP14IMGTDL NRT)
- `J1_VIIRS_C2` (VJ114IMGTDL NRT - NOAA-20)
- `J2_VIIRS_C2` (VJ214IMGTDL NRT - NOAA-21)

```bash
# Run data harmonization and JSON compilation pipeline
python scripts/process_nasa_data.py
```

The script outputs optimized, statically queryable JSON structures into `public/data/`:
* `public/data/hotspots/<Region>.json`: Indexed geographic points with FRP, date, sensor, and diurnal status.
* `public/data/calendar_2000_2026.json`: Complete 26-year monthly matrix records and robust anomaly statistics.
* `public/data/daily_summary.json`: High-resolution daily counts and diurnal proportions.

---

## 📡 API Reference

The web app provides built-in Next.js REST API routes:

### 1. `GET /api/hotspots`
Retrieves filtered active fire hotspots within a date range and geographic boundary.
* **Query Parameters:**
  * `region` (string): Region name (e.g. `SouthEast_Asia`, `Global`). Default: `SouthEast_Asia`.
  * `startDate` (string, `YYYY-MM-DD`): Earliest detection date.
  * `endDate` (string, `YYYY-MM-DD`): Latest detection date.
  * `sensor` (string): `all` | `MODIS` | `VIIRS`.
  * `daynight` (string): `all` | `D` (Day) | `N` (Night).
  * `minFrp` (number): Minimum FRP in Megawatts.
  * `bbox` (string): Optional bounding box `minLng,minLat,maxLng,maxLat`.

### 2. `GET /api/calendar`
Returns the 26-year monthly burning matrix and climatological statistics for the requested region.
* **Query Parameters:**
  * `region` (string): Bioclimatic region name.

### 3. `GET /api/export-csv`
Streams a formatted CSV file of hotspot records matching the active filters.
* **Query Parameters:** Same as `/api/hotspots`.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.18+` or `v20+`
* **Package Manager**: `pnpm` (recommended), `npm`, or `yarn`
* **Python**: `3.9+` (optional, only required to re-run data processing scripts)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/LucasLauDev/nasa.git
   cd nasa
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to explore the application.

### Building for Production
```bash
# Build optimized static and dynamic Next.js bundle
pnpm build

# Start production server
pnpm start
```

---

## 👥 Target User Personas

* 🚨 **Emergency & Early Warning Responders**: Monitor fire surges in real-time, inspect radiative intensity, and track rapid expansions.
* 👨‍🚒 **Firefighters & Incident Commanders**: Assess day vs. night burn activity to forecast diurnal smoldering versus flaming behavior.
* 🌲 **Land Managers & Forestry Officials**: Compare current season fire burdens against 26-year historical medians to evaluate policy and moratorium efficacy.
* 🔬 **Earth Scientists & Climate Researchers**: Analyze robust multi-decade fire anomalies and seasonal shifts across diverse bioclimatic zones.

---

## 🙏 Acknowledgements

* **NASA Earth Science Data and Information System (ESDIS) Project**: For providing near-real-time and historical fire data via [NASA FIRMS](https://earthdata.nasa.gov/firms).
* **MODIS & VIIRS Science Teams**: At NASA Goddard Space Flight Center and NOAA.
* **OpenStreetMap & CartoDB**: For reliable geospatial basemaps and cartography.
* **Shadcn UI & Radix Primitives**: For accessible and responsive interface foundations.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
