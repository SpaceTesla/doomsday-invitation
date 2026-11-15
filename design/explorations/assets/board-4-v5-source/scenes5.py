# Compositions for board IV, revision 5 (typography review). The artwork is revision 4's, unchanged.
# Revision 3 changes the figure layers only; fog, rubble, hall, mask, rune and plate are the version 2 files.
# Kept from version 1 (unchanged drawing code): the steel plate, the seal, the rune lines, the decoder tiles.
# New: the layered reveal, the hall plates, the mask and rune sheets.
import json, math, os
from art import (G, runes, runes_fit, runes_v, runes_width, ring, ticks, dots, seal, seal_mark, insignia, rune_defs, P)
import icons as IC
import icongeo as IG
import maskgeo as M

HERE = os.path.dirname(os.path.abspath(__file__))
V2 = os.path.normpath(os.path.join(HERE, '..', 'v2'))
V3 = os.path.normpath(os.path.join(HERE, '..', 'v3'))
V4 = os.path.normpath(os.path.join(HERE, '..', 'v4'))
A = 'assets/v2/'
A3 = 'assets/v3/'
A4 = 'assets/v4/'
REF = '../../references/'

DOC1 = 'there is no promise of tomorro'      # read by fans on the SDCC jacket lapel
DOC2 = 'to the viktor go the spoils'         # read by fans on the jacket cuffs
DOC3 = 'justice'
DOC4 = 'revenge'


def svg(vb, body, cls='', extra=''):
    return '<svg class="fill art %s" viewBox="%s" preserveAspectRatio="xMidYMid slice" aria-hidden="true" %s>%s</svg>' % (cls, vb, extra, body)


def rune_svg(text, cls='', gap=0.28):
    w = runes_width(text, 100, gap)
    return '<svg class="rune-line %s" viewBox="0 0 %.1f 100" aria-hidden="true">%s</svg>' % (cls, w, runes(text, 100, 0, 0, gap))


def sprite():
    return ('<g id="seal-active">%s</g><g id="seal-waking">%s</g><g id="seal-dormant">%s</g><g id="mark">%s</g>'
            '<g id="mask-l1">%s</g><g id="mask-l2">%s</g><g id="mask-l2-plain">%s</g><g id="rune-l1">%s</g><g id="rune-l2">%s</g><g id="horned">%s</g>') % (
        seal('active'), seal('waking'), seal('dormant'), seal_mark(7),
        IC.mask_l1(), IC.mask_l2(), IC.mask_l2(1.7, rivets=False), IC.rune_l1(), IC.rune_l2(), IC.doom_mark())


# ------------------------------------------------------------ A. the reveal
def _layout(key):
    return json.load(open(os.path.join(V4, 'hero-%s-layout.json' % key)))


def reveal(key, state='open', lit=True, live=False, uid=''):
    """The layered opening. key 'd' or 'p'; state closed | parting | open; lit = costume readable."""
    L = _layout(key)
    W, Hh = L['_frame']['w'], L['_frame']['h']
    pc = lambda v, tot: '%.3f%%' % (v / tot * 100)
    cq = lambda v: '%.3f' % (v / W * 100)
    o = ['<div class="rv rv--%s is-%s%s%s"%s>' % (key, state, ' is-lit' if lit else '', ' rv--live' if live else '', ' id="%s"' % uid if uid else '')]
    A_ = o.append
    A_('<img class="rv-l rv-sky" src="%shero-%s-sky.jpg" alt="">' % (A, key))
    hx, hy = L['_frame']['hand']
    A_('<div class="rv-glow" style="left:%s;top:%s"></div>' % (pc(hx, W), pc(hy, Hh)))
    A_('<img class="rv-l rv-fig rv-fig--dark" src="%shero-%s-figure-dark.webp" alt="">' % (A4, key))
    A_('<img class="rv-l rv-fig rv-fig--lit" src="%shero-%s-figure-lit.webp" alt="">' % (A4, key))
    A_('<img class="rv-l rv-haze" src="%shero-%s-haze.webp" alt="">' % (A, key))
    A_('<div class="rv-l rv-dust" style="background-image:url(%shero-dust.webp)"></div>' % A)
    A_('<img class="rv-l rv-bokeh" src="%shero-%s-bokeh.webp" alt="">' % (A, key))
    for name in ('right', 'left', 'bottom', 'top'):
        r = L[name]; x0, y0, rw, rh = r['box']; st = r['states']
        style = 'left:%s;top:%s;width:%s;' % (pc(x0, W), pc(y0, Hh), pc(rw, W))
        for sname, pre in (('closed', 'c'), ('parting', 'p')):
            dx, dy, rot = st[sname]
            style += '--%sx:%s;--%sy:%s;--%sr:%gdeg;' % (pre, cq(dx), pre, cq(dy), pre, rot)
        A_('<img class="rv-rock rv-rock--%s" src="%shero-%s-rock-%s.webp" alt="" style="%s">' % (name, A, key, name, style))
    A_('<div class="rv-l rv-vig"></div>')
    A_('</div>')
    return ''.join(o)


def reveal_copy(extra='', name='Mr. Anish.'):
    return ('<div class="rv-copy%s">'
            '<p class="rv-name">%s</p>'
            '<p class="rv-line">Doctor Doom is here to collect you.</p>'
            '<div class="rv-sig">%s</div>'
            '<div class="rv-act">'
            '<button type="button" class="btn-plate"><svg viewBox="-50 -50 100 100" aria-hidden="true"><use href="#mark"/></svg>Go with him</button>'
            '<a class="link-quiet" href="#opening">Go without sound</a>'
            '</div></div>') % (extra, name, rune_svg('viktor von doom'))


def summons_copy(name='Mr. Anish', decline=False):
    """The approved summons wording. decline=True adds the decided decline control with placeholder wording."""
    quiet = '<a class="link-quiet" href="#summons">Decline</a>' if decline else ''
    return ('<div class="sm-copy">'
            '<p class="sm-from">Victor von Doom</p>'
            '<p class="sm-title">by his own hand and will Sovereign of Latveria, to</p>'
            '<p class="sm-name">%s</p>'
            '<p class="sm-greet">greeting.</p>'
            '<div class="sm-body">'
            '<p>Be it known that Doom has weighed the defenders of this world and found them wanting; that he now gathers a company of his own choosing; and that you have been chosen.</p>'
            '<p>You are therefore summoned to take your seat at the Council of Doom, where the day, the hour and the place shall be set before you.</p>'
            '<p class="sm-sanction">Let none who is called fail to answer. The absent forfeit their voice.</p>'
            '<p class="sm-date">Given at Castle Doom, the fifteenth day of November, MMXXVI.</p>'
            '</div>'
            '<div class="sm-act"><button type="button" class="btn-plate"><svg viewBox="-50 -50 100 100" aria-hidden="true"><use href="#mark"/></svg>Take your seat</button>%s</div>'
            '</div>') % (name, quiet)


def status_mark(kind):
    """The small marks of DESIGN.md section 8.7, as inline svg."""
    if kind == 'seated':
        return '<svg class="st st--em" viewBox="-1.8 -1.8 3.6 3.6" aria-hidden="true"><use href="#rune-l1"/></svg>'
    if kind == 'mask':
        return '<svg class="st st--mask" viewBox="-56 -6 112 162" aria-hidden="true"><use href="#mask-l1"/></svg>'
    if kind == 'mark':
        return '<svg class="st st--steel" viewBox="-50 -50 100 100" aria-hidden="true"><use href="#mark"/></svg>'
    return '<svg class="st st--steel" viewBox="-50 -50 100 100" aria-hidden="true"><g fill="none" stroke-width="7"><rect x="-36" y="-36" width="72" height="72"/><rect x="-20" y="-20" width="40" height="40"/></g></svg>'


def hall_frame(key):
    alt = ('The throne hall: a dark pier behind the throne with a slit of amber light, tall leaded windows of pale green and gold glass each side, '
           'a stepped dais with lit edges, and a ring of green runes burning in the floor')
    return ('<img class="fill hall-plate" src="%shall-%s-plate.jpg" alt="%s"><img class="fill hall-doom" src="%shall-%s-doom.webp" alt="">' % (A, key, alt, A, key))


# ------------------------------------------------------------ the summons plate (kept from v1; the sigil is now the canonical mask)
def plate_path(x0, y0, x1, y1, c):
    return P([(x0 + c, y0), (x1 - c, y0), (x1, y0 + c), (x1, y1 - c), (x1 - c, y1), (x0 + c, y1), (x0, y1 - c), (x0, y0 + c)])


def bolt(x, y, r=11):
    return ('<g transform="translate(%g,%g)"><circle r="%g" class="pl-bolt"/><circle r="%g" class="pl-bolt-ring"/>'
            '<rect x="%g" y="%g" width="%g" height="%g" transform="rotate(45)" class="pl-bolt-ring"/></g>' % (x, y, r, r * .72, -r * .3, -r * .3, r * .6, r * .6))


def _plate(W, H, m, uid, band=True, side=True, rs=20):
    x0, y0, x1, y1 = m[0], m[1], W - m[0], H - m[1]
    pp = plate_path(x0, y0, x1, y1, 30)
    o = []
    A_ = o.append
    A_('<rect width="%g" height="%g" fill="#060808"/>' % (W, H))
    A_('<ellipse cx="%g" cy="0" rx="%g" ry="%g" fill="#c9a24a" opacity=".1" filter="url(#blur-30)"/>' % (W / 2, W * .5, H * .2))
    A_('<path d="%s" fill="#000" opacity=".7" filter="url(#blur-12)" transform="translate(0,16)"/>' % pp)
    A_('<clipPath id="cp-%s"><path d="%s"/></clipPath>' % (uid, pp))
    A_('<path d="%s" fill="url(#g-plate)"/>' % pp)
    A_('<rect x="%g" y="%g" width="%g" height="%g" filter="url(#brushed)" opacity=".5" clip-path="url(#cp-%s)" style="mix-blend-mode:soft-light"/>'
       '<rect x="%g" y="%g" width="%g" height="%g" fill="url(#g-sheen)" clip-path="url(#cp-%s)"/>' % (x0, y0, x1 - x0, y1 - y0, uid, x0, y0, x1 - x0, y1 - y0, uid))
    A_('<path d="%s" fill="none" stroke="url(#g-bevel)" stroke-width="1.6"/>' % pp)
    i1 = 20; i2 = 20 + rs + 26
    A_('<path d="%s" class="pl-dots"/>' % plate_path(x0 + i1, y0 + i1, x1 - i1, y1 - i1, 22))
    A_('<path d="%s" class="pl-rule"/>' % plate_path(x0 + i2, y0 + i2, x1 - i2, y1 - i2, 10))
    by = i1 + 13
    if band:
        A_('<g class="pl-runes" filter="url(#engrave)">')
        A_(runes_fit(DOC1, rs, x0 + 110, x1 - 110, y0 + by))
        A_(runes_fit(DOC2, rs, x0 + 110, x1 - 110, y1 - by - rs))
        if side:
            A_(runes_v(DOC3, rs, x0 + by, y0 + (y1 - y0) * .36, y0 + (y1 - y0) * .64, flip=True))
            A_(runes_v(DOC4, rs, x1 - by - rs, y0 + (y1 - y0) * .36, y0 + (y1 - y0) * .64))
        A_('</g>')
    c = i1 + 13 + rs / 2
    for bx, byy in ((x0 + c + 14, y0 + c + 14), (x1 - c - 14, y0 + c + 14), (x0 + c + 14, y1 - c - 14), (x1 - c - 14, y1 - c - 14)):
        A_(bolt(bx, byy, 10))
    return ''.join(o)


def summons_desktop(uid='sd'):
    o = [_plate(1200, 900, (36, 36), uid)]
    A_ = o.append
    # the canonical mask, level 2, where version 1 had a six-sided sketch
    A_('<g transform="translate(302,116) scale(1.08)" class="pl-sigil"><g transform="translate(0,0)"><use href="#mask-l2"/></g></g>')
    A_('<circle cx="302" cy="478" r="160" fill="#1f8f63" opacity=".13" filter="url(#blur-30)"/>')
    A_('<g transform="translate(302,478) scale(.66)" filter="url(#lit)"><use href="#seal-active"/></g>')
    A_('<g class="pl-cap">%s</g>' % runes('latveria', 15, 302, 640, anchor='middle'))
    A_('<text x="302" y="700" text-anchor="middle" class="pl-caption">Given at Castle Doom, in Doomstadt,</text>')
    A_('<text x="302" y="726" text-anchor="middle" class="pl-caption">the fifteenth day of November, MMXXVI</text>')
    A_('<path d="M500,150 L500,750" class="pl-dots"/>')
    return svg('0 0 1200 900', ''.join(o))


def summons_phone(uid='sp'):
    o = [_plate(780, 1688, (26, 30), uid, rs=17)]
    A_ = o.append
    A_('<circle cx="390" cy="238" r="120" fill="#1f8f63" opacity=".13" filter="url(#blur-30)"/>')
    A_('<g transform="translate(390,238) scale(.5)" filter="url(#lit)"><use href="#seal-active"/></g>')
    A_('<path d="M150,372 L630,372" class="pl-dots"/>')
    return svg('0 0 780 1688', ''.join(o))


# ------------------------------------------------------------ doomscript (kept from v1)
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


def steel_bg(w=400, h=300):
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
    b += '<path d="%s" class="pl-dots" style="stroke-width:5;stroke-dasharray:0 16"/>' % plate_path(92, 92, 900, 700, 34)
    b += '<path d="%s" class="pl-rule" style="stroke-width:1.6"/>' % plate_path(190, 190, 900, 700, 16)
    b += '<g class="pl-runes" filter="url(#engrave)">%s%s</g>' % (runes('there is no pro', 44, 236, 120, gap=.5), runes_v('justice', 44, 118, 250, 640, flip=True))
    b += bolt(152, 152, 22)
    return tile(b, '0 0 600 450')


def ds_mechanism():
    b = '<rect width="600" height="450" fill="#0a0d0c"/>'
    for st, tx, turn in (('dormant', 101, (38, -24, 61)), ('waking', 300, (14, -9, 22)), ('active', 499, (0, 0, 0))):
        f = ' filter="url(#lit)"' if st == 'active' else ''
        b += '<g transform="translate(%g,186) scale(.49)"%s>%s</g>' % (tx, f, seal(st, turn=turn))
    b += '<path d="M104,326 L496,326" class="pl-rule"/><g class="mech-pin"><circle cx="104" cy="326" r="5"/><circle cx="300" cy="326" r="5"/><circle cx="496" cy="326" r="5"/></g>'
    b += '<text x="104" y="374" text-anchor="middle" class="tile-label">Dormant</text><text x="300" y="374" text-anchor="middle" class="tile-label">Waking</text><text x="496" y="374" text-anchor="middle" class="tile-label">Locked, lit</text>'
    return tile(b, '0 0 600 450')


def mat(kind):
    if kind == 'steel':
        b = steel_bg()
    elif kind == 'engraved':
        b = steel_bg() + '<g class="pl-runes" filter="url(#engrave)">%s</g><path d="M40,222 L360,222" class="pl-dots"/>' % runes('doom', 70, 200, 96, anchor='middle')
    elif kind == 'gold':
        b = ('<rect width="400" height="300" fill="url(#g-gold)"/><rect width="400" height="300" filter="url(#brushed)" opacity=".5" style="mix-blend-mode:soft-light"/>'
             '<rect width="400" height="300" fill="url(#g-sheen)"/><g transform="translate(200,150) scale(1.5)" stroke="#5a4520" opacity=".8">%s</g>' % insignia(60, 2))
    return tile(b)


# ------------------------------------------------------------ mask and rune sheets
def mask_master_svg():
    return ('<svg class="art mm" viewBox="-64 -10 150 170" role="img" aria-label="Measured outlines of the mask with the centre line and landmark levels">%s</svg>'
            % IC.mask_master())


def mask_l1_svg(px, cls=''):
    return '<svg class="art m1 %s" viewBox="-56 -6 112 162" style="height:%dpx" aria-hidden="true"><use href="#mask-l1"/></svg>' % (cls, px)


def mask_l2_svg(cls='', plain=False):
    return '<svg class="art m2 %s" viewBox="-56 -6 112 162" aria-hidden="true"><use href="#mask-l2%s"/></svg>' % (cls, '-plain' if plain else '')


def rune_master_svg():
    return ('<svg class="art mm" viewBox="-1.9 -1.9 3.8 3.8" role="img" aria-label="The suit rune as read from the two views; the top bracket is dashed because only one view shows it">%s</svg>'
            % IC.rune_master())


def rune_l1_svg(px):
    return '<svg class="art r1" viewBox="-1.8 -1.8 3.6 3.6" style="height:%dpx;width:%dpx" aria-hidden="true"><use href="#rune-l1"/></svg>' % (px, px)


def rune_l2_svg(cls=''):
    return '<svg class="art r2 %s" viewBox="-1.8 -1.8 3.6 3.6" aria-hidden="true"><use href="#rune-l2"/></svg>' % cls


def lib(kind):
    """One cell of the iconography library, 100-unit box."""
    if kind == 'mask1':
        b = '<g transform="translate(50,50) scale(.56) translate(0,-75)" class="lib-steel-fill"><use href="#mask-l1"/></g>'
    elif kind == 'mask2':
        b = '<g transform="translate(50,50) scale(.56) translate(0,-75)" class="lib-gold"><use href="#mask-l2-plain"/></g>'
    elif kind == 'rune1':
        b = '<g transform="translate(50,50) scale(25)" class="lib-steel"><use href="#rune-l1"/></g>'
    elif kind == 'rune2':
        b = '<g transform="translate(50,50) scale(25)" class="lib-em"><use href="#rune-l2"/></g>'
    elif kind == 'horned':
        b = '<g transform="translate(50,8) scale(.84)" class="lib-olive"><use href="#horned"/></g>'
    elif kind == 'tile':
        b = '<g transform="translate(50,50)" class="lib-steel" fill="none" stroke-width="3.2"><rect x="-36" y="-36" width="72" height="72"/><rect x="-22" y="-22" width="44" height="44"/><rect x="-13" y="-13" width="26" height="26" transform="rotate(45)"/></g>'
    elif kind == 'clasp-star':
        rays_ = ''.join('<path d="M0,0L%.1f,%.1f"/>' % ((30 if i % 2 == 0 else 19) * math.cos(math.pi * i / 8), (30 if i % 2 == 0 else 19) * math.sin(math.pi * i / 8)) for i in range(16))
        b = '<g transform="translate(50,50)" class="lib-steel" fill="none" stroke-width="2.6"><circle r="40"/><circle r="34" stroke-width="1.4"/>%s</g>' % rays_
    elif kind == 'clasp-knot':
        b = '<g transform="translate(50,50)" class="lib-steel" fill="none" stroke-width="2.8"><circle r="40"/><rect x="-19" y="-19" width="38" height="38"/><rect x="-19" y="-19" width="38" height="38" transform="rotate(45)"/><rect x="-9" y="-9" width="18" height="18"/></g>'
    elif kind == 'seal':
        b = '<g transform="translate(50,50) scale(.235)"><use href="#seal-active"/></g>'
    elif kind == 'mark':
        b = '<g transform="translate(50,50) scale(.86)" class="lib-em-stroke"><use href="#mark"/></g>'
    elif kind == 'square':
        b = '<g transform="translate(50,50) scale(.44)" class="lib-em-stroke">%s</g>' % insignia(88, 5)
    elif kind == 'runeword':
        b = '<g class="lib-em-fill">%s</g>' % runes('doom', 22, 50, 39, anchor='middle')
    elif kind == 'dots':
        b = '<path d="M14,34 L86,34 M14,66 L86,66" class="pl-dots" style="stroke-width:4;stroke-dasharray:0 9"/><path d="M14,50 L86,50" class="pl-rule" style="stroke-width:1.4"/>'
    elif kind == 'bolt':
        b = bolt(50, 50, 26)
    return '<svg class="art lib-ic" viewBox="0 0 100 100" aria-hidden="true">%s</svg>' % b
