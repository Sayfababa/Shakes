// Schritt 3: Müllerin und Aldemar in Varianten gegen sechs Builds (+ Koloss je Klasse). Gegner je Klasse/Stufe/Wurf geeicht (Standard-Build normal 50 %).
globalThis.V = {}; globalThis.localStorage = { _d: {}, getItem() { return null; }, setItem() {}, removeItem() {} };
let seed = +(process.env.SEED || 0x77); Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const D = await import('../js/data.js'), G = await import('../js/state.js'), C = await import('../js/combat.js');
const { hero } = await import('./held.mjs');
const N = +process.argv[2] || 300, ROLLS = 3;
const MUE = D.ACTS.find(a => a.boss.name.startsWith('Die Müllerin')), ALD = D.CRYPTS.find(c => c.boss.name.startsWith('Bruder Aldemar'));
const MV = { 'M0 heute (Raserei 60 %)': { rage: 0.6, armorMult: 1.3 }, 'M1 Zorn 10 %/Zug': { ramp: 0.10, armorMult: 1.3 }, 'M1b Zorn 10 %, Stärke ×0,8': { ramp: 0.10, armorMult: 1.3, _m: 0.8 }, 'M2b Zorn 15 %, Stärke ×0,75': { ramp: 0.15, armorMult: 1.3, _m: 0.75 } };
const AV = { 'A0 heute (Gift, Deckel 8 % Leben)': { poison: 0.25 }, 'A2 +2 % max. Leben je Treffer': { poison: 0.25, poisonPct: 0.02 }, 'A3 +3 % max. Leben je Treffer': { poison: 0.25, poisonPct: 0.03 }, 'A5 +1,5 % max. Leben je Treffer': { poison: 0.25, poisonPct: 0.015 } };
const B = {
  barbarian: { Koloss: [{ str: .35, con: .55, lck: .10 }, 'b6'], 'Koloss+Gegengift': [{ str: .35, con: .55, lck: .10 }, 'b6', 1], Berserker: [{ str: .60, con: .15, lck: .25 }, 'b9'] },
  assassin: { Koloss: [{ dex: .35, con: .55, str: .10 }, null], 'Koloss+Gegengift': [{ dex: .35, con: .55, str: .10 }, null, 1], Giftmeister: [{ dex: .45, con: .30, int: .15, lck: .10 }, 'ag6'], Schatten: [{ dex: .65, con: .25, lck: .10 }, 'as6'] },
  sorceress: { Koloss: [{ int: .35, con: .55, str: .10 }, null], 'Koloss+Gegengift': [{ int: .35, con: .55, str: .10 }, null, 1], Feuer: [{ int: .65, con: .15, lck: .20 }, 'sf6'], Frostweber: [{ int: .45, con: .40, str: .15 }, 'sk6'] },
};
const KEYS = c => D.TREE[c] ? D.TREE[c].cols.map(x => x.nodes[x.nodes.length - 1]) : D.TALENTS[c].map(b => b.nodes[b.nodes.length - 1]);
function learnWith(key) { const S = G.S, T = G.treeOf(S.cls), block = KEYS(S.cls).filter(k => k.id !== key).map(k => k.id); S.tal = {};
  if (key) { if (T) { const ci = T.cols.findIndex(c => c.nodes.some(n => n.id === key)); for (let ri = 0; ri < 6; ri++) while (G.learnNode(ci, ri)); }
    else { const bi = D.TALENTS[S.cls].findIndex(b => b.nodes.some(n => n.id === key)); for (let t = 0; t < 3; t++) while (G.learn(bi, t)); } }
  if (T) for (let i = 0; i < 80 && G.talentPoints() > 0; i++) { let best = null, bp = -1; const probe = fn => { const v = JSON.parse(JSON.stringify(S.tal)); if (!fn()) return null; const p = G.power(); S.tal = v; return p; };
    T.cols.forEach((c, ci) => c.nodes.forEach((n, ri) => { if (block.includes(n.id)) return; const p = probe(() => G.learnNode(ci, ri)); if (p > bp) { bp = p; best = () => G.learnNode(ci, ri); } }));
    (T.bridges || []).forEach((b, bi) => { const p = probe(() => G.learnBridge(bi)); if (p > bp) { bp = p; best = () => G.learnBridge(bi); } }); if (!best || !best()) break; }
  else for (let more = true; more && G.talentPoints() > 0;) { more = false; for (let b = 0; b < 3; b++) for (let t = 2; t >= 0; t--) { if (block.includes(D.TALENTS[S.cls][b].nodes[t].id)) continue; if (G.learn(b, t)) { more = true; break; } } } }
let BELT = []; const fighter = () => { const A = { ...G.stats(), belt: BELT }; A.cur0 = A.hp; return A; };
const rate = mobs => { let w = 0, ac = 0; for (const m of mobs) { const r = C.fight(fighter(), { ...m }); if (r.winner === 'a') w++; ac += r.log.filter(e => e.dmg !== undefined || e.miss || e.spell).length; } return [w / mobs.length, ac / mobs.length]; };
for (const [which, boss, VAR, LV] of [['Müllerin', MUE, MV, [12, 20]], ['Aldemar', ALD, AV, [20, 30, 40]]]) for (const L of LV) {
  const acc = {};
  for (const cls of D.PLAYABLE) for (let r = 0; r < ROLLS; r++) { hero(cls, L); const S0 = JSON.parse(JSON.stringify(G.S)), M = D.CLASSES[cls].main;
    const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, base = { ...G.S.attrs }; base[M] -= Math.round(pts * .55); base.con -= Math.round(pts * .3); base.int -= Math.round(pts * .05); base.lck -= Math.round(pts * .1);
    const set = (dist, key) => { Object.assign(G.S, JSON.parse(JSON.stringify(S0))); G.S.attrs = { ...base }; let u = 0; for (const [k, v] of Object.entries(dist)) { const n = Math.round(pts * v); G.S.attrs[k] += n; u += n; } G.S.attrs.con += pts - u; learnWith(key); };
    set(M === 'int' ? { int: .55, con: .3, lck: .1, dex: .05 } : { [M]: .55, con: .3, int: .05, lck: .1 }, null);
    let lo = .3, hi = 8, d = 1; for (let i = 0; i < 9; i++) { d = (lo + hi) / 2; if (rate(Array.from({ length: 160 }, () => G.makeMonster(L, d)))[0] > .5) lo = d; else hi = d; }
    const mult = d / D.CFG.bossDiff * 0.75;
    for (const [vn, mech] of Object.entries(VAR)) { boss.boss.mech = mech; const { _m = 1, ...mm } = mech; boss.boss.mech = mm; const mobs = Array.from({ length: N }, () => G.makeBoss(boss, L, mult * _m));
      for (const [bn, [dist, key, belt]] of Object.entries(B[cls])) { set(dist, key); BELT = belt ? [{ ...D.POTIONS.find(p => p.id === 'gegengift'), trig: 'dot' }] : []; const [w, ac] = rate(mobs); const k = `${cls.slice(0, 4)} ${bn}`; const x = (acc[k] ||= {})[vn] ||= [0, 0]; x[0] += w / ROLLS; x[1] += ac / ROLLS; } } }
  console.log(`\n=== ${which} St.${L} — Sieg % (Ø Aktionen) ===`); const vns = Object.keys(VAR);
  console.log(''.padEnd(18) + vns.map(v => v.slice(0, 22).padStart(24)).join(''));
  for (const [k, x] of Object.entries(acc)) console.log(k.padEnd(18) + vns.map(v => `${(x[v][0] * 100).toFixed(0)} (${x[v][1].toFixed(1)})`.padStart(24)).join(''));
}
