# Assemble board IV, revision 3 (final art direction), into one static page. Run from anywhere.
# The page links to the figure layers in ../v3/ and to the unchanged layers in ../v2/.
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.chdir(HERE)
import scenes3
import typo
from art import G, ring

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.normpath(os.path.join(HERE, '..', '..', 'direction-4-the-iron-throne-v3.html'))

EXTRA_DEFS = '''
<linearGradient id="g-plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#283030"/><stop offset=".4" stop-color="#1a2020"/><stop offset="1" stop-color="#101515"/></linearGradient>
<linearGradient id="g-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset=".12" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".06"/><stop offset=".46" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="g-bevel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".3" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>
<linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a6c30"/><stop offset=".45" stop-color="#d9bd78"/><stop offset="1" stop-color="#8f7034"/></linearGradient>
'''

tpl = open('board4v3.html', encoding='utf-8').read()
css = '\n'.join(open(f, encoding='utf-8').read() for f in ('art.css', 'board4v2.css', 'board4v2-additions.css', 'board4v3-additions.css'))
defs = open('defs.svg', encoding='utf-8').read() + EXTRA_DEFS
ns = dict(vars(scenes3))
ns.update(specimens=typo.specimens, combos=typo.combos, licence_rows=typo.licence_rows)
ns.update(CSS=css, DEFS=defs, ring=ring, RUNE_D='%.1f' % ((100 - G['d']['w'] * .72) / 2))


def expand(m):
    v = eval(m.group(1), ns)
    return v if isinstance(v, str) else str(v)


html = re.sub(r'\[\[(.+?)\]\]', expand, tpl)
open(OUT, 'w', encoding='utf-8', newline='\n').write(html)
print('wrote', OUT, len(html) // 1024, 'KB')
