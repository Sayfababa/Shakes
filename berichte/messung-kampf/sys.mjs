// Aufgabe 2: Kampfsysteme '' (heute), A, B, C, Kombinationen. Je System: Gegner neu geeicht (Bot-Held 50 %), dann mit gemeinsamen Würfeln
// roh / +20 % Leben / +20 % Schaden / +0,2 Zaubertempo / +20 % Zauberkraft: Zeit bis Kill, Zeit bis Tod, Siegpunkte, Aktionen, Overkill.
// Dazu: Siegchance gegen die HEUTE geeichten Gegner (Frühspiel-Verschiebung). Aufruf: node sys.mjs <klasse> <N> <stufen> <systeme,…>
globalThis.V = {}; globalThis.localStorage = { _d: {}, getItem() { return null; }, setItem() {}, removeItem() {} };
let seed = 0x515; Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const G = await import('../js/state.js'), C = await import('../js/combat.js'), D = await import('../js/data.js'); const { hero } = await import('./held.mjs');
const cls = process.argv[2], N = +process.argv[3] || 400, LV = (process.argv[4] || '10,20,40').split(',').map(Number), SYSS = (process.argv[5] || ',A,B,C,BC').split(','), ROLLS = 3;
const VAR = [['roh', A => A], ['+20% Leben', A => ({ ...A, hp: Math.round(A.hp * 1.2) })], ['+20% Schaden', A => ({ ...A, dmg: A.dmg.map(v => v * 1.2) })], ['+0,2 Tempo', A => ({ ...A, haste: (A.haste || 0) + 0.2 })], ['+20% Zauberkraft', A => ({ ...A, amp: A.amp * 1.2 })]];
const base = () => ({ ...G.stats(), belt: [] });
const spd = A => (globalThis.V.sys || '').includes('C') ? Math.max(0.5, 1 + (A.haste || 0)) : 1;
const acts = (r, who) => r.log.filter(e => e.who === who && (e.dmg !== undefined || e.miss || e.spell)).length;
const rate = (mk, mobs) => { let w = 0; for (const m of mobs) { const A = mk(); A.cur0 = A.hp; if (C.fight(A, { ...m }).winner === 'a') w++; } return w / mobs.length; };
const calib = L => { let lo = .3, hi = 8, d = 1; for (let i = 0; i < 9; i++) { d = (lo + hi) / 2; if (rate(base, Array.from({ length: 200 }, () => G.makeMonster(L, d))) > .5) lo = d; else hi = d; } return d; };
for (const L of LV) { const out = {};
  for (let r = 0; r < ROLLS; r++) { hero(cls, L); globalThis.V = { sys: '' }; const d0 = calib(L), mobs0 = Array.from({ length: N }, () => G.makeMonster(L, d0));
    for (const S of SYSS) { globalThis.V = { sys: S }; const d = calib(L), mobs = Array.from({ length: N }, () => G.makeMonster(L, d)), o = out[S || 'heute'] ||= { early: 0, v: {} };
      seed = 77 + r; o.early += rate(base, mobs0) / ROLLS;   // gleiche Gegner wie heute
      for (const [vn, f] of VAR) { const x = o.v[vn] ||= { w: 0, tk: 0, td: 0, ac: 0, ov: 0, nk: 0 };
        let w = 0, ac = 0, ov = 0, nk = 0, tk = 0, td = 0;
        for (const [i, m] of mobs.entries()) { const A = f(base()); A.cur0 = A.hp;
          seed = 1000 + i * 7919 + r; const res = C.fight(A, { ...m }); if (res.winner === 'a') { w++; let s = 0; for (const e of res.log) if (e.who === 'a') s += (e.dmg || 0) + (e.tick || 0); if (res.log.at(-1).hpB <= 0) { ov += Math.max(0, s - m.hp) / m.hp; nk++; } } ac += res.log.filter(e => e.dmg !== undefined || e.miss || e.spell).length;
          seed = 5000 + i * 7919 + r; const r1 = C.fight({ ...A }, { ...m, dmg: [0, 0] }); tk += acts(r1, 'a') / spd(A);
          seed = 9000 + i * 7919 + r; const r2 = C.fight({ ...A, dmg: [0, 0], spells: (A.spells || []).filter(s => ['heal', 'shield', 'buff'].includes(s.kind)) }, { ...m, hp: 1e9 }); td += acts(r2, 'b'); }
        const n = mobs.length; x.w += w / n / ROLLS; x.tk += tk / n / ROLLS; x.td += td / n / ROLLS; x.ac += ac / n / ROLLS; x.ov += (nk ? ov / nk : 0) / ROLLS; } } }
  console.log(`\n=== ${cls} St.${L} ===  je System: Sieg vs. heutige Gegner | Aktionen | Overkill | Änderung gegen roh: Kill-Zeit %, Überleben %, Siegpunkte`);
  for (const [S, o] of Object.entries(out)) { const R = o.v.roh;
    console.log(`${S.padEnd(6)} Frühspiel-Sieg ${(o.early * 100).toFixed(0).padStart(3)} % | Akt ${R.ac.toFixed(1).padStart(4)} | Overkill ${(R.ov * 100).toFixed(0).padStart(3)} % | ` +
      VAR.slice(1).map(([vn]) => { const x = o.v[vn]; return `${vn}: K ${((x.tk / R.tk - 1) * 100).toFixed(0).padStart(3)} Ü ${((x.td / R.td - 1) * 100).toFixed(0).padStart(3)} S ${((x.w - R.w) * 100).toFixed(1).padStart(5)}`; }).join(' | ')); }
}
