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
  S.gold = 1e6; while (Object.keys(G.baseMods(it)).length < 2) G.craft(it.id, 'add'); assert.ok(G.craft(it.id, 'add').err, 'magisch über 2 Boni');
  assert.ok(G.craft('gibtsnicht', 'add').err);
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
