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
    """Study and material samples cut from the finished layers, so the board shows the artwork itself."""
    def op(name):
        return Image.open(os.path.join(OUT, name))
    sky = op('hero-d-sky.jpg').convert('RGB')
    lit = op('hero-d-figure-lit.webp').convert('RGBA')
    comp = sky.copy(); comp.paste(lit, (0, 0), lit)
    dark = Image.new('RGB', lit.size, (7, 10, 10)); dark.paste(lit, (0, 0), lit)
    hall = op('hall-d-plate.jpg').convert('RGB')
    mask = op('mask-level-3.png').convert('RGBA')
    mk = Image.new('RGB', mask.size, (6, 8, 8)); mk.paste(mask, (0, 0), mask)
    jobs = {
        'study-head.jpg': (comp, (730, 0, 1290, 560)),
        'study-chest.jpg': (dark, (700, 580, 1320, 1080)),
        'study-gauntlet.jpg': (comp, (60, 290, 620, 850)),
        'mat-steel.jpg': (mk, (330, 300, 730, 600)),
        'mat-wool.jpg': (dark, (540, 590, 940, 890)),
        'mat-cuirass.jpg': (dark, (820, 720, 1220, 1000)),
        'mat-glass.jpg': (hall, (1060, 60, 1300, 240)),
        'mat-amber.jpg': (hall, (1290, 120, 1410, 210)),
        'mat-floor.jpg': (hall, (700, 800, 1260, 1070)),
        'mat-steps.jpg': (hall, (700, 540, 1100, 740)),
    }
    for name, (im, box) in jobs.items():
        c = im.crop(box)
        if c.width > 800:
            c = c.resize((800, int(800 * c.height / c.width)), Image.LANCZOS)
        c.save(os.path.join(OUT, name), 'JPEG', quality=86, optimize=True)


if __name__ == '__main__':
    col, a = rune_relief()
    save(col, os.path.join(OUT, 'suit-rune-level-3.png'), alpha=a)
    if len(sys.argv) > 1 and sys.argv[1] == 'crops':
        crops()
    print('extras done')
