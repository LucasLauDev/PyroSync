# 🔥 PyroSync: NASA FIRMS Harmonized Fire Activity Calendar & Analytics Platform
## Comprehensive Project Dossier & Feature Architecture

---

## 📌 Executive Summary & Project Mission

**PyroSync** is an interactive Earth observation web platform that harmonizes **26 years (2000–2026)** of NASA satellite active fire observations into a unified burning activity calendar, interactive map canvas, and multi-dimensional analytics suite.

Satellites have tracked active fire hotspots across the globe for over two decades. However, this historical record is divided between two distinct generations of satellite instruments: NASA's legacy **MODIS** sensors (aboard the Terra and Aqua satellites, operational since late 2000) and modern **VIIRS** sensors (aboard Suomi-NPP, NOAA-20, and NOAA-21, operational since 2012). 

Because VIIRS has an 86% smaller pixel footprint ($0.14\text{ km}^2$ vs. $1.0\text{ km}^2$) and detects fires at a fraction of the thermal energy threshold ($0.5\text{ MW}$ vs. $3.7\text{ MW}$), VIIRS naturally detects **4 to 12 times more fire hotspots** over the exact same fire complex. Concatenating raw records directly produces an artificial, dramatic spike in fire counts after 2012, creating false alarms for land managers and distorting long-term climate studies. Furthermore, on **November 2, 2026 (Day of Year 306)**, the primary Suomi-NPP satellite permanently ceased active fire telemetry, while legacy Terra and Aqua satellites drift toward retirement in 2027.

PyroSync solves this crisis by mathematically harmonizing these records into a continuous timeline where true environmental trends—rather than satellite sensor differences—take center stage. Designed for wildland firefighters, emergency responders, land managers, and climate scientists, PyroSync enables users to track live fire perimeters, evaluate current burning against 26-year historical medians, uncover hidden nocturnal peatland smoldering, and anticipate critical fire conditions before they become catastrophic megafires.

---

## 🔬 Scientific Harmonization: How the Underlying Engine Works

To produce a seamless 2000–2026 timeline that non-technical users can trust, PyroSync's underlying data engine performs four critical scientific calibrations:

1. **Bioclimatic Footprint Continuity Scaling ($k_{\text{ratio}}$)**:
   Fire regimes vary dramatically depending on local vegetation and canopy cover. PyroSync applies regional continuity calibration factors across 13 major global bioclimatic regimes (such as $\times 10.8$ for the Amazon, $\times 8.6$ for Southeast Asian peatlands, and $\times 6.2$ for Canadian boreal forests). These factors align VIIRS hotspot volumes with the long-term MODIS historical baseline.
2. **Sensor Angle & Radiative Energy Calibration**:
   As satellites scan toward the edges of their swaths, optical distortion dilutes thermal sensitivity. PyroSync calibrates Fire Radiative Power (measured in Megawatts, MW) across viewing angles to ensure thermal intensity remains comparable between different satellites and orbital paths.
3. **Smooth Operational Satellite Handover (DOY 306 Transition)**:
   When Suomi-NPP telemetry abruptly ended on November 2, 2026, PyroSync's pipeline automatically transferred observation weight to the Joint Polar Satellite System (JPSS) sensors—NOAA-20 and NOAA-21—ensuring uninterrupted daily tracking throughout the operational window without an artificial drop in fire counts.
4. **Outlier-Resilient Anomaly Detection**:
   Wildfire records are heavily skewed by rare, catastrophic seasons (such as the 2015 Indonesian peat fires or the 2023 Canadian megafires). Using standard statistical averages would artificially inflate baseline expectations, masking emerging fire surges. PyroSync instead uses non-parametric medians and Interquartile Ranges (IQR) to calculate a **Robust Z-Score ($Z_{\text{robust}}$)**. Any score exceeding $+2.0\sigma$ instantly alerts users to a statistically significant outbreak, while scores below $-2.0\sigma$ denote unusual fire deficits.

---

## 🧭 Comprehensive Feature Inventory & How Each Feature Works

PyroSync integrates two synchronized primary workspaces—the **Interactive Map View** and the **Fire Analysis Dashboard**—comprising nine fully realized functional modules:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PYROSYNC CORE FEATURE MODULES                             │
├──────────────────────────────────────────┬─────────────────────────────────────────────┤
│ 🗺️ Geospatial & Mapping Capabilities    │ 📊 Multi-Decadal Analytics & Intelligence   │
├──────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 1. High-Performance Interactive Map      │ 5. 26-Year Burning Activity Calendar Matrix │
│ 2. Tactical Mapping & Measurement Tools  │ 6. Harmonized 7-Chart Analytics Dashboard   │
│ 3. Custom Area of Interest (AOI) Engine  │ 7. Dual-Region Comparative Analysis Engine  │
│ 4. Advanced Temporal Date Range Picker   │ 8. 13 Bioclimatic Regimes Directory         │
│                                          │ 9. Research-Grade Data Export Engine        │
└──────────────────────────────────────────┴─────────────────────────────────────────────┘
```

### 1. High-Performance Interactive Map Canvas
* **How It Works**: Built using an optimized HTML5 2D Canvas rendering engine (Leaflet 2.0-beta), the map plots over 2,500 active satellite hotspots simultaneously with fluid, 60 FPS panning and zooming, completely avoiding browser memory slowdowns.
* **Dynamic Hotspot Styling**: Hotspots are dynamically color-coded by thermal energy release (FRP from 0 to 500+ MW) and diurnal phase—flaming yellow/orange for daytime fires, and deep purple/crimson for nocturnal fires.
* **5 Professional Basemap Styles**:
  * *CartoDB Dark Matter*: Ultra-high contrast dark canvas that accentuates thermal fire hotspots.
  * *OpenStreetMap Standard*: Standard cartography showing towns, road networks, and municipal boundaries.
  * *CartoDB Positron*: Clean, minimalist grayscale canvas ideal for visual clarity and report printing.
  * *OSM Humanitarian (HOT)*: Highlights vulnerable settlements, road infrastructure, and crisis facilities.
  * *OpenTopoMap*: Elevation contours and shaded terrain relief to evaluate mountain-driven fire behavior.
* **Hotspot Inspection Modal**: Clicking any fire marker opens an on-screen telemetry modal revealing the satellite platform (Terra, Aqua, Suomi-NPP, NOAA-20, NOAA-21), instrument package (MODIS or VIIRS), acquisition date and UTC time, decimal coordinates, raw vs. harmonized FRP, brightness temperature in Kelvin, detection confidence rating, and diurnal day/night classification.

### 2. Tactical Mapping & Measurement Tools
* **Distance Ruler**: A multi-point polyline tool that allows users to click across active fire perimeters, automatically calculating total distance in both metric (km/m) and imperial (mi/ft) units.
* **Circular Radius Buffer**: Allows users to drop a radius circle anywhere on the globe, displaying the total enclosed land area in square kilometers ($\text{km}^2$).
* **GPS Geolocation**: Instantly zooms the map to the user's current device coordinates with an accuracy radius indicator.
* **Custom Pin Dropper**: Allows incident commanders to drop custom markers on the map to label incident command posts, observation towers, or threatened assets.
* **Telemetry HUD (Heads-Up Display)**: A persistent status bar at the bottom of the screen displaying real-time cursor coordinates, map zoom level, and active AOI fire counts.

### 3. Custom Area of Interest (AOI) Definition Engine
* **How It Works**: Users can restrict all map visualizations, calendar matrices, and analytical graphs to any custom geographic boundary on Earth through three distinct workflows:
  1. *Interactive Bounding Box*: Click two opposing corners directly on the map to draw a rectangular bounding box.
  2. *Interactive Circle Buffer*: Click any map location to establish an instant radius buffer (1 to 500 km).
  3. *Coordinate & Radius Entry Modal*: Manually input exact latitude, longitude, and radius numbers.
* **8 Global One-Click Presets**: Fast-teleport directly to planetary fire hotspots:
  * *Central Amazon Rainforest* (Deforestation and savanna clearing)
  * *Pantanal Wetlands* (Subtropical marshland fires)
  * *Kalimantan Peatlands, Borneo* (Subterranean peat swamp fires)
  * *Southern California Chaparral* (Wind-driven autumn brushfires)
  * *Northern Alberta Boreal Forest* (Lightning-ignited Canadian boreal megafires)
  * *Yakutia Siberian Taiga* (High-latitude permafrost forest fires)
  * *New South Wales Bushfire Zone* (Australian eucalyptus fire complexes)
  * *Miombo Woodlands, Africa* (High-frequency dry-season savanna burning)

### 4. Advanced Temporal Filtering (`FireDateRangeCalendar`)
* **How It Works**: A custom-engineered calendar component spanning the full 26-year timeline from **January 1, 2000 through November 9, 2026**. Users can click any start and end date, jump across decades using dropdown selectors, or activate one of **five single-click quick presets**:
  * `7d`: Post-Suomi-NPP handover operational window (Nov 2 – Nov 9, 2026).
  * `30d`: Last 30 days of active fire monitoring.
  * `Oct '26`: Peak 2026 fire season window.
  * `Full NRT`: Complete 61-day Near-Real-Time operational series (Sep 10 – Nov 9, 2026).
  * `All`: Complete 26-year multi-decadal historical climatology (2000–2026).

### 5. 26-Year Harmonized Burning Activity Calendar Matrix
* **How It Works**: The core visual intelligence feature displays a complete **26-year $\times$ 12-month matrix (312 interactive monthly cells)**, providing an immediate birds-eye view of multi-decade fire history.
* **Accessible Scientific Color Ramps**: Users can toggle between four perceptually uniform colormaps:
  * *Flame*: Classic thermal progression (Pale Yellow $\rightarrow$ Orange $\rightarrow$ Fire Red $\rightarrow$ Maroon).
  * *Viridis*: Colorblind-safe sequential ramp (Purple $\rightarrow$ Blue $\rightarrow$ Teal $\rightarrow$ Yellow).
  * *Inferno*: High-contrast black-body radiation ramp (Black $\rightarrow$ Violet $\rightarrow$ Red $\rightarrow$ Gold).
  * *Diverging Anomaly*: Cool blue (fire suppression/deficit) $\rightarrow$ Neutral slate $\rightarrow$ Deep red (severe outbreak).
* **Multiple Analytical Metrics**: Toggle the matrix values between Harmonized Hotspot Counts, Active Fire Hex-Days (Uber H3 Resolution 7 footprint), Total Radiative Energy (FRP MW), Relative Anomaly %, and Robust Z-Score ($\sigma$).
* **Interactive Synchronization**: Clicking any cell in the 26-year matrix automatically configures the application to that month and year, flying the map directly to that region.
* **Season Timing Indicators**: Automatically computes and marks the dry-season onset (10% cumulative threshold), peak month (50%), and cessation month (90%) for every year.

### 6. Harmonized 7-Chart Analytics Dashboard
* **How It Works**: The platform renders seven specialized, interactive charts (built with Chart.js v4) simultaneously in an open dashboard, ensuring all analytical perspectives are visible without hiding behind tabs:
  1. **Cumulative Season Progression Curve**: Plots Day-of-Year (DOY 1–365) fire buildup against the 26-year historical median envelope and historical benchmark years to identify whether a season is tracking ahead of normal.
  2. **Monthly Robust Z-Score Anomalies**: Pinpoints statistically abnormal fire surges ($>+2.0\sigma$) or deficits ($<-2.0\sigma$) for each month.
  3. **FRP Radiative Power & Mean Severity**: A dual-axis visualization comparing total regional energy output (MW) against the average severity per detected fire.
  4. **Diurnal Cycle & Smoldering Ratio**: A doughnut chart isolating daytime flaming fires from nocturnal low-temperature smoldering.
  5. **Seasonal Climatology Profile**: A 12-month polar radar chart defining the seasonal dry-season burning window.
  6. **26-Year Historical Annual Burden**: A multi-decade bar chart displaying annual totals benchmarked against the 26-year median line.
  7. **61-Day Daily Operational Fire Activity**: High-resolution daily tracking across September–November 2026, explicitly noting the November 2 (DOY 306) Suomi-NPP cessation and transition to NOAA-20/21.

### 7. Dual-Region Comparative Analysis Engine (`FireComparison`)
* **How It Works**: Enables side-by-side comparative diagnostics between two independent configurations (Input 1 Amber vs. Input 2 Cyan). Users can compare two different bioclimatic regions, two distinct years (e.g., 2026 vs. the 2015 El Niño), or day vs. night burning.
* **Automated 9-Metric Differential Matrix**: Generates a side-by-side comparison table calculating exact percentage differences ($\Delta\%$) across:
  1. Annual Fire Burden (Total Detections)
  2. Total Thermal Energy Release (FRP MW)
  3. Mean Fire Severity (MW / Detection)
  4. Peak Month Timing & Intensity
  5. Nocturnal Peatland Smoldering Ratio (%)
  6. Active Fire Hexagonal Spatial Footprint
  7. Fire Season Duration (Months)
  8. Dry-Season Timing Shift
  9. 26-Year Climatological Percentile Rank
* **5 Synchronized Comparative Visuals**: Side-by-side cumulative curves, anomaly bars, diurnal doughnuts, seasonal radar plots, and multi-decadal historical histories.

### 8. 13 Bioclimatic Regimes Directory
* **How It Works**: The application categorizes global fire activity into 13 major ecological regimes (Global Aggregate, Amazon/South America, Southeast Asia, Central America, Australia/New Zealand, South Asia, Europe, USA/Hawaii, Siberian Russia, Canada, Alaska, Northern/Central Africa, and Southern Africa), each with its own customized seasonality weights and continuity factors.

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
   * **Geostationary Satellite Ingestion**: Integrating 10-to-15 minute cadence feeds from GOES-R, Himawari-9, and Meteosat for real-time fire spread tracking throughout the day.
   * **AI-Driven Fire Spread & Fuel Moisture Prediction**: Incorporating machine learning models combining satellite FRP with NASA SMAP soil moisture and weather forecasts to predict 48-hour fire propagation.
   * **Offline Mobile Progressive Web App (PWA)**: Enabling wildland fire crews in remote, disconnected backcountry to cache maps and data on tablets.
   * **Automated Early Warning Webhooks**: Allowing users to set custom bounding boxes and receive automated alerts via SMS, Slack, or email when fire anomalies exceed critical thresholds.

---

## 🛠️ Tools, Coding Languages, and Software Used

* 💻 **Languages**: TypeScript, Python, HTML5, CSS3
* ⚡ **Framework & Web**: Next.js 16, React 19, Node.js
* 🗺️ **Interactive Mapping**: Leaflet 2.0 (Canvas Engine), OpenStreetMap, CartoDB, OpenTopoMap
* 📊 **Data Visualizations**: Chart.js v4
* 🎨 **UI & Design**: Tailwind CSS, Radix UI, shadcn/ui, Tabler Icons
* 📡 **Satellite Earth Observation Feeds**: NASA FIRMS (MODIS Terra/Aqua, VIIRS Suomi-NPP, NOAA-20, NOAA-21)

---

## 🤖 Declaration of AI Use

In accordance with competition guidelines, we declare that **Antigravity** (Google DeepMind) was used to assist in implementing the Minimum Viable Product (MVP) of this project.

---

## 📄 License & Attribution

* **Software License**: Open-source under the [MIT License](file:///c:/Users/lauta/Documents/nasa/LICENSE).
* **Data Attribution**: Active fire satellite observations courtesy of the **NASA Earth Science Data and Information System (ESDIS) Project** via [NASA FIRMS](https://www.earthdata.nasa.gov/data/tools/firms).
* **Cartographic Attribution**: Basemaps and map tiles courtesy of **OpenStreetMap contributors**, **CartoDB**, **Humanitarian OpenStreetMap Team (HOT)**, and **OpenTopoMap**.
