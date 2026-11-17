"""Synthesise the score (Score A, approved 17 November 2026) and the claim and decree sounds.

Score A is a restrained drone with no melody, in A with a darkening flattened second:
  score-foundation  the low drone (A and E), bowed metal swelling, the B flat once
  score-hall        the hall's air and a few high glass tones
  score-crown       low brass swells, for the decree
Each stem is exactly LOOP seconds and loops seamlessly; src/lib/score.ts layers them by
stage. The one-shots reuse make-sounds.py's helpers:
  claim             a mantle claimed: the detent, then a short low resonance on A (provisional)
  decree            the decree: a heavy low close, a struck plate ringing on A (provisional)

All synthesised from noise and sine waves: no recordings, nothing to license. The review
prototype this came from is design/explorations/creative-refinement-1/source/make_score.py.

Usage: python web/scripts/make-score.py <folder for .wav files>
Then encode with web/scripts/encode-sounds.sh.
"""
import importlib.util
import os
import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("ms", os.path.join(HERE, "make-sounds.py"))
ms = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ms)
RATE = ms.RATE

LOOP = 64.0  # seconds; every stem is exactly this long
A1, E2, BB2, A2, E3, A3, BB3 = 55.0, 82.407, 116.541, 110.0, 164.814, 220.0, 233.082



def tt(seconds):
    return np.arange(int(round(seconds * RATE))) / RATE


def lfo(x, cycles, phase=0.0):
    """A slow sine that completes a whole number of cycles in one loop, so it loops."""
    return np.sin(2 * np.pi * cycles * x / LOOP + phase)


def tone(freq, x, partials=12, tilt=1.3, detune=0.06, seed=0):
    """A bowed or blown harmonic tone: two slightly detuned stacks, beating very slowly."""
    rng = np.random.default_rng(seed)
    out = np.zeros_like(x)
    for d in (-detune, detune):
        for n in range(1, partials + 1):
            out += np.sin(2 * np.pi * (freq + d) * n * x + rng.uniform(0, 2 * np.pi)) / n**tilt
    return out


def swell(x, start, length, attack, release):
    """A slow rise and fall inside [start, start + length]."""
    env = np.zeros_like(x)
    a, r = attack, release
    seg = (x >= start) & (x < start + length)
    u = x[seg] - start
    e = np.ones_like(u)
    e = np.where(u < a, (u / a) ** 1.6, e)
    e = np.where(u > length - r, np.clip((length - u) / r, 0, 1) ** 1.4, e)
    env[seg] = np.sin(e * np.pi / 2) ** 2
    return env


def tv_lowpass(x, cutoffs, block=4096):
    """A lowpass whose cutoff moves slowly (per block), for breathing timbre."""
    out = np.zeros_like(x)
    zi = None
    for i in range(0, x.size, block):
        c = float(np.mean(cutoffs[i : i + block]))
        sos = signal.butter(2, c, btype="lowpass", fs=RATE, output="sos")
        if zi is None:
            zi = signal.sosfilt_zi(sos) * x[0]
        out[i : i + block], zi = signal.sosfilt(sos, x[i : i + block], zi=zi)
    return out


def formant(x, centres=((520, 6), (1150, 8), (2400, 10)), levels=(1.0, 0.45, 0.15)):
    """Brass-like colour: the tone through a few broad resonances, plus the raw low end."""
    out = ms.lowpass(x, 380) * 0.8
    for (f, q), level in zip(centres, levels):
        b, a = signal.iirpeak(f, q, fs=RATE)
        out += level * signal.lfilter(b, a, x)
    return out


def reverb_ir(seconds, seed, damp=2400):
    rng = np.random.default_rng(seed)
    x = tt(seconds)
    ir = rng.standard_normal((2, x.size)) * np.exp(-x * 6.9 / seconds)
    ir = np.stack([ms.lowpass(ch, damp) for ch in ir])
    ir[:, : int(0.012 * RATE)] *= np.linspace(0, 1, int(0.012 * RATE))
    return ir / np.sqrt(np.sum(ir**2, axis=1, keepdims=True))


def reverb(mono_or_stereo, seconds=3.6, wet=0.35, seed=7, damp=2400):
    s = np.atleast_2d(mono_or_stereo)
    if s.shape[0] == 1:
        s = np.vstack([s, s])
    ir = reverb_ir(seconds, seed, damp)
    tail = np.stack([signal.fftconvolve(s[c], ir[c])[: s.shape[1]] for c in range(2)])
    return (1 - wet) * s + wet * tail * 2.2


def loopify(stereo, overlap=6.0):
    """Make a stem loop seamlessly: render LOOP + overlap seconds, fold the tail into the head."""
    n, o = int(LOOP * RATE), int(overlap * RATE)
    head, tail = stereo[:, :o], stereo[:, n : n + o]
    w = np.sin(np.linspace(0, np.pi / 2, o)) ** 2
    out = stereo[:, :n].copy()
    out[:, :o] = head * w + tail * (1 - w)
    return out


def pan(mono, p):
    """p in [-1, 1]; equal power."""
    a = (p + 1) * np.pi / 4
    return np.vstack([mono * np.cos(a), mono * np.sin(a)])


def peak(stereo, db):
    m = np.max(np.abs(stereo)) or 1.0
    return stereo / m * 10 ** (db / 20)


# ------------------------------------------------------------------ direction A

def foundation_a():
    x = tt(LOOP + 6)
    root = tone(A1, x, partials=18, tilt=1.0, detune=0.05, seed=1)
    middle = tone(A2, x, partials=10, tilt=1.2, detune=0.08, seed=4) * 0.45  # what a phone speaker plays
    fifth = tone(E2, x, partials=10, tilt=1.4, detune=0.04, seed=2) * 0.42
    colour = tone(BB2, x, partials=8, tilt=1.6, seed=3) * 0.16 * swell(x, 30, 22, 9, 10)  # the dark second, once
    sub = np.sin(2 * np.pi * A1 * x) * 0.3
    body = root + fifth + colour + middle
    # Open enough above 200 Hz to be heard on a phone speaker, which cannot play 55 Hz.
    cut = 650 + 260 * (0.5 + 0.5 * lfo(x, 2)) + 110 * (0.5 + 0.5 * lfo(x, 3, 1.1))
    body = tv_lowpass(body, cut)
    body *= 0.82 + 0.18 * (0.5 + 0.5 * lfo(x, 1, -1.2))
    # bowed metal: noise drawn across a bar's inharmonic modes, swelling twice a loop
    rng_seed = 11
    bow = ms.band(ms.noise(LOOP + 6, rng_seed), 80, 4000)
    metal = np.zeros_like(x)
    for ratio, q, lvl in ((1.0, 90, 1.0), (2.756, 120, 0.55), (5.404, 150, 0.3), (8.933, 170, 0.16)):
        metal += lvl * ms.resonator(bow, A2 * ratio, q)
    metal = metal / (np.max(np.abs(metal)) or 1) * (swell(x, 6, 20, 7, 9) + 0.7 * swell(x, 38, 22, 8, 10))
    mix = np.vstack([body + sub, body + sub]) * 1.0
    mix += pan(metal * 0.22, -0.35) + pan(np.roll(metal, int(0.013 * RATE)) * 0.18, 0.4)
    return peak(loopify(reverb(mix, 3.8, 0.32, seed=21)), -14)


def hall():
    """The hall's air: distant moving air and a few high glass tones, very quiet."""
    x = tt(LOOP + 6)
    white = ms.noise(LOOP + 6, 31)
    pink = signal.lfilter([0.049922035, -0.095993537, 0.050612699, -0.004408786],
                          [1, -2.494956002, 2.017265875, -0.522189400], white)
    air = ms.band(pink, 180, 2200) * (0.6 + 0.4 * (0.5 + 0.5 * lfo(x, 3, 0.4)))
    air = air / (np.max(np.abs(air)) or 1)
    glass = np.zeros((2, x.size))
    notes = ((A2 * 8, 4, 14, -0.6), (E3 * 8, 18, 16, 0.5), (A2 * 16, 30, 12, 0.2), (E3 * 4, 44, 15, -0.3))
    for f, start, length, p in notes:
        g = (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * (f * 1.0007) * x)) * swell(x, start, length, 5, 7)
        glass += pan(g, p)
    mix = np.vstack([air, np.roll(air, int(0.021 * RATE))]) * 0.55 + glass * 0.08
    return peak(loopify(reverb(mix, 4.5, 0.5, seed=33, damp=5000)), -24)


def crown_a():
    """Low brass swells: the open fifth, then once the dark second resolving down to A."""
    x = tt(LOOP + 6)
    out = np.zeros_like(x)
    for f, s, length, lvl, seed in ((A2, 2, 18, 1.0, 41), (E3, 4, 16, 0.6, 42), (A2, 26, 16, 0.9, 43),
                                    (BB2, 26, 7, 0.45, 44), (A3, 30, 11, 0.35, 45), (A2, 46, 14, 0.8, 46),
                                    (E3, 47, 12, 0.5, 47)):
        out += lvl * tone(f, x, partials=16, tilt=1.05, detune=0.12, seed=seed) * swell(x, s, length, 5.5, 6.5)
    out = formant(out)
    mix = np.vstack([out, np.roll(out, int(0.009 * RATE))])
    return peak(loopify(reverb(mix, 4.2, 0.4, seed=48)), -16)


# ------------------------------------------------------------------ one-shot proposals

def decree_sound():
    """A restrained decree: a heavy low close, then a struck plate ringing on A. About 2 s."""
    seconds = 2.2
    n = int(seconds * RATE)
    out = np.zeros(n)
    thud = 1.1 * ms.thud(seconds, A1, decay=4.5)
    out += thud
    out += 0.55 * ms.ring(seconds, [(A2, 1.0), (A2 * 2.756, 0.45), (A2 * 5.404, 0.22), (E3 * 2, 0.15)], decay=1.7, seed=91)
    out += 0.25 * ms.lowpass(ms.noise(seconds, 92), 300) * ms.envelope(n, 0.01, 1.2)
    return peak(reverb(ms.fade(out, 0.002, 0.3), 2.6, 0.3, seed=93), -4)


def claim_sound():
    """A mantle claimed: the existing detent, then a short low resonance on A. About 1.2 s."""
    seconds = 1.2
    n = int(seconds * RATE)
    out = np.zeros(n)
    d = ms.detent()
    out[: d.size] += d
    x = tt(seconds)
    res = tone(A2, x, partials=10, tilt=1.4, seed=95) * swell(x, 0.08, seconds - 0.08, 0.12, 0.9)
    out += 0.35 * formant(res)
    return peak(reverb(ms.fade(out, 0.002, 0.2), 1.8, 0.25, seed=96), -4)


def write(folder, name, data):
    data = np.asarray(data, dtype=np.float32)
    if data.ndim == 2:
        data = data.T
    wavfile.write(os.path.join(folder, f"{name}.wav"), RATE, data)
    print(f"{name:18s} {data.shape[0] / RATE:6.1f} s  peak {20 * np.log10(np.max(np.abs(data)) or 1e-9):6.1f} dBFS")


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    write(out, "score-foundation", foundation_a())
    write(out, "score-hall", hall())
    write(out, "score-crown", crown_a())
    write(out, "claim", claim_sound())
    write(out, "decree", decree_sound())


if __name__ == "__main__":
    main()
