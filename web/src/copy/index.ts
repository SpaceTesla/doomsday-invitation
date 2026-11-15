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
  "7.3": "At [venue].",
  "7.7": "APPROVE",
  "7.8": "PROPOSE ANOTHER",
  "7.9": "Your approval is counsel. Doom alone decides, and may change the proposal at any time.",
  "7.10": "APPROVED",
  "7.11": "WITHDRAW",
  "7.14": "ALTERNATIVES",
  "7.17": "Propose another",
  "7.21": "CANCEL",
  "7.25": "That day has passed. Name one to come.",
  "7.26": "Name both a day and an hour.",

  // 8. The decree
  "8.1": "Doom decrees",
  "8.5": "DECREED",
  "8.6": "PROPOSED",

  // 9. Invalid links, errors and waiting
  "9.1": "No summons here.",
  "9.2": "This link opens nothing. If Doom summoned you, ask him for your link again.",
  "9.3": "That did not reach the council. Nothing was lost. Try again.",
  "9.5": "No connection. Your answer is not yet recorded.",
  "9.8": "One moment.",
  "9.10": "Close",

  // 10. Administrator panel
  "10.1": "Doom's Council",
  "10.2.guests": "GUESTS",
  "10.2.characters": "CHARACTERS",
  "10.2.proposal": "PROPOSAL",
  "10.2.council": "COUNCIL",
  "10.3": "Doom's Council",
  "10.3a": "PASSPHRASE",
  "10.3b": "ENTER",
  "10.3c": "That is not the passphrase.",
  "10.3d": "Too many attempts. Wait a while, then try again.",
  "10.3e": "SIGN OUT",
  "10.4": "Summon a guest",
  "10.5.name": "NAME",
  "10.5.title": "TITLE",
  "10.6.mr": "Mr.",
  "10.6.ms": "Ms.",
  "10.6.dr": "Dr.",
  "10.6.none": "None",
  "10.7": "Shown exactly as typed, in capitals and small capitals.",
  "10.8": "ADD GUEST",
  "10.9": "A guest needs a name.",
  "10.10.summoned": "SUMMONED",
  "10.10.opened": "OPENED",
  "10.10.seated": "SEATED",
  "10.10.declined": "DECLINED",
  "10.11.copy": "COPY LINK",
  "10.11.replace": "REPLACE LINK",
  "10.11.cancel": "CANCEL LINK",
  "10.12": "Link copied. Send it yourself.",
  "10.13": "The old link will stop working at once. Send the new one.",
  "10.13.confirm": "REPLACE LINK",
  "10.13.cancel": "CANCEL",
  "10.14": "[Title] [Name] will no longer be able to open the summons.",
  "10.14.confirm": "CANCEL LINK",
  "10.14.cancel": "KEEP LINK",
  "10.15": "EDIT NAME",
  "10.16": "REMOVE GUEST",
  "10.17":
    "[Title] [Name] will be removed. Their character is freed, and their approval and alternative are struck out. Their link stops working.",
  "10.17.confirm": "REMOVE GUEST",
  "10.17.cancel": "CANCEL",
  "10.18": "No one has been summoned yet.",
  "10.19": "CHARACTER",
  "10.20": "ADD CHARACTER",
  "10.21": "[Character] is already on the roster.",
  "10.22": "FREE",
  "10.23": "HELD BY",
  "10.24": "REMOVE",
  "10.25": "[Character] is held by [Title] [Name]. Removing it sends them back to choose again.",
  "10.25.confirm": "REMOVE",
  "10.25.cancel": "KEEP",
  "10.26": "The roster is empty. Guests cannot choose until you add characters.",
  "10.27": "Guests choose for themselves. You cannot assign a character.",
  "10.28.day": "DAY",
  "10.28.hour": "HOUR",
  "10.28.venue": "VENUE",
  "10.29": "SET PROPOSAL",
  "10.30": "CHANGE PROPOSAL",
  "10.31": "Changing the proposal resets every approval. [n] will be cleared.",
  "10.31.confirm": "CHANGE PROPOSAL",
  "10.31.cancel": "CANCEL",
  "10.32": "[n] of [total] seated guests approve",
  "10.33": "No one has approved yet.",
  "10.34": "ALTERNATIVES",
  "10.35": "No alternatives yet.",
  "10.36": "To adopt one, change the proposal to it.",
  "10.37": "FINALISE THE PLAN",
  "10.38":
    "Guests will see this as the decree. They can no longer approve, suggest alternatives or change character. You can still amend it.",
  "10.38.confirm": "FINALISE",
  "10.38.cancel": "CANCEL",
  "10.39": "Set a proposal first.",
  "10.40": "AMEND THE PLAN",
  "10.41": "Guests will be shown that the decree changed.",
  "10.41.confirm": "AMEND",
  "10.41.cancel": "CANCEL",
  "10.42": "Saved.",
  "10.43": "That did not save. Nothing was changed. Try again.",
  "10.44": "Links stop working and all data is deleted thirty days after the day.",

  // 10.5 Lines added during the build (COPY.md, section 10.5)
  "10.45": "SAVE NAME",
  "10.46": "NO LINK",
  "10.47": "Name a venue.",
  "10.48": "EXPORT",
} as const;

export type CopyKey = keyof typeof copy;

/** Fill a line's [placeholders]: fill(copy["10.14"], { "[Title] [Name]": "Mr. Anish" }). */
export function fill(line: string, values: Record<string, string | number>): string {
  let out = line;
  for (const [placeholder, value] of Object.entries(values)) {
    out = out.split(placeholder).join(String(value));
  }
  return out;
}

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
