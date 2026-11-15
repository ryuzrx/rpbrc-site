'use strict';
// rpbrc — white edition motion layer. Additive: never touches site.js or lucid.js state.
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const calm = () => root.classList.contains('motion-off');
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

/* soft background blobs */
const blobs = document.createElement('div'); blobs.className = 'lx-blobs'; blobs.setAttribute('aria-hidden', 'true');
blobs.innerHTML = '<i></i><i></i><i></i>'; document.body.prepend(blobs);

/* scroll progress */
const prog = document.createElement('div'); prog.className = 'lx-progress'; document.body.appendChild(prog);

/* ---------- sliding hover highlight (Lucid-style) ---------- */
function hoverPill(host, itemSel){
  if (!host) return;
  host.classList.add('lx-hl-host');
  const hl = document.createElement('span'); hl.className = 'lx-hl'; host.prepend(hl);
  const move = el => { const h = host.getBoundingClientRect(), r = el.getBoundingClientRect();
    hl.style.width = `${r.width}px`; hl.style.height = `${r.height}px`; hl.style.transform = `translate(${r.left - h.left}px,${r.top - h.top}px)`; hl.style.opacity = 1; };
  $$(itemSel, host).forEach(el => el.addEventListener('pointerenter', () => move(el)));
  host.addEventListener('pointerleave', () => hl.style.opacity = 0);
}
hoverPill($('.navigation nav'), 'a');
hoverPill($('.scope-strip>div'), 'span');
hoverPill($('.feature-tabs'), 'button');
hoverPill($('.lx-side'), 'button');

/* button fill follows the pointer entry point */
$$('.button').forEach(b => b.addEventListener('pointerenter', e => { const r = b.getBoundingClientRect();
  b.style.setProperty('--bx', `${e.clientX - r.left}px`); b.style.setProperty('--by', `${e.clientY - r.top}px`); }));

/* stronger magnetic buttons */
$$('.magnetic, .nav-download, .replay-button').forEach(b => {
  b.addEventListener('pointermove', e => { if (calm() || !fine) return; const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .32}px)`; });
  b.addEventListener('pointerleave', () => b.style.transform = '');
});

/* detail cards: spotlight + tilt */
$$('.detail-card, .edition-card').forEach(c => {
  c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`);
    if (calm() || !fine) return;
    c.style.transform = `perspective(1100px) rotateY(${((e.clientX - r.left) / r.width - .5) * 8}deg) rotateX(${-((e.clientY - r.top) / r.height - .5) * 8}deg)`; });
  c.addEventListener('pointerleave', () => c.style.transform = '');
});

/* ---------- letter-by-letter headings ---------- */
function split(el){
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(w => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
          const wd = document.createElement('span'); wd.className = 'wd';
          [...w].forEach(c => { const ch = document.createElement('span'); ch.className = 'ch'; ch.textContent = c; wd.appendChild(ch); });
          frag.appendChild(wd);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el); el.classList.add('lx-split');
  $$('.ch', el).forEach((c, i) => c.style.transitionDelay = `${i * 0.022}s`);
}
const heads = $$('main h2, .slogan');
heads.forEach(h => { if (!h.closest('.lx-chrome') && !h.querySelector('.lx-chrome')) split(h); else split(h); });
const hio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('go'); hio.unobserve(e.target); } }), {threshold: .3});
heads.forEach(h => hio.observe(h));
// gradient text loses its clip when split into spans — re-apply to each char
$$('.lx-chrome.lx-split .ch, .lx-chrome .lx-split .ch, .lx-split .lx-chrome .ch').forEach(c => c.classList.add('lx-chrome'));

/* ---------- custom cursor ---------- */
if (fine) {
  const ring = document.createElement('div'), dot = document.createElement('div');
  ring.className = 'lx-cursor'; dot.className = 'lx-cursor-dot'; document.body.append(ring, dot);
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
  addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`; }, {passive: true});
  addEventListener('pointerdown', () => ring.classList.add('down')); addEventListener('pointerup', () => ring.classList.remove('down'));
  document.addEventListener('pointerover', e => ring.classList.toggle('hover', !!e.target.closest('a,button,summary,input,.lx-card,.detail-card,[data-feature]')));
  document.addEventListener('pointerleave', () => { ring.style.opacity = 0; dot.style.opacity = 0; });
  document.addEventListener('pointerenter', () => { ring.style.opacity = 1; dot.style.opacity = 1; });
  (function loop(){ rx += (x - rx) * .18; ry += (y - ry) * .18; ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
}

/* ---------- scroll-linked ---------- */
const heroVisual = $('.hero-visual'), heroCopy = $('.hero-copy'), track = $('.lx-track');
let lastY = scrollY, vel = 0, marqX = 0, trackW = 0;
const measure = () => { trackW = track ? track.scrollWidth / 2 : 0; };
addEventListener('resize', measure); addEventListener('load', measure); measure();
if (track) track.style.animation = 'none';
(function tick(){
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  vel += ((y - lastY) - vel) * .12; lastY = y;
  if (!calm()) {
    if (heroVisual && !heroVisual.closest('.hv') && y < innerHeight * 1.2) {
      const p = y / innerHeight;
      heroVisual.style.translate = `0 ${p * 120}px`;
      heroVisual.style.rotate = `${p * -10}deg`;
      heroVisual.style.scale = `${1 - p * .18}`;
      if (heroCopy) { heroCopy.style.translate = `0 ${p * 60}px`; heroCopy.style.opacity = `${1 - p * 1.1}`; }
    }
    if (track && trackW) { marqX -= .6 + Math.abs(vel) * .35; if (-marqX >= trackW) marqX += trackW; track.style.transform = `translateX(${marqX}px) skewX(${Math.max(-12, Math.min(12, -vel * .4))}deg)`; }
  }
  const nav = $('.navigation'); if (nav) nav.style.boxShadow = y > 20 ? 'var(--shadow-lg)' : '';
  if (stage) {
    const r = stage.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight * .9);
    const p = Math.min(1, Math.max(0, (innerHeight * .65 - r.top) / span));
    const e = 1 - Math.pow(1 - p, 3);
    stage.style.setProperty('--p', e.toFixed(4)); frame.style.setProperty('--p', e.toFixed(4));
  }
  requestAnimationFrame(tick);
})();
})();

/* ---------- landing app preview ---------- */
var stage = document.querySelector('.lx-appstage'), frame = document.querySelector('.lx-appframe');
(() => {
if (!frame) return;
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const one = sel => $$(sel, frame).forEach(b => b.addEventListener('click', () => { $$(sel, frame).forEach(x => x.classList.remove('on')); b.classList.add('on'); }));
one('.ax-side button'); one('.ax-pre'); one('.ax-sws i');
$$('.ax-sws i', frame).forEach(i => i.addEventListener('click', () => frame.style.setProperty('--xh', getComputedStyle(i).backgroundColor)));
/* sliding hover pill in the app sidebar */
const side = frame.querySelector('.ax-side');
if (side) { const hl = document.createElement('span'); hl.className = 'lx-hl'; hl.style.borderRadius = '12px'; side.prepend(hl);
  $$('button', side).forEach(b => b.addEventListener('pointerenter', () => { const h = side.getBoundingClientRect(), r = b.getBoundingClientRect();
    hl.style.width = `${r.width}px`; hl.style.height = `${r.height}px`; hl.style.transform = `translate(${r.left - h.left}px,${r.top - h.top}px)`; hl.style.opacity = 1; }));
  side.addEventListener('pointerleave', () => hl.style.opacity = 0); }
const tl = document.getElementById('ax-tl');
if (tl) for (let i = 0; i < 46; i++) { const b = document.createElement('i'); b.style.height = `${25 + Math.random() * 75}%`; if (i > 36) b.className = 'h'; tl.appendChild(b); }
const ring = document.getElementById('ax-ring'), set = (k, v) => $$(`[data-ax="${k}"]`, frame).forEach(el => el.textContent = v);
const gc = document.getElementById('ax-graph'), gx = gc && gc.getContext('2d'), pts = Array.from({length: 90}, () => .7);
setInterval(() => {
  if (document.hidden) return;
  const f = 232 + Math.round(Math.random() * 12), cps = 12 + Math.round(Math.random() * 4);
  set('fps', f); set('ms', `${(1000 / f).toFixed(1)}ms`); set('ping', `${30 + Math.round(Math.random() * 9)}ms`); set('cpu', `${26 + Math.round(Math.random() * 10)}%`); set('cps', cps);
  if (ring) ring.style.strokeDashoffset = 314 * (1 - cps / 20);
}, 320);
setInterval(() => {
  if (!gx || document.hidden) return;
  const d = devicePixelRatio || 1, w = gc.clientWidth, h = gc.clientHeight; if (!w || !h) return;
  if (gc.width !== Math.round(w * d)) { gc.width = Math.round(w * d); gc.height = Math.round(h * d); }
  gx.setTransform(d, 0, 0, d, 0, 0); gx.clearRect(0, 0, w, h);
  pts.shift(); pts.push(Math.min(.9, Math.max(.45, pts[pts.length - 1] + (Math.random() - .5) * .09)));
  gx.beginPath(); pts.forEach((p, i) => { const x = i / (pts.length - 1) * w, yy = h - p * h; i ? gx.lineTo(x, yy) : gx.moveTo(x, yy); });
  gx.strokeStyle = '#0b0b0d'; gx.lineWidth = 2; gx.lineJoin = 'round'; gx.stroke();
  gx.lineTo(w, h); gx.lineTo(0, h); gx.closePath();
  const g = gx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(11,11,13,.14)'); g.addColorStop(1, 'rgba(11,11,13,0)'); gx.fillStyle = g; gx.fill();
}, 90);
})();
