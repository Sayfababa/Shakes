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
  // Talente: Klassen mit Brett brauchen die Brett-Schnittstelle. Ohne diesen Zweig landeten die
  // Punkte in alten Knoten-IDs, die das Brett nicht kennt – die Assassine spielte ohne jedes
  // wirkende Talent und sah im Tempo-Vergleich 2 Akte langsamer aus als alle anderen.
  if (G.treeOf(S.cls)) {
    const T = G.treeOf(S.cls);
    for (let i = 0; i < 60 && G.talentPoints() > 0; i++) {
      // gierig nach Kampfkraft: den offenen Knoten nehmen, der am meisten bringt (Brücken eingeschlossen)
      let best = null, bp = -1;
      const probe = fn => { const vor = JSON.parse(JSON.stringify(S.tal)); if (!fn()) return null; const p = G.power(); S.tal = vor; return p; };
      T.cols.forEach((c, ci) => c.nodes.forEach((n, ri) => { const p = probe(() => G.learnNode(ci, ri)); if (p > bp) { bp = p; best = () => G.learnNode(ci, ri); } }));
      (T.bridges || []).forEach((b, bi) => { const p = probe(() => G.learnBridge(bi)); if (p > bp) { bp = p; best = () => G.learnBridge(bi); } });
      if (!best || !best()) break;
    }
  } else for (let i = 0; i < 9; i++) for (let b = 0; b < 3; b++) for (let t = 2; t >= 0; t--) if (G.learn(b, t)) break;
    // Zauber-Wege: offene Stufen wählen (den Weg mit der höheren Kampfkraft)
    for (const sp of D.SPELLS[S.cls]) (D.SPELL_TREE[sp.id] || []).forEach((opts, t) => { if (!G.wayOpen(sp, t) || G.S.sp?.[sp.id]?.[t] != null) return;
      const pw = opts.map((o, i) => { (G.S.sp[sp.id] ||= [null, null, null])[t] = i; return G.power(); }); G.S.sp[sp.id][t] = pw[1] > pw[0] ? 1 : 0; });
  // bessere Items anlegen, Rest verkaufen
  for (const it of [...S.bag]) {
    const sl = slotOf(it);
    if (!wrongWeapon(it) && score(it) > score(S.equip[sl])) { if (sl.startsWith('ring')) { const old = S.equip[sl]; G.removeFromBag(it.id); S.equip[sl] = it; if (old) G.addToBag(old); } else G.equip(it.id); }
  }
  for (const it of [...S.bag]) {
    const sl = slotOf(it), keepForQuest = Object.keys(D.QUESTS).some(t => Q.available(t) && Q.current(t).obj.some(o => o.give === it.slot));
    if (!keepForQuest && (wrongWeapon(it) || score(it) <= score(S.equip[sl]))) G.sell(it.id);
  }
  // Alchemie (wenn eingeschaltet): gewöhnliche Tränke auf Vorrat brauen, seltene mit Herz; Gold-Reserve fürs Ausrüsten behalten
  if (POTS) for (const p of [...D.POTIONS].sort((a, b) => (b.rare || 0) - (a.rare || 0))) {
    while ((S.pots[p.id] || 0) < (p.rare ? 1 : 3) && S.gold > 150 + G.brewCost(p.id).gold && G.canBrew(p.id).ok) { const g = S.gold; G.brew(p.id); log.brewed++; log.brewGold += g - S.gold; }
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

// Akte: wie ein Spieler – neues Gebiet, wenn die Chance reicht; sonst gezielt farmen (Auftrag/Omen, sonst höchstes geschafftes Gebiet), kostet Glut
function actStep(log) {
  const S = G.S, a = G.curAct(), z = Math.min(G.actProg(a), D.ACT.zones);
  if (!G.actDone(a) && Game.actChance(a, z) >= 0.5) { if (POTS && z >= D.ACT.zones) Game.bestBelt(Game.actEnemy(a, z), 20); const r = Game.actFight(a.id, z); if (r) { log.acts++; if (!r.win) log.actLoss++; else if (r.rew.actDone) log.actBoss.push(`${a.n}@${S.lvl}`); return true; } }
  const open = D.ACTS.filter(x => G.actOpen(x) && G.actProg(x) > 0), om = G.omen();
  const need = x => { const l = D.LOCATIONS.find(y => y.id === x.loc); return D.GIVERS.filter(t => Q.available(t)).reduce((n, t) => n + Q.current(t).obj.filter((o, i) => !Q.objectives(t)[i].done &&
    (o.at === l.id || (o.kill && l.mobs.includes(o.kill)) || (o.mat && l.mobs.some(m => D.MONSTERS.find(q => q.name === m).mat === o.mat)))).length, 0); };
  const tgt = (S.lvl >= 3 && !om.done && open.find(x => x.loc === om.loc)) || open.map(x => [x, need(x)]).filter(([, n]) => n).sort((p, q) => q[1] - p[1])[0]?.[0] || open[open.length - 1];
  if (!tgt || S.glut < Game.actZoneGlut(tgt)) return false;
  const zz = Math.min(G.actProg(tgt), D.ACT.zones + 1) - 1; const zr = [...Array(zz + 1).keys()].reverse().find(k => Game.actChance(tgt, k) >= 0.75) ?? 0;
  const r = Game.actFight(tgt.id, zr); if (r) { log.farm++; if (!r.win) log.actLoss++; return true; } return false;
}

let RISK = 0.8, POTS = false;
export function run(cls = 'paladin', days = 7, risk = 0.8, pots = false) {
  RISK = risk; POTS = pots;
  clock = Date.UTC(2026, 0, 5, 8, 0, 0);
  G.newChar('Bot', cls); G.S.tut = 99;
  const log = { acts: 0, actLoss: 0, farm: 0, actBoss: [], pit: 0, pitLoss: 0, delves: 0, delveLoss: 0, lostGold: 0, tracks: { safe: 0, norm: 0, blood: 0 }, quests: [], bought: 0, trips: 0, tripLoss: 0, crypt: 0, cryptLoss: 0, arena: 0, arenaLoss: 0, perDay: [], brewed: 0, brewGold: 0, used: 0, potFights: 0 };
  const end = clock + days * 86400000;
  let nextDay = clock + 86400000, rival = null;
  while (clock < end) {
    const S = G.S; G.tickGlut(); G.potDaily(); manage(log);
    let acted = false;
    if (clock >= S.crypt.cd) {
      const c = D.CRYPTS.find(c => G.cryptOpen(c) && S.glut >= G.cryptGlut(c) && Game.cryptChance(c) >= 0.5);
      if (c) { const m = G.cryptEnemy(c); if (POTS) Game.bestBelt(m, 20); const r = Game.cryptFight(c.id, m);
        if (r) { log.crypt++; if (!r.win) log.cryptLoss++; acted = true; log.used += r.rew.used?.length || 0; if (r.rew.used?.length) log.potFights++; } }
    }
    acted = actStep(log) || acted;
    const champ = Q.available('vargo') && Q.current('vargo').champ && !Q.canComplete('vargo');
    if (champ && clock >= S.arenaTs && Game.winChance('champ', () => G.makeMonster(S.lvl + 3, 1.3)) >= 0.3) { const r = Game.champFight('vargo'); if (r) { log.arena++; if (!r.win) log.arenaLoss++; acted = true; } }
    if (!Game.pitBusy()) { const f = Game.pitFoes().filter(x => x.p >= 0.5).sort((p, q) => q.honor - p.honor)[0];
      if (f) { const r = Game.pitFight(f.id); if (r) { log.pit++; if (!r.win) log.pitLoss++; acted = true; } } }
    if (clock >= nextDay) {
      log.perDay.push({ day: log.perDay.length + 1, lvl: S.lvl, gold: S.gold, quests: log.quests.length, shards: S.shards.length,
        
        akt: (() => { const a = G.curAct(); return G.actDone(a) ? 'fertig' : `${a.n} ${G.actProg(a)}/9`; })(), farm: log.farm, platz: Game.pitPlace(), stufen: D.CRYPTS.map(c => G.cryptTier(c)).join(''), crypt: log.crypt, cryptLoss: log.cryptLoss, omens: S.omens, title: S.title || '',
        herbs: Object.values(S.herbs).reduce((a, b) => a + b, 0), pots: Object.values(S.pots).reduce((a, b) => a + b, 0), brewed: log.brewed, used: log.used });
      nextDay += 86400000;
    }
    // Zeit vorspulen bis zum nächsten möglichen Ereignis
    const evts = [S.crypt.cd, S.arenaTs, S.pit.ts, clock + 6 * 60000].filter(t => t > clock);
    clock = acted ? clock + 30000 : Math.min(...evts);
  }
  return { log, S: G.S, stats: G.stats() };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cls = 'paladin', days = 7, runs = 1, risk = 0.8] = process.argv.slice(2), pots = process.argv.includes('--pots');
  for (let i = 0; i < +runs; i++) {
    const { log, S } = run(cls, +days, +risk, pots);
    console.log(`\n=== ${cls} · Lauf ${i + 1} ===`);
    console.table(log.perDay);
    console.log('Quests:', log.quests.join(' '));
    console.log(`Akt-Bosse (Akt@Stufe): ${log.actBoss.join(' ')}`);
    console.log(`Kämpfe: Akte ${log.acts} neu + ${log.farm} gefarmt (−${log.actLoss}) · Grube ${log.pit} (−${log.pitLoss}) · Krypta ${log.crypt} (−${log.cryptLoss}) · Grube ${log.arena} (−${log.arenaLoss}) · gekauft ${log.bought} · Titel ${S.title || '-'}${pots ? ` · gebraut ${log.brewed} (${log.brewGold} Gold) · getrunken ${log.used} in ${log.potFights} Kämpfen` : ''}`);
  }
}
