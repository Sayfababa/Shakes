// Balance der Grab-Sets: Was bringen 2 und 3 Teile in echten Kämpfen, und ist ein volles Set
// etwa so stark wie drei gute seltene Teile? Gemessen als Siegchance gegen Gegner, die ohne Set ~50 % schaffen.
// Aufruf: node tests/sets.mjs [klasse|all] [stufe|all] [kämpfe] [--check]
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
// Gekoppelter Zufall: jeder Kampf mit und ohne Set bekommt dieselben Würfel (sonst Rauschen ±5 Punkte)
let seed = 0x5eed; const mul = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
Math.random = () => mul();
const D = await import('../js/data.js');
const G = await import('../js/state.js');
const { makeItem, makeSetItem } = await import('../js/loot.js');
const { fight } = await import('../js/combat.js');

const only = process.argv[2] && process.argv[2] !== 'all' ? [process.argv[2]] : Object.keys(D.CLASSES);
const LV = +process.argv[3] ? [+process.argv[3]] : [14, 24];
const N = +process.argv[4] || 400, CHECK = process.argv.includes('--check');
// Rahmen: 2 Teile wie ein guter Bonus, 3 Teile wie ein Sonderbonus; ein volles Set darf drei seltene Teile nicht abhängen.
const LIM = { two: [-1, 10], three: [-2, 22], vsRare: [-35, 60] };   // vsRare ist nur ein grobes Geländer: seltene Teile würfeln stark streuend
let bad = 0;

const SLOTS = ['helm', 'chest', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand'];
function hero(cls, L) {
  G.newChar('Set', cls); const S = G.S; S.lvl = L; S.tut = 99;
  const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, main = D.CLASSES[cls].main;
  S.attrs[main] += Math.round(pts * 0.55); S.attrs.con += Math.round(pts * 0.3); S.attrs.int += Math.round(pts * 0.05); S.attrs.lck += Math.round(pts * 0.1);
  const wb = D.BASES.filter(b => b.kind === D.CLASSES[cls].weapon && (!b.minLvl || L >= b.minLvl)).pop();
  S.equip.weapon = { id: 'w', slot: 'weapon', kind: wb.kind, mods: {}, dmg: wb.dmg.map(x => Math.round(x * (1 + L * 0.18) * 1.15)) };
  for (const s of SLOTS) { const it = makeItem(L, { slot: s.startsWith('ring') ? 'ring' : s, minRarity: 2 }); delete it.fx; delete it.special; S.equip[s] = it; }
  return S;
}
const slotOf = (S, it) => it.slot === 'ring' ? (S.equip.ring1?.set ? 'ring2' : 'ring1') : it.slot;
// Krypta-Bosse mit ihren Mechaniken – manche Sets sind vor allem eine Antwort darauf
const bosses = L => D.CRYPTS.filter(c => !c.boss.mech.mirror).map(c => { const mo = G.makeMonster(L, D.CFG.bossDiff * 0.82, c.boss);
  mo.hp = Math.round(mo.hp * D.CFG.bossHp); mo.boss = true; mo.rage = 0.2; mo.crit = 0.05; Object.assign(mo, c.boss.mech); return mo; });
const mobs = (L, diff) => Array.from({ length: N }, (_, i) => G.makeMonster(L, diff, D.MONSTERS[i % D.MONSTERS.length]));
const rate = list => { const A = G.stats(); let w = 0; list.forEach((m, i) => { seed = 7919 * (i + 1); if (fight(A, m).winner === 'a') w++; }); seed = 0x5eed; return w / list.length; };
const f = x => ((x >= 0 ? '+' : '') + (x * 100).toFixed(1)).padStart(8);

for (const cls of only) for (const L of LV) {
  const S = hero(cls, L);
  let lo = 0.5, hi = 2.5, diff = 1;
  for (let i = 0; i < 8; i++) { diff = (lo + hi) / 2; if (rate(mobs(L, diff).slice(0, 250)) > 0.5) lo = diff; else hi = diff; }
  const base = { ...S.equip }, M = mobs(L, diff);
  const B = []; for (let i = 0; i < Math.ceil(N / 4); i++) B.push(...bosses(L));
  let bf = 1; { let l2 = 0.3, h2 = 3; for (let i = 0; i < 8; i++) { bf = (l2 + h2) / 2; if (rate(B.slice(0, 160).map(b => ({ ...b, hp: b.hp * bf, dmg: b.dmg.map(x => x * bf) }))) > 0.5) l2 = bf; else h2 = bf; } }
  const BB = B.map(b => ({ ...b, hp: b.hp * bf, dmg: b.dmg.map(x => x * bf) }));
  const r0 = rate(M), b0 = rate(BB), p0 = G.power();
  console.log(`\n${D.CLASSES[cls].name} Stufe ${L}  (ohne Set: Sieg ${(r0 * 100).toFixed(0)} %, Boss ${(b0 * 100).toFixed(0)} %, KK ${p0})`);
  console.log('Set'.padEnd(26) + 'Δ 2 Teile'.padStart(10) + 'Δ 3 Teile'.padStart(10) + 'Δ Boss'.padStart(8) + 'Δ KK'.padStart(8) + '  volles Set statt 3 seltenen');
  for (const set of D.SETS) {
    const pieces = set.parts.map((_, i) => makeSetItem(set.id, i, L));
    // n Teile anlegen; `on` = mit Set-Boni, sonst dieselben Teile ohne Set-Zugehörigkeit (misst den Bonus allein)
    const put = (n, on) => { S.equip = { ...base };
      for (let i = 0; i < n; i++) { const it = { ...pieces[i] }; if (!on) delete it.set; S.equip[slotOf(S, it)] = it; } };
    put(2, false); const off2 = rate(M); put(2, true); const r2 = rate(M) - off2;
    put(3, false); const off3 = rate(M), offB = rate(BB), offP = G.power(); put(3, true); const r3 = rate(M) - off3, full = rate(M), rb = rate(BB) - offB, dp = G.power() / offP - 1;
    // Vergleich: dieselben drei Plätze mit seltenen Teilen (über mehrere Würfe gemittelt, sonst zu zufällig)
    let rr = 0, k = 5;
    for (let j = 0; j < k; j++) { S.equip = { ...base };
      for (const p of pieces) { const it = makeItem(L, { slot: p.slot, minRarity: 3 }); delete it.fx; delete it.special; S.equip[slotOf(S, { slot: p.slot, set: 1 })] = it; }
      rr += rate(M) / k; }
    S.equip = { ...base };
    const chk = (v, [a, b], what) => { if (CHECK && (v * 100 < a || v * 100 > b)) { bad++; console.log(`!! ${set.name} ${what}: ${(v * 100).toFixed(1)} Pkt außerhalb ${a}…${b}`); } };
    chk(r2, LIM.two, 'Bonus 2 Teile'); chk(r3, LIM.three, 'Bonus 3 Teile'); chk(full - rr, LIM.vsRare, 'gegen 3 seltene');
    console.log(set.name.slice(0, 25).padEnd(26) + f(r2) + f(r3) + f(rb) + f(dp) + '  ' + f(full - rr));
  }
}
if (CHECK) { if (bad) { console.log(`\n${bad} Set-Bonus/Boni außerhalb des Rahmens.`); process.exit(1); } console.log('\nGrab-Sets im Rahmen.'); }
