# Level 3 of the canonical mask: the measured outlines in maskgeo.py raised into a relief and lit.
# This is a procedural render of our own drawing. It is not a photograph and not a studio asset.
import math, os, sys
import numpy as np
import maskgeo as M
from rl import (Canvas, blur, bevel, pillow, edge_dist, smooth, fbm, white, scratches, normals, lambert, blinn,
                reflect_view, ao, norm3, save, catmull)

_cache = {}


def relief(scale=9.0, pad=40):
    """Height field for the mask at `scale` px per unit. Returns a dict of arrays."""
    key = (scale, pad)
    if key in _cache:
        return _cache[key]
    w = int(M.W * scale + pad * 2); h = int(M.H * scale + pad * 2)
    cv = Canvas(w, h, scale, ox=pad + M.W * scale / 2, oy=pad, ss=3)
    X, Y = cv.grid()
    D = lambda p, c=True, n=10: M.dense(p, c, n)
    k = scale / 9.0                                   # all pixel sizes below were tuned at 9 px per unit

    shell = cv.poly(D(M.OUTLINE))
    a = shell.copy()

    # the shell: a pillow from the edge, wrapped round the face
    hgt = 175 * k * pillow(shell, 250 * k)
    hgt += 250 * k * np.sqrt(np.clip(1 - (X / 58.0) ** 2, 0, 1))
    # forehead a little fuller than the lower face, and the jaw set back under the cheeks
    hgt += 22 * k * np.exp(-((Y - 30) / 26.0) ** 2) * np.exp(-(X / 40.0) ** 2)
    hgt -= 10 * k * smooth((Y - 93) / 8.0) * smooth((np.abs(X) - 22) / 14.0)

    def plate(mask, t, bw, dome=0.0):
        v = t * k * bevel(mask, bw * k)
        if dome:
            v = v + dome * k * pillow(mask, 60 * k) * mask
        return v

    def groove(line_mask, depth, r):
        return -depth * k * np.clip(blur(line_mask, r * k) / max(1e-6, blur(line_mask, r * k).max()), 0, 1)

    brow = cv.polys([D(s) for s in M.both(M.BROW)])
    hgt += plate(brow, 13, 5, 5)
    lid_edge = cv.lines([D(s, False) for s in M.both(M.LID_SEAM)], 0.7)
    # the lid plate stands a little proud below its seam
    lid_region = brow * (blur(cv.polys([D(list(s) + [(s[-1][0], 80), (s[0][0], 80)]) for s in M.both(M.LID_SEAM)]), 1.0))
    hgt += 5 * k * blur(lid_region, 1.2 * k) * brow
    hgt += groove(lid_edge, 5, 1.1)

    cheek = cv.polys([D(s) for s in M.both(M.CHEEK)])
    hgt += plate(cheek, 10, 6, 4)
    crease = cv.lines([D(s, False) for s in M.both(M.CHEEK_CREASE)], 1.1)
    hgt += groove(crease, 9, 1.6)

    frame = cv.polys([D(s) for s in M.both(M.EYE_FRAME)])
    eye = cv.polys([D(s) for s in M.both(M.EYE)])
    hgt += 5 * k * bevel(frame, 3 * k) * (1 - brow)

    muzzle = cv.poly(D(M.MUZZLE))
    hgt += plate(muzzle, 7, 6, 6)
    jaw = cv.polys([D(s) for s in M.both(M.JAW)])
    hgt += plate(jaw, 4, 4, 0)
    strap = cv.lines([D(s, False) for s in M.both(M.JAW_STRAP)], M.JAW_STRAP_WIDTH)
    strap_in = cv.lines([D(s, False) for s in M.both(M.JAW_STRAP)], M.JAW_STRAP_WIDTH * 0.42)
    hgt += 4.5 * k * blur(strap, 1.0 * k) - 3.0 * k * blur(strap_in, 0.8 * k)

    # nose: a tent with a flat ridge, rising towards its base and cut back underneath
    nose = cv.poly(D(M.NOSE))
    half = np.interp(Y, [p[1] for p in M.NOSE_HALF[1:6]], [p[0] for p in M.NOSE_HALF[1:6]])
    half = np.where(Y > 96.5, 10.6 - (Y - 96.5) * 0.25, half)
    ridge = 1.9 + (Y - 75) * 0.016
    tprof = np.interp(Y, [73.6, 78, 90, 97.5, 100.8, 103], [9, 22, 42, 52, 40, 0])
    side = np.clip(1 - (np.abs(X) - ridge) / np.clip(half - ridge, 0.5, None), 0, 1)
    tent = np.where(np.abs(X) <= ridge, 1.0, side ** 0.85)
    hgt += k * tprof * tent * blur(nose, 1.0 * k)
    ridge_m = cv.poly(M.NOSE_RIDGE)
    hgt += 3.5 * k * bevel(ridge_m, 1.6 * k)

    lip = cv.poly(D(M.LIP))
    hgt += plate(lip, 11, 4.5, 2)
    chin = cv.poly(D(M.CHIN_PLATE))
    hgt += plate(chin, 5, 5, 0)
    chin_line = cv.lines([D(M.sym(M.CHIN_LINE_HALF), False)], 1.0)
    hgt += groove(chin_line, 5, 1.4)
    boss = cv.poly(D(M.CHIN_BOSS))
    hgt += 15 * k * pillow(boss, 30 * k) * blur(boss, 1.0 * k)

    mouth = cv.poly(D(M.MOUTH))
    ledge = cv.poly(D(M.sym(M.MOUTH_LEDGE_HALF + [(0, 122.2)])))
    hgt -= 7 * k * blur(ledge, 1.6 * k)
    grille = np.clip(cv.poly(M.GRILLE_BAR) + cv.poly(M.GRILLE_BLOCK) + cv.polys(M.both(M.GRILLE_POST)), 0, 1)

    # crown: the rim, its links, the temple tabs, the hasp
    rim = cv.lines([D(s, False) for s in M.both(M.RIM_CENTRE_HALF)], M.RIM_WIDTH) * shell
    hgt += 7 * k * blur(rim, 1.0 * k)
    links = cv.lines([[p0, p1] for p0, p1 in M.rim_links()] + [[(-p0[0], p0[1]), (-p1[0], p1[1])] for p0, p1 in M.rim_links()], 0.8)
    hgt -= 4 * k * blur(links, 0.8 * k)
    tabs = cv.polys(M.both(M.TEMPLE_TAB))
    hasp = cv.poly(M.HASP)
    a = np.clip(a + hasp + tabs, 0, 1)
    for part, lift in ((hasp, 16), (tabs, 7)):
        inside = (part > 0.5) & (shell > 0.5)
        ref_h = float(hgt[inside].mean()) if inside.any() else 0.0
        hgt = np.where(part > 0.5, np.maximum(hgt, ref_h) + lift * k * bevel(part, 3 * k), hgt)
    hasp_in = cv.poly(M.HASP_INNER)
    hgt -= 5 * k * blur(hasp_in, 0.8 * k)
    import icongeo
    mark = cv.polys([[(x * 0.062, 5.7 + (y - 50) * 0.062) for x, y in poly] for poly in icongeo.doom_mark_polys()])
    hgt += 3.5 * k * blur(mark, 0.6 * k)

    rv = cv.discs(M.rivets_all(), M.RIVET_R)
    rd = edge_dist(rv)
    rr = M.RIVET_R * scale
    hgt += np.sqrt(np.clip(1 - (1 - np.clip(rd / rr, 0, 1)) ** 2, 0, 1)) * rr * 0.9

    void = np.clip(eye + mouth, 0, 1)
    out = dict(cv=cv, X=X, Y=Y, h=hgt.astype(np.float32), alpha=a, shell=shell, void=void, eye=eye, mouth=mouth,
               grille=grille, rivets=rv, scale=scale, plates=np.clip(brow + cheek + lip + boss, 0, 1))
    _cache[key] = out
    return out


def surface(R, seed=4):
    """Worked-steel surface: mottling, pitting and scratches. Returns (albedo multiplier, micro height)."""
    shape = R['h'].shape
    k = R['scale'] / 9.0
    mott = fbm(shape, 90 * k, 4, seed) - 0.5
    pit = np.clip(white(shape, seed + 3) - 0.985, 0, 1) * 60
    pit = blur(pit, 0.9 * k)
    scr = scratches(shape, int(2600 * k * k), 46 * k, seed + 5, angle=math.pi * 0.5, spread=1.6)
    scr2 = scratches(shape, int(900 * k * k), 90 * k, seed + 9)
    alb = 1 + 0.42 * mott + 0.05 * (blur(scr, 0.5) - 0.06) + 0.04 * (scr2 - 0.03) - 0.5 * pit
    micro = 0.22 * k * (white(shape, seed + 11) - 0.5) + 0.3 * k * (scr - 0.06) + 0.2 * k * (scr2 - 0.03) + 2.2 * k * (fbm(shape, 34 * k, 3, seed + 2) - 0.5)
    return alb.astype(np.float32), blur(micro, 0.6).astype(np.float32)


def shade(R, lights, env=None, ambient=(0.012, 0.014, 0.014), base=(0.21, 0.22, 0.225), spec_power=34, exposure=1.0,
          void_colour=(0.0012, 0.0015, 0.0015), grille_gain=0.5, surf=None, zscale=1.0, shadows=True, metal=(0.60, 0.61, 0.62)):
    """Light the relief. lights: list of (direction, rgb, diffuse weight, specular weight).
    env: function (rx, ry, rz) -> HxWx3 radiance for mirror reflection, or None. Returns linear RGB, alpha."""
    alb, micro = surf if surf is not None else surface(R)
    h = R['h'] + micro
    k = R['scale'] / 9.0
    n = normals(h, zscale)
    n_soft = normals(blur(R['h'], 2.0 * k) + micro * 0.5, zscale)
    occ = ao(R['h'], 18 * k, 0.05 / k) * ao(R['h'], 5 * k, 0.07 / k)
    occ = np.clip(occ, 0.08, 1)
    # grime: darker where the surface dips, and along the foot of every raised plate
    cav = np.clip((blur(R['h'], 3.5 * k) - R['h']) / (2.2 * k), 0, 1)
    gy, gx = np.gradient(R['plates'])
    foot = np.clip(blur(np.hypot(gx, gy), 2.6 * k) * 9, 0, 1)
    grime = (1 - 0.8 * cav) * (1 - 0.34 * foot)
    base = np.asarray(base, np.float32)
    col = np.zeros(h.shape + (3,), np.float32)
    col += np.asarray(ambient, np.float32) * occ[..., None]
    for li, (Ld, Lc, kd, ks) in enumerate(lights):
        Lc = np.asarray(Lc, np.float32)
        dif = lambert(n, Ld)
        if li == 0 and shadows:
            sh = cast_shadow(R['h'], Ld, zscale, 46 * k)
            dif = dif * sh
        sp = blinn(n, Ld, spec_power) + 0.35 * blinn(n_soft, Ld, spec_power * 0.22)
        if li == 0 and shadows:
            sp = sp * (0.25 + 0.75 * sh)
        col += (dif[..., None] * kd * base + sp[..., None] * ks) * Lc * occ[..., None]
    if env is not None:
        rx, ry, rz = reflect_view(n_soft)
        fres = 0.55 + 0.45 * (1 - n_soft[2]) ** 3
        col += env(rx, ry, rz) * (fres * occ)[..., None] * np.asarray(metal, np.float32)
    col *= (np.clip(alb, 0.3, 1.8) * grime)[..., None]
    # the openings: dark, with the grille bars catching a little of the light
    gcol = col * grille_gain
    v = R['void']
    col = col * (1 - v[..., None]) + np.asarray(void_colour, np.float32) * v[..., None]
    g = R['grille'] * R['mouth']
    col = col * (1 - g[..., None]) + gcol * g[..., None]
    # inner lip of the eye openings: a short shadow falling in from the brow
    col *= (1 - 0.0 * v)[..., None]
    return col * exposure, R['alpha']


def cast_shadow(h, L, zscale, reach, steps=14):
    """Soft shadow of the relief on itself: walk towards the light and see whether anything stands in the way."""
    L = norm3(L)
    lxy = math.hypot(L[0], L[1])
    if lxy < 1e-3:
        return np.ones_like(h)
    dx, dy = L[0] / lxy, L[1] / lxy
    rise = L[2] / lxy / zscale                 # height the ray gains per pixel travelled
    from scipy import ndimage as ndi
    blocked = np.zeros_like(h)
    for i in range(1, steps + 1):
        t = reach * i / steps
        hs = ndi.shift(h, (-dy * t, -dx * t), order=1, mode='nearest')
        blocked = np.maximum(blocked, hs - h - rise * t)
    return 1 - np.clip(blur(np.clip(blocked, 0, None), 1.5) / 6.0, 0, 1) * 0.85


def studio_env(rx, ry, rz):
    """A soft-box above and to the left, a dim floor below: what makes worked steel read as steel."""
    up = 1 / (1 + np.exp((ry + 0.12) * 5.0))                     # brighter where the reflection looks up
    box = np.exp(-(((rx + 0.38) / 0.42) ** 2 + ((ry + 0.55) / 0.36) ** 2))
    strip = np.exp(-((rx - 0.62) / 0.16) ** 2) * np.exp(-((ry + 0.1) / 0.6) ** 2)
    up = 1 / (1 + np.exp((ry + 0.30) * 6.0))
    v = 0.010 + 0.30 * up + 1.25 * box + 0.20 * strip
    return np.dstack([v * 1.0, v * 1.02, v * 1.04])


STUDIO = [((-0.5, -0.62, 0.6), (1.0, 0.99, 0.96), 0.55, 0.38), ((0.8, 0.1, 0.4), (0.55, 0.62, 0.66), 0.10, 0.06)]


def render_studio(scale=9.0):
    R = relief(scale)
    col, a = shade(R, STUDIO, studio_env, exposure=1.25)
    return col, a


def to_srgb(col, exposure=1.0, contrast=1.45):
    x = np.clip(col * exposure, 0, None)
    x = np.where(x > 0.5, 0.5 + (1 - np.exp(-(x - 0.5) * 2.0)) * 0.5, x)      # roll the highlights off
    y = np.clip(x, 0, 1) ** (1 / 2.2)
    return np.clip(y, 0, 1) ** contrast


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'v2', 'mask-level-3.png')
    col, a = render_studio(9.0)
    save(to_srgb(col), out, alpha=blur(a, 0.6))
    print('wrote', out, col.shape)
