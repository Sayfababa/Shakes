import { CFG, MATS, TUTORIAL, TRADERS } from './data.js';
import * as G from './state.js';
import * as Q from './quests.js';
import * as Game from './game.js';
import * as UI from './ui.js';

const app = document.getElementById('app'), tip = document.getElementById('tip');
let tripLoc = null, view = 'hero', pickCls = null, F = null, rival = null, fightTimer = null, trader = 'halvar', turnin = null, npc = 'prophet', turninBy = null;

function render() {
  const S = G.S;
  if (!S) { app.innerHTML = `<main>${UI.viewCreate(pickCls)}</main>`; return; }
  G.tickGlut();
  const views = {
    fight: () => UI.viewFight(F), trips: UI.viewTrips, stats: UI.viewStats, spells: UI.viewSpells, talents: UI.viewTalents, crypt: UI.viewCrypts,
    traders: () => turnin ? UI.viewTurnin(turnin, turninBy) : UI.viewTrader(trader),
    trippick: () => UI.viewTripPick(tripLoc),
    bounties: UI.viewBounties,
    npc: () => turnin ? UI.viewTurnin(turnin, turninBy) : UI.viewNpc(npc),
    arena: () => UI.viewArena(rival ||= Game.makeRival()), hero: UI.viewHero,
  };
  if (view === 'fight' && !F) view = 'hero';
  tutCheck();
  app.innerHTML = UI.hud(view === 'fight' ? '' : UI.tutorial(S.tut)) + `<main>${(views[view] || views.hero)()}</main>` + UI.navBar(view === 'fight' ? F.back : view);
  const log = document.getElementById('log'); if (log) log.scrollTop = log.scrollHeight;
  G.save();
}

// Tutorial: nächster Schritt, sobald die Bedingung erfüllt ist
function tutCheck() {
  const S = G.S, t = TUTORIAL[S.tut]; if (!t) return;
  const [k, v] = t.when.split(':');
  const ok = k === 'view' ? (v === 'kaspar' ? view === 'traders' && trader === 'kaspar' : view === v)
    : k === 'active' ? !!S.active || S.wins > 0 : k === 'wins' ? S.wins > 0
    : k === 'spent' ? S.points < CFG.startPoints + (S.lvl - 1) * CFG.attrPerLevel || Object.keys(S.equip).length > 1
    : k === 'turnin' ? Object.values(S.traders).some(t => t.q > 0) : false;
  if (ok) { S.tut++; tutCheck(); }
}

// Ergebnis eines Spielzugs (aus game.js) anzeigen
function showFight(res, back, extra = '') {
  if (!res) return render();
  const { A, B, r, win, rew } = res;
  F = { A, B, ...r, step: 0, back, reward: (win ? (res.haul ? haulRewText(res) : rewText(rew)) : loseText(res)) + extra };
  view = 'fight'; G.save();
  clearInterval(fightTimer);
  fightTimer = setInterval(() => { F.step++; if (F.step >= F.log.length) { clearInterval(fightTimer); render(); } else fightStep(); }, 380);
  render();
}
function haulRewText(res) {
  const w = res.rew, h = res.haul, L = [`Gefunden: ${w.gold} Gold · ${w.xp} EP`];
  for (const [k, n] of w.mats) L.push(`${MATS[k]} ×${n}`);
  if (w.item) L.push(`<span class="r-${w.item.rarity}">${w.item.name}</span>${betterTxt(w.item)}`);
  if (w.omen) L.push('<b class="gold">Das Omen hat sich erfüllt.</b>');
  L.push(`<i class="dim">Ungesichert (Tiefe ${h.depth}): ${h.gold} Gold, ${h.xp} EP${h.items.length ? `, ${h.items.length} Fundstück(e)` : ''}</i>`);
  return L.join('<br>');
}
// "Oh, das ist viel besser!" – direkt bei der Beute zeigen
function betterTxt(it) { const g = UI.itemGain(it); return g > 0.01 ? ` <b class="better-txt">▲ +${Math.round(g * 100)} % Kampfkraft</b>` : ''; }
// Kurze Einblendung nach dem Anlegen: alte → neue Kampfkraft
function toast(before) {
  const after = G.power(), d = after - before; if (!d) return;
  const el = document.createElement('div'); el.className = 'toast ' + (d > 0 ? 'up' : 'down');
  el.innerHTML = `Kampfkraft ${UI.fmtN(before)} → <b>${UI.fmtN(after)}</b> <span>${d > 0 ? '▲ +' : '▼ −'}${Math.abs(Math.round(d / Math.max(1, before) * 100))} %</span>`;
  document.body.appendChild(el); setTimeout(() => el.remove(), 2200);
}
function loseText(res) {
  if (res.lost) return `In der Tiefe verloren: ${res.lost.gold} Gold, ${res.lost.xp || 0} EP${res.lost.items.length ? ` und ${res.lost.items.length} Fundstück(e)` : ''}.`;
  if (res.rew.honor) return `${res.rew.honor} Ehre`;
  if (res.crypt) return 'Die Krypta behält dich. Diesmal. Dein Fortschritt bleibt.';
  return 'Die Asche spuckt dich wieder aus.';
}
function rewText(w) {
  const L = [];
  if (w.gold || w.xp) L.push(`+${w.gold} Gold${w.xp ? ` · +${w.xp} EP` : ''}${w.honor ? ` · +${w.honor} Ehre` : ''}`);
  else if (w.honor) L.push(`+${w.honor} Ehre`);
  for (const [k, n] of w.mats) L.push(`${MATS[k]} ×${n}`);
  if (w.item) L.push(`Beute: <span class="r-${w.item.rarity}">${w.item.name}</span>${w.item.soldFull ? ' <i class="dim">(Beutel voll – verkauft)</i>' : betterTxt(w.item)}`);
  if (w.omen) L.push('<b class="gold">Das Omen hat sich erfüllt.</b>');
  if (w.trophy) L.push(`<b class="r-legendary">Trophäe: ${w.trophy.name}</b>`);
  if (w.shard) L.push(`<b class="gold">Glockensplitter ${w.shard}/4</b>`);
  if (w.diffUp) L.push(`<b class="hot">${w.diffUp} erwacht.</b>`);
  if (w.up) L.push(`<b class="hot">Stufe ${G.S.lvl}! +${w.up * CFG.attrPerLevel} Attributpunkte, +${w.up} Talentpunkt</b>`);
  return L.join('<br>');
}

// Kampf-Schritt ohne Neuaufbau: nur Log-Zeile, Lebensbalken und Treffer-Effekt ändern (Bilder bleiben stehen)
function fightStep() {
  const l = F.log[F.step - 1], log = document.getElementById('log'); if (!l || !log) return render();
  const row = document.createElement('div'); row.className = `${l.who} ${l.crit ? 'crit' : ''} ${l.spell ? 'spell' : ''}`; row.textContent = l.t;
  log.appendChild(row); log.scrollTop = log.scrollHeight;
  if (l.spell) { const c = document.querySelector(`#${l.who === 'a' ? 'fA' : 'fB'} .pwrap`);
    if (c) { const n = document.createElement('span'); n.className = 'spellname'; n.innerHTML = `${l.sid ? `<img src="assets/spells/${l.sid}.webp" alt="">` : ''}<span>${l.spell}</span>`; c.appendChild(n); setTimeout(() => n.remove(), 1100); } }
  for (const [id, hp, max] of [['fA', l.hpA, F.hpA], ['fB', l.hpB, F.hpB]]) {
    const el = document.getElementById(id); if (!el) continue;
    el.querySelector('.bar i').style.width = Math.max(0, Math.min(100, hp / max * 100)) + '%';
    el.querySelector('.hp').textContent = `${Math.max(0, hp)} / ${max}`;
    const hit = (id === 'fA' && l.who === 'b') || (id === 'fB' && l.who === 'a');
    el.classList.remove('hit', 'crit'); if (hit) { void el.offsetWidth; el.classList.add('hit'); if (l.crit) el.classList.add('crit');
      if (l.dmg) { const n = document.createElement('span'); n.className = 'dmgnum' + (l.crit ? ' crit' : '') + (l.spell ? ' sp' : ''); n.textContent = l.dmg;
        n.style.left = (35 + Math.random() * 30) + '%'; el.querySelector('.pwrap')?.appendChild(n); setTimeout(() => n.remove(), 900); } }
  }
}

const actions = {
  pick: d => { pickCls = d.c; render(); setTimeout(() => document.getElementById('nm')?.focus()); },
  create: () => { const n = document.getElementById('nm').value.trim() || 'Namenloser'; G.newChar(n, pickCls);
    G.journal(`${n} erwacht im Grab. Drei Gestalten warten am Friedhofstor.`); view = 'traders'; render(); },
  wipe: () => { if (confirm('Charakter wirklich vernichten?')) { G.wipe(); pickCls = null; render(); } },
  go: d => { view = d.v; turnin = null; if (d.v === 'npc') npc = d.n || npc; if (view !== 'fight') { F = null; clearInterval(fightTimer); } render(); },
  attr: d => { G.addAttr(d.k); render(); },
  learn: d => { if (G.learn(+d.b, +d.t)) render(); },
  respec: () => { const c = G.respecCost(); if (confirm(c ? `Für ${c} Gold alle Attribute und Talente zurücksetzen?` : 'Attribute und Talente zurücksetzen? (einmalig gratis)')) { G.respec(); render(); } },
  equip: d => { const p = G.power(); if (!G.equip(d.id)) alert('Kein Platz im Beutel.'); render(); toast(p); },
  unequip: d => { const p = G.power(); G.unequip(d.s); render(); toast(p); },
  sell: d => { G.sell(d.id); render(); },
  sort: () => { G.sortBag(); render(); },
  trader: d => { trader = d.t; turnin = null; view = 'traders'; render(); },
  buy: d => { const S = G.S, shop = S.traders[d.t].shop, i = shop.findIndex(x => x.id === d.id), it = shop[i];
    if (!it || S.gold < it.price) return;
    const bought = { ...it }; delete bought.price;
    if (!G.addToBag(bought)) return alert('Kein Platz im Beutel.');
    S.gold -= it.price; shop.splice(i, 1); render(); },
  turnin: d => { const r = Q.complete(d.t, d.c); if (r) { turnin = r; turninBy = d.t; if (!TRADERS[d.t]) view = 'npc'; render(); } },
  npc: d => { npc = d.n || d.t; turnin = null; view = 'npc'; render(); },
  tutskip: () => { G.S.tut = 99; render(); },
  service: d => { const it = G.doService(d.t, d.s); if (!it) return alert('Nicht möglich.'); hideTip(); render();
    setTimeout(() => alert(`${it.name}${it.up ? ' +' + it.up : ''} – erledigt.`), 50); },
  champ: d => showFight(Game.champFight(d.t), 'npc'),
  trip: d => { tripLoc = d.id; view = 'trippick'; render(); },
  tripgo: d => { if (G.startTrip(d.id, d.tr)) { view = 'trips'; render(); } },
  bank: () => { const h = Game.bank(); view = 'trips'; F = null; clearInterval(fightTimer);
    if (h?.up) G.journal(`Stufe ${G.S.lvl} erreicht.`); if (h) G.journal(`Heimgekehrt mit ${h.gold} Gold${h.items.length ? ` und ${h.items.length} Fundstück${h.items.length > 1 ? 'en' : ''}` : ''}.`); render(); },
  delve: () => showFight(Game.delve(), 'trips'),
  rush: () => { const S = G.S, c = G.rushCost(); if (S.active && S.gold >= c) { S.gold -= c; S.active.end = Date.now(); } render(); },
  claim: d => { const r = G.claimBounty(+d.i); if (r) G.journal(`Steckbrief erfüllt: ${r.gold} Gold, ${r.xp} EP.`); render(); },
  resolve: () => showFight(Game.resolveTrip(), 'trips'),
  crypt: d => showFight(Game.cryptFight(d.id), 'crypt'),
  rival: () => { rival = Game.makeRival(); render(); },
  arena: () => { const R = rival; const res = Game.arenaFight(R); if (res) rival = null; showFight(res, 'arena'); },
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
  if (TOUCH || tip.className === 'touch') return;   // offenes Touch-Fenster nie durch Mausbewegung schließen
  const el = e.target.closest('[data-tip]'); if (!el) return hideTip();
  const it = findItem(el.dataset.tip); if (!it) return hideTip();
  tip.innerHTML = UI.itemTip(it, compareTo(it)); tip.hidden = false;
  tip.style.left = Math.min(e.clientX + 16, innerWidth - tip.offsetWidth - 8) + 'px';
  tip.style.top = Math.min(e.clientY + 16, innerHeight - tip.offsetHeight - 8) + 'px';
});
// Beim Wechsel von der Seite ins Item-Fenster feuert 'mouseleave' (auch bei Touch!) – das Fenster mit Knöpfen darf dabei nicht zugehen
app.addEventListener('mouseleave', () => { if (tip.className !== 'touch') hideTip(); });

// Countdown-Takt: nur die Zahlen ändern; bei 0 einmal neu zeichnen
setInterval(() => {
  if (!G.S || !tip.hidden) return;
  for (const el of document.querySelectorAll('[data-until]')) {
    const left = Math.ceil((+el.dataset.until - Date.now()) / 1000);
    if (left <= 0) return render();
    el.textContent = UI.fmtT(left);
  }
}, 1000);

G.load(); render();
