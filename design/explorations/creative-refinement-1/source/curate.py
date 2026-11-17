"""Copy a curated set of the audit captures (the running app, 16 November 2026) into
../current as JPEGs, cropped to one screen. These are the CURRENT state, unretouched.

Usage: python curate.py <folder of audit captures>
"""
import os
import sys

from PIL import Image

src = sys.argv[1]
out = os.path.join(os.path.dirname(__file__), "..", "current")
os.makedirs(out, exist_ok=True)

PICKS = {
    # the council and its steps
    "council-step1-phone": "phone-F-council-step1.png",
    "council-step1-desktop": "desktop-F-council-step1.png",
    "council-step3-phone": "phone-I-council-step3.png",
    "council-step3-desktop": "desktop-I-council-step3.png",
    # the mantle
    "mantle-phone": "phone-H-mantle-step2.png",
    "mantle-desktop": "desktop-H-mantle-step2.png",
    "mantle-hover-desktop": "desktop-H-mantle-hover-loki.png",
    "mantle-yours-phone": "phone-J-mantle-yours.png",
    # the proposal and the decree
    "proposal-phone": "phone-K-proposal-approved-full.png",
    "decree-phone": "phone-R-decree-step1.png",
    "decree-desktop": "desktop-R-decree-step1.png",
    # the summons transition, as it plays now
    **{f"summons-desktop-{t}": f"desktop-C-summons-{t}.png" for t in ("0010", "0045", "0080", "0145", "0240", "0600")},
    **{f"summons-phone-{t}": f"phone-C-summons-{t}.png" for t in ("0010", "0045", "0080", "0145", "0240", "0600")},
    "iris-desktop-0030": "desktop-E-iris2-0030.png",
    "iris-desktop-0066": "desktop-E-iris2-0066.png",
    # the closed screens
    "closing-phone": "phone-P-closing.png",
    "daypassed-phone": "phone-T-day-passed-unanswered.png",
    "invalid-phone": "phone-Q-invalid-link.png",
    "closing-desktop": "desktop-P-closing.png",
    # Doomscript as it appears now: the opening signature
    "opening-phone": "phone-A-opening-1320.png",
}
for name, file in PICKS.items():
    im = Image.open(os.path.join(src, file)).convert("RGB")
    h = 844 if im.width == 390 else 900
    im = im.crop((0, 0, im.width, min(im.height, h)))
    im.save(os.path.join(out, f"{name}.jpg"), quality=84)
print(len(PICKS), "images")
