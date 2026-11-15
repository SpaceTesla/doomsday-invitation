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

# elbow under the shoulder, forearm rising nearly upright, hand in line with it
DESKTOP_ARM = dict(elbow=(-292, 425), wrist=(-323, 264), palm=(-330, 214))
PHONE_ARM = dict(elbow=(-208, 311), wrist=(-180.5, 143), palm=(-178, 93))


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
    # Proportions taken from the character references (mask width = 100):
    #   hood about 1.85 mask widths across at eye level, its crown 0.3 to 0.5 widths above the mask,
    #   widening below the cheek so it falls onto the shoulders without a neck;
    #   clasps about 2 widths apart and 0.5 to 0.9 widths below the chin; shoulders about 4.5 widths.
    o['hood'] = [(0, -42), (22, -39), (46, -27), (67, -7), (82, 20), (90, 52), (94, 88), (99, 120), (110, 146), (128, 168),
                 (152, 186), (120, 202), (64, 208), (0, 212), (-64, 208), (-120, 202), (-152, 186), (-128, 168), (-110, 146),
                 (-99, 120), (-94, 88), (-90, 52), (-82, 20), (-67, -7), (-46, -27), (-22, -39)]
    o['opening'] = [(0, 7, 1), (19, 12), (36, 25), (47, 46), (53, 72), (55, 100), (52.5, 126), (45, 147), (28, 160), (0, 166),
                    (-28, 160), (-45, 147), (-52.5, 126), (-55, 100), (-53, 72), (-47, 46), (-36, 25), (-19, 12)]
    # cloak: shoulders and the fall of the cloth. On the left it lies over the upper arm and hangs behind the forearm.
    ex, ey = E
    o['cloak'] = [(0, 150), (70, 158), (112, 168), (150, 180), (186, 198), (208, 222), (222, 262), (234, 330), (246, 430),
                  (258, 570), (272, 770), (282, 1000, 1), (-334, 1000, 1), (-324, 770), (-318, 620),
                  (ex - 36, ey + 70), (ex - 42, ey - 6), (ex - 12, ey - 60), (-250, 318), (-222, 262), (-208, 222), (-186, 198),
                  (-150, 180), (-112, 168), (-70, 158)]
    o['cowl'] = [(-128, 196), (-90, 178), (-48, 168), (0, 162), (48, 168), (90, 178), (128, 196), (124, 220), (100, 232),
                 (56, 226), (0, 240), (-56, 226), (-100, 232), (-124, 220)]
    o['chest'] = [(-112, 214, 1), (112, 214, 1), (126, 1000, 1), (-126, 1000, 1)]
    o['clasps'] = [(-100, 228), (100, 228)]
    return o


def hand_geometry(arm):
    """The raised gauntlet: vambrace, flared cuff, wrist, palm and five jointed fingers, in figure units.

    Sizes follow the hand reference and ordinary anatomy, in mask widths (100 units):
    hand length about 1.55 (a little over the height of the mask), palm 0.8 wide, wrist 0.56,
    fingers 0.17 to 0.2 thick; middle finger 0.43 of the hand's length; the cuff flares away from the wrist."""
    E, Wr, Pm = (np.array(arm[k], np.float32) for k in ('elbow', 'wrist', 'palm'))
    u = (Pm - Wr); u = u / np.linalg.norm(u)          # along the hand, towards the fingers
    v = np.array([-u[1], u[0]], np.float32)            # across the hand
    if v[0] < 0:
        v = -v                                         # v points to screen right, so the thumb falls on the left
    def L(x, y):
        p = Pm + x * v + y * u
        return (float(p[0]), float(p[1]))

    def chain(base, lengths, angles, widths):
        """Joints of one finger. angles are measured from straight up the hand, positive towards the little finger."""
        pts = [base]
        for ln, a in zip(lengths, angles):
            r = math.radians(a)
            pts.append((pts[-1][0] + math.sin(r) * ln, pts[-1][1] + math.cos(r) * ln))
        return dict(local=pts, pts=[L(*p) for p in pts], widths=widths)

    def finger(base, length, lean, width, curl):
        # three phalanges, 46 / 30 / 24 percent; each turns a little further in towards the middle of the hand
        return chain(base, [length * .46, length * .30, length * .24], [lean, lean + curl, lean + 2 * curl],
                     [width, width * .95, width * .89, width * .80])

    fingers = [
        chain((-37, -20), [31, 26], [-50, -27], [24, 21.5, 18]),          # thumb: two phalanges, set low on the palm
        finger((-27, 37), 60, -6, 19.5, 3.5),                                # index
        finger((-7, 41), 67, -1, 20.5, 1.0),                                 # middle, the longest
        finger((13, 38), 62, 5, 19.5, -3.0),                                 # ring
        finger((31, 28), 48, 13, 17, -4.5),                                  # little
    ]
    palm = [L(*p) for p in ((-27, -52), (-36, -40), (-45, -18), (-46, 6), (-41, 28), (-37, 40), (-18, 46), (0, 48),
                            (20, 46), (37, 38), (42, 22), (42, -2), (37, -30), (28, -52))]
    creases = [[L(-30, 30), L(-8, 24), L(18, 26), L(38, 20)], [L(-36, 8), L(-20, -6), L(-12, -30), L(-10, -48)]]
    fa = (Wr - E); fl = np.linalg.norm(fa); fu = fa / fl
    fv = np.array([-fu[1], fu[0]], np.float32)
    def F(t, x):
        p = E + fu * (t * fl) + fv * x
        return (float(p[0]), float(p[1]))
    k = 100.0 / fl                                     # so lengths along the forearm can be given in units
    wrist = [F(1 + 2 * k / 100, -28), F(1 + 8 * k / 100, -28), F(1 + 8 * k / 100, 28), F(1 + 2 * k / 100, 28),
             F(1 - 12 * k / 100, 29), F(1 - 12 * k / 100, -29)]
    t_rim = 1 - 62 * k / 100                           # the cuff is a bell: narrow at the wrist, widest 62 units down
    cuff = [F(1 - 2 * k / 100, -31), F(1 - 2 * k / 100, 31), F(1 - 30 * k / 100, 37), F(t_rim, 44), F(t_rim, -44),
            F(1 - 30 * k / 100, -37)]
    forearm = [F(t_rim + 6 * k / 100, -39), F(t_rim + 6 * k / 100, 39), F(0.2, 44), F(-0.25, 47), F(-0.25, -47), F(0.2, -44)]
    bands = [[F(1 - 8 * k / 100, -33), F(1 - 8 * k / 100, 33)], [F(1 - 17 * k / 100, -35), F(1 - 17 * k / 100, 35)],
             [F(t_rim + 5 * k / 100, -44), F(t_rim + 5 * k / 100, 44)]]
    return dict(fingers=fingers, palm=palm, creases=creases, wrist=wrist, forearm=forearm, cuff=cuff, bands=bands,
                couter=(F(0, 0), 31.0), t_rim=t_rim, F=F, L=L, fl=float(fl))


def tile_masks(cv, x0=-118.2, y0=221.0, pitch=39.4, cols=6, rows=20):
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
        ([(196, 204), (226, 320), (238, 520), (250, 900)], 30, 13), ([(160, 190), (180, 370), (188, 600), (196, 900)], 24, 9),
        ([(124, 234), (130, 400), (128, 640), (132, 900)], 20, 10), ([(-124, 234), (-130, 400), (-132, 640), (-136, 900)], 20, 10),
        ([(-196, 204), (-226, 300), (-250, 400), (-262, 900)], 26, 11),
        ([(ex - 20, ey - 40), (ex - 34, ey + 80), (ex - 30, ey + 260), (ex - 34, 900)], 28, 14),
        ([(ex + 34, ey - 70), (ex + 40, ey + 100), (ex + 44, ey + 320), (ex + 40, 900)], 22, 9),
    ]
    for pts, wd, lift in folds:
        cloth += lift * s * blur(cv.line(D(pts, False), wd * 0.5), wd * 0.42 * s)
    # the hood: a rolled edge round the opening, a seam over the crown, and gathers at the neck
    hoodring = hood * (1 - opening)
    cloth += 34 * s * pillow(hoodring, 38 * s) * hood
    rim = np.clip(blur(opening, 7 * s) - opening, 0, 1) * hood
    cloth += 24 * s * rim
    for pts, wd, lift in (([(-54, -14), (-78, 40), (-84, 110), (-104, 180)], 14, 8), ([(54, -14), (78, 40), (84, 110), (104, 180)], 14, 8),
                          ([(-24, -34), (-56, 6), (-70, 70), (-70, 140)], 10, 5), ([(24, -34), (56, 6), (70, 70), (70, 140)], 10, 5),
                          ):
        cloth += lift * s * blur(cv.line(D(pts, False), wd * 0.5), wd * 0.42 * s) * hood
    cloth = blur(cloth, 3.5 * s)
    # the cowl: thick turns of cloth lying across the collar bones
    cw = 16 * s * pillow(cowl, 30 * s)
    for pts, wd, lift in (([(-120, 204), (-60, 212), (0, 218), (60, 212), (120, 204)], 13, 10),
                          ([(-110, 224), (-56, 220), (0, 231), (56, 220), (110, 224)], 12, 9)):
        cw += lift * s * blur(cv.line(D(pts, False), wd * 0.5), wd * 0.4 * s)

    # ---- cuirass
    fr, f2, sq, dm = tile_masks(cv)
    chest_h = 70 * s * np.sqrt(np.clip(1 - (X / 210.0) ** 2, 0, 1))
    chest_h += 4.2 * s * bevel(fr, 1.6 * s) - 3.0 * s * blur(f2, 0.8 * s) + 3.0 * s * bevel(sq, 1.4 * s)
    chest_h += 4.5 * s * pillow(dm, 7 * s) * dm

    # ---- clasps and chain
    (clx, cly), (crx, cry) = O['clasps']
    disc = cv.discs(O['clasps'], 29)
    dd = edge_dist(disc)
    clasp_h = 10 * s * pillow(disc, 29 * s) + 4 * s * smooth(1 - np.abs(dd - 3.8 * s) / (2.5 * s))
    star = []
    for i in range(16):
        a0 = math.pi * 2 * i / 16; r1 = 20.5 if i % 2 == 0 else 13
        star.append([(clx + r1 * math.cos(a0), cly + r1 * math.sin(a0)), (clx + 6 * math.cos(a0 + 0.42), cly + 6 * math.sin(a0 + 0.42)),
                     (clx + 6 * math.cos(a0 - 0.42), cly + 6 * math.sin(a0 - 0.42))])
    starm = cv.polys(star)
    clasp_h += 5 * s * blur(starm, 0.7 * s) + 5 * s * pillow(cv.discs([(clx, cly)], 5.5), 5.5 * s)
    knot = np.zeros(shape, np.float32)
    for q, rot in ((18.2, 0), (18.2, 45), (9, 0)):
        pts = [(crx + q * math.cos(math.radians(rot + 45 + 90 * i)), cry + q * math.sin(math.radians(rot + 45 + 90 * i))) for i in range(4)]
        knot = np.maximum(knot, cv.line(pts, 3.4, closed=True))
    clasp_h += 5 * s * blur(knot, 0.7 * s)
    links = []
    n_links = 17
    for i in range(n_links):
        t = (i + 0.5) / n_links
        x = (clx + 29) + (crx - clx - 58) * t
        y = cly + 4 + 22 * (1 - (2 * t - 1) ** 2)
        links.append((x, y))
    chain = np.clip(cv.discs(links, 4.5) - cv.discs(links, 2.1), 0, 1)
    chain_solid = cv.discs(links, 4.5)

    # ---- the raised gauntlet
    G = hand_geometry(arm)
    forearm = cv.poly(G['forearm'])
    cuff = cv.poly(D([(p[0], p[1], 1) for p in G['cuff'][:2]] + G['cuff'][2:3] + [(p[0], p[1], 1) for p in G['cuff'][3:5]] + G['cuff'][5:]))
    wrist = cv.poly(G['wrist'])
    couter = cv.discs([G['couter'][0]], G['couter'][1])
    palm = cv.poly(D(G['palm']))
    fing = np.zeros(shape, np.float32)
    joints = []; pads = []
    for fg in G['fingers']:
        pts, wds = fg['pts'], fg['widths']
        for i in range(len(pts) - 1):
            (ax_, ay_), (bx_, by_) = pts[i], pts[i + 1]
            dx, dy = bx_ - ax_, by_ - ay_; l = math.hypot(dx, dy) or 1
            nx, ny = -dy / l, dx / l
            wa, wb = wds[i] / 2, wds[i + 1] / 2
            # a tapering segment with a slightly fuller joint at each end: a phalanx, not a tube
            fing = np.maximum(fing, cv.poly([(ax_ - nx * wa, ay_ - ny * wa), (bx_ - nx * wb, by_ - ny * wb),
                                              (bx_ + nx * wb, by_ + ny * wb), (ax_ + nx * wa, ay_ + ny * wa)]))
            fing = np.maximum(fing, cv.discs([(ax_, ay_)], wa * (1.09 if i > 0 else 1.02)))
            if i > 0:
                joints.append([(ax_ - nx * wa * 1.1, ay_ - ny * wa * 1.1), (ax_ + nx * wa * 1.1, ay_ + ny * wa * 1.1)])
            pads.append(((ax_ + bx_) / 2, (ay_ + by_) / 2, (wa + wb) / 2))
        fing = np.maximum(fing, cv.discs([pts[-1]], wds[-1] / 2))
    hand = np.clip(palm + fing, 0, 1)
    arm_m = np.clip(forearm + cuff + wrist + couter + hand, 0, 1)
    E_ = np.array(arm['elbow'], np.float32); W_ = np.array(arm['wrist'], np.float32)
    fu_ = (W_ - E_) / np.linalg.norm(W_ - E_); fv_ = np.array([-fu_[1], fu_[0]], np.float32)
    xf = (X - E_[0]) * fv_[0] + (Y - E_[1]) * fv_[1]                   # distance across the forearm
    def turned(half, lift):
        return lift * s * np.sqrt(np.clip(1 - (xf / half) ** 2, 0, 1))
    arm_h = turned(46, 46) * forearm
    arm_h = np.maximum(arm_h, (38 * s * pillow(couter, 31 * s) + 8 * s) * couter)
    arm_h = np.maximum(arm_h, (turned(45, 47) + 5 * s * bevel(cuff, 2.2 * s)) * cuff)
    arm_h = np.maximum(arm_h, turned(30, 32) * wrist)
    # palm: fuller at the base of the thumb and along the edge of the hand, hollow in the middle
    hand_h = 24 * s * pillow(palm, 30 * s) * palm
    hand_h = np.maximum(hand_h, (10 * s + 15 * s * pillow(fing, 10 * s)) * fing)
    hand_h -= 5.0 * s * blur(cv.discs([G['L'](0, -4)], 17), 9 * s) * palm
    hand_h -= 2.6 * s * blur(cv.lines(joints, 1.3), 0.7 * s)
    hand_h -= 2.2 * s * blur(cv.lines([D(c, False) for c in G['creases']], 1.2), 0.8 * s) * palm
    hand_h += 1.6 * s * blur(cv.discs([(p[0], p[1]) for p in pads], 4.2), 2.2 * s) * fing
    F = G['F']
    t_rim = G['t_rim']
    arm_h += 3.5 * s * blur(cv.lines([[F(-0.2, -21), F(t_rim, -18)], [F(-0.2, 21), F(t_rim, 18)]], 2.0), 0.9 * s) * forearm
    arm_h += 2.4 * s * blur(cv.discs([F(t, -31) for t in np.linspace(0.03, t_rim - 0.05, 8)], 1.7), 0.5 * s) * forearm
    arm_h += 3.4 * s * blur(cv.lines(G['bands'], 3.0), 0.9 * s) * np.clip(cuff + wrist, 0, 1)
    arm_h += 2.2 * s * blur(cv.discs([F(t_rim + 0.03, x) for x in (-32, -16, 0, 16, 32)], 1.9), 0.5 * s) * cuff
    # the suit rune, raised on its own small plate on the vambrace
    rc = F(max(0.16, t_rim * 0.5), 1); rr = 19.0
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
        gk = 0.2 if mid == 5 else (0.25 + 0.75 * side)
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
