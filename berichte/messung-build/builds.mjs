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
const out = {};
for (const L of LV) {
  const acc = {};
  for (let r = 0; r < ROLLS; r++) {
    hero(cls, L); const S0 = JSON.parse(JSON.stringify(G.S));
    // Grundattribute = Held minus seine Verteilung
    const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, base = { ...G.S.attrs };
    base[M] -= Math.round(pts * .55); base.con -= Math.round(pts * .3); base.int -= Math.round(pts * .05); base.lck -= Math.round(pts * .1);
    const reset = () => { Object.assign(G.S, JSON.parse(JSON.stringify(S0))); };
    // eichen: Standard schlägt normale Gegner zu ~50 %
    reset(); apply(base, B.Standard, L);
    let lo = 0.3, hi = 8, diff = 1; for (let i = 0; i < 9; i++) { diff = (lo + hi) / 2; if (agg(pool(L, diff, 160)).w > 0.5) lo = diff; else hi = diff; }
    const mobs = pool(L, diff), bossMult = diff / D.CFG.bossDiff * 0.75;
    const bosses = BOSSC.map(c => ({ id: c.boss.name.split(',')[0], mobs: Array.from({ length: Math.round(N / 3) }, () => G.makeBoss(c, L, bossMult)) }));
    const elites = ELMOD.map(e => ({ id: e.name, mobs: Array.from({ length: Math.round(N / 3) }, () => elite(L, diff * 0.8, e)) }));
    for (const [name, b] of Object.entries(B)) {
      reset(); apply(base, b, L); const st = G.stats();
      const a = acc[name] ||= { n: 0, pw: 0, hp: 0, arm: 0, ev: 0, cr: 0, amp: 0, norm: { w: 0, ro: 0, de: 0, ta: 0 }, boss: {}, elite: {}, deep: {} };
      a.n++; a.pw += G.power(); a.hp += st.hp; a.arm += C.armorRed(st.armor, L); a.ev += C.evadeChance(st, 3 + L * D.CFG.monGrow); a.cr += C.critChance(st, L); a.amp += st.amp;
      const dm = mobs.slice(0, 60).map(m => ({ ...m, hp: 1e9, dmg: [0, 0] })); let dd0 = 0; for (const m of dm) { const r = C.fight(fighter(), m); dd0 += (1e9 - r.log[r.log.length - 1].hpB) / 25; } a.dummy = (a.dummy || 0) + dd0 / dm.length;
      const nm = agg(mobs); for (const k in nm) a.norm[k] += nm[k];
      for (const x of bosses) { const g = agg(x.mobs); (a.boss[x.id] ||= { w: 0, ro: 0 }); a.boss[x.id].w += g.w; a.boss[x.id].ro += g.ro; }
      for (const x of elites) { const g = agg(x.mobs); (a.elite[x.id] ||= { w: 0 }); a.elite[x.id].w += g.w; }
      const d0 = depthFor(L);
      for (const dd of [Math.max(1, d0 - 2), d0, d0 + 2]) { let bw = 0, rm = 0; const nD = Math.round(N / 6);
        for (let k = 0; k < nD; k++) { const keep = JSON.stringify({ e: G.S.equip, a: G.S.attrs, t: G.S.tal, sp: G.S.sp, l: G.S.lvl });
          const o = descend(dd); bw += o.boss; rm += o.rooms; const kk = JSON.parse(keep); Object.assign(G.S, { equip: kk.e, attrs: kk.a, tal: kk.t, sp: kk.sp, lvl: kk.l }); G.S.desc = null; }
        (a.deep[dd - d0 + 9] ||= { w: 0, rm: 0, d: 0 }); a.deep[dd - d0 + 9].w += bw / nD; a.deep[dd - d0 + 9].rm += rm / nD; a.deep[dd - d0 + 9].d += dd; }
    }
  }
  out[L] = acc;
  console.log(`\n=== ${cls} Stufe ${L}  (Tiefen ${Math.max(1, depthFor(L) - 2)} / ${depthFor(L)} / ${depthFor(L) + 2}) ===`);
  console.log('Build        KK     Leben  Rüst% Ausw% Krit% Zaub× | Normal: Sieg  Züge  Puppe/Zug  erlitten%/Akt | Boss Ø  min..max | Elite min..max | Abgrund T-2 T0 T+2 (Boss-Sieg)');
  for (const [name, a] of Object.entries(acc)) { const n = a.n, f = x => (x / n * 100).toFixed(0).padStart(3);
    const bw = Object.values(a.boss).map(x => x.w / n), ew = Object.values(a.elite).map(x => x.w / n);
    console.log(`${name.padEnd(12)}${String(Math.round(a.pw / n)).padStart(6)} ${String(Math.round(a.hp / n)).padStart(6)}  ${f(a.arm)}   ${f(a.ev)}   ${f(a.cr)}  ${(a.amp / n).toFixed(2)} |   ${f(a.norm.w)} %  ${(a.norm.ro / n).toFixed(1).padStart(4)}  ${String(Math.round(a.dummy / n)).padStart(8)}      ${(a.norm.ta / n * 100).toFixed(1).padStart(5)} | ${(bw.reduce((p, q) => p + q, 0) / bw.length * 100).toFixed(0).padStart(3)} % ${(Math.min(...bw) * 100).toFixed(0)}..${(Math.max(...bw) * 100).toFixed(0)} | ${(Math.min(...ew) * 100).toFixed(0)}..${(Math.max(...ew) * 100).toFixed(0)} | ${Object.values(a.deep).map(x => f(x.w)).join(' ')}`);
  }
  console.log('Boss je Build (Sieg %):'); const ids = Object.keys(Object.values(acc)[0].boss);
  console.log('             ' + ids.map(i => i.slice(0, 9).padStart(10)).join(''));
  for (const [name, a] of Object.entries(acc)) console.log(name.padEnd(13) + ids.map(i => (a.boss[i].w / a.n * 100).toFixed(0).padStart(10)).join(''));
  console.log('Elite je Build (Sieg %):'); const eids = Object.keys(Object.values(acc)[0].elite);
  console.log('             ' + eids.map(i => i.slice(0, 9).padStart(10)).join(''));
  for (const [name, a] of Object.entries(acc)) console.log(name.padEnd(13) + eids.map(i => (a.elite[i].w / a.n * 100).toFixed(0).padStart(10)).join(''));
}
