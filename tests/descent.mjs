// Balance des endlosen Abgrunds. Helden steigen immer weiter (Kampfräume bevorzugt) bis zum Boss.
// Teil 1 (Räume): je Klasse/Stufe in der Tiefe, deren Gegner eine Stufe über dem Helden stehen – wie viele den
//   k-ten Raum überleben, Boss erreicht/besiegt, Ø Gold beim Entkommen.
//   Ziel: Raum 1 fast sicher (≥ 85 %); auf Stufe 10 Ø Boss-Sieg 10–60 %.
// Teil 2 (--deep): wie tief kommt ein Held der Stufe 20/30/40 mit Boss-Sieg ≥ 50 %? Ausrüstung magisch, Stufe = Held.
// Teil 3 (--deep): Rückkopplung – ein Held, der mit der Beute einer Tiefe ausgerüstet ist (Beutestufe dort,
//   selten, Heldenstufe = Gegnerstufe − 1), gegen dieselbe Tiefe und tiefer. Die Siegchance muss mit der Tiefe
//   fallen, sonst läuft die Beute der Gefahr davon.
// Aufruf: node tests/descent.mjs [klasse|all] [stufe] [läufe] [--check] [--deep]
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
let seed = 0xd35c; Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
const D = await import('../js/data.js');
const G = await import('../js/state.js');
const Game = await import('../js/game.js');
const { makeItem } = await import('../js/loot.js');
const { learnAll } = await import('./bot.mjs');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const CHECK = process.argv.includes('--check'), DEEP = process.argv.includes('--deep'), CURVE = !process.argv.includes('--nocurve');
const only = args[0] && args[0] !== 'all' ? [args[0]] : D.PLAYABLE;
const LV = +args[1] ? [+args[1]] : [10, 20], N = +args[2] || 150;

// gear = Gegenstandsstufe der Ausrüstung, minR = Mindest-Seltenheit
function hero(cls, L, gear = L, minR = 2, depth = 0) {   // depth: Beute aus dieser Tiefe (Abgrund-Stufen über I)
  G.newChar('Abstieg', cls); const S = G.S; S.lvl = L; S.tut = 99;
  const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, main = D.CLASSES[cls].main;
  S.attrs[main] += Math.round(pts * 0.55); S.attrs.con += Math.round(pts * 0.3); S.attrs.int += Math.round(pts * 0.05); S.attrs.lck += Math.round(pts * 0.1);
  // Waffe und Talente über die Regeln des Spiels (makeItem, Brett/Zauber-Wege wie der Bot) – vorher handgebaut,
  // Zauberin/Assassine lernten dabei alte Knoten ohne Brett und sahen im Abgrund 5–7 Tiefen schwächer aus als der Barbar.
  S.equip.weapon = makeItem(gear, { slot: 'weapon', kind: D.CLASSES[cls].weapon, cls: D.CLASSES[cls], minRarity: minR, depth });
  for (const s of ['helm', 'chest', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand']) S.equip[s] = makeItem(gear, { slot: s.startsWith('ring') ? 'ring' : s, minRarity: minR, depth });
  learnAll();
  // alle Grüfte offen (die Tiefe wählt die Gruft reihum), Rekord so, dass jede Tiefe startbar ist
  for (const c of D.CRYPTS) S.trophies.push({ key: c.id + ':0', eff: c.trophy });
  S.deep = { best: 9999, week: -1, wBest: 0 };
}
const prio = { shrine: 0, fight: 1, treasure: 2, elite: 3 };
// Ein Abstieg bis zum Boss (oder Tod). Gibt die erreichten Räume, ob der Boss fiel, und das Gold beim Entkommen.
function descend(d) {
  G.S.seals = { day: G.today(), n: D.DESCENT.sealMax }; G.S.desc = null;
  if (!Game.descStart(d)) throw new Error('Abstieg nicht startbar: Tiefe ' + d);
  const reach = []; let boss = false, gold = 0;
  for (let room = 0; G.S.desc; room++) {
    const nx = Game.descNext(), opts = nx.filter(j => j === 'boss' || !D.DESC_ROOMS[Game.descNodeAt(j).t].exit);
    const j = opts.sort((a, b) => (a === 'boss' ? 9 : prio[Game.descNodeAt(a).t]) - (b === 'boss' ? 9 : prio[Game.descNodeAt(b).t]))[0];
    const r = Game.descEnter(j); if (!r) break;
    if (G.S.desc && room < 5) reach[room] = 1;
    const o = r.res?.desc?.out; if (o) { gold = o.gold; if (j === 'boss') boss = true; }
  }
  return { reach, boss, gold };
}
// Tiefe, deren Gegner eine Stufe über dem Helden stehen (wie früher: Heldenstufe + 1)
const depthFor = L => Math.max(1, Math.round((L + 1 - D.DESCENT.lvlBase) / D.DESCENT.lvlPer));
const bossRate = (mk, d, n) => { let w = 0; for (let k = 0; k < n; k++) { mk(); if (descend(d).boss) w++; } return w / n; };
let bad = 0;

// --- Teil 1: Räume ---
const win10 = [];
console.log('Klasse      Stufe Tiefe  R1   R2   R3   R4   R5  Boss-Sieg  Ø Gold (entkommen)');
for (const cls of only) for (const L of LV) {
  const reach = [0, 0, 0, 0, 0], d = depthFor(L); let bw = 0, gold = 0, out = 0;
  for (let k = 0; k < N; k++) { hero(cls, L); const r = descend(d); r.reach.forEach((x, i) => reach[i] += x || 0); if (r.boss) bw++; if (r.gold || r.boss) { out++; gold += r.gold; } }
  const p = x => (Math.round(x / N * 100) + ' %').padStart(5);
  console.log(`${cls.padEnd(11)} ${String(L).padStart(5)} ${String(d).padStart(5)} ${reach.map(p).join('')}  ${p(bw).padStart(9)}  ${String(Math.round(gold / Math.max(1, out))).padStart(10)}`);
  if (CHECK && reach[0] / N < 0.85) { bad++; console.log('  ⚠ schon der erste Raum ist zu gefährlich'); }
  if (L === 10) win10.push(bw / N);
}
const avg = win10.length ? win10.reduce((a, b) => a + b, 0) / win10.length : null;
if (avg != null) console.log(`Stufe 10: Ø Boss-Sieg ${Math.round(avg * 100)} % (Rahmen 10–60 %)`);
if (CHECK && avg != null && (avg < 0.1 || avg > 0.6)) { bad++; console.log('  ⚠ Boss außerhalb des Rahmens'); }

// --- Regeln, die immer gelten (billig, ohne Kampf) ---
{ hero('barbarian', 10); Game.descStart(12); const a = G.S.desc.lvl; G.S.desc = null;
  hero('barbarian', 40); Game.descStart(12); const b = G.S.desc.lvl; G.S.desc = null;
  if (a !== b) { bad++; console.log(`  ⚠ Gegnerstufe hängt an der Heldenstufe (${a} ≠ ${b})`); }
  let prev = 0; for (let d = 1; d <= 200; d++) { const at = Game.descAt(d), g = at.lvl * at.diff;
    if (!(g > prev)) { bad++; console.log(`  ⚠ Tiefe ${d} ist nicht schwerer als Tiefe ${d - 1}`); break; } prev = g; } }

// --- Teil 2 + 3 ---
if (DEEP) {
  const cls3 = only.length > 1 ? ['sorceress', 'assassin', 'barbarian'] : only, M = Math.max(60, Math.round(N / 2));
  // Die Gruft wechselt reihum (jede Tiefe ein anderer Boss mit eigener Mechanik) – darum kein Abbruch beim ersten
  // Ausreißer, sondern alle Tiefen um die Schätzung messen und die tiefste mit ≥ 50 % nehmen.
  const deepest = (mk, d0) => { let best = 0, r0 = 0; for (let d = Math.max(1, d0 - 14); d <= d0 + 14; d++) { const r = bossRate(mk, d, M); if (r >= 0.5) { best = d; r0 = r; } } return [best, r0]; };
  const cell = ([d, r]) => `T${d} (St.${Game.descAt(Math.max(1, d)).lvl}, ${Math.round(r * 100)}%)`.padStart(17);
  console.log(`\nTiefste Tiefe mit Boss-Sieg ≥ 50 % (${M} Abstiege je Tiefe; Ausrüstung magisch, Gegenstandsstufe = Heldenstufe)`);
  console.log('Klasse      ' + [20, 30, 40].map(L => `St.${L}`.padStart(17)).join('') + '  St.22 + Glocken-Beute (St.59, selten)');
  const all3 = [];
  for (const cls of cls3) {
    const ds = [20, 30, 40].map(L => deepest(() => hero(cls, L), depthFor(L))), cells = ds.map(cell);
    // Schranke nach Messung (2026-11-21: Stufe 20 → T7–T11, Stufe 40 → T14–T23): wer stärker wird, kommt tiefer
    if (CHECK && !(ds[2][0] > ds[0][0])) { bad++; console.log(`  ⚠ ${cls}: Stufe 40 kommt nicht tiefer als Stufe 20`); }
    all3.push(ds.map(x => x[0]));
    cells.push(cell(deepest(() => hero(cls, 22, 59, 3), depthFor(50))));
    console.log(cls.padEnd(11) + ' ' + cells.join(''));
  }
  // Klassen im Band (Welle 2B-1, Richtwert ±2 Tiefen): gemessen 2026-11-22 Abstand höchstens 4 (St. 40), Rauschen ±1
  if (CHECK && all3.length === 3) [20, 30, 40].forEach((L, i) => { const v = all3.map(r => r[i]), w = Math.max(...v) - Math.min(...v);
    if (w > 5) { bad++; console.log(`  ⚠ Stufe ${L}: Klassen ${w} Tiefen auseinander (${v.join('/')})`); } });
  if (CURVE) {
  console.log(`\nKurve: Gefahr vs. Beute je Tiefe. Held mit der Beute dieser Tiefe (selten, Gegenstandsstufe = Beutestufe, Heldenstufe = Gegnerstufe − 1)`);
  console.log('Tiefe  Gegnerstufe  Stärke  Gefahr*  Beutestufe   Boss-Sieg gleiche Tiefe / +3 / +6 (Ø der Klassen)');
  const rows = [];
  for (const d of [5, 10, 15, 20, 30, 40]) {
    const at = Game.descAt(d), L = at.lvl - 1, w = [0, 3, 6].map(k => cls3.reduce((a, cls) => a + bossRate(() => hero(cls, L, at.lvl, 3, d), d + k, M), 0) / cls3.length);
    rows.push({ d, w });
    console.log(`${String(d).padStart(5)}  ${String(at.lvl).padStart(11)}  ${at.diff.toFixed(2).padStart(6)}  ${String(Math.round(at.lvl * at.diff)).padStart(7)}  ${String(at.lvl).padStart(10)}   ${w.map(x => (Math.round(x * 100) + ' %').padStart(6)).join(' /')}`);
  }
  console.log('* Gefahr = Gegnerstufe × Stärke; Beutestufe = Gegnerstufe (Unruhe hebt nur Menge/Seltenheit, nie die Stufe)');
  // Die Beute darf der Gefahr nicht davonlaufen: tief unten gewinnt der eigene Ausrüstungsstand seltener als oben.
  if (CHECK && rows.at(-1).w[0] > rows[1].w[0] + 0.1) { bad++; console.log('  ⚠ Beute läuft der Gefahr davon (tief unten leichter als oben)'); }
  // gemessen 2026-11-21: Ø gleiche Tiefe 67 %, +6 Tiefen 28 % – Schranke mit Abstand zum Rauschen
  const avgW = k => rows.reduce((a, r) => a + r.w[k], 0) / rows.length;
  if (CHECK && !(avgW(2) < avgW(0) - 0.15)) { bad++; console.log('  ⚠ sechs Tiefen tiefer ist nicht deutlich schwerer'); }
  }
}
if (CHECK && bad) process.exit(1);
