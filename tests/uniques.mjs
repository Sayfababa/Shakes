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
const { makeItem } = await import('../js/loot.js');
const { fight } = await import('../js/combat.js');

const only = process.argv[2] && process.argv[2] !== 'all' ? [process.argv[2]] : Object.keys(D.CLASSES);
const LV = +process.argv[3] ? [+process.argv[3]] : [14, 24];
const N = +process.argv[4] || 300, CHECK = process.argv.includes('--check');
// Rahmen (Prozentpunkte Siegchance bei ~50 %): jedes Stück muss für mindestens eine Klasse ein echter Fund sein
// und darf für keine alles entscheiden. Dass ein Stück zur falschen Klasse nicht passt, ist gewollt.
const LIM = { best: 6, any: 55 };
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
// Einzigartige Boni auf ein Teil legen (wie makeItem es tut)
function uniq(it, u, L) {
  it.mods = {}; it.tiers = {}; it.fx = { ...u.eff }; it.unique = u.name; it.name = u.name;
  for (const [stat, t] of Object.entries(u.mods)) { const a = D.AFFIXES.find(x => x.stat === stat), T = D.TIERS.find(x => x.t === t);
    if (a) it.mods[stat] = Math.max(1, Math.round(a.per * (a.pct ? D.CFG.pctBase + L * D.CFG.pctPerLvl : D.CFG.affixBase + L * D.CFG.affixPerLvl) * T.mult * 1.5)); it.tiers[stat] = t; }
  return it;
}
const bosses = L => D.CRYPTS.filter(c => !c.boss.mech.mirror).map(c => { const mo = G.makeMonster(L, D.CFG.bossDiff * 0.82, c.boss);
  mo.hp = Math.round(mo.hp * D.CFG.bossHp); mo.boss = true; mo.rage = 0.2; mo.crit = 0.05; Object.assign(mo, c.boss.mech); return mo; });
const mobs = (L, diff) => Array.from({ length: N }, (_, i) => G.makeMonster(L, diff, D.MONSTERS[i % D.MONSTERS.length]));
const rate = list => { const A = G.stats(); let w = 0; list.forEach((m, i) => { seed = 7919 * (i + 1); if (fight(A, m).winner === 'a') w++; }); seed = 0x5eed; return w / list.length; };
const f = x => ((x >= 0 ? '+' : '−') + Math.abs(x * 100).toFixed(1)).padStart(8);

for (const cls of only) for (const L of LV) {
  const S = hero(cls, L);
  let lo = 0.5, hi = 2.5, diff = 1;
  for (let i = 0; i < 8; i++) { diff = (lo + hi) / 2; if (rate(mobs(L, diff).slice(0, 200)) > 0.5) lo = diff; else hi = diff; }
  const base = { ...S.equip }, M = mobs(L, diff);
  const B = []; for (let i = 0; i < Math.ceil(N / 4); i++) B.push(...bosses(L));
  let bf = 1; { let l2 = 0.3, h2 = 3; for (let i = 0; i < 8; i++) { bf = (l2 + h2) / 2; if (rate(B.slice(0, 160).map(b => ({ ...b, hp: b.hp * bf, dmg: b.dmg.map(x => x * bf) }))) > 0.5) l2 = bf; else h2 = bf; } }
  const BB = B.map(b => ({ ...b, hp: b.hp * bf, dmg: b.dmg.map(x => x * bf) }));
  const r0 = rate(M), b0 = rate(BB), p0 = G.power();
  console.log(`\n${D.CLASSES[cls].name} Stufe ${L}  (ohne: Sieg ${(r0 * 100).toFixed(0)} %, Boss ${(b0 * 100).toFixed(0)} %, KK ${p0})`);
  console.log('Einzigartig'.padEnd(24) + 'Platz'.padEnd(10) + 'Δ Sieg'.padStart(8) + 'Δ Boss'.padStart(8) + 'Δ KK'.padStart(8));
  for (const u of D.UNIQUES) {
    if (u.kind && u.kind !== D.CLASSES[cls].weapon) continue;   // fremde Waffenart misst nur die Klassenstrafe, nicht das Stück
    S.equip = { ...base };
    if (u.slot === 'weapon') S.equip.weapon = weapon(cls, L, u);
    else S.equip[u.slot === 'ring' ? 'ring1' : u.slot] = uniq({ ...base[u.slot === 'ring' ? 'ring1' : u.slot], id: 'u' }, u, L);
    const r = rate(M) - r0, b = rate(BB) - b0, p = G.power() / p0 - 1;
    S.equip = { ...base };
    (seen[u.name] ||= []).push({ cls, L, r });
    console.log(u.name.slice(0, 23).padEnd(24) + (u.kind || D.SLOTS[u.slot]).padEnd(10) + f(r) + f(b) + f(p));
  }
}
if (CHECK) {
  let bad = 0;
  for (const u of D.UNIQUES) {
    const rows = seen[u.name]; if (!rows?.length) { bad++; console.log(`!! ${u.name}: nie gemessen`); continue; }
    const best = rows.reduce((x, y) => y.r > x.r ? y : x);
    if (best.r * 100 < LIM.best) { bad++; console.log(`!! ${u.name}: beste Klasse nur ${(best.r * 100).toFixed(1)} Pkt (${D.CLASSES[best.cls].name} ${best.L}), mindestens ${LIM.best}`); }
    for (const x of rows) if (x.r * 100 > LIM.any) { bad++; console.log(`!! ${u.name}: ${(x.r * 100).toFixed(1)} Pkt bei ${D.CLASSES[x.cls].name} ${x.L}, höchstens ${LIM.any}`); }
  }
  if (bad) { console.log(`\n${bad} Einzigartige außerhalb des Rahmens.`); process.exit(1); }
  console.log('\nEinzigartige im Rahmen.');
}
