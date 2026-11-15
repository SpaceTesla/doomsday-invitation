# The Iron Throne: product specification

**Doom Proposes, Council Approves.**

This document says what the product does and how people use it. How it looks, moves and sounds is in [`design/DESIGN.md`](../design/DESIGN.md), and its wording is in [`COPY.md`](COPY.md). The three are meant to be read together.

Nothing here has been implemented. This document is approved as the source of truth for the first version, together with `design/DESIGN.md` and `COPY.md`. It makes no choices about architecture, hosting, storage or frameworks; those are in [`ARCHITECTURE.md`](ARCHITECTURE.md).

## How to read this document

| Standing | Meaning |
|---|---|
| **Stated** | You said it in a brief or confirmed it as a decision. |
| **Approved copy** | Wording shown on the approved concept board. |
| **Decided** | A recommendation you accepted. It carries the same weight as Stated. |
| **Deferred** | Depends on how the product is built. Left to the architecture phase, with the requirement it must meet. |
| **Open** | Still needs your input. Listed in section 6. |

Where no standing is given, the item is Stated or Decided; section 7 records which.

## The product in one paragraph

A personalised, shared movie invitation. Doctor Doom is recruiting for his team ahead of *Avengers: Doomsday*. Each guest receives a private link and is addressed by name. They are collected by Doom, handed a royal summons from Latveria, and may accept or decline. Those who accept choose a character that no one else may hold, see who else was summoned, and approve Doom's proposed date, time and venue or suggest another. Doom, who is you, creates the invitations, keeps the roster of characters, watches the answers come in and finalises the plan.

The experience is played straight. Its humour is dry and comes from how seriously Doom takes a cinema trip.

---

## 1. User roles

### 1.1 Administrator: Doctor Doom

You are the administrator and the creator of the invitation. In the fiction you are Doom himself.

The administrator can:

- Create and manage the invitation event.
- Add guests, correct their names and set how each is addressed.
- Generate a personalised invitation link for each guest, and cancel or replace it.
- Remove a guest, including one who has already answered.
- View guest responses, including who has opened their link without answering.
- Manage the roster of characters guests may choose from: add characters and remove them.
- Review character selections.
- Propose the date, time and venue, and change the proposal.
- See the approval count and who approved.
- Review the alternatives guests suggest.
- Finalise the plan, and change it afterwards.

The administrator does not assign characters. Guests choose their own, independently.

These functions live in an administrator panel that guests cannot reach (section 3.8).

Doom is not a guest. He does not accept a summons, does not choose a character, and is never offered as a character to others. On the guest list he appears as its sovereign (`design/DESIGN.md`, section 8.9).

### 1.2 Guest: a recruited individual

Each guest receives one individual link.

A guest can:

- View their personalised invitation.
- Accept or decline it, and change that answer within the limits of Stage 2.
- Select a character from those currently available, and change it until the plan is final.
- View the other guests.
- View the proposed date, time and venue.
- Approve the current proposal, and withdraw that approval.
- Suggest an alternative date or time, and withdraw it.
- See how many of the council have approved.
- See the current state of the plan, and the confirmed details once it is final.

A guest cannot see any other guest's link, cannot act for another guest, and cannot reach administrator functions.

There is no third role. There is no public visitor: someone without a valid link sees nothing about the event (section 3.5).

---

## 2. Guest journey

Six stages. The first three are a ceremony the guest moves through once. The last three are the council, which the guest returns to.

The scenes run in this order: the opening, then the summons, then the throne hall as the setting of the council.

### Stage 1: Personalised summons

The guest opens their unique link.

1. The cinematic opening plays (`design/DESIGN.md`, sections 6.2 to 6.4). Doom is revealed from behind rubble.
2. Two lines appear:

   > [Title] [Guest Name].
   >
   > Doctor Doom is here to collect you.

3. Two actions appear (**Approved copy**):
   - **Go with him.** Continues with sound.
   - **Go without sound.** Continues in silence.

How the guest is addressed:

- Each guest has a title, set by you when you add them: Mr., Ms., Dr., or none. With a title the first line reads "Mr. Anish." With none it is the name alone: "Anish."
- The name is stored exactly as you typed it. It is displayed in capitals and small capitals, because the typeface used for names has no lowercase (`design/DESIGN.md`, section 2.2). The capitals you typed remain the larger letters.

Notes:

- "Go with him" is not acceptance of the invitation. It moves the guest on to the summons.
- The opening can be skipped by any key or tap, and it plays once per guest.
- The title "The Iron Throne" appears in the opening only, not on the summons or the council (`design/DESIGN.md`, section 1.1).
- On later visits the guest lands where they left off: on the summons if they have not answered, on the council if they have accepted.

### Stage 2: Acceptance

The guest is shown the royal summons: a steel plate bearing their name (`design/DESIGN.md`, section 8.4).

Wording (**Approved copy**):

> **Victor von Doom**, by his own hand and will Sovereign of Latveria, to **[Title] [Guest Name]**, greeting.
>
> Be it known that Doom has weighed the defenders of this world and found them wanting; that he now gathers a company of his own choosing; and that you have been chosen.
>
> You are therefore summoned to take your seat at the Council of Doom, where the day, the hour and the place shall be set before you.
>
> Let none who is called fail to answer. The absent forfeit their voice.
>
> Given at Castle Doom, in Doomstadt, the [day] day of [month], [year in Roman numerals].

The dating clause carries the day the guest's invitation was created.

**Accepting.** The action is labelled **Take your seat** (**Approved copy**). The guest becomes seated and goes on to choose a character.

**Declining.**

- A quiet control sits beside "Take your seat".
- Choosing it opens a confirmation, because it may have been pressed by mistake.
- On confirming, the guest sees a short closing screen in Doom's voice.
- A declined guest does not see the council or the plan.
- A guest who declined can open their link again and accept, until the day of the screening.

**Withdrawing.**

- A seated guest can withdraw until the plan is final. They then count as declined.
- Withdrawing frees their character and removes their approval and their alternative.
- It is confirmed first, like declining.
- After the plan is final a seated guest can no longer withdraw.

The wording for the decline and withdraw controls, their confirmations and the closing screen has not been written (section 6, part B).

### Stage 3: Character selection

After accepting, the guest chooses a character from *Avengers: Doomsday*.

- **One guest per character.** A character can be held by only one guest. Once chosen, it is unavailable to everyone else.
- **Guests choose for themselves.** The administrator does not assign characters.
- **Only available characters can be chosen.** A guest chooses from the roster as it stands at that moment, less the characters already taken.
- **Taken characters are visibly marked as unavailable, and show who holds them.** They stay on view; they are not hidden.
- **A guest can change their choice until the plan is final.** Their previous character becomes available to others again.
- **Simultaneous choices are handled safely.** If two guests pick the same character at the same moment, exactly one gets it. The other is told plainly that it has just been taken and chooses again. No guest is ever left holding a character that someone else also holds.
- **Doom is not on the roster.** You are Doom.
- **In guest-facing wording a character is called a mantle** (`COPY.md`). This document and the administrator panel say character.
- **Characters are shown by name** in the first version. Marks or artwork for each character are a later possibility (section 4.3).

The roster:

- You manage it from the administrator panel, adding and removing characters (section 3.9).
- Examples you gave: Thor, Loki, Scarlet Witch, Hulk, and other relevant characters. The actual roster is yours to enter; this document does not assume the film's cast.

Presentation is in `design/DESIGN.md`, section 8.6. No character artwork exists, and studio images must not be used.

### Stage 4: Council guest list

The guest can see everyone who was summoned. For each:

- Guest name.
- Acceptance status: summoned and not yet answered, seated, or declined.
- Selected character, if any.

Guests who have declined and guests who have not yet answered are listed, with their status.

The list never exposes invitation links, tokens or any administrator information.

Presentation is in `design/DESIGN.md`, sections 8.7 and 8.9.

### Stage 5: The proposal and the council's approval

Doom proposes. The council approves. Doom decides.

The proposal:

- Doom proposes the date, the time and the venue. There is one current proposal.
- Doom can change it at any time before finalising.
- **Changing the date, the time or the venue resets all existing approvals.** The count starts again at zero, and guests are shown that the proposal has changed.

Approving:

- A seated guest can approve the current proposal.
- A guest can withdraw their approval.
- Each guest has at most one approval of the current proposal. Approving twice counts once.
- **Approval is advisory.** It is not required, and no number of approvals forces or blocks anything.
- **Doom retains final authority.** Only the administrator finalises the plan, at any time, whatever the count.

The count:

- The council displays the approval count against the number of seated guests, as on the board's sample: "3 of 7 seats have approved".
- Guests see the number only.
- The names of those who approved are shown to Doom in the administrator panel.

Alternatives:

- A guest can suggest an alternative date or time. A guest cannot suggest an alternative venue.
- A guest may both approve the current proposal and suggest an alternative.
- Each guest has one active alternative. Suggesting another replaces it.
- Alternatives are visible to every seated guest, with the name of the guest who suggested each.
- There is no separate step for adopting an alternative. Doom adopts one by changing the proposal to it.

- A guest can withdraw their alternative without replacing it.

This mechanism is accepted for the first version and is expected to change. See section 5.9.

Presentation is in `design/DESIGN.md`, section 8.8. The controls for entering a date and time have not been designed.

### Stage 6: Confirmation

Once Doom finalises the plan, guests see the confirmed details: the date, the time and the venue. The screen keeps the Latverian Council theme.

- The confirmed details replace the proposal wherever it was shown.
- After finalising, guests can no longer approve, suggest alternatives or change character.
- Doom can change the plan after finalising. Guests are shown that it changed.
- A guest who declined does not see the plan.

### Returning guests

A guest may open their link many times, and always lands where they left off.

The guest's progress is remembered against their link, not only in their browser. Guests will often open the link inside a messaging app's built-in browser and later in their normal browser, and those do not share stored data.

The council shows its current state when the page is loaded. In the first version it does not update while the guest is looking at it; a reload shows the latest. A guest learns that the proposal changed or the decree was amended from a notice the next time they load the council. Nothing is sent to them.

---

## 3. Invitation management

### 3.1 Unique guest links

- Each guest has exactly one link, and each link belongs to exactly one guest.
- A link is the guest's only credential. There are no guest accounts or passwords.
- A link cannot be guessed, and knowing one link gives no help in finding another.
- You generate the links and send them yourself. The product sends no messages.
- You can cancel a guest's link, or replace it with a new one. The old link then behaves as an invalid link (section 3.5).

### 3.2 Personalised names

- You enter each guest's name and title when adding them. Guests do not type their own name.
- The name appears in the opening, on the summons and on the guest list, exactly as entered.
- You can correct a name or title afterwards.
- Names are shown in Latin letters and are never written in runes (`design/DESIGN.md`, section 4.1).
- A name with accented letters must display correctly. The typeface used for names has them.
- On the opening and the summons a name is displayed in capitals and small capitals.
- Long names must fit. The layouts were drawn with a five-letter placeholder ("Anish") and must be tested against long names.

### 3.3 Guest status

| Status | Meaning | Becomes |
|---|---|---|
| Summoned | Invitation created; no answer yet | Seated or Declined, by the guest, until the day of the screening |
| Seated | The guest accepted | Declined, if the guest withdraws before the plan is final |
| Declined | The guest refused or withdrew | Seated, if the guest returns and accepts, until the day of the screening |

A seated guest either has or has not chosen a character, and either does or does not approve the current proposal.

The administrator can also see whether a summoned guest has opened their link.

### 3.4 Invitation lifecycle

1. You create the event, enter the roster of characters, and set a first proposed date, time and venue.
2. You add guests and generate their links.
3. You send each link to its guest, outside the product.
4. Guests open, answer, choose characters, approve the proposal and suggest alternatives, in any order and at any time.
5. You review the approvals and alternatives, and may change the proposal or the roster.
6. You finalise the plan.
7. Guests see the confirmed details.
8. A guest who has not yet answered, or who declined, can still accept until the day of the screening.
9. After the day of the screening, a guest who never answered or had declined sees a closing screen (`COPY.md`, section 4.3).
10. Thirty days after the screening, the links stop working and the event's data is deleted.

A guest who accepts after the plan is final still chooses a character. Changing an existing choice stops when the plan is final; a first choice does not.

### 3.5 Invalid links

A link that matches no guest, or that has been cancelled, replaced or has expired, shows a single screen that:

- Stays in the visual world of the product.
- Says plainly that the link is not valid.
- Reveals nothing about the event, its guests or its date.
- Does not say whether the link was once valid.
- Offers no way to browse or guess.

Its wording and design do not exist yet (`design/DESIGN.md`, section 11.3).

### 3.6 Repeated submissions

- Repeating the same action has no further effect. Accepting twice leaves the guest seated once; pressing a button twice makes one submission.
- A reload or a second device never creates a duplicate guest, a second character choice, a second approval or a duplicate alternative.
- If two guests choose the same character at the same moment, exactly one succeeds. The other is told plainly and can choose again.
- A guest who changes character holds the new one and releases the old one in a single step. They are never left holding two, or none by accident.
- A new alternative from the same guest replaces their earlier one.
- Withdrawing an approval or an alternative that is already withdrawn has no effect.

### 3.7 Declined invitations

- Declining is confirmed before it takes effect.
- You see that the guest declined.
- The guest sees a closing screen, and nothing of the council or the plan.
- The guest can return and accept until the day of the screening.
- A declined guest's character, if they held one, becomes available again. Their approval and their alternative, if any, are removed.

### 3.8 Administrator access

- Administrator functions are never reachable from a guest link.
- Only the administrator can see links, add or remove guests, change the roster of characters, change the proposal, see who approved, or finalise.
- The administrator can see who holds each character, but cannot assign or reassign one.
- The administrator signs in with a passphrase, separately from any guest link. The mechanism is in `ARCHITECTURE.md`, section 7.3.
- No administrator screens have been designed. They need not follow the full cinematic treatment, but use the same plates, type and palette (`design/DESIGN.md`, section 8).

Removing a guest who has already answered frees their character and removes their approval and their alternative. Their link then behaves as an invalid link.

### 3.9 The character roster

- The roster is the list of characters guests may choose from. You add to it and remove from it in the administrator panel.
- A guest sees every character on the roster, with taken ones marked unavailable and showing who holds them, and can choose only one that is free.
- Adding a character makes it available at once.
- Removing a character that no one holds takes it off the list.
- **Removing a character that a guest holds:** you are warned first, naming the guest. If you go ahead, the character is removed and that guest is returned to character selection, with a message explaining why.
- The panel prevents two roster entries with the same name.

---

## 4. Functional requirements

### 4.1 Must have

Administrator:

1. Create the invitation event.
2. Add guests by name, with a title.
3. Generate a unique, personalised link for each guest.
4. View every guest's response.
5. Manage the guest list.
6. Add characters to the roster and remove them, with a warning when a removed character is held.
7. Review character selections, without assigning them.
8. Propose the date, time and venue, and change the proposal.
9. See how many guests have approved the current proposal, and who.
10. Review alternatives suggested by guests.
11. Finalise the plan, whatever the approval count.

Guest:

12. Open a personal link and see the opening addressed to them by title and name.
13. Continue with or without sound.
14. Read the personalised summons.
15. Accept or decline.
16. Choose a character from those available, after accepting.
17. Change their character until the plan is final, which frees the previous one.
18. See taken characters marked as unavailable, with who holds them.
19. See everyone summoned, with name, status and character.
20. See the current proposed date, time and venue.
21. Approve the current proposal, and withdraw the approval.
22. See the approval count against seated guests.
23. Suggest an alternative date or time, and see the alternatives others suggested.
24. See the current state of the plan.
25. See the confirmed details once the plan is final.

System:

26. Let no character be held by more than one guest, including when two choose at the same moment.
27. Reset approvals when the proposal changes.
28. Show nothing about the event to an invalid link.
29. Never expose one guest's link or any administrator information to another guest.
30. Handle repeated and simultaneous submissions without duplicates (section 3.6).
31. Keep approval advisory: no count enables or prevents finalising.
32. Honour reduced motion and silent mode throughout (`design/DESIGN.md`, sections 6.9 and 6.10).
33. Work on phones and on desktop (`design/DESIGN.md`, section 7).

### 4.2 Should have

1. Remember each guest's progress against their link, so a return visit resumes where they left off.
2. Play the opening once per guest and allow it to be skipped.
3. A sound control reachable on every screen after the opening.
4. Confirmation before declining.
5. Show the administrator which guests have opened their link but not answered.
6. Let the administrator copy a guest's link easily.
7. Let the administrator correct a guest's name and title.
8. Show a guest that their alternative was received.
9. A link preview (title and image) that does not reveal the guest's name or the event details to anyone the link is forwarded to.
10. Let the administrator cancel or replace a guest's link, and remove a guest.
11. Let the administrator change the plan after finalising, with guests shown that it changed.

### 4.3 Could have

1. Let a guest replay the opening.
2. Add the confirmed plan to the guest's calendar.
3. Show guests when the council last changed.
4. Let the administrator leave a short note with a proposal, in Doom's voice.
5. Themed marks or artwork for each character, if a source is agreed.
6. A motion control alongside the sound control.
7. The council updating while a guest is looking at it.

### 4.4 Explicitly out of scope

1. Ticket booking, seat selection or payment.
2. Sending invitations by email, text or messaging app from within the product.
3. Guest accounts, passwords or social sign-in.
4. Public sign-up or self-invitation.
5. Chat or comments between guests.
6. More than one event at a time, or reuse for other films.
7. Guests inviting other guests.
8. Any use of studio imagery, logos or audio.
9. Imitating Doom's voice.
10. Analytics or tracking beyond what the administrator's view needs.
11. Guests suggesting alternative venues.
12. The administrator assigning characters.

---

## 5. Non-functional requirements

Targets marked "research" come from desk research that was never checked in a real browser. Treat them as starting points.

### 5.1 Security

- Guest links cannot be guessed or enumerated.
- A guest link grants that guest's actions and nothing else.
- Administrator functions require separate proof of identity (mechanism **Deferred**).
- Links must not leak to third parties: the pages load no third-party resources that receive the address. Fonts are hosted by us (`design/DESIGN.md`, section 2.2).
- Repeated failed attempts to find valid links are limited.
- Everything is served over an encrypted connection.

### 5.2 Privacy

- The site is private to the guests. It asks search engines not to index it, and its link previews reveal nothing.
- The product holds only what it needs: guest names and titles, their answers, their characters, their approvals, their alternatives, and the plan.
- Guest names, statuses, characters and alternatives are visible to the other guests of the same event. Who approved is visible only to the administrator.
- An invalid link learns nothing.
- The event's data is deleted thirty days after the screening.

### 5.3 Responsive performance

- Designed first for a phone opened from a messaging app, on mobile data, possibly in Low Power Mode (research).
- First scene visible within about 2.5 seconds, response to a tap within 200 ms, no visible layout jumps (research).
- Load only what the first scene needs. Later scenes and all audio load after the guest's first action.
- The council screens respond immediately and scroll natively. They carry no heavy animation.

### 5.4 Accessibility

- Target: WCAG 2.2 level AA.
- Every action works by keyboard, with visible focus.
- The summons, the guest's name, the guest list and the plan are real text in reading order.
- Rune inscriptions are decoration and are hidden from assistive technology.
- Status is never given by colour alone.
- No action depends on press-and-hold or drag.
- No information is given by sound alone.

### 5.5 Animation performance

- Animation is timed by elapsed time, so it takes the same time at 30 frames a second as at 60.
- The opening uses flat layers only: movement, a small scale and cross-fades. No 3D.
- With reduced motion, every sequence becomes a short cross-fade to its end state and nothing is lost.
- Animation never delays an action the guest has taken.

### 5.6 Audio behaviour

- Silent until the guest's first action. "Go without sound" is always offered.
- The guest's choice persists for the visit, and sound never restarts by itself.
- Sound stops when the tab is hidden.
- No music bed and no voice.
- The experience is complete in silence.
- No audio exists yet (`design/DESIGN.md`, section 6.8).

### 5.7 Reliability

- A guest's answer, once shown as accepted, is not lost.
- If something fails, the guest is told plainly, in the product's own voice, and can try again without losing what they entered.
- The opening degrading (a slow connection, a missing layer, no sound) never blocks the guest from reaching the summons.
- A guest who loses connection mid-way resumes from their last saved step.

### 5.8 Data consistency

- Each guest has one status, at most one character, at most one approval of the current proposal, and at most one active alternative.
- No two guests ever hold the same character, even when they choose at the same moment.
- What a guest sees as available can be out of date by the time they choose, because the council does not update while it is open. The choice is checked when it is made, not when the list was shown.
- A change of character frees the old one and takes the new one together, or does neither.
- There is one current proposal at a time, and one final plan.
- The approval count always equals the number of seated guests who currently approve the current proposal. It never includes approvals of an earlier proposal, of a declined guest or of a removed guest.
- Finalising is a single act: guests see either the proposal or the final plan, never a mixture.
- Every guest sees the same state of the council after a reload.

### 5.9 Room to change

The approval mechanism is accepted for the first version and is expected to change. The product should not be built so that changing it means reworking the journey. Each of these should be changeable by itself:

- Whether approval is advisory or required before finalising.
- Who counts towards the total.
- Whether approvals reset when the proposal changes.
- What guests may suggest as an alternative (date, time, venue).
- Whether approvals are shown as a number or by name.

This is a requirement on the next phase's planning. It decides nothing about how the product is built.

---

## 6. Open questions

Short, because the recommendations were accepted. Decisions are logged in section 7.

### A. Needs your input

Nothing in this document. The one open question in the project is about artwork and is in `design/DESIGN.md`, section 11.2.

### B. Awaiting material from this project

Not questions, but nothing is final until you have approved it.

- **Copy.** Approved in [`COPY.md`](COPY.md) on 15 November 2026. Before it, no wording existed for: the decline and withdraw controls, their confirmations and the closing screen; character selection, including the message when a character has just been taken or has been removed; the guest list; the proposal, the approval and the "proposal changed" notice; confirmation; the invalid link; errors; and every administrator screen. Drafts in Doom's voice will be prepared for your approval.
- **Screens.** No council or administrator screen has been designed (`design/DESIGN.md`, section 11.3).

### C. Deferred to architecture

- How the administrator proves who they are (section 3.8).
- How progress is remembered against a link, how simultaneous choices are made safe, and how the opening is known to have played. The requirements are in sections 3.6 and 5.8; the means are not chosen here.

---

## 7. Decisions confirmed

All dated 15 November 2026. Numbers in the "Was" column are the open-question numbers of the first draft, kept so earlier notes can be traced.

### 7.1 Stated by you: characters and approval

| Decision | Was |
|---|---|
| A character can be selected by only one guest. Once selected it is unavailable to everyone else | 5 |
| If a guest changes their selection, their previous character becomes available again | 7 |
| The administrator manages the roster in the administrator panel, adding and removing characters | 6 |
| Guests choose their own characters. The administrator does not assign them | new |
| Taken characters are visibly marked as unavailable | new |
| Simultaneous attempts to select the same character are handled safely | new |
| Doom proposes the date, time and venue | 10 |
| Guests can approve the current proposal; the council displays the approval count | 9 |
| Guests can suggest alternative dates or times | 9 |
| Approval is advisory. Doom retains final authority to finalise | 9 |
| The approval mechanism is for the first version and should stay flexible | new |

### 7.2 Stated by you: questions 23 to 28

| Decision | Was |
|---|---|
| Removing a held character: warn Doom, then remove it and return the affected guest to character selection | 23 |
| Taken characters show who currently holds them | 24 |
| Changing the date, time or venue resets all existing approvals | 25 |
| The count is displayed against seated guests. Individual names are shown in the administrator panel | 26 |
| Guests may suggest alternative dates or times, but not alternative venues | 27 |
| Guests can withdraw an approval, and can approve and suggest an alternative at the same time | 28 |

### 7.3 Accepted recommendations

| Decision | Was |
|---|---|
| A title is stored per guest (Mr., Ms., Dr., or none), set by you. With none, the line is the name alone | 1 |
| The name is shown exactly as you type it. Layouts are tested against long names | 2 |
| The scenes run: opening, summons, then the hall as the setting of the council | 3 |
| Declining: a quiet control beside "Take your seat", a confirmation, a closing screen in Doom's voice, and the ability to return and accept. The cut-off for returning was later set to the day of the screening (section 7.4) | 4 |
| A guest can change character until the plan is final | 7 |
| Characters are shown by name in the first version. Marks or artwork are a could-have | 7a |
| Guests who declined or have not answered are listed, with their status | 8 |
| Alternatives are visible to all with the proposer's name. One active alternative per guest, replaceable | 11 |
| You can change the plan after finalising. Guests are shown that it changed | 12 |
| Administrator access must be separate from guest links. The mechanism is deferred to architecture | 13 |
| You send the links yourself. The product sends nothing | 14 |
| You can cancel or replace a guest's link, and remove a guest who has already answered | 15 |
| Late answers are allowed until the day. Links stop working and data is deleted a set time after, later set to thirty days (section 7.4) | 16 |
| The council updates on reload in the first version | 17 |
| The dating clause carries the day the invitation was created | 18 |
| Draft copy in Doom's voice will be prepared for your approval | 19 |
| The tone is played straight, with dry humour | 20 |
| The site stays private to the guests | 21 |
| The Should, Could and Out-of-scope lists stand as written | 22 |
| The accessibility target is WCAG 2.2 level AA | first-draft default |
| First-draft defaults now decided: no guest accounts; the opening plays once and can be skipped; guests resume where they left off; declining is confirmed; a declined guest sees no plan and frees their character; nothing can be approved or suggested after finalising; no two roster entries share a name | first-draft defaults |

### 7.4 Accepted recommendations, second round

| Decision | Was |
|---|---|
| A seated guest can withdraw until the plan is final, freeing their character and removing their approval and alternative | A1 |
| A guest can withdraw an alternative without replacing it | A2 |
| Links stop working and data is deleted thirty days after the screening | A3 |
| A guest who never answered and a guest who declined may both accept until the day of the screening | A4 |

### 7.5 Stated by you: typography

Typography is the combination "Two: Doomsday": Pirata One, Cinzel, Orbitron and Cormorant Garamond. It is a design decision and is specified in `design/DESIGN.md`, section 2.2. Its one effect on this document is that guest names are displayed in capitals and small capitals (Stage 1; section 3.2).

The typography review board was approved the same day: its sizes, body treatment, long-name rules and council layout. Two points touch this document: the summons may scroll on a phone for a rare long name, and the council's wording on that board is provisional until the copy review (section 6, part B).

Decisions about how the product looks are logged in `design/DESIGN.md`, section 11.1.
