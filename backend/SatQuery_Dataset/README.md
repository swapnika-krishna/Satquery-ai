# SatQuery AI — Sample Multispectral Dataset

Supporting dataset for **SATQUERY AI – Interactive Vision-Language Assistant for
Multimodal Remote Sensing Image Analysis**, focused on Sentinel-2 multispectral
imagery over **Andhra Pradesh, Telangana, and surrounding regions of India**.

---

## ⚠️ Honesty notice — read this first

**The GeoTIFF pixel data shipped in `scenes/` in this package is SYNTHETIC
PLACEHOLDER DATA, not real Sentinel-2 satellite imagery.**

Generating or downloading actual satellite pixels requires live internet
access to Copernicus Dataspace / AWS Earth Search / Microsoft Planetary
Computer, which was not available in the environment that built this package.
Rather than fabricate fake pixels and call them "real," this package instead
gives you:

1. The **complete, correct folder structure** your backend expects.
2. **Realistic metadata** (real Indian locations, real Sentinel-2 band specs,
   real coordinate systems, plausible cloud %, plausible dates).
3. Placeholder rasters whose **statistics are realistic** per land-cover type
   (so NDVI/NDWI/NDBI computed from them behave sensibly — vegetation-heavy
   scenes show high NDVI, urban scenes show high NDBI, etc.) — good enough to
   develop and test your entire pipeline end-to-end.
4. A **working `download_dataset.py`** script that pulls **REAL** Sentinel-2
   scenes for the exact same 16 locations from public STAC catalogs, so you
   can replace the placeholders with genuine satellite data before you go to
   production or publish results.

Every `metadata.json` and `scenes.csv` row explicitly marks
`"is_real_satellite_data": false` / `"data_source": "synthetic_placeholder"`
for the shipped data, and `download_dataset.py` writes
`"is_real_satellite_data": true` / `"data_source": "real_sentinel2_stac"` once
you run it and replace the files with real imagery.

**Do not present the shipped placeholder rasters as real satellite
observations in a paper, demo, or production system.** Run `download_dataset.py`
first if you need real pixels.

---

## Folder structure

```
SatQuery_Dataset/
│
├── scenes/
│   ├── scene_001/
│   │   ├── B03.tif          Green band  (10 m)
│   │   ├── B04.tif          Red band    (10 m)
│   │   ├── B08.tif          NIR band    (10 m)
│   │   ├── B11.tif          SWIR1 band  (20 m, native)
│   │   ├── metadata.json    Per-scene metadata (location, dates, CRS, bands, honesty flags)
│   │   ├── NDVI.tif         Written by calculate_indices.py
│   │   ├── NDWI.tif         Written by calculate_indices.py
│   │   ├── NDBI.tif         Written by calculate_indices.py
│   │   ├── index_stats.json Written by calculate_indices.py
│   │   └── heatmaps/        Written by generate_heatmaps.py
│   │       ├── NDVI_heatmap.png
│   │       ├── NDWI_heatmap.png
│   │       └── NDBI_heatmap.png
│   ├── scene_002/ ... scene_016/  (same structure)
│
├── metadata/
│   └── scenes.csv            All scenes' metadata in one table
│
├── rgb_previews/
│   ├── scene_001.jpg         Quick-look composite (R=B04, G=B03, pseudo-B)
│   └── ...
│
├── download_dataset.py        Downloads REAL Sentinel-2 scenes (STAC APIs)
├── calculate_indices.py       Computes NDVI / NDWI / NDBI from the 4 bands
├── generate_heatmaps.py       Renders scientific heatmap PNGs from the indices
├── requirements.txt
└── README.md                  This file
```

16 scenes are included, covering: Guntur, Vijayawada, Amaravati, Hyderabad,
Visakhapatnam, Krishna Delta, Kakinada, Nellore, Warangal, Nizamabad,
Tirupati, Rajahmundry, Karimnagar, Ongole, Machilipatnam, Khammam.

> Note: `rgb_previews/` uses B04 (red) and B03 (green) plus a *derived*
> pseudo-blue channel (there is no true B02/Blue band in this dataset, per the
> project spec, which only calls for B03/B04/B08/B11). These previews are for
> quick visual inspection only, not photometrically accurate true-color.

---

## Sentinel-2 band reference (real specification)

| Band | Name  | Wavelength | Native resolution | Used for |
|------|-------|-----------|--------------------|----------|
| B03  | Green | 560 nm    | 10 m               | NDWI |
| B04  | Red   | 665 nm    | 10 m               | NDVI, NDBI (denominator) |
| B08  | NIR   | 842 nm    | 10 m               | NDVI, NDWI, NDBI |
| B11  | SWIR1 | 1610 nm   | 20 m (resampled to 10 m for index math) | NDBI |

## Indices computed

```
NDVI = (B08 - B04) / (B08 + B04)     # vegetation health / density
NDWI = (B03 - B08) / (B03 + B08)     # surface water content
NDBI = (B11 - B08) / (B11 + B08)     # built-up / urban surfaces
```

All three are written as float32 GeoTIFFs clipped to [-1, 1], on B04's 10 m
grid (B11 is bilinearly resampled from 20 m → 10 m first).

---

## Getting REAL Sentinel-2 data

```bash
pip install -r requirements.txt
python3 download_dataset.py --start 2024-01-01 --end 2024-06-30 --cloud-max 20
```

This searches **Microsoft Planetary Computer** first (falls back to **AWS
Earth Search / Element84**), both of which host free, public, no-API-key-required
Sentinel-2 L2A Cloud-Optimized GeoTIFFs. For each of the 16 locations it:

1. Finds the least-cloudy scene in your date window.
2. Downloads a small windowed crop (~2.5 km × 2.5 km) around the point for
   bands B03, B04, B08, B11 — not the full ~100×100 km tile, keeping file
   sizes manageable.
3. Overwrites `scenes/<scene_id>/*.tif` and writes a fresh `metadata.json`
   marked `"is_real_satellite_data": true`.

Then re-run the index and heatmap scripts on the real data:

```bash
python3 calculate_indices.py --scenes-dir scenes
python3 generate_heatmaps.py --scenes-dir scenes
```

**Requires outbound internet access.** If you're behind a firewall, allow
`planetarycomputer.microsoft.com` and/or `earth-search.aws.element84.com`
(plus their underlying blob/S3 storage endpoints).

Alternative real-data sources you can adapt the script for:
- **Copernicus Data Space Ecosystem** (dataspace.copernicus.eu) — official ESA source, needs free account + OAuth token.
- **USGS EarthExplorer** (earthexplorer.usgs.gov) — free account required.
- **Google Earth Engine** (earthengine.google.com) — needs a GEE account; great for large-scale time-series export.

---

## Integrating with a Node.js / Express backend

Two integration patterns work well depending on how much geospatial
processing you want on the Node side vs. pre-baked on the Python side.

### Option A — Serve pre-computed artifacts (simplest, recommended for a demo/API)

Keep all heavy geospatial work in Python (this package already does it) and
have Express serve the *results*: metadata JSON, index GeoTIFFs, and heatmap
PNGs as static files / JSON responses.

```js
// server.js
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const DATASET_ROOT = path.join(__dirname, "SatQuery_Dataset");

// Serve heatmaps and previews as static files
app.use("/static/heatmaps", express.static(path.join(DATASET_ROOT, "scenes")));
app.use("/static/previews", express.static(path.join(DATASET_ROOT, "rgb_previews")));

// List all scenes (from metadata/scenes.csv, parsed once at startup)
const csv = require("csv-parser");
let scenesTable = [];
fs.createReadStream(path.join(DATASET_ROOT, "metadata", "scenes.csv"))
  .pipe(csv())
  .on("data", (row) => scenesTable.push(row))
  .on("end", () => console.log(`Loaded ${scenesTable.length} scenes`));

app.get("/api/scenes", (req, res) => res.json(scenesTable));

app.get("/api/scenes/:id", (req, res) => {
  const metaPath = path.join(DATASET_ROOT, "scenes", req.params.id, "metadata.json");
  if (!fs.existsSync(metaPath)) return res.status(404).json({ error: "scene not found" });
  res.json(JSON.parse(fs.readFileSync(metaPath, "utf-8")));
});

app.get("/api/scenes/:id/indices", (req, res) => {
  const statsPath = path.join(DATASET_ROOT, "scenes", req.params.id, "index_stats.json");
  if (!fs.existsSync(statsPath)) return res.status(404).json({ error: "indices not computed yet" });
  res.json(JSON.parse(fs.readFileSync(statsPath, "utf-8")));
});

// e.g. GET /api/scenes/scene_001/heatmap/NDVI -> PNG
app.get("/api/scenes/:id/heatmap/:index", (req, res) => {
  const p = path.join(DATASET_ROOT, "scenes", req.params.id, "heatmaps", `${req.params.index}_heatmap.png`);
  if (!fs.existsSync(p)) return res.status(404).json({ error: "heatmap not found" });
  res.sendFile(p);
});

app.listen(3000, () => console.log("SatQuery AI backend on http://localhost:3000"));
```

Your Node backend never needs to touch GeoTIFF/GDAL directly — Python does
the heavy lifting (`calculate_indices.py`, `generate_heatmaps.py`), and Node
just exposes the results (JSON + PNGs) to your frontend / LLM agent.

### Option B — Read GeoTIFFs directly in Node (if you need raw pixel access)

If your Vision-Language pipeline needs raw NDVI/NDWI/NDBI pixel arrays inside
Node (e.g., to feed a model or compute custom stats on the fly), use
[`geotiff.js`](https://www.npmjs.com/package/geotiff) (pure JS, no native GDAL
binary needed):

```bash
npm install geotiff
```

```js
const GeoTIFF = require("geotiff");

async function readIndexRaster(tifPath) {
  const tiff = await GeoTIFF.fromFile(tifPath);
  const image = await tiff.getImage();
  const raster = await image.readRasters(); // raster[0] = Float32Array of NDVI/NDWI/NDBI values
  return {
    width: image.getWidth(),
    height: image.getHeight(),
    bbox: image.getBoundingBox(),
    data: raster[0],
  };
}
```

This lets your Express API return raw pixel arrays (or derive on-the-fly
stats/crops) without shelling out to Python, at the cost of reimplementing
any advanced GDAL-level operations (reprojection, resampling) in JS or via a
native binding like `node-gdal-async`.

### Recommended pipeline for SatQuery AI end-to-end

```
[download_dataset.py]  ->  real B03/B04/B08/B11 GeoTIFFs
        │
        ▼
[calculate_indices.py] ->  NDVI.tif / NDWI.tif / NDBI.tif + index_stats.json
        │
        ▼
[generate_heatmaps.py] ->  heatmap PNGs (scientifically colored, colorbar included)
        │
        ▼
[Node/Express backend] ->  exposes /api/scenes, /api/scenes/:id, /api/scenes/:id/heatmap/:index
        │
        ▼
[SatQuery AI VLM layer] ->  consumes metadata + index stats + heatmap images as
                             grounding context for natural-language Q&A about
                             the scene (e.g. "How much vegetation loss near
                             Guntur between these two dates?")
```

---

## Regenerating the placeholder dataset

If you ever need to rebuild the synthetic placeholder scenes (e.g., to add
more locations or change the chip size), the generator script used to build
this package (`build_placeholder_dataset.py`) is included for transparency —
run it only if you understand it produces **non-real** data:

```bash
python3 build_placeholder_dataset.py
```

---

## License / attribution

Real Sentinel-2 data (once downloaded via `download_dataset.py`) is provided
by the Copernicus Programme (ESA) and is free and open under the Copernicus
Sentinel Data Terms and Conditions. Attribution: "Contains modified
Copernicus Sentinel data, processed by [your project name]."
