// Spielzüge ohne DOM: Kampf ausführen, Belohnung anwenden, strukturiertes Ergebnis liefern.
// main.js zeigt das Ergebnis an; tests/ spielen damit ganze Verläufe durch.
import { CLASSES, CFG, CRYPTS, TALENTS, LOCATIONS, MONSTERS, TRACKS, DELVE } from './data.js';
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
const newRew = () => ({ gold: 0, xp: 0, up: 0, mats: [], item: null });
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
function tripLoot(l, m, tr, depth, od, rew) {
  const t = G.tripReward(l, 1, 45), mult = tr.rew * (1 + DELVE.rewPer * depth);
  const gold = Math.round(t.gold * mult * (od?.gold || 1)), xp = Math.round(t.xp * mult * (od?.xp || 1));
  rew.xp += xp; rew.gold += gold;
  if (m.mat && chance(CFG.matChance)) rew.mats.push([m.mat, 1 + (depth >= 2 ? 1 : 0)]);
  if (od?.mats && m.mat) rew.mats.push([m.mat, 2]);
  const p = od?.loot ? 1 : Math.min(1, tr.loot + depth * 0.1), minR = Math.max(od?.loot || 0, tr.minRarity || 0, depth >= 3 ? 3 : depth >= 1 ? 2 : 0);
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
  S.wins++; Q.event({ type: 'kill', mob: a.mob, loc: l.id });
  S.haul = { loc: l.id, track: tr.id, depth: 0, gold: 0, mats: {}, items: [] };
  tripLoot(l, m, tr, 0, od, rew);
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
  tripLoot(l, m, tr, h.depth, null, rew);
  G.journal(`Tiefe ${h.depth} in ${l.name} überlebt.`);
  return { A, B: m, r, win, rew, place: l, haul: h };
}
export const bank = () => G.bankHaul();

// --- Krypta-Kampf ---
export function cryptFight(id) {
  const S = G.S, c = CRYPTS.find(x => x.id === id);
  if (!c || now() < S.crypt.cd || !G.cryptOpen(c) || G.cryptFloor(c) >= 5) return null;
  const m = G.cryptEnemy(c), boss = !!m.boss;
  S.crypt.cd = now() + CFG.cryptCdSec * 1000;
  const A = G.stats(), r = fight(A, m), win = r.winner === 'a', rew = newRew();
  if (!win) { S.deaths++; G.journal(`${m.name} in ${c.name} hat mich niedergestreckt.`); return { A, B: m, r, win, rew, crypt: c }; }
  S.wins++; Q.event({ type: 'kill', mob: m.name }); if (boss) Q.event({ type: 'boss', crypt: c.id });
  Object.assign(rew, G.cryptWin(c));
  pay(rew, Math.round((10 + m.lvl * 5) * (boss ? 4 : 1)), Math.round((25 + m.lvl * 14) * (boss ? 3 : 1.2)));
  dropMat(m, rew); dropItem(m.lvl, boss ? 1 : 0.35, boss ? 3 : 2, rew);
  G.journal(boss ? `${m.name} ist gefallen. ${c.name} schweigt.` : `${m.name} in ${c.name} erschlagen.`);
  return { A, B: m, r, win, rew, crypt: c };
}

// --- Grube ---
export function arenaFight(R) {
  const S = G.S; if (now() < S.arenaTs || !R || S.glut < CFG.arenaGlut) return null;
  S.arenaTs = now() + CFG.arenaCdSec * 1000; S.glut -= CFG.arenaGlut;
  const A = G.stats(), B = G.stats(R), r = fight(A, B), win = r.winner === 'a', rew = newRew();
  if (win) { S.honor += 10; S.wins++; pay(rew, R.lvl * 3, 0); rew.honor = 10; Q.event({ type: 'arena' }); G.journal(`${R.name} in der Grube besiegt.`); }
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
export function winChance(key, makeEnemy, n = 24) {
  const A = G.stats(), sig = key + '|' + JSON.stringify([A.hp, A.dmg, A.armor, A[A.main], A.dex, A.lvl, S_omen()]);
  if (threatCache.has(sig)) return threatCache.get(sig);
  let w = 0; for (let i = 0; i < n; i++) if (fight(A, makeEnemy()).winner === 'a') w++;
  const p = w / n; if (threatCache.size > 200) threatCache.clear(); threatCache.set(sig, p); return p;
}
const S_omen = () => G.S.omen?.day;
export const tripChance = (l, track = 'norm') => winChance('trip:' + l.id + track, () => {
  const om = G.omenFor(l.id), od = om && !om.done ? om.def : null;
  return G.makeMonster(trackLvl(l, trackOf(track)), trackOf(track).diff * [0.92, 1, 1, 1.08][roll(0, 3)] * (od?.diff || 1), MONSTERS.find(m => m.name === pick(l.mobs)));
});
export const cryptChance = c => winChance('crypt:' + c.id + ':' + G.cryptFloor(c) + ':' + G.S.crypt.diff, () => G.cryptEnemy(c));
export const threatLabel = p => p >= 0.9 ? ['gering', 'low'] : p >= 0.65 ? ['mäßig', 'mid'] : p >= 0.35 ? ['hoch', 'high'] : ['tödlich', 'deadly'];
