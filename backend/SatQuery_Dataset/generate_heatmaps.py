#!/usr/bin/env python3
"""
generate_heatmaps.py
----------------------
Generates scientifically valid heatmap PNG images from the NDVI/NDWI/NDBI
GeoTIFFs produced by calculate_indices.py. These are NOT random/fabricated
heatmaps — every pixel color is derived directly from the real (or
placeholder, if that's what you ran indices on) computed index value for
that pixel, using standard, index-appropriate colormaps and a fixed [-1, 1]
color scale so heatmaps are comparable across scenes.

Colormaps used (standard remote-sensing convention):
  NDVI -> 'RdYlGn'  (red = no/low vegetation, green = dense vegetation)
  NDWI -> 'Blues'   (dark blue = high water content)
  NDBI -> 'OrRd'    (dark red/orange = built-up/urban)

Outputs:
  scenes/<scene_id>/heatmaps/NDVI_heatmap.png
  scenes/<scene_id>/heatmaps/NDWI_heatmap.png
  scenes/<scene_id>/heatmaps/NDBI_heatmap.png

Each PNG includes a colorbar with the actual value scale, and a title with
the scene_id + index name, for scientific traceability.

Usage:
    python3 generate_heatmaps.py --scenes-dir scenes
"""

import argparse
import json
import os

import numpy as np
import rasterio
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

INDEX_COLORMAPS = {
    "NDVI": "RdYlGn",
    "NDWI": "Blues",
    "NDBI": "OrRd",
}


def load_index(path):
    with rasterio.open(path) as src:
        return src.read(1).astype(np.float32)


def render_heatmap(array, index_name, scene_id, out_path):
    cmap = INDEX_COLORMAPS.get(index_name, "viridis")
    fig, ax = plt.subplots(figsize=(6, 5.5), dpi=150)
    im = ax.imshow(array, cmap=cmap, vmin=-1.0, vmax=1.0)
    ax.set_title(f"{scene_id} — {index_name}", fontsize=12)
    ax.set_xticks([])
    ax.set_yticks([])
    cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label(f"{index_name} value", fontsize=9)
    fig.tight_layout()
    fig.savefig(out_path, bbox_inches="tight")
    plt.close(fig)


def process_scene(scene_dir):
    scene_id = os.path.basename(scene_dir)
    heatmap_dir = os.path.join(scene_dir, "heatmaps")

    indices_present = {}
    for idx in ["NDVI", "NDWI", "NDBI"]:
        idx_path = os.path.join(scene_dir, f"{idx}.tif")
        if os.path.exists(idx_path):
            indices_present[idx] = idx_path

    if not indices_present:
        print(f"  {scene_id}: no index rasters found — run calculate_indices.py first. Skipping.")
        return

    os.makedirs(heatmap_dir, exist_ok=True)
    for idx, path in indices_present.items():
        array = load_index(path)
        out_path = os.path.join(heatmap_dir, f"{idx}_heatmap.png")
        render_heatmap(array, idx, scene_id, out_path)
        print(f"  {scene_id}: wrote {out_path}")


def main():
    parser = argparse.ArgumentParser(description="Generate heatmap PNGs from computed index GeoTIFFs")
    parser.add_argument("--scenes-dir", default="scenes", help="Path to scenes/ directory")
    args = parser.parse_args()

    scene_dirs = sorted(
        os.path.join(args.scenes_dir, d)
        for d in os.listdir(args.scenes_dir)
        if os.path.isdir(os.path.join(args.scenes_dir, d))
    )

    print(f"Found {len(scene_dirs)} scenes. Generating heatmaps...\n")
    for scene_dir in scene_dirs:
        process_scene(scene_dir)

    print("\nDone. Heatmap PNGs written into scenes/<scene_id>/heatmaps/")


if __name__ == "__main__":
    main()
