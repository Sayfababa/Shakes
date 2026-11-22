// Schritt 1: Warum ist +20 % Leben mehr wert als +20 % Schaden? Gemeinsame Würfel (gleicher Keim) für roh/+Leben/+Schaden.
// Aufruf: V-Schalter werden je Bedingung gesetzt. node cause.mjs <klasse> <N> <stufen>
globalThis.V = {};
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem() {}, removeItem() {} };
let seed = 0x1234; Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const G = await import('../js/state.js'), C = await import('../js/combat.js'), D = await import('../js/data.js');
const { hero } = await import('./held.mjs');
const cls = process.argv[2], N = +process.argv[3] || 800, ROLLS = 4, LV = (process.argv[4] || '20,40').split(',').map(Number), STEP = 0.2;
const nospell = A => ({ ...A, spells: [], rage: 0, regen: 0, leech: 0, secondWind: 0, ward: 0, siphon: 0, lastBreath: 0 });
const COND = [
  ['echt', {}, A => A, m => m],
  ['Gegner-Krit aus', { noFoeCrit: 1 }, A => A, m => m],
  ['Serienbremse aus', { streak: 99 }, A => A, m => m],
  ['Held schlägt immer zuerst', { ini: 'a' }, A => A, m => m],
  ['Gegner schlägt immer zuerst', { ini: 'b' }, A => A, m => m],
  ['Gegner-Schaden ohne Streuung', {}, A => A, m => ({ ...m, dmg: [(m.dmg[0] + m.dmg[1]) / 2, (m.dmg[0] + m.dmg[1]) / 2] })],
  ['ohne Zauber/Raserei/Heilung', {}, nospell, m => m],
  ['… + Gegner-Krit aus + Streuung aus', { noFoeCrit: 1 }, nospell, m => ({ ...m, dmg: [(m.dmg[0] + m.dmg[1]) / 2, (m.dmg[0] + m.dmg[1]) / 2] })],
  ['… + Ausweichen beidseitig aus', { noFoeCrit: 1 }, A => ({ ...nospell(A), evade: -9, dex: 0, acc: 9, block: 0 }), m => ({ ...m, evade: -9, dex: 0, acc: 9, dmg: [(m.dmg[0] + m.dmg[1]) / 2, (m.dmg[0] + m.dmg[1]) / 2] })],
  ['Schaden lädt Zauber (Gegenprobe)', { chg: 1 }, A => A, m => m],
  ['ohne Heilung in % Leben', {}, A => ({ ...A, regen: 0, leech: 0, secondWind: 0, ward: 0, siphon: 0, spells: (A.spells || []).filter(s => !['heal', 'shield'].includes(s.kind)) }), m => m],
  ['Held-Hiebe halbiert ×2 (ohne Zauber)', { split: 'a' }, nospell, m => m],
  ['Gegner-Hiebe halbiert ×2 (ohne Zauber)', { split: 'b' }, nospell, m => m],
];
const fighter = mod => { const A = mod({ ...G.stats(), belt: [] }); A.cur0 = A.hp; return A; };
function run(mods, modA, modM, mobs, s0) {   // gemeinsame Würfel: gleicher Keim je Variante
  const out = {}; for (const [k, f] of [['roh', A => A], ['L', A => ({ ...A, hp: Math.round(A.hp * (1 + STEP)) })], ['S', A => ({ ...A, dmg: A.dmg.map(v => v * (1 + STEP)) })]]) {
    seed = s0; let w = 0, hitA = 0, nA = 0, hitB = 0, nB = 0, hpA = 0, hpB = 0, act = 0;
    for (const m0 of mobs) { const A = f(fighter(modA)), m = modM(m0); A.cur0 = A.hp; const r = C.fight(A, { ...m }); if (r.winner === 'a') w++;
      for (const e of r.log) { if (e.dmg > 0) { if (e.who === 'a') { hitA += e.dmg; nA++; } else { hitB += e.dmg; nB++; } } if (e.dmg !== undefined || e.miss || e.spell) act++; }
      hpA += A.hp; hpB += m.hp; }
    out[k] = { w: w / mobs.length, K: hpB / mobs.length / (hitA / Math.max(1, nA)), J: hpA / mobs.length / (hitB / Math.max(1, nB)), act: act / mobs.length };
  } return out;
}
for (const L of LV) { const res = {};
  for (let r = 0; r < ROLLS; r++) { hero(cls, L);
    for (const [name, v, modA, modM] of COND) {
      globalThis.V = v; D.CFG.evadeStreak = v.streak || 2;
      const rt = (d, n) => { let w = 0; for (let i = 0; i < n; i++) { const A = fighter(modA); if (C.fight(A, modM(G.makeMonster(L, d))).winner === 'a') w++; } return w / n; };
      let lo = 0.3, hi = 8, d = 1; for (let i = 0; i < 10; i++) { d = (lo + hi) / 2; if (rt(d, 300) > 0.5) lo = d; else hi = d; }
      const mobs = Array.from({ length: N }, () => G.makeMonster(L, d)), o = run(v, modA, modM, mobs, 0xbeef + r);
      const x = res[name] ||= { w0: 0, dL: 0, dS: 0, K: 0, J: 0, act: 0 };
      x.w0 += o.roh.w / ROLLS; x.dL += (o.L.w - o.roh.w) / ROLLS; x.dS += (o.S.w - o.roh.w) / ROLLS; x.K += o.roh.K / ROLLS; x.J += o.roh.J / ROLLS; x.act += o.roh.act / ROLLS;
    } globalThis.V = {}; D.CFG.evadeStreak = 2; }
  console.log(`\n${cls} St.${L}  (+${STEP * 100} %, ${ROLLS} Würfe × ${N} Kämpfe, gemeinsame Würfel)`);
  console.log('Bedingung'.padEnd(42) + 'Sieg0  +Leben  +Schaden  Verh.   K(Held-Treffer bis Tod)  J(Gegner-Treffer)  J/K  Aktionen');
  for (const [n, x] of Object.entries(res)) console.log(n.padEnd(42) + `${(x.w0 * 100).toFixed(0).padStart(4)}  ${(x.dL * 100).toFixed(1).padStart(6)}  ${(x.dS * 100).toFixed(1).padStart(7)}  ${(x.dS > 0.002 ? (x.dL / x.dS).toFixed(1) : '∞').padStart(5)}   ${x.K.toFixed(2).padStart(8)}               ${x.J.toFixed(2).padStart(8)}       ${(x.J / x.K).toFixed(2)}  ${x.act.toFixed(1)}`);
}
