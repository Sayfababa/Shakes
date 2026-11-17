// Balance des Bretts (neuer Talentbaum): was bringt jeder Knoten in echten Kämpfen?
// Gemessen als Δ Siegchance in Punkten gegen Gegner, die ohne den Knoten ~50 % schaffen.
// Ein Schlüsselstein kostet 11 Punkte in seiner Spalte – er muss dafür deutlich mehr bringen
// als die kleinen Knoten, darf das Spiel aber nicht entscheiden.
// Aufruf: node tests/tree.mjs [klasse|all] [stufe|all] [kämpfe] [--check]
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
// Gekoppelter Zufall: mit und ohne Knoten bekommen dieselben Würfel (sonst Rauschen ±5 Punkte)
let seed = 0x5eed; const mul = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
Math.random = () => mul();
const D = await import('../js/data.js');
const G = await import('../js/state.js');
const { makeItem } = await import('../js/loot.js');
const { fight } = await import('../js/combat.js');

const withTree = Object.keys(D.TREE);
const only = process.argv[2] && process.argv[2] !== 'all' ? [process.argv[2]] : withTree;
const LV = +process.argv[3] ? [+process.argv[3]] : [14, 24];
const N = +process.argv[4] || 400, CHECK = process.argv.includes('--check');
// Rahmen: kleine Knoten tragen wenig, Notable spürbar, Schlüsselsteine viel – aber nichts darf alles entscheiden.
// Gemessen: die ersten Punkte auf dem leeren Brett tragen am meisten (Überleben ist dort die Not),
// darum liegt der Rahmen für kleine Knoten höher, als man denkt. Entscheidend ist, dass nichts
// bei 0 steht (toter Knoten) oder negativ (Falle).
const LIM = { '': [1, 20], nt: [1, 24], key: [2, 45], br: [1, 18] };
let bad = 0;

const SLOTS = ['helm', 'chest', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand'];
function hero(cls, L) {
  G.newChar('Brett', cls); const S = G.S; S.lvl = L; S.tut = 99;
  const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, main = D.CLASSES[cls].main;
  S.attrs[main] += Math.round(pts * 0.55); S.attrs.con += Math.round(pts * 0.3); S.attrs.int += Math.round(pts * 0.05); S.attrs.lck += Math.round(pts * 0.1);
  const wb = D.BASES.filter(b => b.kind === D.CLASSES[cls].weapon && (!b.minLvl || L >= b.minLvl)).pop();
  S.equip.weapon = { id: 'w', slot: 'weapon', kind: wb.kind, mods: {}, dmg: wb.dmg.map(x => Math.round(x * (1 + L * 0.18) * 1.15)) };
  for (const s of SLOTS) { const it = makeItem(L, { slot: s.startsWith('ring') ? 'ring' : s, minRarity: 2 }); delete it.fx; delete it.special; S.equip[s] = it; }
  return S;
}
const mobs = (L, diff) => Array.from({ length: N }, (_, i) => G.makeMonster(L, diff, D.MONSTERS[i % D.MONSTERS.length]));
const rate = list => { const A = G.stats(); let w = 0; list.forEach((m, i) => { seed = 7919 * (i + 1); if (fight(A, m).winner === 'a') w++; }); seed = 0x5eed; return w / list.length; };
const f = x => ((x >= 0 ? '+' : '') + (x * 100).toFixed(1)).padStart(8);

for (const cls of only) {
  const T = D.TREE[cls]; if (!T) { console.log(`${cls}: kein Brett`); continue; }
  for (const L of LV) {
    const S = hero(cls, L);
    // Je Knoten neu eichen: die Gegner werden so stark, dass der Held OHNE diesen Knoten ~50 % schafft.
    // Mit einer einmaligen Eichung am leeren Brett steht er bei gefüllter Spalte schon bei >90 %,
    // und dort kann kein Bonus mehr etwas zeigen – jede Messung wäre Rauschen.
    const calib = () => { let lo = 0.5, hi = 4, d = 1;
      for (let i = 0; i < 9; i++) { d = (lo + hi) / 2; if (rate(mobs(L, d).slice(0, 220)) > 0.5) lo = d; else hi = d; } return mobs(L, d); };
    S.tal = {}; const r0 = rate(calib());
    console.log(`\n${D.CLASSES[cls].name} Stufe ${L}  (leeres Brett: Sieg ${(r0 * 100).toFixed(0)} %)`);
    console.log('Knoten'.padEnd(22) + 'Art'.padEnd(7) + 'Δ Sieg'.padStart(8) + 'Δ KK'.padStart(8) + '   Punkte');
    const top = L >= Math.max(...LV);   // Schlüsselsteine kosten 11 Punkte – sie lohnen erst im Endspiel
    const chk = (v, kind, name) => {
      let [a, b] = LIM[kind];
      if (kind === 'key' && !top) a = -3;   // auf niedriger Stufe darf ein Schlüsselstein neutral sein, nur keine Falle
      if (CHECK && (v * 100 < a || v * 100 > b)) { bad++; console.log(`!! ${name} (Stufe ${L}): ${(v * 100).toFixed(1)} Pkt außerhalb ${a}…${b}`); }
    };
    // Jeder Knoten für sich: Spalte bis dahin gefüllt (das ist der echte Weg), dann der Knoten dazu
    T.cols.forEach((col, c) => col.nodes.forEach((n, r) => {
      const below = {}; let cost = 0;
      for (let i = 0; i < r; i++) { below[col.nodes[i].id] = col.nodes[i].max; cost += col.nodes[i].max; }
      S.tal = { ...below }; const p0 = G.power(), M = calib(), o = rate(M);
      S.tal = { ...below, [n.id]: n.max }; const d = rate(M) - o, dp = G.power() / p0 - 1;
      chk(d, n.kind, n.name);
      console.log((o * 100).toFixed(0).padStart(3) + '% ' + n.name.slice(0, 16).padEnd(17) + (n.kind === 'key' ? 'Schlüs.' : n.kind === 'nt' ? 'Notable' : 'klein ').padEnd(7)
        + f(d) + f(dp) + `   ${cost + n.max}`);
    }));
    for (const b of T.bridges || []) {
      const below = {}; const col = T.cols[b.a];
      for (let i = 0; i < b.row; i++) below[col.nodes[i].id] = col.nodes[i].max;
      S.tal = { ...below }; const p0 = G.power(), M = calib(), o = rate(M);
      S.tal = { ...below, [b.id]: b.max }; const d = rate(M) - o, dp = G.power() / p0 - 1;
      chk(d, 'br', b.name);
      console.log(b.name.slice(0, 21).padEnd(22) + 'Brücke '.padEnd(7) + f(d) + f(dp) + `   ${b.max}`);
    }
    S.tal = {};
  }
}
if (CHECK) { if (bad) { console.log(`\n${bad} Knoten außerhalb des Rahmens.`); process.exit(1); } console.log('\nBrett im Rahmen.'); }
