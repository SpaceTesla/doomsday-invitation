# Seated figure and the throne hall. Original generated geometry.
from art import head, clasp, seal, seal_mark, ring


def seated():
    """Doom on the throne, 240 x 300 box, seat line near y=250."""
    o = ['<g class="figure figure--seated">']
    o.append('<path class="fg-cloak" d="M70,104 L170,104 C196,120 210,160 214,240 L222,300 L18,300 L26,240 C30,160 44,120 70,104Z"/>')
    o.append('<path class="fg-steel-lo" d="M84,116 L156,116 L152,198 L88,198Z"/>')
    t = []
    for r in range(4):
        for c in range(4):
            x = 90 + c * 15.4; y = 132 + r * 15.4
            t.append('<rect x="%g" y="%g" width="13.6" height="13.6" class="fg-tile"/><rect x="%g" y="%g" width="6.6" height="6.6" class="fg-tile-in"/>' % (x, y, x + 3.5, y + 3.5))
    o.append(''.join(t))
    o.append('<rect x="86" y="194" width="68" height="12" class="fg-belt"/>')
    o.append('<path class="fg-tunic" d="M82,206 L158,206 L172,262 L68,262Z"/>')
    for sx in (1, -1):
        tr = 'translate(120 0) scale(%d 1) translate(-120 0)' % sx
        o.append('<g transform="%s"><path class="fg-cloak-hi" d="M72,106 C54,116 44,140 40,186 L66,186 C70,150 76,128 88,116Z"/>'
                 '<path class="fg-steel" d="M30,184 L68,184 L68,208 L30,208Z"/><path class="fg-steel-lo" d="M22,186 L40,184 L40,212 L22,210Z"/>'
                 '<path class="fg-steel" d="M76,236 L112,236 L112,264 L76,264Z"/><path class="fg-steel-lo" d="M80,264 L110,264 L108,300 L78,300Z"/>'
                 '<path class="fg-rim" d="M70,104 C44,120 30,160 26,240"/></g>' % tr)
    o.append('<path class="fg-chain" d="M88,124 Q120,140 152,124" style="stroke-width:2;stroke-dasharray:1 3.4"/>')
    o.append(clasp(80, 120, 10) + clasp(160, 120, 10))
    o.append('<g transform="translate(90,30) scale(.3)">%s</g>' % head())
    o.append('</g>')
    return ''.join(o)


def lancet(x0, x1, ytop, ybot):
    w = x1 - x0; ys = ytop + 0.866 * w; cx = (x0 + x1) / 2.0
    return 'M%g,%g L%g,%g A%g,%g 0 0 1 %g,%g A%g,%g 0 0 1 %g,%g L%g,%gZ' % (x0, ybot, x0, ys, w, w, cx, ytop, w, w, x1, ys, x1, ybot)


def window(x0, x1, ytop, ybot, bars=70):
    """A lancet of pale glass with two lights, an oculus and saddle bars."""
    w = x1 - x0; cx = (x0 + x1) / 2.0; ys = ytop + 0.866 * w
    o = ['<path class="hl-glass" d="%s"/>' % lancet(x0, x1, ytop, ybot)]
    o.append('<path class="hl-lead" d="%s %s"/>' % (lancet(x0, cx, ys - 0.1 * w, ybot), lancet(cx, x1, ys - 0.1 * w, ybot)))
    o.append('<circle class="hl-lead" cx="%g" cy="%g" r="%g"/>' % (cx, ytop + 0.52 * w, 0.17 * w))
    d = []
    y = ys + 0.5 * w
    while y < ybot - 10:
        d.append('M%g,%gL%g,%g' % (x0, y, x1, y)); y += bars
    o.append('<path class="hl-lead hl-lead--thin" d="%s"/>' % ''.join(d))
    o.append('<path class="hl-stone-line" d="%s"/>' % lancet(x0, x1, ytop, ybot))
    return ''.join(o)


def column(x, w, ybase, ytop=-30):
    """Clustered shaft on a plinth with a gilt line. x = left edge."""
    o = ['<rect class="hl-col" x="%g" y="%g" width="%g" height="%g"/>' % (x, ytop, w, ybase - ytop)]
    o.append('<rect class="hl-col-lit" x="%g" y="%g" width="%g" height="%g"/>' % (x, ytop, w, ybase - ytop))
    d = ''.join('M%g,%gL%g,%g' % (x + w * f, ytop, x + w * f, ybase) for f in (0.22, 0.5, 0.78))
    o.append('<path class="hl-col-line" d="%s"/>' % d)
    o.append('<rect class="hl-plinth" x="%g" y="%g" width="%g" height="%g"/>' % (x - w * .12, ybase - w * .34, w * 1.24, w * .34))
    o.append('<rect class="hl-gilt" x="%g" y="%g" width="%g" height="%g"/>' % (x - w * .12, ybase - w * .34, w * 1.24, max(1.2, w * .02)))
    return ''.join(o)


def hall():
    """Throne hall, 1600 x 1200. One-point perspective on (800, 700). The throne is empty;
    the seated figure is placed over it where a scene wants him."""
    o = []
    A = o.append
    A('<rect class="hl-wall" width="1600" height="1200"/>')
    A('<rect class="hl-apse" x="500" y="-40" width="600" height="760"/>')
    A('<g class="hl-glow" filter="url(#blur-30)"><path d="%s"/><path d="%s"/></g>' % (lancet(530, 654, 100, 640), lancet(946, 1070, 100, 640)))
    A(window(530, 654, 100, 640) + window(946, 1070, 100, 640))
    for sx in (1, -1):
        t = 'translate(800 0) scale(%d 1) translate(-800 0)' % sx
        A('<g transform="%s"><path class="hl-side" d="M0,-40 L500,-40 L500,720 L0,1200Z"/>'
          '<path class="hl-glass hl-glass--side" d="M236,40 L286,96 L286,770 L236,850Z M398,150 L428,178 L428,716 L398,748Z"/></g>' % t)
    A('<path class="hl-rib" d="M150,120 C300,-60 620,-150 800,-160 M1450,120 C1300,-60 980,-150 800,-160 M342,150 C460,10 660,-70 800,-80 M1258,150 C1140,10 940,-70 800,-80 M470,170 C560,70 700,10 800,0 M1130,170 C1040,70 900,10 800,0"/>')
    A('<path class="hl-floor" d="M0,1200 L500,720 L1100,720 L1600,1200Z"/>')
    d = []
    for xb in range(-1600, 3300, 200):
        d.append('M800,700L%g,1200' % xb)
    A('<path class="hl-joint" clip-path="url(#clip-floor)" d="%s"/>' % ''.join(d))
    d = []
    y = 724.0; step = 6.0
    while y < 1200:
        d.append('M0,%gL1600,%g' % (y, y)); step *= 1.42; y += step
    A('<path class="hl-joint" clip-path="url(#clip-floor)" d="%s"/>' % ''.join(d))
    A('<g clip-path="url(#clip-floor)"><g filter="url(#blur-12)"><rect class="hl-refl" x="542" y="720" width="100" height="480"/><rect class="hl-refl" x="958" y="720" width="100" height="480"/></g></g>')
    A('<circle class="hl-rose-stone" cx="800" cy="232" r="138"/>')
    A('<circle class="hl-rose-glow" cx="800" cy="232" r="150" filter="url(#blur-30)"/>')
    A('<g transform="translate(800,232) scale(.62)" class="hl-rose">%s</g>' % seal('active'))
    for i in reversed(range(7)):
        hw = 176 + i * 40; y = 648 + i * 15
        A('<path class="hl-step" d="M%g,%g L%g,%g L%g,%g L%g,%gZ"/>' % (800 - hw, y, 800 + hw, y, 800 + hw + 12, y + 16, 800 - hw - 12, y + 16))
        A('<path class="hl-gilt-line" d="M%g,%gL%g,%g"/>' % (800 - hw, y, 800 + hw, y))
    A('<path class="hl-throne" d="M800,292 L866,384 L866,650 L734,650 L734,384Z"/>')
    A('<path class="hl-throne-side" d="M700,424 L734,384 L734,650 L700,650Z M900,424 L866,384 L866,650 L900,650Z"/>')
    A('<path class="hl-throne-side" d="M668,552 L722,552 L722,650 L668,650Z M878,552 L932,552 L932,650 L878,650Z"/>')
    A('<rect class="hl-throne" x="722" y="600" width="156" height="50"/>')
    A('<path class="hl-gilt-line" d="M800,292 L866,384 L866,600 M800,292 L734,384 L734,600 M668,552 L722,552 M878,552 L932,552 M700,424 L700,552 M900,424 L900,552 M668,552 L668,650 M932,552 L932,650"/>')
    A('<g transform="translate(800,392) scale(.4)" class="hl-throne-mark">%s</g>' % seal_mark(7))
    for x, w, yb in ((440, 58, 792), (300, 84, 934), (96, 124, 1140)):
        A(column(x, w, yb) + column(1600 - x - w, w, yb))
    A('<g transform="translate(800,900) scale(1,.2)" class="hl-floor-ring"><g fill="none"><circle r="352" stroke-width="2"/><circle r="296" stroke-width="2"/></g>%s</g>'
      % ring('there is no promise of tomorro . ', 324, 36))
    A('<g class="hl-shaft" filter="url(#blur-20)"><path d="M236,40 L286,96 L1080,1010 L820,1160Z"/><path d="M398,150 L428,178 L1010,820 L850,900Z" opacity=".7"/>'
      '<path d="M1364,40 L1314,96 L760,1040 L1010,1180Z" opacity=".45"/></g>')
    A('<ellipse class="hl-pool" cx="800" cy="690" rx="330" ry="70" filter="url(#blur-30)"/>')
    A('<rect class="hl-haze" width="1600" height="1200"/>')
    A('<rect class="hl-vignette" width="1600" height="1200"/>')
    return ''.join(o)
