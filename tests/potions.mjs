// Balance der Tränke: jeder Trank (mit jedem Auslöser) allein im Gürtel, echte Kämpfe gegen Krypta-Gegner (Siegchance ~50 % ohne Trank)
// und gegen jeden Boss einzeln (zeigt, welcher Trank welchem Boss antwortet).
// Aufruf: node tests/potions.mjs [klasse|all] [stufe] [kämpfe] [--check]
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
// Gekoppelter Zufall: jeder Kampf mit und ohne Trank bekommt dieselben Würfel (sonst Rauschen ±5 Punkte)
let seed = 0x5eed; const mul = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
Math.random = () => mul();
const D = await import('../js/data.js');
const G = await import('../js/state.js');
const { makeItem } = await import('../js/loot.js');
const { fight } = await import('../js/combat.js');
const only = process.argv[2] && process.argv[2] !== 'all' ? [process.argv[2]] : Object.keys(D.CLASSES);
const LV = +process.argv[3] ? [+process.argv[3]] : [12, 24];
const N = +process.argv[4] || 400, CHECK = process.argv.includes('--check'); let bad = 0;
const sum = {};

function hero(cls, L) {
  G.newChar('Trank', cls); const S = G.S; S.lvl = L;
  const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, main = D.CLASSES[cls].main;
  S.attrs[main] += Math.round(pts * 0.55); S.attrs.con += Math.round(pts * 0.3); S.attrs.int += Math.round(pts * 0.05); S.attrs.lck += Math.round(pts * 0.1);
  const wb = D.BASES.filter(b => b.kind === D.CLASSES[cls].weapon && (!b.minLvl || L >= b.minLvl)).pop();
  S.equip.weapon = { id: 'w', slot: 'weapon', kind: wb.kind, mods: {}, dmg: wb.dmg.map(x => Math.round(x * (1 + L * 0.18) * 1.15)) };
  for (const s of ['helm', 'chest', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand']) { const it = makeItem(L, { slot: s.startsWith('ring') ? 'ring' : s }); it.mods = {}; delete it.fx; S.equip[s] = it; }
}
const floors = (L, k) => Array.from({ length: N }, (_, i) => { const c = D.CRYPTS[i % 4]; return G.makeMonster(L, k * (1 + (i % 4) * 0.05), D.MONSTERS.find(m => m.name === c.floors[i % 4])); });
const boss = (c, L, k) => Array.from({ length: Math.ceil(N / 2) }, () => { const mo = G.makeMonster(L, D.CFG.bossDiff * k, c.boss);
  mo.hp = Math.round(mo.hp * D.CFG.bossHp); mo.boss = true; mo.rage = 0.2; mo.crit = 0.05; const { mirror, ...m } = c.boss.mech; Object.assign(mo, m); return mo; });
const rate = (list, belt) => { const A = { ...G.stats(), belt }; let w = 0; list.forEach((m, i) => { seed = 7919 * (i + 1); if (fight(A, m).winner === 'a') w++; }); seed = 0x5eed; return w / list.length; };   // fester Zufall danach → Test reproduzierbar (kein Rauschen von Lauf zu Lauf)
const tune = mk => { let lo = 0.2, hi = 3, k = 1; for (let i = 0; i < 9; i++) { k = (lo + hi) / 2; if (rate(mk(k).slice(0, 200), []) > 0.5) lo = k; else hi = k; } return mk(k); };
const pf = x => ((x >= 0 ? '+' : '') + (x * 100).toFixed(1)).padStart(7);

for (const cls of only) for (const L of LV) {
  hero(cls, L);
  const M = tune(k => floors(L, k)), BS = D.CRYPTS.filter(c => !c.boss.mech.mirror).map(c => [c, tune(k => boss(c, L, k))]);
  const r0 = rate(M, []), b0 = BS.map(([, l]) => rate(l, []));
  console.log(`\n${D.CLASSES[cls].name} Stufe ${L}  (ohne: Ebenen ${(r0 * 100).toFixed(0)} %, Bosse ${b0.map(x => (x * 100).toFixed(0)).join('/')} %)`);
  console.log('Trank / Auslöser'.padEnd(34) + 'Ebenen' + BS.map(([c]) => c.boss.name.split(/[ ,]/)[0].slice(0, 7).padStart(8)).join(''));
  for (const p of D.POTIONS) for (const t of p.trig || [null]) {
    const belt = [{ id: p.id, name: p.name, fx: p.fx, rare: p.rare, trig: t }];
    const r = rate(M, belt) - r0, bs = BS.map(([, l], i) => rate(l, belt) - b0[i]);
    const key = p.id + (t ? ':' + t : ''); (sum[key] ||= []).push(r);
    const lo = -0.02, hi = p.rare ? 0.22 : 0.16;
    if (r < lo || r > hi) { bad++; console.log(`!! ${key}: ${(r * 100).toFixed(1)} Pkt außerhalb ${lo * 100}…+${hi * 100}`); }
    console.log(`${p.rare ? '*' : ' '} ${p.name}${t ? ' / ' + D.TRIGGERS[t] : ''}`.slice(0, 33).padEnd(34) + pf(r) + bs.map(pf).map(x => x.padStart(8)).join(''));
  }
}
console.log('\nMittel über alle (Ebenen):'); for (const [k, v] of Object.entries(sum)) console.log('  ' + k.padEnd(22) + pf(v.reduce((a, b) => a + b, 0) / v.length));
if (CHECK && bad) { console.log(`${bad} Tränke außerhalb des Rahmens`); process.exit(1); }
if (CHECK) console.log('Tränke im Rahmen.');
