import mapData from '../data/iloilo.json';

// Adapted from the map section of https://azzzriieell00.github.io/.
// Geometry is bundled locally; this map makes no runtime data requests.
export function initIloiloMap(){
  const MAP = mapData.municipalities;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePtr = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const now = () => performance.now();
  const cv = document.getElementById('iloiloMap');
  if(!cv) return;
  const ctx = cv.getContext('2d'), wrap = cv.parentElement, readout = document.getElementById('mapReadout');
  if(!ctx || !wrap || !readout) return;
  const HOME = [122.559, 10.717]; // Iloilo City home base
  let lon0=Infinity, lon1=-Infinity, lat0=Infinity, lat1=-Infinity;
  MAP.forEach(m => m.r.forEach(r => r.forEach(([x,y]) => { if(x<lon0)lon0=x; if(x>lon1)lon1=x; if(y<lat0)lat0=y; if(y>lat1)lat1=y; })));
  const K = Math.cos((lat0+lat1)/2*Math.PI/180);
  const HOME_INDEX = MAP.findIndex(m => m.n === 'Iloilo City');

  let w=0, h=0, dpr=1, sc=1, ox=0, oy=0, sp=7, munis=[], dots=[], land=null, home=[0,0], stat=null;
  let hover=-1, sel=-1, p=null, ripples=[], nextAuto=0, visible=true, raf=0, maxD=1;
  function addRipple(ripple){
    const last=ripples[ripples.length-1];
    // Coalesce rapid taps and held arrow keys so the dot field stays readable.
    if(last && !last.home && !ripple.home && ripple.t0-last.t0<120) ripples.pop();
    ripples.push(ripple);
    if(ripples.length>6) ripples.shift();
  }
  const proj = (lon,lat) => [ox+(lon-lon0)*K*sc, oy+(lat1-lat)*sc];
  const unproj = (x,y) => [lon0+(x-ox)/(K*sc), lat1-(y-oy)/sc];
  function inRing(x,y,rg){ let c=false; for(let i=0,j=rg.length-1;i<rg.length;j=i++){ const a=rg[i], b=rg[j]; if(((a[1]>y)!==(b[1]>y)) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) c=!c; } return c; }
  // Test whole municipal areas, including islands and any interior holes.
  function which(x,y){
    for(let i=0;i<munis.length;i++){
      const m=munis[i], b=m.bb;
      if(x<b[0]||x>b[2]||y<b[1]||y>b[3]) continue;
      let inside=false;
      for(const ring of m.rings) if(inRing(x,y,ring)) inside=!inside;
      if(inside) return i;
    }
    return -1;
  }
  // Water and padding also respond, by scanning the nearest Iloilo town.
  function scanAt(x,y){
    const hit=which(x,y);
    if(hit>=0) return hit;
    let nearest=-1, distance=Infinity;
    munis.forEach((m,i)=>{
      const d=Math.hypot(x-m.lab[0],y-m.lab[1]);
      if(d<distance){ nearest=i; distance=d; }
    });
    return nearest;
  }
  function addDot(x,y,mi){ const dx=x-home[0], dy=y-home[1]; dots.push({x,y,m:mi,ox:0,oy:0,ang:Math.atan2(dy,dx),dist:Math.hypot(dx,dy),s:Math.random()*6.283}); }

  function layout(){
    const r = wrap.getBoundingClientRect(); w = Math.round(r.width); h = Math.round(r.height);
    if(!w || !h) return;
    dpr = Math.min(devicePixelRatio||1, 2);
    cv.width = w*dpr; cv.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    const pl=w*.065, pr=w*.065, pt=h*.065, pb=h*.12, sx=(lon1-lon0)*K, sy=(lat1-lat0);
    sc = Math.min((w-pl-pr)/sx, (h-pt-pb)/sy);
    ox = pl+((w-pl-pr)-sx*sc)/2; oy = pt+((h-pt-pb)-sy*sc)/2;
    land = new Path2D();
    munis = MAP.map(m => {
      const path = new Path2D(); let b=[1e9,1e9,-1e9,-1e9];
      const rings = m.r.map(rg => rg.map(([a,c]) => proj(a,c)));
      rings.forEach(rg => { rg.forEach(([x,y],k) => { k ? path.lineTo(x,y) : path.moveTo(x,y); if(x<b[0])b[0]=x; if(y<b[1])b[1]=y; if(x>b[2])b[2]=x; if(y>b[3])b[3]=y; }); path.closePath(); });
      land.addPath(path);
      return {name:m.n, rings, path, bb:b, lab:proj(m.c[0],m.c[1]), c:m.c};
    });
    home = proj(HOME[0],HOME[1]);
    sp = w<480 ? 5.2 : 6.2; dots = [];
    for(let y=oy+sp/2; y<h; y+=sp) for(let x=ox+sp/2; x<w; x+=sp){ const mi = which(x,y); if(mi>=0) addDot(x,y,mi); }
    // Give offshore islands a finer grid so even small areas remain visible.
    munis.forEach((m,mi) => m.rings.forEach(rg => {
      let b=[1e9,1e9,-1e9,-1e9]; rg.forEach(([x,y]) => { if(x<b[0])b[0]=x; if(y<b[1])b[1]=y; if(x>b[2])b[2]=x; if(y>b[3])b[3]=y; });
      if((b[2]-b[0])*(b[3]-b[1]) > sp*sp*40) return;
      dots = dots.filter(d => !(d.m===mi && inRing(d.x,d.y,rg)));
      const f = sp*.62;
      for(let y=b[1]+f/2; y<b[3]; y+=f) for(let x=b[0]+f/2; x<b[2]; x+=f) if(inRing(x,y,rg)) addDot(x,y,mi);
    }));
    maxD = dots.reduce((m,d) => Math.max(m,d.dist), 1);
    buildStatic();
  }

  function spaced(s, txt, x, y, gap){
    if('letterSpacing' in s){ s.letterSpacing = gap+'px'; s.fillText(txt,x,y); s.letterSpacing = '0px'; }
    else s.fillText(txt.split('').join(' '), x, y);
  }
  function buildStatic(){
    stat = document.createElement('canvas'); stat.width = w*dpr; stat.height = h*dpr;
    const s = stat.getContext('2d'); s.setTransform(dpr,0,0,dpr,0,0);
    s.fillStyle = 'rgba(0,255,102,.035)'; s.fill(land, 'evenodd');
    s.strokeStyle = 'rgba(68,255,140,.22)'; s.lineWidth = .7;
    munis.forEach(m => s.stroke(m.path));
    s.font = '500 '+(w<480?10:11)+'px "JetBrains Mono", ui-monospace, monospace';
    s.fillStyle = 'rgba(0,255,102,.9)'; s.textAlign = 'left';
    spaced(s, 'ILOILO', w*.065, h-h*.04, w<480?7:9);
    s.fillStyle = 'rgba(232,240,233,.5)'; s.textAlign = 'right';
    s.font = '500 '+(w<480?9:10)+'px "JetBrains Mono", ui-monospace, monospace';
    s.fillText('PANAY / PH', w-w*.065, h-h*.04);
  }

  const TAU = Math.PI*2;
  let ns = new Float32Array(0), na = new Float32Array(0);
  function frame(t){
    raf = 0;
    if(!w || !stat) return;
    ctx.clearRect(0,0,w,h);
    ctx.drawImage(stat,0,0,w,h);
    const act = hover>=0 ? hover : sel;
    const th = reduce ? 99 : (((t/4600)%1)*TAU - Math.PI);

    // auto pulse from Iloilo City
    if(!reduce && t>nextAuto){ nextAuto = t+2600; addRipple({x:home[0],y:home[1],t0:t,str:.8,spd:.11,home:true}); }
    ripples = ripples.filter(r => (t-r.t0)*r.spd < maxD+60);

    // radar wedge clipped to land
    if(!reduce && ctx.createConicGradient){
      ctx.save(); ctx.clip(land, 'evenodd');
      const span = 1.15, gr = ctx.createConicGradient(th-span, home[0], home[1]), f = span/TAU;
      gr.addColorStop(0,'rgba(0,255,102,0)'); gr.addColorStop(f,'rgba(0,255,102,.24)'); gr.addColorStop(Math.min(1,f+.003),'rgba(0,255,102,0)'); gr.addColorStop(1,'rgba(0,255,102,0)');
      ctx.fillStyle = gr; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle = 'rgba(124,255,176,.55)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(home[0],home[1]); ctx.lineTo(home[0]+Math.cos(th)*maxD*1.1, home[1]+Math.sin(th)*maxD*1.1); ctx.stroke();
      ctx.restore();
    }

    // active municipality
    if(act>=0){
      ctx.fillStyle = 'rgba(0,255,102,.10)'; ctx.fill(munis[act].path, 'evenodd');
      ctx.strokeStyle = 'rgba(52,255,133,.95)'; ctx.lineWidth = 1.3; ctx.stroke(munis[act].path);
    }

    // dots
    if(ns.length !== dots.length){ ns = new Float32Array(dots.length); na = new Float32Array(dots.length); }
    const R = w<480 ? 54 : 74, base = sp*.205;
    for(let i=0;i<dots.length;i++){
      const d = dots[i];
      let tx=0, ty=0, near=0, boost=0;
      if(p){
        const dx=d.x-p.x, dy=d.y-p.y, dd=dx*dx+dy*dy;
        if(dd<R*R){ const dist=Math.sqrt(dd)||1; near=1-dist/R; const push=near*near*10; tx=dx/dist*push; ty=dy/dist*push; }
      }
      for(const r of ripples){
        const rad = Math.max(0,(t-r.t0)*r.spd);
        let dr, dx, dy;
        if(r.home){ dr = d.dist; dx = Math.cos(d.ang); dy = Math.sin(d.ang); }
        else { dx = d.x-r.x; dy = d.y-r.y; dr = Math.hypot(dx,dy)||1; dx/=dr; dy/=dr; }
        const band = Math.abs(dr-rad);
        if(band<13){ const fade = Math.max(0,1-rad/(maxD+60)); const a=(1-band/13)*r.str*fade; boost+=a; tx+=dx*a*4; ty+=dy*a*4; }
      }
      let trail = 0;
      boost=Math.min(boost,1.5);
      if(!reduce){ const df = (((th-d.ang)%TAU)+TAU)%TAU; if(df<1.15) trail = 1-df/1.15; }
      if(reduce){ d.ox=0; d.oy=0; }
      else { d.ox += (tx-d.ox)*.2; d.oy += (ty-d.oy)*.2; }
      const hm = d.m===act ? 1 : 0;
      const tw = reduce ? .5 : .5+.5*Math.sin(t*.0023+d.s);
      ns[i] = base*(1 + boost*1.15 + near*1.4 + trail*.4 + hm*.35);
      na[i] = Math.min(1, .4 + tw*.14 + trail*.5 + boost*.65 + near*.65 + hm*.4);
    }
    for(let pass=0; pass<2; pass++){
      ctx.fillStyle = pass ? '#d6ffe2' : '#36ff86';
      for(let i=0;i<dots.length;i++){
        const d = dots[i]; if((d.m===act) !== !!pass) continue;
        ctx.globalAlpha = na[i];
        ctx.beginPath(); ctx.arc(d.x+d.ox, d.y+d.oy, ns[i], 0, TAU); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // tap / click shockwaves
    for(const r of ripples){ if(r.home) continue; const rad=Math.max(0,(t-r.t0)*r.spd), k=rad/(maxD+60); ctx.strokeStyle='rgba(0,255,102,'+Math.max(0,(1-k)*.55)+')'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(r.x,r.y,rad,0,TAU); ctx.stroke(); }

    // Iloilo City home marker
    const pu = reduce ? .3 : (t%1800)/1800;
    ctx.strokeStyle = 'rgba(0,255,102,'+(1-pu)*.85+')'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(home[0],home[1],10+pu*20,0,TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,255,102,.95)';
    ctx.beginPath(); ctx.arc(home[0],home[1],13,0,TAU); ctx.stroke();
    const gl = ctx.createRadialGradient(home[0],home[1],0,home[0],home[1],10);
    gl.addColorStop(0,'rgba(68,255,140,.9)'); gl.addColorStop(1,'rgba(0,255,102,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(home[0],home[1],10,0,TAU); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(home[0],home[1],2.6,0,TAU); ctx.fill();
    // callout
    const big = w>=480, fs = big?17:13.5, dir = home[0]+(big?30:22)+(big?130:100)+8 > w ? -1 : 1;
    const ex = home[0]+dir*(big?30:22), ey = home[1]-(big?36:46), lx = ex+dir*6;
    ctx.strokeStyle = 'rgba(0,255,102,.85)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(home[0]+dir*9.5,home[1]-9.5); ctx.lineTo(ex,ey); ctx.lineTo(ex+dir*(big?130:100),ey); ctx.stroke();
    ctx.textAlign = dir>0 ? 'left' : 'right';
    ctx.font = '700 '+fs+'px "Chakra Petch", "Arial Narrow", sans-serif';
    const glitchOn = !reduce && (t%3900)<150;
    if(glitchOn){
      ctx.fillStyle = 'rgba(143,246,255,.8)'; ctx.fillText('ILOILO CITY', lx+dir*3-2, ey-8);
      ctx.fillStyle = 'rgba(0,255,102,.95)'; ctx.fillText('ILOILO CITY', lx+dir*3+3, ey-8);
    }
    ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 6;
    ctx.fillStyle = '#fff'; ctx.fillText('ILOILO CITY', lx+dir*3, ey-8);
    ctx.font = '500 '+(big?9.5:8.5)+'px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = 'rgba(232,240,233,.62)';
    ctx.fillText('HOME BASE / PHILIPPINES', lx+dir*3, ey+(big?14:12));
    ctx.shadowBlur = 0;

    // hovered municipality label
    if(act>=0 && act!==HOME_INDEX){
      const m = munis[act], txt = m.name.toUpperCase();
      ctx.font = '600 '+(big?10.5:9.5)+'px "JetBrains Mono", ui-monospace, monospace';
      const tw = ctx.measureText(txt).width, bx = Math.min(w-tw-14, Math.max(4, m.lab[0]-tw/2-6)), by = m.lab[1]-10;
      ctx.fillStyle = 'rgba(7,10,8,.88)'; ctx.fillRect(bx,by,tw+12,19);
      ctx.strokeStyle = 'rgba(0,255,102,.9)'; ctx.lineWidth = 1; ctx.strokeRect(bx+.5,by+.5,tw+11,18);
      ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText(txt, bx+6, by+13);
    }

    // targeting crosshair
    if(p){
      ctx.strokeStyle = 'rgba(0,255,102,.22)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x+.5,0); ctx.lineTo(p.x+.5,h); ctx.moveTo(0,p.y+.5); ctx.lineTo(w,p.y+.5); ctx.stroke();
      const [lo,la] = unproj(p.x,p.y);
      ctx.font = '500 9.5px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillStyle = 'rgba(124,255,176,.9)';
      const lbl = la.toFixed(3)+'°N '+lo.toFixed(3)+'°E', right = p.x+150 > w;
      ctx.textAlign = right ? 'right' : 'left';
      ctx.fillText(lbl, Math.max(10,Math.min(w-10,p.x+(right?-10:10))), Math.max(15,Math.min(h-12,p.y-10)));
    }

    if(visible && !reduce && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function kick(){ if(!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }

  const idle = finePtr ? 'Hover or click to scan' : 'Tap a town to scan';
  function setReadout(){
    const act = hover>=0 ? hover : sel;
    if(act<0){ readout.textContent = idle; readout.classList.remove('live'); return; }
    const m = munis[act];
    readout.textContent = m.name.toUpperCase()+' · '+m.c[1].toFixed(3)+'°N '+m.c[0].toFixed(3)+'°E';
    readout.classList.add('live');
  }
  const local = e => { const r = cv.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top}; };
  cv.addEventListener('pointermove', e => {
    if(e.pointerType==='touch') return;
    p = local(e);
    const mi = scanAt(p.x,p.y);
    if(mi!==hover){ hover = mi; setReadout(); }
    kick();
  });
  cv.addEventListener('pointerleave', () => { p = null; if(hover!==-1){ hover = -1; setReadout(); } kick(); });
  cv.addEventListener('pointerdown', e => {
    const q = local(e), mi = scanAt(q.x,q.y);
    if(!reduce) addRipple({x:q.x, y:q.y, t0:now(), str:1.4, spd:.17});
    sel = mi; setReadout(); kick();
  });
  cv.addEventListener('keydown', e => {
    if(!['ArrowRight','ArrowLeft','Home','Escape'].includes(e.key)) return;
    e.preventDefault();
    p=null; hover=-1;
    if(e.key==='Escape') sel=-1;
    else if(e.key==='Home' || sel<0) sel=HOME_INDEX;
    else sel=(sel+(e.key==='ArrowRight'?1:-1)+munis.length)%munis.length;
    if(sel>=0 && !reduce){
      const m=munis[sel];
      addRipple({x:m.lab[0],y:m.lab[1],t0:now(),str:1.2,spd:.15});
    }
    setReadout(); kick();
  });

  readout.textContent = idle;
  layout(); kick();
  if('ResizeObserver' in window) new ResizeObserver(() => { layout(); kick(); }).observe(wrap);
  else addEventListener('resize', () => { layout(); kick(); });
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(() => { buildStatic(); kick(); });
  if('IntersectionObserver' in window){
    new IntersectionObserver(es => { visible = es[0].isIntersecting; if(visible) kick(); }).observe(cv);
  }
  document.addEventListener('visibilitychange', () => { if(!document.hidden) kick(); });
}
