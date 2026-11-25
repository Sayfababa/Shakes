// Umschmieden messen: wie stark wird ein Teil für eine feste Menge Material? (alte und neue Regeln, dieselbe Spielweise)
// node tests/craftmess.mjs [klasse] [stufe] [versuche]
// Spielweise wie ein vernünftiger Spieler: besten Bonus versiegeln; Platz → hinzufügen (bei Angebot: das beste nehmen);
// sonst der schwächste Bonus: taugt seine Art nichts → ersetzen (alt: zufällig tilgen + hinzufügen), sonst Wert würfeln.
// Maß: Kampfkraft-Gewinn des angelegten Teils gegenüber dem Fund. Kosten: Material-Einheiten (Kronsplitter nicht).
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k]; }, setItem(k, v) { this._d[k] = v; }, removeItem(k) { delete this._d[k]; } };
const D = await import('../js/data.js'), G = await import('../js/state.js'), L = await import('../js/loot.js');
const [cls = 'sorceress', lvl = 20, N = 300] = process.argv.slice(2).map((v, i) => i ? +v : v);
const NEU = D.CRAFT.ops.some(o => o.pick);   // neue Regeln erkennbar am Angebot
const mats = () => Object.fromEntries(D.CRAFT.ops.map(o => [o.mat, 999]));
const used = m => Object.values(m).reduce((a, v) => a + (999 - v), 0);
function hero() {
  G.newChar('Mess', cls); const S = G.S; S.tut = 99; S.lvl = lvl; S.gold = 1e9; S.attrs.int += lvl * 3; S.attrs.con += lvl * 3;
  for (const s of ['helm', 'chest', 'gloves', 'boots', 'belt', 'ring1', 'ring2', 'offhand']) S.equip[s] = L.makeItem(lvl, { slot: s.startsWith('ring') ? 'ring' : s, minRarity: 2 });
  delete S.equip.amulet; return S;
}
const slot = 'amulet';
const pw = it => G.power(G.stats({ ...G.S, equip: { ...G.S.equip, [slot]: it } }));
const without = (it, k) => { const c = structuredClone(it); c.mods[k] -= G.baseMods(it)[k]; if (c.mods[k] <= 0) delete c.mods[k]; return c; };
const contrib = (it, k) => pw(it) - pw(without(it, k));
const BUD = [8, 16, 32];
const res = { magic: BUD.map(() => []), rare: BUD.map(() => []) };
for (const rar of ['magic', 'rare']) for (let n = 0; n < N; n++) {
  hero(); let it; do it = L.makeItem(lvl, { slot, minRarity: rar === 'rare' ? 3 : 2 }); while (it.rarity !== rar || it.unique || it.set);
  G.S.bag = [it]; G.S.mats = mats(); const p0 = pw(it); let bi = 0, guard = 0;
  while (bi < BUD.length && guard++ < 400) {
    const spent = used(G.S.mats); while (bi < BUD.length && spent >= BUD[bi]) { res[rar][bi].push(pw(it) - p0); bi++; } if (bi >= BUD.length) break;
    if (it.offer) { const best = it.offer.map((o, i) => [i, contrib(G.offerPreview(it, i), o.k)]).sort((a, b) => b[1] - a[1])[0][0]; G.craftPick(it.id, best); continue; }
    const base = G.baseMods(it), keys = Object.keys(base);
    if (!it.sealed && keys.length >= 2) { const best = keys.sort((a, b) => contrib(it, b) - contrib(it, a))[0]; G.craft(it.id, 'seal', best); continue; }
    if (!G.craftCheck(it, 'add') && !G.craftRaises(it, 'add')) { G.craft(it.id, 'add'); continue; }
    const free = keys.filter(k => k !== it.sealed); if (!free.length) break;
    const c = Object.fromEntries(free.map(k => [k, contrib(it, k)])), w = free.sort((a, b) => c[a] - c[b])[0];
    const others = keys.filter(k => k !== w).map(k => contrib(it, k)).sort((a, b) => a - b), med = others[others.length >> 1] || 0;
    if (c[w] < 0.5 * med) { if (NEU) G.craft(it.id, 'chaos', w); else { G.craft(it.id, 'remove', w); G.craft(it.id, 'add'); } }
    else G.craft(it.id, 'values', w);
  }
}
const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(p * (s.length - 1))] ?? 0; };
console.log(`${NEU ? 'NEU' : 'ALT'} · ${cls} St.${lvl} · ${N} Teile je Seltenheit · Kampfkraft-Gewinn des Amuletts nach X Material`);
for (const rar of ['magic', 'rare']) console.log(rar.padEnd(6), BUD.map((b, i) => { const a = res[rar][i]; return `${b} Mat: Ø ${(a.reduce((x, y) => x + y, 0) / a.length).toFixed(0)} (Median ${q(a, 0.5).toFixed(0)}, 90 % ${q(a, 0.9).toFixed(0)})`; }).join(' | '));
