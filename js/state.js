import { SPELLS, BOUNTIES, TRACKS, BASES, CLASSES, CFG, MONSTERS, ATTRS, TALENTS, TIER_LVL, RANKS, CRYPTS, DIFFICULTIES, LOCATIONS, TRADERS, INV_W, INV_H, GIVERS, OMENS, SERVICES, SHARD_CRYPTS, MATS } from './data.js';
import { makeItem } from './loot.js';
import { roll, pick, rand } from './rng.js';

const KEY = 'aschenkrone_v1';
export const SAVE_VERSION = 6;
export let S = null; // aktueller Spielstand

export const now = () => Date.now();
export function load() { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d) S = migrate(d); } catch { S = null; } return S; }
export function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }
export function wipe() { try { localStorage.removeItem(KEY); } catch {} S = null; }

const baseAttrs = cls => { const a = { str: 5, dex: 5, int: 5, con: 6, lck: 3 }; a[CLASSES[cls].main] = 10; return a; };
const freshGiver = () => ({ rep: 0, q: 0, prog: [], shop: [], ts: 0 });
const freshTraders = () => Object.fromEntries(GIVERS.map(k => [k, freshGiver()]));
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
  if (d.v === 3) { // v3 -> v4: neue Questgeber, Omen, Splitter, Tutorial, Titel
    for (const k of GIVERS) d.traders[k] ||= freshGiver();
    d.omen = null; d.omens = 0; d.shards = []; d.tut = 99; d.title = null; d.v = 4;
  }
  if (d.v === 4) { d.haul = null; d.v = 5;
  }
  if (d.v === 5) { d.bounty = null; d.v = 6; }
  return d.v === SAVE_VERSION ? d : null;
}

export function newChar(name, cls) {
  const c = CLASSES[cls];
  S = { v: SAVE_VERSION, name, cls, lvl: 1, xp: 0, gold: 40, attrs: baseAttrs(cls), points: CFG.startPoints, tal: {}, respecs: 0,
    crypt: { diff: 0, prog: {}, cd: 0 }, trophies: [], traders: freshTraders(), mats: {}, omen: null, omens: 0, shards: [], tut: 0, title: null, haul: null, bounty: null,
    equip: {}, bag: [], glut: CFG.maxGlut, glutTs: now(), active: null,
    journal: [], arenaTs: 0, honor: 0, wins: 0, deaths: 0 };
  const wb = BASES.find(b => b.kind === c.weapon);
  S.equip.weapon = { id: 'start', slot: 'weapon', kind: wb.kind, base: wb.name, art: wb.art, w: wb.w, h: wb.h, name: 'Rostige/r ' + wb.name,
    rarity: 'normal', lvl: 1, mods: {}, dmg: [...wb.dmg], value: 2 };
  save();
  return S;
}

export const xpNeed = l => Math.round(CFG.xpBase * l ** CFG.xpExp);

// --- Fortschritt: Punkte, Talente, Rang, Läuterung ---
export const rank = (lvl = S.lvl) => { const r = [...RANKS].reverse().find(r => lvl >= r.lvl); return S?.title ? { ...r, title: S.title } : r; };
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
    spells: SPELLS[p.cls].filter(s => p.lvl >= s.lvl), amp: 1 + st.int / (st.int + CFG.spellK),
    armor: Math.round((st.armor + st.str * CFG.strArmor) * (1 + (e.armorPct || 0))),
    dmg: [Math.round((base[0] + st.dmgBonus) * dm), Math.round((base[1] + st.dmgBonus) * dm)],
    hp: Math.round(st.con * c.hp * (CFG.hpBase + p.lvl * CFG.hpPerLvl) * (1 + (e.hpPct || 0))) };
}

// Monster skaliert auf Stufe; diff 0.8 .. 1.3
export function makeMonster(lvl, diff = 1, m = pick(MONSTERS)) {
  const a = k => Math.round((3 + lvl * 2.7) * diff * (k === 'main' ? 1.4 : 0.8 + rand() * 0.4));
  const main = pick(['str', 'dex', 'int']);
  const mo = { name: m.name, glyph: m.glyph, mat: m.mat, lvl, main, str: a(), dex: a(), int: a(), con: a(), lck: a() * 0.5, armor: Math.round(lvl * 5 * diff) };
  mo[main] = a('main');
  mo.dmg = [Math.round((2 + lvl * 1.7) * diff * CFG.monDmg), Math.round((5 + lvl * 3) * diff * CFG.monDmg)];
  mo.hp = Math.round(mo.con * 3.6 * (CFG.hpBase + lvl * CFG.hpPerLvl) * CFG.monHp);
  return mo;
}

// --- Kampfkraft: eine Zahl für "wie stark bin ich" (erwarteter Schaden × Haltbarkeit gegen einen Gegner deiner Stufe) ---
// Ohne Zufall, damit Vergleiche (Item, Attributpunkt) stabil sind.
export function power(A = stats()) {
  const L = A.lvl, en = 3 + L * 2.7, eArmor = L * 5, eDmg = ((2 + L * 1.7) + (5 + L * 3)) / 2 * (1 + en * 1.4 / CFG.mainDiv);
  const red = Math.min(0.6, eArmor / (eArmor + 20 + L * 8)) * (1 - Math.min(0.9, A.pen || 0));
  const hit = 1 - Math.min(0.5, en / (en + A.dex * 3 + 40));
  const crit = Math.min(0.6, CFG.critBase + A.lck / (A.lck + 100 + L * 5) + (A.crit || 0));
  const strike = (A.dmg[0] + A.dmg[1]) / 2 * (1 + A[A.main] / CFG.mainDiv);
  let dpt = strike * (1 - red) * hit * (1 + crit * (1 + (A.bleed || 0))) * (1 + (A.rage || 0) * 0.3 + (A.execute || 0) * 0.2 + (A.poison || 0));
  let heal = (A.regen || 0) * A.hp + dpt * (A.leech || 0);
  for (const s of A.spells || []) {
    const sd = strike * A.amp * (1 - red) * hit;
    const v = s.kind === 'multi' ? sd * s.mult * s.hits : s.kind === 'dot' ? sd * s.mult * 3 : s.kind === 'buff' ? dpt * s.v * 2
      : s.kind === 'heal' || s.kind === 'shield' ? 0 : sd * s.mult * (s.kind === 'mark' ? 1.4 : s.kind === 'stun' ? 1.5 : 1);
    dpt += (v - dpt) / s.every;
    if (s.kind === 'heal' || s.kind === 'shield') heal += A.hp * s.pct * A.amp / s.every;
  }
  const taken = eDmg * (1 - Math.min(0.6, A.armor / (A.armor + 20 + L * 8))) * (1 - Math.min(0.5, A.dex / (A.dex + en * 3 + 40) + (A.evade || 0))) * (1 - Math.min(0.5, A.block || 0));
  const ehp = A.hp / (taken * Math.max(0.3, 1 - heal * 0.6 / Math.max(1, taken))) * eDmg;   // Leben, umgerechnet in "wie viele Gegner-Hiebe halte ich aus"
  return Math.round(Math.sqrt(Math.max(1, dpt) * ehp) * 20);
}
// Kampfkraft, wenn ein Item angelegt wäre (Ringe: ersetzt den schwächeren bzw. freien Platz)
export function powerWith(it) {
  let slot = it.slot;
  if (slot === 'ring') {
    if (!S.equip.ring1 || !S.equip.ring2) slot = !S.equip.ring1 ? 'ring1' : 'ring2';
    else slot = powerSwap('ring1', it) >= powerSwap('ring2', it) ? 'ring1' : 'ring2';
  }
  return { now: power(), then: powerSwap(slot, it), old: S.equip[slot] || null, slot, st: stats({ ...S, equip: { ...S.equip, [slot]: it } }) };
}
const powerSwap = (slot, it) => power(stats({ ...S, equip: { ...S.equip, [slot]: it } }));
// Was bringt ein Attributpunkt?
export const powerAttr = k => power(stats({ ...S, attrs: { ...S.attrs, [k]: S.attrs[k] + 1 } })) - power();

// --- Streifzüge ---
export const locOpen = l => S.lvl >= l.lvl;
// Gegner wachsen nur halb so schnell wie du mit (max. +8 über Ortsstufe) – ein Stufenaufstieg ohne verteilte Punkte darf nicht tödlich sein
export const locLvl = l => Math.max(l.lvl, Math.min(l.lvl + Math.floor((S.lvl - l.lvl) / 2), l.lvl + 8));
export function startTrip(id, track = 'norm') {
  const l = LOCATIONS.find(x => x.id === id), tr = TRACKS.find(t => t.id === track) || TRACKS[1];
  if (!l || !locOpen(l) || S.glut < l.glut || S.active) return false;
  if (S.haul) bankHaul();                          // ungesicherte Beute wird beim Aufbruch gesichert
  const sec = roll(...l.sec), mob = pick(l.mobs);
  S.glut -= l.glut; S.active = { loc: id, mob, track: tr.id, diff: tr.diff * [0.92, 1, 1, 1.08][roll(0, 3)], end: now() + sec * 1000, sec };
  return true;
}
// --- Ungesicherte Beute (Tiefer gehen) ---
export function haulAdd(gold, mats, item, xp = 0) {
  S.haul.gold += gold; S.haul.xp = (S.haul.xp || 0) + xp; for (const [k, n] of mats) S.haul.mats[k] = (S.haul.mats[k] || 0) + n; if (item) S.haul.items.push(item);
}
export function bankHaul() {
  const h = S.haul; if (!h) return null; S.haul = null;
  S.gold += h.gold; for (const [k, n] of Object.entries(h.mats)) addMat(k, n);
  const up = gainXp(h.xp || 0);
  const sold = []; for (const it of h.items) if (!addToBag(it)) { S.gold += it.value; sold.push(it); }
  return { ...h, sold, up };
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
    const it = makeItem(S.lvl + L, { luck: S.attrs.lck + L * 25, slots: t.slots, cls: CLASSES[S.cls], minRarity: Math.min(3, L) });
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
  const before = S.bag.map(it => [it, it.x, it.y]);
  const items = S.bag.splice(0).sort((a, b) => b.w * b.h - a.w * a.h || b.h - a.h);
  const rest = []; for (const it of items) if (!addToBag(it)) rest.push(it);
  if (rest.length) { S.bag = before.map(([it, x, y]) => Object.assign(it, { x, y })); return false; }   // passt neu sortiert nicht: alte Ordnung behalten, nichts verlieren
  return true;
}

export function equip(id) {
  const it = S.bag.find(x => x.id === id); if (!it) return false;
  let slot = it.slot;
  if (slot === 'ring') slot = powerWith(it).slot;
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
export const cryptOpen = c => S.lvl >= c.lvl + DIFFICULTIES[S.crypt.diff].lvlAdd - 2 && (S.shards.length >= (c.shards || 0));
export function cryptEnemy(c) {
  const f = cryptFloor(c), lvl = cryptLvl(c, f), boss = f === 4, d = DIFFICULTIES[S.crypt.diff];
  const m = boss ? c.boss : MONSTERS.find(x => x.name === c.floors[f]);
  const mo = makeMonster(lvl, (boss ? CFG.bossDiff : 1 + f * 0.05) * d.mult, m);
  if (boss) {
    mo.hp = Math.round(mo.hp * CFG.bossHp); mo.boss = true; mo.rage = 0.2; mo.crit = 0.05;
    // Jeder Boss hat ein eigenes Muster statt nur größerer Zahlen
    const { mirror, ...mech } = c.boss.mech || {};
    Object.assign(mo, mech);
    if (mirror) { const me = effects(); for (const k of ['crit', 'evade', 'block', 'leech', 'bleed', 'rage', 'pen', 'regen', 'thorns', 'execute']) if (me[k]) mo[k] = me[k]; }
  }
  return mo;
}
export function cryptWin(c) {
  const f = cryptFloor(c); S.crypt.prog[c.id] = f + 1;
  const out = { bossKilled: f === 4 };
  if (out.bossKilled) {
    const key = c.id + ':' + S.crypt.diff;
    if (SHARD_CRYPTS.includes(c.id) && !S.shards.includes(c.id)) { S.shards.push(c.id); out.shard = S.shards.length; }
    if (!S.trophies.some(t => t.key === key)) { out.trophy = { key, name: c.boss.name, diff: DIFFICULTIES[S.crypt.diff].name, eff: c.trophy }; S.trophies.push(out.trophy); }
    if (CRYPTS.every(x => cryptFloor(x) >= 5) && S.crypt.diff < DIFFICULTIES.length - 1) { S.crypt.diff++; S.crypt.prog = {}; out.diffUp = DIFFICULTIES[S.crypt.diff].name; }
  }
  return out;
}

// --- Tägliches Omen ---
const dayNo = () => { const t = Date.now(); return Math.floor((t - new Date(t).getTimezoneOffset() * 60000) / 86400000); };
export function omen() {
  const day = dayNo();
  if (!S.omen || S.omen.day !== day) {
    const open = LOCATIONS.filter(locOpen), h = (day * 2654435761) >>> 0;
    S.omen = { day, loc: open[h % open.length].id, type: OMENS[(h >>> 8) % OMENS.length].id, done: false };
  }
  return { ...S.omen, def: OMENS.find(o => o.id === S.omen.type), place: LOCATIONS.find(l => l.id === S.omen.loc) };
}
// Erster Sieg am Omen-Ort heute -> erfüllt. Gibt den Omen-Effekt zurück (oder null).
// Während des Tutorials (und bis Stufe 3) keine Omen-Effekte – Neulinge sollen nicht an einem Elite-Gegner hängen bleiben.
export function omenFor(locId) { if (S.lvl < 3) return null; const o = omen(); return o.loc === locId ? o : null; }
export function fulfillOmen() { if (!S.omen.done) { S.omen.done = true; S.omens++; return true; } return false; }

// Wird dieses Material gerade für einen offenen Auftrag gebraucht? (Warnung bei Diensten)
let questNeedsMat = () => false;
export const setQuestMatCheck = f => { questNeedsMat = f; };

// --- Eilen: kostet mit Restzeit und Stufe ---
export const rushCost = () => !S.active ? 0 : Math.max(1, Math.ceil(Math.max(0, S.active.end - now()) / 20000) * Math.ceil(1 + S.lvl / CFG.rushPerLvl));

// --- Steckbriefe (täglich 3, deterministisch aus dem Datum) ---
export function bounties() {
  const day = dayNo();
  if (!S.bounty || S.bounty.day !== day) {
    const open = LOCATIONS.filter(locOpen), mobs = [...new Set(open.flatMap(l => l.mobs))];
    let h = Math.imul(day, 2246822519) >>> 0; const next = m => { h = (Math.imul(h, 1103515245) + 12345) >>> 0; return (h >>> 8) % m; };
    const types = BOUNTIES.filter(b => b.id !== 'arena' || S.lvl >= 3).slice();
    const pickT = []; while (pickT.length < 3 && types.length) pickT.push(types.splice(next(types.length), 1)[0]);   // ohne Wiederholung, endet sicher
    S.bounty = { day, list: pickT.map(t => ({ id: t.id, target: t.id === 'kill' ? mobs[next(mobs.length)] : null, n: t.n, prog: 0, claimed: false })) };
  }
  return S.bounty.list;
}
export function bountyEvent(ev) {
  if (!S.bounty) return;
  for (const b of bounties()) {
    if (b.claimed || b.prog >= b.n) continue;
    const hit = (b.id === 'kill' && ev.type === 'kill' && ev.mob === b.target) || (b.id === 'blood' && ev.type === 'trip' && ev.track === 'blood')
      || (b.id === 'deep' && ev.type === 'bank' && ev.depth >= 2) || (b.id === 'crypt' && ev.type === 'crypt') || (b.id === 'arena' && ev.type === 'arena');
    if (hit) b.prog++;
  }
}
export const bountyReward = () => ({ gold: 40 + S.lvl * 20, xp: Math.round(xpNeed(S.lvl) * 0.12) });
export function claimBounty(i) {
  const b = bounties()[i]; if (!b || b.claimed || b.prog < b.n) return null;
  b.claimed = true; const r = bountyReward(); S.gold += r.gold; const up = gainXp(r.xp);
  const mat = pick(Object.keys(MATS)); addMat(mat, 2);
  const t = pick(Object.keys(TRADERS)); S.traders[t].rep += 25;
  return { ...r, up, mat, trader: t };
}

// --- Dienste (Schärfen, Verstärken, Bestellen, Neu weihen) ---
const costOf = (sv, step) => sv.cost[Math.min(step, sv.cost.length - 1)];
const goldOf = (sv, step) => (sv.gold[Math.min(step, sv.gold.length - 1)] || 0) + (sv.perLvl || 0) * S.lvl;
export function serviceState(sv) {
  const it = sv.slot ? S.equip[sv.slot] : null, step = sv.max ? (it?.up || 0) : 0;
  const cost = costOf(sv, step), gold = goldOf(sv, step);
  const costText = [...Object.entries(cost).map(([k, n]) => `${n}× ${MATS[k]}`), `${gold} Gold`].join(', ');
  let reason = '';
  if (sv.slot && !it) reason = 'Nichts angelegt';
  else if (sv.max && step >= sv.max) reason = 'Vollendet';
  else if (sv.id === 'reroll' && !Object.keys(it.mods).length) reason = 'Keine Zauber';
  const enough = S.gold >= gold && Object.entries(cost).every(([k, n]) => (S.mats[k] || 0) >= n);
  return { it, step, costText, reason, can: !reason && enough, questMat: Object.keys(cost).find(k => questNeedsMat(k)) };
}
export function doService(tid, svId) {
  const sv = SERVICES[tid].find(x => x.id === svId), st = serviceState(sv); if (!st.can) return null;
  const cost = costOf(sv, st.step); S.gold -= goldOf(sv, st.step); for (const [k, n] of Object.entries(cost)) S.mats[k] -= n;
  const it = st.it;
  if (sv.id === 'sharpen') { it.dmg = it.dmg.map(v => Math.round(v * (1 + sv.per)) + 1); }
  if (sv.id === 'reinforce') { it.armor = Math.round(it.armor * (1 + sv.per)) + 1; }
  if (sv.max) { it.up = (it.up || 0) + 1; it.value = Math.round(it.value * 1.3); return it; }
  if (sv.id === 'reroll') {
    const fresh = makeItem(it.lvl, { slot: it.slot, minRarity: ['broken', 'normal', 'magic', 'rare', 'legendary'].indexOf(it.rarity), luck: S.attrs.lck });
    it.mods = fresh.mods; return it;
  }
  if (sv.id === 'gamble') {
    const g = makeItem(S.lvl, { luck: S.attrs.lck, minRarity: 2 });   // meist magisch, selten mehr – wie das Glücksspiel in D2
    if (!addToBag(g)) { S.gold += goldOf(sv, 0); return null; }
    return g;
  }
  if (sv.id === 'order') {
    const w = makeItem(S.lvl + 1, { slot: 'weapon', cls: { weapon: CLASSES[S.cls].weapon }, minRarity: 2, luck: 40 });
    if (w.kind !== CLASSES[S.cls].weapon) { const b = BASES.filter(x => x.kind === CLASSES[S.cls].weapon).pop(); Object.assign(w, { kind: b.kind, base: b.name, art: b.art, w: b.w, h: b.h, dmg: b.dmg.map(v => Math.round(v * (1 + S.lvl * 0.2))) }); }
    if (!addToBag(w)) { S.gold += goldOf(sv, 0); for (const [k, n] of Object.entries(cost)) S.mats[k] += n; return null; }
    return w;
  }
  return it;
}
export { ATTRS };
