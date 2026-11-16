import { CFG, MATS, TUTORIAL, TRADERS, FORGE, CRYPTS, HERBS, POTIONS, LOCATIONS, DESC_ROOMS, ACTS } from './data.js';
import * as G from './state.js';
import * as Q from './quests.js';
import * as Game from './game.js';
import * as UI from './ui.js';
import * as Sound from './sound.js';

const app = document.getElementById('app'), tip = document.getElementById('tip');
let expSel = { loc: null, h: 8, path: [] }, expRes = null, expAsk = false;
let forgeSel = { mat: null, slot: null, mode: 'rune', item: null, stat: null, msg: '' }, forgeRes = null, FG = null;
let descSt = { c: null, j: null, msg: '', res: null };
let actSel = null, zoneSel = null, prepC = null, prepM = null, alchSel = POTIONS[0].id, alchBack = 'traders';
let tripLoc = null, view = 'hero', pickCls = null, F = null, pitSel = null, fightTimer = null, trader = 'halvar', turnin = null, npc = 'prophet', turninBy = null;

function render() {
  const S = G.S;
  if (!S) { app.innerHTML = `<main>${UI.viewCreate(pickCls)}</main>`; return; }
  G.tickGlut(); G.potDaily();
  // grüner Punkt gesehen: abgelaufene Wartezeit beim Hinschauen zurücksetzen
  if (['crypt', 'prep'].includes(view) && S.crypt.cd && Date.now() >= S.crypt.cd) S.crypt.cd = 0;
  if (['arena', 'pitprep', 'pitshop'].includes(view) && S.pit.ts && Date.now() >= S.pit.ts) S.pit.ts = 0;
  const views = {
    fight: () => UI.viewFight(F), trips: () => expRes ? UI.viewExpRes(expRes) : S.desc ? UI.viewDescAway('prophet') : UI.viewTrips(expAsk), stats: UI.viewStats, spells: UI.viewSpells, ways: () => UI.viewWays(waySel), talents: UI.viewTalents, crypt: () => S.exp ? UI.viewAway('ilse') : S.desc || descSt.res ? UI.viewDesc(descSt) : UI.viewCrypts(),
    desc: () => S.exp ? UI.viewAway('ilse') : UI.viewDesc(descSt),
    traders: () => turnin ? UI.viewTurnin(turnin, turninBy) : UI.viewTrader(trader),
    trippick: () => S.desc ? UI.viewDescAway('prophet') : S.exp ? UI.viewTrips() : UI.viewTripPick(tripLoc),
    bounties: UI.viewBounties,
    forge: () => UI.viewForge(forgeSel, forgeRes),
    npc: () => turnin ? UI.viewTurnin(turnin, turninBy) : UI.viewNpc(npc),
    arena: () => S.exp ? UI.viewAway('vargo') : S.desc ? UI.viewDescAway('vargo') : UI.viewArena(), hero: UI.viewHero,
    pitprep: () => S.exp ? UI.viewAway('vargo') : S.desc ? UI.viewDescAway('vargo') : pitSel && prepM ? UI.viewPitPrep(pitSel, prepM) : UI.viewArena(),
    pitshop: () => UI.viewPitShop(),
    opts: () => UI.viewOpts(Sound.opt, Sound.LEVELS),
    act: () => S.exp || S.desc ? (S.desc ? UI.viewDescAway('prophet') : UI.viewTrips()) : UI.viewAct(ACTS.find(a => a.id === actSel) || G.curAct()),
    zoneprep: () => S.exp || S.desc || !prepM || zoneSel == null ? UI.viewTrips() : UI.viewZonePrep(ACTS.find(a => a.id === actSel), zoneSel, prepM),
    exped: () => S.desc ? UI.viewDescAway('prophet') : S.exp ? UI.viewTrips(expAsk) : UI.viewExped(expSel),
    alch: () => UI.viewAlch(alchSel, alchBack),
    prep: () => S.exp ? UI.viewAway('ilse') : S.desc ? UI.viewDesc(descSt) : prepM ? UI.viewPrep(CRYPTS.find(c => c.id === prepC), prepM) : UI.viewCrypts(),
  };
  if (view === 'fight' && !F) view = 'hero';
  tutCheck();
  app.innerHTML = UI.hud(view === 'fight' ? '' : UI.tutorial(S.tut)) + `<main>${(views[view] || views.hero)()}</main>` + UI.navBar(view === 'fight' ? F.back : view);
  const log = document.getElementById('log'); if (log) log.scrollTop = log.scrollHeight;
  fitPrep();
  G.save();
}

// Vorbereitung: Gürtel als Liste; reicht die Höhe nicht (kleine Handys, iOS-App), als Reihe nebeneinander
function fitPrep() {
  const pr = document.querySelector('.prep, .pit, .pitshopv, .acts, .actv, .exped, .expev, .expresv, .desc, .descv, .descres, .craft, .crypts'), m = pr?.parentElement; if (!pr) return;
  pr.classList.remove('tight');
  // zu hoch – oder (Umschmieden) Boni im Kasten abgeschnitten
  const low = () => pr.lastElementChild.getBoundingClientRect().bottom > m.getBoundingClientRect().bottom + 1
    || [...pr.querySelectorAll('.caff')].some(e => e.getBoundingClientRect().bottom > e.closest('.panel').getBoundingClientRect().bottom - 2);
  if (low()) pr.classList.add('tight');
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

// Abstieg: Raum-Ergebnis zeigen (Kampf → Kampfbildschirm, Raum → Hinweis, Ausgang → Bilanz)
function descResult(r) {
  view = 'desc';
  if (r.kind === 'out') { descSt.res = { out: r.out }; return render(); }
  if (r.kind === 'room') { const g = r.got; descSt.msg = `<b>${DESC_ROOMS[r.t].name}:</b> ${r.text}${g ? ` Im Sack: ${g.gold} Gold${g.items.map(it => ` · <span class="r-${it.rarity}">${it.name}</span>`).join('')}` : ''}`; return render(); }
  const res = r.res; if (res.desc.lost) descSt.res = { lost: res.desc.lost }; else if (res.desc.out) descSt.res = { out: res.desc.out };
  showFight(res, 'desc');
}
// Ergebnis eines Spielzugs (aus game.js) anzeigen
function showFight(res, back, extra = '') {
  if (!res) return render();
  const { A, B, r, win, rew } = res;
  F = { A, B, ...r, step: 0, back, gold: win ? rew?.sack?.gold || rew?.gold || 0 : 0, reward: (win ? (res.haul ? haulRewText(res) : res.desc ? descRewText(res) : rewText(rew)) : loseText(res)) + extra };
  view = 'fight'; G.save();
  clearTimeout(fightTimer);
  const tick = () => { F.step++; if (F.step >= F.log.length) return render(); fightStep(); const l = F.log[F.step - 1]; fightTimer = setTimeout(tick, l?.spell ? 780 : l?.crit ? 560 : 400); };
  fightTimer = setTimeout(tick, 380);
  render();
}
// Abstieg: EP sofort, alles andere liegt im Sack
function descRewText(res) {
  const w = res.rew, g = w.sack, L = [`+${w.xp} EP${w.up ? ` · <b class="hot">Stufe ${G.S.lvl}!</b>` : ''}`];
  const bits = [`${g.gold} Gold`, ...g.mats.map(([k, n]) => `${MATS[k]} ×${n}`), ...g.herbs.map(([k, n]) => `${HERBS[k].name} ×${n}`), ...g.items.map(it => `<span class="r-${it.rarity}">${it.name}</span>${betterTxt(it)}`)];
  L.push(`Im Sack: ${bits.join(' · ')}`);
  if (res.desc.out) L.push(`<b class="gold">Entkommen! Alles gesichert.</b>`);
  else L.push(`<i class="dim">Leben ${Math.round(res.desc.hpf * 100)} % – es füllt sich unten nicht auf.</i>`);
  return L.join('<br>');
}
function haulRewText(res) {
  const w = res.rew, h = res.haul, L = [`Gefunden: ${w.gold} Gold · ${w.xp} EP`];
  for (const [k, n] of w.mats) L.push(`${MATS[k]} ×${n}`);
  for (const [k, n] of w.herbs || []) L.push(`${HERBS[k].name} ×${n}`);
  if (w.item) L.push(`<span class="r-${w.item.rarity}">${w.item.name}</span>${betterTxt(w.item)}`);
  for (const it of (w.items || []).slice(1)) L.push(`Beute: <span class="r-${it.rarity}">${it.name}</span>${it.soldFull ? ' <i class="dim">(Beutel voll – verkauft)</i>' : betterTxt(it)}`);
  if (w.actDone) L.push(`<b class="gold">Akt ${w.actDone.n} geschafft.</b> Der nächste Akt ist offen${w.actDone.crypt ? ', und eine Krypta wartet' : ''}.`);
  if (w.tier) L.push(`<b class="gold">Krypta-Stufe ${w.tier} bezwungen.</b> Die nächste ist schwerer – und reicher.`);
  if (w.rankUp) L.push(`<b class="gold">Neuer Rang: ${w.rankUp.name}</b> · Titel „${w.rankUp.title}“ + Segen`);
  if (w.omen) L.push('<b class="gold">Das Omen hat sich erfüllt.</b>');
  L.push(`<i class="dim">Ungesichert (Tiefe ${h.depth}): ${h.gold} Gold, ${h.xp} EP${h.items.length ? `, ${h.items.length} Fundstück(e)` : ''}</i>`);
  return L.join('<br>');
}
// "Oh, das ist viel besser!" – direkt bei der Beute zeigen
function betterTxt(it) { const g = UI.itemGain(it);
  return (it.unique ? ' <b class="uniq-txt">Einzigartig!</b>' : it.special ? ' <b class="uniq-txt">✦</b>' : '') + (g > 0.01 ? ` <b class="better-txt">▲ +${Math.round(g * 100)} % Kampfkraft</b>` : ''); }
// Kurze Einblendung nach dem Anlegen: alte → neue Kampfkraft
function toast(before) {
  const after = G.power(), d = after - before; if (!d) return;
  const el = document.createElement('div'); el.className = 'toast ' + (d > 0 ? 'up' : 'down');
  el.innerHTML = `Kampfkraft ${UI.fmtN(before)} → <b>${UI.fmtN(after)}</b> <span>${d > 0 ? '▲ +' : '▼ −'}${Math.abs(Math.round(d / Math.max(1, before) * 100))} %</span>`;
  document.body.appendChild(el); setTimeout(() => el.remove(), 2200);
}
function loseText(res) {
  if (res.lost) return `In der Tiefe verloren: ${res.lost.gold} Gold, ${res.lost.xp || 0} EP${res.lost.items.length ? ` und ${res.lost.items.length} Fundstück(e)` : ''}.`;
  if (res.pit) return 'Vargo lacht. Platz bleibt – 15 Minuten Pause.';
  if (res.rew.honor) return `${res.rew.honor} Ehre`;
  if (res.desc?.lost) { const l = res.desc.lost; return `Der Sack bleibt unten: ${l.gold} Gold${l.items.length ? `, ${l.items.length} Fundstück${l.items.length > 1 ? 'e' : ''}` : ''}.`; }
  if (res.crypt) return 'Die Krypta behält dich. Diesmal. Deine Stufe bleibt.';
  if (res.act) return 'Nichts verloren. Werde stärker und versuch es wieder.';
  return 'Die Asche spuckt dich wieder aus.';
}
function rewText(w) {
  const L = [];
  if (w.gold || w.xp) L.push(`+${w.gold} Gold${w.xp ? ` · +${w.xp} EP` : ''}${w.honor ? ` · +${w.honor} Ehre` : ''}`);
  else if (w.honor) L.push(`+${w.honor} Ehre`);
  for (const [k, n] of w.mats) L.push(`${MATS[k]} ×${n}`);
  for (const [k, n] of w.herbs || []) L.push(`${HERBS[k].name} ×${n}`);
  if (w.item) L.push(`Beute: <span class="r-${w.item.rarity}">${w.item.name}</span>${w.item.soldFull ? ' <i class="dim">(Beutel voll – verkauft)</i>' : betterTxt(w.item)}`);
  if (w.omen) L.push('<b class="gold">Das Omen hat sich erfüllt.</b>');
  if (w.trophy) L.push(`<b class="r-legendary">Trophäe: ${w.trophy.name}</b>`);
  if (w.shard) L.push(`<b class="gold">Glockensplitter ${w.shard}/4</b>`);
  if (w.diffUp) L.push(`<b class="hot">${w.diffUp} erwacht.</b>`);
  if (w.up) L.push(`<b class="hot">Stufe ${G.S.lvl}! +${w.up * CFG.attrPerLevel} Attributpunkte, +${w.up} Talentpunkt</b>`);
  return L.join('<br>');
}

// Zauber sichtbar machen: Symbol leuchtet in der Leiste, Name über dem Wirker, Geschoss fliegt zum Ziel, Einschlag in Zauberfarbe
function spellFx(l) {
  const me = document.getElementById(l.who === 'a' ? 'fA' : 'fB'), foe = document.getElementById(l.who === 'a' ? 'fB' : 'fA'), fight = document.querySelector('.fight');
  const F0 = l.who === 'a' ? F.A : F.B, sp = F0.spells?.find(x => x.id === l.sid); if (!me || !sp) return;
  const i = F0.spells.indexOf(sp), sb = me.querySelector(`.sb[data-i="${i}"]`);
  if (sb) { sb.classList.remove('cast'); void sb.offsetWidth; sb.classList.add('cast'); }
  const n = document.createElement('span'); n.className = 'spellname'; n.style.setProperty('--fx', sp.fx); n.innerHTML = `<span>${sp.name}</span>`;
  me.querySelector('.pwrap')?.appendChild(n); setTimeout(() => n.remove(), 1100);
  const self = ['heal', 'shield', 'buff'].includes(sp.kind), tgt = (self ? me : foe).querySelector('.pwrap');
  const boom = () => { if (!tgt) return; const b = document.createElement('span'); b.className = `burst ${self ? 'self' : ''}`; b.style.setProperty('--fx', sp.fx);
    b.innerHTML = `<img src="assets/spells/${sp.id}.webp" alt="">`; tgt.appendChild(b); setTimeout(() => b.remove(), 700); };
  const miss = !self && !l.dmg && sp.kind !== 'dot';   // ausgewichen: Geschoss fliegt, kein Einschlag
  if (self || !fight || !tgt) return boom();
  const a = me.querySelector('.pwrap').getBoundingClientRect(), z = tgt.getBoundingClientRect(), f = fight.getBoundingClientRect();
  const p = document.createElement('img'); p.className = 'proj'; p.src = `assets/spells/${sp.id}.webp`; p.style.setProperty('--fx', sp.fx);
  p.style.left = (a.left + a.width / 2 - f.left - 22) + 'px'; p.style.top = (a.top + a.height / 2 - f.top - 22) + 'px';
  p.style.setProperty('--dx', (z.left - a.left) + 'px'); p.style.setProperty('--dy', (z.top - a.top) + 'px');
  fight.appendChild(p); setTimeout(() => { p.remove(); if (!miss) boom(); }, 320);
}

// Kampf-Schritt ohne Neuaufbau: nur Log-Zeile, Lebensbalken und Treffer-Effekt ändern (Bilder bleiben stehen)
function fightStep() {
  const l = F.log[F.step - 1], log = document.getElementById('log'); if (!l || !log) return render();
  const row = document.createElement('div'); row.className = `${l.who} ${l.crit ? 'crit' : ''} ${l.spell ? 'spell' : ''}`; row.textContent = l.t;
  log.appendChild(row); log.scrollTop = log.scrollHeight;
  // Ladebalken der Zauber
  for (const [id, ch] of [['fA', l.cA], ['fB', l.cB]]) (ch || []).forEach((v, i) => { const b = document.querySelector(`#${id} .sb[data-i="${i}"]`); if (b) b.style.setProperty('--c', v); });
  if (l.spell) spellFx(l);
  const it = document.querySelector('#fB .intent'); if (it) { it.hidden = !l.iB; if (l.iB && it.textContent !== l.iB) { it.textContent = l.iB; it.classList.remove('pulse'); void it.offsetWidth; it.classList.add('pulse'); } }
  for (const [id, hp, max] of [['fA', l.hpA, F.hpA], ['fB', l.hpB, F.hpB]]) {
    const el = document.getElementById(id); if (!el) continue;
    el.querySelector('.bar i').style.width = Math.max(0, Math.min(100, hp / max * 100)) + '%';
    el.querySelector('.hp').textContent = `${Math.max(0, hp)} / ${max}`;
  }
  combatFx(l);
}

// Schwebende Zahlen und Treffer-Effekte: Schaden (Zauber in Zauberfarbe, erst wenn das Geschoss einschlägt),
// Krit groß mit Wackeln, Heilung/Lebensraub grün am eigenen Bild, Schild, Gift/Bluten, Dornen, Ausweichen
function combatFx(l) {
  const me = document.getElementById(l.who === 'a' ? 'fA' : 'fB'), foe = document.getElementById(l.who === 'a' ? 'fB' : 'fA'); if (!me || !foe) return;
  const F0 = l.who === 'a' ? F.A : F.B, sp = l.sid ? F0.spells?.find(x => x.id === l.sid) : null;
  const self = sp && ['heal', 'shield', 'buff'].includes(sp.kind), delay = sp && !self ? 330 : 0;
  // Plätze reihum je Bild, damit sich Zahlen aufeinanderfolgender Züge nicht überdecken; Heilung links, Schaden mittig/rechts
  const SPOTS = [[52, 38], [70, 58], [40, 62], [64, 30], [34, 44]], HEAL = [[26, 52], [30, 30], [24, 70]], POTS = [[50, 10], [50, 30], [50, 50]];   // Tränke untereinander
  const pop = (el, txt, cls, wait = 0, fx) => setTimeout(() => { const w = el.querySelector('.pwrap'); if (!w) return;
    const n = document.createElement('span'); n.className = 'fnum ' + cls; n.innerHTML = txt; if (fx) n.style.setProperty('--fx', fx);
    const pot = /pot/.test(cls), heal = !pot && /heal|shield|buff/.test(cls), key = pot ? 'kp' : heal ? 'kh' : 'k', list = pot ? POTS : heal ? HEAL : SPOTS, k = +(w.dataset[key] || 0);
    w.dataset[key] = (k + 1) % list.length; const [x, y] = pot ? list[k] : /combo/.test(cls) ? [50, 14] : /crit/.test(cls) ? [50, 52] : list[k];   // Kombo-Name oben, Krit-Zahl darunter
    n.style.left = x + '%'; n.style.top = y + '%';
    w.appendChild(n); setTimeout(() => n.remove(), 1300); }, wait);
  const hit = (el, crit, wait) => setTimeout(() => { el.classList.remove('hit', 'crit'); void el.offsetWidth; el.classList.add('hit'); if (crit) el.classList.add('crit');
    if (crit) { const f = document.querySelector('.fight'); f?.classList.remove('quake'); void f?.offsetWidth; f?.classList.add('quake'); } }, wait);
  if (l.dmg) {
    hit(foe, l.crit, delay); setTimeout(() => Sound.play('hit', l.crit ? 1 : 0.75), delay);
    if (l.hits) l.hits.forEach((d, i) => pop(foe, d, 'dmg sp', delay + i * 140, sp?.fx));
    else pop(foe, l.crit ? `<small>Kritisch</small>${l.dmg}` : l.dmg, `dmg ${l.crit ? 'crit' : ''} ${sp ? 'sp' : ''}`, delay, sp?.fx);
  }
  if (l.tick) { hit(foe, false, 0); pop(foe, l.tick, 'tick ' + l.tk); }
  if (l.dot) pop(foe, `<small>Gift</small>${l.dot}`, 'tick poison', delay);
  if (l.miss) pop(foe, l.miss, 'miss', delay);
  if (l.stun) pop(foe, 'Betäubt', 'miss stun', delay + 120);
  if (l.heal) { pop(me, '+' + l.heal, 'heal', delay + 80); me.classList.remove('healed'); void me.offsetWidth; me.classList.add('healed'); }
  if (l.shield) pop(me, `<small>Schild</small>${l.shield}`, 'shield');
  if (l.buff) pop(me, `+${l.buff} %`, 'buff');
  if (l.rage) pop(me, 'Raserei', 'miss rage');
  if (l.thorns) { hit(me, false, delay + 60); pop(me, l.thorns, 'tick thorns', delay + 60); }
  if (l.combo) pop(foe, l.combo, 'combo', delay + 40, sp?.fx);                        // Zauber-Weg löst aus (Schmelzen, Detonation …)
  if (l.pot && l.who === 'a') { pop(me, l.potName, 'combo pot'); const b = me.querySelector(`.pbelt [data-p="${l.pot}"]`); if (b) b.classList.add('used'); }
  if (l.status) pop(l.status === 'Gereinigt' ? me : foe, l.status, 'miss status', delay + 200);
}

let waySel = null;
const actions = {
  ways: d => { waySel = d.s; view = 'ways'; render(); },
  way: d => { const cur = G.S.sp?.[d.s]?.[+d.t]; if (cur === +d.i) return;
    if (cur != null && !confirm(`Weg wechseln für ${G.wayCost()} Gold?`)) return;
    const p = G.power(), err = G.chooseWay(d.s, +d.t, +d.i); if (err) return alert(err); G.save(); render(); toast(p); },
  pick: d => { pickCls = d.c; render(); setTimeout(() => document.getElementById('nm')?.focus()); },
  create: () => { const n = document.getElementById('nm').value.trim() || 'Namenloser'; G.newChar(n, pickCls);
    G.journal(`${n} erwacht im Grab. Drei Gestalten warten am Friedhofstor.`); view = 'traders'; render(); },
  wipe: () => { if (confirm('Charakter wirklich vernichten?')) { G.wipe(); pickCls = null; render(); } },
  go: d => { view = d.v; turnin = null; expAsk = false; if (d.v === 'alch') alchBack = null; if (d.v === 'forge') { forgeRes = null; stopForge(); } if (d.v === 'npc') npc = d.n || npc; if (view !== 'fight') { F = null; clearTimeout(fightTimer); } render(); },
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
    const bought = { ...it }; delete bought.price; delete bought.lock;
    if (!G.addToBag(bought)) return alert('Kein Platz im Beutel.');
    S.gold -= it.price; shop.splice(i, 1); render(); },
  shoplock: d => { if (G.lockShop(d.t, d.id)) render(); },
  turnin: d => { const r = Q.complete(d.t, d.c); if (r) { turnin = r; turninBy = d.t; if (!TRADERS[d.t]) view = 'npc'; render(); } },
  npc: d => { npc = d.n || d.t; turnin = null; view = 'npc'; render(); },
  tutskip: () => { G.S.tut = 99; render(); },
  service: d => { const it = G.doService(d.t, d.s); if (!it) return alert('Nicht möglich.'); hideTip(); render();
    setTimeout(() => alert(`${it.name}${it.up ? ' +' + it.up : ''} – erledigt.`), 50); },
  champ: d => showFight(Game.champFight(d.t), 'npc'),
  trip: d => { tripLoc = d.id; view = 'trippick'; render(); },
  tripgo: d => { if (G.startTrip(d.id, d.tr)) { view = 'trips'; render(); } },
  bank: () => { const h = Game.bank(); view = 'trips'; F = null; clearTimeout(fightTimer);
    if (h?.up) G.journal(`Stufe ${G.S.lvl} erreicht.`); if (h) G.journal(`Heimgekehrt mit ${h.gold} Gold${h.items.length ? ` und ${h.items.length} Fundstück${h.items.length > 1 ? 'en' : ''}` : ''}.`); render(); },
  delve: () => showFight(Game.delve(), 'trips'),
  rush: () => { const S = G.S, c = G.rushCost(); if (S.active && S.gold >= c) { S.gold -= c; S.active.end = Date.now(); } render(); },
  claim: d => { const r = G.claimBounty(+d.i); if (r) G.journal(`Steckbrief erfüllt: ${r.gold} Gold, ${r.xp} EP.`); render(); },
  resolve: () => showFight(Game.resolveTrip(), 'trips'),
  crypt: d => { const c = CRYPTS.find(x => x.id === d.id); if (!c) return; prepC = c.id; prepM = G.cryptEnemy(c); view = 'prep'; render(); },
  prepPot: d => { if (!prepM) return; const keep = Game.enemyInfo(prepM).tags.map(t => t[1]); if (!Game.packPotion(d.id, keep)) return alert('Geht gerade nicht.'); render(); },
  bestBelt: () => { if (!prepM) return; if (!Game.bestBelt(prepM)) alert('Du hast noch keine Tränke. Brau welche bei Mutter Ysolde.'); render(); },
  cryptgo: () => { const m = prepM; prepM = null; showFight(Game.cryptFight(prepC, m), 'crypt'); },
  alch: d => { alchBack = d.b === 'prep' ? (['pitprep', 'zoneprep'].includes(view) ? view : 'prep') : d.b === 'desc' ? d.b : 'traders'; view = 'alch'; render(); },
  potsel: d => { alchSel = d.id; render(); },
  brew: d => { if (G.brew(d.id)) { alchSel = d.id; render(); } },
  beltin: d => { const n = G.beltSlots(); let i = G.S.belt.slice(0, n).findIndex(b => !b);
    if (G.potion(d.id).rare) { const r = G.S.belt.slice(0, n).findIndex(b => b && G.potion(b.id).rare); if (r >= 0) i = r; }   // seltenen ersetzen
    if (i < 0) return alert('Der Gürtel ist voll. Nimm erst einen Trank heraus.'); if (!G.setBelt(i, d.id)) return alert('Geht nicht.'); render(); },
  beltout: d => { const i = G.S.belt.findIndex(b => b?.id === d.id); if (i >= 0) G.setBelt(i, null); render(); },
  beltdel: d => { G.setBelt(+d.i, null); render(); },
  trig: d => { const b = G.S.belt[+d.i], ts = b && G.potion(b.id).trig; if (!ts) return; G.setTrig(+d.i, ts[(ts.indexOf(b.trig) + 1) % ts.length]); render(); },
  act: d => { actSel = d.id; prepM = null; view = 'act'; render(); },
  zone: d => { const a = ACTS.find(x => x.id === d.a); if (!a) return; actSel = a.id; zoneSel = +d.z; prepM = Game.actEnemy(a, zoneSel); view = 'zoneprep'; render(); },
  actgo: () => { if (!prepM) return; const m = prepM, res = Game.actFight(actSel, zoneSel, m); if (!res) return render(); prepM = null; showFight(res, 'act'); },
  pitsel: d => { const B = Game.pitTarget(d.id, !!d.ch); if (!B) return; pitSel = { id: d.id, ch: !!d.ch }; prepM = B; view = 'pitprep'; render(); },
  pitgo: () => { const s = pitSel; if (!s) return; const res = Game.pitFight(s.id, s.ch); if (!res) return render(); pitSel = null; prepM = null; showFight(res, 'arena'); },
  optset: d => { Sound.setOpt(d.k, +d.v); Sound.unlock(); if (d.k === 'sfx') Sound.play('hit'); render(); },
  pitbuy: d => { const e = Game.pitBuy(d.t, +d.k); if (e) alert(e); render(); },
  pittitle: d => { Game.pitTitle(d.t || null); G.save(); render(); },
  forgemode: d => { forgeSel.mode = d.m; forgeRes = null; forgeSel.msg = ''; render(); },
  craftpick: d => { forgeSel.item = d.id; forgeSel.stat = null; forgeSel.msg = ''; forgeSel.changed = null; render(); },
  craftstat: d => { forgeSel.stat = forgeSel.stat === d.k ? null : d.k; forgeSel.msg = ''; render(); },
  craftop: d => { const it = G.craftItems().find(x => x.id === forgeSel.item); const before = it ? { ...G.baseMods(it) } : {}, pw = G.power();
    const r = G.craft(forgeSel.item, d.o, forgeSel.stat);
    if (r.err) { forgeSel.msg = `<span class="down">${r.err}</span>`; return render(); }
    const after = G.baseMods(r.it); forgeSel.changed = Object.keys(after).filter(k => after[k] !== before[k]);
    const lost = Object.keys(before).filter(k => !(k in after));
    forgeSel.msg = `${r.op.name}: −${r.cost} Glut${lost.length ? ` · getilgt: ${lost.map(k => k === 'dmg' ? 'Schaden' : k).join(', ')}` : ''}${r.it.crafted ? ' · <b class="gold">vollendet</b>' : ''}`;
    if (d.o === 'seal') forgeSel.stat = null; render(); toast(pw); },
  forgeitem: d => { const S = G.S, it = findItem(d.id); if (!it) return; hideTip(); stopForge(); forgeRes = null;
    const slot = Object.entries(S.equip).find(([, x]) => x === it)?.[0];
    if (G.craftItems().includes(it)) Object.assign(forgeSel, { mode: 'craft', item: it.id, stat: null, msg: '', changed: null }); else Object.assign(forgeSel, { mode: 'rune' });
    if (slot) forgeSel.slot = slot; view = 'forge'; render(); },
  descc: d => { const list = Game.descCrypts(), i = Math.max(0, list.findIndex(c => c.id === descSt.c)), cur = list.some(c => c.id === descSt.c) ? i : list.length - 1;
    descSt.c = list[Math.max(0, Math.min(list.length - 1, cur + +d.d))].id; render(); },
  descgo: d => { if (Game.descStart(d.c)) { descSt = { c: d.c, j: null, msg: '', res: null }; view = 'desc'; } render(); },
  descsel: d => { descSt.j = descSt.j === d.j ? null : d.j; descSt.msg = ''; descSt.ask = false; render(); },
  descgo2: d => { const r = Game.descEnter(d.j); descSt.j = null; descSt.msg = ''; descSt.ask = false; if (!r) return render(); descResult(r); },
  descstair: () => { if (G.S.desc?.rooms && !descSt.ask) { descSt.ask = true; descSt.j = null; return render(); }   // zwei Tipps: erst fragen
    descSt.ask = false; const r = Game.descStair(); descSt.j = null; if (!r) return render();
    if (r.kind === 'back') { view = 'desc'; return render(); } descResult(r); },
  descok: () => { descSt.res = null; view = 'desc'; render(); },
  expsel: d => { if (d.h) { expSel.h = +d.h; expSel.path = []; } render(); },
  exploc: d => { const open = LOCATIONS.filter(G.locOpen), i = open.findIndex(l => l.id === expSel.loc), cur = i < 0 ? open.length - 1 : i;
    expSel.loc = open[Math.max(0, Math.min(open.length - 1, cur + +d.d))].id; expSel.path = []; render(); },
  exppath: d => { const r = +d.r, j = +d.j; if (d.l && d.l !== expSel.loc) { expSel.loc = d.l; expSel.path = []; } if (r > expSel.path.length) return; if (expSel.path[r] === j) expSel.path = expSel.path.slice(0, r); else expSel.path = [...expSel.path.slice(0, r), j]; render(); },
  expgo: d => { if (Game.startExped(d.l, expSel.h, expSel.path)) { expSel.loc = d.l; expSel.path = []; view = 'trips'; } render(); },
  expask: () => { expAsk = true; render(); },
  expno: () => { expAsk = false; render(); },
  expclaim: () => { expAsk = false; Game.expBegin(); const r = Game.expAdvance(); if (r?.done) expRes = r.done; view = 'trips'; render(); },
  expchoose: d => { const r = Game.expChoose(+d.i); if (r?.done) expRes = r.done; render(); },
  expok: () => { expRes = null; render(); },
  forgemat: d => { forgeSel.mat = d.m; render(); },
  forgeslot: d => { forgeSel.slot = d.s; render(); },
  forgeagain: () => { forgeRes = null; render(); },
  forgestart: () => startForge(),
  forgehit: () => forgeHit(),
  noop: () => {},
  skip: () => { F.step = F.log.length; clearTimeout(fightTimer); render(); },
};

// --- Schmiede-Minispiel: Glut-Marke pendelt, im richtigen Moment schlagen (DOM-Patch, kein Render pro Bild) ---
function stopForge() { if (FG) cancelAnimationFrame(FG.raf); FG = null; }
function startForge() {
  if (G.canForge(forgeSel.slot, forgeSel.mat)) return;
  const btn = document.getElementById('forgebtn'); if (!btn) return;
  btn.textContent = 'Schlag!'; btn.dataset.action = 'forgehit';
  FG = { hits: [], t0: performance.now(), center: 0.5, raf: 0 }; nextZone(); loop();
}
function nextZone() {
  FG.center = 0.25 + Math.random() * 0.5; FG.t0 = performance.now(); FG.offset = Math.random();
  const bar = document.querySelector('.iron'); if (!bar) return;
  bar.style.setProperty('--cz', FG.center);
  FORGE.zones.forEach(([w], i) => bar.querySelector('.z' + (3 - i)).style.setProperty('--w', w * 2));
}
const markPos = () => { const ph = (((performance.now() - FG.t0) / 1000) * FORGE.speed[FG.hits.length] + FG.offset) % 2; return ph < 1 ? ph : 2 - ph; };
function loop() { if (!FG) return; const m = document.querySelector('.fmark'); if (!m) return stopForge(); m.style.left = (markPos() * 100) + '%'; FG.raf = requestAnimationFrame(loop); }
function forgeHit() {
  if (!FG) return; const p = markPos(), d = Math.abs(p - FG.center), z = FORGE.zones.find(([w]) => d <= w), pts = z ? z[1] : 0;
  FG.hits.push(pts);
  const pip = document.querySelector(`.pips i[data-i="${FG.hits.length - 1}"]`); if (pip) pip.className = 'p' + pts;
  const call = document.querySelector('.fcall'); if (call) { call.textContent = z ? z[2] + '!' : 'Daneben'; call.className = 'fcall p' + pts; void call.offsetWidth; call.classList.add('pop'); }
  const sc = document.querySelector('.scene'); if (sc) { sc.classList.remove('clang'); void sc.offsetWidth; sc.classList.add('clang'); }
  // Funken am Einschlag – mehr und heller, je besser der Schlag
  const sp = document.querySelector('.sparks');
  if (sp) for (let i = 0; i < 4 + pts * 6; i++) { const f = document.createElement('i'); f.className = 'p' + pts;
    f.style.left = (14.6 + p * 71) + '%'; f.style.setProperty('--x', (Math.random() * 2 - 1) * (30 + pts * 25) + 'px'); f.style.setProperty('--y', -(20 + Math.random() * (30 + pts * 30)) + 'px');
    sp.appendChild(f); setTimeout(() => f.remove(), 700); }
  if (FG.hits.length < FORGE.hits) return nextZone();
  const score = FG.hits.reduce((a, b) => a + b, 0); stopForge();
  const pw = G.power(); setTimeout(() => { forgeRes = G.forge(forgeSel.slot, forgeSel.mat, score); render(); if (forgeRes) toast(pw); }, 500);
}

// --- Eingabe ---
const TOUCH = matchMedia('(hover: none)').matches;
const ACT_LABEL = { equip: 'Anlegen', unequip: 'Ablegen', buy: 'Kaufen', pitbuy: 'Kaufen', sell: 'Verkaufen' };
document.addEventListener('pointerdown', () => Sound.unlock(), { passive: true });
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
  if (a === 'buy') btns += `<button data-action="shoplock" data-t="${d.t}" data-id="${it.id}">${it.lock ? 'Entsperren' : 'Sperren'}</button>`;
  if (a === 'equip') btns += `<button class="red" data-action="sell" data-id="${it.id}">Verkaufen · ${it.value}</button>`;
  const slot = Object.entries(G.S.equip).find(([, x]) => x === it)?.[0];   // Schmieden: Umschmieden (magisch+), sonst Runen (nur angelegt)
  if ((a === 'equip' || a === 'unequip') && (G.craftItems().includes(it) || slot)) btns += `<button data-action="forgeitem" data-id="${it.id}">Schmieden</button>`;
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
  return [...S.bag, ...shops, ...Object.values(S.equip).filter(Boolean), ...Object.values(G.S.pit?.shop || {}).flat().filter(w => w.item).map(w => w.item), ...(S.desc?.sack.items || [])].find(x => x.id === id);
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
  const nav = document.querySelector('nav.tabs'), dots = JSON.stringify(UI.readyDots());
  if (nav && nav.dataset.dots !== dots) { if (nav.dataset.dots) nav.outerHTML = UI.navBar(view).replace('<nav class="tabs"', `<nav class="tabs" data-dots='${dots}'`); else nav.dataset.dots = dots; }
  for (const el of document.querySelectorAll('[data-until]')) {
    const left = Math.ceil((+el.dataset.until - Date.now()) / 1000);
    if (left <= 0) return render();
    el.textContent = UI.fmtT(left);
  }
}, 1000);

// iOS-Homescreen-App: Höhe = was iOS wirklich zeichnet (inset 0). Ist der Viewport kürzer als der Bildschirm,
// liegt der Home-Balken außerhalb – dann keinen Sicherheitsabstand unter den Tabs verschwenden.
const STANDALONE = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
function fitApp() {
  const portrait = innerHeight >= innerWidth, full = portrait ? screen.height : screen.width;
  document.documentElement.classList.toggle('shortvp', full - innerHeight > 40); fitPrep();
}
addEventListener('resize', fitApp); addEventListener('orientationchange', () => setTimeout(fitApp, 300)); fitApp(); document.fonts?.ready.then(fitPrep);
// Anzeige-Info: Titel antippen zeigt die Maße (zum Fehlersuchen am Handy)
document.addEventListener('click', e => { if (!e.target.closest('.hud .ttl')) return;
  const cs = getComputedStyle(document.documentElement), t = document.querySelector('.tabs')?.getBoundingClientRect();
  alert(`innen ${innerWidth}×${innerHeight} · Bildschirm ${screen.width}×${screen.height} · sichtbar ${Math.round(visualViewport?.height || 0)} · Tabs unten ${Math.round(t?.bottom || 0)} · ${STANDALONE ? 'App' : 'Browser'}`); });
G.load(); render();
