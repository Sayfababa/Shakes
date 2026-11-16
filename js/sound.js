// Ton: Web Audio (sofort, überlagerbar). Einstellungen getrennt vom Spielstand (kein Save-Wechsel nötig).
// Dateien in assets/sfx/<name>.m4a; fehlt eine, bleibt es einfach still.
const KEY = 'aschenkrone_opt';
export const SETS = { hit: ['hieb_1', 'hieb_2', 'hieb_3', 'hieb_4'] };
export const LEVELS = [['Aus', 0], ['Leise', 0.35], ['Mittel', 0.65], ['Laut', 1]];
export const opt = (() => { try { return { sfx: 0.65, music: 0, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { sfx: 0.65, music: 0 }; } })();
export function setOpt(k, v) { opt[k] = v; try { localStorage.setItem(KEY, JSON.stringify(opt)); } catch {} }
let ctx = null; const buf = {};
// iOS gibt Ton erst nach einer Berührung frei
export function unlock() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = new AC(); for (const n of new Set(Object.values(SETS).flat())) load(n);
}
async function load(n) {
  try { const r = await fetch(`assets/sfx/${n}.m4a`); if (!r.ok) return; buf[n] = await ctx.decodeAudioData(await r.arrayBuffer()); } catch {}
}
// Leicht variiert (Tonhöhe/Lautstärke), sonst klingt jeder Treffer gleich
export function play(set, vol = 1) {
  if (!ctx || !opt.sfx) return; const list = (SETS[set] || []).filter(n => buf[n]); if (!list.length) return;
  const src = ctx.createBufferSource(), g = ctx.createGain();
  src.buffer = buf[list[Math.floor(Math.random() * list.length)]]; src.playbackRate.value = 0.94 + Math.random() * 0.12;
  g.gain.value = opt.sfx * vol * (0.85 + Math.random() * 0.15); src.connect(g).connect(ctx.destination); src.start();
}
