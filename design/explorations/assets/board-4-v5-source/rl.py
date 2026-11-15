# Small procedural-rendering toolkit for the v2 concept artwork.
# numpy + scipy + Pillow. Everything it draws is generated; no photograph or studio asset is read.
import math
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi


# ---------------------------------------------------------------- curves
def catmull(pts, closed=False, n=10):
    """Dense polyline through pts (Catmull-Rom). A point (x, y, 1) is a sharp corner."""
    P = [(p[0], p[1]) for p in pts]
    sharp = [len(p) > 2 and p[2] for p in pts]
    N = len(P)
    out = []
    rng = range(N) if closed else range(N - 1)
    for i in rng:
        p1 = P[i]; p2 = P[(i + 1) % N]
        p0 = P[i - 1] if (closed or i > 0) else p1
        p3 = P[(i + 2) % N] if (closed or i + 2 < N) else p2
        if sharp[i]:
            p0 = p1
        if sharp[(i + 1) % N]:
            p3 = p2
        for k in range(n):
            t = k / n; t2 = t * t; t3 = t2 * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((x, y))
    if not closed:
        out.append(P[-1])
    return out


def bezier_path(pts, closed=False, prec=2):
    """SVG path through pts as cubic Beziers (Catmull-Rom), honouring sharp-corner flags."""
    P = [(p[0], p[1]) for p in pts]
    sharp = [len(p) > 2 and p[2] for p in pts]
    N = len(P)
    f = '%%.%df' % prec
    def s(v):
        t = (f % v).rstrip('0').rstrip('.')
        return t if t not in ('-0', '') else '0'
    d = ['M%s,%s' % (s(P[0][0]), s(P[0][1]))]
    rng = range(N) if closed else range(N - 1)
    for i in rng:
        p1 = P[i]; p2 = P[(i + 1) % N]
        p0 = P[i - 1] if (closed or i > 0) else p1
        p3 = P[(i + 2) % N] if (closed or i + 2 < N) else p2
        if sharp[i]:
            p0 = p1
        if sharp[(i + 1) % N]:
            p3 = p2
        if sharp[i] and sharp[(i + 1) % N]:
            d.append('L%s,%s' % (s(p2[0]), s(p2[1])))
            continue
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append('C%s,%s %s,%s %s,%s' % (s(c1[0]), s(c1[1]), s(c2[0]), s(c2[1]), s(p2[0]), s(p2[1])))
    if closed:
        d.append('Z')
    return ''.join(d)


# ---------------------------------------------------------------- rasterising
class Canvas:
    """Maps a user coordinate system onto a pixel grid and rasterises shapes into float masks."""

    def __init__(self, w, h, scale=1.0, ox=0.0, oy=0.0, ss=3):
        self.w, self.h, self.scale, self.ox, self.oy, self.ss = int(w), int(h), scale, ox, oy, ss

    def px(self, pts):
        s = self.scale * self.ss
        return [((p[0] * self.scale + self.ox) * self.ss, (p[1] * self.scale + self.oy) * self.ss) for p in pts]

    def _new(self):
        return Image.new('L', (self.w * self.ss, self.h * self.ss), 0)

    def _done(self, im):
        if self.ss > 1:
            im = im.resize((self.w, self.h), Image.LANCZOS)
        return np.asarray(im, dtype=np.float32) / 255.0

    def poly(self, pts, holes=()):
        im = self._new(); d = ImageDraw.Draw(im)
        d.polygon(self.px(pts), fill=255)
        for hpts in holes:
            d.polygon(self.px(hpts), fill=0)
        return self._done(im)

    def polys(self, list_of_pts):
        im = self._new(); d = ImageDraw.Draw(im)
        for pts in list_of_pts:
            d.polygon(self.px(pts), fill=255)
        return self._done(im)

    def line(self, pts, width, closed=False):
        im = self._new(); d = ImageDraw.Draw(im)
        q = self.px(pts)
        if closed:
            q = q + [q[0]]
        wpx = max(1, int(round(width * self.scale * self.ss)))
        d.line(q, fill=255, width=wpx, joint='curve')
        r = wpx / 2
        for x, y in (q[0], q[-1]):
            d.ellipse([x - r, y - r, x + r, y + r], fill=255)
        return self._done(im)

    def lines(self, list_of_pts, width):
        im = self._new(); d = ImageDraw.Draw(im)
        wpx = max(1, int(round(width * self.scale * self.ss)))
        for pts in list_of_pts:
            d.line(self.px(pts), fill=255, width=wpx, joint='curve')
        return self._done(im)

    def discs(self, centres, r):
        im = self._new(); d = ImageDraw.Draw(im)
        rp = r * self.scale * self.ss
        for c in self.px(centres):
            d.ellipse([c[0] - rp, c[1] - rp, c[0] + rp, c[1] + rp], fill=255)
        return self._done(im)

    def grid(self):
        """User-space x and y for every pixel centre."""
        ys, xs = np.mgrid[0:self.h, 0:self.w].astype(np.float32)
        return (xs + 0.5 - self.ox) / self.scale, (ys + 0.5 - self.oy) / self.scale


def blur(a, r):
    if r <= 0:
        return a
    return ndi.gaussian_filter(a, r, mode='nearest')


def smooth(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def bevel(mask, width):
    """0 at the edge of a mask rising to 1 at `width` px inside, with a rounded shoulder."""
    d = ndi.distance_transform_edt(mask > 0.5)
    t = np.clip(d / max(width, 1e-3), 0, 1)
    return np.sqrt(1 - (1 - t) ** 2).astype(np.float32)


def pillow(mask, radius):
    d = ndi.distance_transform_edt(mask > 0.5)
    t = np.clip(d / radius, 0, 1)
    return np.sqrt(1 - (1 - t) ** 2).astype(np.float32)


def edge_dist(mask):
    return ndi.distance_transform_edt(mask > 0.5).astype(np.float32)


# ---------------------------------------------------------------- noise
def vnoise(shape, cell, seed=0):
    """Smooth value noise with features about `cell` px across, range 0..1."""
    h, w = shape
    rng = np.random.default_rng(seed)
    gh, gw = max(2, int(h / cell) + 3), max(2, int(w / cell) + 3)
    g = rng.random((gh, gw)).astype(np.float32)
    z = ndi.zoom(g, (h / (gh - 2) + 0.0, w / (gw - 2) + 0.0), order=3, mode='reflect')
    z = z[:h, :w]
    if z.shape != (h, w):
        z = np.pad(z, ((0, h - z.shape[0]), (0, w - z.shape[1])), mode='edge')
    return np.clip(z, 0, 1)


def fbm(shape, cell, octaves=4, seed=0, gain=0.5):
    out = np.zeros(shape, np.float32); amp = 1.0; tot = 0
    for o in range(octaves):
        out += amp * vnoise(shape, max(1.5, cell / (2 ** o)), seed + o * 17)
        tot += amp; amp *= gain
    return out / tot


def white(shape, seed=0):
    return np.random.default_rng(seed).random(shape).astype(np.float32)


def scratches(shape, n, length, seed=0, angle=None, spread=math.pi, width=1):
    """Random short straight strokes, for worked-metal surfaces. Range 0..1."""
    h, w = shape
    rng = np.random.default_rng(seed)
    im = Image.new('L', (w, h), 0); d = ImageDraw.Draw(im)
    for _ in range(n):
        x, y = rng.random() * w, rng.random() * h
        a = (rng.random() - .5) * spread + (angle if angle is not None else rng.random() * math.pi)
        L = length * (0.3 + rng.random())
        d.line([x, y, x + math.cos(a) * L, y + math.sin(a) * L], fill=int(60 + rng.random() * 195), width=width)
    return np.asarray(im, dtype=np.float32) / 255.0


# ---------------------------------------------------------------- shading
def normals(h, zscale=1.0):
    gy, gx = np.gradient(h.astype(np.float32))
    nx, ny, nz = -gx * zscale, -gy * zscale, np.ones_like(h, dtype=np.float32)
    l = np.sqrt(nx * nx + ny * ny + nz * nz)
    return nx / l, ny / l, nz / l


def norm3(v):
    v = np.asarray(v, dtype=np.float32)
    return v / np.linalg.norm(v)


def lambert(n, L):
    L = norm3(L)
    return np.clip(n[0] * L[0] + n[1] * L[1] + n[2] * L[2], 0, 1)


def blinn(n, L, power):
    L = norm3(L); H = norm3(L + np.array([0, 0, 1], np.float32))
    return np.clip(n[0] * H[0] + n[1] * H[1] + n[2] * H[2], 0, 1) ** power


def reflect_view(n):
    """Reflection of the view vector (0,0,1) about the normal."""
    return 2 * n[2] * n[0], 2 * n[2] * n[1], 2 * n[2] * n[2] - 1


def ao(h, radius, strength):
    """Darken places that sit below their surroundings."""
    return np.clip(1 - strength * np.clip(blur(h, radius) - h, 0, None), 0, 1)


# ---------------------------------------------------------------- pixels
def rgb(hexstr):
    hexstr = hexstr.lstrip('#')
    return np.array([int(hexstr[i:i + 2], 16) / 255.0 for i in (0, 2, 4)], np.float32)


def lin(c):
    return np.asarray(c, np.float32) ** 2.2


def solid(shape, c):
    return np.broadcast_to(np.asarray(c, np.float32), shape + (3,)).copy()


def over(dst, src, a):
    """dst, src: HxWx3 ; a: HxW coverage."""
    return dst * (1 - a[..., None]) + src * a[..., None]


def add(dst, src, a=None):
    return dst + (src if a is None else src * a[..., None])


def screen(dst, src):
    return 1 - (1 - np.clip(dst, 0, 1)) * (1 - np.clip(src, 0, 1))


def tonemap(img, exposure=1.0, gamma=2.2, shoulder=True):
    x = np.clip(img * exposure, 0, None)
    if shoulder:
        x = x / (1 + x * 0.6) * 1.6          # soft roll-off so highlights bloom rather than clip
    return np.clip(x, 0, 1) ** (1 / gamma)


def to_image(img, alpha=None):
    a8 = (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)
    if alpha is None:
        return Image.fromarray(a8, 'RGB')
    al = (np.clip(alpha, 0, 1) * 255 + 0.5).astype(np.uint8)
    return Image.fromarray(np.dstack([a8, al]), 'RGBA')


def grain(img, amount=0.02, seed=1, size=1.0):
    h, w = img.shape[:2]
    n = white((h, w), seed) - 0.5
    if size > 1:
        n = blur(n, size * 0.5) * (1 + size)
    return img + n[..., None] * amount


def vignette(shape, strength=0.6, power=2.2, cx=0.5, cy=0.5):
    h, w = shape
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xs / w - cx) / 0.75) ** 2 + ((ys / h - cy) / 0.75) ** 2)
    return np.clip(1 - strength * np.clip(d, 0, 1.5) ** power, 0, 1)


def bloom(img, thresh=0.7, radius=18, amount=0.6):
    b = np.clip(img - thresh, 0, None)
    out = img.copy()
    for r, k in ((radius * 0.35, 0.5), (radius, 0.35), (radius * 3, 0.25)):
        out += amount * k * np.dstack([blur(b[..., i], r) for i in range(3)])
    return out


def rays(src, centre, steps=48, reach=0.9, decay=0.965):
    """Light shafts: smear a brightness map away from a point (the classic radial blur)."""
    h, w = src.shape
    small = Image.fromarray((np.clip(src, 0, 1) * 255).astype(np.uint8))
    sw, sh = max(8, w // 3), max(8, h // 3)
    small = small.resize((sw, sh), Image.BILINEAR)
    cx, cy = centre[0] / 3.0, centre[1] / 3.0
    acc = np.zeros((sh, sw), np.float32); wgt = 1.0; tot = 0.0
    for i in range(steps):
        s = 1 + reach * i / steps            # enlarge about the centre
        inv = 1 / s
        m = (inv, 0, cx - cx * inv, 0, inv, cy - cy * inv)
        t = small.transform((sw, sh), Image.AFFINE, m, resample=Image.BILINEAR)
        acc += wgt * np.asarray(t, np.float32) / 255.0
        tot += wgt; wgt *= decay
    acc /= tot
    out = Image.fromarray((np.clip(acc, 0, 1) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return blur(np.asarray(out, np.float32) / 255.0, 2.0)


def save(img, path, alpha=None, quality=88):
    im = to_image(img, alpha)
    if path.lower().endswith('.webp'):
        im.save(path, 'WEBP', quality=quality, method=6)
    elif path.lower().endswith(('.jpg', '.jpeg')):
        im.convert('RGB').save(path, 'JPEG', quality=quality, optimize=True, progressive=True)
    else:
        im.save(path, optimize=True)
    return path
