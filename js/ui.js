// Rendering: reine String-Templates. Keine Spiellogik.
import { AFFIXES, GIVERS, CRAFT, TIERS, RUNES, FORGE, GRADES, ATTR_INFO, SPELLS, MONSTERS, NPCS, CLASSES, ATTRS, SLOTS, RARITIES, CFG, TALENTS, EFFECT_NAMES, CRYPTS, DIFFICULTIES, LOCATIONS, TRADERS, LOYALTY, MATS, INV_W, INV_H, SERVICES, SHARD_CRYPTS, TUTORIAL, TRACKS, DELVE, BOUNTIES } from './data.js';
import { SPELL_TREE, TREE_LVL, POTIONS, HERBS, TRIGGERS, ALCH, EXPED, EXP_NODES, DESCENT, DESC_ROOMS, PIT, PIT_STYLES, PIT_RANKS, PIT_SHOP, PIT_RULES } from './data.js';
import { potion, beltSlots, brewCost, canBrew, potMax } from './state.js';
import { waysPending, wayOpen, wayCost, craftItems, craftCheck, craftGold, baseMods, forgeTargets, canForge, forgeQuestMat, power, powerWith, powerAttr, S, stats, xpNeed, rank, talentPoints, talentState, respecCost, cryptFloor, cryptOpen, cryptLvl, locOpen, locLvl, tripReward, loyalty, shopFor, omen, serviceState, rushCost, bounties, bountyReward } from './state.js';
import { current, available, objectives, canComplete } from './quests.js';
// Name eines Item-Bonus: Attribute, Rüstung/Schaden, Prozent-Boni ("% Krit-Chance", "% Feuerball")
export const STAT_NAME = k => { if (k === 'dmg') return 'Schaden'; if (k === 'armor') return 'Rüstung'; if (ATTRS[k]) return ATTRS[k];
  const a = AFFIXES.find(x => x.stat === k); return a ? (a.pct ? '% ' : '') + a.label : k; };
import { itemArt, ghost, NPC_ART, MON } from './art.js';
import { pitWeek, pitPlace, pitRank, pitFoes, pitChance, pitBusy, pitRival, pitChallenge, pitWinHonor, pitShop, pitTierOpen, gradeOf, tripChance, cryptChance, threatLabel, canDelve, delveChance, enemyInfo, potOffer, fightReport, expedPreview, expedMap, expLinked, expDoneCount, expEvent, expChoiceOk, expPayCost,
  descCrypts, descLeft, descCanStart, descBusy, descLvl, descMult, descNext, descNodeAt, descWellCost, descEnemy, descChance } from './game.js';
const threat = p => { const [t, c] = threatLabel(p); return `<span class="threat t-${c}">Gefahr: ${t}</span>`; };

const P = cls => `assets/portraits/${CLASSES[cls].portrait}.jpg`;
const rarName = (id, it) => it?.unique ? 'Einzigartig' : RARITIES.find(r => r.id === id)?.name || '';
export const fmtT = s => s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` : `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, '0')}`;
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
  return `<div class="note ${canComplete(tid) ? 'ready' : ''}"><h4>${q.title}</h4><p>${q.text}</p>
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
    L.push(`<span class="m ${t && t <= 2 ? 'hi' : ''}">+${b} ${STAT_NAME(k)}${t ? ` <i class="tier t${t}">${TIERS[t - 1].name}</i>` : ''}</span>`); }
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
  const tabs = [['hero', 'Held'], ['trips', 'Streifzug'], ['traders', 'Händler'], ['forge', 'Schmiede'], ['alch', 'Alchemie'], ['crypt', 'Krypta']];
  const map = { prep: 'crypt', desc: 'crypt', arena: 'crypt', pitprep: 'crypt', pitshop: 'crypt', stats: 'hero', talents: 'hero', spells: 'hero', ways: 'hero', npc: 'trips', bounties: 'trips', trippick: 'trips', exped: 'trips' };
  // Nur echte Handlungsaufforderungen markieren – ein Dauer-Punkt auf jedem Tab sagt nichts mehr
  const badge = { hero: S.points + talentPoints() + waysPending() > 0, traders: Object.keys(TRADERS).some(canComplete), arena: canComplete('vargo'),
    crypt: canComplete('ilse') || canComplete('vargo'), trips: !!S.haul || canComplete('prophet') || bounties().some(b => !b.claimed && b.prog >= b.n) || (!!S.active && Date.now() >= S.active.end) || (!!S.exp && Date.now() >= S.exp.end) };
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
      <button class="${waysPending() ? 'red' : ''}" data-action="go" data-v="spells">Zauber${waysPending() ? ' ·' + waysPending() : ''}</button>
    </div>
    <section class="panel invp"><div class="invhead"><span>Beutel</span><button class="tiny" data-action="sort">Ordnen</button></div>
      <div class="inv" style="--w:${INV_W};--h:${INV_H}">
        ${S.bag.map(it => `<div class="cellitem r-${it.rarity}" style="left:${it.x / INV_W * 100}%;top:${it.y / INV_H * 100}%;width:${it.w / INV_W * 100}%;height:${it.h / INV_H * 100}%" data-tip="${it.id}" data-action="equip" data-id="${it.id}">${itemArt(it)}${gainTag(it)}</div>`).join('')}
      </div>
      <div class="mats">${mats.length ? mats.map(([k, n]) => `<span title="${MATS[k]}">${matImg(k)}<b>${n}</b></span>`).join('') : '<span class="dim">Keine Materialien. Monster lassen sie fallen.</span>'}</div>
    </section>
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
  return `<div class="col statsv"><div class="vscroll">
    <section class="panel"><h2>Werte <span class="h2r">${S.points ? `<b class="hot">${S.points}</b> frei · <span class="up">grün</span> = Kampfkraft je Punkt` : `Kampfkraft <b>${fmtN(P0)}</b>`}</span></h2>
      ${Object.entries(ATTRS).map(([k, n]) => `<div class="stat attr"><span><span class="an">${n}${k === c.main ? ' <i class="dim">(Haupt)</i>' : ''}</span><small>${k === c.main ? 'Schaden · ' : ''}${ATTR_INFO[k]}</small></span>
        <span class="av"><small class="dim">${attrNow(k, st)}</small><b>${st[k]}</b>${S.points ? `<button data-action="attr" data-k="${k}">+<small class="up">${Math.max(0, powerAttr(k))}</small></button>` : ''}</span></div>`).join('')}
    </section>
    <section class="panel"><h2>Kampf</h2>
      <div class="grid2"><div class="stat"><span>Leben</span><b>${fmtN(st.hp)}</b></div><div class="stat"><span>Schaden</span><b>${st.dmg[0]}–${st.dmg[1]}</b></div>
      <div class="stat"><span>Rüstung</span><b>${st.armor}</b></div><div class="stat"><span>Krit</span><b>${Math.round(Math.min(0.6, CFG.critBase + st.lck / (st.lck + 100 + S.lvl * 5) + st.crit) * 100)} % · ×${st.critMult.toFixed(2).replace('.', ',').replace(/0$/, '')}</b></div></div>
      <p class="dim small">${effLine(Object.fromEntries(Object.entries(st).filter(([k, v]) => v && EFFECT_NAMES[k] && !['dmgPct', 'hpPct', 'armorPct', 'crit'].includes(k))))}</p>
      ${S.tampered ? '<p class="small down">Spielstand wurde von Hand verändert – für Handel gesperrt.</p>' : ''}</section>
    <section class="panel"><h2>Trophäen <span class="h2r">${S.trophies.length}</span></h2>
      ${S.trophies.map(t => `<div class="stat"><span>${t.name} <i class="dim">${t.diff}</i></span><span class="m small">${effLine(t.eff)}</span></div>`).join('') || '<p class="dim small">Besiege die Herren der Krypten.</p>'}</section></div>
    <div class="btns"><button data-action="go" data-v="hero">Zurück</button><button data-action="respec" ${S.gold < rc ? 'disabled' : ''}>Läutern ${rc ? rc : 'gratis'}</button><button class="dim" data-action="wipe">Neu</button></div>
  </div>`;
}

// Zauber: wirken im Kampf von selbst
export function viewSpells() {
  const st = stats();
  return `<div class="col"><section class="panel"><h2>Zauber <span class="h2r">Zauberkraft ×${st.amp.toFixed(2).replace('.', ',')}${st.haste ? ` · Tempo +${Math.round(st.haste * 100)} %` : ''}</span><button class="tiny" data-action="go" data-v="hero">Zurück</button></h2>
    <p class="small">Wirken von selbst und nutzen <b>alle deine Werte</b> wie ein Hieb. Stärker durch <b>Intelligenz</b>, schneller durch <b>Zaubertempo</b>.</p>${st.offWeapon ? '<p class="small down">Du trägst eine fremde Waffe – Zauber geschwächt.</p>' : ''}</section>
    ${SPELLS[S.cls].map(sp => { const on = S.lvl >= sp.lvl, cur = st.spells.find(x => x.id === sp.id), bo = Math.round(((st.spells.find(x => x.id === sp.id)?.boost || 1) / (1 + (cur?.m?.mult || 0)) - 1) * 100);
      const pend = on && waysPending(sp.id), ev = cur?.every || sp.every;
      return `<section class="panel spell ${on ? '' : 'locked'}" ${on ? `data-action="ways" data-s="${sp.id}"` : ''}><img class="sic" src="assets/spells/${sp.id}.webp" alt="">
        <div><h3>${sp.name} <span class="h2r">${on ? `alle ${(ev / (1 + st.haste)).toFixed(1).replace('.0', '').replace('.', ',')} Züge` : `ab Stufe ${sp.lvl}`}</span></h3><p class="small">${sp.text}${bo ? ` · <b class="up">+${bo} % durch Waffe</b>` : ''}</p>
        ${on ? `<p class="wayline">${cur?.ways?.length ? cur.ways.map(n => `<b>${n}</b>`).join(' · ') : '<i class="dim">Noch kein Weg gewählt</i>'}${pend ? ` <span class="hot">· Weg wählen</span>` : ''}</p>` : ''}</div></section>`; }).join('')}
    <section class="panel grow gradesp"><h2>Kampfbewertung <span class="h2r">je stärker, desto mehr Lohn</span></h2>${GRADES_TXT()}</section></div>`;
}

// Zauber-Wege eines Zaubers: 3 Stufen, je 2 Wege – Wahl statt Punkte
export function viewWays(sid) {
  const sp = SPELLS[S.cls].find(x => x.id === sid); if (!sp) return viewSpells();
  const ch = S.sp?.[sid] || [], cost = wayCost();
  return `<div class="col ways"><section class="panel spell"><img class="sic" src="assets/spells/${sp.id}.webp" alt="">
      <div><h3>${sp.name} <span class="h2r"><button class="tiny" data-action="go" data-v="spells">Zurück</button></span></h3><p class="small">${sp.text}</p></div></section>
    ${SPELL_TREE[sid].map((opts, t) => { const open = wayOpen(sp, t);
      return `<section class="panel waytier ${open ? '' : 'locked'}"><h2>Stufe ${t + 1} <span class="h2r">${open ? (ch[t] == null ? '<b class="hot">wählen</b>' : 'gewählt') : `ab Stufe ${Math.max(sp.lvl, TREE_LVL[t])}`}</span></h2>
        <div class="wayopts">${opts.map((o, i) => `<button class="way ${ch[t] === i ? 'on' : ''}" ${open ? `data-action="way" data-s="${sid}" data-t="${t}" data-i="${i}"` : 'disabled'}><b>${o.name}</b><small>${o.text}</small></button>`).join('')}</div></section>`; }).join('')}
    <p class="small dim waynote">Erste Wahl je Stufe gratis, Umentscheiden ${cost} Gold. Vor einer Krypta lohnt es sich: Reinigen hilft gegen Gift, Bannen gegen Heilung, Unbeugsam gegen Betäubung.</p></div>`;
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
export function viewTrips(ask = false) {
  if (S.active) {
    const a = S.active, l = LOCATIONS.find(x => x.id === a.loc), left = Math.ceil((a.end - Date.now()) / 1000);
    return `<div class="col"><section class="panel waiting"><h2>${l.name}</h2><p class="lore">${l.text}</p>
      <div class="waitmob">${monsterArt(MONSTERS.find(m => m.name === a.mob).glyph)}</div><p class="dim">Du folgst einer Spur: <b>${a.mob}</b>.</p>
      ${left > 0 ? `<div class="big" data-until="${a.end}">${fmtT(left)}</div><div class="btns"><button data-action="rush" ${S.gold < rushCost() ? 'disabled' : ''}>Eilen · ${rushCost()} Gold</button></div>`
                 : `<button class="red big-btn" data-action="resolve">Stellen</button>`}</section>
      ${say('prophet')}</div>`;
  }
  if (S.exp?.ret) return viewExpEvent();
  if (S.exp) return `<div class="col">${expAway(ask)}${say('prophet')}</div>`;
  const o = omen();
  const openLocs = LOCATIONS.filter(locOpen), nextLoc = LOCATIONS.find(l => !locOpen(l));
  const bl = bounties(), bDone = bl.filter(b => b.claimed).length, bReady = bl.some(b => !b.claimed && b.prog >= b.n);
  const bbar = `<div class="bountybar ${bReady ? 'ready' : ''}" data-action="go" data-v="bounties"><span>Steckbriefe heute</span><b>${bDone}/3</b>${bReady ? '<i>Lohn abholen</i>' : ''}</div>`;
  const tired = !S.haul && openLocs.every(l => S.glut < l.glut);
  const xbar = S.haul ? '' : `<div class="bountybar expbar ${tired ? 'ready' : ''}" data-action="go" data-v="exped"><span>Expedition</span><b>ohne Glut · 1–8 Std.</b>${tired ? '<i>Glut leer – schick ihn los</i>' : ''}</div>`;
  const cards = [...openLocs, ...(nextLoc ? [nextLoc] : [])];
  const ptsHint = S.points && openLocs.some(l => tripChance(l) < 0.65) ? `<div class="ptsline" data-action="go" data-v="stats">${S.points} Punkte frei – verteile sie, dann sinkt die Gefahr</div>` : '';
  return `<div class="col">${S.haul ? haulPanel() : say('prophet', omenLine())}${bbar}${xbar}${ptsHint}<div class="trips ${cards.length > 4 ? 'many' : ''}">${cards.map(l => { const open = locOpen(l), r = tripReward(l, 1, (l.sec[0] + l.sec[1]) / 2);
    const isOmen = open && S.lvl >= 3 && o.loc === l.id && !o.done;
    const wanted = new Set(Object.keys(TRADERS).filter(available).flatMap(t => current(t).obj.filter(o => o.at === l.id || l.mobs.includes(o.kill)).map(() => t)));
    return `<section class="panel trip ${open ? 'tf-' + threatLabel(tripChance(l))[1] : 'locked'} ${isOmen ? 'omen' : ''} ${S.glut < l.glut ? 'tired' : ''}" ${open ? `data-action="trip" data-id="${l.id}"` : ''}>
      ${open ? `<span class="tlvl" title="Stufe">${locLvl(l)}</span>` : ''}${isOmen ? `<span class="omentag">Omen: ${o.def.short}</span>` : ''}
      <h3>${l.name}${open && wanted.size ? '<span class="qmark" title="Auftrag">!</span>' : ''}</h3><p class="lore small">${l.text}</p>
      ${open ? `<div class="mobpics">${l.mobs.map(n => monsterArt(MONSTERS.find(m => m.name === n).glyph)).join('')}</div>
      <div class="tripinfo"><span><i class="ico glut"></i>${l.glut}</span><span><i class="ico coin"></i>~${r.gold}</span></div>` : `<div class="mobs">Erst ab Stufe ${l.lvl}</div>`}
    </section>`; }).join('')}</div></div>`;
}

// --- Expedition ---
const herbImg = id => `<img class="matimg" src="assets/potions/${HERBS[id].img}.webp" alt="">`;
const expHoursDone = e => Math.floor((Date.now() - e.start) / 3600000);
// Symbol einer Station (assets/expedition/<typ>.webp, Prompt in assets/reference/expedition_prompt.md)
const nodeArt = t => `<img src="assets/expedition/${t}.webp" alt="">`;
function expAway(ask) {
  const e = S.exp, l = LOCATIONS.find(x => x.id === e.loc), left = Math.ceil((e.end - Date.now()) / 1000), hh = expHoursDone(e), k = expDoneCount(e);
  const trail = [...e.nodes, { t: 'goal' }].map((n, i) => `<i class="${i < k ? 'done' : i === k ? 'now' : ''}">${nodeArt(n.t, e.loc)}</i>`).join('<s></s>');
  return `<section class="panel waiting expaway"><h2>Expedition · ${l.name}</h2><div class="trail">${trail}</div><p class="lore">${l.text}</p>
    <p class="small dim">Solange er fort ist, ruhen Krypta und Grube. Schmiede, Alchemie und Händler bleiben offen.</p>
    ${left > 0 ? `<div class="big" data-until="${e.end}">${fmtT(left)}</div><div class="btns">${ask
      ? `<button data-action="expno">Weiter warten</button><button class="red" data-action="expclaim">Ja · ${hh ? `${hh}/${e.h} Std.` : 'ohne Beute'}${hh && e.h >= EXPED.longH ? ' · kein Ziel' : ''}</button>`
      : `<button data-action="expask">Heimrufen · ${hh ? `${hh} Std. zählen` : 'bringt noch nichts'}</button>`}</div>`
               : `<button class="red big-btn" data-action="expclaim">Heimholen</button>`}</section>`;
}
// Krypta/Grube, während der Held fort ist
export function viewAway(npc) {
  const e = S.exp, l = LOCATIONS.find(x => x.id === e.loc), left = Math.ceil((e.end - Date.now()) / 1000);
  return `<div class="col">${say(npc)}<section class="panel waiting"><h2>Dein Held ist fort</h2><p class="lore">Expedition: ${l.name}. Kämpfen kann er erst, wenn er zurück ist.</p>
    ${left > 0 ? `<div class="big" data-until="${e.end}">${fmtT(left)}</div>` : '<p class="up">Er ist zurück – hol ihn heim.</p>'}<div class="btns"><button data-action="go" data-v="trips">Zur Expedition</button></div></section></div>`;
}
// Held ist im Abstieg: andere Kämpfe und Reisen warten
export function viewDescAway(npc) {
  const c = CRYPTS.find(x => x.id === S.desc.c);
  return `<div class="col">${say(npc)}<section class="panel waiting"><h2>Dein Held ist unten</h2><p class="lore">Im Abgrund: ${c.name}, Raum ${S.desc.rooms + 1}. Erst wenn er draußen ist, geht es hier weiter.</p>
    <div class="btns"><button class="red" data-action="go" data-v="desc">Zum Abgrund</button></div></section></div>`;
}
// Weg planen: Karte mit Gabelungen. sel = { loc, h, path }
export function viewExped(sel) {
  const open = LOCATIONS.filter(locOpen), loc = open.some(l => l.id === sel.loc) ? sel.loc : open[open.length - 1].id, li = open.findIndex(l => l.id === loc);
  const map = expedMap(loc, sel.h), path = sel.path.slice(0, map.rows.length), full = path.length === map.rows.length, p = expedPreview(loc, sel.h, full ? path : null);
  const nR = map.rows.length + 2, Y = r => (r + 0.5) / nR * 100;   // Start oben, Ziel unten
  const pos = (r, n) => ({ x: n.x * 100, y: Y(r) });
  const can = (r, j) => r === path.length && (r === 0 || expLinked(map.rows[r - 1][path[r - 1]], map.rows[r][j]));
  let lines = '', gold = '';
  const ln = (a, b, on) => { const s = `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`; if (on) gold += s; else lines += s; };
  const st = { x: 50, y: Y(0) };
  map.rows[0].forEach((n, j) => ln(st, pos(1, n), path[0] === j));
  for (let r = 1; r < map.rows.length; r++) map.rows[r].forEach((n, j) => map.rows[r - 1].forEach((m, k) => { if (expLinked(m, n)) ln(pos(r, m), pos(r + 1, n), path[r - 1] === k && path[r] === j); }));
  const last = map.rows.length, gp = { x: 50, y: Y(last + 1) };
  map.rows[last - 1].forEach((n, j) => ln(pos(last, n), gp, full && path[last - 1] === j));
  const node = (r, n, j) => { const on = path[r] === j, nx = can(r, j), d = EXP_NODES[n.t];
    const tap = on || nx || (r < path.length && (r === 0 || expLinked(map.rows[r - 1][path[r - 1]], n)));
    return `<button class="node ${on ? 'on' : ''} ${nx ? 'next' : ''} ${!on && !nx ? 'off' : ''} ${n.t === 'danger' ? 'danger' : ''}" style="left:${n.x * 100}%;top:${Y(r + 1)}%" ${tap ? `data-action="exppath" data-l="${loc}" data-r="${r}" data-j="${j}"` : ''} title="${d.text}">${nodeArt(n.t, loc)}<label>${d.name}</label></button>`; };
  const nodes = map.rows.map((row, r) => row.map((n, j) => node(r, n, j)).join('')).join('');
  const nm = full ? path.map((j, r) => EXP_NODES[map.rows[r][j].t].name) : [];
  const hint = path.length < map.rows.length ? (() => { const r = path.length, opts = map.rows[r].filter((n, j) => can(r, j)); return `Wähle die ${r + 1}. Station: ${[...new Set(opts.map(n => EXP_NODES[n.t].name))].join(' oder ')}.`; })() : '';
  const n = x => x < 1 ? (x > 0 ? '<1' : '0') : '~' + Math.round(x);
  return `<div class="col exped">
    <section class="panel expmap"><h2>Expedition <span class="h2r">ohne Glut · keine Kämpfe</span></h2>
      <div class="xhead"><button class="tiny" data-action="exploc" data-d="-1" ${li <= 0 ? 'disabled' : ''}>‹</button><b>${LOCATIONS.find(l => l.id === loc).name}</b><button class="tiny" data-action="exploc" data-d="1" ${li >= open.length - 1 ? 'disabled' : ''}>›</button></div>
      <nav class="subtabs">${EXPED.hours.map(h => `<a class="${h === sel.h ? 'on' : ''}" data-action="expsel" data-h="${h}">${h} Std.</a>`).join('')}</nav>
      <div class="map" style="--rows:${nR}"><svg class="lines" viewBox="0 0 100 100" preserveAspectRatio="none"><g class="l0">${lines}</g><g class="l1">${gold}</g></svg>
        <span class="node start on" style="left:50%;top:${Y(0)}%"><img src="assets/ui/marker.webp" alt=""><label>Aufbruch</label></span>
        ${nodes}<span class="node goal ${full ? 'on' : ''}" style="left:50%;top:${Y(last + 1)}%">${nodeArt('goal', loc)}<label>${map.goal.name}</label></span></div></section>
    <section class="panel xsum"><h2>Dein Weg <span class="h2r">${map.rows.length} Stationen · ${sel.h} Std.</span></h2>
      ${full ? `<p class="small">${nm.join(' → ')} → ${map.goal.name}</p><p class="small xprev">Bringt etwa <b>${p.gold} Gold</b> · <b>${p.xp} EP</b> · ${n(p.herbs)} Zutaten · ${n(p.mats)} Material · ${n(p.items)} Fundstücke${p.events ? ` · <b>${p.events} Ereignis${p.events > 1 ? 'se' : ''}</b>` : ''}${p.bless ? ' · <span class="up">Segen</span>' : ''}${sel.h >= EXPED.longH ? ' <span class="up">(Ziel: sicher magisch)</span>' : ''}</p>${p.danger ? `<p class="small hot">Gefahr: ${EXP_NODES.danger.text}.</p>` : ''}`
             : `<p class="small dim">${hint} Jede Station zeigt vorher, was sie bringt.</p>`}</section>
    <div class="btns"><button data-action="go" data-v="trips">Zurück</button><button class="red" data-action="expgo" data-l="${loc}" ${full ? '' : 'disabled'}>Aufbrechen</button></div>
  </div>`;
}
// Heimkehr: ein Ereignis wartet auf deine Wahl
export function viewExpEvent() {
  const e = S.exp, R = e.ret, nd = R.list[R.i], ev = expEvent(nd.ev);
  const trail = R.list.map((n, i) => `<i class="${i < R.i ? 'done' : i === R.i ? 'now' : ''}">${nodeArt(n.t, e.loc)}</i>`).join('<s></s>');
  return `<div class="col expev"><section class="panel"><div class="trail">${trail}</div></section>
    <section class="panel evt"><h2>${ev.title}</h2><img class="pic" src="assets/${ev.img}" alt=""><p class="lore">${ev.text}</p>
      ${ev.ch.map((c, i) => { const err = expChoiceOk(c), cost = expPayCost(c);
        return `<button class="choice" data-action="expchoose" data-i="${i}" ${err ? 'disabled' : ''}><b>${c.t}</b><small>${c.hint}${cost ? ` (${cost} Gold)` : ''}${err ? ` · <span class="down">${err}</span>` : ''}</small></button>`; }).join('')}
    </section></div>`;
}
export function viewExpRes(res) {
  const w = res.rew, L = [];
  if (res.h || w.gold || w.xp) L.push(`<b>+${w.gold} Gold</b> · <b>+${w.xp} EP</b>${w.up ? ' · <span class="up">Stufe aufgestiegen!</span>' : ''}`);
  const chips = [...w.herbs.map(([k, c]) => `<span title="${HERBS[k].name}">${herbImg(k)}<i class="nm">${HERBS[k].name} </i>×${c}</span>`), ...w.mats.map(([k, c]) => `<span title="${MATS[k]}">${matImg(k)}<i class="nm">${MATS[k]} </i>×${c}</span>`)];
  if (chips.length) L.push(`<span class="xrow">${chips.join('')}</span>`);
  if (w.items?.length) L.push(w.items.map(it => `<span class="r-${it.rarity}">${it.name}</span>${it.soldFull ? ' <span class="dim small">(verkauft)</span>' : ''}`).join(' · '));
  if (res.bless) L.push(res.bless > 0 ? `<span class="up">Segen: nächster Krypta-Kampf +${Math.round(res.bless * 100)} % Leben</span>` : `<span class="down">Fluch: nächster Krypta-Kampf ${Math.round(res.bless * 100)} % Leben</span>`);
  const steps = res.steps.map(s => `<p><i>${nodeArt(s.t, res.place.id)}</i><span>${s.name}${s.choice ? ` – ${s.choice}` : ''}: ${s.out ? `<em>${s.out}</em> ` : ''}<span class="${s.cls}">${s.text}</span></span></p>`).join('');
  return `<div class="col expresv"><section class="panel expres"><h2>Heimgekehrt · ${res.place.name}</h2>
    ${steps ? `<div class="steps">${steps}</div>` : `<p class="lore">„${res.tale}“</p>`}
    <p class="dim small">${res.h ? `${res.h} Std. unterwegs${res.early ? ' · früh heimgerufen' : ''}` : 'Zu früh heimgerufen – er bringt nichts mit.'}</p></section>
    <section class="panel"><h2>Beute</h2><div class="xloot">${L.map(x => `<p>${x}</p>`).join('') || '<p class="dim">nichts</p>'}</div></section>
    <div class="btns"><button class="red" data-action="expok">Weiter</button></div></div>`;
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
    <section class="panel services">${tid === 'halvar' ? `<button class="svc red" data-action="go" data-v="forge"><b>Schmiede</b></button>` : tid === 'ysolde' ? `<button class="svc red" data-action="alch" data-b="traders"><b>Alchemie</b></button>` : ''}${(SERVICES[tid] || []).map(sv => { const st = serviceState(sv);
      return `<button class="svc" data-action="service" data-t="${tid}" data-s="${sv.id}" ${st.can ? '' : 'disabled'}>
        <b>${sv.name}${sv.max && st.it ? ` +${st.step}` : ''}</b><small>${st.reason || st.costText}${st.questMat && !st.reason ? ` <i class="hot">– ${MATS[st.questMat]} für Auftrag!</i>` : ''}</small></button>`; }).join('')}</section>
    <section class="panel shop"><div class="invhead"><span>Ware</span><small class="dim">bessere Ware mit höherer Treue</small></div>
      <div class="shoprow">${shop.map(it => `<div class="sitem r-${it.rarity}${it.lock ? ' lock' : ''}" data-tip="${it.id}" data-action="buy" data-t="${tid}" data-id="${it.id}">${itemArt(it)}${gainTag(it)}<span class="price ${S.gold < it.price ? 'no' : ''}">${it.price}</span></div>`).join('') || '<span class="dim">Ausverkauft.</span>'}</div></section>
  </div>`;
}

// --- Krypten ---
export function viewCrypts() {
  const d = DIFFICULTIES[S.crypt.diff], cd = Math.max(0, Math.ceil((S.crypt.cd - Date.now()) / 1000));
  return `<div class="col crypts">${cryptTabs('crypt')}${say('ilse')}<div class="crypthead"><span>Die Krypten · ${d.name}</span><span>${cd ? `Erholung <span data-until="${S.crypt.cd}">${fmtT(cd)}</span>` : 'bereit'}</span></div>
    ${CRYPTS.map(c => { const f = cryptFloor(c), open = cryptOpen(c), done = f >= 5;
      const troph = S.trophies.some(t => t.key === c.id + ':' + S.crypt.diff);
      return `<section class="panel crypt ${!open ? 'locked' : ''} ${done ? 'done' : ''}" ${open && !done && !cd ? `data-action="crypt" data-id="${c.id}"` : ''}>
        ${monsterArt(c.boss.glyph)}
        <div><h3>${c.name}</h3>
          <p class="small">${!open ? (c.shards && S.shards.length < c.shards ? `Versiegelt · Glockensplitter ${S.shards.length}/${c.shards}` : `Versiegelt bis Stufe ${c.lvl + d.lvlAdd - 2}`) : done ? `${c.boss.name} ist gefallen.` : f === 4 ? `<span class="hot">${c.boss.name}</span> · <i>${c.boss.mechText}</i>` : `Ebene ${f + 1}: ${c.floors[f]} · Stufe ${cryptLvl(c, f)}`}${open && !done ? ' · ' + threat(cryptChance(c)) : ''}</p>
          <div class="floors">${[0, 1, 2, 3, 4].map(i => `<i class="${i < f ? 'on' : ''} ${i === 4 ? 'boss' : ''}"></i>`).join('')}</div>
          <div class="dim small">Trophäe: ${effLine(c.trophy)}${troph ? ' · errungen' : ''}</div></div></section>`; }).join('')}</div>`;
}

function fightSummary(F) {
  const g = gradeOf(F), R = fightReport(F, F.A, F.B), pl = x => x.map(([n, v]) => `${n} ${v} %`).join(' · ');
  return `<div class="fsum">${g ? `<b class="g-${g.id}">${g.name}</b>${g.bonus ? ` · +${Math.round(g.bonus * 100)} % Gold` : ''} · ` : ''}${Math.round((F.left || 0) * 100)} % Leben übrig
    ${R.mine.length ? `<br><span class="dim">Dein Schaden: ${pl(R.mine)}</span>` : ''}
    ${F.back === 'crypt' && R.his.length ? `<br><span class="dim">Sein Schaden: ${pl(R.his)}${R.heal ? ` · heilte ${fmtN(R.heal)}` : ''}</span>` : ''}
    ${R.used.length ? `<br><span class="potline">Getrunken: ${R.used.join(', ')}</span>` : ''}
    ${R.tip ? `<br><span class="tipline">Tipp: ${R.tip}</span>` : ''}</div>`;
}
export function viewFight(F) {
  const shown = F.log.slice(0, F.step), last = shown[shown.length - 1] || {};
  const hpA = last.hpA ?? F.curA0 ?? F.hpA, hpB = last.hpB ?? F.hpB, done = F.step >= F.log.length;
  const side = (f, hp, max, hit, id, ch) => `<div class="fighter ${done && (id === 'fA') !== (F.winner === 'a') ? 'dead' : ''}" id="${id}"><div class="pwrap">${id === 'fB' ? `<span class="intent" ${last.iB && !done ? '' : 'hidden'}>${last.iB || ''}</span>` : ''}${f.cls ? `<img class="portrait" src="${P(f.cls)}" alt="">` : monsterArt(f.glyph)}${done && F.gold && id === 'fB' ? `<span class="goldpop"><img src="assets/ui/coin.webp" alt="">+${F.gold}</span>` : ''}</div>
    <div class="nm">${f.name}</div><div class="bar"><i style="width:${pct(hp, max)}%"></i></div><div class="hp">${Math.max(0, hp)} / ${max}</div>
    ${f.belt?.length ? `<div class="pbelt">${f.belt.map(p => { const k = F.log.findIndex(l => l.pot === p.id && l.who === 'a'); return `<img class="${k >= 0 && k < F.step ? 'used' : ''}" src="assets/potions/${p.id}.webp" data-p="${p.id}" alt="" title="${p.name}">`; }).join('')}</div>` : ''}
    ${f.spells?.length ? `<div class="sbar">${f.spells.map((sp, i) => `<div class="sb" data-i="${i}" title="${sp.name}" style="--c:${ch?.[i] ?? 0}"><img src="assets/spells/${sp.id}.webp" alt=""><i></i></div>`).join('')}</div>` : ''}</div>`;

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
    return `<button class="cop" data-action="craftop" data-o="${op.id}" ${err ? 'disabled' : ''} title="${op.text}">${matImg(op.mat)}<b>${op.name}</b><small>${MATS[op.mat]} <i class="${(S.mats[op.mat] || 0) < op.n ? 'down' : ''}">${S.mats[op.mat] || 0}/${op.n}</i> · Glut ${op.glut}+</small></button>`; }).join('');
  const why = it && CRAFT.ops.map(op => craftCheck(it, op.id, sel.stat)).find(e => e && !/Material|Bonus antippen/.test(e));
  return `<div class="col forge craft">${forgeTabs(sel)}
    <section class="panel"><div class="cpick">${list.map(x => `<div class="fslot r-${x.rarity} ${x.id === sel.item ? 'on' : ''} ${x.crafted ? 'full' : ''} ${Object.values(S.equip).includes(x) ? 'eq' : ''}" data-action="craftpick" data-id="${x.id}">${itemArt(x)}${Object.values(S.equip).includes(x) ? '<i>an</i>' : ''}</div>`).join('') || '<span class="dim small">Nichts zum Umschmieden. Magische Items fallen bei Monstern und Händlern.</span>'}</div></section>
    <section class="panel grow">${card}</section>
    <section class="panel"><div class="cops">${ops}</div>
      <p class="small cmsg">${sel.msg || (it ? `Je Eingriff ${craftGold(it)} Gold · ${sel.stat ? `<b>${STAT_NAME(sel.stat)}</b> gewählt` : 'zum Versiegeln einen Bonus antippen'}${why ? ` · <span class="down">${why}</span>` : ''}` : 'Material bestimmt den Eingriff, Schmiedeglut wie oft.')}</p></section></div>`;
}

// --- Alchemie & Vorbereitung ---
const potImg = id => `<img src="assets/potions/${id}.webp" alt="">`;
// Ein Gürtel-Platz: Bild, Name, Ladungen, Auslöser (antippen = wechseln)
function beltRow(i, edit) {
  if (i >= beltSlots()) return `<div class="bslot locked"><span class="pslot"></span><span class="dim small">Dritter Platz ab Treue ${LOYALTY[ALCH.loyalNeed]} bei Ysolde</span></div>`;
  const b = S.belt[i], p = b && potion(b.id), n = p ? S.pots[p.id] || 0 : 0;
  if (!p) return `<div class="bslot empty"><span class="pslot"></span><span class="dim small">Leer${edit ? ' – Trank wählen, dann „In den Gürtel“' : ''}</span></div>`;
  return `<div class="bslot ${p.rare ? 'rare' : ''} ${n ? '' : 'out'}"><span class="pslot">${potImg(p.id)}<i>${n}</i></span>
    <span class="bn"><b>${p.name}</b><small>${p.rare ? 'selten · wirkt den ganzen Kampf' : TRIGGERS[b.trig]}</small></span>
    ${!p.rare && p.trig.length > 1 ? `<button class="tiny" data-action="trig" data-i="${i}">Auslöser</button>` : ''}${edit ? `<button class="tiny" data-action="beltdel" data-i="${i}">×</button>` : ''}</div>`;
}
// Gürtel in der Vorbereitung: Plätze nebeneinander (spart Höhe), Antippen wechselt den Auslöser
function beltCell(i) {
  const b = S.belt[i], p = b && potion(b.id), n = p ? S.pots[p.id] || 0 : 0;
  if (!p) return `<div class="bcell empty"><span class="pslot"></span><span class="bn dim small">Leer</span></div>`;
  const tr = !p.rare && p.trig.length > 1;
  return `<div class="bcell ${p.rare ? 'rare' : ''} ${n ? '' : 'out'} ${tr ? 'tap' : ''}" ${tr ? `data-action="trig" data-i="${i}"` : ''}><span class="pslot">${potImg(p.id)}<i>${n}</i></span>
    <span class="bn"><b>${p.name}</b><small>${p.rare ? 'ganzer Kampf' : TRIGGERS[b.trig]}</small></span><button class="tiny bx" data-action="beltdel" data-i="${i}" title="Herausnehmen">×</button></div>`;
}
export function viewAlch(sel, back) {
  const p = potion(sel) || POTIONS[0], c = brewCost(p.id), cb = canBrew(p.id), inBelt = S.belt.some(b => b?.id === p.id);
  return `<div class="col alch">
    <section class="panel"><h2>Alchemie <span class="h2r">Tränke wirken nur in der Krypta</span>${back ? `<button class="tiny" data-action="${back === 'prep' || back === 'desc' ? `go" data-v="${back}` : 'trader" data-t="ysolde'}">Zurück</button>` : ''}</h2>
      <div class="belt">${[0, 1, 2].map(i => beltRow(i, true)).join('')}</div></section>
    <section class="panel herbs">${Object.entries(HERBS).map(([k, h]) => `<span class="herb" title="${h.name}">${potImg(h.img)}<i>${S.herbs[k] || 0}</i></span>`).join('')}</section>
    <section class="panel potgrid">${POTIONS.map(x => `<span class="ptile ${x.rare ? 'rare' : ''} ${x.id === p.id ? 'on' : ''} ${canBrew(x.id).ok ? 'can' : ''}" data-action="potsel" data-id="${x.id}">${potImg(x.id)}${S.pots[x.id] ? `<i>${S.pots[x.id]}</i>` : ''}</span>`).join('')}</section>
    <section class="panel potdet"><h3 class="${p.rare ? 'r-rare' : ''}">${p.name} <span class="h2r">${p.rare ? 'selten · 1 Ladung' : `gewöhnlich · ${ALCH.charges} Ladungen`}</span></h3>
      <p class="small">${p.text}${p.rare ? '' : ` Zündet: ${p.trig.map(t => TRIGGERS[t]).join(' oder ')}.`}</p>
      <p class="small dim">Vorrat ${S.pots[p.id] || 0}/${potMax(p)} · Kosten: ${Object.entries(c.herbs).map(([k, n]) => `${HERBS[k].name} ×${n} <i class="${(S.herbs[k] || 0) < n ? 'down' : ''}">(${S.herbs[k] || 0})</i>`).join(', ')}, ${c.gold} Gold</p>
      <div class="btns"><button class="red" data-action="brew" data-id="${p.id}" ${cb.ok ? '' : 'disabled'}>${cb.ok ? 'Brauen' : cb.reason}</button>
        <button data-action="${inBelt ? 'beltout' : 'beltin'}" data-id="${p.id}" ${inBelt || S.pots[p.id] ? '' : 'disabled'}>${inBelt ? 'Aus dem Gürtel' : 'In den Gürtel'}</button></div></section>
  </div>`;
}
// Vor dem Krypta-Kampf: Gegner, seine Werte, dein Gürtel, Siegchance mit/ohne Tränke
export function viewPrep(c, m) {
  const f = cryptFloor(c), pW = cryptChance(c), p0 = cryptChance(c, []);
  const head = `${monsterArt(m.glyph)}<div><h2>${m.name.split(',')[0]}</h2><p class="dim small">${c.name} · ${f === 4 ? 'Boss' : 'Ebene ' + (f + 1)} · Stufe ${m.lvl}</p>${threat(pW)}</div>`;
  return prepCore(m, head, pW, p0, `<button class="red" data-action="cryptgo" ${S.crypt.cd > Date.now() ? 'disabled' : ''}>Kämpfen</button>`, S.bless);
}
// Vorbereitung: Kopf + Werte mit Trank-Hinweisen + Gürtel + Siegchance (Krypta und Grube)
function prepCore(m, head, pW, p0, go, bless = 0, rule = null) {
  const e = enemyInfo(m), st = (k, v) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`, pc = x => Math.round(x * 100) + ' %';
  return `<div class="col prep">
    <section class="panel prephead">${head}</section>
    <section class="panel"><h2>Seine Werte <span class="h2r">gegen dich</span></h2>
      <div class="grid2">${st('Leben', fmtN(e.hp))}${st('Trifft dich', e.hit.join('–'))}${st('Ausweichen', pc(e.evade))}${st('Krit', pc(e.crit))}${st('Rüstung', pc(e.armor))}${st('Blocken', e.block ? pc(e.block) : '–')}</div>
      ${e.tags.length ? `<div class="etags">${e.tags.slice(0, 4).map(([t, id]) => { const o = potOffer(id), nm = potion(id).name;
        const act = o.kind === 'pack' ? `${nm} einpacken` : o.kind === 'brew' ? `${nm} brauen · ${o.gold} G` : o.kind === 'in' ? `${nm} im Gürtel` : `${nm} · ${o.short || o.text}`;
        return `<span class="etag ${o.kind}" ${o.kind === 'pack' || o.kind === 'brew' ? `data-action="prepPot" data-id="${id}"` : ''}><b>${t}</b>${act}</span>`; }).join('')}</div>` : ''}</section>
    ${rule?.id === 'nopots' ? `<section class="panel"><h2>${rule.name}</h2><p class="small dim">${rule.text}</p></section>`
      : `<section class="panel"><h2>Dein Gürtel <span class="gbtns"><button class="tiny" data-action="bestBelt">Bester Gürtel</button><button class="tiny" data-action="alch" data-b="prep">Alle Tränke</button></span></h2><div class="beltrow">${[0, 1, 2].slice(0, beltSlots()).map(beltCell).join('')}</div></section>`}
    <section class="panel chance"><span class="cl">Siegchance<small class="dim">${rule?.id === 'nopots' ? 'ohne Tränke' : `ohne Tränke ${pc(p0)}`}</small>${bless ? `<small class="${bless > 0 ? 'up' : 'down'}">${bless > 0 ? 'Segen' : 'Fluch'} ${bless > 0 ? '+' : ''}${Math.round(bless * 100)} % Leben</small>` : ''}</span><b>${pc(pW)}</b>${go}</section>
  </div>`;
}
// --- Die Grube ---
const hon = n => `<i class="ico hon"></i>${n}`;
export function viewPitPrep(sel, B) {
  const ch = sel.ch ? pitChallenge() : null, rule = ch ? PIT_RULES.find(r => r.id === ch.rule) : null, st = PIT_STYLES[B.style];
  const pW = pitChance(B, rule?.id), p0 = pitChance(B, rule?.id, []), busy = pitBusy();
  const win = ch ? `${hon(PIT.chHonor)} · Platz bleibt` : `Platz ${B.place} · ${hon(pitWinHonor(B.rid))}`;
  const head = `<img class="portrait" src="${P(B.cls)}" alt=""><div><h2>${B.name}</h2><p class="dim small">${CLASSES[B.cls].name} · Stufe ${B.lvl} · ${st.name}${ch ? ` · <b class="hot">${rule.name}</b>` : ''}</p>
    <p class="small pitwin">Sieg: ${win} · Niederlage: ${Math.round(PIT.cdLose / 60)} Min. Pause</p></div>`;
  const go = busy === 'Pause' ? `<button class="red" disabled><span data-until="${S.pit.ts}">${fmtT(Math.ceil((S.pit.ts - Date.now()) / 1000))}</span></button>`
    : `<button class="red" data-action="pitgo" ${busy ? 'disabled' : ''}>Kämpfen</button>`;
  return prepCore(B, head, pW, p0, go, 0, rule).replace('class="col prep"', 'class="col prep pitprep"').replace('<section class="panel chance"', '<div class="btns"><button data-action="go" data-v="arena">Zurück</button></div><section class="panel chance"');
}
export function viewArena() {
  const Pw = pitWeek(), place = pitPlace(), rk = pitRank(), ri = PIT_RANKS.indexOf(rk), nx = PIT_RANKS[ri + 1], foes = pitFoes(), ch = Pw.ch, busy = pitBusy();
  const prog = nx ? Math.max(4, Math.round((rk.max - place) / (rk.max - nx.max) * 100)) : 100;
  const pause = busy === 'Pause' ? ` · Pause <span data-until="${Pw.ts}">${fmtT(Math.ceil((Pw.ts - Date.now()) / 1000))}</span>` : '';
  const chR = ch && PIT_RULES.find(r => r.id === ch.rule), chV = ch && pitRival(ch.rid);
  return `<div class="col pit">${cryptTabs('arena')}
    <section class="panel pitrank"><div><h3>${rk.name}</h3><small>${nx ? `Noch ${place - nx.max} bis ${nx.name}` : 'Niemand über dir.'} · ${hon(S.honor)} Ehre${pause}</small></div><b class="pl">${place}.</b><div class="prog"><i style="width:${prog}%"></i></div></section>
    ${foes.map(f => { const st = PIT_STYLES[f.B.style]; return `<section class="panel riv tf-${threatLabel(f.p)[1]} ${f.foe ? 'foe' : ''}" data-action="pitsel" data-id="${f.id}">
      <img src="${P(f.B.cls)}" alt=""><h4>${f.B.name}</h4><span class="pz">${f.place}.</span><span class="st">${f.foe ? 'Hat dich zweimal besiegt.' : st.text}</span>
      <div class="meta"><span>Stufe ${f.B.lvl} · ${st.name}</span><b>${pcT(f.p)}</b><span>${hon(f.honor)}${f.foe ? ' ×2' : ''}</span></div></section>`; }).join('') || '<section class="panel"><p class="lore">Niemand steht mehr über dir. Der Sand gehört dir.</p></section>'}
    ${ch ? `<div class="bountybar pitch ${ch.won ? '' : 'ready'}" ${ch.won || ch.tries <= 0 ? '' : `data-action="pitsel" data-id="${ch.rid}" data-ch="1"`}><span>Woche: ${chR.name}</span><b>${chV.name}</b>${ch.won ? '<i>geschafft</i>' : `<i>${hon(PIT.chHonor)} · ${ch.tries}/${PIT.chTries}</i>`}</div>` : ''}
    <div class="btns pitbtns"><button data-action="go" data-v="pitshop">Vargos Laden</button><button data-action="npc" data-n="vargo">Vargo</button></div>
  </div>`;
}
export function viewPitShop() {
  const shop = pitShop(), Pw = S.pit, left = PIT.weekBuys - Pw.buys;
  const ware = (w, t, k) => { const can = !w.sold && left > 0 && S.honor >= w.price;
    const art = w.t === 'item' ? itemArt(w.item) : w.t === 'herb' ? herbImg(w.id) : matImg(w.id), nm = w.t === 'item' ? '' : `<i class="wn">${w.t === 'herb' ? HERBS[w.id].name : MATS[w.id]} ×${w.n}</i>`;
    return `<div class="sitem pware ${w.t === 'item' ? 'r-' + w.item.rarity : ''} ${w.sold ? 'sold' : ''}" ${w.t === 'item' ? `data-tip="${w.item.id}"` : ''} data-action="pitbuy" data-t="${t}" data-k="${k}">${art}${nm}<span class="price ${can ? '' : 'no'}">${w.sold ? 'verkauft' : hon(w.price)}</span></div>`; };
  return `<div class="col pitshopv">${cryptTabs('arena')}
    <section class="panel"><h2>Vargos Laden <span class="h2r">${hon(S.honor)} · noch ${left} diese Woche</span></h2>
    ${PIT_SHOP.map(t => { const rk = PIT_RANKS.find(r => r.id === t.rank); return pitTierOpen(t.rank)
      ? `<div class="tier">${rk.name}</div><div class="shoprow pitrow">${shop[t.rank].map((w, k) => ware(w, t.rank, k)).join('')}</div>`
      : `<div class="tier off">${rk.name} · ab Platz ${rk.max}</div>`; }).join('')}</section>
    <section class="panel"><h2>Titel</h2><div class="titles">${Pw.titles.length ? Pw.titles.map(t => `<button class="tiny ${S.title === t ? 'on' : ''}" data-action="pittitle" data-t="${t}">${t}</button>`).join('') + (S.title ? '<button class="tiny" data-action="pittitle" data-t="">Ohne</button>' : '') : '<span class="dim small">Steig auf, um Titel zu tragen. Jeder neue Rang gibt einmalig einen Segen.</span>'}</div></section>
    <div class="btns"><button data-action="go" data-v="arena">Zurück</button></div>
  </div>`;
}
// Reiter im Krypta-Tab: Krypten | Abgrund | Grube (eigene Fenster)
export const cryptTabs = on => { const cd = Math.max(0, Math.ceil((S.crypt.cd - Date.now()) / 1000));   // Erholung der Krypta steht am Reiter (auch wenn die Kopfzeile kompakt wegfällt)
  return `<nav class="subtabs ctabs">${[['crypt', 'Krypten'], ['desc', 'Abgrund'], ['arena', 'Grube']].map(([v, n]) => `<a class="${on === v ? 'on' : ''}" data-action="go" data-v="${v}">${n}${v === 'crypt' && cd ? ` <span class="cdt" data-until="${S.crypt.cd}">${fmtT(cd)}</span>` : ''}</a>`).join('')}</nav>`; };
// --- Der Abstieg ---
const monImg = name => { const m = MONSTERS.find(x => x.name === name); return `<img class="mon" src="assets/monsters/${m?.glyph || 'skelett'}.jpg" alt="">`; };
const descArt = (n, c) => n === 'boss' ? `<img class="mon" src="${c.boss.glyph === 'self' ? P(S.cls) : `assets/monsters/${c.boss.glyph}.jpg`}" alt="">` : n.mob ? monImg(n.mob) : nodeArt(DESC_ROOMS[n.t].img);
const pcT = p => Math.round(p * 100) + ' %';
export function viewDesc(st) {
  if (st.res) return viewDescRes(st.res);
  return S.desc ? viewDescRun(st) : viewDescStart(st);
}
function viewDescStart(st) {
  const list = descCrypts();
  if (!list.length) return `<div class="col desc">${cryptTabs('desc')}<section class="panel waiting"><h2>Der Abgrund</h2><p class="lore">Unter den Krypten liegt mehr als Knochen. Wer dort hinab will, muss erst einen Krypta-Boss bezwungen haben.</p>
    <p class="small dim">Rausholen oder verlieren: Leben läuft von Raum zu Raum mit, die Beute zählt erst draußen.</p></section></div>`;
  const c = list.find(x => x.id === st.c) || list[list.length - 1], i = list.indexOf(c), left = descLeft();
  return `<div class="col desc">${cryptTabs('desc')}
    <section class="panel dhead">${monsterArt(c.boss.glyph)}<div><h2>Der Abgrund <span class="h2r">heute noch ${left}</span></h2>
      <div class="xhead"><button class="tiny" data-action="descc" data-d="-1" ${i <= 0 ? 'disabled' : ''}>‹</button><b>${c.name}</b><button class="tiny" data-action="descc" data-d="1" ${i >= list.length - 1 ? 'disabled' : ''}>›</button></div>
      <p class="small dim">Gegner Stufe ${descLvl(c)} · oben wartet ${c.boss.name.split(',')[0]}: <i>${c.boss.mechText}</i></p></div></section>
    <section class="panel drules"><h2>Rausholen oder verlieren</h2>
      <p class="small">Jeder Raum ein Kampf. <b>Leben und Trank-Ladungen füllen sich unten nicht auf.</b></p>
      <p class="small">Mit jedem Raum steigt die <b>Unruhe</b>: Gegner stärker, Beute bis ×${descMult(5)}.</p>
      <p class="small">Beute liegt im <b>Beutesack</b>. Dir gehört sie erst an einem <span class="up">Ausgang</span>: Seil, Brunnen, Stiege oder hinter dem Boss.</p>
      <p class="small down">Fällst du, bleibt der Sack unten. Ausrüstung, Stufe und EP behältst du.</p>${descBusy() ? `<p class="small hot">${descBusy()}</p>` : ''}</section>
    <section class="panel"><h2>Dein Gürtel <span class="gbtns"><button class="tiny" data-action="alch" data-b="desc">Tränke</button></span></h2><div class="beltrow">${[0, 1, 2].slice(0, beltSlots()).map(beltCell).join('')}</div></section>
    <div class="btns"><button data-action="go" data-v="crypt">Zurück</button><button class="red" data-action="descgo" data-c="${c.id}" ${descCanStart(c) ? '' : 'disabled'}>${left ? 'Hinabsteigen' : 'Morgen wieder'}</button></div>
  </div>`;
}
function sackRow(s) {
  const its = s.items.slice(0, 7).map(it => `<span class="dit r-${it.rarity}" data-tip="${it.id}" data-action="noop">${itemArt(it)}</span>`).join('');
  const more = s.items.length > 7 ? `<span class="dmore">+${s.items.length - 7}</span>` : '';
  const chips = [...Object.entries(s.herbs).filter(([, n]) => n > 0).map(([k, n]) => `<span title="${HERBS[k].name}">${herbImg(k)}×${n}</span>`),
    ...Object.entries(s.mats).filter(([, n]) => n > 0).map(([k, n]) => `<span title="${MATS[k]}">${matImg(k)}×${n}</span>`)].join('');
  return `<div class="dsack">${its}${more}${chips ? `<span class="xrow">${chips}</span>` : ''}${!its && !chips ? '<span class="dim small">noch leer</span>' : ''}</div>`;
}
function viewDescRun(st) {
  const D = S.desc, c = CRYPTS.find(x => x.id === D.c), A = stats(), hp = Math.max(0, Math.round(A.hp * D.hpf)), nx = descNext(), R = D.rows.length, cur = D.path.length;
  const nR = R + 2, Y = k => (nR - k - 0.5) / nR * 100;   // 0 Eingang (unten), 1..R Reihen, R+1 Boss (oben)
  const sel = st.j != null && nx.includes(st.j === 'boss' ? 'boss' : +st.j) ? st.j : null;
  let lines = '', gold = '';
  const ln = (a, b, on) => { const t = `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`; if (on) gold += t; else lines += t; };
  const P = (r, n) => ({ x: n.x * 100, y: Y(r + 1) }), ent = { x: 50, y: Y(0) }, bp = { x: 50, y: Y(R + 1) };
  D.rows[0].forEach((n, j) => ln(ent, P(0, n), D.path[0] === j));
  for (let r = 1; r < R; r++) D.rows[r].forEach((n, j) => D.rows[r - 1].forEach((m, k) => { if (Math.abs(m.x - n.x) <= 0.4 && !DESC_ROOMS[m.t].exit) ln(P(r - 1, m), P(r, n), D.path[r - 1] === k && D.path[r] === j); }));
  D.rows[R - 1].forEach((n, j) => { if (!DESC_ROOMS[n.t].exit) ln(P(R - 1, n), bp, false); });
  const node = (r, n, j) => {
    const ex = DESC_ROOMS[n.t].exit, been = D.path[r] === j, here = been && r === cur - 1, nxt = r === cur && nx.includes(j), fog = r > cur && !ex, on = sel != null && sel !== 'boss' && +sel === j && nxt;
    const cls = [been ? 'been' : '', here ? 'here' : '', nxt ? 'next' : '', on ? 'on' : '', fog ? 'fog' : '', !been && !nxt && r <= cur ? 'off' : '', ex ? 'exit' : '', n.t === 'elite' ? 'elite' : ''].join(' ');
    const lab = here ? 'du' : nxt ? (n.t === 'elite' ? 'Elite' : DESC_ROOMS[n.t].name) : '';
    return `<button class="node ${cls}" style="left:${n.x * 100}%;top:${Y(r + 1)}%" ${nxt ? `data-action="descsel" data-j="${j}"` : ''}>${fog ? '' : descArt(n, c)}${lab ? `<label>${lab}</label>` : ''}</button>`;
  };
  const bossNext = nx.includes('boss');
  const nodes = D.rows.map((row, r) => row.map((n, j) => node(r, n, j)).join('')).join('')
    + `<button class="node goal boss ${bossNext ? 'next' : ''} ${sel === 'boss' ? 'on' : ''}" style="left:50%;top:${Y(R + 1)}%" ${bossNext ? 'data-action="descsel" data-j="boss"' : ''}>${descArt('boss', c)}<label>${c.boss.name.split(',')[0]}</label></button>`
    + `<span class="node start ${cur ? 'been' : 'here'}" style="left:50%;top:${Y(0)}%"><img src="assets/ui/marker.webp" alt=""><label>${cur ? 'Stiege' : 'du'}</label></span>`;
  const stairP = D.rooms ? descChance('stair') : 1;
  // Info zum gewählten Raum
  let info = '', go = '';
  if (st.ask) info = `<p class="small"><b>Über die Stiege zurück:</b> ein letzter Kampf bei höherer Unruhe (Sieg ${pcT(stairP)}), dann bist du draußen – mit allem im Sack. Noch einmal tippen.</p>`;
  else if (sel == null) info = st.msg ? `<p class="small dmsg">${st.msg}</p>` : `<p class="small dim">Wähle den nächsten Raum. Leuchtende Räume sind erreichbar.</p>`;
  else {
    const nd = descNodeAt(sel), t = nd === 'boss' ? 'boss' : nd.t, R0 = DESC_ROOMS[t];
    if (t === 'boss' || t === 'fight' || t === 'elite') {
      const m = descEnemy(nd), p = descChance(sel);
      info = `<p class="small"><b class="${t === 'elite' ? 'r-magic' : t === 'boss' ? 'hot' : ''}">${t === 'boss' ? c.boss.name.split(',')[0] : nd.mob}</b> · Stufe ${m.lvl}${m.elite ? ` · <span class="r-magic">${m.elite.join(', ')}</span>` : ''}${t === 'boss' ? ` · <i>${c.boss.mechText}</i>` : ''}</p>
        <p class="small">${threat(p)} · Sieg ${pcT(p)} mit ${hp} Leben${t === 'boss' ? ' · <span class="up">danach draußen</span>' : ''}</p>`;
      go = t === 'boss' ? 'Den Boss stellen' : 'Kämpfen';
    } else if (R0.exit) {
      const cost = t === 'well' ? descWellCost() : 0, can = !cost || S.gold + D.sack.gold >= cost;
      info = `<p class="small"><b class="up">${R0.name}</b> · ${R0.text}${cost ? ` <b>${cost} Gold</b>.` : ''}</p><p class="small">Du nimmst alles im Sack mit hinaus.${can ? '' : ' <span class="down">Zu wenig Gold.</span>'}</p>`;
      go = can ? 'Hinaus' : '';
    } else { info = `<p class="small"><b>${R0.name}</b> · ${R0.text}</p>`; go = 'Betreten'; }
  }
  return `<div class="col descv">
    <section class="panel dtop">
      <div class="dbars"><span>Leben</span><div class="bar"><i style="width:${D.hpf * 100}%"></i></div><b>${hp}/${A.hp}</b>
        <span>Unruhe</span><div class="bar xp"><i style="width:${Math.min(100, D.unrest / 6 * 100)}%"></i></div><b class="up">Beute ×${descMult()}</b></div><div class="dsackh"><span>Raum ${D.rooms + 1} · ${c.name}</span></div></section>
    <section class="panel dmap"><div class="map" style="--rows:${nR}"><svg class="lines" viewBox="0 0 100 100" preserveAspectRatio="none"><g class="l0">${lines}</g><g class="l1">${gold}</g></svg>${nodes}</div></section>
    <section class="panel dinfo">${info}</section>
    <section class="panel dsackp"><div class="dsackl"><b>Sack</b><span>${D.sack.gold} Gold</span></div>${sackRow(D.sack)}</section>
    <div class="btns"><button data-action="descstair" class="${st.ask ? 'red' : ''}">${!D.rooms ? 'Umkehren' : st.ask ? 'Wirklich zur Stiege?' : `Stiege · ${pcT(stairP)}`}</button><button class="red" data-action="descgo2" ${sel != null && go ? `data-j="${sel}"` : 'disabled'}>${go || 'Betreten'}</button></div>
  </div>`;
}
function viewDescRes(res) {
  if (res.lost) { const l = res.lost;
    return `<div class="col descres">${cryptTabs('desc')}<section class="panel"><h2 class="hot">Gefallen · ${l.crypt}</h2>
      <p class="lore">Die Gruft behält, was du getragen hast.</p>
      <p class="small">Verloren: <b class="down">${l.gold} Gold</b>${l.items.length ? ` · <b class="down">${l.items.length} Fundstück${l.items.length > 1 ? 'e' : ''}</b>` : ''}</p>
      ${l.items.length ? `<p class="small">${l.items.map(it => `<span class="r-${it.rarity}">${it.name}</span>`).join(' · ')}</p>` : ''}
      <p class="small">Behalten: <b class="up">${l.xp} EP</b>, Ausrüstung, Stufe · ${l.rooms} Räume geschafft</p></section>
      <div class="btns"><button class="red" data-action="descok">Weiter</button></div></div>`; }
  const o = res.out, chips = [...o.herbs.map(([k, n]) => `<span title="${HERBS[k].name}">${herbImg(k)}<i class="nm">${HERBS[k].name} </i>×${n}</span>`), ...o.mats.map(([k, n]) => `<span title="${MATS[k]}">${matImg(k)}<i class="nm">${MATS[k]} </i>×${n}</span>`)];
  return `<div class="col descres">${cryptTabs('desc')}<section class="panel"><h2>Entkommen · ${o.how}</h2>
    <div class="drows"><p><span>Räume</span><b>${o.rooms} · Unruhe ×${descMult(o.unrest)}</b></p><p><span>Erfahrung</span><b>${o.xp} EP</b></p><p><span>Gold</span><b class="up">+${o.gold}</b></p></div></section>
    <section class="panel"><h2>Gesichert</h2><div class="xloot">
      ${o.items.length ? `<p>${o.items.map(it => `<span class="r-${it.rarity}">${it.name}</span>${it.soldFull ? ' <span class="dim small">(Beutel voll, verkauft)</span>' : ''}`).join(' · ')}</p>` : ''}
      ${chips.length ? `<p class="xrow">${chips.join('')}</p>` : ''}${!o.items.length && !chips.length ? '<p class="dim">nur Gold</p>' : ''}</div></section>
    <div class="btns"><button class="red" data-action="descok">Weiter</button></div></div>`;
}
