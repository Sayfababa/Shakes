// Lohn neben dem Abgrund (Welle 2B-1): Was bringen Abgrund, Grube und Steckbriefe einem Helden der Stufe 20/30/40?
// Abgrund: tiefste Tiefe mit Boss-Sieg ≥ 50 %, Ø Gold (am Ausgang) und EP je Abstieg (= je Grabsiegel).
// Grube: bester Platz mit Siegchance ≥ 50 % und Gold/EP je Sieg. Steckbrief: Lohn je Auftrag (3 am Tag).
// EP in % der EP bis zur nächsten Stufe. Ziel: Grube und Steckbriefe lohnen neben dem Abgrund, ohne ihn zu entwerten
// (ein Tag Steckbriefe < ein Tag Abgrund an Gold; Grube je Sieg in der Größe eines Abgrund-Kampfs).
// Aufruf: node tests/lohn.mjs [klasse|all] [abstiege] [--check]
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
let seed = 0x10b7; Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const D = await import('../js/data.js'), G = await import('../js/state.js'), Game = await import('../js/game.js');
const { hero } = await import('./held.mjs');
const args = process.argv.slice(2).filter(a => !a.startsWith('--')), CHECK = process.argv.includes('--check');
const only = args[0] && args[0] !== 'all' ? [args[0]] : D.PLAYABLE, N = +args[1] || 40;
const prio = { shrine: 0, fight: 1, treasure: 2, elite: 3 };
function descend(d) {
  G.S.seals = { day: G.today(), n: D.DESCENT.sealMax }; G.S.desc = null; Game.descStart(d);
  let boss = false, gold = 0, xp = 0;
  while (G.S.desc) {
    const nx = Game.descNext(), opts = nx.filter(j => j === 'boss' || !D.DESC_ROOMS[Game.descNodeAt(j).t].exit);
    const j = opts.sort((a, b) => (a === 'boss' ? 9 : prio[Game.descNodeAt(a).t]) - (b === 'boss' ? 9 : prio[Game.descNodeAt(b).t]))[0];
    const r = Game.descEnter(j); if (!r) break; xp += r.res?.rew?.xp || 0;
    const o = r.res?.desc?.out; if (o) { gold = o.gold; if (j === 'boss') boss = true; }
  }
  return { boss, gold, xp };
}
let bad = 0; const places = []; const pc = x => Math.round(x * 100);
console.log('Klasse      St.  Abgrund: Tiefe Boss  Gold/Abstieg EP/Abstieg │ Grube: Platz  Gold/Sieg EP/Sieg │ Steckbrief: Gold  EP');
for (const cls of only) for (const L of [20, 30, 40]) {
  hero(cls, L); const need = G.xpNeed(L);
  // Abgrund: tiefste Tiefe mit ≥ 50 % (grob von oben, Schätzung aus der Heldenstufe)
  let best = 1, rate = 0;
  for (let d = 1; d <= 60; d++) { let w = 0; for (let k = 0; k < 24; k++) { hero(cls, L); if (descend(d).boss) w++; } if (w / 24 >= 0.5) { best = d; rate = w / 24; } else if (d > best + 3) break; }
  let g = 0, x = 0, bw = 0; for (let k = 0; k < N; k++) { hero(cls, L); const r = descend(best); g += r.gold / N; x += r.xp / N; if (r.boss) bw++; }
  // Grube: bester Platz mit Siegchance ≥ 50 % (Rivale an diesem Platz)
  hero(cls, L); const P = G.S.pit; let place = D.PIT.size + 1, pg = 0, px = 0;
  for (let p = D.PIT.size; p >= 1; p--) { const id = P.lad[p - 1] === 'me' ? P.lad[p] : P.lad[p - 1], B = Game.pitFoe(id, p);
    if (Game.pitChance(B, null, [], 120) >= 0.5) { place = p; pg = Game.pitWinGold(B); px = Game.pitWinXp(B); } }
  const br = G.bountyReward();
  console.log(`${cls.padEnd(11)} ${String(L).padStart(3)}  T${String(best).padEnd(3)} ${String(pc(bw / N)).padStart(3)} %  ${String(Math.round(g)).padStart(10)} ${String(pc(x / need)).padStart(7)} % │ ${String(place).padStart(6)} ${String(pg).padStart(10)} ${String(pc(px / need)).padStart(5)} % │ ${String(br.gold).padStart(14)} ${String(pc(br.xp / need)).padStart(3)} %`);
  if (CHECK) {
    // Schranken nach Messung (siehe berichte/welle2b1-leiter.md)
    if (br.gold * 3 >= g * 2) { bad++; console.log(`  ⚠ ${cls} St.${L}: ein Tag Steckbriefe bringt mehr Gold als ein Tag Abgrund`); }
    if (!(pg >= g * 0.04 && pg <= g * 0.4)) { bad++; console.log(`  ⚠ ${cls} St.${L}: Grube je Sieg ${pg} Gold passt nicht zum Abstieg (${Math.round(g)})`); }
    if (!(px >= need * 0.004)) { bad++; console.log(`  ⚠ ${cls} St.${L}: Grube je Sieg kaum EP`); }
    if (!(x >= need * 0.05)) { bad++; console.log(`  ⚠ ${cls} St.${L}: ein Abstieg bringt unter 5 % einer Stufe`); }
    places.push([cls, L, place]);
  }
}
// Grube wächst mit: stärkere Helden kommen höher, und Platz 1 ist auf Stufe 20/30 nicht zu haben
if (CHECK) for (const cls of only) { const p = places.filter(x => x[0] === cls).map(x => x[2]);
  if (!(p[0] > p[2] && p[0] > 5 && p[1] > 1)) { bad++; console.log(`  ⚠ ${cls}: Grube wächst nicht mit (${p.join('/')})`); } }
if (CHECK && bad) process.exit(1);
