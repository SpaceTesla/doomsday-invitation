// The score and the one-shots: levels, timings and which layers play where. Everything a
// listener would want to adjust is here; src/lib/sound.ts only plays what this says.
// design/DESIGN.md, sections 6.8 and 6.12 (approved 17 November 2026: Score A, a drone
// with no melody, layered by stage).

/** One-shot sounds and their playback level (0 to 1). */
export const ONE_SHOTS = {
  "seal-turn": 0.7, // the iris between scenes
  detent: 0.6, // a band locking; a council step; the summons doors' lock
  "rune-tick": 0.3, // one rune lighting, played one after another
  "plate-part": 0.7, // the summons' outer doors opening
  claim: 0.5, // a mantle claimed (provisional)
  decree: 0.55, // the decree issued (provisional)
} as const;

export type OneShot = keyof typeof ONE_SHOTS;

/** The order the one-shots load in after the guest chooses sound: the first needed first. */
export const LOAD_ORDER: OneShot[] = [
  "seal-turn",
  "detent",
  "plate-part",
  "rune-tick",
  "claim",
  "decree",
];

/** A one-shot asked for while its file is still loading plays late only within this window. */
export const LATE_PLAY_MS = 1200;

/** The score's layers. Every stem is exactly LOOP seconds long, so they loop in step. */
export const LOOP = 64;
/** Consecutive copies of a stem overlap by this much, cross-faded, hiding any codec padding. */
export const LOOP_CROSSFADE = 0.08;

export const LAYERS = {
  foundation: { file: "score-foundation", level: 0.32 }, // the low drone, bowed metal
  hall: { file: "score-hall", level: 0.5 }, // the hall's air and high glass
  crown: { file: "score-crown", level: 0.42 }, // low brass swells, at the decree
} as const;

export type Layer = keyof typeof LAYERS;

/** Which layers sound at each stage. The opening is silent by rule; so are the endings. */
export type ScoreStage = "silent" | "summons" | "council" | "decree";
export const STAGES: Record<ScoreStage, Layer[]> = {
  silent: [],
  summons: ["foundation"],
  council: ["foundation", "hall"],
  decree: ["foundation", "hall", "crown"],
};

/** Seconds: a layer joining, a layer changing, and the fade to silence on the endings. */
export const FADES = { in: 2.5, change: 2.5, out: 4 };
