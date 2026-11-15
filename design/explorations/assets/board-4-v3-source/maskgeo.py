# The canonical mask: one set of measured outlines that every mask on the board is derived from.
#
# Source: references/inspiration/doom-mask.png, measured on a grid of tenths of the mask width.
# Units: the mask is 100 wide and 150 tall. x runs -50..50 with 0 on the centre line; y runs 0 (crown) to 150 (chin).
# Only the right half (x >= 0) is written down; the left is its mirror, as on the reference.
# A point written (x, y, 1) is a hard corner; the others are passed through smoothly.
from rl import catmull, bezier_path

W, H = 100.0, 150.0


def mx(pts):
    """Mirror a point list across the centre line, reversing order so outlines stay continuous."""
    return [((-p[0],) + tuple(p[1:])) for p in reversed(pts)]


def sym(half):
    """Close a right-half outline (running from the centre line round to the centre line) with its mirror."""
    m = mx(half)
    if abs(half[-1][0]) < 1e-6:
        m = m[1:]
    if abs(half[0][0]) < 1e-6:
        m = m[:-1]
    return list(half) + m


def both(shape):
    return [list(shape), mx(shape)]


# ---- outline -------------------------------------------------------------------------------
# Measured half-widths: 23 at y 7.5, 34 at 15, 44 at 30, 47.5 at 45, 49 at 60, 49.6 at 75 (widest),
# 48 at 90, then the step in to the jaw at y 95, 42.5 at 120, 37 at 135, 27.5 at 142.5.
OUTLINE_HALF = [(0, 2.5), (8, 3.0), (16, 5.0), (23, 8.0), (30, 12.5), (36, 17.5), (41, 24), (44.5, 31), (47, 40),
                (48.3, 50), (48.8, 60), (49.3, 67), (49.7, 73), (49.6, 80), (48.8, 87), (47.2, 92.5), (45.0, 96.0, 1),
                (44.3, 103), (43.6, 112), (42.6, 120), (40.5, 128), (37, 135), (31, 141), (23, 145.6), (12, 148.8), (0, 150)]
OUTLINE = sym(OUTLINE_HALF)

# ---- crown ---------------------------------------------------------------------------------
HASP = [(-4.9, 0.4, 1), (4.9, 0.4, 1), (4.9, 11.0, 1), (-4.9, 11.0, 1)]
HASP_INNER = [(-3.4, 2.0, 1), (3.4, 2.0, 1), (3.4, 9.4, 1), (-3.4, 9.4, 1)]
# the edging that follows the dome from temple to temple, cut into short links
RIM_CENTRE_HALF = [(5.5, 4.4), (16, 6.4), (23, 9.5), (29.5, 13.8), (35.2, 18.8), (40, 25), (43.4, 31.8), (45.8, 40.5),
                   (47.1, 50), (47.6, 58), (47.9, 64)]
RIM_WIDTH = 2.3
TEMPLE_TAB = [(47.2, 61.5, 1), (50.6, 61.5, 1), (50.6, 67.5, 1), (47.2, 67.5, 1)]

# ---- brow ----------------------------------------------------------------------------------
# One assembly each side: a broad upper plate, and a lid plate riveted over its lower edge. The two
# assemblies almost touch on the centre line and leave a V of forehead between them.
BROW = [(38.6, 37.0), (30, 35.3), (23.1, 34.9), (16, 38.5), (12.1, 43.9), (8.8, 49.5), (7.1, 53.9), (4.6, 58.5),
        (2.1, 61.4, 1), (1.6, 66), (2.4, 71), (3.3, 74.2, 1), (6.5, 74.0), (10.1, 72.9), (15, 70.8), (20.1, 68.9),
        (25, 67.4), (30.1, 66.6), (35, 66.6), (40.3, 67.0, 1), (40.4, 58), (40.0, 45)]
LID_SEAM = [(40.2, 56.0), (34, 55.3), (26, 54.8), (19.1, 55.4), (12, 57.2), (6.1, 59.9), (2.4, 61.6)]
LID_RIVETS = [(34.6, 59.4), (31.9, 59.7), (29.2, 60.2), (26.5, 60.9), (23.8, 61.8), (21.1, 62.9), (18.4, 64.1),
              (15.8, 65.5), (13.2, 67.0), (10.6, 68.5)]
FOREHEAD_RIVETS = [(5.1, 39.4), (8.4, 38.6), (11.7, 37.0), (15.0, 34.8), (18.1, 32.4)]

# ---- eyes ----------------------------------------------------------------------------------
# Wide and low. The top edge is the brow's lower edge and falls towards the nose; the bottom edge is level.
EYE = [(34.8, 67.6, 1), (30, 66.9), (25, 67.6), (20.1, 69.1), (15, 71.0), (10.1, 73.1), (7.4, 74.4, 1), (8.6, 79.0),
       (10.1, 82.9, 1), (20, 83.0), (31.5, 82.6), (34.2, 81.0), (34.8, 77.0)]
EYE_FRAME = [(36.6, 66.2, 1), (30, 65.2), (25, 65.9), (20.1, 67.4), (15, 69.3), (10.1, 71.4), (5.6, 73.6, 1),
             (7.0, 79.5), (9.0, 84.8, 1), (20, 84.9), (32.4, 84.5), (35.9, 82.3), (36.6, 77.0)]

# ---- cheeks --------------------------------------------------------------------------------
CHEEK = [(36.6, 66.0, 1), (49.3, 66.5), (49.7, 73), (49.6, 80), (48.8, 87), (47.2, 92.5), (45.0, 95.8, 1),
         (38, 96.2), (31, 98.6), (27, 102.3, 1), (18.6, 95.2), (10.3, 88.2, 1), (9.3, 84.9, 1), (20, 84.9),
         (32.4, 84.5), (35.9, 82.3), (36.6, 77.0)]
CHEEK_CREASE = [(9.6, 87.4), (18.6, 95.0), (27.2, 102.4)]
CHEEK_RIVETS = [(45.4, 73.4), (44.5, 76.9), (42.8, 80.2), (40.3, 83.1), (37.3, 85.3), (34.0, 86.6), (30.6, 87.3),
                (27.2, 87.7), (23.8, 87.9), (20.4, 88.0), (17.0, 88.0), (13.8, 87.8)]

# ---- nose ----------------------------------------------------------------------------------
# A wedge: narrow at the bridge, flaring to a broad base, with a flat ridge down the middle.
NOSE_HALF = [(0, 73.6), (2.8, 74.0, 1), (4.2, 80), (6.3, 87), (8.6, 92.5), (10.6, 96.5), (10.2, 99.0), (8.6, 100.6),
             (5, 102.0), (0, 103.0)]
NOSE = sym(NOSE_HALF)
NOSE_RIDGE = [(-1.7, 75.5, 1), (1.7, 75.5, 1), (2.3, 101.4, 1), (-2.3, 101.4, 1)]

# ---- mouth ---------------------------------------------------------------------------------
MUZZLE_HALF = [(0, 103.6), (10.6, 99.5), (10.3, 88.4, 1), (27.0, 102.5, 1), (28.2, 106), (27.8, 115), (27.3, 124),
               (26.9, 128.4, 1), (0, 128.4)]
MUZZLE = sym(MUZZLE_HALF)
MOUTH_HALF = [(0, 115.6), (16.3, 115.6, 1), (20.6, 122.2, 1), (0, 122.2)]
MOUTH = sym(MOUTH_HALF)
MOUTH_LEDGE_HALF = [(0, 113.3), (17.4, 113.3, 1), (23.6, 122.2, 1)]            # the bevel above the opening
GRILLE_BAR = [(-13.6, 117.6, 1), (13.6, 117.6, 1), (13.6, 119.0, 1), (-13.6, 119.0, 1)]
GRILLE_BLOCK = [(-2.6, 116.9, 1), (2.6, 116.9, 1), (2.6, 119.7, 1), (-2.6, 119.7, 1)]
GRILLE_POST = [(12.6, 115.6, 1), (13.9, 115.6, 1), (13.9, 122.2, 1), (12.6, 122.2, 1)]
# the lower lip: a flat bar whose ends turn down. With the chin line under it, this is the frown.
LIP_HALF = [(0, 122.0), (19.0, 122.0, 1), (26.8, 129.2, 1), (25.2, 133.2, 1), (16.5, 128.2, 1), (0, 128.2)]
LIP = sym(LIP_HALF)
CHIN_LINE_HALF = [(0, 129.6), (13.0, 129.6, 1), (23.6, 136.2)]
CHIN_PLATE_HALF = [(0, 129.6), (13.0, 129.6, 1), (23.6, 136.2, 1), (31, 141), (23, 145.6), (12, 148.8), (0, 150)]
CHIN_PLATE = sym(CHIN_PLATE_HALF)
CHIN_BOSS_HALF = [(0, 137.0), (10, 137.2), (14.5, 139.0), (15.5, 142.5), (13, 146.3), (7, 147.9), (0, 148.3)]
CHIN_BOSS = sym(CHIN_BOSS_HALF)

# ---- jaw -----------------------------------------------------------------------------------
JAW = [(45.0, 96.0, 1), (44.3, 103), (43.6, 112), (42.6, 120), (40.5, 128), (37, 135), (31, 141, 1), (23.6, 136.2, 1),
       (26.8, 129.2, 1), (27.3, 124), (27.8, 115), (28.2, 106), (27.0, 102.5, 1), (31, 98.6), (38, 96.2)]
JAW_STRAP = [(43.5, 97.6), (40, 99.5), (37, 103), (35.8, 110), (35.5, 120), (35.0, 128), (33.0, 134.3), (29.4, 138.6)]
JAW_STRAP_WIDTH = 2.6
JAW_RIVETS = [(31.4, 104.5), (31.4, 108.3), (31.3, 112.1), (31.2, 115.9), (31.1, 119.7), (31.0, 123.5), (30.9, 127.3)]
EDGE_RIVETS = [(42.0, 112.5), (41.5, 116.5), (40.8, 120.5), (39.8, 124.4), (38.4, 128.2), (36.6, 131.8), (34.4, 135.1),
               (31.6, 138.2), (28.2, 140.9), (24.4, 143.1), (20.4, 144.9)]

RIVET_R = 0.95
ALL_RIVETS_HALF = LID_RIVETS + FOREHEAD_RIVETS + CHEEK_RIVETS + JAW_RIVETS + EDGE_RIVETS

# The measured landmarks, for the analysis sheet. (label, y) pairs and (label, half-width, y).
LANDMARKS_Y = [('crown', 2.5), ('brow top', 35), ('eye line', 75), ('nose base', 103), ('mouth', 119.5), ('chin', 150)]


def rivets_all():
    return ALL_RIVETS_HALF + [(-x, y) for x, y in ALL_RIVETS_HALF]


def rim_links(n=13):
    """Short links along the rim, each a (start, end) pair of points on the rim centre line."""
    pts = catmull(RIM_CENTRE_HALF, False, 12)
    # arc-length parameterise
    import math
    L = [0.0]
    for a, b in zip(pts, pts[1:]):
        L.append(L[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    tot = L[-1]
    def at(s):
        for i in range(len(L) - 1):
            if L[i + 1] >= s:
                t = (s - L[i]) / max(1e-6, L[i + 1] - L[i])
                return (pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t)
        return pts[-1]
    out = []
    step = tot / n
    for i in range(n):
        out.append((at(i * step + step * 0.22), at(i * step + step * 0.78)))
    return out


# ---------------------------------------------------------------- paths
def d(pts, closed=True, prec=2):
    return bezier_path(pts, closed, prec)


def dpair(shape, closed=True, prec=2):
    return d(shape, closed, prec) + d(mx(shape), closed, prec)


def dense(pts, closed=True, n=10):
    return catmull(pts, closed, n)
