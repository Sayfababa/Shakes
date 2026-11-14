// Rendering: reine String-Templates. Keine Spiellogik.
import { CRAFT, TIERS, RUNES, FORGE, GRADES, ATTR_INFO, SPELLS, MONSTERS, NPCS, CLASSES, ATTRS, SLOTS, RARITIES, CFG, TALENTS, EFFECT_NAMES, CRYPTS, DIFFICULTIES, LOCATIONS, TRADERS, LOYALTY, MATS, INV_W, INV_H, SERVICES, SHARD_CRYPTS, TUTORIAL, TRACKS, DELVE, BOUNTIES } from './data.js';
import { craftItems, craftCheck, craftGold, baseMods, forgeTargets, canForge, forgeQuestMat, power, powerWith, powerAttr, S, stats, xpNeed, rank, talentPoints, talentState, respecCost, cryptFloor, cryptOpen, cryptLvl, locOpen, locLvl, tripReward, loyalty, shopFor, omen, serviceState, rushCost, bounties, bountyReward } from './state.js';
import { current, available, objectives, canComplete } from './quests.js';
import { itemArt, ghost, NPC_ART, MON } from './art.js';
import { gradeOf, tripChance, cryptChance, threatLabel, canDelve, delveChance } from './game.js';
const threat = p => { const [t, c] = threatLabel(p); return `<span class="threat t-${c}">Gefahr: ${t}</span>`; };

const P = cls => `assets/portraits/${CLASSES[cls].portrait}.jpg`;
const rarName = (id, it) => it?.unique ? 'Einzigartig' : RARITIES.find(r => r.id === id)?.name || '';
export const fmtT = s => `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, '0')}`;
export const fmtN = n => n.toLocaleString('de-DE');
// Kampfkraft-Änderung durch ein Item (in %), null wenn nicht vergleichbar
export const itemGain = it => { if (!it?.slot || Object.values(S.equip).includes(it)) return null; const p = powerWith(it); return (p.then - p.now) / Math.max(1, p.now); };
const gainTag = it => { const g = itemGain(it); return g > 0.01 ? `<i class="better" title="besser">▲</i>` : ''; };
const pct = (a, b) => Math.max(0, Math.min(100, (a / b) * 100));
const effLine = e => Object.entries(e).map(([k, v]) => `${EFFECT_NAMES[k]}${k === 'first' || k === 'toll' ? '' : ' +' + Math.round(v * 100) + '%'}`).join(', ');

// Gemalte Monster/Bosse in assets/monsters/<glyph>.jpg, sonst SVG-Silhouette
const MON_IMG = new Set(['gerlinde', 'aldemar', 'butcher', 'bellringer', 'ghul', 'fallen', 'skelett', 'grabraeuber', 'pestratte', 'kultist',
  'blutfuerst', 'sumpfhexe', 'knochenhund', 'gehaeuteter', 'hoellenbrut', 'wiedergaenger']);
export const monsterArt = g => g === 'self' ? `<img class="portrait monster crownless" src="${P(S.cls)}" alt="">` : MON_IMG.has(g) ? `<img class="portrait monster" src="assets/monsters/${g}.jpg" alt="">`
  : `<div class="portrait monster"><svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#070403"/>${MON[g] || MON.skull}</svg></div>`;
const npcArt = g => NPC_ART[g] ? `<div class="portrait npc"><svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#0a0705"/>${NPC_ART[g]}</svg></div>` : `<img class="portrait npc" src="assets/npcs/${g}.jpg" alt="">`;
// Sprecher-Leiste: kleines Portrait + wechselnder Satz
const say = (id, line) => { const n = NPCS[id]; line ||= n.lines[Math.floor(Date.now() / 60000) % n.lines.length];
  const mark = canComplete(id) ? '<span class="qmark">?</span>' : available(id) ? '<span class="qmark">!</span>' : '';
  return `<section class="panel speaker" data-action="npc" data-n="${id}">${npcArt(id)}<div><b>${n.name}</b> <span class="h2r">${n.role}</span>${mark}<p class="lore">„${line}“</p></div></section>`; };
const omenLine = () => { if (S.lvl < 3) return 'Ich sehe noch nichts für dich, Kind. Werde stärker – ab Stufe 3 spreche ich.'; const o = omen(); return `${o.place.name}: ${o.def.text}${o.done ? ' (erfüllt)' : ''}`; };

// Quest-Zettel (für Händler und Figuren)
function questNote(tid) {
  const q = current(tid), objs = objectives(tid);
  if (!q) return `<div class="note done"><p>„Du hast getan, worum ich dich bat. Mehr kann ich nicht verlangen.“</p></div>`;
  if (!available(tid)) return `<div class="note sealed"><h4>${q.title}</h4><p>„Komm wieder, wenn du Stufe ${q.lvl} erreicht hast.“</p></div>`;
  const r = q.rew, extra = [r.item ? `${SLOTS[r.item.slot]} (${RARITIES[r.item.rar].name})` : '', r.perk ? `Segen: ${r.perk.name}` : '', r.rep ? `${r.rep} Ruf` : ''].filter(Boolean);
  const champOpen = q.champ && objs.some(o => !o.done) && Date.now() >= S.arenaTs;
  return `<div class="note"><h4>${q.title}</h4><p>${q.text}</p>
    <ul>${objs.map(o => `<li class="${o.done ? 'ok' : ''}">${o.label} <b>${o.cur}/${o.n}</b></li>`).join('')}</ul>
    <div class="rew">Lohn: ${r.gold} Gold · ${r.xp} EP${extra.length ? ' · ' + extra.join(' · ') : ''}</div>
    ${q.champ && objs.some(o => !o.done) ? `<button class="red" data-action="champ" data-t="${tid}" ${champOpen ? '' : 'disabled'}>Herausfordern: ${q.champ.name}</button>` : ''}
    ${canComplete(tid) ? (q.choice ? `<div class="btns">${q.choice.map(c => `<button class="red" data-action="turnin" data-t="${tid}" data-c="${c.id}">${c.label}</button>`).join('')}</div>`
      : `<button class="red" data-action="turnin" data-t="${tid}">Abgeben</button>`) : ''}</div>`;
}

// --- Items ---
export function itemTip(it, cmp) {
  const L = [`<div class="n r-${it.rarity}">${it.name}${it.up ? ` +${it.up}` : ''}</div><div class="sub2">${rarName(it.rarity, it)} · ${SLOTS[it.slot]} · Stufe ${it.lvl}</div>`];
  if (it.dmg) L.push(`Schaden <b>${it.dmg[0]}–${it.dmg[1]}</b>`);
  if (it.armor) L.push(`Rüstung <b>${it.armor}</b>`);
  // Boni ohne Runen-Anteil, mit Stufe (I = beste)
  const runeOf = k => (it.runes || []).filter(r => r.stat === k).reduce((a, r) => a + r.v, 0);
  for (const [k, v] of Object.entries(it.mods)) { const b = v - runeOf(k); if (b <= 0) continue; const t = it.tiers?.[k];
    L.push(`<span class="m ${t && t <= 2 ? 'hi' : ''}">+${b}${k === 'haste' ? ' % Zaubertempo' : ' ' + (k === 'armor' ? 'Rüstung' : k === 'dmg' ? 'Schaden' : ATTRS[k])}${t ? ` <i class="tier t${t}">${TIERS[t - 1].name}</i>` : ''}</span>`); }
  if (it.fx) L.push(`<span class="special">${it.unique ? '' : '✦ '}${effLine(it.fx)}</span>`);
  if (it.lore) L.push(`<span class="lore small">„${it.lore}“</span>`);
  if (it.crafted) L.push(`<span class="gold small">Geschmiedet von ${it.crafted}</span>`); else if (it.glutMax) L.push(`<span class="sub2">Schmiedeglut ${it.glut}/${it.glutMax}${it.sealed ? ' · 1 Bonus versiegelt' : ''}</span>`);
  if (it.runes?.length || it.slot) { const rn = it.runes || []; if (rn.length) L.push(`<span class="rune">Runen ${rn.length}/${FORGE.maxRunes}: ${rn.map(r => `${r.mat ? `<img class="tiprune" src="assets/forge/r_${r.mat}.webp" alt="">` : ''}${r.name} +${r.v}`).join(', ')}</span>`); }
  if (it.slot === 'weapon') { const ck = CLASSES[S.cls].weapon; L.push(it.kind === ck ? `<span class="gold">Waffe deiner Klasse</span>`
    : `<span class="down">Fremde Waffe: Schaden −${Math.round((1 - CFG.offWeapon) * 100)} %, Zauber −${Math.round((1 - CFG.offWeaponSpell) * 100)} %</span>`); }
  L.push(`<span class="sub2">${it.price ? 'Preis' : 'Wert'}: ${it.price ?? it.value} Gold</span>`);
  if (it.slot && !Object.values(S.equip).includes(it)) {
    const p = powerWith(it), a = stats(), b = p.st, g = (p.then - p.now) / Math.max(1, p.now);
    const row = (n, x, y, f = v => fmtN(Math.round(v))) => { const d = y - x; return Math.abs(d) < 0.5 ? '' : `<span class="${d > 0 ? 'up' : 'down'}">${n} ${d > 0 ? '+' : '−'}${f(Math.abs(d))}</span>`; };
    const diffs = [row('Schaden', (a.dmg[0] + a.dmg[1]) / 2, (b.dmg[0] + b.dmg[1]) / 2), row('Leben', a.hp, b.hp), row('Rüstung', a.armor, b.armor)].filter(Boolean);
    L.push(`<div class="cmpbox ${g > 0.005 ? 'up' : g < -0.005 ? 'down' : ''}"><div class="kk">Kampfkraft ${fmtN(p.now)} → <b>${fmtN(p.then)}</b> <span>${g >= 0 ? '+' : '−'}${Math.abs(Math.round(g * 100))} %</span></div>`
      + `<div class="sub2">${p.old ? 'statt ' + p.old.name : 'Platz ist frei'}</div>${diffs.length ? `<div class="dl">${diffs.join(' · ')}</div>` : ''}</div>`);
  }
  return L[0] + L.slice(1).map(x => x.startsWith('<div') ? x : x + '<br>').join('').replace(/<br>$/, '');
}
const itemEl = (it, act) => `<div class="item r-${it.rarity}" data-tip="${it.id}" ${act}>${itemArt(it)}${gainTag(it)}</div>`;

// --- Rahmen ---
export function hud(tut = '') {
  return `<header class="hud">
    <div class="hud-row"><span class="ttl">${S.name}${S.title ? ` <small>${S.title}</small>` : ''}</span>
      <span class="res"><span class="coin"></span><b>${S.gold}</b><span class="lvl">Stufe <b>${S.lvl}</b></span>
      <span class="orb" style="--f:${pct(S.glut, CFG.maxGlut)}%" title="Glut"><b>${S.glut}</b></span></span></div>
    ${tut || `<div class="xpline"><div class="bar xp"><i style="width:${pct(S.xp, xpNeed(S.lvl))}%"></i></div><small>${S.xp} / ${xpNeed(S.lvl)} EP</small></div>`}</header>`;
}
export function navBar(view) {
  const tabs = [['hero', 'Held'], ['trips', 'Streifzug'], ['traders', 'Händler'], ['crypt', 'Krypta'], ['arena', 'Grube']];
  const map = { forge: 'traders', stats: 'hero', talents: 'hero', spells: 'hero', npc: 'trips', bounties: 'trips', trippick: 'trips' };
  // Nur echte Handlungsaufforderungen markieren – ein Dauer-Punkt auf jedem Tab sagt nichts mehr
  const badge = { hero: S.points + talentPoints() > 0, traders: Object.keys(TRADERS).some(canComplete), arena: canComplete('vargo'),
    crypt: canComplete('ilse'), trips: !!S.haul || canComplete('prophet') || bounties().some(b => !b.claimed && b.prog >= b.n) || (!!S.active && Date.now() >= S.active.end) };
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
      <div class="dside">${slot('helm')}${slot('weapon')}${slot('gloves')}${slot('ring1')}</div>
      <div class="dmid"><div class="pfill"><img class="portrait fr-${rk.frame}" src="${P(S.cls)}" alt="" title="${rk.title}"></div><div class="drow">${slot('chest')}${slot('belt')}</div></div>
      <div class="dside">${slot('amulet')}${slot('offhand')}${slot('boots')}${slot('ring2')}</div>
    </section>
    <div class="herobar">
      <span class="kkline">Kampfkraft <b>${fmtN(power(st))}</b></span>
      <button class="${S.points ? 'red' : ''}" data-action="go" data-v="stats">Werte${S.points ? ' ·' + S.points : ''}</button>
      <button class="${talentPoints() ? 'red' : ''}" data-action="go" data-v="talents">Talente${talentPoints() ? ' ·' + talentPoints() : ''}</button>
      <button data-action="go" data-v="spells">Zauber</button>
    </div>
    <section class="panel invp"><div class="invhead"><span>Beutel</span><button class="tiny" data-action="sort">Ordnen</button></div>
      <div class="inv" style="--w:${INV_W};--h:${INV_H}">
        ${S.bag.map(it => `<div class="cellitem r-${it.rarity}" style="left:${it.x / INV_W * 100}%;top:${it.y / INV_H * 100}%;width:${it.w / INV_W * 100}%;height:${it.h / INV_H * 100}%" data-tip="${it.id}" data-action="equip" data-id="${it.id}">${itemArt(it)}${gainTag(it)}</div>`).join('')}
      </div>
      <div class="mats">${mats.length ? mats.map(([k, n]) => `<span title="${MATS[k]}">${matImg(k)}<b>${n}</b></span>`).join('') : '<span class="dim">Keine Materialien. Monster lassen sie fallen.</span>'}</div>
    </section>
    <section class="panel grow journal herojournal"><h2>Tagebuch</h2>${S.journal.slice(0, 8).map(j => `<div>${j.t}</div>`).join('')}</section>
  </div>`;
}

// Was ein Attribut gerade bewirkt (gegen einen Gegner deiner Stufe)
function attrNow(k, st) {
  const L = st.lvl, en = 3 + L * 2.7, c = CLASSES[S.cls];
  const main = k === c.main ? `Schaden ×${(1 + st[k] / CFG.mainDiv).toFixed(1).replace('.', ',')}` : '';
  const v = { str: `${Math.round(st.str * CFG.strArmor)} Rüstung`, dex: `${Math.round(Math.min(0.5, st.dex / (st.dex + en * 3 + 40) + (st.evade || 0)) * 100)} % Ausweichen`,
    int: `Zauber ×${st.amp.toFixed(2).replace('.', ',')}`, con: `${fmtN(st.hp)} Leben`, lck: `${Math.round(Math.min(0.6, CFG.critBase + st.lck / (st.lck + 100 + L * 5) + (st.crit || 0)) * 100)} % Krit` }[k];
  return [main, v].filter(Boolean).join(' · ');
}
export function viewStats() {
  const st = stats(), c = CLASSES[S.cls], rc = respecCost(), P0 = power(st);
  return `<div class="col">
    <section class="panel"><h2>Werte <span class="h2r">${S.points ? `<b class="hot">${S.points}</b> frei · <span class="up">grün</span> = Kampfkraft je Punkt` : `Kampfkraft <b>${fmtN(P0)}</b>`}</span></h2>
      ${Object.entries(ATTRS).map(([k, n]) => `<div class="stat attr"><span><span class="an">${n}${k === c.main ? ' <i class="dim">(Haupt)</i>' : ''}</span><small>${k === c.main ? 'Schaden · ' : ''}${ATTR_INFO[k]}</small></span>
        <span class="av"><small class="dim">${attrNow(k, st)}</small><b>${st[k]}</b>${S.points ? `<button data-action="attr" data-k="${k}">+<small class="up">${Math.max(0, powerAttr(k))}</small></button>` : ''}</span></div>`).join('')}
    </section>
    <section class="panel"><h2>Kampf <span class="h2r">Kampfkraft <b>${fmtN(P0)}</b></span></h2>
      <div class="grid2"><div class="stat"><span>Leben</span><b>${fmtN(st.hp)}</b></div><div class="stat"><span>Schaden</span><b>${st.dmg[0]}–${st.dmg[1]}</b></div>
      <div class="stat"><span>Rüstung</span><b>${st.armor}</b></div><div class="stat"><span>Siege / Tode</span><b>${S.wins} / ${S.deaths}</b></div></div>
      <p class="dim small">${effLine(Object.fromEntries(Object.entries(st).filter(([k]) => EFFECT_NAMES[k] && !['dmgPct', 'hpPct', 'armorPct'].includes(k))))}</p>
      ${S.tampered ? '<p class="small down">Spielstand wurde von Hand verändert – für Handel gesperrt.</p>' : ''}</section>
    <section class="panel grow"><h2>Trophäen <span class="h2r">${S.trophies.length}</span></h2>
      ${S.trophies.map(t => `<div class="stat"><span>${t.name} <i class="dim">${t.diff}</i></span><span class="m small">${effLine(t.eff)}</span></div>`).join('') || '<p class="dim small">Besiege die Herren der Krypten.</p>'}</section>
    <div class="btns"><button data-action="go" data-v="hero">Zurück</button><button data-action="respec" ${S.gold < rc ? 'disabled' : ''}>Läutern ${rc ? rc : 'gratis'}</button><button class="dim" data-action="wipe">Neu</button></div>
  </div>`;
}

// Zauber: wirken im Kampf von selbst
export function viewSpells() {
  const st = stats();
  return `<div class="col"><section class="panel"><h2>Zauber <span class="h2r">Zauberkraft ×${st.amp.toFixed(2).replace('.', ',')}${st.haste ? ` · Tempo +${Math.round(st.haste * 100)} %` : ''}</span><button class="tiny" data-action="go" data-v="hero">Zurück</button></h2>
    <p class="small">Wirken von selbst und nutzen <b>alle deine Werte</b> wie ein Hieb. Stärker durch <b>Intelligenz</b>, schneller durch <b>Zaubertempo</b>.</p>${st.offWeapon ? '<p class="small down">Du trägst eine fremde Waffe – Zauber geschwächt.</p>' : ''}</section>
    ${SPELLS[S.cls].map(sp => { const on = S.lvl >= sp.lvl;
      return `<section class="panel spell ${on ? '' : 'locked'}"><img class="sic" src="assets/spells/${sp.id}.webp" alt="">
        <div><h3>${sp.name} <span class="h2r">${on ? `alle ${(sp.every / (1 + st.haste)).toFixed(1).replace('.0', '').replace('.', ',')} Züge` : `ab Stufe ${sp.lvl}`}</span></h3><p class="small">${sp.text}</p></div></section>`; }).join('')}
    <section class="panel grow"><h2>Kampfbewertung <span class="h2r">je stärker, desto mehr Lohn</span></h2>${GRADES_TXT()}</section></div>`;
}
const GRADES_TXT = () => GRADES.map(g => `<div class="stat small"><span class="g-${g.id}">${g.name}</span><span>${g.min ? `≥ ${Math.round(g.min * 100)} % Leben` : 'sonst'} → ${g.bonus ? `+${Math.round(g.bonus * 100)} % Gold${g.id === 'dom' ? ', mehr Beute' : ''}` : 'kein Bonus'}</span></div>`).join('');

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
      <div class="waitmob">${monsterArt(MONSTERS.find(m => m.name === a.mob).glyph)}</div><p class="dim">Du folgst einer Spur: <b>${a.mob}</b>.</p>
      ${left > 0 ? `<div class="big" data-until="${a.end}">${fmtT(left)}</div><div class="btns"><button data-action="rush" ${S.gold < rushCost() ? 'disabled' : ''}>Eilen · ${rushCost()} Gold</button><button class="red" data-action="go" data-v="forge">Zur Schmiede</button></div>`
                 : `<button class="red big-btn" data-action="resolve">Stellen</button>`}</section>
      ${say('prophet')}<section class="panel grow journal"><h2>Tagebuch</h2>${S.journal.slice(0, 6).map(j => `<div>${j.t}</div>`).join('')}</section></div>`;
  }
  const o = omen();
  const openLocs = LOCATIONS.filter(locOpen), nextLoc = LOCATIONS.find(l => !locOpen(l)), later = LOCATIONS.filter(l => !locOpen(l) && l !== nextLoc);
  const bl = bounties(), bDone = bl.filter(b => b.claimed).length, bReady = bl.some(b => !b.claimed && b.prog >= b.n);
  const bbar = `<div class="bountybar ${bReady ? 'ready' : ''}" data-action="go" data-v="bounties"><span>Steckbriefe heute</span><b>${bDone}/3</b>${bReady ? '<i>Lohn abholen</i>' : ''}</div>`;
  const cards = [...openLocs, ...(nextLoc ? [nextLoc] : [])];
  const ptsHint = S.points && openLocs.some(l => tripChance(l) < 0.65) ? `<div class="ptsline" data-action="go" data-v="stats">${S.points} Punkte frei – verteile sie, dann sinkt die Gefahr</div>` : '';
  return `<div class="col">${S.haul ? haulPanel() : say('prophet', omenLine())}${bbar}${ptsHint}<div class="trips ${cards.length > 4 ? 'many' : ''}">${cards.map(l => { const open = locOpen(l), r = tripReward(l, 1, (l.sec[0] + l.sec[1]) / 2);
    const isOmen = open && S.lvl >= 3 && o.loc === l.id && !o.done;
    const wanted = new Set(Object.keys(TRADERS).filter(available).flatMap(t => current(t).obj.filter(o => o.at === l.id || l.mobs.includes(o.kill)).map(() => t)));
    return `<section class="panel trip ${open ? '' : 'locked'} ${isOmen ? 'omen' : ''} ${S.glut < l.glut ? 'tired' : ''}" ${open ? `data-action="trip" data-id="${l.id}"` : ''}>
      ${isOmen ? `<span class="omentag">Omen: ${o.def.short}</span>` : ''}
      <h3>${l.name}${open && wanted.size ? '<span class="qmark" title="Auftrag">!</span>' : ''}</h3><p class="lore small">${l.text}</p>
      ${open ? `<div class="mobpics">${l.mobs.map(n => monsterArt(MONSTERS.find(m => m.name === n).glyph)).join('')}</div>
      <div class="tripinfo">${threat(tripChance(l))}<span>Stufe ${locLvl(l)}</span><span>${fmtT(l.sec[0])}–${fmtT(l.sec[1])}</span><span>${l.glut} Glut</span><span>~${r.gold} Gold</span></div>` : `<div class="mobs">Erst ab Stufe ${l.lvl}</div>`}
    </section>`; }).join('')}</div>${later.length ? `<p class="unknown">Noch unentdeckt: ${later.map(l => `${l.name} <i>(Stufe ${l.lvl})</i>`).join(' · ')}</p>` : ''}
    <section class="panel journal tripsjournal"><h2>Tagebuch</h2>${S.journal.slice(0, 8).map(j => `<div>${j.t}</div>`).join('')}</section></div>`;
}

// Ungesicherte Beute: Heimkehren oder tiefer gehen
const haulText = h => [h.gold ? `${h.gold} Gold` : '', h.xp ? `${h.xp} EP` : '', ...Object.entries(h.mats).map(([k, n]) => `${MATS[k]} ×${n}`), ...h.items.map(it => `<span class="r-${it.rarity}">${it.name}</span>`)].filter(Boolean).join(' · ') || 'nichts';
export function haulActions() {
  const h = S.haul; if (!h) return '';
  const g = LOCATIONS.find(x => x.id === h.loc).glut;
  const deeper = h.depth >= DELVE.max ? '' : `<button data-action="delve" ${canDelve() ? '' : 'disabled'}>Tiefer · ${g} Glut ${canDelve() ? threat(delveChance()) : '<span class="threat">zu wenig Glut</span>'}</button>`;
  return `<div class="btns haulbtns"><button class="red" data-action="bank">Heimkehren</button>${deeper}</div>`;
}
function haulPanel() {
  const h = S.haul, l = LOCATIONS.find(x => x.id === h.loc);
  return `<section class="panel haul"><h2>Beute <span class="h2r">ungesichert · Tiefe ${h.depth}/${DELVE.max}</span></h2>
    <p class="small">${haulText(h)}</p><p class="dim small hint">Erst daheim gehört sie dir. Fällst du in der Tiefe, ist alles verloren.</p>${haulActions()}</section>`;
}

// Steckbriefe (täglich)
export function viewBounties() {
  const r = bountyReward();
  return `<div class="col"><section class="panel"><h2>Steckbriefe <span class="h2r">neu jeden Tag</span><button class="tiny" data-action="go" data-v="trips">Zurück</button></h2>
    <p class="lore small">Am Friedhofstor hängen frische Zettel. Wer sie erfüllt, wird bezahlt – und die Händler hören davon.</p></section>
    ${bounties().map((b, i) => { const def = BOUNTIES.find(x => x.id === b.id), done = b.prog >= b.n;
      return `<div class="note bounty ${b.claimed ? 'sealed' : ''}"><h4>${def.text(b.target)}</h4>
        <ul><li class="${done ? 'ok' : ''}">Fortschritt <b>${Math.min(b.prog, b.n)}/${b.n}</b></li></ul>
        <div class="rew">Lohn: ${r.gold} Gold · ${r.xp} EP · 2 Materialien · Ruf</div>
        ${b.claimed ? '<p class="small">Erledigt.</p>' : done ? `<button class="red" data-action="claim" data-i="${i}">Lohn abholen</button>` : ''}</div>`; }).join('')}</div>`;
}

// Spur wählen
export function viewTripPick(id) {
  const l = LOCATIONS.find(x => x.id === id);
  return `<div class="col"><section class="panel"><h2>${l.name} <span class="h2r">${l.glut} Glut · ${fmtT(l.sec[0])}–${fmtT(l.sec[1])}</span></h2>
      <p class="lore">${l.text}</p><div class="mobpics">${l.mobs.map(n => monsterArt(MONSTERS.find(m => m.name === n).glyph)).join('')}</div></section>
    ${TRACKS.map(t => `<section class="panel track t-${t.id}" data-action="tripgo" data-id="${l.id}" data-tr="${t.id}">
      <h3>${t.name}</h3><p class="small">${t.text}</p>
      <div class="tripinfo">${threat(tripChance(l, t.id))}<span>Lohn ×${t.rew}</span><span>Beute ${Math.round(t.loot * 100)}%${t.minRarity ? ', magisch+' : ''}</span></div></section>`).join('')}
    ${S.haul ? '<p class="dim small">Aufbrechen sichert deine ungesicherte Beute.</p>' : ''}
    <button data-action="go" data-v="trips">Zurück</button></div>`;
}

// --- Figuren mit Questketten (Vargo, Ilse, Prophet) ---
export function viewNpc(id) {
  const n = NPCS[id];
  let extra = '';
  if (id === 'prophet') { const o = omen();
    extra = `<section class="panel"><h2>Omen des Tages <span class="h2r">${o.done ? 'erfüllt' : 'offen'} · ${S.omens} erfüllt</span></h2>
      <p class="lore">„${o.def.text}“</p><p class="small">Ort: <b>${o.place.name}</b> · ${o.def.short}</p>
      <div class="shards">${SHARD_CRYPTS.map(c => `<i class="${S.shards.includes(c) ? 'on' : ''}"></i>`).join('')}<span class="small dim">Glockensplitter ${S.shards.length}/4</span></div></section>`; }
  if (id === 'vargo') extra = `<section class="panel"><p class="small">Deine Ehre: <b>${S.honor}</b> · Siege: <b>${S.wins}</b></p></section>`;
  return `<div class="col trader"><section class="panel npcrow">${npcArt(id)}
      <div><h2>${n.name} <span class="h2r">${n.role}</span></h2><p class="lore">„${n.lines[Math.floor(Date.now() / 60000) % n.lines.length]}“</p></div></section>
    ${questNote(id)}${extra}<button data-action="go" data-v="${id === 'vargo' ? 'arena' : id === 'ilse' ? 'crypt' : 'trips'}">Zurück</button></div>`;
}

// --- Händler ---
export function viewTrader(tid) {
  const t = TRADERS[tid], st = S.traders[tid], L = loyalty(tid), q = current(tid);
  const next = L + 1 < t.need.length ? `${st.rep}/${t.need[L + 1]} Ruf${S.lvl < t.lvl[L + 1] ? ` · Stufe ${t.lvl[L + 1]}` : ''}` : 'Höchste Treue';
  const note = questNote(tid);
  const shop = shopFor(tid);
  return `<div class="col trader">
    <nav class="subtabs">${Object.entries(TRADERS).map(([k, x]) => `<a class="${k === tid ? 'on' : ''} ${canComplete(k) ? 'badge' : ''}" data-action="trader" data-t="${k}">${x.name}</a>`).join('')}</nav>
    <section class="panel npcrow">${npcArt(t.glyph)}
      <div><h2>${t.name} <span class="h2r">${t.role}</span></h2><p class="lore">„${t.quote}“</p>
        <div class="loyal"><span>Treue <b>${LOYALTY[L]}</b></span><div class="bar rep"><i style="width:${L + 1 < t.need.length ? pct(st.rep - t.need[L], t.need[L + 1] - t.need[L]) : 100}%"></i></div><small>${next}</small></div></div>
    </section>
    ${note}
    <section class="panel services">${tid === 'halvar' ? `<button class="svc red" data-action="go" data-v="forge"><b>Schmiede</b><small>Runen einschmieden</small></button>` : ''}${(SERVICES[tid] || []).map(sv => { const st = serviceState(sv);
      return `<button class="svc" data-action="service" data-t="${tid}" data-s="${sv.id}" ${st.can ? '' : 'disabled'}>
        <b>${sv.name}${sv.max && st.it ? ` +${st.step}` : ''}</b><small>${st.reason || st.costText}${st.questMat && !st.reason ? ` <i class="hot">– ${MATS[st.questMat]} für Auftrag!</i>` : ''}</small></button>`; }).join('')}</section>
    <section class="panel shop"><div class="invhead"><span>Ware</span><small class="dim">bessere Ware mit höherer Treue</small></div>
      <div class="shoprow">${shop.map(it => `<div class="sitem r-${it.rarity}" data-tip="${it.id}" data-action="buy" data-t="${tid}" data-id="${it.id}">${itemArt(it)}${gainTag(it)}<span class="price ${S.gold < it.price ? 'no' : ''}">${it.price}</span></div>`).join('') || '<span class="dim">Ausverkauft.</span>'}</div></section>
  </div>`;
}

// --- Krypten ---
export function viewCrypts() {
  const d = DIFFICULTIES[S.crypt.diff], cd = Math.max(0, Math.ceil((S.crypt.cd - Date.now()) / 1000));
  return `<div class="col">${say('ilse')}<div class="crypthead"><span>Die Krypten · ${d.name}</span><span>${cd ? `Erholung <span data-until="${S.crypt.cd}">${fmtT(cd)}</span>` : 'bereit'}</span></div>
    ${CRYPTS.map(c => { const f = cryptFloor(c), open = cryptOpen(c), done = f >= 5;
      const troph = S.trophies.some(t => t.key === c.id + ':' + S.crypt.diff);
      return `<section class="panel crypt ${!open ? 'locked' : ''} ${done ? 'done' : ''}" ${open && !done && !cd ? `data-action="crypt" data-id="${c.id}"` : ''}>
        ${monsterArt(c.boss.glyph)}
        <div><h3>${c.name}</h3>
          <p class="small">${!open ? (c.shards && S.shards.length < c.shards ? `Versiegelt · Glockensplitter ${S.shards.length}/${c.shards}` : `Versiegelt bis Stufe ${c.lvl + d.lvlAdd - 2}`) : done ? `${c.boss.name} ist gefallen.` : f === 4 ? `<span class="hot">${c.boss.name}</span> · <i>${c.boss.mechText}</i>` : `Ebene ${f + 1}: ${c.floors[f]} · Stufe ${cryptLvl(c, f)}`}${open && !done ? ' · ' + threat(cryptChance(c)) : ''}</p>
          <div class="floors">${[0, 1, 2, 3, 4].map(i => `<i class="${i < f ? 'on' : ''} ${i === 4 ? 'boss' : ''}"></i>`).join('')}</div>
          <div class="dim small">Trophäe: ${effLine(c.trophy)}${troph ? ' · errungen' : ''}</div></div></section>`; }).join('')}</div>`;
}

export function viewArena(rival) {
  const cd = Math.max(0, Math.ceil((S.arenaTs - Date.now()) / 1000));
  return `<div class="col">${say('vargo')}<section class="panel arena"><img class="portrait" src="${P(rival.cls)}" alt="">
    <h2>${rival.name}</h2><p class="dim">${CLASSES[rival.cls].name} · Stufe ${rival.lvl}</p>
    <p class="small">Kampfkraft: deine <b>${fmtN(power())}</b> · seine <b>${fmtN(power(stats(rival)))}</b></p>
    <p class="small">Sieg: ${rival.lvl * 3} Gold, 10 Ehre · Niederlage: 5 Ehre · Deine Ehre: <b>${S.honor}</b></p>
    <div class="btns"><button class="red" data-action="arena" ${cd || S.glut < CFG.arenaGlut ? 'disabled' : ''}>${cd ? `Erschöpft <span data-until="${S.arenaTs}">${fmtT(cd)}</span>` : `Herausfordern · ${CFG.arenaGlut} Glut`}</button>
    <button data-action="rival">Anderer Gegner</button></div></section></div>`;
}

function fightSummary(F) {
  const g = gradeOf(F), n = {}; for (const c of F.cast || []) n[c] = (n[c] || 0) + 1;
  const sp = Object.entries(n).map(([k, v]) => `${k} ×${v}`).join(', ');
  return `<div class="fsum">${g ? `<b class="g-${g.id}">${g.name}</b>${g.bonus ? ` · +${Math.round(g.bonus * 100)} % Gold` : ''} · ` : ''}${Math.round((F.left || 0) * 100)} % Leben übrig${sp ? `<br><span class="dim">Zauber: ${sp}</span>` : ''}</div>`;
}
export function viewFight(F) {
  const side = (f, hp, max, hit, id, ch) => `<div class="fighter" id="${id}"><div class="pwrap">${f.cls ? `<img class="portrait" src="${P(f.cls)}" alt="">` : monsterArt(f.glyph)}</div>
    <div class="nm">${f.name}</div><div class="bar"><i style="width:${pct(hp, max)}%"></i></div><div class="hp">${Math.max(0, hp)} / ${max}</div>
    ${f.spells?.length ? `<div class="sbar">${f.spells.map((sp, i) => `<div class="sb" data-i="${i}" title="${sp.name}" style="--c:${ch?.[i] ?? 0}"><img src="assets/spells/${sp.id}.webp" alt=""><i></i></div>`).join('')}</div>` : ''}</div>`;
  const shown = F.log.slice(0, F.step), last = shown[shown.length - 1] || {};
  const hpA = last.hpA ?? F.hpA, hpB = last.hpB ?? F.hpB, done = F.step >= F.log.length;
  return `<div class="panel fightwrap"><div class="fight">
    ${side(F.A, hpA, F.hpA, last.who === 'b', 'fA', last.cA)}
    <div><div class="log" id="log">${shown.map(l => `<div class="${l.who} ${l.crit ? 'crit' : ''} ${l.spell ? 'spell' : ''}">${l.t}</div>`).join('')}</div>
      ${done ? `<div class="result ${F.winner === 'a' ? 'win' : 'lose'}">${F.winner === 'a' ? 'Sieg' : 'Gefallen'}</div>${fightSummary(F)}
        <div class="loot-drop">${F.reward || ''}</div>${F.back === 'trips' && S.haul ? haulActions() : `<button class="red" data-action="go" data-v="${F.back}">Weiter</button>`}`
        : `<button data-action="skip">Überspringen</button>`}</div>
    ${side(F.B, hpB, F.hpB, last.who === 'a', 'fB', last.cB)}
  </div></div>`;
}

export function viewTurnin(r, tid) {
  return `<div class="col"><section class="panel turnin">${npcArt(TRADERS[tid]?.glyph || tid)}<h2>${r.q.title}</h2>
    <p class="lore">„Gut. Das hier ist deins.“ – ${(TRADERS[tid] || NPCS[tid]).name}</p>
    <p>${r.gold} Gold · ${r.xp} EP · ${r.rep} Ruf</p>
    ${r.item ? `<p>Erhalten: <span class="r-${r.item.rarity}">${r.item.name}</span>${r.item.sold ? ' <i class="dim">(Beutel voll, verkauft)</i>' : ''}</p>` : ''}
    ${r.up ? `<p class="hot">Stufe ${S.lvl}! ${r.up * CFG.attrPerLevel} Attributpunkte, ${r.up} Talentpunkt</p>` : ''}
    ${r.loyaltyUp ? `<p class="gold">Treue steigt auf ${LOYALTY[loyalty(tid)]}. Neue Ware.</p>` : ''}
    ${r.choice ? `<p class="lore">${r.choice.text}</p><p class="gold">Du bist nun: ${r.choice.title}</p>` : ''}
    ${r.perks.map(p => `<p class="r-legendary">Segen: ${p.name} (${effLine(p.eff)})</p>`).join('')}
    <button class="red" data-action="${TRADERS[tid] ? 'trader' : 'npc'}" data-t="${tid}" data-n="${tid}">Weiter</button></section></div>`;
}

// Tutorial-Hinweis (schwebt über den Tabs, ändert das Layout nicht)
export function tutorial(step) {
  const t = TUTORIAL[step]; if (!t) return '';
  return `<div class="tut"><div class="tutin"><b>${step + 1}/${TUTORIAL.length}</b> ${t.text}</div><button class="tiny" data-action="tutskip">Überspringen</button></div>`;
}

// --- Schmiede: Runen einschmieden (Minispiel) ---
const STAT_NAME = k => k === 'dmg' ? 'Schaden' : k === 'armor' ? 'Rüstung' : k === 'haste' ? '% Zaubertempo' : ATTRS[k];
const matImg = k => `<img class="matimg" src="assets/forge/${k}.webp" alt="">`;
export function viewForge(sel, res) {
  const tg = forgeTargets(), err = canForge(sel.slot, sel.mat), r = RUNES[sel.mat];
  const range = r ? [0.5, 2.2].map(q => Math.max(1, Math.round(r.per * (CFG.affixBase + S.lvl * CFG.affixPerLvl) * q))) : null;
  if (res) return `<div class="col forge">${npcSay('halvar', res.grade.q >= 1.6 ? 'Hörst du das? So klingt guter Stahl.' : res.grade.q >= 1 ? 'Brauchbar. Das hält.' : 'Grob. Aber besser als nichts.')}
    <section class="panel grow forgeres"><h2>${res.grade.name}</h2><img class="runeimg g${Math.round(res.grade.q * 10)}" src="assets/forge/r_${res.mat}.webp" alt="">
      <p class="big">${res.rune.name}: <b class="up">+${res.v} ${STAT_NAME(res.rune.stat)}</b></p><p>in <span class="r-${res.it.rarity}">${res.it.name}</span> · ${res.score}/${FORGE.hits * 3} Punkte</p>
      <p class="dim small">Runenplätze: ${res.it.runes.length}/${FORGE.maxRunes}</p></section>
    <div class="btns"><button data-action="forgeagain">Noch einmal</button><button class="red" data-action="${S.active ? 'go" data-v="trips' : 'trader" data-t="halvar'}">${S.active ? 'Zum Streifzug' : 'Zurück'}</button></div></div>`;
  if (sel.mode === 'craft') return viewCraft(sel);
  return `<div class="col forge">${forgeTabs(sel)}
    <section class="panel smithy" id="forgeplay"><div class="scene"><img src="assets/forge/scene.jpg" alt="">
      <div class="iron"><div class="fz z1"></div><div class="fz z2"></div><div class="fz z3"></div><div class="fmark"></div></div><div class="sparks"></div>
      <div class="fcall"></div><div class="pips">${Array.from({ length: FORGE.hits }, (_, i) => `<i data-i="${i}"></i>`).join('')}</div></div>
      <p class="small fhint">${r && sel.slot ? `${r.name} auf <b>${S.equip[sel.slot]?.name || ''}</b>: <span class="up">+${range[0]} bis +${range[1]} ${STAT_NAME(r.stat)}</span>` : '„Zwei Brocken Material, fünf Schläge. Triff die weiße Glut – dann hält die Rune.“ – Halvar'}</p>
      ${err ? `<button disabled>${sel.mat && sel.slot ? err : 'Material und Gegenstand wählen'}</button>` : `<button class="red big-btn" id="forgebtn" data-action="forgestart">Ans Feuer</button>`}</section>
    <section class="panel"><h2>Material <span class="h2r">je ${FORGE.cost}</span></h2><div class="mtiles">${Object.entries(RUNES).map(([k, x]) => { const n = S.mats[k] || 0;
      return `<button class="mtile ${sel.mat === k ? 'on' : ''}" data-action="forgemat" data-m="${k}" ${n < FORGE.cost ? 'disabled' : ''} title="${MATS[k]}">${matImg(k)}<b>${n}</b><small>${STAT_NAME(x.stat).replace('% ', '')}</small>${forgeQuestMat(k) ? '<i class="qm">!</i>' : ''}</button>`; }).join('')}</div>
      ${sel.mat ? `<p class="small dim msel">${MATS[sel.mat]}${forgeQuestMat(sel.mat) ? ' · <span class="hot">wird für einen Auftrag gebraucht</span>' : ''}</p>` : ''}</section>
    <section class="panel"><h2>Gegenstand <span class="h2r">${FORGE.maxRunes} Runen je Teil</span></h2><div class="fslots">${tg.map(t => `<div class="fslot r-${t.it.rarity} ${sel.slot === t.slot ? 'on' : ''} ${t.free ? '' : 'full'}" data-action="forgeslot" data-s="${t.slot}">${itemArt(t.it)}<i>${FORGE.maxRunes - t.free}/${FORGE.maxRunes}</i></div>`).join('')}</div></section></div>`;
}
const npcSay = (id, line) => `<section class="panel speaker">${npcArt(TRADERS[id].glyph)}<div><b>${TRADERS[id].name}</b> <span class="h2r">Schmiede</span><p class="lore">„${line}“</p></div></section>`;

const forgeTabs = sel => `<nav class="subtabs"><a class="${sel.mode !== 'craft' ? 'on' : ''}" data-action="forgemode" data-m="rune">Runen</a><a class="${sel.mode === 'craft' ? 'on' : ''}" data-action="forgemode" data-m="craft">Umschmieden</a></nav>`;
// --- Umschmieden (Crafting) ---
function viewCraft(sel) {
  const list = craftItems(), it = list.find(x => x.id === sel.item) || null;
  if (it) craftCheck(it, 'values');   // legt bei alten Items die Glut fest
  const card = !it ? '<p class="dim small">Wähle ein magisches, seltenes oder legendäres Item. Einzigartiges lässt sich nicht umschmieden.</p>' : (() => {
    const base = baseMods(it), rows = Object.entries(base).map(([k, v]) => { const t = it.tiers?.[k] || 3, sealed = it.sealed === k, picked = sel.stat === k;
      return `<div class="caff ${sealed ? 'sealed' : ''} ${picked ? 'on' : ''} ${sel.changed?.includes(k) ? 'new' : ''}" data-action="craftstat" data-k="${k}"><span>+${v} ${STAT_NAME(k)}</span><i class="tier t${t}">${TIERS[t - 1].name}</i>${sealed ? '<b class="seal">versiegelt</b>' : ''}</div>`; }).join('');
    return `<div class="ccard"><div class="cname r-${it.rarity}">${it.name}</div>
      <div class="cglut"><span>Schmiedeglut</span><div class="bar glutbar"><i style="width:${it.glutMax ? it.glut / it.glutMax * 100 : 0}%"></i></div><b>${it.glut}/${it.glutMax}</b></div>
      <div class="caffs">${rows || '<span class="dim small">Keine eigenen Boni.</span>'}</div>
      ${it.fx ? `<div class="small special-l">✦ ${effLine(it.fx)} <i class="dim">(bleibt)</i></div>` : ''}${it.runes?.length ? `<div class="small rune">${it.runes.map(r => r.name + ' +' + r.v).join(', ')} <i class="dim">(bleibt)</i></div>` : ''}
      ${it.crafted ? `<div class="small gold">Vollendet von ${it.crafted}</div>` : ''}</div>`; })();
  const ops = CRAFT.ops.map(op => { const err = it ? craftCheck(it, op.id, sel.stat) : 'Kein Item';
    return `<button class="cop" data-action="craftop" data-o="${op.id}" ${err ? 'disabled' : ''} title="${op.text}">${matImg(op.mat)}<b>${op.name}</b><small>${MATS[op.mat]} ${S.mats[op.mat] || 0}/${op.n} · Glut ${op.glut}+</small></button>`; }).join('');
  const why = it && CRAFT.ops.map(op => craftCheck(it, op.id, sel.stat)).find(e => e && !/Material|Bonus antippen/.test(e));
  return `<div class="col forge craft">${forgeTabs(sel)}
    <section class="panel"><div class="cpick">${list.map(x => `<div class="fslot r-${x.rarity} ${x.id === sel.item ? 'on' : ''} ${x.crafted ? 'full' : ''}" data-action="craftpick" data-id="${x.id}">${itemArt(x)}${Object.values(S.equip).includes(x) ? '<i>an</i>' : ''}</div>`).join('') || '<span class="dim small">Nichts zum Umschmieden. Magische Items fallen bei Monstern und Händlern.</span>'}</div></section>
    <section class="panel grow">${card}</section>
    <section class="panel"><div class="cops">${ops}</div>
      <p class="small cmsg">${sel.msg || (it ? `Je Eingriff ${craftGold(it)} Gold · ${sel.stat ? `<b>${STAT_NAME(sel.stat)}</b> gewählt` : 'zum Versiegeln einen Bonus antippen'}${why ? ` · <span class="down">${why}</span>` : ''}` : 'Material bestimmt den Eingriff, Schmiedeglut wie oft.')}</p></section></div>`;
}
