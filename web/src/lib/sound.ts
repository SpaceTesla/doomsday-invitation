"use client";

// Sound (design/DESIGN.md, sections 6.8, 6.9 and 6.12). A small Web Audio engine: the
// one-shots, and the score as layers that share one clock. Rules it keeps:
//
// - Nothing loads or plays before the guest chooses sound. The choice ("Go with him", or
//   the sound control) is a press, and that press unlocks the audio engine.
// - A one-shot asked for while its file is still loading plays as soon as the file is
//   ready, unless it has become stale (LATE_PLAY_MS), so the first scene change is heard.
// - Silent mode loses nothing: every call here is a no-op while sound is off, and no
//   animation or information waits on a sound. SOUND OFF stops music and effects at once.
// - The choice lasts for the visit (session storage). Sound never turns itself on.
// - Everything fades out when the tab is hidden, and the score returns when it is shown.
// - The score never restarts between scenes: stages only change which layers are heard.
import { rememberSound, soundChosen } from "@/scenes/sound-choice";
import {
  FADES,
  LATE_PLAY_MS,
  LAYERS,
  LOAD_ORDER,
  LOOP,
  LOOP_CROSSFADE,
  ONE_SHOTS,
  STAGES,
  type Layer,
  type OneShot,
  type ScoreStage,
} from "./score";

export type { OneShot as SoundName, ScoreStage } from "./score";

let enabled = false;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;
let music: GainNode | null = null;
const buffers = new Map<string, Promise<AudioBuffer | null>>();
const ready = new Map<string, AudioBuffer>();
const listeners = new Set<(on: boolean) => void>();

// ------------------------------------------------------------------ engine

function extension(): "webm" | "mp3" {
  if (typeof document === "undefined") return "mp3";
  const probe = document.createElement("audio");
  return probe.canPlayType('audio/webm; codecs="opus"') ? "webm" : "mp3";
}

/** Create the engine, or wake it. Called from the guest's press when possible. */
function engine(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    sfx = ctx.createGain();
    music = ctx.createGain();
    sfx.connect(master);
    music.connect(master);
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended" && !document.hidden && enabled) {
    void ctx
      .resume()
      .then(applyScore)
      .catch(() => null);
  }
  return ctx;
}

/** iOS needs a sound started inside the press itself; a silent sample is enough. */
function unlock(context: AudioContext) {
  const source = context.createBufferSource();
  source.buffer = context.createBuffer(1, 1, context.sampleRate);
  source.connect(context.destination);
  source.start(0);
}

/** A press anywhere resumes an engine that was created without one (a reload with sound on). */
function resumeOnPress() {
  const resume = () => {
    if (ctx && enabled && ctx.state !== "running")
      void ctx
        .resume()
        .then(applyScore)
        .catch(() => null);
  };
  for (const type of ["pointerdown", "keydown", "touchend"]) {
    window.addEventListener(type, resume, { passive: true });
  }
}

function load(name: string): Promise<AudioBuffer | null> {
  const cached = buffers.get(name);
  if (cached) return cached;
  const context = engine();
  const promise = context
    ? fetch(`/audio/${name}.${extension()}`)
        .then((response) =>
          response.ok ? response.arrayBuffer() : Promise.reject(response.status),
        )
        .then((data) => context.decodeAudioData(data))
        .then((buffer) => {
          ready.set(name, buffer);
          return buffer;
        })
        .catch(() => null)
    : Promise.resolve(null);
  buffers.set(name, promise);
  return promise;
}

/** One-shots first, in the order they are first needed; then the score's layers. */
function loadAll() {
  void LOAD_ORDER.reduce<Promise<unknown>>(
    (previous, name) => previous.then(() => load(name)),
    Promise.resolve(),
  ).then(() => {
    for (const layer of STAGES[wanted]) void load(LAYERS[layer].file).then(applyScore);
  });
  // The first one-shot does not wait for the queue.
  void load(LOAD_ORDER[0]);
}

// ------------------------------------------------------------------ the choice

/** Read the guest's choice for this visit. Loads nothing unless it is on. */
export function initSound(): void {
  enabled = soundChosen();
  if (enabled) {
    engine();
    resumeOnPress();
    loadAll();
  }
  listeners.forEach((listener) => listener(enabled));
}

export function soundOn(): boolean {
  return enabled;
}

/** The guest's choice. It is a press, so the engine is unlocked here. */
export function setSound(on: boolean): void {
  enabled = on;
  rememberSound(on);
  if (on) {
    const context = engine();
    if (context) {
      unlock(context);
      master?.gain.cancelScheduledValues(context.currentTime);
      master?.gain.setValueAtTime(1, context.currentTime);
      loadAll();
      applyScore();
    }
  } else {
    silenceEverything();
  }
  listeners.forEach((listener) => listener(on));
}

export function onSoundChange(listener: (on: boolean) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Stop every sound at once, music and effects (SOUND OFF). */
function silenceEverything() {
  if (!ctx || !master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + 0.12);
  window.setTimeout(() => {
    if (enabled) return;
    stopScore();
    stopOneShots();
    void ctx?.suspend().catch(() => null);
  }, 180);
}

// ------------------------------------------------------------------ one-shots

const playing = new Set<AudioBufferSourceNode>();

function stopOneShots() {
  for (const source of playing) {
    try {
      source.stop();
    } catch {
      // already stopped
    }
  }
  playing.clear();
}

function start(
  name: OneShot,
  buffer: AudioBuffer,
  options: { rate?: number; volume?: number },
  when = 0,
) {
  if (!ctx || !sfx || !enabled) return;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  if (options.rate) source.playbackRate.value = options.rate;
  const gain = ctx.createGain();
  gain.gain.value = ONE_SHOTS[name] * (options.volume ?? 1);
  source.connect(gain).connect(sfx);
  source.onended = () => playing.delete(source);
  playing.add(source);
  source.start(when);
}

/**
 * Play a one-shot. A no-op while sound is off. If its file is still loading, it plays
 * when ready, unless more than LATE_PLAY_MS have passed by then.
 * `delay` (seconds) schedules it on the audio clock, so a run of them stays exactly spaced.
 */
export function play(
  name: OneShot,
  options: { rate?: number; volume?: number; delay?: number } = {},
): void {
  if (!enabled) return;
  const context = engine();
  if (!context) return;
  const buffer = ready.get(name);
  const at = context.currentTime + (options.delay ?? 0);
  if (buffer) {
    start(name, buffer, options, at);
    return;
  }
  const asked = performance.now();
  void load(name).then((loaded) => {
    if (!loaded || !enabled) return;
    const late = performance.now() - asked;
    if (late > LATE_PLAY_MS + (options.delay ?? 0) * 1000) return;
    start(name, loaded, options, Math.max(context.currentTime, at));
  });
}

// ------------------------------------------------------------------ the score

let wanted: ScoreStage = "silent";
let decree = false;
let stageFloor: ScoreStage = "silent";
let clockStart = 0; // audio time when copy 0 of every layer starts
let running = false;
let stopTimer: number | null = null;
let scheduleTimer: number | null = null;
const layerGain = new Map<Layer, GainNode>();
const layerSources = new Map<Layer, AudioBufferSourceNode[]>();
const nextCopy = new Map<Layer, number>();
const PERIOD = LOOP - LOOP_CROSSFADE;

function gainFor(layer: Layer): GainNode | null {
  if (!ctx || !music) return null;
  let gain = layerGain.get(layer);
  if (!gain) {
    gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(music);
    layerGain.set(layer, gain);
  }
  return gain;
}

/** Schedule copies of a layer's stem ahead of time, each overlapping the last slightly. */
function schedule(layer: Layer) {
  if (!ctx) return;
  const buffer = ready.get(LAYERS[layer].file);
  const out = gainFor(layer);
  if (!buffer || !out) return;
  const horizon = ctx.currentTime + 12;
  let k = nextCopy.get(layer);
  if (k === undefined) {
    // Joining late: start mid-copy, at the shared position, so every layer stays in step.
    k = Math.max(0, Math.floor((ctx.currentTime + 0.06 - clockStart) / PERIOD));
  }
  const sources = layerSources.get(layer) ?? [];
  while (clockStart + k * PERIOD < horizon) {
    const copyStart = clockStart + k * PERIOD;
    const when = Math.max(copyStart, ctx.currentTime + 0.05);
    const offset = when - copyStart;
    if (offset < LOOP - 0.2) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const fade = ctx.createGain();
      fade.gain.setValueAtTime(k === 0 || offset > 0 ? 1 : 0, when);
      if (k > 0 && offset === 0) fade.gain.linearRampToValueAtTime(1, when + LOOP_CROSSFADE);
      fade.gain.setValueAtTime(1, copyStart + PERIOD);
      fade.gain.linearRampToValueAtTime(0, copyStart + LOOP);
      source.connect(fade).connect(out);
      source.start(when, offset);
      source.stop(copyStart + LOOP + 0.05);
      source.onended = () => {
        const list = layerSources.get(layer);
        if (list) list.splice(list.indexOf(source) >>> 0, 1);
      };
      sources.push(source);
    }
    k += 1;
  }
  layerSources.set(layer, sources);
  nextCopy.set(layer, k);
}

function stopScore() {
  for (const sources of layerSources.values()) {
    for (const source of sources) {
      try {
        source.stop();
      } catch {
        // already stopped
      }
    }
  }
  layerSources.clear();
  nextCopy.clear();
  for (const gain of layerGain.values()) gain.gain.value = 0;
  running = false;
  if (scheduleTimer !== null) window.clearInterval(scheduleTimer);
  scheduleTimer = null;
}

/** Bring every layer to the level its stage asks for. Safe to call at any time. */
function applyScore() {
  if (!enabled || !ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  const on = STAGES[wanted];
  if (stopTimer !== null) {
    window.clearTimeout(stopTimer);
    stopTimer = null;
  }
  if (on.length > 0 && !running) {
    running = true;
    clockStart = now + 0.06;
    scheduleTimer = window.setInterval(() => {
      for (const layer of Object.keys(LAYERS) as Layer[])
        if (layerSources.has(layer) || STAGES[wanted].includes(layer)) schedule(layer);
    }, 4000);
  }
  if (!running) return;
  for (const layer of Object.keys(LAYERS) as Layer[]) {
    const gain = gainFor(layer);
    if (!gain) continue;
    const target = on.includes(layer) ? LAYERS[layer].level : 0;
    const joining = target > 0 && gain.gain.value === 0;
    const fade = on.length === 0 ? FADES.out : joining ? FADES.in : FADES.change;
    if (target > 0) {
      void load(LAYERS[layer].file).then(() => {
        if (enabled && running) schedule(layer);
      });
    }
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(target, now + fade);
  }
  if (on.length === 0) {
    // After the fade to silence, stop the layers; the next stage starts the clock again.
    stopTimer = window.setTimeout(stopScore, FADES.out * 1000 + 200);
  }
}

function resolveStage() {
  wanted = stageFloor === "council" && decree ? "decree" : stageFloor;
  applyScore();
}

/** The scene's stage: set by the frame around every guest scene. */
export function scoreStage(stage: ScoreStage): void {
  stageFloor = stage;
  resolveStage();
}

/** The council's decree: once Doom has decreed, the council's layers gain the crown. */
export function scoreDecree(on: boolean): void {
  decree = on;
  resolveStage();
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    if (document.hidden) {
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.3);
      window.setTimeout(() => {
        if (document.hidden) void ctx?.suspend().catch(() => null);
      }, 350);
    } else if (enabled) {
      void ctx.resume().then(() => {
        if (!ctx || !master) return;
        const t = ctx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(0, t);
        master.gain.linearRampToValueAtTime(1, t + 1.2);
        applyScore();
      });
    }
  });
}
