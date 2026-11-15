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

# The upper arm hangs from the shoulder; the forearm leaves the cloak and rises up and out to a hand held beside the shoulder.
# cloak_left is the left edge of the cloak from the shoulder down, which differs with the pose.
DESKTOP_ARM = dict(elbow=(-190, 409), wrist=(-272, 266), palm=(-285, 218),
                   cloak_left=[(-220, 258), (-242, 300), (-254, 340), (-264, 384), (-246, 438), (-214, 478), (-214, 548), (-224, 650),
                               (-236, 770), (-248, 1000, 1)])
PHONE_ARM = dict(elbow=(-185, 310), wrist=(-150, 149), palm=(-147, 99),
                 cloak_left=[(-220, 258), (-230, 330), (-240, 430), (-252, 570), (-264, 770), (-274, 1000, 1)])
VIEW = math.radians(42)        # how far the palm is turned away from the viewer, towards the body
COVER_T = 0.30                 # the cloak lies over the forearm up to this share of its length from the elbow

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
    o = {}
    # Fabric follows the references (mask width = 100): one layer of cloth that keeps close to the head,
    # about 0.3 widths of it showing beside the mask; it falls from the jaw to the shoulders;
    # under the chin the neck shows, and the cowl is a shallow swag hung between the clasps.
    o['hood'] = [(0, -38), (21, -35), (41, -26), (58, -10), (71, 14), (80, 46), (85, 82), (89, 116), (99, 142), (119, 164),
                 (150, 184), (122, 196), (64, 200), (0, 202), (-64, 200), (-122, 196), (-150, 184), (-119, 164), (-99, 142),
                 (-89, 116), (-85, 82), (-80, 46), (-71, 14), (-58, -10), (-41, -26), (-21, -35)]
    o['opening'] = [(0, 8, 1), (22, 13), (40, 27), (51, 48), (57, 74), (58.5, 100), (56, 124), (50, 146), (44, 162), (39, 176),
                    (30, 188), (0, 192), (-30, 188), (-39, 176), (-44, 162), (-50, 146), (-56, 124), (-58.5, 100), (-57, 74),
                    (-51, 48), (-40, 27), (-22, 13)]
    o['neck'] = [(-42, 136, 1), (42, 136, 1), (46, 196, 1), (-46, 196, 1)]
    right = [(0, 150), (70, 158), (112, 168), (150, 180), (186, 198), (208, 222), (218, 256), (229, 300), (233, 350),
             (241, 410), (244, 480), (254, 570), (258, 660), (268, 770), (276, 1000, 1)]
    left = list(reversed(arm['cloak_left'])) + [(-208, 222), (-186, 198), (-150, 180), (-112, 168), (-70, 158)]
    o['cloak'] = right + left
    o['cowl'] = [(-116, 196), (-70, 190), (-30, 188), (0, 189), (30, 188), (70, 190), (116, 196), (110, 214), (70, 217),
                 (30, 221), (0, 223), (-30, 221), (-70, 217), (-110, 214)]
    o['chest'] = [(-112, 214, 1), (112, 214, 1), (126, 1000, 1), (-126, 1000, 1)]
    o['clasps'] = [(-100, 228), (100, 228)]
    return o


def hand_geometry(arm):
    """The raised gauntlet in three-quarter view: vambrace, flared cuff, wrist, palm and five flexed fingers.

    Anatomy used. Phalanges run 46 / 30 / 24 percent of a finger from the knuckle. At rest the fingers are
    never straight: each joint is a little bent, and the bend grows from the index to the little finger.
    The thumb sits forward of the palm and turns in towards the fingers. The wrist is slightly extended.
    The palm is turned VIEW away from the viewer, so its width is foreshortened and the fingers, which bend
    towards the palm, are seen to curl towards the body."""
    E, Wr, Pm = (np.array(arm[k], np.float32) for k in ('elbow', 'wrist', 'palm'))
    u = (Pm - Wr); u = u / np.linalg.norm(u)          # along the hand, towards the fingers
    v = np.array([-u[1], u[0]], np.float32)            # across the hand
    if v[0] < 0:
        v = -v                                         # v points to screen right, towards the body
    cv_, sv_ = math.cos(VIEW), math.sin(VIEW)
    def L(x, y):
        p = Pm + x * v + y * u
        return (float(p[0]), float(p[1]))

    def finger(base, length, lean, width, flex, z):
        """flex = bend at knuckle, middle joint and end joint, in degrees. Returns projected joints."""
        pts = [(base[0] * cv_, base[1])]
        a = math.radians(lean * cv_)
        cum = 0.0
        for frac, f in zip((.46, .30, .24), flex):
            cum += f
            fr = math.radians(cum)
            along, side = math.cos(fr), math.sin(fr) * sv_         # a bent phalanx shortens and swings towards the palm
            dx = side * math.cos(a) + along * math.sin(a)
            dy = -side * math.sin(a) + along * math.cos(a)
            pts.append((pts[-1][0] + dx * length * frac, pts[-1][1] + dy * length * frac))
        return dict(pts=[L(*p) for p in pts], widths=[width, width * .95, width * .89, width * .80], z=z)

    fingers = [   # furthest from the viewer first
        finger((31, 28), 48, 13, 17, (24, 32, 16), 0),          # little: the most bent
        finger((13, 38), 62, 5, 19.5, (19, 27, 14), 1),         # ring
        finger((-7, 41), 67, -1, 20.5, (14, 22, 12), 2),        # middle
        finger((-27, 37), 60, -6, 19.5, (9, 16, 10), 3),        # index: the least bent
    ]
    # thumb: nearest the viewer, set forward of the palm, its tip turning in towards the index finger
    tb = (-34 * cv_ - 6, -22)
    t1 = (tb[0] + 31 * math.sin(math.radians(-27)), tb[1] + 31 * math.cos(math.radians(-27)))
    t2 = (t1[0] + 25 * math.sin(math.radians(-5)), t1[1] + 25 * math.cos(math.radians(-5)))
    fingers.append(dict(pts=[L(*tb), L(*t1), L(*t2)], widths=[24, 21.5, 18], z=5))
    palm = [L(p[0] * cv_ - (5 if p[0] < -30 else 0), p[1]) for p in ((-27, -52), (-36, -40), (-45, -18), (-46, 6), (-41, 28), (-37, 40),
                                                                     (-18, 46), (0, 48), (20, 46), (37, 38), (42, 22), (42, -2),
                                                                     (37, -30), (28, -52))]
    creases = [[L(-30 * cv_, 30), L(-8 * cv_, 24), L(18 * cv_, 26), L(38 * cv_, 20)], [L(-36 * cv_, 8), L(-20 * cv_, -6), L(-12 * cv_, -30), L(-10 * cv_, -48)]]
    fa = (Wr - E); fl = np.linalg.norm(fa); fu = fa / fl
    fv = np.array([-fu[1], fu[0]], np.float32)
    def F(t, x):
        p = E + fu * (t * fl) + fv * x
        return (float(p[0]), float(p[1]))
    k = 100.0 / fl                                     # so lengths along the forearm can be given in units
    wrist = [F(1 + 2 * k / 100, -27), F(1 + 9 * k / 100, -26), F(1 + 9 * k / 100, 26), F(1 + 2 * k / 100, 27),
             F(1 - 12 * k / 100, 29), F(1 - 12 * k / 100, -29)]
    t_rim = 1 - 62 * k / 100                           # the cuff is a bell: narrow at the wrist, widest 62 units down
    cuff = [F(1 - 2 * k / 100, -31), F(1 - 2 * k / 100, 31), F(1 - 30 * k / 100, 37), F(t_rim, 44), F(t_rim, -44),
            F(1 - 30 * k / 100, -37)]
    forearm = [F(t_rim + 6 * k / 100, -39), F(t_rim + 6 * k / 100, 39), F(0.2, 44), F(-0.25, 47), F(-0.25, -47), F(0.2, -44)]
    bands = [[F(1 - 8 * k / 100, -33), F(1 - 8 * k / 100, 33)], [F(1 - 17 * k / 100, -35), F(1 - 17 * k / 100, 35)],
             [F(t_rim + 5 * k / 100, -44), F(t_rim + 5 * k / 100, 44)]]
    return dict(fingers=fingers, palm=palm, creases=creases, wrist=wrist, forearm=forearm, cuff=cuff, bands=bands,
                couter=(F(0, 0), 31.0), joint=((float(Wr[0]), float(Wr[1])), 26.0), t_rim=t_rim, F=F, L=L, fl=float(fl),
                E=E, fu=fu, fv=fv)


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
    cloth = 48 * s * pillow(body, 130 * s)
    cloth += 30 * s * (aniso(shape, 90 * s, 520 * s, seed) - 0.5)
    cloth += 7 * s * (aniso(shape, 34 * s, 300 * s, seed + 3) - 0.5)
    cl = arm['cloak_left']
    ax_, ay_ = cl[2][0], cl[2][1]
    folds = [  # (polyline, width, lift). Ridges are positive, the hollows between them negative.
        # gathered at each clasp and fanning down from it
        ([(108, 246), (126, 330), (138, 480), (148, 900)], 15, 9), ([(-108, 246), (-126, 330), (-138, 480), (-148, 900)], 15, 9),
        ([(122, 240), (166, 336), (192, 520), (206, 900)], 21, 11), ([(-122, 240), (-166, 336), (-190, 520), (-204, 900)], 21, 11),
        ([(142, 252), (160, 380), (170, 560), (178, 900)], 13, -6), ([(-142, 252), (-160, 380), (-170, 560), (-178, 900)], 13, -6),
        # falling from the point of each shoulder
        ([(150, 198), (196, 290), (216, 430), (232, 900)], 25, 12), ([(-150, 198), (-196, 290), (-218, 430), (-232, 900)], 23, 11),
        ([(176, 204), (213, 300), (226, 420), (238, 640)], 13, -7), ([(-176, 204), (-208, 290), (-224, 420)], 13, -6),
        # drawn tight between shoulder and clasp
        ([(198, 214), (160, 224), (122, 236)], 11, 6), ([(-198, 214), (-160, 224), (-122, 236)], 11, 6),
        ([(204, 232), (168, 246), (136, 262)], 9, 4), ([(-204, 232), (-168, 246), (-136, 262)], 9, 4),
        # hanging from the raised forearm
        ([(ax_ + 4, ay_ + 6), (ax_ + 8, ay_ + 130), (ax_ + 2, ay_ + 300), (ax_ - 4, 900)], 20, 12),
        ([(ax_ + 30, ay_ - 2), (ax_ + 34, ay_ + 150), (ax_ + 28, 900)], 15, -6),
        ([(ax_ + 54, ay_ + 20), (ax_ + 60, ay_ + 170), (ax_ + 56, 900)], 17, 8),
    ]
    for pts, wd, lift in folds:
        cloth += 1.5 * lift * s * blur(cv.line(D(pts, False), wd * 0.5), wd * 0.42 * s)
    # the hood: a rolled edge round the opening, a seam over the crown, and gathers at the neck
    hoodring = hood * (1 - opening)
    # one layer of cloth over a head: a low dome for the skull, a narrow turned hem at the opening, a few long folds
    cloth += 14 * s * pillow(hoodring, 26 * s) * hood
    cloth += 20 * s * np.exp(-((X / 74.0) ** 2 + ((Y - 26) / 86.0) ** 2)) * hood
    rim = np.clip(blur(opening, 3.5 * s) - opening, 0, 1) * hood
    cloth += 9 * s * rim
    for pts, wd, lift in (([(-50, -12), (-72, 40), (-80, 104), (-96, 150), (-132, 184)], 12, 7), ([(50, -12), (72, 40), (80, 104), (96, 150), (132, 184)], 12, 7),
                          ([(-22, -30), (-52, 6), (-66, 66), (-68, 120)], 9, 4), ([(22, -30), (52, 6), (66, 66), (68, 120)], 9, 4),
                          ([(-84, 122), (-104, 156), (-140, 188)], 10, -5), ([(84, 122), (104, 156), (140, 188)], 10, -5),
                          ):
        cloth += lift * s * blur(cv.line(D(pts, False), wd * 0.5), wd * 0.42 * s) * hood
    cloth = blur(cloth, 3.0 * s)
    # the cowl: thick turns of cloth lying across the collar bones
    cw = 8 * s * pillow(cowl, 14 * s)
    for pts, wd, lift in (([(-108, 199), (-56, 196), (0, 197), (56, 196), (108, 199)], 8, 5),
                          ([(-104, 209), (-56, 210), (0, 214), (56, 210), (104, 209)], 7, 4)):
        cw += lift * s * blur(cv.line(D(pts, False), wd * 0.5), wd * 0.4 * s)
    neck = cv.poly(O['neck']) * opening

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
    finger_h = np.zeros(shape, np.float32)
    for fg in sorted(G['fingers'], key=lambda f: f['z']):
        pts, wds = fg['pts'], fg['widths']
        one = np.zeros(shape, np.float32)
        for i in range(len(pts) - 1):
            (ax0, ay0), (bx0, by0) = pts[i], pts[i + 1]
            dx, dy = bx0 - ax0, by0 - ay0; l = math.hypot(dx, dy) or 1
            nx, ny = -dy / l, dx / l
            wa, wb = wds[i] / 2, wds[i + 1] / 2
            one = np.maximum(one, cv.poly([(ax0 - nx * wa, ay0 - ny * wa), (bx0 - nx * wb, by0 - ny * wb),
                                           (bx0 + nx * wb, by0 + ny * wb), (ax0 + nx * wa, ay0 + ny * wa)]))
            one = np.maximum(one, cv.discs([(ax0, ay0)], wa * (1.09 if i > 0 else 1.02)))
            if i > 0:
                joints.append([(ax0 - nx * wa * 1.1, ay0 - ny * wa * 1.1), (ax0 + nx * wa * 1.1, ay0 + ny * wa * 1.1)])
            pads.append(((ax0 + bx0) / 2, (ay0 + by0) / 2, (wa + wb) / 2))
        one = np.maximum(one, cv.discs([pts[-1]], wds[-1] / 2))
        # each finger is its own round form and stands a little in front of the one behind it
        fh = (10 * s + 15 * s * pillow(one, 10 * s) + 3.2 * s * fg['z']) * one
        finger_h = np.where(one > 0.5, fh, finger_h)
        fing = np.maximum(fing, one)
    hand = np.clip(palm + fing, 0, 1)
    wjoint = cv.discs([G['joint'][0]], G['joint'][1])
    # the cloak lies over the elbow and the lower forearm; the arm shows from there to the fingertips
    tt = ((X - float(G['E'][0])) * float(G['fu'][0]) + (Y - float(G['E'][1])) * float(G['fu'][1])) / G['fl']
    xf_ = (X - float(G['E'][0])) * float(G['fv'][0]) + (Y - float(G['E'][1])) * float(G['fv'][1])
    hem = COVER_T - 0.03 + 0.07 * np.sqrt(np.clip(1 - (xf_ / 50.0) ** 2, 0, 1))        # an arc, as a sleeve end is
    cover = cloak * (tt < hem)
    under = np.clip(forearm + couter, 0, 1) * cover
    cloth += (46 * s + 46 * s * np.sqrt(np.clip(1 - (xf_ / 52.0) ** 2, 0, 1))) * blur(under, 7 * s)      # the arm under the cloth
    cloth += 5 * s * blur(cover * (np.abs(tt - hem + 0.02) < 0.022) * (np.abs(xf_) < 54), 1.6 * s)         # the turned hem
    show = 1 - cover
    forearm = forearm * show; couter = couter * show
    arm_m = np.clip(forearm + cuff + wrist + wjoint + couter + hand, 0, 1)
    E_ = np.array(arm['elbow'], np.float32); W_ = np.array(arm['wrist'], np.float32)
    fu_ = (W_ - E_) / np.linalg.norm(W_ - E_); fv_ = np.array([-fu_[1], fu_[0]], np.float32)
    xf = (X - E_[0]) * fv_[0] + (Y - E_[1]) * fv_[1]                   # distance across the forearm
    def turned(half, lift):
        return lift * s * np.sqrt(np.clip(1 - (xf / half) ** 2, 0, 1))
    arm_h = turned(46, 46) * forearm
    arm_h = np.maximum(arm_h, (38 * s * pillow(couter, 31 * s) + 8 * s) * couter)
    arm_h = np.maximum(arm_h, (turned(45, 47) + 5 * s * bevel(cuff, 2.2 * s)) * cuff)
    arm_h = np.maximum(arm_h, turned(30, 32) * wrist)
    arm_h = np.maximum(arm_h, 30 * s * pillow(wjoint, 26 * s) * wjoint)
    # palm: fuller at the base of the thumb and along the edge of the hand, hollow in the middle
    hand_h = 24 * s * pillow(palm, 26 * s) * palm
    hand_h = np.where(fing > 0.5, np.maximum(finger_h, hand_h * 0.55), hand_h)
    hand_h -= 5.0 * s * blur(cv.discs([G['L'](2, -4)], 13), 8 * s) * palm * (1 - fing)
    hand_h -= 2.6 * s * blur(cv.lines(joints, 1.3), 0.7 * s)
    hand_h -= 2.2 * s * blur(cv.lines([D(c, False) for c in G['creases']], 1.2), 0.8 * s) * palm * (1 - fing)
    hand_h += 1.6 * s * blur(cv.discs([(p[0], p[1]) for p in pads], 4.2), 2.2 * s) * fing
    F = G['F']
    t_rim = G['t_rim']
    arm_h += 3.5 * s * blur(cv.lines([[F(-0.2, -21), F(t_rim, -18)], [F(-0.2, 21), F(t_rim, 18)]], 2.0), 0.9 * s) * forearm
    arm_h += 2.4 * s * blur(cv.discs([F(t, -31) for t in np.linspace(COVER_T + 0.04, t_rim - 0.05, 5)], 1.7), 0.5 * s) * forearm
    arm_h += 3.4 * s * blur(cv.lines(G['bands'], 3.0), 0.9 * s) * np.clip(cuff + wrist, 0, 1)
    arm_h += 2.2 * s * blur(cv.discs([F(t_rim + 0.03, x) for x in (-32, -16, 0, 16, 32)], 1.9), 0.5 * s) * cuff
    # the suit rune, raised on its own small plate on the vambrace
    rc = F((COVER_T + t_rim) / 2 + 0.015, 1); rr = 16.5
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
    Hh = np.where(cowl > 0.5, cw + cloth * 0.5 + 22 * s, Hh)
    Hh = np.where(disc > 0.5, clasp_h + 86 * s, Hh)
    Hh = np.where(chain_solid > 0.5, 78 * s + 6 * s * chain, Hh)
    hood_h = cloth + 40 * s
    Hh = np.where(hood > 0.5, hood_h, Hh)
    cavity = opening
    Hh = np.where(cavity > 0.5, hood_h.min() * 0 - 30 * s + 40 * s * pillow(opening, 60 * s) * 0, Hh)
    Hh = np.where(neck > 0.5, -14 * s + 22 * s * np.sqrt(np.clip(1 - (X / 54.0) ** 2, 0, 1)), Hh)
    Hh = np.where(arm_m > 0.5, np.maximum(arm_h, hand_h * hand) + 62 * s, Hh)
    alpha = np.clip(body + arm_m, 0, 1)

    mat = np.zeros(shape, np.uint8)        # 0 none, 1 wool, 2 cuirass, 3 bright steel, 4 cavity, 5 gauntlet
    mat[body > 0.5] = 1
    mat[chest_vis > 0.5] = 2
    mat[cowl > 0.5] = 1
    mat[(disc > 0.5) | (chain > 0.5)] = 3
    mat[hood > 0.5] = 1
    mat[cavity > 0.5] = 4
    mat[neck > 0.5] = 6            # mail at the neck
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
    # mail: small dark rings under the chin, deepest in shadow right under the mask
    ml = (mat == 6)
    rings = 0.5 + 0.5 * np.sin(B['X'] * 2.05 + np.floor(B['Y'] / 1.55) * 3.14159) * np.sin(B['Y'] * 2.02)
    under_chin = 0.10 + 0.90 * smooth((B['Y'] - 150) / 40.0)
    mc = np.array([0.026, 0.030, 0.030], np.float32) * ((0.2 + 0.8 * rings) * under_chin * (0.10 + dif_f * 0.9 * lit + dif_g * 0.5 * (0.05 + 0.95 * lit)))[..., None]
    col = np.where(ml[..., None], mc * (0.6 * fill + 0.4 * back), col)

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
