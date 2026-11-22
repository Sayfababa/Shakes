import { GENUS, CRAFT, BASES, RARITIES, AFFIXES, LEGEND_NAMES, CFG, TIERS, SPECIALS, SPECIAL_CHANCE, SPECIAL_MIN_LVL, UNIQUES, UNIQUE_CHANCE, SETS } from './data.js';
import { roll, pick, weighted, uid, rand } from './rng.js';

// Welche Boni kann dieses Teil tragen? Nur auf passenden Plätzen (`slots`), Zauber-Boni nur auf der Waffe der Klasse
export const affixPool = it => AFFIXES.filter(a => (!a.slots || a.slots.includes(it.slot)) && (!a.kind || a.kind === it.kind));
const affOf = k => AFFIXES.find(a => a.stat === k);
const groupOf = a => a.group || a.stat;
// Bonus-Stufe würfeln: hohe Stufen erst ab bestimmter Gegenstandsstufe (TIERS.minLvl)
export function rollTier(ilvl) { return weighted(TIERS.filter(t => ilvl >= t.minLvl)); }
// Beste Stufe, die diese Gegenstandsstufe freischaltet (Einzigartige/Sets: ihre Stufe wird darauf gekürzt)
export const topTier = ilvl => TIERS.find(t => ilvl >= t.minLvl)?.t ?? TIERS[TIERS.length - 1].t;
// Fester Wertebereich eines Bonus auf Stufe t (Welle 1a, PoE-Art): TIERS.flat/pct × per, ganzzahlig. Von V aufwärts
// beginnt jede Stufe über der vorigen – zwei Stufen teilen nie einen Wert, darum liest tierOf die Stufe eindeutig ab.
const bands = {};
export function tierBand(stat, t) {
  const a = typeof stat === 'string' ? affOf(stat) : stat; if (!a) return null;
  if (!bands[a.stat]) { let below = 0; bands[a.stat] = {};
    for (const T of [...TIERS].reverse()) { const [lo, hi] = a.pct ? T.pct : T.flat, l = Math.max(below + 1, Math.round(a.per * lo));
      bands[a.stat][T.t] = [l, below = Math.max(l, Math.round(a.per * hi))]; } }
  return bands[a.stat][typeof t === 'object' ? t.t : t] || null;
}
// Wert eines Bonus: gleichverteilt im festen Bereich seiner Stufe
export const affixValue = (a, t) => { const [lo, hi] = tierBand(a, t); return lo + Math.floor(rand() * (hi - lo + 1)); };
// Angezeigte Stufe aus dem Wert: die beste Stufe, deren Bereich der Wert erreicht (Bereiche überlappen nicht)
export function tierOf(stat, v) {
  const a = affOf(stat); if (!a || !(v > 0)) return null;
  for (const T of TIERS) if (v >= tierBand(a, T.t)[0]) return T.t;
  return TIERS[TIERS.length - 1].t;
}
// Einen Bonus aus dem Freien würfeln, nach Gewicht (AFFIXES.w, Standard 1) – Beute und Umschmieden
export const pickAffix = room => weighted(room.map(a => ({ a, w: a.w ?? 1 }))).a;
// Präfix/Suffix-Plätze eines Teils: aus der Seltenheit (RARITIES.sides), gekürzt auf das, was der Platz hergibt (eine je
// Gruppe). Fehlt eine Seite (Stiefel: kein Angriff), rücken ihre Plätze auf die andere – das Teil bleibt gleich voll.
export function sideLimits(it, rarity = it.rarity) {
  const r = RARITIES.find(x => x.id === rarity); if (!r?.sides) return { pre: 0, suf: 0 };
  const pool = affixPool(it), can = s => new Set(pool.filter(a => a.side === s).map(groupOf)).size;
  const cp = can('pre'), cs = can('suf'), n = r.sides[0] + r.sides[1];
  let pre = Math.min(r.sides[0], cp); const suf = Math.min(n - pre, cs); pre = Math.min(cp, n - suf);
  return { pre, suf };
}
// Was darf zu den vorhandenen Boni noch dazu? Bonus neu, Gruppe frei, seine Seite nicht voll. Gilt für Beute, Umschmieden, Fusion.
export function affixRoom(it, have = Object.keys(it.mods || {}), rarity = it.rarity) {
  const lim = sideLimits(it, rarity), used = { pre: 0, suf: 0 }, groups = new Set();
  for (const a of have.map(affOf).filter(Boolean)) { used[a.side]++; groups.add(groupOf(a)); }
  return affixPool(it).filter(a => !have.includes(a.stat) && !groups.has(groupOf(a)) && used[a.side] < lim[a.side]);
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
  const scale = lvlScale(ilvl) * rar.mult;
  const it = { id: uid(), slot: base.slot, kind: base.kind, base: base.name, art: artOf(base, rar), w: base.w, h: base.h, rarity: rar.id, lvl: ilvl, mods: {}, tiers: {} };
  if (base.armor) it.armor = Math.round(base.armor * scale);
  if (base.dmg) it.dmg = [Math.round(base.dmg[0] * scale), Math.round(base.dmg[1] * scale)];
  let chosen = [];
  if (uniq) {
    fixedMods(it, uniq.mods, ilvl, CFG.uniqTierUp, CFG.uniqMult);
    it.fx = { ...uniq.eff }; it.unique = uniq.name; it.lore = uniq.lore; it.name = uniq.name;
  } else {
    for (let room = affixRoom(it); room.length; room = affixRoom(it)) {
      const a = pickAffix(room), T = rollTier(ilvl); it.mods[a.stat] = affixValue(a, T); it.tiers[a.stat] = T.t; chosen.push(a); }
    const sc = SPECIAL_CHANCE[rar.id] || 0;
    if (sc && ilvl >= SPECIAL_MIN_LVL && rand() < sc) { const sp = pick(SPECIALS); it.fx = { ...sp.eff }; it.special = sp.id; }
    it.name = nameOf(it, base, chosen);
  }
  it.value = itemValue(it, rar);
  return it;
}

// Grundwerte (Rüstung, Waffenschaden) wachsen mit der Gegenstandsstufe
export const lvlScale = ilvl => 1 + ilvl * 0.18;
// Wirksamer Waffen-Grundschaden (Welle 2a): wirkt höchstens wie Gegenstandsstufe Heldenstufe + CFG.wpnLvlAdd.
// Gibt das Paar zurück, das im Kampf zählt; der Tooltip zeigt beides (keine stille Kürzung). Ohne Kürzung: it.dmg selbst.
export const wpnCapLvl = heroLvl => heroLvl + CFG.wpnLvlAdd;
export function wpnDmg(it, heroLvl) {
  const cap = wpnCapLvl(heroLvl); if (!it?.dmg || !(it.lvl > cap)) return it?.dmg;
  const f = lvlScale(cap) / lvlScale(it.lvl); return it.dmg.map(v => Math.max(1, Math.round(v * f)));
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
  const rar = RARITIES.find(r => r.id === 'set'), ilvl = Math.max(1, lvl), scale = lvlScale(ilvl) * rar.mult;
  const it = { id: uid(), slot: base.slot, kind: base.kind, base: base.name, art: artOf(base, rar), w: base.w, h: base.h,
    rarity: 'set', lvl: ilvl, mods: {}, tiers: {}, set: set.id, part, name: p.name };
  if (base.armor) it.armor = Math.round(base.armor * scale);
  if (base.dmg) it.dmg = [Math.round(base.dmg[0] * scale), Math.round(base.dmg[1] * scale)];
  fixedMods(it, p.mods, ilvl, CFG.uniqTierUp);
  it.value = itemValue(it, rar);
  return it;
}

// Feste Boni (Einzigartige, Sets): ihre Stufe, aber höchstens `up` Stufen über dem, was die Gegenstandsstufe freischaltet –
// sonst wäre ein früh gefundenes Stück stärker als alles Gewürfelte. Einzigartige und Set-Teile dürfen eine Stufe darüber (CFG.uniqTierUp).
// `mult`: Einzigartige behalten den alten Legendär-Zuschlag (CFG.uniqMult) – sie haben weniger Boni als ein seltenes Teil.
export function fixedMods(it, mods, ilvl, up = 0, mult = 1) {
  for (const [stat, t] of Object.entries(mods)) { const a = affOf(stat); if (!a) continue;
    const T = Math.max(t, topTier(ilvl) - up, 1); it.mods[stat] = Math.round(affixValue(a, T) * mult); it.tiers[stat] = T; }
}

function pickUnique(pool) {
  // nur Einzigartige, deren Basis im erlaubten Pool liegt (Platz, Klassenwaffe)
  const ok = UNIQUES.filter(u => pool.some(b => b.slot === u.slot && (!u.kind || b.kind === u.kind)));
  return ok.length ? pick(ok) : null;
}

// Wert: Seltenheit, Anzahl und Stufe der Boni, Sonderbonus und Einzigartige zählen
export function itemValue(it, rar = RARITIES.find(r => r.id === it.rarity)) {
  const tierBonus = Object.values(it.tiers || {}).reduce((s, t) => s + (6 - t) * 0.2, 0);   // 0,2: feste Stufen würfeln öfter hoch (Welle 1a), Wert bleibt im alten Mittel
  return Math.round((4 + it.lvl * 3) * rar.mult ** 3 * (1 + Object.keys(it.mods).length * 0.4 + tierBonus) * (it.special ? 2 : 1) * (it.unique ? 3 : 1) * (it.set ? 2 : 1));
}

// Eigenschaftswort an das Geschlecht des Grundgegenstands anpassen: „Starker“ + Kappe → „Starke Kappe“
const END = { f: 'e', n: 'es', p: 'e' };
export const adj = (pre, base) => { if (!pre) return pre; const g = Object.keys(END).find(k => GENUS[k].includes(base)); return g ? pre.replace(/er$/, END[g]) : pre; };
// Namen alter Spielstände richten („Rostige/r Beil“, „Starker Kappe“)
export function fixName(it) { if (!it?.name) return; if (it.rarity === 'magic') renameMagic(it); it.name = it.name.replace(/^(Rostig|Schartig)e\/r (.+)$/, (_, a, b) => adj(a + 'er', b) + ' ' + b); }
// Magischer Name: Eigenschaftswort vom ersten Präfix, Anhang vom ersten Suffix („Starke Kappe des Ochsen“)
const magicName = (aff, base, sp) => [adj(aff.find(a => a.side === 'pre')?.pre, base), base, sp ? null : aff.find(a => a.side === 'suf')?.suf].filter(Boolean).join(' ');
export const renameMagic = it => { if (it.rarity !== 'magic') return; const aff = Object.keys(it.tiers || {}).map(affOf).filter(Boolean);
  const sp = it.special ? SPECIALS.find(s => s.id === it.special) : null;
  it.name = magicName(aff, it.base, sp) + (sp ? ' ' + sp.name : ''); };
function nameOf(it, base, aff) {
  const sp = it.special ? SPECIALS.find(s => s.id === it.special) : null;
  let n;
  if (it.rarity === 'legendary') n = pick(LEGEND_NAMES);
  else if (it.rarity === 'broken') n = adj('Schartiger', base.name) + ' ' + base.name;
  else if (it.rarity === 'rare') n = `${pick(['Gram', 'Grab', 'Blut', 'Aschen', 'Schatten', 'Toten'])}${pick(['biss', 'wacht', 'ruf', 'hauch', 'schrei', 'last'])} (${base.name})`;
  else if (it.rarity === 'magic') n = magicName(aff, base.name, sp);
  else n = base.name;
  return sp && it.rarity !== 'rare' && it.rarity !== 'legendary' ? `${n} ${sp.name}` : n;
}
