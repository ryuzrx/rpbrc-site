'use strict';
// rpbrc — behaviour for the added sections. Runs alongside site.js and never touches its state.
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const calm = () => document.documentElement.classList.contains('motion-off');
const __vis = new WeakMap(), __io = new IntersectionObserver(es => es.forEach(e => __vis.set(e.target, e.isIntersecting)), {rootMargin: '80px'});
const seen = el => { if (!el) return false; if (!__vis.has(el)) { __vis.set(el, false); __io.observe(el); } return __vis.get(el); };


/* card spotlight + edge light */
$$('.lx-card').forEach(c => c.addEventListener('pointermove', e => {
  const r = c.getBoundingClientRect(); c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`);
}));
/* platform tilt */
$$('.lx-plat').forEach(c => {
  c.addEventListener('pointermove', e => { if (calm() || e.pointerType === 'touch') return; const r = c.getBoundingClientRect();
    c.style.transform = `rotateY(${((e.clientX - r.left) / r.width - .5) * 7}deg) rotateX(${-((e.clientY - r.top) / r.height - .5) * 7}deg)`; });
  c.addEventListener('pointerleave', () => c.style.transform = '');
});

/* intro word highlight */
const big = $('#lx-words');
if (big) {
  big.innerHTML = big.textContent.trim().split(/\s+/).map(w => w.startsWith('*') ? `<span class="w em">${w.slice(1)}</span>` : `<span class="w">${w}</span>`).join(' ');
  const ws = $$('.w', big);
  const upd = () => { const b = big.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * .82 - b.top) / (b.height + innerHeight * .3)));
    const n = calm() ? ws.length : Math.floor(p * ws.length * 1.05); ws.forEach((w, i) => w.classList.toggle('on', i < n)); };
  addEventListener('scroll', upd, {passive: true}); addEventListener('resize', upd); upd();
}

/* count-ups */
const countUp = el => { const end = +el.dataset.count, t0 = performance.now(), dur = calm() ? 0 : 1800;
  (function f(t) { const p = dur ? Math.min(1, (t - t0) / dur) : 1, e = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(end * e) + (el.dataset.suf || ''); if (p < 1) requestAnimationFrame(f); })(t0); };
const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; io.unobserve(e.target);
  $$('[data-count]', e.target).forEach(countUp); if (e.target.id === 'performance') drawRows(currentSet); }), {threshold: .2});
$$('.lx-proof,#performance').forEach(el => io.observe(el));

/* app showcase */
const steps = $$('.lx-step'), panes = $$('.lx-pane'), side = $$('.lx-side button'), names = ['unlock', 'presets', 'graphics', 'overlay', 'capture', 'style'];
function setStep(i) {
  steps.forEach((s, j) => s.classList.toggle('on', j === i)); panes.forEach((s, j) => s.classList.toggle('on', j === i));
  side.forEach((s, j) => s.classList.toggle('on', j === i)); const t = $('#lx-wtitle'); if (t) t.textContent = names[i];
}
const sio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setStep(+e.target.dataset.i); }), {rootMargin: '-45% 0px -45% 0px'});
steps.forEach(s => sio.observe(s)); side.forEach((b, i) => b.addEventListener('click', () => setStep(i)));

let target = 240;
const fr = $('#lx-fr'), fv = $('#lx-fv');
function fps() { const v = +fr.value; fv.textContent = v > 360 ? '∞' : v; target = v > 360 ? 420 : v; fr.style.setProperty('--p', `${(v - 60) / 301 * 100}%`); }
if (fr) { fr.addEventListener('input', fps); fps(); }
$$('.lx-sw').forEach(s => s.addEventListener('click', () => { s.classList.toggle('on'); s.setAttribute('aria-pressed', s.classList.contains('on')); }));
const group = sel => $$(sel).forEach(b => b.addEventListener('click', () => { $$(sel).forEach(x => x.classList.remove('on')); b.classList.add('on'); }));
group('.lx-preset'); group('.lx-swatches button'); group('.lx-fonts button');
const tl = $('#lx-tl'); if (tl) for (let i = 0; i < 40; i++) { const b = document.createElement('i'); b.style.height = `${20 + Math.random() * 80}%`; if (i > 30) b.className = 'h'; tl.appendChild(b); }

/* live numbers: hero chips + overlay pane */
const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
setInterval(() => { if (document.hidden || !(seen($('.lx-win')) || seen($('.hero.hv')))) return;
  const v = Math.max(30, target - 7 + Math.round(Math.random() * 10)), ms = (1000 / v).toFixed(1);
  set('lx-hfps', v); set('lx-hft', ms); set('lx-gf', v); set('lx-gm', ms); set('lx-gp', 30 + Math.round(Math.random() * 9)); }, 260);
const gc = $('#lx-graph'), gx = gc?.getContext('2d'), pts = Array.from({length: 80}, () => .72);
setInterval(() => {
  if (!gx || document.hidden || !seen(gc)) return; const d = devicePixelRatio || 1, w = gc.clientWidth, h = gc.clientHeight; if (!w) return;
  if (gc.width !== Math.round(w * d)) { gc.width = Math.round(w * d); gc.height = Math.round(h * d); }
  gx.setTransform(d, 0, 0, d, 0, 0); gx.clearRect(0, 0, w, h);
  pts.shift(); pts.push(Math.min(.92, Math.max(.5, pts[pts.length - 1] + (Math.random() - .5) * .1)));
  gx.beginPath(); pts.forEach((p, i) => { const x = i / (pts.length - 1) * w, y = h - p * h; i ? gx.lineTo(x, y) : gx.moveTo(x, y); });
  gx.strokeStyle = getComputedStyle(gc).getPropertyValue('--ink').trim() || '#0a0a0c'; gx.lineWidth = 2; gx.shadowColor = 'rgba(0,0,0,.25)'; gx.shadowBlur = 10; gx.stroke(); gx.shadowBlur = 0;
  gx.lineTo(w, h); gx.lineTo(0, h); gx.closePath();
  const f = gx.createLinearGradient(0, 0, 0, h); f.addColorStop(0, 'rgba(142,142,150,.28)'); f.addColorStop(1, 'rgba(142,142,150,0)'); gx.fillStyle = f; gx.fill();
}, 90);

/* performance chart (illustrative) */
const DATA = {
  mid: [['stock roblox', 'capped', 60, 'base'], ['rpbrc balanced', 'preset', 168, 'hi'], ['rpbrc competitive', 'preset', 241, 'hi']],
  low: [['stock roblox', 'auto quality', 34, 'base'], ['rpbrc balanced', 'preset', 58, 'hi'], ['rpbrc potato pc', 'preset', 92, 'hi']],
  mac: [['stock roblox', 'capped', 60, 'base'], ['rpbrc unlocked', '120 hz display', 118, 'hi'], ['rpbrc competitive', '144 hz external', 141, 'hi']]
};
let currentSet = 'mid'; const rows = $('#lx-rows');
function drawRows(k) {
  currentSet = k; if (!rows) return;
  rows.innerHTML = DATA[k].map(([n, s, v, c]) => `<div class="lx-row"><div class="nm">${n}<small>${s}</small></div><div class="lx-track2"><div class="lx-fill ${c}" data-w="${v / 260 * 100}"></div></div><div class="lx-val" data-v="${v}">0<small>fps</small></div></div>`).join('');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $$('.lx-fill', rows).forEach(f => f.style.width = `${f.dataset.w}%`);
    $$('.lx-val', rows).forEach(el => { const end = +el.dataset.v, t0 = performance.now(), dur = calm() ? 0 : 1600;
      (function f(t) { const p = dur ? Math.min(1, (t - t0) / dur) : 1, e = 1 - Math.pow(1 - p, 4); el.innerHTML = `${Math.round(end * e)}<small>fps</small>`; if (p < 1) requestAnimationFrame(f); })(t0); });
  }));
}
const seg = $('.lx-seg'), pill = $('.lx-pill');
const movePill = b => { if (pill && b) { pill.style.left = `${b.offsetLeft}px`; pill.style.width = `${b.offsetWidth}px`; } };
$$('.lx-seg button').forEach(b => b.addEventListener('click', () => { $$('.lx-seg button').forEach(x => x.classList.remove('on')); b.classList.add('on'); movePill(b); drawRows(b.dataset.k); }));
const placePill = () => movePill($('.lx-seg button.on')); addEventListener('load', placePill); addEventListener('resize', placePill); setTimeout(placePill, 400);

/* ---- product lineup ---- */
const fpill = $('.lx-fpill'), filter = $('.lx-filter');
const place = b => { if (fpill && b) { fpill.style.left = `${b.offsetLeft}px`; fpill.style.width = `${b.offsetWidth}px`; } };
$$('.lx-filter button').forEach(b => b.addEventListener('click', () => {
  $$('.lx-filter button').forEach(x => x.classList.remove('on')); b.classList.add('on'); place(b);
  $$('.lx-prod').forEach(p => p.classList.toggle('dim', b.dataset.f !== 'all' && p.dataset.kind !== b.dataset.f));
}));
const placeOn = () => place(filter?.querySelector('button.on'));
addEventListener('load', placeOn); addEventListener('resize', placeOn); setTimeout(placeOn, 400);

// mini-app tabs cycle on their own
$$('[data-cycle]').forEach((row, k) => { let i = 0; const tabs = [...row.children];
  setTimeout(() => setInterval(() => { if (calm() || document.hidden || !seen(row)) return; tabs[i].classList.remove('on'); i = (i + 1) % tabs.length; tabs[i].classList.add('on'); }, 1800), k * 600); });

// live numbers in the product visuals + hero ping chip
setInterval(() => { if (document.hidden || !seen($('.lx-products'))) return;
  const f = 232 + Math.round(Math.random() * 12), ping = 30 + Math.round(Math.random() * 9);
  const vals = {fps: f, ping, ms: (1000 / f).toFixed(1), cpu: `${26 + Math.round(Math.random() * 10)}%`, cps: 12 + Math.round(Math.random() * 4)};
  $$('[data-live]').forEach(el => el.textContent = vals[el.dataset.live]);
  set('lx-hping', ping);
}, 300);

// product card tilt
$$('.lx-prod').forEach(c => {
  c.addEventListener('pointermove', e => { if (calm() || e.pointerType === 'touch' || c.classList.contains('dim')) return; const r = c.getBoundingClientRect();
    c.style.transform = `perspective(1400px) rotateY(${((e.clientX - r.left) / r.width - .5) * 5}deg) rotateX(${-((e.clientY - r.top) / r.height - .5) * 5}deg)`; });
  c.addEventListener('pointerleave', () => c.style.transform = '');
});
})();
