// Variante: V aus Umgebung (JSON). +30 je Attribut (Sieg normal + Boss-Mittel) und Kon-Optimum.
globalThis.V = JSON.parse(process.env.V || '{}');
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem() {}, removeItem() {} };
let seed = 0xabc; Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const G = await import('../js/state.js'), C = await import('../js/combat.js'), D = await import('../js/data.js');
const { hero } = await import('./held.mjs');
const cls = process.argv[2], N = +process.argv[3] || 500, ROLLS = 3, AT = ['str', 'dex', 'int', 'con', 'lck'], LV = (process.argv[4] || '20,40').split(',').map(Number);
const fighter = () => { const A = { ...G.stats(), belt: [] }; A.cur0 = A.hp; return A; };
const rate = mobs => { let w = 0; for (const m of mobs) if (C.fight(fighter(), { ...m }).winner === 'a') w++; return w / mobs.length; };
const BOSSC = D.CRYPTS.filter(c => c.boss?.mech);
const M = D.CLASSES[cls].main;
for (const L of LV) {
  const acc = Object.fromEntries(AT.map(k => [k, { w: 0, b: 0 }])); const opt = {};
  for (let r = 0; r < ROLLS; r++) {
    hero(cls, L); const snap = JSON.stringify(G.S);
    let lo = 0.3, hi = 8, diff = 1; for (let i = 0; i < 9; i++) { diff = (lo + hi) / 2; if (rate(Array.from({ length: 200 }, () => G.makeMonster(L, diff))) > 0.5) lo = diff; else hi = diff; }
    const mobs = Array.from({ length: N }, () => G.makeMonster(L, diff));
    const bosses = BOSSC.flatMap(c => Array.from({ length: Math.round(N / 5) }, () => G.makeBoss(c, L, diff / D.CFG.bossDiff * 0.75)));
    const w0 = rate(mobs), b0 = rate(bosses);
    for (const k of AT) { G.S.attrs[k] += 30; acc[k].w += (rate(mobs) - w0) / ROLLS; acc[k].b += (rate(bosses) - b0) / ROLLS; G.S.attrs[k] -= 30; }
    // Kon-Optimum: Punkte zwischen Kon und Haupt verschieben
    const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, a0 = { ...G.S.attrs }, sum = a0.con + a0[M];
    for (const c of [.2, .3, .4, .5, .6, .7]) { const x = Math.round(pts * c) - Math.round(pts * .3); G.S.attrs.con = a0.con + x; G.S.attrs[M] = a0[M] - x;
      opt[c] = (opt[c] || 0) + (rate(mobs) + rate(bosses)) / 2 / ROLLS; }
    Object.assign(G.S, JSON.parse(snap));
  }
  const best = Object.entries(opt).sort((a, b) => b[1] - a[1])[0];
  console.log(`${cls} St.${L} +30 Sieg normal/Boss: ` + AT.map(k => `${k} ${(acc[k].w * 100).toFixed(1)}/${(acc[k].b * 100).toFixed(1)}`).join('  ') + `  | Kon-Anteil: ` + Object.entries(opt).map(([c, v]) => `${c * 100}%:${(v * 100).toFixed(0)}`).join(' ') + `  → bestes ${best[0] * 100} %`);
}
