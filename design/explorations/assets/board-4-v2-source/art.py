# Original vector drawing for board IV. Everything here is generated geometry:
# no reference image or studio asset is embedded.
import json, math, os
G = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'glyphs.json')))


def P(pts, close=True):
    return 'M' + ' '.join('%g,%g' % (round(x, 1), round(y, 1)) for x, y in pts) + ('Z' if close else '')


def mir(pts, cx=100):
    return [(2 * cx - x, y) for x, y in pts]


# ---------------------------------------------------------------- runes
LETTERS = {c: c for c in 'acdefghijlmnoprstuv'}
LETTERS.update({'k': 'k', 'q': 'k'})          # decoder: hard C, K and Q share one rune
MISSING = set('bwxyz')


def rune_defs():
    return ''.join('<path id="ds-%s" fill-rule="evenodd" d="%s"/>' % (k, v['d']) for k, v in G.items())


def _seq(text):
    """text uses 'c' for soft C and 'k' for hard C. Raises on letters the decoder lacks."""
    out = []
    for ch in text.lower():
        if ch == ' ':
            out.append(('sp', 46)); continue
        if ch == '.':
            out.append(('dot', 46)); continue
        if ch in ('1', '2'):
            k = 'x' + ch; out.append((k, G[k]['w'])); continue
        if ch in MISSING or ch not in LETTERS:
            raise ValueError('no rune for %r in %r' % (ch, text))
        k = LETTERS[ch]; out.append((k, G[k]['w']))
    return out


def runes(text, size=20, x=0, y=0, gap=0.28, anchor='start'):
    """Straight line of runes. size = glyph height in user units."""
    s = size / 100.0; seq = _seq(text); g = gap * 100
    total = sum(w for _, w in seq) + g * (len(seq) - 1)
    cx = x - (total * s if anchor == 'end' else total * s / 2 if anchor == 'middle' else 0)
    out = []
    for k, w in seq:
        if k == 'dot':
            out.append('<circle cx="%.2f" cy="%.2f" r="%.2f"/>' % (cx + w * s / 2, y + size / 2, size * 0.07))
        elif k != 'sp':
            out.append('<use href="#ds-%s" transform="translate(%.2f,%.2f) scale(%.4f)"/>' % (k, cx, y, s))
        cx += (w + g) * s
    return ''.join(out)


def runes_width(text, size=20, gap=0.28):
    seq = _seq(text)
    return (sum(w for _, w in seq) + gap * 100 * (len(seq) - 1)) * size / 100.0


def runes_fit(text, size, x0, x1, y):
    """Line of runes justified between x0 and x1 by opening the gaps."""
    s = size / 100.0; seq = _seq(text)
    tw = sum(w for _, w in seq) * s
    g = (x1 - x0 - tw) / (len(seq) - 1)
    cx = x0; out = []
    for k, w in seq:
        if k == 'dot':
            out.append('<circle cx="%.2f" cy="%.2f" r="%.2f"/>' % (cx + w * s / 2, y + size / 2, size * 0.07))
        elif k != 'sp':
            out.append('<use href="#ds-%s" transform="translate(%.2f,%.2f) scale(%.4f)"/>' % (k, cx, y, s))
        cx += w * s + g
    return ''.join(out)


def runes_v(text, size, x, y0, y1, flip=False):
    """Runes reading down (or up) a vertical edge, justified between y0 and y1."""
    inner = runes_fit(text, size, 0, y1 - y0, 0)
    if flip:
        return '<g transform="translate(%.2f,%.2f) rotate(-90)">%s</g>' % (x, y1, inner)
    return '<g transform="translate(%.2f,%.2f) rotate(90)">%s</g>' % (x + size, y0, inner)


def ring(text, r, size=14, start=-90, fit=True, gap=0.3):
    """Runes round a circle centred on 0,0. r = radius of the glyph mid-line."""
    s = size / 100.0; seq = _seq(text)
    widths = [w * s for _, w in seq]
    g = (2 * math.pi * r - sum(widths)) / len(seq) if fit else gap * size
    ang = math.radians(start); out = []
    for (k, _), w in zip(seq, widths):
        a = ang + (w / 2) / r
        deg = math.degrees(a) + 90
        if k == 'dot':
            out.append('<circle cx="%.2f" cy="%.2f" r="%.2f"/>' % (r * math.cos(a), r * math.sin(a), size * 0.07))
        elif k != 'sp':
            out.append('<use href="#ds-%s" transform="rotate(%.3f) translate(%.2f,%.2f) scale(%.4f)"/>'
                       % (k, deg, -w / 2, -r - size / 2, s))
        ang += (w + g) / r
    return ''.join(out)


def ticks(r1, r2, n, phase=0):
    d = []
    for i in range(n):
        a = 2 * math.pi * i / n + math.radians(phase)
        d.append('M%.2f,%.2fL%.2f,%.2f' % (r1 * math.cos(a), r1 * math.sin(a), r2 * math.cos(a), r2 * math.sin(a)))
    return ''.join(d)


def dots(r, n, rad, phase=0):
    return ''.join('<circle cx="%.2f" cy="%.2f" r="%g"/>' % (r * math.cos(2 * math.pi * i / n + math.radians(phase)),
                                                              r * math.sin(2 * math.pi * i / n + math.radians(phase)), rad) for i in range(n))


# ---------------------------------------------------------------- the seal
def insignia(r=88, sw=1.6):
    """Nested square and diamond, taken from the square-in-square tile of the cuirass."""
    out = []
    a = r * 0.92
    for i in range(4):
        h = a / (math.sqrt(2) ** i)
        rot = ' transform="rotate(45)"' if i % 2 == 0 else ''
        out.append('<rect x="%.2f" y="%.2f" width="%.2f" height="%.2f"%s/>' % (-h / math.sqrt(2), -h / math.sqrt(2), h * math.sqrt(2), h * math.sqrt(2), rot))
    return '<g fill="none" stroke-width="%g">%s</g>' % (sw, ''.join(out))


OUTER = 'viktor von doom . latveria . '
INNER = 'to the viktor go the spoils . '


def seal(state='active', outer=OUTER, inner=INNER, turn=(0, 0, 0)):
    """Three bands in a -200..200 box. Outer gold = sovereignty, middle steel = science,
    inner emerald = sorcery. state: dormant | waking | active. turn = rotation of each band."""
    o = ['<g class="seal seal--%s">' % state]
    o.append('<circle r="198" class="seal-base"/>')
    o.append('<g transform="rotate(%g)"><g class="seal-gold" fill="none"><circle r="196" stroke-width="2.2"/><circle r="170" stroke-width="1"/></g>' % turn[0])
    o.append('<g class="seal-gold-fill">%s</g></g>' % ring(outer, 183, 15))
    o.append('<g transform="rotate(%g)"><g class="seal-steel" fill="none"><circle r="164" stroke-width=".8"/><circle r="140" stroke-width=".8"/>'
             '<path stroke-width=".9" d="%s"/><path stroke-width="1.8" d="%s"/></g>' % (turn[1], ticks(147, 156, 120), ticks(144, 161, 12)))
    o.append('<g class="seal-steel-fill">%s</g></g>' % dots(152, 4, 3.4, 45))
    o.append('<g transform="rotate(%g)"><g class="seal-em" fill="none"><circle r="134" stroke-width="1.4"/><circle r="102" stroke-width="1"/></g>' % turn[2])
    if state == 'waking':
        o.append('<g class="seal-em-dim">%s</g>' % ring(inner, 118, 17))
        o.append('<g class="seal-em-fill" clip-path="url(#clip-wake)">%s</g></g>' % ring(inner, 118, 17))
    else:
        o.append('<g class="seal-em-fill">%s</g></g>' % ring(inner, 118, 17))
    o.append('<g class="seal-em seal-core">%s<circle r="3.4" class="seal-em-fill" stroke="none"/></g>' % insignia(96, 1.5))
    o.append('</g>')
    return ''.join(o)


def seal_mark(sw=7):
    """The seal reduced to an icon: three rings and the nested square. -50..50 box."""
    return ('<g fill="none" stroke-width="%g"><circle r="46"/><circle r="34" stroke-dasharray="1.5 5.62" stroke-width="%g"/>'
            '<rect x="-17" y="-17" width="34" height="34" transform="rotate(45)"/><rect x="-12" y="-12" width="24" height="24"/></g>' % (sw * .5, sw))


# ---------------------------------------------------------------- the mask
# Left half of the face in a 200 x 240 box; the right half is mirrored and one tone darker.
MASK_OUT = [(100, 14), (72, 16), (48, 26), (34, 46), (27, 84), (29, 128), (40, 166), (58, 198), (76, 222), (100, 226)]
PLANES = [  # (points, tone-left, tone-right)
    ([(100, 14), (72, 16), (48, 26), (34, 46), (28, 76), (100, 91)], 1, 2),                    # forehead
    ([(28, 76), (100, 91), (100, 104), (62, 98), (29, 92)], 0, 1),                             # brow
    ([(29, 92), (62, 98), (100, 104), (100, 124), (44, 122), (30, 112)], 4, 4),                # socket
    ([(90, 105), (100, 101), (100, 156), (81, 156), (86, 128)], 1, 2),                         # nose
    ([(29, 112), (44, 122), (86, 127), (81, 156), (62, 174), (40, 166), (29, 128)], 2, 3),     # cheek
    ([(62, 174), (81, 156), (100, 156), (100, 170), (70, 172)], 1, 2),                         # upper lip
    ([(40, 166), (62, 174), (64, 187), (74, 192), (76, 222), (58, 198)], 3, 4),                # jaw
    ([(74, 192), (100, 190), (100, 226), (76, 222)], 2, 3),                                    # chin
]
EYE = [(43, 101), (92, 108.5), (92, 119), (47, 117)]
MOUTH = [(63, 177), (70, 172), (100, 170), (100, 189), (74, 191), (64, 187)]
RIVETS = [(84, 23), (58, 33), (40, 54), (37, 84), (36, 128), (42, 152), (56, 168), (82, 213), (66, 204), (92, 97)]


def mask():
    o = ['<g class="mask">']
    o.append('<path class="mk-edge" d="%s%s"/>' % (P(MASK_OUT), P(mir(MASK_OUT))))
    for pts, tl, tr in PLANES:
        o.append('<path class="mk%d" d="%s"/><path class="mk%d" d="%s"/>' % (tl, P(pts), tr, P(mir(pts))))
    o.append('<path class="mk-eye" d="%s%s"/>' % (P(EYE), P(mir(EYE))))
    o.append('<path class="mk-eye" d="%s%s"/>' % (P(MOUTH), P(mir(MOUTH))))
    o.append('<path class="mk-seam" d="M66,181L134,181M82,171L83,190M100,170L100,190M118,171L117,190"/>')
    o.append('<path class="mk-seam" d="M100,14L100,91M100,104L100,156"/>')
    o.append('<path class="mk-line" d="%s%s"/>' % (P([(28, 76), (100, 91)], False), P(mir([(28, 76), (100, 91)]), False)))
    o.append('<path class="mk-line" d="%s%s"/>' % (P([(29, 112), (44, 122), (86, 127)], False), P(mir([(29, 112), (44, 122), (86, 127)]), False)))
    o.append('<g class="mk-rivet">%s</g>' % ''.join('<circle cx="%g" cy="%g" r="2.1"/><circle cx="%g" cy="%g" r="2.1"/>' % (x, y, 200 - x, y) for x, y in RIVETS))
    o.append('<path class="mk-shade" d="%s%s"/>' % (P(MASK_OUT), P(mir(MASK_OUT))))
    o.append('<path class="mk-under" d="%s%s"/>' % (P(MASK_OUT), P(mir(MASK_OUT))))
    o.append('</g>')
    return ''.join(o)


def mask_sigil():
    """The mask reduced to line: the heraldic charge. Same 200 x 240 box."""
    o = ['<g fill="none" stroke-linejoin="miter">']
    o.append('<path stroke-width="8" d="%s%s"/>' % (P(MASK_OUT, False), P(list(reversed(mir(MASK_OUT))), False)))
    o.append('<path stroke-width="5.5" d="%s%s"/>' % (P([(28, 76), (100, 91)], False), P(mir([(28, 76), (100, 91)]), False)))
    o.append('<path stroke-width="5.5" d="M100,104L100,156 M81,156L119,156 M90,105L86,128L81,156 M110,105L114,128L119,156"/>')
    o.append('<path stroke-width="5.5" d="%s%s M66,181L134,181"/>' % (P(MOUTH[:1] + MOUTH[1:3], False) + P(MOUTH[3:] + MOUTH[:1], False),
                                                                    P(mir(MOUTH[:3]), False) + P(mir(MOUTH[3:] + MOUTH[:1]), False)))
    o.append('<path stroke="none" class="sigil-eye" d="%s%s"/>' % (P(EYE), P(mir(EYE))))
    o.append('</g>')
    return ''.join(o)


def head():
    """Hood and mask. The mask sits in a 200 x 240 box; the hood runs past it on every side."""
    o = ['<g class="head">']
    hood = 'M100,-46 C52,-46 8,-12 -8,44 C-22,96 -26,150 -34,206 C-40,246 -62,270 -92,286 L292,286 C262,270 240,246 234,206 C226,150 222,96 208,44 C192,-12 148,-46 100,-46Z'
    inner = 'M100,-8 C62,-8 30,14 20,56 C10,100 12,150 26,192 C40,228 70,250 100,254 C130,250 160,228 174,192 C188,150 190,100 180,56 C170,14 138,-8 100,-8Z'
    o.append('<path class="hd-cloth" d="%s"/>' % hood)
    o.append('<path class="hd-fold" d="M60,-34 C22,-6 4,50 -4,120 M-8,150 C-14,200 -30,244 -70,278 M140,-34 C178,-6 196,50 204,120 M208,150 C214,200 230,244 270,278"/>')
    o.append('<path class="hd-void" d="%s"/>' % inner)
    o.append('<path class="hd-lip" d="M20,56 C30,14 62,-8 100,-8 C138,-8 170,14 180,56"/>')
    o.append(mask())
    o.append('<path class="hd-cloth2" d="M-92,286 C-40,262 10,238 34,214 C56,246 80,258 100,260 C120,258 144,246 166,214 C190,238 240,262 292,286 C240,318 160,330 100,330 C40,330 -40,318 -92,286Z"/>')
    o.append('<path class="hd-fold" d="M-40,276 C20,300 60,306 100,306 C140,306 180,300 240,276 M0,256 C40,282 70,288 100,288 C130,288 160,282 200,256"/>')
    o.append('<path class="hd-rim" d="M100,-46 C52,-46 8,-12 -8,44 C-22,96 -26,150 -34,206 C-40,246 -62,270 -92,286"/>')
    o.append('<path class="hd-rim hd-rim--r" d="M100,-46 C148,-46 192,-12 208,44 C222,96 226,150 234,206 C240,246 262,270 292,286"/>')
    o.append('</g>')
    return ''.join(o)


def clasp(cx, cy, r):
    return ('<g transform="translate(%g,%g)"><circle r="%g" class="fg-gold"/><circle r="%g" class="fg-gold-line"/>'
            '<rect x="%g" y="%g" width="%g" height="%g" class="fg-gold-line"/><rect x="%g" y="%g" width="%g" height="%g" transform="rotate(45)" class="fg-gold-line"/></g>'
            % (cx, cy, r, r * 0.8, -r * .38, -r * .38, r * .76, r * .76, -r * .38, -r * .38, r * .76, r * .76))


def figure():
    """Standing figure, 400 x 900 box, feet on y=880."""
    o = ['<g class="figure">']
    o.append('<path class="fg-cloak" d="M132,168 L268,168 C304,188 326,232 336,300 C346,410 372,640 398,880 L2,880 C28,640 54,410 64,300 C74,232 96,188 132,168Z"/>')
    o.append('<path class="fg-fold" d="M120,560 L108,878 M280,560 L292,878"/>')
    for sx in (1, -1):
        t = 'translate(200 0) scale(%d 1) translate(-200 0)' % sx
        o.append('<g transform="%s"><path class="fg-steel-lo" d="M160,596 L197,596 L196,880 L146,880 L152,820 L158,700Z"/>'
                 '<path class="fg-steel" d="M158,660 L196,660 L196,716 L160,722Z"/><path class="fg-line" d="M160,760 L196,756 M154,820 L196,818 M150,856 L196,856"/></g>' % t)
    o.append('<path class="fg-tunic" d="M144,356 L256,356 L270,640 L207,652 L200,470 L193,652 L130,640Z"/>')
    o.append('<path class="fg-fold" d="M168,372 L160,642 M232,372 L240,642 M200,380 L200,470"/>')
    o.append('<path class="fg-steel-lo" d="M136,204 L264,204 L258,352 L142,352Z"/>')
    tiles = []
    for r in range(5):
        for c in range(5):
            x = 143 + c * 23; y = 228 + r * 23
            tiles.append('<rect x="%g" y="%g" width="21" height="21" class="fg-tile"/><rect x="%g" y="%g" width="11" height="11" class="fg-tile-in"/>' % (x, y, x + 5, y + 5))
    o.append(''.join(tiles))
    o.append('<rect x="138" y="344" width="124" height="24" class="fg-belt"/><circle cx="200" cy="356" r="12" class="fg-gold-line" style="stroke-width:3"/>')
    for sx in (1, -1):
        t = 'translate(200 0) scale(%d 1) translate(-200 0)' % sx
        o.append('<g transform="%s"><path class="fg-mail" d="M106,214 L138,206 L136,330 L104,334Z"/>'
                 '<path class="fg-steel" d="M96,326 L134,322 L132,472 L98,476Z"/><path class="fg-line" d="M100,360 L132,356 M99,440 L132,436"/>'
                 '<path class="fg-steel-lo" d="M96,476 L134,472 L136,526 L116,538 L98,528Z"/><path class="fg-line" d="M104,500 L134,498 M106,514 L134,512"/></g>' % t)
    for sx in (1, -1):
        t = 'translate(200 0) scale(%d 1) translate(-200 0)' % sx
        o.append('<g transform="%s"><path class="fg-cloak-hi" d="M140,176 C106,186 80,216 72,280 C62,420 32,660 12,880 L72,880 C80,700 92,480 100,300 C104,256 118,224 146,204Z"/>'
                 '<path class="fg-rim" d="M132,168 C96,188 74,232 64,300 C54,410 28,640 2,880"/></g>' % t)
    o.append('<path class="fg-chain" d="M152,222 Q200,250 248,222"/>')
    o.append(clasp(134, 216, 19) + clasp(266, 216, 19))
    o.append('<g transform="translate(158,56) scale(.42)">%s</g>' % head())
    o.append('</g>')
    return ''.join(o)
