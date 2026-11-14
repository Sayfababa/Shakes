// Drei Spieler-Typen spielen Aschenkrone durch – ohne Schummeln:
// nur Aktionen, die auch ein Mensch in der App hat (Streifzug + Spur wählen, Tiefer/Heimkehren, Krypta, Grube,
// Kaufen/Verkaufen/Anlegen, Punkte & Talente, Dienste, Quests abgeben). Entscheidungen nur mit Infos, die die App zeigt
// (Gefahr-Anzeige, Werte, Preise, Quest-Zettel). Gespielt wird in realistischen Sitzungen pro Tag, dazwischen läuft die Zeit.
// Aufruf: node tests/personas.mjs [tage]
globalThis.localStorage = { getItem() {}, setItem() {}, removeItem() {} };
let clock = 0; Date.now = () => clock;

const D = await import('../js/data.js');
const G = await import('../js/state.js');
const Q = await import('../js/quests.js');
const Game = await import('../js/game.js');

const MIN = 60000, HOUR = 60 * MIN, DAY = 24 * HOUR;
const PERSONAS = [
  { id: 'optimist', name: 'Der Optimist', cls: 'assassin', sessions: [[8, 30], [13, 40], [19, 60], [22, 30]],
    track: c => c.blood >= 0.55 ? 'blood' : 'norm', delveMin: 0.55, cryptMin: 0.35, buyFactor: 1.05, upgrade: 1.05, rush: true, arena: true, finale: 'crown', gamble: 6 },
  { id: 'realist', name: 'Der Realist', cls: 'paladin', sessions: [[7, 20], [18, 60], [21, 30]],
    track: c => c.blood >= 0.8 ? 'blood' : c.norm >= 0.7 ? 'norm' : 'safe', delveMin: 0.8, cryptMin: 0.6, buyFactor: 1.5, upgrade: 1.15, rush: false, arena: true, finale: 'break', gamble: 15 },
  { id: 'pessimist', name: 'Der Pessimist', cls: 'witch', sessions: [[12, 25], [20, 45]],
    track: c => c.norm >= 0.9 ? 'norm' : 'safe', delveMin: 1.1, cryptMin: 0.85, buyFactor: 3, upgrade: 1.3, rush: false, arena: false, finale: 'break', gamble: 0 },
];

const score = it => !it ? 0 : (it.dmg ? (it.dmg[0] + it.dmg[1]) * 1.5 : 0) + (it.armor || 0) + Object.values(it.mods).reduce((a, b) => a + b, 0) * 1.5;
const RAR = ['broken', 'normal', 'magic', 'rare', 'legendary'];

function play(P, days) {
  clock = Date.UTC(2026, 0, 5, 0, 0, 0);
  G.newChar(P.name, P.cls); G.S.tut = 99;
  const S = G.S, c = D.CLASSES[S.cls];
  const st = { sessions: 0, emptySessions: 0, idleMin: 0, playMin: 0, levels: [], quests: [], loyalty: 0, highlights: [], lows: [],
    trips: 0, tripLoss: 0, delves: 0, delveLoss: 0, lostGold: 0, crypt: 0, cryptLoss: 0, arena: 0, arenaLoss: 0, bought: 0, spent: 0,
    maxGold: 0, bestRar: 1, rushGold: 0, gambles: 0, gambleGold: 0, bounties: 0, tracks: { safe: 0, norm: 0, blood: 0 }, rushes: 0, daysNoQuest: 0, finaleDay: null, perDay: [], services: 0 };
  let lastQuestDay = 0, rival = null;
  const wrongWeapon = it => it.slot === 'weapon' && it.kind !== c.weapon;
  const slotOf = it => it.slot === 'ring' ? (!S.equip.ring1 ? 'ring1' : !S.equip.ring2 ? 'ring2' : (score(S.equip.ring1) < score(S.equip.ring2) ? 'ring1' : 'ring2')) : it.slot;
  const day = () => Math.floor((clock - Date.UTC(2026, 0, 5)) / DAY) + 1;
  let progress = false;
  const note = (arr, t) => { arr.push(`T${day()}: ${t}`); };

  function manage() {
    if (S.points) progress = true;
    while (S.points > 0) G.addAttr(S.points % 5 < 2 ? 'con' : c.main);
    for (let i = 0; i < 9; i++) for (let b = 0; b < 3; b++) for (let t = 2; t >= 0; t--) if (G.learn(b, t)) break;
    for (const it of [...S.bag]) {
      const sl = slotOf(it);
      if (!wrongWeapon(it) && score(it) > score(S.equip[sl])) {
        if (sl.startsWith('ring')) { if (S.equip[sl]) G.unequip(sl); }
        if (G.equip(it.id)) { progress = true; const r = RAR.indexOf(it.rarity); if (r > st.bestRar) { st.bestRar = r; note(st.highlights, `erstes ${D.RARITIES[r].name}es Item angelegt (${it.name})`); } }
      }
    }
    for (const it of [...S.bag]) {
      const keep = D.GIVERS.some(t => Q.available(t) && Q.current(t).obj.some(o => o.give === it.slot));
      if (!keep && (wrongWeapon(it) || score(it) <= score(S.equip[slotOf(it)]))) G.sell(it.id);
    }
    for (const t of D.GIVERS) {
      const before = D.TRADERS[t] ? G.loyalty(t) : 0, r = Q.complete(t, P.finale);
      if (r) { progress = true; lastQuestDay = day(); st.quests.push(`${t}:${r.q.id}`); if (r.loyaltyUp) { st.loyalty++; note(st.highlights, `Treue bei ${D.TRADERS[t].name} steigt`); }
        if (r.choice) { st.finaleDay = day(); note(st.highlights, `Finale: ${r.choice.label}`); } }
    }
    G.bounties().forEach((b, i) => { if (G.claimBounty(i)) { st.bounties++; progress = true; } });
    for (const [t, list] of Object.entries(D.SERVICES)) for (const sv of list) {
      const ss = G.serviceState(sv);
      if (sv.id === 'gamble') { const price = sv.gold[0] + sv.perLvl * S.lvl; if (P.gamble && S.gold > price * P.gamble && S.bag.length < 8) { S.gold -= 0; const g0 = S.gold; if (G.doService(t, 'gamble')) { st.gambles++; st.gambleGold += g0 - S.gold; } } continue; }
      if (sv.id !== 'order' && ss.can && !ss.questMat && S.gold > 150 * P.buyFactor) { G.doService(t, sv.id); st.services++; progress = true; }
    }
    for (const t of Object.keys(D.TRADERS)) for (const it of [...G.shopFor(t)]) {
      if (S.gold >= it.price * P.buyFactor && !wrongWeapon(it) && score(it) > score(S.equip[slotOf(it)]) * P.upgrade) {
        const b = { ...it }; delete b.price;
        if (G.addToBag(b)) { S.gold -= it.price; st.spent += it.price; S.traders[t].shop.splice(S.traders[t].shop.indexOf(it), 1); st.bought++; }
      }
    }
    st.maxGold = Math.max(st.maxGold, S.gold);
  }

  function pickLocation() {
    const open = D.LOCATIONS.filter(l => G.locOpen(l));
    const om = G.omen(), omenLoc = !om.done && S.lvl >= 3 && open.find(l => l.id === om.loc);
    const need = l => D.GIVERS.filter(t => Q.available(t)).reduce((n, t) => n + Q.current(t).obj.filter((o, i) => !Q.objectives(t)[i].done &&
      (o.at === l.id || (o.kill && l.mobs.includes(o.kill)) || (o.mat && l.mobs.some(m => D.MONSTERS.find(x => x.name === m).mat === o.mat)))).length, 0);
    const want = open.map(l => [l, need(l)]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])[0]?.[0];
    return omenLoc || want || open.filter(l => S.glut >= l.glut).pop();
  }

  const sessionStarts = d => P.sessions.map(([h, m]) => [Date.UTC(2026, 0, 4 + d, h, 0, 0), m]);
  for (let d = 1; d <= days; d++) {
    const lvl0 = S.lvl, q0 = st.quests.length;
    for (const [start, mins] of sessionStarts(d)) {
      clock = start; const end = start + mins * MIN; st.sessions++; progress = false; const lvlS = S.lvl;
      while (clock < end) {
        G.tickGlut(); manage(); let acted = false;
        if (S.active && clock < S.active.end && P.rush && S.gold > G.rushCost() * 4) { st.rushGold += G.rushCost(); S.gold -= G.rushCost(); S.active.end = clock; st.rushes++; }
        if (S.active && clock >= S.active.end) {
          const r = Game.resolveTrip(); st.trips++; acted = true;
          if (!r.win) { st.tripLoss++; note(st.lows, `Streifzug verloren gegen ${r.B.name}`); }
          while (r.win && Game.canDelve() && Game.delveChance() >= P.delveMin) {
            const dv = Game.delve(); st.delves++;
            if (!dv.win) { st.delveLoss++; st.lostGold += dv.lost.gold; note(st.lows, `in Tiefe ${dv.lost.depth + 1} alles verloren (${dv.lost.gold} Gold, ${dv.lost.xp} EP)`); break; }
          }
          if (S.haul) Game.bank();
        }
        if (!S.active) {
          const l = pickLocation();
          if (l && S.glut >= l.glut) {
            const ch = { safe: Game.tripChance(l, 'safe'), norm: Game.tripChance(l, 'norm'), blood: Game.tripChance(l, 'blood') };
            const tr = P.track(ch); st.tracks[tr]++; if (G.startTrip(l.id, tr)) acted = true;
          }
        }
        if (clock >= S.crypt.cd) {
          const cr = D.CRYPTS.find(x => G.cryptOpen(x) && G.cryptFloor(x) < 5 && Game.cryptChance(x) >= P.cryptMin);
          if (cr) { const r = Game.cryptFight(cr.id); if (r) { st.crypt++; acted = true;
            if (!r.win) { st.cryptLoss++; note(st.lows, `${r.B.name} in ${cr.name} verloren`); }
            else if (r.B.boss) note(st.highlights, `Boss besiegt: ${r.B.name}${r.rew.shard ? ' (Splitter ' + r.rew.shard + ')' : ''}`); } }
        }
        const vq = Q.available('vargo') && Q.current('vargo'), champ = vq?.champ && !Q.canComplete('vargo');
        const wantArena = vq && Q.objectives('vargo').some((o, i) => !o.done && (vq.obj[i].arena || vq.obj[i].honor));
        if (clock >= S.arenaTs && (P.arena || wantArena || champ) && S.glut >= D.CFG.arenaGlut + 10) {
          if (champ) { const r = Game.champFight('vargo'); if (r) { st.arena++; if (!r.win) st.arenaLoss++; else note(st.highlights, 'Vargos Champion „Die Kette“ besiegt'); } }
          else { rival ||= Game.makeRival(); const r = Game.arenaFight(rival); if (r) { rival = null; st.arena++; if (!r.win) st.arenaLoss++; } }
          acted = true;
        }
        if (acted) { clock += 20000; st.playMin += 1 / 3; continue; }   // eine Aktion ~20 s
        const next = Math.min(end, S.active ? S.active.end : Infinity, S.crypt.cd > clock ? S.crypt.cd : Infinity, clock + 6 * MIN);
        st.idleMin += (next - clock) / MIN; clock = next;
      }
      if (S.lvl > lvlS) progress = true;
      if (!progress) st.emptySessions++;
    }
    if (S.lvl > lvl0) for (let l = lvl0 + 1; l <= S.lvl; l++) st.levels.push([l, d]);
    if (st.quests.length === q0) st.daysNoQuest++;
    st.perDay.push({ d, lvl: S.lvl, gold: S.gold, quests: st.quests.length, shards: S.shards.length, diff: D.DIFFICULTIES[S.crypt.diff].name });
  }
  const openQuests = D.GIVERS.filter(t => Q.current(t)).map(t => `${t}:${Q.current(t).id}${Q.available(t) ? '' : '(gesperrt)'}`);
  return { P, st, S, openQuests, stats: G.stats() };
}

const days = +(process.argv[2] || 21);
const results = PERSONAS.map(P => play(P, days));
for (const { P, st, S, openQuests, stats } of results) {
  console.log(`\n================ ${P.name} (${D.CLASSES[P.cls].name}) – ${days} Tage, ${P.sessions.length} Sitzungen/Tag ================`);
  console.log(`Ende: Stufe ${S.lvl}, ${S.gold} Gold, Quests ${st.quests.length}, Splitter ${S.shards.length}, Schwierigkeit ${D.DIFFICULTIES[S.crypt.diff].name}, Titel ${S.title || '-'}, Finale Tag ${st.finaleDay ?? '-'}`);
  console.log(`Werte: Leben ${stats.hp}, Schaden ${stats.dmg.join('–')}, Rüstung ${stats.armor}; bestes Item ${D.RARITIES[st.bestRar].name}`);
  console.log(`Spielzeit aktiv ${Math.round(st.playMin)} min, Leerlauf in Sitzungen ${Math.round(st.idleMin)} min, Sitzungen ohne Fortschritt ${st.emptySessions}/${st.sessions}, Tage ohne Quest ${st.daysNoQuest}/${days}`);
  console.log(`Streifzüge ${st.trips} (−${st.tripLoss}) Spuren ${JSON.stringify(st.tracks)} · Tiefe ${st.delves} (−${st.delveLoss}, verloren ${st.lostGold} Gold) · Krypta ${st.crypt} (−${st.cryptLoss}) · Grube ${st.arena} (−${st.arenaLoss}) · Eilen ${st.rushes}`);
  console.log(`Gekauft ${st.bought} für ${st.spent} Gold, Dienste ${st.services}, max. Gold ${st.maxGold}, Treue-Aufstiege ${st.loyalty}`);
  console.log(`Eilen ${st.rushes}× für ${st.rushGold} Gold · Glücksgriff ${st.gambles}× für ${st.gambleGold} Gold · Steckbriefe ${st.bounties}`);
  console.log('Höhepunkte je Tag:', [...Array(days)].map((_, i) => st.highlights.filter(h => h.startsWith(`T${i + 1}:`)).length).join(' '));
  console.log('Stufen pro Tag:', st.perDay.map(x => x.lvl).join(' '));
  console.log('Quests pro Tag:', st.perDay.map(x => x.quests).join(' '));
  console.log('Offene Quests:', openQuests.join(' '));
  console.log('Höhepunkte:', st.highlights.slice(0, 40).join(' | '));
  console.log('Tiefpunkte:', st.lows.length, st.lows.slice(0, 15).join(' | '));
}
