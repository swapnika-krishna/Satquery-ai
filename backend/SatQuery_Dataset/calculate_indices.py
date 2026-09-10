#!/usr/bin/env python3
"""
calculate_indices.py
---------------------
Computes NDVI, NDWI, and NDBI from the B03 (Green), B04 (Red), B08 (NIR),
and B11 (SWIR1) GeoTIFF bands for every scene in scenes/, and writes:

  scenes/<scene_id>/NDVI.tif
  scenes/<scene_id>/NDWI.tif
  scenes/<scene_id>/NDBI.tif
  scenes/<scene_id>/index_stats.json   (min/max/mean/std per index)

Formulas:
  NDVI = (B08 - B04) / (B08 + B04)      -> vegetation health/density
  NDWI = (B03 - B08) / (B03 + B08)      -> surface water content
  NDBI = (B11 - B08) / (B11 + B08)      -> built-up / urban areas

All outputs are float32 GeoTIFFs in the range [-1, 1], preserving the
original CRS/transform of B04 (used as the reference grid). If B11 has a
different resolution/grid than the 10m bands, it is resampled to match B04's
grid before computing NDBI.

Usage:
    python3 calculate_indices.py --scenes-dir scenes
"""

import argparse
import json
import os

import numpy as np
import rasterio
from rasterio.warp import reproject, Resampling


def read_band(path):
    with rasterio.open(path) as src:
        arr = src.read(1).astype(np.float32)
        profile = src.profile.copy()
    return arr, profile


def resample_to_match(src_path, ref_profile):
    """Resample a band (e.g. 20m B11) onto the reference grid (e.g. 10m B04)."""
    with rasterio.open(src_path) as src:
        dst_arr = np.zeros((ref_profile["height"], ref_profile["width"]), dtype=np.float32)
        reproject(
            source=rasterio.band(src, 1),
            destination=dst_arr,
            src_transform=src.transform,
            src_crs=src.crs,
            dst_transform=ref_profile["transform"],
            dst_crs=ref_profile["crs"],
            resampling=Resampling.bilinear,
        )
    return dst_arr


def safe_normalized_diff(a, b):
    denom = (a + b)
    with np.errstate(divide="ignore", invalid="ignore"):
        result = np.where(denom != 0, (a - b) / denom, 0.0)
    return np.clip(result, -1.0, 1.0).astype(np.float32)


def write_index(path, array, ref_profile):
    profile = ref_profile.copy()
    profile.update(dtype="float32", count=1, compress="lzw", nodata=None)
    with rasterio.open(path, "w", **profile) as dst:
        dst.write(array, 1)


def index_stats(array):
    valid = array[np.isfinite(array)]
    if valid.size == 0:
        return {"min": None, "max": None, "mean": None, "std": None}
    return {
        "min": float(np.min(valid)),
        "max": float(np.max(valid)),
        "mean": float(np.mean(valid)),
        "std": float(np.std(valid)),
    }


def process_scene(scene_dir):
    b03_path = os.path.join(scene_dir, "B03.tif")
    b04_path = os.path.join(scene_dir, "B04.tif")
    b08_path = os.path.join(scene_dir, "B08.tif")
    b11_path = os.path.join(scene_dir, "B11.tif")

    if not all(os.path.exists(p) for p in [b03_path, b04_path, b08_path, b11_path]):
        print(f"  Skipping {scene_dir}: missing one or more required bands.")
        return

    b03, _ = read_band(b03_path)
    b04, ref_profile = read_band(b04_path)  # reference grid = B04 (10m)
    b08, _ = read_band(b08_path)

    # B11 is natively 20m -> resample to B04's 10m grid
    b11 = resample_to_match(b11_path, ref_profile)

    ndvi = safe_normalized_diff(b08, b04)
    ndwi = safe_normalized_diff(b03, b08)
    ndbi = safe_normalized_diff(b11, b08)

    write_index(os.path.join(scene_dir, "NDVI.tif"), ndvi, ref_profile)
    write_index(os.path.join(scene_dir, "NDWI.tif"), ndwi, ref_profile)
    write_index(os.path.join(scene_dir, "NDBI.tif"), ndbi, ref_profile)

    stats = {
        "NDVI": index_stats(ndvi),
        "NDWI": index_stats(ndwi),
        "NDBI": index_stats(ndbi),
    }
    with open(os.path.join(scene_dir, "index_stats.json"), "w") as f:
        json.dump(stats, f, indent=2)

    print(f"  {os.path.basename(scene_dir)}: NDVI mean={stats['NDVI']['mean']:.3f}, "
          f"NDWI mean={stats['NDWI']['mean']:.3f}, NDBI mean={stats['NDBI']['mean']:.3f}")


def main():
    parser = argparse.ArgumentParser(description="Calculate NDVI/NDWI/NDBI for all scenes")
    parser.add_argument("--scenes-dir", default="scenes", help="Path to scenes/ directory")
    args = parser.parse_args()

    scene_dirs = sorted(
        os.path.join(args.scenes_dir, d)
        for d in os.listdir(args.scenes_dir)
        if os.path.isdir(os.path.join(args.scenes_dir, d))
    )

    print(f"Found {len(scene_dirs)} scenes. Calculating indices...\n")
    for scene_dir in scene_dirs:
        process_scene(scene_dir)

    print("\nDone. NDVI.tif / NDWI.tif / NDBI.tif / index_stats.json written into each scene folder.")


if __name__ == "__main__":
    main()
