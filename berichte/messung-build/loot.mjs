globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem() {}, removeItem() {} };
const R = new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const { makeItem } = await import(R+'/js/loot.js');
const n = 6000;
for (const [ctx, extra, minR] of [['Krypta T0', 0, 0], ['Streifzug Tiefe 3', 60, 0], ['Abgrund T5 (U1)', 30, 0], ['Abgrund T10 U2', 60, 2], ['Abgrund T20 U5', 135, 3]]) {
  const row = []; for (const lck of [0, 50, 100, 200]) { let r = 0, l = 0; for (let i = 0; i < n; i++) { const it = makeItem(40, { luck: lck + extra, minRarity: minR }); if (it.rarity === 'rare' || it.rarity === 'legendary') r++; if (it.rarity === 'legendary') l++; } row.push(`Gl ${lck}: selten+ ${(r / n * 100).toFixed(1)} % / legendär ${(l / n * 100).toFixed(1)} %`); }
  console.log(ctx.padEnd(18), row.join(' | ')); }
