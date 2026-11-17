import { notFound } from "next/navigation";
import { copy } from "@/copy";
import { Button } from "@/components/Button";
import { Figure } from "@/components/Figure";
import { Heading } from "@/components/Heading";
import { Label } from "@/components/Label";
import { CuirassTile, Mask, SealMark, SuitRune } from "@/components/Mark";
import { MaskInsignia } from "@/components/MaskInsignia";
import { Seal } from "@/components/Seal";
import { Panel, PanelActions, Well } from "@/components/Panel";
import { QuietControl } from "@/components/QuietControl";
import { Runes } from "@/components/Runes";
import { INSCRIPTIONS } from "@/lib/runes";

// A development-only sheet of the design foundation, for checking tokens, type and base
// components against the approved boards. It is not part of the product and returns the
// invalid-link screen in production. Sample values here (a guest, a date, a count) are
// the placeholders the boards use; they are not application copy.

const interfaceColours: [string, string, string][] = [
  ["Night", "#0A0D12", "var(--c-night)"],
  ["Olive black", "#10130C", "var(--c-olive-black)"],
  ["Plate", "#1A2020", "var(--c-plate)"],
  ["Gunmetal", "#252C2C", "var(--c-gunmetal)"],
  ["Dark steel", "#5A6462", "var(--c-dark-steel)"],
  ["Steel", "#96A19E", "var(--c-steel)"],
  ["Silver", "#D9DEDC", "var(--c-silver)"],
  ["Emerald deep", "#0E5A40", "var(--c-emerald-deep)"],
  ["Emerald", "#1F8F63", "var(--c-emerald)"],
  ["Emerald light", "#4FC395", "var(--c-emerald-light)"],
  ["Bronze", "#7D5F2C", "var(--c-bronze)"],
  ["Antique gold", "#C6A75E", "var(--c-gold)"],
  ["Gold light", "#E4CB8C", "var(--c-gold-light)"],
  ["Signal", "#E0806F", "var(--c-signal)"],
];

const sceneColours: [string, string, string][] = [
  ["Glass", "#E2D874", "var(--c-scene-glass)"],
  ["Amber", "#EE9A2E", "var(--c-scene-amber)"],
  ["Fog", "#A9B192", "var(--c-scene-fog)"],
  ["Emerald fire", "#3FE07F", "var(--c-scene-emerald-fire)"],
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-dark-steel/40 py-10">
      <p className="lbl lbl--block mb-6">{title}</p>
      {children}
    </section>
  );
}

function Swatches({ colours }: { colours: [string, string, string][] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 wide:grid-cols-7">
      {colours.map(([name, hex, value]) => (
        <li key={name}>
          <div
            className="h-14 rounded-sm border border-dark-steel/50"
            style={{ background: value }}
          />
          <p className="mt-2 text-[1.0625rem] leading-tight">{name}</p>
          <p className="fig text-[0.9375rem] text-steel">{hex}</p>
        </li>
      ))}
    </ul>
  );
}

export default function Specimen() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto max-w-5xl px-5 pb-24 pt-10 wide:px-9">
      <Heading as="h1" size="title">
        {copy["2.1"]}
      </Heading>
      <p className="t-expl mt-3">
        Design foundation, for review against the approved boards. Development only.
      </p>

      <Section title="Interface colours">
        <Swatches colours={interfaceColours} />
      </Section>

      <Section title="Scene colours, artwork only">
        <Swatches colours={sceneColours} />
      </Section>

      <Section title="Display, Pirata One">
        <div className="grid gap-3">
          <Heading as="p" size="title">
            {copy["6.1"]}
          </Heading>
          <Heading as="p">{copy["7.1"]}</Heading>
          <Heading as="p">{copy["6.2"]}</Heading>
          <Heading as="p">{copy["5.1"]}</Heading>
          <Heading as="p">{copy["8.1"]}</Heading>
          <Heading as="p">{copy["4.9"]}</Heading>
        </div>
      </Section>

      <Section title="Supporting serif, Cinzel">
        <p
          className="t-name"
          style={{ fontSize: "2.75rem", lineHeight: 1.08, letterSpacing: "0.02em" }}
        >
          Mr. Anish.
        </p>
        <p className="t-name mt-4" style={{ color: "var(--c-gold-light)" }}>
          Victor von Doom
        </p>
        <p className="t-name mt-4">José Nuñez</p>
        <p className="t-holder mt-2">Ms. Tara Menon</p>
        <p className="mt-4 text-steel">
          <Figure>3</Figure> of <Figure>7</Figure> seats have approved
        </p>
      </Section>

      <Section title="Technical, Orbitron">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <Label>{copy["6.5"]}</Label>
          <Label>{copy["6.6"]}</Label>
          <Label>{copy["6.7"]}</Label>
          <Label>{copy["6.8"]}</Label>
          <Label>{copy["7.14"]}</Label>
        </div>
      </Section>

      <Section title="Body, Cormorant Garamond">
        <p className="t-procl">
          Friday the eighteenth of December, at half past seven in the evening.
        </p>
        <p className="t-procl">At the Grand Cinema, in the fourth hall.</p>
        <p className="t-expl mt-4">{copy["7.9"]}</p>
        <p className="t-expl mt-4" style={{ fontStyle: "italic", fontWeight: 700 }}>
          Let none who is called fail to answer. The absent forfeit their voice.
        </p>
        <p className="t-expl t-error mt-4">
          That did not reach the council. Nothing was lost. Try again.
        </p>
      </Section>

      <Section title="Controls">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-5">
          <Button>{copy["2.4"]}</Button>
          <Button>{copy["3.10"]}</Button>
          <Button done>{copy["7.10"]}</Button>
          <Button disabled>{copy["7.7"]}</Button>
          <QuietControl>{copy["2.5"]}</QuietControl>
          <QuietControl>{copy["3.11"]}</QuietControl>
        </div>
      </Section>

      <Section title="Panel and well">
        <div className="grid gap-7 wide:grid-cols-2">
          <Panel labelledBy="specimen-proposal">
            <Heading as="h2" id="specimen-proposal">
              {copy["7.1"]}
            </Heading>
            <p className="t-procl">
              Friday the eighteenth of December, at half past seven in the evening.
            </p>
            <p className="t-procl">At the Grand Cinema, in the fourth hall.</p>
            <Well>
              <Figure>3</Figure> of <Figure>7</Figure> seats have approved
            </Well>
            <PanelActions>
              <Button>{copy["7.7"]}</Button>
              <QuietControl>{copy["7.8"]}</QuietControl>
            </PanelActions>
            <p className="t-expl mt-4">{copy["7.9"]}</p>
          </Panel>

          <Panel labelledBy="specimen-approved">
            <Heading as="h2" id="specimen-approved">
              {copy["7.1"]}
            </Heading>
            <p className="t-procl">
              Friday the eighteenth of December, at half past seven in the evening.
            </p>
            <Well>
              <Label block>{copy["7.14"]}</Label>
              <p className="text-silver">Saturday the nineteenth of December, at noon.</p>
              <p className="t-holder">Ms. Tara Menon</p>
            </Well>
            <PanelActions>
              <Button done>{copy["7.10"]}</Button>
              <QuietControl>{copy["7.11"]}</QuietControl>
            </PanelActions>
          </Panel>
        </div>
      </Section>

      <Section title="Marks">
        <div className="flex flex-wrap items-end gap-8">
          <SealMark className="!h-8 !w-8" />
          <SealMark tone="emerald" className="!h-8 !w-8" />
          <Mask tone="silver" className="!h-8 !w-auto" />
          <MaskInsignia plain tone="gold" className="!h-16 !w-auto" />
          <MaskInsignia tone="gold" className="!h-40 !w-auto" />
          <SuitRune tone="emerald" className="!h-8 !w-8" />
          <SuitRune level={2} tone="emerald" className="!h-16 !w-16" />
          <CuirassTile tone="dim" className="!h-8 !w-8" />
        </div>
      </Section>

      <Section title="The seal: dormant, waking, active">
        <div className="grid grid-cols-3 gap-5 wide:max-w-3xl">
          <Seal state="dormant" />
          <Seal state="waking" />
          <Seal state="active" />
        </div>
      </Section>

      <Section title="Sound, for approval by ear">
        <ul className="grid gap-4 wide:grid-cols-2">
          {[
            ["seal-turn", "The iris between scenes, 0.9 s"],
            ["detent", "A band locking; a council step; the doors' lock, 0.35 s"],
            ["rune-tick", "A rune lighting, one after another, 0.08 s"],
            ["plate-part", "The summons' outer doors opening, 1.2 s"],
            ["claim", "A mantle claimed (provisional), 1.2 s"],
            ["decree", "The decree issued (provisional), 2.2 s"],
            ["score-foundation", "Score A: the drone, from the summons, 64 s loop"],
            ["score-hall", "Score A: the hall's air, in the council, 64 s loop"],
            ["score-crown", "Score A: the brass, at the decree, 64 s loop"],
            ["plate-close", "Retired: no longer played (kept as source)"],
            ["hum", "Retired: replaced by the score (kept as source)"],
            ["hall-room", "Retired: replaced by the score's hall layer (kept as source)"],
          ].map(([name, what]) => (
            <li key={name}>
              <p className="t-expl">{what}</p>
              <audio
                controls
                preload="none"
                loop={name.startsWith("score-")}
                className="mt-2 w-full"
              >
                <source src={`/audio/${name}.webm`} type="audio/webm" />
                <source src={`/audio/${name}.mp3`} type="audio/mpeg" />
              </audio>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Doomscript, decoration only">
        <div className="grid gap-4 text-[1.375rem] text-emerald-light">
          {INSCRIPTIONS.map((inscription) => (
            <Runes key={inscription} inscription={inscription} />
          ))}
        </div>
      </Section>

      <Section title="Artwork, as copied from the approved files">
        <div className="grid gap-5 wide:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- approved renders are served as they are */}
          <img
            src="/art/hall-d-plate.jpg"
            alt=""
            width={1920}
            height={1080}
            className="h-auto w-full"
          />
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/art/hero-d-sky.jpg"
              alt=""
              width={1920}
              height={1080}
              className="h-auto w-full"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/art/hero-d-figure-lit.webp"
              alt=""
              width={1920}
              height={1080}
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      </Section>
    </main>
  );
}
