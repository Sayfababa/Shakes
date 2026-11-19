import { GENUS, CRAFT, BASES, RARITIES, AFFIXES, LEGEND_NAMES, CFG, TIERS, SPECIALS, SPECIAL_CHANCE, SPECIAL_MIN_LVL, UNIQUES, UNIQUE_CHANCE, SETS } from './data.js';
import { roll, pick, weighted, uid, rand } from './rng.js';

// Welche Boni kann dieses Teil tragen? Grundboni überall, Kampf-Boni nur auf passenden Plätzen, Zauber-Boni nur auf der Waffe der Klasse
export const affixPool = it => AFFIXES.filter(a => (!a.slots || a.slots.includes(it.slot)) && (!a.kind || a.kind === it.kind));
// Bonus-Stufe würfeln: hohe Stufen (I, II) erst ab bestimmter Gegenstandsstufe
export function rollTier(ilvl) { return weighted(TIERS.filter(t => ilvl >= t.minLvl)); }
// Wert eines Bonus: Grundwert × Stufe × kleine Streuung (±10 %)
export const affixScale = (a, ilvl) => a.pct ? CFG.pctBase + ilvl * CFG.pctPerLvl : CFG.affixBase + ilvl * CFG.affixPerLvl;
export const affixValue = (a, ilvl, tier, legendary = false) =>
  Math.max(1, Math.round(a.per * affixScale(a, ilvl) * tier.mult * (0.9 + rand() * 0.2) * (legendary ? 1.5 : 1)));
// Wertspanne einer Stufe (für den Tooltip: "8–10")
export const tierRange = (stat, ilvl, t) => { const a = AFFIXES.find(x => x.stat === stat), T = TIERS.find(x => x.t === t); if (!a || !T) return null;
  const b = a.per * affixScale(a, ilvl) * T.mult; return [Math.max(1, Math.round(b * 0.9)), Math.max(1, Math.round(b * 1.1))]; };

// Angezeigte Bonus-Stufe aus dem Wert (Besitzer: „V muss auf jedem Teil gleich sein“). Feste Schwellen je Bonus, geeicht auf
// Gegenstandsstufe CFG.tierRefLvl: dort zeigt jeder Wert genau die gewürfelte Stufe; tiefer rutscht sie ab, höher steigt sie.
// Schwelle zwischen zwei Stufen = Mitte der Lücke (schwächster Wurf der besseren, ±10 % Streuung, gegen stärksten der schlechteren).
// Gespeichert bleibt die gewürfelte Stufe (it.tiers) – sie zählt nur noch für den Preis, nie für die Anzeige.
export function tierOf(stat, v) {
  const a = AFFIXES.find(x => x.stat === stat); if (!a || !(v > 0)) return null;
  const b = a.per * affixScale(a, CFG.tierRefLvl);
  for (let i = 0; i < TIERS.length - 1; i++) if (v >= b * (TIERS[i].mult * 0.9 + TIERS[i + 1].mult * 1.1) / 2) return TIERS[i].t;
  return TIERS[TIERS.length - 1].t;
}

// Erzeugt ein Item für Stufe `lvl`. luck verschiebt Seltenheiten nach oben.
export function makeItem(lvl, { luck = 0, slot, slots, cls, kind, minRarity = 0 } = {}) {
  const okLvl = b => !b.minLvl || lvl >= b.minLvl;   // höhere Grundgegenstände erst ab ihrer Stufe
  let pool = (slot ? BASES.filter(b => b.slot === slot) : slots ? BASES.filter(b => slots.includes(b.slot)) : BASES).filter(okLvl);
  if (cls && rand() < 0.6) pool = pool.filter(b => b.slot !== 'weapon' || b.kind === cls.weapon);
  if (kind) pool = pool.filter(b => b.kind === kind);   // feste Waffenart (Bestellung beim Schmied)
  let base = pick(pool.length ? pool : BASES);
  const boost = 1 + Math.min(luck, 200) / 100;
  // Seltenes/Legendäres erst ab bestimmter Gegenstandsstufe (wie Stufen-Anforderungen bei Uniques)
  const gate = r => r.id === 'legendary' ? (lvl >= CFG.legendaryMinLvl ? 1 : 0) : r.id === 'rare' ? (lvl >= CFG.rareMinLvl ? 1 : 0.15) : 1;
  let ws = RARITIES.map((r, i) => ({ ...r, w: i < minRarity ? 0 : (r.id === 'normal' || r.id === 'broken' ? r.w : r.w * boost) * gate(r) }));
  if (!ws.some(r => r.w > 0)) ws = RARITIES.map((r, i) => ({ ...r, w: i === Math.min(minRarity, 3) ? 1 : 0 }));   // Mindest-Seltenheit gewinnt
  const rar = weighted(ws);
  const ilvl = Math.max(1, lvl + roll(-1, 1));
  // Einzigartige: feste Basis, feste Boni und Sonderbonus
  const uniq = rar.id === 'legendary' && rand() < UNIQUE_CHANCE ? pickUnique(pool) : null;
  if (uniq) base = [...BASES].reverse().find(b => b.slot === uniq.slot && (!uniq.kind || b.kind === uniq.kind) && okLvl(b)) || base;
  const scale = (1 + ilvl * 0.18) * rar.mult;
  const it = { id: uid(), slot: base.slot, kind: base.kind, base: base.name, art: artOf(base, rar), w: base.w, h: base.h, rarity: rar.id, lvl: ilvl, mods: {}, tiers: {} };
  if (base.armor) it.armor = Math.round(base.armor * scale);
  if (base.dmg) it.dmg = [Math.round(base.dmg[0] * scale), Math.round(base.dmg[1] * scale)];
  let chosen = [];
  if (uniq) {
    for (const [stat, t] of Object.entries(uniq.mods)) { const a = AFFIXES.find(x => x.stat === stat); const T = TIERS.find(x => x.t === t);
      it.mods[stat] = affixValue(a, ilvl, T, true); it.tiers[stat] = t; }
    it.fx = { ...uniq.eff }; it.unique = uniq.name; it.lore = uniq.lore; it.name = uniq.name;
  } else {
    const n = Array.isArray(rar.affixes) ? roll(...rar.affixes) : rar.affixes;
    chosen = affixPool(it).sort(() => rand() - 0.5).slice(0, n);
    for (const a of chosen) { const T = rollTier(ilvl); it.mods[a.stat] = affixValue(a, ilvl, T, rar.id === 'legendary'); it.tiers[a.stat] = T.t; }
    const sc = SPECIAL_CHANCE[rar.id] || 0;
    if (sc && ilvl >= SPECIAL_MIN_LVL && rand() < sc) { const sp = pick(SPECIALS); it.fx = { ...sp.eff }; it.special = sp.id; }
    it.name = nameOf(it, base, chosen);
  }
  // Platzhalter-Wurf: hier wurde früher die Schmiedeglut gewürfelt. Er wirkt auf nichts, hält aber die feste Würfelfolge der
  // Balance-Tests (sets.mjs, uniques.mjs) gleich – die würfeln ihre Ausrüstung nur EINMAL; ohne ihn kippen sie allein durch eine
  // andere Ausrüstung (Tracht +60 statt +20). Befund → E „Schmiedeglut raus, Verkauf gibt Material“. Erst entfernen, wenn
  // diese Tests über mehrere Ausrüstungswürfe mitteln.
  if (['magic', 'rare', 'legendary'].includes(rar.id) && !it.unique) roll(0, 6);
  it.value = itemValue(it, rar);
  return it;
}

// Bild-Variante: gewöhnliche meist das Grundbild, seltene/legendäre meist eine der prächtigeren Varianten
function artOf(base, rar) {
  const v = base.vars || []; if (!v.length) return base.art;
  const fancy = ['rare', 'legendary', 'set'].includes(rar.id) ? 0.8 : rar.id === 'magic' ? 0.5 : 0.25;
  return rand() < fancy ? pick(v) : base.art;
}

// Grab-Set-Teil: feste Basis, fester Name, zwei feste Boni. Fällt nur beim Boss seiner Krypta (game.js).
export function makeSetItem(setId, part, lvl) {
  const set = SETS.find(x => x.id === setId), p = set?.parts[part]; if (!p) return null;
  const okLvl = b => !b.minLvl || lvl >= b.minLvl;
  const base = [...BASES].reverse().find(b => b.slot === p.slot && okLvl(b)) || BASES.find(b => b.slot === p.slot);
  const rar = RARITIES.find(r => r.id === 'set'), ilvl = Math.max(1, lvl), scale = (1 + ilvl * 0.18) * rar.mult;
  const it = { id: uid(), slot: base.slot, kind: base.kind, base: base.name, art: artOf(base, rar), w: base.w, h: base.h,
    rarity: 'set', lvl: ilvl, mods: {}, tiers: {}, set: set.id, part, name: p.name };
  if (base.armor) it.armor = Math.round(base.armor * scale);
  if (base.dmg) it.dmg = [Math.round(base.dmg[0] * scale), Math.round(base.dmg[1] * scale)];
  for (const [stat, t] of Object.entries(p.mods)) { const a = AFFIXES.find(x => x.stat === stat), T = TIERS.find(x => x.t === t);
    it.mods[stat] = affixValue(a, ilvl, T); it.tiers[stat] = t; }
  it.value = itemValue(it, rar);
  return it;
}

function pickUnique(pool) {
  // nur Einzigartige, deren Basis im erlaubten Pool liegt (Platz, Klassenwaffe)
  const ok = UNIQUES.filter(u => pool.some(b => b.slot === u.slot && (!u.kind || b.kind === u.kind)));
  return ok.length ? pick(ok) : null;
}

// Wert: Seltenheit, Anzahl und Stufe der Boni, Sonderbonus und Einzigartige zählen
export function itemValue(it, rar = RARITIES.find(r => r.id === it.rarity)) {
  const tierBonus = Object.values(it.tiers || {}).reduce((s, t) => s + (6 - t) * 0.25, 0);
  return Math.round((4 + it.lvl * 3) * rar.mult ** 3 * (1 + Object.keys(it.mods).length * 0.4 + tierBonus) * (it.special ? 2 : 1) * (it.unique ? 3 : 1) * (it.set ? 2 : 1));
}

// Eigenschaftswort an das Geschlecht des Grundgegenstands anpassen: „Starker“ + Kappe → „Starke Kappe“
const END = { f: 'e', n: 'es', p: 'e' };
export const adj = (pre, base) => { if (!pre) return pre; const g = Object.keys(END).find(k => GENUS[k].includes(base)); return g ? pre.replace(/er$/, END[g]) : pre; };
// Namen alter Spielstände richten („Rostige/r Beil“, „Starker Kappe“)
export function fixName(it) { if (!it?.name) return; if (it.rarity === 'magic') renameMagic(it); it.name = it.name.replace(/^(Rostig|Schartig)e\/r (.+)$/, (_, a, b) => adj(a + 'er', b) + ' ' + b); }
export const renameMagic = it => { if (it.rarity !== 'magic') return; const st = Object.keys(it.tiers || {}); const aff = st.map(k => AFFIXES.find(a => a.stat === k)).filter(Boolean);
  const sp = it.special ? SPECIALS.find(s => s.id === it.special) : null;
  it.name = [adj(aff[0]?.pre, it.base), it.base, sp ? null : aff[1]?.suf].filter(Boolean).join(' ') + (sp ? ' ' + sp.name : ''); };
function nameOf(it, base, aff) {
  const sp = it.special ? SPECIALS.find(s => s.id === it.special) : null;
  let n;
  if (it.rarity === 'legendary') n = pick(LEGEND_NAMES);
  else if (it.rarity === 'broken') n = adj('Schartiger', base.name) + ' ' + base.name;
  else if (it.rarity === 'rare') n = `${pick(['Gram', 'Grab', 'Blut', 'Aschen', 'Schatten', 'Toten'])}${pick(['biss', 'wacht', 'ruf', 'hauch', 'schrei', 'last'])} (${base.name})`;
  else if (it.rarity === 'magic') n = [adj(aff[0]?.pre, base.name), base.name, sp ? null : aff[1]?.suf].filter(Boolean).join(' ');
  else n = base.name;
  return sp && it.rarity !== 'rare' && it.rarity !== 'legendary' ? `${n} ${sp.name}` : n;
}
