// Fuzz-Test: spielt viele zufällige, legale Spielzüge (wie ein wild tippender Spieler) und prüft nach JEDEM Zug,
// dass der Spielstand heil ist. Aufruf: node tests/fuzz.mjs [züge] [läufe]
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
const D = await import('../js/data.js');
const G = await import('../js/state.js');
const Q = await import('../js/quests.js');
const Game = await import('../js/game.js');
const { makeItem } = await import('../js/loot.js');

const STEPS = +process.argv[2] || 3000, RUNS = +process.argv[3] || 6;
let clock = Date.now(); Date.now = () => clock;          // Zeit läuft simuliert (Glut, Streifzüge, Abklingzeiten)
const pick = a => a[Math.floor(Math.random() * a.length)];
const errors = new Map();
const fail = (msg, act) => { const k = msg.split(':')[0]; if (!errors.has(k)) errors.set(k, { msg, act, n: 0 }); errors.get(k).n++; };

function check(act) {
  const S = G.S, f = (v, n) => { if (typeof v !== 'number' || !Number.isFinite(v)) fail(`${n} ist keine Zahl: ${v}`, act); };
  f(S.gold, 'Gold'); if (S.gold < 0) fail(`Gold negativ: ${S.gold}`, act);
  f(S.glut, 'Glut'); if (S.glut < 0 || S.glut > D.CFG.maxGlut) fail(`Glut außerhalb: ${S.glut}`, act);
  if (!Number.isInteger(S.lvl) || S.lvl < 1) fail(`Stufe kaputt: ${S.lvl}`, act);
  f(S.xp, 'EP'); if (S.xp < 0 || S.xp >= G.xpNeed(S.lvl)) fail(`EP außerhalb: ${S.xp}/${G.xpNeed(S.lvl)}`, act);
  if (S.points < 0) fail(`Punkte negativ`, act); if (G.talentPoints() < 0) fail(`Talentpunkte negativ`, act);
  for (const [k, n] of Object.entries(S.mats)) if (!Number.isInteger(n) || n < 0) fail(`Material ${k}: ${n}`, act);
  for (const [k, v] of Object.entries(S.attrs)) if (!Number.isInteger(v) || v < 1) fail(`Attribut ${k}: ${v}`, act);
  // Items: keine Doppelten, Raster ohne Überlappung, Werte heil
  const all = [...S.bag, ...Object.values(S.equip).filter(Boolean)], ids = new Set();
  for (const t of Object.values(S.traders)) for (const it of t.shop || []) if (ids.has(it.id)) fail(`Ladenitem doppelt`, act); else ids.add(it.id);
  for (const it of all) {
    if (ids.has(it.id)) fail(`Item doppelt (Duplizierung!): ${it.name}`, act); ids.add(it.id);
    for (const [k, v] of Object.entries(it.mods || {})) if (!Number.isFinite(v) || v < 1) fail(`Bonus ${k}=${v} auf ${it.name}`, act);
    for (const k of Object.keys(it.tiers || {})) if (!(k in it.mods)) fail(`Stufe ohne Bonus: ${k}`, act);
    if (it.glutMax != null && (it.glut < 0 || it.glut > it.glutMax)) fail(`Schmiedeglut außerhalb: ${it.glut}/${it.glutMax}`, act);
    if ((it.runes?.length || 0) > D.FORGE.maxRunes) fail(`Zu viele Runen`, act);
    if (!Number.isFinite(it.value) || it.value < 0) fail(`Wert kaputt: ${it.value}`, act);
    if (it.dmg && !(it.dmg[0] <= it.dmg[1])) fail(`Schaden min>max: ${it.dmg}`, act);
    if (it.sealed && !(it.sealed in G.baseMods(it))) fail(`Siegel auf fehlendem Bonus`, act);
    if (!it.unique) for (const k of Object.keys(it.tiers || {})) { const af = D.AFFIXES.find(x => x.stat === k);
      if (!af) fail(`Unbekannter Bonus ${k}`, act); else if ((af.slots && !af.slots.includes(it.slot)) || (af.kind && af.kind !== it.kind)) fail(`Bonus ${k} auf falschem Teil ${it.slot}`, act); }
  }
  for (const a of S.bag) {
    if (a.x < 0 || a.y < 0 || a.x + a.w > D.INV_W || a.y + a.h > D.INV_H) fail(`Item außerhalb des Beutels`, act);
    for (const b of S.bag) if (a !== b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) fail(`Beutel-Überlappung`, act);
  }
  for (const [slot, it] of Object.entries(S.equip)) if (it && it.slot !== (slot.startsWith('ring') ? 'ring' : slot)) fail(`Falscher Platz: ${it.slot} in ${slot}`, act);
  const st = G.stats(); for (const k of ['hp', 'armor', 'crit', 'critMult', 'amp']) f(st[k], 'Wert ' + k); if (st.crit > D.CAPS.crit + 1e-9 || st.critMult > D.CAPS.critMult + 1e-9) fail('Obergrenze überschritten', act); f(st.dmg[0], 'Schaden'); if (st.hp <= 0) fail(`Leben ≤ 0`, act);
  f(G.power(), 'Kampfkraft');
  if (S.haul) { f(S.haul.gold, 'Beute-Gold'); if (S.haul.gold < 0) fail('Beute negativ', act); }
  for (const t of Object.keys(S.traders)) if (S.traders[t].q > D.QUESTS[t].length) fail(`Questindex zu hoch ${t}`, act);
  // Speichern/Laden ergibt exakt denselben Stand und gilt nicht als verändert
  const before = JSON.stringify(S); G.save(); const L = G.load();
  if (JSON.stringify(L) !== before) fail('Speichern/Laden verändert den Spielstand', act);
  if (L.tampered) fail('Eigener Spielstand gilt als verändert', act);
}

const actions = {
  trip: () => { const l = pick(D.LOCATIONS.filter(G.locOpen)); G.startTrip(l.id, pick(['safe', 'norm', 'blood'])); },
  resolve: () => { if (G.S.active) { G.S.active.end = 0; Game.resolveTrip(); } },
  delve: () => Game.delve(),
  bank: () => Game.bank(),
  rush: () => { const c = G.rushCost(); if (G.S.active && G.S.gold >= c) { G.S.gold -= c; G.S.active.end = clock; } },
  crypt: () => { G.S.crypt.cd = 0; Game.cryptFight(pick(D.CRYPTS).id); },
  arena: () => { G.S.arenaTs = 0; Game.arenaFight(Game.makeRival()); },
  champ: () => { G.S.arenaTs = 0; Game.champFight(pick(D.GIVERS)); },
  buy: () => { const t = pick(Object.keys(D.TRADERS)), shop = G.shopFor(t), it = pick(shop); if (!it || G.S.gold < it.price) return;
    const b = { ...it }; delete b.price; if (G.addToBag(b)) { G.S.gold -= it.price; shop.splice(shop.indexOf(it), 1); } },
  sell: () => { const it = pick(G.S.bag); if (it) G.sell(it.id); },
  equip: () => { const it = pick(G.S.bag); if (it) G.equip(it.id); },
  unequip: () => G.unequip(pick(Object.keys(G.S.equip))),
  sort: () => G.sortBag(),
  attr: () => G.addAttr(pick(Object.keys(D.ATTRS))),
  learn: () => G.learn(Math.floor(Math.random() * 3), Math.floor(Math.random() * 4)),
  respec: () => { if (Math.random() < 0.05) G.respec(); },
  service: () => { const t = pick(Object.keys(D.SERVICES)); G.doService(t, pick(D.SERVICES[t]).id); },
  forge: () => G.forge(pick(Object.keys(G.S.equip)), pick(Object.keys(D.RUNES)), Math.floor(Math.random() * 16)),
  craft: () => { const it = pick(G.craftItems()); if (!it) return; const op = pick(D.CRAFT.ops).id; G.craft(it.id, op, pick(Object.keys(it.mods || {}))); },
  bounty: () => G.claimBounty(Math.floor(Math.random() * 3)),
  quest: () => { for (const t of D.GIVERS) if (Q.canComplete(t)) Q.complete(t, Q.current(t).choice ? pick(Q.current(t).choice).id : undefined); },
  wait: () => { clock += Math.floor(Math.random() * 3600e3); G.tickGlut(); },
  day: () => { clock += 86400e3; G.tickGlut(); },
  gift: () => { if (Math.random() < 0.1) { for (const k of Object.keys(D.MATS)) G.addMat(k, 3); G.S.gold += 500; } },   // Material/Gold, damit seltene Wege vorkommen
  loot: () => { if (Math.random() < 0.2) G.addToBag(makeItem(G.S.lvl, { minRarity: Math.floor(Math.random() * 5) })); },
};
const names = Object.keys(actions);

let crashes = 0;
for (let r = 0; r < RUNS; r++) {
  localStorage._d = {}; const cls = Object.keys(D.CLASSES)[r % 6]; G.newChar('Fuzz' + r, cls); G.S.tut = 99;
  if (r % 2) { G.S.lvl = 18 + r * 2; G.S.points = 5 + (G.S.lvl - 1) * 5; G.S.gold = 5000; G.S.shards = ['c1', 'c2', 'c3', 'c4'].slice(0, r % 5); }   // auch späte Spielphasen prüfen
  for (let i = 0; i < STEPS; i++) {
    const a = pick(names);
    try { actions[a](); } catch (e) { crashes++; fail(`Absturz in ${a}: ${e.message}`, a); }
    try { check(a); } catch (e) { fail(`Prüfung abgestürzt nach ${a}: ${e.message}`, a); }
  }
  console.log(`Lauf ${r + 1} (${cls}): Stufe ${G.S.lvl}, Gold ${G.S.gold}, Quests ${Object.values(G.S.traders).reduce((a, t) => a + t.q, 0)}, Items ${G.S.bag.length}`);
}
if (errors.size) { console.log('\nPROBLEME:'); for (const [, e] of errors) console.log(`- ${e.msg}  (nach „${e.act}“, ${e.n}×)`); process.exit(1); }
console.log(`\nKeine Probleme in ${STEPS * RUNS} zufälligen Zügen.`);
