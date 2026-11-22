// Archetyp-Simulation (Analyse, kein Spielcode). Aufruf: node builds.mjs <klasse> [N]
// Gleiche Ausrüstung je Wurf für alle Builds; nur Attribute, Talent-Vorliebe und Zauber-Wege unterscheiden sich.
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
let seed = 0x5eed + process.argv[2].length; Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const R = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');
const D = await import(R + '/js/data.js'), G = await import(R + '/js/state.js'), C = await import(R + '/js/combat.js'), Game = await import(R + '/js/game.js');
const { hero } = await import(R + '/tests/held.mjs');
const cls = process.argv[2], N = +process.argv[3] || 300, ROLLS = 3, LV = (process.argv[4] || '10,20,30,40').split(',').map(Number);
const AT = ['str', 'dex', 'int', 'con', 'lck'];
const M = D.CLASSES[cls].main;
// Archetypen: Anteile der freien Punkte + bevorzugte Talent-Spalte (Index) + Zauber-Weg-Vorgaben {zauber: [w0,w1,w2]}
const B = {
  barbarian: {
    Standard: { a: { str: .55, con: .30, int: .05, lck: .10 } },
    Koloss: { a: { str: .35, con: .55, lck: .10 }, col: 1 },
    Berserker: { a: { str: .60, con: .15, lck: .25 }, col: 0 },
    Kriegsherr: { a: { str: .40, con: .30, dex: .20, lck: .10 }, col: 2 },
    Glaskanone: { a: { str: .85, con: .10, lck: .05 }, col: 0 },
  },
  assassin: {
    Standard: { a: { dex: .55, con: .30, int: .05, lck: .10 } },
    Schatten: { a: { dex: .65, con: .25, lck: .10 }, col: 1 },
    Henker: { a: { dex: .55, con: .15, lck: .30 }, col: 0 },
    Giftmeister: { a: { dex: .45, con: .30, int: .15, lck: .10 }, col: 2 },
    Koloss: { a: { dex: .35, con: .55, str: .10 } },
  },
  sorceress: {
    Standard: { a: { int: .55, con: .30, int2: 0, lck: .10, dex: .05 } },
    Arkanist: { a: { int: .70, con: .20, lck: .10 }, col: 2 },
    Feuer: { a: { int: .65, con: .15, lck: .20 }, col: 0 },
    Frostweber: { a: { int: .45, con: .40, str: .15 }, col: 1 },
    Koloss: { a: { int: .35, con: .55, str: .10 } },
  },
}[cls];
for (const c of [0, 1, 2]) B['Std/Sp' + c] = { a: B.Standard.a, col: c };
function learnPref(col) {
  const S = G.S; S.tal = {}; const T = G.treeOf(S.cls);
  if (T) for (let i = 0; i < 80 && G.talentPoints() > 0; i++) {
    let best = null, bp = -1;
    const probe = fn => { const vor = JSON.parse(JSON.stringify(S.tal)); if (!fn()) return null; const p = G.power(); S.tal = vor; return p; };
    T.cols.forEach((c, ci) => c.nodes.forEach((n, ri) => { let p = probe(() => G.learnNode(ci, ri)); if (p != null && col != null && ci === col) p *= 10; if (p > bp) { bp = p; best = () => G.learnNode(ci, ri); } }));
    (T.bridges || []).forEach((b, bi) => { const p = probe(() => G.learnBridge(bi)); if (p > bp) { bp = p; best = () => G.learnBridge(bi); } });
    if (!best || !best()) break;
  } else {
    const order = col == null ? [0, 1, 2] : [col, ...[0, 1, 2].filter(x => x !== col)];
    if (col != null) for (let more = true; more;) { more = false; for (let t = 2; t >= 0; t--) if (G.learn(col, t)) { more = true; break; } }
    for (let more = true; more && G.talentPoints() > 0;) { more = false; for (const b of order) for (let t = 2; t >= 0; t--) if (G.learn(b, t)) { more = true; break; } }
  }
}
function apply(base, b, L) {
  const S = G.S; const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel; S.attrs = { ...base };
  let used = 0; const ks = Object.keys(b.a).filter(k => AT.includes(k));
  for (const k of ks) { const n = Math.round(pts * b.a[k]); S.attrs[k] += n; used += n; }
  S.attrs.con += pts - used;   // Rundungsrest
  learnPref(b.col);
}
const fighter = () => { const A = { ...G.stats(), belt: [] }; A.cur0 = A.hp; return A; };
function one(mob) {
  const A = fighter(), r = C.fight(A, { ...mob });
  let actA = 0, actB = 0; for (const e of r.log) { if (e.dmg !== undefined || e.miss || e.spell) { if (e.who === 'a') actA++; else actB++; } }
  const last = r.log[r.log.length - 1] || { hpA: A.hp, hpB: mob.hp };
  return { w: r.winner === 'a', rounds: actA + actB, dealt: (mob.hp - last.hpB) / Math.max(1, actA), taken: (A.hp - last.hpA) / Math.max(1, actB) / A.hp, left: r.left };
}
function agg(mobs) { let w = 0, ro = 0, de = 0, ta = 0; for (const m of mobs) { const o = one(m); w += o.w; ro += o.rounds; de += o.dealt; ta += o.taken; }
  const n = mobs.length; return { w: w / n, ro: ro / n, de: de / n, ta: ta / n }; }
const pool = (L, diff, n = N) => Array.from({ length: n }, () => G.makeMonster(L, diff));
const ELMOD = D.ELITE.mods;
const elite = (L, diff, mod) => { const m = G.makeMonster(L, diff * D.ELITE.diff); m.hp = Math.round(m.hp * D.ELITE.hp); Object.assign(m, mod.eff || {}); for (const [k, v] of Object.entries(mod.mult || {})) m[k] = Math.round(m[k] * v); return m; };
const BOSSC = D.CRYPTS.filter(c => c.boss?.mech);
// Abstieg wie tests/descent.mjs (echtes Spiel: descStart/descEnter), Kampfräume bevorzugt
const prio = { shrine: 0, fight: 1, treasure: 2, elite: 3 };
function descend(d) {
  G.S.seals = { day: G.today(), n: D.DESCENT.sealMax }; G.S.desc = null; G.S.deep = { best: 9999, week: -1, wBest: 0 };
  if (!Game.descStart(d)) throw new Error('Tiefe ' + d); let boss = false, rooms = 0;
  for (let room = 0; G.S.desc; room++) { const nx = Game.descNext(), opts = nx.filter(j => j === 'boss' || !D.DESC_ROOMS[Game.descNodeAt(j).t].exit);
    const j = opts.sort((a, b) => (a === 'boss' ? 9 : prio[Game.descNodeAt(a).t]) - (b === 'boss' ? 9 : prio[Game.descNodeAt(b).t]))[0];
    const r = Game.descEnter(j); if (!r) break; if (G.S.desc) rooms++; if (r.res?.desc?.out && j === 'boss') boss = true; }
  return { boss, rooms };
}
const depthFor = L => Math.max(1, Math.round((L + 1 - D.DESCENT.lvlBase) / D.DESCENT.lvlPer));

// +10 % Leben gegen +10 % Schaden (alle Schadenswege: Waffe → Hieb und Zauber), mit/ohne Heilung und Zauber
const V = {
  'roh': A => A,
  '+10% Leben': A => ({ ...A, hp: Math.round(A.hp * 1.1) }),
  '+10% Schaden': A => ({ ...A, dmg: A.dmg.map(v => v * 1.1) }),
};
const strip = A => { const B = { ...A, regen: 0, leech: 0, secondWind: 0, ward: 0, siphon: 0, lastBreath: 0, spells: (A.spells || []).filter(s => !['heal', 'shield'].includes(s.kind)).map(s => ({ ...s, m: { ...(s.m || {}), lifesteal: 0, shieldGain: 0, healPct: 0, overshield: 0 } })) }; return B; };
const nospell = A => ({ ...strip(A), spells: [], rage: 0, buff: 1 });
for (const L of LV) { const res = {};
  for (let r = 0; r < ROLLS; r++) { hero(cls, L); const mobsFor = mod => { let lo = 0.3, hi = 8, diff = 1; const A0 = mod(fighter());
      const rt = (d, n) => { let w = 0; for (let i = 0; i < n; i++) { const A = mod(fighter()); A.cur0 = A.hp; if (C.fight(A, G.makeMonster(L, d)).winner === 'a') w++; } return w / n; };
      for (let i = 0; i < 9; i++) { diff = (lo + hi) / 2; if (rt(diff, 160) > 0.5) lo = diff; else hi = diff; } return Array.from({ length: N }, () => G.makeMonster(L, diff)); };
    for (const [mn, mod] of [['echt', A => A], ['ohne Heilung/Schild', strip], ['nur Hiebe', nospell]]) {
      const mobs = mobsFor(mod);
      for (const [vn, v] of Object.entries(V)) { let w = 0; for (const m of mobs) { const A = v(mod(fighter())); A.cur0 = A.hp; if (C.fight(A, { ...m }).winner === 'a') w++; }
        (res[mn] ||= {})[vn] = ((res[mn][vn] || 0) + w / N / ROLLS); } } }
  console.log(`${cls} St.${L}: ` + Object.entries(res).map(([mn, x]) => `${mn}: Leben ${((x['+10% Leben'] - x.roh) * 100).toFixed(1)} / Schaden ${((x['+10% Schaden'] - x.roh) * 100).toFixed(1)}`).join('  |  '));
}
