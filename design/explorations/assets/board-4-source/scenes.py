# Compositions for board IV, built from the drawn parts in art.py / art2.py.
import math
from art import (G, runes, runes_fit, runes_v, runes_width, ring, ticks, dots, seal, seal_mark, insignia,
                 mask_sigil, rune_defs, head, figure, mask, P)
from art2 import hall, seated, lancet

DOC1 = 'there is no promise of tomorro'      # read by fans on the SDCC jacket lapel
DOC2 = 'to the viktor go the spoils'         # read by fans on the jacket cuffs
DOC3 = 'justice'
DOC4 = 'revenge'


def svg(vb, body, cls='', extra=''):
    return '<svg class="fill art %s" viewBox="%s" preserveAspectRatio="xMidYMid slice" aria-hidden="true" %s>%s</svg>' % (cls, vb, extra, body)


def rune_svg(text, cls='', gap=0.28):
    """A line of runes as its own small inline svg, sized by CSS height."""
    w = runes_width(text, 100, gap)
    return '<svg class="rune-line %s" viewBox="0 0 %.1f 100" aria-hidden="true">%s</svg>' % (cls, w, runes(text, 100, 0, 0, gap))


def sprite():
    return ('<g id="hall">%s</g><g id="figure">%s</g><g id="seated">%s</g><g id="head">%s</g>'
            '<g id="seal-active">%s</g><g id="seal-waking">%s</g><g id="seal-dormant">%s</g>'
            '<g id="sigil">%s</g><g id="mark">%s</g>') % (
        hall(), figure(), seated(), head(), seal('active'), seal('waking'), seal('dormant'), mask_sigil(), seal_mark(7))


def grain(w, h, op=.1):
    return '<rect width="%g" height="%g" filter="url(#grain)" opacity="%g" style="mix-blend-mode:overlay"/>' % (w, h, op)


# ------------------------------------------------------------ A. the collection
def _collection(W, H, door, hall_t, fig_t, ringc, ring_r, ring_sy, ring_size, uid, spill, shadow, lit_from=0.0):
    x0, x1, yt, yb = door
    dpath = lancet(x0, x1, yt, yb)
    o = []
    A = o.append
    A('<rect width="%g" height="%g" fill="url(#g-night)"/>' % (W, H))
    A('<rect y="%g" width="%g" height="%g" fill="url(#g-nfloor)"/>' % (yb - 6, W, H - yb + 6))
    # light leaking round the door
    A('<path d="%s" fill="#c9a24a" opacity=".22" filter="url(#blur-30)"/>' % dpath)
    A('<clipPath id="cd-%s"><path d="%s"/></clipPath>' % (uid, dpath))
    A('<g clip-path="url(#cd-%s)"><rect x="%g" y="%g" width="%g" height="%g" fill="#0b0e09"/><use href="#hall" transform="%s"/>'
      '<rect x="%g" y="%g" width="%g" height="%g" fill="url(#g-doorshade)"/></g>' % (uid, x0, yt, x1 - x0, yb - yt, hall_t, x0, yt, x1 - x0, yb - yt))
    A('<path d="%s" fill="none" stroke="#04060a" stroke-width="%g"/>' % (dpath, (x1 - x0) * .085))
    A('<path d="%s" fill="none" stroke="#c9a24a" stroke-width="1.6" opacity=".6"/>' % dpath)
    # spill of hall light across the floor, and his shadow in it
    A('<path d="%s" fill="url(#g-spill)" filter="url(#blur-12)" style="mix-blend-mode:screen"/>' % spill)
    A('<path d="%s" fill="#000" opacity=".6" filter="url(#blur-12)"/>' % shadow)
    # the ring that lights under the guest
    cx, cy = ringc
    body = ('<g fill="none"><circle r="%g" stroke-width="3"/><circle r="%g" stroke-width="2"/></g>%s'
            % (ring_r + ring_size * .95, ring_r - ring_size * .95, ring((DOC1 + ' . ') * 2, ring_r, ring_size, start=-90 + lit_from)))
    A('<g transform="translate(%g,%g) scale(1,%g)" class="ring-glow" filter="url(#blur-12)">%s</g>' % (cx, cy, ring_sy, body))
    A('<g transform="translate(%g,%g) scale(1,%g)" class="ring-lit">%s</g>' % (cx, cy, ring_sy, body))
    A('<ellipse cx="%g" cy="%g" rx="%g" ry="%g" fill="#1f8f63" opacity=".1" filter="url(#blur-30)"/>' % (cx, cy - ring_r * ring_sy, ring_r * .6, ring_r * ring_sy * .5))
    # Doom, backlit
    A('<g transform="%s" class="doom-backlit"><use href="#figure"/></g>' % fig_t)
    A('<rect width="%g" height="%g" fill="url(#g-vignette)" opacity=".7"/>' % (W, H))
    A(grain(W, H, .12))
    return ''.join(o)


def collection_desktop():
    return svg('0 0 1600 900', _collection(
        1600, 900, door=(930, 1230, 56, 668), hall_t='translate(680,112) scale(.5)',
        fig_t='translate(964,182) scale(.58)', ringc=(800, 850), ring_r=700, ring_sy=.2, ring_size=58, uid='d',
        spill='M930,668 L1230,668 L1560,900 L560,900Z', shadow='M1020,690 L1140,690 L1250,900 L870,900Z'))


def collection_phone():
    return svg('0 0 780 1688', _collection(
        780, 1688, door=(196, 584, 96, 948), hall_t='translate(-143,210) scale(.666)',
        fig_t='translate(238,296) scale(.76)', ringc=(390, 1046), ring_r=500, ring_sy=.2, ring_size=52, uid='p',
        spill='M196,948 L584,948 L780,1300 L0,1300Z', shadow='M300,960 L480,960 L600,1300 L180,1300Z'))


# ------------------------------------------------------------ B. the throne hall
def hall_desktop():
    return svg('0 80 1600 900', '<use href="#hall"/><g transform="translate(716,440) scale(.7)" class="doom-hall"><use href="#seated"/></g>'
               + '<g transform="translate(0,80)">%s</g>' % grain(1600, 900, .12))


def hall_phone():
    # the hall keeps its width; the floor runs on below it into the dark
    return svg('420 0 760 1645', '<rect x="420" width="760" height="1645" fill="#060705"/><use href="#hall"/>'
               '<g transform="translate(716,440) scale(.7)" class="doom-hall"><use href="#seated"/></g>'
               '<rect x="420" y="1000" width="760" height="645" fill="url(#g-floorfade)"/>'
               + '<g transform="translate(420,0)">%s</g>' % grain(760, 1645, .12))


# ------------------------------------------------------------ C. the summons plate
def plate_path(x0, y0, x1, y1, c):
    return P([(x0 + c, y0), (x1 - c, y0), (x1, y0 + c), (x1, y1 - c), (x1 - c, y1), (x0 + c, y1), (x0, y1 - c), (x0, y0 + c)])


def bolt(x, y, r=11):
    return ('<g transform="translate(%g,%g)"><circle r="%g" class="pl-bolt"/><circle r="%g" class="pl-bolt-ring"/>'
            '<rect x="%g" y="%g" width="%g" height="%g" transform="rotate(45)" class="pl-bolt-ring"/></g>' % (x, y, r, r * .72, -r * .3, -r * .3, r * .6, r * .6))


def _plate(W, H, m, uid, band=True, side=True, rs=20):
    """Chamfered steel plate with the four documented phrases engraved round its edge."""
    x0, y0, x1, y1 = m[0], m[1], W - m[0], H - m[1]
    pp = plate_path(x0, y0, x1, y1, 30)
    o = []
    A = o.append
    A('<rect width="%g" height="%g" fill="#060808"/>' % (W, H))
    A('<ellipse cx="%g" cy="0" rx="%g" ry="%g" fill="#c9a24a" opacity=".1" filter="url(#blur-30)"/>' % (W / 2, W * .5, H * .2))
    A('<path d="%s" fill="#000" opacity=".7" filter="url(#blur-12)" transform="translate(0,16)"/>' % pp)
    A('<clipPath id="cp-%s"><path d="%s"/></clipPath>' % (uid, pp))
    A('<path d="%s" fill="url(#g-plate)"/>' % pp)
    A('<rect x="%g" y="%g" width="%g" height="%g" filter="url(#brushed)" opacity=".5" clip-path="url(#cp-%s)" style="mix-blend-mode:soft-light"/>'
      '<rect x="%g" y="%g" width="%g" height="%g" fill="url(#g-sheen)" clip-path="url(#cp-%s)"/>' % (x0, y0, x1 - x0, y1 - y0, uid, x0, y0, x1 - x0, y1 - y0, uid))
    A('<path d="%s" fill="none" stroke="url(#g-bevel)" stroke-width="1.6"/>' % pp)
    # dotted line, rune band, inner rule
    i1 = 20; i2 = 20 + rs + 26
    A('<path d="%s" class="pl-dots"/>' % plate_path(x0 + i1, y0 + i1, x1 - i1, y1 - i1, 22))
    A('<path d="%s" class="pl-rule"/>' % plate_path(x0 + i2, y0 + i2, x1 - i2, y1 - i2, 10))
    by = i1 + 13
    if band:
        A('<g class="pl-runes" filter="url(#engrave)">')
        A(runes_fit(DOC1, rs, x0 + 110, x1 - 110, y0 + by))
        A(runes_fit(DOC2, rs, x0 + 110, x1 - 110, y1 - by - rs))
        if side:
            A(runes_v(DOC3, rs, x0 + by, y0 + (y1 - y0) * .36, y0 + (y1 - y0) * .64, flip=True))
            A(runes_v(DOC4, rs, x1 - by - rs, y0 + (y1 - y0) * .36, y0 + (y1 - y0) * .64))
        A('</g>')
    c = i1 + 13 + rs / 2
    for bx, byy in ((x0 + c + 14, y0 + c + 14), (x1 - c - 14, y0 + c + 14), (x0 + c + 14, y1 - c - 14), (x1 - c - 14, y1 - c - 14)):
        A(bolt(bx, byy, 10))
    return ''.join(o)


def summons_desktop():
    o = [_plate(1200, 900, (36, 36), 'sd')]
    A = o.append
    A('<g transform="translate(254,118) scale(.48)" class="pl-sigil"><use href="#sigil"/></g>')
    A('<circle cx="302" cy="462" r="170" fill="#1f8f63" opacity=".13" filter="url(#blur-30)"/>')
    A('<g transform="translate(302,462) scale(.72)" filter="url(#lit)"><use href="#seal-active"/></g>')
    A('<g class="pl-cap">%s</g>' % runes('latveria', 15, 302, 640, anchor='middle'))
    A('<text x="302" y="700" text-anchor="middle" class="pl-caption">Given at Castle Doom, in Doomstadt,</text>')
    A('<text x="302" y="726" text-anchor="middle" class="pl-caption">the fifteenth day of November, MMXXVI</text>')
    A('<path d="M500,150 L500,750" class="pl-dots"/>')
    return svg('0 0 1200 900', ''.join(o))


def summons_phone():
    o = [_plate(780, 1688, (26, 30), 'sp', rs=17)]
    A = o.append
    A('<circle cx="390" cy="238" r="120" fill="#1f8f63" opacity=".13" filter="url(#blur-30)"/>')
    A('<g transform="translate(390,238) scale(.5)" filter="url(#lit)"><use href="#seal-active"/></g>')
    A('<path d="M150,372 L630,372" class="pl-dots"/>')
    return svg('0 0 780 1688', ''.join(o))


# ------------------------------------------------------------ D. doomscript
ORDER = [('a', 'A / soft O'), ('c', 'C soft'), ('k', 'C hard, K, Q'), ('d', 'D'), ('e', 'E'), ('i', 'I / EE'), ('f', 'F'),
         ('v', 'V / FF'), ('g', 'G'), ('h', 'H'), ('j', 'J'), ('l', 'L'), ('m', 'M'), ('n', 'N'), ('o', 'O / OU'),
         ('p', 'P'), ('r', 'R'), ('s', 'S'), ('t', 'T'), ('u', 'U')]


def decoder_tiles():
    o = []
    for k, lab in ORDER:
        o.append('<li class="glyph"><svg viewBox="-10 -10 120 120" aria-hidden="true"><use href="#ds-%s" x="%.1f"/></svg><span>%s</span></li>' % (k, (100 - G[k]['w']) / 2, lab))
    for k, lab in (('x1', 'Unread rune 1'), ('x2', 'Unread rune 2')):
        o.append('<li class="glyph glyph--unread"><svg viewBox="-10 -10 120 120" aria-hidden="true"><use href="#ds-%s" x="%.1f"/></svg><span>%s</span></li>' % (k, (100 - G[k]['w']) / 2, lab))
    return ''.join(o)


def tile(body, vb='0 0 400 300'):
    return '<svg class="art" viewBox="%s" preserveAspectRatio="xMidYMid slice" aria-hidden="true">%s</svg>' % (vb, body)


def steel_bg(w=400, h=300, uid='x'):
    return ('<rect width="%g" height="%g" fill="url(#g-plate)"/><rect width="%g" height="%g" filter="url(#brushed)" opacity=".55" style="mix-blend-mode:soft-light"/>'
            '<rect width="%g" height="%g" fill="url(#g-sheen)"/>' % (w, h, w, h, w, h))


def ds_insignia():
    b = ('<rect width="600" height="450" fill="#0a0d0c"/><circle cx="300" cy="225" r="190" fill="#1f8f63" opacity=".1" filter="url(#blur-30)"/>'
         '<g transform="translate(300,225) scale(.98)" filter="url(#lit)"><use href="#seal-active"/></g>')
    return tile(b, '0 0 600 450')


def ds_metal():
    b = steel_bg(600, 450)
    b += '<path d="M40,150 L560,150 M40,300 L560,300" class="pl-rule"/><path d="M40,138 L560,138 M40,312 L560,312" class="pl-dots"/>'
    b += '<g class="pl-runes" filter="url(#engrave)">%s%s</g>' % (runes_fit(DOC1[:20], 44, 60, 540, 176), runes_fit(DOC1[21:], 44, 150, 450, 238))
    return tile(b, '0 0 600 450')


def ds_border():
    b = steel_bg(600, 450)
    pp = plate_path(60, 60, 900, 700, 44)
    b += '<path d="%s" class="pl-dots" style="stroke-width:5;stroke-dasharray:0 16"/>' % plate_path(92, 92, 900, 700, 34)
    b += '<path d="%s" class="pl-rule" style="stroke-width:1.6"/>' % plate_path(190, 190, 900, 700, 16)
    b += '<g class="pl-runes" filter="url(#engrave)">%s%s</g>' % (runes('there is no pro', 44, 236, 120, gap=.5), runes_v('justice', 44, 118, 250, 640, flip=True))
    b += bolt(152, 152, 22)
    return tile(b, '0 0 600 450')


def ds_mechanism():
    b = '<rect width="600" height="450" fill="#0a0d0c"/>'
    for i, (st, tx, turn) in enumerate((('dormant', 101, (38, -24, 61)), ('waking', 300, (14, -9, 22)), ('active', 499, (0, 0, 0)))):
        f = ' filter="url(#lit)"' if st == 'active' else ''
        b += '<g transform="translate(%g,186) scale(.49)"%s>%s</g>' % (tx, f, seal(st, turn=turn))
    b += '<path d="M104,326 L496,326" class="pl-rule"/><g class="mech-pin"><circle cx="104" cy="326" r="5"/><circle cx="300" cy="326" r="5"/><circle cx="496" cy="326" r="5"/></g>'
    b += '<text x="104" y="374" text-anchor="middle" class="tile-label">Dormant</text><text x="300" y="374" text-anchor="middle" class="tile-label">Waking</text><text x="496" y="374" text-anchor="middle" class="tile-label">Locked, lit</text>'
    return tile(b, '0 0 600 450')


# ------------------------------------------------------------ E. materials, light, icons
def mat(kind):
    if kind == 'steel':
        b = steel_bg()
    elif kind == 'engraved':
        b = steel_bg() + '<g class="pl-runes" filter="url(#engrave)">%s</g><path d="M40,222 L360,222" class="pl-dots"/>' % runes('doom', 70, 200, 96, anchor='middle')
    elif kind == 'stone':
        b = ('<rect width="400" height="300" fill="#12150e"/><rect width="400" height="300" filter="url(#stone)" opacity=".5" style="mix-blend-mode:soft-light"/>'
             '<path d="M0,100 L400,100 M0,200 L400,200 M140,0 L140,100 M260,100 L260,200 M90,200 L90,300 M310,200 L310,300" stroke="#050604" stroke-width="3" fill="none"/>'
             '<path d="M0,103 L400,103 M0,203 L400,203" stroke="#3a3f2a" stroke-width="1" fill="none" opacity=".6"/>')
    elif kind == 'gold':
        b = ('<rect width="400" height="300" fill="url(#g-gold)"/><rect width="400" height="300" filter="url(#brushed)" opacity=".5" style="mix-blend-mode:soft-light"/>'
             '<rect width="400" height="300" fill="url(#g-sheen)"/><g transform="translate(200,150) scale(1.5)" stroke="#5a4520" opacity=".8">%s</g>' % insignia(60, 2))
    elif kind == 'cloth':
        b = ('<rect width="400" height="300" fill="#143324"/><path d="M-20,0 C40,90 20,200 70,320 M90,-10 C150,100 120,200 170,320 M220,-10 C260,110 240,210 290,320 M330,-10 C380,90 360,210 410,320" stroke="#0a2017" stroke-width="26" fill="none"/>'
             '<path d="M20,0 C80,90 60,200 110,320 M150,-10 C200,100 170,200 220,320 M270,-10 C320,110 300,210 350,320" stroke="#1f4a35" stroke-width="10" fill="none" opacity=".8"/>'
             '<rect width="400" height="300" filter="url(#grain)" opacity=".35" style="mix-blend-mode:overlay"/>')
    elif kind == 'glass':
        b = ('<rect width="400" height="300" fill="#0b0e09"/><g transform="translate(-460,-60)"><path class="hl-glow" filter="url(#blur-30)" d="%s"/>' % lancet(560, 760, 80, 500)
             + '<path class="hl-glass" d="%s"/><path class="hl-lead" d="%s %s"/><circle class="hl-lead" cx="660" cy="184" r="34"/><path class="hl-stone-line" d="%s"/></g>'
             % (lancet(560, 760, 80, 500), lancet(560, 660, 233, 500), lancet(660, 760, 233, 500), lancet(560, 760, 80, 500)))
    elif kind == 'light-gold':
        b = ('<rect width="400" height="300" fill="#0b0e09"/><g class="hl-shaft" filter="url(#blur-12)"><path d="M40,-20 L130,-20 L400,300 L210,300Z"/><path d="M190,-20 L240,-20 L420,200 L400,260Z" opacity=".6"/></g>'
             '<rect y="250" width="400" height="50" fill="#14170f"/><ellipse cx="300" cy="268" rx="130" ry="16" fill="#c9a24a" opacity=".3" filter="url(#blur-12)"/>')
    elif kind == 'light-emerald':
        b = ('<rect width="400" height="300" fill="#07090b"/><g transform="translate(60,10) scale(1.4)" class="doom-backlit" style="--under:1;--shade:.85;--rim-o:0"><use href="#head"/></g>'
             '<rect width="400" height="300" fill="url(#g-vignette)"/>')
    elif kind == 'light-rim':
        b = ('<rect width="400" height="300" fill="url(#g-apse)"/><ellipse cx="200" cy="120" rx="170" ry="150" fill="#d9c078" opacity=".4" filter="url(#blur-30)"/>'
             '<g transform="translate(116,60) scale(.84)" class="doom-rim"><use href="#head"/></g>')
    return tile(b)


def icon(kind):
    if kind == 'seal':
        b = '<g transform="translate(50,50)" class="ic-em"><use href="#mark"/></g>'
    elif kind == 'sigil':
        b = '<g transform="translate(13,6) scale(.37)" class="ic-gold"><use href="#sigil"/></g>'
    elif kind == 'tile':
        b = '<g transform="translate(50,50)" class="ic-steel" fill="none" stroke-width="3.5"><rect x="-34" y="-34" width="68" height="68"/><rect x="-18" y="-18" width="36" height="36"/></g>'
    elif kind == 'clasp':
        b = '<g transform="translate(50,50)" class="ic-gold" fill="none" stroke-width="3.5"><circle r="40"/><rect x="-17" y="-17" width="34" height="34"/><rect x="-17" y="-17" width="34" height="34" transform="rotate(45)"/></g>'
    elif kind == 'sound':
        b = '<g class="ic-steel" fill="none" stroke-width="3.5"><path d="M50,14 L50,86 M32,30 L32,70 M68,30 L68,70 M14,42 L14,58 M86,42 L86,58"/></g>'
    elif kind == 'seat':
        b = '<g class="ic-steel" fill="none" stroke-width="3.5"><path d="M50,8 L70,30 L70,66 L30,66 L30,30Z M18,52 L30,52 M70,52 L82,52 M18,52 L18,90 M82,52 L82,90 M30,66 L30,90 M70,66 L70,90"/></g>'
    elif kind == 'approve':
        b = '<g transform="translate(50,50)" class="ic-em" fill="none" stroke-width="3.5"><circle r="40" stroke-dasharray="188 64" transform="rotate(-90)"/><rect x="-15" y="-15" width="30" height="30" transform="rotate(45)" class="ic-em-fill"/></g>'
    elif kind == 'rune':
        b = '<g class="ic-steel-fill" transform="translate(%.1f,14) scale(.72)"><use href="#ds-d"/></g>' % ((100 - G['d']['w'] * .72) / 2)
    return '<svg class="art icon" viewBox="0 0 100 100" aria-hidden="true">%s</svg>' % b


# ------------------------------------------------------------ F. motion beats
def beat(n):
    W, H = 640, 400
    if n == 1:    # lights out: the first runes catch
        body = ('<g fill="none"><circle r="330" stroke-width="2"/><circle r="270" stroke-width="2"/></g>%s' % ring((DOC1 + ' . ') * 2, 300, 34))
        b = ('<rect width="640" height="400" fill="#05070a"/>'
             '<g transform="translate(320,300) scale(1,.3)" class="ring-off">%s</g>'
             '<clipPath id="cb1"><path d="M150,0 L490,0 L400,300 L240,300Z"/></clipPath>'
             '<g clip-path="url(#cb1)"><g transform="translate(320,300) scale(1,.3)" class="ring-glow" filter="url(#blur-12)">%s</g>'
             '<g transform="translate(320,300) scale(1,.3)" class="ring-lit">%s</g></g>') % (body, body, body)
    elif n == 2:  # the hall opens: a seam of gold, the figure in it
        d = lancet(250, 390, 30, 330)
        b = ('<rect width="640" height="400" fill="url(#g-night)"/><rect y="324" width="640" height="76" fill="url(#g-nfloor)"/>'
             '<path d="%s" fill="#c9a24a" opacity=".2" filter="url(#blur-30)"/>'
             '<clipPath id="cb2"><path d="%s"/></clipPath><clipPath id="cb2b"><rect x="296" y="0" width="48" height="400"/></clipPath>'
             '<g clip-path="url(#cb2b)"><g clip-path="url(#cb2)"><rect x="250" y="30" width="140" height="300" fill="#0b0e09"/><use href="#hall" transform="translate(133,56) scale(.234)"/></g></g>'
             '<path d="%s" fill="none" stroke="#04060a" stroke-width="12"/>'
             '<path d="M296,40 L296,330 M344,40 L344,330" stroke="#c9a24a" stroke-width="1.4" opacity=".8"/>'
             '<path d="M296,330 L344,330 L420,400 L220,400Z" fill="url(#g-spill)" filter="url(#blur-4)" style="mix-blend-mode:screen"/>'
             '<g transform="translate(266,90) scale(.27)" class="doom-backlit" style="--under:0"><use href="#figure"/></g>') % (d, d, d)
    elif n == 3:  # emerald from below: the mask
        b = ('<rect width="640" height="400" fill="#05070a"/><ellipse cx="320" cy="430" rx="300" ry="90" fill="#1f8f63" opacity=".22" filter="url(#blur-30)"/>'
             '<g transform="translate(150,-10) scale(1.7)" class="doom-backlit" style="--under:1;--shade:.85;--rim-o:.25"><use href="#head"/></g>'
             '<rect width="640" height="400" fill="url(#g-vignette)"/>')
    elif n == 4:  # doomscript wakes: band by band
        b = ('<rect width="640" height="400" fill="#0a0d0c"/><circle cx="320" cy="200" r="150" fill="#1f8f63" opacity=".08" filter="url(#blur-30)"/>'
             '<g transform="translate(320,200) scale(.9)">%s</g>') % seal('waking', turn=(18, -11, 0))
    elif n == 5:  # the plate parts on its seam
        b = ('<rect width="640" height="400" fill="#060808"/>'
             '<g transform="translate(-14,0)"><path d="M60,50 L300,50 L300,350 L60,350Z" fill="url(#g-plate)"/><path d="M78,68 L300,68 M78,332 L300,332 M78,68 L78,332" class="pl-dots"/></g>'
             '<g transform="translate(14,0)"><path d="M340,50 L580,50 L580,350 L340,350Z" fill="url(#g-plate)"/><path d="M340,68 L562,68 M340,332 L562,332 M562,68 L562,332" class="pl-dots"/></g>'
             '<rect x="60" y="50" width="520" height="300" filter="url(#brushed)" opacity=".4" style="mix-blend-mode:soft-light"/>'
             '<rect x="286" y="50" width="68" height="300" fill="#030504"/><rect x="300" y="40" width="40" height="320" fill="#4fc395" opacity=".35" filter="url(#blur-12)"/>'
             '<path d="M320,50 L320,350" stroke="#4fc395" stroke-width="2"/>'
             '<g transform="translate(320,200) scale(.2)" filter="url(#lit)"><use href="#seal-active"/></g>')
    else:         # between scenes: the seal opens like an iris
        b = ('<rect width="640" height="400" fill="#07090b"/><clipPath id="cb6"><circle cx="320" cy="200" r="118"/></clipPath>'
             '<g clip-path="url(#cb6)"><use href="#hall" transform="translate(64,-40) scale(.32)"/><g transform="translate(293,101) scale(.224)" class="doom-hall"><use href="#seated"/></g></g>'
             '<g transform="translate(320,200)"><g class="seal-gold" fill="none"><circle r="176" stroke-width="2"/><circle r="152" stroke-width="1"/></g>'
             '<g class="seal-gold-fill">%s</g><g class="seal-steel" fill="none"><circle r="146" stroke-width=".8"/><circle r="122" stroke-width=".8"/><path stroke-width="1" d="%s"/><path stroke-width="1.8" d="%s"/></g>'
             '<circle r="118" fill="none" stroke="#4fc395" stroke-width="1.6"/></g>') % (ring('viktor von doom . latveria . ', 164, 13), ticks(128, 138, 120), ticks(126, 142, 12))
    return '<svg class="art" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">%s</svg>' % b
