// Schritt 2/3/5: Schlüsselsteine einzeln (die anderen beiden gesperrt), Lagen: normal, 5 Krypta-Bosse (+ Müllerin), Elite, Abgrund.
// Umgebung: V (Formel-Schalter), KS (Effekt-Überschreibung je Knoten-ID), SYN (Attribut-Bindung je Schlüsselstein), DIST (Verteilung je Stein)
// Aufruf: node keys2.mjs <klasse> <N> <stufen>
globalThis.V = JSON.parse(process.env.V || '{}');
globalThis.localStorage = { _d: {}, getItem() { return null; }, setItem() {}, removeItem() {} };
let seed = 0x5eed; Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const D = await import('../js/data.js'), G = await import('../js/state.js'), C = await import('../js/combat.js'), Game = await import('../js/game.js');
const { hero } = await import('./held.mjs');
const cls = process.argv[2], N = +process.argv[3] || 300, ROLLS = 3, LV = (process.argv[4] || '20,30,40').split(',').map(Number);
const KS = JSON.parse(process.env.KS || '{}'), SYN = JSON.parse(process.env.SYN || '{}'), DIST = JSON.parse(process.env.DIST || '{}');
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
  S.tal = {}; if (key) forceKey(key); const keep = { ...S.tal }; const block = KEYS.filter(x => x !== key).map(x => x.id);
  // Rest gierig, Schlüsselstein-Spalte bleibt
  const T = G.treeOf(S.cls); learnRest(block); }
function learnRest(block) { const S = G.S, T = G.treeOf(S.cls);
  if (T) for (let i = 0; i < 80 && G.talentPoints() > 0; i++) { let best = null, bp = -1;
    const probe = fn => { const vor = JSON.parse(JSON.stringify(S.tal)); if (!fn()) return null; const p = G.power(); S.tal = vor; return p; };
    T.cols.forEach((c, ci) => c.nodes.forEach((n, ri) => { if (block.includes(n.id)) return; const p = probe(() => G.learnNode(ci, ri)); if (p > bp) { bp = p; best = () => G.learnNode(ci, ri); } }));
    (T.bridges || []).forEach((b, bi) => { const p = probe(() => G.learnBridge(bi)); if (p > bp) { bp = p; best = () => G.learnBridge(bi); } });
    if (!best || !best()) break; }
  else for (let more = true; more && G.talentPoints() > 0;) { more = false; for (let b = 0; b < 3; b++) for (let t = 2; t >= 0; t--) { if (block.includes(D.TALENTS[S.cls][b].nodes[t].id)) continue; if (G.learn(b, t)) { more = true; break; } } } }
const fighter = () => { const A = { ...G.stats(), belt: [] };
  for (const [kid, s] of Object.entries(SYN)) if ((G.S.tal[kid] || 0) > 0) for (const x of [].concat(s)) { const v = G.S.attrs[x.attr] * x.per;
    if (x.key === 'armorMul') A.armor = Math.round(A.armor * (1 + v)); else if (x.key === 'hpMul') A.hp = Math.round(A.hp * (1 + v)); else A[x.key] = (A[x.key] || 0) + v; }
  A.cur0 = A.hp; return A; };
const rate = mobs => { let w = 0, ac = 0; for (const m of mobs) { const r = C.fight(fighter(), { ...m }); if (r.winner === 'a') w++; ac += r.log.filter(e => e.dmg !== undefined || e.miss || e.spell).length; } return { w: w / mobs.length, ac: ac / mobs.length }; };
const BOSSC = [...D.CRYPTS.filter(c => c.boss?.mech), D.ACTS.find(a => a.boss.name.startsWith('Die Müllerin'))];
const prio = { shrine: 0, fight: 1, treasure: 2, elite: 3 };
function descend(d) { G.S.seals = { day: G.today(), n: D.DESCENT.sealMax }; G.S.desc = null; G.S.deep = { best: 9999, week: -1, wBest: 0 };
  if (!Game.descStart(d)) throw new Error('Tiefe ' + d); let boss = false;
  for (let room = 0; G.S.desc; room++) { const nx = Game.descNext(), opts = nx.filter(j => j === 'boss' || !D.DESC_ROOMS[Game.descNodeAt(j).t].exit);
    const j = opts.sort((a, b) => (a === 'boss' ? 9 : prio[Game.descNodeAt(a).t]) - (b === 'boss' ? 9 : prio[Game.descNodeAt(b).t]))[0];
    const r = Game.descEnter(j); if (!r) break; if (r.res?.desc?.out && j === 'boss') boss = true; }
  return boss; }
const deep = (dd, n) => { let w = 0; for (let k = 0; k < n; k++) { const keep = JSON.stringify({ e: G.S.equip, a: G.S.attrs, t: G.S.tal, sp: G.S.sp, l: G.S.lvl });
  w += descend(dd); const kk = JSON.parse(keep); Object.assign(G.S, { equip: kk.e, attrs: kk.a, tal: kk.t, sp: kk.sp, lvl: kk.l }); G.S.desc = null; } return w / n; };
const depthFor = L => Math.max(1, Math.round((L + 1 - D.DESCENT.lvlBase) / D.DESCENT.lvlPer));
// Abgrund-Bosse sollen die SYN/Effekte kennen: descEnter nutzt G.stats() – SYN wirkt dort nicht (nur in fighter) → Abgrund nur ohne SYN aussagekräftig
for (const L of LV) { const acc = {};
  for (let r = 0; r < ROLLS; r++) { hero(cls, L); const S0 = JSON.parse(JSON.stringify(G.S));
    const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, base = { ...G.S.attrs };
    base[M] -= Math.round(pts * .55); base.con -= Math.round(pts * .3); base.int -= Math.round(pts * .05); base.lck -= Math.round(pts * .1);
    const reset = () => Object.assign(G.S, JSON.parse(JSON.stringify(S0)));
    // Eichung: alle drei Steine gemittelt bei 50 % (gemeinsamer Maßstab), Standard-Verteilung
    const calib = d => { let s = 0; for (const k of KEYS) { reset(); apply(base, STD, L, k); s += rate(Array.from({ length: 120 }, () => G.makeMonster(L, d))).w; } return s / KEYS.length; };
    let lo = 0.3, hi = 8, diff = 1; for (let i = 0; i < 8; i++) { diff = (lo + hi) / 2; if (calib(diff) > 0.5) lo = diff; else hi = diff; }
    const mobs = Array.from({ length: N }, () => G.makeMonster(L, diff));
    const bosses = BOSSC.map(c => ({ id: c.boss.name.split(/[ ,]/).slice(0, 2).join(' '), mobs: Array.from({ length: Math.round(N / 2) }, () => G.makeBoss(c, L, diff / D.CFG.bossDiff * 0.75)) }));
    const elites = D.ELITE.mods.map(e => ({ id: e.name, mobs: Array.from({ length: Math.round(N / 3) }, () => { const m = G.makeMonster(L, diff * 0.8 * D.ELITE.diff); m.hp = Math.round(m.hp * D.ELITE.hp); Object.assign(m, e.eff || {}); for (const [k, v] of Object.entries(e.mult || {})) m[k] = Math.round(m[k] * v); return m; }) }));
    for (const k of KEYS) for (const dn of ['Std', ...(DIST[k.id] ? ['Passend'] : [])]) { reset(); apply(base, dn === 'Std' ? STD : DIST[k.id], L, k); const name = k.name + (dn === 'Std' ? '' : ' +P');
      const a = acc[name] ||= { n: 0, norm: 0, ac: 0, boss: {}, el: 0, elMin: 0, d0: 0, d2: 0, hp: 0 }; a.n++;
      const nm = rate(mobs); a.norm += nm.w; a.ac += nm.ac; a.hp += fighter().hp;
      for (const b of bosses) a.boss[b.id] = (a.boss[b.id] || 0) + rate(b.mobs).w;
      const ew = elites.map(e => rate(e.mobs).w); a.el += ew.reduce((p, q) => p + q, 0) / ew.length; a.elMin += Math.min(...ew);
      if (!Object.keys(SYN).length && !process.env.NODEEP) { const d0 = depthFor(L); a.d0 += deep(d0, Math.round(N / 8)); a.d2 += deep(d0 + 2, Math.round(N / 8)); } } }
  const bids = Object.keys(Object.values(acc)[0].boss);
  console.log(`\n=== ${cls} St.${L} ===  Sieg %: normal | Akt. | ${bids.map(b => b.slice(0, 8)).join(' | ')} | Elite Ø/min | Abgrund T${depthFor(L)}/T${depthFor(L) + 2}`);
  for (const [n, a] of Object.entries(acc)) { const f = x => (x / a.n * 100).toFixed(0).padStart(3);
    console.log(`${n.padEnd(20)} ${f(a.norm)} | ${(a.ac / a.n).toFixed(1).padStart(4)} | ${bids.map(b => f(a.boss[b]).padStart(8)).join(' | ')} | ${f(a.el)}/${f(a.elMin)} | ${f(a.d0)}/${f(a.d2)}`); }
}
