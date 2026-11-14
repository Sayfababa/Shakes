import { BASES, RARITIES, AFFIXES, LEGEND_NAMES } from './data.js';
import { roll, pick, weighted, uid, rand } from './rng.js';

// Erzeugt ein Item für Stufe `lvl`. luck verschiebt Seltenheiten nach oben.
export function makeItem(lvl, { luck = 0, slot, cls } = {}) {
  let pool = slot ? BASES.filter(b => b.slot === slot) : BASES;
  if (cls && rand() < 0.6) pool = pool.filter(b => b.slot !== 'weapon' || b.kind === cls.weapon) ;
  const base = pick(pool.length ? pool : BASES);
  const boost = 1 + Math.min(luck, 200) / 100;
  const rar = weighted(RARITIES.map(r => ({ ...r, w: r.id === 'normal' || r.id === 'broken' ? r.w : r.w * boost })));
  const ilvl = Math.max(1, lvl + roll(-1, 1));
  const scale = (1 + ilvl * 0.18) * rar.mult;
  const it = { id: uid(), slot: base.slot, kind: base.kind, base: base.name, rarity: rar.id, lvl: ilvl, mods: {} };
  if (base.armor) it.armor = Math.round(base.armor * scale);
  if (base.dmg) it.dmg = [Math.round(base.dmg[0] * scale), Math.round(base.dmg[1] * scale)];
  const n = Array.isArray(rar.affixes) ? roll(...rar.affixes) : rar.affixes;
  const chosen = [...AFFIXES].sort(() => rand() - 0.5).slice(0, n);
  for (const a of chosen) it.mods[a.stat] = Math.max(1, Math.round(a.per * ilvl * (0.6 + rand() * 0.8) * (rar.id === 'legendary' ? 1.5 : 1)));
  it.name = nameOf(it, base, chosen);
  it.value = Math.round((4 + ilvl * 3) * rar.mult ** 3 * (1 + n * 0.4));
  return it;
}

function nameOf(it, base, aff) {
  if (it.rarity === 'legendary') return pick(LEGEND_NAMES);
  if (it.rarity === 'broken') return 'Zerbrochene/r ' + base.name;
  if (it.rarity === 'rare') return `${pick(['Gram', 'Grab', 'Blut', 'Aschen', 'Schatten', 'Toten'])}${pick(['biss', 'wacht', 'ruf', 'hauch', 'schrei', 'last'])} (${base.name})`;
  if (it.rarity === 'magic') return [aff[0]?.pre, base.name, aff[1]?.suf].filter(Boolean).join(' ');
  return base.name;
}
