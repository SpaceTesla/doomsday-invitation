"""Synthesise the site's sounds. Every sound is generated here from noise and sine waves:
no recording, no sample library, no licence to track. Fixed seeds make it reproducible.

design/DESIGN.md, section 6.8 (moments) and its limits: nothing before the guest's first
action, no music, no voice, every sound under two seconds except the hum and the room.

  seal-turn    0.9 s   the seal's iris between scenes: bands turning, a soft stop
  plate-part   1.2 s   the summons plate parting on its seam: steel sliding on steel
  plate-close  0.8 s   the halves meeting: a short slide and a heavy close
  detent       0.35 s  a band of the seal locking into register
  rune-tick    0.08 s  a rune lighting: a dry metal tick
  hum          2.2 s   the low electrical hum that rises as the runes light
  hall-room    60 s    the throne hall: a large quiet room, distant wind (seamless loop)

Usage: python web/scripts/make-sounds.py <folder for .wav files>
Then encode with web/scripts/encode-sounds.sh (WebM/Opus and MP3, into public/audio).
"""
import os
import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

RATE = 48_000


def t(seconds):
    return np.arange(int(seconds * RATE)) / RATE


def noise(seconds, seed):
    return np.random.default_rng(seed).standard_normal(int(seconds * RATE))


def band(x, low, high, order=4):
    sos = signal.butter(order, [low, high], btype="bandpass", fs=RATE, output="sos")
    return signal.sosfilt(sos, x)


def lowpass(x, cutoff, order=4):
    return signal.sosfilt(signal.butter(order, cutoff, btype="lowpass", fs=RATE, output="sos"), x)


def highpass(x, cutoff, order=2):
    return signal.sosfilt(signal.butter(order, cutoff, btype="highpass", fs=RATE, output="sos"), x)


def resonator(x, freq, q):
    """A metallic partial: a narrow band-pass that rings at freq."""
    b, a = signal.iirpeak(freq, q, fs=RATE)
    return signal.lfilter(b, a, x)


def envelope(n, attack, release, curve=3.0):
    """Linear-in, exponential-out envelope over n samples."""
    env = np.ones(n)
    a = max(1, int(attack * RATE))
    r = max(1, int(release * RATE))
    env[:a] = np.linspace(0, 1, a)
    env[-r:] *= np.exp(-curve * np.linspace(0, 1, r)) * np.linspace(1, 0, r) ** 0.3
    return env


def ring(seconds, partials, decay, seed=0):
    """A struck metal body: decaying sine partials, slightly inharmonic, with a click."""
    x = t(seconds)
    out = np.zeros_like(x)
    rng = np.random.default_rng(seed)
    for i, (freq, level) in enumerate(partials):
        phase = rng.uniform(0, 2 * np.pi)
        out += level * np.sin(2 * np.pi * freq * x + phase) * np.exp(-x * decay * (1 + 0.6 * i))
    click = band(noise(0.004, seed + 9), 2000, 9000) * np.linspace(1, 0, int(0.004 * RATE))
    out[: click.size] += 0.6 * click
    return out


def thud(seconds, freq, decay):
    """A heavy low impact: a falling sine with a fast decay."""
    x = t(seconds)
    sweep = freq * (1 + 0.8 * np.exp(-x * 40))
    return np.sin(2 * np.pi * np.cumsum(sweep) / RATE) * np.exp(-x * decay)


def normalise(x, peak_db):
    x = x - np.mean(x)
    peak = np.max(np.abs(x)) or 1.0
    return x / peak * 10 ** (peak_db / 20)


def fade(x, fade_in=0.004, fade_out=0.02):
    x = x.copy()
    i, o = int(fade_in * RATE), int(fade_out * RATE)
    x[:i] *= np.linspace(0, 1, i)
    x[-o:] *= np.linspace(1, 0, o)
    return x


# ------------------------------------------------------------------ the sounds

def rune_tick():
    # A dry metal tick: two high partials that die in about 25 ms, and a tiny click.
    return fade(normalise(ring(0.08, [(3150, 1.0), (5170, 0.55), (7420, 0.25)], decay=140, seed=11), -6), 0.001, 0.01)


def detent():
    # A band locking: a click, a short mid thunk, a brief ring of the frame.
    n = int(0.35 * RATE)
    out = np.zeros(n)
    click = band(noise(0.012, 21), 1500, 7000) * np.exp(-np.linspace(0, 8, int(0.012 * RATE)))
    out[: click.size] += 0.8 * click
    knock = thud(0.35, 118, decay=26)
    out += 0.9 * knock
    out += 0.35 * ring(0.35, [(640, 1.0), (1510, 0.5), (2380, 0.3)], decay=22, seed=22)
    return fade(normalise(out, -4))


def seal_turn():
    # Bands turning: a low grinding bed, ratchet clicks that slow down, a soft stop.
    seconds = 0.9
    n = int(seconds * RATE)
    bed = band(noise(seconds, 31), 70, 420) * envelope(n, 0.12, 0.35)
    bed += 0.4 * resonator(band(noise(seconds, 32), 300, 2000), 880, 40) * envelope(n, 0.1, 0.4)
    out = 0.7 * bed / (np.max(np.abs(bed)) or 1)
    tick = ring(0.03, [(2300, 1.0), (3900, 0.4)], decay=180, seed=33)
    times = np.cumsum(np.linspace(0.035, 0.085, 11))  # the ratchet slows as it nears register
    for k, at in enumerate(times):
        i = int((0.05 + at) * RATE)
        if i + tick.size < n:
            out[i : i + tick.size] += (0.5 - 0.025 * k) * tick
    stop = 0.6 * thud(0.25, 96, decay=30)
    i = int(0.66 * RATE)
    out[i : i + stop.size] += stop[: n - i]
    return fade(normalise(out, -5), 0.01, 0.12)


def slide(seconds, seed, start=1700, end=2600):
    """Steel sliding on steel: noise through drifting metallic resonances."""
    n = int(seconds * RATE)
    src = band(noise(seconds, seed), 400, 9000)
    sweep = np.linspace(start, end, n)
    out = np.zeros(n)
    block = 2048
    for i in range(0, n, block):  # step the resonance along the sweep
        f = sweep[min(i + block // 2, n - 1)]
        seg = src[max(0, i - 4096) : i + block]
        for mult, q, lvl in ((1.0, 18, 1.0), (1.62, 22, 0.6), (2.43, 26, 0.35)):
            res = resonator(seg, f * mult, q)[-min(block, n - i) :]
            out[i : i + res.size] += lvl * res
    air = lowpass(noise(seconds, seed + 1), 600)
    return out / (np.max(np.abs(out)) or 1) + 0.5 * air / (np.max(np.abs(air)) or 1)


def plate_part():
    seconds = 1.2
    n = int(seconds * RATE)
    out = slide(seconds, 41) * envelope(n, 0.25, 0.45)
    # A low draw of air as the gap opens.
    draw = lowpass(noise(seconds, 43), 220) * envelope(n, 0.5, 0.5)
    out += 0.8 * draw / (np.max(np.abs(draw)) or 1)
    return fade(normalise(out, -6), 0.02, 0.15)


def plate_close():
    seconds = 0.8
    n = int(seconds * RATE)
    out = 0.6 * slide(0.55, 51, 2600, 1900)
    out = np.pad(out * envelope(out.size, 0.06, 0.08), (0, n - out.size))
    i = int(0.52 * RATE)
    hit = 1.2 * thud(seconds - 0.52, 62, decay=11) + 0.5 * ring(seconds - 0.52, [(342, 1.0), (871, 0.55), (1534, 0.3)], decay=9, seed=52)
    out[i : i + hit.size] += hit
    return fade(normalise(out, -3), 0.01, 0.08)


def hum():
    # A low electrical hum, swelling as the runes light, then gone. 55 Hz and its odd
    # harmonics, brightening a little as it rises.
    seconds = 2.2
    x = t(seconds)
    rise = np.clip(x / 1.6, 0, 1) ** 1.5
    tone = np.zeros_like(x)
    for h, lvl in ((1, 1.0), (2, 0.35), (3, 0.5), (5, 0.25), (7, 0.12)):
        tone += lvl * (0.4 + 0.6 * rise) ** (h / 3) * np.sin(2 * np.pi * 55 * h * x)
    buzz = highpass(band(noise(seconds, 61), 900, 2600), 900) * 0.05 * rise
    env = envelope(x.size, 0.3, 0.6, curve=2)
    return fade(normalise((tone + buzz) * (0.25 + 0.75 * rise) * env, -9), 0.05, 0.3)


def hall_room():
    # The throne hall: a large quiet room. Pink-ish noise, low-passed, with slow gusts of
    # distant wind; made seamless by crossfading its end into its start.
    seconds, overlap = 60.0, 4.0
    total = seconds + overlap
    white = noise(total, 71)
    pink = signal.lfilter([0.049922035, -0.095993537, 0.050612699, -0.004408786],
                          [1, -2.494956002, 2.017265875, -0.522189400], white)
    bed = lowpass(pink, 700)
    gust_lfo = lowpass(noise(total, 72), 0.25, order=2)
    gust_lfo = 0.55 + 0.45 * gust_lfo / (np.max(np.abs(gust_lfo)) or 1)
    wind = band(pink, 250, 1400) * gust_lfo
    rumble = lowpass(noise(total, 73), 60)
    room = bed / np.max(np.abs(bed)) + 0.6 * wind / np.max(np.abs(wind)) + 0.4 * rumble / np.max(np.abs(rumble))
    n, o = int(seconds * RATE), int(overlap * RATE)
    head, tail = room[:o], room[n : n + o]
    w = np.sin(np.linspace(0, np.pi / 2, o)) ** 2
    loop = room[:n].copy()
    loop[:o] = head * w + tail * (1 - w)
    return normalise(loop, -18)


SOUNDS = {
    "rune-tick": rune_tick,
    "detent": detent,
    "seal-turn": seal_turn,
    "plate-part": plate_part,
    "plate-close": plate_close,
    "hum": hum,
    "hall-room": hall_room,
}


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for name, make in SOUNDS.items():
        data = make().astype(np.float32)
        wavfile.write(os.path.join(out, f"{name}.wav"), RATE, data)
        print(f"{name:12s} {data.size / RATE:5.2f} s  peak {20 * np.log10(np.max(np.abs(data))):6.1f} dBFS")


if __name__ == "__main__":
    main()
