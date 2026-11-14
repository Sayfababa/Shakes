import { BASES, CLASSES, CFG, MONSTERS, ATTRS, TALENTS, TIER_LVL, RANKS, CRYPTS, DIFFICULTIES, LOCATIONS, TRADERS, INV_W, INV_H } from './data.js';
import { makeItem } from './loot.js';
import { roll, pick, rand } from './rng.js';

const KEY = 'aschenkrone_v1';
export const SAVE_VERSION = 3;
export let S = null; // aktueller Spielstand

export const now = () => Date.now();
export function load() { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d) S = migrate(d); } catch { S = null; } return S; }
export function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }
export function wipe() { try { localStorage.removeItem(KEY); } catch {} S = null; }

const baseAttrs = cls => { const a = { str: 5, dex: 5, int: 5, con: 6, lck: 3 }; a[CLASSES[cls].main] = 10; return a; };
const freshTraders = () => Object.fromEntries(Object.keys(TRADERS).map(k => [k, { rep: 0, q: 0, prog: [], shop: [], ts: 0 }]));
const baseOf = it => BASES.find(b => b.name === it.base) || { w: 1, h: 1, art: 'ring' };

function migrate(d) {
  if (d.v === 1) {
    d.attrs = baseAttrs(d.cls); d.points = CFG.startPoints + (d.lvl - 1) * CFG.attrPerLevel; delete d.bought;
    d.tal = {}; d.respecs = 0; d.crypt = { diff: 0, prog: {}, cd: 0 }; d.trophies = []; d.v = 2;
  }
  if (d.v === 2) { // v2 -> v3: Händler, Material, Raster-Inventar, Streifzüge
    d.traders = freshTraders(); d.mats = {}; d.active = null; delete d.quests; delete d.shop; delete d.shopTs;
    const items = [...d.bag, ...Object.values(d.equip).filter(Boolean)];
    for (const it of items) { const b = baseOf(it); it.w = b.w; it.h = b.h; it.art = b.art; }
    const bag = d.bag; d.bag = []; S = d; for (const it of bag) addToBag(it);
    d.v = 3;
  }
  return d.v === SAVE_VERSION ? d : null;
}

export function newChar(name, cls) {
  const c = CLASSES[cls];
  S = { v: SAVE_VERSION, name, cls, lvl: 1, xp: 0, gold: 40, attrs: baseAttrs(cls), points: CFG.startPoints, tal: {}, respecs: 0,
    crypt: { diff: 0, prog: {}, cd: 0 }, trophies: [], traders: freshTraders(), mats: {},
    equip: {}, bag: [], glut: CFG.maxGlut, glutTs: now(), active: null,
    journal: [], arenaTs: 0, honor: 0, wins: 0, deaths: 0 };
  const wb = BASES.find(b => b.kind === c.weapon);
  S.equip.weapon = { id: 'start', slot: 'weapon', kind: wb.kind, base: wb.name, art: wb.art, w: wb.w, h: wb.h, name: 'Rostige/r ' + wb.name,
    rarity: 'normal', lvl: 1, mods: {}, dmg: [...wb.dmg], value: 2 };
  save();
  return S;
}

export const xpNeed = l => Math.round(80 * l ** 1.6);

// --- Fortschritt: Punkte, Talente, Rang, Läuterung ---
export const rank = (lvl = S.lvl) => [...RANKS].reverse().find(r => lvl >= r.lvl);
export const talentPointsTotal = () => Math.max(0, S.lvl - 1);
export const talentPointsSpent = () => Object.values(S.tal).reduce((a, b) => a + b, 0);
export const talentPoints = () => talentPointsTotal() - talentPointsSpent();
export function talentState(cls, branch, tier) {
  const node = TALENTS[cls][branch].nodes[tier], r = S.tal[node.id] || 0;
  const prev = tier === 0 || (S.tal[TALENTS[cls][branch].nodes[tier - 1].id] || 0) > 0;
  const lvlOk = S.lvl >= TIER_LVL[tier];
  return { node, r, can: prev && lvlOk && r < node.max && talentPoints() > 0, locked: !prev || !lvlOk, needLvl: TIER_LVL[tier] };
}
export function learn(branch, tier) { const t = talentState(S.cls, branch, tier); if (t.can) S.tal[t.node.id] = t.r + 1; return t.can; }
export function addAttr(k) { if (S.points > 0) { S.attrs[k]++; S.points--; return true; } return false; }
export const respecCost = () => S.respecs === 0 ? 0 : S.lvl * CFG.respecPerLvl;
export function respec() {
  const c = respecCost(); if (S.gold < c) return false;
  S.gold -= c; S.respecs++; S.attrs = baseAttrs(S.cls); S.points = CFG.startPoints + (S.lvl - 1) * CFG.attrPerLevel; S.tal = {};
  return true;
}
// Alle Effekte (Klasse + Talente + Trophäen) aufsummiert
export function effects(p = S) {
  const e = { ...CLASSES[p.cls].passive };
  const add = (k, v) => e[k] = (e[k] || 0) + v;
  for (const br of TALENTS[p.cls]) for (const n of br.nodes) { const r = p.tal?.[n.id] || 0; if (r) for (const [k, v] of Object.entries(n.eff)) add(k, v * r); }
  for (const t of p.trophies || []) for (const [k, v] of Object.entries(t.eff)) add(k, v);
  return e;
}

// Abgeleitete Kampfwerte
export function stats(p = S) {
  const st = { ...p.attrs, armor: 0, dmgBonus: 0 };
  for (const it of Object.values(p.equip)) {
    if (!it) continue;
    st.armor += it.armor || 0;
    for (const [k, v] of Object.entries(it.mods)) k === 'dmg' ? st.dmgBonus += v : st[k] = (st[k] || 0) + v;
  }
  const c = CLASSES[p.cls], w = p.equip.weapon, e = effects(p);
  const base = w?.dmg || [1, 3], dm = 1 + (e.dmgPct || 0);
  return { ...e, ...st, name: p.name, cls: p.cls, lvl: p.lvl, main: c.main,
    armor: Math.round(st.armor * (1 + (e.armorPct || 0))),
    dmg: [Math.round((base[0] + st.dmgBonus) * dm), Math.round((base[1] + st.dmgBonus) * dm)],
    hp: Math.round(st.con * c.hp * (2 + p.lvl * 0.6) * (1 + (e.hpPct || 0))) };
}

// Monster skaliert auf Stufe; diff 0.8 .. 1.3
export function makeMonster(lvl, diff = 1, m = pick(MONSTERS)) {
  const a = k => Math.round((3 + lvl * 2.7) * diff * (k === 'main' ? 1.4 : 0.8 + rand() * 0.4));
  const main = pick(['str', 'dex', 'int']);
  const mo = { name: m.name, glyph: m.glyph, mat: m.mat, lvl, main, str: a(), dex: a(), int: a(), con: a(), lck: a() * 0.5, armor: Math.round(lvl * 5 * diff) };
  mo[main] = a('main');
  mo.dmg = [Math.round((2 + lvl * 1.7) * diff), Math.round((5 + lvl * 3) * diff)];
  mo.hp = Math.round(mo.con * 3.6 * (2 + lvl * 0.6));
  return mo;
}

// --- Streifzüge ---
export const locOpen = l => S.lvl >= l.lvl;
export const locLvl = l => Math.max(l.lvl, Math.min(S.lvl, l.lvl + 8));   // Gegner wachsen bis +8 über Ortsstufe mit
export function startTrip(id) {
  const l = LOCATIONS.find(x => x.id === id); if (!l || !locOpen(l) || S.glut < l.glut || S.active) return false;
  const sec = roll(...l.sec), mob = pick(l.mobs);
  S.glut -= l.glut; S.active = { loc: id, mob, diff: [0.85, 1, 1, 1.2][roll(0, 3)], end: now() + sec * 1000, sec };
  return true;
}
export function tripReward(l, diff, sec) {
  const lv = locLvl(l), f = diff * (sec / 50);
  return { gold: Math.round((6 + lv * 4) * f), xp: Math.round((20 + lv * 12) * f) };
}

// --- Händler ---
export function loyalty(id) {
  const t = TRADERS[id], st = S.traders[id]; let L = 0;
  for (let i = 1; i < t.need.length; i++) if (st.rep >= t.need[i] && S.lvl >= t.lvl[i]) L = i;
  return L;
}
export function rollShop(id) {
  const t = TRADERS[id], L = loyalty(id);
  S.traders[id].shop = Array.from({ length: CFG.shopSize }, () => {
    const it = makeItem(S.lvl + L, { luck: S.attrs.lck + L * 25, slots: t.slots, cls: CLASSES[S.cls], minRarity: Math.min(3, L + (L ? 1 : 0)) });
    it.price = Math.round(it.value * (4.5 - L * 0.4)); return it;
  });
  S.traders[id].ts = now();
}
export function shopFor(id) { const st = S.traders[id]; if (!st.shop.length || now() > st.ts + CFG.shopRefreshSec * 1000) rollShop(id); return st.shop; }

export function tickGlut() {
  const per = CFG.glutRegenMin * 60000, n = Math.floor((now() - S.glutTs) / per);
  if (n > 0) { S.glut = Math.min(CFG.maxGlut, S.glut + n); S.glutTs += n * per; }
  if (S.glut >= CFG.maxGlut) S.glutTs = now();
}

export function gainXp(x) {
  S.xp += x; let up = 0;
  while (S.xp >= xpNeed(S.lvl)) { S.xp -= xpNeed(S.lvl); S.lvl++; up++; S.points += CFG.attrPerLevel; }
  return up;
}
export function addMat(id, n = 1) { S.mats[id] = (S.mats[id] || 0) + n; }

// --- Raster-Inventar (INV_W × INV_H). Items haben x,y,w,h ---
function fits(x, y, w, h, ignore) {
  if (x < 0 || y < 0 || x + w > INV_W || y + h > INV_H) return false;
  return !S.bag.some(o => o !== ignore && x < o.x + o.w && o.x < x + w && y < o.y + o.h && o.y < y + h);
}
export function findSpot(w, h) {
  for (let x = 0; x < INV_W; x++) for (let y = 0; y < INV_H; y++) if (fits(x, y, w, h)) return { x, y };
  return null;
}
export function addToBag(it) { const p = findSpot(it.w || 1, it.h || 1); if (!p) return false; Object.assign(it, p); S.bag.push(it); return true; }
export const removeFromBag = id => { const i = S.bag.findIndex(x => x.id === id); return i < 0 ? null : S.bag.splice(i, 1)[0]; };
// Neu sortieren: große Items zuerst
export function sortBag() {
  const items = S.bag.splice(0).sort((a, b) => b.w * b.h - a.w * a.h || b.h - a.h);
  const rest = []; for (const it of items) if (!addToBag(it)) rest.push(it);
  return rest;
}

export function equip(id) {
  const it = S.bag.find(x => x.id === id); if (!it) return false;
  let slot = it.slot;
  if (slot === 'ring') slot = !S.equip.ring1 ? 'ring1' : !S.equip.ring2 ? 'ring2' : 'ring1';
  removeFromBag(id);
  const old = S.equip[slot]; S.equip[slot] = it;
  if (old && !addToBag(old)) { S.equip[slot] = old; addToBag(it); return false; }  // kein Platz: rückgängig
  return true;
}
export function unequip(slot) { const it = S.equip[slot]; if (it && addToBag(it)) S.equip[slot] = null; }
export function sell(id) { const it = removeFromBag(id); if (it) S.gold += it.value; }
export function journal(t) { S.journal.unshift({ t, ts: now() }); S.journal.length = Math.min(S.journal.length, 30); }

// --- Krypten ---
export const cryptLvl = (c, floor) => c.lvl + DIFFICULTIES[S.crypt.diff].lvlAdd + Math.floor(floor * 0.6);
export const cryptFloor = c => S.crypt.prog[c.id] || 0;           // 0..5 (5 = Boss besiegt)
export const cryptOpen = c => S.lvl >= c.lvl + DIFFICULTIES[S.crypt.diff].lvlAdd - 2;
export function cryptEnemy(c) {
  const f = cryptFloor(c), lvl = cryptLvl(c, f), boss = f === 4, d = DIFFICULTIES[S.crypt.diff];
  const m = boss ? c.boss : MONSTERS.find(x => x.name === c.floors[f]);
  const mo = makeMonster(lvl, (boss ? 1.25 : 1 + f * 0.05) * d.mult, m);
  if (boss) { mo.hp = Math.round(mo.hp * 1.8); mo.boss = true; mo.rage = 0.2; mo.crit = 0.05; }
  return mo;
}
export function cryptWin(c) {
  const f = cryptFloor(c); S.crypt.prog[c.id] = f + 1;
  const out = { bossKilled: f === 4 };
  if (out.bossKilled) {
    const key = c.id + ':' + S.crypt.diff;
    if (!S.trophies.some(t => t.key === key)) { out.trophy = { key, name: c.boss.name, diff: DIFFICULTIES[S.crypt.diff].name, eff: c.trophy }; S.trophies.push(out.trophy); }
    if (CRYPTS.every(x => cryptFloor(x) >= 5) && S.crypt.diff < DIFFICULTIES.length - 1) { S.crypt.diff++; S.crypt.prog = {}; out.diffUp = DIFFICULTIES[S.crypt.diff].name; }
  }
  return out;
}
export { ATTRS };
