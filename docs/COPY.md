# The Iron Throne: copy deck

Every word a guest or the administrator reads, with where it appears. It follows the behaviour in [`PRODUCT_SPEC.md`](PRODUCT_SPEC.md) and the layouts and typography in [`design/DESIGN.md`](../design/DESIGN.md). It adds no feature, screen or interaction.

Nothing here is implemented. All wording in this deck was approved for the first version on 15 November 2026 and is final.

## How to read this document

| Standing | Meaning |
|---|---|
| **Approved** | Final for the first version. Use it word for word. |
| **Approved; built later** | The wording is final. The control or position it belongs to has not been drawn and is settled in the build. |

Words in [square brackets] are filled in by the product. Each line gives the typeface role it is set in, because the typography rules limit what a line may contain.

## 1. Voice and rules

### 1.1 The voice

Doom is addressing people he has personally summoned.

- **He commands.** Short declarative sentences. No "please", no "sorry", no "oops", no exclamation marks.
- **He speaks of himself as Doom**, in the third person, in formal lines: "Doom proposes", "Doom alone decides".
- **He is dry, never jokey.** The humour is that a cinema trip is handled as an affair of state. No puns, no winks, no pop-culture asides.
- **He is clear when it matters.** Any line about an action, an error or a consequence says plainly what happened and what to do, in the same sentence or the next. Menace never replaces information.
- **He does not explain himself twice.** One line of explanation per screen at most.

### 1.2 Two registers

| Register | Used for | Set in |
|---|---|---|
| **Proclamation** | What Doom declares: the opening line, the summons, the proposal, the decree, closing lines | Cormorant Garamond italic |
| **Instruction** | What the guest needs to know to act: explanations, errors, confirmations | Cormorant Garamond upright |

A proclamation may be grand. An instruction is always plain.

### 1.3 Terms

One word for each thing, everywhere.

| Thing | Guest-facing word | Never |
|---|---|---|
| The group of guests | the council | team, group, party |
| A guest who accepted | seated | joined, confirmed, RSVP'd |
| A character a guest holds | mantle | avatar, role, pick |
| The date, time and venue under discussion | the proposal | poll, option, plan (until final) |
| The proposal once final | the decree | final plan, confirmed booking |
| A guest's suggested date or time | an alternative | counter-offer, vote |
| The film outing | the day | event, showing, screening (in guest copy) |

The administrator panel uses plain words: guests, characters, proposal, final plan.

### 1.4 Rules from the typography

- **Headings in Pirata One contain no V or v**, and are short. Every heading below was written to that rule and also avoids k, w, x and z. Each new one was set in Pirata One at 34 px and read by eye; all read correctly. They have not yet been seen in place on a board.
- **Labels in Orbitron** are capitals, four words at most, with no numerals and no names.
- **Dates and times are written in words**: "Friday the eighteenth of December, at half past seven in the evening." Numerals appear only in counts, set in Cinzel.
- **Names** (guests, characters, "Victor von Doom") are never in Pirata One or Orbitron.
- **No tooltips.** The design has none, and touch screens cannot show them. Where a control needs a name for assistive technology, it is listed as an accessible name.

### 1.5 Formats

| Item | Format | Example |
|---|---|---|
| Date and time | [Weekday] the [ordinal in words] of [Month], at [time in words] [in the morning / afternoon / evening] | Friday the eighteenth of December, at half past seven in the evening. |
| Venue | At [venue as typed by the administrator]. | At the Grand Cinema, in the fourth hall. |
| Guest's address | [Title] [Name], or the name alone when no title is set | Mr. Anish. |
| Count | [n] of [total] seats have approved. With one: "1 of [total] seats has approved." | 3 of 7 seats have approved |
| Dating clause | the [ordinal in words] day of [Month], [year in Roman numerals] | the fifteenth day of November, MMXXVI |

The part of day is always given, because "half past seven" alone does not say morning or evening. Before noon is "in the morning", from noon to five "in the afternoon", after five "in the evening".

---

## 2. Opening

`design/DESIGN.md`, sections 6.2 to 6.4. Board: revision 5, section A.

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 2.1 | Title, opening only | Pirata One | The Iron Throne | Approved; built later. Its position in the opening is settled in the build |
| 2.2 | First line | Cinzel | [Title] [Name]. | Approved |
| 2.3 | Second line | Body, italic | Doctor Doom is here to collect you. | Approved |
| 2.4 | Primary action | Orbitron | GO WITH HIM | Approved |
| 2.5 | Quiet control | Orbitron | GO WITHOUT SOUND | Approved |
| 2.6 | Sound control, later screens | Orbitron | SOUND ON / SOUND OFF | Approved. The label states the current state |
| 2.7 | Accessible name of the scene | none | Doctor Doom, hooded and masked, lifts the rubble from over you and raises one hand. | Approved |
| 2.8 | Accessible hint while the reveal plays | none | Press any key to skip. | Approved. Not shown on screen: any key or tap already skips |
| 2.9 | Browser title | none | The Iron Throne | Approved |
| 2.10 | Link preview title | none | A summons | Approved. Reveals no name and no event |
| 2.11 | Link preview description | none | You have been summoned. | Approved |

## 3. Summons

`design/DESIGN.md`, section 8.4. Board: revision 5, section B.

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 3.1 | Issuer | Cinzel, gold | Victor von Doom | Approved |
| 3.2 | Titling line | Body, italic | by his own hand and will Sovereign of Latveria, to | Approved |
| 3.3 | Guest | Cinzel | [Title] [Name] | Approved |
| 3.4 | Greeting | Body, italic | greeting. | Approved |
| 3.5 | Body, first paragraph | Body | Be it known that Doom has weighed the defenders of this world and found them wanting; that he now gathers a company of his own choosing; and that you have been chosen. | Approved |
| 3.6 | Body, second paragraph | Body | You are therefore summoned to take your seat at the Council of Doom, where the day, the hour and the place shall be set before you. | Approved |
| 3.7 | Sanction | Body, italic, bold | Let none who is called fail to answer. The absent forfeit their voice. | Approved |
| 3.8 | Dating clause | Body, italic | Given at Castle Doom, in Doomstadt, the [day] day of [Month], [year]. On the phone: Given at Castle Doom, the [day] day of [Month], [year]. | Approved |
| 3.9 | Caption under the seal, wide plate | Runes | latveria | Approved. Decoration, not read aloud |
| 3.10 | Primary action | Orbitron | TAKE YOUR SEAT | Approved |
| 3.11 | Quiet control | Orbitron | DECLINE | Approved. Kept from the placeholder: it is the clearest word for an irreversible-looking choice |

No wording on the summons changes.

## 4. Declining and withdrawing

`PRODUCT_SPEC.md`, Stage 2 and section 3.7. Dialog styling: `design/DESIGN.md`, section 8.10.

### 4.1 Declining the summons

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 4.1 | Dialog heading | Pirata One | Refuse the summons? | Approved |
| 4.2 | Dialog text | Body | You will have no seat at the council and no say in its plan. You may return and accept until the day itself. | Approved |
| 4.3 | Dialog, confirm | Orbitron | REFUSE | Approved |
| 4.4 | Dialog, cancel | Orbitron | GO BACK | Approved |
| 4.5 | Closing screen heading | Pirata One | So be it. | Approved |
| 4.6 | Closing screen line | Body, italic | Doom does not ask twice. The seat stands empty until the day; return before then, and it is yours. | Approved |
| 4.7 | Closing screen action | Orbitron | TAKE YOUR SEAT | Approved. The same label as on the summons, because it does the same thing |

A declined guest who opens their link again sees 4.5 to 4.7.

### 4.2 Leaving the council after accepting

Allowed until the decree.

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 4.8 | Quiet control, council | Orbitron | LEAVE THE COUNCIL | Approved |
| 4.9 | Dialog heading | Pirata One | Abandon your seat? | Approved. "Leave" has a V, so the heading uses another word |
| 4.10 | Dialog text | Body | Your mantle will pass back to the council, and your approval and your alternative will be struck out. You may return until the day itself. | Approved |
| 4.11 | Dialog, confirm | Orbitron | ABANDON SEAT | Approved |
| 4.12 | Dialog, cancel | Orbitron | REMAIN | Approved |

After confirming, the guest sees the closing screen, 4.5 to 4.7.

### 4.3 After the day

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 4.13 | Heading, for a guest who never answered or who declined | Pirata One | The day has passed. | Approved |
| 4.14 | Line | Body, italic | The council sat without you. | Approved |

## 5. Character selection

`PRODUCT_SPEC.md`, Stage 3. `design/DESIGN.md`, section 8.6. Board: revision 5, section C.

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 5.1 | Screen heading | Pirata One | Choose your mantle | Approved. Replaces "Choose your name", which could be read as the guest's own name |
| 5.2 | Explanation | Body | Each mantle is borne by one guest alone. You may choose again until Doom decrees the day. | Approved |
| 5.3 | Character plate | Cinzel | [Character] | From the roster, as typed |
| 5.4 | Tag, this guest's choice | Orbitron | YOURS | Approved. Kept |
| 5.5 | Tag, held by another | Orbitron, then Cinzel | TAKEN, with the holder beneath: [Title] [Name] | Approved. Kept |
| 5.6 | Available plate, accessible name | none | Choose [Character] | Approved |
| 5.7 | Taken plate, accessible name | none | [Character], taken by [Title] [Name] | Approved |
| 5.8 | After choosing | Body, italic | You stand before the council as [Character]. | Approved |
| 5.9 | Lost the race | Body | [Character] was claimed a moment ago by [Title] [Name]. Choose another. | Approved. Shown as a neutral notice, not an error |
| 5.10 | Removed by Doom | Body | Doom has struck [Character] from the roster. Choose another. | Approved |
| 5.11 | Every character taken | Body | Every mantle is claimed. Doom may yet add to the roster. | Approved |
| 5.12 | Roster empty | Body | Doom has not yet named the mantles. Return in a while. | Approved |
| 5.13 | After the decree | Body | The day is decreed. Mantles can no longer change. | Approved |
| 5.14 | Faction headings, in this order | Cinzel | The Avengers (Earth-616); The New Avengers / Thunderbolts; The Fantastic Four (Earth-828); The X-Men (Earth-10005); Wakanda & Talokan; The Multiverse & TVA; Doom's Rumoured Team | The owner's names, 16 November 2026. The roster is grouped under them (`PRODUCT_SPEC.md`, section 3.9) |
| 5.15 | Search field label | Orbitron | FIND A MANTLE | Added in the build, for the council's three steps (16 November 2026) |
| 5.16 | Search, nothing matches | Body | No mantle answers to that name. | Added in the build, for the council's three steps (16 November 2026) |
| 5.17 | Search, result for assistive technology | none | [n] mantles answer | Added in the build, for the council's three steps (16 November 2026) |
| 5.18 | Moving on without a mantle, quiet control | Orbitron | CHOOSE LATER | Added in the build, for the council's three steps (16 November 2026) |

## 6. The council

`PRODUCT_SPEC.md`, Stage 4. `design/DESIGN.md`, sections 8.7 and 8.9. The guest list has not been drawn.

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 6.1 | Title over the hall | Pirata One | Council of Doom | Approved |
| 6.2 | Hall caption, heading | Pirata One | The council is seated. | Approved |
| 6.3 | Hall caption, line | Body, italic | Doom will set the day, the hour and the place before you. | Approved |
| 6.4 | Doom's row | Cinzel, then Orbitron | Doctor Doom, with the tag SOVEREIGN | Approved |
| 6.5 | Status, no answer yet | Orbitron | SUMMONED | Approved. Kept from the design's placeholder |
| 6.6 | Status, accepted | Orbitron | SEATED | Approved. Kept |
| 6.7 | Status, declined or left | Orbitron | DECLINED | Approved. Kept |
| 6.8 | The guest's own row | Orbitron | YOU | Approved. Kept |
| 6.9 | Seated, no character yet | Body | No mantle yet | Approved |
| 6.10 | The guest is the only one seated | Body | You are the first to answer. | Approved |
| 6.11 | List, accessible name | none | The council: [n] summoned, [n] seated | Approved |
| 6.12 | Step labels, in order | Orbitron | PROPOSAL, MANTLE, COUNCIL | Added in the build, for the council's three steps (16 November 2026) |
| 6.13 | The steps, accessible name | none | Your answers to Doom | Added in the build, for the council's three steps (16 November 2026) |
| 6.14 | A finished step, read after its label by assistive technology | none | answered | Added in the build, for the council's three steps (16 November 2026) |
| 6.15 | Move to the next step | Orbitron | CONTINUE | Added in the build, for the council's three steps (16 November 2026) |
| 6.16 | Step three heading | Pirata One | Those summoned | Added in the build, for the council's three steps (16 November 2026) |

## 7. The proposal

`PRODUCT_SPEC.md`, Stage 5. `design/DESIGN.md`, section 8.8. Board: revision 5, section C.

### 7.1 The panel

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 7.1 | Heading | Pirata One | Doom proposes | Approved |
| 7.2 | Date and time | Body, italic | [Date and time, in words, as section 1.5] | Approved |
| 7.3 | Venue | Body, italic | At [venue]. | Approved |
| 7.4 | Count | Body, figures in Cinzel | [n] of [total] seats have approved | Approved |
| 7.5 | Count, one | Body, figure in Cinzel | 1 of [total] seats has approved | Approved |
| 7.6 | Count, none | Body | No seat has approved yet | Approved |
| 7.7 | Primary action | Orbitron | APPROVE | Approved |
| 7.8 | Quiet control | Orbitron | PROPOSE ANOTHER | Approved |
| 7.9 | Explanation | Body | Your approval is counsel. Doom alone decides, and may change the proposal at any time. | Approved. Kept from the placeholder |
| 7.10 | After approving, button | Orbitron | APPROVED | Approved. Kept |
| 7.11 | After approving, quiet control | Orbitron | WITHDRAW | Approved. Kept |
| 7.12 | No proposal yet | Body, italic | Doom has not yet named the day. | Approved |
| 7.13 | Proposal changed since the guest's last visit | Body | Doom has changed the proposal. Earlier approvals no longer stand. | Approved |

### 7.2 Alternatives

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 7.14 | Label over the list | Orbitron | ALTERNATIVES | Approved. Kept |
| 7.15 | A row | Body, then Cinzel | [Date and time, in words], then [Title] [Name] | Approved |
| 7.16 | No alternatives | Body | No alternative has been put forward. | Approved |
| 7.17 | Entry panel heading | Pirata One | Propose another | Approved |
| 7.18 | Entry explanation | Body | Name another day or hour. The place is Doom's to choose. | Approved |
| 7.19 | Field labels | Orbitron | DAY and HOUR | Approved; built later |
| 7.20 | Submit | Orbitron | SET IT BEFORE DOOM | Approved |
| 7.21 | Cancel | Orbitron | CANCEL | Approved |
| 7.22 | Replacing an earlier one | Body | This replaces the alternative you gave before. | Approved |
| 7.23 | Received | Body | Your alternative is before Doom. | Approved |
| 7.24 | Own alternative, quiet control | Orbitron | WITHDRAW | Approved |
| 7.25 | Day already past | Body | That day has passed. Name one to come. | Approved |
| 7.26 | Day or hour missing | Body | Name both a day and an hour. | Approved |
| 7.27 | Same as the current proposal | Body | That is the day Doom has proposed. Approve it, or name another. | Approved |

## 8. The decree

`PRODUCT_SPEC.md`, Stage 6.

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 8.1 | Heading | Pirata One | Doom decrees | Approved |
| 8.2 | Date and time | Body, italic | [Date and time, in words] | Approved |
| 8.3 | Venue | Body, italic | At [venue]. | Approved |
| 8.4 | Closing line | Body, italic, bold | Be there. The absent forfeit their voice. | Approved. It answers the summons' own sanction |
| 8.5 | Plan status tag | Orbitron | DECREED | Approved. Kept from the design's placeholder |
| 8.6 | Proposal status tag, before the decree | Orbitron | PROPOSED | Approved. Kept |
| 8.7 | Changed after the decree | Body | Doom has amended the decree. Mark the new day. | Approved |

## 9. Invalid links, errors and waiting

`PRODUCT_SPEC.md`, sections 3.5 and 5.7. Errors are instructions: plain, and never blaming the guest.

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 9.1 | Invalid, cancelled, replaced or expired link: heading | Pirata One | No summons here. | Approved |
| 9.2 | The same: line | Body | This link opens nothing. If Doom summoned you, ask him for your link again. | Approved. Says nothing about whether the link ever worked |
| 9.3 | An action failed | Body | That did not reach the council. Nothing was lost. Try again. | Approved |
| 9.4 | Retry | Orbitron | TRY AGAIN | Approved |
| 9.5 | No connection | Body | No connection. Your answer is not yet recorded. | Approved |
| 9.6 | The council changed while the page was open | Body | The council has changed since you arrived. Reload to see it as it stands. | Approved |
| 9.7 | Reload | Orbitron | RELOAD | Approved |
| 9.8 | Waiting for a response | Body, italic | One moment. | Approved |
| 9.9 | The page failed to load | Body | The hall will not open. Reload, or return in a while. | Approved |
| 9.10 | Dialog close, accessible name | none | Close | Approved |

## 10. Administrator panel

`PRODUCT_SPEC.md`, sections 1.1, 3.8 and 3.9. No administrator screen has been designed, so positions are by function.

The reader here is Doom. The copy is plain and brief, in the same typefaces, without theatrical lines.

### 10.1 Structure

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 10.1 | Panel title | Pirata One | Doom's Council | Approved |
| 10.2 | Section labels | Orbitron | GUESTS, CHARACTERS, PROPOSAL, COUNCIL | Approved |
| 10.3 | Sign-in heading | Pirata One | Doom's Council | Approved |
| 10.3a | Sign-in field label | Orbitron | PASSPHRASE | Retired 18 November 2026: organizers sign in with email and password (13.11 to 13.24) |
| 10.3b | Sign-in button | Orbitron | ENTER | Retired 18 November 2026 (13.8) |
| 10.3c | Wrong passphrase | Body | That is not the passphrase. | Retired 18 November 2026 (13.18) |
| 10.3d | Too many attempts | Body | Too many attempts. Wait a while, then try again. | Approved |
| 10.3e | Sign out | Orbitron | SIGN OUT | Approved |

### 10.2 Guests and links

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 10.4 | Form heading | Pirata One | Summon a guest | Approved |
| 10.5 | Field labels | Orbitron | NAME and TITLE | Approved |
| 10.6 | Title choices | Cinzel | Mr., Ms., Dr., None | Approved |
| 10.7 | Help under the name field | Body | Shown exactly as typed, in capitals and small capitals. | Approved |
| 10.8 | Add | Orbitron | ADD GUEST | Approved |
| 10.9 | Name missing | Body | A guest needs a name. | Approved |
| 10.10 | Statuses | Orbitron | SUMMONED, OPENED, SEATED, DECLINED | Approved. OPENED is seen only here |
| 10.11 | Link actions | Orbitron | COPY LINK, REPLACE LINK, CANCEL LINK | Approved |
| 10.12 | After copying | Body | Link copied. Send it yourself. | Approved |
| 10.13 | Replace link, dialog | Body | The old link will stop working at once. Send the new one. | Approved. Confirm: REPLACE LINK. Cancel: CANCEL |
| 10.14 | Cancel link, dialog | Body | [Title] [Name] will no longer be able to open the summons. | Approved. Confirm: CANCEL LINK. Cancel: KEEP LINK |
| 10.15 | Edit | Orbitron | EDIT NAME | Approved |
| 10.16 | Remove | Orbitron | REMOVE GUEST | Approved |
| 10.17 | Remove, dialog | Body | [Title] [Name] will be removed. Their character is freed, and their approval and alternative are struck out. Their link stops working. | Approved. Confirm: REMOVE GUEST. Cancel: CANCEL |
| 10.18 | No guests | Body | No one has been summoned yet. | Approved |

### 10.3 Characters

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 10.19 | Field label | Orbitron | CHARACTER | Approved |
| 10.20 | Add | Orbitron | ADD CHARACTER | Approved |
| 10.21 | Duplicate name | Body | [Character] is already on the roster. | Approved |
| 10.22 | Row, free | Orbitron | FREE | Approved |
| 10.23 | Row, held | Orbitron, then Cinzel | HELD BY, then [Title] [Name] | Approved |
| 10.24 | Remove | Orbitron | REMOVE | Approved |
| 10.25 | Remove a held character, dialog | Body | [Character] is held by [Title] [Name]. Removing it sends them back to choose again. | Approved. Confirm: REMOVE. Cancel: KEEP |
| 10.26 | Roster empty | Body | The roster is empty. Guests cannot choose until you add characters. | Approved |
| 10.27 | Note | Body | Guests choose for themselves. You cannot assign a character. | Approved |

### 10.4 Proposal, council and the final plan

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 10.28 | Field labels | Orbitron | DAY, HOUR, VENUE | Approved; built later |
| 10.29 | Set the first proposal | Orbitron | SET PROPOSAL | Approved |
| 10.30 | Change it | Orbitron | CHANGE PROPOSAL | Approved |
| 10.31 | Change, dialog | Body | Changing the proposal resets every approval. [n] will be cleared. | Approved. Confirm: CHANGE PROPOSAL. Cancel: CANCEL |
| 10.32 | Approvals | Body, figures in Cinzel | [n] of [total] seated guests approve, then their names | Approved |
| 10.33 | No approvals | Body | No one has approved yet. | Approved |
| 10.34 | Alternatives label | Orbitron | ALTERNATIVES | Approved |
| 10.35 | No alternatives | Body | No alternatives yet. | Approved |
| 10.36 | Note on alternatives | Body | To adopt one, change the proposal to it. | Approved. There is no separate adopt action |
| 10.37 | Finalise | Orbitron | FINALISE THE PLAN | Approved |
| 10.38 | Finalise, dialog | Body | Guests will see this as the decree. They can no longer approve, suggest alternatives or change character. You can still amend it. | Approved. Confirm: FINALISE. Cancel: CANCEL |
| 10.39 | No proposal to finalise | Body | Set a proposal first. | Approved |
| 10.40 | After finalising | Orbitron | AMEND THE PLAN | Approved |
| 10.41 | Amend, dialog | Body | Guests will be shown that the decree changed. | Approved. Confirm: AMEND. Cancel: CANCEL |
| 10.42 | Saved | Body | Saved. | Approved |
| 10.43 | Failed | Body | That did not save. Nothing was changed. Try again. | Approved |
| 10.44 | Data lifetime note | Body | Links stop working and all data is deleted thirty days after the day. | Approved |

### 10.5 Lines added during the build

States the deck did not foresee, written under section 1 and the rule in section 12 ("reuse the nearest existing line"). Plain and brief, like the rest of the panel. Added on 15 November 2026 in milestone 2; the owner may reword any of them.

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 10.45 | Edit name, save | Orbitron | SAVE NAME | Added in the build. Cancel reuses CANCEL |
| 10.46 | A guest whose link was cancelled | Orbitron | NO LINK | Added in the build. REPLACE LINK then issues a new one |
| 10.47 | Proposal, venue missing | Body | Name a venue. | Added in the build. A missing or past day reuses 7.26 and 7.25 |
| 10.48 | Download the whole event | Orbitron | EXPORT | Added in the build. The panel's Export button (`ARCHITECTURE.md`, section 9) |
| 10.49 | Field label, the faction of a new character | Orbitron | FACTION | Added in the build, with the factions (16 November 2026) |

## 11. What changed from the placeholders

| Placeholder | Final | Why |
|---|---|---|
| Choose your name | Choose your mantle | "Name" collides with the guest's own name |
| Each name may be held by one guest. You may choose again until the plan is final. | Each mantle is borne by one guest alone. You may choose again until Doom decrees the day. | The same facts, in his voice |
| Yours, Taken, Approved, Withdraw, Decline, Alternatives | unchanged | They are clear and short, and fit the Orbitron rules |
| Summoned, Seated, Declined, Proposed, Decreed, You | unchanged | As above |
| Your approval is counsel. Doom alone decides, and may change the proposal at any time. | unchanged | It states the approved rule exactly |
| At the Grand Cinema, in the fourth hall. | At [venue]. | The venue is yours to type |
| Friday the eighteenth of December, at half past seven. | the same, with "in the evening" | Morning or evening was not stated |

All approved copy is kept word for word: the opening's two lines and two actions, the whole summons, "Take your seat", "Council of Doom", "The council is seated." with its line, "Doom proposes", the count, "Approve" and "Propose another".

## 12. Decisions closed, and what the build settles

Closed on 15 November 2026:

| Decision | Lines |
|---|---|
| "Mantle" is the guest-facing word for a character. The administrator panel says "character" | Sections 4 to 6 |
| Dates carry the part of day: "in the evening" | Section 1.5 |
| "The Iron Throne" is the opening's title. The administrator panel is titled "Doom's Council" | 2.1, 10.1 |
| After the day has passed, a guest who never answered or had declined sees the closing screen | 4.13, 4.14 |
| Guests learn of a changed proposal or an amended decree from a notice the next time they load the council. Nothing is sent to them | 7.13, 8.7 |
| The administrator signs in with a passphrase (`ARCHITECTURE.md`). Replaced on 18 November 2026 by organizer accounts | 10.3 to 10.3e; section 13 |

Settled in the build, without further wording questions:

- Where "The Iron Throne" sits in the opening.
- The date and time entry controls. Their labels are final.
- Any heading that sits badly in its layout is reworded without a V, in the same voice.
- Wording for a state this deck did not foresee follows section 1 and reuses the nearest existing line.

## 13. The platform

Added on 18 November 2026 for the organizer platform (`PRODUCT_SPEC.md`, section 8): the landing page, organizer accounts, the dashboard and each event's settings. The reader is an organizer, not a guest, so the register is the panel's: plain and brief, in the same typefaces. Guests never see these lines. Headings avoid V and v, as every Pirata One line must. Events have no names (19 November 2026): each is the one summons to the screening, told apart by its day and venue.

### 13.1 Landing page

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 13.1 | Title | Pirata One | The Iron Throne | Added. The same words as 2.1 |
| 13.2 | Lead | Body | A private summons to a night at the cinema. Each friend receives their own link, takes a seat at the council, claims a character, and agrees the day with you. | Added |
| 13.3 | Steps heading | Pirata One | How it goes | Added |
| 13.4 | Step one | Body | Create an event and summon your friends by name. | Added |
| 13.5 | Step two | Body | Send each friend their private link. They need no account and no app. | Added |
| 13.6 | Step three | Body | They answer, claim a character and approve the day you propose. You decree it. | Added |
| 13.7 | Create an account | Orbitron | CREATE AN ACCOUNT | Added |
| 13.8 | Sign in | Orbitron | SIGN IN | Added. Also the sign-in button |
| 13.9 | Notice | Body | A private demonstration, shared by invitation. The characters and their names belong to their owners. This site is not licensed or endorsed by them, and is not for commercial use. | Added. On the landing page and the dashboard |
| 13.10 | Accounts closed | Body | New accounts are by invitation for now. If you have one, sign in. | Added. Shown when registration is closed |

### 13.2 Accounts

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 13.11 | Sign-in heading | Pirata One | Sign in | Added |
| 13.12 | Sign-up heading | Pirata One | Create an account | Added |
| 13.13 | Field labels | Orbitron | NAME, EMAIL and PASSWORD | Added. NAME as in 10.5 |
| 13.14 | Help under the name field | Body | Your name as your guests know you. It starts as the name beneath Doctor Doom in each council. | Added |
| 13.15 | Help under the password field | Body | At least six characters. | Added. Was ten characters until 19 November 2026 |
| 13.16 | Sign-up button | Orbitron | CREATE ACCOUNT | Added |
| 13.17 | Field missing | Body | Fill in every field. | Added |
| 13.18 | Wrong email or password | Body | That email and password do not match an account. | Added |
| 13.19 | Email already used | Body | An account already uses that email. Sign in instead. | Added |
| 13.20 | Password too short | Body | The password needs at least six characters. | Added. As 13.15 |
| 13.21 | Not an email address | Body | That is not an email address. | Added. Too many attempts reuses 10.3d |
| 13.22 | To sign-up | Body | No account yet? Create one. | Added |
| 13.23 | To sign-in | Body | Already have an account? Sign in. | Added |
| 13.24 | Signed in as | Body | Signed in as [Name]. | Added. Sign out reuses 10.3e |

### 13.3 Dashboard and settings

| # | Where | Face | Copy | Standing |
|---|---|---|---|---|
| 13.25 | Dashboard heading | Pirata One | Your councils | Added |
| 13.26 | No events | Body | You have no events yet. Create one to start summoning. | Added |
| 13.27 | New event heading | Pirata One | A new council | Added |
| 13.28 | Field labels | Orbitron | TIME ZONE, NAME BENEATH DOOM | Added. EVENT NAME retired on 19 November 2026 |
| 13.29 | Help under the event name | Body | Only you see it. Guests see the summons, never this name. | Retired 19 November 2026: events have no names |
| 13.30 | Help under the time zone | Body | Every day and hour is set in this zone. It can change only until you propose. | Added |
| 13.31 | Help under the name beneath Doom | Body | Shown beneath Doctor Doom on the guest list. Leave it empty to show Doom alone. | Added |
| 13.32 | Create | Orbitron | CREATE EVENT | Added |
| 13.33 | Event name missing | Body | An event needs a name. | Retired 19 November 2026 |
| 13.34 | An event's figures | Body, figures in Cinzel | [n] summoned, [seated] seated | Added |
| 13.35 | An event's state | Orbitron | NOTHING PROPOSED, PROPOSED, DECREED | Added |
| 13.36 | Open an event | Orbitron | OPEN | Added |
| 13.37 | Back to the dashboard | Orbitron | ALL EVENTS | Added |
| 13.38 | Settings section label | Orbitron | SETTINGS | Added, beside the labels of 10.2 |
| 13.39 | Save settings | Orbitron | SAVE | Added |
| 13.40 | Time zone fixed | Body | The time zone is fixed once a proposal is set. | Added |
| 13.41 | Delete heading | Pirata One | Delete this council | Added |
| 13.42 | Delete, explanation | Body | Every guest, link, character, approval and alternative in it is deleted at once, and every link stops working. This cannot be undone. | Added |
| 13.43 | Delete | Orbitron | DELETE EVENT | Added |
| 13.44 | Delete, dialog | Body | This event and everything in it will be deleted. Every link stops working. | Added. Confirm: DELETE EVENT. Cancel: CANCEL |
