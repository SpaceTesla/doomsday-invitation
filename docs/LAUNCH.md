# The Iron Throne: launch and real-phone checklist

Milestone 7 (`ARCHITECTURE.md`, section 12). Everything here is done by the owner, on the live site, **https://iron-throne.vercel.app**. Nothing in this file is secret.

State on 16 November 2026: milestones 0A to 6 are live. Production is empty (no event, no guests, no characters), and `ADMIN_PASSPHRASE_HASH` is set in Vercel.

## 1. Before anything: what cannot be undone

- **Finalising cannot be taken back.** After FINALISE THE PLAN you can only amend the decree, and every guest is shown that it changed. Do not finalise while testing.
- **Changing the proposal clears every approval.** Set the real day, hour and venue before guests arrive, not a placeholder.
- **The day decides when everything is deleted:** links stop working and all data is deleted thirty days after it.
- **Removing a guest is complete:** their row, approval and alternative go, and their character is freed. Use this to clear test guests.
- **Replacing a link does not replay the opening.** The opening plays once per guest. To watch it again, add a new test guest.

## 2. Set up the event

1. Open `/throne` and sign in with your passphrase. If it is lost, make a new one in your own terminal (`cd web`, `npm run admin:passphrase`), replace `ADMIN_PASSPHRASE_HASH` in Vercel's production settings yourself (`npx vercel env rm ADMIN_PASSPHRASE_HASH production`, then `npx vercel env add ADMIN_PASSPHRASE_HASH production` and paste the hash at its prompt), and redeploy by pushing to `main`. Never paste the passphrase or the hash into a conversation.
2. **CHARACTERS:** add the roster. Guests choose for themselves; you cannot assign.
3. **PROPOSAL:** set the real DAY, HOUR and VENUE (SET PROPOSAL).
4. **GUESTS:** add one test guest for yourself, for example "Test" with no title, and a second with a long name if you want to see the fitting.

## 3. Real-phone checklist

Use at least one iPhone (an older one if you can) and one Android phone. Open the test link the way guests will: **send it to yourself in WhatsApp and tap it there** (the in-app browser), and once more from Instagram's messages. Do one run on mobile data with Wi-Fi off, and one in Low Power Mode (iPhone) or Battery Saver (Android).

For anything that looks wrong, note the phone model, the app it was opened in, and the step; a screen recording helps most.

**The link itself**
- [ ] The preview in the chat shows only "The Iron Throne", "A summons" and "You have been summoned." No name.
- [ ] Sending the link alone does not mark the guest OPENED in the panel (the preview robot runs no script). Tapping it does.

**Opening**
- [ ] The first scene (the closed rubble and Doom's hand) appears within about three seconds on mobile data. The finished frame never flashes up first.
- [ ] The reveal plays smoothly and finishes in about ten seconds: the title, the rubble lifting, Doom lit, the name, the line, the runes, then the two buttons.
- [ ] A tap anywhere during the reveal skips to the end, and a button then works on the first tap.
- [ ] The name is right, with the title, and a long name fits without spilling.
- [ ] Turned sideways, the layout still holds.
- [ ] With reduced motion on (iPhone: Settings, Accessibility, Motion, Reduce Motion; Android: Settings, Accessibility, Remove animations) the opening simply fades in, with no movement.
- [ ] Opening the link again goes straight to the summons.

**Sound** (also the approval by ear left over from milestone 5)
- [ ] GO WITH HIM: the seal turns at the scene change, the plate parts and closes, the seal wakes, and the council has a low room tone. Approve or reject each sound.
- [ ] The SOUND ON / SOUND OFF control works, and the sound fades out when you switch apps and comes back when you return.
- [ ] GO WITHOUT SOUND plays nothing at any point.
- [ ] Note what happens with the iPhone's ring switch on silent. The browser mutes web sound then; that is expected, not a fault.

**Summons and council**
- [ ] The plate parts, the seal wakes, the words are sharp and readable.
- [ ] Declining shows the confirmation, then the closing screen. (Use a second test guest for this, or remove and re-add.)
- [ ] Accepting leads to the council: choose a mantle, see "No mantle yet" without one, approve the proposal, suggest another day and hour (the phone's own date control should open).
- [ ] With two phones on two test guests, a mantle taken on one shows as taken, with its holder's name, on the other after a reload.
- [ ] The leave dialog opens and cancels cleanly.
- [ ] Nothing needs pinching or sideways scrolling, and every button is easy to hit with a thumb.

**The panel on your phone**
- [ ] Sign-in works; COPY LINK puts the link on the clipboard ("Link copied. Send it yourself.").
- [ ] The test guests' statuses, the approvals and the alternatives appear as you acted.

The decree and the day-passed screens are covered by the automated tests. Do not finalise on the live site just to see them. To see them on a phone without touching production, run a production build locally against the sample event (`cd web`, `docker compose up -d`, `npm run seed:local`, `npm run build`, then `npx next start -H 0.0.0.0`; allow it through the Windows firewall if asked) and open the printed links on a phone on the same Wi-Fi, with `localhost` replaced by this computer's address. The development server (`npm run dev`) refuses other devices, so use the build. Locally the panel's sign-in will not work from a phone, because the session cookie is marked secure and the local site is not HTTPS; the guest screens work. To see the decree, sign in to the local panel from this computer's browser at `http://localhost:3000/throne` (a local passphrase: `npm run admin:passphrase -- --local <file>`, then restart the server), finalise there, and reload the guest links on the phone.

When the checklist is done, **REMOVE GUEST** for every test guest.

## 4. Send the links

1. **GUESTS:** add each guest with their title (Mr., Ms., Dr. or none). The name is shown exactly as typed.
2. COPY LINK and send each link **to that guest alone**, yourself. Each link is personal: whoever holds it acts as that guest. Never post links in a group.
3. If a link goes to the wrong person, REPLACE LINK (the old one stops at once) and send the new one; CANCEL LINK stops it without a replacement.

## 5. While guests answer

- GUESTS shows SUMMONED, OPENED, SEATED or DECLINED. COUNCIL shows who holds which mantle, who approves, and the alternatives.
- To adopt an alternative, change the proposal to it. Every approval is cleared, and guests see the new proposal on their next visit.
- When the plan is settled, FINALISE THE PLAN. If it changes afterwards, AMEND THE PLAN; guests are shown the change once.
- EXPORT downloads the whole event. Do it before the thirty days run out if you want to keep anything.

## 6. If something breaks

- A guest sees "The hall will not open": a server error. Tell me the time; the details are in Vercel's runtime logs, which Hobby keeps for under an hour.
- A bad deployment: `npx vercel rollback` returns the production domain to the previous deployment. Migrations are written to keep the previous deployment working.
- Every production deploy keeps a database backup as a GitHub Actions artifact for seven days.
