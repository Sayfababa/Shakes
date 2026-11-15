// Spielzüge ohne DOM: Kampf ausführen, Belohnung anwenden, strukturiertes Ergebnis liefern.
// main.js zeigt das Ergebnis an; tests/ spielen damit ganze Verläufe durch.
import { GRADES, CLASSES, CFG, CRYPTS, TALENTS, LOCATIONS, MONSTERS, TRACKS, DELVE, HERB_LOC, ALCH, POTIONS, HERBS, EXPED, EXP_TALES, EXP_NODES, EXP_EVENTS, EXP_GOALS, MATS } from './data.js';
import * as G from './state.js';
import * as Q from './quests.js';
import { fight } from './combat.js';
import { makeItem } from './loot.js';
import { pick, roll, chance } from './rng.js';

const now = () => Date.now();

function dropMat(m, rew) { if (m.mat && chance(CFG.matChance)) { const n = m.boss ? 3 : 1; G.addMat(m.mat, n); rew.mats.push([m.mat, n]); } }
function dropItem(lvl, p, minRarity, rew) {
  if (!chance(p)) return;
  const it = makeItem(lvl, { luck: G.stats().lck, cls: CLASSES[G.S.cls], minRarity });
  if (G.addToBag(it)) rew.item = it; else { G.S.gold += it.value; rew.item = { ...it, soldFull: true }; }
}
// Kampfbewertung nach Restleben: wer stärker ist, gewinnt souveräner – und bekommt mehr
export const gradeOf = r => r.winner === 'a' ? GRADES.find(g => (r.left ?? 0) >= g.min) : null;
const newRew = () => ({ gold: 0, xp: 0, up: 0, mats: [], item: null, herbs: [] });
function dropHerb(id, p, n, rew) { if (id && chance(p)) { G.addHerb(id, n); rew.herbs.push([id, n]); } }
function pay(rew, gold, xp) { rew.gold += gold; rew.xp += xp; G.S.gold += gold; rew.up += G.gainXp(xp); }

// Ein "Verdammter" für die Grube (oder ein Champion mit festen Werten)
export function makeRival({ name, cls, lvl, rich = 0, minRarity = 0 } = {}) {
  const S = G.S; cls ||= pick(Object.keys(CLASSES)); lvl ||= Math.max(1, S.lvl + roll(-1, 1));
  const c = CLASSES[cls];
  const p = { name: name || pick(['Morgrim', 'Asha die Blasse', 'Kel Varn', 'Ysra', 'Brann', 'Oswin der Stumme', 'Mireth', 'Draven']), cls, lvl,
    attrs: { str: 5, dex: 5, int: 5, con: 6, lck: 3 }, equip: {}, tal: {}, trophies: [] };
  for (const k in p.attrs) p.attrs[k] += Math.round((lvl - 1) * (k === c.main ? 3 + rich * 0.4 : k === 'con' ? 1.6 + rich * 0.4 : 0.2 + rich * 0.1));
  for (let i = 0; i < lvl - 1; i++) { const t = TALENTS[cls][rich ? i % 3 : roll(0, 2)].nodes, n = t.find(x => (p.tal[x.id] || 0) < x.max); if (n) p.tal[n.id] = (p.tal[n.id] || 0) + 1; }
  for (const s of ['weapon', 'chest', 'helm', 'boots', ...(rich ? ['gloves'] : [])]) p.equip[s] = makeItem(lvl, { slot: s, cls: c, minRarity });
  return p;
}

// --- Streifzug auflösen ---
// Erfahrung gibt es sofort. Gold, Material und Items kommen in die ungesicherte Beute (S.haul):
// Heimkehren sichert sie, Tiefer gehen vermehrt sie – eine Niederlage in der Tiefe kostet sie.
const trackOf = id => TRACKS.find(t => t.id === id) || TRACKS[1];
// Gegnerstufe einer Spur: blutige Spur misst sich an dir (nie unter deiner Stufe + 1), sonst am Ort
const trackLvl = (l, tr, depth = 0) => Math.max(1, G.locLvl(l) + (tr.lvlAdd || 0), tr.atLeastPlayer ? G.S.lvl + tr.atLeastPlayer : 0) + DELVE.lvlPer * depth;
function tripLoot(l, m, tr, depth, od, rew, gb = 0) {
  const t = G.tripReward(l, 1, 45), mult = tr.rew * (1 + DELVE.rewPer * depth);
  const gold = Math.round(t.gold * mult * (1 + gb) * (od?.gold || 1)), xp = Math.round(t.xp * mult * (od?.xp || 1));
  rew.xp += xp; rew.gold += gold;
  if (m.mat && chance(CFG.matChance)) rew.mats.push([m.mat, 1 + (depth >= 2 ? 1 : 0)]);
  if (od?.mats && m.mat) rew.mats.push([m.mat, 2]);
  const p = od?.loot ? 1 : Math.min(1, tr.loot + depth * 0.1 + gb / 2), minR = Math.max(od?.loot || 0, tr.minRarity || 0, depth >= 3 ? 3 : depth >= 1 ? 2 : 0);
  if (chance(p)) rew.item = makeItem(m.lvl, { luck: G.stats().lck + depth * 20, cls: CLASSES[G.S.cls], minRarity: minR });
  G.haulAdd(rew.gold, rew.mats, rew.item, rew.xp);
}
export function resolveTrip() {
  const S = G.S, a = S.active; if (!a || now() < a.end) return null;
  const l = LOCATIONS.find(x => x.id === a.loc), tr = trackOf(a.track), om = G.omenFor(l.id), od = om && !om.done ? om.def : null;
  const m = G.makeMonster(trackLvl(l, tr), a.diff * (od?.diff || 1), MONSTERS.find(x => x.name === a.mob));
  if (od?.diff) m.name = 'Fürst: ' + m.name;
  const A = G.stats(), r = fight(A, m), win = r.winner === 'a', rew = newRew();
  S.active = null;
  if (!win) { S.deaths++; G.journal(`${m.name} in ${l.name} hat mich zerrissen.`); return { A, B: m, r, win, rew, place: l }; }
  S.wins++; Q.event({ type: 'kill', mob: a.mob, loc: l.id }); G.bountyEvent({ type: 'kill', mob: a.mob }); G.bountyEvent({ type: 'trip', track: tr.id });
  S.haul = { loc: l.id, track: tr.id, depth: 0, gold: 0, mats: {}, items: [] };
  rew.grade = gradeOf(r); tripLoot(l, m, tr, 0, od, rew, rew.grade.bonus); dropHerb(HERB_LOC[l.id], ALCH.herbChance, 1, rew);
  if (od && G.fulfillOmen()) { Q.event({ type: 'omen' }); rew.omen = true; G.journal(`Das Omen über ${l.name} hat sich erfüllt.`); }
  else G.journal(`${m.name} in ${l.name} erschlagen.`);
  return { A, B: m, r, win, rew, place: l, haul: S.haul };
}
// Nächster Gegner in der Tiefe (für Gefahr-Anzeige und Kampf)
function deepEnemy() {
  const h = G.S.haul, l = LOCATIONS.find(x => x.id === h.loc), tr = trackOf(h.track), d = h.depth + 1;
  const m = G.makeMonster(trackLvl(l, tr, d), tr.diff * (1 + DELVE.diffPer * d), MONSTERS.find(x => x.name === pick(l.mobs)));
  m.name = `${m.name} (Tiefe ${d})`; return m;
}
const delveGlut = () => LOCATIONS.find(x => x.id === G.S.haul.loc).glut;
export const canDelve = () => !!G.S.haul && G.S.haul.depth < DELVE.max && G.S.glut >= delveGlut();
export const delveChance = () => winChance('delve:' + G.S.haul.loc + G.S.haul.track + G.S.haul.depth, deepEnemy);
export function delve() {
  const S = G.S, h = S.haul; if (!canDelve()) return null;
  const l = LOCATIONS.find(x => x.id === h.loc), tr = trackOf(h.track), m = deepEnemy();
  S.glut -= l.glut;
  const A = G.stats(), r = fight(A, m), win = r.winner === 'a', rew = newRew();
  if (!win) {
    S.deaths++; const lost = { ...h }; S.haul = null;
    G.journal(`In der Tiefe ${l.name}s verlor ich alles, was ich trug.`);
    return { A, B: m, r, win, rew, place: l, lost };
  }
  S.wins++; h.depth++; Q.event({ type: 'kill', mob: m.name.replace(/ \(Tiefe \d\)$/, ''), loc: l.id });
  rew.grade = gradeOf(r); tripLoot(l, m, tr, h.depth, null, rew, rew.grade.bonus); dropHerb(HERB_LOC[l.id], ALCH.herbChance, 1 + (h.depth >= 2 ? 1 : 0), rew);
  G.journal(`Tiefe ${h.depth} in ${l.name} überlebt.`);
  return { A, B: m, r, win, rew, place: l, haul: h };
}
export const bank = () => { const d = G.S.haul?.depth || 0, h = G.bankHaul(); if (h) G.bountyEvent({ type: 'bank', depth: d }); return h; };

// --- Krypta-Kampf ---
export function cryptFight(id, m0 = null) {
  const S = G.S, c = CRYPTS.find(x => x.id === id);
  if (!c || S.exp || now() < S.crypt.cd || !G.cryptOpen(c) || G.cryptFloor(c) >= 5) return null;
  const m = m0 || G.cryptEnemy(c), boss = !!m.boss;
  S.crypt.cd = now() + CFG.cryptCdSec * 1000;
  const A = blessed({ ...G.stats(), belt: G.beltCombat() }), r = fight(A, m), win = r.winner === 'a', rew = newRew();
  G.usePotions(r.used); rew.used = r.used; if (S.bless) { rew.bless = S.bless; S.bless = 0; }
  if (!win) { S.deaths++; G.journal(`${m.name} in ${c.name} hat mich niedergestreckt.`); return { A, B: m, r, win, rew, crypt: c }; }
  S.wins++; Q.event({ type: 'kill', mob: m.name }); if (boss) Q.event({ type: 'boss', crypt: c.id }); G.bountyEvent({ type: 'crypt' }); G.bountyEvent({ type: 'kill', mob: m.name });
  Object.assign(rew, G.cryptWin(c)); rew.grade = gradeOf(r); const gb = 1 + rew.grade.bonus;
  pay(rew, Math.round((10 + m.lvl * 5) * (boss ? 4 : 1) * gb), Math.round((25 + m.lvl * 14) * (boss ? 3 : 1.2)));
  dropMat(m, rew); dropHerb('herz', boss ? 1 : ALCH.floorHeart, boss ? ALCH.bossHearts : 1, rew); dropItem(m.lvl, boss ? 1 : 0.35, boss ? (['c1', 'c2'].includes(c.id) ? 2 : 3) : 1, rew);
  G.journal(boss ? `${m.name} ist gefallen. ${c.name} schweigt.` : `${m.name} in ${c.name} erschlagen.`);
  return { A, B: m, r, win, rew, crypt: c };
}

// --- Grube ---
export function arenaFight(R) {
  const S = G.S; if (S.exp || now() < S.arenaTs || !R || S.glut < CFG.arenaGlut) return null;
  S.arenaTs = now() + CFG.arenaCdSec * 1000; S.glut -= CFG.arenaGlut;
  const A = G.stats(), B = G.stats(R), r = fight(A, B), win = r.winner === 'a', rew = newRew();
  if (win) { S.honor += 10; S.wins++; rew.grade = gradeOf(r); pay(rew, Math.round(R.lvl * 3 * (1 + rew.grade.bonus)), 0); rew.honor = 10; Q.event({ type: 'arena' }); G.bountyEvent({ type: 'arena' }); G.journal(`${R.name} in der Grube besiegt.`); }
  else { S.honor = Math.max(0, S.honor - 5); rew.honor = -5; S.deaths++; }
  return { A, B, r, win, rew };
}

// --- Champion einer Questkette (z. B. Vargos "Die Kette") ---
export function champFight(tid) {
  const S = G.S, q = Q.current(tid); if (S.exp || !q?.champ || now() < S.arenaTs) return null;
  const c = q.champ, R = makeRival({ name: c.name, cls: c.cls, lvl: S.lvl + c.lvlAdd, rich: 1, minRarity: 2 });
  S.arenaTs = now() + CFG.arenaCdSec * 1000;
  const A = G.stats(), B = G.stats(R), r = fight(A, B), win = r.winner === 'a', rew = newRew();
  if (win) { S.wins++; S.honor += 25; rew.honor = 25; Q.event({ type: 'champ', tid }); G.journal(`${c.name} ist gefallen.`); }
  else S.deaths++;
  return { A, B, r, win, rew };
}

// --- Gefahr vorher zeigen (GameGene-Leitlinie "Do not make a loss feel unfair") ---
// Schätzt die Siegchance per Probe-Kämpfen. Zwischengespeichert, bis sich die eigenen Werte ändern.
const threatCache = new Map();
// Segen/Fluch aus der Expedition: nächster Krypta-Kampf mit ±Leben
export const blessed = A => G.S.bless ? { ...A, hp: Math.max(1, Math.round(A.hp * (1 + G.S.bless))) } : A;
export function winChance(key, makeEnemy, n = 24, belt = null, bl = false) {
  const A0 = belt ? { ...G.stats(), belt } : G.stats(), A = bl ? blessed(A0) : A0, sig = key + '|' + JSON.stringify([A.hp, A.dmg, A.armor, A[A.main], A.dex, A.lvl, S_omen(), belt?.map(b => b.id + b.trig)]);
  if (threatCache.has(sig)) return threatCache.get(sig);
  let w = 0; for (let i = 0; i < n; i++) if (fight(A, makeEnemy()).winner === 'a') w++;
  const p = w / n; if (threatCache.size > 200) threatCache.clear(); threatCache.set(sig, p); return p;
}
const S_omen = () => G.S.omen?.day;
export const tripChance = (l, track = 'norm') => winChance('trip:' + l.id + track, () => {
  const om = G.omenFor(l.id), od = om && !om.done ? om.def : null;
  return G.makeMonster(trackLvl(l, trackOf(track)), trackOf(track).diff * [0.92, 1, 1, 1.08][roll(0, 3)] * (od?.diff || 1), MONSTERS.find(m => m.name === pick(l.mobs)));
});
export const cryptChance = (c, belt = G.beltCombat()) => winChance('crypt:' + c.id + ':' + G.cryptFloor(c) + ':' + G.S.crypt.diff, () => G.cryptEnemy(c), 24, belt, true);
export const threatLabel = p => p >= 0.9 ? ['gering', 'low'] : p >= 0.65 ? ['mäßig', 'mid'] : p >= 0.35 ? ['hoch', 'high'] : ['tödlich', 'deadly'];

// Werte eines Gegners aus Sicht des Helden (Vorbereitung): gleiche Formeln wie combat.js
export function enemyInfo(m, A = G.stats()) {
  const hitDmg = [0, 1].map(i => Math.round(m.dmg[i] * (1 + m[m.main] / CFG.mainDiv) * (1 - Math.min(0.6, A.armor / (A.armor + 20 + m.lvl * 8)))));
  const tags = [];
  if (m.poison) tags.push(['Gift, das sich stapelt', 'gegengift']); if (m.bleed) tags.push(['Lässt dich bluten', 'gegengift']);
  if (m.regen || m.leech) tags.push(['Heilt sich', 'weihwasser']); if (m.toll) tags.push(['Betäubt dich', 'wachsaft']);
  if (m.execute) tags.push(['Schlachtet Geschwächte', 'steinhaut']); if (m.rage > 0.2) tags.push(['Wird rasend', 'steinhaut']);
  const evade = Math.min(0.5, m.dex / (m.dex + A.dex * 3 + 40) + (m.evade || 0)), armor = Math.min(0.6, m.armor / (m.armor + 20 + A.lvl * 8));
  const crit = Math.min(0.6, CFG.critBase + m.lck / (m.lck + 100 + A.lvl * 5) + (m.crit || 0));
  if (evade >= 0.25) tags.push(['Weicht oft aus', 'jaegerblick']); if (armor >= 0.4) tags.push(['Schwer gepanzert', 'rostsaeure']); if (crit >= 0.2) tags.push(['Trifft oft kritisch', 'knochenmark']);
  return { hp: m.hp, hit: hitDmg, evade, armor, crit, block: m.block || 0, tags };
}

// Was der Spieler mit einem Tippen für einen Trank tun kann (Vorbereitung): einpacken, brauen+einpacken, oder was fehlt
// Kurzname eines Ortes für enge Hinweise: „Moor der Gehenkten“ → Moor, „Die Alte Mühle“ → Mühle
const placeShort = n => { const w = n.replace(/^(Die|Der|Das) /, '').split(' '); return / (von|der) /.test(n) ? w[0] : w[w.length - 1]; };
export function potOffer(id) {
  const S = G.S, p = G.potion(id);
  if (S.belt.slice(0, G.beltSlots()).some(b => b?.id === id) && S.pots[id] > 0) return { kind: 'in' };
  if (S.pots[id] > 0) return { kind: 'pack' };
  const cb = G.canBrew(id); if (cb.ok) return { kind: 'brew', gold: G.brewCost(id).gold };
  const miss = Object.entries(p.cost).find(([k, n]) => (S.herbs[k] || 0) < n);
  if (miss) { const loc = LOCATIONS.find(l => HERB_LOC[l.id] === miss[0]); return { kind: 'miss', text: `Fehlt: ${HERBS[miss[0]].name} (${miss[0] === 'herz' ? 'Krypta-Bosse' : loc?.name || '?'})`, short: `fehlt ${HERBS[miss[0]].name}${miss[0] === 'herz' ? ' (Bosse)' : loc ? ` (${placeShort(loc.name)})` : ''}` }; }
  return { kind: 'miss', text: cb.reason };
}
// Trank in den Gürtel legen: freier Platz, sonst ersetzt er einen Trank, der gegen diesen Gegner nicht gebraucht wird (keep)
export function packPotion(id, keep = []) {
  const S = G.S, n = G.beltSlots(), p = G.potion(id), slots = S.belt.slice(0, n);
  if (!(S.pots[id] > 0) && !G.brew(id)) return false;
  if (slots.some(b => b?.id === id)) return true;
  let i = p.rare ? slots.findIndex(b => b && G.potion(b.id).rare) : -1;
  if (i < 0) i = slots.findIndex(b => !b);
  if (i < 0) i = slots.findIndex(b => !keep.includes(b.id));
  if (i < 0) i = n - 1;
  return G.setBelt(i, id);
}
// Bester Gürtel gegen genau diesen Gegner: alle Kombinationen vorrätiger Tränke (höchstens ein seltener) in Kämpfen ausprobieren
export function bestBelt(m, n = 50) {
  const S = G.S, k = G.beltSlots(), have = POTIONS.filter(p => S.pots[p.id] > 0), A0 = G.stats();
  const combos = [[]]; for (const p of have) for (const c of [...combos]) if (c.length < k && !(p.rare && c.some(x => x.rare))) combos.push([...c, p]);
  let best = null, bw = -1;
  for (const c of combos) { if (c.length < Math.min(k, have.length) && combos.some(x => x.length > c.length)) continue;
    const belt = c.map(p => ({ id: p.id, name: p.name, fx: p.fx, rare: p.rare, trig: p.trig?.[0] || null }));
    let w = 0; for (let i = 0; i < n; i++) if (fight({ ...A0, belt }, m).winner === 'a') w++;
    if (w > bw) { bw = w; best = c; } }
  if (!best) return false;
  for (let i = 0; i < 3; i++) S.belt[i] = null;
  best.forEach((p, i) => G.setBelt(i, p.id));
  return true;
}
// Kampfbericht aus dem Log: woher der Schaden kam, was Tränke taten, und bei Niederlage ein Tipp (wie bei der Vorbereitung)
export function fightReport(r, A, B) {
  const mine = { hit: 0, spell: 0, dot: 0, thorns: 0 }, his = { hit: 0, dot: 0, thorns: 0 }; let heal = 0, stuns = 0;
  for (const l of r.log) {
    const me = l.who === 'a';
    if (l.dmg) (me ? mine : his)[l.spell && me ? 'spell' : 'hit'] += l.dmg;
    if (l.tick) (me ? mine : his).dot += l.tick;
    if (l.thorns) (me ? his : mine).thorns += l.thorns;
    if (!me && l.heal) heal += l.heal;
    if (!me && l.stun) stuns++;
  }
  const tot = o => Object.values(o).reduce((a, b) => a + b, 0) || 1;
  const parts = (o, names) => Object.entries(o).filter(([, v]) => v / tot(o) >= 0.05).sort((a, b) => b[1] - a[1]).map(([k, v]) => [names[k], Math.round(v / tot(o) * 100)]);
  const names = { hit: 'Hiebe', spell: 'Zauber', dot: 'Gift/Bluten/Brand', thorns: 'Dornen' };
  const used = (r.used || []).map(id => G.potion(id)?.name).filter(Boolean);
  let tip = null;
  if (r.winner !== 'a') {
    const has = id => (r.used || []).includes(id), e = enemyInfo(B, A);
    if (heal > B.hp * 0.15 && !has('weihwasser')) tip = `${B.name.split(',')[0]} heilte sich um ${heal}. Weihwasser verhindert das.`;
    else if (his.dot > tot(his) * 0.3 && !has('gegengift')) tip = 'Gift und Bluten machten viel Schaden. Gegengift reinigt und schützt.';
    else if (stuns >= 2 && !has('wachsaft')) tip = `Du wurdest ${stuns}× betäubt. Wachsaft macht dich unbeugsam.`;
    else if (e.evade >= 0.25 && !has('jaegerblick')) tip = 'Er wich oft aus. Jägerblick oder mehr Geschick helfen.';
    else if (e.armor >= 0.4 && !has('rostsaeure')) tip = 'Seine Rüstung schluckte viel. Rostsäure oder Rüstung-ignorieren-Boni helfen.';
    else tip = used.length ? 'Knapp daneben. Bessere Ausrüstung oder ein stärkerer Trank (Rotwurz, Steinhaut).' : 'Ohne Tränke gekämpft. Rotwurz oder Steinhaut geben Luft.';
  }
  return { mine: parts(mine, names), his: parts(his, names), heal, used, tip };
}

// --- Expedition: ohne Glut, 1–8 Std., keine Kämpfe in der Zeit ---
// Vor dem Aufbruch: Karte mit Gabelungen (je Ort, Dauer und Tag gleich), Weg = eine Station je Reihe + Ziel.
// Heimkehr: Stationen der Reihe nach; bei „?“ wartet die Heimkehr auf eine Wahl. Beute sammelt sich (acc) und wird am Ende ausgezahlt.
const rollN = x => Math.floor(x) + (chance(x % 1) ? 1 : 0);
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const hashStr = str => { let h = 2166136261; for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
const ROWX = { 2: [0.27, 0.73], 3: [0.16, 0.5, 0.84] };
export const expedOpen = () => { const S = G.S; return !S.exp && !S.active && !S.haul; };
export const expEvent = id => EXP_EVENTS.find(e => e.id === id);
export function expedMap(locId, h, day = Math.floor(now() / 86400000)) {
  const r = mulberry(hashStr(`${locId}|${h}|${day}|${G.S.name}`)), n = EXPED.stations[h], used = {}, evs = new Set(), rows = [];
  const pickT = () => { const pool = Object.entries(EXP_NODES).filter(([k, x]) => !x.max || (used[k] || 0) < x.max); let w = r() * pool.reduce((a, [, x]) => a + x.w, 0);
    for (const [k, x] of pool) if ((w -= x.w) < 0) return k; return pool[0][0]; };
  for (let i = 0; i < n; i++) {
    const wd = EXPED.widths[i % EXPED.widths.length], row = [];
    for (let j = 0; j < wd; j++) { let t = pickT(); if (row.some(x => x.t === t) && r() < 0.7) t = pickT(); used[t] = (used[t] || 0) + 1;
      const node = { t, x: ROWX[wd][j] }; if (t === 'event') { let e; do e = EXP_EVENTS[Math.floor(r() * EXP_EVENTS.length)].id; while (evs.has(e) && evs.size < EXP_EVENTS.length); evs.add(e); node.ev = e; } row.push(node); }
    rows.push(row);
  }
  if (n >= 2 && !rows.flat().some(x => x.t === 'event')) { const nd = rows[n - 1][0]; nd.t = 'event'; nd.ev = EXP_EVENTS[Math.floor(r() * EXP_EVENTS.length)].id; }
  return { rows, goal: { t: 'goal', name: EXP_GOALS[locId] || 'Ziel', x: 0.5 } };
}
export const expLinked = (a, b) => Math.abs(a.x - b.x) <= 0.4;
// Weg gültig? path = Index je Reihe
export function expPathOk(map, path) {
  if (!Array.isArray(path) || path.length !== map.rows.length) return false;
  return path.every((j, i) => map.rows[i][j] && (i === 0 || expLinked(map.rows[i - 1][path[i - 1]], map.rows[i][j])));
}
// Schätzung für die Anzeige (ohne Ereignisse, ohne Gefahr-Verlust)
export function expedPreview(locId, h, path = null) {
  const l = LOCATIONS.find(x => x.id === locId), t = G.tripReward(l, 1, 45), map = expedMap(locId, h), hps = h / map.rows.length;
  const nodes = path && expPathOk(map, path) ? path.map((j, i) => map.rows[i][j]) : [];
  const p = { gold: Math.round(t.gold * h * EXPED.gold), xp: Math.round(t.xp * h * EXPED.xp), herbs: 0, mats: 0, items: 0, events: 0, bless: 0, danger: false,
    herb: HERB_LOC[l.id], matIds: [...new Set(l.mobs.map(nm => MONSTERS.find(m => m.name === nm).mat).filter(Boolean))] };
  for (const nd of nodes) { const d = EXP_NODES[nd.t];
    if (d.herb) p.herbs += d.herb * hps; if (d.mat) p.mats += d.mat * hps; if (d.item) p.items += Math.min(0.95, d.item * hps); if (d.gold) p.gold += Math.round(t.gold * d.gold * hps);
    if (d.xp) p.xp += Math.round(t.xp * d.xp * hps); if (d.bless) p.bless += d.bless; if (nd.t === 'event') p.events++; if (nd.t === 'danger') p.danger = true; }
  p.items += h >= EXPED.longH ? 1 : 0.5; return p;
}
export function startExped(locId, h, path) {
  const S = G.S, l = LOCATIONS.find(x => x.id === locId);
  if (!l || !G.locOpen(l) || !EXPED.hours.includes(h) || S.exp || S.active) return false;
  const map = expedMap(locId, h); if (!expPathOk(map, path)) return false;
  if (S.haul) G.bankHaul();
  S.exp = { loc: locId, h, start: now(), end: now() + h * 3600000, nodes: path.map((j, i) => ({ ...map.rows[i][j] })), goal: map.goal.name };
  return true;
}
// Stationen, die bis jetzt geschafft sind (das Ziel erst, wenn die Zeit ganz um ist)
export const expDoneCount = e => Math.min(e.nodes.length, Math.floor((now() - e.start) / (e.h * 3600000 / e.nodes.length)));
// Heimkehr beginnen (fertig = Heimholen, sonst Heimrufen: volle Stunden + geschaffte Stationen)
export function expBegin() {
  const S = G.S, e = S.exp; if (!e || e.ret) return e?.ret || null;
  const done = now() >= e.end, k = done ? e.nodes.length : expDoneCount(e), hrs = done ? e.h : Math.floor((now() - e.start) / 3600000);
  e.ret = { i: 0, list: [...e.nodes.slice(0, k), ...(done ? [{ t: 'goal', name: e.goal }] : [])], steps: [], hrs, early: !done,
    acc: { gold: 0, xp: 0, herbs: {}, mats: {}, items: [], glut: 0, bless: 0 }, cache: 0 };
  const l = LOCATIONS.find(x => x.id === e.loc), t = G.tripReward(l, 1, 45);
  e.ret.acc.gold += Math.round(t.gold * hrs * EXPED.gold); e.ret.acc.xp += Math.round(t.xp * hrs * EXPED.xp);
  return e.ret;
}
const expCtx = () => { const e = G.S.exp, l = LOCATIONS.find(x => x.id === e.loc); return { e, l, t: G.tripReward(l, 1, 45), hps: e.h / e.nodes.length, p: expedPreview(e.loc, e.h) }; };
const addTo = (o, k, n) => { if (n > 0) o[k] = (o[k] || 0) + n; };
// Wirkung (Ereignis) anwenden → Text für die Zeile
function expApply(eff, c) {
  const a = c.e.ret.acc, bits = [];
  if (eff.gold) { const g = Math.round(c.t.gold * eff.gold); a.gold = Math.max(0, a.gold + g); bits.push(g > 0 ? `+${g} Gold` : `${g} Gold`); }
  if (eff.xp) { const x = Math.round(c.t.xp * eff.xp); a.xp += x; bits.push(`+${x} EP`); }
  if (eff.herb) { addTo(a.herbs, c.p.herb, eff.herb); bits.push(`${HERBS[c.p.herb].name} ×${eff.herb}`); }
  if (eff.herbAny) for (let i = 0; i < eff.herbAny; i++) { const id = pick(Object.values(HERB_LOC)); addTo(a.herbs, id, 1); bits.push(HERBS[id].name); }
  if (eff.mat && c.p.matIds.length) for (let i = 0; i < eff.mat; i++) { const m = pick(c.p.matIds); addTo(a.mats, m, 1); bits.push(MATS[m]); }
  if (eff.item) { a.items.push(eff.item); bits.push(eff.item >= 3 ? 'seltenes Fundstück' : eff.item >= 2 ? 'magisches Fundstück' : 'Fundstück'); }
  if (eff.heart) { addTo(a.herbs, 'herz', eff.heart); bits.push('Schwarzes Herz'); }
  if (eff.bless) { a.bless += eff.bless; bits.push(eff.bless > 0 ? `Segen +${Math.round(eff.bless * 100)} %` : `Fluch ${Math.round(eff.bless * 100)} %`); }
  if (eff.glut) { a.glut += eff.glut; bits.push(`+${eff.glut} Glut`); }
  if (eff.cache) { c.e.ret.cache += eff.cache; bits.push('Versteck'); }
  return bits;
}
// Station ohne Wahl auflösen
function expNode(nd, c) {
  const a = c.e.ret.acc, d = EXP_NODES[nd.t], hps = c.hps, bits = [];
  if (nd.t === 'goal') {
    const r = c.e.h >= EXPED.longH ? 2 : chance(0.5) ? 1 : 0; if (r) { a.items.push(r); bits.push(r >= 2 ? 'magisches Fundstück' : 'Fundstück'); }
    if (c.e.ret.cache) { const n = 2 + c.e.ret.cache; for (let i = 0; i < n && c.p.matIds.length; i++) addTo(a.mats, pick(c.p.matIds), 1); bits.push(`Versteck: ${n} Material`); }
    return { t: 'goal', name: nd.name, text: bits.join(' · ') || 'leer – jemand war schneller', cls: bits.length ? 'up' : '' };
  }
  if (d.herb) { const n = rollN(d.herb * hps); for (let i = 0; i < n; i++) addTo(a.herbs, chance(0.75) ? c.p.herb : pick(Object.values(HERB_LOC)), 1); bits.push(`${n} Zutaten`); }
  if (d.mat && c.p.matIds.length) { const n = rollN(d.mat * hps); for (let i = 0; i < n; i++) addTo(a.mats, pick(c.p.matIds), 1); bits.push(`${n} Material`); }
  if (d.gold) { const g = Math.round(c.t.gold * d.gold * hps); a.gold += g; bits.push(`+${g} Gold`); }
  if (d.xp) { const x = Math.round(c.t.xp * d.xp * hps); a.xp += x; bits.push(`+${x} EP`); }
  if (d.item && chance(Math.min(0.95, d.item * hps))) { a.items.push(d.minR || 1); bits.push(d.minR >= 2 ? 'magisches Fundstück' : 'Fundstück'); }
  if (d.bless) { a.bless += d.bless; bits.push(`Segen +${Math.round(d.bless * 100)} %`); }
  if (d.risk && chance(d.risk)) {   // Gefahr: die Hälfte der bisherigen Beute ist fort
    a.gold = Math.floor(a.gold / 2); for (const o of [a.herbs, a.mats]) for (const k in o) o[k] = Math.floor(o[k] / 2); a.items = a.items.filter((_, i) => i % 2);
    return { t: nd.t, name: d.name, text: 'Überfallen – die Hälfte der Beute ist fort', cls: 'down' };
  }
  if (!bits.length) bits.push('nichts gefunden');
  return { t: nd.t, name: d.name, text: bits.join(' · '), cls: nd.t === 'danger' ? 'up' : '' };
}
// Ist eine Wahl möglich? (Kosten)
export function expChoiceOk(ch) {
  const S = G.S; if (ch.pot && !(S.pots[ch.pot] > 0)) return `Kein ${POTIONS.find(p => p.id === ch.pot).name}`;
  if (ch.herbCost && Object.entries(S.herbs).filter(([k]) => k !== 'herz').reduce((a, [, n]) => a + n, 0) + Object.values(S.exp?.ret?.acc.herbs || {}).reduce((a, b) => a + b, 0) < ch.herbCost) return 'Keine Zutat';
  if (ch.pay) { const { t } = expCtx(); if (S.gold + (S.exp?.ret?.acc.gold || 0) < Math.round(t.gold * ch.pay)) return 'Zu wenig Gold'; }
  return '';
}
export const expPayCost = ch => ch.pay ? Math.round(expCtx().t.gold * ch.pay) : 0;
// Weiter bis zum nächsten Ereignis oder zum Ende. → { ev } | { done: res }
export function expAdvance() {
  const S = G.S, e = S.exp; if (!e?.ret) return null; const c = expCtx(), R = e.ret;
  while (R.i < R.list.length) { const nd = R.list[R.i]; if (nd.t === 'event') return { ev: expEvent(nd.ev) }; R.steps.push(expNode(nd, c)); R.i++; }
  return { done: expFinish() };
}
export function expChoose(ci) {
  const S = G.S, e = S.exp, R = e?.ret, nd = R?.list[R.i]; if (!nd || nd.t !== 'event') return null;
  const ev = expEvent(nd.ev), ch = ev.ch[ci]; if (!ch || expChoiceOk(ch)) return null; const c = expCtx();
  if (ch.pot) S.pots[ch.pot]--;
  if (ch.herbCost) { const own = Object.keys(S.herbs).find(k => k !== 'herz' && S.herbs[k] > 0); if (own) S.herbs[own]--; else { const k = Object.keys(R.acc.herbs).find(x => R.acc.herbs[x] > 0); R.acc.herbs[k]--; } }
  if (ch.pay) { const g = Math.round(c.t.gold * ch.pay); if (S.gold >= g) S.gold -= g; else { R.acc.gold -= g - S.gold; S.gold = 0; } }
  let out = ch.out, eff = ch.eff || {}, cls = '';
  if (ch.risk) { const win = chance(ch.risk.p); eff = win ? ch.risk.win : ch.risk.lose; out = ch.out[win ? 0 : 1]; cls = win ? 'up' : 'down'; }
  const bits = expApply(eff, c); if (!cls) cls = Object.values(eff).some(v => v < 0) ? 'down' : bits.length ? 'up' : '';
  R.steps.push({ t: 'event', name: ev.title, choice: ch.t, out, text: bits.join(' · '), cls }); R.i++;
  return expAdvance();
}
function expFinish() {
  const S = G.S, e = S.exp, R = e.ret, a = R.acc, l = LOCATIONS.find(x => x.id === e.loc), rew = newRew();
  pay(rew, Math.max(0, a.gold), a.xp);
  for (const [k, n] of Object.entries(a.herbs)) if (n > 0) { G.addHerb(k, n); rew.herbs.push([k, n]); }
  for (const [k, n] of Object.entries(a.mats)) if (n > 0) { G.addMat(k, n); rew.mats.push([k, n]); }
  const lvl = G.locLvl(l); rew.items = [];
  for (const minRarity of a.items) { const it = makeItem(lvl, { luck: G.stats().lck, cls: CLASSES[S.cls], minRarity }); if (G.addToBag(it)) rew.items.push(it); else { S.gold += it.value; rew.gold += it.value; rew.items.push({ ...it, soldFull: true }); } }
  rew.item = rew.items[0] || null;
  if (a.glut) S.glut = Math.min(CFG.maxGlut, S.glut + a.glut);
  if (a.bless) S.bless = Math.max(EXPED.curseMax, Math.min(EXPED.blessMax, (S.bless || 0) + a.bless));
  const tales = EXP_TALES[l.id] || [''], tale = tales[Math.floor(e.start / 1000) % tales.length];
  S.exp = null; G.journal(`Zurück aus ${l.name}.`);
  return { place: l, h: R.hrs, early: R.early, steps: R.steps, rew, bless: a.bless, glut: a.glut, tale };
}
// Alte Schnittstelle (Tests/Bots): Heimkehr ganz durchlaufen, bei Ereignissen die erste mögliche Wahl
export function claimExped(pickChoice = ev => ev.ch.findIndex(c => !expChoiceOk(c))) {
  if (!G.S.exp) return null; expBegin(); let r = expAdvance();
  while (r && r.ev) { const want = pickChoice(r.ev), ok = r.ev.ch[want] && !expChoiceOk(r.ev.ch[want]); r = expChoose(ok ? want : r.ev.ch.findIndex(c => !expChoiceOk(c))); }
  return r?.done || null;
}
