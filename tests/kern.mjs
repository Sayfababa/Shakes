// Aschenkern (Welle 2B-2): was bringt ein Kern aus jedem Einzigartigen auf dem eigenen (seltenen) Teil desselben Platzes –
// gegen das Einzigartige selbst getragen? Kampfkraft power(), Mittel über 3 Ausrüstungswürfe (Falle: ein Wurf entscheidet alles).
// Aufruf: node tests/kern.mjs [heldenstufe] [--check]
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
let seed = 0x4b31; Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const R = '../';
const D = await import(R + 'js/data.js'), G = await import(R + 'js/state.js'), L = await import(R + 'js/loot.js');
const { hero } = await import('./held.mjs');
const mkU = (u, lvl) => { for (let i = 0; i < 60000; i++) { const it = L.makeItem(lvl, { slot: u.slot, kind: u.kind, minRarity: 4 }); if (it.unique === u.name) return it; } return null; };
const args = process.argv.slice(2).filter(a => !a.startsWith('--')), CHECK = process.argv.includes('--check');
const lvl = +(args[0] || 40), rolls = 3; let bad = 0;
for (const cls of ['sorceress', 'assassin', 'barbarian']) {
  const res = [];
  for (const u of D.UNIQUES) { if (u.slot === 'weapon' && u.kind !== D.CLASSES[cls].weapon) continue;
    let gU = 0, gK = 0, kBest = '';
    for (let r = 0; r < rolls; r++) { seed = 0x4b31 + r * 101; hero(cls, lvl, lvl, 3); const S = G.S, own = S.equip[u.slot]; if (!own) continue;
      const p0 = G.power(); const U = mkU(u, lvl); S.equip[u.slot] = U; const pU = G.power(); S.equip[u.slot] = own;
      let best = -1; for (const k of G.coreKeys(U)) { own.core = { eff: G.coreEff(U, k) }; const p = G.power(); if (p > best) { best = p; kBest = k; } delete own.core; }
      gU += pU / p0 - 1; gK += best / p0 - 1; }
    res.push([u.name, u.slot, gU / rolls, gK / rolls, kBest]); }
  res.sort((a, b) => b[3] - a[3]);
  console.log(`\n${cls} St.${lvl} (selten, ${rolls} Würfe): Einzigartiges tragen vs. Kern aufs eigene Teil`);
  // Schranke nach Messung (2026-11-22, St. 40: höchstens +21 % – Totengräbers Griff, „Schaden gg. Sterbende“): ein Kern
  // ist eine Würze, kein Ersatz für ein ganzes Einzigartiges. Über +30 % wäre er die eine Antwort für jedes Teil.
  if (CHECK && res[0][3] > 0.3) { bad++; console.log(`  ⚠ ${cls}: Kern aus ${res[0][0]} bringt ${Math.round(res[0][3] * 100)} % Kampfkraft`); }
  for (const [n, s, a, b, k] of res) console.log(`${n.padEnd(24)} ${s.padEnd(7)} tragen ${(a * 100).toFixed(1).padStart(6)} %   Kern ${(b * 100).toFixed(1).padStart(6)} % (${k})`);
}
if (CHECK && bad) process.exit(1);
