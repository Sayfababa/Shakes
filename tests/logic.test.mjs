// Logik-Tests ohne Browser: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k]; }, setItem(k, v) { this._d[k] = v; }, removeItem(k) { delete this._d[k]; } };

const D = await import('../js/data.js');
const G = await import('../js/state.js');
const Q = await import('../js/quests.js');
const Game = await import('../js/game.js');
const { fight } = await import('../js/combat.js');
const L = await import('../js/loot.js');
const Ld = L;   // für Tests, die L lokal anders brauchen
const { makeItem } = L;
const UI = await import('../js/ui.js');

const fresh = (cls = 'paladin') => { G.newChar('Test', cls); G.S.tut = 99; return G.S; };

test('Daten: jedes Monster, jeder Boss hat ein Bild', async () => {
  const fs = await import('node:fs');
  for (const g of [...D.MONSTERS.map(m => m.glyph), ...D.CRYPTS.map(c => c.boss.glyph).filter(g => g !== 'self')])
    assert.ok(fs.existsSync(`assets/monsters/${g}.jpg`), `fehlt: ${g}`);
  for (const b of D.BASES) for (const a of [b.art, ...(b.vars || [])]) assert.ok(fs.existsSync(`assets/items/${a}.webp`), `Item-Bild fehlt: ${a}`);
  for (const sp of Object.values(D.SPELLS).flat()) assert.ok(fs.existsSync(`assets/spells/${sp.id}.webp`), `Zauber-Bild fehlt: ${sp.id}`);
});

test('Daten: Quest-Ziele zeigen nur auf existierende Orte, Monster, Materialien, Krypten', () => {
  const locs = new Set(D.LOCATIONS.map(l => l.id)), mobs = new Set(D.MONSTERS.map(m => m.name)), crypts = new Set(D.CRYPTS.map(c => c.id));
  for (const [t, chain] of Object.entries(D.QUESTS)) for (const q of chain) for (const o of q.obj) {
    if (o.at) assert.ok(locs.has(o.at), `${q.id}: Ort ${o.at}`);
    if (o.kill) assert.ok(mobs.has(o.kill), `${q.id}: Monster ${o.kill}`);
    if (o.mat) assert.ok(D.MATS[o.mat], `${q.id}: Material ${o.mat}`);
    for (const k of ['boss', 'floor', 'clear']) if (o[k]) assert.ok(crypts.has(o[k]), `${q.id}: Krypta ${o[k]}`);
    if (o.kill) assert.ok(D.LOCATIONS.some(l => l.mobs.includes(o.kill)) || D.CRYPTS.some(c => c.floors.includes(o.kill)), `${q.id}: ${o.kill} kommt nirgends vor`);
  }
});

test('Kampf: endet immer, Log hat Lebenswerte', () => {
  fresh();
  for (let i = 0; i < 200; i++) {
    const r = fight(G.stats(), G.makeMonster(1 + (i % 30), 1.2));
    assert.ok(['a', 'b'].includes(r.winner)); assert.ok(r.log.length > 0 && r.log.length < 400);
    for (const l of r.log) assert.ok(Number.isFinite(l.hpA) && Number.isFinite(l.hpB));
  }
});

test('Vorbereitung: zweiter seltener Trank ersetzt den ersten – und sagt wen; gewöhnlicher geht in den freien Platz', () => {
  const S = fresh('paladin'); S.lvl = 20; S.pots = { jaegerblick: 1, knochenmark: 1, rotwurz: 2 }; S.belt = [null, null, null];
  assert.deepEqual(Game.packPotion('jaegerblick'), { weg: null });
  assert.equal(Game.packSlot('knochenmark').weg, 'Jägerblick');           // steht vorher im Kästchen
  assert.deepEqual(Game.packPotion('knochenmark'), { weg: 'Jägerblick' });  // und nach dem Tippen in der Meldung
  assert.deepEqual(S.belt.filter(Boolean).map(b => b.id), ['knochenmark']);
  assert.equal(Game.packSlot('rotwurz').weg, null); Game.packPotion('rotwurz');
  assert.deepEqual(S.belt.filter(Boolean).map(b => b.id).sort(), ['knochenmark', 'rotwurz']);
});

test('power() kennt die Serienbremse: evadeShare trifft den Anteil der Ausweicher im echten Kampf', async () => {
  const { evadeShare, evadeChance } = await import('../js/combat.js');
  const S = fresh('barbarian'); S.lvl = 20; const A = { ...G.stats(), hp: 1e6, acc: 0, spells: [] };   // nur Hiebe: Stärkungszauber würfeln kein Ausweichen
  for (const p of [0.2, 0.35, 0.5]) {
    const m = { ...G.makeMonster(20, 1), hp: 1e6, dex: 0, evade: p, evadeCap: 0 };
    let ev = 0, all = 0;
    for (let k = 0; k < 120; k++) for (const l of fight(A, m).log) {
      if (l.who !== 'a' || !(l.dmg !== undefined || l.miss || l.spell)) continue;
      all++; if (l.miss === 'Ausgewichen') ev++; }
    const q = evadeShare(evadeChance(m, A.dex));   // die Regel aufrufen (weicher Deckel), nicht nachbauen
    assert.ok(Math.abs(ev / all - q) < 0.03, `p=${p}: Kampf ${(ev / all).toFixed(3)}, Formel ${q.toFixed(3)} (${all} Angriffe)`);
  }
});

test('Siegchance: gekoppelter Zufall – gleiche Würfel, „etwa gleich“ nur im Rauschen', async () => {
  const { seeded, rand } = await import('../js/rng.js');
  assert.equal(seeded(5, rand), seeded(5, rand)); assert.notEqual(seeded(5, rand), seeded(6, rand));
  const S = fresh('paladin'); S.lvl = 10; const mk = () => G.makeMonster(10, 1);
  assert.equal(Game.winChance('kop-1', mk, 200, []), Game.winChance('kop-2', mk, 200, []));   // anderer Schlüssel, gleiche Würfel
  const u = n => new Uint8Array(200).map((_, i) => i < n ? 1 : 0);
  assert.equal(Game.chancePair(u(100), u(100)).same, true);
  assert.equal(Game.chancePair(u(104), u(100)).same, true);    // 4 mehr, nur mit Tränken gewonnen: ≤ 2·√4
  assert.equal(Game.chancePair(u(110), u(100)).same, false);   // 10 mehr, alle nur mit Tränken: > 2·√10
  assert.equal(Game.chancePair(u(130), u(100)).same, false);   // 30 mehr: echter Unterschied
  const W = u(100), O = u(100); for (let i = 0; i < 20; i++) O[100 + i] = 1, O[i] = 0;   // 20 nur ohne, 20 nur mit: gleich
  assert.equal(Game.chancePair(W, O).same, true);
  S.crypt.prog.c1 = 4; const c = D.CRYPTS[0], o = Game.cryptOdds(c);   // leerer Gürtel → identisch
  assert.equal(o.pW, o.p0); assert.equal(o.same, true);
  S.pots = { rotwurz: 3, steinhaut: 3, gegengift: 3 }; const m = G.cryptEnemy(c);
  Game.bestBelt(m, 20); const b1 = S.belt.map(b => b?.id); Game.bestBelt(m, 20); assert.deepEqual(S.belt.map(b => b?.id), b1);   // gekoppelt → gleiche Wahl
});

test('Kampf: Serienbremse – nie mehr als 2 Ausweicher in Folge, gilt für Hiebe und Zauber', () => {
  const S = fresh('sorceress'); S.lvl = 20; const A = { ...G.stats(), hp: 1e6 };
  assert.ok(A.spells?.length, 'Zauberin braucht Zauber für den Test');
  // Gegner weicht immer aus (100 %): jeder Treffer kommt nur durch die Bremse
  const m = { ...G.makeMonster(20, 1), hp: 1e6, evade: 1, evadeCap: 0.5 };
  let mixed = 0, misses = 0;   // mixed: Zauber trifft, weil davor Hiebe ausgewichen wurden (gemeinsamer Zähler)
  for (let k = 0; k < 20; k++) {
    let run = [];
    for (const l of fight(A, m).log) {
      if (l.who !== 'a' || !(l.dmg !== undefined || l.miss || l.spell)) continue;
      if (l.miss === 'Ausgewichen') { run.push(l.spell ? 'z' : 'h'); misses++; assert.ok(run.length <= D.CFG.evadeStreak, `${run.length} Ausweicher in Folge`); }
      else { if (l.spell && run.includes('h')) mixed++; run = []; }
    }
  }
  assert.ok(misses > 0 && mixed > 0, `Ausweicher ${misses}, Zauber nach Hieb-Ausweichern ${mixed}`);
});

test('Inventar: Items überlappen nie, voller Beutel lehnt ab', () => {
  const S = fresh(); let added = 0;
  for (let i = 0; i < 60; i++) if (G.addToBag(makeItem(5))) added++;
  assert.ok(added < 60);
  for (const a of S.bag) for (const b of S.bag) if (a !== b)
    assert.ok(!(a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h), 'Überlappung');
  const n = S.bag.length; G.sortBag(); assert.equal(S.bag.length, n, 'Ordnen darf keine Items verlieren');
});

test('Anlegen tauscht und verliert nichts', () => {
  const S = fresh(); const w = makeItem(3, { slot: 'weapon' }); G.addToBag(w);
  const before = S.equip.weapon; assert.ok(G.equip(w.id));
  assert.equal(S.equip.weapon, w); assert.ok(S.bag.includes(before));
});

test('Stufenaufstieg gibt CFG.attrPerLevel Attributpunkte und 1 Talentpunkt', () => {
  const S = fresh(); const p = S.points; G.gainXp(G.xpNeed(1));
  assert.equal(S.lvl, 2); assert.equal(S.points, p + D.CFG.attrPerLevel); assert.equal(G.talentPoints(), 1);
});

test('Quest: Boss vor der Quest besiegt zählt trotzdem (kein Softlock)', () => {
  const S = fresh(); S.lvl = 20;
  S.trophies.push({ key: 'c1:0', name: 'x', eff: {} });
  S.traders.halvar.q = D.QUESTS.halvar.findIndex(q => q.obj.some(o => o.boss === 'c1'));
  assert.ok(Q.objectives('halvar').find(o => o.label.includes('Gerlinde')).done);
});

test('Quest: Abgabe verbraucht Material und gibt Lohn', () => {
  const S = fresh(); S.mats.schwanz = 10; const g = S.gold;
  assert.ok(Q.canComplete('ysolde')); const r = Q.complete('ysolde');
  assert.equal(S.mats.schwanz, 6); assert.equal(S.gold, g + r.gold); assert.equal(S.traders.ysolde.q, 1);
});

test('Finale: Entscheidung setzt Titel und Segen', () => {
  const S = fresh(); S.lvl = 30; S.traders.prophet.q = D.QUESTS.prophet.findIndex(q => q.choice);
  S.trophies.push({ key: 'c5:0', name: 'x', eff: {} });
  assert.equal(Q.complete('prophet'), null, 'ohne Wahl keine Abgabe');
  const r = Q.complete('prophet', 'crown'); assert.equal(S.title, 'Der Kronenlose'); assert.ok(r.perks.length);
});

test('Omen: deterministisch pro Tag, einmal erfüllbar, erst ab Stufe 3', () => {
  const S = fresh(); const a = G.omen(), b = G.omen(); assert.equal(a.loc, b.loc);
  assert.equal(G.omenFor(a.loc), null); S.lvl = 5;
  assert.ok(G.omenFor(G.omen().loc)); assert.ok(G.fulfillOmen()); assert.ok(!G.fulfillOmen());
});

test('Dienste: Schärfen erhöht Schaden, kostet Material', () => {
  const S = fresh(); S.gold = 9999; S.mats.zahn = 10; const d0 = S.equip.weapon.dmg[1];
  const s0 = G.stats().dmg[1]; G.doService('halvar', 'sharpen'); assert.equal(S.equip.weapon.dmg[1], d0, 'Teil selbst bleibt'); assert.ok(G.stats().dmg[1] > s0); assert.equal(G.slotUp('weapon'), 1); assert.equal(S.mats.zahn, 8);
});
test('Schärfen bleibt am Platz, wenn die Waffe wechselt', () => {
  const S = fresh(); S.gold = 99999; S.mats.zahn = 10; G.doService('halvar', 'sharpen'); G.doService('halvar', 'sharpen');
  const old = S.equip.weapon, w = { ...old, id: 'neu', dmg: [...old.dmg] }; S.equip.weapon = w;
  assert.equal(G.slotUp('weapon'), 2); assert.equal(G.tempered(10, 'weapon'), Math.round((Math.round(10 * 1.12) + 1) * 1.12) + 1);
  S.equip.weapon = null; assert.ok(G.serviceState(D.SERVICES.halvar[0]).reason !== 'Nichts angelegt', 'Platz lässt sich auch leer schärfen');
});

test('Grube kostet Glut und hat Abklingzeit (keine Gold-Endlosquelle)', () => {
  const S = fresh(); const g = S.glut, R = Game.makeRival();
  assert.ok(Game.arenaFight(R)); assert.equal(S.glut, g - D.CFG.arenaGlut); assert.equal(Game.arenaFight(R), null);
});

test('Bosse haben eigene Muster', () => {
  fresh(); G.S.lvl = 30; G.S.shards = ['c1', 'c2', 'c3', 'c4'];
  for (const c of D.CRYPTS) { G.S.crypt.prog[c.id] = 4; const m = G.cryptEnemy(c); assert.ok(m.boss); assert.ok(c.boss.mechText, c.id); }
});

test('Neustart v22: alter Stand wird gesichert, nicht umgerechnet; neuer Held überschreibt die Sicherung nicht', () => {
  const old = JSON.stringify({ v: 21, name: 'Alt', cls: 'witch', lvl: 23, gold: 9, equip: {}, bag: [] });
  localStorage.setItem('aschenkrone_v1', old);
  assert.equal(G.load(), null); assert.equal(G.restarted, 23); assert.ok(!G.unreadable, 'alter Stand ist kein Lesefehler');
  assert.equal(localStorage.getItem('aschenkrone_v1_bak'), old);
  G.newChar('Neu', 'sorceress'); assert.equal(G.S.v, G.SAVE_VERSION); assert.equal(localStorage.getItem('aschenkrone_v1_bak'), old);
  G.load(); assert.equal(G.S.name, 'Neu'); assert.equal(G.restarted, 0);
  localStorage.removeItem('aschenkrone_v1_bak');
});

test('Nur Zauberin, Assassine, Barbar sind wählbar – die anderen Klassen bleiben als Daten', () => {
  assert.deepEqual([...D.PLAYABLE].sort(), ['assassin', 'barbarian', 'sorceress']);
  for (const k of D.PLAYABLE) assert.ok(D.CLASSES[k] && D.SPELLS[k], k);
  for (const k of ['paladin', 'huntress', 'witch']) assert.ok(D.CLASSES[k], k + ' fehlt in den Daten');
});

test('Gefahr-Schätzung liegt zwischen 0 und 1', () => {
  fresh(); for (const l of D.LOCATIONS) { const p = Game.tripChance(l); assert.ok(p >= 0 && p <= 1); }
});

test('Streifzug: Beute ist ungesichert, Heimkehren sichert sie', () => {
  const S = fresh(); S.lvl = 3; S.points = 15; while (S.points) G.addAttr('str');
  let res; for (let i = 0; i < 20 && !res?.win; i++) { G.startTrip('friedhof', 'safe'); S.active.end = 0; res = Game.resolveTrip(); }
  assert.ok(res.win && S.haul); const g = S.gold, h = S.haul.gold;
  Game.bank(); assert.equal(S.gold, g + h); assert.equal(S.haul, null);
});

test('Tiefer gehen: Niederlage kostet die ungesicherte Beute, Erfahrung bleibt', () => {
  const S = fresh(); S.haul = { loc: 'friedhof', track: 'blood', depth: 4, gold: 500, mats: {}, items: [] };
  S.equip.weapon.dmg = [0, 0]; const g = S.gold, xp = S.xp;   // waffenlos -> verliert sicher
  const r = Game.delve(); assert.ok(!r.win); assert.equal(S.haul, null); assert.equal(S.gold, g); assert.equal(S.xp, xp);
});

test('Spuren: blutige Spur ist gefährlicher als leichte', () => {
  const S = fresh(); S.lvl = 5; const l = D.LOCATIONS[0];
  const safe = Game.winChance('t-safe', () => G.makeMonster(Math.max(1, G.locLvl(l) - 1), D.TRACKS[0].diff), 200);
  const blood = Game.winChance('t-blood', () => G.makeMonster(S.lvl + 3, D.TRACKS[2].diff), 200);
  assert.ok(safe > blood);
});

test('Steckbriefe: 3 verschiedene pro Tag, abholbar, nur einmal', () => {
  const S = fresh(); const b = G.bounties(); assert.equal(b.length, 3); assert.equal(new Set(b.map(x => x.id)).size, 3);
  b[0].prog = b[0].n; const g = S.gold; assert.ok(G.claimBounty(0)); assert.ok(S.gold > g); assert.equal(G.claimBounty(0), null);
});

test('Steckbriefe: nur Erreichbares, zählen über Akt-Kämpfe (kein Zettel aus alten Streifzügen)', () => {
  for (let day = 0; day < 40; day++) { const S = fresh(); S.lvl = 4; S.bounty = null;
    const real = Date.now; Date.now = () => real() + day * 86400000; const b = G.bounties(); Date.now = real;
    assert.equal(b.length, 3);
    for (const x of b) { assert.ok(D.BOUNTIES.some(d => d.id === x.id)); assert.ok(!['crypt', 'elite', 'blood', 'deep'].includes(x.id), 'gesperrt: ' + x.id);
      if (x.id === 'kill') assert.ok(D.LOCATIONS[0].mobs.includes(x.target), 'Ziel nicht in Akt I: ' + x.target); } }
  const S = fresh(); S.bounty = { day: -1, list: [] }; G.bounties(); S.bounty.list = [{ id: 'zones', target: null, n: 8, prog: 0 }, { id: 'kill', target: D.LOCATIONS[0].mobs[0], n: 5, prog: 0 }];
  S.attrs.str = 200; S.attrs.con = 200; const r = Game.actFight('a1', 0); assert.ok(r.win);
  assert.equal(S.bounty.list[0].prog, 1); assert.equal(S.bounty.list[1].prog, 1);
});

test('Omen fällt nur auf Orte offener Akte', () => {
  for (let day = 0; day < 40; day++) { const S = fresh(); S.lvl = 5; const real = Date.now; Date.now = () => real() + day * 86400000; const o = G.omen(); Date.now = real;
    assert.equal(o.loc, 'friedhof'); }
  const S = fresh(); S.lvl = 12; S.acts.prog.a1 = 9; S.acts.prog.a2 = 9; assert.deepEqual(G.openLocs().map(l => l.id), ['friedhof', 'muehle', 'katakomben']);
});

test('Unlesbarer Spielstand wird gesichert statt überschrieben, und kommt zurück', () => {
  const S = fresh(); S.gold = 4321; G.save(); const good = localStorage.getItem('aschenkrone_v1');
  const d = JSON.parse(good); d.v = 999; const future = JSON.stringify(d);
  localStorage.setItem('aschenkrone_v1', future); assert.equal(G.load(), null); assert.ok(G.unreadable);
  assert.equal(localStorage.getItem('aschenkrone_v1_bak'), future);
  G.newChar('Neu', 'witch'); assert.equal(localStorage.getItem('aschenkrone_v1_bak'), future);   // neuer Held überschreibt die Sicherung nicht
  localStorage.setItem('aschenkrone_v1_bak', good); localStorage.removeItem('aschenkrone_v1');   // Stand fehlt, Sicherung lesbar → zurückholen
  const L = G.load(); assert.equal(L.gold, 4321); assert.ok(!localStorage.getItem('aschenkrone_v1_bak'));
});

test('Auftragsziele nennen keine Krypta-Ebenen mehr', () => {
  const S = fresh(); S.lvl = 50;
  for (const tid of D.GIVERS) for (let q = 0; q < D.QUESTS[tid].length; q++) { S.traders[tid].q = q; for (const o of Q.objectives(tid)) assert.ok(!/Ebene|\(Albtraum|\(Hölle|Räume/.test(o.label), o.label); assert.ok(!/Ebenen/.test(D.QUESTS[tid][q].text)); }
});

test('Umherziehen übertrifft die Glut nicht: 2 Std. bringen in jedem Akt 0,5–1,8× so viel EP/Gold wie 30 Glut Farmen', () => {
  const N = 30, pts = D.WANDER.maxSec / D.WANDER.sec;
  for (const [i, a] of D.ACTS.entries()) { let xp = 0, gold = 0, mats = 0, herbs = 0;
    for (let k = 0; k < N; k++) { const S = fresh(); S.lvl = 60; for (let j = 0; j <= i; j++) S.acts.prog[D.ACTS[j].id] = D.ACT.zones + 1;
      const t0 = Date.now(); S.wander = { a: a.id, route: Array(D.WANDER.rows).fill(k % 3 ? 'fight' : k % 2 ? 'herb' : 'mats'), start: t0, t: t0, last: t0, n: 0, log: [], acc: { gold: 0, xp: 0, herbs: {}, mats: {}, items: [] } };
      S.wander.cur = { k: 'fight', mob: D.LOCATIONS.find(l => l.id === a.loc).mobs[0] };
      for (let p = 1; p <= pts * 2; p++) Game.wanderTick(t0 + p * D.WANDER.sec * 500);   // alle 60 s ein Takt (unter WANDER.gap)
      const r = Game.wanderClaim(); assert.equal(r.n, pts); xp += r.xp; gold += r.gold; mats += r.mats.reduce((x, y) => x + y[1], 0); herbs += r.herbs.reduce((x, y) => x + y[1], 0); }
    const reps = 30 / Game.actZoneGlut(a), lv = a.top, fx = reps * (20 + lv * 12), fg = reps * (6 + lv * 4);
    assert.ok(xp / N > fx * 0.5 && xp / N < fx * 1.8, `Akt ${a.n}: EP ${Math.round(xp / N)} gegen Glut ${Math.round(fx)}`);
    assert.ok(gold / N > fg * 0.5 && gold / N < fg * 2.2, `Akt ${a.n}: Gold ${Math.round(gold / N)} gegen Glut ${Math.round(fg)}`);
    assert.ok(mats / N < 12 && herbs / N < 8, `Akt ${a.n}: Material ${mats / N}, Zutaten ${herbs / N}`); }
});

test('Gegenstandsnamen: richtiges Geschlecht, nie ein Schrägstrich; alte Namen werden gerichtet (fixName)', async () => {
  const { adj, fixName } = await import('../js/loot.js');
  assert.equal(adj('Starker', 'Kappe'), 'Starke'); assert.equal(adj('Rostiger', 'Beil'), 'Rostiges'); assert.equal(adj('Zäher', 'Stiefel'), 'Zähe'); assert.equal(adj('Scharfer', 'Dolch'), 'Scharfer');
  for (const k of Object.keys(D.GENUS)) for (const n of D.GENUS[k]) assert.ok(D.BASES.some(b => b.name === n), 'unbekannt: ' + n);
  for (const cls of Object.keys(D.CLASSES)) assert.ok(!fresh(cls).equip.weapon.name.includes('/'));
  for (let i = 0; i < 400; i++) { const it = makeItem(1 + i % 30); assert.ok(!it.name.includes('/'), it.name); if (it.rarity === 'magic' && D.GENUS.f.includes(it.base)) assert.ok(!/er /.test(it.name.split(it.base)[0]), it.name); }
  const old = { name: 'Rostige/r Beil', rarity: 'normal', base: 'Beil' }; fixName(old); assert.equal(old.name, 'Rostiges Beil');
});

test('Rat bei schlechter Siegchance: Punkte, dann Beutel, sonst stärker werden', () => {
  const S = fresh(); assert.equal(Game.weakAdvice(0.9), null); assert.match(Game.weakAdvice(0.1), /Punkte verteilen/);
  S.points = 0; S.lvl = 1; assert.match(Game.weakAdvice(0.1), /wiederholen/);
  const it = makeItem(8, { slot: 'chest', minRarity: 3 }); G.addToBag(it); assert.match(Game.weakAdvice(0.1), /Beutel/);
});

test('Jeder Akt hat Einleitung, Boss-Satz und Nachruf; jeder Händler mehrere Sätze', () => {
  for (const a of D.ACTS) for (const k of ['intro', 'say', 'outro']) assert.ok(a[k]?.length > 10 && a[k].length < 110, `${a.id}.${k}`);
  for (const t of Object.values(D.TRADERS)) { assert.ok(t.lines.length >= 3); for (const l of t.lines) assert.ok(l.length <= 80, l); }
});

test('Glücksgriff gibt ein mindestens magisches Item gegen Gold', () => {
  const S = fresh(); S.gold = 5000; const it = G.doService('ysolde', 'gamble');
  assert.ok(it && ['magic', 'rare', 'legendary'].includes(it.rarity)); assert.ok(S.gold < 5000);
});

test('Eilen kostet mit Restzeit und Stufe mehr', () => {
  const S = fresh(); G.startTrip('friedhof', 'safe'); const c1 = G.rushCost(); S.lvl = 30; assert.ok(G.rushCost() > c1);
});

test('Zauber: werden im Kampf gewirkt, ab Stufe freigeschaltet', () => {
  const S = fresh('sorceress'); assert.equal(G.stats().spells.length, 1); S.lvl = 20; assert.equal(G.stats().spells.length, 3);
  let seen = false; for (let i = 0; i < 20 && !seen; i++) { const r = fight(G.stats(), G.makeMonster(3, 1)); seen = r.log.some(l => l.spell); assert.ok(r.left >= 0 && r.left <= 1); }
  assert.ok(seen, 'kein Zauber im Log');
});

test('Kampfkraft: besseres Item, mehr Kampfkraft; Vergleich zeigt es vorher', () => {
  const S = fresh(); const p0 = G.power();
  const w = { ...S.equip.weapon, id: 'x', dmg: [S.equip.weapon.dmg[0] * 3, S.equip.weapon.dmg[1] * 3] };
  const c = G.powerWith(w); assert.equal(c.now, p0); assert.ok(c.then > p0);
  assert.ok(G.powerAttr(D.CLASSES[S.cls].main) > 0, 'Hauptattribut-Punkt muss Kampfkraft bringen');
});

test('Kampfbewertung: souveräner Sieg gibt Bonus, Niederlage keine Bewertung', () => {
  assert.equal(Game.gradeOf({ winner: 'a', left: 0.9 }).id, 'dom');
  assert.equal(Game.gradeOf({ winner: 'a', left: 0.1 }).bonus, 0);
  assert.equal(Game.gradeOf({ winner: 'b', left: 0 }), null);
});

test('Waffen: fremde Waffe schwächt Schaden und Zauber; Zaubertempo zählt', () => {
  const S = fresh('sorceress'); const own = G.stats();
  S.equip.weapon = { ...S.equip.weapon, kind: 'sword' }; const off = G.stats();
  assert.ok(off.offWeapon && off.amp < own.amp && off.dmg[1] < own.dmg[1]);
  S.equip.weapon = { ...S.equip.weapon, kind: 'staff', mods: { haste: 20 } }; assert.equal(G.stats().haste, 0.2);
});

test('Schmiede: Rune kostet Material, gibt Wert nach Güte, Plätze begrenzt', () => {
  const S = fresh(); S.mats.zahn = 10; const before = S.equip.weapon.mods.dmg || 0;
  const r = G.forge('weapon', 'zahn', 15); assert.ok(r); assert.equal(S.mats.zahn, 8); assert.equal(S.equip.weapon.mods.dmg, before + r.v);
  const weak = G.forge('weapon', 'zahn', 0); assert.ok(weak.v < r.v, 'perfekte Schläge müssen mehr geben');
  assert.equal(G.forge('weapon', 'zahn', 15), null, 'nur ' + D.FORGE.maxRunes + ' Runen je Teil');
  assert.equal(G.forge('chest', 'zahn', 15), null, 'leerer Platz');
});

test('Bonus-Stufen: Gegenstandsstufe schaltet frei, Werte liegen im festen Bereich ihrer Stufe, Präfix/Suffix stimmen', () => {
  fresh(); const L = { 3: [], 30: [], 45: [] };
  for (let i = 0; i < 1500; i++) for (const lv of Object.keys(L)) L[lv].push(makeItem(+lv, { minRarity: 2 }));
  const tiers = l => l.filter(it => !it.unique).flatMap(it => Object.values(it.tiers || {}));
  assert.ok(!tiers(L[3]).some(t => t <= 4), 'nur V auf Gegenstandsstufe 3–4');
  assert.ok(!tiers(L[30]).includes(1) && tiers(L[30]).includes(2), 'Stufe II ja, I nein auf 30');
  assert.ok(tiers(L[45]).includes(1), 'Stufe I kommt auf hoher Stufe nie vor');
  for (const it of Object.values(L).flat()) {
    for (const [k, t] of Object.entries(it.tiers)) { const [lo, hi] = Ld.tierBand(k, t), m = it.unique ? D.CFG.uniqMult : 1;
      assert.ok(it.mods[k] >= Math.round(lo * m) && it.mods[k] <= Math.round(hi * m), `${k} ${it.mods[k]} nicht in Stufe ${t}`);
      if (it.unique) continue; assert.ok(D.TIERS.find(x => x.t === t).minLvl <= it.lvl, `Stufe ${t} auf Gegenstandsstufe ${it.lvl}`); }
    if (it.unique || it.set) continue;
    const aff = Object.keys(it.mods).map(k => D.AFFIXES.find(a => a.stat === k)), lim = Ld.sideLimits(it), r = D.RARITIES.find(x => x.id === it.rarity);
    assert.equal(aff.length, r.sides[0] + r.sides[1], `${it.rarity} ${it.slot}: ${aff.length} Boni`);
    assert.ok(aff.filter(a => a.side === 'pre').length <= lim.pre && aff.filter(a => a.side === 'suf').length <= lim.suf, `${it.slot}: Präfix/Suffix`);
    assert.ok(aff.filter(a => a.group === 'attr').length <= 1, 'zwei Hauptattribute auf einem Teil');
    if (['dmg', 'dmgp', 'critc', 'critd', 'spellp'].some(k => k in it.mods)) assert.ok(['weapon', 'gloves', 'ring', 'amulet'].includes(it.slot), `Schaden auf ${it.slot}`);
  }
  // Prozent-Boni klein: Stufe I höchstens 20 % je Teil (Krit-Chance höchstens 15) – außer den geeichten Sonder-Einheiten
  // (Welle 2a: Zaubertempo wirkt nur auf Zauber; Resistenzen haben eigene Deckel 75/50 % und eigene Grenzen im Resi-Test)
  for (const a of D.AFFIXES.filter(a => a.pct && !['critd', 'thornsp', 'haste', 'physr', 'elemr'].includes(a.stat) && !a.cls)) assert.ok(Ld.tierBand(a, 1)[1] <= (a.stat === 'critc' ? 15 : 20), a.stat);
});

test('Sonderboni und Einzigartige: selten, korrekt aufgebaut, wirken im Kampf', () => {
  const S = fresh(); let sp = 0, un = 0, n = 4000;
  for (let i = 0; i < n; i++) { const it = makeItem(25, { minRarity: 2, luck: 50 });
    if (it.special) { sp++; assert.ok(it.fx && ['magic', 'rare', 'legendary'].includes(it.rarity)); }
    if (it.unique) { un++; const u = D.UNIQUES.find(x => x.name === it.unique); assert.ok(u, it.unique);
      assert.equal(it.slot, u.slot); if (u.kind) assert.equal(it.kind, u.kind); assert.deepEqual(it.fx, u.eff); assert.ok(it.lore); } }
  assert.ok(sp > 0 && sp < n * 0.1, `Sonderboni ${sp}`); assert.ok(un > 0 && un < n * 0.05, `Einzigartige ${un}`);
  for (let i = 0; i < 300; i++) assert.ok(!makeItem(6, { minRarity: 2 }).special, 'Sonderbonus unter Gegenstandsstufe 8');
  // Effekt landet in den Werten, Knochenschild wirkt
  S.equip.helm = { ...makeItem(20, { slot: 'helm' }), fx: { ward: 0.5 } };
  assert.equal(G.stats().ward, 0.5);
  const r = fight(G.stats(), G.makeMonster(1, 1)); assert.ok(r.log.length);
  assert.ok(G.power() > G.power({ ...G.stats(), ward: 0 }), 'Kampfkraft muss Knochenschild einrechnen');
  const A = { ...G.stats(), ward: 1 }; let shielded = false;   // Schild = volles Leben: der erste Treffer des Gegners kostet kein Leben
  for (let i = 0; i < 30 && !shielded; i++) { const f = fight(A, G.makeMonster(1, 1)); if (f.log.some(l => l.who === 'b' && l.dmg && l.hpA === A.hp)) shielded = true; }
  assert.ok(shielded, 'Schild fängt den ersten Treffer');
});

test('Nachhall: Zauber wirkt zweites Mal, nie in Schleife', () => {
  const S = fresh('sorceress'); S.lvl = 20; S.equip.amulet = { ...makeItem(20, { slot: 'amulet' }), fx: { echo: 1 } };
  let seen = false; for (let i = 0; i < 20 && !seen; i++) { const r = fight(G.stats(), G.makeMonster(3, 1));
    seen = r.log.some(l => l.t.includes('hallt nach')); assert.ok(r.log.length < 400); }
  assert.ok(seen);
});

test('Siegel: unveränderter Spielstand ist sauber, von Hand geänderter wird markiert', () => {
  const S = fresh(); G.save(); assert.ok(!G.load().tampered);
  const d = JSON.parse(localStorage.getItem('aschenkrone_v1')); d.gold = 999999; localStorage.setItem('aschenkrone_v1', JSON.stringify(d));
  assert.ok(G.load().tampered); G.save(); assert.ok(G.load().tampered, 'Markierung muss bleiben');
});

test('Wert: Einzigartige und Sonderboni sind mehr wert', () => {
  fresh(); const items = Array.from({ length: 3000 }, () => makeItem(25, { minRarity: 3, luck: 100 }));
  const avg = f => { const l = items.filter(f); return l.reduce((a, b) => a + b.value, 0) / Math.max(1, l.length); };
  assert.ok(avg(i => i.unique) > avg(i => i.rarity === 'legendary' && !i.unique));
  assert.ok(avg(i => i.special && i.rarity === 'rare') > avg(i => !i.special && i.rarity === 'rare'));
});

test('Verkaufen: halber Wert, legendär + 1 Material je Platz – derselbe Weg für Knopf, Lager und volle Taschen', () => {
  const S = fresh(); S.lvl = 30; S.bag = []; S.stash = [];
  for (const slot of ['weapon', 'helm', 'chest', 'gloves', 'boots', 'belt', 'ring', 'amulet', 'offhand']) for (const rar of [2, 4]) {
    let it; do it = makeItem(30, { slot, minRarity: rar }); while (it.unique || it.set || (rar === 4) !== (it.rarity === 'legendary'));
    const mat = rar === 4 ? D.SELL.mat[it.slot] : null;
    assert.equal(G.sellMat(it), mat, slot); assert.equal(G.sellPrice(it), Math.max(1, Math.round(it.value * D.SELL.share)));
    const g = S.gold, m = mat ? S.mats[mat] || 0 : 0;
    assert.ok(G.addToBag(it)); G.sell(it.id);
    assert.equal(S.gold, g + G.sellPrice(it)); if (mat) assert.equal(S.mats[mat], m + D.SELL.legendMat, 'Material fehlt: ' + slot);
  }
  let it; do it = makeItem(30, { slot: 'ring', minRarity: 4 }); while (it.unique || it.set || it.rarity !== 'legendary');
  S.stash = [{ ...it, x: 0, y: 0 }]; const g = S.gold, m = S.mats.blutstein || 0;
  assert.ok(G.sellStash(it.id)); assert.equal(S.gold, g + G.sellPrice(it)); assert.equal(S.mats.blutstein, m + 1);
  const r = G.sellOff(it); assert.deepEqual(r, { gold: G.sellPrice(it), mat: 'blutstein' });   // der Helfer, den auch die Beute-Automatik nutzt
});

test('Keine Gold-Schleifen: Glücksgriff und Ladenware kosten mehr, als ihr Verkauf bringt', () => {
  for (const L of [5, 20, 40]) {
    const S = fresh(); S.lvl = L; S.attrs.lck = L * 3; let cost = 0, val = 0;
    for (let i = 0; i < 600; i++) { S.gold = 1e9; S.bag = []; const g = S.gold; const it = G.doService('ysolde', 'gamble'); cost += g - S.gold; val += it.value; }
    assert.ok(val < cost * 0.8, `Glücksgriff Stufe ${L}: Wert ${val} vs Kosten ${cost}`);
    for (const t of Object.keys(D.TRADERS)) for (let k = 0; k < 4; k++) { S.traders[t].rep = [0, 200, 700, 1600][k]; S.traders[t].shop = []; for (const it of G.shopFor(t)) assert.ok(it.price > it.value, 'Laden unter Verkaufswert'); }
  }
});

// --- Umschmieden: gegen Fehler und Ausnutzen ---
const craftable = (rar = 3, lvl = 25) => { let it; do it = makeItem(lvl, { slot: 'amulet', minRarity: rar }); while (it.unique || it.rarity !== D.RARITIES[rar].id); return it; };
const richCraft = () => { const S = fresh(); S.gold = 1e7; for (const k of Object.keys(D.MATS)) S.mats[k] = 1e4; S.bag = []; return S; };

test('Umschmieden: Versiegelter Bonus bleibt bei allem unverändert, Runen und Sonderbonus auch', () => {
  for (let rep = 0; rep < 40; rep++) {
    const S = richCraft(), it = craftable(); it.glut = it.glutMax = 9999; it.fx = { crit: 0.06 }; it.special = 'crit';
    S.equip.amulet = it; G.forge('amulet', 'zahn', 15); const runeDmg = it.runes[0].v;
    const k = Object.keys(G.baseMods(it))[0], v = G.baseMods(it)[k], t = it.tiers[k];
    assert.ok(!G.craft(it.id, 'seal', k).err); assert.equal(it.sealed, k);
    for (let i = 0; i < 30; i++) for (const op of ['chaos', 'values', 'remove', 'add']) { G.craft(it.id, op);
      assert.equal(G.baseMods(it)[k], v, 'versiegelter Wert verändert'); assert.equal(it.tiers[k], t);
      assert.ok((it.mods.dmg || 0) >= runeDmg, 'Rune verloren'); assert.equal(it.special, 'crit');
      assert.ok(Object.keys(G.baseMods(it)).length <= D.CRAFT.maxAff.rare, 'zu viele Boni');
      for (const [s, tt] of Object.entries(it.tiers)) assert.ok(tt >= 1 && tt <= 5 && G.baseMods(it)[s] >= 1, 'Stufe ohne Bonus'); }
    assert.ok(G.craft(it.id, 'seal', Object.keys(G.baseMods(it)).find(x => x !== k)).err, 'zweites Siegel');
  }
});

test('Umschmieden: kostet genau Material und Gold, beliebig oft – keine Schmiedeglut mehr, auch alte vollendete Teile', () => {
  const S = richCraft(), it = craftable(2, 20); S.bag = [it]; S.bag[0].x = 0; S.bag[0].y = 0;
  for (let i = 0; i < 60; i++) { const m = S.mats.staub, g = S.gold, cg = G.craftGold(it);
    const r = G.craft(it.id, 'values'); assert.ok(!r.err, `Eingriff ${i + 1}: ${r.err}`);
    assert.equal(S.mats.staub, m - 2); assert.equal(S.gold, g - cg); }
  assert.ok(!it.crafted, 'kein Teil wird mehr vollendet');
  it.crafted = 'Alt'; it.glut = 0; it.glutMax = 24;   // Spielstand von vor der Änderung
  assert.ok(!G.craft(it.id, 'values').err, 'altes vollendetes Teil bleibt gesperrt');
});

test('Umschmieden: Grenzen – Einzigartige, gewöhnliche, zu wenig Material/Gold, voll', () => {
  const S = richCraft(); let u; do u = makeItem(25, { slot: 'helm', minRarity: 4 }); while (!u.unique);
  S.bag = [u]; assert.ok(G.craft(u.id, 'add').err);
  const n = makeItem(5, { slot: 'helm' }); n.rarity = 'normal'; S.bag = [n]; assert.ok(G.craft(n.id, 'add').err);
  const it = craftable(2, 20); S.bag = [it]; S.mats.staub = 1; assert.ok(G.craft(it.id, 'values').err); S.mats.staub = 99; S.gold = 0; assert.ok(G.craft(it.id, 'values').err);
  S.gold = 1e6; while (Object.keys(G.baseMods(it)).length < 2) G.craft(it.id, 'add');
  S.mats.kronsplitter = 0; assert.ok(G.craft(it.id, 'add').err, 'magisch über 2 Boni ohne Kronsplitter');
  assert.ok(G.craft('gibtsnicht', 'add').err);
});

// Erheben: der einzige Weg, in der Umschmiede über die Grenze der Seltenheit zu kommen.
test('Erheben: Kronsplitter macht ein volles magisches Teil selten – einmal je Teil', () => {
  const S = richCraft(), it = craftable(2, 20); S.bag = [it]; it.glut = 99;
  while (Object.keys(G.baseMods(it)).length < 2) G.craft(it.id, 'add');
  const dmg = JSON.stringify([it.dmg, it.armor]), splitter = S.mats.kronsplitter;
  const r = G.craft(it.id, 'add');
  assert.ok(!r.err, 'mit Kronsplitter muss es gehen: ' + r.err);
  assert.equal(it.rarity, 'rare', 'steigt zu selten auf');
  assert.equal(Object.keys(G.baseMods(it)).length, 3, 'dritter Bonus da');
  assert.equal(S.mats.kronsplitter, splitter - D.CRAFT.raise.n, 'Splitter verbraucht');
  assert.equal(JSON.stringify([it.dmg, it.armor]), dmg, 'Grundwerte bleiben – kein geschenkter Grundwert');
  // Zweimal erheben darf niemand, auch nicht über die Fusion.
  while (Object.keys(G.baseMods(it)).length < 4) G.craft(it.id, 'add');
  assert.ok(G.craft(it.id, 'add').err, 'selten -> legendär ist zu');
  assert.equal(G.fusePromote(it, null), null, 'auch die Fusion hebt ein erhobenes Teil nicht weiter');
});

test('Umschmieden: Stufe I nur ab Gegenstandsstufe 20, auch beim Neu-Würfeln', () => {
  const S = richCraft(), it = craftable(3, 8); S.bag = [it]; it.glut = it.glutMax = 1e6;
  for (let i = 0; i < 300; i++) { G.craft(it.id, i % 2 ? 'chaos' : 'values'); assert.ok(Object.values(it.tiers).every(t => t >= 3), 'zu hohe Stufe auf niedriger Gegenstandsstufe'); }
});

test('Umschmieden: kein Gold durch Craften+Verkaufen – bei keinem Eingriff, keiner Stufe, keiner Seltenheit', () => {
  const S = richCraft();
  for (const op of ['add', 'chaos', 'values', 'remove']) for (const rar of [2, 3, 4]) for (const L of [10, 25, 40]) {
    let spent = 0, gain = 0;
    for (let i = 0; i < 150; i++) { const it = craftable(rar, L); S.bag = [it]; const v0 = it.value, g0 = S.gold;
      if (G.craft(it.id, op).err) continue; spent += g0 - S.gold; gain += it.value - v0; }
    assert.ok(gain < spent || !spent && !gain, `${op}/${rar}/${L}: Wertzuwachs ${gain} > Kosten ${spent}`);   // volle Teile: „Hinzufügen“ geht nicht – dann nichts
  }
});

test('Zauber nutzen alle Werte: Lebensraub, Krit, Gift, Henker, Glocke', () => {
  const S = fresh('witch'); S.lvl = 20;   // Grabhexe: 20 % Lebensraub als Klasse
  const A = { ...G.stats(), crit: 0.6, toll: 1, poison: 0.1 };
  let leech = false, crit = false, poison = false, toll = false;
  for (let i = 0; i < 40; i++) for (const l of fight(A, G.makeMonster(3, 1)).log) if (l.spell) {
    if (/\+\d+ Leben/.test(l.t)) leech = true; if (l.crit) crit = true; if (l.t.includes('Glocke')) toll = true; }
  for (let i = 0; i < 40 && !poison; i++) { const f = fight({ ...A, spells: A.spells.slice(0, 1) }, G.makeMonster(3, 1)); const k = f.log.findIndex(l => l.spell && l.dmg);
    if (k >= 0 && f.log.slice(k + 1).some(l => l.t.includes('Gift zerfrisst'))) poison = true; }
  assert.ok(leech, 'Zauber heilt nicht über Lebensraub'); assert.ok(crit, 'Zauber trifft nie kritisch');
  assert.ok(toll, 'Zauber zählt nicht für die Glocke'); assert.ok(poison, 'Zauber vergiftet nicht');
});

test('Höhere Grundgegenstände erst ab ihrer Stufe; Bild-Varianten gehören zur Basis', () => {
  fresh(); const hi = D.BASES.filter(b => b.minLvl);
  for (let i = 0; i < 3000; i++) { const it = makeItem(10, { minRarity: 1 }); const b = D.BASES.find(x => x.name === it.base);
    assert.ok(!b.minLvl || 10 >= b.minLvl, `${b.name} auf Stufe 10`); assert.ok([b.art, ...(b.vars || [])].includes(it.art), `fremdes Bild ${it.art}`); }
  const seen = new Set(); for (let i = 0; i < 6000; i++) seen.add(makeItem(30, { minRarity: 1 }).base);
  for (const b of hi) assert.ok(seen.has(b.name), `${b.name} kommt auf Stufe 30 nie vor`);
});

test('Name: kein HTML im Charakternamen', () => {
  G.newChar('<img src=x onerror=alert(1)>Böse"', 'paladin'); assert.ok(!/[<>"]/.test(G.S.name)); assert.ok(G.S.name.length <= 16);
  G.newChar('   ', 'paladin'); assert.equal(G.S.name, 'Namenloser');
});

// --- Kampf-Boni auf Items (critc, critd, dmgp, Zauber-Boni …) ---
const { affixPool } = await import('../js/loot.js');
test('Boni-Pools: Kampf-Boni nur auf passenden Plätzen, Zauber-Boni nur auf der Waffe der eigenen Klasse', () => {
  for (let i = 0; i < 3000; i++) {
    const it = makeItem(1 + (i % 40), { minRarity: 2 + (i % 3) });
    for (const k of Object.keys(it.tiers)) {
      const a = D.AFFIXES.find(x => x.stat === k); assert.ok(a, `unbekannter Bonus ${k}`);
      if (!it.unique) assert.ok(!a.slots || a.slots.includes(it.slot), `${k} auf ${it.slot}`);
      if (a.kind) assert.equal(a.kind, it.kind, `${k} auf fremder Waffe ${it.kind}`);
    }
  }
  const staff = { slot: 'weapon', kind: 'staff' };
  assert.ok(affixPool(staff).some(a => a.stat === 'sk_feuerball') && !affixPool(staff).some(a => a.stat === 'sk_schrei'));
  assert.ok(!affixPool({ slot: 'boots' }).some(a => ['critd', 'penp', 'sk_feuerball'].includes(a.stat)));
});

test('Umschmieden bleibt im Pool des Teils (Chaos/Hinzufügen/Werte)', () => {
  const S = fresh('sorceress'); S.gold = 1e9; for (const k of Object.keys(D.MATS)) S.mats[k] = 999;
  for (let r = 0; r < 40; r++) {
    let it; do it = makeItem(25, { slot: r % 2 ? 'boots' : 'weapon', minRarity: 3 }); while (it.unique); it.kind = r % 2 ? it.kind : 'staff';
    S.bag = []; G.addToBag(it);
    for (let i = 0; i < 6; i++) G.craft(it.id, ['chaos', 'add', 'values'][i % 3]);
    const pool = new Set(affixPool(it).map(a => a.stat));
    for (const k of Object.keys(G.baseMods(it))) assert.ok(pool.has(k), `${k} auf ${it.slot}/${it.kind}`);
  }
});

test('Krit-Schaden, Prozent-Schaden und Zauber-Bonus wirken in Werten und Kampfkraft; Obergrenzen halten', () => {
  const S = fresh('sorceress'); S.lvl = 20; S.attrs.int += 60;
  const p0 = G.power(), w = S.equip.weapon;
  w.mods = { critd: 50 }; assert.equal(G.stats().critMult, 2.5); const p1 = G.power(); assert.ok(p1 > p0);
  w.mods = { critd: 999 }; assert.equal(G.stats().critMult, D.CAPS.critMult);
  w.mods = { critc: 999 }; assert.equal(G.stats().crit, D.CAPS.crit);
  w.mods = { dmgp: 20 }; const d = G.stats().dmg; w.mods = {}; const d0 = G.stats().dmg; assert.ok(d[1] > d0[1]);
  w.mods = { sk_feuerball: 40 }; assert.equal(G.stats().spells.find(s => s.id === 'feuerball').boost, 1.4); assert.ok(G.power() > p0);
  // Klassen-/Talentwerte werden durch die Obergrenze nie gekürzt
  const W = fresh('witch'); W.tal = {}; W.equip.weapon.mods = { leechp: 500 }; assert.equal(G.stats().leech, Math.max(0.2, D.CAPS.leech));
});

test('Krit-Schaden steckt im Kampf: höherer Multiplikator → mehr Schaden pro Krit', () => {
  const S = fresh('assassin'); S.lvl = 15; S.attrs.dex += 50;
  const mon = G.makeMonster(15, 1); mon.hp = 1e7; mon.cur = 1e7; mon.dex = 0; mon.armor = 0;
  // Der Held bekommt dasselbe Riesenleben wie der Gegner: sonst entscheidet der Zufall, nach wie
  // vielen Zuegen er faellt, und damit die Zahl der Krit-Proben – der Test flockte selten.
  const avgCrit = mult => { const a = { ...G.stats(), hp: 1e7, cur: 1e7, crit: 0.6, critMult: mult, spells: [] }; let sum = 0, n = 0;
    for (let i = 0; i < 40; i++) for (const l of fight(a, { ...mon }).log) if (l.who === 'a' && l.crit && l.dmg) { sum += l.dmg; n++; } return sum / n; };
  assert.ok(avgCrit(3) > avgCrit(2) * 1.3);
});

test('Eichung: jeder Prozent-Bonus liegt nah am Hauptattribut derselben Stufe (Heldenstufe 20)', async () => {
  const { execFileSync } = await import('node:child_process');
  const out = execFileSync('node', ['tests/calib.mjs'], { encoding: 'utf8' });
  // Alle elf Prozent-Boni. critd fehlte hier lange – deshalb konnte Krit-Schaden auf ein Drittel
  // seines Werts absacken, ohne dass der Testlauf etwas merkte. Neuer pct-Bonus → hier eintragen.
  for (const k of ['critc', 'critd', 'dmgp', 'spellp', 'penp', 'leechp', 'lifep', 'blockp', 'evadep', 'thornsp', 'haste', 'sk_*']) {
    const row = out.split('\n').find(l => l.startsWith(k)); assert.ok(row, k);
    const v20 = parseFloat(row.trim().split(/\s+/).slice(-3)[0]);   // Spalte St.20
    // Ausnahmen, gemessen 2026-11-21 (Welle 1a): Lebensraub ist ganzzahlig schon auf dem kleinsten Schritt (1–5 % von V bis I)
    // und liegt bei ~2,1 – kleiner geht nicht ohne Kommastellen (offene Frage im Bericht). Dornen laufen in CAPS.thorns (~0,5).
    const [lo, hi] = k === 'leechp' ? [0.7, 2.3] : k === 'thornsp' ? [0.4, 1.4] : [0.7, 1.4];
    assert.ok(v20 > lo && v20 < hi, `${k}: ${v20} weicht zu weit vom Hauptattribut ab`);
  }
});

test('Kampf-Boni wirken auf Hieb UND Zauber (Krit, Krit-Schaden, Lebensraub, Zauber-Bonus auf Heilung)', () => {
  const S = fresh('sorceress'); S.lvl = 20;
  const mon = () => ({ name: 'Puppe', lvl: 20, main: 'str', str: 10, dex: 0, int: 0, con: 10, lck: 0, armor: 100, dmg: [60, 60], hp: 1e9 });
  const logs = mods => { S.equip.weapon.mods = mods; const A = { ...G.stats(), hp: 1e7 }; const L = []; for (let i = 0; i < 150; i++) L.push(...fight(A, mon()).log.filter(l => l.who === 'a' && l.dmg && !l.hits)); return L; };
  const rate = (L, f) => L.filter(f).length / L.length;
  const c = logs({ critc: 30 });
  assert.ok(rate(c.filter(l => !l.spell), l => l.crit) > 0.25 && rate(c.filter(l => l.spell), l => l.crit) > 0.25, 'Krit-Chance auf Hieb und Zauber');
  const ratio = (L, sp) => { const x = L.filter(l => !!l.spell === sp), cr = x.filter(l => l.crit), no = x.filter(l => !l.crit);
    return cr.reduce((a, l) => a + l.dmg, 0) / cr.length / (no.reduce((a, l) => a + l.dmg, 0) / no.length); };
  const d = logs({ critc: 40, critd: 60 }); assert.ok(ratio(d, false) > 2.3 && ratio(d, true) > 2.3, 'Krit-Schaden auf Hieb und Zauber');
  const h = logs({ leechp: 10 }); assert.ok(rate(h.filter(l => !l.spell), l => l.heal) > 0.7 && rate(h.filter(l => l.spell), l => l.heal) > 0.7, 'Lebensraub auf Hieb und Zauber');   // bei vollem Leben heilt nichts
  const P = fresh('paladin'); P.lvl = 20; const gebet = mods => { P.equip.weapon.mods = mods; const A = { ...G.stats(), hp: 1e7 };
    for (let i = 0; i < 50; i++) { const l = fight(A, { ...mon(), dmg: [1.5e6, 1.5e6] }).log.find(l => l.sid === 'gebet' && l.heal); if (l) return l.heal; } };   // verwundet, damit die volle Heilung zählt
  assert.ok(Math.abs(gebet({ sk_gebet: 50 }) / gebet({}) - 1.5) < 0.02, 'Zauber-Bonus verstärkt Heilzauber');
});

test('Zauber-Wege: Daten gültig, Stufen öffnen mit der Stufe, erste Wahl gratis, Wechsel kostet', () => {
  const KEYS = new Set(['open', 'every', 'mult', 'desperate', 'hits', 'dotStack', 'crit', 'pierce', 'fresh', 'execute', 'burn', 'bleed', 'poison', 'weaken', 'vuln', 'lifesteal', 'shieldGain',
    'healPct', 'overshield', 'strike', 'buff', 'stun', 'stunTurns', 'dazedCrit', 'noheal', 'cleanse', 'stunImmune', 'detonate', 'poisonLeech', 'max']);
  for (const sp of Object.values(D.SPELLS).flat()) { const tr = D.SPELL_TREE[sp.id]; assert.equal(tr?.length, 3, sp.id);
    for (const opts of tr) { assert.equal(opts.length, 2); for (const o of opts) { assert.ok(o.name && o.text); for (const k of Object.keys(o.m)) assert.ok(KEYS.has(k), `${o.id}: ${k}`); } } }
  const S = fresh('sorceress'); S.lvl = 5; S.gold = 0;
  assert.ok(G.chooseWay('feuerball', 0, 1));                       // Stufe 6 noch nicht erreicht
  S.lvl = 10; assert.equal(G.chooseWay('feuerball', 0, 1), null); assert.equal(S.gold, 0);   // erste Wahl gratis
  assert.ok(G.chooseWay('feuerball', 0, 0));                       // Wechsel ohne Gold geht nicht
  S.gold = G.wayCost(); assert.equal(G.chooseWay('feuerball', 0, 0), null); assert.equal(S.gold, 0);
  assert.ok(G.chooseWay('meteor', 0, 0));                          // Meteor erst ab Stufe 18
  const st = G.stats().spells.find(s => s.id === 'feuerball'); assert.equal(st.m.open, 1); assert.deepEqual(st.ways, ['Funkenflug']);
});

test('Zauber-Wege wirken im Kampf: sofort, Brand, Kombo-Krit, Bannen, Reinigen, Unbeugsam', () => {
  const S = fresh('sorceress'); S.lvl = 24;
  const mon = (x = {}) => ({ name: 'Puppe', lvl: 24, main: 'str', str: 10, dex: 0, int: 0, con: 10, lck: 0, armor: 50, dmg: [50, 50], hp: 1e9, ...x });
  const run = (sp, x) => { S.sp = sp; return fight({ ...G.stats(), hp: 1e7 }, mon(x)).log; };
  assert.ok(run({ feuerball: [0, null, null] }).find(l => l.who === 'a' && (l.dmg || l.miss)).sid === 'feuerball', 'Funkenflug wirkt im ersten Zug');
  assert.ok(run({ feuerball: [1, null, null] }).some(l => l.tk === 'burn'), 'Glühend lässt brennen');
  let combos = 0; for (let i = 0; i < 20; i++) combos += run({ feuerball: [null, 0, null], frost: [null, null, 0] }).filter(l => l.sid === 'feuerball' && l.combo).length;
  assert.ok(combos > 0, 'Schmelzen löst nach Frostnova aus');
  const regen = run({ frost: [null, null, null], feuerball: [null, null, null] }, { regen: 0.05 }).filter(l => l.who === 'b' && l.heal).length;
  const P = fresh('witch'); P.lvl = 24; P.sp = { seuche: [null, 0, null] };
  const banned = fight({ ...G.stats(), hp: 1e7 }, mon({ regen: 0.05 })).log.filter(l => l.who === 'b' && l.heal).length;
  assert.ok(banned < regen, 'Siechtum unterbindet Heilung');
  const B = fresh('paladin'); B.lvl = 24; B.sp = { gebet: [null, 0, null] };
  const pois = fight({ ...G.stats(), hp: 1e7 }, mon({ poison: 0.3 })).log; assert.ok(pois.some(l => l.status === 'Gereinigt'), 'Reinigung entfernt Gift');
  B.sp = { gebet: [null, null, 0] }; let res = 0; for (let i = 0; i < 10; i++) res += fight({ ...G.stats(), hp: 1e7 }, mon({ toll: 1 })).log.filter(l => l.status === 'Widersteht').length;
  assert.ok(res > 0, 'Standhaft widersteht der Glocke');
});

test('Tränke: Bilder, Rezepte, Auslöser gültig', async () => {
  const fs = await import('node:fs');
  for (const p of D.POTIONS) {
    assert.ok(fs.existsSync(`assets/potions/${p.id}.webp`), `Trank-Bild fehlt: ${p.id}`);
    for (const k of Object.keys(p.cost)) assert.ok(D.HERBS[k], `${p.id}: Zutat ${k} unbekannt`);
    assert.equal(!!p.rare, !!p.cost.herz, `${p.id}: selten ⇔ braucht Schwarzes Herz`);
    if (!p.rare) { assert.ok(p.trig?.length); for (const t of p.trig) assert.ok(D.TRIGGERS[t], t); }
  }
  for (const h of Object.values(D.HERBS)) assert.ok(fs.existsSync(`assets/potions/${h.img}.webp`), h.img);
  for (const l of D.LOCATIONS) assert.ok(D.HERBS[D.HERB_LOC[l.id]], `Ort ohne Zutat: ${l.id}`);
});
test('Alchemie: Brauen kostet Zutaten und Gold, Vorrat begrenzt', () => {
  const S = fresh(); S.gold = 1000; S.herbs = { rotwurz: 20 };
  assert.ok(G.brew('rotwurz')); assert.equal(S.pots.rotwurz, D.ALCH.charges); assert.equal(S.herbs.rotwurz, 18); assert.ok(S.gold < 1000);
  G.brew('rotwurz'); G.brew('rotwurz'); assert.equal(S.pots.rotwurz, D.ALCH.maxCommon); assert.equal(G.canBrew('rotwurz').ok, false);
  assert.equal(G.brew('falkenauge'), false, 'ohne Herz kein seltener Trank');
  S.herbs = { herz: 1, silberstaub: 1 }; assert.ok(G.brew('falkenauge')); assert.equal(S.pots.falkenauge, 1);
});
test('Gürtel: nur mit Vorrat, kein Doppel, höchstens ein seltener, Plätze nach Treue', () => {
  const S = fresh(); S.pots = { rotwurz: 3, steinhaut: 3, falkenauge: 1, schatten: 1 };
  assert.ok(G.setBelt(0, 'rotwurz')); assert.equal(G.setBelt(1, 'rotwurz'), false);
  assert.ok(G.setBelt(1, 'falkenauge')); assert.equal(G.beltSlots(), 2); assert.equal(G.setBelt(2, 'steinhaut'), false, 'dritter Platz erst mit Treue');
  S.traders.ysolde.rep = 99999; S.lvl = 60; assert.equal(G.beltSlots(), 3); assert.equal(G.setBelt(2, 'schatten'), false, 'zweiter seltener');
  assert.ok(G.setBelt(2, 'steinhaut')); assert.equal(G.setBelt(0, 'gegengift'), false, 'ohne Vorrat');
  assert.ok(G.setTrig(0, 'hp30')); assert.equal(G.setTrig(0, 'start'), false);
  assert.equal(G.beltCombat().length, 3);
});
test('Gürtel: Tagesladung nur für gewöhnliche im Gürtel, einmal je Tag', () => {
  const S = fresh(); S.pots = { rotwurz: 1, falkenauge: 1 }; G.setBelt(0, 'rotwurz'); G.setBelt(1, 'falkenauge');
  S.potDay = 'gestern'; assert.ok(G.potDaily()); assert.equal(S.pots.rotwurz, 2); assert.equal(S.pots.falkenauge, 1);
  assert.equal(G.potDaily(), false); assert.equal(S.pots.rotwurz, 2);
});
test('Kampf: Trank zündet bei seinem Auslöser, wird in der Krypta verbraucht', () => {
  const S = fresh('barbarian'); S.pots = { rotwurz: 2 }; G.setBelt(0, 'rotwurz');
  const A = { ...G.stats(), belt: G.beltCombat() }, B = { ...G.makeMonster(1, 3), hp: 99999, rage: 0, crit: 0, lck: 0 }; B.dmg = [Math.round(A.hp * 0.08), Math.round(A.hp * 0.1)]; B[B.main] = 0;
  const r = fight(A, B); assert.deepEqual(r.used, ['rotwurz']); const e = r.log.find(l => l.pot === 'rotwurz');
  assert.ok(e && e.hpA > 0); assert.ok(r.log[r.log.indexOf(e) - 1].hpA < A.hp * 0.5, 'erst unter 50 % Leben');
  S.crypt.cd = 0; S.acts.prog.a1 = D.ACT.zones + 1; const res = Game.cryptFight('c1'); assert.ok(res); assert.ok(S.pots.rotwurz === 2 - res.rew.used.length);
});
test('Kampf: Gegengift macht immun gegen neues Gift, Weihwasser stoppt Heilung', () => {
  fresh('paladin'); const A = { ...G.stats(), hp: 99999, belt: [{ id: 'g', name: 'G', fx: { cure: 50 }, trig: 'dot' }] };
  const B = { ...G.makeMonster(5, 1), poison: 0.5, hp: 5000 };
  const r = fight(A, B), i = r.log.findIndex(l => l.pot === 'g'); assert.ok(i >= 0);
  assert.ok(!r.log.slice(i + 1).some(l => l.tk === 'poison' && l.who === 'b'), 'nach Gegengift kein Gift mehr');
  const C = { ...G.makeMonster(5, 1), regen: 0.1, hp: 5000 }, A2 = { ...G.stats(), hp: 99999, belt: [{ id: 'w', name: 'W', fx: { noheal: 99 }, trig: 'start' }] };
  assert.ok(!fight(A2, C).log.some(l => l.who === 'b' && l.heal), 'kein Heilen unter Weihwasser');
});
test('Vorbereitung: ein Tippen packt/braut den passenden Trank, Bester Gürtel nimmt nur Vorrat', () => {
  const S = fresh('paladin'); S.lvl = 10; S.gold = 1000; S.herbs = { silberstaub: 4 }; S.pots = { rotwurz: 3, steinhaut: 3 };
  assert.equal(Game.potOffer('weihwasser').kind, 'brew'); assert.equal(Game.potOffer('wachsaft').kind, 'miss'); assert.match(Game.potOffer('wachsaft').text, /Moor/);
  G.setBelt(0, 'rotwurz'); G.setBelt(1, 'steinhaut');
  assert.ok(Game.packPotion('weihwasser', ['steinhaut'])); assert.deepEqual(S.belt.filter(Boolean).map(b => b.id).sort(), ['steinhaut', 'weihwasser']);
  assert.equal(Game.potOffer('weihwasser').kind, 'in');
  S.crypt.prog.c1 = 4; const m = G.cryptEnemy(D.CRYPTS[0]); assert.ok(Game.bestBelt(m, 10));
  for (const b of S.belt.filter(Boolean)) assert.ok(S.pots[b.id] > 0);
});
test('Kampfbericht: Anteile ergeben ~100 %, Niederlage gibt einen Tipp; Absicht steht im Log', () => {
  const S = fresh('witch'); S.lvl = 6; S.crypt.prog.c4 = 4; S.lvl = 22; const m = G.cryptEnemy(D.CRYPTS[3]), A = { ...G.stats(), hp: 50000 };
  const r = fight(A, m), R = Game.fightReport(r, A, m);
  const sum = R.his.reduce((a, [, v]) => a + v, 0); assert.ok(sum >= 90 && sum <= 101, 'Anteile ' + sum);
  if (r.winner !== 'a') assert.ok(R.tip);
  assert.ok(r.log.some(l => /Betäubung/.test(l.iB || '')), 'Glöckner zeigt seine Betäubung an');
});

const anyPath = (map, prefer) => { const path = []; for (let i = 0; i < map.rows.length; i++) { const opts = map.rows[i].map((n, j) => j).filter(j => !i || Game.expLinked(map.rows[i - 1][path[i - 1]], map.rows[i][j]));
  path.push(opts.find(j => map.rows[i][j].t === prefer) ?? opts[0]); } return path; };
test('Expedition: Karte, Weg, ohne Glut, blockiert Kämpfe, Ereignisse bei der Heimkehr, früh heimrufen', () => {
  const S = fresh('witch'); S.lvl = 12; S.glut = 0; let t = Date.now(); const real = Date.now; Date.now = () => t;
  try {
    for (const h of D.EXPED.hours) for (const loc of ['friedhof', 'katakomben']) { const m = Game.expedMap(loc, h); assert.equal(m.rows.length, D.EXPED.stations[h]);
      assert.deepEqual(Game.expedMap(loc, h), m, 'Karte am selben Tag gleich'); for (let i = 1; i < m.rows.length; i++) for (const n of m.rows[i - 1]) assert.ok(m.rows[i].some(x => Game.expLinked(n, x)), 'jede Station hat einen Weiterweg');
      if (h >= 2) assert.ok(m.rows.flat().some(n => n.t === 'event'), 'mindestens ein Ereignis'); assert.ok(m.rows.flat().filter(n => n.t === 'danger').length <= 1); }
    const map = Game.expedMap('katakomben', 8), path = anyPath(map, 'event');
    assert.equal(Game.startExped('katakomben', 8, [9, 9, 9, 9]), false, 'ungültiger Weg'); assert.equal(Game.startExped('katakomben', 8, path.slice(0, 2)), false, 'halber Weg');
    assert.ok(Game.startExped('katakomben', 8, path)); assert.equal(S.glut, 0, 'kostet keine Glut');
    assert.equal(Game.startExped('friedhof', 1, [0]), false, 'nur eine zugleich'); S.glut = 100;
    assert.equal(G.startTrip('friedhof'), false, 'kein Streifzug'); S.crypt.cd = 0;
    assert.equal(Game.cryptFight('c1'), null, 'keine Krypta'); S.arenaTs = 0; assert.equal(Game.arenaFight(Game.makeRival()), null, 'keine Grube');
    t += 8 * 3600e3 + 1000; const g0 = S.gold, xp0 = S.xp, lvl0 = S.lvl;
    Game.expBegin(); let r = Game.expAdvance(); let evs = 0;
    while (r?.ev) { evs++; assert.ok(r.ev.ch.length >= 2); const save = JSON.stringify(S.exp.ret); assert.ok(save.length > 10, 'Heimkehr steht im Spielstand'); r = Game.expChoose(r.ev.ch.length - 1); }
    assert.ok(evs >= 1, 'Weg über Ereignis'); const res = r.done; assert.equal(S.exp, null); assert.ok(S.gold > g0); assert.ok(S.lvl > lvl0 || S.xp > xp0);
    assert.equal(res.steps.length, path.length + 1, 'jede Station + Ziel eine Zeile'); assert.ok(res.rew.items.some(it => ['magic', 'rare', 'legendary'].includes(it.rarity)), '8 Std.: Ziel bringt sicheres Fundstück');
    // früh heimrufen: volle Stunden, nur geschaffte Stationen, kein Ziel
    assert.ok(Game.startExped('friedhof', 4, anyPath(Game.expedMap('friedhof', 4)))); t += 2.5 * 3600e3; const r2 = Game.claimExped(); assert.equal(r2.h, 2); assert.ok(r2.early); assert.ok(r2.steps.length <= 2 && !r2.steps.some(s => s.t === 'goal'));
    assert.ok(Game.startExped('friedhof', 1, [0])); t += 10 * 60e3; const g1 = S.gold, r3 = Game.claimExped(); assert.equal(r3.h, 0); assert.equal(S.gold, g1, 'unter 1 Std. nichts');
    // Kosten: Rotwurz fehlt → Wahl gesperrt
    S.pots = {}; assert.ok(Game.expChoiceOk(D.EXP_EVENTS.find(e => e.id === 'raeuber').ch[0]));
    // Balance: Erfahrung über 8 Std. unter der Hälfte dessen, was die Glut in derselben Zeit bringt (Schnitt vieler Wege)
    let xp = 0, N = 60; const l = D.LOCATIONS.find(x => x.id === 'katakomben'), tr = G.tripReward(l, 1, 45), glutXp = 8 * 15 / l.glut * tr.xp;
    for (let k = 0; k < N; k++) { t += 86400e3; const m = Game.expedMap('katakomben', 8); assert.ok(Game.startExped('katakomben', 8, anyPath(m, ['camp', 'ruin', 'event'][k % 3]))); t += 8 * 3600e3 + 1; xp += Game.claimExped(ev => 1).rew.xp; S.lvl = 12; }
    assert.ok(xp / N < glutXp * 0.5, `Expedition ${Math.round(xp / N)} EP vs. Glut ${Math.round(glutXp)}`);
  } finally { Date.now = real; }
});
test('Expedition: alle Stations- und Ereignisbilder vorhanden', async () => {
  const fs = await import('node:fs');
  for (const k of [...Object.keys(D.EXP_NODES), 'goal']) assert.ok(fs.existsSync(`assets/expedition/${k}.webp`), k);
  for (const e of D.EXP_EVENTS) { assert.ok(fs.existsSync(`assets/${e.img}`), e.img); assert.equal(e.ch.length, 3, e.id); }
});
test('Expedition: Segen/Fluch wirkt einmal auf den nächsten Krypta-Kampf', () => {
  const S = fresh('paladin'); S.lvl = 10; S.acts.prog.a1 = D.ACT.zones + 1; const c = D.CRYPTS[0]; S.bless = 0.2; const A = Game.blessed(G.stats()); assert.equal(A.hp, Math.round(G.stats().hp * 1.2));
  S.crypt.cd = 0; const r = Game.cryptFight(c.id); assert.ok(r); assert.equal(r.rew.bless, 0.2); assert.equal(S.bless, 0, 'verbraucht');
});
// --- Der Abstieg ---
const descHero = (cls = 'paladin', lvl = 14) => { const S = fresh(cls); S.lvl = lvl; S.attrs.str += 120; S.attrs.con += 80; S.attrs.int += 60; S.attrs.dex += 40;
  S.trophies.push({ key: 'c2:0', name: 'x', diff: 'Normal', eff: D.CRYPTS[1].trophy }); return S; };
test('Abstieg: Karte – Reihen, Ausgänge, jeder Raum erreichbar, Boss oben', () => {
  descHero();
  for (let k = 0; k < 200; k++) {
    const rows = Game.descMap(D.CRYPTS[1]);
    assert.deepEqual(rows.map(r => r.length), D.DESCENT.widths);
    assert.ok(rows[0].every(n => n.t === 'fight'), 'erste Reihe: Kämpfe');
    assert.equal(rows[D.DESCENT.rope].filter(n => n.t === 'rope').length, 1); assert.equal(rows[D.DESCENT.well].filter(n => n.t === 'well').length, 1);
    for (let r = 1; r < rows.length; r++) for (const n of rows[r]) assert.ok(rows[r - 1].some(m => !D.DESC_ROOMS[m.t].exit && Game.expLinked(m, n)), 'Raum unerreichbar');
    assert.ok(rows[rows.length - 1].some(n => !D.DESC_ROOMS[n.t].exit), 'Boss erreichbar');
    for (const n of rows.flat()) { assert.ok(D.DESC_ROOMS[n.t]); if (n.t === 'fight' || n.t === 'elite') assert.ok(D.CRYPTS[1].floors.includes(n.mob)); if (n.t === 'elite') assert.equal(n.mods.length, 2); }
  }
});
test('Abstieg: nur nach dem Boss der Gruft, je Tag begrenzt, nicht neben Expedition/Streifzug; Umkehren vor Raum 1 zählt nicht', () => {
  const S = fresh(); assert.equal(Game.descStart(1), null, 'ohne Bosssieg gesperrt');
  descHero(); assert.ok(Game.descStart(1)); assert.equal(Game.descStart(1), null, 'nicht zweimal');
  assert.equal(Game.descStair().kind, 'back'); assert.equal(G.S.desc, null); assert.equal(Game.descLeft(), D.DESCENT.sealMax, 'Umkehren kostet kein Siegel');
  for (let i = 0; i < D.DESCENT.sealMax; i++) { assert.ok(Game.descStart(1)); G.S.desc = null; }
  assert.equal(Game.descLeft(), 0); assert.equal(Game.descStart(1), null, 'ohne Siegel kein Abstieg');
  // Ein verpasster Tag wird nachgetragen, ein unlesbares Datum gibt genau eine Gutschrift.
  G.S.seals = { day: new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10), n: 0 };
  assert.equal(Game.descLeft(), 3 * D.DESCENT.sealDay, 'drei verpasste Tage werden nachgetragen');
  G.S.seals = { day: 'kaputt', n: 0 }; assert.equal(Game.descLeft(), D.DESCENT.sealDay, 'unlesbares Datum = eine Gutschrift');
  assert.ok(Game.descStart(1), 'neuer Tag'); G.S.desc = null;
  G.S.active = { loc: 'friedhof', end: Date.now() + 1e6 }; assert.equal(Game.descStart(1), null, 'nicht während eines Streifzugs'); G.S.active = null;
  assert.ok(Game.descStart(1)); assert.equal(Game.startExped('friedhof', 1, [0]), false, 'keine Expedition während des Abstiegs');
  G.S.crypt.cd = 0; assert.equal(Game.cryptFight('c1'), null, 'keine Krypta während des Abstiegs'); assert.equal(G.startTrip('friedhof'), false, 'kein Streifzug');
});
test('Kampf: Startleben (cur0) wird übernommen, Restleben kommt zurück', () => {
  descHero(); const A = { ...G.stats(), cur0: 37 }, m = G.makeMonster(1, 0.5);
  const r = fight(A, m); assert.equal(r.curA0, 37); assert.equal(r.log[0].hpA <= 37 + A.hp, true); assert.ok(r.endA >= 0 && r.endA <= A.hp);
  const r2 = fight(G.stats(), m); assert.equal(r2.curA0, G.stats().hp);
});
test('Abstieg: Leben läuft mit, Unruhe steigt, Beute im Sack; Seil sichert, Tod verliert den Sack, EP bleiben', () => {
  descHero(); Game.descStart(1); const D0 = G.S.desc;
  const j = Game.descNext()[0], r = Game.descEnter(j); assert.equal(r.kind, 'fight'); assert.ok(r.res.win, 'starker Held gewinnt Raum 1');
  assert.equal(D0.unrest, 1); assert.equal(D0.rooms, 1); assert.ok(Math.abs(D0.hpf - r.res.r.endA / r.res.A.hp) < 1e-9, 'Leben = Restleben');
  assert.ok(D0.sack.gold > 0); assert.equal(Game.descMult(), 1.4);
  // Nächster Kampf startet mit diesem Leben
  D0.hpf = 0.3; const j2 = Game.descNext().find(x => ['fight', 'elite'].includes(Game.descNodeAt(x).t));
  if (j2 != null) { const r2 = Game.descEnter(j2); assert.equal(r2.res.r.curA0, Math.round(r2.res.A.hp * 0.3)); }
  // Seil: alles im Sack wird gesichert
  if (G.S.desc) { const gold0 = G.S.gold, sack = G.S.desc.sack.gold, it = makeItem(10); G.S.desc.sack.items.push(it);
    G.S.desc.path = G.S.desc.path.slice(0, D.DESCENT.rope); G.S.desc.path.length = D.DESCENT.rope;
    const prev = G.S.desc.rows[D.DESCENT.rope - 1], rp = G.S.desc.rows[D.DESCENT.rope].findIndex(n => n.t === 'rope');
    G.S.desc.path[D.DESCENT.rope - 1] = prev.findIndex(n => !D.DESC_ROOMS[n.t].exit && Game.expLinked(n, G.S.desc.rows[D.DESCENT.rope][rp]));
    for (let i = 0; i < D.DESCENT.rope - 1; i++) G.S.desc.path[i] = G.S.desc.rows[i].findIndex(n => !D.DESC_ROOMS[n.t].exit && (i === D.DESCENT.rope - 2 ? Game.expLinked(n, prev[G.S.desc.path[i + 1]]) : true));
    const out = Game.descEnter(rp); assert.equal(out.kind, 'out'); assert.equal(G.S.desc, null);
    assert.equal(G.S.gold, gold0 + sack); assert.ok(G.S.bag.some(x => x.id === it.id), 'Item im Beutel'); }
  // Tod: Sack weg, EP bleiben
  const S = descHero('witch', 14); S.attrs = { str: 5, dex: 5, int: 5, con: 6, lck: 3 }; Game.descStart(1); G.S.desc.hpf = 0.01; G.S.desc.sack.gold = 999;
  const gold0 = G.S.gold, xp0 = G.S.xp, lvl0 = G.S.lvl, rr = Game.descEnter(Game.descNext()[0]);
  assert.equal(rr.res.win, false); assert.equal(G.S.desc, null); assert.equal(G.S.gold, gold0, 'Sack-Gold verloren'); assert.equal(rr.res.desc.lost.gold, 999);
  assert.ok(G.S.lvl > lvl0 || G.S.xp >= xp0, 'EP bleiben');
});
test('Abstieg: Brunnen kostet Gold (erst aus dem Sack), Schrein heilt, Schatzkammer füllt den Sack', () => {
  descHero(); Game.descStart(1); const Dd = G.S.desc;
  const wr = Dd.rows[D.DESCENT.well], wj = wr.findIndex(n => n.t === 'well'), pj = Dd.rows[D.DESCENT.well - 1].findIndex(n => !D.DESC_ROOMS[n.t].exit && Game.expLinked(n, wr[wj]));
  Dd.path = Array.from({ length: D.DESCENT.well }, (_, i) => i === D.DESCENT.well - 1 ? pj : Dd.rows[i].findIndex(n => !D.DESC_ROOMS[n.t].exit));
  // Weg gültig machen (Verbindungen)
  for (let i = D.DESCENT.well - 2; i >= 0; i--) Dd.path[i] = Dd.rows[i].findIndex(n => !D.DESC_ROOMS[n.t].exit && Game.expLinked(n, Dd.rows[i + 1][Dd.path[i + 1]]));
  const cost = Game.descWellCost(); Dd.sack.gold = Math.floor(cost / 2); G.S.gold = cost; const g0 = G.S.gold, s0 = Dd.sack.gold;
  const out = Game.descEnter(wj); assert.equal(out.kind, 'out'); assert.equal(G.S.gold, g0 - (cost - s0), 'Rest aus eigenem Gold, Sack-Rest 0 kommt dazu');
  descHero(); Game.descStart(1); G.S.desc.rows[1][0] = { t: 'shrine', x: G.S.desc.rows[1][0].x }; G.S.desc.path = [0]; G.S.desc.hpf = 0.4;
  const sh = Game.descEnter(0); assert.equal(sh.kind, 'room'); assert.ok(Math.abs(G.S.desc.hpf - (0.4 + D.DESCENT.heal)) < 1e-9);
  G.S.desc.rows[2][0] = { t: 'treasure', x: G.S.desc.rows[2][0].x }; G.S.desc.rows[1][0].x = G.S.desc.rows[2][0].x; const n0 = G.S.desc.sack.items.length;
  const tr = Game.descEnter(0); assert.equal(tr.kind, 'room'); assert.ok(G.S.desc.sack.items.length > n0, 'Schatzkammer bringt ein Fundstück'); assert.ok(G.S.desc.hpf > 0);
});
test('Abstieg: Boss besiegt = draußen, Neuladen mitten im Abstieg verändert nichts', () => {
  const SB = descHero('paladin', 10); SB.attrs.str += 600; SB.attrs.con += 400; Game.descStart(1);
  const s0 = JSON.stringify(G.S); G.save(); assert.equal(JSON.stringify(G.load()), s0); const Dd = G.S.desc;
  Dd.path = Dd.rows.map(() => 0); for (let i = Dd.rows.length - 2; i >= 0; i--) Dd.path[i] = Dd.rows[i].findIndex(n => !D.DESC_ROOMS[n.t].exit && Game.expLinked(n, Dd.rows[i + 1][Dd.path[i + 1]]));
  Dd.path[Dd.rows.length - 1] = Dd.rows[Dd.rows.length - 1].findIndex(n => !D.DESC_ROOMS[n.t].exit);
  for (let i = Dd.rows.length - 2; i >= 0; i--) Dd.path[i] = Dd.rows[i].findIndex(n => !D.DESC_ROOMS[n.t].exit && Game.expLinked(n, Dd.rows[i + 1][Dd.path[i + 1]]));
  assert.deepEqual(Game.descNext(), ['boss']);
  const r = Game.descEnter('boss'); assert.ok(r.res.win, 'starker Held schlägt den Boss'); assert.ok(r.res.desc.out); assert.equal(G.S.desc, null);
  assert.ok(r.res.desc.out.items.length >= 2, 'Boss bringt mindestens 2 Fundstücke');
});
// Boss der laufenden Tiefe sofort angehen (Pfad wie oben bis unter den Boss legen)
const descToBoss = () => { const Dd = G.S.desc;
  Dd.path = Dd.rows.map(() => 0); Dd.path[Dd.rows.length - 1] = Dd.rows[Dd.rows.length - 1].findIndex(n => !D.DESC_ROOMS[n.t].exit);
  for (let i = Dd.rows.length - 2; i >= 0; i--) Dd.path[i] = Dd.rows[i].findIndex(n => !D.DESC_ROOMS[n.t].exit && Game.expLinked(n, Dd.rows[i + 1][Dd.path[i + 1]]));
  return Game.descEnter('boss'); };
test('Abgrund endlos: Tiefe statt Heldenstufe, Rekord öffnet die nächste, Wochenziel, kein Absturz ohne Feld', () => {
  const S = descHero('paladin', 10); delete S.deep;
  assert.equal(Game.descRec().best, 0, 'fehlendes Feld wird angelegt'); assert.equal(Game.descMaxDepth(), 1);
  assert.equal(Game.descStart(2), null, 'Tiefe 2 erst nach dem Boss von Tiefe 1'); assert.equal(Game.descStart(0), null); assert.equal(Game.descStart('x'), null);
  assert.ok(Game.descStart(1)); const l1 = G.S.desc.lvl; G.S.desc = null;
  S.lvl = 45; S.deep.best = 30; assert.ok(Game.descStart(1)); assert.equal(G.S.desc.lvl, l1, 'Gegnerstufe hängt nicht an der Heldenstufe'); G.S.desc = null;
  for (let d = 2; d <= 60; d++) { const a = Game.descAt(d - 1), b = Game.descAt(d); assert.ok(b.lvl * b.diff > a.lvl * a.diff, `Tiefe ${d} schwerer als ${d - 1}`); assert.ok(Array.isArray(b.mods)); }
  assert.ok(Game.descAt(500), 'keine letzte Tiefe'); assert.equal(Game.descAt(31).c.id, 'c2', 'Gruft reihum aus den offenen');
  // Boss schlagen → Rekord + Wochenbest steigen, nächste Tiefe offen
  S.lvl = 10; S.deep = { best: 0, week: -1, wBest: 0 }; S.attrs.str += 900; S.attrs.con += 600;
  Game.descStart(1); const r = descToBoss(); assert.ok(r.res.win);
  assert.deepEqual(r.res.desc.out.rec, { d: 1, best: true, week: true }); assert.equal(Game.descRec().best, 1); assert.equal(Game.descRec().wBest, 1);
  assert.equal(Game.descMaxDepth(), 2); assert.ok(Game.descStart(2), 'Tiefe 2 offen'); assert.equal(G.S.desc.d, 2); G.S.desc = null;
  // neue Woche: Wochenziel von vorn, Rekord bleibt
  S.deep.week = -5; assert.equal(Game.descRec().wBest, 0); assert.equal(Game.descRec().best, 1);
  // Ausgang ohne Boss zählt nicht: Seil rettet den Sack, nicht den Rekord
  Game.descStart(2); const Dd = G.S.desc, rp = Dd.rows[D.DESCENT.rope].findIndex(n => n.t === 'rope');
  Dd.path = Dd.rows.slice(0, D.DESCENT.rope).map(() => 0); Dd.path[D.DESCENT.rope - 1] = Dd.rows[D.DESCENT.rope - 1].findIndex(n => !D.DESC_ROOMS[n.t].exit && Game.expLinked(n, Dd.rows[D.DESCENT.rope][rp]));
  const o = Game.descEnter(rp); assert.equal(o.kind, 'out'); assert.equal(Game.descRec().best, 1, 'Seil hebt den Rekord nicht');
  // Abstieg aus einem alten Stand ohne Tiefe: läuft weiter, Boss stürzt nicht ab
  Game.descStart(1); delete G.S.desc.d; delete G.S.desc.df; const r2 = descToBoss(); assert.ok(r2.res); assert.equal(Game.descRec().best, 1);
});
test('Grabsiegel: der Boss erstattet sein Siegel nur mit Chance sealBoss, die Meldung sagt, was geschah', () => {
  const S = descHero('paladin', 10); S.attrs.str += 900; S.attrs.con += 600; const sb = D.DESCENT.sealBoss;
  assert.ok(sb > 0 && sb < 1, 'Erstattung ist eine Chance, kein festes Siegel (sonst endlose Kette)');
  for (const [p, back] of [[1, 1], [0, 0]]) { D.DESCENT.sealBoss = p; S.seals = { day: G.today(), n: 3 }; S.desc = null;
    Game.descStart(1); const r = descToBoss(); assert.ok(r.res.win);
    assert.equal(S.seals.n, 2 + back, `Chance ${p}: Siegel ${back ? 'zurück' : 'weg'}`); assert.equal(r.res.desc.seal, back, 'Meldung lügt nicht'); }
  D.DESCENT.sealBoss = sb;
});
test('Abgrund-Leiter (Welle 2B-1): jede Tiefe um denselben Anteil stärker, Lohn wächst mit, Abgrund-Stufen nur unten', async () => {
  descHero('sorceress', 30);
  for (let d = 1; d < 200; d++) { const a = Game.descAt(d), b = Game.descAt(d + 1);
    assert.ok(Math.abs(b.diff / a.diff - D.DESCENT.diffGrow) < 1e-9, `Tiefe ${d + 1}: Stärke × diffGrow`); assert.ok(b.lvl > a.lvl); }
  let prev = null; for (let d = 1; d <= 60; d++) { const R = Game.descReward(d);
    if (prev) { assert.ok(R.gold > prev.gold && R.xp > prev.xp && R.item > prev.item && R.luck > prev.luck, `Lohn Tiefe ${d}`); assert.ok(R.minR >= prev.minR && R.tiers.length >= prev.tiers.length); }
    prev = R; }
  assert.equal(Game.descReward(1).gold, 1); assert.deepEqual(Game.descReward(1).tiers, []);
  // Abgrund-Stufen: nur mit Tiefe ab minDepth, nie ohne Tiefe (Krypta/Akte/Schmiede), nie auf Resistenzen; topTier übergeht sie
  const deep = D.TIERS.filter(t => t.minDepth).sort((a, b) => a.minDepth - b.minDepth);
  assert.equal(deep.length, 2); assert.ok(deep.every(t => t.t < 1)); assert.equal(L.topTier(500), 1);
  const roll = (depth, n = 400) => { const seen = new Set(); for (let i = 0; i < n; i++) { const it = makeItem(60, { slot: 'ring', minRarity: 4, depth });
    for (const [k, t] of Object.entries(it.tiers)) { seen.add(t); if (t < 1) assert.ok(!D.AFFIXES.find(a => a.stat === k).noDeep, `${k} mit Abgrund-Stufe`);
      if (!it.unique) assert.equal(L.tierOf(k, it.mods[k]), t, 'Stufe steht im Wert'); } } return seen; };
  const s0 = roll(0), s1 = roll(deep[0].minDepth), s2 = roll(deep[1].minDepth);
  assert.ok(![...s0].some(t => t < 1), 'ohne Tiefe keine Abgrund-Stufe'); assert.ok(s1.has(deep[0].t) && !s1.has(deep[1].t)); assert.ok(s2.has(deep[1].t));
  // Umschmieden würfelt die Stufen der Herkunftstiefe (wie die Gegenstandsstufe bei PoE), ohne Tiefe nie Abgrund-Stufen
  { const S = G.S; S.gold = 1e7; S.mats = Object.fromEntries(Object.keys(D.MATS).map(k => [k, 999]));
    const mk = depth => { for (let i = 0; i < 500; i++) { const it = makeItem(60, { slot: 'amulet', minRarity: 3, depth }); if (!it.unique && !it.set && it.rarity === 'rare') return it; } };
    const seen = depth => { const it = mk(depth); G.S.bag = [Object.assign(it, { x: 0, y: 0 })]; const out = new Set();
      for (let i = 0; i < 300; i++) { const r = G.craft(it.id, 'values'); if (r?.err) break; delete it.craftN; delete it.risen; Object.values(it.tiers).forEach(t => out.add(t)); } return [it, out]; };
    const [a, sa] = seen(deep[1].minDepth), [b, sb] = seen(0);
    assert.equal(a.deep, deep[1].minDepth); assert.equal(b.deep, undefined);
    assert.ok(sa.has(deep[0].t) && sa.has(deep[1].t), 'Umschmieden aus der Tiefe würfelt Abgrund-Stufen');
    assert.ok(![...sb].some(t => t < 1), 'Umschmieden ohne Tiefe nie Abgrund-Stufen'); }
  for (const t of deep) for (const a of D.AFFIXES) { const [lo] = L.tierBand(a, t.t), [, hi1] = L.tierBand(a, 1); assert.ok(lo > hi1, `${a.stat} ${t.name} über I`); }
  // Marke: eigene Klasse mit CSS-Regel (eine Marke ohne Regel ist unsichtbar)
  const css = (await import('node:fs')).readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
  for (const t of deep) { assert.match(UI.tierTag(t.t), new RegExp(`class="tier t${t.t} deep"`)); assert.match(css, new RegExp(`\\.tier\\.t${t.t} \\{[^}]*color:`), `CSS für ${t.name}`); }
});
test('Abgrund-Wochenlohn: Montag für die Wochenbest-Tiefe, ehrlich vorher berechnet, einmal abholbar, Beutel voll = nichts geht verloren', () => {
  const S = descHero('barbarian', 30), w = Game.descRec().week;
  S.deep = { best: 12, week: w - 1, wBest: 11 }; const r = Game.descRec();
  assert.equal(r.wBest, 0); assert.deepEqual(r.due, { d: 11, week: w - 1 }); assert.deepEqual(Game.descWeekDue(), r.due);
  const W = Game.descWeekReward(11); assert.equal(W.gold, D.DESCENT.week.gold * Game.descAt(11).lvl); assert.equal(W.kron, Math.floor(11 / D.DESCENT.week.kron)); assert.ok(W.item);
  // Beutel voll: nichts abgebucht, Lohn bleibt offen
  const fill = []; for (let i = 0; i < 200; i++) { const it = makeItem(5, { slot: 'ring' }); if (!G.addToBag(it)) break; fill.push(it); }
  const g0 = S.gold; assert.deepEqual(Game.descClaimWeek(), { full: true }); assert.equal(S.gold, g0); assert.ok(Game.descWeekDue());
  for (const it of fill) G.removeFromBag(it.id);
  S.seals = { day: G.today(), n: 0 }; const k0 = S.mats.kronsplitter || 0, out = Game.descClaimWeek();
  assert.equal(S.gold, g0 + W.gold); assert.equal(S.mats.kronsplitter, k0 + W.kron); assert.equal(S.seals.n, W.seals); assert.ok(out.it && S.bag.some(x => x.id === out.it.id));
  assert.ok(D.RARITIES.findIndex(x => x.id === out.it.rarity) >= 3, 'seltenes Teil'); assert.equal(Game.descWeekDue(), null); assert.equal(Game.descClaimWeek(), null, 'nur einmal');
  // ein offener, besserer Lohn wird nicht still von einer schwächeren Woche überschrieben
  S.deep = { best: 20, week: w - 2, wBest: 3, due: { d: 9, week: w - 3 } }; assert.equal(Game.descRec().due.d, 9);
  S.deep = { best: 20, week: w - 2, wBest: 14, due: { d: 9, week: w - 3 } }; assert.equal(Game.descRec().due.d, 14);
  S.deep = { best: 20, week: w - 1, wBest: 0 }; assert.equal(Game.descRec().due, undefined, 'ohne Boss-Sieg kein Lohn');
});
test('Grube wächst mit (Welle 2B-1): Stärke je Platz, Lohn je Sieg mit EP, kein unlösbarer Grube-Steckbrief auf Platz 1', () => {
  fresh(); const S = G.S; S.lvl = 30; S.attrs[D.CLASSES[S.cls].main] += 2000; S.attrs.con += 1500;
  for (let p = 1; p < D.PIT.size; p++) assert.ok(Math.abs(Game.pitGrowAt(p) / Game.pitGrowAt(p + 1) - (p < D.PIT.growFrom ? D.PIT.foeGrow : 1)) < 1e-9, `Platz ${p}`);
  assert.equal(Game.pitGrowAt(D.PIT.size), 1, 'unten wie bisher (Geschichte, Vargos Aufträge)');
  const P = Game.pitWeek(), id = P.lad[10], lo = Game.pitFoe(id, 40), hi = Game.pitFoe(id, 11);
  assert.ok(Game.pitWinGold(hi) > Game.pitWinGold(lo) && Game.pitWinXp(hi) > Game.pitWinXp(lo) && Game.pitWinXp(lo) > 0, 'höherer Platz, mehr Lohn');
  const f = Game.pitFoes()[0], g0 = S.gold, r = Game.pitFight(f.id); assert.ok(r.win, 'starker Held gewinnt');
  assert.equal(r.rew.xp, Game.pitWinXp(f.B), 'EP wie angezeigt'); assert.ok(S.gold - g0 >= Game.pitWinGold(f.B), 'Gold mindestens wie angezeigt');
  // Platz 1: niemand über dir – „Siege in der Grube“ wird nicht mehr angeboten
  const real = Date.now, t = real(), days = top => { let n = 0; for (let d = 0; d < 30; d++) { Date.now = () => t + d * 864e5; S.bounty = null; if (G.bounties().some(b => b.id === 'arena')) n++; } Date.now = real; return n; };
  assert.ok(days() > 0, 'sonst wird der Grube-Auftrag angeboten (Test greift)');
  P.lad.splice(P.lad.indexOf('me'), 1); P.lad.unshift('me'); assert.equal(Game.pitPlace(), 1);
  assert.equal(days(), 0, 'Grube-Auftrag auf Platz 1');
});
test('Grube: Leiter, Platztausch, Rang, Laden, Herausforderung', () => {
  fresh(); const S = G.S; S.lvl = 30; S.attrs[D.CLASSES[S.cls].main] += 400; S.attrs.con += 300;
  assert.equal(Game.pitPlace(), D.PIT.size + 1); assert.equal(Game.pitFoes().length, D.PIT.look);
  const g = S.glut, f = Game.pitFoes()[2], r = Game.pitFight(f.id); assert.ok(r, 'Kampf läuft'); assert.equal(S.glut, g, 'kostet keine Glut');
  assert.equal(Game.pitFight(Game.pitFoes()[0].id), null, 'Pause nach dem Kampf');
  if (r.win) { assert.equal(Game.pitPlace(), f.place); assert.ok(S.honor > 0); }
  for (let k = 0; k < 40 && Game.pitPlace() > 30; k++) { S.pit.ts = 0; Game.pitFight(Game.pitFoes()[0].id); }
  assert.ok(S.pit.ranks.includes('blut'), 'Rang Blutsand erreicht'); assert.ok(S.trophies.some(t => t.key === 'pit:blut'));
  assert.ok(Game.pitTitle('der Blutige')); assert.equal(S.title, 'der Blutige'); assert.ok(!Game.pitTitle('Grubenkönig'));
  assert.equal(new Set(S.pit.lad).size, D.PIT.size + 1, 'Leiter ohne Doppelte');
  S.honor = 1000; const sh = Game.pitShop(); assert.ok(sh.blut);
  const n = S.bag.length; assert.equal(Game.pitBuy('blut', 0), ''); assert.equal(S.bag.length, n + 1); assert.equal(Game.pitBuy('blut', 0), 'Schon gekauft.');
  Game.pitBuy('blut', 1); Game.pitBuy('blut', 2); assert.equal(Game.pitBuy('kette', 0), 'Diese Woche nichts mehr.');
  const ch = Game.pitChallenge(); S.pit.ts = 0; const t0 = ch.tries; Game.pitFight(ch.rid, true); assert.equal(ch.tries, t0 - 1);
});
test('Akte: neue Gebiete frei, Wiederholen kostet Glut, Boss öffnet nächsten Akt + Krypta, Krypta-Stufen', () => {
  const S = fresh('barbarian'); S.lvl = 40; S.attrs.str += 500; S.attrs.con += 400; S.equip.weapon = { id: 'w', slot: 'weapon', kind: 'axe', mods: {}, dmg: [200, 260] }; const a = D.ACTS[0];
  assert.equal(Game.actCan(a, 1), 'Noch nicht erreicht.'); assert.ok(!G.actOpen(D.ACTS[1])); assert.ok(!G.cryptOpen(D.CRYPTS[0]));
  const g = S.glut; for (let z = 0; z <= D.ACT.zones; z++) { const r = Game.actFight(a.id, z); assert.ok(r?.win, 'Gebiet ' + z); }
  assert.equal(S.glut, g, 'neue Gebiete kosten keine Glut'); assert.ok(G.actDone(a)); assert.ok(G.actOpen(D.ACTS[1])); assert.ok(G.cryptOpen(D.CRYPTS[0]));
  Game.actFight(a.id, 2); assert.equal(S.glut, g - Game.actZoneGlut(a), 'Wiederholen kostet Glut');
  S.glut = 0; assert.ok(Game.actCan(a, 2)); assert.equal(Game.actFight(a.id, 2), null);
  const c = D.CRYPTS[0], l0 = G.cryptLvl(c); S.crypt.cd = 0; S.glut = 999; const r = Game.cryptFight(c.id); assert.ok(r.win); assert.equal(G.cryptTier(c), 1); assert.ok(G.cryptLvl(c) > l0, 'nächste Stufe schwerer');
  assert.ok(S.trophies.some(t => t.key === 'c1:0')); assert.ok(r.rew.items.length >= 1);
  for (let t = 1; t <= D.CRYPT.dTier[1]; t++) { S.crypt.cd = 0; assert.ok(Game.cryptFight(c.id)?.win, "Stufe " + t); } assert.ok(S.trophies.some(t => t.key === 'c1:1'), 'Albtraum-Trophäe ab Stufe');
});
test('Umherziehen: 2-Min-Punkte, max. 2 Std., steht still bei geschlossener App, blockiert Kämpfe, Sack beim Heimrufen', () => {
  const S = fresh('barbarian'); assert.ok(Game.wanderBusy()); S.acts.prog.a1 = 4; assert.ok(!Game.wanderStart([9]), 'nur gültige Route'); assert.ok(Game.wanderStart([0, 0, 0, 0, 0, 0])); assert.equal(S.wander.route.length, D.WANDER.rows); assert.ok(Game.actCan(D.ACTS[0], 0)); assert.equal(Game.pitBusy(), 'Der Held zieht umher.');
  const t0 = S.wander.start; assert.equal(Game.wanderTick(t0 + 5 * 60000), 0, 'nach Pause > gap: nichts nachgeholt');
  let t = t0 + 5 * 60000; for (let i = 0; i < 8; i++) { t += 30000; Game.wanderTick(t); } assert.equal(S.wander.n, 2, '4 Min. offen = 2 Punkte');
  for (let i = 0; i < 400; i++) { t += 30000; Game.wanderTick(t); } assert.equal(S.wander.n, D.WANDER.maxSec / D.WANDER.sec); assert.ok(Game.wanderDone());
  const g = S.gold, r = Game.wanderClaim(); assert.equal(S.wander, null); assert.equal(S.gold, g + r.gold - r.items.filter(i => i.soldFull).reduce((a, i) => a + 0, 0) || S.gold >= g); assert.equal(Game.actCan(D.ACTS[0], 0), '');
});

test('Erster Sieg in einem Akt-Gebiet bringt sicher Material', () => {
  const S = fresh(); S.attrs.str = S.attrs.con = 400; const a = D.ACTS[0], before = Object.values(S.mats).reduce((x, y) => x + y, 0);
  const res = Game.actFight(a.id, 0); assert.ok(res.win); assert.ok(res.rew.mats.length === 1 && res.rew.mats[0][1] >= 1 + D.ACT.matFirst);
  assert.equal(Object.values(S.mats).reduce((x, y) => x + y, 0), before + res.rew.mats[0][1]);
});

test('Grab-Sets: gültige Daten, Teile nur beim Boss ihrer Krypta, Boni wirken', () => {
  const S = fresh();
  for (const set of D.SETS) {
    assert.equal(set.parts.length, D.SET.parts);
    assert.ok(D.CRYPTS.some(c => c.id === set.crypt), set.id + ': Krypta fehlt');
    assert.equal(new Set(set.parts.map(p => p.slot)).size, D.SET.parts, set.id + ': zwei Teile auf demselben Platz');
    for (const p of set.parts) for (const st of Object.keys(p.mods)) assert.ok(D.AFFIXES.some(a => a.stat === st), `${p.name}: ${st} ist kein Bonus`);
    for (const k of [...Object.keys(set.b2), ...Object.keys(set.b3)]) assert.ok(D.EFFECT_NAMES[k], `${set.name}: ${k} ist kein Effekt`);
    for (const t of [set.t2, set.t3]) { assert.ok(t && t.length < 60, `${set.name}: Kurztext fehlt oder zu lang`); assert.ok(!/undefined/.test(t)); }
  }
  // 2 Teile = erster Bonus, 3 Teile = beide
  const set = D.SETS[0], key2 = Object.keys(set.b2)[0], key3 = Object.keys(set.b3)[0];
  const parts = set.parts.map((_, i) => L.makeSetItem(set.id, i, 10));
  assert.equal(G.effects()[key2] || 0, 0);
  S.equip[parts[0].slot] = parts[0]; assert.equal(G.setCount(set.id), 1); assert.ok(!G.effects()[key2]);
  S.equip[parts[1].slot] = parts[1]; assert.equal(G.effects()[key2], set.b2[key2]); assert.ok(!G.effects()[key3]);
  S.equip[parts[2].slot === 'ring' ? 'ring1' : parts[2].slot] = parts[2];
  assert.equal(G.setCount(set.id), 3); assert.equal(G.effects()[key3], set.b3[key3]);
  // dasselbe Teil zweimal zählt nicht doppelt
  S.equip.ring2 = parts[0]; assert.equal(G.setCount(set.id), 3);
  // Set-Teile lassen sich nicht umschmieden
  assert.ok(!G.craftItems().some(it => it.set));
});
test('Set-Teile fallen nur beim Krypta-Boss ab der zweiten Stufe', () => {
  fresh();
  assert.equal(Game.setDrop({ id: 'c1' }, 0), null, 'erste Stufe gibt noch nichts');
  let n = 0, teile = new Set();
  for (let i = 0; i < 300; i++) { const it = Game.setDrop({ id: 'c1' }, 2); if (it) { n++; teile.add(it.part); assert.equal(it.set, 's1'); assert.equal(it.rarity, 'set'); } }
  assert.ok(n > 30 && n < 250, 'Chance im Rahmen: ' + n);
  assert.equal(teile.size, 3, 'alle Teile können fallen');
  assert.equal(Game.setDrop({ id: 'c3' }, 2)?.set ?? 's3', 's3', 'jede Krypta gibt ihr eigenes Set');
});

test('Einzigartige: gültige Daten, eigene Namen, jede Basis vorhanden', () => {
  const namen = new Set();
  for (const u of D.UNIQUES) {
    assert.ok(!namen.has(u.name), 'Name doppelt: ' + u.name); namen.add(u.name);
    assert.ok(D.SLOTS[u.slot], `${u.name}: Platz ${u.slot}`);
    assert.ok(D.BASES.some(b => b.slot === u.slot && (!u.kind || b.kind === u.kind)), `${u.name}: keine Basis`);
    for (const st of Object.keys(u.mods)) assert.ok(D.AFFIXES.some(a => a.stat === st), `${u.name}: ${st} ist kein Bonus`);
    for (const k of Object.keys(u.eff)) assert.ok(D.EFFECT_NAMES[k], `${u.name}: ${k} ist kein Effekt`);
    assert.ok(u.lore && u.lore.length < 70, `${u.name}: Spruch fehlt oder zu lang`);
  }
  // jede Klassenwaffe hat mindestens ein einzigartiges Stück
  for (const c of Object.values(D.CLASSES)) assert.ok(D.UNIQUES.some(u => u.kind === c.weapon), 'ohne Einzigartiges: ' + c.weapon);
});

test('Neue Einzigartig-Mechaniken wirken im Kampf', async () => {
  const { fight } = await import('../js/combat.js');
  const base = { name: 'A', str: 20, dex: 20, int: 20, con: 20, lck: 20, main: 'str', lvl: 10, armor: 10, dmg: [10, 14], hp: 300 };
  const feind = { ...base, name: 'B', dmg: [40, 60], hp: 4000, armor: 200 };
  // Letzter Atem: der tödliche Treffer lässt 1 Leben übrig (einmal)
  const mit = fight({ ...base, lastBreath: 1 }, { ...feind });
  assert.ok(mit.log.some(l => l.status === 'Letzter Atem'), 'Letzter Atem greift nicht');
  // Einzelne Kämpfe streuen stark: zwei unabhängige Würfe verglichen schlug in 29 % der Läufe
  // grundlos fehl. Darum mitteln – der Unterschied ist ~7,5 zu ~10,8 Runden.
  // 60 Kämpfe reichten dafür NICHT: über 120 Versuche gemessen lag das kleinste Verhältnis bei
  // 1,156, die Schranke steht bei 1,15 – der Test fiel selten grundlos durch. Bei 250 Kämpfen
  // liegt das Minimum bei 1,192, also mit echtem Abstand.
  const avgLog = f => { let s = 0; for (let i = 0; i < 250; i++) s += fight(f(), { ...feind }).log.length; return s / 250; };
  assert.ok(avgLog(() => ({ ...base, lastBreath: 1 })) > avgLog(() => ({ ...base })) * 1.15, 'Letzter Atem verlängert den Kampf nicht');
  // Zuflucht: heilt genau einmal, wenn es eng wird. Sie greift zu Rundenbeginn – gegen `feind`
  // starb der Held in 20 % der Läufe aus über 30 % Leben heraus, bevor sie je prüfen konnte.
  // Darum ein Gegner, der langsam zusetzt: dann greift sie in 3000 von 3000 Kämpfen genau einmal.
  const langsam = { ...feind, hp: 999999, dmg: [20, 24], armor: 0 };
  const zu = fight({ ...base, secondWind: 0.25 }, langsam);
  assert.equal(zu.log.filter(l => l.status === 'Zuflucht').length, 1);
  // Pakt: keine Heilung mehr, obwohl Regeneration und Lebensraub angelegt sind
  const heilt = fight({ ...base, regen: 0.1, leech: 0.5 }, { ...feind });
  const pakt = fight({ ...base, regen: 0.1, leech: 0.5, nohealSelf: 1 }, { ...feind });
  assert.ok(heilt.log.some(l => l.heal), 'Heilung fehlt im Vergleich');
  assert.ok(!pakt.log.some(l => l.heal), 'Pakt heilt trotzdem');
  // Die folgenden Mechaniken brauchen viele Runden (jeder dritte Hieb, Krit, Block). Gegen `feind`
  // stirbt der Held nach ~6 Runden und sie kamen oft gar nicht vor – darum ein Übungsgegner,
  // bei dem keiner von beiden fällt.
  const puppe = { ...feind, hp: 999999, dmg: [1, 1], armor: 0 }, zaeh = { ...base, hp: 999999 };
  // Splittern: jeder Krit bricht Rüstung, aber nie unter die Hälfte
  const sch = fight({ ...zaeh, crit: 1, shred: 0.3, dmg: [1, 1] }, { ...puppe, armor: 200 });
  assert.ok(sch.log.some(l => l.status === 'Rüstung bricht'), 'Splittern greift nicht');
  // Eifer: jeder dritte Hieb trifft zweimal
  const ei = fight({ ...zaeh, zeal: 0.6 }, { ...puppe });
  assert.ok(ei.log.some(l => Array.isArray(l.hits) && l.hits.length === 2), 'Eifer trifft nie zweimal');
  // Bollwerk: Blocken baut Schild auf
  const bo = fight({ ...zaeh, block: 1, bulwark: 0.1 }, { ...puppe });
  assert.ok(bo.log.some(l => l.shield), 'Bollwerk gibt keinen Schild');
  // Vergeltung und Aderlass zählen in der Kampfkraft mit
  const S = fresh(); const p0 = G.power();
  for (const k of ['vengeance', 'zeal', 'siphon', 'shred', 'lastBreath', 'secondWind', 'bulwark']) {
    S.trophies.push({ key: 't' + k, name: k, eff: { [k]: k === 'lastBreath' ? 1 : 0.3 } });
    assert.ok(G.power() > p0, k + ' zählt nicht in der Kampfkraft');
    S.trophies.pop();
  }
  // Pakt kostet Kampfkraft
  S.trophies.push({ key: 'tp', name: 'p', eff: { regen: 0.05 } }); const mitRegen = G.power();
  S.trophies.push({ key: 'tn', name: 'n', eff: { nohealSelf: 1 } });
  assert.ok(G.power() < mitRegen, 'Pakt kostet keine Kampfkraft');
  S.trophies.length = 0;
});

test('Das Brett: Wege, Knappheit', async () => {
  const D = await import('../js/data.js');
  for (const [cls, T] of Object.entries(D.TREE)) {
    assert.ok(D.CLASSES[cls], cls + ' ist keine Klasse');
    const ids = new Set();
    for (const c of T.cols) { assert.equal(c.nodes.length, T.cols[0].nodes.length, 'Spalten müssen gleich hoch sein');
      for (const n of c.nodes) { assert.ok(!ids.has(n.id), 'doppelte Knoten-ID ' + n.id); ids.add(n.id);
        assert.ok(n.max >= 1 && n.text && n.name, n.id + ' unvollständig');
        for (const k of Object.keys(n.eff)) assert.ok(D.EFFECT_NAMES[k], `${n.id}: „${k}“ ist kein Effekt-Schlüssel – wirkt nicht`); } }
    for (const b of T.bridges || []) { assert.ok(!ids.has(b.id), 'doppelte ID ' + b.id); ids.add(b.id);
      assert.ok(b.row >= 1, 'eine Brücke darf nicht in der untersten Reihe sitzen');
      assert.ok(b.a !== b.b && T.cols[b.a] && T.cols[b.b], b.id + ': ungültige Spalten');
      for (const k of Object.keys(b.eff)) assert.ok(D.EFFECT_NAMES[k], `${b.id}: „${k}“ ist kein Effekt-Schlüssel`); }
    // Knappheit: ein Held am Ende der Geschichte (Stufe ~24) darf das Brett nicht füllen
    const S = fresh(cls); S.lvl = 24;
    assert.ok(G.talentPointsTotal() < G.treeRanks(cls) * 0.75,
      `${cls}: ${G.talentPointsTotal()} Punkte auf ${G.treeRanks(cls)} Ränge – zu wenig Knappheit`);
  }
  // Wege: unten offen, darüber erst wenn der Knoten darunter voll ist
  const S = fresh('assassin'); S.lvl = 30; S.tal = {};
  assert.ok(G.nodeState(0, 0).open && !G.nodeState(0, 1).open, 'Reihe 1 darf nicht offen sein');
  assert.ok(!G.learnNode(0, 1), 'gesperrter Knoten ließ sich setzen');
  const n0 = D.TREE.assassin.cols[0].nodes[0];
  for (let i = 0; i < n0.max; i++) assert.ok(G.learnNode(0, 0));
  assert.ok(!G.learnNode(0, 0), 'über den Höchstrang hinaus gesetzt');
  assert.ok(G.nodeState(0, 1).open, 'voller Knoten öffnet den darüber nicht');
  // Brücke: öffnet sich erst, wenn eine Seite voll ist – und gilt dann als Vorgänger für beide Spalten
  const b = D.TREE.assassin.bridges[0], bi = 0;
  S.tal = {}; assert.ok(!G.bridgeState(bi).open, 'Brücke war ohne Vorarbeit offen');
  const below = D.TREE.assassin.cols[b.a].nodes.slice(0, b.row);
  for (const n of below) S.tal[n.id] = n.max;
  assert.ok(G.bridgeState(bi).open, 'Brücke öffnet sich nicht');
  assert.ok(!G.nodeState(b.b, b.row).open, 'Nachbarspalte war schon ohne volle Brücke offen');
  S.tal[b.id] = b.max;
  assert.ok(G.nodeState(b.b, b.row).open, 'volle Brücke öffnet die Nachbarspalte nicht');
  // Punkte sind knapp: ohne freie Punkte geht nichts mehr
  S.lvl = 1; assert.ok(!G.nodeState(0, 0).can, 'ohne Punkte ließ sich setzen');
});

test('Zauberin: Zauberschaden und Brand', async () => {
  const D = await import('../js/data.js');
  const { fight } = await import('../js/combat.js');
  // 1) spellPct landet in der Zauberkraft (amp) – und NUR dort, nicht im Hieb
  const S = fresh('sorceress'); S.lvl = 24; S.tal = {};
  const a0 = G.stats().amp, d0 = G.stats().dmg[1];
  S.tal = { sf1: D.TREE.sorceress.cols[0].nodes[0].max };
  const a1 = G.stats().amp, d1 = G.stats().dmg[1];
  assert.ok(a1 > a0 * 1.1, `Zauberschaden kommt nicht an: ${a0.toFixed(2)} → ${a1.toFixed(2)}`);
  assert.equal(d1, d0, 'Zauberschaden darf den Hieb nicht verstärken');
  // 2) Verbrennung setzt den Gegner in Brand, und der Brand tickt
  const held = { name: 'A', str: 10, dex: 20, int: 60, con: 20, lck: 10, main: 'int', lvl: 10, armor: 10, dmg: [10, 14], hp: 1e7, cur0: 1e7,
    amp: 1.5, spells: [{ id: 'feuerball', name: 'Feuerball', lvl: 1, every: 2, kind: 'hit', mult: 1.7 }] };
  const puppe = { ...held, name: 'B', dmg: [1, 1], hp: 1e7, armor: 0, amp: 1, spells: [] };
  const ohne = fight({ ...held }, { ...puppe });
  assert.ok(!ohne.log.some(l => l.tk === 'burn'), 'ohne Verbrennung darf nichts brennen');
  const mit = fight({ ...held, ignite: 0.7 }, { ...puppe });
  const ticks = mit.log.filter(l => l.tk === 'burn');
  assert.ok(ticks.length >= 3, `Brand tickt nicht (${ticks.length} Runden)`);
  assert.ok(ticks.every(l => l.tick >= 1), 'Brand ohne Schaden');
  // Der Brand stapelt nicht: er kostet dem Gegner Leben, aber nie mehr als ein Zauber selbst.
  // Nur Zauber nehmen, die auch getroffen haben – ein ausgewichener Zauber hat kein `dmg`,
  // und der Vergleich gegen undefined wäre ein Test, der mal grün und mal rot ist.
  const stark = mit.log.find(l => l.spell && l.dmg > 0);
  assert.ok(stark, 'kein Zauber hat getroffen');
  assert.ok(ticks[0].tick < stark.dmg, 'ein Brand-Tick darf nicht härter sein als der Zauber selbst');
});

test('Ausbluten: blutet bei jedem Treffer und schaltet Krits ab', async () => {
  const { fight } = await import('../js/combat.js');
  const held = { name: 'A', str: 20, dex: 20, int: 20, con: 20, lck: 80, main: 'str', lvl: 10, armor: 10, dmg: [10, 14], hp: 999999, crit: 0.5 };
  const puppe = { ...held, name: 'B', dmg: [1, 1], hp: 999999, armor: 0, crit: 0 };
  const ohne = fight({ ...held }, { ...puppe });
  assert.ok(ohne.log.some(l => l.crit), 'ohne Ausbluten sollte es Krits geben');
  const mit = fight({ ...held, hemorrhage: 1 }, { ...puppe });
  assert.ok(!mit.log.some(l => l.who === 'a' && l.crit), 'Ausbluten trifft trotzdem kritisch');
  assert.ok(mit.log.some(l => l.tk === 'bleed'), 'Ausbluten lässt nicht bluten');
  // Ausweich-Grenze: ohne evadeCap bei 50 %, mit darüber
  const flink = { ...held, dex: 400, hp: 999999 }, schlaeger = { ...puppe, dex: 10, dmg: [5, 5] };
  const quote = e => { let aus = 0, tr = 0;
    for (let i = 0; i < 300; i++) for (const l of fight({ ...flink, ...e }, { ...schlaeger }).log) {
      if (l.who !== 'b') continue; if (l.miss) aus++; else if (l.dmg) tr++; }
    return aus / (aus + tr); };
  const q0 = quote({}), q1 = quote({ evadeCap: 0.2 });
  assert.ok(q0 <= 0.55, `Ausweichen sollte bei 50 % gedeckelt sein, war ${(q0 * 100).toFixed(0)} %`);
  assert.ok(q1 > q0 + 0.08, `evadeCap hebt die Grenze nicht (${(q0 * 100).toFixed(0)} % → ${(q1 * 100).toFixed(0)} %)`);
});

test('Fusionieren: der Bonus wandert, das Futter zerfällt, einmal je Teil', async () => {
  const G = await import('../js/state.js'), L = await import('../js/loot.js'), D = await import('../js/data.js');
  // zwei magische Dolche mit gewünschter Bonus-Zahl
  const mk = (n, slot = 'weapon', kind = 'dagger', rar = 'magic') => { for (let i = 0; i < 9000; i++) {
    const it = L.makeItem(22, { slot, kind }); if (it.rarity !== rar || it.unique || Object.keys(it.mods).length < n) continue;
    for (const k of Object.keys(it.mods).slice(n)) { delete it.mods[k]; delete it.tiers[k]; } return it; } };   // magisch ist immer voll (1+1) – kürzen
  const frisch = () => { G.newChar('F', 'assassin'); G.S.lvl = 22; G.S.gold = 999999; };

  // --- Dazu: freier Platz, der Bonus kommt einfach hinzu, die Stufe wandert mit
  frisch();
  // Welcher Bonus wandern darf, entscheidet `fuseCheck` – die Regel hier nachzubauen ging schief
  // (der Test fiel etwa jedes 25. Mal mit „Bonus im Futter antippen" durch). Also fragen wir das
  // System und wuerfeln neue Teile, bis ein Paar wirklich zueinander passt.
  const paar = (nA, nB) => { for (let t = 0; t < 40; t++) {
    G.S.bag.length = 0; const x = mk(nA), y = mk(nB); G.S.bag.push(x, y);
    const kk = Object.keys(G.baseMods(y)).find(z => !(z in G.baseMods(x)) && !G.fuseCheck(x, y, z, null));
    if (kk) return [x, y, kk]; } return []; };
  let [a, b, k] = paar(1, 2);
  assert.ok(k, 'kein übertragbarer Bonus gefunden');
  const stufeVorher = b.tiers[k], bagVorher = G.S.bag.length;
  let r = G.fuse(a.id, b.id, k, null);
  assert.ok(!r.err, r.err);
  assert.ok(k in r.it.mods, 'der Bonus ist nicht angekommen');
  assert.equal(r.it.tiers[k], stufeVorher, 'die Stufe des Bonus ist beim Umzug verlorengegangen');
  assert.equal(G.S.bag.length, bagVorher - 1, 'das Futter ist nicht zerfallen');
  assert.equal(r.it.fused, 1);
  // Welcher Bonus eingewandert ist, muss am Teil stehen - sonst sieht man nur DASS fusioniert wurde.
  assert.deepEqual(G.fusedMods(r.it), [k], 'der fusionierte Bonus ist nicht markiert');

  // --- Nur eine Fusion je Teil, für immer: sonst baut jeder dasselbe perfekte Teil
  const c = mk(2); G.S.bag.push(c);
  assert.match(G.fuseCheck(r.it, c, Object.keys(G.baseMods(c))[0], null) || '', /schon fusioniert/);

  // --- Aufstieg: volles magisches Teil bekommt einen dritten Bonus und wird selten,
  //     der Grundschaden bleibt aber magisch (sonst heimlicher Machtsprung)
  frisch();
  [a, b, k] = paar(2, 2); assert.ok(k, 'kein übertragbarer Bonus gefunden');
  const dmgVorher = JSON.stringify(a.dmg);
  assert.equal(G.fusePromote(a, null), 'rare', 'volles magisches Teil müsste aufsteigen können');
  r = G.fuse(a.id, b.id, k, null);
  assert.ok(!r.err, r.err);
  assert.equal(r.it.rarity, 'rare', 'das Teil ist nicht aufgestiegen');
  assert.equal(Object.keys(G.baseMods(r.it)).length, 3);
  assert.equal(JSON.stringify(r.it.dmg), dmgVorher, 'der Grundschaden ist beim Aufstieg mitgewachsen');

  // --- Ersetzen statt Aufstieg: der gewählte Bonus weicht
  frisch();
  [a, b, k] = paar(2, 2); assert.ok(k, 'kein übertragbarer Bonus gefunden');
  const weg = Object.keys(G.baseMods(a)).find(z => !G.fuseCheck(a, b, k, z));   // weichen kann nur ein Bonus derselben Seite (Präfix/Suffix)
  r = G.fuse(a.id, b.id, k, weg);
  assert.ok(!r.err, r.err);
  assert.equal(r.it.rarity, 'magic', 'beim Ersetzen darf nichts aufsteigen');
  assert.ok(!(weg in G.baseMods(r.it)), 'der ersetzte Bonus ist noch da');

  // --- Gleicher Bonus in beiden: er ersetzt genau diesen (Wert + Stufe), ohne Aufstieg, ohne Antippen im Hauptteil
  frisch();
  [a, b] = paar(2, 2); assert.ok(a, 'kein Paar gefunden');
  const gl = Object.keys(G.baseMods(b))[0], rest = Object.keys(G.baseMods(a)).find(z => z !== gl);
  a.mods = { [gl]: 1, [rest]: 7 }; a.tiers = { [gl]: 1, [rest]: 2 }; delete a.sealed; delete a.runes;
  b.tiers = { ...b.tiers, [gl]: 5 };
  assert.equal(G.fuseCheck(a, b, gl, null), null, 'gleicher Bonus müsste fusionierbar sein');
  assert.match(G.fuseCheck(a, b, gl, rest) || '', /ersetzt sich selbst/);
  const neu = G.baseMods(b)[gl];
  r = G.fuse(a.id, b.id, gl, null);
  assert.ok(!r.err, r.err);
  assert.equal(r.replaced, gl);
  assert.equal(r.it.rarity, 'magic', 'gleicher Bonus darf nicht aufsteigen');
  assert.equal(G.baseMods(r.it)[gl], neu, 'der Wert ist nicht ersetzt');
  assert.equal(r.it.tiers[gl], 5, 'die Stufe ist nicht mitgewandert');
  assert.equal(G.baseMods(r.it)[rest], 7, 'der andere Bonus ist verlorengegangen');
  assert.equal(Object.keys(G.baseMods(r.it)).length, 2);
  // Versiegelt bleibt versiegelt, auch für den gleichen Bonus
  frisch();
  [a, b] = paar(2, 2); assert.ok(a, 'kein Paar gefunden');
  const gl2 = Object.keys(G.baseMods(b))[0], r2 = Object.keys(G.baseMods(a)).find(z => z !== gl2);
  a.mods = { [gl2]: 1, [r2]: 7 }; a.tiers = { [gl2]: 1, [r2]: 2 }; delete a.runes; a.sealed = gl2;
  assert.match(G.fuseCheck(a, b, gl2, null) || '', /versiegelt/);
});

test('Fusionieren: die Regeln halten (Form, Seltenheit, Siegel, Platz, Einzigartige)', async () => {
  const G = await import('../js/state.js'), L = await import('../js/loot.js');
  // Achtung: makeItem fällt bei unbekannter Art still auf eine beliebige Basis zurück (es gibt z. B.
  // keine Waffenart „claw"). Deshalb die Art hier prüfen, sonst misst der Test etwas anderes.
  const mk = (slot, kind, rar) => { for (let i = 0; i < 9000; i++) { const it = L.makeItem(22, { slot, kind });
    if (it.rarity === rar && !it.unique && (!kind || it.kind === kind) && Object.keys(it.mods).length) return it; } };
  G.newChar('F2', 'assassin'); G.S.lvl = 22; G.S.gold = 999999;
  const dolch = mk('weapon', 'dagger', 'magic'), dolch2 = mk('weapon', 'dagger', 'magic');
  const beil = mk('weapon', 'axe', 'magic'), selten = mk('weapon', 'dagger', 'rare');
  G.S.bag.push(dolch, dolch2, beil, selten);
  const ein = Object.keys(G.baseMods(dolch2))[0];
  assert.ok(beil && dolch, 'Testware fehlt');
  assert.match(G.fuseCheck(dolch, beil, Object.keys(G.baseMods(beil))[0], null) || '', /Grundform/);
  assert.match(G.fuseCheck(dolch, selten, Object.keys(G.baseMods(selten))[0], null) || '', /Seltenheit/);
  assert.match(G.fuseCheck(dolch, dolch, ein, null) || '', /sich selbst/);
  // Blocken gehört auf die Nebenhand, nicht auf einen Dolch
  dolch2.mods = { blockp: 5 }; dolch2.tiers = { blockp: 3 };
  assert.match(G.fuseCheck(dolch, dolch2, 'blockp', null) || '', /passt nicht auf diesen Platz/);
  // Versiegeltes bleibt unantastbar
  const x = mk('weapon', 'dagger', 'magic'), y = mk('weapon', 'dagger', 'magic');
  G.newChar('F3', 'assassin'); G.S.lvl = 22; G.S.gold = 999999; G.S.bag.push(x, y);
  if (Object.keys(G.baseMods(x)).length >= 2) {
    x.sealed = Object.keys(G.baseMods(x))[0];
    const k2 = Object.keys(G.baseMods(y)).find(q => !(q in G.baseMods(x)));
    if (k2) assert.match(G.fuseCheck(x, y, k2, x.sealed) || '', /versiegelt/);
  }
  // Einzigartige und Set-Teile tauchen gar nicht erst als Hauptteil auf
  const uniq = (() => { for (let i = 0; i < 9000; i++) { const it = L.makeItem(30, { slot: 'weapon', kind: 'dagger' }); if (it.unique) return it; } })();
  if (uniq) { G.S.bag.push(uniq); assert.ok(!G.fuseMains().some(i => i.id === uniq.id), 'Einzigartiges steht als Hauptteil zur Wahl'); }
});

test('Bonus-Stufe aus dem Wert: feste Bereiche überlappen nie, jeder Wert zeigt seine Stufe, höherer Wert nie schlechtere Stufe', () => {
  for (const a of D.AFFIXES) {
    let below = 0; for (const t of D.TIERS.map(x => x.t).reverse()) { const [lo, hi] = L.tierBand(a, t); assert.ok(lo > below && hi >= lo, `${a.stat} Stufe ${t}: ${lo}–${hi}`); below = hi;
      for (let v = lo; v <= hi; v++) assert.equal(L.tierOf(a.stat, v), t, `${a.stat} ${v}`); }
    let last = 5; for (let v = 1; v < 4000; v++) { const t = L.tierOf(a.stat, v); assert.ok(t <= last, a.stat); last = t; } assert.equal(last, D.TIERS[0].t, a.stat + ' erreicht nie die beste Stufe');
  }
});

test('Der Beute-Filter zaehlt nur echte Treffer', async () => {
  // Vom Besitzer gewuenscht: gesuchte Boni einstellen, jedes Teil zeigt je Treffer einen Punkt.
  const G = await import('../js/state.js'), L = await import('../js/loot.js');
  G.newChar('Filter', 'sorceress'); G.S.lvl = 20; G.S.tut = 99;
  // Die Stufe steht im Wert (tierOf), nicht im gespeicherten Wurf: mk(stat→Stufe) baut den kleinsten Wert dieser Stufe.
  // Der gespeicherte Wurf ist absichtlich falsch (immer I) – er darf für den Filter nicht zählen.
  const val = (k, t) => { for (let v = 1; v < 1e5; v++) if (L.tierOf(k, v) === t) return v; throw new Error(k + t); };
  const mk = (tiers, runes = []) => { const it = L.makeItem(20, { slot: 'ring' });
    it.mods = Object.fromEntries(Object.entries(tiers).map(([k, t]) => [k, val(k, t)])); it.tiers = Object.fromEntries(Object.keys(tiers).map(k => [k, 1]));
    for (const r of runes) it.mods[r.stat] = r.v; it.runes = runes; return it; };

  G.S.filter = { mods: [], tier: 3 };
  assert.equal(G.filterHits(mk({ critc: 1 })), 0, 'leerer Filter darf nie Punkte zeigen');
  assert.equal(G.filterOn(), false);

  G.S.filter = { mods: ['critc', 'critd', 'lifep'], tier: 2 };
  assert.equal(G.filterHits(mk({ str: 1 })), 0, 'fremder Bonus zaehlt');
  assert.equal(G.filterHits(mk({ critc: 2 })), 1);
  assert.equal(G.filterHits(mk({ critc: 1, critd: 2, lifep: 2 })), 3);
  // Die STUFE muss mindestens die gesuchte sein (1 = I ist die beste) - sonst ist der Filter wertlos
  assert.equal(G.filterHits(mk({ critc: 2, critd: 3 })), 1, 'Stufe III darf bei "ab II" nicht zaehlen');
  // Eine Rune ist kein erwuerfelter Bonus: sonst zeigte jedes Runen-Teil Treffer, die beim
  // naechsten Teil nicht wieder herauskommen.
  const mitRune = mk({}, [{ stat: 'critc', v: 50, name: 'R' }]);
  assert.equal(G.filterHits(mitRune), 0, 'ein reiner Runen-Bonus darf nicht als Treffer zaehlen');
  // Auswaehlen und wieder abwaehlen
  G.setFilterMod('penp'); assert.ok(G.filterOf().mods.includes('penp'));
  G.setFilterMod('penp'); assert.ok(!G.filterOf().mods.includes('penp'));
  // Alte Staende haben kein `filter` - der Filter ist dann aus, ohne Migration
  delete G.S.filter;
  assert.equal(G.filterHits(mk({ critc: 1 })), 0, 'ohne gespeicherten Filter darf nichts leuchten');
});

test('Jedes Krypta-Ziel sagt, wo die Krypta ist', async () => {
  // Der Besitzer stand vor "Bezwinge: Bruder Aldemar" und wusste nicht, wo der Mann steckt - die
  // Antwort stand in CRYPTS/ACTS, nur nie auf dem Zettel. Gleiche Regel wie bei den Zutaten:
  // ABLEITEN, nie abtippen. Ein handgeschriebener Ort luegt, sobald eine Krypta den Akt wechselt.
  const G = await import('../js/state.js'), Q = await import('../js/quests.js'), D = await import('../js/data.js');
  let geprueft = 0;
  for (const tid of D.GIVERS) for (let qi = 0; qi < D.QUESTS[tid].length; qi++) {
    const q = D.QUESTS[tid][qi];
    const ziele = q.obj.map((o, i) => [o, i]).filter(([o]) => o.boss || o.bossd || o.clear);
    if (!ziele.length) continue;
    for (const offen of [false, true]) {
      G.newChar('ZielTest', 'witch'); G.S.lvl = 30; G.S.tut = 99;
      G.S.acts.prog = offen ? Object.fromEntries(D.ACTS.map(a => [a.id, 9])) : {};
      G.S.traders[tid].q = qi; G.S.traders[tid].prog = [0, 0, 0];
      const labels = Q.objectives(tid).map(o => o.label);
      for (const [o, i] of ziele) {
        const c = D.CRYPTS.find(x => x.id === (o.boss || o.bossd || o.clear));
        const L = labels[i];
        assert.ok(L.includes(c.name), `${tid}/${q.id}: das Ziel nennt die Krypta nicht ("${L}")`);
        // Solange die Krypta zu ist, muss dastehen, welcher Akt sie aufschliesst - und zwar der
        // ECHTE aus den Daten, nicht einer von Hand eingetragenen.
        const akt = G.cryptAct(c);
        if (!offen) assert.ok(L.includes(`Akt ${akt.n}`), `${tid}/${q.id}: verschlossene Krypta ohne Akt-Hinweis ("${L}")`);
        else assert.ok(!/Akt /.test(L), `${tid}/${q.id}: offene Krypta nennt trotzdem einen Akt ("${L}")`);
        geprueft++;
      }
    }
  }
  assert.ok(geprueft >= 20, `zu wenige Krypta-Ziele geprueft (${geprueft})`);
});

test('Die Marke am fusionierten Bonus folgt dem Bonus', async () => {
  const G = await import('../js/state.js'), L = await import('../js/loot.js'), D = await import('../js/data.js');
  const fill = () => { for (const k of Object.keys(D.MATS)) G.S.mats[k] = 99;
    for (const o of D.CRAFT.ops) if (o.mat) G.S.mats[o.mat] = 99; G.S.gold = 999999; };
  // Ein Paar bauen, das `fuseCheck` wirklich durchlaesst - die Regel aufrufen, nicht nachbauen
  // (dieselbe Falle wie beim flockigen Umzug-Test).
  const paar = () => { for (let i = 0; i < 900; i++) {
      G.newChar('FM', 'assassin'); G.S.lvl = 22; fill();
      const a = Object.assign(L.makeItem(22, { slot: 'helm' }), { id: 'A' + i, x: 0, y: 0 });
      const b = Object.assign(L.makeItem(22, { slot: 'helm' }), { id: 'B' + i, x: 4, y: 0 });
      G.S.bag = [a, b];
      for (const k of Object.keys(G.baseMods(b))) if (!G.fuseCheck(a, b, k, null)) return [a, b, k];
    } return []; };

  // Werte neu wuerfeln wuerfelt auch die STUFE neu - und die Stufe ist das, was bei der Fusion
  // mitwandert. Die Marke muss danach fallen, sonst behauptet sie etwas, das nicht mehr stimmt.
  let [a, b, k] = paar(); assert.ok(k, 'kein uebertragbares Paar gefunden');
  let r = G.fuse(a.id, b.id, k, null); assert.ok(!r.err, r.err);
  assert.deepEqual(G.fusedMods(r.it), [k]);
  r.it.glut = 30; delete r.it.crafted; fill();
  assert.ok(!G.craftCheck(r.it, 'values'), G.craftCheck(r.it, 'values'));
  G.craft(r.it.id, 'values');
  assert.deepEqual(G.fusedMods(r.it), [], 'nach neu gewuerfelten Werten ist die Marke noch da');

  // Ein Bonus, der entfernt wird, nimmt seine Marke mit; die der anderen bleiben.
  [a, b, k] = paar(); assert.ok(k);
  r = G.fuse(a.id, b.id, k, null); assert.ok(!r.err, r.err);
  r.it.glut = 30; delete r.it.crafted; fill();
  r.it.sealed = k;                                    // versiegelt: `remove` trifft einen anderen
  G.craft(r.it.id, 'remove');
  assert.deepEqual(G.fusedMods(r.it), [k], 'die Marke des gebliebenen Bonus ist verschwunden');
  r.it.glut = 30; delete r.it.crafted; fill(); delete r.it.sealed;
  while (Object.keys(G.baseMods(r.it)).length > 1 && !G.craftCheck(r.it, 'remove')) {
    G.craft(r.it.id, 'remove'); r.it.glut = 30; delete r.it.crafted; fill();
  }
  if (!(k in G.baseMods(r.it))) assert.deepEqual(G.fusedMods(r.it), [], 'die Marke haengt an einem Bonus, den es nicht mehr gibt');
});

test('Fusionieren bringt nie Gold', async () => {
  const G = await import('../js/state.js'), L = await import('../js/loot.js'), D = await import('../js/data.js');
  const mk = n => { for (let i = 0; i < 9000; i++) { const it = L.makeItem(22, { slot: 'weapon', kind: 'dagger' });
    if (it.rarity === 'magic' && !it.unique && Object.keys(it.mods).length === n) return it; } };
  for (let runde = 0; runde < 12; runde++) {
    G.newChar('F4', 'assassin'); G.S.lvl = 22; G.S.gold = 999999;
    const a = mk(2), b = mk(2); G.S.bag.push(a, b);
    const k = Object.keys(G.baseMods(b)).find(x => !(x in G.baseMods(a)) && D.AFFIXES.some(y => y.stat === x && (!y.slots || y.slots.includes('weapon'))));
    if (!k) continue;
    const vorher = G.S.gold + a.value + b.value;
    const r = G.fuse(a.id, b.id, k, null);
    if (r.err) continue;
    const nachher = G.S.gold + r.it.value;
    assert.ok(nachher < vorher, `Fusionieren+Verkaufen bringt Gold: ${vorher} → ${nachher}`);
  }
});

// Die Frage des Besitzers war nicht „was brauche ich", sondern „wo kriege ich das her".
// `herbSource` leitet das aus HERB_LOC ab; dieser Test wacht darüber, dass es abgeleitet BLEIBT.
test('Jede Zutat sagt, wo sie fällt – und zwar aus den Daten, nicht aus einem Text', async () => {
  const G = await import('../js/state.js'), D = await import('../js/data.js');
  G.newChar('W1', 'sorceress');
  const orte = Object.fromEntries(D.LOCATIONS.map(l => [l.id, l.name]));
  for (const k of Object.keys(D.HERBS)) {
    const q = G.herbSource(k);
    assert.ok(q && q !== '?', `Zutat ${k} hat keine Quelle`);
    if (k === 'herz') { assert.match(q, /Boss/, 'Das Schwarze Herz kommt von Krypta-Bossen'); continue; }
    const ort = Object.keys(D.HERB_LOC).find(l => D.HERB_LOC[l] === k);
    assert.ok(ort, `Zutat ${k} steht in keinem HERB_LOC`);
    assert.equal(q, orte[ort], `Quelle von ${k} folgt nicht HERB_LOC (${q} statt ${orte[ort]})`);
  }
  // Umgekehrt: jeder Ort liefert genau eine Zutat, sonst verhungert eine Sorte (siehe Kapelle/Grabmoos)
  const je = Object.values(D.HERB_LOC);
  assert.equal(new Set(je).size, je.length, 'Zwei Orte liefern dieselbe Zutat');
  assert.equal(je.length, D.LOCATIONS.length, 'Nicht jeder Ort liefert eine Zutat');
});

// Das Verzeichnis muss sich selbst aktuell halten. Prüft NICHT, ob die Texte schön sind,
// sondern ob sie aus den Daten kommen – ein abgetippter Satz würde hier durchfallen.
test('Das Verzeichnis leitet ab und vergisst keinen Weg', async () => {
  const G = await import('../js/state.js'), D = await import('../js/data.js'), W = await import('../js/wiki.js');
  G.newChar('V1', 'sorceress');
  for (const a of D.ACTS.slice(0, 3)) G.S.acts.prog[a.id] = D.ACT.zones + 1;

  // Jede Kategorie liefert etwas, und keine Zeile hat ein Loch im Text.
  for (const c of W.WIKI_CATS) {
    if (c.id === 'up') continue;
    const L = W.wikiList(c.id);
    assert.ok(L.length, `Kategorie ${c.id} ist leer`);
    for (const r of L) { assert.ok(r.sub && !/undefined|NaN/.test(r.sub), `${c.id}/${r.id}: „${r.sub}"`);
      assert.ok(r.unknown || r.name, `${c.id}/${r.id} ohne Namen`); }
  }
  // Zutaten: der Ort folgt HERB_LOC – oder bleibt verschwiegen, solange der Akt zu ist.
  for (const k of Object.keys(D.HERBS)) {
    const wo = W.herbWhere(k);
    if (k === 'herz') { assert.match(wo, /Boss/); continue; }
    const ort = Object.keys(D.HERB_LOC).find(l => D.HERB_LOC[l] === k);
    assert.equal(wo, W.locKnown(ort) ? D.LOCATIONS.find(l => l.id === ort).name : 'an einem Ort, den du noch nicht kennst',
      `Zutat ${k} sagt „${wo}"`);
  }
  // Nichts aus einem verschlossenen Akt darf durchsickern.
  const zu = D.ACTS.find(a => !G.actOpen(a));
  if (zu) { const l = D.LOCATIONS.find(x => x.id === zu.loc);
    const txt = JSON.stringify(W.wikiList('locs')) + JSON.stringify(W.wikiList('mobs')) + JSON.stringify(W.wikiList('mats'));
    assert.ok(!txt.includes(l.name), `Der verschlossene Ort ${l.name} steht im Verzeichnis`);
    assert.equal(W.wikiEntry('locs', zu.loc), null, 'Ein verschlossener Ort hat einen Eintrag'); }

  // Aufwerten: JEDER Weg muss dabei sein. Wer eine Operation ergänzt und das hier vergisst,
  // baut eine Auskunft, die stillschweigend unvollständig ist – schlimmer als gar keine.
  const P = W.upgradePaths();
  // Umschmieden-Operationen + Schärfen, Verstärken, Rune schmieden, Fusionieren, Erheben
  const soll = D.CRAFT.ops.length + 5;
  assert.equal(P.length, soll, `Aufwerten zählt ${P.length} Wege statt ${soll}`);
  assert.equal(new Set(P.map(x => x.name)).size, P.length, 'Ein Weg steht doppelt im Verzeichnis');
  for (const o of D.CRAFT.ops) assert.ok(P.some(x => x.name === o.name), `Weg „${o.name}" fehlt`);
  for (const n of ['Rune schmieden', 'Fusionieren', 'Erheben']) assert.ok(P.some(x => x.name === n), `Weg „${n}" fehlt`);
  for (const u of P) { assert.ok(u.cost && !/undefined|NaN/.test(u.cost), `„${u.name}": ${u.cost}`);
    assert.ok(u.grp && u.where, `„${u.name}" ohne Ort`); }
  // Grenzen, die man sonst erst beim Scheitern erfährt, müssen dastehen.
  assert.match(P.find(x => x.name === 'Rune schmieden').limit, new RegExp(String(D.FORGE.maxRunes)));
  assert.match(P.find(x => x.name === 'Fusionieren').limit, /für immer/);

  // Material-Engpass: die Aschenrune zählt mit, sonst sieht Höllenasche harmloser aus als sie ist.
  const n = W.matNeeds('asche');
  assert.ok(n.length >= 3 && n.includes(D.RUNES.asche.name), `Höllenasche: ${n.join(', ')}`);
  G.S.mats = { asche: 0, siegel: 9, staub: 9, blutstein: 9, leinen: 9, zahn: 9 };
  assert.equal(W.matBottleneck()?.k, 'asche', 'Der Engpass zeigt nicht auf das knappste Material');
});

// --- Welle 2a: Schadensarten, Resistenzen, Waffen-Deckel ---
const { seeded } = await import('../js/rng.js');
const C = await import('../js/combat.js');
const firstDmg = (r, who, pred) => r.log.find(l => l.who === who && l.dmg && pred(l))?.dmg;

test('Schadensarten: Feuer/Eis gegen Elementar-Resi, Hiebe gegen Phys.-Resi, Gegner verteilen ihren Schaden', () => {
  fresh('sorceress'); G.S.lvl = 20; const A = { ...G.stats(), elemPen: 0 }; A.hp *= 200;   // zäh genug zum Zaubern; ohne Durchdringung (eigener Test)
  assert.equal(A.spells.find(s => s.id === 'feuerball').el, 'fire'); assert.equal(A.spells.find(s => s.id === 'frost').el, 'cold');
  const B = G.makeMonster(20, 1, D.MONSTERS[0]); B.hp *= 50;
  const run = res => seeded(7, () => fight(A, { ...B, res }));
  const r0 = run({}), rE = run({ elem: 0.5 }), rP = run({ phys: 0.5 });
  const fb = l => l.spell === 'Feuerball', hb = l => !l.spell;
  // gleicher Würfel: Feuerball halbiert sich gegen Elementar-Resi, nicht gegen Phys.-Resi; beim Hieb umgekehrt
  assert.ok(Math.abs(firstDmg(rE, 'a', fb) - firstDmg(r0, 'a', fb) * 0.5) <= 1, 'Feuer ignoriert Elementar-Resi');   // ±1: ganze Zahlen
  assert.equal(firstDmg(rP, 'a', fb), firstDmg(r0, 'a', fb), 'Feuer wird von Phys.-Resi gebremst');
  assert.ok(Math.abs(firstDmg(rP, 'a', hb) - firstDmg(r0, 'a', hb) * 0.5) <= 1, 'Hieb ignoriert Phys.-Resi');
  // Gegner mit 60 % Feuer: gegen 50 % Elementar-Resi bleiben 1 − 0,6 × 0,5 = 70 % seines Hiebs
  assert.ok(Math.abs(C.resMul({ fire: 0.6 }, { res: { elem: 0.5 } }) - 0.7) < 1e-9);
  // Rüstung (D2/PoE) wirkt nur auf den physischen Anteil: 40 % phys. × (1 − 0,5 Rüstung) + 60 % Feuer
  assert.ok(Math.abs(C.resMul({ fire: 0.6 }, { res: {} }, null, 0.5) - (0.4 * 0.5 + 0.6)) < 1e-9);
  // Feuerball geht an der Rüstung vorbei, der Hieb nicht (gleicher Würfel, Ziel mit viel mehr Rüstung)
  const rA = seeded(7, () => fight(A, { ...B, armor: B.armor * 20 }));
  assert.equal(firstDmg(rA, 'a', fb), firstDmg(r0, 'a', fb), 'Feuer wird von Rüstung gebremst'); assert.ok(firstDmg(rA, 'a', hb) < firstDmg(r0, 'a', hb));
  assert.ok(Math.abs(C.resMul({ cold: 0.3 }, { res: { phys: 0.2, elem: 0.4 } }) - (0.7 * 0.8 + 0.3 * 0.6)) < 1e-9);
  // Daten: jede Mischung ≤ 100 %, jede Resi 0..CFG.resCap; jeder Akt- und Krypta-Boss hat eine erkennbare Mischung oder Resi
  for (const m of [...D.MONSTERS, ...D.CRYPTS.map(c => c.boss), ...D.ACTS.map(a => a.boss)]) {
    const x = C.mixOf(m.mix); assert.ok(x.phys >= 0 && x.fire + x.cold <= 1, m.name);
    for (const v of Object.values(m.res || {})) assert.ok(v >= 0 && v <= D.CFG.resCap, m.name);
  }
  for (const b of [...D.CRYPTS.map(c => c.boss), ...D.ACTS.map(a => a.boss)]) assert.ok(b.mix || b.res, `Boss ohne Schadensart/Resi: ${b.name}`);
  // Vor dem Kampf sichtbar: enemyInfo nennt Mischung und Resi, „Trifft dich“ rechnet deine Resi ein
  const H = G.makeMonster(20, 1, D.MONSTERS.find(m => m.name === 'Höllenbrut')), e0 = Game.enemyInfo(H, A), e1 = Game.enemyInfo(H, { ...A, res: { phys: 0, elem: 0.5 } });
  assert.equal(e0.mix.fire, 0.5); assert.equal(e0.res.elem, 0.2); assert.ok(e1.hit[1] < e0.hit[1], 'Resi senkt „Trifft dich“ nicht');
});

test('Resistenzen: aus Teilen summiert, im Kampf bei 75 % gedeckelt, Malus vor dem Deckel (gedeckelt), Durchdringung danach', () => {
  fresh('barbarian'); G.S.lvl = 30;
  G.S.equip.helm = makeItem(30, { slot: 'helm' }); G.S.equip.helm.mods = { elemr: 50, physr: 10 };
  G.S.equip.ring1 = makeItem(30, { slot: 'ring' }); G.S.equip.ring1.mods = { elemr: 40 };
  const A = G.stats(); assert.ok(Math.abs(A.res.elem - 0.9) < 1e-9 && Math.abs(A.res.phys - 0.1) < 1e-9, JSON.stringify(A.res));
  assert.equal(C.resOf(A, 'elem'), D.CFG.resCap, 'Deckel 75 % greift nicht');
  assert.equal(C.resOf({ res: { phys: 0.8 } }, 'phys'), D.CFG.resCapPhys, 'Phys.-Resi: Deckel 50 % (D2) greift nicht');
  assert.equal(C.resOf({ res: { elem: 0.9 }, resPen: 0.1 }, 'elem'), 0.75, 'Malus vor dem Deckel: 90 − 10 = 80 → 75');
  assert.ok(Math.abs(C.resOf({ res: { elem: 0.5 }, resPen: 0.2 }, 'elem') - 0.3) < 1e-9);
  assert.equal(C.resOf({ res: { phys: 0.3 }, resPen: 0.2 }, 'phys'), 0.3, 'Malus trifft nur Elementar (D2/PoE)');
  // Durchdringung (PoE): nach dem Deckel, darf unter 0 gehen – Gegner ohne Resi nimmt dann mehr
  assert.ok(Math.abs(C.resOf({ res: { elem: 0.9 } }, 'elem', 0.1) - 0.65) < 1e-9, '75 − 10 = 65');
  assert.ok(Math.abs(C.resMul(null, { res: {} }, 'fire', 0, 0.1) - 1.1) < 1e-9, 'Durchdringung gegen 0 % → +10 %');
  assert.equal(C.resMul(null, { res: {} }, 'phys', 0, 0.5), 1, 'Durchdringung wirkt nicht auf Physisch');
  // Im Kampf: 90 % wirkt wie 75 % (gleicher Würfel, gleicher Schaden)
  const B = G.makeMonster(30, 1, D.MONSTERS.find(m => m.name === 'Höllenbrut')); A.hp *= 50;
  const hit = res => firstDmg(seeded(3, () => fight({ ...A, res }, B)), 'b', l => !l.spell);
  assert.equal(hit({ elem: 0.9 }), hit({ elem: 0.75 })); assert.ok(hit({ elem: 0.75 }) < hit({ elem: 0 }));
  // Abgrund: Malus je Tiefe ist ein Dateneintrag und heute aus
  // Fluch der Tiefe: −10 % je 10 Tiefen, aber gedeckelt (Ansage: höchstens −20/30, nie −200)
  assert.equal(Game.descResPen(9), 0); assert.ok(Math.abs(Game.descResPen(10) - 0.1) < 1e-9); assert.ok(Math.abs(Game.descResPen(25) - 0.2) < 1e-9);
  for (const d of [30, 50, 200, 5000]) assert.equal(Game.descResPen(d), D.DESCENT.resMalus.max); assert.ok(D.DESCENT.resMalus.max <= 0.3);
  // Affixe: nur Rüstungsteile und Schmuck, Werte wie D2 (Elementar Stufe I ≤ 30 %, Phys. ≤ 25 %): den Deckel erreicht man
  // erst mit mindestens drei Teilen der besten Stufe
  for (const k of ['physr', 'elemr']) { const a = D.AFFIXES.find(x => x.stat === k), hi = L.tierBand(a, 1)[1], cap = k === 'physr' ? D.CFG.resCapPhys : D.CFG.resCap;
    assert.ok(!a.slots.includes('weapon') && a.slots.includes('ring') && a.side === 'suf');
    assert.ok(hi <= (k === 'physr' ? 25 : 30) && hi * 2 < cap * 100, `${k} Stufe I: ${hi}`); }
  assert.ok(power0ok());
  function power0ok() { const p0 = G.power(G.stats()); G.S.equip.helm.mods = {}; G.S.equip.ring1.mods = {}; return p0 > G.power(G.stats()); }   // power() kennt die Resi
});

test('Waffen-Deckel: Grundschaden wirkt höchstens wie Heldenstufe + 10, sichtbar im Tooltip', () => {
  fresh('sorceress'); const S = G.S;
  const w = makeItem(59, { slot: 'weapon', kind: 'staff' }); w.lvl = 59; w.mods = {}; S.equip.weapon = w;
  S.lvl = 22; const a = G.stats().dmg, eff = L.wpnDmg(w, 22);
  assert.notEqual(eff, w.dmg); assert.ok(eff[1] < w.dmg[1]);
  const f = L.lvlScale(32) / L.lvlScale(59); assert.ok(Math.abs(eff[1] - Math.round(w.dmg[1] * f)) <= 1, `${eff} vs ${w.dmg}`);
  S.lvl = 49; assert.equal(L.wpnDmg(w, 49), w.dmg, 'ab Heldenstufe GS − 10 voll'); const b = G.stats().dmg;
  assert.ok(b[1] > a[1], 'höhere Heldenstufe hebt den Deckel nicht');
  S.lvl = 22; w.lvl = 20; assert.equal(L.wpnDmg(w, 22), w.dmg, 'Waffe unter dem Deckel wird gekürzt');
});

test('Zauberin: Passiv ist Elementar-Durchdringung, Stab-Bonus addiert sich, Kampf und Kampfkraft kennen sie', () => {
  fresh('sorceress'); G.S.lvl = 20; const A = G.stats(); assert.ok(Math.abs(A.elemPen - 0.15) < 1e-9 && Math.abs(A.res.elem - 0.25) < 1e-9);
  G.S.equip.weapon = makeItem(20, { slot: 'weapon', kind: 'staff' }); G.S.equip.weapon.mods = { elempenp: 10 }; const B = G.stats();
  assert.ok(Math.abs(B.elemPen - 0.25) < 1e-9); assert.ok(G.power(B) > G.power({ ...B, elemPen: 0 }), 'power() kennt die Durchdringung nicht');
  assert.ok(Ld.affixPool({ slot: 'weapon', kind: 'axe' }).every(a => a.stat !== 'elempenp'), 'Durchdringung würfelt auf Hieb-Waffen');
  const M = G.makeMonster(20, 1, D.MONSTERS[0]); M.hp *= 50; const H = { ...B }; H.hp *= 200;
  const fb = r => r.log.find(l => l.who === 'a' && l.spell === 'Feuerball' && l.dmg).dmg;
  const with_ = fb(seeded(5, () => fight(H, M))), without = fb(seeded(5, () => fight({ ...H, elemPen: 0 }, M)));
  assert.ok(Math.abs(with_ - without * 1.25) <= 1, `Feuerball +25 % gegen 0 % Resi: ${without} → ${with_}`);
});

test('Siegel des Abgrunds: einlegen, bereinigen, verbrauchen, wirken; alter Stand ohne Feld stürzt nicht ab', () => {
  descHero(); delete G.S.sigils;
  assert.equal(Game.sigHave('blut', 1), 0, 'ohne Feld: leerer Vorrat, kein Absturz');
  // Ohne Vorrat: Auswahl wird bereinigt, der Abstieg geht trotzdem
  assert.ok(Game.descStart(1, [{ id: 'blut', t: 1 }])); assert.deepEqual(G.S.desc.sig, []); assert.equal(Game.descStair().kind, 'back');
  Game.addSigil('blut', 2, 1); Game.addSigil('seele', 1, 1); Game.addSigil('rune', 3, 2);
  const pick = [{ id: 'blut', t: 2 }, { id: 'blut', t: 2 }, { id: 'seele', t: 1 }, { id: 'rune', t: 3 }, { id: 'gibtsnicht', t: 1 }, { id: 'rune', t: 9 }];
  assert.equal(Game.sigClean(pick).length, D.SIGILS.max, 'höchstens max, eine je Art, Unsinn raus');
  // Umkehren vor Raum 1 gibt die Siegel zurück (kostet nichts)
  assert.ok(Game.descStart(1, pick)); assert.equal(Game.sigHave('blut', 2), 0, 'beim Abstieg verbraucht'); Game.descStair();
  assert.equal(Game.sigHave('blut', 2), 1); assert.equal(Game.sigHave('rune', 3), 2, 'Umkehren gibt sie zurück');
  assert.ok(Game.descStart(1, pick)); const D0 = G.S.desc;
  const fx = Game.sigFx(); assert.equal(fx.foe, D.SIGILS.kinds[0].foe[1]); assert.equal(fx.res, D.SIGILS.kinds[2].res[2]); assert.equal(fx.eliteR, 3);
  // Wirkung auf den Boss: gleicher Zufall, mit Blutsiegel stärker
  const boss = () => { const r = Math.random; let k = 1; Math.random = () => (k = (k * 16807) % 2147483647) / 2147483647; try { return Game.descEnemy('boss'); } finally { Math.random = r; } };
  const withS = boss(); const keep = D0.sig; D0.sig = []; const without = boss(); D0.sig = keep;
  assert.ok(withS.hp > without.hp * (1 + fx.foe / 2) && withS.dmg[1] > without.dmg[1], `Blutsiegel: Boss ${withS.hp} gegen ${without.hp}`);
  // Seelensiegel: mehr Elite-Räume (Karte)
  const c = D.CRYPTS[0], el = f => { let n = 0; for (let i = 0; i < 300; i++) n += Game.descMap(c, f).flat().filter(x => x.t === 'elite').length; return n; };
  assert.ok(el(Game.sigFx([{ id: 'seele', t: 3 }])) > el(Game.sigFx([])) * 1.5, 'Elite häufiger');
  // Ein laufender Abstieg aus der Zeit vor den Siegeln (ohne sig/sack.sig) stürzt nicht ab
  delete D0.sig; delete D0.sack.sig; assert.ok(Game.descEnemy('boss').hp > 0); assert.ok(Game.descChance('boss') >= 0);
  // Siegel im Sack werden am Ausgang gutgeschrieben – und überleben Speichern/Laden
  D0.sack.sig = { 'seele:2': 2 }; D0.rows[0][0] = { t: 'rope', x: D0.rows[0][0].x };
  const r = Game.descEnter(0); assert.equal(r.kind, 'out'); assert.deepEqual(r.out.sig, [{ id: 'seele', t: 2, n: 2 }]);
  G.save(); G.load(); assert.equal(Game.sigHave('seele', 2), 2, 'nach Laden noch da');
  assert.deepEqual([1, 7, 8, 15, 16, 40].map(Game.sigTierAt), [1, 1, 2, 2, 3, 3], 'tiefer = bessere Siegel');
  assert.equal(Game.coreChance(D.ASHCORE.from - 1), 0, 'Aschenkern nicht über der Mindesttiefe');
  assert.ok(Game.coreChance(200) <= D.ASHCORE.max);
});

test('Aschenkern: eine Wirkung je Teil, Einzigartiges zerfällt, Nachteile wandern mit, bleibt nach Speichern/Laden', async () => {
  const S = fresh('barbarian'); S.lvl = 40; S.gold = 1e6;
  const uq = name => { for (let i = 0; i < 40000; i++) { const it = makeItem(50, { slot: D.UNIQUES.find(u => u.name === name).slot, minRarity: 4 }); if (it.unique === name) return it; } };
  const plain = slot => { for (;;) { const it = makeItem(50, { slot, minRarity: 3 }); if (!it.unique && !it.set) return it; } };
  const u = uq('Totengräbers Griff'), t = plain('gloves'), ring = plain('ring'); G.addToBag(u); G.addToBag(t); G.addToBag(ring);
  assert.deepEqual(G.coreKeys(u).sort(), ['dmgPct', 'execute'], 'Begleiter (execHp) nicht wählbar');
  assert.deepEqual(G.coreEff(u, 'execute'), { execute: Math.round(u.fx.execute * G.coreMult('execute') * 1000) / 1000, execHp: u.fx.execHp }, 'Begleiter wandert ganz mit');
  assert.equal(G.coreMult('execute'), 0.5, 'Henker wandert nur zu 50 % (Besitzer)');
  const sch = uq('Scherbenschneide'); assert.equal(G.coreEff(sch, 'dmgPct').hpPct, sch.fx.hpPct, 'Nachteil wandert ganz mit');
  assert.equal(G.coreCheck(u, 'dmgPct', t), 'Kein Aschenkern.');
  S.mats.aschenkern = 2;
  assert.equal(G.coreCheck(u, 'dmgPct', ring), 'Nur ein Teil desselben Platzes.');
  assert.equal(G.coreCheck(u, 'execHp', t), 'Eine Wirkung des Einzigartigen antippen.');
  S.equip.gloves = u; G.removeFromBag(u.id); assert.ok(G.coreCheck(u, 'dmgPct', t), 'nie vom Körper'); S.equip.gloves = null; G.addToBag(u);
  const pw0 = (S.equip.gloves = t, G.power()); S.equip.gloves = null; G.addToBag(t);
  const r = G.coreApply(u.id, 'dmgPct', t.id); assert.ok(!r.err, r.err);
  assert.ok(!S.bag.some(x => x.id === u.id), 'Einzigartiges zerfällt'); assert.equal(S.mats.aschenkern, 1);
  assert.deepEqual(t.core, { from: 'Totengräbers Griff', key: 'dmgPct', eff: { dmgPct: 0.12 } });
  // Höchstens einer je Teil – ein zweites Einzigartiges wird abgewiesen, nichts still überschrieben
  const u2 = uq('Fäuste des Eifers'); G.addToBag(u2);
  assert.equal(G.coreCheck(u2, 'zeal', t), 'Dieses Teil trägt schon einen Aschenkern.'); assert.ok(G.coreApply(u2.id, 'zeal', t.id).err);
  assert.ok(!G.coreTargets(u2).includes(t), 'Teil mit Kern ist kein Ziel mehr');
  // Wirkt: effects()/power() zählen ihn
  G.removeFromBag(t.id); S.equip.gloves = t; assert.ok(G.effects().dmgPct >= 0.12); assert.ok(G.power() > pw0, 'Kampfkraft steigt');
  // Umschmieden lässt ihn stehen, als Futter taugt er nicht
  const t2 = plain('gloves'); t2.core = { from: 'x', key: 'crit', eff: { crit: 0.05 } }; G.addToBag(t2);
  t.rarity = t2.rarity; t.kind = t2.kind; assert.ok(!G.fuseFoods(t).includes(t2), 'Kern-Teil nie Futter');
  G.craft(t.id, 'chaos'); assert.equal(t.core.key, 'dmgPct', 'Neu würfeln lässt den Kern stehen');
  // Speichern/Laden
  G.save(); const L2 = G.load(); assert.deepEqual(L2.equip.gloves.core.eff, { dmgPct: 0.12 });
  // Marke: Klasse am Feld und eine CSS-Regel dafür, Zeile im Tooltip
  const fs = await import('node:fs'), css = fs.readFileSync('css/style.css', 'utf8');
  assert.ok(/\.fslot\.kern::after/.test(css) && /\.item\.kern::after/.test(css), 'Marke braucht eine CSS-Regel');
  assert.ok(/core-l/.test(UI.itemTip(L2.equip.gloves)) && /Aschenkern/.test(UI.itemTip(L2.equip.gloves)));
});

test('Legendäre heißen nie wie Einzigartige (Aschenkern-Verwechslung)', async () => {
  const D = await import('../js/data.js'), U = D.UNIQUES.map(u => u.name);
  for (const n of D.LEGEND_NAMES) assert.ok(!U.some(u => u.includes(n) || n.includes(u)), n + ' heißt wie ein Einzigartiges');
});
test('Weicher Deckel: Ausweichen/Krit wachsen bis zur Grenze immer weiter, erreichen sie nie, unter dem Knie unverändert', async () => {
  const { softCap, evadeChance, critChance } = await import('../js/combat.js');
  for (const cap of [0.5, 0.58, 0.6]) { let prev = 0;
    for (let x = 0; x <= 1.5; x += 0.05) { const v = softCap(x, cap); assert.ok(v < cap && v >= prev, `x=${x} Grenze ${cap}: ${v}`); if (x > cap * D.CFG.softKnee + 0.01) assert.ok(v - prev > 0, 'jeder Punkt zählt'); prev = v; }
    assert.equal(softCap(cap * D.CFG.softKnee * 0.9, cap), cap * D.CFG.softKnee * 0.9, 'unter dem Knie voll'); }
  // Assassine Stufe 8 aus dem Fehlerbericht: Geschick 59, Ausweichen +24 %, Grenze +8 % – vorher hart 58 %, jetzt darunter und mit Luft
  const y = { dex: 59, evade: 0.24, evadeCap: 0.08 }, e = evadeChance(y, 28);
  assert.ok(e < 0.55 && e > 0.45, `Ausweichen ${e}`); assert.ok(evadeChance({ ...y, evade: 0.34 }, 28) > e, 'mehr Ausweichen bringt noch etwas');
  assert.ok(critChance({ lck: 80 }, 8) > critChance({ lck: 53 }, 8), 'mehr Glück bringt noch Krit');
});

// --- Zauber nach Lage (System B, combat.js pickSpell): ruft fight() auf, baut die Regel nicht nach ---
// Ein Held, der sicher zuerst zieht, alle Zauber sofort voll (Weg „open“); erster eigener Zug zeigt die Wahl.
test('Zauber nach Lage: Auswahlregeln des Helden', () => {
  const sp = (id, kind, every, x = {}) => ({ id, name: id, every, kind, m: { open: 1 }, ...x });
  const hero = (spells, x = {}) => ({ name: 'H', cls: 'sorceress', lvl: 20, main: 'int', str: 0, dex: 0, int: 0, con: 10, lck: 0, armor: 0, dmg: [10, 10], hp: 1000, first: 1, amp: 1, spells, ...x });
  const foe = (x = {}) => ({ name: 'G', lvl: 20, main: 'str', str: 0, dex: 0, int: 0, con: 10, lck: 0, armor: 0, dmg: [5, 5], hp: 5000, ...x });
  const first = (A, B) => { const l = fight(A, B).log.find(e => e.who === 'a'); return l.spell || 'Hieb'; };
  const nova = sp('nova', 'stun', 5, { mult: 1.2 }), ball = sp('ball', 'hit', 3, { mult: 1.7 }), heal = sp('heal', 'heal', 6, { pct: 0.15 });
  // Betäubung nicht auf Immune – dann der stärkere Schadenszauber (Feuerball statt Nova)
  assert.equal(first(hero([ball, nova]), foe()), 'nova');
  assert.equal(first(hero([ball, nova]), foe({ stunImm: 9 })), 'ball');
  // Heilung bei vollem Leben halten, unter halbem Leben wirken
  assert.equal(first(hero([heal]), foe()), 'Hieb');
  assert.equal(first(hero([heal], { cur0: 400 }), foe()), 'heal');
  // … aber nicht halten, wenn der nächste Gegnertreffer tödlich sein kann (80 % Leben, Gegner trifft für bis zu ~900)
  assert.equal(first(hero([heal], { cur0: 800 }), foe({ dmg: [300, 450] })), 'heal');
  // Heilung gebannt (Pakt) → halten
  assert.equal(first(hero([heal], { cur0: 400, nohealSelf: 1 }), foe()), 'Hieb');
  // Hieb tötet sicher → alle Zauber halten; Zauber tötet → der kleinste tötende
  assert.equal(first(hero([ball, sp('meteor', 'hit', 7, { mult: 3.5 })]), foe({ hp: 5 })), 'Hieb');
  assert.equal(first(hero([sp('meteor', 'hit', 7, { mult: 3.5 }), ball]), foe({ hp: 16 })), 'ball');
  assert.equal(first(hero([ball, sp('meteor', 'hit', 7, { mult: 3.5 })]), foe({ hp: 30 })), 'meteor');
  // Buff am Maximum nicht wiederholen
  const cry = sp('cry', 'buff', 4, { v: 0.2, max: 0.4 });
  assert.equal(first(hero([cry]), foe()), 'cry');
  const r = fight(hero([cry]), foe()); const cries = r.log.filter(e => e.who === 'a' && e.spell === 'cry').length;
  assert.equal(cries, 2, 'Kriegsschrei nur bis +40 % (zweimal)');
  // Gift: neu nur, wenn das laufende schwächer als 80 % des neuen ist
  const dot = sp('gift', 'dot', 4, { mult: 0.35 });
  assert.equal(first(hero([dot]), foe()), 'gift');
  assert.equal(first(hero([dot]), foe({ poisonDmg: 50 })), 'Hieb');
  // Gehaltene Ladung bleibt (höchstens ein Zug Vorrat über voll): Kampf mit gehaltener Heilung zeigt später die Heilung
  const long = fight(hero([heal]), foe({ dmg: [60, 60] }));
  assert.ok(long.log.some(e => e.who === 'a' && e.spell === 'heal'), 'gehaltene Heilung kommt, sobald sie gebraucht wird');
  // Monster (ohne Klasse) und Schalter aus: alter Takt (höchster Rang zuerst)
  D.CFG.spellPick = false; try { assert.equal(first(hero([ball, nova]), foe({ stunImm: 9 })), 'nova'); } finally { D.CFG.spellPick = true; }
});

test('Zauber nach Lage: Nachhall und „Krone ohne Träger“ wirken nie öfter als zweimal', () => {
  const ball = { id: 'ball', name: 'ball', every: 3, kind: 'hit', mult: 1.7, m: { open: 1 } };
  for (let i = 0; i < 40; i++) {
    const r = fight({ name: 'H', cls: 'sorceress', lvl: 20, main: 'int', str: 0, dex: 0, int: 0, con: 10, lck: 0, armor: 0, dmg: [10, 10], hp: 1000, first: 1, amp: 1, echo: 1, firstEcho: 1, spells: [ball] },
      { name: 'G', lvl: 20, main: 'str', str: 0, dex: 0, int: 0, con: 10, lck: 0, armor: 0, dmg: [5, 5], hp: 5000 });
    // Folge gleicher Zauber ohne Zug dazwischen: Grundwirkung + höchstens Nachhall + erstes Doppel
    let run = 0, max = 0; for (const e of r.log) { if (e.who === 'a' && e.spell) { run++; max = Math.max(max, run); } else if (e.who === 'b' || (e.who === 'a' && !e.spell && !/hallt|zweimal/.test(e.t))) run = 0; }
    assert.ok(max <= 3, `höchstens 3 Würfe am Stück, war ${max}`);
  }
});

// --- Build-Paket (Bericht 3, 2026-11-22) ---
test('Schlüsselsteine: höchstens einer je Brett, alte Stände bekommen die Punkte zurück', () => {
  for (const cls of D.PLAYABLE) {
    const S = fresh(cls); S.lvl = 60; const keys = G.keyNodes(cls); assert.equal(keys.length, 3, `${cls}: drei Steine`);
    // alles bis unter die Steine lernen, dann einen Stein: die anderen beiden sind gesperrt
    S.tal = {}; if (G.treeOf(cls)) D.TREE[cls].cols.forEach(c => c.nodes.forEach(n => { if (n.kind !== 'key') S.tal[n.id] = n.max; }));
    else D.TALENTS[cls].forEach(b => b.nodes.slice(0, -1).forEach(n => { S.tal[n.id] = 1; }));
    const can = () => G.treeOf(cls) ? D.TREE[cls].cols.map((c, ci) => G.nodeState(ci, c.nodes.length - 1).can) : [0, 1, 2].map(b => G.talentState(cls, b, 2).can);
    assert.deepEqual(can(), [true, true, true]);
    S.tal[keys[1].id] = 1; assert.deepEqual(can(), [false, false, false], `${cls}: nach einem Stein ist keiner mehr lernbar`);
    assert.ok(G.keyLocked(keys[0].id) && !G.keyLocked(keys[1].id));
    // alter Stand mit zwei Steinen: beide weg, Punkte zurück, Hinweis-Merker gesetzt
    S.tal[keys[2].id] = 1; const before = G.talentPoints();
    assert.ok(G.fixKeystones(S)); assert.equal(G.talentPoints(), before + 2); assert.ok(!keys.some(k => S.tal[k.id])); assert.equal(S.ksNote, 1);
    assert.equal(G.fixKeystones(S), false, 'ein Stand mit höchstens einem Stein bleibt unberührt');
  }
  // beim Laden
  const S = fresh('sorceress'); S.lvl = 40; for (const k of G.keyNodes('sorceress')) S.tal[k.id] = 1; G.save(); G.load();
  assert.equal(G.keyNodes('sorceress').filter(k => G.S.tal[k.id]).length, 0); assert.equal(G.S.ksNote, 1);
});

test('Aldemar: Gift +1,5 % des Lebens je Treffer ohne Deckel – andere Gift-Gegner behalten den Deckel', () => {
  const ald = D.CRYPTS.find(c => c.boss.name.startsWith('Bruder Aldemar'));
  assert.equal(ald.boss.mech.poisonPct, 0.015);
  const hero = { name: 'H', cls: 'barbarian', lvl: 20, main: 'str', str: 0, dex: 0, int: 0, con: 10, lck: 0, armor: 0, dmg: [1, 1], hp: 10000, belt: [] };
  const tick = mo => { const r = fight(hero, { ...mo, first: 1, dex: 0, crit: 0, rage: 0, dmg: [1, 1], hp: 1e7 }); return Math.max(...r.log.filter(e => e.tk === 'poison' && e.who === 'b').map(e => e.tick), 0); };
  const boss = G.makeBoss(ald, 20); assert.ok(boss.poisonPct > 0);
  assert.ok(tick(boss) > 10000 * 0.08 * 1.5, 'stapelt über den alten Deckel von 8 %');
  assert.ok(tick({ ...G.makeMonster(20), poison: 0.15 }) <= 800, 'Elite „Giftig“: Deckel 8 % bleibt');
  assert.match(ald.boss.mechText, /Gegengift/);
});

test('Müllerin: Zorn +10 % je eigenem Zug statt Raserei, Absicht zeigt ihn', () => {
  const a2 = D.ACTS.find(a => a.id === 'a2'); assert.equal(a2.boss.mech.ramp, 0.1); assert.ok(!a2.boss.mech.rage);
  const boss = G.makeBoss(a2, 12);
  const r = fight({ name: 'H', cls: 'barbarian', lvl: 12, main: 'str', str: 0, dex: 0, int: 0, con: 10, lck: 0, armor: 0, dmg: [1, 1], hp: 1e6, belt: [] }, { ...boss, dex: 0 });
  const z = r.log.map(e => e.iB).filter(t => /^Zorn/.test(t || '')).map(t => +t.match(/\d+/)[0]);
  assert.ok(z.length > 5 && z.at(-1) > z[0] && z.at(-1) >= 100, `Zorn steigt: ${z.slice(0, 3)} … ${z.at(-1)}`);
});

test('Verbrennung: Brand verhindert die Heilung des Gegners, eigene Heilung bleibt', () => {
  const sf6 = D.TREE.sorceress.cols[0].nodes.find(n => n.id === 'sf6'); assert.ok(sf6.eff.igniteBan && !sf6.eff.nohealSelf);
  const ball = { id: 'b', name: 'b', every: 2, kind: 'hit', mult: 1, el: 'fire', m: { open: 1 } };
  const mk = ban => fight({ name: 'H', cls: 'sorceress', lvl: 20, main: 'int', str: 0, dex: 0, int: 0, con: 10, lck: 0, armor: 0, dmg: [5, 5], hp: 1e6, first: 1, amp: 1, ignite: 1, igniteBan: ban, spells: [ball], belt: [] },
    { name: 'G', lvl: 20, main: 'str', str: 0, dex: 0, int: 0, con: 10, lck: 0, armor: 0, dmg: [1, 1], hp: 1e5, regen: 0.01 });
  assert.ok(mk(0).log.some(e => /regeneriert/.test(e.t))); assert.ok(!mk(1).log.some(e => /regeneriert/.test(e.t)), 'brennend: keine Regeneration');
});

test('Attribut-Bindungen: Eisgrab Stärke → Schild, Schattenform Stärke → Leben, Ahnenruf Glück → Zaubertempo', () => {
  const cases = [['sorceress', 'sk6', 'str', st => st.ward], ['assassin', 'as6', 'str', st => st.hp], ['barbarian', 'b9', 'lck', st => st.haste]];
  for (const [cls, id, at, f] of cases) {
    const S = fresh(cls); S.lvl = 30; S.attrs[at] = 10; S.tal = { [id]: 1 };
    const a = f(G.stats()); S.attrs[at] = 60; const b = f(G.stats()); S.tal = {}; const c = f(G.stats()); S.attrs[at] = 10; const d = f(G.stats());
    assert.ok(b > a, `${id}: mehr ${at} → mehr`); assert.ok(Math.abs((c - d) - 0) < 1e-9 || at === 'str', `${id}: ohne Stein bindet ${at} nichts`);
    for (const k of Object.keys(D.TREE[cls] ? D.TREE[cls].cols.flatMap(x => x.nodes).find(n => n.id === id).eff : D.TALENTS[cls].flatMap(x => x.nodes).find(n => n.id === id).eff)) assert.ok(D.EFFECT_NAMES[k], `Effekt-Name fehlt: ${k}`);
  }
  // genaue Werte: Eisgrab 0,6 % je Punkt
  const S = fresh('sorceress'); S.lvl = 30; S.tal = { sk6: 1 }; S.attrs.str = 0; const w0 = G.stats().ward; S.attrs.str = 50; assert.ok(Math.abs(G.stats().ward - w0 - 0.3) < 1e-9);
});

// --- Zeitachse (System C, CFG.tempoMode – Standard aus) ---
test('Zeitachse: Tempo wird Aktionsrate, Ticks laufen je Zeit, Krit-Schwung einmal je Aktion, nie mehr als 50 Aktionen', () => {
  return import('../js/combat.js').then(C => {
    assert.equal(D.CFG.tempoMode, false, 'Zeitachse ist ausgeschaltet, bis neu geeicht');
    const H = (x = {}) => ({ name: 'H', cls: 'sorceress', lvl: 20, main: 'int', str: 0, dex: 0, int: 0, con: 10, lck: 0, armor: 0, dmg: [5, 5], hp: 1e6, first: 1, amp: 1, spells: [], belt: [], ...x });
    const foe = (x = {}) => ({ name: 'G', lvl: 20, main: 'str', str: 0, dex: 0, int: 0, con: 10, lck: 0, armor: 0, dmg: [1, 1], hp: 1e6, ...x });
    // aus: Rate 1, Ladung 1 + Tempo
    assert.equal(C.actionRate(H({ haste: 1 })), 1); assert.equal(C.chargeStep(H({ haste: 0.5 })), 1.5);
    D.CFG.tempoMode = true;
    try {
      assert.equal(C.actionRate(H({ haste: 0.4 })), 1.4); assert.equal(C.actionRate(H({ haste: 1 })), 1.6 + 0.4 / 2, 'über 1,6 halbe Wirkung');
      assert.equal(C.actionRate(H({ haste: -0.9 })), 0.5, 'Untergrenze 0,5'); assert.equal(C.actionRate(foe({ haste: 1 })), 1, 'Gegner: Rate 1');
      assert.equal(C.chargeStep(H({ haste: 0.5 })), 1, 'Ladung je Aktion 1'); assert.equal(C.chargeStep(H({ slowCast: 0.3 })), 0.7, 'Eisgrab bremst nur die Ladung');
      // Rate 2 (Tempo 1,4: 1 + 1,4 = 2,4 → 1,6 + 0,8 / 2 = 2): Held handelt doppelt so oft, Doppelzüge markiert
      const r = C.fight(H({ haste: 1.4 }), foe());
      const na = r.log.filter(e => e.who === 'a' && e.dmg).length, nb = r.log.filter(e => e.who === 'b' && e.dmg).length;
      assert.ok(na >= 2 * nb - 1 && na <= 2 * nb + 2, `Held ${na} : Gegner ${nb}`); assert.ok(r.log.some(e => e.dbl === 2));
      assert.ok(na + nb <= 50, 'höchstens 50 Aktionen');
      // Gift auf dem Gegner: gleich viel je Kampfzeit, egal wie schnell der Held ist
      const tick = h => { const x = C.fight(H({ haste: h }), foe({ poisonDmg: 100 })); const t = x.log.filter(e => e.tk === 'poison').reduce((s, e) => s + e.tick, 0); return t / x.log.filter(e => e.who === 'b' && e.dmg).length; };
      assert.ok(Math.abs(tick(1.4) / tick(0) - 1) < 0.1, `Gift je Gegnerzug gleich (${tick(0).toFixed(0)} / ${tick(1.4).toFixed(0)})`);
      // Krit-Schwung: ein Krit-Hieb lädt den Zauber um 0,34, nie mehr je Aktion
      const met = { id: 'm', name: 'm', every: 40, kind: 'hit', mult: 1 };
      const c = C.fight(H({ crit: 1, critMult: 2, spells: [met] }), foe({ hp: 1e9 }));
      const steps = c.log.filter(e => e.who === 'a' && e.cA).map(e => e.cA[0]);
      assert.ok(steps.length > 3); for (let i = 1; i < steps.length; i++) assert.ok(steps[i] - steps[i - 1] <= (1 + 0.34) / 40 + 0.011, `Ladung je Aktion höchstens 1 + 0,34`); assert.ok(steps.some((v, i) => i && v - steps[i - 1] > 1 / 40 + 0.011), 'Krit lädt mit');
    } finally { D.CFG.tempoMode = false; }
  });
});

test('Glück-Beute L5: neutral beim Bezugswert (2 × Stufe + 10), mehr Glück → mehr Seltenes/Legendäres', () => {
  const mk = (seed0, o) => { let seed = seed0; const R = Math.random; Math.random = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    try { const c = {}; for (let i = 0; i < 6000; i++) { const r = makeItem(30, { luck: 90, ...o }).rarity; c[r] = (c[r] || 0) + 1; } return c; } finally { Math.random = R; } };
  assert.deepEqual(mk(5, { own: 70, hl: 30 }), mk(5, {}), 'eigenes Glück = Bezug (70 bei Stufe 30): genau wie ohne L5');
  const lo = mk(9, { own: 20, hl: 30 }), hi = mk(9, { own: 200, hl: 30 });
  assert.ok(hi.legendary > lo.legendary * 1.8 && hi.rare > lo.rare * 1.2, `legendär ${lo.legendary} → ${hi.legendary}, selten ${lo.rare} → ${hi.rare}`);
  assert.ok(Math.abs((hi.magic || 0) - (lo.magic || 0)) < 0.25 * lo.magic, 'magisch bleibt (nur über das Gesamtglück)');
});
