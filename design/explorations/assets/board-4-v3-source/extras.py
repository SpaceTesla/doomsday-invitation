# Smaller pieces: the suit rune raised on a plate (level 3), and crops of the renders used as study and material samples.
import math, os, sys
import numpy as np
from PIL import Image
import icongeo as I
import mask_render as MR
from rl import Canvas, blur, bevel, pillow, save

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'v2'))


def rune_relief(size=640):
    """The suit rune as it sits on the armour: bars standing off a chamfered plate of the same steel as the mask."""
    cv = Canvas(size, size, size / 4.4, size / 2, size / 2, ss=3)
    k = 1.0
    plate = cv.poly([(-1.75, -1.95), (1.75, -1.95), (2.0, -1.6), (2.0, 1.6), (1.75, 1.95), (-1.75, 1.95), (-2.0, 1.6), (-2.0, -1.6)])
    X, Y = cv.grid()
    hgt = 46 * bevel(plate, 10) + 60 * np.sqrt(np.clip(1 - (X / 3.4) ** 2, 0, 1))
    parts = I.rune_parts(True)
    lines = [ln for lns in parts.values() for ln in lns]
    bars = cv.lines(lines, I.BAR * 1.15)
    hgt += 7.5 * bevel(bars, 2.4) * plate
    R = dict(h=hgt.astype(np.float32), alpha=plate, void=np.zeros_like(plate), grille=np.zeros_like(plate), mouth=np.zeros_like(plate),
             plates=bars, scale=9.0)
    col, a = MR.shade(R, MR.STUDIO, MR.studio_env, exposure=1.25)
    return MR.to_srgb(col), blur(a, 0.6)


def crops():
    """Study crops of the revised figure, cut to the same boxes as the version 2 crops so the two can be set side by side."""
    V3 = os.path.normpath(os.path.join(OUT, '..', 'v3'))
    sky = Image.open(os.path.join(OUT, 'hero-d-sky.jpg')).convert('RGB')
    lit = Image.open(os.path.join(V3, 'hero-d-figure-lit.webp')).convert('RGBA')
    old = Image.open(os.path.join(OUT, 'hero-d-figure-lit.webp')).convert('RGBA')
    comp = sky.copy(); comp.paste(lit, (0, 0), lit)
    comp_old = sky.copy(); comp_old.paste(old, (0, 0), old)
    dark = Image.new('RGB', lit.size, (7, 10, 10)); dark.paste(lit, (0, 0), lit)
    jobs = {
        'study-head.jpg': (comp, (730, 0, 1290, 560)),
        'study-chest.jpg': (dark, (700, 520, 1320, 1020)),
        'study-gauntlet.jpg': (comp, (60, 250, 620, 810)),
        'before-head.jpg': (comp_old, (730, 0, 1290, 560)),
        'before-gauntlet.jpg': (comp_old, (60, 250, 620, 810)),
        'before-figure.jpg': (comp_old, (120, 0, 1680, 1000)),
        'after-figure.jpg': (comp, (120, 0, 1680, 1000)),
        'mat-wool.jpg': (dark, (540, 560, 940, 860)),
        'mat-cuirass.jpg': (dark, (820, 700, 1220, 980)),
    }
    for name, (im, box) in jobs.items():
        c = im.crop(box)
        if c.width > 900:
            c = c.resize((900, int(900 * c.height / c.width)), Image.LANCZOS)
        c.save(os.path.join(V3, name), 'JPEG', quality=88, optimize=True)


if __name__ == '__main__':
    crops()
    print('crops done')
