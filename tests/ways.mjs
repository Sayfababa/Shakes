// Balance der Zauber-Wege: Jeder Weg einzeln gewählt, gemessen in echten Kämpfen gegen normale Gegner (Siegchance ~50 % ohne Weg)
// und gegen die Krypta-Bosse (mit ihren Mechaniken). Zeigt auch, was die Kampfkraft-Schätzung (power) sagt.
// Aufruf: node tests/ways.mjs [klasse|all] [stufe|all] [kämpfe] [--check]   (--check: Fehler, wenn ein Weg aus dem Rahmen fällt)
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
const D = await import('../js/data.js');
const G = await import('../js/state.js');
const { makeItem } = await import('../js/loot.js');
const { fight } = await import('../js/combat.js');

const only = process.argv[2] && process.argv[2] !== 'all' ? [process.argv[2]] : Object.keys(D.CLASSES);
const LV = +process.argv[3] ? [+process.argv[3]] : [14, 24];
const N = +process.argv[4] || 500, CHECK = process.argv.includes('--check'); let bad = 0;

function hero(cls, L) {
  G.newChar('Weg', cls); const S = G.S; S.lvl = L;
  const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, main = D.CLASSES[cls].main;
  S.attrs[main] += Math.round(pts * 0.55); S.attrs.con += Math.round(pts * 0.3); S.attrs.int += cls === 'sorceress' || cls === 'witch' ? 0 : Math.round(pts * 0.05); S.attrs.lck += Math.round(pts * 0.1);
  const wb = D.BASES.filter(b => b.kind === D.CLASSES[cls].weapon && (!b.minLvl || L >= b.minLvl)).pop();
  S.equip.weapon = { id: 'w', slot: 'weapon', kind: wb.kind, mods: {}, dmg: wb.dmg.map(x => Math.round(x * (1 + L * 0.18) * 1.15)) };
  for (const s of ['helm', 'chest', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand']) { const it = makeItem(L, { slot: s.startsWith('ring') ? 'ring' : s }); it.mods = {}; delete it.fx; S.equip[s] = it; }
}
const mobs = (L, diff) => Array.from({ length: N }, (_, i) => G.makeMonster(L, diff, D.MONSTERS[i % D.MONSTERS.length]));
const bosses = L => D.CRYPTS.filter(c => !c.boss.mech.mirror).map(c => { const mo = G.makeMonster(L, D.CFG.bossDiff * 0.82, c.boss);
  mo.hp = Math.round(mo.hp * D.CFG.bossHp); mo.boss = true; mo.rage = 0.2; mo.crit = 0.05; Object.assign(mo, c.boss.mech); return mo; });
const rate = list => { const A = G.stats(); let w = 0; for (const m of list) if (fight(A, m).winner === 'a') w++; return w / list.length; };

for (const cls of only) for (const L of LV) {
  hero(cls, L);
  // Gegnerstärke so wählen, dass ohne Wege etwa die Hälfte gewonnen wird
  let lo = 0.5, hi = 2, diff = 1; for (let i = 0; i < 8; i++) { diff = (lo + hi) / 2; const r = rate(mobs(L, diff).slice(0, 300)); if (r > 0.5) lo = diff; else hi = diff; }
  const M = mobs(L, diff), B = []; for (let i = 0; i < Math.ceil(N / 5); i++) B.push(...bosses(L));
  // Bosse ebenfalls auf ~50 % bringen (gemeinsamer Faktor)
  let bf = 1; { let l2 = 0.3, h2 = 3; for (let i = 0; i < 8; i++) { bf = (l2 + h2) / 2; const r = rate(B.slice(0, 200).map(b => ({ ...b, hp: b.hp * bf, dmg: b.dmg.map(x => x * bf) }))); if (r > 0.5) l2 = bf; else h2 = bf; } }
  const BB = B.map(b => ({ ...b, hp: b.hp * bf, dmg: b.dmg.map(x => x * bf) }));
  const r0 = rate(M), b0 = rate(BB), p0 = G.power();
  console.log(`\n${D.CLASSES[cls].name} Stufe ${L}  (ohne Wege: Sieg ${(r0 * 100).toFixed(0)} %, Boss ${(b0 * 100).toFixed(0)} %, KK ${p0})`);
  console.log('Zauber'.padEnd(13) + 'St Weg'.padEnd(22) + 'Δ Sieg'.padStart(8) + 'Δ Boss'.padStart(8) + 'Δ KK'.padStart(8) + '   |   Gegenweg  Δ Sieg  Δ Boss');
  for (const sp of D.SPELLS[cls].filter(s => L >= s.lvl)) (D.SPELL_TREE[sp.id] || []).forEach((opts, t) => {
    if (!G.wayOpen(sp, t, L)) return;
    const res = opts.map((o, i) => { G.S.sp = { [sp.id]: [null, null, null] }; G.S.sp[sp.id][t] = i;
      const r = rate(M) - r0, b = rate(BB) - b0, p = G.power() / p0 - 1; G.S.sp = {}; return { o, r, b, p }; });
    const f = x => ((x >= 0 ? '+' : '') + (x * 100).toFixed(1)).padStart(8);
    // Rahmen: kein Weg schadet deutlich, keiner überragt (gegen normale Gegner, Prozentpunkte Siegchance bei ~50 %)
    for (const x of res) if (x.r < -0.04 || x.r > 0.2) { bad++; console.log(`!! ${sp.name} Stufe ${t + 1} ${x.o.name}: ${(x.r * 100).toFixed(1)} Pkt außerhalb −4…+20`); }
    console.log(sp.name.slice(0, 12).padEnd(13) + `${t + 1}  ${res[0].o.name}`.slice(0, 21).padEnd(22) + f(res[0].r) + f(res[0].b) + f(res[0].p) + '   |   ' + res[1].o.name.slice(0, 14).padEnd(16) + f(res[1].r) + f(res[1].b) + f(res[1].p));
  });
}
if (CHECK && bad) { console.log(`${bad} Wege außerhalb des Rahmens`); process.exit(1); }
if (CHECK) console.log('Zauber-Wege im Rahmen.');
