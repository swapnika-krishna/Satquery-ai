#!/usr/bin/env python3
"""
build_placeholder_dataset.py
-----------------------------
Generates the FOLDER STRUCTURE, METADATA, and PLACEHOLDER band rasters for the
SatQuery AI sample dataset.

*** IMPORTANT / HONESTY NOTICE ***
This script does NOT download or reproduce real Sentinel-2 satellite imagery.
Actual satellite pixel data requires network access to Copernicus Dataspace /
AWS Earth Search / Microsoft Planetary Computer, which is not available in
this generation environment.

The GeoTIFFs produced here are SYNTHETIC PLACEHOLDERS only:
  - They mimic realistic Sentinel-2 L2A value ranges (0-10000 reflectance*1e4,
    uint16, per-band statistics roughly matching vegetation/water/urban/soil
    mixtures typical of coastal Andhra Pradesh / Telangana) so that indices
    (NDVI/NDWI/NDBI) computed from them behave sensibly and the pipeline can
    be developed/tested end-to-end.
  - They are NOT real satellite captures. Every metadata.json explicitly sets
    "is_real_satellite_data": false and "data_source": "synthetic_placeholder".
  - To get REAL Sentinel-2 scenes for the same locations, run download_dataset.py
    (included in this package) which pulls actual imagery from a public STAC
    catalog (Microsoft Planetary Computer / AWS Earth Search).

Run:
    python3 build_placeholder_dataset.py
"""

import os
import json
import csv
import datetime
import numpy as np
import rasterio
from rasterio.transform import from_origin
from PIL import Image

OUT_ROOT = "SatQuery_Dataset"
SCENES_DIR = os.path.join(OUT_ROOT, "scenes")
META_DIR = os.path.join(OUT_ROOT, "metadata")
PREVIEW_DIR = os.path.join(OUT_ROOT, "rgb_previews")

SIZE = 256  # pixels per side (small sample chip, keeps files light)
PIXEL_SIZE_10M_DEG = 10 / 111320.0   # approx degrees per 10m at equator-ish latitude
PIXEL_SIZE_20M_DEG = 20 / 111320.0

# Realistic locations across Andhra Pradesh / Telangana / coastal AP
LOCATIONS = [
    {"name": "Guntur City",              "region": "Guntur District, Andhra Pradesh",        "lat": 16.3067, "lon": 80.4365, "landcover": "urban_agri_mix"},
    {"name": "Vijayawada",                "region": "NTR District, Andhra Pradesh",           "lat": 16.5062, "lon": 80.6480, "landcover": "urban_river"},
    {"name": "Amaravati Capital Region",   "region": "Guntur District, Andhra Pradesh",        "lat": 16.5138, "lon": 80.5185, "landcover": "agri_urban_dev"},
    {"name": "Hyderabad (HITEC City)",     "region": "Telangana",                              "lat": 17.4483, "lon": 78.3915, "landcover": "urban_dense"},
    {"name": "Visakhapatnam Coast",        "region": "Visakhapatnam District, Andhra Pradesh", "lat": 17.6868, "lon": 83.2185, "landcover": "coastal_urban"},
    {"name": "Krishna Delta",              "region": "Krishna District, Andhra Pradesh",       "lat": 16.1667, "lon": 81.1333, "landcover": "agri_delta"},
    {"name": "Kakinada Coastal Belt",      "region": "East Godavari District, Andhra Pradesh", "lat": 16.9891, "lon": 82.2475, "landcover": "coastal_agri"},
    {"name": "Nellore",                    "region": "SPSR Nellore District, Andhra Pradesh",  "lat": 14.4426, "lon": 79.9865, "landcover": "agri_coastal"},
    {"name": "Warangal",                   "region": "Telangana",                              "lat": 17.9689, "lon": 79.5941, "landcover": "urban_agri"},
    {"name": "Nizamabad",                  "region": "Telangana",                              "lat": 18.6725, "lon": 78.0941, "landcover": "agri_rural"},
    {"name": "Tirupati",                   "region": "Chittoor District, Andhra Pradesh",      "lat": 13.6288, "lon": 79.4192, "landcover": "hilly_urban"},
    {"name": "Rajahmundry",                "region": "East Godavari District, Andhra Pradesh", "lat": 17.0005, "lon": 81.8040, "landcover": "river_agri"},
    {"name": "Karimnagar",                 "region": "Telangana",                              "lat": 18.4386, "lon": 79.1288, "landcover": "agri_rural"},
    {"name": "Ongole",                     "region": "Prakasam District, Andhra Pradesh",      "lat": 15.5057, "lon": 80.0499, "landcover": "coastal_agri"},
    {"name": "Machilipatnam",              "region": "Krishna District, Andhra Pradesh",       "lat": 16.1875, "lon": 81.1389, "landcover": "coastal_wetland"},
    {"name": "Khammam",                    "region": "Telangana",                              "lat": 17.2473, "lon": 80.1514, "landcover": "agri_forest"},
]

# Sentinel-2 band metadata (real spec values — these ARE accurate regardless of placeholder pixels)
BAND_INFO = {
    "B03": {"name": "Green",           "wavelength_nm": 560,  "native_resolution_m": 10},
    "B04": {"name": "Red",             "wavelength_nm": 665,  "native_resolution_m": 10},
    "B08": {"name": "Near Infrared (NIR)", "wavelength_nm": 842, "native_resolution_m": 10},
    "B11": {"name": "Short-Wave Infrared (SWIR1)", "wavelength_nm": 1610, "native_resolution_m": 20},
}


def landcover_reflectance_profile(landcover):
    """
    Returns approximate mean reflectance (scaled 0-10000, Sentinel-2 L2A style)
    for B03/B04/B08/B11 based on typical literature values for each land-cover
    mixture. These are illustrative means used only to make the SYNTHETIC
    placeholder rasters behave realistically (vegetation -> high NIR/low red,
    water -> low NIR/high green, urban -> high SWIR/red, etc.)
    """
    profiles = {
        "urban_agri_mix":   {"B03": 1400, "B04": 1600, "B08": 2600, "B11": 2800},
        "urban_river":      {"B03": 1300, "B04": 1500, "B08": 2400, "B11": 2600},
        "agri_urban_dev":   {"B03": 1200, "B04": 1300, "B08": 3200, "B11": 2300},
        "urban_dense":      {"B03": 1500, "B04": 1800, "B08": 2000, "B11": 3200},
        "coastal_urban":    {"B03": 1400, "B04": 1500, "B08": 2200, "B11": 2500},
        "agri_delta":       {"B03": 1100, "B04": 1000, "B08": 3800, "B11": 1800},
        "coastal_agri":     {"B03": 1150, "B04": 1050, "B08": 3600, "B11": 1900},
        "agri_coastal":     {"B03": 1150, "B04": 1050, "B08": 3500, "B11": 1900},
        "urban_agri":       {"B03": 1350, "B04": 1450, "B08": 2700, "B11": 2600},
        "agri_rural":       {"B03": 1100, "B04": 950,  "B08": 4000, "B11": 1700},
        "hilly_urban":      {"B03": 1300, "B04": 1400, "B08": 2600, "B11": 2400},
        "river_agri":       {"B03": 1150, "B04": 1050, "B08": 3400, "B11": 1900},
        "coastal_wetland":  {"B03": 1600, "B04": 1200, "B08": 1800, "B11": 1600},
        "agri_forest":      {"B03": 1050, "B04": 900,  "B08": 4200, "B11": 1600},
    }
    return profiles.get(landcover, {"B03": 1300, "B04": 1300, "B08": 2800, "B11": 2200})


def make_band_array(mean_val, size, seed, texture_scale=350):
    """Create a spatially-correlated synthetic band array around a target mean."""
    rng = np.random.default_rng(seed)
    base = rng.normal(loc=mean_val, scale=texture_scale, size=(size, size))
    # smooth to create spatial correlation (simple box blur passes)
    for _ in range(3):
        base = (
            np.roll(base, 1, axis=0) + np.roll(base, -1, axis=0) +
            np.roll(base, 1, axis=1) + np.roll(base, -1, axis=1) + base
        ) / 5.0
    base = np.clip(base, 1, 10000).astype(np.uint16)
    return base


def write_band_tif(path, array, lon, lat, pixel_size_deg):
    transform = from_origin(lon, lat, pixel_size_deg, pixel_size_deg)
    with rasterio.open(
        path, "w",
        driver="GTiff",
        height=array.shape[0],
        width=array.shape[1],
        count=1,
        dtype=array.dtype,
        crs="EPSG:4326",
        transform=transform,
        compress="lzw",
    ) as dst:
        dst.write(array, 1)


def main():
    os.makedirs(SCENES_DIR, exist_ok=True)
    os.makedirs(META_DIR, exist_ok=True)
    os.makedirs(PREVIEW_DIR, exist_ok=True)

    csv_rows = []
    base_date = datetime.date(2024, 1, 15)

    for i, loc in enumerate(LOCATIONS, start=1):
        scene_id = f"scene_{i:03d}"
        scene_dir = os.path.join(SCENES_DIR, scene_id)
        os.makedirs(scene_dir, exist_ok=True)

        profile = landcover_reflectance_profile(loc["landcover"])
        acquisition_date = (base_date + datetime.timedelta(days=i * 11)).isoformat()
        cloud_pct = round(float(np.random.default_rng(i).uniform(0, 18)), 2)

        bands_written = {}
        for band, mean_val in profile.items():
            res_m = BAND_INFO[band]["native_resolution_m"]
            px_deg = PIXEL_SIZE_10M_DEG if res_m == 10 else PIXEL_SIZE_20M_DEG
            arr = make_band_array(mean_val, SIZE, seed=hash((scene_id, band)) % (2**31))
            band_path = os.path.join(scene_dir, f"{band}.tif")
            write_band_tif(band_path, arr, loc["lon"], loc["lat"], px_deg)
            bands_written[band] = {
                "file": f"{band}.tif",
                "description": BAND_INFO[band]["name"],
                "wavelength_nm": BAND_INFO[band]["wavelength_nm"],
                "native_resolution_m": BAND_INFO[band]["native_resolution_m"],
                "dtype": "uint16",
                "scale_factor": 0.0001,
                "value_range_note": "Scaled reflectance (L2A style), 0-10000 ~ 0.0-1.0 reflectance"
            }

        metadata = {
            "scene_id": scene_id,
            "satellite": "Sentinel-2",
            "instrument": "MSI (MultiSpectral Instrument)",
            "product_level": "L2A (Bottom-of-Atmosphere reflectance) - style",
            "location_name": loc["name"],
            "region": loc["region"],
            "latitude": loc["lat"],
            "longitude": loc["lon"],
            "acquisition_date": acquisition_date,
            "cloud_percentage": cloud_pct,
            "crs": "EPSG:4326",
            "spatial_resolution_m": {"B03": 10, "B04": 10, "B08": 10, "B11": 20},
            "chip_size_px": SIZE,
            "bands": bands_written,
            "indices_supported": ["NDVI", "NDWI", "NDBI"],
            "data_source": "synthetic_placeholder",
            "is_real_satellite_data": False,
            "notice": (
                "Pixel values in this scene are SYNTHETICALLY GENERATED to mimic "
                "realistic Sentinel-2 L2A reflectance statistics for this land-cover "
                "type. They are placeholders for pipeline development/testing only "
                "and must not be treated as, or reported as, real satellite "
                "observations. Use download_dataset.py to fetch real Sentinel-2 "
                "scenes for this location."
            ),
        }
        with open(os.path.join(scene_dir, "metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)

        # RGB-ish false/true-color-like preview (B04=R, B03=G, and a derived pseudo-blue
        # since no B02 band is included in this dataset per spec) — clearly a PREVIEW only.
        r = os.path.join(scene_dir, "B04.tif")
        g = os.path.join(scene_dir, "B03.tif")
        with rasterio.open(r) as rr, rasterio.open(g) as gg:
            red = rr.read(1).astype(np.float32)
            green = gg.read(1).astype(np.float32)
        pseudo_blue = (green * 0.8).astype(np.float32)  # approximation only, noted in README

        def norm(a):
            a = np.clip(a, 0, 4000)
            return (a / 4000.0 * 255).astype(np.uint8)

        rgb = np.dstack([norm(red), norm(green), norm(pseudo_blue)])
        Image.fromarray(rgb, mode="RGB").save(os.path.join(PREVIEW_DIR, f"{scene_id}.jpg"), quality=90)

        csv_rows.append({
            "scene_id": scene_id,
            "satellite": "Sentinel-2",
            "location_name": loc["name"],
            "region": loc["region"],
            "latitude": loc["lat"],
            "longitude": loc["lon"],
            "acquisition_date": acquisition_date,
            "cloud_percentage": cloud_pct,
            "crs": "EPSG:4326",
            "resolution_10m_bands": "B03,B04,B08",
            "resolution_20m_bands": "B11",
            "data_source": "synthetic_placeholder",
            "is_real_satellite_data": False,
        })

        print(f"Built {scene_id}: {loc['name']} ({loc['region']})")

    with open(os.path.join(META_DIR, "scenes.csv"), "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(csv_rows[0].keys()))
        writer.writeheader()
        writer.writerows(csv_rows)

    print(f"\nDone. {len(LOCATIONS)} scenes created under {SCENES_DIR}")
    print("REMINDER: all pixel data is synthetic placeholder data, not real satellite imagery.")


if __name__ == "__main__":
    main()
