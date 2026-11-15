// Balance des Abstiegs: Helden steigen immer weiter (Kampfräume bevorzugt) bis zum Boss.
// Zeigt je Klasse/Stufe: wie viele den k-ten Raum überleben, Boss erreicht/besiegt, Ø Beute beim Entkommen.
// Ziel: Raum 1–2 fast sicher (≥ 90 %), danach fällt es spürbar; bis zum Boss kommt etwa die Hälfte, der Boss ist ein echtes Risiko.
// Aufruf: node tests/descent.mjs [klasse|all] [stufe] [läufe] [--check]
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
let seed = 0xd35c; Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const D = await import('../js/data.js');
const G = await import('../js/state.js');
const Game = await import('../js/game.js');
const { makeItem } = await import('../js/loot.js');
const only = process.argv[2] && process.argv[2] !== 'all' ? [process.argv[2]] : Object.keys(D.CLASSES);
const LV = +process.argv[3] ? [+process.argv[3]] : [10, 20], N = +process.argv[4] || 150, CHECK = process.argv.includes('--check');

function hero(cls, L) {
  G.newChar('Abstieg', cls); const S = G.S; S.lvl = L; S.tut = 99;
  const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, main = D.CLASSES[cls].main;
  S.attrs[main] += Math.round(pts * 0.55); S.attrs.con += Math.round(pts * 0.3); S.attrs.int += Math.round(pts * 0.05); S.attrs.lck += Math.round(pts * 0.1);
  const wb = D.BASES.filter(b => b.kind === D.CLASSES[cls].weapon && (!b.minLvl || L >= b.minLvl)).pop();
  S.equip.weapon = { id: 'w', slot: 'weapon', kind: wb.kind, mods: {}, dmg: wb.dmg.map(x => Math.round(x * (1 + L * 0.18) * 1.15)) };
  for (const s of ['helm', 'chest', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand']) S.equip[s] = makeItem(L, { slot: s.startsWith('ring') ? 'ring' : s, minRarity: 2 });
  // Talente: alle Punkte in die erste Reihe, die passt
  for (let i = 0; i < L - 1; i++) { const n = D.TALENTS[cls].flatMap(t => t.nodes).find(x => (S.tal[x.id] || 0) < x.max); if (n) S.tal[n.id] = (S.tal[n.id] || 0) + 1; }
}
// Krypta passend zur Stufe (Boss besiegt = freigeschaltet)
const cryptFor = L => [...D.CRYPTS].reverse().find(c => c.lvl <= L && !c.shards) || D.CRYPTS[0];
const prio = { shrine: 0, fight: 1, treasure: 2, elite: 3 };
let bad = 0; const win10 = [];
console.log('Klasse      Stufe  R1   R2   R3   R4   R5  Boss-erreicht  Boss-Sieg  Ø Gold (entkommen)');
for (const cls of only) for (const L of LV) {
  const reach = [0, 0, 0, 0, 0], st = { bossTry: 0, bossWin: 0, gold: 0, out: 0 };
  for (let k = 0; k < N; k++) {
    hero(cls, L); const c = cryptFor(L); G.S.trophies.push({ key: c.id + ':0', eff: c.trophy }); Game.descStart(c.id);
    for (let room = 0; G.S.desc; room++) {
      const nx = Game.descNext(), opts = nx.filter(j => j === 'boss' || !D.DESC_ROOMS[Game.descNodeAt(j).t].exit);
      const j = opts.sort((a, b) => (a === 'boss' ? 9 : prio[Game.descNodeAt(a).t]) - (b === 'boss' ? 9 : prio[Game.descNodeAt(b).t]))[0];
      if (j === 'boss') st.bossTry++;
      const r = Game.descEnter(j); if (!r) break;
      if (G.S.desc && room < 5) reach[room]++;
      const o = r.res?.desc?.out; if (o) { st.out++; st.gold += o.gold; if (j === 'boss') st.bossWin++; }
    }
  }
  const p = x => (Math.round(x / N * 100) + ' %').padStart(5);
  console.log(`${cls.padEnd(11)} ${String(L).padStart(5)} ${reach.map(p).join('')}  ${p(st.bossTry).padStart(13)}  ${p(st.bossWin).padStart(9)}  ${String(Math.round(st.gold / Math.max(1, st.out))).padStart(10)}`);
  if (CHECK && reach[0] / N < 0.85) { bad++; console.log('  ⚠ schon der erste Raum ist zu gefährlich'); }
  if (L === 10) win10.push(st.bossWin / N);
}
const avg = win10.length ? win10.reduce((a, b) => a + b, 0) / win10.length : null;
if (avg != null) console.log(`Stufe 10: Ø Boss-Sieg ${Math.round(avg * 100)} % (Rahmen 10–60 %)`);
if (CHECK && avg != null && (avg < 0.1 || avg > 0.6)) { bad++; console.log('  ⚠ Boss außerhalb des Rahmens'); }
if (CHECK && bad) process.exit(1);
