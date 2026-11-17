"""Bake the materials of the panels and the summons' outer doors, from approved artwork only.

1. public/art/steel.webp: the brushed-steel tile the panels and the doors share.
2. public/art/door-lock.webp: the doors' lock, the raised suit rune (suit rune level 3,
   design/explorations/assets/v2/suit-rune-level-3.png), reduced for the web. Unaltered.

The steel tile:

The grain is taken from the approved summons plate (its blank brushed area, where nothing is
inscribed), stripped of its glow and banding, made seamless, and centred on mid-grey so it can
be laid over any steel gradient with `background-blend-mode: overlay` without changing its
colour. design/DESIGN.md, 8.3 and 8.14. Nothing is painted; only existing artwork is reused.

Usage, from web/:  python scripts/bake-materials.py
"""
import numpy as np
from PIL import Image, ImageFilter

SIZE = 512

plate = Image.open("public/art/summons-d-plate.webp").convert("L")
crop = plate.crop((820, 420, 820 + SIZE, 420 + SIZE))
lum = np.asarray(crop).astype(float)
# Keep the brushing, drop the glow and any slow banding.
blur = np.asarray(Image.fromarray(lum.astype(np.uint8)).filter(ImageFilter.GaussianBlur(24))).astype(float)
grain = lum - blur

# Seamless: blend the tile with itself shifted by half, weighted towards each copy's centre.
shifted = np.roll(np.roll(grain, SIZE // 2, axis=0), SIZE // 2, axis=1)
ramp = np.abs(np.linspace(-1, 1, SIZE))
weight = np.clip(1 - np.maximum.outer(ramp, ramp), 0, 1) ** 1.5
tile = grain * weight + shifted * (1 - weight)
tile = tile / (np.std(tile) or 1) * 9 + 128  # gentle: about +/-9 levels around mid-grey

Image.fromarray(np.clip(tile, 0, 255).astype(np.uint8)).save("public/art/steel.webp", quality=82)
print("wrote public/art/steel.webp")

lock = Image.open("../design/explorations/assets/v2/suit-rune-level-3.png").convert("RGBA")
lock.resize((480, 480), Image.LANCZOS).save("public/art/door-lock.webp", quality=86)
print("wrote public/art/door-lock.webp")
