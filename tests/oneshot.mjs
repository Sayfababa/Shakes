// Ein-Schlag-Messung (Welle 1a „Boni-Umbau“): Wie oft gewinnt ein Held gegen Krypta-Bosse SEINER Stufe mit dem ersten Treffer?
// Ausrüstung: je Platz das stärkste (power) von K seltenen/legendären Teilen der Gegenstandsstufe I – mehrere Ausrüstungswürfe
// (Falle „ein einzelner Ausrüstungswurf entscheidet alles“). Gekoppelter Zufall, damit vorher/nachher vergleichbar.
// Aufruf: node tests/oneshot.mjs [klasse] [heldenstufe] [gegenstandsstufe] [würfe] [kämpfe je wurf]
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
let seed = 0x0a5c; const mul = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
Math.random = () => mul();
const D = await import('../js/data.js');
const G = await import('../js/state.js');
const { makeItem } = await import('../js/loot.js');
const { fight } = await import('../js/combat.js');

const cls = process.argv[2] || 'sorceress', L = +process.argv[3] || 22, I = +process.argv[4] || 59;
const R = +process.argv[5] || 5, N = +process.argv[6] || 100, K = 8;
const SLOTS = ['weapon', 'helm', 'chest', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand'];

function hero() {
  G.newChar('Eins', cls); const S = G.S; S.lvl = L; S.tut = 99;
  const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, main = D.CLASSES[cls].main;
  S.attrs[main] += Math.round(pts * 0.6); S.attrs.con += Math.round(pts * 0.3); S.attrs.lck += Math.round(pts * 0.1);
  for (const s of SLOTS) {
    const slot = s.startsWith('ring') ? 'ring' : s; let best = null, bp = -1;
    for (let k = 0; k < K; k++) {
      const it = makeItem(I, slot === 'weapon' ? { slot, kind: D.CLASSES[cls].weapon, minRarity: 3 } : { slot, minRarity: 3 });
      S.equip[s] = it; const p = G.power(); if (p > bp) { bp = p; best = it; }
    }
    S.equip[s] = best;
  }
  return S;
}

let one = 0, two = 0, win = 0, all = 0; const crit = [], haste = [];
for (let r = 0; r < R; r++) {
  hero(); const st = G.stats(); crit.push(st.crit); haste.push(st.haste);
  for (const c of D.CRYPTS) for (let n = 0; n < N; n++) {
    const f = fight(st, G.makeBoss(c, L, 1)); all++;
    if (f.winner !== 'a') continue; win++;
    let hits = 0; for (const e of f.log) { if (e.who === 'a') hits++; if (e.hpB === 0) break; }
    if (hits <= 1) one++; if (hits <= 2) two++;
  }
}
const pc = x => (x / all * 100).toFixed(1).padStart(5) + ' %', avg = a => a.reduce((x, y) => x + y, 0) / a.length;
console.log(`${D.CLASSES[cls].name} St. ${L}, Ausrüstung GS ${I} (${R} Würfe × ${D.CRYPTS.length} Bosse × ${N}):`
  + ` Sieg ${pc(win)} · 1. Treffer ${pc(one)} · ≤ 2 Treffer ${pc(two)} · Ø Krit ${(avg(crit) * 100).toFixed(0)} % · Ø Zaubertempo ${(avg(haste) * 100).toFixed(0)} %`);
