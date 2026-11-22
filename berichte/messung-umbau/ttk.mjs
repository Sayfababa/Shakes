// Zeit bis zum Kill (Gegner wehrlos) und bis zum Tod (Held wehrlos) in eigenen Zügen, roh / +20 % Schaden / +20 % Leben
globalThis.V = {}; globalThis.localStorage = { _d: {}, getItem() { return null; }, setItem() {}, removeItem() {} };
let seed = 7; Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const G = await import('../js/state.js'), C = await import('../js/combat.js'); const { hero } = await import('./held.mjs');
const cls = process.argv[2], L = +process.argv[3] || 40, N = 600;
const turns = (r, who) => r.log.filter(e => e.who === who && (e.dmg !== undefined || e.miss || e.spell)).length;
hero(cls, L); const NS = process.argv[4] === 'ohne'; const base0 = { ...G.stats(), belt: [] }; const base = NS ? { ...base0, spells: [], rage: 0, regen: 0, leech: 0 } : base0;
let lo = .3, hi = 8, d = 1; for (let i = 0; i < 9; i++) { d = (lo + hi) / 2; let w = 0; for (let k = 0; k < 300; k++) { const A = { ...base, cur0: base.hp }; if (C.fight(A, G.makeMonster(L, d)).winner === 'a') w++; } if (w > 150) lo = d; else hi = d; }
const mobs = Array.from({ length: N }, () => G.makeMonster(L, d));
const dist = arr => { const h = {}; for (const x of arr) h[x] = (h[x] || 0) + 1; return Object.entries(h).sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${Math.round(v / arr.length * 100)}`).join(' '); };
for (const [n, A0] of [['roh', base], ['+20% Schaden', { ...base, dmg: base.dmg.map(v => v * 1.2) }], ['+20% Leben', { ...base, hp: Math.round(base.hp * 1.2) }], ['+0,2 Tempo', { ...base, haste: (base.haste || 0) + 0.2 }], ['+20% Zauber', { ...base, amp: base.amp * 1.2 }]]) {
  const tk = [], td = [];
  for (const [i, m] of mobs.entries()) { seed = 99 + i * 7919; const r1 = C.fight({ ...A0, cur0: A0.hp }, { ...m, dmg: [0, 0], hp: m.hp }); tk.push(turns(r1, 'a'));
    seed = 99 + i * 7919; const r2 = C.fight({ ...A0, cur0: A0.hp, dmg: [0, 0], spells: (A0.spells || []).filter(s => ['heal', 'shield', 'buff'].includes(s.kind)) }, { ...m, hp: 1e9 }); td.push(turns(r2, 'b')); }
  const avg = a => (a.reduce((p, q) => p + q, 0) / a.length).toFixed(2);
  console.log(`${cls} St.${L}${NS ? ' ohneZ' : ''} ${n.padEnd(13)} Züge bis Kill Ø ${avg(tk)} [${dist(tk)}]  |  Gegner-Züge bis Tod Ø ${avg(td)} [${dist(td)}]`);
}
