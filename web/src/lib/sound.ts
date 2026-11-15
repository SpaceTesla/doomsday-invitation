"use client";

// Sound (design/DESIGN.md, sections 6.8 and 6.9). Rules this module keeps:
//
// - Nothing plays before the guest's first action. Howler and every file load only once
//   the guest has chosen sound ("Go with him", or the sound control).
// - Silent mode loses nothing: every call here is a no-op while sound is off, and no
//   animation or information waits on a sound.
// - The choice lasts for the visit (session storage), and sound never turns itself on.
// - Sound fades out when the tab is hidden, and the room comes back when it is shown.
// - No music, no voice. The files are synthesised (scripts/make-sounds.py).
import type { Howl as HowlType } from "howler";
import { rememberSound, soundChosen } from "@/scenes/sound-choice";

export type SoundName =
  "seal-turn" | "plate-part" | "plate-close" | "detent" | "rune-tick" | "hum" | "hall-room";

const VOLUME: Record<SoundName, number> = {
  "seal-turn": 0.7,
  "plate-part": 0.7,
  "plate-close": 0.8,
  detent: 0.6,
  "rune-tick": 0.3,
  hum: 0.45,
  "hall-room": 0.35,
};

const ROOM_FADE_MS = 1200;

let enabled = false;
let loading: Promise<void> | null = null;
const sounds = new Map<SoundName, HowlType>();
let roomWanted = false;
const listeners = new Set<(on: boolean) => void>();

function load(): Promise<void> {
  if (loading) return loading;
  loading = import("howler").then(({ Howl }) => {
    for (const name of Object.keys(VOLUME) as SoundName[]) {
      sounds.set(
        name,
        new Howl({
          src: [`/audio/${name}.webm`, `/audio/${name}.mp3`],
          volume: VOLUME[name],
          loop: name === "hall-room",
          preload: true,
        }),
      );
    }
    if (roomWanted) startRoom();
  });
  return loading;
}

function startRoom() {
  const room = sounds.get("hall-room");
  if (!room || !enabled || document.hidden) return;
  if (!room.playing()) {
    room.volume(0);
    room.play();
  }
  room.fade(room.volume(), VOLUME["hall-room"], ROOM_FADE_MS);
}

function stopRoom() {
  const room = sounds.get("hall-room");
  if (!room || !room.playing()) return;
  room.fade(room.volume(), 0, ROOM_FADE_MS / 2);
  // Pause at the end of the fade, unless the room has been asked back meanwhile.
  room.once("fade", () => {
    if (!roomWanted || !enabled || document.hidden) room.pause();
  });
}

/** Read the guest's choice for this visit. Loads nothing unless sound is on. */
export function initSound(): void {
  enabled = soundChosen();
  if (enabled) void load();
  listeners.forEach((listener) => listener(enabled));
}

export function soundOn(): boolean {
  return enabled;
}

/** The guest's choice. Turning sound on is a user action, so audio may start now. */
export function setSound(on: boolean): void {
  enabled = on;
  rememberSound(on);
  if (on) {
    void load().then(() => {
      if (roomWanted) startRoom();
    });
  } else {
    for (const sound of sounds.values()) sound.stop();
  }
  listeners.forEach((listener) => listener(on));
}

export function onSoundChange(listener: (on: boolean) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Play a one-shot. Does nothing while sound is off or still loading. */
export function play(name: SoundName, options: { rate?: number; volume?: number } = {}): void {
  if (!enabled) return;
  const sound = sounds.get(name);
  if (!sound || sound.state() !== "loaded") return;
  const id = sound.play();
  if (options.rate) sound.rate(options.rate, id);
  if (options.volume !== undefined) sound.volume(VOLUME[name] * options.volume, id);
}

/** The hall's room tone, while the council is on screen. */
export function room(on: boolean): void {
  roomWanted = on;
  if (on) startRoom();
  else stopRoom();
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopRoom();
      for (const [name, sound] of sounds) if (name !== "hall-room") sound.stop();
    } else if (roomWanted) {
      startRoom();
    }
  });
}
