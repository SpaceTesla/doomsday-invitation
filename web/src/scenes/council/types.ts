// What the council screen receives from the server: plain, already in words, and
// nothing a guest may not see (no other guest's link, id, opened state or approval).

export type CouncilData = {
  token: string;
  /** Today in the event's time zone, the earliest day the alternative control offers. */
  today: string;
  proposal: { when: string; venue: string } | null;
  decreed: boolean;
  count: { approved: number; total: number };
  notices: { proposalChanged: boolean; decreeAmended: boolean };
  you: {
    approves: boolean;
    hasAlternative: boolean;
    characterId: string | null;
    removedCharacter: string | null;
  };
  alternatives: { when: string; who: string; isYours: boolean }[];
  mantles: { id: string; name: string; holder: string | null; isYours: boolean }[];
  guests: {
    name: string;
    status: "summoned" | "seated" | "declined";
    character: string | null;
    isYou: boolean;
  }[];
};
