import { BASES, CLASSES, CFG, MONSTERS, PLACES, QUEST_VERBS, ATTRS } from './data.js';
import { makeItem } from './loot.js';
import { roll, pick, rand } from './rng.js';

const KEY = 'aschenkrone_v1';
export const SAVE_VERSION = 1;
export let S = null; // aktueller Spielstand

export const now = () => Date.now();
export function load() { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d?.v === SAVE_VERSION) S = d; } catch {} return S; }
export function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }
export function wipe() { try { localStorage.removeItem(KEY); } catch {} S = null; }

export function newChar(name, cls) {
  const c = CLASSES[cls];
  const attrs = { str: 5, dex: 5, int: 5, con: 6, lck: 3 }; attrs[c.main] = 10;
  S = { v: SAVE_VERSION, name, cls, lvl: 1, xp: 0, gold: 40, attrs, bought: { str: 0, dex: 0, int: 0, con: 0, lck: 0 },
    equip: {}, bag: [], glut: CFG.maxGlut, glutTs: now(), quests: [], active: null, shop: [], shopTs: 0,
    journal: [], arenaTs: 0, honor: 0, wins: 0, deaths: 0 };
  const wb = BASES.find(b => b.kind === c.weapon);
  S.equip.weapon = { id: 'start', slot: 'weapon', kind: wb.kind, base: wb.name, name: 'Rostige/r ' + wb.name, rarity: 'normal', lvl: 1, mods: {}, dmg: [...wb.dmg], value: 2 };
  rollQuests(); rollShop(); save();
  return S;
}

export const xpNeed = l => Math.round(80 * l ** 1.6);
export const attrCost = k => Math.round(CFG.attrBaseCost * CFG.attrCostGrowth ** S.bought[k]);
export const equipped = () => Object.values(S.equip).filter(Boolean);

// Abgeleitete Kampfwerte des Spielers
export function stats(p = S) {
  const st = { ...p.attrs, armor: 0, dmgBonus: 0 };
  for (const it of Object.values(p.equip)) {
    if (!it) continue;
    st.armor += it.armor || 0;
    for (const [k, v] of Object.entries(it.mods)) k === 'dmg' ? st.dmgBonus += v : st[k] = (st[k] || 0) + v;
  }
  const c = CLASSES[p.cls], w = p.equip.weapon;
  const base = w?.dmg || [1, 3];
  return { ...st, name: p.name, cls: p.cls, lvl: p.lvl, main: c.main,
    dmg: [base[0] + st.dmgBonus, base[1] + st.dmgBonus], hp: Math.round(st.con * c.hp * (2 + p.lvl * 0.6)) };
}

// Monster skaliert auf Spielerstufe; diff 0.8 .. 1.3
export function makeMonster(lvl, diff = 1, m = pick(MONSTERS)) {
  const a = k => Math.round((3 + lvl * 2.2) * diff * (k === 'main' ? 1.4 : 0.8 + rand() * 0.4));
  const main = pick(['str', 'dex', 'int']);
  const mo = { name: m.name, glyph: m.glyph, lvl, main, str: a(), dex: a(), int: a(), con: a(), lck: a() * 0.5, armor: Math.round(lvl * 4 * diff) };
  mo[main] = a('main');
  mo.dmg = [Math.round((2 + lvl * 1.5) * diff), Math.round((5 + lvl * 2.6) * diff)];
  mo.hp = Math.round(mo.con * 3.6 * (2 + lvl * 0.6));
  return mo;
}

export function rollQuests() {
  S.quests = Array.from({ length: CFG.questCount }, () => {
    const diff = [0.8, 1, 1.25][roll(0, 2)];
    const m = pick(MONSTERS), sec = roll(CFG.questMinSec, CFG.questMaxSec);
    return { id: rand().toString(36).slice(2), diff, monster: m, sec, glut: Math.round(sec / 6),
      title: `${pick(QUEST_VERBS)}: ${m.name}`, place: pick(PLACES),
      gold: Math.round((5 + S.lvl * 4) * diff * (sec / 40)), xp: Math.round((20 + S.lvl * 12) * diff * (sec / 40)) };
  });
}

export function rollShop() {
  S.shop = Array.from({ length: CFG.shopSize }, () => {
    const it = makeItem(S.lvl, { luck: S.attrs.lck, cls: CLASSES[S.cls] });
    it.price = it.value * 4; return it;
  });
  S.shopTs = now();
}

export function tickGlut() {
  const per = CFG.glutRegenMin * 60000, n = Math.floor((now() - S.glutTs) / per);
  if (n > 0) { S.glut = Math.min(CFG.maxGlut, S.glut + n); S.glutTs += n * per; }
  if (S.glut >= CFG.maxGlut) S.glutTs = now();
}

export function gainXp(x) {
  S.xp += x; let up = 0;
  while (S.xp >= xpNeed(S.lvl)) { S.xp -= xpNeed(S.lvl); S.lvl++; up++; }
  return up;
}

export function addToBag(it) { if (S.bag.length >= 20) return false; S.bag.push(it); return true; }

export function equip(id) {
  const i = S.bag.findIndex(x => x.id === id); if (i < 0) return;
  const it = S.bag[i];
  let slot = it.slot;
  if (slot === 'ring') slot = !S.equip.ring1 ? 'ring1' : !S.equip.ring2 ? 'ring2' : 'ring1';
  S.bag.splice(i, 1);
  if (S.equip[slot]) S.bag.push(S.equip[slot]);
  S.equip[slot] = it;
}
export function unequip(slot) { if (S.equip[slot] && S.bag.length < 20) { S.bag.push(S.equip[slot]); S.equip[slot] = null; } }
export function sell(id) { const i = S.bag.findIndex(x => x.id === id); if (i >= 0) { S.gold += S.bag[i].value; S.bag.splice(i, 1); } }
export function journal(t) { S.journal.unshift({ t, ts: now() }); S.journal.length = Math.min(S.journal.length, 30); }
export { ATTRS };
