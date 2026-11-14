// Spielzüge ohne DOM: Kampf ausführen, Belohnung anwenden, strukturiertes Ergebnis liefern.
// main.js zeigt das Ergebnis an; tests/ spielen damit ganze Verläufe durch.
import { CLASSES, CFG, CRYPTS, TALENTS, LOCATIONS, MONSTERS } from './data.js';
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
export function resolveTrip() {
  const S = G.S, a = S.active; if (!a || now() < a.end) return null;
  const l = LOCATIONS.find(x => x.id === a.loc), om = G.omenFor(l.id), od = om && !om.done ? om.def : null;
  const m = G.makeMonster(G.locLvl(l), a.diff * (od?.diff || 1), MONSTERS.find(x => x.name === a.mob));
  if (od?.diff) m.name = 'Fürst: ' + m.name;
  const A = G.stats(), r = fight(A, m), win = r.winner === 'a', rew = newRew();
  S.active = null;
  if (!win) { S.deaths++; G.journal(`${m.name} in ${l.name} hat mich zerrissen.`); return { A, B: m, r, win, rew, place: l }; }
  S.wins++; Q.event({ type: 'kill', mob: a.mob, loc: l.id });
  const t = G.tripReward(l, a.diff, a.sec);
  pay(rew, Math.round(t.gold * (od?.gold || 1)), Math.round(t.xp * (od?.xp || 1)));
  dropMat(m, rew); if (od?.mats && m.mat) { G.addMat(m.mat, 2); rew.mats.push([m.mat, 2]); }
  dropItem(m.lvl, od?.loot ? 1 : CFG.lootChance, od?.loot || 0, rew);
  if (od && G.fulfillOmen()) { Q.event({ type: 'omen' }); rew.omen = true; G.journal(`Das Omen über ${l.name} hat sich erfüllt.`); }
  else G.journal(`${m.name} in ${l.name} erschlagen.`);
  return { A, B: m, r, win, rew, place: l };
}

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
export const tripChance = l => winChance('trip:' + l.id, () => {
  const om = G.omenFor(l.id), od = om && !om.done ? om.def : null;
  return G.makeMonster(G.locLvl(l), [0.85, 1, 1, 1.2][roll(0, 3)] * (od?.diff || 1), MONSTERS.find(m => m.name === pick(l.mobs)));
});
export const cryptChance = c => winChance('crypt:' + c.id + ':' + G.cryptFloor(c) + ':' + G.S.crypt.diff, () => G.cryptEnemy(c));
export const threatLabel = p => p >= 0.9 ? ['gering', 'low'] : p >= 0.65 ? ['mäßig', 'mid'] : p >= 0.35 ? ['hoch', 'high'] : ['tödlich', 'deadly'];
