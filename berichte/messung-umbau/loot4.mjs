// Schritt 4: Seltenheiten je Lootmodus. V.loot: 0 heute, 1 Exponenten auf Gesamtglück, 2 eigenes Glück mit Exponenten × Umfeld, 3 wie 2 milder
globalThis.V = { loot: +process.argv[2] }; globalThis.localStorage = { _d: {}, getItem() { return null; }, setItem() {}, removeItem() {} };
let seed = 42; Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const { makeItem } = await import('../js/loot.js'), D = await import('../js/data.js');
const N = 100000, mult = Object.fromEntries(D.RARITIES.map(r => [r.id, r.mult]));
for (const [ctxName, ctx, minR] of [['Krypta', 0, 0], ['Streifzug T3', 60, 0], ['Abgrund T5 U1', 30, 0], ['Abgrund T10 U2 (min. magisch)', 60, 2], ['Abgrund T20 U5 (min. selten)', 135, 3]]) {
  const row = []; for (const lck of [0, 100, 200]) { const c = {}; let m = 0, aff = 0;
    for (let i = 0; i < N; i++) { const it = makeItem(40, V.loot === 0 || V.loot === 1 ? { luck: lck + ctx, minRarity: minR } : { luck: lck, ctx, minRarity: minR }); c[it.rarity] = (c[it.rarity] || 0) + 1; m += mult[it.rarity] || 1; aff += Object.keys(it.mods || {}).length; }
    row.push(`Gl ${String(lck).padStart(3)}: mag ${(c.magic / N * 100 || 0).toFixed(1).padStart(4)} sel ${((c.rare || 0) / N * 100).toFixed(1).padStart(4)} leg ${((c.legendary || 0) / N * 100).toFixed(1).padStart(4)} | Ø×${(m / N).toFixed(3)} Aff ${(aff / N).toFixed(2)}`); }
  console.log(`L${V.loot} ${ctxName.padEnd(30)} ${row.join('  ||  ')}`); }
