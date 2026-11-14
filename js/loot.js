import { BASES, RARITIES, AFFIXES, LEGEND_NAMES, CFG, TIERS, SPECIALS, SPECIAL_CHANCE, SPECIAL_MIN_LVL, UNIQUES, UNIQUE_CHANCE } from './data.js';
import { roll, pick, weighted, uid, rand } from './rng.js';

// Bonus-Stufe würfeln: hohe Stufen (I, II) erst ab bestimmter Gegenstandsstufe
export function rollTier(ilvl) { return weighted(TIERS.filter(t => ilvl >= t.minLvl)); }
// Wert eines Bonus: Grundwert × Stufe × kleine Streuung (±10 %)
export const affixValue = (a, ilvl, tier, legendary = false) =>
  Math.max(1, Math.round(a.per * (CFG.affixBase + ilvl * CFG.affixPerLvl) * tier.mult * (0.9 + rand() * 0.2) * (legendary ? 1.5 : 1)));
// Wertspanne einer Stufe (für den Tooltip: "8–10")
export const tierRange = (stat, ilvl, t) => { const a = AFFIXES.find(x => x.stat === stat), T = TIERS.find(x => x.t === t); if (!a || !T) return null;
  const b = a.per * (CFG.affixBase + ilvl * CFG.affixPerLvl) * T.mult; return [Math.max(1, Math.round(b * 0.9)), Math.max(1, Math.round(b * 1.1))]; };

// Erzeugt ein Item für Stufe `lvl`. luck verschiebt Seltenheiten nach oben.
export function makeItem(lvl, { luck = 0, slot, slots, cls, minRarity = 0 } = {}) {
  let pool = slot ? BASES.filter(b => b.slot === slot) : slots ? BASES.filter(b => slots.includes(b.slot)) : BASES;
  if (cls && rand() < 0.6) pool = pool.filter(b => b.slot !== 'weapon' || b.kind === cls.weapon);
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
  if (uniq) base = [...BASES].reverse().find(b => b.slot === uniq.slot && (!uniq.kind || b.kind === uniq.kind)) || base;
  const scale = (1 + ilvl * 0.18) * rar.mult;
  const it = { id: uid(), slot: base.slot, kind: base.kind, base: base.name, art: base.art, w: base.w, h: base.h, rarity: rar.id, lvl: ilvl, mods: {}, tiers: {} };
  if (base.armor) it.armor = Math.round(base.armor * scale);
  if (base.dmg) it.dmg = [Math.round(base.dmg[0] * scale), Math.round(base.dmg[1] * scale)];
  let chosen = [];
  if (uniq) {
    for (const [stat, t] of Object.entries(uniq.mods)) { const a = AFFIXES.find(x => x.stat === stat); const T = TIERS.find(x => x.t === t);
      it.mods[stat] = affixValue(a, ilvl, T, true); it.tiers[stat] = t; }
    it.fx = { ...uniq.eff }; it.unique = uniq.name; it.lore = uniq.lore; it.name = uniq.name;
  } else {
    const n = Array.isArray(rar.affixes) ? roll(...rar.affixes) : rar.affixes;
    chosen = [...AFFIXES].sort(() => rand() - 0.5).slice(0, n);
    for (const a of chosen) { const T = rollTier(ilvl); it.mods[a.stat] = affixValue(a, ilvl, T, rar.id === 'legendary'); it.tiers[a.stat] = T.t; }
    const sc = SPECIAL_CHANCE[rar.id] || 0;
    if (sc && ilvl >= SPECIAL_MIN_LVL && rand() < sc) { const sp = pick(SPECIALS); it.fx = { ...sp.eff }; it.special = sp.id; }
    it.name = nameOf(it, base, chosen);
  }
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
  return Math.round((4 + it.lvl * 3) * rar.mult ** 3 * (1 + Object.keys(it.mods).length * 0.4 + tierBonus) * (it.special ? 2 : 1) * (it.unique ? 3 : 1));
}

function nameOf(it, base, aff) {
  const sp = it.special ? SPECIALS.find(s => s.id === it.special) : null;
  let n;
  if (it.rarity === 'legendary') n = pick(LEGEND_NAMES);
  else if (it.rarity === 'broken') n = 'Schartige/r ' + base.name;
  else if (it.rarity === 'rare') n = `${pick(['Gram', 'Grab', 'Blut', 'Aschen', 'Schatten', 'Toten'])}${pick(['biss', 'wacht', 'ruf', 'hauch', 'schrei', 'last'])} (${base.name})`;
  else if (it.rarity === 'magic') n = [aff[0]?.pre, base.name, sp ? null : aff[1]?.suf].filter(Boolean).join(' ');
  else n = base.name;
  return sp && it.rarity !== 'rare' && it.rarity !== 'legendary' ? `${n} ${sp.name}` : n;
}
