# 🔥 PyroSync: NASA FIRMS Harmonized Fire Activity Calendar & Analytics Platform
## Comprehensive Project Dossier & Scientific Architecture

---

## 📌 Executive Summary & Project Mission

**PyroSync** is an interactive Earth observation web platform that harmonizes **26 years of continuous active fire observations (November 2000 – November 2026)** from NASA satellites into a unified burning activity calendar, interactive map canvas, and multi-dimensional analytics suite.

Satellites have tracked active fire hotspots across the globe for over two decades. However, this historical record is divided between two distinct generations of NASA Earth observation sensors:
* **MODIS** (Moderate Resolution Imaging Spectroradiometer): Aboard the Terra satellite (operational fire record starting in **November 2000**, following early-2000 detector calibration) and the Aqua satellite (operational since **July 2002**).
* **VIIRS** (Visible Infrared Imaging Radiometer Suite): The VIIRS active fire record began aboard **Suomi-NPP in January 2012**, and was later augmented by **NOAA-20 (January 2020)** and **NOAA-21 (January 2024)**.

### The Continuity Dilemma
Comparing these two sensor records directly produces severe scientific distortions due to fundamental differences in instrument physics:
1. **Pixel Footprint Area**: A VIIRS 375 m I-band pixel covers approximately 0.14 km² at nadir, compared to 1.0 km² for a 1 km MODIS pixel—representing an **~86% reduction in pixel footprint area** at nadir (both pixel footprints expand toward the scan edges).
2. **Thermal Energy Sensitivity**: Under clear-sky nadir nighttime conditions, the MODIS Collection 6.1 Fire Radiative Power (FRP) detection limit is ~3.7 MW, whereas VIIRS reliably detects fires down to ~0.5 MW, with daytime off-nadir MODIS thresholds reaching up to 40 MW (*Sofiev & Kouznetsov 2026, Geosci. Model Dev.*).
3. **Apparent Detection Spike**: Because of its finer spatial footprint and heightened sensitivity, VIIRS detects **~4–10× more fire pixels** over identical burn complexes depending on the region (*Vadrevu et al. 2018; Zhang et al. 2017*), reaching up to ~11–12× in dense tropical canopies such as the Amazon. Directly concatenating raw detections creates an artificial upward step-change after 2012, triggering false alarms for land managers and distorting multi-decade climate trends.
4. **The 2026 Satellite Transition**: At 13:00 UTC on **November 2, 2026 (Day of Year 306)**, the primary Suomi-NPP satellite ceased delivering new operational fire telemetry, while legacy Terra and Aqua platforms drift toward decommissioning in late 2026 / 2027. (Historical Suomi-NPP observations remain fully preserved in NASA archives).

PyroSync solves this crisis by mathematically harmonizing these records into a continuous timeline where genuine fire activity—rather than sensor artifacts—takes center stage. Designed for wildland firefighters, emergency responders, land managers, and climate scientists, PyroSync enables users to track live fire perimeters, evaluate current burning against 26-year historical medians, uncover hidden nocturnal peatland smoldering, and anticipate critical fire conditions before they become catastrophic megafires.

---

## 🔬 Scientific Harmonization: How the Underlying Engine Works

To produce a seamless multi-decadal record that non-technical users can rely on, PyroSync's underlying data engine performs four critical scientific calibrations:

### 1. Regional Footprint Continuity Scaling (Cross-Sensor Empirical Ratio Scaling)
Fire detection ratios vary across Earth's biomes due to canopy density, fuel structure, and typical fire size. PyroSync applies **Cross-Sensor Empirical Ratio Scaling** derived from multi-year co-observation ratios (2012–2026) across **13 geographic and bioclimatic regions** (a worldwide Global Aggregate plus 12 regional biomes, including 10.8× for South America, 8.6× for Southeast Asia, and 6.2× for Canadian boreal forests). These scaling factors normalize VIIRS hotspot volumes to MODIS-equivalent baselines, ensuring time-series continuity.

### 2. View Zenith Angle (VZA) & Thermal Energy Recalibration (Angular Sensitivity Calibration)
As satellites scan toward swath edges, off-nadir optical distortion dilutes sensitivity (*Li et al. 2018, Remote Sens.*). PyroSync applies **Viewing Zenith Angle (VZA) Angular Recalibration** to Fire Radiative Power (FRP in Megawatts, MW) across scan angles to align cross-sensor saturation curves (achieving high cross-sensor linear correlation) so that energy measurements remain comparable regardless of viewing geometry.

### 3. Operational Sensor Handover Modeling (DOY 306 Handover)
When Suomi-NPP ceased delivering new telemetry on November 2, 2026, PyroSync's pipeline seamlessly transitioned observation weights to the Joint Polar Satellite System (JPSS) instruments—NOAA-20 and NOAA-21. Because these sensors share identical VIIRS optics and fly in the same orbital plane approximately 50 minutes apart, this handover ensures continuous daily monitoring without artificial drops in detected fire volume.

### 4. Outlier-Resilient Anomaly Detection (IQR-Based Robust Standardization)
Wildfire distributions are heavily right-skewed by rare megafire years (such as the 2015 Indonesian El Niño peat crisis or the 2023 Canadian fires). Using standard parametric means and standard deviations would inflate historical baselines, obscuring emerging fire surges. 

PyroSync instead implements **Interquartile Range (IQR) Robust Standardization (Robust Z-Score)** across the 2000–2025 historical baseline period. By standardizing observations using the historical median and interquartile range (scaled for normal-distribution equivalence) rather than a skewed mean, this algorithm produces an anomaly score that is immune to distortion from extreme megafire seasons. Any standardized anomaly exceeding +2.0σ triggers an immediate outbreak alert, while scores below -2.0σ indicate unusual fire suppression.

---

## 🧭 Comprehensive Feature Inventory & How Each Feature Works

PyroSync integrates two synchronized primary workspaces—the **Interactive Map View** and the **Fire Analysis Dashboard**—spanning nine fully realized functional modules:

### 1. High-Performance Interactive Map Canvas
* **How It Works**: Built using **Leaflet 2.0-beta with its hardware-accelerated Canvas renderer**, the map plots over 2,500 active satellite hotspots simultaneously with fluid, 60 FPS client-side rendering, avoiding browser memory bloat.
* **Dynamic Styling by FRP & Diurnal Phase**: Hotspots are dynamically styled by radiative power (0 to 500+ MW) and diurnal phase—flaming yellow/orange for daytime fires, and deep purple/crimson for nocturnal peatland smoldering.
* **5 Professional Basemap Styles**:
  * *CartoDB Dark Matter*: Ultra-high contrast dark canvas that accentuates thermal fire hotspots.
  * *OpenStreetMap Standard*: Standard cartography showing towns, road networks, and municipal borders.
  * *CartoDB Positron*: Clean, minimalist grayscale canvas ideal for visual clarity and report printing.
  * *OSM Humanitarian (HOT)*: Highlights vulnerable settlements, road infrastructure, and crisis facilities.
  * *OpenTopoMap*: Elevation contours and shaded mountain relief to evaluate terrain-driven fire behavior.
* **Hotspot Inspection Modal**: Clicking any fire marker opens an on-screen telemetry modal revealing the satellite platform (Terra, Aqua, Suomi-NPP, NOAA-20, NOAA-21), instrument package (MODIS or VIIRS), acquisition date and UTC time, decimal coordinates, raw vs. harmonized FRP, brightness temperature in Kelvin, harmonized categorical confidence rating (`nominal`, `high`, `low`—harmonizing MODIS's 0–100% scale with VIIRS's categorical classes), and diurnal day/night classification.

### 2. Tactical Mapping & Measurement Tools
* **Distance Ruler**: A multi-point polyline tool that allows users to click across active fire perimeters, automatically calculating total distance in both metric (km/m) and imperial (mi/ft) units.
* **Circular Radius Buffer**: Allows users to drop a radius circle anywhere on the globe, displaying the total enclosed land area in square kilometers (km²).
* **GPS Geolocation**: Instantly zooms the map to the user's current device coordinates with an accuracy radius indicator.
* **Custom Pin Dropper**: Allows incident commanders to drop custom markers on the map to label incident command posts, observation towers, or threatened infrastructure.
* **Telemetry HUD (Heads-Up Display)**: A persistent status bar at the bottom of the screen displaying real-time cursor coordinates, map zoom level, and active AOI fire counts.

### 3. Custom Area of Interest (AOI) Definition Engine
* **How It Works**: Users can restrict all map visualizations, calendar matrices, and analytical graphs to any custom geographic boundary on Earth through three distinct workflows:
  1. *Interactive Bounding Box*: Click two opposing corners directly on the map to draw a rectangular bounding box.
  2. *Interactive Circle Buffer*: Click any map location to establish an instant radius buffer (1 to 500 km).
  3. *Coordinate & Radius Entry Modal*: Manually input exact latitude, longitude, and radius values.
* **8 Global One-Click Presets**: Fast-teleport directly to planetary fire epicenters:
  * *Central Amazon Rainforest* (Deforestation and savanna clearing)
  * *Pantanal Wetlands* (Subtropical marshland fires)
  * *Kalimantan Peatlands, Borneo* (Subterranean peat swamp fires)
  * *Southern California Chaparral* (Wind-driven autumn brushfires)
  * *Northern Alberta Boreal Forest* (Lightning-ignited Canadian boreal megafires)
  * *Yakutia Siberian Taiga* (High-latitude permafrost forest fires)
  * *New South Wales Bushfire Zone* (Australian eucalyptus fire complexes)
  * *Miombo Woodlands, Africa* (High-frequency dry-season savanna burning)

### 4. Advanced Temporal Filtering (`FireDateRangeCalendar`)
* **How It Works**: A custom-engineered calendar component spanning the satellite observation era from **November 1, 2000 through November 9, 2026**. Users can click any start and end date, navigate decades using dropdown selectors, or activate one of **five single-click quick presets**:
  * `7d`: Post-handover operational window (**November 3 – November 9, 2026**, exactly 7 days post-Suomi-NPP transition).
  * `30d`: Last 30 days of active fire monitoring.
  * `Oct '26`: Peak 2026 fire season window.
  * `Full NRT`: Complete 61-day Near-Real-Time operational series (September 10 – November 9, 2026).
  * `All`: Complete 26-year observational record (November 2000 – November 2026).

### 5. 26-Year Harmonized Burning Activity Calendar Matrix
* **How It Works**: Displays a multi-decadal matrix spanning **26 continuous observation years (November 2000 – November 2026)** across 27 calendar years (324 monthly cells; 312 full-year monthly cells for 2001–2026 plus the late-2000 record inception).
* **Accessible Scientific Color Ramps**: Users can toggle between established, scientifically validated colormaps as encouraged by challenge guidelines:
  * *Viridis*: Established perceptually uniform and colorblind-safe sequential ramp (Purple → Blue → Teal → Yellow).
  * *Inferno*: High-contrast perceptually uniform black-body radiation ramp (Black → Violet → Red → Gold).
  * *Flame*: Intuitive high-contrast thermal progression (Pale Yellow → Orange → Fire Red → Maroon).
  * *Diverging Anomaly*: Cool blue (fire suppression/deficit) → Neutral slate → Deep red (severe outbreak).
* **Multiple Analytical Metrics**: Toggle cell values between Harmonized Hotspot Counts, Active Fire Hex-Days (Uber H3 Resolution 7 footprint), Total Radiative Energy (FRP MW), Relative Anomaly %, and Robust Z-Score (σ).
* **Interactive Synchronization**: Clicking any cell in the matrix automatically configures the application to that month and year, flying the map camera directly to that regional slice.
* **Season Timing Indicators**: Automatically computes and displays critical seasonal milestones:
  * **Season Onset**: 10% cumulative fire volume threshold.
  * **Season Midpoint / Median Timing**: 50% cumulative threshold (the temporal midpoint of the season).
  * **Season Cessation**: 90% cumulative threshold.
  * **Peak Burning Month**: The specific month with the maximum active fire volume (Argmax Peak Detection).

### 6. Harmonized 7-Chart Analytics Dashboard
* **How It Works**: The platform renders seven specialized, interactive charts (built with Chart.js v4) simultaneously in an open dashboard, ensuring all analytical angles remain visible without hiding behind tabs:
  1. **Cumulative Season Progression Curve**: Plots Day-of-Year (DOY 1–365) fire buildup against the 26-year historical median envelope and historical benchmark years to identify whether a season is tracking ahead of normal.
  2. **Monthly Robust Z-Score Anomalies**: Pinpoints statistically abnormal fire surges (> +2.0σ) or deficits (< -2.0σ) for each month.
  3. **FRP Radiative Power & Mean Severity**: A dual-axis visualization comparing total regional energy output (MW) against the average severity per detected fire.
  4. **Diurnal Cycle & Smoldering Ratio**: A doughnut chart isolating daytime flaming fires from nocturnal low-temperature smoldering.
  5. **Seasonal Climatology Profile**: A 12-month polar radar chart defining the seasonal dry-season burning window.
  6. **26-Year Historical Annual Burden**: A multi-decade bar chart displaying annual totals benchmarked against the 26-year median line.
  7. **61-Day Daily Operational Fire Activity**: High-resolution daily tracking across September–November 2026, explicitly noting the November 2 (DOY 306) Suomi-NPP cessation and transition to NOAA-20/21.

### 7. Dual-Region Comparative Analysis Engine (`FireComparison`)
* **How It Works**: Enables side-by-side comparative diagnostics between two independent configurations (Input 1 Amber vs. Input 2 Cyan). Users can compare two different bioclimatic regions, two distinct years (e.g., 2026 vs. the 2015 El Niño), or day vs. night burning.
* **Automated 9-Metric Differential Matrix**: Generates a side-by-side comparison table calculating percentage variance (Differential Matrix Analysis) across:
  1. Annual Fire Burden (Total Detections)
  2. Total Thermal Energy Release (FRP MW)
  3. Mean Fire Severity (MW / Detection)
  4. Peak Month Timing & Intensity
  5. Nocturnal Peatland Smoldering Ratio (%)
  6. Active Fire Hexagonal Spatial Footprint
  7. Fire Season Duration (Months)
  8. Dry-Season Timing Shift
  9. 26-Year Climatological Percentile Rank
* **5 Synchronized Comparative Visuals**: Side-by-side cumulative curves, anomaly bars, diurnal doughnuts, seasonal radar plots, and multi-decadal historical series.

### 8. 13 Geographic & Bioclimatic Regions Directory
* **How It Works**: Categorizes global fire activity into 13 major geographic and ecological regions: the worldwide Global Aggregate plus 12 regional biomes (South America, Southeast Asia, Central America, Australia/New Zealand, South Asia, Europe, USA/Hawaii, Siberian Russia, Canada, Alaska, Northern/Central Africa, and Southern Africa), each with customized seasonality weights and continuity calibration factors.

### 9. Research-Grade Data Export Engine
* **How It Works**: Allows users to download the exact data matching their active filters with a single click in standard CSV format:
  * *Point-Level Hotspot CSV (16-Column Schema)*: Includes unique hotspot ID, exact coordinates, acquisition date and UTC time, sensor, satellite platform, raw and harmonized FRP, brightness temperature, confidence rating, day/night code, and AOI flag.
  * *26-Year Monthly Calendar Matrix CSV (14-Column Schema)*: Includes year, month, raw MODIS count, raw VIIRS count, harmonized count, active hex-days, total FRP, historical median, IQR, anomaly percentage, robust Z-score, and monthly trend differences.

---

## 👥 Operational Benefits & Stakeholder Impact

PyroSync provides direct, high-value outcomes across critical wildfire management domains:

* **🚨 Emergency Responders & Disaster Agencies (e.g., FEMA, NDMA)**:
  * **Benefit**: Rapid situational awareness of active fire perimeters and intensity without browser freezing or slow page loads.
  * **Impact**: Faster evacuation orders and prioritized resource dispatch to threatened communities.
* **👨‍🚒 Wildland Firefighters & Incident Commanders**:
  * **Benefit**: Clear separation of daytime flaming from nocturnal smoldering ratios.
  * **Impact**: Prevents flare-up surprises. In peatlands and boreal forests, night fires smolder underground and can explosively reignite crown fires the following afternoon.
* **🌲 Forestry Services & Land Managers**:
  * **Benefit**: Evaluates active burning against the true 26-year historical median rather than artificial satellite spikes.
  * **Impact**: Eliminates false alarms caused by sensor upgrades, enabling fair, evidence-based enforcement of agricultural burning bans.
* **🔬 Climate Scientists & Atmospheric Modelers**:
  * **Benefit**: Ready access to a pre-harmonized, outlier-resistant 26-year fire history.
  * **Impact**: Improves global smoke, carbon emission, and climate feedback modeling without requiring months of manual satellite data re-calibration.
* **🏛️ Policymakers & Environmental Panels**:
  * **Benefit**: Side-by-side comparative diagnostics to evaluate regional environmental shifts.
  * **Impact**: Quantifies the real-world impact of conservation policies and zero-deforestation accords.

---

## 🎯 Project Goals & Future Roadmap

1. **Transforming Wildfire Response from Reactive to Anticipatory**:
   Traditional firefighting mobilizes after megafires have already escaped containment. By tracking cumulative Day-of-Year progression curves against historical thresholds, PyroSync helps agencies anticipate abnormal fire seasons weeks before peak dryness occurs.
2. **Global Data Democratization**:
   High-level satellite fire intelligence has traditionally been locked behind complex GIS desktop suites or expensive server software. PyroSync runs entirely in standard web browsers, making world-class satellite fire analytics freely accessible to foresters and communities worldwide.
3. **Future Development Roadmap**:
   * **Geostationary Satellite Ingestion**: Integrating 10-to-15 minute cadence observations from GOES-R, Himawari-9, and Meteosat (which are already distributed within NASA FIRMS) for real-time diurnal fire spread tracking.
   * **AI-Driven Fire Spread & Fuel Moisture Prediction**: Incorporating predictive machine learning models combining satellite FRP with NASA SMAP soil moisture and weather forecasts to predict 48-hour fire propagation.
   * **Offline Mobile Progressive Web App (PWA)**: Enabling wildland fire crews in remote backcountry to cache maps and data on ruggedized tablets.
   * **Automated Early Warning Webhooks**: Allowing users to set custom geographic bounding boxes and receive automated alerts via SMS, Slack, or email when fire anomalies exceed critical thresholds.

---

## 🛠️ Tools, Coding Languages, and Software Used

* 💻 **Languages**: TypeScript 5.8+, Python 3.11+, HTML5, CSS3
* ⚡ **Framework & Web**: Next.js 16 (App Router, Turbopack), React 19, Node.js LTS
* 🗺️ **Interactive Mapping**: Leaflet 2.0-beta (Canvas Renderer), OpenStreetMap, CartoDB (CARTO), OpenTopoMap
* 📊 **Data Visualizations**: Chart.js v4 (react-chartjs-2)
* 🎨 **UI & Design**: Tailwind CSS, Radix UI Primitives, shadcn/ui, Tabler Icons
* 📡 **Satellite Earth Observation Feeds**: NASA Earthdata LANCE FIRMS (MODIS Terra/Aqua, VIIRS Suomi-NPP, NOAA-20, NOAA-21)

---

## 🤖 Declaration of Super Intelligence (SI) & Artificial Intelligence Use

In accordance with the 2026 NASA Space Apps Challenge guidelines (Submission Guide & FAQ regarding Super Intelligence / Artificial Intelligence assistance), we declare that **Google Antigravity** (powered by Gemini models) was utilized as an agentic Super Intelligence assistant in conceptualizing, architecting, and implementing the Minimum Viable Product (MVP) of PyroSync.

---

## 📄 License & Attribution

* **Software License**: Open-source under the [MIT License](LICENSE).
* **Data Attribution**: Active fire satellite observations courtesy of the **NASA Earth Science Data and Information System (ESDIS) Project** via [NASA FIRMS](https://www.earthdata.nasa.gov/data/tools/firms).
* **Cartographic Attribution**: Basemaps and map tiles courtesy of **OpenStreetMap contributors**, **CartoDB (CARTO)**, **Humanitarian OpenStreetMap Team (HOT)**, and **OpenTopoMap**.
* **Open-Source Software**: Leaflet (BSD-2-Clause), Chart.js (MIT), Next.js (MIT), React (MIT), Tailwind CSS (MIT), Radix UI (MIT).
* **Scientific Literature Cited**:
  * Sofiev, M., & Kouznetsov, R. (2026). Evaluation of the fire radiative power products from MODIS and VIIRS. *Geoscientific Model Development*, 19, 10123–10142.
  * Vadrevu, K. P., et al. (2018). Fire regime characteristics in South and Southeast Asia—A satellite perspective. *Remote Sensing of Environment*.
  * Zhang, T., et al. (2017). Estimating active fire radiative power from VIIRS. *Remote Sensing of Environment*.
  * Li, F., et al. (2018). The impact of view zenith angle on MODIS and VIIRS active fire detections. *Remote Sensing*.
