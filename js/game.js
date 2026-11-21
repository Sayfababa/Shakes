// Spielzüge ohne DOM: Kampf ausführen, Belohnung anwenden, strukturiertes Ergebnis liefern.
// main.js zeigt das Ergebnis an; tests/ spielen damit ganze Verläufe durch.
import { GRADES, CLASSES, CFG, CRYPTS, TALENTS, LOCATIONS, MONSTERS, TRACKS, DELVE, HERB_LOC, ALCH, POTIONS, HERBS, EXPED, EXP_TALES, EXP_NODES, EXP_EVENTS, EXP_GOALS, MATS, DESCENT, DESC_ROOMS, ELITE, PIT, PIT_STYLES, PIT_RIVALS, PIT_RANKS, PIT_SHOP, PIT_RULES, DIFFICULTIES, SETS, SET, ACTS, ACT, CRYPT, WANDER, WANDER_ST } from './data.js';
import * as G from './state.js';
import * as Q from './quests.js';
import { fight } from './combat.js';
import { makeItem, makeSetItem } from './loot.js';
import { pick, roll, chance, rand, seeded } from './rng.js';

const now = () => Date.now();

function dropMat(m, rew, sure = 0) { if (m.mat && (sure || chance(CFG.matChance))) { const n = (m.boss ? 3 : 1) + sure; G.addMat(m.mat, n); rew.mats.push([m.mat, n]); } }
// Welle 1a: 20 % mehr Gegenstands-Drops (CFG.dropMult). Chancen wachsen mit, feste Anzahlen im Mittel (1 → 1,2),
// gesammelte Fundstücke (Expedition, Umherziehen) je Stück mit Chance auf ein zweites. Der Abgrund rechnet selbst.
const dropP = p => Math.min(1, p * CFG.dropMult);
const dropN = n => { const x = n * CFG.dropMult, k = Math.floor(x); return k + (chance(x - k) ? 1 : 0); };
const moreItems = list => list.flatMap(r => chance(CFG.dropMult - 1) ? [r, r] : [r]);
function dropItem(lvl, p, minRarity, rew) {
  if (!chance(dropP(p))) return;
  const it = makeItem(lvl, { luck: G.stats().lck, cls: CLASSES[G.S.cls], minRarity });
  const wo = G.keep(it); if (wo) rew.item = it; else { G.sellOff(it); rew.item = { ...it, soldFull: true }; }
}
// Kampfbewertung nach Restleben: wer stärker ist, gewinnt souveräner – und bekommt mehr
export const gradeOf = r => r.winner === 'a' ? GRADES.find(g => (r.left ?? 0) >= g.min) : null;
const newRew = () => ({ gold: 0, xp: 0, up: 0, mats: [], item: null, herbs: [] });
function dropHerb(id, p, n, rew) { if (id && chance(p)) { G.addHerb(id, n); rew.herbs.push([id, n]); return true; } return false; }
// Welche Zutat ein Fund gibt: meist die des Ortes, zu `ALCH.foreign` eine fremde. Ohne das flutet
// der Akt, in dem man farmt, seine Zutat und alle anderen verhungern – man scheitert dann nie an
// der Menge, immer an der Sorte. Expedition und Umherziehen halten es längst so.
const herbRoll = id => id && chance(ALCH.foreign) ? pick(Object.values(HERB_LOC).filter(h => h !== id)) : id;
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
  if (chance(dropP(p))) rew.item = makeItem(m.lvl, { luck: G.stats().lck + depth * 20, cls: CLASSES[G.S.cls], minRarity: minR });
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
  S.wins++; Q.event({ type: 'kill', mob: a.mob, loc: l.id }); G.bountyEvent({ type: 'kill', mob: a.mob }); G.bountyEvent({ type: 'zones' });
  S.haul = { loc: l.id, track: tr.id, depth: 0, gold: 0, mats: {}, items: [] };
  rew.grade = gradeOf(r); tripLoot(l, m, tr, 0, od, rew, rew.grade.bonus); dropHerb(herbRoll(HERB_LOC[l.id]), ALCH.herbChance, 1, rew);
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
  rew.grade = gradeOf(r); tripLoot(l, m, tr, h.depth, null, rew, rew.grade.bonus); dropHerb(herbRoll(HERB_LOC[l.id]), ALCH.herbChance, 1 + (h.depth >= 2 ? 1 : 0), rew);
  G.journal(`Tiefe ${h.depth} in ${l.name} überlebt.`);
  return { A, B: m, r, win, rew, place: l, haul: h };
}
export const bank = () => { const d = G.S.haul?.depth || 0, h = G.bankHaul(); if (h) G.bountyEvent({ type: 'bank', depth: d }); return h; };

// --- Krypta-Kampf ---
export function cryptFight(id, m0 = null) {
  const S = G.S, c = CRYPTS.find(x => x.id === id);
  if (!c || S.exp || S.desc || S.wander || now() < S.crypt.cd || !G.cryptOpen(c) || S.glut < G.cryptGlut(c)) return null;
  const m = m0 || G.cryptEnemy(c), t = G.cryptTier(c);
  S.crypt.cd = now() + CFG.cryptCdSec * 1000; S.glut -= G.cryptGlut(c);
  const A = blessed({ ...G.stats(), belt: G.beltCombat() }), r = fight(A, m), win = r.winner === 'a', rew = newRew();
  G.usePotions(r.used); rew.used = r.used; if (S.bless) { rew.bless = S.bless; S.bless = 0; }
  if (!win) { S.deaths++; G.journal(`${m.name} in ${c.name} hat mich niedergestreckt.`); return { A, B: m, r, win, rew, crypt: c }; }
  S.wins++; Q.event({ type: 'kill', mob: m.name }); Q.event({ type: 'boss', crypt: c.id }); G.bountyEvent({ type: 'crypt' }); G.bountyEvent({ type: 'kill', mob: m.name });
  Object.assign(rew, G.cryptWin(c)); rew.grade = gradeOf(r); if (rew.grade.id === 'dom') G.bountyEvent({ type: 'dom' }); const gb = 1 + rew.grade.bonus;
  pay(rew, Math.round((10 + m.lvl * 5) * 4 * gb), Math.round((25 + m.lvl * 14) * 3));
  dropMat(m, rew);
  // Das Herz bringt die Feldzutat mit – sonst farmt man die Krypta und kann die Tränke,
  // die genau dort wirken, nie brauen.
  if (dropHerb('herz', ALCH.heartChance, ALCH.bossHearts, rew)) dropHerb(herbRoll(HERB_LOC[G.cryptAct(c)?.loc]), ALCH.bossHerb, 1, rew);
  if (chance(DESCENT.sealCrypt)) { addSeal(1); rew.seal = 1; }      // die Krypta speist den Abgrund
  const k = CRYPT.rarAt.filter(x => t >= x).length - 1;   // höhere Stufe → mehr und bessere Beute
  rew.items = []; for (let i = 0, nI = dropN(CRYPT.items[k]); i < nI; i++) { const it = makeItem(m.lvl, { luck: G.stats().lck + t * 15, cls: CLASSES[S.cls], minRarity: Math.min(4, 2 + k + (i === 0 && t >= CRYPT.rarAt[2] ? 1 : 0)) }); rew.items.push(it); if (!G.keep(it)) { G.sellOff(it); it.soldFull = true; } }
  const sp = setDrop(c, t); if (sp) { rew.items.push(sp); rew.set = sp; if (!G.keep(sp)) { G.sellOff(sp); sp.soldFull = true; } }
  rew.item = rew.items[0];
  G.journal(`${m.name} ist gefallen (Stufe ${t + 1}).`);
  return { A, B: m, r, win, rew, crypt: c };
}

// Grab-Set-Teil beim Krypta-Boss: erst ab Stufe SET.minTier, Chance steigt je Stufe.
// Es fällt bevorzugt ein Teil, das der Held noch nicht hat – sonst wäre Sammeln reines Pech.
export function setDrop(c, t) {
  const set = SETS.find(x => x.crypt === c.id); if (!set || t < SET.minTier) return null;
  if (!chance(Math.min(SET.max, SET.chance + (t - SET.minTier) * SET.perTier))) return null;
  const have = G.setOwned(set.id), miss = set.parts.map((_, i) => i).filter(i => !have.has(i));
  return makeSetItem(set.id, miss.length ? pick(miss) : roll(0, set.parts.length - 1), G.cryptLvl(c));
}

// --- Die Akte ---
export const actZoneMob = (a, z) => LOCATIONS.find(l => l.id === a.loc).mobs[z % 3];
const zoneElite = (a, z) => { if (!ACT.elites.includes(z)) return null; const i = ACTS.indexOf(a) * 3 + z, M = ELITE.mods; return [M[i % M.length], M[(i + 2) % M.length]]; };
export function actEnemy(a, z) {
  const lvl = G.actZoneLvl(a, z), d = a.diff || 1; if (z >= ACT.zones) return G.makeBoss(a, lvl, (a.bossMult ?? ACT.bossMult) * d);   // einzelne Akte dürfen Elite/Boss eigens einstellen (Akt I: Einstieg)
  const el = zoneElite(a, z), m = G.makeMonster(lvl, (el ? a.eliteDiff ?? ACT.eliteDiff : 1) * d, MONSTERS.find(x => x.name === actZoneMob(a, z)));
  if (el) { m.hp = Math.round(m.hp * (a.eliteHp ?? ACT.eliteHp)); m.elite = el.map(e => e.name); m.name = 'Elite: ' + m.name;
    for (const e of el) { Object.assign(m, e.eff || {}); for (const [k, v] of Object.entries(e.mult || {})) m[k] = Math.round(m[k] * v); } }
  return m;
}
export const actZoneGlut = a => LOCATIONS.find(l => l.id === a.loc).glut;
// Darf dieses Gebiet gespielt werden? neu = frei, schon geschafft = Glut
export function actCan(a, z) {
  const S = G.S, p = G.actProg(a);
  if (S.exp) return 'Der Held ist auf Expedition.'; if (S.desc) return 'Der Held ist im Abgrund.'; if (S.wander) return 'Der Held zieht umher.';
  if (!G.actOpen(a) || z > Math.min(p, ACT.zones)) return 'Noch nicht erreicht.';
  if (z < p && S.glut < actZoneGlut(a)) return `Wiederholen kostet ${actZoneGlut(a)} Glut.`;
  return '';
}
const actRuns = (a, z, belt) => winRuns('act:' + a.id + ':' + z, () => actEnemy(a, z), CFG.chanceN, belt, false);
export const actChance = (a, z, belt = G.beltCombat()) => share(actRuns(a, z, belt));
export const actOdds = (a, z) => chancePair(actRuns(a, z, G.beltCombat()), actRuns(a, z, []));
export function actFight(id, z, m0 = null) {
  const S = G.S, a = ACTS.find(x => x.id === id); if (!a || actCan(a, z)) return null;
  const p = G.actProg(a), replay = z < p, boss = z >= ACT.zones, l = LOCATIONS.find(x => x.id === a.loc);
  if (replay) S.glut -= actZoneGlut(a);
  const m = m0 || actEnemy(a, z), om = G.omenFor(l.id), od = om && !om.done ? om.def : null;
  const A = { ...G.stats(), belt: G.beltCombat() }, r = fight(A, m), win = r.winner === 'a', rew = newRew();
  G.usePotions(r.used); rew.used = r.used;
  if (!win) { S.deaths++; G.journal(`${m.name} in ${l.name} hat mich niedergestreckt.`); return { A, B: m, r, win, rew, act: a, zone: z }; }
  S.wins++; const mob = boss ? m.name : actZoneMob(a, z);
  Q.event({ type: 'kill', mob, loc: l.id }); G.bountyEvent({ type: 'kill', mob }); G.bountyEvent({ type: 'zones' }); if (m.elite) G.bountyEvent({ type: 'elite' });
  rew.grade = gradeOf(r); if (rew.grade.id === 'dom') G.bountyEvent({ type: 'dom' }); const gb = 1 + rew.grade.bonus, lv = m.lvl;
  const xf = replay ? ACT.replay : boss ? ACT.bossXp : ACT.firstXp, gf = replay ? ACT.replay : boss ? ACT.bossGold : ACT.firstGold;
  pay(rew, Math.round((6 + lv * 4) * gf * gb * (od?.gold || 1)), Math.round((20 + lv * 12) * xf * (od?.xp || 1)));
  dropMat(m, rew, replay ? 0 : ACT.matFirst + (m.elite ? 1 : 0)); dropHerb(herbRoll(HERB_LOC[l.id]), ALCH.herbChance * (m.elite ? 2 : 1), 1, rew);   // erster Sieg in einem Gebiet: Material sicher und mehr
  if (boss) { rew.items = []; for (let i = 0, nI = dropN(ACT.bossItems); i < nI; i++) { const it = makeItem(lv, { luck: G.stats().lck + 20, cls: CLASSES[S.cls], minRarity: i ? 2 : 3 }); rew.items.push(it); if (!G.keep(it)) { G.sellOff(it); it.soldFull = true; } } rew.item = rew.items[0]; }
  else { const pos = z / ACT.zones, minR = m.elite ? 2 : pos >= 0.6 ? 2 : pos >= 0.3 ? 1 : 0;
    dropItem(lv, m.elite || od?.loot ? 1 : Math.min(1, ACT.itemP + rew.grade.bonus / 2), minR, rew); }
  if (od && G.fulfillOmen()) { Q.event({ type: 'omen' }); rew.omen = true; }
  if (!replay) { S.acts.prog[a.id] = z + 1; if (boss) { rew.actDone = a; G.journal(`${a.boss.name} ist gefallen. Akt ${a.n} ist geschafft.`); } }
  return { A, B: m, r, win, rew, act: a, zone: z };
}

// --- Grube ---
export function arenaFight(R) {
  const S = G.S; if (S.exp || S.desc || now() < S.arenaTs || !R || S.glut < CFG.arenaGlut) return null;
  S.arenaTs = now() + CFG.arenaCdSec * 1000; S.glut -= CFG.arenaGlut;
  const A = G.stats(), B = G.stats(R), r = fight(A, B), win = r.winner === 'a', rew = newRew();
  if (win) { S.honor += 10; S.wins++; rew.grade = gradeOf(r); pay(rew, Math.round(R.lvl * 3 * (1 + rew.grade.bonus)), 0); rew.honor = 10; Q.event({ type: 'arena' }); G.bountyEvent({ type: 'arena' }); G.journal(`${R.name} in der Grube besiegt.`); }
  else { S.honor = Math.max(0, S.honor - 5); rew.honor = -5; S.deaths++; }
  return { A, B, r, win, rew };
}

// --- Champion einer Questkette (z. B. Vargos "Die Kette") ---
export function champFight(tid) {
  const S = G.S, q = Q.current(tid); if (S.exp || S.desc || S.wander || !q?.champ || now() < S.arenaTs) return null;
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
// Probe-Kämpfe mit festem Würfel je Kampf (Keim aus der Nummer): „mit“ und „ohne Tränke“ treffen auf dieselben Gegner
// mit denselben Würfeln – der Unterschied ist dann der Gürtel, nicht das Glück. Ergebnis je Kampf: 1 = Sieg.
const probe = (n, one) => { const r = new Uint8Array(n); for (let i = 0; i < n; i++) r[i] = seeded(7919 * (i + 1), one) ? 1 : 0; return r; };
const share = r => r.reduce((s, x) => s + x, 0) / r.length;
function winRuns(key, makeEnemy, n, belt, bl) {
  const A0 = belt ? { ...G.stats(), belt } : G.stats(), A = bl ? blessed(A0) : A0, sig = key + '|' + n + '|' + JSON.stringify([A.hp, A.dmg, A.armor, A[A.main], A.dex, A.lvl, S_omen(), belt?.map(b => b.id + b.trig)]);
  if (threatCache.has(sig)) return threatCache.get(sig);
  const r = probe(n, () => fight(A, makeEnemy()).winner === 'a');
  if (threatCache.size > 200) threatCache.clear(); threatCache.set(sig, r); return r;
}
export const winChance = (key, makeEnemy, n = CFG.chanceN, belt = null, bl = false) => share(winRuns(key, makeEnemy, n, belt, bl));
// Mit gegen ohne Tränke aus denselben Würfeln. same: der Unterschied liegt im Rauschen (Vorzeichentest:
// b/c = Kämpfe, die nur mit bzw. nur ohne Tränke gewonnen wurden; |b−c| ≤ 2·√(b+c)) → Anzeige „etwa gleich“
export function chancePair(W, O) {
  let b = 0, c = 0; for (let i = 0; i < W.length; i++) { if (W[i] > O[i]) b++; else if (O[i] > W[i]) c++; }
  return { pW: share(W), p0: share(O), same: Math.abs(b - c) <= 2 * Math.sqrt(b + c) };
}
const S_omen = () => G.S.omen?.day;
export const tripChance = (l, track = 'norm') => winChance('trip:' + l.id + track, () => {
  const om = G.omenFor(l.id), od = om && !om.done ? om.def : null;
  return G.makeMonster(trackLvl(l, trackOf(track)), trackOf(track).diff * [0.92, 1, 1, 1.08][roll(0, 3)] * (od?.diff || 1), MONSTERS.find(m => m.name === pick(l.mobs)));
});
const cryptRuns = (c, belt) => winRuns('crypt:' + c.id + ':' + G.cryptTier(c), () => G.cryptEnemy(c), CFG.chanceN, belt, true);
export const cryptChance = (c, belt = G.beltCombat()) => share(cryptRuns(c, belt));
export const cryptOdds = c => chancePair(cryptRuns(c, G.beltCombat()), cryptRuns(c, []));
// Rat bei schlechter Siegchance (Vorbereitung): die naheliegendste Abhilfe zuerst. null = kein Rat nötig
export function weakAdvice(p) {
  const S = G.S; if (p >= 0.35) return null;
  if (S.points > 0) return `${S.points} Punkte verteilen (Held → Werte)`;
  if (G.talentPoints() > 0) return 'Talentpunkt offen (Held → Talente)';
  if (G.waysPending() > 0) return 'Zauber-Weg wählen (Held → Zauber)';
  const pw = G.power(); if (S.bag.some(it => it.slot && G.powerWith(it).then > pw * 1.01)) return 'Im Beutel liegt Besseres (grünes ▲)';
  return 'Zu stark für dich: Gebiete wiederholen, beim Händler rüsten';
}
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
// Welchen Platz ein Trank in der Vorbereitung bekommt: ein seltener ersetzt den seltenen (höchstens einer im Gürtel),
// sonst ein freier Platz, sonst einer, der gegen diesen Gegner nicht gebraucht wird (keep). weg = wen er verdrängt –
// das muss vor und nach dem Tippen dastehen, sonst sieht es aus, als überschriebe er grundlos den ersten Platz.
export function packSlot(id, keep = []) {
  const S = G.S, n = G.beltSlots(), p = G.potion(id), slots = S.belt.slice(0, n);
  let i = p.rare ? slots.findIndex(b => b && G.potion(b.id).rare) : -1;
  if (i < 0) i = slots.findIndex(b => !b);
  if (i < 0) i = slots.findIndex(b => !keep.includes(b.id));
  if (i < 0) i = n - 1;
  const b = slots[i]; return { i, weg: b && b.id !== id ? G.potion(b.id).name : null };
}
// Trank in den Gürtel legen (vorher brauen, wenn nötig). Ergebnis: false, oder { weg } wie bei packSlot
export function packPotion(id, keep = []) {
  const S = G.S, slots = S.belt.slice(0, G.beltSlots());
  if (!(S.pots[id] > 0) && !G.brew(id)) return false;
  if (slots.some(b => b?.id === id)) return { weg: null };
  const { i, weg } = packSlot(id, keep);
  return G.setBelt(i, id) ? { weg } : false;
}
// Bester Gürtel gegen genau diesen Gegner: alle Kombinationen vorrätiger Tränke (höchstens ein seltener) in Kämpfen ausprobieren
export function bestBelt(m, n = 50) {
  const S = G.S, k = G.beltSlots(), have = POTIONS.filter(p => S.pots[p.id] > 0), A0 = G.stats();
  const combos = [[]]; for (const p of have) for (const c of [...combos]) if (c.length < k && !(p.rare && c.some(x => x.rare))) combos.push([...c, p]);
  let best = null, bw = -1;
  for (const c of combos) { if (c.length < Math.min(k, have.length) && combos.some(x => x.length > c.length)) continue;
    const belt = c.map(p => ({ id: p.id, name: p.name, fx: p.fx, rare: p.rare, trig: p.trig?.[0] || null }));
    const A = { ...A0, belt }, w = share(probe(n, () => fight(A, m).winner === 'a'));   // gleiche Würfel für jede Kombination
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
export const expedOpen = () => { const S = G.S; return !S.exp && !S.desc && !S.active && !S.haul && !S.wander; };
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
  if (!l || !G.locOpen(l) || !EXPED.hours.includes(h) || S.exp || S.desc || S.active || S.wander) return false;
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
  for (const minRarity of moreItems(a.items)) { const it = makeItem(lvl, { luck: G.stats().lck, cls: CLASSES[S.cls], minRarity }); if (G.keep(it)) rew.items.push(it); else { rew.gold += G.sellOff(it).gold; rew.items.push({ ...it, soldFull: true }); } }
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

// --- Der Abstieg: Gruft-Karte mit Ausgängen. Leben + Trank-Ladungen laufen mit, Beute im Sack zählt erst draußen ---
// Eingang unten, Boss oben. Reihen wie bei der Expedition (gleiche Verbindungsregel), aber Raum für Raum gewählt.
export const descOpen = c => !!c && G.S.trophies.some(t => t.key.split(':')[0] === c.id);
export const descCrypts = () => CRYPTS.filter(descOpen);
// Grabsiegel: die taegliche Gutschrift wird beim Hinsehen nachgetragen – auch fuer verpasste
// Tage, bis zum Deckel. Deshalb verfaellt nichts mehr, wenn man einen Tag nicht hineinsieht.
export function descLeft() {
  const S = G.S, d = G.today();
  if (S.seals?.day !== d) {
    // Ein unlesbares oder zukuenftiges Datum im Stand darf nie NaN Siegel ergeben.
    const diff = Math.round((new Date(d) - new Date(S.seals?.day)) / 864e5);
    const miss = Number.isFinite(diff) && diff > 0 ? Math.min(diff, DESCENT.sealMax) : 1;
    S.seals = { day: d, n: Math.min(DESCENT.sealMax, (S.seals?.n || 0) + miss * DESCENT.sealDay) };
  }
  return S.seals.n;
}
export function addSeal(n = 1) { descLeft(); G.S.seals.n = Math.min(DESCENT.sealMax, G.S.seals.n + n); }
export const descBusy = () => { const S = G.S; return S.exp ? 'Dein Held ist auf Expedition.' : S.wander ? 'Dein Held zieht umher.' : S.active ? 'Erst den Streifzug beenden.' : S.haul ? 'Erst die Beute des Streifzugs sichern.' : ''; };
export const descCanStart = c => { const S = G.S; return descOpen(c) && !S.desc && !descBusy() && descLeft() > 0; };
export const descLvl = c => Math.max(c.lvl + 1, G.S.lvl + DESCENT.lvlAdd);
const descNowLvl = () => Math.max(G.S.desc.lvl, G.S.lvl + DESCENT.lvlAdd);   // wer unten aufsteigt, trifft stärkere Gegner
export const descMult = (u = G.S.desc?.unrest || 0) => Math.round((1 + u * DESCENT.unrestLoot) * 10) / 10;
const descDiff = u => DESCENT.diff * (1 + u * DESCENT.unrestDiff) * DIFFICULTIES[G.S.crypt.diff].mult;
const descCrypt = () => CRYPTS.find(x => x.id === G.S.desc.c);
function descNode(c, t, x) {
  const n = { t, x }; if (t === 'fight' || t === 'elite') n.mob = pick(c.floors);
  if (t === 'elite') n.mods = [...ELITE.mods].sort(() => rand() - 0.5).slice(0, 2).map(m => m.id);
  return n;
}
export function descMap(c) {
  const used = {}, rows = [];
  const pickT = r => { const pool = Object.entries(DESC_ROOMS).filter(([k, x]) => x.w && r >= (x.minR || 0) && (!x.max || (used[k] || 0) < x.max));
    let w = rand() * pool.reduce((a, [, x]) => a + x.w, 0); for (const [k, x] of pool) if ((w -= x.w) < 0) return k; return 'fight'; };
  DESCENT.widths.forEach((wd, r) => {
    const row = []; for (let j = 0; j < wd; j++) { const t = r === 0 ? 'fight' : pickT(r); used[t] = (used[t] || 0) + 1; row.push(descNode(c, t, ROWX[wd][j])); }
    if (r === DESCENT.rope || r === DESCENT.well) { const j = chance(0.5) ? 0 : wd - 1; row[j] = { t: r === DESCENT.rope ? 'rope' : 'well', x: row[j].x }; }
    rows.push(row);
  });
  return rows;
}
export function descStart(cid) {
  const S = G.S, c = CRYPTS.find(x => x.id === cid); if (!descCanStart(c)) return null;
  descLeft(); S.seals.n--;
  S.desc = { c: c.id, lvl: descLvl(c), rows: descMap(c), path: [], unrest: 0, hpf: 1, rooms: 0, xp: 0, sack: { gold: 0, items: [], mats: {}, herbs: {} } };
  G.journal(`Abstieg in ${c.name}.`); return S.desc;
}
// Erreichbare Räume der nächsten Reihe (Indizes), oben 'boss'
export function descNext() {
  const D = G.S.desc; if (!D) return []; const r = D.path.length;
  if (r >= D.rows.length) return ['boss'];
  if (r === 0) return D.rows[0].map((_, j) => j);
  const cur = D.rows[r - 1][D.path[r - 1]]; return D.rows[r].map((_, j) => j).filter(j => expLinked(cur, D.rows[r][j]));
}
export const descNodeAt = j => { const D = G.S.desc; return j === 'boss' ? 'boss' : D.rows[D.path.length]?.[+j] || null; };
export const descWellCost = () => DESCENT.wellGold * G.S.desc.lvl;
export function descEnemy(nd, u = G.S.desc.unrest) {
  const D = G.S.desc, c = descCrypt();
  if (nd === 'boss') return G.makeBoss(c, descNowLvl(), DESCENT.boss * DIFFICULTIES[G.S.crypt.diff].mult);   // Boss wächst nicht mit der Unruhe: er ist schon am Ende des Wegs
  const elite = nd.t === 'elite', m = G.makeMonster(descNowLvl(), descDiff(u) * (elite ? ELITE.diff : 1), MONSTERS.find(x => x.name === nd.mob));
  if (elite) { m.hp = Math.round(m.hp * ELITE.hp); m.elite = nd.mods.map(id => ELITE.mods.find(x => x.id === id).name);
    for (const id of nd.mods) { const e = ELITE.mods.find(x => x.id === id); Object.assign(m, e.eff || {}); for (const [k, v] of Object.entries(e.mult || {})) m[k] = Math.round(m[k] * v); }
    m.name = `${m.name} (Elite)`; }
  return m;
}
const descHero = () => { const A = { ...G.stats(), belt: G.beltCombat() }; A.cur0 = Math.max(1, Math.round(A.hp * G.S.desc.hpf)); return A; };
// Siegchance mit dem Leben, das du gerade hast (j = Raum-Index, 'boss' oder 'stair')
export function descChance(j) {
  const D = G.S.desc; if (!D) return null; const stair = j === 'stair', nd = stair ? null : descNodeAt(j);
  if (!stair && !(nd === 'boss' || nd?.t === 'fight' || nd?.t === 'elite')) return null;
  const A = descHero(), c = descCrypt(), u = D.unrest + (stair ? DESCENT.stairUnrest : 0);
  const key = 'desc|' + JSON.stringify([D.c, D.path, j, u, A.cur0, A.hp, A.dmg, A.armor, A[A.main], A.belt.map(b => b.id + b.trig)]);
  if (threatCache.has(key)) return threatCache.get(key);
  let w = 0; for (let i = 0; i < 24; i++) if (fight(A, descEnemy(stair ? { t: 'fight', mob: pick(c.floors) } : nd, u)).winner === 'a') w++;
  const p = w / 24; if (threatCache.size > 200) threatCache.clear(); threatCache.set(key, p); return p;
}
function descLoot(lvl, u, { gold = 1, item = 0, minR = 0, heart = 0, mat = null, kron = 0 }) {
  const S = G.S, s = S.desc.sack, k = descMult(u), got = { gold: Math.round((10 + lvl * 5) * DESCENT.gold * gold * k), items: [], mats: [], herbs: [] };
  s.gold += got.gold;
  for (let n = rollN(item * Math.sqrt(k)); n > 0; n--) {
    const it = makeItem(lvl, { luck: G.stats().lck + u * 15, cls: CLASSES[S.cls], minRarity: Math.max(minR, u >= 5 ? 3 : u >= 3 ? 2 : 0) });
    s.items.push(it); got.items.push(it); }
  if (mat && chance(Math.min(1, CFG.matChance * k))) { const n = Math.max(1, rollN(k / 2)); s.mats[mat] = (s.mats[mat] || 0) + n; got.mats.push([mat, n]); }
  if (heart && chance(Math.min(1, heart * k))) { s.herbs.herz = (s.herbs.herz || 0) + 1; got.herbs.push(['herz', 1]);
    const h = herbRoll(HERB_LOC[G.cryptAct(descCrypt())?.loc]);                 // dieselbe Regel wie in der Krypta
    if (h && chance(ALCH.bossHerb)) { s.herbs[h] = (s.herbs[h] || 0) + 1; got.herbs.push([h, 1]); } }
  // Kronsplitter: der einzige Weg, ein volles magisches Teil zu erheben. Er liegt tief und
  // zählt erst, wenn der Sack oben ankommt – stirbt man, ist er weg.
  if (kron && chance(Math.min(1, kron * k))) { s.mats.kronsplitter = (s.mats.kronsplitter || 0) + 1; got.mats.push(['kronsplitter', 1]); }
  return got;
}
function descExtract(how) {
  const S = G.S, D = S.desc, s = D.sack, c = descCrypt(), out = { how, crypt: c.name, rooms: D.rooms, unrest: D.unrest, xp: D.xp, gold: s.gold, items: [], mats: [], herbs: [] };
  S.gold += s.gold;
  for (const it of s.items) { if (G.keep(it)) out.items.push(it); else { out.gold += G.sellOff(it).gold; out.items.push({ ...it, soldFull: true }); } }
  for (const [k, n] of Object.entries(s.mats)) if (n > 0) { G.addMat(k, n); out.mats.push([k, n]); }
  for (const [k, n] of Object.entries(s.herbs)) if (n > 0) { G.addHerb(k, n); out.herbs.push([k, n]); }
  S.desc = null; G.journal(`Aus ${c.name} entkommen (${how}): ${out.gold} Gold, ${out.items.length} Fundstück(e).`);
  return out;
}
function descFight(nd, u, exit = null) {
  const S = G.S, D = S.desc, c = descCrypt(), boss = nd === 'boss', elite = nd?.t === 'elite';
  const A = descHero(), m = descEnemy(nd, u), r = fight(A, m), win = r.winner === 'a', rew = newRew();
  G.usePotions(r.used); rew.used = r.used; D.hpf = Math.max(0, r.endA / A.hp);
  if (!win) { S.deaths++; const lost = { ...D.sack, rooms: D.rooms, unrest: D.unrest, xp: D.xp, crypt: c.name }; S.desc = null;
    G.journal(`In ${c.name} gefallen. Der Sack bleibt unten.`); return { A, B: m, r, win, rew, desc: { lost } }; }
  S.wins++; Q.event({ type: 'kill', mob: boss ? c.boss.name : nd.mob }); if (boss) Q.event({ type: 'boss', crypt: c.id }); G.bountyEvent({ type: 'kill', mob: boss ? c.boss.name : nd.mob }); if (elite) G.bountyEvent({ type: 'elite' });
  rew.grade = gradeOf(r); if (rew.grade.id === 'dom') G.bountyEvent({ type: 'dom' });
  const xp = Math.round((25 + m.lvl * 14) * DESCENT.xp * (boss ? 3 : elite ? 1.5 : 1)); rew.xp = xp; rew.up = G.gainXp(xp); D.xp += xp;
  const gb = 1 + rew.grade.bonus;   // Kampfbewertung: mehr Gold wie überall
  rew.sack = descLoot(m.lvl, u, boss ? { gold: 4 * gb, item: 2, minR: DESCENT.bossMinR, heart: 1, mat: m.mat, kron: DESCENT.kronBoss } : elite ? { gold: 1.8 * gb, item: 1, minR: DESCENT.eliteMinR, heart: DESCENT.eliteHeart, mat: m.mat, kron: DESCENT.kronElite }
    : { gold: gb, item: DESCENT.item, heart: DESCENT.heart, mat: m.mat });
  // Wer ganz durchkommt, bekommt sein Siegel zurueck – der Haken, der nach unten zieht.
  if (boss) addSeal(DESCENT.sealBoss);
  if (boss || exit) return { A, B: m, r, win, rew, desc: { out: descExtract(boss ? c.boss.name : exit), seal: boss ? DESCENT.sealBoss : 0 } };
  return { A, B: m, r, win, rew, desc: { hpf: D.hpf } };
}
// Einen Raum betreten. Ergebnis: { kind: 'fight', res } | { kind: 'room', t, text, got? } | { kind: 'out', out }
export function descEnter(j) {
  const S = G.S, D = S.desc; if (!D) return null;
  const key = j === 'boss' ? 'boss' : +j; if (!descNext().includes(key)) return null;
  const nd = descNodeAt(key), t = nd === 'boss' ? 'boss' : nd.t;
  if (t === 'well' && descWellCost() > S.gold + D.sack.gold) return null;
  if (t !== 'boss') D.path.push(key);
  const u = D.unrest;
  if (t === 'rope' || t === 'well') {
    if (t === 'well') { const g = descWellCost(), fromSack = Math.min(D.sack.gold, g); D.sack.gold -= fromSack; S.gold -= g - fromSack; }
    return { kind: 'out', out: descExtract(DESC_ROOMS[t].name) };
  }
  D.rooms++; D.unrest++;
  if (t === 'shrine') { const h = Math.min(1 - D.hpf, DESCENT.heal); D.hpf = Math.min(1, D.hpf + DESCENT.heal);
    return { kind: 'room', t, text: `Das Wasser im Becken ist kalt und klar. +${Math.round(h * 100)} % Leben.` }; }
  if (t === 'treasure') { const got = descLoot(descNowLvl(), u, { gold: 1.5, item: 1, minR: 2 }), trap = chance(DESCENT.trap);
    if (trap) D.hpf = Math.max(0.05, D.hpf - DESCENT.trapDmg);
    return { kind: 'room', t, got, trap, text: trap ? `Eine Klinge schnellt aus der Wand. −${Math.round(DESCENT.trapDmg * 100)} % Leben.` : 'Niemand hat diese Kammer bewacht. Seltsam.' }; }
  return { kind: 'fight', res: descFight(nd, u) };
}
// Rückweg über die Stiege: ein Kampf bei höherer Unruhe, dann draußen. Vor dem ersten Raum: umkehren ohne Kampf (zählt nicht).
export function descStair() {
  const S = G.S, D = S.desc; if (!D) return null;
  if (!D.rooms) { S.desc = null; addSeal(1); return { kind: 'back' }; }   // Umkehren vor Raum 1 kostet nichts
  return { kind: 'fight', res: descFight({ t: 'fight', mob: pick(descCrypt().floors) }, D.unrest + DESCENT.stairUnrest, 'Stiege') };
}

// --- Die Grube: Rangleiter (S.pit.lad = Platz 1..51, 'me' = der Held) ---
const weekNo = () => Math.floor((now() - Date.UTC(2024, 0, 1)) / 6048e5);   // Montag-Woche (UTC)
export const pitPlace = () => G.S.pit.lad.indexOf('me') + 1;
export const pitLvlAt = p => Math.max(1, Math.round(PIT.lvlBottom + (PIT.size + 1 - p) / PIT.size * (PIT.lvlTop - PIT.lvlBottom)));
export const pitRank = (p = pitPlace()) => [...PIT_RANKS].reverse().find(r => p <= r.max);
export const pitRival = id => PIT_RIVALS.find(r => r.id === id);
export const pitBusy = () => G.S.exp ? 'Der Held ist auf Expedition.' : G.S.wander ? 'Der Held zieht umher.' : G.S.desc ? 'Der Held ist im Abgrund.' : now() < G.S.pit.ts ? 'Pause' : '';
const foeCache = new Map();
// Ein Rivale als Kampfwerte: Stufe/Ausrüstung aus seinem Platz, dazu sein fester Stil
export function pitFoe(id, place) {
  const k = id + ':' + place; if (foeCache.has(k)) return foeCache.get(k);
  const rv = pitRival(id), st = PIT_STYLES[rv.style];
  const R = makeRival({ name: rv.name, cls: rv.cls, lvl: pitLvlAt(place), rich: place <= PIT.richFrom ? 1 : 0,
    minRarity: place <= PIT.legFrom ? 4 : place <= PIT.rareFrom ? 3 : place <= PIT.magicFrom ? 2 : 0 });
  const B = G.stats(R); for (const [s, v] of Object.entries(st.eff || {})) B[s] = (B[s] || 0) + v;
  for (const [s, v] of Object.entries(st.mult || {})) B[s] = Math.round(B[s] * v);
  Object.assign(B, { name: rv.name, rid: id, place, style: rv.style });
  if (foeCache.size > 120) foeCache.clear(); foeCache.set(k, B); return B;
}
// Woche: Laden + Herausforderung frisch
export function pitWeek() {
  const S = G.S, P = S.pit, w = weekNo(); if (P.week === w) return P;
  const pl = pitPlace(), place = Math.max(1, pl - PIT.chAbove), rid = P.lad[place - 1] === 'me' ? P.lad[place] : P.lad[place - 1];
  Object.assign(P, { week: w, buys: 0, shop: {}, ch: { rid, place, rule: PIT_RULES[w % PIT_RULES.length].id, tries: PIT.chTries, won: false } });
  return P;
}
export const pitChallenge = () => pitWeek().ch;
const pitHonorFor = (id, place) => Math.round((PIT.honorBase + PIT.honorPerPlace * (pitPlace() - place)) * ((G.S.pit.foes[id] || 0) >= PIT.foeAfter ? PIT.foeMult : 1));
// Die 3 Rivalen über dir (nächster zuerst)
export function pitFoes() {
  const P = pitWeek(), i = P.lad.indexOf('me'), out = [];
  for (let j = i - 1; j >= Math.max(0, i - PIT.look); j--) { const id = P.lad[j], B = pitFoe(id, j + 1);
    out.push({ id, place: j + 1, B, honor: pitHonorFor(id, j + 1), foe: (P.foes[id] || 0) >= PIT.foeAfter, p: pitChance(B) }); }
  return out;
}
// Beide Seiten mit Regel der Herausforderung
function pitSides(B0, rule, belt = G.beltCombat()) {
  const R = PIT_RULES.find(r => r.id === rule), A = { ...G.stats(), belt: rule === 'nopots' ? [] : belt }, B = { ...B0 };
  for (const x of [A, B]) { for (const [k, v] of Object.entries(R?.both || {})) x[k] = (x[k] || 0) + v; for (const [k, v] of Object.entries(R?.bothMult || {})) x[k] = Math.round(x[k] * v); }
  return [A, B];
}
const pitCache = new Map();
function pitRuns(B0, rule, belt, n) {
  const [A, B] = pitSides(B0, rule, belt), sig = [B0.rid, B0.place, rule, n, A.hp, A.dmg, A.armor, A[A.main], A.dex, A.lvl, A.belt.map(b => b.id + b.trig)].join('|');
  if (pitCache.has(sig)) return pitCache.get(sig);
  const r = probe(n, () => fight(A, B).winner === 'a');
  if (pitCache.size > 200) pitCache.clear(); pitCache.set(sig, r); return r;
}
export const pitChance = (B0, rule = null, belt = G.beltCombat(), n = CFG.chanceN) => share(pitRuns(B0, rule, belt, n));
export const pitOdds = (B0, rule = null) => chancePair(pitRuns(B0, rule, G.beltCombat(), CFG.chanceN), pitRuns(B0, rule, [], CFG.chanceN));
// Gegner für die Vorbereitung (gleiche Instanz wie im Kampf)
export function pitTarget(id, ch = false) {
  const P = pitWeek();
  if (ch) { const c = P.ch; return c && c.rid === id ? pitFoe(id, c.place) : null; }
  const i = P.lad.indexOf('me'), j = P.lad.indexOf(id); return j >= 0 && j < i && i - j <= PIT.look ? pitFoe(id, j + 1) : null;
}
export const pitWinHonor = (id, ch) => ch ? PIT.chHonor : pitHonorFor(id, G.S.pit.lad.indexOf(id) + 1);
export function pitFight(id, ch = false) {
  const S = G.S, P = pitWeek(); if (pitBusy()) return null;
  const B0 = pitTarget(id, ch); if (!B0) return null;
  const c = ch ? P.ch : null; if (c && (c.won || c.tries <= 0)) return null;
  const [A, B] = pitSides(B0, c?.rule); if (c) c.tries--;
  const r = fight(A, B), win = r.winner === 'a', rew = newRew(); G.usePotions(r.used); rew.used = r.used;
  if (!win) { S.deaths++; if (!c) P.foes[id] = (P.foes[id] || 0) + 1; P.ts = now() + PIT.cdLose * 1000; return { A, B, r, win, rew, pit: true }; }
  S.wins++; rew.grade = gradeOf(r); pay(rew, Math.round(B0.lvl * PIT.goldPerLvl * (1 + rew.grade.bonus)), 0);
  Q.event({ type: 'arena' }); G.bountyEvent({ type: 'arena' });
  const honor = ch ? PIT.chHonor : pitHonorFor(id, B0.place);
  if (c) c.won = true;
  else { const i = P.lad.indexOf('me'), j = P.lad.indexOf(id); [P.lad[i], P.lad[j]] = [P.lad[j], P.lad[i]]; delete P.foes[id];
    G.journal(`${B0.name} in der Grube besiegt. Platz ${j + 1}.`);
    if (j + 1 < P.best) { P.best = j + 1;
      for (const rk of PIT_RANKS) if (rk.title && P.best <= rk.max && !P.ranks.includes(rk.id)) { P.ranks.push(rk.id); P.titles.push(rk.title);
        S.trophies.push({ key: 'pit:' + rk.id, name: rk.name, diff: 'Grube', eff: rk.perk }); rew.rankUp = rk;
        addSeal(DESCENT.sealRank); rew.seal = DESCENT.sealRank; } } }
  S.honor += honor; rew.honor = honor; P.ts = now() + PIT.cdWin * 1000;
  return { A, B, r, win, rew, pit: true };
}
// Vargos Laden: je freigeschalteter Rang-Stufe feste Ware für die Woche
export const pitTierOpen = rid => G.S.pit.best <= PIT_RANKS.find(r => r.id === rid).max;
export function pitShop() {
  const S = G.S, P = pitWeek();
  for (const t of PIT_SHOP) if (pitTierOpen(t.rank) && !P.shop[t.rank]) P.shop[t.rank] = t.wares.map(w => w.t === 'item'
    ? { ...w, item: makeItem(S.lvl, { slot: w.slot, kind: w.own ? CLASSES[S.cls].weapon : undefined, cls: CLASSES[S.cls], minRarity: w.minRarity }) } : { ...w });
  return P.shop;
}
export function pitBuy(tier, k) {
  const S = G.S, P = pitWeek(), w = pitShop()[tier]?.[k];
  if (P.buys >= PIT.weekBuys) return 'Diese Woche nichts mehr.'; if (!w) return 'Noch gesperrt.'; if (w.sold) return 'Schon gekauft.'; if (S.honor < w.price) return 'Zu wenig Ehre.';
  if (w.t === 'item') { if (!G.addToBag({ ...w.item })) return 'Kein Platz im Beutel.'; }
  else if (w.t === 'herb') G.addHerb(w.id, w.n); else G.addMat(w.id, w.n);
  S.honor -= w.price; w.sold = true; P.buys++; return '';
}
export function pitTitle(t) { const S = G.S; if (t && !S.pit.titles.includes(t)) return false; S.title = t || null; return true; }

// --- Umherziehen: Idle bei offener App. Rechnet nach Uhrzeit (Hintergrund-Tab), steht still, wenn die App zu war. ---
export const wanderAct = () => [...ACTS].reverse().find(a => G.actProg(a) > 0) || null;
export const wanderBusy = () => { const S = G.S; return S.exp ? 'Der Held ist auf Expedition.' : S.desc ? 'Der Held ist im Abgrund.' : S.wander ? 'Er zieht schon umher.' : !wanderAct() ? 'Erst ein Gebiet im Akt schaffen.' : ''; };
const wanderKind = () => { let r = rand() * WANDER.kinds.reduce((a, k) => a + k.w, 0); for (const k of WANDER.kinds) if ((r -= k.w) < 0) return k.id; return 'fight'; };
const wanderZone = a => Math.min(G.actProg(a), ACT.zones + 1) - 1;
// Karte zum Selbstwählen (je Akt und Tag gleich)
export function wanderMap(aId, day = Math.floor(now() / 86400000)) {
  const r = mulberry(hashStr(`w|${aId}|${day}|${G.S.name}`)), used = {}, rows = [];
  const pickT = () => { const pool = Object.entries(WANDER_ST).filter(([k, x]) => !x.max || (used[k] || 0) < x.max); let w = r() * pool.reduce((a, [, x]) => a + x.w, 0);
    for (const [k, x] of pool) if ((w -= x.w) < 0) return k; return pool[0][0]; };
  for (let i = 0; i < WANDER.rows; i++) { const wd = WANDER.widths[i % WANDER.widths.length], row = [];
    for (let j = 0; j < wd; j++) { let t = pickT(); if (row.some(x => x.t === t)) t = pickT(); used[t] = (used[t] || 0) + 1; row.push({ t, x: ROWX[wd][j] }); }
    rows.push(row); }
  return { rows };
}
function wanderNext(W) { const a = ACTS.find(x => x.id === W.a), st = W.route?.[Math.min(Math.floor(W.n / WANDER.per), W.route.length - 1)];
  const k = st && rand() < WANDER.bias ? (st === 'camp' ? 'camp' : st) : wanderKind(); W.cur = { k, mob: k === 'fight' ? actZoneMob(a, Math.floor(rand() * Math.min(wanderZone(a) + 1, ACT.zones))) : null }; }
export function wanderStart(path) {
  const S = G.S; if (wanderBusy()) return false; const a = wanderAct(), map = wanderMap(a.id);
  if (!expPathOk(map, path)) return false;
  S.wander = { a: a.id, route: path.map((j, i) => map.rows[i][j].t), start: now(), t: now(), last: now(), n: 0, log: [], acc: { gold: 0, xp: 0, herbs: {}, mats: {}, items: [] } }; wanderNext(S.wander); return true;
}
export const wanderDone = (W = G.S.wander) => !!W && W.t - W.start >= WANDER.maxSec * 1000;
// Ein Punkt: Bruchteil eines Wiederholungs-Kampfs im höchsten geschafften Gebiet (WANDER.loot Glut wert)
function wanderNode(W) {
  const S = G.S, a = ACTS.find(x => x.id === W.a), l = LOCATIONS.find(x => x.id === a.loc), lv = G.actZoneLvl(a, Math.min(wanderZone(a), ACT.zones));
  const f = WANDER.loot / actZoneGlut(a), xp0 = (20 + lv * 12) * f, gold0 = (6 + lv * 4) * f, A = W.acc, c = W.cur, bits = [];
  const gain = x => { A.xp += x; A.up = (A.up || 0) + G.gainXp(x); };
  const mats = l.mobs.map(n => MONSTERS.find(m => m.name === n)?.mat).filter(Boolean);
  if (c.k === 'fight') { const x = Math.round(xp0), g = Math.round(gold0); gain(x); A.gold += g; bits.push(`+${x} EP · ${g} Gold`);
    const mt = MONSTERS.find(m => m.name === c.mob)?.mat; if (mt && chance(WANDER.matP)) { addTo(A.mats, mt, 1); bits.push(MATS[mt]); }
    if (chance(WANDER.itemP)) { A.items.push(1); bits.push('Fundstück'); } }
  else if (c.k === 'herb') { const h = chance(0.8) ? HERB_LOC[l.id] : pick(Object.values(HERB_LOC)); if (h && chance(WANDER.herbP)) { addTo(A.herbs, h, 1); bits.push(HERBS[h].name); } }
  else if (c.k === 'mats') { if (mats.length && chance(WANDER.matP)) { const m = pick(mats); addTo(A.mats, m, 1); bits.push(MATS[m]); } }
  else if (c.k === 'ruin') { const g = Math.round(gold0 * WANDER.ruinGold); A.gold += g; bits.push(`${g} Gold`); if (chance(WANDER.ruinItem)) { A.items.push(chance(0.25) ? 2 : 1); bits.push('Fundstück'); } }
  else { const x = Math.round(xp0 * WANDER.campXp); gain(x); bits.push(`+${x} EP`); }
  W.n++; W.log.unshift({ n: W.n, k: c.k, mob: c.mob, text: bits.join(' · ') || 'nichts' }); W.log.length = Math.min(W.log.length, WANDER.keep);
}
// Takt aus main.js (jede Sekunde, solange die App offen ist). Gibt die Zahl neu fertiger Punkte zurück.
export function wanderTick(ts = now()) {
  const W = G.S?.wander; if (!W) return 0;
  const gap = ts - W.last; if (gap > WANDER.gap * 1000) { W.t += gap; W.start += gap; }   // App war zu: nicht nachholen
  W.last = ts; let k = 0;
  while (!wanderDone(W) && W.t + WANDER.sec * 1000 <= ts) { wanderNode(W); W.t += WANDER.sec * 1000; k++; if (!wanderDone(W)) wanderNext(W); }
  return k;
}
export function wanderClaim() {
  const S = G.S, W = S.wander; if (!W) return null; const a = ACTS.find(x => x.id === W.a), A = W.acc, rew = newRew();
  rew.gold = A.gold; S.gold += A.gold; rew.xp = A.xp; rew.up = A.up || 0;
  for (const [k, n] of Object.entries(A.herbs)) { G.addHerb(k, n); rew.herbs.push([k, n]); }
  for (const [k, n] of Object.entries(A.mats)) { G.addMat(k, n); rew.mats.push([k, n]); }
  const lv = G.actZoneLvl(a, Math.min(wanderZone(a), ACT.zones)); rew.items = [];
  for (const minRarity of moreItems(A.items)) { const it = makeItem(lv, { luck: G.stats().lck, cls: CLASSES[S.cls], minRarity }); if (G.keep(it)) rew.items.push(it); else { rew.gold += G.sellOff(it).gold; rew.items.push({ ...it, soldFull: true }); } }
  rew.item = rew.items[0] || null; rew.n = W.n; rew.min = Math.round((W.t - W.start) / 60000); S.wander = null; G.journal(`Vom Umherziehen zurück: ${rew.n} Punkte.`);
  return rew;
}
