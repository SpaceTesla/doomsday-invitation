// The approval rules. docs/PRODUCT_SPEC.md, section 5.9, expects each of these to change
// after version 1 without reworking the journey, so each is one named setting here and
// the rest of the domain reads them instead of assuming them.

export const approvalRules = {
  /**
   * Advisory: no count enables or prevents finalising. If this became false, Doom could
   * finalise only once `approvalsNeeded` seats approve.
   */
  advisory: true,
  approvalsNeeded: 0,

  /** Who counts towards the total the count is shown against. */
  countAgainst: "seated" as "seated" | "summoned",

  /** Whether changing the date, time or venue clears every approval. */
  resetOnProposalChange: true,

  /** What a guest may put forward as an alternative. The venue is Doom's to choose. */
  alternativeMayChange: { date: true, time: true, venue: false },

  /** How guests see approvals: as a number. Doom alone sees the names. */
  guestsSeeApprovalsAs: "count" as "count" | "names",
} as const;

export type ApprovalRules = typeof approvalRules;
