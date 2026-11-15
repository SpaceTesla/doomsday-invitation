// Application wording. docs/COPY.md is the source of truth: every string here is copied
// from it word for word and keyed by its line number there. Do not write wording inline
// in components, and do not edit a line here without changing the deck.
//
// This file holds the lines in use so far. Each milestone adds the lines it needs.

export const copy = {
  // 2. Opening
  "2.1": "The Iron Throne",
  "2.4": "GO WITH HIM",
  "2.5": "GO WITHOUT SOUND",
  "2.9": "The Iron Throne",
  "2.10": "A summons",
  "2.11": "You have been summoned.",

  // 3. Summons
  "3.10": "TAKE YOUR SEAT",
  "3.11": "DECLINE",

  // 4. Declining and withdrawing
  "4.1": "Refuse the summons?",
  "4.5": "So be it.",
  "4.9": "Abandon your seat?",
  "4.13": "The day has passed.",

  // 5. Character selection
  "5.1": "Choose your mantle",

  // 6. The council
  "6.1": "Council of Doom",
  "6.2": "The council is seated.",
  "6.5": "SUMMONED",
  "6.6": "SEATED",
  "6.7": "DECLINED",
  "6.8": "YOU",

  // 7. The proposal
  "7.1": "Doom proposes",
  "7.7": "APPROVE",
  "7.8": "PROPOSE ANOTHER",
  "7.9": "Your approval is counsel. Doom alone decides, and may change the proposal at any time.",
  "7.10": "APPROVED",
  "7.11": "WITHDRAW",
  "7.14": "ALTERNATIVES",
  "7.17": "Propose another",

  // 8. The decree
  "8.1": "Doom decrees",

  // 9. Invalid links, errors and waiting
  "9.1": "No summons here.",
  "9.2": "This link opens nothing. If Doom summoned you, ask him for your link again.",

  // 10. Administrator panel
  "10.1": "Doom's Council",
  "10.3": "Doom's Council",
  "10.4": "Summon a guest",
} as const;

export type CopyKey = keyof typeof copy;

/** The lines COPY.md sets in Pirata One. None may contain a word with V or v. */
export const displayHeadings = [
  "2.1",
  "4.1",
  "4.5",
  "4.9",
  "4.13",
  "5.1",
  "6.1",
  "6.2",
  "7.1",
  "7.17",
  "8.1",
  "9.1",
  "10.1",
  "10.3",
  "10.4",
] as const satisfies readonly CopyKey[];
