# Layers for the opening reveal. Each layer is written as its own image so the page can move them apart.
#   sky            the light behind him
#   figure-dark    Doom as a near silhouette
#   figure-lit     the same figure with mask, hood and armour readable (cross-faded over the dark one)
#   haze           low fog in front of him
#   rock-*         out-of-focus rubble in front of the lens: a slab above, a mass each side, a mound below
#   dust, bokeh    particles
import math, os, sys
import numpy as np
from PIL import Image
import figure as FG
from rl import (Canvas, blur, fbm, white, vnoise, catmull, smooth, rgb, save, over, vignette, edge_dist, pillow, normals, lambert)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'v2'))

DESKTOP = dict(
    key='d', w=1920, h=1080, s=1.95, ox=1010, oy=150, arm=FG.DESKTOP_ARM, sun=(330, 470),
    rocks=dict(
        top=dict(pts=[(-500, -1500), (2500, -1500), (2500, -20), (2060, 30), (1700, -30), (1380, 60), (1080, -10), (820, 50),
                      (660, -40), (600, -260), (420, -330), (160, -300), (-120, -350), (-500, -330)],
                 blur=7, states=dict(closed=(0, 700, -1.5), parting=(0, 470, -0.8), open=(0, 0, 0))),
        left=dict(pts=[(-700, -200), (300, -200), (360, 40), (300, 190), (150, 290), (50, 430), (120, 590), (60, 750), (170, 930),
                       (230, 1300), (-700, 1300)],
                  blur=9, states=dict(closed=(120, 0, 0), parting=(40, 0, 0), open=(0, 0, 0))),
        right=dict(pts=[(1420, -200), (1470, 60), (1590, 210), (1560, 400), (1680, 560), (1640, 760), (1720, 960), (1760, 1300),
                        (2700, 1300), (2700, -200)],
                   blur=10, states=dict(closed=(-640, 0, 0), parting=(-250, 0, 0), open=(0, 0, 0))),
        bottom=dict(pts=[(-200, 1400), (-200, 930), (160, 880), (460, 960), (760, 915), (1040, 985), (1340, 925), (1640, 975),
                         (1900, 905), (2200, 930), (2200, 1400)],
                    blur=8, states=dict(closed=(0, -250, 0), parting=(0, -80, 0), open=(0, 0, 0))),
    ),
)

PHONE = dict(
    key='p', w=780, h=1688, s=1.78, ox=452, oy=300, arm=FG.PHONE_ARM, sun=(150, 470),
    rocks=dict(
        top=dict(pts=[(-300, -2200), (1100, -2200), (1100, -30), (860, 40), (640, -20), (470, 50), (300, -10), (236, -420),
                      (150, -640), (60, -600), (-300, -660)],
                 blur=7, states=dict(closed=(0, 1010, -1.0), parting=(0, 630, -0.5), open=(0, 0, 0))),
        left=dict(pts=[(-500, -200), (120, -200), (150, 60), (90, 220), (20, 380), (46, 600), (0, 820), (70, 1040), (60, 1900),
                       (-500, 1900)],
                  blur=9, states=dict(closed=(0, 0, 0), parting=(0, 0, 0), open=(0, 0, 0))),
        right=dict(pts=[(690, -200), (700, 120), (760, 330), (730, 600), (770, 860), (740, 1100), (760, 1900), (1300, 1900),
                        (1300, -200)],
                   blur=10, states=dict(closed=(-440, 0, 0), parting=(-150, 0, 0), open=(0, 0, 0))),
        bottom=dict(pts=[(-200, 2100), (-200, 1240), (120, 1190), (330, 1250), (560, 1200), (780, 1250), (980, 1210), (980, 2100)],
                    blur=8, states=dict(closed=(0, -520, 0), parting=(0, -150, 0), open=(0, 0, 0))),
    ),
)


def lin(c):
    return rgb(c) ** 2.2


def sky(cfg, seed=3):
    """Cold fog lit from behind. Brightest behind the raised hand, as in the reference frames."""
    w, h = cfg['w'], cfg['h']
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    sx, sy = cfg['sun']
    d = np.hypot((xs - sx) / (w * 0.55), (ys - sy) / (h * 0.75 if h < w else w * 0.9))
    core = np.exp(-(d / 0.17) ** 2); mid = np.exp(-(d / 0.50) ** 1.5); far = np.exp(-(d / 1.25) ** 1.6)
    n = fbm((h, w), max(w, h) * 0.35, 4, seed)
    n2 = fbm((h, w), max(w, h) * 0.09, 3, seed + 4)
    warm = lin('#f6efcc'); pale = lin('#a9b192'); cool = lin('#3c5049'); deep = lin('#0b1211')
    img = deep[None, None, :] * np.ones((h, w, 1), np.float32)
    img = img + (cool - deep) * (far * (0.75 + 0.5 * n))[..., None]
    img = img + (pale - cool) * (mid * (0.7 + 0.6 * n))[..., None]
    img = img + (warm - pale) * (core * 0.95)[..., None] + warm * (core ** 2 * 0.35)[..., None]
    img *= (0.86 + 0.28 * n2)[..., None]
    return np.clip(img, 0, None)


def to_srgb(lin_img, exposure=1.0):
    x = np.clip(lin_img * exposure, 0, None)
    x = np.where(x > 0.6, 0.6 + (1 - np.exp(-(x - 0.6) * 2.2)) * 0.4, x)
    return np.clip(x, 0, 1) ** (1 / 2.2)


def rock_layer(cfg, name, seed):
    """One piece of rubble on an oversized canvas. Returns (srgb, alpha, origin) with origin in frame px."""
    r = cfg['rocks'][name]
    pts = r['pts']
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    pad = 40
    x0, y0, x1, y1 = min(xs) - pad, min(ys) - pad, max(xs) + pad, max(ys) + pad
    q = 2                                              # rendered at half size: it is out of focus anyway
    w, h = int((x1 - x0) / q), int((y1 - y0) / q)
    cv = Canvas(w, h, 1.0 / q, -x0 / q, -y0 / q, ss=2)
    # break the drawn outline up: fractured stone, not a smooth blob
    dense = catmull([(p[0], p[1], 1) for p in pts], True, 14)
    rng = np.random.default_rng(seed)
    jag = []
    amp = 16.0
    walk = 0.0
    for i, (x, y) in enumerate(dense):
        walk = walk * 0.72 + (rng.random() - 0.5) * amp
        jag.append((x + walk * 0.9, y + walk))
    m = cv.poly(jag)
    tex = fbm((h, w), 90, 3, seed + 1); fine = fbm((h, w), 22, 2, seed + 2)
    hgt = 30 * pillow(m, 70) + 22 * tex + 3 * fine
    n = normals(hgt, 0.9)
    sx, sy = cfg['sun']
    Ld = np.array([sx - (x0 + x1) / 2, sy - (y0 + y1) / 2], np.float32); Ld = Ld / (np.linalg.norm(Ld) + 1e-6)
    dif = lambert(n, (Ld[0] * 0.8, Ld[1] * 0.8, 0.42))
    base = lin('#070c0b'); hi = lin('#2c3a35')
    col = base[None, None, :] * (0.85 + 0.3 * blur(tex, 6))[..., None] + hi * (blur(dif, 5) ** 2.0 * 0.22)[..., None]
    # the lip of each stone catches the fog light
    d = edge_dist(m)
    col += lin('#7c8c7c') * (np.exp(-d / 4.0) * 0.02 * (0.3 + dif))[..., None]
    b = r['blur'] / q
    a = blur(m, b)
    col = np.dstack([blur(col[..., i] * m, b) for i in range(3)]) / np.clip(a, 1e-3, None)[..., None]
    a = np.clip(a * 1.04, 0, 1)
    return to_srgb(col, 1.0), a, (x0, y0, x1 - x0, y1 - y0)


def dust_tile(size=1024, seed=5, n=150, streak=(-0.42, 1.0)):
    """Ash and snow crossing the light: small soft flecks, drawn out along their fall."""
    rng = np.random.default_rng(seed)
    a = np.zeros((size, size), np.float32)
    from PIL import ImageDraw
    im = Image.new('L', (size * 2, size * 2), 0); d = ImageDraw.Draw(im)
    for _ in range(n):
        x, y = rng.random() * size * 2, rng.random() * size * 2
        L = (2 + rng.random() ** 2 * 30) * 2
        wdt = 1 + int(rng.random() * 3)
        v = int(40 + rng.random() ** 2 * 200)
        for ox_ in (-size * 2, 0, size * 2):
            for oy_ in (-size * 2, 0, size * 2):
                d.line([x + ox_, y + oy_, x + ox_ + streak[0] * L, y + oy_ + streak[1] * L], fill=v, width=wdt)
    a = np.asarray(im.resize((size, size), Image.LANCZOS), np.float32) / 255.0
    a = np.clip(blur(a, 0.8) * 1.5, 0, 1)
    col = np.ones((size, size, 3), np.float32) * (rgb('#e9e6d2'))[None, None, :]
    return col, a


def bokeh(cfg, seed=9):
    """Large soft discs low in the frame: wet flecks on the lens, far out of focus."""
    w, h = cfg['w'], cfg['h']
    rng = np.random.default_rng(seed)
    a = np.zeros((h, w), np.float32)
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    n = 13
    for i in range(n):
        if w > h:
            cx = w * (0.56 + rng.random() * 0.42); cy = h * (0.42 + rng.random() * 0.5)
        else:
            cx = w * (0.35 + rng.random() * 0.65); cy = h * (0.44 + rng.random() * 0.3)
        r = min(w, h) * (0.018 + rng.random() * 0.032)
        d = np.hypot(xs - cx, ys - cy)
        disc = np.clip((r - d) / 8.0, 0, 1)
        a = np.maximum(a, disc * (0.10 + rng.random() * 0.16))
    a = blur(a, 5.0)
    col = np.ones((h, w, 3), np.float32) * rgb('#aebcb0')[None, None, :]
    return col, np.clip(a, 0, 1)


def haze(cfg, seed=12):
    w, h = cfg['w'], cfg['h']
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    n = fbm((h, w), max(w, h) * 0.22, 4, seed)
    start = 0.50 if w > h else 0.55
    a = smooth((ys / h - start) / 0.4) * (0.35 + 0.65 * n) * 0.78
    col = np.ones((h, w, 3), np.float32) * rgb('#1c2a26')[None, None, :]
    return col, np.clip(a, 0, 1)


def figure_layers(cfg):
    B = FG.build(cfg['w'], cfg['h'], cfg['s'], cfg['ox'], cfg['oy'], cfg['arm'])
    out = {}
    skyimg = sky(cfg)
    lum = skyimg.mean(axis=2)
    for mode in ('dark', 'lit'):
        col, a = FG.shade(B, mode)
        # light wrap: the fog behind him bleeds a little over his edge
        wrap = blur(lum * (1 - a), 9 * cfg['s']) * a
        col = col + wrap[..., None] * np.array([0.9, 0.95, 0.8], np.float32) * 0.02
        out[mode] = (to_srgb(col, 1.15), blur(a, 0.7))
    return out, B, skyimg


def compose(cfg, layers, state='open', lit=1.0, ring=None):
    """Flatten the layers the way the page will stack them. For previews and the storyboard only."""
    w, h = cfg['w'], cfg['h']
    img = layers['sky'].copy()
    fd, fa = layers['dark']; fl, _ = layers['lit']
    fig = fd * (1 - lit) + fl * lit
    img = over(img, fig, fa)
    hc, ha = layers['haze']; img = over(img, hc, ha)
    dc, da = layers['dust']
    reps = (h // dc.shape[0] + 1, w // dc.shape[1] + 1)
    dta = np.tile(da, reps)[:h, :w]
    img = img + dta[..., None] * 0.34 * rgb('#e9e6d2')
    bc, ba = layers['bokeh']; img = over(img, bc, ba * 0.7)
    for name in ('right', 'left', 'bottom', 'top'):
        col, a, (x0, y0, rw, rh) = layers['rock-' + name]
        dx, dy, rot = cfg['rocks'][name]['states'][state]
        im = Image.fromarray((np.dstack([col, a]) * 255).astype(np.uint8)).resize((int(rw), int(rh)), Image.BILINEAR)
        if rot:
            im = im.rotate(-rot, resample=Image.BILINEAR, center=(im.width / 2, im.height / 2))
        canvas = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).convert('RGBA')
        canvas.alpha_composite(im, (int(x0 + dx), int(y0 + dy))) if (x0 + dx >= 0 and y0 + dy >= 0) else canvas.paste(im, (int(x0 + dx), int(y0 + dy)), im)
        img = np.asarray(canvas.convert('RGB'), np.float32) / 255.0
    img *= vignette((h, w), 0.5, 2.0)[..., None]
    return img


def make(cfg, write=True):
    key = cfg['key']
    figs, B, skyimg = figure_layers(cfg)
    layers = dict(sky=to_srgb(skyimg, 1.0), dark=figs['dark'], lit=figs['lit'], haze=haze(cfg), dust=dust_tile(), bokeh=bokeh(cfg))
    for i, name in enumerate(('top', 'left', 'right', 'bottom')):
        layers['rock-' + name] = rock_layer(cfg, name, 20 + i * 7)
    if write:
        os.makedirs(OUT, exist_ok=True)
        save(layers['sky'], os.path.join(OUT, 'hero-%s-sky.jpg' % key), quality=86)
        for mode in ('dark', 'lit'):
            save(layers[mode][0], os.path.join(OUT, 'hero-%s-figure-%s.webp' % (key, mode)), alpha=layers[mode][1], quality=90)
        save(layers['haze'][0], os.path.join(OUT, 'hero-%s-haze.webp' % key), alpha=layers['haze'][1], quality=70)
        save(layers['bokeh'][0], os.path.join(OUT, 'hero-%s-bokeh.webp' % key), alpha=layers['bokeh'][1], quality=70)
        save(layers['dust'][0], os.path.join(OUT, 'hero-dust.webp'), alpha=layers['dust'][1], quality=80)
        geo = {}
        for name in ('top', 'left', 'right', 'bottom'):
            col, a, box = layers['rock-' + name]
            save(col, os.path.join(OUT, 'hero-%s-rock-%s.webp' % (key, name)), alpha=a, quality=78)
            geo[name] = dict(box=[float(v) for v in box], states=cfg['rocks'][name]['states'])
        import json
        hand = B['G']['L'](0, 30)
        geo['_frame'] = dict(w=cfg['w'], h=cfg['h'], hand=[cfg['ox'] + hand[0] * cfg['s'], cfg['oy'] + hand[1] * cfg['s']], s=cfg['s'])
        json.dump(geo, open(os.path.join(OUT, 'hero-%s-layout.json' % key), 'w'), indent=1)
    return layers


if __name__ == '__main__':
    which = sys.argv[1] if len(sys.argv) > 1 else 'both'
    prev = sys.argv[2] if len(sys.argv) > 2 else None
    for cfg in (DESKTOP, PHONE):
        if which not in ('both', cfg['key']):
            continue
        L = make(cfg)
        if prev:
            for st, lit in (('closed', 0.0), ('parting', 0.0), ('open', 0.35), ('open', 1.0)):
                im = compose(cfg, L, st, lit)
                save(im, os.path.join(prev, 'hero-%s-%s-%d.jpg' % (cfg['key'], st, int(lit * 100))), quality=88)
        print('made', cfg['key'])
