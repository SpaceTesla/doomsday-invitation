# Geometry for the two supplied marks other than the mask: the horned mark and the suit rune.
import math

# ---- the horned mark -----------------------------------------------------------------------
# Source: references/inspiration/doom-logo.png (554 px square), corners found by thresholding.
# Units: a 100-unit box, x centred on 0, y 0..100. Two mirrored wings and a centre triangle.
_C = 277.0; _S = 5.2; _Y0 = 282.0
_WING_PX = [(159, 23), (124.5, 188), (259, 305), (185, 541), (139, 352), (29, 224)]
_TRI_PX = [(276.5, 312), (308, 409), (245, 409)]


def _n(p):
    return ((p[0] - _C) / _S, (p[1] - _Y0) / _S + 50)


def doom_mark_polys():
    wing = [_n(p) for p in _WING_PX]
    return [wing, [(-x, y) for x, y in reversed(wing)], [_n(p) for p in _TRI_PX]]


def doom_mark_d():
    return ''.join('M' + ' '.join('%.2f,%.2f' % p for p in poly) + 'Z' for poly in doom_mark_polys())


# ---- the suit rune -------------------------------------------------------------------------
# Sources: references/inspiration/rune-view-1.png and rune-view-2.png. Both show the mark raised on an
# armour plate, at an angle and partly in shadow, so this is a reading and the notes say where it is unsure.
# Units: hexagon circumradius = 1, centre at 0,0, a vertex at the top.
HEX_INNER = 0.86          # the outline is doubled; the inner line sits about this far in
DIAMOND = 0.50            # half-diagonal of the centre square, which stands on its corner
HOOK_A = 0.55             # first leg of each bracket, leaving the hexagon at 45 degrees
HOOK_B = 0.33             # second leg, turning back towards the axis and stopping short of it
BAR = 0.05                # width of the raised bars, as a share of the radius


def hexagon(r=1.0):
    return [(r * math.cos(math.radians(90 + 60 * k)), -r * math.sin(math.radians(90 + 60 * k))) for k in range(6)]


def rune_parts(top_hook=True):
    """Named groups of polylines. Each polyline is a list of points; 'closed' ones repeat their first point."""
    hx = hexagon(1.0); hi = hexagon(HEX_INNER)
    ap = math.sqrt(3) / 2
    parts = {
        'hexagon': [hx + [hx[0]]],
        'inner hexagon': [hi + [hi[0]]],
        'diagonals': [[hx[0], hx[3]], [hx[1], hx[4]], [hx[2], hx[5]]],
        'midline': [[(-ap, 0), (ap, 0)]],
        'diamond': [[(0, -DIAMOND), (DIAMOND, 0), (0, DIAMOND), (-DIAMOND, 0), (0, -DIAMOND)]],
    }
    hooks = []
    dirs = [((-ap, 0), (-1, 0)), ((ap, 0), (1, 0)), ((0, 1.0), (0, 1))]
    if top_hook:
        dirs.append(((0, -1.0), (0, -1)))
    c = math.sqrt(0.5)
    for (ax, ay), (ox, oy) in dirs:
        px, py = -oy, ox                               # perpendicular to the outward axis
        for sgn in (1, -1):
            e1 = (ax + HOOK_A * c * (ox + sgn * px), ay + HOOK_A * c * (oy + sgn * py))
            e2 = (e1[0] + HOOK_B * c * (ox - sgn * px), e1[1] + HOOK_B * c * (oy - sgn * py))
            hooks.append([(ax, ay), e1, e2])
    parts['hooks'] = hooks
    return parts


def rune_d(parts=None, scale=1.0, keys=None):
    parts = parts or rune_parts()
    out = []
    for k, lines in parts.items():
        if keys and k not in keys:
            continue
        for ln in lines:
            closed = len(ln) > 2 and ln[0] == ln[-1]
            pts = ln[:-1] if closed else ln
            out.append('M' + ' '.join('%.3f,%.3f' % (x * scale, y * scale) for x, y in pts) + ('Z' if closed else ''))
    return ''.join(out)
