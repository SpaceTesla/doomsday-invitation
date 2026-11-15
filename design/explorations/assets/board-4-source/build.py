# Assemble board IV into one static file. Run from anywhere.
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.chdir(HERE)
import scenes
from scenes import *          # noqa: the template calls these by name

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.normpath(os.path.join(HERE, '..', '..', 'direction-4-the-iron-throne.html'))

EXTRA_DEFS = '''
<linearGradient id="g-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0e14"/><stop offset="1" stop-color="#06080b"/></linearGradient>
<linearGradient id="g-nfloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#11151b"/><stop offset=".5" stop-color="#090b10"/><stop offset="1" stop-color="#040508"/></linearGradient>
<linearGradient id="g-doorshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
<linearGradient id="g-spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2c688" stop-opacity=".34"/><stop offset="1" stop-color="#c9a24a" stop-opacity="0"/></linearGradient>
<linearGradient id="g-plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#283030"/><stop offset=".4" stop-color="#1a2020"/><stop offset="1" stop-color="#101515"/></linearGradient>
<linearGradient id="g-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset=".12" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".06"/><stop offset=".46" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="g-bevel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".3" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>
<linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a6c30"/><stop offset=".45" stop-color="#d9bd78"/><stop offset="1" stop-color="#8f7034"/></linearGradient>
<linearGradient id="g-floorfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060705" stop-opacity="0"/><stop offset=".3" stop-color="#060705"/></linearGradient>
'''

tpl = open('board4.html', encoding='utf-8').read()
css = open('art.css', encoding='utf-8').read() + '\n' + open('board4.css', encoding='utf-8').read()
defs = open('defs.svg', encoding='utf-8').read() + EXTRA_DEFS
ns = dict(vars(scenes))
ns.update(CSS=css, DEFS=defs)


def expand(m):
    v = eval(m.group(1), ns)
    return v if isinstance(v, str) else str(v)


html = re.sub(r'\[\[(.+?)\]\]', expand, tpl)
open(OUT, 'w', encoding='utf-8', newline='\n').write(html)
print('wrote', OUT, len(html) // 1024, 'KB')
