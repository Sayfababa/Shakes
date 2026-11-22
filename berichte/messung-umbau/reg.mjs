// Schritt 2/3/5: Schlüsselsteine einzeln (die anderen beiden gesperrt), Lagen: normal, 5 Krypta-Bosse (+ Müllerin), Elite, Abgrund.
// Umgebung: V (Formel-Schalter), KS (Effekt-Überschreibung je Knoten-ID), SYN (Attribut-Bindung je Schlüsselstein), DIST (Verteilung je Stein)
// Aufruf: node keys2.mjs <klasse> <N> <stufen>
globalThis.V = JSON.parse(process.env.V || '{}');
globalThis.localStorage = { _d: {}, getItem() { return null; }, setItem() {}, removeItem() {} };
let seed = 0x5eed; Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const D = await import('../js/data.js'), G = await import('../js/state.js'), C = await import('../js/combat.js'), Game = await import('../js/game.js');
const { hero } = await import('./held.mjs');
const cls = process.argv[2], N = +process.argv[3] || 300, ROLLS = 3, LV = (process.argv[4] || '20,30,40').split(',').map(Number);
const PK = process.env.MODE === 'paket', KS = PK ? JSON.parse(process.env.KS || '{}') : {}, DIST = {};
globalThis.SYN = PK ? JSON.parse(process.env.SYN || '{}') : {}; if (PK) globalThis.V = { loot: 5 };
const EXCL = PK;
const allNodes = G.treeOf(cls) ? D.TREE[cls].cols.flatMap(c => c.nodes) : D.TALENTS[cls].flatMap(b => b.nodes);
for (const n of allNodes) if (KS[n.id]) n.eff = KS[n.id];
const KEYS = G.treeOf(cls) ? D.TREE[cls].cols.map(c => c.nodes[c.nodes.length - 1]) : D.TALENTS[cls].map(b => b.nodes[b.nodes.length - 1]);
const M = D.CLASSES[cls].main, AT = ['str', 'dex', 'int', 'con', 'lck'];
const STD = M === 'int' ? { int: .55, con: .30, lck: .10, dex: .05 } : { [M]: .55, con: .30, int: .05, lck: .10 };
function learn(block) { const S = G.S; S.tal = {}; const T = G.treeOf(S.cls);
  if (T) for (let i = 0; i < 80 && G.talentPoints() > 0; i++) { let best = null, bp = -1;
    const probe = fn => { const vor = JSON.parse(JSON.stringify(S.tal)); if (!fn()) return null; const p = G.power(); S.tal = vor; return p; };
    T.cols.forEach((c, ci) => c.nodes.forEach((n, ri) => { if (block.includes(n.id)) return; let p = probe(() => G.learnNode(ci, ri)); if (p != null && !block.length && false) p = p; if (p > bp) { bp = p; best = () => G.learnNode(ci, ri); } }));
    (T.bridges || []).forEach((b, bi) => { const p = probe(() => G.learnBridge(bi)); if (p > bp) { bp = p; best = () => G.learnBridge(bi); } });
    if (!best || !best()) break; }
  else for (let more = true; more && G.talentPoints() > 0;) { more = false; for (let b = 0; b < 3; b++) for (let t = 2; t >= 0; t--) { if (block.includes(D.TALENTS[S.cls][b].nodes[t].id)) continue; if (G.learn(b, t)) { more = true; break; } } }
}
// Schlüsselstein zuerst erzwingen: Spalte des Steins bis zum Stein füllen (sonst wählt die Gier ihn ggf. nie)
function forceKey(k) { const S = G.S, T = G.treeOf(S.cls);
  if (T) { const ci = T.cols.findIndex(c => c.nodes.includes(k)); for (let ri = 0; ri < T.cols[ci].nodes.length; ri++) while (G.learnNode(ci, ri)); }
  else { const bi = D.TALENTS[S.cls].findIndex(b => b.nodes.includes(k)); for (let t = 0; t < 3; t++) while (G.learn(bi, t)); } }
function apply(base, dist, L, key) { const S = G.S, pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel; S.attrs = { ...base }; let used = 0;
  for (const k of AT) if (dist[k]) { const n = Math.round(pts * dist[k]); S.attrs[k] += n; used += n; } S.attrs.con += pts - used;
  S.tal = {}; if (key) forceKey(key); const keep = { ...S.tal }; const block = EXCL ? KEYS.filter(x => x !== key).map(x => x.id) : [];
  // Rest gierig, Schlüsselstein-Spalte bleibt
  learnRest(block); }
function learnRest(block) { const S = G.S, T = G.treeOf(S.cls);
  if (T) for (let i = 0; i < 80 && G.talentPoints() > 0; i++) { let best = null, bp = -1;
    const probe = fn => { const vor = JSON.parse(JSON.stringify(S.tal)); if (!fn()) return null; const p = G.power(); S.tal = vor; return p; };
    T.cols.forEach((c, ci) => c.nodes.forEach((n, ri) => { if (block.includes(n.id)) return; const p = probe(() => G.learnNode(ci, ri)); if (p > bp) { bp = p; best = () => G.learnNode(ci, ri); } }));
    (T.bridges || []).forEach((b, bi) => { const p = probe(() => G.learnBridge(bi)); if (p > bp) { bp = p; best = () => G.learnBridge(bi); } });
    if (!best || !best()) break; }
  else for (let more = true; more && G.talentPoints() > 0;) { more = false; for (let b = 0; b < 3; b++) for (let t = 2; t >= 0; t--) { if (block.includes(D.TALENTS[S.cls][b].nodes[t].id)) continue; if (G.learn(b, t)) { more = true; break; } } } }

const fighter = () => { const A = { ...G.stats(), belt: [] }; A.cur0 = A.hp; return A; };
const rate = mobs => { let w = 0, ac = 0; for (const m of mobs) { const r = C.fight(fighter(), { ...m }); if (r.winner === 'a') w++; ac += r.log.filter(e => e.dmg !== undefined || e.miss || e.spell).length; } return { w: w / mobs.length, ac: ac / mobs.length }; };
const MUE = D.ACTS.find(a => a.boss.name.startsWith('Die Müllerin')), ALD = D.CRYPTS.find(c => c.boss.name.startsWith('Bruder Aldemar'));
if (PK) { ALD.boss.mech = { poison: 0.25, poisonPct: 0.015 }; MUE.boss.mech = { ramp: 0.10, armorMult: 1.3 }; }
const BOSSC = [...D.CRYPTS.filter(c => c.boss?.mech)];
const prio = { shrine: 0, fight: 1, treasure: 2, elite: 3 };
function descend(d) { G.S.seals = { day: G.today(), n: D.DESCENT.sealMax }; G.S.desc = null; G.S.deep = { best: 9999, week: -1, wBest: 0 };
  Game.descStart(d); let boss = false; for (let room = 0; G.S.desc; room++) { const nx = Game.descNext(), opts = nx.filter(j => j === 'boss' || !D.DESC_ROOMS[Game.descNodeAt(j).t].exit);
    const j = opts.sort((a, b) => (a === 'boss' ? 9 : prio[Game.descNodeAt(a).t]) - (b === 'boss' ? 9 : prio[Game.descNodeAt(b).t]))[0]; const r = Game.descEnter(j); if (!r) break; if (r.res?.desc?.out && j === 'boss') boss = true; } return boss; }
const deep = (dd, n) => { let w = 0; for (let k = 0; k < n; k++) { const keep = JSON.stringify({ e: G.S.equip, a: G.S.attrs, t: G.S.tal, sp: G.S.sp, l: G.S.lvl }); w += descend(dd); const kk = JSON.parse(keep); Object.assign(G.S, { equip: kk.e, attrs: kk.a, tal: kk.t, sp: kk.sp, lvl: kk.l }); G.S.desc = null; } return w / n; };
const depthFor = L => Math.max(1, Math.round((L + 1 - D.DESCENT.lvlBase) / D.DESCENT.lvlPer));
const KID = Object.fromEntries(KEYS.map(k => [k.id, k]));
const BUILDS = {
  barbarian: [['Bot (heute)', STD, null], ['Koloss', { str: .35, con: .55, lck: .10 }, 'b6'], ['Schlächter', { str: .55, con: .35, lck: .10 }, 'b3'], ['Berserker', { str: .50, con: .30, lck: .20 }, 'b9']],
  assassin: [['Bot (heute)', STD, null], ['Koloss', { dex: .35, con: .55, str: .10 }, 'ag6'], ['Schatten', { dex: .50, con: .30, str: .20 }, 'as6'], ['Giftmeister', { dex: .45, con: .30, int: .15, lck: .10 }, 'ag6'], ['Ausbluter', { dex: .55, con: .35, lck: .10 }, 'ak6']],
  sorceress: [['Bot (heute)', STD, null], ['Koloss', { int: .35, con: .55, str: .10 }, 'sk6'], ['Frostweber', { int: .45, con: .35, str: .20 }, 'sk6'], ['Feuer', { int: .60, con: .30, lck: .10 }, 'sf6'], ['Arkan', { int: .55, con: .35, dex: .10 }, 'sa6']],
}[cls];
const BOTKEY = {};
for (const L of LV) { const acc = {};
  for (let r = 0; r < ROLLS; r++) { hero(cls, L); const S0 = JSON.parse(JSON.stringify(G.S));
    const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, base = { ...G.S.attrs }; base[M] -= Math.round(pts * .55); base.con -= Math.round(pts * .3); base.int -= Math.round(pts * .05); base.lck -= Math.round(pts * .1);
    const reset = () => Object.assign(G.S, JSON.parse(JSON.stringify(S0)));
    const setB = ([, dist, key]) => { reset(); if (key && L >= 12) apply(base, dist, L, KID[key]);
      else if (EXCL && L >= 12) { let bk = null, bp = -1; for (const k of KEYS) { reset(); apply(base, dist, L, k); const p = G.power(); if (p > bp) { bp = p; bk = k; } } reset(); apply(base, dist, L, bk); BOTKEY[bk.name] = (BOTKEY[bk.name] || 0) + 1; }
      else apply(base, dist, L, null); };
    // Eichung immer am Bot-Build (heute), damit beide Modi denselben Maßstab haben: Gegner gleich stark
    setB(BUILDS[0]); let lo = 0.3, hi = 8, diff = 1; for (let i = 0; i < 9; i++) { diff = (lo + hi) / 2; if (rate(Array.from({ length: 160 }, () => G.makeMonster(L, diff))).w > 0.5) lo = diff; else hi = diff; }
    if (process.env.DIFF) diff = JSON.parse(process.env.DIFF)[L][r];
    const mobs = Array.from({ length: N }, () => G.makeMonster(L, diff));
    const bosses = BOSSC.map(c => ({ id: c.boss.name.split(/[ ,]/)[1] || c.boss.name, mobs: Array.from({ length: Math.round(N / 2) }, () => G.makeBoss(c, L, diff / D.CFG.bossDiff * 0.75)) }));
    const mue = L <= 20 ? Array.from({ length: Math.round(N / 2) }, () => G.makeBoss(MUE, Math.min(L, 12), (MUE.bossMult ?? 0.95) * (MUE.diff || 1) * (PK ? 0.8 : 1))) : null;
    const elites = D.ELITE.mods.map(e => Array.from({ length: Math.round(N / 4) }, () => { const m = G.makeMonster(L, diff * 0.8 * D.ELITE.diff); m.hp = Math.round(m.hp * D.ELITE.hp); Object.assign(m, e.eff || {}); for (const [k, v] of Object.entries(e.mult || {})) m[k] = Math.round(m[k] * v); return m; }));
    for (const b of BUILDS) { setB(b); const a = acc[b[0]] ||= { n: 0, norm: 0, ac: 0, el: 0, boss: {}, mue: 0, d0: 0, d2: 0, hp: 0 }; a.n++;
      const nm = rate(mobs); a.norm += nm.w; a.ac += nm.ac; a.hp += G.stats().hp; a.el += elites.map(e => rate(e).w).reduce((p, q) => p + q, 0) / elites.length;
      for (const bo of bosses) a.boss[bo.id] = (a.boss[bo.id] || 0) + rate(bo.mobs).w; if (mue) a.mue += rate(mue).w;
      const d0 = depthFor(L); a.d0 += deep(d0, Math.round(N / 6)); a.d2 += deep(d0 + 2, Math.round(N / 6)); } }
  const bids = Object.keys(Object.values(acc)[0].boss), f = (x, n) => (x / n * 100).toFixed(0).padStart(3);
  console.log(`\n=== ${cls} St.${L} ${PK ? 'PAKET (Bot wählt: ' + JSON.stringify(BOTKEY) + ')' : 'HEUTE'} ===  normal | Akt. | Elite | ${bids.map(b => b.slice(0, 8)).join(' | ')} | Müllerin | Abgrund T${depthFor(L)}/T${depthFor(L) + 2} | Leben`);
  for (const [n, a] of Object.entries(acc)) console.log(`${n.padEnd(12)} ${f(a.norm, a.n)} | ${(a.ac / a.n).toFixed(1).padStart(4)} | ${f(a.el, a.n)} | ${bids.map(b => f(a.boss[b], a.n).padStart(8)).join(' | ')} | ${L <= 20 ? f(a.mue, a.n).padStart(8) : '       –'} | ${f(a.d0, a.n)}/${f(a.d2, a.n)} | ${Math.round(a.hp / a.n)}`);
}
