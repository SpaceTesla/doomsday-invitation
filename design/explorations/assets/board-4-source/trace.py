# Trace the glyphs in the fan-made decoder image into vector outlines.
# Marching squares with linear interpolation on a soft coverage field, then
# Douglas-Peucker simplification. Pure Pillow, nothing installed.
from PIL import Image
import json, math, sys
src=sys.argv[1]
im=Image.open(src).convert('RGB'); px=im.load()
COLS=[(56,384),(410,738),(764,1092),(1118,1446)]
ROWS=[242,516,790,1064,1338,1612]
NAMES=[['a','c','k','d'],['e','i','f','v'],['g','h','j','l'],['m','n','o','p'],['r','s','t','u'],['x1','x2']]
BG=(10,22,16)
def field(x0,y0,x1,y1):
    # glyph colour = most saturated pixel in the region
    best=None;bd=0
    for y in range(y0,y1):
        for x in range(x0,x1):
            p=px[x,y]; d=sum((p[i]-BG[i])**2 for i in range(3))
            if d>bd: bd=d;best=p
    v=[best[i]-BG[i] for i in range(3)]; n=sum(c*c for c in v)
    F=[[0.0]*(x1-x0) for _ in range(y1-y0)]
    for y in range(y0,y1):
        for x in range(x0,x1):
            p=px[x,y]
            t=sum((p[i]-BG[i])*v[i] for i in range(3))/n
            F[y-y0][x-x0]=max(0.0,min(1.0,t))
    return F
def contours(F,lvl=0.5):
    h=len(F);w=len(F[0])
    segs=[]
    def ip(ax,ay,av,bx,by,bv):
        t=(lvl-av)/(bv-av)
        return (ax+(bx-ax)*t, ay+(by-ay)*t)
    for y in range(h-1):
        for x in range(w-1):
            a=F[y][x];b=F[y][x+1];c=F[y+1][x+1];d=F[y+1][x]
            idx=(a>lvl)*8+(b>lvl)*4+(c>lvl)*2+(d>lvl)*1
            if idx in (0,15): continue
            T=lambda:ip(x,y,a,x+1,y,b)
            R=lambda:ip(x+1,y,b,x+1,y+1,c)
            B=lambda:ip(x,y+1,d,x+1,y+1,c)
            L=lambda:ip(x,y,a,x,y+1,d)
            tbl={1:[(L,B)],2:[(B,R)],3:[(L,R)],4:[(T,R)],6:[(T,B)],7:[(L,T)],8:[(T,L)],9:[(T,B)],
                 11:[(T,R)],12:[(L,R)],13:[(B,R)],14:[(L,B)]}
            if idx==5:
                m=(a+b+c+d)/4
                pairs=[(L,T),(B,R)] if m>lvl else [(L,B),(T,R)]
            elif idx==10:
                m=(a+b+c+d)/4
                pairs=[(T,R),(L,B)] if m>lvl else [(T,L),(B,R)]
            else: pairs=tbl[idx]
            for p,q in pairs: segs.append((p(),q()))
    # stitch
    key=lambda p:(round(p[0]*1000),round(p[1]*1000))
    adj={}
    for i,(p,q) in enumerate(segs):
        adj.setdefault(key(p),[]).append((i,0)); adj.setdefault(key(q),[]).append((i,1))
    used=[False]*len(segs); loops=[]
    for i in range(len(segs)):
        if used[i]: continue
        used[i]=True; loop=[segs[i][0],segs[i][1]]
        while True:
            k=key(loop[-1]); nxt=None
            for j,e in adj.get(k,[]):
                if not used[j]: nxt=(j,e);break
            if nxt is None: break
            j,e=nxt; used[j]=True
            loop.append(segs[j][1-e])
        if key(loop[0])==key(loop[-1]): loop.pop()
        if len(loop)>=3: loops.append(loop)
    return loops
def dp(pts,eps):
    if len(pts)<3: return pts
    a=pts[0];b=pts[-1]; dx=b[0]-a[0];dy=b[1]-a[1];L=math.hypot(dx,dy)
    md=0;mi=0
    for i in range(1,len(pts)-1):
        p=pts[i]
        d=abs(dy*(p[0]-a[0])-dx*(p[1]-a[1]))/L if L>1e-9 else math.hypot(p[0]-a[0],p[1]-a[1])
        if d>md: md=d;mi=i
    if md>eps: return dp(pts[:mi+1],eps)[:-1]+dp(pts[mi:],eps)
    return [a,b]
def simplify_closed(loop,eps):
    # split at the two farthest-apart points so the closed loop simplifies cleanly
    n=len(loop); i0=0
    j0=max(range(n),key=lambda j:(loop[j][0]-loop[0][0])**2+(loop[j][1]-loop[0][1])**2)
    A=loop[i0:j0+1]; Bp=loop[j0:]+[loop[0]]
    out=dp(A,eps)[:-1]+dp(Bp,eps)[:-1]
    return out
def area(l): return sum(l[i][0]*l[(i+1)%len(l)][1]-l[(i+1)%len(l)][0]*l[i][1] for i in range(len(l)))/2
glyphs={}; raw={}
for r,row in enumerate(NAMES):
    for c,name in enumerate(row):
        x0,x1=COLS[c]; y0=ROWS[r]
        F=field(x0+6,y0+6,x1-6,y0+135)
        loops=[l for l in contours(F) if abs(area(l))>6]
        xs=[p[0] for l in loops for p in l]; ys=[p[1] for l in loops for p in l]
        raw[name]=(loops,min(xs),max(xs),min(ys),max(ys))
        print(name,'bbox w %.1f h %.1f top %.1f'%(max(xs)-min(xs),max(ys)-min(ys),min(ys)+y0+6),'loops',len(loops))
H=max(v[4]-v[3] for v in raw.values())
top=min(v[3] for v in raw.values()); bot=max(v[4] for v in raw.values())
print('common top/bot',top,bot,'H',H)
S=100/(bot-top)
for name,(loops,xa,xb,ya,yb) in raw.items():
    d=[];npts=0
    for l in loops:
        s=simplify_closed(l,0.3)
        npts+=len(s)
        d.append('M'+' '.join('%.1f,%.1f'%((p[0]-xa)*S,(p[1]-top)*S) for p in s)+'Z')
    glyphs[name]={'w':round((xb-xa)*S,1),'d':''.join(d),'pts':npts}
json.dump(glyphs,open('glyphs.json','w'),indent=0)
print({k:(v['w'],v['pts']) for k,v in glyphs.items()})
