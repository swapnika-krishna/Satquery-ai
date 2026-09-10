#!/usr/bin/env python3
"""
download_dataset.py
--------------------
Downloads REAL Sentinel-2 L2A imagery (bands B03, B04, B08, B11) for the
Andhra Pradesh / Telangana locations used in this project, from public,
free-to-use STAC (SpatioTemporal Asset Catalog) APIs:

  1) Microsoft Planetary Computer  -> https://planetarycomputer.microsoft.com/
     Catalog: "sentinel-2-l2a"  (no API key needed, but requires a short-lived
     SAS token that the `planetary-computer` package fetches automatically)

  2) AWS Earth Search (Element 84) -> https://earth-search.aws.element84.com/v1
     Catalog: "sentinel-2-l2a"  (public, no auth needed, but requester pays
     may apply for some AWS regions - reading via COG range requests is free)

This script tries Planetary Computer first, then falls back to AWS Earth
Search. It searches for the least-cloudy scene within a date window over
each location, then downloads (as Cloud-Optimized GeoTIFF windows/full files)
the 4 bands needed: B03 (Green), B04 (Red), B08 (NIR), B11 (SWIR1).

Usage:
    pip install -r requirements.txt
    python3 download_dataset.py --start 2024-01-01 --end 2024-03-31 --cloud-max 20

Requires internet access. Run this on your own machine / server — it will
NOT work inside a sandboxed environment without outbound internet access.
"""

import argparse
import json
import os
import sys

import requests

# Same locations as the placeholder dataset, so real scenes replace the
# synthetic ones 1:1, scene_001 .. scene_016
LOCATIONS = [
    {"scene_id": "scene_001", "name": "Guntur City",            "lat": 16.3067, "lon": 80.4365},
    {"scene_id": "scene_002", "name": "Vijayawada",              "lat": 16.5062, "lon": 80.6480},
    {"scene_id": "scene_003", "name": "Amaravati Capital Region","lat": 16.5138, "lon": 80.5185},
    {"scene_id": "scene_004", "name": "Hyderabad (HITEC City)",  "lat": 17.4483, "lon": 78.3915},
    {"scene_id": "scene_005", "name": "Visakhapatnam Coast",     "lat": 17.6868, "lon": 83.2185},
    {"scene_id": "scene_006", "name": "Krishna Delta",           "lat": 16.1667, "lon": 81.1333},
    {"scene_id": "scene_007", "name": "Kakinada Coastal Belt",   "lat": 16.9891, "lon": 82.2475},
    {"scene_id": "scene_008", "name": "Nellore",                 "lat": 14.4426, "lon": 79.9865},
    {"scene_id": "scene_009", "name": "Warangal",                "lat": 17.9689, "lon": 79.5941},
    {"scene_id": "scene_010", "name": "Nizamabad",               "lat": 18.6725, "lon": 78.0941},
    {"scene_id": "scene_011", "name": "Tirupati",                "lat": 13.6288, "lon": 79.4192},
    {"scene_id": "scene_012", "name": "Rajahmundry",             "lat": 17.0005, "lon": 81.8040},
    {"scene_id": "scene_013", "name": "Karimnagar",              "lat": 18.4386, "lon": 79.1288},
    {"scene_id": "scene_014", "name": "Ongole",                  "lat": 15.5057, "lon": 80.0499},
    {"scene_id": "scene_015", "name": "Machilipatnam",           "lat": 16.1875, "lon": 81.1389},
    {"scene_id": "scene_016", "name": "Khammam",                 "lat": 17.2473, "lon": 80.1514},
]

BANDS_NEEDED = {
    "B03": "green",
    "B04": "red",
    "B08": "nir",
    "B11": "swir16",
}

PC_STAC_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"
AWS_STAC_URL = "https://earth-search.aws.element84.com/v1"


def search_planetary_computer(lat, lon, start, end, cloud_max):
    import pystac_client
    import planetary_computer

    catalog = pystac_client.Client.open(PC_STAC_URL, modifier=planetary_computer.sign_inplace)
    search = catalog.search(
        collections=["sentinel-2-l2a"],
        intersects={"type": "Point", "coordinates": [lon, lat]},
        datetime=f"{start}/{end}",
        query={"eo:cloud_cover": {"lt": cloud_max}},
        sortby=[{"field": "properties.eo:cloud_cover", "direction": "asc"}],
        max_items=1,
    )
    items = list(search.items())
    return items[0] if items else None


def search_aws_earth_search(lat, lon, start, end, cloud_max):
    import pystac_client

    catalog = pystac_client.Client.open(AWS_STAC_URL)
    search = catalog.search(
        collections=["sentinel-2-l2a"],
        intersects={"type": "Point", "coordinates": [lon, lat]},
        datetime=f"{start}/{end}",
        query={"eo:cloud_cover": {"lt": cloud_max}},
        sortby=[{"field": "properties.eo:cloud_cover", "direction": "asc"}],
        max_items=1,
    )
    items = list(search.items())
    return items[0] if items else None


def download_band(href, out_path, bbox_deg=0.03, center_lat=None, center_lon=None):
    """
    Downloads a small windowed crop (COG range-read) around the point of
    interest using rasterio, instead of pulling the entire ~100x100km tile.
    """
    import rasterio
    from rasterio.windows import from_bounds

    with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR"):
        with rasterio.open(href) as src:
            if center_lat is not None and center_lon is not None:
                # reproject point to source CRS
                from rasterio.warp import transform as warp_transform
                xs, ys = warp_transform("EPSG:4326", src.crs, [center_lon], [center_lat])
                cx, cy = xs[0], ys[0]
                half = 1280  # ~ 256 px * 10m /2 in meters, adjust as needed
                window = from_bounds(cx - half, cy - half, cx + half, cy + half, transform=src.transform)
            else:
                window = None

            data = src.read(1, window=window) if window is not None else src.read(1)
            profile = src.profile.copy()
            if window is not None:
                transform = src.window_transform(window)
                profile.update({
                    "height": data.shape[0],
                    "width": data.shape[1],
                    "transform": transform,
                })
            with rasterio.open(out_path, "w", **profile) as dst:
                dst.write(data, 1)


def main():
    parser = argparse.ArgumentParser(description="Download real Sentinel-2 scenes for SatQuery AI")
    parser.add_argument("--start", default="2024-01-01", help="Start date YYYY-MM-DD")
    parser.add_argument("--end", default="2024-06-30", help="End date YYYY-MM-DD")
    parser.add_argument("--cloud-max", type=float, default=20.0, help="Max cloud cover percent")
    parser.add_argument("--out", default="scenes", help="Output scenes directory")
    args = parser.parse_args()

    os.makedirs(args.out, exist_ok=True)

    for loc in LOCATIONS:
        print(f"\n== {loc['scene_id']} :: {loc['name']} ==")
        item = None
        source_used = None
        try:
            item = search_planetary_computer(loc["lat"], loc["lon"], args.start, args.end, args.cloud_max)
            source_used = "planetary_computer"
        except Exception as e:
            print(f"  Planetary Computer search failed: {e}")

        if item is None:
            try:
                item = search_aws_earth_search(loc["lat"], loc["lon"], args.start, args.end, args.cloud_max)
                source_used = "aws_earth_search"
            except Exception as e:
                print(f"  AWS Earth Search failed: {e}")

        if item is None:
            print("  No matching scene found in date range / cloud threshold. Skipping.")
            continue

        scene_dir = os.path.join(args.out, loc["scene_id"])
        os.makedirs(scene_dir, exist_ok=True)

        for band_code, asset_key in BANDS_NEEDED.items():
            try:
                asset = item.assets[asset_key]
                href = asset.href
                out_path = os.path.join(scene_dir, f"{band_code}.tif")
                print(f"  Downloading {band_code} ({asset_key}) -> {out_path}")
                download_band(href, out_path, center_lat=loc["lat"], center_lon=loc["lon"])
            except KeyError:
                print(f"  Asset '{asset_key}' not found on this item, skipping band {band_code}")
            except Exception as e:
                print(f"  Failed to download {band_code}: {e}")

        # write real metadata alongside real pixel data
        metadata = {
            "scene_id": loc["scene_id"],
            "satellite": "Sentinel-2",
            "instrument": "MSI",
            "product_level": "L2A",
            "location_name": loc["name"],
            "latitude": loc["lat"],
            "longitude": loc["lon"],
            "acquisition_date": item.properties.get("datetime"),
            "cloud_percentage": item.properties.get("eo:cloud_cover"),
            "crs": str(item.properties.get("proj:epsg", "unknown")),
            "spatial_resolution_m": {"B03": 10, "B04": 10, "B08": 10, "B11": 20},
            "stac_item_id": item.id,
            "stac_source": source_used,
            "data_source": "real_sentinel2_stac",
            "is_real_satellite_data": True,
        }
        with open(os.path.join(scene_dir, "metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)

    print("\nDone. Real scenes (where found) written to:", args.out)


if __name__ == "__main__":
    main()
