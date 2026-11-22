// Eichung der Item-Boni: Wie viel Kampfkraft bringt ein Bonus, verglichen mit dem Hauptattribut derselben Bonus-Stufe?
// Seit Welle 1a (feste Stufen) gilt je Heldenstufe L die beste Stufe, die Gegenstandsstufe L freischaltet (topTier), Wert = Mitte.
// Für jede Klasse und Stufe wird ein typischer Held gebaut (Punkte wie ein Spieler: viel Hauptattribut, etwas Konstitution,
// gewöhnliche Ausrüstung der Stufe). Ausgabe: Verhältnis je Bonus (1,00 = so gut wie das Hauptattribut).
// Aufruf: node tests/calib.mjs [--per]   (--per: schlägt `per`-Werte vor, mit denen alle Boni gleich viel bringen)
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
// Fester Keim + Mittel über REPS Ausrüstungswürfe: mit einem Wurf schwankte Zaubertempo St. 20 zwischen 0,61 und 0,88 von Lauf zu Lauf
let seed = 0xca1b; Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const REPS = 4;
const D = await import('../js/data.js');
const G = await import('../js/state.js');
const { makeItem, tierBand, topTier } = await import('../js/loot.js');
const wantPer = process.argv.includes('--per');
const perCls = process.argv.includes('--cls');   // flache Werte je Klasse zeigen – der Mittelwert versteckt den Entwurf

const LV = [5, 10, 20, 30, 40], SLOTS = ['helm', 'chest', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand'];
const DEF = new Set(['con', 'lifep', 'evadep', 'blockp', 'thornsp', 'armor', 'physr', 'elemr']);   // Verteidigung (mit Resistenzen, Welle 2a): gegen Konstitution messen
const tierVal = (a, L) => { const [lo, hi] = tierBand(a, topTier(L)); return (lo + hi) / 2; };   // beste freie Stufe, Mitte

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

const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
const rows = {}, clsRows = {};
for (const cls of D.PLAYABLE) for (const L of LV) for (let rep = 0; rep < REPS; rep++) {
  hero(cls, L); const p0 = G.power(), main = D.CLASSES[cls].main;
  const ref = { off: gain('ring1', main, tierVal(main, L)) - p0, def: gain('ring1', 'con', tierVal('con', L)) - p0 };
  for (const a of D.AFFIXES) {
    if (a.cls && a.cls !== cls) continue;
    if (a.notKind?.includes(D.CLASSES[cls].weapon) && a.slots?.every(s => s === 'weapon')) continue;   // würfelt nie auf der Waffe dieser Klasse
    const slot = !a.slots ? 'ring1' : a.slots.includes('ring') ? 'ring1' : a.slots[0] === 'weapon' ? 'weapon' : a.slots[0];
    const unit = 10;                                         // 10 Punkte bzw. 10 % messen (Grenzwert)
    const g = gain(slot, a.stat, unit) - p0, r = ref[DEF.has(a.stat) ? 'def' : 'off'];
    const key = a.cls ? 'sk_* (Zauber)' : a.stat;
    // Verhältnis beim Wert der Stufe → nötiges per = per / Verhältnis
    const r1 = (g / unit) * tierVal(a, L) / r;
    (rows[key] ||= {})[L] = (rows[key][L] || []); rows[key][L].push(wantPer ? r1 / (a.per || 1) : r1);
    ((clsRows[key] ||= {})[L] ||= []).push(r1);
    // Resistenzen wirken gestapelt (1 − Resi): ein Teil mehr bei schon 45 % auf dem Helm zeigt den Wert mitten im Farmen
    if (a.stat === 'physr' || a.stat === 'elemr') {
      const h = G.S.equip.helm, old = h.mods; h.mods = { [a.stat]: 45 }; const q0 = G.power(), q = gain(slot, a.stat, unit) - q0; h.mods = old;
      ((rows[a.stat + ' bei 45 %'] ||= {})[L] ||= []).push(wantPer ? (q / unit) * tierVal(a, L) / r / (a.per || 1) : (q / unit) * tierVal(a, L) / r);
    }
  }
}
// --cls: je Klasse eine Zeile. Nötig, weil „+Stärke" für eine Zauberin gewollt wenig bringt –
// der Schnitt über sechs Klassen sieht dann aus wie ein Fehler, ist aber der Entwurf.
if (perCls) {
  const FLACH = ['str', 'dex', 'int', 'con', 'lck', 'armor', 'dmg', 'haste'];
  for (const k of FLACH) {
    console.log(`\n${k}`.padEnd(14) + LV.map(l => ('St.' + l).padStart(8)).join(''));
    D.PLAYABLE.forEach((cls, i) => {
      console.log(('  ' + D.CLASSES[cls].name + (D.CLASSES[cls].main === k ? ' *' : '')).padEnd(14)
        + LV.map(L => avg(clsRows[k]?.[L]?.slice(i * REPS, (i + 1) * REPS) || [NaN]).toFixed(2).padStart(8)).join(''));
    });
  }
  process.exit(0);
}
console.log((wantPer ? 'Vorschlag per (gleich viel wie Hauptattribut/Konstitution)' : 'Bonus ÷ Hauptattribut, gleiche Stufe (Abwehr ÷ Konst.)').padEnd(44) + LV.map(l => ('St.' + l).padStart(8)).join(''));
for (const [k, byL] of Object.entries(rows)) {
  const a = D.AFFIXES.find(x => x.stat === k) || {};
  console.log(k.padEnd(44) + LV.map(L => { const r = avg(byL[L]); return (wantPer ? (1 / r).toFixed(2) : r.toFixed(2)).padStart(8); }).join(''));
}
