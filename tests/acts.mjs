// Balance der Akte: ein Spieler spielt neue Gebiete, solange die Siegchance reicht, sonst farmt er geschaffte Gebiete (Glut).
// Zeigt je Akt: Stufe beim Boss, verbrauchte Glut (≈ Spielzeit), Niederlagen. Ziel: früh flüssig, später spürbar farmen.
// Aufruf: node tests/acts.mjs [klasse|all] [läufe] [--check]
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
let seed = 0xac75; Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const D = await import('../js/data.js'), G = await import('../js/state.js'), Game = await import('../js/game.js'), { makeItem } = await import('../js/loot.js');
const only = process.argv[2] && process.argv[2] !== 'all' ? [process.argv[2]] : D.PLAYABLE, N = +process.argv[3] || 6, CHECK = process.argv.includes('--check');
function spend() { const S = G.S, main = D.CLASSES[S.cls].main; while (S.points > 0) { const A = S.attrs, k = A.con < A[main] * 0.55 ? 'con' : A.lck < A[main] * 0.15 ? 'lck' : main; S.attrs[k]++; S.points--; } }
// Händler: alle 3 Stufen magische Ausrüstung der eigenen Stufe (wie ein Spieler, der Gold ausgibt)
let shopAt = 0;
function shop() { const S = G.S; if (S.lvl < shopAt) return; shopAt = S.lvl + 3; const c = D.CLASSES[S.cls];
  for (const s of ['weapon', 'helm', 'chest', 'gloves', 'boots', 'belt', 'amulet', 'ring', 'offhand']) { const it = makeItem(S.lvl, { slot: s, cls: c, kind: s === 'weapon' ? c.weapon : undefined, minRarity: 2 }); if (G.addToBag(it)) gear(); } }
function gear() { const S = G.S; for (const it of [...S.bag]) { const w = G.powerWith(it); if (w.then > w.now * 1.01) G.equip(it.id); } for (const it of [...S.bag]) G.sell(it.id); }
let bad = 0;
console.log('Klasse      ' + D.ACTS.map(a => `Akt ${a.n}: Stufe/Glut`.padStart(18)).join(''));
for (const cls of only) { const acc = D.ACTS.map(() => ({ lvl: 0, glut: 0, done: 0 }));
  for (let k = 0; k < N; k++) { G.newChar('Sim', cls); const S = G.S; S.tut = 99; let glut = 0; shopAt = 0;
    for (const [i, a] of D.ACTS.entries()) { let guard = 0;
      while (!G.actDone(a) && guard++ < 3000) { spend(); shop(); gear(); S.glut = 999;
        const z = Math.min(G.actProg(a), D.ACT.zones);
        if (Game.actChance(a, z) >= 0.5 || z === 0) { Game.actFight(a.id, z); continue; }
        const r = Math.max(0, z - 1); glut += Game.actZoneGlut(a); Game.actFight(a.id, r); }
      if (G.actDone(a)) { acc[i].done++; acc[i].lvl += S.lvl; acc[i].glut += glut; } } }
  console.log(cls.padEnd(11) + acc.map(x => (x.done ? `${Math.round(x.lvl / x.done)} / ${Math.round(x.glut / x.done)}` : '–').padStart(18)).join(''));
  if (CHECK && acc.some(x => x.done < N)) { bad++; console.log('  ⚠ Akt nicht geschafft'); }
  // Einstieg: Akt I muss mit dem ersten Glut-Vorrat zu schaffen sein (sonst wartet ein neuer Spieler tagelang im ersten Akt)
  if (CHECK && acc[0].done && acc[0].glut / acc[0].done > D.CFG.maxGlut) { bad++; console.log(`  ⚠ Akt I kostet ${Math.round(acc[0].glut / acc[0].done)} Glut (Rahmen ≤ ${D.CFG.maxGlut})`); } }
if (CHECK && bad) process.exit(1);
