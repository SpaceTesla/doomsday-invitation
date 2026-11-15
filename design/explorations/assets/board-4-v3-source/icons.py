# Vector levels of the canonical mask and of the suit rune, all cut from the same measured outlines.
import math
import maskgeo as M
import icongeo as I


def _c(x, y, r):
    return '<circle cx="%.2f" cy="%.2f" r="%.2f"/>' % (x, y, r)


def _poly(pts):
    return 'M' + ' '.join('%.2f,%.2f' % (p[0], p[1]) for p in pts) + 'Z'


# ------------------------------------------------------------------ mask, level 1
def mask_l1_d():
    """Silhouette with the eyes, the mouth and the two cheek creases cut out. One path, even-odd."""
    d = M.d(M.OUTLINE)
    d += M.dpair(M.EYE_FRAME)                       # the framed opening: holds at small sizes
    d += _poly([(-17.0, 114.6), (17.0, 114.6), (22.0, 122.6), (-22.0, 122.6)])
    for s in (1, -1):                               # creases as thin wedges
        d += _poly([(s * 9.0, 88.6), (s * 11.4, 86.6), (s * 28.4, 101.4), (s * 26.4, 103.6)])
    return d


def mask_l1(cls=''):
    return '<path class="%s" fill-rule="evenodd" d="%s"/>' % (cls, mask_l1_d())


# ------------------------------------------------------------------ mask, level 2
MOUTH_UPPER = [(-16.3, 115.6), (16.3, 115.6), (17.6, 117.6), (-17.6, 117.6)]
MOUTH_LOWER = [(-18.5, 119.0), (18.5, 119.0), (20.6, 122.2), (-20.6, 122.2)]


def mask_l2(sw=1.0, rivets=True, cls='mask-l2'):
    """Line insignia. Strokes take currentColor; the openings are filled with it."""
    o = ['<g class="%s" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-linecap="round">' % cls]
    A = o.append
    A('<path stroke-width="%.2f" d="%s"/>' % (sw * 1.7, M.d(M.OUTLINE)))
    A('<path stroke-width="%.2f" d="%s%s"/>' % (sw * 1.1, _poly(M.HASP), _poly(M.HASP_INNER)))
    # the linked rim becomes the dotted line the plate borders already use
    A('<path stroke-width="%.2f" stroke-dasharray="0 3.1" d="%s%s"/>' % (sw * 1.25, M.d(M.RIM_CENTRE_HALF, False), M.d(M.mx(M.RIM_CENTRE_HALF), False)))
    A('<path stroke-width="%.2f" d="%s"/>' % (sw * 1.25, M.dpair(M.BROW)))
    A('<path stroke-width="%.2f" d="%s%s"/>' % (sw * 0.8, M.d(M.LID_SEAM, False), M.d(M.mx(M.LID_SEAM), False)))
    A('<path stroke-width="%.2f" d="%s"/>' % (sw * 0.8, M.dpair(M.EYE_FRAME)))
    A('<path stroke-width="%.2f" d="%s"/>' % (sw * 1.25, M.d(M.NOSE)))
    A('<path stroke-width="%.2f" d="M-1.7,75.5L-2.3,101.2M1.7,75.5L2.3,101.2"/>' % (sw * 0.8))
    A('<path stroke-width="%.2f" d="%s%s"/>' % (sw * 1.25, M.d(M.CHEEK_CREASE, False), M.d(M.mx(M.CHEEK_CREASE), False)))
    # cheek foot and the sides of the muzzle
    foot = [(45.0, 95.9), (38, 96.2), (31, 98.6), (27.0, 102.4, 1), (28.2, 106), (27.8, 115), (27.3, 124), (26.9, 128.6)]
    A('<path stroke-width="%.2f" d="%s%s"/>' % (sw * 1.0, M.d(foot, False), M.d(M.mx(foot), False)))
    A('<path stroke-width="%.2f" d="%s"/>' % (sw * 0.8, M.d(M.sym(M.MOUTH_LEDGE_HALF), False)))
    A('<path stroke-width="%.2f" d="%s"/>' % (sw * 1.25, M.d(M.LIP)))
    A('<path stroke-width="%.2f" d="%s"/>' % (sw * 1.0, M.d(M.sym(M.CHIN_LINE_HALF), False)))
    A('<path stroke-width="%.2f" d="%s"/>' % (sw * 1.0, M.d(M.CHIN_BOSS)))
    A('<path stroke-width="%.2f" d="%s%s"/>' % (sw * 0.8, M.d(M.JAW_STRAP, False), M.d(M.mx(M.JAW_STRAP), False)))
    A('<g fill="currentColor" stroke="none">')
    A('<path d="%s"/>' % M.dpair(M.EYE))
    A('<path d="%s%s"/>' % (_poly(MOUTH_UPPER), _poly(MOUTH_LOWER)))
    if rivets:
        A(''.join(_c(x, y, 0.8 * sw ** 0.5) for x, y in M.rivets_all()))
    A('</g></g>')
    return ''.join(o)


def mask_master():
    """Construction sheet: every measured outline, the centre line and the landmark levels."""
    o = ['<g fill="none" stroke-linejoin="round">']
    A = o.append
    A('<g class="mm-guide" stroke-width=".35">')
    A('<path d="M0,-6L0,156"/>')
    for name, y in M.LANDMARKS_Y:
        A('<path d="M-58,%.1fL58,%.1f"/>' % (y, y))
    A('<path d="M-50,-6L-50,156M50,-6L50,156"/></g>')
    A('<g class="mm-line" stroke-width=".7">')
    A('<path d="%s"/>' % M.d(M.OUTLINE))
    A('<path d="%s%s"/>' % (_poly(M.HASP), _poly(M.HASP_INNER)))
    for shp in (M.BROW, M.EYE_FRAME, M.CHEEK, M.JAW):
        A('<path d="%s"/>' % M.dpair(shp))
    for shp in (M.NOSE, M.MUZZLE, M.LIP, M.CHIN_BOSS):
        A('<path d="%s"/>' % M.d(shp))
    for ln in (M.LID_SEAM, M.CHEEK_CREASE, M.JAW_STRAP, M.RIM_CENTRE_HALF):
        A('<path d="%s%s"/>' % (M.d(ln, False), M.d(M.mx(ln), False)))
    A('<path d="%s"/>' % M.d(M.sym(M.CHIN_LINE_HALF), False))
    A('<path d="%s"/>' % _poly(M.NOSE_RIDGE))
    A('</g><g class="mm-void"><path d="%s"/><path d="%s"/></g>' % (M.dpair(M.EYE), M.d(M.MOUTH)))
    A('<g class="mm-rivet">%s</g>' % ''.join(_c(x, y, 0.75) for x, y in M.rivets_all()))
    A('<g class="mm-label">')
    for name, y in M.LANDMARKS_Y:
        A('<text x="61" y="%.1f">%s  %d</text>' % (y + 1.4, name, round(y)))
    A('</g></g>')
    return ''.join(o)


# ------------------------------------------------------------------ suit rune
def rune_l2(sw=None, cls='rune-l2', top_hook=True):
    sw = I.BAR if sw is None else sw
    return ('<path class="%s" fill="none" stroke="currentColor" stroke-width="%.3f" stroke-linejoin="miter" stroke-linecap="square" d="%s"/>'
            % (cls, sw, I.rune_d(I.rune_parts(top_hook))))


def rune_l1(sw=0.11, cls='rune-l1'):
    """Hexagon, centre square and the four brackets, with the inner lattice left out."""
    p = I.rune_parts(True)
    d = I.rune_d(p, keys=('hexagon', 'diamond', 'hooks'))
    return ('<path class="%s" fill="none" stroke="currentColor" stroke-width="%.3f" stroke-linejoin="miter" stroke-linecap="square" d="%s"/>'
            % (cls, sw, d))


def rune_master():
    p = I.rune_parts(True)
    o = ['<g fill="none">']
    o.append('<g class="mm-guide" stroke-width=".008"><circle r="1"/><circle r="%.3f"/><path d="M-1.75,0L1.75,0M0,-1.75L0,1.75"/></g>' % (math.sqrt(3) / 2))
    o.append('<path class="mm-line" stroke-width=".02" d="%s"/>' % I.rune_d(p, keys=('hexagon', 'inner hexagon', 'diagonals', 'midline', 'diamond')))
    hooks = p['hooks']
    o.append('<path class="mm-line" stroke-width=".02" d="%s"/>' % I.rune_d({'hooks': hooks[:6]}))
    o.append('<path class="mm-unsure" stroke-width=".02" d="%s"/>' % I.rune_d({'hooks': hooks[6:]}))
    o.append('</g>')
    return ''.join(o)


def doom_mark(cls='doom-mark'):
    return '<path class="%s" d="%s"/>' % (cls, I.doom_mark_d())


# ------------------------------------------------------------------ standalone files
def write_files(outdir):
    import os
    def w(name, vb, body, title, size, style=''):
        s = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s" width="%d" height="%d"><title>%s</title>%s%s</svg>'
             % (vb, size[0], size[1], title, '<style>%s</style>' % style if style else '', body))
        open(os.path.join(outdir, name), 'w', encoding='utf-8', newline='\n').write(s)
    w('mask-level-1.svg', '-56 -6 112 162', '<g fill="#d9dedc">%s</g>' % mask_l1(), 'Doom mask, level 1: icon', (224, 324))
    w('mask-level-2.svg', '-56 -6 112 162', '<rect x="-56" y="-6" width="112" height="162" fill="#1a2020"/><g color="#c6a75e">%s</g>' % mask_l2(),
      'Doom mask, level 2: insignia', (448, 648))
    w('mask-master.svg', '-64 -10 150 170', '<rect x="-64" y="-10" width="150" height="170" fill="#0a0d0c"/>' + mask_master(),
      'Doom mask: measured master outlines', (900, 1020),
      '.mm-guide{stroke:#3d4a47}.mm-line{stroke:#d9dedc}.mm-void{fill:#4fc395;opacity:.55}.mm-rivet{fill:#c6a75e}.mm-label{fill:#96a19e;font:3.4px sans-serif}')
    w('suit-rune-level-1.svg', '-1.8 -1.8 3.6 3.6', '<g color="#d9dedc">%s</g>' % rune_l1(), 'Suit rune, level 1: icon', (240, 240))
    w('suit-rune-level-2.svg', '-1.8 -1.8 3.6 3.6', '<rect x="-1.8" y="-1.8" width="3.6" height="3.6" fill="#1a2020"/><g color="#4fc395">%s</g>' % rune_l2(),
      'Suit rune, level 2: insignia', (480, 480))
    w('suit-rune-master.svg', '-1.9 -1.9 3.8 3.8', '<rect x="-1.9" y="-1.9" width="3.8" height="3.8" fill="#0a0d0c"/>' + rune_master(),
      'Suit rune: master reading. The top bracket is seen in one view only.', (760, 760),
      '.mm-guide{stroke:#3d4a47}.mm-line{stroke:#d9dedc}.mm-unsure{stroke:#c6a75e;stroke-dasharray:.05 .04}')
    w('horned-mark.svg', '-52 -2 104 104', '<rect x="-52" y="-2" width="104" height="104" fill="#0a0d0c"/><g fill="#7f9166">%s</g>' % doom_mark(),
      'The horned mark, traced from the supplied reference', (416, 416))


if __name__ == '__main__':
    import os, sys
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'v2')
    write_files(out)
    print('icons written to', out)
