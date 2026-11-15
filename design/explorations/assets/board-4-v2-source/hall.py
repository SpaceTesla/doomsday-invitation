# The throne hall, rebuilt on the plan of references/environment/doom-throme-wide.png:
# one tall dark pier behind the throne with a slit of amber light, a bay of flowing leaded glass each side,
# pillars carrying amber ornament strips, great slanted fins beyond them, a stepped dais with lit edges,
# and a polished floor with an inlaid circle that burns green.
# Drawn as an elevation and lit in layers. Units: x = 0 on the axis of the room, y = 0 at the foot of the dais, up is negative.
import math, os, sys, json
import numpy as np
from PIL import Image, ImageDraw
import icongeo as I
import maskgeo as M
from rl import (Canvas, blur, fbm, white, catmull, smooth, rgb, save, over, vignette, edge_dist, pillow, bevel, rays, normals, lambert)
from figure import aniso
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'v2'))
G = json.load(open(os.path.join(HERE, 'glyphs.json')))

DESKTOP = dict(key='d', w=1920, h=1080, s=1.08, ox=960, oy=742)
PHONE = dict(key='p', w=780, h=1688, s=1.26, ox=390, oy=1030)
TOP = -1400.0


def lin(c):
    return rgb(c) ** 2.2


def D(pts, closed=True, n=8):
    return catmull(pts, closed, n)


def mirror(pts):
    return [(-p[0],) + tuple(p[1:]) for p in pts]


# ------------------------------------------------------------------ the plan
PIER = [(-52, TOP, 1), (52, TOP, 1), (60, -430, 1), (64, -415, 1), (-64, -415, 1), (-60, -430, 1)]
THRONE_BACK = [(-64, -430, 1), (64, -430, 1), (70, -400, 1), (92, -392, 1), (100, -300, 1), (112, -292, 1), (116, -172, 1),
               (-116, -172, 1), (-112, -292, 1), (-100, -300, 1), (-92, -392, 1), (-70, -400, 1)]
THRONE_PANEL = [(-21, -386, 1), (21, -386, 1), (21, -316, 1), (-21, -316, 1)]
SEAT = [(-78, -214, 1), (78, -214, 1), (84, -172, 1), (-84, -172, 1)]
ARM_R = [(60, -226, 1), (196, -252, 1), (200, -238, 1), (150, -214, 1), (64, -204, 1)]
SLIT = [(-5.5, TOP, 1), (5.5, TOP, 1), (5.5, -404, 1), (-5.5, -404, 1)]
BAY_R = [(66, TOP, 1), (304, TOP, 1), (304, 4, 1), (66, 4, 1)]
PILLAR_R = [(304, TOP, 1), (408, TOP, 1), (408, 20, 1), (304, 20, 1)]
PLINTH_R = [(296, -196, 1), (418, -196, 1), (424, 22, 1), (290, 22, 1)]
STRIP_R = [(338, TOP, 1), (376, TOP, 1), (376, -236, 1), (338, -236, 1)]
OUTER_BAY_R = [(408, TOP, 1), (640, TOP, 1), (640, 6, 1), (408, 6, 1)]
FIN_R = [(404, -214, 1), (430, -214, 1), (640 + 190, TOP, 1), (404, TOP, 1)]         # widens as it climbs
PILLAR2_R = [(636, TOP, 1), (692, TOP, 1), (692, 20, 1), (636, 20, 1)]
STRIP2_R = [(650, TOP, 1), (678, TOP, 1), (678, -150, 1), (650, -150, 1)]
STRIP3_R = [(866, TOP, 1), (902, TOP, 1), (902, -250, 1), (866, -250, 1)]
LAMP_R = (852, -322)

# the leading in one bay: uprights that bend and part like stems, tied by short level bars
MULLIONS_R = [
    ([(122, 4), (122, -180), (126, -300), (150, -410), (182, -520), (196, -660), (192, -820), (170, -1000), (160, TOP)], 7),
    ([(186, 4), (186, -120), (182, -230), (160, -330), (150, -410)], 6),
    ([(246, 4), (246, -210), (240, -330), (214, -450), (196, -560), (196, -660)], 7),
    ([(246, -210), (262, -330), (270, -480), (262, -640), (236, -800), (226, -960), (236, TOP)], 6),
    ([(122, -180), (100, -300), (92, -460), (104, -620), (128, -760), (136, -900), (120, TOP)], 5),
    ([(66, -96), (122, -96)], 5), ([(122, -150), (186, -150)], 5), ([(186, -64), (246, -64)], 5), ([(246, -120), (304, -120)], 5),
    ([(66, -250), (124, -250)], 5), ([(182, -236), (243, -236)], 5), ([(250, -280), (304, -280)], 5),
    ([(66, -420), (93, -420)], 5), ([(268, -450), (304, -450)], 5), ([(152, -410), (226, -410)], 4),
    ([(66, -620), (104, -620)], 5), ([(196, -640), (264, -640)], 4), ([(264, -640), (304, -640)], 5),
]

STEPS = 9
STEP_H = 19.5


def step_geom(i):
    """i = 0 at the floor. Returns (half width of the whole step, half width of its lit middle, y of its top edge)."""
    return 452 - i * 30.5, 262 - i * 13.5, -(i + 1) * STEP_H


# ------------------------------------------------------------------ runes on the floor
def glyph_polys(key):
    out = []
    for sub in G[key]['d'].split('M')[1:]:
        pts = [tuple(float(v) for v in p.split(',')) for p in sub.replace('Z', '').split()]
        out.append(pts)
    return out, G[key]['w']


def ring_mask(cv, text, cy, rx, ry, size, start=-90.0):
    """Runes set round an ellipse on the floor, heads towards the centre. Even-odd fill per glyph."""
    seq = []
    for ch in text:
        if ch == ' ':
            seq.append((None, 46)); continue
        if ch == '.':
            seq.append(('dot', 46)); continue
        k = 'k' if ch == 'q' else ch
        seq.append((k, G[k]['w']))
    gap = 30
    total = sum(w for _, w in seq) + gap * len(seq)
    acc = np.zeros((cv.h, cv.w), np.float32)
    pos = 0.0
    for k, w in seq:
        if k is not None:
            a_mid = math.radians(start + 360.0 * (pos + w / 2) / total)
            def tf(px, py):
                ang = math.radians(start + 360.0 * (pos + px) / total)
                r = 1.0 + (50 - py) / 100.0 * size          # glyph height runs radially
                x = rx * r * math.cos(ang); y = ry * r * math.sin(ang)
                persp = 1 + 0.16 * math.sin(ang)
                return (x * persp, cy + y * (1 + 0.22 * math.sin(ang)))
            if k == 'dot':
                polys = [[(w / 2 - 7, 43), (w / 2 + 7, 43), (w / 2 + 7, 57), (w / 2 - 7, 57)]]
            else:
                polys, _ = glyph_polys(k)
            g = None
            for poly in polys:
                dense = []
                for (x0, y0), (x1, y1) in zip(poly, poly[1:] + poly[:1]):
                    for t in (0, 0.5):
                        dense.append(tf(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t))
                m = cv.poly(dense) > 0.5
                g = m if g is None else np.logical_xor(g, m)
            acc = np.maximum(acc, g.astype(np.float32))
        pos += w + gap
    return blur(acc, 0.6)


# ------------------------------------------------------------------ the seated figure
def seated(cv):
    """Doom on the throne, small in the frame: leaning forward, forearms on his thighs. Returns linear rgb, alpha."""
    s = cv.scale
    h, w = cv.h, cv.w
    Y0 = -172.0
    cloak = cv.poly(D([(0, -292), (30, -290), (54, -276), (66, -250), (72, -214), (80, -186), (86, Y0), (-86, Y0), (-80, -186),
                       (-72, -214), (-66, -250), (-54, -276), (-30, -290)]))
    hood = cv.poly(D([(0, -338, 1), (14, -332), (24, -316), (27, -296), (22, -276), (0, -268), (-22, -276), (-27, -296), (-24, -316), (-14, -332)]))
    face = cv.poly(D([(0, -322), (10, -318), (14, -304), (11, -286), (0, -280), (-11, -286), (-14, -304), (-10, -318)]))
    legs = cv.polys([D(p) for p in ([(22, -226), (52, -230), (66, -214), (68, -186), (70, Y0), (44, Y0), (40, -204)],
                                    [(-22, -226), (-52, -230), (-66, -214), (-68, -186), (-70, Y0), (-44, Y0), (-40, -204)])])
    greave = cv.polys([[(46, -218), (64, -214), (66, -178), (50, -176)], [(-46, -218), (-64, -214), (-66, -178), (-50, -176)]])
    fore = cv.polys([D(p) for p in ([(52, -256), (46, -240), (14, -224), (10, -234), (38, -252)], [(-52, -256), (-46, -240), (-14, -224), (-10, -234), (-38, -252)])])
    hands = cv.poly(D([(-13, -234), (13, -234), (15, -220), (-15, -220)]))
    chest = cv.poly([(-30, -276), (30, -276), (26, -236), (-26, -236)])
    boots = cv.polys([D(p) for p in ([(42, -182), (70, -182), (80, Y0), (40, Y0)], [(-42, -182), (-70, -182), (-80, Y0), (-40, Y0)])])
    alpha = np.clip(cloak + hood + legs + boots, 0, 1)
    hgt = 30 * s * pillow(cloak, 40 * s) + 20 * s * pillow(hood, 20 * s) * hood + 40 * s * pillow(legs, 12 * s) * legs \
        + 60 * s * pillow(fore, 7 * s) * fore + 50 * s * pillow(boots, 12 * s) * boots + 55 * s * pillow(greave, 8 * s) * greave
    n = normals(hgt, 1.0)
    Lr = (0.62, -0.5, 0.6); Ll = (-0.7, -0.45, 0.55)
    dif = lambert(n, Lr) * 0.9 + lambert(n, Ll) * 0.45
    cloth = lin('#0c1a12'); steel = lin('#586460')
    col = np.ones((h, w, 3), np.float32) * cloth * (0.12 + 0.5 * dif[..., None])
    metal = np.clip(greave + fore + hands + boots * 0.8, 0, 1)
    sp = np.clip(n[0] * 0.5 + (-n[1]) * 0.6 + n[2] * 0.62, 0, 1) ** 9
    mcol = steel * (0.05 + 0.22 * dif[..., None]) + lin('#f1e7b4') * (sp * 0.55)[..., None]
    col = over(col, mcol, metal)
    col = over(col, lin('#101a16') * (0.4 + 0.8 * dif[..., None]), chest * 0.9)
    # the face: the level-1 silhouette of the mask, catching the window light on one side
    X, Yg = cv.grid()
    fx = (X) / 0.29; fy = (Yg + 324) / 0.29
    m1 = cv.poly([(p[0] * 0.29, -324 + p[1] * 0.29) for p in M.dense(M.OUTLINE)])
    eyes = cv.polys([[(p[0] * 0.29, -324 + p[1] * 0.29) for p in M.dense(sh)] for sh in M.both(M.EYE_FRAME)])
    mouth = cv.poly([(-17 * .29, -324 + 114.6 * .29), (17 * .29, -324 + 114.6 * .29), (22 * .29, -324 + 122.6 * .29), (-22 * .29, -324 + 122.6 * .29)])
    col = over(col, lin('#020403') * np.ones((h, w, 3), np.float32), face)
    shade_m = (0.10 + 0.55 * smooth((Yg + 318) / 26.0)) * (0.55 + 0.45 * smooth((X + 14) / 26.0))
    col = over(col, lin('#7d8884') * (shade_m * 0.30)[..., None], m1 * face)
    col = over(col, lin('#010202') * np.ones((h, w, 3), np.float32), np.clip(eyes + mouth, 0, 1) * face)
    # clasps
    cl = cv.discs([(-27, -272), (27, -272)], 4.0)
    col = over(col, lin('#c9c7a8') * np.ones((h, w, 3), np.float32) * 0.10, cl * 0.8)
    occ = np.clip(1 - 0.03 / s * np.clip(blur(hgt, 8 * s) - hgt, 0, None), 0.25, 1)
    return col * occ[..., None], blur(alpha, 0.6)


# ------------------------------------------------------------------ the room
def render(cfg, seed=31):
    w, h, s = cfg['w'], cfg['h'], cfg['s']
    cv = Canvas(w, h, s, cfg['ox'], cfg['oy'], ss=2)
    X, Y = cv.grid()
    shape = (h, w)
    both = lambda p: [p, mirror(p)]
    floor_px = int(round(cfg['oy'] + 2 * s))

    # ---- glass
    bays = cv.polys(both(BAY_R)); outer = cv.polys(both(OUTER_BAY_R))
    t = np.clip(-Y / 760.0, 0, 1.6)
    stops = [(0.0, lin('#235c40'), 0.22), (0.16, lin('#7fae5e'), 0.50), (0.36, lin('#e2d874'), 0.95), (0.62, lin('#f3ecae'), 1.25),
             (0.95, lin('#cfd88c'), 0.95), (1.6, lin('#7fa870'), 0.6)]
    gl = np.zeros(shape + (3,), np.float32)
    for (t0, c0, i0), (t1, c1, i1) in zip(stops, stops[1:]):
        k = np.clip((t - t0) / (t1 - t0), 0, 1)
        seg = (t >= t0) & (t <= t1)
        gl = np.where(seg[..., None], (c0 * i0)[None, None, :] * (1 - k[..., None]) + (c1 * i1)[None, None, :] * k[..., None], gl)
    streak = aniso(shape, 16 * s, 420 * s, seed)
    blotch = fbm(shape, 70 * s, 4, seed + 2)
    grime = np.clip(0.25 + 1.25 * streak, 0.12, 1.3) * np.clip(0.35 + 1.15 * blotch, 0.3, 1.3)
    sunside = 0.72 + 0.5 * smooth((X + 300) / 600.0)                    # the sun stands to the right
    green_low = smooth((Y + 150) / 150.0)                                # the lowest panes are thicker and greener
    glass = gl * (grime * sunside)[..., None]
    glass = glass * (1 - 0.55 * green_low[..., None]) + lin('#1f5a3e')[None, None, :] * (0.5 * green_low * grime)[..., None]
    E = glass * bays[..., None] + glass * (outer * 0.62)[..., None] * np.array([0.8, 1.0, 0.85], np.float32)

    # amber ornament strips: a stack of lantern shapes over a foot of pale blue-green glass
    def strip(poly, foot_y, cell=64.0, k=1.0):
        m = cv.polys(both(poly))
        x0, x1 = poly[0][0], poly[1][0]
        cx = (x0 + x1) / 2; hw = (x1 - x0) / 2
        u = (np.abs(X) - cx) / hw
        v = ((Y - foot_y) / cell) % 1.0
        lantern = np.clip(1.25 - np.abs(u) * 1.1 - np.abs(v - 0.5) * 1.5, 0, 1)
        lead = np.clip(np.minimum(np.abs(np.abs(u) - 0.45), np.abs(v - 0.5)) * 9, 0, 1) * np.clip(np.abs(v - 0.02) * 16, 0, 1)
        amber = lin('#ee9a2e') * 1.15 * (0.12 + 1.1 * lantern ** 1.5)[..., None] * lead[..., None]
        footm = smooth((Y - (foot_y - 150)) / 80.0)
        pale = lin('#6fb8a6') * 0.5 * (0.4 + 0.6 * lead)[..., None]
        return (amber * (1 - footm[..., None]) + pale * footm[..., None]) * (m * (0.6 + 0.6 * blotch) * k)[..., None], m
    e1, m1 = strip(STRIP_R, -236); e2, m2 = strip(STRIP2_R, -150, 56, 0.6); e3, m3 = strip(STRIP3_R, -250, 60, 0.7)
    slit = cv.poly(SLIT)
    bars = 1 - np.clip(1 - np.abs(((Y + 404) / 118.0) % 1.0 - 0.5) * 30, 0, 1) * 0.9
    e_slit = lin('#f6b23c') * 1.7 * (slit * bars)[..., None]

    # ---- structure in front of the glass
    mull = np.zeros(shape, np.float32)
    for pts, wd in MULLIONS_R:
        for q in both(pts):
            mull = np.maximum(mull, cv.line(D(q, False), wd * 1.75))
    frame_lines = cv.lines([[(66, TOP), (66, 4)], [(304, TOP), (304, 4)], [(-66, TOP), (-66, 4)], [(-304, TOP), (-304, 4)]], 14)
    mull = np.clip(mull + frame_lines, 0, 1) * bays
    outer_m = cv.lines([q for x in (470, 540, 596) for q in ([(x, TOP), (x, 6)], [(-x, TOP), (-x, 6)])]
                       + [q for y in (-120, -300, -480, -700, -900) for q in ([(408, y), (640, y)], [(-408, y), (-640, y)])], 10) * outer
    pier = cv.poly(PIER); tback = cv.poly(THRONE_BACK); seat = cv.poly(SEAT)
    arms = cv.polys(both(ARM_R))
    pillars = cv.polys(both(PILLAR_R) + both(PILLAR2_R)); plinth = cv.polys(both(PLINTH_R))
    fins = cv.polys(both(FIN_R))
    side = (np.abs(X) > 690).astype(np.float32)
    wall = np.clip(pier + pillars + plinth + fins + side + mull + outer_m, 0, 1)
    strips_m = np.clip(m1 + m2 + m3, 0, 1)
    wall_solid = np.clip(wall * (1 - strips_m) * (1 - slit), 0, 1)

    Eall = E * (1 - np.clip(mull + outer_m, 0, 1))[..., None]
    Eall = Eall * (1 - np.clip(pier + pillars + plinth + fins + side, 0, 1))[..., None]
    Eall = Eall + (e1 + e2 + e3) * (1 - fins * 0)[..., None] + e_slit
    lum = Eall.mean(axis=2)

    # what the structure itself looks like: dark stone and bronze, picked out by spill from the glass
    spill = np.dstack([blur(Eall[..., i], 46 * s) for i in range(3)])
    spill_n = np.dstack([blur(Eall[..., i], 12 * s) for i in range(3)])
    stone = lin('#0a1512')
    tex = 0.7 + 0.6 * fbm(shape, 60 * s, 4, seed + 5)
    ribs = 0.82 + 0.18 * np.cos(X / 7.5 * math.pi) * pier + 0.0
    img = np.ones(shape + (3,), np.float32) * stone * tex[..., None]
    img = img * (0.5 + 0.5 * ribs)[..., None]
    img += spill * 0.09 * tex[..., None] + spill_n * 0.07
    # the fins: darkest at the top, a little light along the edge that faces the windows
    fin_edge = np.exp(-edge_dist(fins) / (10 * s)) * fins
    img = img * (1 - 0.55 * fins[..., None]) + spill * 0.10 * fin_edge[..., None]
    img = img * (1 - 0.6 * side[..., None] * smooth((np.abs(X) - 690) / 200.0)[..., None])
    img = img * wall_solid[..., None] + Eall
    # bloom: the glass is far brighter than anything in front of it, so it eats into the leading
    glow = np.dstack([blur(Eall[..., i], 4 * s) * 0.22 + blur(Eall[..., i], 20 * s) * 0.14 + blur(Eall[..., i], 90 * s) * 0.10 for i in range(3)])
    img += glow

    # ---- throne and dais
    tb = np.clip(tback + seat + arms, 0, 1)
    bronze = lin('#191a11')
    tn = normals(60 * s * bevel(tback, 10 * s) + 30 * s * bevel(arms, 4 * s) + 30 * s * bevel(seat, 4 * s), 1.0)
    tl = lambert(tn, (0.6, -0.6, 0.5)) + 0.6 * lambert(tn, (-0.6, -0.5, 0.5))
    tcol = bronze * (0.25 + 1.0 * tl[..., None]) * tex[..., None] + spill * 0.05
    img = over(img, tcol, tb)
    panel = cv.poly(THRONE_PANEL)
    pm = cv.lines([[(p[0] * 15, -351 + p[1] * 15) for p in ln] for k, lines in I.rune_parts(True).items() if k not in ('inner hexagon',) for ln in lines], 1.3)
    pcol = lin('#3a2c10') * np.ones(shape + (3,), np.float32) + lin('#f0bf55') * (pm * 1.5)[..., None]
    img = over(img, pcol, panel)
    img += lin('#f0bf55') * (blur(pm * panel, 3 * s) * 0.5)[..., None]
    img = over(img, lin('#d9a94a') * np.ones(shape + (3,), np.float32) * 0.9, np.clip(cv.line(THRONE_PANEL, 1.6, closed=True), 0, 1))

    gold_e = np.zeros(shape, np.float32)
    for i in range(STEPS):
        hw, lit, ytop = step_geom(i)
        ybot = ytop + STEP_H
        ch = 26.0
        riser = cv.poly([(-hw, ytop), (hw, ytop), (hw + 3, ybot), (-hw - 3, ybot)])
        mid = cv.poly([(-lit, ytop), (lit, ytop), (lit + 2, ybot), (-lit - 2, ybot)])
        d_side = np.clip((np.abs(X) - lit) / max(1.0, hw - lit), 0, 1)
        warm = lin('#3b3520'); cold = lin('#10201a')
        base = (warm * (0.30 + 0.25 * (i / STEPS))) * (1 - d_side[..., None]) + cold * d_side[..., None] * 0.55
        vgrad = 0.55 + 0.6 * np.clip((Y - ytop) / STEP_H, 0, 1)
        rcol = base * vgrad[..., None] * tex[..., None] + spill * 0.025
        img = over(img, rcol, riser)
        tread = cv.poly([(-hw, ytop - 2.2), (hw, ytop - 2.2), (hw, ytop + 1.2), (-hw, ytop + 1.2)])
        img = over(img, lin('#57532f') * (0.35 + 0.7 * (1 - d_side[..., None])) * np.ones(shape + (3,), np.float32), tread * 0.8)
        gold_e = np.maximum(gold_e, cv.poly([(-lit, ytop - 0.4), (lit, ytop - 0.4), (lit, ytop + 2.6), (-lit, ytop + 2.6)]))
    gfade = (0.45 + 0.55 * smooth((-Y) / 170.0)) * (0.75 + 0.5 * fbm(shape, 50 * s, 2, seed + 30))
    img += lin('#f2b23f') * ((gold_e * 0.95 + blur(gold_e, 2.5 * s) * 0.5 + blur(gold_e, 9 * s) * 0.16) * gfade)[..., None]

    # ---- lamps on the side walls
    lamp_e = np.zeros(shape, np.float32)
    for sx in (1, -1):
        lx, ly = sx * LAMP_R[0], LAMP_R[1]
        bowl = cv.poly(D([(lx - 58, ly - 20), (lx + 58, ly - 20), (lx + 50, ly + 4), (lx + 24, ly + 20), (lx - 24, ly + 20), (lx - 50, ly + 4)]))
        post = cv.poly([(lx - 20, ly + 18), (lx + 20, ly + 18), (lx + 24, 26), (lx - 24, 26)])
        img = over(img, lin('#050908') * np.ones(shape + (3,), np.float32), post)
        motif = cv.lines([[(lx - 30, ly + 8), (lx - 12, ly - 8), (lx, ly + 8), (lx + 12, ly - 8), (lx + 30, ly + 8)]], 2.2)
        img = over(img, lin('#f0dcaa') * 0.8 * np.ones(shape + (3,), np.float32) * (1 - 0.7 * motif[..., None]) * (0.55 + 0.45 * smooth((Y - ly + 22) / 40.0))[..., None], bowl)
        lamp_e = np.maximum(lamp_e, bowl)
    img += lin('#f0d79a') * (blur(lamp_e, 14 * s) * 0.3 + blur(lamp_e, 60 * s) * 0.22)[..., None]

    # ---- shafts of light through the glass, from high on the right
    src = np.clip(lum / 1.3, 0, 1) * (Y < 0)
    shafts = rays(src, (cfg['ox'] + 330 * s, cfg['oy'] - 1500 * s), steps=60, reach=0.95, decay=0.975)
    shafts2 = rays(src, (cfg['ox'] - 420 * s, cfg['oy'] - 1700 * s), steps=40, reach=0.7, decay=0.97)
    img += lin('#f1d98a') * (shafts * 0.55 * (0.35 + 0.65 * smooth((X + 250) / 500.0)))[..., None] + lin('#8fc09a') * (shafts2 * 0.12)[..., None]

    # ---- the floor: a dark mirror with the inlaid circle
    wall_img = img.copy()
    fh = h - floor_px
    if fh > 4:
        refl = wall_img[max(0, floor_px - fh):floor_px][::-1]
        if refl.shape[0] < fh:
            refl = np.pad(refl, ((0, fh - refl.shape[0]), (0, 0), (0, 0)), mode='edge')
        refl = np.dstack([ndi.gaussian_filter(refl[..., i], (26 * s, 5 * s)) for i in range(3)])
        yy = np.linspace(0, 1, fh, dtype=np.float32)[:, None]
        slab = 0.75 + 0.5 * fbm((fh, w), 120 * s, 3, seed + 9)
        fall = (0.30 * np.exp(-yy * 2.6) + 0.035)
        floor = refl * fall[..., None] * slab[..., None] + lin('#060b09')[None, None, :] * slab[..., None] * 0.8
        # joints between the slabs, converging on the axis
        Xf, Yf = X[floor_px:], Y[floor_px:]
        vy = Yf + 240.0
        u = Xf / np.clip(vy, 1, None) * 240.0
        joints = np.clip(1 - np.abs((u / 150.0) % 1.0 - 0.5) * 2 * 60, 0, 1) + np.clip(1 - np.abs((np.log(np.clip(vy, 1, None)) * 5.2) % 1.0 - 0.5) * 2 * 26, 0, 1)
        floor *= (1 - 0.35 * np.clip(joints, 0, 1))[..., None]
        img[floor_px:] = floor
    cyf = 158.0 if w > h else 166.0
    rxf = 560.0 if w > h else 286.0
    ryf = 96.0 if w > h else 104.0
    ring = ring_mask(cv, 'there is no promise of tomorro . ' * (2 if w > h else 1), cyf, rxf, ryf, 0.115 if w > h else 0.2)
    th = np.linspace(0, 2 * math.pi, 240)
    def ell(k, n=240):
        return [(rxf * k * math.cos(a) * (1 + 0.16 * math.sin(a)), cyf + ryf * k * math.sin(a) * (1 + 0.22 * math.sin(a))) for a in th]
    lines = cv.lines([ell(1.10), ell(0.90)], 2.0)
    def fpt(p, k=0.86):
        a_ = math.atan2(p[1], p[0]); r_ = math.hypot(p[0], p[1])
        x = rxf * k * r_ * math.cos(a_); y = ryf * k * r_ * math.sin(a_)
        return (x * (1 + 0.16 * math.sin(a_) * r_), cyf + y * (1 + 0.22 * math.sin(a_) * r_))
    lat = I.rune_parts(False)
    lattice = cv.lines([[fpt(p) for p in [(ln[i][0] + (ln[i + 1][0] - ln[i][0]) * t / 6, ln[i][1] + (ln[i + 1][1] - ln[i][1]) * t / 6)
                                           for i in range(len(ln) - 1) for t in range(7)]] for k, lns in lat.items() if k != 'hooks' for ln in lns], 2.4)
    inlay = np.clip(ring + lines + lattice * 0.9, 0, 1) * (Y > 2)
    burn = fbm(shape, 30 * s, 3, seed + 12)
    alive = np.clip((burn - 0.36) * 3.2, 0, 1)                            # the fire runs along some of the lines and not others
    em = lin('#3fe07f')
    sparks = (white(shape, seed + 14) > 0.9965).astype(np.float32) * blur(inlay, 9 * s) * 6
    sparks = ndi.gaussian_filter(sparks, (2.6 * s, 0.7 * s))
    flame = ndi.gaussian_filter(inlay * alive, (5 * s, 1.2 * s))
    flame = np.roll(flame, -int(3 * s), axis=0)
    img += lin('#1c5a3c') * (inlay * 0.5)[..., None]
    img += em * (inlay * alive * 1.3 + flame * 1.1 + blur(inlay * alive, 14 * s) * 0.9 + sparks * 1.2)[..., None]
    img += lin('#d8ff9a') * (inlay * alive ** 2 * 0.7)[..., None]

    # ---- air
    haze_low = smooth((Y + 260) / 300.0) * smooth((60 - Y) / 200.0)
    img += lin('#2f6a50') * (haze_low * (0.03 + 0.07 * smooth((X + 200) / 700.0)) * (0.6 + 0.8 * fbm(shape, 200 * s, 3, seed + 20)))[..., None]
    img *= vignette(shape, 0.78, 1.8, 0.5, 0.46)[..., None]
    return img, cv


def to_srgb(lin_img, exposure=1.0):
    x = np.clip(lin_img * exposure, 0, None)
    x = np.where(x > 0.55, 0.55 + (1 - np.exp(-(x - 0.55) * 1.5)) * 0.45, x)
    return np.clip(x, 0, 1) ** (1 / 2.2)


def make(cfg, preview=None):
    img, cv = render(cfg)
    plate = to_srgb(img, 0.95)
    plate = np.clip(plate + (white(plate.shape[:2], 5) - 0.5)[..., None] * 0.018, 0, 1)
    save(plate, os.path.join(OUT, 'hall-%s-plate.jpg' % cfg['key']), quality=88)
    dcol, da = seated(cv)
    dsr = to_srgb(dcol, 1.0)
    save(dsr, os.path.join(OUT, 'hall-%s-doom.webp' % cfg['key']), alpha=da, quality=90)
    if preview:
        save(over(plate, dsr, da), os.path.join(preview, 'hall-%s.jpg' % cfg['key']), quality=88)
    print('made hall', cfg['key'])


if __name__ == '__main__':
    which = sys.argv[1] if len(sys.argv) > 1 else 'both'
    prev = sys.argv[2] if len(sys.argv) > 2 else None
    for cfg in (DESKTOP, PHONE):
        if which in ('both', cfg['key']):
            make(cfg, prev)
