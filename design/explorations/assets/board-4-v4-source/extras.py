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
    """Before (revision 3) and after (revision 4) crops, each pair cut to the same box of the frame."""
    V3 = os.path.normpath(os.path.join(OUT, '..', 'v3'))
    V4 = os.path.normpath(os.path.join(OUT, '..', 'v4'))
    sky = Image.open(os.path.join(OUT, 'hero-d-sky.jpg')).convert('RGB')
    def comp(folder):
        lit = Image.open(os.path.join(folder, 'hero-d-figure-lit.webp')).convert('RGBA')
        c = sky.copy(); c.paste(lit, (0, 0), lit)
        d = Image.new('RGB', lit.size, (7, 10, 10)); d.paste(lit, (0, 0), lit)
        return c, d
    old, old_dark = comp(V3)
    new, new_dark = comp(V4)
    boxes = {
        'figure': (120, 0, 1680, 1000),          # the whole figure
        'hood': (700, 0, 1320, 620),             # hood, neck, cowl and clasps
        'mask': (790, 60, 1230, 500),            # the mask in its opening
        'reach': (150, 160, 1110, 880),          # hand, forearm and the near shoulder
    }
    for name, box in boxes.items():
        for tag, im in (('before', old), ('after', new)):
            c = im.crop(box)
            if c.width > 900:
                c = c.resize((900, int(900 * c.height / c.width)), Image.LANCZOS)
            c.save(os.path.join(V4, '%s-%s.jpg' % (tag, name)), 'JPEG', quality=88, optimize=True)
    # the hand moved, so each close view is centred on its own hand
    old.crop((104, 330, 564, 790)).save(os.path.join(V4, 'before-fingers.jpg'), 'JPEG', quality=90, optimize=True)
    new.crop((200, 318, 660, 778)).save(os.path.join(V4, 'after-fingers.jpg'), 'JPEG', quality=90, optimize=True)
    new_dark.crop((540, 560, 940, 860)).save(os.path.join(V4, 'mat-wool.jpg'), 'JPEG', quality=88, optimize=True)


if __name__ == '__main__':
    crops()
    print('crops done')
