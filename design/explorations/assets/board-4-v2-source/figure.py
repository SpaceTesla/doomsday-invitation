# The hero figure: hood, mask, cowl, clasps and chain, tiled cuirass, one raised gauntlet.
# A relief built from drawn outlines and lit twice: once almost as a silhouette, once so the costume can be read.
# Units: the mask is 100 wide with its crown at y = 0 and its centre line at x = 0 (the same units as maskgeo).
import math
import numpy as np
from PIL import Image
import maskgeo as M
import icongeo as I
import mask_render as MR
from rl import (Canvas, blur, bevel, pillow, edge_dist, smooth, fbm, white, vnoise, normals, lambert, blinn, ao, norm3,
                catmull, over)
from scipy import ndimage as ndi

DESKTOP_ARM = dict(elbow=(-250, 412), wrist=(-330, 276), palm=(-352, 220))
PHONE_ARM = dict(elbow=(-228, 318), wrist=(-196, 150), palm=(-190, 92))


def D(pts, closed=True, n=8):
    return catmull(pts, closed, n)


def aniso(shape, cx, cy, seed, octaves=3):
    """Noise stretched along one axis: the grain of hanging cloth."""
    h, w = shape
    sh = (max(4, int(h / cy * 8)), max(4, int(w / cx * 8)))
    n = fbm(sh, 8, octaves, seed)
    z = ndi.zoom(n, (h / sh[0], w / sh[1]), order=3)
    out = np.zeros(shape, np.float32)
    out[:min(h, z.shape[0]), :min(w, z.shape[1])] = z[:h, :w]
    return out


def outlines(arm):
    E, Wr, Pm = arm['elbow'], arm['wrist'], arm['palm']
    o = {}
    o['hood'] = [(0, -74, 1), (30, -64), (62, -44), (88, -12), (103, 28), (108, 72), (104, 116), (96, 152), (98, 180), (116, 204),
                 (60, 228), (0, 236), (-60, 228), (-116, 204), (-98, 180), (-96, 152), (-104, 116), (-108, 72), (-103, 28),
                 (-88, -12), (-62, -44), (-30, -64)]
    o['opening'] = [(0, 3, 1), (20, 9), (38, 23), (49, 45), (54.5, 72), (56, 100), (53, 126), (45, 148), (28, 162), (0, 168),
                    (-28, 162), (-45, 148), (-53, 126), (-56, 100), (-54.5, 72), (-49, 45), (-38, 23), (-20, 9)]
    # cloak: shoulders and the fall of the cloth. The left side is thrown back over the raised arm.
    ex, ey = E
    o['cloak'] = [(0, 150), (70, 160), (112, 174), (160, 186), (212, 204), (252, 228), (276, 264), (288, 330), (296, 430),
                  (304, 570), (314, 770), (322, 1000, 1), (-330, 1000, 1), (-322, 770), (-312, 610),
                  (ex - 58, ey + 100), (ex - 76, ey + 26), (ex - 64, ey - 44), (-276, 268), (-252, 228), (-212, 204),
                  (-160, 186), (-112, 174), (-70, 160)]
    o['cowl'] = [(-150, 208), (-104, 186), (-56, 172), (0, 164), (56, 172), (104, 186), (150, 208), (146, 240), (118, 254),
                 (64, 246), (0, 262), (-64, 246), (-118, 254), (-146, 240)]
    o['chest'] = [(-122, 240, 1), (122, 240, 1), (134, 1000, 1), (-134, 1000, 1)]
    o['clasps'] = [(-132, 262), (132, 262)]
    return o


def hand_geometry(arm):
    """Forearm, cuff, palm and fingers for the raised gauntlet, in figure units."""
    E, Wr, Pm = (np.array(arm[k], np.float32) for k in ('elbow', 'wrist', 'palm'))
    u = (Pm - Wr); u = u / np.linalg.norm(u)          # along the hand, towards the fingers
    v = np.array([-u[1], u[0]], np.float32)            # across the hand
    if v[0] < 0:
        v = -v                                         # v points to screen right, so the thumb falls on the left
    def L(x, y):
        p = Pm + x * v + y * u
        return (float(p[0]), float(p[1]))
    fingers = [  # (points, width) : thumb, index, middle, ring, little
        ([L(-26, -18), L(-52, 2), L(-66, 28), L(-64, 54)], 19),
        ([L(-22, 22), L(-31, 58), L(-30, 86), L(-20, 104)], 16.5),
        ([L(-4, 26), L(-6, 68), L(-1, 100), L(10, 118)], 17),
        ([L(14, 23), L(20, 60), L(28, 88), L(39, 103)], 16),
        ([L(29, 12), L(40, 40), L(49, 62), L(58, 74)], 13.5),
    ]
    palm = [L(-33, -36), L(-37, 0), L(-30, 26), L(0, 34), L(30, 26), L(38, 0), L(33, -36), L(0, -44)]
    fa = (Wr - E); fl = np.linalg.norm(fa); fu = fa / fl
    fv = np.array([-fu[1], fu[0]], np.float32)
    def F(t, x):
        p = E + fu * (t * fl) + fv * x
        return (float(p[0]), float(p[1]))
    forearm = [F(-0.25, -50), F(0.3, -46), F(0.78, -38), F(0.78, 38), F(0.3, 46), F(-0.25, 50)]
    cuff = [F(0.72, -44), F(1.02, -33), F(1.08, -30), F(1.08, 30), F(1.02, 33), F(0.72, 44)]
    return dict(fingers=fingers, palm=palm, forearm=forearm, cuff=cuff, F=F, L=L, fl=float(fl))


def tile_masks(cv, x0=-118.2, y0=248.0, pitch=39.4, cols=6, rows=19):
    fr, f2, sq, dm = [], [], [], []
    for r in range(rows):
        for c in range(cols):
            x = x0 + c * pitch; y = y0 + r * pitch
            a, b = x + 1.6, y + 1.6; s = pitch - 3.2
            cx, cy = a + s / 2, b + s / 2
            fr.append([(a, b), (a + s, b), (a + s, b + s), (a, b + s)])
            f2.append([(a + 5, b + 5), (a + s - 5, b + 5), (a + s - 5, b + s - 5), (a + 5, b + s - 5)])
            q = s / 2 - 9.5
            sq.append([(cx - q, cy - q), (cx + q, cy - q), (cx + q, cy + q), (cx - q, cy + q)])
            d = q - 2.2
            dm.append([(cx, cy - d), (cx + d, cy), (cx, cy + d), (cx - d, cy)])
    return cv.polys(fr), cv.polys(f2), cv.polys(sq), cv.polys(dm)


def build(w, h, s, ox, oy, arm, seed=7, ss=2):
    """Assemble height, albedo and material maps for the figure on a w x h canvas at s px per unit."""
    cv = Canvas(w, h, s, ox, oy, ss=ss)
    X, Y = cv.grid()
    O = outlines(arm)
    shape = (h, w)
    Z = np.zeros(shape, np.float32)

    hood = cv.poly(D(O['hood']))
    opening = cv.poly(D(O['opening']))
    cloak = cv.poly(D(O['cloak']))
    cowl = cv.poly(D(O['cowl']))
    chest_poly = cv.poly(O['chest'])
    body = np.clip(cloak + hood, 0, 1)

    # ---- cloth relief: a broad pillow, long falling folds, and the wrap of the hood
    cloth = 60 * s * pillow(body, 130 * s)
    cloth += 30 * s * (aniso(shape, 90 * s, 520 * s, seed) - 0.5)
    cloth += 7 * s * (aniso(shape, 34 * s, 300 * s, seed + 3) - 0.5)
    ex, ey = arm['elbow']
    folds = [  # (polyline, width, lift): ridges that start at a shoulder or the raised arm and fall
        ([(206, 222), (238, 330), (250, 520), (262, 900)], 30, 13), ([(170, 206), (190, 380), (198, 600), (206, 900)], 24, 9),
        ([(146, 262), (150, 420), (148, 640), (152, 900)], 20, 10), ([(-146, 262), (-150, 420), (-152, 640), (-156, 900)], 20, 10),
        ([(-200, 216), (-214, 330), (-222, 520), (-232, 900)], 26, 11),
        ([(ex - 30, ey - 30), (ex - 46, ey + 80), (ex - 40, ey + 260), (ex - 44, 900)], 28, 14),
        ([(ex + 10, ey - 10), (ex + 2, ey + 120), (ex + 12, ey + 320), (ex + 8, 900)], 22, 9),
    ]
    for pts, wd, lift in folds:
        cloth += lift * s * blur(cv.line(D(pts, False), wd * 0.5), wd * 0.42 * s)
    # the hood: a rolled edge round the opening, a seam over the crown, and gathers at the neck
    hoodring = hood * (1 - opening)
    cloth += 44 * s * pillow(hoodring, 52 * s) * hood
    rim = np.clip(blur(opening, 9 * s) - opening, 0, 1) * hood
    cloth += 30 * s * rim
    for pts, wd, lift in (([(-70, -30), (-96, 36), (-100, 110), (-112, 190)], 18, 10), ([(70, -30), (96, 36), (100, 110), (112, 190)], 18, 10),
                          ([(-30, -58), (-70, 0), (-84, 70), (-80, 140)], 13, 7), ([(30, -58), (70, 0), (84, 70), (80, 140)], 13, 7),
                          ):
        cloth += lift * s * blur(cv.line(D(pts, False), wd * 0.5), wd * 0.42 * s) * hood
    cloth = blur(cloth, 3.5 * s)
    # the cowl: thick turns of cloth lying across the collar bones
    cw = 16 * s * pillow(cowl, 30 * s)
    for pts, wd, lift in (([(-140, 222), (-70, 198), (0, 192), (70, 198), (140, 222)], 14, 11),
                          ([(-128, 244), (-64, 226), (0, 236), (64, 226), (128, 244)], 13, 10)):
        cw += lift * s * blur(cv.line(D(pts, False), wd * 0.5), wd * 0.4 * s)

    # ---- cuirass
    fr, f2, sq, dm = tile_masks(cv)
    chest_h = 70 * s * np.sqrt(np.clip(1 - (X / 210.0) ** 2, 0, 1))
    chest_h += 4.2 * s * bevel(fr, 1.6 * s) - 3.0 * s * blur(f2, 0.8 * s) + 3.0 * s * bevel(sq, 1.4 * s)
    chest_h += 4.5 * s * pillow(dm, 7 * s) * dm

    # ---- clasps and chain
    (clx, cly), (crx, cry) = O['clasps']
    disc = cv.discs(O['clasps'], 31)
    dd = edge_dist(disc)
    clasp_h = 10 * s * pillow(disc, 31 * s) + 4 * s * smooth(1 - np.abs(dd - 4.0 * s) / (2.6 * s))
    star = []
    for i in range(16):
        a0 = math.pi * 2 * i / 16; r1 = 22 if i % 2 == 0 else 14
        star.append([(clx + r1 * math.cos(a0), cly + r1 * math.sin(a0)), (clx + 6 * math.cos(a0 + 0.42), cly + 6 * math.sin(a0 + 0.42)),
                     (clx + 6 * math.cos(a0 - 0.42), cly + 6 * math.sin(a0 - 0.42))])
    starm = cv.polys(star)
    clasp_h += 5 * s * blur(starm, 0.7 * s) + 5 * s * pillow(cv.discs([(clx, cly)], 5.5), 5.5 * s)
    knot = np.zeros(shape, np.float32)
    for q, rot in ((19.5, 0), (19.5, 45), (9.5, 0)):
        pts = [(crx + q * math.cos(math.radians(rot + 45 + 90 * i)), cry + q * math.sin(math.radians(rot + 45 + 90 * i))) for i in range(4)]
        knot = np.maximum(knot, cv.line(pts, 3.4, closed=True))
    clasp_h += 5 * s * blur(knot, 0.7 * s)
    links = []
    n_links = 23
    for i in range(n_links):
        t = (i + 0.5) / n_links
        x = (clx + 31) + (crx - clx - 62) * t
        y = cly + 4 + 26 * (1 - (2 * t - 1) ** 2)
        links.append((x, y))
    chain = np.clip(cv.discs(links, 4.5) - cv.discs(links, 2.1), 0, 1)
    chain_solid = cv.discs(links, 4.5)

    # ---- the raised gauntlet
    G = hand_geometry(arm)
    forearm = cv.poly(D(G['forearm']))
    cuff = cv.poly(D(G['cuff']))
    palm = cv.poly(D(G['palm']))
    fing = np.zeros(shape, np.float32)
    for pts, wd in G['fingers']:
        fing = np.maximum(fing, cv.line(D(pts, False, 6), wd))
    hand = np.clip(palm + fing, 0, 1)
    arm_m = np.clip(forearm + cuff + hand, 0, 1)
    arm_h = 44 * s * pillow(forearm, 46 * s) * forearm
    arm_h = np.maximum(arm_h, (40 * s * pillow(cuff, 40 * s) + 6 * s * bevel(cuff, 2 * s)) * cuff)
    hand_h = 20 * s * pillow(hand, 15 * s)
    joints = []
    for pts, wd in G['fingers']:
        for a, b in ((0, 1), (1, 2), (2, 3)):
            if b >= len(pts):
                continue
            px_, py_ = pts[b]; ax_, ay_ = pts[a]
            dx, dy = px_ - ax_, py_ - ay_; l = math.hypot(dx, dy) or 1
            nx, ny = -dy / l, dx / l
            joints.append([(px_ - nx * wd * 0.6, py_ - ny * wd * 0.6), (px_ + nx * wd * 0.6, py_ + ny * wd * 0.6)])
    hand_h -= 3.2 * s * blur(cv.lines(joints[:-1], 1.4), 0.7 * s)
    F = G['F']
    arm_h += 3.5 * s * blur(cv.lines([[F(-0.2, -22), F(0.72, -17)], [F(-0.2, 22), F(0.72, 17)]], 2.0), 0.9 * s) * forearm
    arm_h += 2.4 * s * blur(cv.discs([F(t, -31) for t in np.linspace(0.02, 0.66, 9)], 1.7), 0.5 * s)
    arm_h += 2.4 * s * blur(cv.lines([[F(0.80, -40), F(0.80, 40)], [F(0.92, -36), F(0.92, 36)]], 2.2), 0.8 * s) * cuff
    # the suit rune, raised on its own small plate on the vambrace
    rc = F(0.33, 2); rr = 21.0
    ang = math.atan2(G['F'](1, 0)[1] - G['F'](0, 0)[1], G['F'](1, 0)[0] - G['F'](0, 0)[0]) + math.pi / 2
    ca, sa = math.cos(ang), math.sin(ang)
    def RP(p):
        return (rc[0] + rr * (p[0] * ca - p[1] * sa), rc[1] + rr * (p[0] * sa + p[1] * ca))
    plate_pts = [RP(p) for p in ((-1.25, -1.1), (1.25, -1.1), (1.5, -0.8), (1.5, 0.8), (1.25, 1.1), (-1.25, 1.1), (-1.5, 0.8), (-1.5, 0.8 - 1.6))]
    rune_plate = cv.poly(plate_pts) * forearm
    parts = I.rune_parts(False)
    rl_lines = [[RP((p[0] * 0.62, p[1] * 0.62)) for p in ln] for k, lines in parts.items() if k != 'inner hexagon' for ln in lines]
    rune_m = cv.lines(rl_lines, I.BAR * rr * 0.9) * forearm
    arm_h += (3.0 * s * bevel(rune_plate, 1.6 * s) + 2.6 * s * blur(rune_m, 0.5 * s)) * forearm

    # ---- assemble one height map and the material ids
    chest_vis = chest_poly * cloak
    Hh = cloth * body
    Hh = np.where(chest_vis > 0.5, chest_h - 16 * s, Hh)
    edge_soft = blur(chest_vis, 2.0 * s)
    Hh = Hh + 0  # (cloak edges stand proud of the cuirass through the offsets above)
    Hh = np.where(cowl > 0.5, cw + cloth * 0.5 + 30 * s, Hh)
    Hh = np.where(disc > 0.5, clasp_h + 86 * s, Hh)
    Hh = np.where(chain_solid > 0.5, 78 * s + 6 * s * chain, Hh)
    hood_h = cloth + 40 * s
    Hh = np.where(hood > 0.5, hood_h, Hh)
    cavity = opening
    Hh = np.where(cavity > 0.5, hood_h.min() * 0 - 30 * s + 40 * s * pillow(opening, 60 * s) * 0, Hh)
    Hh = np.where(arm_m > 0.5, np.maximum(arm_h, hand_h * hand) + 120 * s, Hh)
    alpha = np.clip(body + arm_m, 0, 1)

    mat = np.zeros(shape, np.uint8)        # 0 none, 1 wool, 2 cuirass, 3 bright steel, 4 cavity, 5 gauntlet
    mat[body > 0.5] = 1
    mat[chest_vis > 0.5] = 2
    mat[cowl > 0.5] = 1
    mat[(disc > 0.5) | (chain > 0.5)] = 3
    mat[hood > 0.5] = 1
    mat[cavity > 0.5] = 4
    mat[arm_m > 0.5] = 5

    return dict(cv=cv, X=X, Y=Y, s=s, H=Hh.astype(np.float32), alpha=alpha, mat=mat, body=body, arm=arm_m, hand=hand,
                hood=hood, opening=opening, chest=chest_vis, cowl=cowl, disc=disc, chain=chain, rune=rune_m, rune_plate=rune_plate,
                G=G, O=O, seed=seed, tiles=(fr, sq, dm))


def rim_light(mask, light2d, width, s):
    """Light arriving from behind: a line of brightness inside the edge that faces the lamp."""
    m = blur(mask, 2.0 * s)
    gy, gx = np.gradient(m)
    l = np.hypot(gx, gy) + 1e-6
    nx, ny = -gx / l, -gy / l                              # outward
    L = np.array(light2d, np.float32); L = L / np.linalg.norm(L)
    facing = np.clip(nx * L[0] + ny * L[1] - 0.25, 0, 1) / 0.75
    facing = blur(facing, 3 * s)
    d = edge_dist(mask)
    return np.exp(-d / (width * s)) * facing * (mask > 0.5)


def place_mask(B, lights, env, exposure, hood_shadow=True):
    """Render the canonical mask at the figure's scale and return (rgb, alpha) on the figure canvas."""
    cv = B['cv']; s = B['s']
    sup = 2.0
    R = MR.relief(scale=s * sup, pad=int(8 * sup))
    col, a = MR.shade(R, lights, env, exposure=exposure, shadows=True)
    hh, ww = col.shape[:2]
    def down(arr):
        im = Image.fromarray(np.clip(arr, 0, 4).astype(np.float32), 'F')
        return np.asarray(im.resize((int(ww / sup), int(hh / sup)), Image.LANCZOS), np.float32)
    small = np.dstack([down(col[..., i]) for i in range(3)]); sa = down(a)
    out = np.zeros((cv.h, cv.w, 3), np.float32); oa = np.zeros((cv.h, cv.w), np.float32)
    x0 = int(round(cv.ox - M.W * s / 2 - 8)); y0 = int(round(cv.oy - 8))
    sh, sw = sa.shape
    ys0, xs0 = max(0, y0), max(0, x0)
    ys1, xs1 = min(cv.h, y0 + sh), min(cv.w, x0 + sw)
    out[ys0:ys1, xs0:xs1] = small[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0]
    oa[ys0:ys1, xs0:xs1] = sa[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0]
    if hood_shadow:
        # the hood overhangs the brow: its shadow is deepest at the crown and lifts towards the chin
        sh_ = 0.03 + 0.97 * smooth((B['Y'] - 14) / 100.0) ** 1.5
        side = (1 - 0.45 * smooth((np.abs(B['X']) - 30) / 22.0)) * (1 - 0.62 * smooth((B['X'] + 16) / 56.0))
        out *= (sh_ * side)[..., None]
    return out, oa * B['opening']


WOOL = np.array([0.020, 0.062, 0.036], np.float32)
WOOL_LIT = np.array([0.055, 0.150, 0.088], np.float32)
BRONZE = np.array([0.060, 0.082, 0.062], np.float32)
STEEL = np.array([0.16, 0.165, 0.17], np.float32)
GAUNT = np.array([0.045, 0.05, 0.052], np.float32)


def shade(B, mode='lit', back=(1.0, 0.92, 0.70), fill=(0.50, 0.74, 0.60), light2d=(-0.82, -0.57)):
    """mode 'dark': the silhouette with a little form. mode 'lit': the costume readable, still low-key."""
    s = B['s']; Hh = B['H']; mat = B['mat']; seed = B['seed']
    shape = Hh.shape
    lit = 1.0 if mode == 'lit' else 0.0
    back = np.array(back, np.float32); fill = np.array(fill, np.float32)
    n = normals(Hh + 0.6 * s * (white(shape, seed + 1) - 0.5), 1.0)
    n_s = normals(blur(Hh, 1.6 * s), 1.0)
    occ = ao(Hh, 22 * s, 0.035 / s) * ao(Hh, 6 * s, 0.05 / s)
    occ = np.clip(occ, 0.1, 1)
    occ = 1 - (1 - occ) * np.clip(edge_dist(B['alpha']) / (2.5 * s), 0, 1)
    Lf = (-0.22, 0.5, 0.84)                 # weak fill from below and in front: light off the snow and the ring
    Lg = (-0.86, -0.36, 0.36)               # the backlight catching whatever turns towards it
    dif_f = lambert(n, Lf); dif_g = lambert(n, Lg) ** 1.4
    weave = 1 + 0.35 * (blur(white(shape, seed + 5), 0.6) - 0.5) + 0.25 * (fbm(shape, 9 * s, 2, seed + 6) - 0.5)
    col = np.zeros(shape + (3,), np.float32)

    # the lamp is behind him and to the left, so only what turns that way is touched by it
    side = smooth((-B['X'] + 150) / 330.0)
    top = smooth((330 - B['Y']) / 300.0)
    wool = (mat == 1)
    c = (WOOL * 0.05 + WOOL_LIT * (dif_f * (0.05 + 0.10 * side))[..., None] * fill * lit
         + WOOL_LIT * (dif_g * side ** 1.3 * 1.0)[..., None] * back * (0.05 + 0.95 * lit))
    c = c * (weave * occ)[..., None]
    col = np.where(wool[..., None], c, col)

    met = (mat == 2)
    edge_sp = blinn(n, Lf, 30) * 0.30 + blinn(n, Lg, 46) * 0.9 * side
    c = BRONZE * 0.04 + BRONZE * (dif_f * 0.50)[..., None] * fill * lit + edge_sp[..., None] * (0.22 * fill * lit + 0.30 * back * lit)
    c = c * (occ * (0.75 + 0.5 * fbm(shape, 30 * s, 3, seed + 8)) * (0.35 + 0.65 * top))[..., None]
    col = np.where(met[..., None], c, col)

    for mid, base, k_spec in ((3, STEEL, 0.8 * 1.0), (5, GAUNT, 0.10)):
        mm = (mat == mid)
        sp = blinn(n_s, Lf, 24) * 0.5 * lit + blinn(n, Lg, 34) * 1.2 * (0.06 + 0.94 * lit)
        gk = 0.12 if mid == 5 else (0.25 + 0.75 * side)
        c = base * 0.04 + base * (dif_f * 0.8 * gk)[..., None] * fill * lit + base * (dif_g * 0.9 * gk)[..., None] * back * (0.05 + 0.95 * lit)
        c = c + (sp * gk)[..., None] * k_spec * (0.20 * fill + 0.45 * back)
        c = c * (occ * (0.8 + 0.4 * fbm(shape, 24 * s, 3, seed + 9)))[..., None]
        col = np.where(mm[..., None], c, col)

    cav = (mat == 4)
    col = np.where(cav[..., None], np.array([0.0012, 0.0022, 0.0016], np.float32), col)

    # the mask, inside the hood
    mlights = [((-0.72, -0.18, 0.67), tuple(back * 0.52 * lit), 0.8, 0.55), (Lf, tuple(fill * 0.26 * lit), 0.7, 0.30), (Lg, tuple(back * (0.04 + 0.96 * lit) * 0.2), 0.5, 0.5)]
    def env(rx, ry, rz):
        v = 0.006 + 0.10 * lit / (1 + np.exp(-(ry - 0.15) * 5.0)) + 0.34 * lit * np.exp(-(((rx + 0.5) / 0.3) ** 2 + ((ry - 0.2) / 0.5) ** 2))
        return np.dstack([v * fill[0], v * fill[1], v * fill[2]])
    mcol, ma = place_mask(B, mlights, env, exposure=1.0)
    col = over(col, mcol, ma)

    # rim: the lamp behind him draws the near edge of everything
    body_rim = rim_light(np.clip(B['body'] * (1 - B['arm']), 0, 1), light2d, 3.0, s) * 0.7 + rim_light(B['body'], light2d, 12.0, s) * 0.07
    arm_rim = rim_light(B['arm'], light2d, 1.8, s) * 0.6 + rim_light(B['arm'], light2d, 7.0, s) * 0.04
    hood_in = rim_light(np.clip(B['hood'] * (1 - B['opening']), 0, 1), (0.85, 0.2), 3.2, s) * 0.0
    rim = body_rim * (B['arm'] < 0.5) + arm_rim
    rim_k = 1.0 if mode == 'lit' else 0.5
    col += rim[..., None] * back * rim_k * np.where(mat[..., None] == 1, np.array([0.50, 0.62, 0.42], np.float32), np.array([1.0, 1.0, 1.0], np.float32))

    # the rune on the vambrace: emerald, and only once he is revealed
    if mode == 'lit':
        glow = blur(B['rune'], 0.4 * s) * 0.9 + blur(B['rune'], 3.0 * s) * 0.5
        col += glow[..., None] * np.array([0.10, 0.62, 0.36], np.float32) * 0.8
    return col, B['alpha']
