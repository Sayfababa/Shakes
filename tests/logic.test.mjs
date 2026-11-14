// Logik-Tests ohne Browser: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k]; }, setItem(k, v) { this._d[k] = v; }, removeItem(k) { delete this._d[k]; } };

const D = await import('../js/data.js');
const G = await import('../js/state.js');
const Q = await import('../js/quests.js');
const Game = await import('../js/game.js');
const { fight } = await import('../js/combat.js');
const { makeItem } = await import('../js/loot.js');

const fresh = (cls = 'paladin') => { G.newChar('Test', cls); G.S.tut = 99; return G.S; };

test('Daten: jedes Monster, jeder Boss hat ein Bild', async () => {
  const fs = await import('node:fs');
  for (const g of [...D.MONSTERS.map(m => m.glyph), ...D.CRYPTS.map(c => c.boss.glyph).filter(g => g !== 'self')])
    assert.ok(fs.existsSync(`assets/monsters/${g}.jpg`), `fehlt: ${g}`);
  for (const b of D.BASES) assert.ok(fs.existsSync(`assets/items/${b.art}.webp`), `Item-Bild fehlt: ${b.art}`);
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
  G.doService('halvar', 'sharpen'); assert.ok(S.equip.weapon.dmg[1] > d0); assert.equal(S.equip.weapon.up, 1); assert.equal(S.mats.zahn, 8);
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
