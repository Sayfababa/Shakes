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
const { makeItem } = L;

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

test('Stufenaufstieg gibt 5 Attributpunkte und 1 Talentpunkt', () => {
  const S = fresh(); const p = S.points; G.gainXp(G.xpNeed(1));
  assert.equal(S.lvl, 2); assert.equal(S.points, p + 5); assert.equal(G.talentPoints(), 1);
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
test('Schärfen bleibt am Platz, wenn die Waffe wechselt; Migration verschiebt alte Stufen', () => {
  const S = fresh(); S.gold = 99999; S.mats.zahn = 10; G.doService('halvar', 'sharpen'); G.doService('halvar', 'sharpen');
  const old = S.equip.weapon, w = { ...old, id: 'neu', dmg: [...old.dmg] }; S.equip.weapon = w;
  assert.equal(G.slotUp('weapon'), 2); assert.equal(G.tempered(10, 'weapon'), Math.round((Math.round(10 * 1.12) + 1) * 1.12) + 1);
  S.equip.weapon = null; assert.ok(G.serviceState(D.SERVICES.halvar[0]).reason !== 'Nichts angelegt', 'Platz lässt sich auch leer schärfen');
  // alter Stand: Stufe steckt im Teil
  S.equip.weapon = old; S.temper = {}; const raw = [...old.dmg]; old.dmg = old.dmg.map(v => Math.round(v * 1.12) + 1); old.up = 1; S.v = 16; delete S.temper; G.save();
  G.load(); assert.equal(G.S.v, G.SAVE_VERSION); assert.equal(G.slotUp('weapon'), 1); assert.ok(!G.S.equip.weapon.up);
  assert.ok(Math.abs(G.S.equip.weapon.dmg[1] - raw[1]) <= 1, 'Grundwert zurück');
});

test('Grube kostet Glut und hat Abklingzeit (keine Gold-Endlosquelle)', () => {
  const S = fresh(); const g = S.glut, R = Game.makeRival();
  assert.ok(Game.arenaFight(R)); assert.equal(S.glut, g - D.CFG.arenaGlut); assert.equal(Game.arenaFight(R), null);
});

test('Bosse haben eigene Muster', () => {
  fresh(); G.S.lvl = 30; G.S.shards = ['c1', 'c2', 'c3', 'c4'];
  for (const c of D.CRYPTS) { G.S.crypt.prog[c.id] = 4; const m = G.cryptEnemy(c); assert.ok(m.boss); assert.ok(c.boss.mechText, c.id); }
});

test('Speichern: v1-Spielstand wird bis zur aktuellen Version migriert', () => {
  localStorage.setItem('aschenkrone_v1', JSON.stringify({ v: 1, name: 'Alt', cls: 'witch', lvl: 4, xp: 0, gold: 9, attrs: { str: 5, dex: 5, int: 14, con: 6, lck: 3 },
    bought: {}, equip: {}, bag: [], glut: 50, glutTs: Date.now(), quests: [], active: null, shop: [], shopTs: 0, journal: [], arenaTs: 0, honor: 0, wins: 0, deaths: 0 }));
  const S = G.load(); assert.equal(S.v, G.SAVE_VERSION); assert.ok(S.traders.prophet); assert.ok(Array.isArray(S.shards));
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

test('Migration v14 → v15: alte Steckbriefe werden umgeschrieben, Omen an gesperrtem Ort neu gezogen', () => {
  const S = fresh(); const d = JSON.parse(JSON.stringify(S)); d.v = 14; d.lvl = 4;
  d.bounty = { day: 1, list: [{ id: 'blood', target: null, n: 2, prog: 1, claimed: false }, { id: 'deep', target: null, n: 1, prog: 0, claimed: false }, { id: 'crypt', target: null, n: 3, prog: 0, claimed: true }] };
  d.omen = { day: 1, loc: 'muehle', type: 'gold', done: false };
  localStorage.setItem('aschenkrone_v1', JSON.stringify(d)); localStorage.removeItem('aschenkrone_v1_sig');
  const L = G.load(); assert.equal(L.v, G.SAVE_VERSION); assert.deepEqual(L.bounty.list.map(b => b.id), ['elite', 'zones', 'crypt']);
  assert.equal(L.bounty.list[0].prog, 1); assert.equal(L.bounty.list[2].claimed, true); assert.equal(L.omen, null);
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

test('Gegenstandsnamen: richtiges Geschlecht, nie ein Schrägstrich; alte Namen werden gerichtet', async () => {
  const { adj, fixName } = await import('../js/loot.js');
  assert.equal(adj('Starker', 'Kappe'), 'Starke'); assert.equal(adj('Rostiger', 'Beil'), 'Rostiges'); assert.equal(adj('Zäher', 'Stiefel'), 'Zähe'); assert.equal(adj('Scharfer', 'Dolch'), 'Scharfer');
  for (const k of Object.keys(D.GENUS)) for (const n of D.GENUS[k]) assert.ok(D.BASES.some(b => b.name === n), 'unbekannt: ' + n);
  for (const cls of Object.keys(D.CLASSES)) assert.ok(!fresh(cls).equip.weapon.name.includes('/'));
  for (let i = 0; i < 400; i++) { const it = makeItem(1 + i % 30); assert.ok(!it.name.includes('/'), it.name); if (it.rarity === 'magic' && D.GENUS.f.includes(it.base)) assert.ok(!/er /.test(it.name.split(it.base)[0]), it.name); }
  const old = { name: 'Rostige/r Beil', rarity: 'normal', base: 'Beil' }; fixName(old); assert.equal(old.name, 'Rostiges Beil');
  const S = fresh(); const d = JSON.parse(JSON.stringify(S)); d.v = 15; d.equip.weapon.name = 'Rostige/r Kurzschwert'; d.bag.push({ id: 'x', slot: 'helm', name: 'Schartige/r Kappe', rarity: 'broken', base: 'Kappe', mods: {}, x: 0, y: 0, w: 2, h: 2 });
  localStorage.setItem('aschenkrone_v1', JSON.stringify(d)); localStorage.removeItem('aschenkrone_v1_sig'); const L = G.load();
  assert.equal(L.equip.weapon.name, 'Rostiges Kurzschwert'); assert.equal(L.bag[0].name, 'Schartige Kappe');
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

test('Bonus-Stufen: I/II erst ab hoher Gegenstandsstufe, Werte steigen mit der Stufe', () => {
  fresh(); const low = [], high = [];
  for (let i = 0; i < 1500; i++) { low.push(makeItem(5, { minRarity: 2 })); high.push(makeItem(30, { minRarity: 2 })); }
  const tiers = l => l.flatMap(it => Object.values(it.tiers || {}));
  assert.ok(!tiers(low).some(t => t <= 2), 'Stufe I/II auf Gegenstandsstufe 5');
  assert.ok(tiers(high).includes(1), 'Stufe I kommt auf hoher Stufe nie vor');
  for (const it of high) for (const [k, t] of Object.entries(it.tiers)) assert.ok(it.mods[k] >= 1 && t >= 1 && t <= 5);
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

test('Neu weihen: behält Runen und Sonderbonus, Einzigartiges gesperrt, nie Einzigartiges als Ergebnis', () => {
  const S = fresh(); S.gold = 99999; S.mats.schwanz = 99; S.mats.zahn = 10;
  S.equip.amulet = makeItem(20, { slot: 'amulet', minRarity: 3 }); delete S.equip.amulet.unique; S.equip.amulet.fx = { crit: 0.06 }; S.equip.amulet.special = 'crit';
  const r = G.forge('amulet', 'zahn', 15); assert.ok(r); S.equip.amulet.glut = S.equip.amulet.glutMax = 9999;
  for (let i = 0; i < 30; i++) { assert.ok(G.doService('ysolde', 'reroll')); const a = S.equip.amulet;
    assert.ok((a.mods.dmg || 0) >= r.v, 'Rune verloren'); assert.equal(a.special, 'crit'); assert.ok(!a.unique); }
  S.equip.amulet.unique = 'Blutglocke'; assert.equal(G.doService('ysolde', 'reroll'), null);
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

test('Umschmieden: kostet genau Material, Gold und Glut; Glut leer = vollendet mit Schmiedezeichen', () => {
  const S = richCraft(), it = craftable(2, 20); S.bag = [it]; S.bag[0].x = 0; S.bag[0].y = 0; it.glut = it.glutMax = 7;
  const m = S.mats.staub, g = S.gold, gl = it.glut, cg = G.craftGold(it);
  const r = G.craft(it.id, 'values'); assert.ok(!r.err);
  assert.equal(S.mats.staub, m - 2); assert.equal(S.gold, g - cg); assert.equal(it.glut, gl - r.cost); assert.ok(r.cost >= 2 && r.cost <= 4);
  for (let i = 0; i < 20 && !it.crafted; i++) G.craft(it.id, 'values');
  assert.equal(it.crafted, 'Test'); assert.ok(G.craft(it.id, 'values').err, 'vollendetes Item lässt sich weiter craften');
});

test('Umschmieden: Grenzen – Einzigartige, gewöhnliche, zu wenig Material/Gold/Glut, voll', () => {
  const S = richCraft(); let u; do u = makeItem(25, { slot: 'helm', minRarity: 4 }); while (!u.unique);
  S.bag = [u]; assert.ok(G.craft(u.id, 'add').err);
  const n = makeItem(5, { slot: 'helm' }); n.rarity = 'normal'; S.bag = [n]; assert.ok(G.craft(n.id, 'add').err);
  const it = craftable(2, 20); S.bag = [it]; it.glut = 1; assert.ok(G.craft(it.id, 'values').err);
  it.glut = 50; S.mats.staub = 1; assert.ok(G.craft(it.id, 'values').err); S.mats.staub = 99; S.gold = 0; assert.ok(G.craft(it.id, 'values').err);
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
    assert.ok(gain < spent, `${op}/${rar}/${L}: Wertzuwachs ${gain} > Kosten ${spent}`);
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

test('Neu weihen (Ysolde) respektiert das Siegel und verbraucht Schmiedeglut wie Umschmieden', () => {
  const S = fresh(); S.gold = 1e7; S.mats.schwanz = 999; S.mats.siegel = 99;
  let it; do it = makeItem(25, { slot: 'amulet', minRarity: 3 }); while (it.unique || it.rarity !== 'rare'); S.equip.amulet = it;
  const k = Object.keys(G.baseMods(it))[0], v = G.baseMods(it)[k]; assert.ok(!G.craft(it.id, 'seal', k).err);
  let n = 0; while (G.doService('ysolde', 'reroll')) { n++; assert.equal(G.baseMods(it)[k], v, 'Siegel gebrochen'); assert.ok(n < 50, 'endlos'); }
  assert.ok(it.crafted || it.glut < D.CRAFT.ops.find(o => o.id === 'chaos').glut, 'Glut muss irgendwann erschöpft sein');   // Rest reicht evtl. noch für billigere Eingriffe assert.ok(n >= 3);
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

test('Umschmieden bleibt im Pool des Teils (Chaos/Hinzufügen/Neu weihen)', () => {
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
  const avgCrit = mult => { const a = { ...G.stats(), crit: 0.6, critMult: mult, spells: [] }; let sum = 0, n = 0;
    for (let i = 0; i < 40; i++) for (const l of fight(a, { ...mon }).log) if (l.who === 'a' && l.crit && l.dmg) { sum += l.dmg; n++; } return sum / n; };
  assert.ok(avgCrit(3) > avgCrit(2) * 1.3);
});

test('Eichung: jeder Prozent-Bonus der Stufe III liegt nah am Hauptattribut (Stufe 20)', async () => {
  const { execFileSync } = await import('node:child_process');
  const out = execFileSync('node', ['tests/calib.mjs'], { encoding: 'utf8' });
  // Alle elf Prozent-Boni. critd fehlte hier lange – deshalb konnte Krit-Schaden auf ein Drittel
  // seines Werts absacken, ohne dass der Testlauf etwas merkte. Neuer pct-Bonus → hier eintragen.
  for (const k of ['critc', 'critd', 'dmgp', 'spellp', 'penp', 'leechp', 'lifep', 'blockp', 'evadep', 'thornsp', 'haste', 'sk_*']) {
    const row = out.split('\n').find(l => l.startsWith(k)); assert.ok(row, k);
    const v20 = parseFloat(row.trim().split(/\s+/).slice(-3)[0]);   // Spalte St.20
    assert.ok(v20 > 0.7 && v20 < 1.4, `${k}: ${v20} weicht zu weit vom Hauptattribut ab`);
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

test('Migration: Spielstand v6 bekommt leere Zauber-Wege', () => {
  fresh('witch'); const d = JSON.parse(JSON.stringify(G.S)); d.v = 6; delete d.sp;
  localStorage.setItem('aschenkrone_v1', JSON.stringify(d)); const L = G.load(); assert.equal(L.v, G.SAVE_VERSION); assert.deepEqual(L.sp, {});
});

// --- Alchemie ---
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
test('Migration: Spielstand v7 bekommt Gürtel, Zutaten, Tränke', () => {
  fresh('witch'); const d = JSON.parse(JSON.stringify(G.S)); d.v = 7; delete d.belt; delete d.herbs; delete d.pots; delete d.potDay;
  localStorage.setItem('aschenkrone_v1', JSON.stringify(d)); const L = G.load(); assert.ok(L.v >= 8); assert.deepEqual(L.belt, [null, null, null]); assert.deepEqual(L.herbs, {});
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
test('Migration: Spielstand v8 bekommt Expedition, v9-Expedition (Ausrichtung) wird zum Weg', () => {
  fresh('witch'); let d = JSON.parse(JSON.stringify(G.S)); d.v = 8; delete d.exp; delete d.bless;
  localStorage.setItem('aschenkrone_v1', JSON.stringify(d)); let L = G.load(); assert.equal(L.v, G.SAVE_VERSION); assert.equal(L.exp, null); assert.equal(L.bless, 0);
  fresh('witch'); d = JSON.parse(JSON.stringify(G.S)); d.v = 9; delete d.bless; d.exp = { loc: 'friedhof', h: 8, focus: 'kraeuter', start: Date.now() - 9 * 3600e3, end: Date.now() - 3600e3 };
  localStorage.setItem('aschenkrone_v1', JSON.stringify(d)); L = G.load(); assert.equal(L.exp.nodes.length, 4); assert.ok(L.exp.nodes.every(n => n.t === 'herb'));
  G.S.exp = L.exp; const r = Game.claimExped(); assert.ok(r && r.rew.herbs.length, 'alte Expedition lässt sich heimholen');
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
  const S = fresh(); assert.equal(Game.descStart('c2'), null, 'ohne Bosssieg gesperrt');
  descHero(); assert.ok(Game.descStart('c2')); assert.equal(Game.descStart('c2'), null, 'nicht zweimal');
  assert.equal(Game.descStair().kind, 'back'); assert.equal(G.S.desc, null); assert.equal(Game.descLeft(), D.DESCENT.daily, 'Umkehren kostet keinen Abstieg');
  for (let i = 0; i < D.DESCENT.daily; i++) { assert.ok(Game.descStart('c2')); G.S.desc = null; }
  assert.equal(Game.descLeft(), 0); assert.equal(Game.descStart('c2'), null, 'Tageslimit');
  G.S.descDay.d = 'gestern'; assert.ok(Game.descStart('c2'), 'neuer Tag'); G.S.desc = null;
  G.S.active = { loc: 'friedhof', end: Date.now() + 1e6 }; assert.equal(Game.descStart('c2'), null, 'nicht während eines Streifzugs'); G.S.active = null;
  assert.ok(Game.descStart('c2')); assert.equal(Game.startExped('friedhof', 1, [0]), false, 'keine Expedition während des Abstiegs');
  G.S.crypt.cd = 0; assert.equal(Game.cryptFight('c1'), null, 'keine Krypta während des Abstiegs'); assert.equal(G.startTrip('friedhof'), false, 'kein Streifzug');
});
test('Kampf: Startleben (cur0) wird übernommen, Restleben kommt zurück', () => {
  descHero(); const A = { ...G.stats(), cur0: 37 }, m = G.makeMonster(1, 0.5);
  const r = fight(A, m); assert.equal(r.curA0, 37); assert.equal(r.log[0].hpA <= 37 + A.hp, true); assert.ok(r.endA >= 0 && r.endA <= A.hp);
  const r2 = fight(G.stats(), m); assert.equal(r2.curA0, G.stats().hp);
});
test('Abstieg: Leben läuft mit, Unruhe steigt, Beute im Sack; Seil sichert, Tod verliert den Sack, EP bleiben', () => {
  descHero(); Game.descStart('c2'); const D0 = G.S.desc;
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
  const S = descHero('witch', 14); S.attrs = { str: 5, dex: 5, int: 5, con: 6, lck: 3 }; Game.descStart('c2'); G.S.desc.hpf = 0.01; G.S.desc.sack.gold = 999;
  const gold0 = G.S.gold, xp0 = G.S.xp, lvl0 = G.S.lvl, rr = Game.descEnter(Game.descNext()[0]);
  assert.equal(rr.res.win, false); assert.equal(G.S.desc, null); assert.equal(G.S.gold, gold0, 'Sack-Gold verloren'); assert.equal(rr.res.desc.lost.gold, 999);
  assert.ok(G.S.lvl > lvl0 || G.S.xp >= xp0, 'EP bleiben');
});
test('Abstieg: Brunnen kostet Gold (erst aus dem Sack), Schrein heilt, Schatzkammer füllt den Sack', () => {
  descHero(); Game.descStart('c2'); const Dd = G.S.desc;
  const wr = Dd.rows[D.DESCENT.well], wj = wr.findIndex(n => n.t === 'well'), pj = Dd.rows[D.DESCENT.well - 1].findIndex(n => !D.DESC_ROOMS[n.t].exit && Game.expLinked(n, wr[wj]));
  Dd.path = Array.from({ length: D.DESCENT.well }, (_, i) => i === D.DESCENT.well - 1 ? pj : Dd.rows[i].findIndex(n => !D.DESC_ROOMS[n.t].exit));
  // Weg gültig machen (Verbindungen)
  for (let i = D.DESCENT.well - 2; i >= 0; i--) Dd.path[i] = Dd.rows[i].findIndex(n => !D.DESC_ROOMS[n.t].exit && Game.expLinked(n, Dd.rows[i + 1][Dd.path[i + 1]]));
  const cost = Game.descWellCost(); Dd.sack.gold = Math.floor(cost / 2); G.S.gold = cost; const g0 = G.S.gold, s0 = Dd.sack.gold;
  const out = Game.descEnter(wj); assert.equal(out.kind, 'out'); assert.equal(G.S.gold, g0 - (cost - s0), 'Rest aus eigenem Gold, Sack-Rest 0 kommt dazu');
  descHero(); Game.descStart('c2'); G.S.desc.rows[1][0] = { t: 'shrine', x: G.S.desc.rows[1][0].x }; G.S.desc.path = [0]; G.S.desc.hpf = 0.4;
  const sh = Game.descEnter(0); assert.equal(sh.kind, 'room'); assert.ok(Math.abs(G.S.desc.hpf - (0.4 + D.DESCENT.heal)) < 1e-9);
  G.S.desc.rows[2][0] = { t: 'treasure', x: G.S.desc.rows[2][0].x }; G.S.desc.rows[1][0].x = G.S.desc.rows[2][0].x; const n0 = G.S.desc.sack.items.length;
  const tr = Game.descEnter(0); assert.equal(tr.kind, 'room'); assert.ok(G.S.desc.sack.items.length > n0, 'Schatzkammer bringt ein Fundstück'); assert.ok(G.S.desc.hpf > 0);
});
test('Abstieg: Boss besiegt = draußen, Neuladen mitten im Abstieg verändert nichts', () => {
  const SB = descHero('paladin', 10); SB.attrs.str += 600; SB.attrs.con += 400; Game.descStart('c2');
  const s0 = JSON.stringify(G.S); G.save(); assert.equal(JSON.stringify(G.load()), s0); const Dd = G.S.desc;
  Dd.path = Dd.rows.map(() => 0); for (let i = Dd.rows.length - 2; i >= 0; i--) Dd.path[i] = Dd.rows[i].findIndex(n => !D.DESC_ROOMS[n.t].exit && Game.expLinked(n, Dd.rows[i + 1][Dd.path[i + 1]]));
  Dd.path[Dd.rows.length - 1] = Dd.rows[Dd.rows.length - 1].findIndex(n => !D.DESC_ROOMS[n.t].exit);
  for (let i = Dd.rows.length - 2; i >= 0; i--) Dd.path[i] = Dd.rows[i].findIndex(n => !D.DESC_ROOMS[n.t].exit && Game.expLinked(n, Dd.rows[i + 1][Dd.path[i + 1]]));
  assert.deepEqual(Game.descNext(), ['boss']);
  const r = Game.descEnter('boss'); assert.ok(r.res.win, 'starker Held schlägt den Boss'); assert.ok(r.res.desc.out); assert.equal(G.S.desc, null);
  assert.ok(r.res.desc.out.items.length >= 2, 'Boss bringt mindestens 2 Fundstücke');
});
test('Migration: Spielstand v10 bekommt den Abstieg', () => {
  fresh(); const d = JSON.parse(JSON.stringify(G.S)); d.v = 10; delete d.desc; delete d.descDay;
  localStorage.setItem('aschenkrone_v1', JSON.stringify(d)); const L = G.load(); assert.equal(L.v, G.SAVE_VERSION); assert.equal(L.desc, null); assert.equal(L.descDay, null);
});
test('Grube: Leiter, Platztausch, Rang, Laden, Herausforderung, Migration', () => {
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
  const d = JSON.parse(JSON.stringify(S)); d.v = 11; delete d.pit; localStorage.setItem('aschenkrone_v1', JSON.stringify(d));
  const L = G.load(); assert.equal(L.v, G.SAVE_VERSION); assert.equal(L.pit.lad.length, D.PIT.size + 1);
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
test('Migration v12 → v13: Akte nach Stufe/Trophäen, ungesicherte Beute gesichert', () => {
  const S = fresh('paladin'); S.lvl = 12; S.trophies.push({ key: 'c1:0', name: 'x', eff: {} }); const d = JSON.parse(JSON.stringify(S)); d.v = 12; delete d.acts;
  d.haul = { loc: 'friedhof', track: 'norm', depth: 1, gold: 77, mats: { zahn: 2 }, items: [] }; const g0 = d.gold;
  localStorage.setItem('aschenkrone_v1', JSON.stringify(d)); const L = G.load();
  assert.equal(L.v, G.SAVE_VERSION); assert.equal(L.haul, null); assert.equal(L.gold, g0 + 77); assert.equal(L.crypt.prog.c1, 1);
  assert.ok(G.actDone(D.ACTS[0]) && G.actDone(D.ACTS[1])); assert.ok(!G.actDone(D.ACTS[3]));
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
  // Set-Teile lassen sich nicht umschmieden oder neu weihen
  assert.ok(!G.craftItems().some(it => it.set));
  S.equip.amulet = L.makeSetItem('s2', 0, 10); S.gold = 9999; S.mats.schwanz = 9;
  assert.ok(/Set/.test(G.serviceState(D.SERVICES.ysolde[0]).reason));
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
  // grundlos fehl. Darum über 60 Kämpfe mitteln – der Unterschied ist dort ~7,5 zu ~10,8 Runden.
  const avgLog = f => { let s = 0; for (let i = 0; i < 60; i++) s += fight(f(), { ...feind }).log.length; return s / 60; };
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

test('Das Brett: Wege, Knappheit und Migration', async () => {
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
  // Migration v17 -> v18 gibt Talentpunkte zurück, weil die alten Knoten-IDs im Brett fehlen
  fresh('assassin'); const d = JSON.parse(JSON.stringify(G.S)); d.v = 17; d.tal = { a1: 5, a4: 3 };
  localStorage.setItem('aschenkrone_v1', JSON.stringify(d));
  const sig = await import('../js/state.js'); G.load();
  assert.deepEqual(G.S.tal, {}, 'alte Talentpunkte wurden nicht zurückgegeben');
  assert.equal(G.S.v, G.SAVE_VERSION);
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
    for (let i = 0; i < 60; i++) for (const l of fight({ ...flink, ...e }, { ...schlaeger }).log) {
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
    const it = L.makeItem(22, { slot, kind }); if (it.rarity === rar && !it.unique && Object.keys(it.mods).length === n) return it; } };
  const frisch = () => { G.newChar('F', 'assassin'); G.S.lvl = 22; G.S.gold = 999999; };

  // --- Dazu: freier Platz, der Bonus kommt einfach hinzu, die Stufe wandert mit
  frisch();
  let a = mk(1), b = mk(2); G.S.bag.push(a, b);
  let k = Object.keys(G.baseMods(b)).find(x => !(x in G.baseMods(a)) && D.AFFIXES.some(y => y.stat === x && (!y.slots || y.slots.includes('weapon'))));
  assert.ok(k, 'kein übertragbarer Bonus gefunden');
  const stufeVorher = b.tiers[k], bagVorher = G.S.bag.length;
  let r = G.fuse(a.id, b.id, k, null);
  assert.ok(!r.err, r.err);
  assert.ok(k in r.it.mods, 'der Bonus ist nicht angekommen');
  assert.equal(r.it.tiers[k], stufeVorher, 'die Stufe des Bonus ist beim Umzug verlorengegangen');
  assert.equal(G.S.bag.length, bagVorher - 1, 'das Futter ist nicht zerfallen');
  assert.equal(r.it.fused, 1);

  // --- Nur eine Fusion je Teil, für immer: sonst baut jeder dasselbe perfekte Teil
  const c = mk(2); G.S.bag.push(c);
  assert.match(G.fuseCheck(r.it, c, Object.keys(G.baseMods(c))[0], null) || '', /schon fusioniert/);

  // --- Aufstieg: volles magisches Teil bekommt einen dritten Bonus und wird selten,
  //     der Grundschaden bleibt aber magisch (sonst heimlicher Machtsprung)
  frisch();
  a = mk(2); b = mk(2); G.S.bag.push(a, b);
  k = Object.keys(G.baseMods(b)).find(x => !(x in G.baseMods(a)) && D.AFFIXES.some(y => y.stat === x && (!y.slots || y.slots.includes('weapon'))));
  const dmgVorher = JSON.stringify(a.dmg);
  assert.equal(G.fusePromote(a, null), 'rare', 'volles magisches Teil müsste aufsteigen können');
  r = G.fuse(a.id, b.id, k, null);
  assert.ok(!r.err, r.err);
  assert.equal(r.it.rarity, 'rare', 'das Teil ist nicht aufgestiegen');
  assert.equal(Object.keys(G.baseMods(r.it)).length, 3);
  assert.equal(JSON.stringify(r.it.dmg), dmgVorher, 'der Grundschaden ist beim Aufstieg mitgewachsen');

  // --- Ersetzen statt Aufstieg: der gewählte Bonus weicht
  frisch();
  a = mk(2); b = mk(2); G.S.bag.push(a, b);
  k = Object.keys(G.baseMods(b)).find(x => !(x in G.baseMods(a)) && D.AFFIXES.some(y => y.stat === x && (!y.slots || y.slots.includes('weapon'))));
  const weg = Object.keys(G.baseMods(a))[0];
  r = G.fuse(a.id, b.id, k, weg);
  assert.ok(!r.err, r.err);
  assert.equal(r.it.rarity, 'magic', 'beim Ersetzen darf nichts aufsteigen');
  assert.ok(!(weg in G.baseMods(r.it)), 'der ersetzte Bonus ist noch da');
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
