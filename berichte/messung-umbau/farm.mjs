// Schritt 4: Farm-Effizienz eines Glücks-Builds im Abgrund (St. 40): Boss-Sieg (Sack kommt heim) × Anteil legendär je Fund (Modus V.loot)
globalThis.V = {}; globalThis.localStorage = { _d: {}, getItem() { return null; }, setItem() {}, removeItem() {} };
let seed = 9; Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const D = await import('../js/data.js'), G = await import('../js/state.js'), Game = await import('../js/game.js'), { makeItem } = await import('../js/loot.js');
const { hero } = await import('./held.mjs'); const L = 40, ROLLS = 3, ND = 120;
const prio = { shrine: 0, fight: 1, treasure: 2, elite: 3 };
function descend(d) { G.S.seals = { day: G.today(), n: D.DESCENT.sealMax }; G.S.desc = null; G.S.deep = { best: 9999, week: -1, wBest: 0 }; Game.descStart(d); let boss = false, items = 0;
  for (let room = 0; G.S.desc; room++) { const nx = Game.descNext(), opts = nx.filter(j => j === 'boss' || !D.DESC_ROOMS[Game.descNodeAt(j).t].exit);
    const j = opts.sort((a, b) => (a === 'boss' ? 9 : prio[Game.descNodeAt(a).t]) - (b === 'boss' ? 9 : prio[Game.descNodeAt(b).t]))[0];
    if (G.S.desc) items = G.S.desc.sack.items.length; const r = Game.descEnter(j); if (!r) break; if (r.res?.desc?.out && j === 'boss') boss = true; }
  return { boss, items }; }
const legShare = (loot, lck, ctx, minR) => { globalThis.V = { loot }; let l = 0; const n = 20000; for (let i = 0; i < n; i++) if (makeItem(L, loot >= 2 ? { luck: lck, ctx, minRarity: minR } : { luck: lck + ctx, minRarity: minR }).rarity === 'legendary') l++; globalThis.V = {}; return l / n; };
for (const cls of D.PLAYABLE) { const M = D.CLASSES[cls].main, out = {};
  for (let r = 0; r < ROLLS; r++) { hero(cls, L); const S0 = JSON.parse(JSON.stringify(G.S)), pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel;
    for (const [bn, sh] of [['Standard (Gl 10 %)', { main: .55, lck: .10 }], ['Glück 30 % statt Haupt', { main: .35, lck: .30 }], ['Glück 30 % statt Kon', { main: .55, lck: .30, con: .10 }]]) {
      Object.assign(G.S, JSON.parse(JSON.stringify(S0))); const a = G.S.attrs; a[M] += Math.round(pts * (sh.main - .55)); a.lck += Math.round(pts * (sh.lck - .10)); if (sh.con) a.con -= Math.round(pts * (.30 - sh.con));
      const lck = G.stats().lck; const x = out[bn] ||= { lck: 0, w17: 0, w19: 0, it: 0 }; x.lck += lck / ROLLS;
      for (const [d, k] of [[17, 'w17'], [19, 'w19']]) { let w = 0, it = 0; for (let i = 0; i < ND; i++) { const keep = JSON.stringify({ e: G.S.equip, a: G.S.attrs, t: G.S.tal, sp: G.S.sp, l: G.S.lvl }); const o = descend(d); w += o.boss; it += o.items; const kk = JSON.parse(keep); Object.assign(G.S, { equip: kk.e, attrs: kk.a, tal: kk.t, sp: kk.sp, lvl: kk.l }); G.S.desc = null; } x[k] += w / ND / ROLLS; if (d === 17) x.it += it / ND / ROLLS; } } }
  for (const [bn, x] of Object.entries(out)) { const ctx = 17 * 3 + 30;   // Tiefe × luckPer + Unruhe ~2 × 15
    const s = [0, 2, 5].map(m => legShare(m, Math.round(x.lck), ctx, 2));
    console.log(`${cls.padEnd(10)} ${bn.padEnd(24)} Glück ${Math.round(x.lck).toString().padStart(3)} | Boss-Sieg T17 ${(x.w17 * 100).toFixed(0)} % T19 ${(x.w19 * 100).toFixed(0)} % | Funde im Sack ${x.it.toFixed(1)} | legendär je Fund L0/L2/L5: ${s.map(v => (v * 100).toFixed(1)).join(' / ')} % | legendär heim je Abstieg T17 L0/L2/L5: ${s.map(v => (v * x.w17 * x.it).toFixed(3)).join(' / ')}`); } }
