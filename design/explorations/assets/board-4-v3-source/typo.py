# The typography exploration: candidate faces, the five test strings, three complete combinations and the pair already approved.
# Licence, weights and axes were read from each family's METADATA.pb in the Google Fonts source repository.

STRINGS = ['THE IRON THRONE', 'VICTOR VON DOOM', 'MR. ANISH.', 'DOCTOR DOOM IS HERE TO COLLECT YOU.', 'GO WITH HIM']
MIXED = ['The Iron Throne', 'Victor von Doom', 'Mr. Anish.']

# (key, family, css weight, group, licence, weights available, verdict, notes)
FONTS = [
    # ---- B. Doom-inspired display
    ('grenze', 'Grenze Gotisch', 500, 'B', 'OFL', 'Variable, 100 to 900. No italic.', 'Recommended for display',
     ['Blackletter terminals on a roman skeleton. The faceted o is close to the o of the Doom lettering.',
      'Mixed case reads at a glance. All capitals are dark and slow to read.',
      'Its upright stress sits comfortably beside Bodoni Moda.']),
    ('texturina', 'Texturina', 500, 'B', 'OFL', 'Variable, 100 to 900, optical size 12 to 72, with italics.', 'Runner-up',
     ['A text face with broken curves. The most readable of the group in both cases.',
      'At display size it carries only a hint of the logo.',
      'Would work if the gothic note should stay very quiet.']),
    ('pirata', 'Pirata One', 400, 'B', 'OFL', 'One weight, 400.', 'Not for names',
     ['Condensed and strong, and close to the logo in weight.',
      'The capital V reads as a U, so "Victor" becomes "Uictor".',
      'One weight only.']),
    ('unifraktur', 'UnifrakturCook', 700, 'B', 'OFL', 'One weight, 700. No extended Latin.', 'Rejected',
     ['The truest fraktur here.', 'Capitals set together cannot be read, and the V of "Victor" reads as a D.',
      'A guest with an accented name could not be set.']),
    ('almendra', 'Almendra Display', 400, 'B', 'OFL', 'One weight, 400.', 'Rejected',
     ['An open-face design: each stroke is two thin lines.', 'On a dark ground at interface sizes the letters break up.',
      'No heavier weight to fall back on.']),
    ('cinzel', 'Cinzel', 600, 'B', 'OFL', 'Variable, 400 to 900. Capitals and small capitals only.', 'Too Roman for Doom',
     ['Inscription capitals. Regal and very legible.', 'Nothing of the gothic lettering in it.',
      'No lowercase, so "Mr." and running text are not possible.']),
    # ---- C. Royal editorial
    ('bodoni', 'Bodoni Moda', 500, 'C', 'OFL', 'Variable, 400 to 900, optical size 6 to 96, with italics.', 'Keep: approved',
     ['High contrast, cut like steel engraving. "Mr. Anish." has the most presence here.',
      'Hairlines need 28 px or more on a dark ground.', 'Already approved for names and for Doom\'s spoken lines.']),
    ('cormorant', 'Cormorant Garamond', 600, 'C', 'OFL', 'Variable, 300 to 700, with italics.', 'Runner-up',
     ['Graceful and calligraphic. Softer than Bodoni.', 'Small x-height and light colour: needs about 15 percent more size.',
      'Reads as a wedding invitation sooner than as a decree.']),
    ('ebgaramond', 'EB Garamond', 500, 'C', 'OFL', 'Variable, 400 to 800, with italics.', 'Sound, plain',
     ['Sturdy and bookish. Holds on dark grounds.', 'Neutral: it adds no character of its own.', 'A safe body face.']),
    ('marcellus', 'Marcellus', 400, 'C', 'OFL', 'One weight, 400. No italic.', 'Too limited',
     ['Flared roman capitals with a calm lowercase.', 'One weight and no italic, so no emphasis in the summons.',
      'Close in feel to Cinzel with a lowercase added.']),
    ('spectral', 'Spectral', 400, 'C', 'OFL', 'Seven weights, 200 to 800, with italics.', 'Keep: approved',
     ['Drawn for screens. The most even texture of the group at 16 to 19 px.', 'Quiet beside a display face.',
      'Already approved for everything read at length.']),
    # ---- A. Futuristic technology
    ('orbitron', 'Orbitron', 600, 'A', 'OFL', 'Variable, 400 to 900. No extended Latin.', 'Labels in capitals only',
     ['Square and wide. Unmistakably science fiction.', 'Its 7 and 0 are unusual shapes, so dates and counts can be misread.',
      'Lowercase is hard going at small sizes.']),
    ('michroma', 'Michroma', 400, 'A', 'OFL', 'One weight, 400.', 'Runner-up for labels',
     ['Wide and refined. The closest here to the date line on the Doomsday poster in doom-1.png.',
      'About a fifth wider than the others: long on a phone button.', 'One weight only.']),
    ('oxanium', 'Oxanium', 600, 'A', 'OFL', 'Variable, 200 to 800.', 'Recommended for technical text',
     ['Squared, with clipped corners. Compact enough for buttons.', 'Clear numerals, and it works in mixed case as well as capitals.',
      'Technical without taking over the page.']),
    ('syncopate', 'Syncopate', 700, 'A', 'Apache 2.0', 'Two weights, 400 and 700. No lowercase. No extended Latin.', 'Headline only',
     ['Very wide. Lowercase letters are drawn as small capitals.', 'Cannot set a sentence.', 'Strong as a single short label.']),
    ('rajdhani', 'Rajdhani', 600, 'A', 'OFL', 'Five weights, 300 to 700.', 'Generic',
     ['Condensed and clean. Economical with space.', 'The look of a dashboard, with little link to either logo.',
      'Small on the line: needs a size up.']),
    ('plex', 'IBM Plex Sans', 600, 'A', 'OFL', 'Variable, 100 to 700, with italics.', 'Approved; replaced only if you agree',
     ['Neutral and very readable.', 'Carries no technological character.', 'The face the approved board uses for controls.']),
]
GROUPS = [('B', 'Direction B: Doom-inspired display'), ('C', 'Direction C: royal editorial'), ('A', 'Direction A: futuristic technology')]
ALSO = ('Also rendered and set aside: UnifrakturMaguntia (same faults as UnifrakturCook), Jacquard 24 (drawn on a pixel grid), '
        'New Rocker (reads as a band poster), Metamorphous (reads as a fantasy game), Chakra Petch (close to Rajdhani).')

# (key, name, summary, roles: display, serif, technical, body, upper-case technical?, verdict text)
COMBOS = [
    ('c1', 'One: Crown and machine', 'The approved pair stays. One gothic display face and one technical face are added.',
     dict(display=("'Grenze Gotisch'", 500, 'Grenze Gotisch 500'), serif=("'Bodoni Moda'", 500, 'Bodoni Moda 500, italic 400'),
          tech=("'Oxanium'", 600, 'Oxanium 600 and 500'), body=("'Spectral'", 400, 'Spectral 400, 500, 600, italic')),
     True, 'Recommended'),
    ('c2', 'Two: Doomsday', 'The closest to the two logos, and the loudest.',
     dict(display=("'Pirata One'", 400, 'Pirata One 400'), serif=("'Cinzel'", 500, 'Cinzel 500'),
          tech=("'Orbitron'", 600, 'Orbitron 600'), body=("'Cormorant Garamond'", 500, 'Cormorant Garamond 500, italic')),
     True, 'Not recommended'),
    ('c3', 'Three: Chancery', 'The quietest. The gothic note is only a hint.',
     dict(display=("'Texturina'", 600, 'Texturina 600'), serif=("'Cormorant Garamond'", 600, 'Cormorant Garamond 600'),
          tech=("'Michroma'", 400, 'Michroma 400'), body=("'EB Garamond'", 400, 'EB Garamond 400, 500, italic')),
     True, 'Workable'),
    ('c0', 'As approved', 'For comparison: the faces on the board today.',
     dict(display=("'Bodoni Moda'", 500, 'Bodoni Moda 500'), serif=("'Bodoni Moda'", 500, 'Bodoni Moda 500, italic 400'),
          tech=("'IBM Plex Sans'", 600, 'IBM Plex Sans 500 and 600'), body=("'Spectral'", 400, 'Spectral 400, 500, 600, italic')),
     False, 'Current'),
]
COMBO_NOTES = {
    'c1': ['Guest names and the summons text do not change.', 'Grenze Gotisch appears in a few ceremonial places and always in mixed case.',
           'Oxanium takes over buttons, labels and counts from IBM Plex Sans.', 'Four families, three of them variable.'],
    'c2': ['"Victor" reads as "Uictor" in the display face.', 'Cinzel has no lowercase, so "Mr. Anish." becomes small capitals.',
           'Orbitron\'s numerals make the date and seat counts harder to read.', 'Cormorant is thin for body text on a dark ground.'],
    'c3': ['Everything is readable and nothing clashes.', 'Little of either logo comes through.',
           'Michroma has one weight and runs wide on phone buttons.', 'Guest names lose the engraved sharpness of Bodoni.'],
    'c0': ['Regal and calm.', 'No link to the Doom lettering or to the Doomsday line.'],
}


def fam(family):
    return "'%s'" % family


def specimen_cards(group):
    out = []
    for key, family, w, g, lic, weights, verdict, notes in FONTS:
        if g != group:
            continue
        st = 'font-family:%s,serif;font-weight:%d' % (fam(family), w)
        rows = ''.join('<p class="sp-s sp-s%d" style="%s">%s</p>' % (i, st, t) for i, t in enumerate(STRINGS))
        mixed = '<p class="sp-m" style="%s">%s</p>' % (st, ' &nbsp; '.join(MIXED))
        cls = ' is-rec' if verdict.startswith('Recommended') else (' is-keep' if verdict.startswith('Keep') else '')
        out.append('<article class="sp%s"><header><h4>%s</h4><span class="sp-v">%s</span></header><div class="sp-face">%s%s</div>'
                   '<ul>%s</ul><p class="sp-lic">%s. %s</p></article>'
                   % (cls, family, verdict, rows, mixed, ''.join('<li>%s</li>' % n for n in notes), lic, weights))
    return ''.join(out)


def specimens():
    out = []
    for g, title in GROUPS:
        out.append('<h3 class="sub">%s</h3><div class="sp-grid">%s</div>' % (title, specimen_cards(g)))
    out.append('<p class="lib-note">%s</p>' % ALSO)
    return ''.join(out)


def combos():
    out = []
    for key, name, summary, r, upper, verdict in COMBOS:
        d, se, t, b = r['display'], r['serif'], r['tech'], r['body']
        tcase = 'text-transform:uppercase;letter-spacing:.12em;' if upper else ''
        lock = (
            '<div class="cb-lock">'
            '<p class="cb-label" style="font-family:%s,sans-serif;font-weight:%d;%s">Council of Doom &nbsp; Seat 4 of 7</p>'
            '<p class="cb-title" style="font-family:%s,serif;font-weight:%d">The Iron Throne</p>'
            '<p class="cb-from" style="font-family:%s,serif;font-weight:%d">Victor von Doom</p>'
            '<p class="cb-name" style="font-family:%s,serif;font-weight:%d">Mr. Anish.</p>'
            '<p class="cb-line" style="font-family:%s,serif;font-weight:%d">Doctor Doom is here to collect you.</p>'
            '<p class="cb-body" style="font-family:%s,serif;font-weight:%d">Be it known that Doom has weighed the defenders of this world and found them wanting; that he now gathers a company of his own choosing.</p>'
            '<p class="cb-act"><span class="cb-btn" style="font-family:%s,sans-serif;font-weight:%d;%s">Go with him</span>'
            '<span class="cb-quiet" style="font-family:%s,sans-serif;font-weight:%d">Go without sound</span></p>'
            '</div>') % (t[0], t[1], tcase, d[0], d[1], d[0], d[1], se[0], se[1], b[0], b[1],
                         b[0], b[1], t[0], t[1], tcase, t[0], 500 if t[1] > 500 else t[1])
        roles = ('<dl class="cb-roles"><dt>Display</dt><dd>%s</dd><dt>Supporting serif</dt><dd>%s</dd><dt>Technical</dt><dd>%s</dd><dt>Body</dt><dd>%s</dd></dl>'
                 % (d[2], se[2], t[2], b[2]))
        notes = '<ul class="cb-notes">%s</ul>' % ''.join('<li>%s</li>' % n for n in COMBO_NOTES[key])
        out.append('<article class="cb%s"><header><h4>%s</h4><span class="sp-v">%s</span></header><p class="cb-sum">%s</p>%s%s%s</article>'
                   % (' is-rec' if key == 'c1' else '', name, verdict, summary, lock, roles, notes))
    return ''.join(out)


def licence_rows():
    rows = [
        ('Grenze Gotisch', 'Display', 'SIL Open Font License 1.1', 'Variable 100 to 900', '500, 600', 'One variable file'),
        ('Bodoni Moda', 'Supporting serif', 'SIL Open Font License 1.1', 'Variable 400 to 900, optical size, italics', '500 and italic 400', 'Two variable files (upright, italic)'),
        ('Oxanium', 'Technical', 'SIL Open Font License 1.1', 'Variable 200 to 800', '500, 600', 'One variable file'),
        ('Spectral', 'Body', 'SIL Open Font License 1.1', 'Static 200 to 800 with italics', '400, 500, 600 and italic 400', 'Four static files'),
    ]
    return ''.join('<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>' % r for r in rows)
