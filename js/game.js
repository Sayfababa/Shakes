// Spielzüge ohne DOM: Kampf ausführen, Belohnung anwenden, strukturiertes Ergebnis liefern.
// main.js zeigt das Ergebnis an; tests/ spielen damit ganze Verläufe durch.
import { GRADES, CLASSES, CFG, CRYPTS, TALENTS, LOCATIONS, MONSTERS, TRACKS, DELVE, HERB_LOC, ALCH, POTIONS, HERBS } from './data.js';
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
  if (!c || now() < S.crypt.cd || !G.cryptOpen(c) || G.cryptFloor(c) >= 5) return null;
  const m = m0 || G.cryptEnemy(c), boss = !!m.boss;
  S.crypt.cd = now() + CFG.cryptCdSec * 1000;
  const A = { ...G.stats(), belt: G.beltCombat() }, r = fight(A, m), win = r.winner === 'a', rew = newRew();
  G.usePotions(r.used); rew.used = r.used;
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
  const S = G.S; if (now() < S.arenaTs || !R || S.glut < CFG.arenaGlut) return null;
  S.arenaTs = now() + CFG.arenaCdSec * 1000; S.glut -= CFG.arenaGlut;
  const A = G.stats(), B = G.stats(R), r = fight(A, B), win = r.winner === 'a', rew = newRew();
  if (win) { S.honor += 10; S.wins++; rew.grade = gradeOf(r); pay(rew, Math.round(R.lvl * 3 * (1 + rew.grade.bonus)), 0); rew.honor = 10; Q.event({ type: 'arena' }); G.bountyEvent({ type: 'arena' }); G.journal(`${R.name} in der Grube besiegt.`); }
  else { S.honor = Math.max(0, S.honor - 5); rew.honor = -5; S.deaths++; }
  return { A, B, r, win, rew };
}

// --- Champion einer Questkette (z. B. Vargos "Die Kette") ---
export function champFight(tid) {
  const S = G.S, q = Q.current(tid); if (!q?.champ || now() < S.arenaTs) return null;
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
export function winChance(key, makeEnemy, n = 24, belt = null) {
  const A = belt ? { ...G.stats(), belt } : G.stats(), sig = key + '|' + JSON.stringify([A.hp, A.dmg, A.armor, A[A.main], A.dex, A.lvl, S_omen(), belt?.map(b => b.id + b.trig)]);
  if (threatCache.has(sig)) return threatCache.get(sig);
  let w = 0; for (let i = 0; i < n; i++) if (fight(A, makeEnemy()).winner === 'a') w++;
  const p = w / n; if (threatCache.size > 200) threatCache.clear(); threatCache.set(sig, p); return p;
}
const S_omen = () => G.S.omen?.day;
export const tripChance = (l, track = 'norm') => winChance('trip:' + l.id + track, () => {
  const om = G.omenFor(l.id), od = om && !om.done ? om.def : null;
  return G.makeMonster(trackLvl(l, trackOf(track)), trackOf(track).diff * [0.92, 1, 1, 1.08][roll(0, 3)] * (od?.diff || 1), MONSTERS.find(m => m.name === pick(l.mobs)));
});
export const cryptChance = (c, belt = G.beltCombat()) => winChance('crypt:' + c.id + ':' + G.cryptFloor(c) + ':' + G.S.crypt.diff, () => G.cryptEnemy(c), 24, belt);
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
export function potOffer(id) {
  const S = G.S, p = G.potion(id);
  if (S.belt.slice(0, G.beltSlots()).some(b => b?.id === id) && S.pots[id] > 0) return { kind: 'in' };
  if (S.pots[id] > 0) return { kind: 'pack' };
  const cb = G.canBrew(id); if (cb.ok) return { kind: 'brew', gold: G.brewCost(id).gold };
  const miss = Object.entries(p.cost).find(([k, n]) => (S.herbs[k] || 0) < n);
  if (miss) { const loc = LOCATIONS.find(l => HERB_LOC[l.id] === miss[0]); return { kind: 'miss', text: `Fehlt: ${HERBS[miss[0]].name} (${miss[0] === 'herz' ? 'Krypta-Bosse' : loc?.name || '?'})` }; }
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
