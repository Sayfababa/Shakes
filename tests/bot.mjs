// Spiel-Bot: spielt Aschenkrone ohne Browser durch (simulierte Uhr) und misst das Tempo.
// Aufruf: node tests/bot.mjs [klasse] [tage] [läufe]
// Gibt pro Tag Stufe, Quests, Krypten, Splitter, Tode aus – Grundlage für Balance-Entscheidungen.
globalThis.localStorage = { getItem() {}, setItem() {}, removeItem() {} };
let clock = Date.UTC(2026, 0, 5, 8, 0, 0);
Date.now = () => clock;

const D = await import('../js/data.js');
const G = await import('../js/state.js');
const Q = await import('../js/quests.js');
const Game = await import('../js/game.js');

const score = it => !it ? 0 : (it.dmg ? (it.dmg[0] + it.dmg[1]) * 1.5 : 0) + (it.armor || 0) + Object.values(it.mods).reduce((a, b) => a + b, 0) * 1.5;
const slotOf = it => it.slot === 'ring' ? (!G.S.equip.ring1 ? 'ring1' : !G.S.equip.ring2 ? 'ring2' : (score(G.S.equip.ring1) < score(G.S.equip.ring2) ? 'ring1' : 'ring2')) : it.slot;
const wrongWeapon = it => it.slot === 'weapon' && it.kind !== D.CLASSES[G.S.cls].weapon;

function manage(log) {
  const S = G.S, c = D.CLASSES[S.cls];
  while (S.points > 0) G.addAttr(S.points % 5 < 2 ? 'con' : c.main);
  for (let i = 0; i < 9; i++) for (let b = 0; b < 3; b++) for (let t = 2; t >= 0; t--) if (G.learn(b, t)) break;
  // bessere Items anlegen, Rest verkaufen
  for (const it of [...S.bag]) {
    const sl = slotOf(it);
    if (!wrongWeapon(it) && score(it) > score(S.equip[sl])) { if (sl.startsWith('ring')) { const old = S.equip[sl]; G.removeFromBag(it.id); S.equip[sl] = it; if (old) G.addToBag(old); } else G.equip(it.id); }
  }
  for (const it of [...S.bag]) {
    const sl = slotOf(it), keepForQuest = Object.keys(D.QUESTS).some(t => Q.available(t) && Q.current(t).obj.some(o => o.give === it.slot));
    if (!keepForQuest && (wrongWeapon(it) || score(it) <= score(S.equip[sl]))) G.sell(it.id);
  }
  // Quests abgeben
  for (const t of D.GIVERS) { const r = Q.complete(t, 'break'); if (r) log.quests.push(`${t}:${r.q.id}@${S.lvl}`); }
  // Dienste
  for (const [t, list] of Object.entries(D.SERVICES)) for (const sv of list) if (sv.id !== 'order' && G.serviceState(sv).can && !G.serviceState(sv).questMat && S.gold > 200) G.doService(t, sv.id);
  // Händler: bessere Ware kaufen, wenn genug Gold übrig
  for (const t of Object.keys(D.TRADERS)) for (const it of [...G.shopFor(t)]) {
    if (S.gold > it.price * 1.5 && !wrongWeapon(it) && score(it) > score(S.equip[slotOf(it)]) * 1.15) {
      const b = { ...it }; delete b.price; if (G.addToBag(b)) { S.gold -= it.price; S.traders[t].shop.splice(S.traders[t].shop.indexOf(it), 1); log.bought++; }
    }
  }
}

function pickLocation() {
  const S = G.S, open = D.LOCATIONS.filter(l => G.locOpen(l)); if (!open.length) return null;
  // Omen zuerst, dann der Ort, der die meisten offenen Quest-Ziele bedient, sonst der höchste bezahlbare Ort
  const om = G.omen(); const omenLoc = !om.done && S.lvl >= 3 && open.find(l => l.id === om.loc);
  const need = l => D.GIVERS.filter(t => Q.available(t)).reduce((n, t) => n + Q.current(t).obj.filter((o, i) => !Q.objectives(t)[i].done &&
    (o.at === l.id || (o.kill && l.mobs.includes(o.kill)) || (o.mat && l.mobs.some(m => D.MONSTERS.find(x => x.name === m).mat === o.mat)))).length, 0);
  const want = open.map(l => [l, need(l)]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])[0]?.[0];
  const target = omenLoc || want || open.filter(l => S.glut >= l.glut).pop(); if (!target) return null;
  return S.glut >= target.glut ? target.id : null;   // auf Glut warten statt billig zu farmen
}

let RISK = 0.8;
export function run(cls = 'paladin', days = 7, risk = 0.8) {
  RISK = risk;
  clock = Date.UTC(2026, 0, 5, 8, 0, 0);
  G.newChar('Bot', cls); G.S.tut = 99;
  const log = { delves: 0, delveLoss: 0, lostGold: 0, tracks: { safe: 0, norm: 0, blood: 0 }, quests: [], bought: 0, trips: 0, tripLoss: 0, crypt: 0, cryptLoss: 0, arena: 0, arenaLoss: 0, perDay: [] };
  const end = clock + days * 86400000;
  let nextDay = clock + 86400000, rival = null;
  while (clock < end) {
    const S = G.S; G.tickGlut(); manage(log);
    let acted = false;
    if (S.active && clock >= S.active.end) { const r = Game.resolveTrip(); log.trips++; if (!r.win) log.tripLoss++; acted = true;
      // Tiefer gehen, solange die Chance gut ist und noch wenig auf dem Spiel steht
      while (r.win && Game.canDelve() && Game.delveChance() >= RISK) { const d = Game.delve(); log.delves++; if (!d.win) { log.delveLoss++; log.lostGold += d.lost.gold; break; } }
      if (S.haul) Game.bank();
    }
    if (!S.active) { const id = pickLocation(); if (id) { const l = D.LOCATIONS.find(x => x.id === id);
      const tr = Game.tripChance(l, 'blood') >= RISK ? 'blood' : Game.tripChance(l, 'norm') >= 0.75 ? 'norm' : 'safe'; log.tracks[tr]++;
      if (G.startTrip(id, tr)) acted = true; } }
    if (clock >= S.crypt.cd) {
      const c = D.CRYPTS.find(c => G.cryptOpen(c) && G.cryptFloor(c) < 5 && Game.cryptChance(c) >= 0.4);
      if (c) { const r = Game.cryptFight(c.id); if (r) { log.crypt++; if (!r.win) log.cryptLoss++; acted = true; } }
    }
    const champ = Q.available('vargo') && Q.current('vargo').champ && !Q.canComplete('vargo');
    const arenaWanted = champ || (Q.available('vargo') && Q.objectives('vargo').some((o, i) => !o.done && (Q.current('vargo').obj[i].arena || Q.current('vargo').obj[i].honor))) || S.glut > 80;
    if (clock >= S.arenaTs && arenaWanted && (!champ || Game.winChance('champ', () => G.makeMonster(S.lvl + 3, 1.3)) >= 0.3)) {
      if (champ) { const r = Game.champFight('vargo'); if (r) { log.arena++; if (!r.win) log.arenaLoss++; } }
      else { rival ||= Game.makeRival(); const r = Game.arenaFight(rival); if (r) { rival = null; log.arena++; if (!r.win) log.arenaLoss++; } }
      acted = true;
    }
    if (clock >= nextDay) {
      log.perDay.push({ day: log.perDay.length + 1, lvl: S.lvl, gold: S.gold, quests: log.quests.length, shards: S.shards.length,
        cryptsDone: D.CRYPTS.filter(c => G.cryptFloor(c) >= 5).length, diff: D.DIFFICULTIES[S.crypt.diff].name,
        trips: log.trips, tripLoss: log.tripLoss, crypt: log.crypt, cryptLoss: log.cryptLoss, omens: S.omens, title: S.title || '' });
      nextDay += 86400000;
    }
    // Zeit vorspulen bis zum nächsten möglichen Ereignis
    const evts = [S.active ? S.active.end : Infinity, S.crypt.cd, S.arenaTs, clock + 6 * 60000].filter(t => t > clock);
    clock = acted ? clock + 1000 : Math.min(...evts);
  }
  return { log, S: G.S, stats: G.stats() };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cls = 'paladin', days = 7, runs = 1, risk = 0.8] = process.argv.slice(2);
  for (let i = 0; i < +runs; i++) {
    const { log, S } = run(cls, +days, +risk);
    console.log(`\n=== ${cls} · Lauf ${i + 1} ===`);
    console.table(log.perDay);
    console.log('Quests:', log.quests.join(' '));
    console.log(`Spuren ${JSON.stringify(log.tracks)} · Tiefe ${log.delves} (−${log.delveLoss}, verloren ${log.lostGold} Gold)`);
    console.log(`Kämpfe: Streifzug ${log.trips} (−${log.tripLoss}) · Krypta ${log.crypt} (−${log.cryptLoss}) · Grube ${log.arena} (−${log.arenaLoss}) · gekauft ${log.bought} · Titel ${S.title || '-'}`);
  }
}
