'use strict';
// rpbrc — heaven hero: clouds, light motes, parallax, and the entrance after the launch animation.
(() => {
const hero = document.querySelector('.hero.hv'); if (!hero) return;
const calm = () => document.documentElement.classList.contains('motion-off');
const rnd = (a, b) => a + Math.random() * (b - a);

/* entrance: wait for the boot screen to leave */
const boot = document.getElementById('boot');
const ready = () => hero.classList.add('hv-ready');
if (!boot || boot.hidden) setTimeout(ready, 60);
else { new MutationObserver((m, o) => { if (boot.hidden || boot.classList.contains('exiting')) { ready(); o.disconnect(); } }).observe(boot, {attributes: true}); setTimeout(ready, 5200); }

/* clouds */
function cloud(w){
  const c = document.createElement('div'); c.className = 'hv-cloud';
  const h = w * .42, n = 6 + Math.round(Math.random() * 3);
  c.style.width = `${w}px`; c.style.height = `${h}px`;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i'), s = rnd(.38, .7) * w * (i === Math.floor(n / 2) ? 1.15 : 1);
    p.style.width = p.style.height = `${s}px`;
    p.style.left = `${(i / (n - 1)) * (w - s * .7) - s * .15}px`;
    p.style.bottom = `${rnd(-.1, .25) * h - (Math.abs(i - n / 2) < 1.5 ? -h * .12 : 0)}px`;
    c.appendChild(p);
  }
  return c;
}
function layer(sel, count, wMin, wMax, topMin, topMax, durMin, durMax){
  const L = hero.querySelector(sel); if (!L) return;
  for (let i = 0; i < count; i++) {
    const w = rnd(wMin, wMax), c = cloud(w), dur = rnd(durMin, durMax);
    c.style.top = `${rnd(topMin, topMax)}%`;
    c.style.setProperty('--from', `${-w - 40}px`); c.style.setProperty('--to', `calc(100vw + 40px)`);
    c.style.animationDuration = `${dur}s`; c.style.animationDelay = `${-rnd(0, dur)}s`;
    L.appendChild(c);
  }
}
const small = innerWidth < 760;
layer('.hv-far', small ? 3 : 6, 140, 260, 2, 24, 140, 220);
layer('.hv-mid', small ? 3 : 5, 260, 460, 56, 74, 90, 150);
/* cloud bank along the bottom */
const bank = hero.querySelector('.hv-bank');
if (bank) { const n = small ? 9 : 16;
  for (let i = 0; i < n; i++) { const p = document.createElement('i'), s = rnd(200, 420) * (small ? .7 : 1);
    p.style.width = p.style.height = `${s}px`; p.style.left = `${(i / (n - 1)) * 100 - 8}%`; p.style.bottom = `${-s * rnd(.35, .55)}px`;
    p.style.animationDelay = `${-rnd(0, 9)}s`; p.style.animationDuration = `${rnd(7, 12)}s`; bank.appendChild(p); } }

/* floating light motes */
const cv = document.getElementById('hv-motes'), cx = cv && cv.getContext('2d');
let W = 0, H = 0, motes = [];
function size(){ if (!cv) return; const d = Math.min(devicePixelRatio || 1, 2); W = hero.clientWidth; H = hero.clientHeight;
  cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0);
  motes = Array.from({length: small ? 40 : 90}, () => ({x: rnd(0, W), y: rnd(0, H), r: rnd(.6, 2.4), v: rnd(.15, .55), s: rnd(0, 6), a: rnd(.35, .95)})); }
size(); addEventListener('resize', size);
let mx = 0, my = 0, tx = 0, ty = 0;
addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, {passive: true});
const layers = [...hero.querySelectorAll('[data-depth]')], inner = hero.querySelector('.hv-inner'), sun = hero.querySelector('.hv-sun');
(function frame(t){
  requestAnimationFrame(frame);
  if (document.hidden) return;
  const y = scrollY; if (y > H * 1.4) return;
  mx += (tx - mx) * .05; my += (ty - my) * .05;
  if (!calm()) {
    layers.forEach(l => { const d = +l.dataset.depth; l.style.transform = `translate(${-mx * 60 * d}px,${-my * 30 * d + y * d * .6}px)`; });
    if (inner) { inner.style.transform = `translateY(${y * .35}px)`; inner.style.opacity = `${Math.max(0, 1 - y / (H * .55))}`; }
    if (sun) sun.style.translate = `${mx * 30}px ${my * 20 + y * .2}px`;
  }
  if (!cx || calm()) return;
  cx.clearRect(0, 0, W, H);
  for (const m of motes) {
    m.y -= m.v; m.x += Math.sin(t / 2000 + m.s) * .25;
    if (m.y < -10) { m.y = H + 10; m.x = rnd(0, W); }
    const tw = .55 + .45 * Math.sin(t / 600 + m.s * 3);
    const g = cx.createRadialGradient(m.x + mx * 20, m.y, 0, m.x + mx * 20, m.y, m.r * 4);
    g.addColorStop(0, `rgba(222,186,112,${m.a * tw * .55})`); g.addColorStop(.35, `rgba(255,236,190,${m.a * tw * .3})`); g.addColorStop(1, 'rgba(255,240,210,0)');
    cx.fillStyle = g; cx.beginPath(); cx.arc(m.x + mx * 20, m.y, m.r * 4, 0, 7); cx.fill();
  }
})(0);

/* ---------- clouds in every panel ---------- */
function puffCloud(w, cls){
  const c = document.createElement('div'); c.className = cls; const h = w * .45, n = 5 + Math.round(Math.random() * 3);
  c.style.width = `${w}px`; c.style.height = `${h}px`;
  for (let i = 0; i < n; i++) { const p = document.createElement('i'); p.className = 'cl-puff';
    const s = rnd(.36, .62) * w * (Math.abs(i - (n - 1) / 2) < 1 ? 1.25 : 1);
    p.style.width = p.style.height = `${s}px`; p.style.left = `${(i / (n - 1)) * (w - s * .75) - s * .1}px`;
    p.style.bottom = `${-s * .28 + (Math.abs(i - (n - 1) / 2) < 1 ? h * .14 : rnd(0, h * .08))}px`; c.appendChild(p); }
  return c;
}
function sky(host, count, wMin, wMax, opts = {}){
  const box = document.createElement('div'); box.className = 'cl-sky'; box.setAttribute('aria-hidden', 'true');
  const hw = host.clientWidth || 600;
  for (let i = 0; i < count; i++) {
    const w = rnd(wMin, wMax), c = puffCloud(w, 'cl-cloud'), dur = rnd(opts.dMin || 60, opts.dMax || 110);
    const bottomBias = opts.bottom ?? true;
    if (bottomBias) c.style.bottom = `${rnd(-w * .32, -w * .12)}px`; else c.style.top = `${rnd(0, 100)}%`;
    c.style.setProperty('--a', `${-w}px`); c.style.setProperty('--b', `${hw + 40}px`);
    c.style.animationDuration = `${dur}s`; c.style.animationDelay = `${-rnd(0, dur)}s`;
    if (opts.opacity) c.style.opacity = opts.opacity;
    box.appendChild(c);
  }
  host.prepend(box); host.classList.add('cl-host');
}
const panels = document.querySelectorAll('.lx-card:not(.lx-prod), .detail-card, .feature-explorer, .lx-proof>div, .contact-section, .comparison, .lx-prod .lx-body');
panels.forEach(p => {
  const big = p.clientWidth > 700, dark = p.matches('.contact-section');
  if (dark) p.classList.add('cl-dark');
  sky(p, big ? 4 : 2, big ? 200 : 120, big ? 340 : 220, {opacity: dark ? null : (big ? .9 : .85)});
});
/* soft cloud bands between sections */
document.querySelectorAll('main > section, main > .scope-strip').forEach((s, i) => {
  if (i === 0 || innerWidth < 760) return;
  const band = document.createElement('div'); band.className = 'cl-band'; band.setAttribute('aria-hidden', 'true');
  s.parentNode.insertBefore(band, s);
  const box = document.createElement('div'); box.className = 'cl-sky'; band.appendChild(box);
  for (let k = 0; k < 3; k++) { const w = rnd(260, 480), c = puffCloud(w, 'cl-cloud'), dur = rnd(120, 200);
    c.style.top = `${rnd(10, 60)}%`; c.style.opacity = .7;
    c.style.setProperty('--a', `${-w}px`); c.style.setProperty('--b', `${innerWidth + 40}px`);
    c.style.animationDuration = `${dur}s`; c.style.animationDelay = `${-rnd(0, dur)}s`; box.appendChild(c); }
});
})();
