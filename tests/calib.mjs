// Eichung der Item-Boni: Wie viel Kampfkraft bringt ein Bonus der Stufe III, verglichen mit dem Hauptattribut (Stufe III)?
// Für jede Klasse und Stufe wird ein typischer Held gebaut (Punkte wie ein Spieler: viel Hauptattribut, etwas Konstitution,
// gewöhnliche Ausrüstung der Stufe). Ausgabe: Verhältnis je Bonus (1,00 = so gut wie das Hauptattribut).
// Aufruf: node tests/calib.mjs [--per]   (--per: schlägt `per`-Werte vor, mit denen alle Boni gleich viel bringen)
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
const D = await import('../js/data.js');
const G = await import('../js/state.js');
const { makeItem, affixScale } = await import('../js/loot.js');
const wantPer = process.argv.includes('--per');

const LV = [5, 10, 20, 30, 40], SLOTS = ['helm', 'chest', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand'];
const DEF = new Set(['con', 'lifep', 'evadep', 'blockp', 'thornsp', 'armor']);   // Verteidigung: gegen Konstitution messen
const tierVal = (a, L) => (a.per || 1) * affixScale(a, L);   // Stufe III, ohne Streuung

function hero(cls, L) {
  G.newChar('Eich', cls); const S = G.S; S.lvl = L;
  const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, main = D.CLASSES[cls].main;
  S.attrs[main] += Math.round(pts * 0.6); S.attrs.con += Math.round(pts * 0.3); S.attrs.lck += Math.round(pts * 0.1);
  const w = makeItem(L, { slot: 'weapon', cls: D.CLASSES[cls] }); const wb = D.BASES.filter(b => b.kind === D.CLASSES[cls].weapon && (!b.minLvl || L >= b.minLvl)).pop();
  Object.assign(w, { kind: wb.kind, dmg: wb.dmg.map(x => Math.round(x * (1 + L * 0.18) * 1.15)), mods: {}, tiers: {}, fx: undefined, unique: undefined });
  S.equip.weapon = w;
  for (const s of SLOTS) { const it = makeItem(L, { slot: s.startsWith('ring') ? 'ring' : s }); it.mods = {}; it.tiers = {}; delete it.fx; delete it.unique; S.equip[s] = it; }
  return S;
}
const gain = (slot, k, v) => { const S = G.S, it = S.equip[slot], old = it.mods; it.mods = { [k]: v }; const p = G.power(); it.mods = old; return p; };

const rows = {};
for (const cls of Object.keys(D.CLASSES)) for (const L of LV) {
  hero(cls, L); const p0 = G.power(), main = D.CLASSES[cls].main;
  const ref = { off: gain('ring1', main, tierVal({ per: 1 }, L)) - p0, def: gain('ring1', 'con', tierVal({ per: 1 }, L)) - p0 };
  for (const a of D.AFFIXES) {
    if (a.cls && a.cls !== cls) continue;
    const slot = !a.slots ? 'ring1' : a.slots.includes('ring') ? 'ring1' : a.slots[0] === 'weapon' ? 'weapon' : a.slots[0];
    const unit = 10;                                         // 10 Punkte bzw. 10 % messen (Grenzwert)
    const g = gain(slot, a.stat, unit) - p0, r = ref[DEF.has(a.stat) ? 'def' : 'off'];
    const key = a.cls ? 'sk_* (Zauber)' : a.stat;
    // Verhältnis bei per=1 (Bonuswert = Skala der Stufe) → nötiges per = 1 / Verhältnis
    const r1 = (g / unit) * affixScale(a, L) / r;
    (rows[key] ||= {})[L] = (rows[key][L] || []); rows[key][L].push(wantPer ? r1 : r1 * (a.per || 0));
  }
}
const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
console.log((wantPer ? 'Vorschlag per (gleich viel wie Hauptattribut/Konstitution)' : 'Bonus III ÷ Hauptattribut III (Verteidigung ÷ Konstitution)').padEnd(44) + LV.map(l => ('St.' + l).padStart(8)).join(''));
for (const [k, byL] of Object.entries(rows)) {
  const a = D.AFFIXES.find(x => x.stat === k) || {};
  console.log(k.padEnd(44) + LV.map(L => { const r = avg(byL[L]); return (wantPer ? (1 / r).toFixed(2) : r.toFixed(2)).padStart(8); }).join(''));
}
