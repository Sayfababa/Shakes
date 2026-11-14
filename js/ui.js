// Rendering: reine String-Templates. Keine Spiellogik.
import { NPCS, CLASSES, ATTRS, SLOTS, RARITIES, CFG, TALENTS, EFFECT_NAMES, CRYPTS, DIFFICULTIES, LOCATIONS, TRADERS, LOYALTY, MATS, INV_W, INV_H } from './data.js';
import { S, stats, xpNeed, rank, talentPoints, talentState, respecCost, cryptFloor, cryptOpen, cryptLvl, locOpen, locLvl, tripReward, loyalty, shopFor } from './state.js';
import { current, available, objectives, canComplete } from './quests.js';
import { itemArt, ghost, NPC_ART, MON } from './art.js';

const P = cls => `assets/portraits/${CLASSES[cls].portrait}.jpg`;
const rarName = id => RARITIES.find(r => r.id === id)?.name || '';
export const fmtT = s => `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, '0')}`;
const pct = (a, b) => Math.max(0, Math.min(100, (a / b) * 100));
const effLine = e => Object.entries(e).map(([k, v]) => `${EFFECT_NAMES[k]}${k === 'first' ? '' : ' +' + Math.round(v * 100) + '%'}`).join(', ');

// Gemalte Monster/Bosse in assets/monsters/<glyph>.jpg, sonst SVG-Silhouette
const MON_IMG = new Set(['gerlinde', 'aldemar', 'butcher', 'bellringer']);
export const monsterArt = g => MON_IMG.has(g) ? `<img class="portrait monster" src="assets/monsters/${g}.jpg" alt="">`
  : `<div class="portrait monster"><svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#070403"/>${MON[g] || MON.skull}</svg></div>`;
const npcArt = g => NPC_ART[g] ? `<div class="portrait npc"><svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#0a0705"/>${NPC_ART[g]}</svg></div>` : `<img class="portrait npc" src="assets/npcs/${g}.jpg" alt="">`;
// Sprecher-Leiste: kleines Portrait + wechselnder Satz
const say = id => { const n = NPCS[id], line = n.lines[Math.floor(Date.now() / 60000) % n.lines.length];
  return `<section class="panel speaker">${npcArt(id)}<div><b>${n.name}</b> <span class="h2r">${n.role}</span><p class="lore">„${line}“</p></div></section>`; };

// --- Items ---
export function itemTip(it, cmp) {
  const L = [`<div class="n r-${it.rarity}">${it.name}</div><div class="sub2">${rarName(it.rarity)} · ${SLOTS[it.slot]} · Stufe ${it.lvl}</div>`];
  if (it.dmg) L.push(`Schaden <b>${it.dmg[0]}–${it.dmg[1]}</b>`);
  if (it.armor) L.push(`Rüstung <b>${it.armor}</b>`);
  for (const [k, v] of Object.entries(it.mods)) L.push(`<span class="m">+${v} ${k === 'armor' ? 'Rüstung' : k === 'dmg' ? 'Schaden' : ATTRS[k]}</span>`);
  L.push(`<span class="sub2">${it.price ? 'Preis' : 'Wert'}: ${it.price ?? it.value} Gold</span>`);
  if (cmp && cmp !== it) {
    const sc = x => (x.dmg ? (x.dmg[0] + x.dmg[1]) : 0) + (x.armor || 0) + Object.values(x.mods).reduce((a, b) => a + b, 0) * 1.5;
    const d = Math.round(sc(it) - sc(cmp));
    L.push(`<span class="cmp ${d >= 0 ? 'up' : 'down'}">${d >= 0 ? 'Besser' : 'Schlechter'} als ${cmp.name}</span>`);
  } else if (!cmp && it.slot) L.push('<span class="cmp up">Platz ist frei</span>');
  return L[0] + L.slice(1).join('<br>');
}
const itemEl = (it, act) => `<div class="item r-${it.rarity}" data-tip="${it.id}" ${act}>${itemArt(it)}</div>`;

// --- Rahmen ---
export function hud() {
  return `<header class="hud">
    <div class="hud-row"><span class="ttl">Aschenkrone</span>
      <span class="res"><span>Gold <b>${S.gold}</b></span><span>Stufe <b>${S.lvl}</b></span></span></div>
    <div class="hud-row bars">
      <div><small>Erfahrung</small><div class="bar xp"><i style="width:${pct(S.xp, xpNeed(S.lvl))}%"></i></div></div>
      <div><small>Glut ${S.glut}</small><div class="bar glut"><i style="width:${pct(S.glut, CFG.maxGlut)}%"></i></div></div>
    </div></header>`;
}
export function navBar(view) {
  const tabs = [['hero', 'Held'], ['trips', 'Streifzug'], ['traders', 'Händler'], ['crypt', 'Krypta'], ['arena', 'Grube']];
  const map = { stats: 'hero', talents: 'hero' };
  const badge = { hero: S.points + talentPoints() > 0, crypt: Date.now() >= S.crypt.cd, traders: Object.keys(TRADERS).some(canComplete), trips: !S.active || Date.now() >= S.active.end };
  const on = map[view] || view;
  return `<nav class="tabs">${tabs.map(([k, n]) => `<a class="${on === k ? 'on' : ''} ${badge[k] ? 'badge' : ''}" data-action="go" data-v="${k}">${n}</a>`).join('')}</nav>`;
}

export function viewCreate(sel) {
  return `<div class="create"><h1>Aschenkrone</h1><div class="sub">Die Glocke hat geschlagen. Die Toten stehen auf.</div>
  <div class="classes">${Object.entries(CLASSES).map(([k, c]) =>
    `<div class="cls ${sel === k ? 'on' : ''}" data-action="pick" data-c="${k}"><img class="portrait" src="${P(k)}" alt=""><div class="lbl">${c.name}</div></div>`).join('')}</div>
  ${sel ? `<p class="cdesc"><b>${CLASSES[sel].name}.</b> ${CLASSES[sel].desc}</p>
  <div class="cname"><input id="nm" maxlength="16" placeholder="Dein Name"><button class="red" data-action="create">Erwachen</button></div>` : '<p class="sub">Wähle, wer du warst.</p>'}</div>`;
}

// --- Held: Ausrüstungsfigur + Raster-Inventar ---
export function viewHero() {
  const rk = rank(), st = stats(), pts = S.points + talentPoints();
  const slot = s => { const it = S.equip[s]; return `<div class="eslot es-${s} ${it ? 'r-' + it.rarity : ''}" ${it ? `data-tip="${it.id}" data-action="unequip" data-s="${s}"` : ''}>${it ? itemArt(it) : `<span class="ghost">${ghost(s)}</span>`}</div>`; };
  const mats = Object.entries(S.mats).filter(([, n]) => n > 0);
  return `<div class="hero">
    <section class="panel doll">
      <div class="dcol">${slot('helm')}${slot('weapon')}${slot('gloves')}</div>
      <div class="dmid">
        <img class="portrait fr-${rk.frame}" src="${P(S.cls)}" alt="">
        <div class="plate"><b>${S.name}</b><span>${rk.title} · ${CLASSES[S.cls].name}</span></div>
        <div class="drow">${slot('ring1')}${slot('belt')}${slot('ring2')}</div>
      </div>
      <div class="dcol">${slot('amulet')}${slot('chest')}${slot('offhand')}${slot('boots')}</div>
    </section>
    <div class="herobar">
      <span>Leben <b>${st.hp}</b></span><span>Schaden <b>${st.dmg[0]}–${st.dmg[1]}</b></span><span>Rüstung <b>${st.armor}</b></span>
      <button class="${pts ? 'red' : ''}" data-action="go" data-v="stats">Werte${S.points ? ' ·' + S.points : ''}</button>
      <button class="${talentPoints() ? 'red' : ''}" data-action="go" data-v="talents">Talente${talentPoints() ? ' ·' + talentPoints() : ''}</button>
    </div>
    <section class="panel invp"><div class="invhead"><span>Beutel</span><button class="tiny" data-action="sort">Ordnen</button></div>
      <div class="inv" style="--w:${INV_W};--h:${INV_H}">
        ${S.bag.map(it => `<div class="cellitem r-${it.rarity}" style="left:${it.x / INV_W * 100}%;top:${it.y / INV_H * 100}%;width:${it.w / INV_W * 100}%;height:${it.h / INV_H * 100}%" data-tip="${it.id}" data-action="equip" data-id="${it.id}">${itemArt(it)}</div>`).join('')}
      </div>
      <div class="mats">${mats.length ? mats.map(([k, n]) => `<span>${MATS[k]} <b>${n}</b></span>`).join('') : '<span class="dim">Keine Materialien. Monster lassen sie fallen.</span>'}</div>
    </section>
  </div>`;
}

export function viewStats() {
  const st = stats(), c = CLASSES[S.cls], rc = respecCost();
  return `<div class="col">
    <section class="panel"><h2>Werte <span class="h2r">${S.points ? `<b class="hot">${S.points}</b> Punkte frei` : ''}</span></h2>
      ${Object.entries(ATTRS).map(([k, n]) => `<div class="stat"><span>${n}${k === c.main ? ' <i class="dim">(Haupt)</i>' : ''}</span><span><b>${st[k]}</b>${S.points ? ` <button data-action="attr" data-k="${k}">+</button>` : ''}</span></div>`).join('')}
    </section>
    <section class="panel"><h2>Kampf</h2>
      <div class="stat"><span>Leben</span><b>${st.hp}</b></div><div class="stat"><span>Schaden</span><b>${st.dmg[0]}–${st.dmg[1]}</b></div>
      <div class="stat"><span>Rüstung</span><b>${st.armor}</b></div><div class="stat"><span>Siege / Tode</span><b>${S.wins} / ${S.deaths}</b></div>
      <p class="dim small">${effLine(Object.fromEntries(Object.entries(stats()).filter(([k]) => EFFECT_NAMES[k] && !['dmgPct', 'hpPct', 'armorPct'].includes(k))))}</p></section>
    <section class="panel grow"><h2>Trophäen <span class="h2r">${S.trophies.length}</span></h2>
      ${S.trophies.map(t => `<div class="stat"><span>${t.name} <i class="dim">${t.diff}</i></span><span class="m small">${effLine(t.eff)}</span></div>`).join('') || '<p class="dim small">Besiege die Herren der Krypten.</p>'}</section>
    <div class="btns"><button data-action="go" data-v="hero">Zurück</button><button data-action="respec" ${S.gold < rc ? 'disabled' : ''}>Läutern ${rc ? rc + ' Gold' : '(gratis)'}</button><button class="dim" data-action="wipe">Neu beginnen</button></div>
  </div>`;
}

export function viewTalents() {
  const tp = talentPoints();
  return `<div class="col"><section class="panel"><h2>Talente <span class="h2r">${tp ? `<b class="hot">${tp}</b> Punkte` : 'keine Punkte'}</span><button class="tiny" data-action="go" data-v="hero">Zurück</button></h2></section>
    <div class="tree">${TALENTS[S.cls].map((br, bi) => `<section class="panel branch"><h3>${br.name}</h3>
      ${br.nodes.map((_, ti) => { const t = talentState(S.cls, bi, ti);
        return `<div class="tal ${t.r ? 'has' : ''} ${t.locked ? 'locked' : ''} ${t.can ? 'can' : ''}" data-action="learn" data-b="${bi}" data-t="${ti}">
          <div class="tn">${t.node.name}</div><div class="tr">${t.locked && S.lvl < t.needLvl ? `ab Stufe ${t.needLvl}` : `${t.r} / ${t.node.max}`}</div>
          <div class="te">${effLine(t.node.eff)}${t.node.max > 1 ? ' je Rang' : ''}</div></div>`; }).join('<div class="link"></div>')}
    </section>`).join('')}</div></div>`;
}

// --- Streifzüge ---
export function viewTrips() {
  if (S.active) {
    const a = S.active, l = LOCATIONS.find(x => x.id === a.loc), left = Math.ceil((a.end - Date.now()) / 1000);
    return `<div class="col"><section class="panel waiting"><h2>${l.name}</h2><p class="lore">${l.text}</p>
      <p class="dim">Du folgst einer Spur: <b>${a.mob}</b>.</p>
      ${left > 0 ? `<div class="big">${fmtT(left)}</div><button data-action="rush" ${S.gold < 1 ? 'disabled' : ''}>Eilen · 1 Gold</button>`
                 : `<button class="red big-btn" data-action="resolve">Stellen</button>`}</section>
      ${say('prophet')}<section class="panel grow journal"><h2>Tagebuch</h2>${S.journal.slice(0, 6).map(j => `<div>${j.t}</div>`).join('')}</section></div>`;
  }
  return `<div class="trips">${LOCATIONS.map(l => { const open = locOpen(l), r = tripReward(l, 1, (l.sec[0] + l.sec[1]) / 2);
    const wanted = new Set(Object.keys(TRADERS).filter(available).flatMap(t => current(t).obj.filter(o => o.at === l.id || l.mobs.includes(o.kill)).map(() => t)));
    return `<section class="panel trip ${open ? '' : 'locked'} ${S.glut < l.glut ? 'tired' : ''}" ${open ? `data-action="trip" data-id="${l.id}"` : ''}>
      <h3>${l.name}${open && wanted.size ? '<span class="qmark" title="Auftrag">!</span>' : ''}</h3><p class="lore small">${l.text}</p>
      ${open ? `<div class="mobs">${l.mobs.join(' · ')}</div>
      <div class="tripinfo"><span>Stufe ${locLvl(l)}</span><span>${fmtT(l.sec[0])}–${fmtT(l.sec[1])}</span><span>${l.glut} Glut</span><span>~${r.gold} Gold</span></div>` : `<div class="mobs">Erst ab Stufe ${l.lvl}</div>`}
    </section>`; }).join('')}</div>`;
}

// --- Händler ---
export function viewTrader(tid) {
  const t = TRADERS[tid], st = S.traders[tid], L = loyalty(tid), q = current(tid);
  const next = L + 1 < t.need.length ? `${st.rep}/${t.need[L + 1]} Ruf${S.lvl < t.lvl[L + 1] ? ` · Stufe ${t.lvl[L + 1]}` : ''}` : 'Höchste Treue';
  const objs = objectives(tid);
  let note;
  if (!q) note = `<div class="note done"><p>„Du hast mehr getan als jeder andere. Komm wieder, wenn die Glocke erneut schlägt.“</p></div>`;
  else if (!available(tid)) note = `<div class="note sealed"><h4>${q.title}</h4><p>„Komm wieder, wenn du Stufe ${q.lvl} erreicht hast. Vorher bist du mir keine Hilfe.“</p></div>`;
  else note = `<div class="note"><h4>${q.title}</h4><p>${q.text}</p>
    <ul>${objs.map(o => `<li class="${o.done ? 'ok' : ''}">${o.label} <b>${o.cur}/${o.n}</b></li>`).join('')}</ul>
    <div class="rew">Lohn: ${q.rew.gold} Gold · ${q.rew.xp} EP · ${q.rew.rep} Ruf${q.rew.item ? ` · ${SLOTS[q.rew.item.slot]} (${RARITIES[q.rew.item.rar].name})` : ''}</div>
    ${canComplete(tid) ? `<button class="red" data-action="turnin" data-t="${tid}">Abgeben</button>` : ''}</div>`;
  const shop = shopFor(tid);
  return `<div class="col trader">
    <nav class="subtabs">${Object.entries(TRADERS).map(([k, x]) => `<a class="${k === tid ? 'on' : ''} ${canComplete(k) ? 'badge' : ''}" data-action="trader" data-t="${k}">${x.name}</a>`).join('')}</nav>
    <section class="panel npcrow">${npcArt(t.glyph)}
      <div><h2>${t.name} <span class="h2r">${t.role}</span></h2><p class="lore">„${t.quote}“</p>
        <div class="loyal"><span>Treue <b>${LOYALTY[L]}</b></span><div class="bar rep"><i style="width:${L + 1 < t.need.length ? pct(st.rep - t.need[L], t.need[L + 1] - t.need[L]) : 100}%"></i></div><small>${next}</small></div></div>
    </section>
    ${note}
    <section class="panel shop"><div class="invhead"><span>Ware</span><small class="dim">bessere Ware mit höherer Treue</small></div>
      <div class="shoprow">${shop.map(it => `<div class="sitem r-${it.rarity}" data-tip="${it.id}" data-action="buy" data-t="${tid}" data-id="${it.id}">${itemArt(it)}<span class="price ${S.gold < it.price ? 'no' : ''}">${it.price}</span></div>`).join('') || '<span class="dim">Ausverkauft.</span>'}</div></section>
  </div>`;
}

// --- Krypten ---
export function viewCrypts() {
  const d = DIFFICULTIES[S.crypt.diff], cd = Math.max(0, Math.ceil((S.crypt.cd - Date.now()) / 1000));
  return `<div class="col">${say('ilse')}<section class="panel"><h2>Die Krypten <span class="h2r">${d.name} · ${cd ? `Erholung ${fmtT(cd)}` : 'bereit'}</span></h2></section>
    ${CRYPTS.map(c => { const f = cryptFloor(c), open = cryptOpen(c), done = f >= 5;
      const troph = S.trophies.some(t => t.key === c.id + ':' + S.crypt.diff);
      return `<section class="panel crypt ${!open ? 'locked' : ''} ${done ? 'done' : ''}" ${open && !done && !cd ? `data-action="crypt" data-id="${c.id}"` : ''}>
        ${monsterArt(c.boss.glyph)}
        <div><h3>${c.name}</h3>
          <p class="small">${!open ? `Versiegelt bis Stufe ${c.lvl + d.lvlAdd - 2}` : done ? `${c.boss.name} ist gefallen.` : f === 4 ? `<span class="hot">${c.boss.name}</span>` : `Ebene ${f + 1}: ${c.floors[f]} · Stufe ${cryptLvl(c, f)}`}</p>
          <div class="floors">${[0, 1, 2, 3, 4].map(i => `<i class="${i < f ? 'on' : ''} ${i === 4 ? 'boss' : ''}"></i>`).join('')}</div>
          <div class="dim small">Trophäe: ${effLine(c.trophy)}${troph ? ' · errungen' : ''}</div></div></section>`; }).join('')}</div>`;
}

export function viewArena(rival) {
  const cd = Math.max(0, Math.ceil((S.arenaTs - Date.now()) / 1000));
  return `<div class="col">${say('vargo')}<section class="panel arena"><img class="portrait" src="${P(rival.cls)}" alt="">
    <h2>${rival.name}</h2><p class="dim">${CLASSES[rival.cls].name} · Stufe ${rival.lvl}</p>
    
    <p class="small">Sieg: ${rival.lvl * 3} Gold, 10 Ehre · Niederlage: 5 Ehre · Deine Ehre: <b>${S.honor}</b></p>
    <div class="btns"><button class="red" data-action="arena" ${cd ? 'disabled' : ''}>${cd ? `Erschöpft ${fmtT(cd)}` : 'Herausfordern'}</button>
    <button data-action="rival">Anderer Gegner</button></div></section></div>`;
}

export function viewFight(F) {
  const side = (f, hp, max, hit) => `<div class="fighter ${hit ? 'hit' : ''}">${f.cls ? `<img class="portrait" src="${P(f.cls)}" alt="">` : monsterArt(f.glyph)}
    <div class="nm">${f.name}</div><div class="bar"><i style="width:${pct(hp, max)}%"></i></div><div class="hp">${Math.max(0, hp)} / ${max}</div></div>`;
  const shown = F.log.slice(0, F.step), last = shown[shown.length - 1] || {};
  const hpA = last.hpA ?? F.hpA, hpB = last.hpB ?? F.hpB, done = F.step >= F.log.length;
  return `<div class="panel fightwrap"><div class="fight">
    ${side(F.A, hpA, F.hpA, last.who === 'b')}
    <div><div class="log" id="log">${shown.map(l => `<div class="${l.who} ${l.crit ? 'crit' : ''}">${l.t}</div>`).join('')}</div>
      ${done ? `<div class="result ${F.winner === 'a' ? 'win' : 'lose'}">${F.winner === 'a' ? 'Sieg' : 'Gefallen'}</div>
        <div class="loot-drop">${F.reward || ''}</div><button class="red" data-action="go" data-v="${F.back}">Weiter</button>`
        : `<button data-action="skip">Überspringen</button>`}</div>
    ${side(F.B, hpB, F.hpB, last.who === 'a')}
  </div></div>`;
}

export function viewTurnin(r, tid) {
  return `<div class="col"><section class="panel turnin">${npcArt(TRADERS[tid].glyph)}<h2>${r.q.title}</h2>
    <p class="lore">„Gut. Das hier ist deins.“ – ${TRADERS[tid].name}</p>
    <p>${r.gold} Gold · ${r.xp} EP · ${r.rep} Ruf</p>
    ${r.item ? `<p>Erhalten: <span class="r-${r.item.rarity}">${r.item.name}</span>${r.item.sold ? ' <i class="dim">(Beutel voll, verkauft)</i>' : ''}</p>` : ''}
    ${r.up ? `<p class="hot">Stufe ${S.lvl}! ${r.up * CFG.attrPerLevel} Attributpunkte, ${r.up} Talentpunkt</p>` : ''}
    ${r.loyaltyUp ? `<p class="gold">Treue steigt auf ${LOYALTY[loyalty(tid)]}. Neue Ware.</p>` : ''}
    <button class="red" data-action="trader" data-t="${tid}">Weiter</button></section></div>`;
}
