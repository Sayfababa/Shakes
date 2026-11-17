import { RARITIES, TREE, SETS, SET, ACTS, ACT, CRYPT, DESCENT, PIT_RIVALS, SPELL_TREE, TREE_LVL, CAPS, AFFIXES, TIERS, CRAFT, RUNES, FORGE, SPELLS, BOUNTIES, TRACKS, BASES, CLASSES, CFG, MONSTERS, ATTRS, TALENTS, TIER_LVL, RANKS, CRYPTS, DIFFICULTIES, LOCATIONS, TRADERS, INV_W, INV_H, STASH_W, STASH_H, GIVERS, OMENS, SERVICES, SHARD_CRYPTS, MATS, POTIONS, HERBS, ALCH } from './data.js';
import { affixPool, makeItem, itemValue, rollTier, affixValue, renameMagic, adj, fixName } from './loot.js';
import { roll, pick, rand } from './rng.js';

const KEY = 'aschenkrone_v1';
export const SAVE_VERSION = 21;
export let S = null; // aktueller Spielstand

export const now = () => Date.now();
// Siegel gegen Bearbeiten: Prüfsumme über den Spielstand. Wer die Datei von Hand ändert, wird dauerhaft als
// "verändert" markiert (für späteren Handel gesperrt). Kein echter Schutz ohne Server – aber kein stilles Schummeln.
const SIG = KEY + '_sig';
export function sealOf(txt) { let h = 0x811c9dc5; const t = 'aschenkrone|' + txt; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); }
// Lässt sich ein Spielstand nicht lesen (kaputt, oder alter Code aus dem Offline-Speicher trifft einen neueren Stand), wird er
// als Sicherung abgelegt, bevor ein neuer Held ihn überschreiben kann. Fehlt der Stand, wird eine lesbare Sicherung zurückgeholt.
const BAK = KEY + '_bak';
export let unreadable = false;
const read = raw => { try { const d = JSON.parse(raw); return d ? migrate(d) : null; } catch { return null; } };
export function load() {
  S = null; unreadable = false; let raw = null;
  try { raw = localStorage.getItem(KEY); const sig = localStorage.getItem(SIG);
    S = raw ? read(raw) : null; if (S && sig && sig !== sealOf(raw)) S.tampered = true;
    if (raw && !S) { localStorage.setItem(BAK, raw); unreadable = true; }
    if (!raw) { const bak = localStorage.getItem(BAK); S = bak ? read(bak) : null; if (S) { localStorage.removeItem(BAK); save(); } }
  } catch { S = null; }
  return S;
}
export function save() { try { const txt = JSON.stringify(S); localStorage.setItem(KEY, txt); localStorage.setItem(SIG, sealOf(txt)); } catch {} }
export function wipe() { try { localStorage.removeItem(KEY); localStorage.removeItem(SIG); } catch {} S = null; }

const baseAttrs = cls => { const a = { str: 5, dex: 5, int: 5, con: 6, lck: 3 }; a[CLASSES[cls].main] = 10; return a; };
const freshGiver = () => ({ rep: 0, q: 0, prog: [], shop: [], ts: 0 });
export const freshPit = (title = null) => ({ lad: [...PIT_RIVALS.map(r => r.id), 'me'], best: PIT_RIVALS.length + 1, foes: {}, ranks: [], titles: title ? [title] : [], ts: 0, week: null, buys: 0, shop: {}, ch: null });
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
  if (d.v === 6) { d.sp = {}; d.v = 7; }   // Zauber-Wege
  if (d.v === 7) { d.belt = [null, null, null]; d.herbs = {}; d.pots = {}; d.potDay = today(); d.v = 8; }   // Alchemie
  if (d.v === 8) { d.exp = null; d.v = 9; }   // Expedition
  if (d.v === 9) {   // Expedition mit Weg: alte Ausrichtung → Stationen
    if (d.exp) { const t = { beute: 'ruin', kraeuter: 'herb', material: 'mats' }[d.exp.focus] || 'herb', n = { 1: 1, 2: 2, 4: 3, 8: 4 }[d.exp.h] || 1;
      d.exp = { loc: d.exp.loc, h: d.exp.h, start: d.exp.start, end: d.exp.end, nodes: Array.from({ length: n }, () => ({ t, x: 0.5 })), goal: 'Ziel' }; }
    d.bless = 0; d.v = 10; }
  if (d.v === 10) { d.desc = null; d.descDay = null; d.v = 11; }   // Der Abstieg
  if (d.v === 11) { d.pit = freshPit(d.title); d.v = 12; }   // Grube als Rangleiter
  if (d.v === 12) {   // Akte statt Orte, Krypten nur Boss mit Stufen; ungesicherte Beute wird gesichert
    if (d.haul) { const h = d.haul; d.gold += h.gold || 0; for (const [k, n] of Object.entries(h.mats || {})) d.mats[k] = (d.mats[k] || 0) + n; const S0 = S; S = d; for (const it of h.items || []) addToBag(it); S = S0; }
    d.haul = null; d.active = null; d.acts = { prog: {} };
    const won = c => (d.trophies || []).some(t => t.key.startsWith(c + ':'));
    d.crypt = { diff: 0, prog: Object.fromEntries(CRYPTS.filter(c => won(c.id)).map(c => [c.id, 1])), cd: 0 };
    ACTS.forEach((a, i) => { if (d.lvl >= ACT.doneAt[i] || (a.crypt && won(a.crypt))) d.acts.prog[a.id] = ACT.zones + 1; });
    for (let i = ACTS.length - 1; i > 0; i--) if (d.acts.prog[ACTS[i].id]) for (let j = 0; j < i; j++) d.acts.prog[ACTS[j].id] = ACT.zones + 1;
    d.v = 13; }
  if (d.v === 13) { d.wander = null; d.v = 14; }   // Umherziehen
  if (d.v === 14) {   // Steckbriefe und Omen folgen den Akten: alte Zettel umschreiben, Omen an gesperrtem Ort neu ziehen
    for (const b of d.bounty?.list || []) { if (b.id === 'blood') b.id = 'elite'; if (b.id === 'deep') Object.assign(b, { id: 'zones', n: BOUNTIES.find(x => x.id === 'zones').n, prog: 0 }); }
    if (d.omen && !d.omen.done) d.omen = null;
    d.v = 15; }
  if (d.v === 15) {   // Gegenstandsnamen mit richtigem Geschlecht
    for (const it of [...d.bag, ...Object.values(d.equip), ...Object.values(d.traders).flatMap(t => t.shop || []), ...(d.desc?.sack.items || []), ...Object.values(d.pit?.shop || {}).flat().map(w => w.item)]) fixName(it);
    d.v = 16; }
  if (d.v === 16) {   // Schärfen/Verstärken gehören dem Platz, nicht mehr dem Teil: Stufe wandert auf den Platz, das Teil bekommt seine Grundwerte zurück
    d.temper = {};
    for (const it of [...d.bag, ...Object.values(d.equip)]) { if (!it?.up) continue;
      const sv = TEMPER[it.slot]; if (sv) { d.temper[it.slot] = Math.max(d.temper[it.slot] || 0, it.up);
        for (let i = 0; i < it.up; i++) { if (it.dmg) it.dmg = it.dmg.map(v => Math.max(1, Math.round((v - 1) / (1 + sv.per)))); if (it.armor) it.armor = Math.max(1, Math.round((it.armor - 1) / (1 + sv.per))); }
        it.value = Math.max(1, Math.round(it.value / 1.3 ** it.up)); }
      delete it.up; }
    d.v = 17; }
  if (d.v === 17) {   // Das Brett löst den alten Baum ab: Klassen mit TREE bekommen ihre Talentpunkte zurück,
    // weil die alten Knoten-IDs dort nicht mehr vorkommen. Punkte zählt talentPoints() aus S.tal, also reicht Leeren.
    if (TREE[d.cls]) d.tal = {};
    d.v = 18; }
  d.name = cleanName(d.name);
  // v19: Grabsiegel statt Tageszaehler. Der volle Vorrat zum Start, damit niemand
  // nach dem Aufspielen vor einem leeren Abgrund steht.
  if (d.v === 18) { d.seals = { day: today(), n: DESCENT.sealMax }; d.descDay = null; d.v = 19; }
  // v20: Lager. Der Beutel ist von 10x4 auf 10x6 gewachsen – alte Plaetze (y 0..3) bleiben gueltig.
  if (d.v === 19) { d.stash = []; d.v = 20; }
  // v21: Die Zauberin hat jetzt ein Brett. Wie bei v17 gibt es keine Umrechnung alter Knoten –
  // die IDs des alten Baums kommen auf dem Brett nicht vor. Leeren reicht, talentPoints() zählt
  // die Punkte aus S.tal, sie kommen also von selbst zurück. Die Pruefung laeuft ueber die IDs,
  // nicht ueber eine Klassenliste – damit gilt sie auch fuer die naechste Klasse, die aufs Brett kommt.
  if (d.v === 20) {
    const T = TREE[d.cls];
    if (T) { const ids = new Set([...T.cols.flatMap(c => c.nodes.map(n => n.id)), ...(T.bridges || []).map(b => b.id)]);
      if (Object.keys(d.tal || {}).some(k => !ids.has(k))) d.tal = {}; }
    d.v = 21; }
  return d.v === SAVE_VERSION ? d : null;
}

// Name nur als reiner Text (landet im HTML, später auch bei anderen Spielern: Schmiedezeichen, Handel)
export const cleanName = n => String(n ?? '').replace(/[<>&"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16) || 'Namenloser';
export function newChar(name, cls) {
  name = cleanName(name); const c = CLASSES[cls];
  S = { v: SAVE_VERSION, name, cls, lvl: 1, xp: 0, gold: 40, attrs: baseAttrs(cls), points: CFG.startPoints, tal: {}, sp: {}, temper: {}, respecs: 0,
    crypt: { diff: 0, prog: {}, cd: 0 }, trophies: [], traders: freshTraders(), mats: {}, omen: null, omens: 0, shards: [], tut: 0, title: null, haul: null, bounty: null,
    equip: {}, bag: [], glut: CFG.maxGlut, glutTs: now(), active: null,
    journal: [], arenaTs: 0, honor: 0, wins: 0, deaths: 0, belt: [null, null, null], herbs: {}, pots: {}, potDay: today(), herbBuy: { day: today(), n: 0 }, exp: null, bless: 0, desc: null, stash: [], seals: { day: today(), n: DESCENT.sealMax }, pit: freshPit(), acts: { prog: {} }, wander: null };
  const wb = BASES.find(b => b.kind === c.weapon);
  S.equip.weapon = { id: 'start', slot: 'weapon', kind: wb.kind, base: wb.name, art: wb.art, w: wb.w, h: wb.h, name: adj('Rostiger', wb.name) + ' ' + wb.name,
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
  const node = TALENTS[cls][branch]?.nodes[tier]; if (!node) return { node: null, r: 0, can: false, locked: true, needLvl: 99 };
  const r = S.tal[node.id] || 0;
  const prev = tier === 0 || (S.tal[TALENTS[cls][branch].nodes[tier - 1].id] || 0) > 0;
  const lvlOk = S.lvl >= TIER_LVL[tier];
  return { node, r, can: prev && lvlOk && r < node.max && talentPoints() > 0, locked: !prev || !lvlOk, needLvl: TIER_LVL[tier] };
}
export function learn(branch, tier) { const t = talentState(S.cls, branch, tier); if (t.can) S.tal[t.node.id] = t.r + 1; return t.can; }
// --- Das Brett (neuer Talentbaum, Klassen mit Eintrag in TREE) ---
// Ein Knoten ist offen, wenn der darunter voll ist – oder eine voll ausgebaute Brücke daneben endet.
// Dadurch kann man in den Nachbarzweig wechseln, zahlt den Umweg aber mit Punkten.
export const treeOf = (cls = S.cls) => TREE[cls] || null;
export const nodeRank = (id, p = S) => p.tal?.[id] || 0;
const nodeFull = (n, p = S) => nodeRank(n.id, p) >= n.max;
export function bridgeState(bi, p = S) {
  const T = treeOf(p.cls); const b = T?.bridges[bi]; if (!b) return null;
  const r = nodeRank(b.id, p);
  const open = nodeFull(T.cols[b.a].nodes[b.row - 1], p) || nodeFull(T.cols[b.b].nodes[b.row - 1], p);
  return { b, r, full: r >= b.max, open, can: open && r < b.max && talentPoints() > 0 };
}
export function nodeState(col, row, p = S) {
  const T = treeOf(p.cls); const n = T?.cols[col]?.nodes[row]; if (!n) return null;
  const r = nodeRank(n.id, p);
  const viaBridge = (T.bridges || []).some((b, i) => b.row === row && (b.a === col || b.b === col) && bridgeState(i, p)?.full);
  const open = row === 0 || nodeFull(T.cols[col].nodes[row - 1], p) || viaBridge;
  return { node: n, r, full: r >= n.max, open, can: open && r < n.max && talentPoints() > 0 };
}
export function learnNode(col, row) { const t = nodeState(col, row); if (!t?.can) return false; S.tal[t.node.id] = t.r + 1; return true; }
export function learnBridge(bi) { const t = bridgeState(bi); if (!t?.can) return false; S.tal[t.b.id] = t.r + 1; return true; }
export const treeRanks = (cls = S.cls) => { const T = treeOf(cls); if (!T) return 0;
  return T.cols.reduce((a, c) => a + c.nodes.reduce((x, n) => x + n.max, 0), 0) + (T.bridges || []).reduce((a, b) => a + b.max, 0); };

export function addAttr(k) { if (S.points > 0) { S.attrs[k]++; S.points--; return true; } return false; }
export const respecCost = () => S.respecs === 0 ? 0 : S.lvl * CFG.respecPerLvl;
export function respec() {
  const c = respecCost(); if (S.gold < c) return false;
  S.gold -= c; S.respecs++; S.attrs = baseAttrs(S.cls); S.points = CFG.startPoints + (S.lvl - 1) * CFG.attrPerLevel; S.tal = {};
  return true;
}
// Alle Effekte (Klasse + Talente + Trophäen) aufsummiert
// Wie viele verschiedene Teile eines Grab-Sets sind angelegt?
export function setCount(id, p = S) { const seen = new Set(); for (const it of Object.values(p.equip || {})) if (it?.set === id) seen.add(it.part); return seen.size; }
// Welche Teile eines Sets besitzt der Held schon (angelegt oder im Beutel)?
export const setOwned = (id, p = S) => new Set([...Object.values(p.equip || {}), ...(p.bag || [])].filter(it => it?.set === id).map(it => it.part));
export const setsWorn = (p = S) => SETS.map(set => ({ set, n: setCount(set.id, p) })).filter(x => x.n > 0);
export function effects(p = S) {
  const e = { ...CLASSES[p.cls].passive };
  const add = (k, v) => e[k] = (e[k] || 0) + v;
  const T = TREE[p.cls];   // Klassen mit Brett nutzen dieses, alle anderen weiter den alten Baum
  if (T) { for (const c of T.cols) for (const n of c.nodes) { const r = p.tal?.[n.id] || 0; if (r) for (const [k, v] of Object.entries(n.eff)) add(k, v * r); }
    for (const b of T.bridges || []) { const r = p.tal?.[b.id] || 0; if (r) for (const [k, v] of Object.entries(b.eff)) add(k, v * r); } }
  else for (const br of TALENTS[p.cls]) for (const n of br.nodes) { const r = p.tal?.[n.id] || 0; if (r) for (const [k, v] of Object.entries(n.eff)) add(k, v * r); }
  for (const t of p.trophies || []) for (const [k, v] of Object.entries(t.eff)) add(k, v);
  for (const it of Object.values(p.equip || {})) if (it?.fx) for (const [k, v] of Object.entries(it.fx)) add(k, v);   // Sonderboni und Einzigartige
  for (const set of SETS) { const n = setCount(set.id, p);   // Grab-Sets: 2 Teile = Bonus, 3 Teile = Regeländerung
    if (n >= 2) for (const [k, v] of Object.entries(set.b2)) add(k, v);
    if (n >= SET.parts) for (const [k, v] of Object.entries(set.b3)) add(k, v); }
  return e;
}

// --- Zauber-Wege: je Zauber 3 Stufen, je Stufe 1 von 2 Wegen ---
export const wayOpen = (sp, t, lvl = S.lvl) => lvl >= Math.max(sp.lvl, TREE_LVL[t]);
export const wayCost = () => S.lvl * CFG.wayCostPerLvl;
// Offene, noch nicht gewählte Stufen (für Hinweis-Punkte)
export const waysPending = (sid) => SPELLS[S.cls].filter(sp => !sid || sp.id === sid).reduce((n, sp) => n + (SPELL_TREE[sp.id] || []).filter((_, t) => wayOpen(sp, t) && S.sp?.[sp.id]?.[t] == null).length, 0);          // Umentscheiden kostet Gold, erste Wahl gratis
export function chooseWay(sid, t, i) {
  const sp = SPELLS[S.cls].find(x => x.id === sid), opts = SPELL_TREE[sid]?.[t];
  if (!sp || !opts?.[i] || !wayOpen(sp, t)) return 'Noch nicht offen.';
  const cur = S.sp[sid]?.[t]; if (cur === i) return null;
  const cost = cur == null ? 0 : wayCost(); if (S.gold < cost) return 'Zu wenig Gold.';
  S.gold -= cost; (S.sp[sid] ||= [null, null, null])[t] = i; return null;
}
// Gewählte Wege als Bausteine `m` an den Zauber hängen (Zahlen addieren, Objekte übernehmen)
function withWays(s, p) {
  const ch = p.sp?.[s.id] || [], m = {}, wn = {}, names = [];
  (SPELL_TREE[s.id] || []).forEach((opts, t) => { const o = opts[ch[t]]; if (!o || !wayOpen(s, t, p.lvl)) return; names.push(o.name);
    for (const [k, v] of Object.entries(o.m)) { m[k] = typeof v === 'number' ? (m[k] || 0) + v : v; wn[k] = o.name; } });
  if (!names.length) return s;
  const w = { ...s, m, wn, ways: names };
  if (m.every) w.every = Math.max(2, s.every + m.every);
  if (m.mult) w.boost = (s.boost || 1) * (1 + m.mult);
  if (m.hits) w.hits = s.hits + m.hits;
  if (m.max) w.max = (s.max || 0) + m.max;
  return w;
}

// Aufwertung am Platz (Schärfen = Waffe, Verstärken = Brust): gilt für jedes Teil, das dort angelegt wird
const TEMPER = Object.fromEntries(Object.values(SERVICES).flat().filter(sv => sv.max).map(sv => [sv.slot, sv]));
export const slotUp = (slot, p = S) => p?.temper?.[slot] || 0;
export function tempered(v, slot, p = S) { const sv = TEMPER[slot]; if (!sv || !v) return v; for (let i = slotUp(slot, p); i > 0; i--) v = Math.round(v * (1 + sv.per)) + 1; return v; }
// Abgeleitete Kampfwerte
const cap = (base = 0, add, max) => Math.max(base, Math.min(max, base + add));
export function stats(p = S) {
  const st = { ...p.attrs, armor: 0, dmgBonus: 0 };
  for (const it of Object.values(p.equip)) {
    if (!it) continue;
    st.armor += tempered(it.armor || 0, it.slot, p);
    for (const [k, v] of Object.entries(it.mods)) k === 'dmg' ? st.dmgBonus += v : st[k] = (st[k] || 0) + v;
  }
  const c = CLASSES[p.cls], w = p.equip.weapon, e = effects(p);
  const fit = !w || w.kind === c.weapon;          // Klassenwaffe? Fremde Waffen schwächen Hieb und Zauber
  const P = k => (st[k] || 0) / 100;              // Prozent-Boni von Items (critc, dmgp, …)
  const base = w ? w.dmg.map(v => tempered(v, 'weapon', p)) : [1, 3], dm = (1 + (e.dmgPct || 0) + P('dmgp')) * (fit ? 1 : CFG.offWeapon);
  return { ...e, ...st, name: p.name, cls: p.cls, lvl: p.lvl, main: c.main,
    spells: SPELLS[p.cls].filter(s => p.lvl >= s.lvl).map(s => withWays({ ...s, boost: 1 + P('sk_' + s.id) }, p)),
    amp: (1 + st.int / (st.int + CFG.spellK)) * (1 + P('spellp') + (e.spellPct || 0)) * (fit ? 1 : CFG.offWeaponSpell), offWeapon: !fit,
    // Item-Prozente stapeln nur bis zur Obergrenze; was Klasse/Talente schon geben, wird nie gekürzt
    crit: cap(e.crit, P('critc'), CAPS.crit), critMult: cap(2 + (e.critDmg || 0), P('critd'), CAPS.critMult),
    pen: cap(e.pen, P('penp'), CAPS.pen), leech: cap(e.leech, P('leechp'), CAPS.leech),
    evade: cap(e.evade, P('evadep'), CAPS.evade + (e.evadeCap || 0)), block: cap(e.block, P('blockp'), CAPS.block), thorns: cap(e.thorns, P('thornsp'), CAPS.thorns),
    haste: (e.haste || 0) + (st.haste || 0) / 100,
    armor: Math.round((st.armor + st.str * CFG.strArmor) * (1 + (e.armorPct || 0))),
    dmg: [Math.round((base[0] + st.dmgBonus) * dm), Math.round((base[1] + st.dmgBonus) * dm)],
    hp: Math.round(st.con * c.hp * (CFG.hpBase + p.lvl * CFG.hpPerLvl) * (1 + (e.hpPct || 0) + P('lifep'))) };
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
  // Gegner streuen im Geschick (gemessen: etwa 0,7× bis 1,3× um en). Mit einem einzigen Vertreter
  // landete die Schätzung auf Stufe 20 genau auf der Ausweich-Grenze: ein Geschick-Bonus sah doppelt
  // so gut aus wie im Kampf, weil der eine Vertreter über die Kante sprang. Über die Streuung
  // gemittelt verschwindet die Kante – im Spiel wäscht die Monstervielfalt sie ebenso aus.
  const spread = f => (f(en * 0.72) + f(en) + f(en * 1.28)) / 3;
  const hit = 1 - spread(e => Math.min(0.5, e / (e + A.dex * 3 + 40)));
  const myEvade = spread(e => Math.min(0.5 + (A.evadeCap || 0), A.dex / (A.dex + e * 3 + 40) + (A.evade || 0)));   // eigenes Ausweichen inkl. angehobener Grenze
  // Ausbluten: keine Krits mehr, dafür blutet jeder Treffer (unten in onHit eingerechnet)
  const crit = A.hemorrhage ? 0 : Math.min(0.6, CFG.critBase + A.lck / (A.lck + 100 + L * 5) + (A.crit || 0));
  const strike = (A.dmg[0] + A.dmg[1]) / 2 * (1 + A[A.main] / CFG.mainDiv);
  // Bluten: sonst nur bei Krit, mit Ausbluten bei jedem Treffer (0,2 + eigener Bonus), dafür ohne Krit-Schaden
  const bleedT = A.hemorrhage ? (CFG.hemoBleed + (A.bleed || 0)) * 2.2 : crit * (A.bleed || 0);
  const onHit = (1 + crit * ((A.critMult || 2) - 1) + bleedT) * (1 + (A.execute || 0) * (0.2 + (A.execHp || 0)) + (A.poison || 0));   // gilt für Hieb und Zauber
  let dpt = strike * (1 - red) * hit * onHit * (1 + (A.rage || 0) * 0.3);
  // Einzigartige, die eine Regel ändern (grobe Schätzung; die echten Werte misst tests/uniques.mjs)
  dpt *= 1 + (A.vengeance || 0) * 0.35;        // Vergeltung: im Schnitt etwa ein Drittel Leben fehlt
  dpt *= 1 + (A.zeal || 0) / 3;                // Eifer: jeder dritte Hieb trifft zweimal
  let heal = (A.regen || 0) * A.hp * (A.lastStand ? 1.15 : 1) + (A.siphon || 0) * A.hp * crit * 0.6, takenF = 1, vulnF = 1;
  const stunner = (A.spells || []).some(s => s.kind === 'stun' || s.m?.stun), dotter = (A.spells || []).some(s => s.kind === 'dot' || s.m?.poison);
  for (const s of A.spells || []) {
    const m = s.m || {}, cm = (A.critMult || 2) - 1;
    const sd = strike * A.amp * (1 - red) * hit * onHit;
    const b = s.boost || 1;   // Zauber-Bonus von der Waffe und Wege (mult)
    let v = b * (s.kind === 'multi' ? sd * s.mult * s.hits : s.kind === 'dot' ? sd * s.mult * 3 : s.kind === 'buff' ? dpt * s.v * 2
      : s.kind === 'heal' || s.kind === 'shield' ? 0 : sd * s.mult * (s.kind === 'mark' ? 1.4 : s.kind === 'stun' ? 1.5 : 1));
    // Zauber-Wege (Schätzung gegen einen Gegner deiner Stufe; die echten Werte prüft tests/ways.mjs)
    if (m.strike) v += sd * m.strike;
    const raw = v;
    if (m.crit) v *= 1 + Math.min(m.crit, 0.6 + m.crit - crit) * cm / (1 + crit * cm);
    if (m.dazedCrit && stunner) v *= 1 + 0.35 * cm;
    if (m.pierce && s.kind !== 'buff') v *= (1 - red * (1 - Math.min(1, m.pierce))) / (1 - red);
    if (m.execute) v *= 1 + m.execute * 0.2;
    if (m.burn) v += raw * m.burn.v * m.burn.n;
    if (m.bleed) v += raw * m.bleed * 3;
    if (m.poison) v += raw * m.poison * 3;
    if (m.detonate && dotter) v += sd * 0.35 * m.detonate;
    if (m.fresh) v *= 1 + m.fresh * 0.35;
    if (m.dotStack && s.kind === 'dot') v *= 1.6;
    let ev = s.every / (1 + (A.haste || 0)); if (m.open) ev *= 0.82; if (m.desperate) ev *= 1 - m.desperate * 0.3;
    // Verbrennung: jeder Zauber brennt nach. Der Brand stapelt NICHT – der naechste Zauber ueberschreibt ihn,
    // also tickt er hoechstens bis zum naechsten Wurf. Dazu ein Drittel Abzug fuer Ticks, die am toten Gegner verfallen.
    // Ohne diese Deckel schaetzte power() den Schluesselstein auf +75 %, gemessen sind es +11,6 Punkte Siegchance.
    if (A.ignite && !['heal', 'shield', 'buff'].includes(s.kind)) v += raw * A.ignite * Math.min(CFG.igniteTurns, ev) * 0.65;
    dpt += (v * (1 + (A.echo || 0)) - dpt) / ev;
    if (m.buff) dpt *= 1 + m.buff * 1.5 / ev;
    if (s.kind === 'heal' || s.kind === 'shield') heal += A.hp * s.pct * A.amp * b * (m.overshield ? 1.15 : 1) / ev;
    if (m.lifesteal) heal += v * m.lifesteal / ev;
    if (m.shieldGain) heal += v * m.shieldGain / ev;
    if (m.healPct) heal += A.hp * m.healPct * A.amp / ev;
    if (m.poisonLeech) heal += sd * s.mult * b * m.poisonLeech;
    if (m.vuln) vulnF *= 1 + m.vuln.v * Math.min(1, m.vuln.n / ev);
    if (m.weaken) takenF *= 1 - m.weaken.v * Math.min(1, m.weaken.n / ev);
    if (m.stun) takenF *= 1 - m.stun / ev;
    if (m.stunTurns > 1) takenF *= 1 - 0.4 * (m.stunTurns - 1) / ev;
    if (m.noheal || m.cleanse || m.stunImmune) takenF *= 0.985;   // Antworten auf Boss-Mechaniken: im Schnitt wenig, gegen den passenden Boss viel
  }
  dpt *= vulnF;
  heal += dpt * (A.leech || 0) * (A.lastStand ? 1.15 : 1);   // Lebensraub aus Hieben und Zaubern (Set: unter halbem Leben doppelt)
  if (A.venom) heal += dpt * (A.poison || 0) * A.venom * 2;
  if (A.tollback) takenF *= 0.97;   // betäubte Gegner schlagen seltener – gegen die Glocke viel mehr
  if (A.shred) dpt *= 1 + A.shred * 0.8;       // gebrochene Rüstung wirkt den Rest des Kampfs
  if (A.bulwark) heal += A.hp * A.bulwark * Math.min(0.5, A.block || 0);
  if (A.secondWind) heal += A.hp * A.secondWind * 0.1;
  if (A.nohealSelf) heal = 0;
  if (A.firstEcho) dpt *= 1.04;
  const taken = eDmg * (1 - Math.min(0.6, A.armor / (A.armor + 20 + L * 8))) * (1 - myEvade) * (1 - Math.min(0.5, A.block || 0)) * takenF;
  dpt += taken * (A.thorns || 0);   // Dornen: Teil jedes erlittenen Treffers geht zurück
  const ehp = A.hp * (1 + (A.ward || 0)) * (A.lastBreath ? 1.12 : 1) / (taken * Math.max(0.3, 1 - heal * 0.6 / Math.max(1, taken))) * eDmg;   // Leben, umgerechnet in "wie viele Gegner-Hiebe halte ich aus"
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
  if (!l || !locOpen(l) || S.glut < l.glut || S.active || S.exp || S.desc) return false;
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
  const kept = S.traders[id].shop.filter(x => x.lock);   // gesperrte Ware bleibt liegen
  S.traders[id].shop = kept.concat(Array.from({ length: CFG.shopSize - kept.length }, () => {
    const it = makeItem(S.lvl + L, { luck: S.attrs.lck + L * 25, slots: t.slots, cls: CLASSES[S.cls], minRarity: Math.min(3, L) });
    it.price = Math.round(it.value * (4.5 - L * 0.4)); return it;
  }));
  S.traders[id].ts = now();
}
// Ein Stück je Händler zurücklegen: überlebt neue Ware und Auftragsabgabe
export function lockShop(id, itemId) {
  const shop = S.traders[id]?.shop || [], it = shop.find(x => x.id === itemId); if (!it) return false;
  const was = !!it.lock; for (const x of shop) delete x.lock; if (!was) it.lock = true; save(); return true;
}
export function shopFor(id) { const st = S.traders[id]; if (!st.shop.some(x => !x.lock) || now() > st.ts + CFG.shopRefreshSec * 1000) rollShop(id); return st.shop; }

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

// --- Raster-Inventar. Items haben x,y,w,h. Beutel und Lager sind dasselbe Raster mit
// eigenen Maßen – deshalb nimmt die Logik das Behältnis als Argument statt S.bag fest zu
// verdrahten. `grid('bag')` / `grid('stash')` ist die einzige Stelle, die das weiß.
export const grid = (k = 'bag') => k === 'stash'
  ? { list: S.stash || (S.stash = []), w: STASH_W, h: STASH_H }
  : { list: S.bag, w: INV_W, h: INV_H };
function fitsIn(g, x, y, w, h, ignore) {
  if (x < 0 || y < 0 || x + w > g.w || y + h > g.h) return false;
  return !g.list.some(o => o !== ignore && x < o.x + o.w && o.x < x + w && y < o.y + o.h && o.y < y + h);
}
export function findSpotIn(g, w, h) {
  for (let x = 0; x < g.w; x++) for (let y = 0; y < g.h; y++) if (fitsIn(g, x, y, w, h)) return { x, y };
  return null;
}
export function addToGrid(g, it) { const p = findSpotIn(g, it.w || 1, it.h || 1); if (!p) return false; Object.assign(it, p); g.list.push(it); return true; }
export const findSpot = (w, h) => findSpotIn(grid(), w, h);
export const addToBag = it => addToGrid(grid(), it);
export const addToStash = it => addToGrid(grid('stash'), it);
export const removeFromBag = id => { const i = S.bag.findIndex(x => x.id === id); return i < 0 ? null : S.bag.splice(i, 1)[0]; };
const removeFromStash = id => { const L = grid('stash').list, i = L.findIndex(x => x.id === id); return i < 0 ? null : L.splice(i, 1)[0]; };

// Beute unterbringen: erst der Beutel, dann das Lager. Verkauft wird erst, wenn beides voll ist –
// vorher rutschte ein legendäres Stück still durch, nur weil kein Platz war.
export function keep(it) {
  if (addToBag(it)) return 'bag';
  if (addToStash(it)) { it.stashed = true; return 'stash'; }
  return null;
}
export const stashLeft = () => !!findSpotIn(grid('stash'), 1, 1);
export function stashPut(id) { const it = S.bag.find(x => x.id === id); if (!it) return false;
  const g = grid('stash'), p = findSpotIn(g, it.w || 1, it.h || 1); if (!p) return false;
  removeFromBag(id); Object.assign(it, p); g.list.push(it); return true; }
export function stashTake(id) { const it = grid('stash').list.find(x => x.id === id); if (!it) return false;
  const p = findSpot(it.w || 1, it.h || 1); if (!p) return false;
  removeFromStash(id); delete it.stashed; Object.assign(it, p); S.bag.push(it); return true; }
export function sellStash(id) { const it = removeFromStash(id); if (it) S.gold += it.value; return !!it; }
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
// Krypten: nur der Boss, frei nach dem Boss „seines“ Akts. prog[c] = besiegte Stufen; jede Stufe schwerer, Beute besser.
export const cryptAct = c => ACTS.find(a => a.crypt === c.id);
export const cryptTier = c => S.crypt.prog[c.id] || 0;
export const cryptLvl = (c, t = cryptTier(c)) => cryptAct(c).top + CRYPT.lvlAdd + t * CRYPT.tierLvl;
export const cryptFloor = c => cryptTier(c) > 0 ? 5 : cryptOpen(c) ? 4 : 0;   // für alte Questziele (Ebene n / Räume)
export const cryptOpen = c => actDone(cryptAct(c)) && S.shards.length >= (c.shards || 0);
export const cryptGlut = c => CRYPT.glut + cryptTier(c) * CRYPT.glutPerTier;   // jeder Versuch kostet Glut (sonst endloses Farmen)
export const cryptEnemy = c => makeBoss(c, cryptLvl(c), 1 + cryptTier(c) * CRYPT.tierMult);
// Boss einer Krypta/eines Akts (auch im Abstieg): mehr Leben + eigenes Muster statt nur größerer Zahlen
export function makeBoss(c, lvl, mult = 1) {
  const mo = makeMonster(lvl, CFG.bossDiff * mult, c.boss);
  mo.hp = Math.round(mo.hp * CFG.bossHp); mo.boss = true; mo.rage = 0.2; mo.crit = 0.05;
  const { mirror, armorMult, ...mech } = c.boss.mech || {};
  Object.assign(mo, mech); if (armorMult) mo.armor = Math.round(mo.armor * armorMult);
  if (mirror) { const me = effects(); for (const k of ['crit', 'evade', 'block', 'leech', 'bleed', 'rage', 'pen', 'regen', 'thorns', 'execute']) if (me[k]) mo[k] = me[k]; }
  return mo;
}
export function cryptWin(c) {
  const t = cryptTier(c); S.crypt.prog[c.id] = t + 1;
  const out = { bossKilled: true, tier: t + 1, first: t === 0 };
  if (t === 0 && SHARD_CRYPTS.includes(c.id) && !S.shards.includes(c.id)) { S.shards.push(c.id); out.shard = S.shards.length; }
  CRYPT.dTier.forEach((dt, d) => { const key = c.id + ':' + d;
    if (t >= dt && !S.trophies.some(x => x.key === key)) { out.trophy = { key, name: c.boss.name, diff: DIFFICULTIES[d].name, eff: c.trophy }; S.trophies.push(out.trophy); } });
  return out;
}
// --- Akte ---
export const actProg = a => S.acts.prog[a.id] || 0;                // 0..ACT.zones+1 (zones = Boss offen, zones+1 = Boss tot)
export const actDone = a => !!a && actProg(a) > ACT.zones;
export const actOpen = a => { const i = ACTS.indexOf(a); return i === 0 || actDone(ACTS[i - 1]); };
export const actZoneLvl = (a, z) => z >= ACT.zones ? a.top : Math.round(a.lvl + (a.top - 1 - a.lvl) * z / (ACT.zones - 1));
export const curAct = () => ACTS.find(a => actOpen(a) && !actDone(a)) || ACTS[ACTS.length - 1];

// --- Tägliches Omen ---
// Orte, an denen gerade gekämpft werden kann: die der offenen Akte (nicht nach Stufe – ein Akt öffnet sich erst mit dem Boss davor)
export const openLocs = () => ACTS.filter(actOpen).map(a => LOCATIONS.find(l => l.id === a.loc));
const dayNo = () => { const t = Date.now(); return Math.floor((t - new Date(t).getTimezoneOffset() * 60000) / 86400000); };
export function omen() {
  const day = dayNo();
  if (!S.omen || S.omen.day !== day) {
    const open = openLocs(), h = (day * 2654435761) >>> 0;
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

// --- Schmiede: Runen einschmieden (Minispiel in der UI, hier nur die Regeln) ---
export const forgeTargets = () => Object.entries(S.equip).filter(([, it]) => it).map(([slot, it]) => ({ slot, it, free: FORGE.maxRunes - (it.runes?.length || 0) }));
export function canForge(slot, mat) {
  const it = S.equip[slot];
  if (!it) return 'Kein Gegenstand angelegt.';
  if ((it.runes?.length || 0) >= FORGE.maxRunes) return 'Alle Runenplätze belegt.';
  if (!RUNES[mat]) return 'Unbekanntes Material.';
  if ((S.mats[mat] || 0) < FORGE.cost) return `Zu wenig ${mat}.`;
  return null;
}
export const forgeQuestMat = mat => questNeedsMat(mat);
// score: Summe der Schlag-Punkte (0 .. hits×3)
export function forge(slot, mat, score) {
  if (canForge(slot, mat)) return null;
  score = Math.max(0, Math.min(FORGE.hits * 3, Math.round(score)));
  const r = RUNES[mat], it = S.equip[slot], g = FORGE.grades.find(x => score >= x.min);
  const v = Math.max(1, Math.round(r.per * (CFG.affixBase + S.lvl * CFG.affixPerLvl) * g.q));
  S.mats[mat] -= FORGE.cost;
  (it.runes ||= []).push({ stat: r.stat, v, name: r.name, grade: g.name, mat });
  it.mods[r.stat] = (it.mods[r.stat] || 0) + v;
  journal(`${g.adj} ${r.name} in ${it.name} geschmiedet.`);
  return { it, rune: r, v, grade: g, score, mat };
}

// --- Umschmieden (Crafting): Regeln, DOM-frei. Runen und Sonderbonus bleiben immer unberührt. ---
const runeSum = (it, k) => (it.runes || []).filter(r => r.stat === k).reduce((a, r) => a + r.v, 0);
// Eigene Boni des Items (ohne Runen-Anteil)
export function baseMods(it) { const b = {}; for (const [k, v] of Object.entries(it.mods)) { const x = v - runeSum(it, k); if (x > 0) b[k] = x; } return b; }
function setBase(it, base) {
  const mods = { ...base }; for (const r of it.runes || []) mods[r.stat] = (mods[r.stat] || 0) + r.v;
  it.mods = mods; it.tiers = Object.fromEntries(Object.keys(base).map(k => [k, it.tiers?.[k] || 3]));
}
export const craftItems = () => [...Object.values(S.equip).filter(Boolean), ...S.bag].filter(it => CRAFT.glut[it.rarity] && !it.unique && !it.set);
const findAny = id => Object.values(S.equip).find(x => x?.id === id) || S.bag.find(x => x.id === id);
// Glut alter Items (vor dem Crafting-System) einmalig festlegen – aus der ID, damit Neuladen nichts ändert
function ensureGlut(it) {
  if (it.glut != null || !CRAFT.glut[it.rarity] || it.unique || it.set) return;
  let h = 0; for (const c of it.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  it.glut = it.glutMax = CRAFT.glut[it.rarity] + h % (CRAFT.glutRand + 1);
}
export const craftGold = it => Math.round(CRAFT.gold[0] + it.lvl * CRAFT.gold[1] + it.value * CRAFT.goldValue);   // mit Wert: Craften+Verkaufen darf nie Gold bringen
// Warum geht ein Eingriff nicht? null = möglich
// „Hinzufügen" an einem vollen Teil: mit einem Kronsplitter geht es doch, und das Teil steigt auf.
// null = normaler Fall. Eine Aufwertung je Teil, egal über welchen Weg (`it.risen`).
export const craftRaises = (it, opId) => opId !== 'add' || !it || it.risen
  || Object.keys(baseMods(it)).length < CRAFT.maxAff[it.rarity] ? null : (CRAFT.raise.from[it.rarity] || null);
// Welches Material ein Eingriff wirklich kostet – das Erheben nimmt ein anderes als das Hinzufügen.
export const craftMat = (it, opId) => craftRaises(it, opId) ? CRAFT.raise : CRAFT.ops.find(o => o.id === opId);

export function craftCheck(it, opId, stat) {
  const op = CRAFT.ops.find(o => o.id === opId);
  if (!it || !op) return 'Nichts gewählt.';
  if (it.unique) return 'Einzigartiges lässt sich nicht umschmieden.';
  if (!CRAFT.glut[it.rarity]) return 'Nur magische, seltene und legendäre Items.';
  ensureGlut(it);
  if (it.crafted) return `Vollendet von ${it.crafted}.`;
  const need = craftMat(it, opId), rise = craftRaises(it, opId);
  if (it.glut < need.glut) return 'Zu wenig Schmiedeglut.';
  if ((S.mats[need.mat] || 0) < need.n) return rise ? `Es braucht ${MATS[CRAFT.raise.mat]} aus dem Abgrund.` : 'Zu wenig Material.';
  if (S.gold < craftGold(it)) return 'Zu wenig Gold.';
  const base = baseMods(it), keys = Object.keys(base), free = keys.filter(k => k !== it.sealed);
  if (opId === 'seal') { if (it.sealed) return 'Schon ein Bonus versiegelt.'; if (!stat || !base[stat]) return 'Bonus antippen, der bleiben soll.'; }
  if ((opId === 'chaos' || opId === 'values' || opId === 'remove') && !free.length) return 'Kein unversiegelter Bonus.';
  if (opId === 'add' && keys.length >= CRAFT.maxAff[it.rarity] && !rise)
    return it.risen ? 'Dieses Teil wurde schon erhoben.' : 'Kein Platz für weitere Boni.';
  if (opId === 'add' && !affixPool(it).some(a => !(a.stat in base))) return 'Alle Boni schon vorhanden.';
  return null;
}
// Alle unversiegelten Boni neu (gleiche Anzahl), versiegelter bleibt – auch für Ysoldes „Neu weihen“
// Schmiedeglut abziehen; reicht der Rest für nichts mehr → vollendet
function spendGlut(it, n) {
  ensureGlut(it); const cost = Math.min(it.glut, n + Math.floor(rand() * (CRAFT.glutJitter + 1))); it.glut -= cost;
  if (it.glut < Math.min(...CRAFT.ops.map(o => o.glut))) { it.glut = 0; it.crafted = S.name; journal(`${it.name} ist vollendet. Mein Zeichen steht darauf.`); }
  return cost;
}
export function craft(id, opId, stat) {
  const it = findAny(id), err = craftCheck(it, opId, stat); if (err) return { err };
  const op = CRAFT.ops.find(o => o.id === opId), legend = it.rarity === 'legendary';
  const need = craftMat(it, opId), rise = craftRaises(it, opId);
  const gold = craftGold(it), base = baseMods(it), tiers = { ...(it.tiers || {}) };
  const roll1 = k => { const T = rollTier(it.lvl); tiers[k] = T.t; base[k] = affixValue(AFFIXES.find(a => a.stat === k), it.lvl, T, legend); };
  const free = Object.keys(base).filter(k => k !== it.sealed);
  if (opId === 'seal') it.sealed = stat;
  else if (opId === 'chaos') { const n = free.length; for (const k of free) { delete base[k]; delete tiers[k]; }
    const pool = affixPool(it).filter(a => !(a.stat in base)).sort(() => rand() - 0.5).slice(0, n); for (const a of pool) roll1(a.stat); }
  else if (opId === 'values') for (const k of free) roll1(k);
  else if (opId === 'add') { const pool = affixPool(it).filter(a => !(a.stat in base)); roll1(pool[Math.floor(rand() * pool.length)].stat); }
  else if (opId === 'remove') { const k = free[Math.floor(rand() * free.length)]; delete base[k]; delete tiers[k]; }
  it.tiers = tiers; setBase(it, base);
  // Der Aufstieg ändert nur die Zahl der Boni und die Farbe – dmg/armor des Grundgegenstands bleiben,
  // sonst bekäme man einen seltenen Grundwert geschenkt (gleiche Regel wie beim Fusionieren).
  if (rise) { it.rarity = rise; it.risen = true; }
  S.mats[need.mat] -= need.n; S.gold -= gold;
  const cost = spendGlut(it, need.glut);
  renameMagic(it); it.value = itemValue(it);
  return { it, op, cost, rise };
}

// --- Fusionieren: ein Bonus wandert von einem gleichartigen Teil herüber, der Spender zerfällt ---
// Der bestimmte Gegenpol zum Umschmieden: hier würfelt nichts, du wählst. Gebremst wird das über
// CRAFT.fuse.max (je Teil nur eine Fusion) – sonst trägt jeder dasselbe perfekte Teil und kein
// Fundstück ist mehr interessant. Die Stufe des Bonus wandert mit, darum lohnt das Warten auf
// einen guten Spender. Futter kommt nur aus dem Beutel, nie vom Körper (sonst zerstört man aus
// Versehen, was man anhat).
export const fuseForm = (a, b) => a.slot === b.slot && a.kind === b.kind;   // Dolch zu Dolch, Gürtel zu Gürtel
export const fuseCount = it => it?.fused || 0;
const fusable = it => CRAFT.glut[it.rarity] && !it.unique && !it.set;
const nextRar = r => { const n = RARITIES[RARITIES.findIndex(x => x.id === r) + 1]; return n && CRAFT.maxAff[n.id] ? n.id : null; };
export const fuseMains = () => craftItems().filter(it => fuseCount(it) < CRAFT.fuse.max);
export const fuseFoods = main => !main ? [] : S.bag.filter(it =>
  it.id !== main.id && fusable(it) && fuseForm(main, it) && it.rarity === main.rarity && Object.keys(baseMods(it)).length);
// Ist das Hauptteil voll, muss entweder ein Bonus weichen (mainStat) oder das Teil steigt auf.
export const fuseFull = main => Object.keys(baseMods(main)).length >= CRAFT.maxAff[main.rarity];
export const fusePromote = (main, mainStat) => fuseFull(main) && !mainStat && !main.risen ? nextRar(main.rarity) : null;

// Warum geht die Fusion nicht? null = möglich
export function fuseCheck(main, food, foodStat, mainStat) {
  if (!main || !food) return 'Zwei Teile wählen.';
  if (main.id === food.id) return 'Nicht mit sich selbst.';
  if (!fusable(main) || !fusable(food)) return 'Einzigartige und Set-Teile bleiben, wie sie sind.';
  if (!fuseForm(main, food)) return 'Nur die gleiche Grundform.';
  if (main.rarity !== food.rarity) return 'Nur die gleiche Seltenheit.';
  if (fuseCount(main) >= CRAFT.fuse.max) return 'Dieses Teil ist schon fusioniert.';
  ensureGlut(main);
  if (main.crafted) return `Vollendet von ${main.crafted}.`;
  if (main.glut < CRAFT.fuse.glut) return 'Zu wenig Schmiedeglut.';
  if (S.gold < craftGold(main)) return 'Zu wenig Gold.';
  const fb = baseMods(food), mb = baseMods(main);
  if (!foodStat || !(foodStat in fb)) return 'Bonus im Futter antippen.';
  if (foodStat in mb) return 'Diesen Bonus hat das Hauptteil schon.';
  if (!affixPool(main).some(a => a.stat === foodStat)) return 'Dieser Bonus passt nicht auf diesen Platz.';
  if (!fuseFull(main)) return null;                                  // Platz frei: der Bonus kommt einfach dazu
  if (mainStat) return mainStat === main.sealed ? 'Dieser Bonus ist versiegelt.'
    : !(mainStat in mb) ? 'Bonus im Hauptteil antippen, der weichen soll.' : null;
  return nextRar(main.rarity) ? null : 'Bonus im Hauptteil antippen, der weichen soll.';
}

export function fuse(mainId, foodId, foodStat, mainStat) {
  const main = findAny(mainId), food = S.bag.find(x => x.id === foodId);
  const err = fuseCheck(main, food, foodStat, mainStat); if (err) return { err };
  const mb = baseMods(main), tiers = { ...(main.tiers || {}) };
  const full = fuseFull(main), replaced = full && mainStat ? mainStat : null;
  const promote = fusePromote(main, mainStat);
  if (replaced) { delete mb[replaced]; delete tiers[replaced]; }
  mb[foodStat] = baseMods(food)[foodStat];
  tiers[foodStat] = food.tiers?.[foodStat] || 3;                     // die Stufe wandert mit
  main.tiers = tiers; setBase(main, mb);
  // Aufstieg ändert nur die Zahl der Boni und die Farbe – Schaden und Rüstung des Grundgegenstands
  // bleiben, sonst bekäme man durch zwei magische Teile heimlich einen seltenen Grundwert geschenkt.
  if (promote) { main.rarity = promote; main.risen = true; }
  main.fused = fuseCount(main) + 1;
  const gold = craftGold(main); S.gold -= gold;
  const cost = spendGlut(main, CRAFT.fuse.glut);
  removeFromBag(food.id);
  renameMagic(main); main.value = itemValue(main);
  journal(`${food.name} zerfiel. Was gut an ihm war, trägt jetzt ${main.name}.`);
  return { it: main, food, stat: foodStat, replaced, promote, cost, gold };
}

// --- Eilen: kostet mit Restzeit und Stufe ---
export const rushCost = () => !S.active ? 0 : Math.max(1, Math.ceil(Math.max(0, S.active.end - now()) / 20000) * Math.ceil(1 + S.lvl / CFG.rushPerLvl));

// --- Steckbriefe (täglich 3, deterministisch aus dem Datum) ---
export function bounties() {
  const day = dayNo();
  if (!S.bounty || S.bounty.day !== day) {
    const mobs = [...new Set(openLocs().flatMap(l => l.mobs))];
    let h = Math.imul(day, 2246822519) >>> 0; const next = m => { h = (Math.imul(h, 1103515245) + 12345) >>> 0; return (h >>> 8) % m; };
    // nur anbieten, was schon erreichbar ist
    const can = { arena: S.lvl >= 3, crypt: CRYPTS.some(cryptOpen), elite: actProg(ACTS[0]) >= ACT.elites[0] };
    const types = BOUNTIES.filter(b => can[b.id] !== false);
    const pickT = []; while (pickT.length < 3 && types.length) pickT.push(types.splice(next(types.length), 1)[0]);   // ohne Wiederholung, endet sicher
    S.bounty = { day, list: pickT.map(t => ({ id: t.id, target: t.id === 'kill' ? mobs[next(mobs.length)] : null, n: t.n, prog: 0, claimed: false })) };
  }
  return S.bounty.list;
}
export function bountyEvent(ev) {
  if (!S.bounty) return;
  for (const b of bounties()) {
    if (b.claimed || b.prog >= b.n) continue;
    const hit = b.id === 'kill' ? ev.type === 'kill' && ev.mob === b.target : b.id === ev.type;
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
  const it = sv.slot ? S.equip[sv.slot] : null, step = sv.max ? slotUp(sv.slot) : 0;
  const cost = costOf(sv, step), gold = goldOf(sv, step);
  const costText = [...Object.entries(cost).map(([k, n]) => `${n}× ${MATS[k]}`), `${gold} Gold`].join(', ');
  let reason = '';
  if (sv.max && step >= sv.max) reason = 'Vollendet';
  else if (sv.slot && !sv.max && !it) reason = 'Nichts angelegt';
  const enough = S.gold >= gold && Object.entries(cost).every(([k, n]) => (S.mats[k] || 0) >= n);
  return { it, step, costText, reason, can: !reason && enough, questMat: Object.keys(cost).find(k => questNeedsMat(k)) };
}
export function doService(tid, svId) {
  const sv = SERVICES[tid].find(x => x.id === svId), st = serviceState(sv); if (!st.can) return null;
  const cost = costOf(sv, st.step); S.gold -= goldOf(sv, st.step); for (const [k, n] of Object.entries(cost)) S.mats[k] -= n;
  const it = st.it;
  if (sv.max) { (S.temper ||= {})[sv.slot] = st.step + 1; return { name: sv.name, up: st.step + 1 }; }   // bleibt am Platz, auch wenn das Teil wechselt
  if (sv.id === 'gamble') {
    const g = makeItem(S.lvl, { luck: S.attrs.lck, minRarity: 2 });   // meist magisch, selten mehr – wie das Glücksspiel in D2
    if (!addToBag(g)) { S.gold += goldOf(sv, 0); return null; }
    return g;
  }
  if (sv.id === 'order') {
    const w = makeItem(S.lvl + 1, { slot: 'weapon', kind: CLASSES[S.cls].weapon, minRarity: 2, luck: 40 });
    if (w.kind !== CLASSES[S.cls].weapon) { const b = BASES.filter(x => x.kind === CLASSES[S.cls].weapon).pop(); Object.assign(w, { kind: b.kind, base: b.name, art: b.art, w: b.w, h: b.h, dmg: b.dmg.map(v => Math.round(v * (1 + S.lvl * 0.2))) }); }
    if (!addToBag(w)) { S.gold += goldOf(sv, 0); for (const [k, n] of Object.entries(cost)) S.mats[k] += n; return null; }
    return w;
  }
  return it;
}
export { ATTRS };

// --- Alchemie: Zutaten, Tränke brauen, Gürtel (wirkt nur in der Krypta) ---
export const today = () => new Date(Date.now()).toDateString();
export const potion = id => POTIONS.find(p => p.id === id);
export const beltSlots = () => loyalty('ysolde') >= ALCH.loyalNeed ? ALCH.slotsLoyal : ALCH.slots;
export const potMax = p => p.rare ? ALCH.maxRare : ALCH.maxCommon;
export function addHerb(id, n = 1) { S.herbs[id] = (S.herbs[id] || 0) + n; }
// Zutaten bei Ysolde kaufen. Gemessen hat Gold im Brauen NIE gebremst, Zutaten immer – ein Tausch
// zwischen beidem gibt dem Gold endlich eine Senke und hilft genau dann, wenn ein Kraut fehlt.
// Das Schwarze Herz gibt es nicht zu kaufen, es bleibt der Fund vom Krypta-Boss.
export const herbPrice = () => Math.round(ALCH.herbBuy[0] + S.lvl * ALCH.herbBuy[1]);
// Ysoldes Tagesvorrat: zurückgesetzt beim ersten Blick an einem neuen Tag
export function herbLeft() { if (S.herbBuy?.day !== today()) S.herbBuy = { day: today(), n: 0 }; return ALCH.herbStock - S.herbBuy.n; }
export const canBuyHerb = id => id !== 'herz' && !!HERBS[id] && herbLeft() > 0 && S.gold >= herbPrice();
export function buyHerb(id) { if (!canBuyHerb(id)) return false; S.gold -= herbPrice(); S.herbBuy.n++; addHerb(id, 1); return true; }
export function brewCost(id) { const p = potion(id), [a, b] = p.rare ? ALCH.goldRare : ALCH.gold; return { herbs: p.cost, gold: Math.round(a + S.lvl * b) }; }
export function canBrew(id) {
  const p = potion(id); if (!p) return { ok: false, reason: 'Unbekannt' };
  const c = brewCost(id), have = S.pots[id] || 0;
  if (have >= potMax(p)) return { ok: false, reason: 'Vorrat voll' };
  const miss = Object.entries(c.herbs).find(([k, n]) => (S.herbs[k] || 0) < n);
  if (miss) return { ok: false, reason: `Fehlt: ${HERBS[miss[0]].name}` };
  if (S.gold < c.gold) return { ok: false, reason: 'Zu wenig Gold' };
  return { ok: true };
}
export function brew(id) {
  if (!canBrew(id).ok) return false;
  const p = potion(id), c = brewCost(id);
  for (const [k, n] of Object.entries(c.herbs)) S.herbs[k] -= n;
  S.gold -= c.gold; S.pots[id] = Math.min(potMax(p), (S.pots[id] || 0) + (p.rare ? 1 : ALCH.charges));
  return true;
}
// Gürtel: Platz i mit Trank belegen (oder leeren). Höchstens ein seltener, kein Trank doppelt.
export function canBelt(i, id) {
  if (i < 0 || i >= beltSlots()) return false; if (id === null) return true;
  const p = potion(id); if (!p || !(S.pots[id] > 0)) return false;
  return !S.belt.some((b, j) => j !== i && b && (b.id === id || (p.rare && potion(b.id).rare)));
}
export function setBelt(i, id) { if (!canBelt(i, id)) return false; S.belt[i] = id === null ? null : { id, trig: potion(id).trig?.[0] || null }; return true; }
export function setTrig(i, t) { const b = S.belt[i]; if (!b || !potion(b.id).trig?.includes(t)) return false; b.trig = t; return true; }
// Was im Kampf mitgeht: belegte Plätze mit Vorrat
export const beltCombat = () => S.belt.slice(0, beltSlots()).filter(b => b && S.pots[b.id] > 0).map(b => { const p = potion(b.id); return { id: p.id, name: p.name, fx: p.fx, rare: p.rare, trig: b.trig }; });
export function usePotions(ids = []) { for (const id of ids) if (S.pots[id] > 0) S.pots[id]--; }
// Täglich +1 Ladung für gewöhnliche Tränke im Gürtel (gegen Horten: wer nichts nutzt, verschenkt etwas)
export function potDaily() {
  if (S.potDay === today()) return false; S.potDay = today();
  for (const b of S.belt.slice(0, beltSlots())) { const p = b && potion(b.id); if (p && !p.rare) S.pots[p.id] = Math.min(potMax(p), (S.pots[p.id] || 0) + 1); }
  return true;
}
