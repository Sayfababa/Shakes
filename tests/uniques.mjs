// Balance der Einzigartigen: jedes Stück gegen ein gewöhnliches Teil desselben Platzes getauscht,
// gemessen in echten Kämpfen (Gegner so stark, dass der Held ohne das Stück etwa die Hälfte gewinnt)
// und gegen die Krypta-Bosse. Zeigt auch, ob die Kampfkraft-Schätzung (power) mitkommt.
// Aufruf: node tests/uniques.mjs [klasse|all] [stufe|all] [kämpfe] [--check]
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
// Gekoppelter Zufall: jeder Kampf mit und ohne das Stück bekommt dieselben Würfel
let seed = 0x5eed; const mul = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
Math.random = () => mul();
const D = await import('../js/data.js');
const G = await import('../js/state.js');
const { makeItem, affixPool, affixValue, fixedMods, topTier } = await import('../js/loot.js');
const { fight } = await import('../js/combat.js');

const only = process.argv[2] && process.argv[2] !== 'all' ? [process.argv[2]] : D.PLAYABLE;
const LV = +process.argv[3] ? [+process.argv[3]] : [14, 24];
const N = +process.argv[4] || 300, CHECK = process.argv.includes('--check');
// Rahmen (Prozentpunkte Siegchance bei ~50 %): jedes Stück muss für mindestens eine Klasse ein echter Fund sein
// und darf für keine alles entscheiden. Dass ein Stück zur falschen Klasse nicht passt, ist gewollt.
// `fused`: gegen ein selbst gebautes (fusioniertes) Teil darf ein Einzigartiges nicht deutlich abfallen.
// −12 liegt in der gemessenen Lücke: die Ausreißer lagen bei −17 bis −21, das nächstbeste Stück bei −8,7.
const LIM = { best: 6, any: 55, fused: -12 };
const seen = {};

const SLOTS = ['helm', 'chest', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand'];
function hero(cls, L) {
  G.newChar('Uniq', cls); const S = G.S; S.lvl = L; S.tut = 99;
  const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, main = D.CLASSES[cls].main;
  S.attrs[main] += Math.round(pts * 0.55); S.attrs.con += Math.round(pts * 0.3); S.attrs.int += Math.round(pts * 0.05); S.attrs.lck += Math.round(pts * 0.1);
  for (const s of SLOTS) { const it = makeItem(L, { slot: s.startsWith('ring') ? 'ring' : s, minRarity: 3 }); delete it.fx; delete it.special; S.equip[s] = it; }
  S.equip.weapon = weapon(cls, L, null);
  return S;
}
// Waffe: Grundwerte der Klassenwaffe, ohne Boni – `u` setzt die Einzigartig-Werte darauf
function weapon(cls, L, u) {
  const kind = u?.kind || D.CLASSES[cls].weapon;
  const it = makeItem(L, { slot: 'weapon', kind, minRarity: 3 }); it.id = 'w'; delete it.fx; delete it.special; delete it.unique;
  if (u) uniq(it, u, L);
  return it;
}
// Einzigartige Boni auf ein Teil legen – über dieselbe Regel wie makeItem (fixedMods), nicht nachgebaut
function uniq(it, u, L) {
  it.mods = {}; it.tiers = {}; it.fx = { ...u.eff }; it.unique = u.name; it.name = u.name; it.lvl = L;
  fixedMods(it, u.mods, L, D.CFG.uniqTierUp, D.CFG.uniqMult);
  return it;
}
// Was der Spieler sich selbst bauen kann: dasselbe Teil, einmal fusioniert mit dem besten Bonus,
// den dieser Platz tragen darf (Stufe I). Das ist die eigentliche Messlatte für ein Einzigartiges –
// erwürfelte Beute ist es nicht mehr, seit es das Fusionieren gibt. Läuft bewusst über G.fuse(),
// damit der Test den Regeln folgt, wenn sie sich ändern.
function fuseSlot(S, sl, L) {
  const main = JSON.parse(JSON.stringify(S.equip[sl]));
  main.id = 'fz_' + sl; main.fused = 0; main.glut = main.glutMax = 60; delete main.crafted; delete main.sealed;
  delete main.unique; delete main.lore;   // minRarity 3 würfelt gelegentlich ein Einzigartiges – das wäre nicht fusionierbar
  S.equip[sl] = main;
  const pool = affixPool(main).filter(a => !a.stat.startsWith('sk_') && !(a.stat in main.mods));
  if (!pool.length) return main;
  // Greedy über die Kampfkraft wählen – so, wie ein Spieler den besten Spender nähme. Spender: beste Stufe, die die
  // Gegenstandsstufe freischaltet. Ob der Bonus passt (Präfix/Suffix), entscheidet fuseCheck – weichen darf der schwächste,
  // der die Regel erfüllt.
  const T1 = topTier(main.lvl), mods0 = { ...main.mods }, tiers0 = { ...main.tiers };
  const donorFor = a => { const d = JSON.parse(JSON.stringify(main)); d.id = 'dz_' + sl; d.fused = 0; delete d.sealed;
    d.mods = { [a.stat]: affixValue(a, T1) }; d.tiers = { [a.stat]: T1 }; return d; };
  const weakFirst = Object.keys(G.baseMods(main)).sort((x, y) => (main.tiers[y] || 3) - (main.tiers[x] || 3));
  const swap = (a, d) => [null, ...weakFirst].find(m => !G.fuseCheck(main, d, a.stat, m));
  S.gold = 1e9;
  let best = null, bestP = -1, bestD = null, bestM;
  for (const a of pool) {
    const d = donorFor(a); S.bag.push(d); const m = swap(a, d); S.bag.pop(); if (m === undefined) continue;
    main.mods = { ...mods0, [a.stat]: d.mods[a.stat] }; main.tiers = { ...tiers0, [a.stat]: T1 }; if (m) { delete main.mods[m]; delete main.tiers[m]; }
    const p = G.power(); if (p > bestP) { bestP = p; best = a; bestD = d; bestM = m; }
  }
  main.mods = mods0; main.tiers = tiers0;
  if (!best) return main;
  S.bag.push(bestD);
  const r = G.fuse(main.id, bestD.id, best.stat, bestM);
  if (r.err) console.log(`   (Fusion ${sl} nicht möglich: ${r.err})`);
  return S.equip[sl];
}
const bosses = L => D.CRYPTS.filter(c => !c.boss.mech.mirror).map(c => { const mo = G.makeMonster(L, D.CFG.bossDiff * 0.82, c.boss);
  mo.hp = Math.round(mo.hp * D.CFG.bossHp); mo.boss = true; mo.rage = 0.2; mo.crit = 0.05; Object.assign(mo, c.boss.mech); return mo; });
const mobs = (L, diff) => Array.from({ length: N }, (_, i) => G.makeMonster(L, diff, D.MONSTERS[i % D.MONSTERS.length]));
const rate = list => { const A = G.stats(); let w = 0; list.forEach((m, i) => { seed = 7919 * (i + 1); if (fight(A, m).winner === 'a') w++; }); seed = 0x5eed; return w / list.length; };
const f = x => ((x >= 0 ? '+' : '−') + Math.abs(x * 100).toFixed(1)).padStart(8);

// Mehrere Ausrüstungswürfe je Klasse und Stufe (Falle: ein einzelner Wurf entscheidet alles) – geprüft wird der Mittelwert
const R = +(process.argv.find(a => a.startsWith('--rolls='))?.slice(8)) || 8;
for (const cls of only) for (const L of LV) for (let g = 0; g < R; g++) {
  seed = 0x5eed + g * 104729;   // je Wurf eigene Ausrüstung (rate() setzt den Keim sonst immer zurück)
  const S = hero(cls, L);
  let lo = 0.5, hi = 5, diff = 1;   // Welle 1a: gut ausgerüstete Helden liegen über 2,5 – sonst misst man bei 100 % Sieg nur Rauschen
  for (let i = 0; i < 8; i++) { diff = (lo + hi) / 2; if (rate(mobs(L, diff).slice(0, 200)) > 0.5) lo = diff; else hi = diff; }
  const base = { ...S.equip }, M = mobs(L, diff);
  const B = []; for (let i = 0; i < Math.ceil(N / 4); i++) B.push(...bosses(L));
  let bf = 1; { let l2 = 0.3, h2 = 6; for (let i = 0; i < 8; i++) { bf = (l2 + h2) / 2; if (rate(B.slice(0, 160).map(b => ({ ...b, hp: b.hp * bf, dmg: b.dmg.map(x => x * bf) }))) > 0.5) l2 = bf; else h2 = bf; } }
  const BB = B.map(b => ({ ...b, hp: b.hp * bf, dmg: b.dmg.map(x => x * bf) }));
  const r0 = rate(M), b0 = rate(BB), p0 = G.power();
  // Je Platz einmal: dasselbe Teil fusioniert, und wie oft der Held damit gewinnt
  const RF = {};
  for (const sl of ['weapon', ...SLOTS]) { S.equip = { ...base }; const fz = fuseSlot(S, sl, L);
    S.equip = { ...base, [sl]: fz }; RF[sl] = rate(M); }
  S.equip = { ...base };
  const fAvg = (Object.values(RF).reduce((a, x) => a + x, 0) / Object.keys(RF).length - r0) * 100;
  console.log(`\n${D.CLASSES[cls].name} Stufe ${L}  (ohne: Sieg ${(r0 * 100).toFixed(0)} %, Boss ${(b0 * 100).toFixed(0)} %, KK ${p0}; eine Fusion bringt Ø ${fAvg >= 0 ? '+' : '−'}${Math.abs(fAvg).toFixed(1)} Pkt)`);
  console.log('Einzigartig'.padEnd(24) + 'Platz'.padEnd(10) + 'Δ Sieg'.padStart(8) + 'Δ Boss'.padStart(8) + 'Δ KK'.padStart(8) + 'Δ vs. fus.'.padStart(11));
  for (const u of D.UNIQUES) {
    if (u.kind && u.kind !== D.CLASSES[cls].weapon) continue;   // fremde Waffenart misst nur die Klassenstrafe, nicht das Stück
    S.equip = { ...base };
    if (u.slot === 'weapon') S.equip.weapon = weapon(cls, L, u);
    else S.equip[u.slot === 'ring' ? 'ring1' : u.slot] = uniq({ ...base[u.slot === 'ring' ? 'ring1' : u.slot], id: 'u' }, u, L);
    const sl = u.slot === 'ring' ? 'ring1' : u.slot;
    const ru = rate(M), r = ru - r0, b = rate(BB) - b0, p = G.power() / p0 - 1, fus = ru - (RF[sl] ?? r0);
    S.equip = { ...base };
    (seen[u.name] ||= []).push({ cls, L, r, fus, g });
    console.log(u.name.slice(0, 23).padEnd(24) + (u.kind || D.SLOTS[u.slot]).padEnd(10) + f(r) + f(b) + f(p) + f(fus).padStart(11));
  }
}
if (CHECK) {
  let bad = 0;
  // Waffen nicht wählbarer Klassen (Bogen, Zauberstab, Schwert) misst niemand – die Klassen kommen später wieder
  const kinds = new Set(only.map(c => D.CLASSES[c].weapon));
  for (const u of D.UNIQUES) {
    if (u.kind && !kinds.has(u.kind)) continue;
    const raw = seen[u.name]; if (!raw?.length) { bad++; console.log(`!! ${u.name}: nie gemessen`); continue; }
    const grp = {}; for (const x of raw) (grp[x.cls + x.L] ||= []).push(x);
    const rows = Object.values(grp).map(l => ({ cls: l[0].cls, L: l[0].L, r: l.reduce((a, x) => a + x.r, 0) / l.length, fus: l.reduce((a, x) => a + x.fus, 0) / l.length }));
    const best = rows.reduce((x, y) => y.r > x.r ? y : x);
    console.log(`Ø ${u.name.slice(0, 22).padEnd(23)} ${rows.map(x => `${D.CLASSES[x.cls].name.slice(0, 4)} ${x.L}: ${f(x.r)}`).join(' ')}`);
    if (best.r * 100 < LIM.best) { bad++; console.log(`!! ${u.name}: beste Klasse nur ${(best.r * 100).toFixed(1)} Pkt (${D.CLASSES[best.cls].name} ${best.L}), mindestens ${LIM.best}`); }
    for (const x of rows) if (x.r * 100 > LIM.any) { bad++; console.log(`!! ${u.name}: ${(x.r * 100).toFixed(1)} Pkt bei ${D.CLASSES[x.cls].name} ${x.L}, höchstens ${LIM.any}`); }
    // Gegen ein selbst fusioniertes Teil: für seine beste Klasse muss das Stück die Wahl wert bleiben
    const bf = rows.reduce((x, y) => y.fus > x.fus ? y : x);
    if (bf.fus * 100 < LIM.fused) { bad++; console.log(`!! ${u.name}: gegen ein fusioniertes Teil nur ${(bf.fus * 100).toFixed(1)} Pkt (${D.CLASSES[bf.cls].name} ${bf.L}), mindestens ${LIM.fused}`); }
  }
  if (bad) { console.log(`\n${bad} Einzigartige außerhalb des Rahmens.`); process.exit(1); }
  console.log('\nEinzigartige im Rahmen.');
}
