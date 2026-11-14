import { CLASSES, CFG, CRYPTS, TALENTS, LOCATIONS, MATS, MONSTERS } from './data.js';
import * as G from './state.js';
import * as Q from './quests.js';
import { fight } from './combat.js';
import { makeItem } from './loot.js';
import { pick, roll, chance } from './rng.js';
import * as UI from './ui.js';

const app = document.getElementById('app'), tip = document.getElementById('tip');
let view = 'hero', pickCls = null, F = null, rival = null, fightTimer = null, trader = 'halvar', turnin = null;

function render() {
  const S = G.S;
  if (!S) { app.innerHTML = `<main>${UI.viewCreate(pickCls)}</main>`; return; }
  G.tickGlut();
  const views = {
    fight: () => UI.viewFight(F), trips: UI.viewTrips, stats: UI.viewStats, talents: UI.viewTalents, crypt: UI.viewCrypts,
    traders: () => turnin ? UI.viewTurnin(turnin, trader) : UI.viewTrader(trader),
    arena: () => UI.viewArena(rival ||= makeRival()), hero: UI.viewHero,
  };
  if (view === 'fight' && !F) view = 'hero';
  app.innerHTML = UI.hud() + `<main>${(views[view] || views.hero)()}</main>` + UI.navBar(view === 'fight' ? F.back : view);
  const log = document.getElementById('log'); if (log) log.scrollTop = log.scrollHeight;
  G.save();
}

// Gegnerischer "Verdammter" für die Grube
function makeRival() {
  const S = G.S, cls = pick(Object.keys(CLASSES)), c = CLASSES[cls], lvl = Math.max(1, S.lvl + roll(-1, 1));
  const p = { name: pick(['Morgrim', 'Asha die Blasse', 'Kel Varn', 'Ysra', 'Brann', 'Oswin der Stumme', 'Mireth', 'Draven']), cls, lvl,
    attrs: { str: 5, dex: 5, int: 5, con: 6, lck: 3 }, equip: {}, tal: {}, trophies: [] };
  for (const k in p.attrs) p.attrs[k] += Math.round((lvl - 1) * (k === c.main ? 3 : k === 'con' ? 1.6 : 0.2));
  for (let i = 0; i < lvl - 1; i++) { const t = TALENTS[cls][roll(0, 2)].nodes, n = t.find(x => (p.tal[x.id] || 0) < x.max); if (n) p.tal[n.id] = (p.tal[n.id] || 0) + 1; }
  for (const s of ['weapon', 'chest', 'helm', 'boots']) p.equip[s] = makeItem(lvl, { slot: s, cls: c });
  return p;
}

function startFight(A, B, back, onEnd) {
  const r = fight(A, B);
  F = { A, B, ...r, step: 0, back };
  F.reward = onEnd(r.winner === 'a');
  view = 'fight'; G.save();
  clearInterval(fightTimer);
  fightTimer = setInterval(() => { F.step++; if (F.step >= F.log.length) clearInterval(fightTimer); render(); }, 380);
  render();
}

const lootLine = it => it ? `<br>Beute: <span class="r-${it.rarity}">${it.name}</span>` : '';
const lvlLine = up => up ? `<br><b class="hot">Stufe ${G.S.lvl}! +${up * CFG.attrPerLevel} Attributpunkte, +${up} Talentpunkt</b>` : '';
function dropMat(m) { if (m.mat && chance(CFG.matChance)) { const n = m.boss ? 3 : 1; G.addMat(m.mat, n); return `<br>${MATS[m.mat]} ×${n}`; } return ''; }
function dropItem(lvl, p, minRarity = 0) {
  if (!chance(p)) return null;
  const it = makeItem(lvl, { luck: G.stats().lck, cls: CLASSES[G.S.cls], minRarity });
  return G.addToBag(it) ? it : (G.S.gold += it.value, { ...it, name: it.name + ' (Beutel voll – verkauft)' });
}

const actions = {
  pick: d => { pickCls = d.c; render(); setTimeout(() => document.getElementById('nm')?.focus()); },
  create: () => { const n = document.getElementById('nm').value.trim() || 'Namenloser'; G.newChar(n, pickCls);
    G.journal(`${n} erwacht im Grab. Drei Gestalten warten am Friedhofstor.`); view = 'traders'; render(); },
  wipe: () => { if (confirm('Charakter wirklich vernichten?')) { G.wipe(); pickCls = null; render(); } },
  go: d => { view = d.v; turnin = null; if (view !== 'fight') { F = null; clearInterval(fightTimer); } render(); },
  attr: d => { G.addAttr(d.k); render(); },
  learn: d => { if (G.learn(+d.b, +d.t)) render(); },
  respec: () => { const c = G.respecCost(); if (confirm(c ? `Für ${c} Gold alle Attribute und Talente zurücksetzen?` : 'Attribute und Talente zurücksetzen? (einmalig gratis)')) { G.respec(); render(); } },
  equip: d => { if (!G.equip(d.id)) alert('Kein Platz im Beutel.'); render(); },
  unequip: d => { G.unequip(d.s); render(); },
  sell: d => { G.sell(d.id); render(); },
  sort: () => { G.sortBag(); render(); },
  trader: d => { trader = d.t; turnin = null; view = 'traders'; render(); },
  buy: d => { const S = G.S, shop = S.traders[d.t].shop, i = shop.findIndex(x => x.id === d.id), it = shop[i];
    if (!it || S.gold < it.price) return;
    const bought = { ...it }; delete bought.price;
    if (!G.addToBag(bought)) return alert('Kein Platz im Beutel.');
    S.gold -= it.price; shop.splice(i, 1); render(); },
  turnin: d => { const r = Q.complete(d.t); if (r) { turnin = r; render(); } },
  trip: d => { if (G.startTrip(d.id)) render(); },
  rush: () => { const S = G.S; if (S.gold >= 1) { S.gold -= 1; S.active.end = Date.now(); } render(); },
  resolve: () => {
    const S = G.S, a = S.active, l = LOCATIONS.find(x => x.id === a.loc);
    const m = G.makeMonster(G.locLvl(l), a.diff, MONSTERS.find(x => x.name === a.mob));
    startFight(G.stats(), m, 'trips', win => {
      S.active = null;
      if (!win) { S.deaths++; G.journal(`${m.name} in ${l.name} hat mich zerrissen.`); return 'Die Asche spuckt dich wieder aus.'; }
      S.wins++; Q.event({ type: 'kill', mob: m.name, loc: l.id });
      const r = G.tripReward(l, a.diff, a.sec); S.gold += r.gold; const up = G.gainXp(r.xp);
      const mat = dropMat(m), it = dropItem(m.lvl, CFG.lootChance);
      G.journal(`${m.name} in ${l.name} erschlagen.`);
      return `+${r.gold} Gold · +${r.xp} EP${mat}${lootLine(it)}${lvlLine(up)}`;
    });
  },
  crypt: d => {
    const S = G.S, c = CRYPTS.find(x => x.id === d.id); if (!c || Date.now() < S.crypt.cd) return;
    const m = G.cryptEnemy(c), boss = !!m.boss;
    S.crypt.cd = Date.now() + CFG.cryptCdSec * 1000;
    startFight(G.stats(), m, 'crypt', win => {
      if (!win) { S.deaths++; G.journal(`${m.name} in ${c.name} hat mich niedergestreckt.`); return 'Die Krypta behält dich. Diesmal.'; }
      S.wins++; Q.event({ type: 'kill', mob: m.name }); if (boss) Q.event({ type: 'boss', crypt: c.id });
      const r = G.cryptWin(c), gold = Math.round((10 + m.lvl * 5) * (boss ? 4 : 1)), xp = Math.round((25 + m.lvl * 14) * (boss ? 3 : 1.2));
      S.gold += gold; const up = G.gainXp(xp);
      const mat = dropMat(m), it = dropItem(m.lvl, boss ? 1 : 0.35, boss ? 3 : 2);
      G.journal(boss ? `${m.name} ist gefallen. ${c.name} schweigt.` : `${m.name} in ${c.name} erschlagen.`);
      return `+${gold} Gold · +${xp} EP${mat}${lootLine(it)}${lvlLine(up)}${r.trophy ? `<br><b class="r-legendary">Trophäe: ${r.trophy.name}</b>` : ''}${r.diffUp ? `<br><b class="hot">${r.diffUp} erwacht.</b>` : ''}`;
    });
  },
  rival: () => { rival = makeRival(); render(); },
  arena: () => {
    const S = G.S; if (Date.now() < S.arenaTs) return;
    const R = rival; rival = null; S.arenaTs = Date.now() + 60000;
    startFight(G.stats(), G.stats(R), 'arena', win => {
      if (win) { S.gold += R.lvl * 3; S.honor += 10; S.wins++; Q.event({ type: 'arena' }); G.journal(`${R.name} in der Grube besiegt.`); return `+${R.lvl * 3} Gold · +10 Ehre`; }
      S.honor = Math.max(0, S.honor - 5); S.deaths++; return '−5 Ehre';
    });
  },
  noop: () => {},
  skip: () => { F.step = F.log.length; clearInterval(fightTimer); render(); },
};

// --- Eingabe ---
const TOUCH = matchMedia('(hover: none)').matches;
const ACT_LABEL = { equip: 'Anlegen', unequip: 'Ablegen', buy: 'Kaufen', sell: 'Verkaufen' };
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) { if (!e.target.closest('#tip')) hideTip(); return; }
  if (TOUCH && el.dataset.tip && !el.closest('#tip')) return showTouchTip(el);
  hideTip();
  actions[el.dataset.action]?.(el.dataset);
});
function showTouchTip(el) {
  const it = findItem(el.dataset.tip); if (!it) return;
  const d = el.dataset, a = d.action, attrs = Object.entries(d).filter(([k]) => k !== 'tip').map(([k, v]) => `data-${k}="${v}"`).join(' ');
  let btns = `<button ${attrs}>${ACT_LABEL[a] || 'OK'}</button>`;
  if (a === 'equip') btns += `<button class="red" data-action="sell" data-id="${it.id}">Verkaufen · ${it.value}</button>`;
  tip.innerHTML = UI.itemTip(it, compareTo(it)) + `<div class="act">${btns}<button data-action="noop">Zurück</button></div>`;
  tip.className = 'touch'; tip.hidden = false;
  tip.style.left = Math.max(8, (innerWidth - tip.offsetWidth) / 2) + 'px';
  tip.style.top = Math.max(8, (innerHeight - tip.offsetHeight) / 2) + 'px';
}
function compareTo(it) {
  const S = G.S; if (Object.values(S.equip).includes(it)) return null;
  return it.slot === 'ring' ? (S.equip.ring1 || S.equip.ring2) : S.equip[it.slot];
}
app.addEventListener('contextmenu', e => { const el = e.target.closest('[data-action="equip"]'); if (el) { e.preventDefault(); actions.sell(el.dataset); } });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && document.getElementById('nm') && pickCls) actions.create(); });

function findItem(id) {
  const S = G.S; if (!S) return null;
  const shops = Object.values(S.traders).flatMap(t => t.shop);
  return [...S.bag, ...shops, ...Object.values(S.equip).filter(Boolean), ...(rival ? Object.values(rival.equip) : [])].find(x => x.id === id);
}
function hideTip() { tip.hidden = true; tip.className = ''; }
app.addEventListener('mousemove', e => {
  if (TOUCH) return;
  const el = e.target.closest('[data-tip]'); if (!el) return hideTip();
  const it = findItem(el.dataset.tip); if (!it) return hideTip();
  tip.innerHTML = UI.itemTip(it, compareTo(it)); tip.hidden = false;
  tip.style.left = Math.min(e.clientX + 16, innerWidth - tip.offsetWidth - 8) + 'px';
  tip.style.top = Math.min(e.clientY + 16, innerHeight - tip.offsetHeight - 8) + 'px';
});
app.addEventListener('mouseleave', hideTip);

// Countdown-Takt
setInterval(() => {
  const S = G.S; if (!S || !tip.hidden) return;
  if ((view === 'trips' && S.active) || (view === 'crypt' && Date.now() < S.crypt.cd + 1000) || (view === 'arena' && Date.now() < S.arenaTs + 1000)) render();
}, 1000);

G.load(); render();
