// Rendering: reine String-Templates. Keine Spiellogik.
import { PLAYABLE, TREE, AFFIXES, GIVERS, CRAFT, TIERS, RUNES, FORGE, GRADES, ATTR_INFO, SPELLS, MONSTERS, NPCS, CLASSES, ATTRS, SLOTS, RARITIES, CFG, TALENTS, EFFECT_NAMES, CRYPTS, DIFFICULTIES, LOCATIONS, TRADERS, LOYALTY, MATS, INV_W, INV_H, STASH_W, STASH_H, SERVICES, SHARD_CRYPTS, TUTORIAL, BOUNTIES, SETS, SET } from './data.js';
import { MAT_ART, SIGILS, ASHCORE, ELEMENTS, RES_NAMES, SPELL_TREE, TREE_LVL, POTIONS, HERBS, TRIGGERS, ALCH, EXPED, EXP_NODES, HERB_LOC, DESCENT, DESC_ROOMS, ACTS, ACT, CRYPT, WANDER, WANDER_ST, PIT, PIT_STYLES, PIT_RANKS, PIT_SHOP, PIT_RULES } from './data.js';
import { affixPool, tierOf, wpnDmg, wpnCapLvl, bestTier } from './loot.js';
import { sellPrice, sellMat, potion, beltSlots, brewCost, canBrew, potMax, unreadable, restarted, herbPrice, canBuyHerb, herbLeft, herbSource } from './state.js';
import { WIKI_CATS, wikiList, wikiEntry, upgradePaths, matBottleneck } from './wiki.js';
import { treeRanks, nodeState, bridgeState, talentPointsSpent, setCount, setOwned, setsWorn, slotUp, tempered, waysPending, wayOpen, wayCost, craftItems, craftCheck, craftGold, craftRaises, craftMat, baseMods, fusedMods, filterHits, filterOf, filterOn, setFilterMod, fuseMains, fuseFoods, fuseCheck, coreUniques, coreKeys, coreEff, coreTargets, coreCheck, fuseFull, fusePromote, fuseReplaces, forgeTargets, canForge, forgeQuestMat, power, powerWith, powerAttr, S, stats, xpNeed, rank, talentPoints, talentState, respecCost, cryptFloor, cryptOpen, cryptLvl, cryptTier, cryptAct, actProg, actDone, actOpen, actZoneLvl, curAct, locOpen, loyalty, shopFor, omen, serviceState, bounties, bountyReward } from './state.js';
import { current, available, objectives, canComplete } from './quests.js';
// Stufen-Marke eines Bonus; Abgrund-Stufen (I+, I++) tragen zusätzlich .deep und einen Titel (CSS: .tier.t0 / .tier.t-1)
export const tierTag = t => { const T = TIERS.find(x => x.t === t); return T ? `<i class="tier t${t}${T.deep ? ' deep' : ''}"${T.deep ? ' title="Abgrund-Stufe"' : ''}>${T.name}</i>` : ''; };
// Name eines Item-Bonus: Attribute, Rüstung/Schaden, Prozent-Boni ("% Krit-Chance", "% Feuerball")
export const STAT_NAME = k => { if (k === 'dmg') return 'Schaden'; if (k === 'armor') return 'Rüstung'; if (ATTRS[k]) return ATTRS[k];
  const a = AFFIXES.find(x => x.stat === k); return a ? (a.pct ? '% ' : '') + a.label : k; };
import { itemArt, ghost, NPC_ART, MON } from './art.js';
import { evadeChance, critChance, chargeStep, actionRate } from './combat.js';
import { weakAdvice, wanderMap, wanderAct, wanderBusy, wanderDone, actEnemy, actChance, actOdds, packSlot, actCan, actZoneGlut, actZoneMob, pitWeek, pitWinGold, pitWinXp, pitPlace, pitRank, pitFoes, pitChance, pitOdds, pitBusy, pitRival, pitChallenge, pitWinHonor, pitShop, pitTierOpen, gradeOf, cryptChance, cryptOdds, threatLabel, enemyInfo, potOffer, fightReport, expedPreview, expedMap, expLinked, expDoneCount, expEvent, expChoiceOk, expPayCost,
  sigKind, sigHave, sigClean, sigFx, coreChance, descCrypts, descReward, descWeekReward, descWeekDue, descResPen, descLeft, descCanStart, descBusy, descLvl, descAt, descRec, descMaxDepth, descMult, descNext, descNodeAt, descWellCost, descEnemy, descChance } from './game.js';
const threat = p => { const [t, c] = threatLabel(p); return `<span class="threat t-${c}">Gefahr: ${t}</span>`; };

const P = cls => `assets/portraits/${CLASSES[cls].portrait}.jpg`;
const rarName = (id, it) => it?.unique ? 'Einzigartig' : RARITIES.find(r => r.id === id)?.name || '';
export const fmtT = s => s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` : `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, '0')}`;
export const fmtN = n => n.toLocaleString('de-DE');
// Kampfkraft-Änderung durch ein Item (in %), null wenn nicht vergleichbar
export const itemGain = it => { if (!it?.slot || Object.values(S.equip).includes(it)) return null; const p = powerWith(it); return (p.then - p.now) / Math.max(1, p.now); };
const gainTag = it => { const g = itemGain(it); return g > 0.01 ? `<i class="better" title="besser">▲</i>` : ''; };
// Beute-Filter: je getroffenem Bonus ein Punkt, oben LINKS (oben rechts sitzt schon das ▲).
// EIN Helfer fuer alle Felder - die Set-Farbe und das Orange der Einzigartigen haben gelehrt,
// dass acht einzelne Fundstellen bedeuten, dass die neunte Ansicht es wieder vergisst.
const hitDots = it => { const n = filterHits(it); return n ? `<i class="fdots" title="${n} gesuchte Boni">${'<b></b>'.repeat(Math.min(n, 5))}</i>` : ''; };
const pct = (a, b) => Math.max(0, Math.min(100, (a / b) * 100));
const FLAGS = new Set(['first', 'toll', 'lastStand', 'tollback', 'firstEcho', 'venom', 'lastBreath', 'nohealSelf', 'hemorrhage', 'igniteBan']);   // an/aus – keine Prozentzahl
// Bindungen je Attributpunkt (Bruchteile eines Prozents): eine Nachkommastelle, sonst stünde „+1%“ für 0,6 %
const PER_PT = new Set(['wardPerStr', 'lifePerStr', 'hastePerLck']);
// Effekte, die als Malus gezählt werden (Wert positiv, Wirkung negativ): Anzeige mit Minus, im Brett in der Preis-Zeile
const NEG = new Set(['slowCast']); const effVal = (k, v) => NEG.has(k) ? -v : v;
const effLine = e => Object.entries(e).map(([k, v0]) => { const v = effVal(k, v0); return [k, v]; }).map(([k, v]) => `${EFFECT_NAMES[k]}${FLAGS.has(k) ? '' : (v < 0 ? ' −' : ' +') + (PER_PT.has(k) ? String(Math.round(Math.abs(v) * 1000) / 10).replace('.', ',') : Math.abs(Math.round(v * 100))) + '%'}`).join(', ');

// Gemalte Monster/Bosse in assets/monsters/<glyph>.jpg, sonst SVG-Silhouette
const MON_IMG = new Set(['totengraeber', 'muellerin', 'knochenordner', 'strickmutter', 'kultist1', 'aschenkoenig', 'gerlinde', 'aldemar', 'butcher', 'bellringer', 'ghul', 'fallen', 'skelett', 'grabraeuber', 'pestratte', 'kultist',
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

// --- Grab-Sets ---
// Zeigt die drei Teile (getragene grün, fehlende grau) und beide Set-Boni. `mine` = das Teil, dessen Fenster offen ist.
export function setBox(id, mine = null) {
  const set = SETS.find(x => x.id === id); if (!set) return '';
  const worn = new Set(), own = S ? setOwned(id) : new Set();
  for (const it of Object.values(S?.equip || {})) if (it?.set === id) worn.add(it.part);
  const n = worn.size;
  const parts = set.parts.map((p, i) => `<p class="${worn.has(i) ? 'have' : 'miss'}">${p.name}${worn.has(i) || mine?.part === i ? '' : own.has(i) ? ' <i>(im Beutel)</i>' : ''}</p>`).join('');
  return `<div class="setbox"><h5>${set.name} <span>${n}/${SET.parts}</span></h5>${parts}
    <p class="bon ${n >= 2 ? '' : 'off'}">2 Teile: ${set.t2}</p>
    <p class="bon ${n >= SET.parts ? '' : 'off'}">${SET.parts} Teile: ${set.t3}</p></div>`;
}

// Übersicht aller Grab-Sets (bei Schwester Ilse)
export function viewSets() {
  return `<div class="col sets"><section class="panel"><h2>Grab-Sets <span class="h2r">je ${SET.parts} Teile · beim Krypta-Boss</span></h2>
    ${SETS.map(set => { const n = setCount(set.id), own = setOwned(set.id).size, c = CRYPTS.find(x => x.id === set.crypt);
      return `<div class="srow ${own ? '' : 'none'}"><b>${set.name}</b><span>${own}/${SET.parts}${n >= 2 ? ` · <i class="have">${n} getragen</i>` : ''}</span>
        <small>${c?.name || ''}</small><small>2: ${set.t2}</small><small>${SET.parts}: ${set.t3}</small></div>`; }).join('')}</section>
    <button data-action="go" data-v="npc" data-n="ilse">Zurück</button></div>`;
}

// --- Items ---
export function itemTip(it, cmp) {
  const L = [`<div class="n r-${it.rarity}">${it.name}</div><div class="sub2">${rarName(it.rarity, it)} · ${it.base && !it.name.includes(it.base) ? it.base : SLOTS[it.slot]} · Stufe ${it.lvl}${it.deep ? ` · Tiefe ${it.deep}` : ""}</div>`];
  // Beste mögliche Stufe auf diesem Teil (Besitzer 2026-11-24: „bisher ist unbekannt, was auf der Stufe der höchste Tier ist“)
  const bt = Object.keys(it.mods || {}).length ? bestTier(it, '') : null; if (bt != null && !it.unique && !it.set) L.push(`<span class="small dim">Beste Stufe hier: ${tierTag(bt)}</span>`);
  // Schärfen/Verstärken hängen am Platz: jedes Teil zeigt den Wert, den es angelegt hätte
  const tu = S ? slotUp(it.slot) : 0, tn = tu ? ` <small class="tup">${it.slot === 'weapon' ? 'geschärft' : 'verstärkt'} +${tu}</small>` : '';
  if (it.dmg) { const ef = S ? wpnDmg(it, S.lvl) : it.dmg, cut = ef !== it.dmg;   // Waffen-Deckel (Welle 2a): offen zeigen, nie still kürzen
    L.push(`Schaden <b>${tempered(it.dmg[0], it.slot)}–${tempered(it.dmg[1], it.slot)}</b>${tn}${cut ? ` · wirksam <b class="down">${tempered(ef[0], it.slot)}–${tempered(ef[1], it.slot)}</b>` : ''}`);
    if (cut) L.push(`<span class="down small">Wirkt wie Stufe ${wpnCapLvl(S.lvl)} – voll ab Heldenstufe ${it.lvl - CFG.wpnLvlAdd}</span>`); }
  if (it.armor) L.push(`Rüstung <b>${tempered(it.armor, it.slot)}</b>${tn}`);
  // Boni ohne Runen-Anteil, mit Stufe (I = beste)
  const runeOf = k => (it.runes || []).filter(r => r.stat === k).reduce((a, r) => a + r.v, 0);
  const fus = fusedMods(it);
  for (const [k, v] of Object.entries(it.mods)) { const b = v - runeOf(k); if (b <= 0) continue; const t = tierOf(k, b);
    const mark = it.sealed === k ? '<i class="seal">versiegelt</i>' : fus.includes(k) ? '<i class="fus">fusioniert</i>' : '';
    const top = t != null && !it.unique && !it.set && t <= bestTier(it, k) ? '<i class="tmax">max</i>' : '';
    L.push(`<span class="m ${t != null && t <= 2 ? 'hi' : ''}">+${b} ${STAT_NAME(k)}${t != null ? ` ${tierTag(t)}` : ''}${top}${mark}</span>`); }
  if (it.fx) L.push(`<span class="special">${it.unique ? '' : '✦ '}${effLine(it.fx)}</span>`);
  if (it.core) L.push(`<span class="core-l">Aschenkern: ${effLine(it.core.eff)} <i class="dim">(aus ${it.core.from})</i></span>`);
  if (it.set) L.push(setBox(it.set, it));
  if (it.lore) L.push(`<span class="lore small">„${it.lore}“</span>`);
  if (it.crafted) L.push(`<span class="gold small">Geschmiedet von ${it.crafted}</span>`);   // alte Teile aus der Zeit der Schmiedeglut
  if (it.runes?.length || it.slot) { const rn = it.runes || []; if (rn.length) L.push(`<span class="rune">Runen ${rn.length}/${FORGE.maxRunes}: ${rn.map(r => `${r.mat ? `<img class="tiprune" src="assets/forge/r_${r.mat}.webp" alt="">` : ''}${r.name} +${r.v}`).join(', ')}</span>`); }
  if (it.slot === 'weapon') { const ck = CLASSES[S.cls].weapon; L.push(it.kind === ck ? `<span class="gold">Waffe deiner Klasse</span>`
    : `<span class="down">Fremde Waffe: Schaden −${Math.round((1 - CFG.offWeapon) * 100)} %, Zauber −${Math.round((1 - CFG.offWeaponSpell) * 100)} %</span>`); }
  L.push(`<span class="sub2">${it.price ? `Preis: ${it.price} Gold` : `Verkauf: ${sellPrice(it)} Gold${sellMat(it) ? ` · 1 ${MATS[sellMat(it)]}` : ''}`}</span>`);
  if (it.slot && !Object.values(S.equip).includes(it)) {
    const p = powerWith(it), a = stats(), b = p.st, g = (p.then - p.now) / Math.max(1, p.now);
    const row = (n, x, y, f = v => fmtN(Math.round(v))) => { const d = y - x; return Math.abs(d) < 0.5 ? '' : `<span class="${d > 0 ? 'up' : 'down'}">${n} ${d > 0 ? '+' : '−'}${f(Math.abs(d))}</span>`; };
    const diffs = [row('Schaden', (a.dmg[0] + a.dmg[1]) / 2, (b.dmg[0] + b.dmg[1]) / 2), row('Leben', a.hp, b.hp), row('Rüstung', a.armor, b.armor)].filter(Boolean);
    L.push(`<div class="cmpbox ${g > 0.005 ? 'up' : g < -0.005 ? 'down' : ''}"><div class="kk">Kampfkraft ${fmtN(p.now)} → <b>${fmtN(p.then)}</b> <span>${g >= 0 ? '+' : '−'}${Math.abs(Math.round(g * 100))} %</span></div>`
      + `<div class="sub2">${p.old ? 'statt ' + p.old.name : 'Platz ist frei'}</div>${diffs.length ? `<div class="dl">${diffs.join(' · ')}</div>` : ''}</div>`);
  }
  return L[0] + L.slice(1).map(x => x.startsWith('<div') ? x : x + '<br>').join('').replace(/<br>$/, '');
}
// Einzigartige tragen die Seltenheit „legendär" und sahen im Raster deshalb aus wie jedes andere
// legendäre Teil (vom Besitzer gemeldet). `uq` kommt **zusätzlich** zur Seltenheitsklasse ans Feld,
// nie an den Text – dort trägt `.uniq-txt` das Orange schon.
const rarCls = it => `r-${it.rarity}${it.unique ? ' uq' : ''}${it.core ? ' kern' : ''}`;   // kern: Aschenkern-Marke (Welle 2B-2)
const itemEl = (it, act) => `<div class="item ${rarCls(it)}" data-tip="${it.id}" ${act}>${itemArt(it)}${gainTag(it)}${hitDots(it)}</div>`;

// --- Rahmen ---
export function hud(tut = '') {
  return `<header class="hud">
    <div class="hud-row"><span class="ttl">${S.name}${S.title ? ` <small>${S.title}</small>` : ''}</span>
      <span class="res"><button class="optbtn" data-action="go" data-v="opts" title="Einstellungen" aria-label="Einstellungen"><svg viewBox="0 0 24 24"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm9 4.6v-2.2l-2.4-.5a7 7 0 0 0-.7-1.6l1.4-2-1.6-1.6-2 1.4a7 7 0 0 0-1.6-.7L13.6 3h-2.2l-.5 2.4a7 7 0 0 0-1.6.7l-2-1.4L5.7 6.3l1.4 2a7 7 0 0 0-.7 1.6L4 10.4v2.2l2.4.5c.2.6.4 1.1.7 1.6l-1.4 2 1.6 1.6 2-1.4c.5.3 1 .5 1.6.7l.5 2.4h2.2l.5-2.4c.6-.2 1.1-.4 1.6-.7l2 1.4 1.6-1.6-1.4-2c.3-.5.5-1 .7-1.6Z"/></svg></button><span class="coin"></span><b>${S.gold}</b><span class="lvl">Stufe <b>${S.lvl}</b></span>
      <span class="orb" style="--f:${pct(S.glut, CFG.maxGlut)}%" title="Glut"><b>${S.glut}</b></span></span></div>
    ${tut || `<div class="xpline"><div class="bar xp"><i style="width:${pct(S.xp, xpNeed(S.lvl))}%"></i></div><small>${S.xp} / ${xpNeed(S.lvl)} EP</small></div>`}</header>`;
}
export function readyDots(t = Date.now()) {
  return { trips: (!!S.exp && t >= S.exp.end && !S.exp.ret) || wanderDone(),
    crypt: (S.crypt.cd > 0 && t >= S.crypt.cd && CRYPTS.some(c => cryptOpen(c))) || (S.pit?.ts > 0 && t >= S.pit.ts) };
}
export function navBar(view) {
  const tabs = [['hero', 'Held'], ['trips', 'Streifzug'], ['traders', 'Händler'], ['forge', 'Schmiede'], ['alch', 'Alchemie'], ['crypt', 'Krypta']];
  const map = { wplan: 'trips', opts: 'hero', act: 'trips', zoneprep: 'trips', prep: 'crypt', desc: 'crypt', arena: 'crypt', pitprep: 'crypt', pitshop: 'crypt', stats: 'hero', talents: 'hero', spells: 'hero', ways: 'hero', npc: 'trips', bounties: 'trips', exped: 'trips' };
  // Nur echte Handlungsaufforderungen markieren – ein Dauer-Punkt auf jedem Tab sagt nichts mehr
  const badge = { hero: S.points + talentPoints() + waysPending() > 0, traders: [...Object.keys(TRADERS), 'vargo'].some(canComplete), arena: false,
    crypt: canComplete('ilse') || !!descWeekDue(), trips: canComplete('prophet') || bounties().some(b => !b.claimed && b.prog >= b.n) };
  // Grün: eine Wartezeit ist abgelaufen – wieder bereit (verschwindet, sobald man hinschaut)
  const ready = readyDots();
  const on = map[view] || view;
  return `<nav class="tabs">${tabs.map(([k, n]) => `<a class="${on === k ? 'on' : ''} ${badge[k] ? 'badge' : ready[k] ? 'ready' : ''}" data-action="go" data-v="${k}">${n}</a>`).join('')}</nav>`;
}

export function viewCreate(sel) {
  return `<div class="create"><h1>Aschenkrone</h1><div class="sub">Die Glocke hat geschlagen. Die Toten stehen auf.</div>
  ${restarted ? `<p class="cdesc"><b class="hot">Die Welt ist neu geschmiedet.</b> Beute und Boni folgen jetzt festen Stufen – dein alter Held (Stufe ${restarted}) passt nicht mehr hinein. Er ist gesichert und wird nicht überschrieben. Beginne einen neuen.</p>` : ''}
  ${unreadable ? '<p class="cdesc"><b class="hot">Dein Spielstand ließ sich nicht lesen.</b> Er ist gesichert und wird nicht überschrieben. Lade die App neu (online), bevor du einen neuen Helden beginnst.</p>' : ''}
  <div class="classes">${PLAYABLE.map(k => [k, CLASSES[k]]).map(([k, c]) =>
    `<div class="cls ${sel === k ? 'on' : ''}" data-action="pick" data-c="${k}"><img class="portrait" src="${P(k)}" alt=""><div class="lbl">${c.name}</div></div>`).join('')}</div>
  ${sel ? `<p class="cdesc"><b>${CLASSES[sel].name}.</b> ${CLASSES[sel].desc}</p>
  <div class="cname"><input id="nm" maxlength="16" placeholder="Dein Name"><button class="red" data-action="create">Erwachen</button></div>` : '<p class="sub">Wähle, wer du warst.</p>'}</div>`;
}

// --- Held: Ausrüstungsfigur + Raster-Inventar ---
export function viewHero(stash) {
  const rk = rank(), st = stats(), pts = S.points + talentPoints();
  const slot = s => { const it = S.equip[s]; return `<div class="eslot es-${s} ${it ? rarCls(it) : ''}" ${it ? `data-tip="${it.id}" data-action="unequip" data-s="${s}"` : ''}>${it ? itemArt(it) : `<span class="ghost">${ghost(s)}</span>`}</div>`; };
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
    ${invPanel(stash, mats)}
  </div>`;
}

// Beutel und Lager liegen am selben Platz – ein Knopf schaltet um. Das Raster ist dasselbe,
// nur die Liste und die Tipp-Aktion unterscheiden sich.
function invPanel(stash, mats) {
  const g = stash ? { list: S.stash || [], w: STASH_W, h: STASH_H } : { list: S.bag, w: INV_W, h: INV_H };
  const act = stash ? 'stashtip' : 'equip';
  return `<section class="panel invp"><div class="invhead"><span>${stash ? 'Lager' : 'Beutel'}</span>
      <button class="tiny ${stash ? 'on' : ''}" data-action="invmode">${stash ? 'Beutel' : 'Lager'}</button>
      <button class="tiny" data-action="sort" data-g="${stash ? 'stash' : 'bag'}">Ordnen</button></div>
      <div class="inv" style="--w:${g.w};--h:${g.h}">
        ${g.list.map(it => `<div class="cellitem ${rarCls(it)}" style="left:${it.x / g.w * 100}%;top:${it.y / g.h * 100}%;width:${it.w / g.w * 100}%;height:${it.h / g.h * 100}%" data-tip="${it.id}" data-action="${act}" data-id="${it.id}">${itemArt(it)}${gainTag(it)}${hitDots(it)}</div>`).join('')}
      </div>
      <div class="mats">${mats.length ? mats.map(([k, n]) => `<span title="${MATS[k]}">${matImg(k)}<b>${n}</b></span>`).join('') : '<span class="dim">Keine Materialien. Monster lassen sie fallen.</span>'}</div>
    </section>`;
}

// Was ein Attribut gerade bewirkt (gegen einen Gegner deiner Stufe)
function attrNow(k, st) {
  const L = st.lvl, en = 3 + L * CFG.monGrow, c = CLASSES[S.cls];
  const main = k === c.main ? `Schaden ×${(1 + st[k] / CFG.mainDiv).toFixed(1).replace('.', ',')}` : '';
  const v = { str: `${Math.round(st.str * CFG.strArmor)} Rüstung`, dex: `${Math.round(evadeChance(st, en) * 100)} % Ausweichen`,
    int: `Zauber ×${st.amp.toFixed(2).replace('.', ',')}`, con: `${fmtN(st.hp)} Leben`, lck: `${Math.round(critChance(st, L) * 100)} % Krit` }[k];
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
      ${['phys', 'elem'].map(k => { const v = st.res[k], cap = k === 'phys' ? CFG.resCapPhys : CFG.resCap, on = Math.min(cap, v);   // Resistenzen mit Deckel – was darüber liegt, steht in Klammern
        return `<div class="stat"><span>${RES_NAMES[k]}</span><b>${Math.round(on * 100)} %<small class="dim"> / ${Math.round(cap * 100)}${v > cap ? ` (${Math.round(v * 100)})` : ''}</small></b></div>`; }).join('')}
      <div class="stat"><span>Rüstung</span><b>${st.armor}</b></div><div class="stat"><span>Krit</span><b>${Math.round(critChance(st, S.lvl) * 100)} % · ×${st.critMult.toFixed(2).replace('.', ',').replace(/0$/, '')}</b></div></div>
      <p class="dim small">${effLine(Object.fromEntries(Object.entries(st).filter(([k, v]) => v && EFFECT_NAMES[k] && !['dmgPct', 'hpPct', 'armorPct', 'crit'].includes(k))))}</p>
      ${S.tampered ? '<p class="small down">Spielstand wurde von Hand verändert – für Handel gesperrt.</p>' : ''}</section>
    <section class="panel"><h2>Trophäen <span class="h2r">${S.trophies.length}</span></h2>
      ${S.trophies.map(t => `<div class="stat"><span>${t.name} <i class="dim">${t.diff}</i></span><span class="m small">${effLine(t.eff)}</span></div>`).join('') || '<p class="dim small">Besiege die Herren der Krypten.</p>'}</section></div>
    <div class="btns"><button data-action="go" data-v="hero">Zurück</button><button data-action="respec" ${S.gold < rc ? 'disabled' : ''}>Läutern ${rc ? rc : 'gratis'}</button></div>
  </div>`;
}

// Zauber: wirken im Kampf von selbst
export function viewSpells() {
  const st = stats();
  return `<div class="col"><section class="panel"><h2>Zauber <span class="h2r">Zauberkraft ×${st.amp.toFixed(2).replace('.', ',')}${st.haste ? ` · Tempo +${Math.round(st.haste * 100)} %` : ''}${actionRate(st) > 1 ? ` · ×${actionRate(st).toFixed(2).replace('.', ',')} Aktionen` : ''}</span><button class="tiny" data-action="go" data-v="hero">Zurück</button></h2>
    <p class="small">Wirken von selbst und nutzen <b>alle deine Werte</b> wie ein Hieb. Stärker durch <b>Intelligenz</b>, schneller durch <b>Zaubertempo</b>.</p>${st.offWeapon ? '<p class="small down">Du trägst eine fremde Waffe – Zauber geschwächt.</p>' : ''}</section>
    ${SPELLS[S.cls].map(sp => { const on = S.lvl >= sp.lvl, cur = st.spells.find(x => x.id === sp.id), bo = Math.round(((st.spells.find(x => x.id === sp.id)?.boost || 1) / (1 + (cur?.m?.mult || 0)) - 1) * 100);
      const pend = on && waysPending(sp.id), ev = cur?.every || sp.every;
      return `<section class="panel spell ${on ? '' : 'locked'}" ${on ? `data-action="ways" data-s="${sp.id}"` : ''}><img class="sic" src="assets/spells/${sp.id}.webp" alt="">
        <div><h3>${sp.name} <span class="h2r">${on ? `alle ${(ev / chargeStep(st)).toFixed(1).replace('.0', '').replace('.', ',')} Züge` : `ab Stufe ${sp.lvl}`}</span></h3><p class="small">${sp.el && sp.el !== 'phys' ? `<b>${ELEMENTS[sp.el].name}</b> · ignoriert Rüstung · ` : ''}${sp.text}${bo ? ` · <b class="up">+${bo} % durch Waffe</b>` : ''}</p>
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

// Der alte Baum (Klassen ohne Eintrag in TREE)
function viewTalentsOld() {
  const tp = talentPoints();
  return `<div class="col"><section class="panel"><h2>Talente <span class="h2r">${tp ? `<b class="hot">${tp}</b> Punkte` : 'keine Punkte'}</span><button class="tiny" data-action="go" data-v="hero">Zurück</button></h2></section>
    <div class="tree">${TALENTS[S.cls].map((br, bi) => `<section class="panel branch"><h3>${br.name}</h3>
      ${br.nodes.map((_, ti) => { const t = talentState(S.cls, bi, ti);
        return `<div class="tal ${t.r ? 'has' : ''} ${t.locked ? 'locked' : ''} ${t.can ? 'can' : ''}" data-action="learn" data-b="${bi}" data-t="${ti}">
          <div class="tn">${t.node.name}</div><div class="tr">${t.locked && S.lvl < t.needLvl ? `ab Stufe ${t.needLvl}` : t.keyLock ? 'nur ein Stein' : `${t.r} / ${t.node.max}`}</div>
          <div class="te">${effLine(t.node.eff)}${t.node.max > 1 ? ' je Rang' : ''}</div></div>`; }).join('<div class="link"></div>')}
    </section>`).join('')}</div></div>`;
}

// Das Brett: drei Zweige von unten nach oben, zwei Brücken dazwischen, unten die Beschreibung
// des angetippten Knotens. `sel` ist { c, r } für einen Knoten oder { br } für eine Brücke.
export function viewTalents(sel = null) {
  const T = TREE[S.cls]; if (!T) return viewTalentsOld();
  const tp = talentPoints(), rows = T.cols[0].nodes.length, ranks = treeRanks(), spent = talentPointsSpent();
  const cls = st => `${st.r ? 'has' : ''} ${st.open && !st.keyLock ? 'can' : 'lock'}`;
  const cells = [];
  T.cols.forEach((col, c) => col.nodes.forEach((n, r) => { const st = nodeState(c, r), on = sel?.c === c && sel?.r === r;
    cells.push(`<div class="nd ${n.kind} ${cls(st)} ${on ? 'sel' : ''}" style="grid-area:${rows - r}/${c * 2 + 1}"
      data-action="tnode" data-c="${c}" data-r="${r}"><s>${n.name}</s><em>${st.r}/${n.max}</em></div>`); }));
  (T.bridges || []).forEach((b, i) => { const st = bridgeState(i), on = sel?.br === i;
    cells.push(`<div class="nd br ${cls(st)} ${on ? 'sel' : ''}" style="grid-area:${rows - b.row}/${b.a * 2 + 2}"
      data-action="tbridge" data-i="${i}"><s>&#8286;</s><em>${st.r}/${b.max}</em></div>`); });

  // Beschreibung unten – feste Höhe, damit beim Antippen nichts springt
  let det = `<p class="hint">Tippe einen Knoten an.</p><p class="hint dim2">Gold = gesetzt · hell = erreichbar · rot = Schlüsselstein (nur einer je Brett)</p>`;
  if (sel?.br != null) { const st = bridgeState(sel.br), b = st.b;
    det = `<h4>${b.name} <small>Brücke · ${st.r} / ${b.max}</small></h4><p>${effLine(b.eff)} je Rang.</p>
      <p class="hint">${b.text} Voll ausgebaut öffnet sie beide Seiten.</p>
      <div class="row">${st.can ? '<button data-action="tlearn">Rang setzen</button>' : `<button class="off">${st.open ? (tp ? 'voll' : 'keine Punkte') : 'noch gesperrt'}</button>`}</div>`; }
  else if (sel) { const st = nodeState(sel.c, sel.r), n = st.node, key = n.kind === 'key';
    const good = Object.fromEntries(Object.entries(n.eff).filter(([k, v]) => effVal(k, v) > 0)), bad = Object.fromEntries(Object.entries(n.eff).filter(([k, v]) => effVal(k, v) < 0));
    det = `<h4 class="${key ? 'keyn' : ''}">${n.name} <small>${key ? 'Schlüsselstein' : n.kind === 'nt' ? 'Notable' : `${st.r} / ${n.max}`}</small></h4>
      <p>${n.text}</p><p class="hint">${effLine(good)}${n.max > 1 ? ' je Rang' : ''}</p>
      ${Object.keys(bad).length ? `<p class="cost">${effLine(bad)}</p>` : ''}
      <div class="row">${st.can ? `<button class="${key ? 'red' : ''}" data-action="tlearn">${key ? 'Schwören' : 'Rang setzen'}</button>`
        : `<button class="off">${st.full ? 'gesetzt' : st.keyLock ? 'nur ein Schlüsselstein' : st.open ? 'keine Punkte' : 'noch gesperrt'}</button>`}</div>`; }

  return `<div class="col treev"><section class="panel thead"><b>Talente</b>
      <span>${tp ? `<b class="hot">${tp}</b> frei · ` : ''}${spent} gesetzt · ${ranks} im Baum</span>
      <button class="tiny" data-action="go" data-v="hero">Zurück</button></section>
    <div class="tcols">${T.cols.map(c => `<i>${c.name}</i><i></i>`).join('').slice(0, -7)}</div>
    <section class="panel tree2" style="--rows:${rows}">${cells.join('')}</section>
    <section class="panel tdet">${det}</section></div>`;
}

// --- Streifzüge ---
export function viewTrips(ask = false) {
  if (S.wander) return viewWander();
  if (S.exp?.ret) return viewExpEvent();
  if (S.exp) return `<div class="col">${expAway(ask)}${say('prophet')}</div>`;
  const bl = bounties(), bDone = bl.filter(b => b.claimed).length, bReady = bl.some(b => !b.claimed && b.prog >= b.n);
  const bbar = `<div class="bountybar ${bReady ? 'ready' : ''}" data-action="go" data-v="bounties"><span>Steckbriefe heute</span><b>${bDone}/${bl.length}</b>${bReady ? '<i>Lohn abholen</i>' : ''}</div>`;
  const tired = S.glut < 5, xbar = `<div class="bountybar expbar ${tired ? 'ready' : ''}" data-action="go" data-v="exped"><span>Expedition</span><b>ohne Glut · 1–8 Std.</b>${tired ? '<i>Glut leer – schick ihn los</i>' : ''}</div>`
    + (wanderAct() ? `<div class="bountybar expbar" data-action="go" data-v="wplan"><span>Umherziehen</span><b>App offen · kleine Beute · 2 Std.</b></div>` : '');
  const cur = curAct(), o = omen();
  return `<div class="col acts">${say('prophet', omenLine())}${bbar}${xbar}${ACTS.map((a, i) => { const p = actProg(a), done = actDone(a), open = actOpen(a), l = LOCATIONS.find(x => x.id === a.loc);
    const isOmen = open && S.lvl >= 3 && o.loc === a.loc && !o.done;
    const wanted = open && Object.keys(TRADERS).filter(available).some(t => current(t).obj.some(ob => ob.at === a.loc || l.mobs.includes(ob.kill)));
    if (!open && i > ACTS.indexOf(cur) + 1) return '';
    return `<section class="panel act ${done ? 'done' : ''} ${a === cur && !done ? 'cur' : ''} ${open ? '' : 'locked'}" ${open ? `data-action="act" data-id="${a.id}"` : ''}>
      ${monsterArt(a.boss.glyph)}<h3>Akt ${a.n} · ${l.name}${wanted ? '<span class="qmark">!</span>' : ''}</h3><span class="an">${isOmen ? '<b class="hot">Omen</b>' : done ? 'geschafft' : open ? `${Math.min(p, ACT.zones + 1)} / ${ACT.zones + 1}` : 'gesperrt'}</span>
      ${open ? `<div class="pr">${Array.from({ length: ACT.zones + 1 }, (_, z) => `<i class="${z < p ? 'on' : ''} ${z === ACT.zones ? 'boss' : ''}"></i>`).join('')}</div>` : ''}
      <small>${done ? `${a.boss.name} ist gefallen · Gebiete wiederholbar` : open ? (p >= ACT.zones ? `Boss: ${a.boss.name}` : `Weiter: ${a.zones[p]} · Stufe ${actZoneLvl(a, p)}`) : `${ACTS[i - 1].boss.name} muss fallen`}</small></section>`; }).join('')}</div>`;

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
const expInfo = (t, loc) => { const d = EXP_NODES[t], l = LOCATIONS.find(x => x.id === loc), extra = t === 'herb' ? HERBS[HERB_LOC[loc]]?.name : t === 'mats' ? [...new Set(l.mobs.map(nm => MATS[MONSTERS.find(m => m.name === nm)?.mat]).filter(Boolean))].join(', ') : '';
  return `<p class="small ninfo"><b class="tc-${t}">${t === 'goal' ? 'Ziel' : d.name}</b> · ${t === 'goal' ? 'Am Ende: Chance auf ein Fundstück (8 Std.: sicher magisch)' : d.text}${extra ? ` <span class="dim">(${extra})</span>` : ''}</p>`; };
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
    return `<button class="node c-${n.t} ${on ? 'on' : ''} ${nx ? 'next' : ''} ${!on && !nx ? 'off' : ''} ${n.t === 'danger' ? 'danger' : ''} ${sel.info === n.t ? 'seen' : ''}" style="left:${n.x * 100}%;top:${Y(r + 1)}%" data-action="${tap ? 'exppath' : 'expinfo'}" data-l="${loc}" data-r="${r}" data-j="${j}" data-t="${n.t}" title="${d.text}">${nodeArt(n.t, loc)}<label>${d.name}</label></button>`; };
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
             : sel.info ? expInfo(sel.info, loc) : `<p class="small dim">${hint} Tippe ein Feld an: Hier steht, was es bringt.</p>`}${full && sel.info ? expInfo(sel.info, loc) : ''}</section>
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

// --- Figuren mit Questketten (Vargo, Ilse, Prophet) ---
export function viewNpc(id) {
  const n = NPCS[id];
  let extra = '';
  if (id === 'prophet') { const o = omen();
    extra = `<section class="panel"><h2>Omen des Tages <span class="h2r">${o.done ? 'erfüllt' : 'offen'} · ${S.omens} erfüllt</span></h2>
      <p class="lore">„${o.def.text}“</p><p class="small">Ort: <b>${o.place.name}</b> · ${o.def.short}</p>
      <div class="shards">${SHARD_CRYPTS.map(c => `<i class="${S.shards.includes(c) ? 'on' : ''}"></i>`).join('')}<span class="small dim">Glockensplitter ${S.shards.length}/4</span></div></section>`; }
  // Schwester Ilse hütet die Krypten – bei ihr führt ein Knopf zur Set-Übersicht (eigene Ansicht, sonst passt es nicht aufs Handy)
  if (id === 'ilse') extra = `<button data-action="go" data-v="sets">Grab-Sets · ${SETS.reduce((n, x) => n + setOwned(x.id).size, 0)}/${SETS.length * SET.parts} Teile</button>`;
  if (id === 'vargo') extra = `<section class="panel"><p class="small">Deine Ehre: <b>${S.honor}</b> · Siege: <b>${S.wins}</b></p></section>`;
  return `<div class="col trader"><section class="panel npcrow">${npcArt(id)}
      <div><h2>${n.name} <span class="h2r">${n.role}</span></h2><p class="lore">„${n.lines[Math.floor(Date.now() / 60000) % n.lines.length]}“</p></div></section>
    ${questNote(id)}${extra}<button data-action="go" data-v="${id === 'vargo' ? 'arena' : id === 'ilse' ? 'crypt' : 'trips'}">Zurück</button></div>`;
}

// --- Händler ---
// Vier Reiter brauchen Kurznamen: „Mutter Ysolde“ und „Bruder Kaspar“ sprengen die Leiste auf dem SE.
// Der volle Name steht ohnehin eine Zeile darunter im Panel.
const SHOPKEEPERS = { ...TRADERS, vargo: NPCS.vargo };
const shortName = n => n.split(' ').pop();
const traderTabs = tid => `<nav class="subtabs">${Object.entries(SHOPKEEPERS).map(([k, x]) =>
  `<a class="${k === tid ? 'on' : ''} ${canComplete(k) ? 'badge' : ''}" data-action="trader" data-t="${k}">${shortName(x.name)}</a>`).join('')}</nav>`;

// Vargo steht bei den Händlern wie die anderen – nur zählt bei ihm Ehre statt Treue, und sein Laden
// liegt hinter einem Knopf, genau wie Halvars Schmiede und Ysoldes Alchemie.
function viewVargo() {
  const t = NPCS.vargo, rk = pitRank(), place = pitPlace();
  return `<div class="col trader">
    ${traderTabs('vargo')}
    <section class="panel npcrow">${npcArt(t.glyph)}
      <div><h2>${t.name} <span class="h2r">${t.role}</span></h2><p class="lore">„${t.lines[Math.floor(Date.now() / 60000) % t.lines.length]}“</p>
        <div class="loyal"><span>Ehre <b>${S.honor}</b></span><div class="bar rep"><i style="width:${pct(Math.min(S.honor, 500), 500)}%"></i></div>
          <small>Platz ${place} · ${rk.name} · ${S.wins} Siege</small></div></div>
    </section>
    ${questNote('vargo')}
    <section class="panel services"><button class="svc red" data-action="pitshop" data-b="traders"><b>Vargos Laden</b><small>Ehre ausgeben</small></button>
      <button class="svc" data-action="titles" data-b="vargo"><b>Titel</b><small>${S.pit.titles.length} verdient</small></button>
      <button class="svc" data-action="go" data-v="arena"><b>Zur Grube</b><small>Ehre verdienen</small></button></section>
    ${(() => { const Pw = pitWeek(), rule = PIT_RULES.find(r => r.id === Pw.ch?.rule), nx = PIT_RANKS[PIT_RANKS.indexOf(rk) + 1];
      return `<section class="panel grow pitstand"><div class="invhead"><span>Die Grube</span><small class="dim">noch ${PIT.weekBuys - Pw.buys} Käufe diese Woche</small></div>
        <p class="small">${nx ? `Nächster Rang <b>${nx.name}</b> ab Platz ${nx.max}.` : 'Höchster Rang erreicht.'}</p>
        ${rule ? `<p class="small">Herausforderung der Woche: <b>${rule.name}</b>${Pw.ch.won ? ' <i class="up">geschafft</i>' : ` · noch ${Pw.ch.tries} Versuche`}</p>
          <p class="small dim lore">${rule.text}</p>` : ''}</section>`; })()}
  </div>`;
}
export function viewTrader(tid) {
  if (tid === 'vargo') return viewVargo();
  const t = TRADERS[tid], st = S.traders[tid], L = loyalty(tid), q = current(tid);
  const next = L + 1 < t.need.length ? `${st.rep}/${t.need[L + 1]} Ruf${S.lvl < t.lvl[L + 1] ? ` · Stufe ${t.lvl[L + 1]}` : ''}` : 'Höchste Treue';
  const note = questNote(tid);
  const shop = shopFor(tid);
  return `<div class="col trader">
    ${traderTabs(tid)}
    <section class="panel npcrow">${npcArt(t.glyph)}
      <div><h2>${t.name} <span class="h2r">${t.role}</span></h2><p class="lore">„${(t.lines || [t.quote])[Math.floor(Date.now() / 60000) % (t.lines?.length || 1)]}“</p>
        <div class="loyal"><span>Treue <b>${LOYALTY[L]}</b></span><div class="bar rep"><i style="width:${L + 1 < t.need.length ? pct(st.rep - t.need[L], t.need[L + 1] - t.need[L]) : 100}%"></i></div><small>${next}</small></div></div>
    </section>
    ${note}
    <section class="panel services">${tid === 'halvar' ? `<button class="svc red" data-action="go" data-v="forge"><b>Schmiede</b></button>` : tid === 'ysolde' ? `<button class="svc red" data-action="alch" data-b="traders"><b>Alchemie</b></button>` : ''}${(SERVICES[tid] || []).map(sv => { const st = serviceState(sv);
      return `<button class="svc" data-action="service" data-t="${tid}" data-s="${sv.id}" ${st.can ? '' : 'disabled'}>
        <b>${sv.name}${sv.max && st.step ? ` +${st.step}` : ''}</b><small>${st.reason || st.costText}${st.questMat && !st.reason ? ` <i class="hot">– ${MATS[st.questMat]} für Auftrag!</i>` : ''}</small></button>`; }).join('')}</section>
    <section class="panel shop"><div class="invhead"><span>Ware</span><small class="dim">bessere Ware mit höherer Treue</small></div>
      <div class="shoprow">${shop.map(it => `<div class="sitem ${rarCls(it)}${it.lock ? ' lock' : ''}" data-tip="${it.id}" data-action="buy" data-t="${tid}" data-id="${it.id}">${itemArt(it)}${gainTag(it)}${hitDots(it)}<span class="price ${S.gold < it.price ? 'no' : ''}">${it.price}</span></div>`).join('') || '<span class="dim">Ausverkauft.</span>'}</div></section>
  </div>`;
}

// --- Krypten ---
export function viewCrypts() {
  const cd = Math.max(0, Math.ceil((S.crypt.cd - Date.now()) / 1000));
  return `<div class="col crypts">${cryptTabs('crypt')}${say('ilse')}<div class="crypthead"><span>Die Krypten · nur der Boss, Stufe um Stufe</span><span>${cd ? `Erholung <span data-until="${S.crypt.cd}">${fmtT(cd)}</span>` : 'bereit'}</span></div>
    ${CRYPTS.map(c => { const open = cryptOpen(c), t = cryptTier(c), a = cryptAct(c), troph = S.trophies.some(x => x.key === c.id + ':0');
      return `<section class="panel crypt ${!open ? 'locked' : ''}" ${open && !cd ? `data-action="crypt" data-id="${c.id}"` : ''}>
        ${monsterArt(c.boss.glyph)}
        <div><h3>${c.name}${open ? ` <span class="h2r">Stufe ${t + 1}</span>` : ''}</h3>
          <p class="small">${!open ? (!actDone(a) ? `Erst nach Akt ${a.n}: ${a.boss.name}` : `Versiegelt · Glockensplitter ${S.shards.length}/${c.shards}`) : `<span class="hot">${c.boss.name.split(',')[0]}</span> · Stufe ${cryptLvl(c)} · <i>${c.boss.mechText}</i> · ${threat(cryptChance(c))}`}</p>
          <div class="dim small">Trophäe: ${effLine(c.trophy)}${troph ? ' · errungen' : ''}${(() => { const set = SETS.find(x => x.crypt === c.id); const o = set ? setOwned(set.id).size : 0;
            return open && set ? ` · <span class="r-set">Set ${o}/${SET.parts}</span>` : ''; })()}${open && t ? ` · ${t}× besiegt` : ''}</div></div></section>`; }).join('')}</div>`;
}

// Beute-Moment: jedes Fundstück als Kärtchen (Bild, Name in Seltenheitsfarbe); Seltenes und besser bekommt eine Lichtsäule
const dropTier = it => it.unique ? 'unique' : it.rarity;
export function lootCards(items = []) {
  if (!items.length) return '';
  return `<div class="drops${items.length > 3 ? ' many' : ''}">${items.map((it, i) => { const g = it.soldFull ? 0 : itemGain(it), beam = it.unique || ['rare', 'legendary', 'set'].includes(it.rarity);
    return `<div class="drop d-${dropTier(it)} ${beam ? 'beam' : ''}" style="--i:${i}" ${it.soldFull ? '' : `data-tip="${it.id}" data-action="equip" data-id="${it.id}"`}>
      <span class="dimg">${itemArt(it)}${hitDots(it)}</span><span class="dtxt"><b class="r-${it.rarity} ${it.unique ? 'uniq-txt' : ''}">${it.name}</b>
      <small>${it.set ? `${SETS.find(x => x.id === it.set)?.name} ${setCount(it.set) + (Object.values(S.equip).includes(it) ? 0 : 1)}/${SET.parts}` : rarName(it.rarity, it)}${it.special ? ' · Sonderbonus' : ''}${it.soldFull ? ' · Beutel voll, verkauft' : g > 0.01 ? ` · <i class="better-txt">▲ +${Math.round(g * 100)} %</i>` : ''}</small></span></div>`; }).join('')}</div>`;
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

  return `<div class="panel fightwrap${done ? ' done' : ''}"><div class="fight">
    ${side(F.A, hpA, F.hpA, last.who === 'b', 'fA', last.cA)}
    <div><div class="log" id="log">${shown.map(l => `<div class="${l.who} ${l.crit ? 'crit' : ''} ${l.spell ? 'spell' : ''}">${l.dbl ? `<b class="dbl">Zug ×${l.dbl}</b> ` : ''}${l.t}</div>`).join('')}</div>
      ${done ? `<div class="result ${F.winner === 'a' ? 'win' : 'lose'}">${F.winner === 'a' ? 'Sieg' : 'Gefallen'}</div>${fightSummary(F)}
        ${lootCards(F.loot)}<div class="loot-drop">${F.reward || ''}</div><button class="red" data-action="go" data-v="${F.back}">Weiter</button>`
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
// Enge Kacheln (8 nebeneinander): lange Wörter kürzen statt abschneiden – „Konstitution“ → „Kons.“
const short5 = n => n.length > 5 ? n.slice(0, 4) + '.' : n;
const matImg = k => `<img class="matimg" src="assets/forge/${MAT_ART[k] || k}.webp" alt="">`;
export function viewForge(sel, res) {
  const tg = forgeTargets(), err = canForge(sel.slot, sel.mat), r = RUNES[sel.mat];
  const range = r ? [0.5, 2.2].map(q => Math.max(1, Math.round(r.per * (CFG.affixBase + S.lvl * CFG.affixPerLvl) * q))) : null;
  if (res) return `<div class="col forge">${npcSay('halvar', res.grade.q >= 1.6 ? 'Hörst du das? So klingt guter Stahl.' : res.grade.q >= 1 ? 'Brauchbar. Das hält.' : 'Grob. Aber besser als nichts.')}
    <section class="panel grow forgeres"><h2>${res.grade.name}</h2><img class="runeimg g${Math.round(res.grade.q * 10)}" src="assets/forge/r_${res.mat}.webp" alt="">
      <p class="big">${res.rune.name}: <b class="up">+${res.v} ${STAT_NAME(res.rune.stat)}</b></p><p>in <span class="r-${res.it.rarity}">${res.it.name}</span> · ${res.score}/${FORGE.hits * 3} Punkte</p>
      <p class="dim small">Runenplätze: ${res.it.runes.length}/${FORGE.maxRunes}</p></section>
    <div class="btns"><button data-action="forgeagain">Noch einmal</button><button class="red" data-action="trader" data-t="halvar">Zurück</button></div></div>`;
  if (sel.mode === 'craft') return viewCraft(sel);
  if (sel.mode === 'fuse') return viewFuse(sel);
  if (sel.mode === 'core') return viewCore(sel);
  return `<div class="col forge">${forgeTabs(sel)}
    <section class="panel smithy" id="forgeplay"><div class="scene"><img src="assets/forge/scene.jpg" alt="">
      <div class="iron"><div class="fz z1"></div><div class="fz z2"></div><div class="fz z3"></div><div class="fmark"></div></div><div class="sparks"></div>
      <div class="fcall"></div><div class="pips">${Array.from({ length: FORGE.hits }, (_, i) => `<i data-i="${i}"></i>`).join('')}</div></div>
      <p class="small fhint">${r && sel.slot ? `${r.name} auf <b>${S.equip[sel.slot]?.name || ''}</b>: <span class="up">+${range[0]} bis +${range[1]} ${STAT_NAME(r.stat)}</span>` : '„Zwei Brocken Material, fünf Schläge. Triff die weiße Glut – dann hält die Rune.“ – Halvar'}</p>
      ${err ? `<button disabled>${sel.mat && sel.slot ? err : 'Material und Gegenstand wählen'}</button>` : `<button class="red big-btn" id="forgebtn" data-action="forgestart">Ans Feuer</button>`}</section>
    <section class="panel"><h2>Material <span class="h2r">je ${FORGE.cost}</span></h2><div class="mtiles">${Object.entries(RUNES).map(([k, x]) => { const n = S.mats[k] || 0;
      return `<button class="mtile ${sel.mat === k ? 'on' : ''}" data-action="forgemat" data-m="${k}" ${n < FORGE.cost ? 'disabled' : ''} title="${MATS[k]}">${matImg(k)}<b>${n}</b><small>${short5(STAT_NAME(x.stat).replace('% ', ''))}</small>${forgeQuestMat(k) ? '<i class="qm">!</i>' : ''}</button>`; }).join('')}</div>
      ${sel.mat ? `<p class="small dim msel">${MATS[sel.mat]}${forgeQuestMat(sel.mat) ? ' · <span class="hot">wird für einen Auftrag gebraucht</span>' : ''}</p>` : ''}</section>
    <section class="panel"><h2>Gegenstand <span class="h2r">${FORGE.maxRunes} Runen je Teil</span></h2><div class="fslots">${tg.map(t => `<div class="fslot r-${t.it.rarity} ${sel.slot === t.slot ? 'on' : ''} ${t.free ? '' : 'full'}" data-action="forgeslot" data-s="${t.slot}">${itemArt(t.it)}<i>${FORGE.maxRunes - t.free}/${FORGE.maxRunes}</i></div>`).join('')}</div></section></div>`;
}
const npcSay = (id, line) => `<section class="panel speaker">${npcArt(TRADERS[id].glyph)}<div><b>${TRADERS[id].name}</b> <span class="h2r">Schmiede</span><p class="lore">„${line}“</p></div></section>`;

const forgeTabs = sel => `<nav class="subtabs"><a class="${!sel.mode || sel.mode === 'rune' ? 'on' : ''}" data-action="forgemode" data-m="rune">Runen</a><a class="${sel.mode === 'craft' ? 'on' : ''}" data-action="forgemode" data-m="craft">Umschmieden</a><a class="${sel.mode === 'fuse' ? 'on' : ''}" data-action="forgemode" data-m="fuse">Fusionieren</a>${coreTab() ? `<a class="${sel.mode === 'core' ? 'on' : ''}" data-action="forgemode" data-m="core">Kern</a>` : ''}</nav>`;
// --- Umschmieden (Crafting) ---
function viewCraft(sel) {
  const list = craftItems(), it = list.find(x => x.id === sel.item) || null;
  const card = !it ? '<p class="dim small">Wähle ein magisches, seltenes oder legendäres Item. Einzigartiges lässt sich nicht umschmieden.</p>' : (() => {
    const base = baseMods(it), rows = Object.entries(base).map(([k, v]) => { const t = tierOf(k, v) ?? 5, sealed = it.sealed === k, picked = sel.stat === k;
      const fu = !sealed && fusedMods(it).includes(k);
      return `<div class="caff ${sealed ? 'sealed' : ''} ${fu ? 'fus' : ''} ${picked ? 'on' : ''} ${sel.changed?.includes(k) ? 'new' : ''}" data-action="craftstat" data-k="${k}"><span>+${v} ${STAT_NAME(k)}</span>${tierTag(t)}${sealed ? '<b class="seal">versiegelt</b>' : fu ? '<b class="fus">fusioniert</b>' : ''}</div>`; }).join('');
    return `<div class="ccard"><div class="cname r-${it.rarity}">${it.name}</div>
      <div class="caffs">${rows || '<span class="dim small">Keine eigenen Boni.</span>'}</div>
      ${it.fx ? `<div class="small special-l">✦ ${effLine(it.fx)} <i class="dim">(bleibt)</i></div>` : ''}${it.core ? `<div class="small core-l">Aschenkern: ${effLine(it.core.eff)} <i class="dim">(bleibt)</i></div>` : ''}${it.runes?.length ? `<div class="small rune">${it.runes.map(r => r.name + ' +' + r.v).join(', ')} <i class="dim">(bleibt)</i></div>` : ''}
      ${it.crafted ? `<div class="small gold">Vollendet von ${it.crafted}</div>` : ''}</div>`; })();
  // Ist das Teil voll, kostet „Hinzufügen" einen Kronsplitter und hebt die Seltenheit – der Knopf
  // heißt dann anders und zeigt das andere Material, sonst verspricht er etwas, das er nicht tut.
  const ops = CRAFT.ops.map(op => { const err = it ? craftCheck(it, op.id, sel.stat) : 'Kein Item';
    const rise = it ? craftRaises(it, op.id) : null, need = it ? craftMat(it, op.id) : op;
    const nm = rise ? 'Erheben' : op.name, tip = rise ? `Ein gewürfelter Bonus – und das Teil steigt zu ${RARITIES.find(r => r.id === rise).name.toLowerCase()} auf.` : op.text;
    return `<button class="cop ${rise ? 'rise' : ''}" data-action="craftop" data-o="${op.id}" ${err ? 'disabled' : ''} title="${tip} (${MATS[need.mat]})">${matImg(need.mat)}<b>${nm}</b><small><i class="${(S.mats[need.mat] || 0) < need.n ? 'down' : ''}">${S.mats[need.mat] || 0}/${need.n}</i></small></button>`; }).join('');
  const why = it && CRAFT.ops.map(op => craftCheck(it, op.id, sel.stat)).find(e => e && !/Material|Bonus antippen/.test(e));
  return `<div class="col forge craft">${forgeTabs(sel)}
    <section class="panel"><div class="cpick">${list.map(x => `<div class="fslot ${rarCls(x)} ${x.id === sel.item ? 'on' : ''} ${x.crafted ? 'full' : ''} ${Object.values(S.equip).includes(x) ? 'eq' : ''}" data-action="craftpick" data-id="${x.id}">${itemArt(x)}${hitDots(x)}${Object.values(S.equip).includes(x) ? '<i>an</i>' : ''}</div>`).join('') || '<span class="dim small">Nichts zum Umschmieden. Magische Items fallen bei Monstern und Händlern.</span>'}</div></section>
    <section class="panel grow">${card}</section>
    <section class="panel"><div class="cops">${ops}</div>
      <p class="small cmsg">${sel.msg || (it ? `Je Eingriff ${craftGold(it)} Gold · ${sel.stat ? `<b>${STAT_NAME(sel.stat)}</b> gewählt` : 'zum Versiegeln einen Bonus antippen'}${why ? ` · <span class="down">${why}</span>` : ''}${craftHint(it)}` : 'Material bestimmt den Eingriff, Schmiedeglut wie oft.')}</p></section></div>`;
}

// --- Fusionieren: zwei gleichartige Teile, ein Bonus wandert, das Futter zerfällt ---
// Links bleibt, rechts zerfällt – die Richtung steht in der Überschrift, im Rahmen und am Pfeil,
// damit niemand aus Versehen das falsche Teil opfert.
// Ein volles Teil ist in der Umschmiede zu Ende – aber nicht im Spiel. Hier steht, wie es weitergeht,
// denn sonst liest man nur „Kein Platz für weitere Boni" und hält das für das Ende.
function craftHint(it) {
  if (!it || it.risen) return '';
  const full = Object.keys(baseMods(it)).length >= CRAFT.maxAff[it.rarity], up = CRAFT.raise.from[it.rarity];
  if (!full || !up) return '';
  const nm = RARITIES.find(r => r.id === up).name.toLowerCase();
  return (S.mats[CRAFT.raise.mat] || 0) >= CRAFT.raise.n
    ? `<br><span class="gold">Erheben macht es ${nm}: ein gewürfelter Bonus für einen ${MATS[CRAFT.raise.mat]}.</span>`
    // Die rote Zeile darüber nennt den Splitter schon – hier steht nur noch der andere Weg.
    : `<br>Sonst führt nur das <b>Fusionieren</b> darüber: ein zweites Teil gleicher Form und Seltenheit.`;
}
function fuseRows(it, picked, side, dropped, blocked) {
  const base = baseMods(it);
  return Object.entries(base).map(([k, v]) => { const t = tierOf(k, v) ?? 5, sealed = it.sealed === k;
    // Gesperrt: versiegelt (im Hauptteil) oder nicht übertragbar (im Futter) – gar nicht erst antippbar,
    // sonst tippt man drei Mal, bevor unten steht, warum es nicht geht.
    const no = side === 'main' ? sealed : blocked?.has(k);
    const fu = !sealed && fusedMods(it).includes(k);
    return `<div class="caff ${sealed ? 'sealed' : ''} ${fu ? 'fus' : ''} ${no ? 'no' : ''} ${picked === k ? (side === 'food' ? 'onf' : 'on') : ''} ${dropped === k ? 'gone' : ''}"
      ${no ? '' : `data-action="fuse${side}" data-k="${k}"`}><span>+${v} ${STAT_NAME(k)}</span>${tierTag(t)}${sealed ? '<b class="seal">versiegelt</b>' : fu ? '<b class="fus">fusioniert</b>' : ''}</div>`;
  }).join('') || '<span class="dim small">Keine eigenen Boni.</span>';
}
function viewFuse(sel) {
  const mains = fuseMains(), main = mains.find(x => x.id === sel.item) || null;
  const foods = main ? fuseFoods(main) : [], food = foods.find(x => x.id === sel.food) || null;
  const err = main && food ? fuseCheck(main, food, sel.stat, sel.mstat) : null;
  const drop = main && food && !err ? fuseReplaces(main, sel.stat, sel.mstat) : null;
  const promote = main && food && !err ? fusePromote(main, drop) : null;
  // Welche Futter-Boni können überhaupt herüber? Nicht die, die auf diesem Platz nichts zu suchen
  // haben (Blocken gehört nicht auf einen Dolch). Einen Bonus, den das Hauptteil schon hat, ersetzt er.
  const blocked = main && food ? new Set(Object.keys(baseMods(food)).filter(k =>
    k === main.sealed && k in baseMods(main) || !affixPool(main).some(a => a.stat === k))) : null;
  const cell = (x, on, cls) => `<div class="fslot ${rarCls(x)} ${on ? 'on' : ''} ${cls || ''}" data-action="fuse${cls === 'f' ? 'food' : 'pick'}" data-id="${x.id}">${itemArt(x)}${hitDots(x)}${Object.values(S.equip).includes(x) ? '<i>an</i>' : ''}</div>`;
  const board = !main ? '<p class="dim small">Wähle oben das Hauptteil – das Teil, das bleibt und den neuen Bonus bekommt.</p>'
    : `<div class="fuse2">
      <div class="fside main"><h5>Hauptteil – bleibt</h5><div class="fname r-${main.rarity}">${main.name}</div>
        <div class="caffs">${fuseRows(main, sel.mstat, 'main', drop)}</div></div>
      <div class="fgut">${food ? '<span class="far">&larr;</span>' : ''}</div>
      <div class="fside food"><h5>Futter – zerfällt</h5>${food
        ? `<div class="fname r-${food.rarity}">${food.name}</div><div class="caffs">${fuseRows(food, sel.stat, 'food', null, blocked)}</div>
           <p class="small dim fwarn">Der andere Bonus geht mit verloren.</p>`
        : `<p class="dim small">Kein Futter gewählt.${foods.length ? '' : ' Es braucht ein zweites Teil gleicher Grundform und gleicher Seltenheit im Beutel.'}</p>`}</div>
    </div>`;
  // Ohne diese zwei Sätze sieht beides wie „geht nicht" aus: dass heute überhaupt ein Paar da ist,
  // und dass ein halbvolles Teil den Bonus zwar nimmt, aber die Farbe behält.
  const pairs = !main && mains.some(m => fuseFoods(m).length);
  const room = main && !fuseFull(main) && CRAFT.maxAff[main.rarity] - Object.keys(baseMods(main)).length;
  const msg = sel.msg ? sel.msg
    : !main ? (pairs ? '<span class="gold">Zwei Teile im Beutel passen zusammen.</span> Hauptteil oben wählen.'
      : `Je Teil nur ${CRAFT.fuse.max === 1 ? 'eine Fusion' : CRAFT.fuse.max + ' Fusionen'} – danach nie wieder.`)
    : room ? `Hier ist noch Platz für ${room === 1 ? 'einen Bonus' : room + ' Boni'} – der neue kommt dazu, die Farbe bleibt. Aufsteigen kann nur ein <b>volles</b> Teil.`
    : !food ? 'Futter unten antippen. Nur gleiche Grundform, gleiche Seltenheit, nur aus dem Beutel.'
    : blocked && blocked.size >= Object.keys(baseMods(food)).length ? '<span class="down">Von diesem Futter kann nichts herüber</span> – die Boni gehören nicht auf diesen Platz oder sind im Hauptteil versiegelt.'
    : err ? `<span class="down">${err}</span>`
    : `${drop && drop === sel.stat ? `<b>${STAT_NAME(sel.stat)}</b> wird ersetzt: <span class="down">+${baseMods(main)[drop]}</span> &rarr; <b>+${baseMods(food)[drop]}</b>` : `Es wandert <b>${STAT_NAME(sel.stat)}</b>`}${drop && drop !== sel.stat ? `, dafür weicht <span class="down">${STAT_NAME(drop)}</span>` : promote ? ` – das Teil steigt zu <b class="r-${promote}">${RARITIES.find(r => r.id === promote).name.toLowerCase()}</b> auf` : ''} · ${craftGold(main)} Gold`;
  return `<div class="col forge craft fusev">${forgeTabs(sel)}
    <section class="panel"><div class="cpick">${mains.map(x => cell(x, x.id === sel.item)).join('')
      || '<span class="dim small">Nichts zum Fusionieren. Es braucht magische, seltene oder legendäre Teile.</span>'}</div></section>
    <section class="panel grow">${board}</section>
    ${main ? `<section class="panel"><div class="cpick">${foods.map(x => cell(x, x.id === sel.food, 'f')).join('')
      || '<span class="dim small">Kein passendes Futter im Beutel.</span>'}</div></section>` : ''}
    <section class="panel"><p class="small cmsg">${msg}</p>
      ${main && food && !err ? '<button class="red big-btn" data-action="fusego">Fusionieren</button>' : `<button disabled>Fusionieren</button>`}</section></div>`;
}

// --- Aschenkern (ASHCORE): eine Wirkung eines Einzigartigen wandert in ein anderes Teil, das Einzigartige zerfällt ---
// Reiter erst, wenn man einen Kern hat oder schon ein Teil einen trägt (Gesperrtes klein halten).
const coreTab = () => (S.mats.aschenkern || 0) > 0 || craftItems().some(it => it.core);
function viewCore(sel) {
  const us = coreUniques(), u = us.find(x => x.id === sel.cu) || null, keys = u ? coreKeys(u) : [], key = keys.includes(sel.ck) ? sel.ck : keys.length === 1 ? keys[0] : null;
  const tg = coreTargets(u), it = tg.find(x => x.id === sel.ct) || null, eff = u && key ? coreEff(u, key) : null, err = coreCheck(u, key, it), have = S.mats.aschenkern || 0;
  const cell = (x, on, act) => `<div class="fslot ${rarCls(x)} ${on ? 'on' : ''}" data-action="${act}" data-id="${x.id}">${itemArt(x)}${hitDots(x)}${Object.values(S.equip).includes(x) ? '<i>an</i>' : ''}</div>`;
  const keyRow = k => `<div class="caff ${key === k ? 'onf' : ''}" data-action="corekey" data-k="${k}"><span>${effLine({ [k]: u.fx[k] })}</span></div>`;
  const board = !u ? '<p class="dim small">Wähle oben ein Einzigartiges aus dem Beutel – es zerfällt, eine seiner Wirkungen bleibt als Kern.</p>'
    : `<div class="fuse2">
      <div class="fside main"><h5>Ziel – bleibt</h5>${it ? `<div class="fname r-${it.rarity}">${it.name}</div>
        <div class="caffs">${Object.entries(baseMods(it)).map(([k, v]) => `<div class="caff"><span>+${v} ${STAT_NAME(k)}</span></div>`).join('') || '<span class="dim small">Keine eigenen Boni.</span>'}</div>
        ${eff ? `<p class="small core-l">+ Aschenkern: ${effLine(eff)}</p>` : ''}` : `<p class="dim small">Ziel unten wählen: magisch, selten oder legendär, gleicher Platz, noch ohne Kern.</p>`}</div>
      <div class="fgut">${it ? '<span class="far">&larr;</span>' : ''}</div>
      <div class="fside food"><h5>Einzigartig – zerfällt</h5><div class="fname uniq-txt">${u.name}</div><div class="caffs">${keys.map(keyRow).join('')}</div>
        ${eff && Object.keys(eff).length > 1 ? `<p class="small dim fwarn">Wandert mit: ${effLine(Object.fromEntries(Object.entries(eff).filter(([k]) => k !== key)))}</p>` : ''}</div></div>`;
  const msg = sel.msg || (!us.length ? 'Kein Einzigartiges im Beutel. Nur was im Beutel liegt, kann zerfallen – nie, was du trägst.'
    : err ? `<span class="${/Gold|Kein Asch/.test(err) ? 'down' : ''}">${err}</span>`
    : `${key && ASHCORE.multOf?.[key] ? `Diese Wirkung wandert zu ${Math.round(ASHCORE.multOf[key] * 100)} %` : `Positive Werte wandern zu ${Math.round(ASHCORE.mult * 100)} %`}, Nachteile ganz. <b>${u.name}</b> zerfällt · ${craftGold(it)} Gold`);
  return `<div class="col forge craft fusev corev">${forgeTabs(sel)}
    <section class="panel"><h2>Aschenkern <span class="h2r"><img class="matimg" src="assets/forge/${MAT_ART.aschenkern}.webp" alt="">${have} · einer je Teil</span></h2>
      <div class="cpick">${us.map(x => cell(x, x.id === sel.cu, 'corepick')).join('') || '<span class="dim small">Kein Einzigartiges im Beutel.</span>'}</div></section>
    <section class="panel grow">${board}</section>
    ${u ? `<section class="panel"><div class="cpick">${tg.map(x => cell(x, x.id === sel.ct, 'coretarget')).join('') || '<span class="dim small">Kein passendes Ziel (gleicher Platz, magisch bis legendär, ohne Kern).</span>'}</div></section>` : ''}
    <section class="panel"><p class="small cmsg">${msg}</p>
      ${err ? '<button disabled>Einbrennen</button>' : '<button class="red big-btn" data-action="corego">Einbrennen</button>'}</section></div>`;
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
    <section class="panel"><h2>Alchemie <span class="h2r">Tränke wirken nur in der Krypta</span>${back ? `<button class="tiny" data-action="${back === 'traders' ? 'trader" data-t="ysolde' : `go" data-v="${back}`}">Zurück</button>` : ''}</h2>
      <div class="belt">${[0, 1, 2].map(i => beltRow(i, true)).join('')}</div></section>
    <section class="panel herbs">${Object.entries(HERBS).map(([k, h]) => `<span class="herb ${k === 'herz' ? 'nobuy' : canBuyHerb(k) ? 'can' : 'poor'}" title="${h.name} – ${herbSource(k)}${k === 'herz' ? '' : `, oder kaufen für ${herbPrice()} Gold`}" ${k === 'herz' ? '' : `data-action="buyherb" data-id="${k}"`}>${potImg(h.img)}<i>${S.herbs[k] || 0}</i></span>`).join('')}
      <p class="small dim hbuy">Antippen kauft · ${herbPrice()} Gold · heute noch ${herbLeft()}</p></section>
    <section class="panel potgrid">${POTIONS.map(x => `<span class="ptile ${x.rare ? 'rare' : ''} ${x.id === p.id ? 'on' : ''} ${canBrew(x.id).ok ? 'can' : ''}" data-action="potsel" data-id="${x.id}">${potImg(x.id)}${S.pots[x.id] ? `<i>${S.pots[x.id]}</i>` : ''}</span>`).join('')}</section>
    <section class="panel potdet"><h3 class="${p.rare ? 'r-rare' : ''}">${p.name} <span class="h2r">${p.rare ? 'selten · 1 Ladung' : `gewöhnlich · ${ALCH.charges} Ladungen`}</span></h3>
      <p class="small">${p.text}${p.rare ? ' Nur ein seltener Trank passt in den Gürtel.' : ` Zündet: ${p.trig.map(t => TRIGGERS[t]).join(' oder ')}.`}</p>
      <p class="small dim">Vorrat ${S.pots[p.id] || 0}/${potMax(p)} · Kosten: ${Object.entries(c.herbs).map(([k, n]) => `${HERBS[k].name} ×${n} <i class="${(S.herbs[k] || 0) < n ? 'down' : ''}">(${S.herbs[k] || 0}${(S.herbs[k] || 0) < n ? ` – ${herbSource(k)}` : ''})</i>`).join(', ')}, ${c.gold} Gold</p>
      <div class="btns"><button class="red" data-action="brew" data-id="${p.id}" ${cb.ok ? '' : 'disabled'}>${cb.ok ? 'Brauen' : cb.reason}</button>
        <button data-action="${inBelt ? 'beltout' : 'beltin'}" data-id="${p.id}" ${inBelt || S.pots[p.id] ? '' : 'disabled'}>${inBelt ? 'Aus dem Gürtel' : 'In den Gürtel'}</button></div></section>
  </div>`;
}
// Vor dem Krypta-Kampf: Gegner, seine Werte, dein Gürtel, Siegchance mit/ohne Tränke
export function viewPrep(c, m) {
  const f = cryptFloor(c), { pW, p0, same } = cryptOdds(c);
  const head = `${monsterArt(m.glyph)}<div><h2>${m.name.split(',')[0]}</h2><p class="dim small">${c.name} · Stufe ${cryptTier(c) + 1} · Gegner-Stufe ${m.lvl}</p>${threat(pW)}</div>`;
  return prepCore(m, head, pW, same ? null : p0, `<button class="red" data-action="cryptgo" ${S.crypt.cd > Date.now() ? 'disabled' : ''}>Kämpfen</button>`, S.bless);
}
// Schadensart und Resistenz eines Gegners, kurz für das Handy: „Phys 70 · Eis 30 %“, „Phys 10 · Elem 25 %“
const mixTxt = m => { const p = Object.entries(m).filter(([, v]) => v > 0); return p.length === 1 ? ELEMENTS[p[0][0]].name : p.map(([k, v]) => `${ELEMENTS[k].short} ${Math.round(v * 100)}`).join(' · ') + ' %'; };
const resTxt = r => { const p = ['phys', 'elem'].filter(k => r[k]); return p.length ? p.map(k => `${k === 'phys' ? 'Phys' : 'Elem'} ${Math.round(r[k] * 100)}`).join(' · ') + ' %' : '–'; };
// Vorbereitung: Kopf + Werte mit Trank-Hinweisen + Gürtel + Siegchance (Krypta und Grube)
function prepCore(m, head, pW, p0, go, bless = 0, rule = null) {
  const e = enemyInfo(m), st = (k, v) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`, pc = x => Math.round(x * 100) + ' %';
  return `<div class="col prep">
    <section class="panel prephead">${head}</section>
    <section class="panel"><h2>Seine Werte <span class="h2r">gegen dich</span></h2>
      <div class="grid2">${st('Leben', fmtN(e.hp))}${st('Trifft dich', e.hit.join('–'))}${st('Ausweichen', pc(e.evade))}${st('Krit', pc(e.crit))}${st('Rüstung', pc(e.armor))}${st('Blocken', e.block ? pc(e.block) : '–')}${st('Schaden', mixTxt(e.mix))}${st('Resi', resTxt(e.res))}</div>
      ${e.tags.length ? `<div class="etags">${e.tags.slice(0, 4).map(([t, id]) => { const o = potOffer(id), nm = potion(id).name, weg = o.kind === 'pack' && packSlot(id, e.tags.map(x => x[1])).weg;
        const act = o.kind === 'pack' ? `${nm} ${weg ? `statt ${weg}` : 'einpacken'}` : o.kind === 'brew' ? `${nm} brauen · ${o.gold} G` : o.kind === 'in' ? `${nm} im Gürtel` : `${nm} · ${o.short || o.text}`;
        return `<span class="etag ${o.kind}" ${o.kind === 'pack' || o.kind === 'brew' ? `data-action="prepPot" data-id="${id}"` : ''}><b>${t}</b>${act}</span>`; }).join('')}</div>` : ''}</section>
    ${rule?.id === 'nopots' ? `<section class="panel"><h2>${rule.name}</h2><p class="small dim">${rule.text}</p></section>`
      : `<section class="panel"><h2>Dein Gürtel <span class="gbtns"><button class="tiny" data-action="bestBelt">Bester Gürtel</button><button class="tiny" data-action="alch" data-b="prep">Alle Tränke</button></span></h2><div class="beltrow">${[0, 1, 2].slice(0, beltSlots()).map(beltCell).join('')}</div></section>`}
    <section class="panel chance"><span class="cl">Siegchance${weakAdvice(pW) ? `<small class="hot">${weakAdvice(pW)}</small>` : `<small class="dim">${rule?.id === 'nopots' ? 'ohne Tränke' : `ohne Tränke ${p0 === null ? 'etwa gleich' : pc(p0)}`}</small>`}${bless ? `<small class="${bless > 0 ? 'up' : 'down'}">${bless > 0 ? 'Segen' : 'Fluch'} ${bless > 0 ? '+' : ''}${Math.round(bless * 100)} % Leben</small>` : ''}</span><b>${pc(pW)}</b>${go}</section>
  </div>`;
}
// --- Die Grube ---
const hon = n => `<i class="ico hon"></i>${n}`;
export function viewPitPrep(sel, B) {
  const ch = sel.ch ? pitChallenge() : null, rule = ch ? PIT_RULES.find(r => r.id === ch.rule) : null, st = PIT_STYLES[B.style];
  const { pW, p0, same } = pitOdds(B, rule?.id), busy = pitBusy();
  const win = (ch ? `${hon(PIT.chHonor)} · Platz bleibt` : `Platz ${B.place} · ${hon(pitWinHonor(B.rid))}`) + ` · ${pitWinGold(B)} Gold · ${pitWinXp(B)} EP`;
  const head = `<img class="portrait" src="${P(B.cls)}" alt=""><div><h2>${B.name}</h2><p class="dim small">${CLASSES[B.cls].name} · Stufe ${B.lvl} · ${st.name}${ch ? ` · <b class="hot">${rule.name}</b>` : ''}</p>
    <p class="small pitwin">Sieg: ${win} · Niederlage: ${Math.round(PIT.cdLose / 60)} Min. Pause</p></div>`;
  const go = busy === 'Pause' ? `<button class="red" disabled><span data-until="${S.pit.ts}">${fmtT(Math.ceil((S.pit.ts - Date.now()) / 1000))}</span></button>`
    : `<button class="red" data-action="pitgo" ${busy ? 'disabled' : ''}>Kämpfen</button>`;
  return prepCore(B, head, pW, same ? null : p0, go, 0, rule).replace('class="col prep"', 'class="col prep pitprep"').replace('<section class="panel prephead">', '<section class="panel prephead"><button class="tiny pback" data-action="go" data-v="arena">Zurück</button>');
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
    <div class="btns pitbtns"><button data-action="pitshop" data-b="arena">Vargos Laden</button><button data-action="npc" data-n="vargo">Vargo</button></div>
  </div>`;
}
export function viewPitShop(back) {
  const shop = pitShop(), Pw = S.pit, left = PIT.weekBuys - Pw.buys;
  const ware = (w, t, k) => { const can = !w.sold && left > 0 && S.honor >= w.price;
    const art = w.t === 'item' ? itemArt(w.item) : w.t === 'herb' ? herbImg(w.id) : matImg(w.id), nm = w.t === 'item' ? '' : `<i class="wn">${w.t === 'herb' ? HERBS[w.id].name : MATS[w.id]} ×${w.n}</i>`;
    return `<div class="sitem pware ${w.t === 'item' ? rarCls(w.item) : ''} ${w.sold ? 'sold' : ''}" ${w.t === 'item' ? `data-tip="${w.item.id}"` : ''} data-action="pitbuy" data-t="${t}" data-k="${k}">${art}${nm}${w.t === 'item' ? hitDots(w.item) : ''}<span class="price ${can ? '' : 'no'}">${w.sold ? 'verkauft' : hon(w.price)}</span></div>`; };
  return `<div class="col pitshopv">${back === 'traders' ? '' : cryptTabs('arena')}
    <section class="panel"><h2>Vargos Laden <span class="h2r">${hon(S.honor)} · noch ${left} diese Woche</span></h2>
    ${PIT_SHOP.map(t => { const rk = PIT_RANKS.find(r => r.id === t.rank); return pitTierOpen(t.rank)
      ? `<div class="tier">${rk.name}</div><div class="shoprow pitrow">${shop[t.rank].map((w, k) => ware(w, t.rank, k)).join('')}</div>`
      : `<div class="tier off">${rk.name} · ab Platz ${rk.max}</div>`; }).join('')}</section>
    <div class="btns"><button data-action="titles" data-b="pitshop">Titel${Pw.titles.length ? ` <span class="h2r">${Pw.titles.length}</span>` : ''}</button><button data-action="${back === 'traders' ? 'trader" data-t="vargo' : 'go" data-v="arena'}">Zurück</button></div>
  </div>`;
}
// Titel aus den Rang-Aufstiegen – eigenes Fenster, damit Vargos Laden die ganze Höhe behält
export function viewTitles(back) {
  const T = S.pit.titles;
  return `<div class="col titlev"><section class="panel"><h2>Titel <span class="h2r">${T.length} verdient</span></h2>
    ${T.length ? `<div class="titles">${T.map(t => `<button class="tiny ${S.title === t ? 'on' : ''}" data-action="pittitle" data-t="${t}">${t}</button>`).join('')}${S.title ? '<button class="tiny" data-action="pittitle" data-t="">Ohne</button>' : ''}</div>` : ''}
    <p class="dim small">${T.length ? 'Der Titel steht neben deinem Namen in der Kopfzeile.' : 'Steig in der Grube in einen neuen Rang auf, um einen Titel zu tragen. Jeder neue Rang gibt einmalig einen Segen.'}</p></section>
    <button data-action="${back === 'vargo' ? 'trader" data-t="vargo' : 'go" data-v="pitshop'}">Zurück</button></div>`;
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
// Was diese Tiefe mehr gibt (descReward) – ehrlich aus derselben Rechnung wie die Beute
function descLohn(d) {
  const R = descReward(d), x = v => v.toFixed(2).replace(/0$/, '').replace('.', ','), rar = { 2: 'magisch', 3: 'selten' }[R.minR];
  const next = TIERS.filter(t => t.minDepth > d).sort((a, b) => a.minDepth - b.minDepth)[0];
  const tiers = R.tiers.length ? `Boni bis ${R.tiers.map(t => tierTag(t.t)).join(' ')}` : next ? `${tierTag(next.t)} ab Tiefe ${next.minDepth}` : '';
  return `Lohn: Gold/EP ×${x(R.gold)} · Funde ×${x(R.item)}${rar ? ` · mind. ${rar}` : ''}${tiers ? ` · ${tiers}` : ''}`;
}
// Wochenlohn: abholbar (wenn die Woche um ist) oder was es am Montag für die Wochenbest-Tiefe gibt
function descWeekRow(R) {
  const due = R.due, W = descWeekReward(due ? due.d : R.wBest), txt = W ? `${W.gold} Gold${W.kron ? ` · ${W.kron} Kronsplitter` : ''} · +${W.seals} Siegel (max. ${DESCENT.sealMax})${W.item ? ' · ein seltenes Teil' : ''}` : '';
  if (due) return `<section class="panel dweek"><p class="small"><b class="hot">Wochenlohn für Tiefe ${due.d}:</b> ${txt}</p><button class="tiny red" data-action="descweek">Abholen</button></section>`;
  return `<section class="panel dweek"><p class="small dim">${W ? `Wochenlohn am Montag für Tiefe ${W.d}: ${txt}` : 'Wochenlohn am Montag: schlage diese Woche einen Abgrund-Boss.'}</p></section>`;
}
// --- Siegel des Abgrunds (SIGILS): Platz auf dem Start-Bildschirm, Gefahr und Lohn vorher sichtbar ---
const sigImg = id => `<img class="matimg" src="assets/forge/${sigKind(id).img}.webp" alt="">`;
export const sigName = x => `${sigKind(x.id).name} (${SIGILS.tierName[x.t - 1]})`;
const pc = v => Math.round(v * 100) + ' %', xf = v => '×' + String(Math.round(v * 10) / 10).replace('.', ',');
// Was die Auswahl tut – aus sigFx, derselben Rechnung wie im Kampf und bei der Beute
export function sigLine(fx) {
  const RAR = ['', '', 'magisch', 'selten', 'legendär'];
  const bad = [fx.foe && `Gegner +${pc(fx.foe)}`, fx.eliteW > 1 && `Elite ${xf(fx.eliteW)}${fx.eliteFoe ? ` und +${pc(fx.eliteFoe)}` : ''}`, fx.res && `Elem.-Resi −${pc(fx.res)}`].filter(Boolean);
  const good = [fx.loot && `Gold/Funde +${pc(fx.loot)}`, fx.eliteR && `Elite-Funde mind. ${RAR[fx.eliteR]}${fx.eliteItem ? ` +${fx.eliteItem}` : ''}`, fx.kronE > 1 && `Kronsplitter ${xf(fx.kronE)}`,
    fx.favor > 1 && `Resi-Boni ${xf(fx.favor)}`, fx.luck && `Glück +${fx.luck}`].filter(Boolean);
  return `<b class="down">${bad.join(' · ')}</b> &rarr; <b class="up">${good.join(' · ')}</b>`;
}
function descSigs(sel) {
  const any = SIGILS.kinds.some(k => [1, 2, 3].some(t => sigHave(k.id, t)));
  if (!any && !sel.length) return `<section class="panel dsig"><p class="small dim">Siegel: keine. Sie fallen im Abgrund (der Boss trägt sicher eines) – eingelegt machen sie den Abstieg gefährlicher und die Beute größer.</p></section>`;
  const cell = k => { const on = sel.find(x => x.id === k.id), n = [1, 2, 3].reduce((a, t) => a + sigHave(k.id, t), 0);
    return `<button class="sigc ${on ? 'on' : ''}" data-action="descsig" data-k="${k.id}" title="${k.name}" ${n ? '' : 'disabled'}>${sigImg(k.id)}<span><b>${k.name.replace('siegel', '')}</b><small>${on ? SIGILS.tierName[on.t - 1] : n ? `${n} im Vorrat` : 'keins'}</small></span></button>`; };
  return `<section class="panel dsig"><div class="sigrow">${SIGILS.kinds.map(cell).join('')}</div>
    <p class="small sigfx">${sel.length ? sigLine(sigFx(sel)) : `<span class="dim">Bis zu ${SIGILS.max} Siegel einlegen (antippen) – werden beim Hinabsteigen verbraucht.</span>`}</p></section>`;
}
function viewDescStart(st) {
  const list = descCrypts();
  if (!list.length) return `<div class="col desc">${cryptTabs('desc')}<section class="panel waiting"><h2>Der Abgrund</h2><p class="lore">Unter den Krypten liegt mehr als Knochen. Wer dort hinab will, muss erst einen Krypta-Boss bezwungen haben.</p>
    <p class="small dim">Rausholen oder verlieren: Leben läuft von Raum zu Raum mit, die Beute zählt erst draußen.</p></section></div>`;
  const R = descRec(), max = descMaxDepth(), d = Math.max(1, Math.min(max, +st.d || max)), at = descAt(d), c = at.c, left = descLeft();
  return `<div class="col desc">${cryptTabs('desc')}
    <section class="panel dhead">${monsterArt(c.boss.glyph)}<div><h2>Der Abgrund <span class="h2r seals" title="${DESCENT.sealDay} je Tag, Krypta-Bosse und neue Ränge"><img class="matimg" src="assets/forge/grabsiegel.webp" alt="">${left}/${DESCENT.sealMax}</span></h2>
      <div class="xhead"><button class="tiny" data-action="descc" data-d="-1" ${d <= 1 ? 'disabled' : ''}>‹</button><b>Tiefe ${d}</b><button class="tiny" data-action="descc" data-d="1" ${d >= max ? 'disabled' : ''}>›</button></div>
      <p class="small dim">${c.name} · Gegner Stufe ${at.lvl}${descResPen(d) ? ` · <b class="down">Elem.-Resi −${Math.round(descResPen(d) * 100)} %</b>` : ''} · oben wartet ${c.boss.name.split(',')[0]}: <i>${c.boss.mechText}</i></p>
      <p class="small drec">Rekord <b>Tiefe ${R.best}</b> · diese Woche <b class="${R.wBest >= R.best && R.best ? 'up' : ''}">${R.wBest}</b></p>
      <p class="small dlohn">${descLohn(d)}</p></div></section>${descWeekRow(R)}${descSigs(sigClean(st.sig))}
    <section class="panel drules"><h2>Rausholen oder verlieren</h2>
      <p class="small">Jeder Raum ein Kampf. <b>Leben und Trank-Ladungen füllen sich unten nicht auf.</b></p>
      <p class="small opt">Mit jedem Raum steigt die <b>Unruhe</b>: Gegner stärker, Beute bis ×${descMult(5)}.</p>
      <p class="small sack">Beute liegt im <b>Beutesack</b>. Dir gehört sie erst an einem <span class="up">Ausgang</span>: Seil, Brunnen, Stiege oder hinter dem Boss.</p>
      <p class="small down">Fällst du, bleibt der Sack unten. Ausrüstung, Stufe und EP behältst du.</p>
      <p class="small opt">Keine letzte Tiefe: <b>Wer den Boss schlägt, öffnet die nächste.</b> Jede Tiefe ist um ein Zwanzigstel stärker – Gold, EP und Funde wachsen mit.</p>
      <p class="small sealnote">Kostet ein <b>Grabsiegel</b> – <span class="up">der Boss erstattet es mit ${Math.round(DESCENT.sealBoss * 100)} % Chance</span>.</p>${descBusy() ? `<p class="small hot">${descBusy()}</p>` : ''}</section>
    <section class="panel"><h2>Dein Gürtel <span class="gbtns"><button class="tiny" data-action="alch" data-b="desc">Tränke</button></span></h2><div class="beltrow">${[0, 1, 2].slice(0, beltSlots()).map(beltCell).join('')}</div></section>
    <div class="btns"><button data-action="go" data-v="crypt">Zurück</button><button class="red" data-action="descgo" data-d="${d}" ${descCanStart(d) ? '' : 'disabled'}>${left ? 'Hinabsteigen' : 'Kein Grabsiegel'}</button></div>
  </div>`;
}
function sackRow(s) {
  const its = s.items.slice(0, 7).map(it => `<span class="dit ${rarCls(it)}" data-tip="${it.id}" data-action="noop">${itemArt(it)}${hitDots(it)}</span>`).join('');
  const more = s.items.length > 7 ? `<span class="dmore">+${s.items.length - 7}</span>` : '';
  const chips = [...Object.entries(s.herbs).filter(([, n]) => n > 0).map(([k, n]) => `<span title="${HERBS[k].name}">${herbImg(k)}×${n}</span>`),
    ...Object.entries(s.mats).filter(([, n]) => n > 0).map(([k, n]) => `<span title="${MATS[k]}">${matImg(k)}×${n}</span>`),
    ...Object.entries(s.sig || {}).filter(([, n]) => n > 0).map(([key, n]) => { const [id, t] = key.split(':'); return `<span title="${sigName({ id, t: +t })}">${sigImg(id)}×${n}</span>`; })].join('');
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
        <span>Unruhe</span><div class="bar xp"><i style="width:${Math.min(100, D.unrest / 6 * 100)}%"></i></div><b class="up">Beute ×${descMult()}</b></div><div class="dsackh"><span>${D.d ? `Tiefe ${D.d} · ` : ''}Raum ${D.rooms + 1} · ${c.name}</span>${D.sig?.length ? `<span class="dsigs" title="${D.sig.map(sigName).join(', ')}">${D.sig.map(x => sigImg(x.id)).join('')}</span>` : ''}</div></section>
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
      <p class="small">Verloren: <b class="down">${l.gold} Gold</b>${l.items.length ? ` · <b class="down">${l.items.length} Fundstück${l.items.length > 1 ? 'e' : ''}</b>` : ''}${Object.values(l.sig || {}).reduce((a, n) => a + n, 0) ? ` · <b class="down">${Object.values(l.sig).reduce((a, n) => a + n, 0)} Siegel</b>` : ''}${l.mats?.aschenkern ? ' · <b class="down">Aschenkern</b>' : ''}</p>
      ${l.items.length ? `<p class="small">${l.items.map(it => `<span class="r-${it.rarity}">${it.name}</span>`).join(' · ')}</p>` : ''}
      <p class="small">Behalten: <b class="up">${l.xp} EP</b>, Ausrüstung, Stufe · ${l.rooms} Räume geschafft</p></section>
      <div class="btns"><button class="red" data-action="descok">Weiter</button></div></div>`; }
  const o = res.out, chips = [...o.herbs.map(([k, n]) => `<span title="${HERBS[k].name}">${herbImg(k)}<i class="nm">${HERBS[k].name} </i>×${n}</span>`), ...o.mats.map(([k, n]) => `<span title="${MATS[k]}">${matImg(k)}<i class="nm">${MATS[k]} </i>×${n}</span>`),
    ...(o.sig || []).map(x => `<span title="${sigName(x)}">${sigImg(x.id)}<i class="nm">${sigKind(x.id).name} </i>×${x.n}</span>`)];
  return `<div class="col descres">${cryptTabs('desc')}<section class="panel"><h2>Entkommen · ${o.how}</h2>${o.rec ? `<p class="small ${o.rec.best ? 'up' : ''}">${o.rec.best ? `Neuer Rekord: <b>Tiefe ${o.rec.d}</b>` : `Tiefe ${o.rec.d} geschafft`} – Tiefe ${o.rec.d + 1} ist offen.</p>` : ''}
    <div class="drows"><p><span>Räume</span><b>${o.rooms} · Unruhe ×${descMult(o.unrest)}</b></p><p><span>Erfahrung</span><b>${o.xp} EP</b></p><p><span>Gold</span><b class="up">+${o.gold}</b></p></div></section>
    <section class="panel"><h2>Gesichert</h2><div class="xloot">
      ${o.items.length ? `<p>${o.items.map(it => `<span class="r-${it.rarity}">${it.name}</span>${it.soldFull ? ' <span class="dim small">(Beutel voll, verkauft)</span>' : ''}`).join(' · ')}</p>` : ''}
      ${chips.length ? `<p class="xrow">${chips.join('')}</p>` : ''}${!o.items.length && !chips.length ? '<p class="dim">nur Gold</p>' : ''}</div></section>
    <div class="btns"><button class="red" data-action="descok">Weiter</button></div></div>`;
}

// --- Einstellungen ---
export function viewOpts(opt, levels) {
  const row = (k, label, note = '') => `<div class="optrow"><span>${label}${note ? `<small class="dim">${note}</small>` : ''}</span><div class="optbtns">${levels.map(([n, v]) => `<button class="tiny ${Math.abs(opt[k] - v) < 0.01 ? 'on' : ''}" data-action="optset" data-k="${k}" data-v="${v}" ${k === 'music' && v ? 'disabled' : ''}>${n}</button>`).join('')}</div></div>`;
  return `<div class="col opts"><section class="panel"><h2>Einstellungen</h2>
    ${row('sfx', 'Kampfgeräusche')}${row('music', 'Musik', 'kommt später')}
    <p class="small dim">Am iPhone: Stummschalter aus, sonst bleibt es still.</p></section>
    <section class="panel"><h2>Nachschlagen</h2>
      <p class="small dim">Wo was fällt, was es tut – und ein Filter, der gesuchte Boni im Beutel mit einem Punkt je Treffer markiert.</p>
      <div class="btns"><button data-action="wikicat" data-c="">Verzeichnis</button>
        <button data-action="go" data-v="filter">Beute-Filter${filterOn() ? ` · ${filterOf().mods.length}` : ''}</button></div></section>
    <section class="panel"><h2>Held</h2><p class="small dim">Vernichten löscht ${S.name} für immer – Stufe, Beute, alles.</p>
      <div class="btns"><button data-action="dbg">Anzeige-Maße</button><button class="red" data-action="wipe">Held vernichten</button></div></section>
    <div class="btns"><button data-action="go" data-v="hero">Zurück</button></div></div>`;
}

// --- Akt: Weg von unten (Einstieg) nach oben (Boss) ---
export function viewAct(a) {
  const p = actProg(a), l = LOCATIONS.find(x => x.id === a.loc), nz = Math.min(p, ACT.zones), lootDots = (z, el, boss) => {
    const r = boss ? ['ly', 'll'] : el ? ['lm', 'ly'] : z / ACT.zones >= 0.6 ? ['lw', 'lm'] : z / ACT.zones >= 0.3 ? ['lw', 'lm'] : ['lg', 'lw'];
    return `<span class="loot">${r.map(c => `<i class="${c}"></i>`).join('')}</span>`; };
  const row = z => { const boss = z === ACT.zones, el = ACT.elites.includes(z), done = z < p, cur = z === nz && !actDone(a), fog = z > nz;
    const name = boss ? a.boss.name : a.zones[z], sub = boss ? a.boss.mechText : `${el ? 'Elite · ' : ''}${actZoneMob(a, z)} · Stufe ${actZoneLvl(a, z)}`;
    return `<div class="zone ${done ? 'done' : ''} ${cur ? 'cur' : ''} ${fog ? 'fog' : ''} ${el ? 'elite' : ''} ${boss ? 'boss' : ''}" ${fog ? '' : `data-action="zone" data-a="${a.id}" data-z="${z}"`}>
      <span class="dot">${boss || cur ? monsterArt(boss ? a.boss.glyph : MONSTERS.find(m => m.name === actZoneMob(a, z)).glyph) : done ? '<i class="ok"></i>' : ''}</span>
      <div><b>${name}</b><small>${sub}</small></div><span class="r">${cur ? pcT(actChance(a, z)) : lootDots(z, el, boss)}</span></div>`; };
  // Ortsbild als Hintergrund des Kopfes: kostet keine Hoehe, und auf dem SE ist keine uebrig.
  return `<div class="col actv"><section class="panel ahead pic"><i class="bg" style="background-image:url(assets/places/${l.id}.webp)"></i><h2>Akt ${a.n} · ${l.name}</h2><small class="lore">${actDone(a) ? a.outro : p >= ACT.zones ? `„${a.boss.name.split(',')[0]}: ${a.say}“` : a.intro}</small></section>
    <section class="panel path">${Array.from({ length: ACT.zones + 1 }, (_, z) => row(z)).join('')}</section>
    <div class="btns two"><button data-action="go" data-v="trips">Zurück</button>${actDone(a) ? `<button disabled>Akt geschafft</button>` : `<button class="red" data-action="zone" data-a="${a.id}" data-z="${nz}">Weiter · ${nz >= ACT.zones ? 'Boss' : a.zones[nz]}</button>`}</div></div>`;
}
export function viewZonePrep(a, z, m) {
  const boss = z >= ACT.zones, p = actProg(a), replay = z < p, why = actCan(a, z), { pW, p0, same } = actOdds(a, z);
  const head = `${monsterArt(boss ? a.boss.glyph : m.glyph)}<div><h2>${boss ? a.boss.name : a.zones[z]}</h2><p class="dim small">Akt ${a.n} · ${boss ? 'Boss' : `Gebiet ${z + 1}`} / ${ACT.zones + 1} · ${boss ? '' : m.name.split(',')[0] + ' · '}Stufe ${m.lvl}</p>
    <p class="small">${boss ? `<i>${a.boss.mechText}</i>` : m.elite ? `<b class="hot">Elite:</b> ${m.elite.join(', ')}` : ''}${replay ? ` <span class="dim">Wiederholen · </span><i class="ico glut"></i>${actZoneGlut(a)}` : ' <span class="up">Neu · kostet nichts</span>'}</p></div>`;
  return prepCore(m, head, pW, same ? null : p0, `<button class="red" data-action="actgo" ${why ? 'disabled' : ''}>${why && why.startsWith('Wiederholen') ? 'Glut fehlt' : 'Kämpfen'}</button>`)
    .replace('<section class="panel prephead">', `<section class="panel prephead"><button class="tiny pback" data-action="act" data-id="${a.id}">Zurück</button>`);
}

// --- Umherziehen ---
const wImg = c => c.k === 'fight' ? `assets/monsters/${MONSTERS.find(m => m.name === c.mob)?.glyph || 'ghul'}.jpg` : `assets/expedition/${WANDER.kinds.find(k => k.id === c.k).img}.webp`;
const wLine = c => c.k === 'fight' ? `Kampf: ${c.mob}` : WANDER.kinds.find(k => k.id === c.k).name;
export function viewWander(res = null) {
  if (res) return `<div class="col wander"><section class="panel"><h2>Zurück vom Umherziehen</h2><p class="small dim">${res.n} Punkte in ${res.min} Min.</p></section>
    <section class="panel wlog"><p><span>Erfahrung</span><b>+${res.xp} EP${res.up ? ` · <span class="hot">Stufe ${S.lvl}!</span>` : ''}</b></p><p><span>Gold</span><b>${res.gold}</b></p>
      ${res.items.length ? `<p><span>Fundstücke</span><b>${res.items.map(it => `<span class="r-${it.rarity}">${it.name}</span>`).join(', ')}</b></p>` : ''}
      ${res.herbs.length ? `<p><span>Zutaten</span><b>${res.herbs.map(([k, n]) => `${HERBS[k].name} ×${n}`).join(' · ')}</b></p>` : ''}
      ${res.mats.length ? `<p><span>Material</span><b>${res.mats.map(([k, n]) => `${MATS[k]} ×${n}`).join(' · ')}</b></p>` : ''}</section>
    <div class="btns"><button class="red" data-action="wok">Weiter</button></div></div>`;
  const W = S.wander, a = ACTS.find(x => x.id === W.a), l = LOCATIONS.find(x => x.id === a.loc), done = wanderDone(W), c = W.cur, k = WANDER.kinds.find(x => x.id === c.k);
  const end = W.t + WANDER.sec * 1000, left = Math.max(0, Math.ceil((end - Date.now()) / 1000)), passed = WANDER.sec - left;
  const A = W.acc, herbs = Object.values(A.herbs).reduce((x, y) => x + y, 0), mats = Object.values(A.mats).reduce((x, y) => x + y, 0);
  const head = done ? `<section class="panel waiting"><h2>Der Held wartet am Lagerfeuer</h2><p class="lore">${Math.round(WANDER.maxSec / 3600)} Std. umhergezogen – mehr trägt der Sack nicht.</p></section>`
    : `<section class="panel wscene"><img class="bg" src="${wImg(c)}" alt=""><span class="wt" data-until="${end}">${fmtT(left)}</span><img class="portrait whero" src="${P(S.cls)}" alt="">
      <div class="wact"><b>${c.k === 'fight' ? `${k.verb} ${c.mob}` : k.verb}</b><small>${l.name} · ${W.route ? `Station ${Math.min(Math.floor(W.n / WANDER.per), W.route.length - 1) + 1}/${W.route.length}: ${WANDER_ST[W.route[Math.min(Math.floor(W.n / WANDER.per), W.route.length - 1)]].name} · ` : ''}Punkt ${W.n + 1}</small><div class="wbar"><i style="animation-duration:${WANDER.sec}s;animation-delay:-${passed}s"></i></div></div></section>`;
  return `<div class="col wander">${head}
    <section class="panel wlog">${W.log.length ? W.log.map(x => `<p><span>${x.n} · ${wLine(x)}</span><b>${x.text}</b></p>`).join('') : '<p class="dim small">Noch nichts gefunden.</p>'}</section>
    <section class="panel wsack"><span>Im Sack</span><b>${[`${A.gold} Gold`, A.items.length && `${A.items.length} Fundst.`, herbs && `${herbs} Zutat${herbs === 1 ? '' : 'en'}`, mats && `${mats} Mat.`].filter(Boolean).join(' · ')}</b></section>
    <p class="small dim wcap">${done ? 'Fertig.' : `Unterwegs seit ${Math.round((W.t - W.start) / 60000)} Min. · läuft nur, solange die App offen ist`}</p>
    <div class="btns"><button class="red" data-action="wclaim">${done ? 'Sack abholen' : 'Heimrufen · Sack abholen'}</button></div></div>`;
}
export function viewWanderAway(npc) {
  return `<div class="col">${say(npc)}<section class="panel waiting"><h2>Dein Held zieht umher</h2><p class="lore">Kämpfen kann er erst, wenn du ihn heimrufst.</p>
    <div class="btns"><button data-action="go" data-v="trips">Zum Umherziehen</button></div></section></div>`;
}

// Route fürs Umherziehen wählen (wie Expedition): Start oben, Lager unten
export function viewWanderPlan(path, info = null) {
  const a = wanderAct(), l = LOCATIONS.find(x => x.id === a.loc), map = wanderMap(a.id), R = map.rows.length, full = path.length === R;
  const nR = R + 2, Y = r => (r + 0.5) / nR * 100, pos = (r, n) => ({ x: n.x * 100, y: Y(r) });
  const can = (r, j) => r === path.length && (r === 0 || expLinked(map.rows[r - 1][path[r - 1]], map.rows[r][j]));
  let lines = '', gold = ''; const ln = (p1, p2, on) => { const t = `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"/>`; if (on) gold += t; else lines += t; };
  map.rows[0].forEach((n, j) => ln({ x: 50, y: Y(0) }, pos(1, n), path[0] === j));
  for (let r = 1; r < R; r++) map.rows[r].forEach((n, j) => map.rows[r - 1].forEach((m, k) => { if (expLinked(m, n)) ln(pos(r, m), pos(r + 1, n), path[r - 1] === k && path[r] === j); }));
  map.rows[R - 1].forEach((n, j) => ln(pos(R, n), { x: 50, y: Y(R + 1) }, full && path[R - 1] === j));
  const node = (r, n, j) => { const on = path[r] === j, nx = can(r, j), d = WANDER_ST[n.t], tap = on || nx;
    return `<button class="node c-${n.t} ${on ? 'on' : ''} ${nx ? 'next' : ''} ${!on && !nx ? 'off' : ''} ${info === n.t ? 'seen' : ''}" style="left:${n.x * 100}%;top:${Y(r + 1)}%" data-action="${tap ? 'wpath' : 'winfo'}" data-r="${r}" data-j="${j}" data-t="${n.t}" title="${d.text}">${nodeArt(d.img)}<label>${d.name}</label></button>`; };
  const cnt = {}; if (full) path.forEach((j, r) => { const t = map.rows[r][j].t; cnt[t] = (cnt[t] || 0) + 1; });
  const what = t => { const d = WANDER_ST[t], extra = t === 'herb' ? HERBS[HERB_LOC[l.id]]?.name : t === 'mats' ? [...new Set(l.mobs.map(nm => MATS[MONSTERS.find(m => m.name === nm)?.mat]).filter(Boolean))].join(', ') : t === 'fight' ? l.mobs.join(', ') : '';
    return `<p class="small ninfo"><b class="tc-${t}">${d.name}</b> · ${d.text}${extra ? ` <span class="dim">(${extra})</span>` : ''}</p>`; };
  const hint = info && !full ? what(info) : full && info ? `<p class="small">${path.map((j, r) => WANDER_ST[map.rows[r][j].t].name).join(' → ')}</p>${what(info)}` : full ? `<p class="small">${path.map((j, r) => WANDER_ST[map.rows[r][j].t].name).join(' → ')}</p><p class="small xprev">${Object.entries(cnt).map(([t, n]) => `${n}× ${WANDER_ST[t].text.split(':')[0]}`).join(' · ')}</p>`
    : `<p class="small dim">Wähle die ${path.length + 1}. Station. Jede dauert ${Math.round(WANDER.per * WANDER.sec / 60)} Min. (${WANDER.per} Punkte) und bringt vor allem, was sie zeigt.</p>`;
  return `<div class="col exped wplan">
    <section class="panel expmap"><h2>Umherziehen <span class="h2r">${l.name}</span></h2>
      <div class="map" style="--rows:${nR}"><svg class="lines" viewBox="0 0 100 100" preserveAspectRatio="none"><g class="l0">${lines}</g><g class="l1">${gold}</g></svg>
        <span class="node start on" style="left:50%;top:${Y(0)}%"><img src="assets/ui/marker.webp" alt=""><label>Aufbruch</label></span>
        ${map.rows.map((row, r) => row.map((n, j) => node(r, n, j)).join('')).join('')}
        <span class="node goal ${full ? 'on' : ''}" style="left:50%;top:${Y(R + 1)}%">${nodeArt('camp')}<label>Heimweg</label></span></div></section>
    <section class="panel xsum"><h2>Dein Weg <span class="h2r">${R} Stationen · ${Math.round(WANDER.maxSec / 3600)} Std.</span></h2>${hint}</section>
    <div class="btns"><button data-action="go" data-v="trips">Zurück</button><button class="red" data-action="wstart" ${full ? '' : 'disabled'}>Losziehen</button></div></div>`;
}

// --- Beute-Filter (Einstellungen -> eigene Seite) ---
// Eigene Ansicht wie Verzeichnis/Titel/Grab-Sets: 36 Bonus-Knoepfe machen in den Einstellungen ein
// 550 px hohes Panel, das unten herauslief (gemessen auf drei Bildschirmen).
// Was gerade gefiltert wird, gegliedert statt als Fließtext. Reihenfolge wie in der Knopf-Liste;
// Zauber erkennt man am Schlüssel (`sk_`), alles, was weder Grundwert noch Abwehr ist, zählt als Angriff.
const FGROUPS = [['Grundwerte', k => ['str', 'dex', 'int', 'con', 'lck'].includes(k)],
  ['Abwehr', k => ['armor', 'lifep', 'blockp', 'evadep', 'thornsp', 'physr', 'elemr'].includes(k)],   // Resistenzen sind Abwehr (standen unter Angriff)
  ['Zauber', k => k.startsWith('sk_')], ['Angriff', () => true]];
function filterSum(f, stats) {
  if (!f.mods.length) return '<p class="small dim">Nichts gewählt – Boni unten antippen.</p>';
  const left = stats.map(a => a.stat).filter(k => f.mods.includes(k)), rows = [];
  for (const [name, test] of FGROUPS) { const ks = left.filter(test); ks.forEach(k => left.splice(left.indexOf(k), 1)); if (ks.length) rows.push([name, ks]); }
  const order = ['Grundwerte', 'Angriff', 'Abwehr', 'Zauber'];
  rows.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  // Nur noch die Zahl je Gruppe: welche gewählt sind, zeigen die Knöpfe unten (gold umrandet). Die volle Liste drückte die
  // unteren Knöpfe aus dem Bild (Besitzer 2026-11-24: „kann untere nicht auswählen“).
  return `<p class="small fsumm1">${rows.map(([n, ks]) => `<b>${n}</b> ${ks.length}`).join(' · ')}</p>`;
}
export function viewFilter() {
  // Zauber-Boni (`sk_<id>`) tragen ihre Klasse: fremde gehoeren nicht in die Liste - "% Kriegsschrei"
  // kann eine Zauberin nie gebrauchen, und 15 tote Knoepfe drueckten die Liste aus dem Panel.
  const f = filterOf(), stats = [...new Map(AFFIXES.filter(a => !a.cls || a.cls === S.cls).map(a => [a.stat, a])).values()];
  return `<div class="col filterv"><section class="panel"><h2>Beute-Filter <span class="h2r">${f.mods.length ? `${f.mods.length} gewählt` : 'aus'}</span></h2>
    ${filterSum(f, stats)}
    <div class="optrow"><span>Stufe ${TIERS.find(t => t.t === f.tier)?.name || ''} oder besser <small class="dim">(I ist die beste)</small></span><div class="optbtns five">${TIERS.filter(t => !t.deep).map(t =>
      `<button class="tiny ${f.tier === t.t ? 'on' : ''}" data-action="filtier" data-t="${t.t}">${t.name}</button>`).join('')}</div></div></section>
    <section class="panel fcol"><div class="fpick">${stats.map(a =>
      `<button class="tiny ${f.mods.includes(a.stat) ? 'on' : ''}" data-action="filmod" data-k="${a.stat}">${STAT_NAME(a.stat)}</button>`).join('')}</div></section>
    <div class="btns">${f.mods.length ? '<button class="tiny" data-action="filclear">Leeren</button>' : ''}<button data-action="go" data-v="opts">Zurück</button></div></div>`;
}

// --- Das Verzeichnis (Einstellungen -> Verzeichnis) ---
// Drei Lagen: Kategorien, Liste, Eintrag. Alle Texte kommen aus js/wiki.js und sind dort
// abgeleitet - hier steht nur, wie sie aussehen. Die Liste ist die einzige Stelle neben dem
// Kampflog und der Werte-Ansicht, die scrollen darf (vom Besitzer so freigegeben): zehn
// Aufwertungs-Wege und vierzehn Traenke passen auf kein iPhone.
export function viewWiki(cat, sel) {
  const zurueck = (v, c) => `<button class="tiny" data-action="${v}" ${c ? `data-c="${c}"` : ''}>Zurück</button>`;
  if (!cat) return `<div class="col wiki"><section class="panel"><h2>Das Verzeichnis <span class="h2r">Was du bisher gesehen hast</span>${zurueck('go" data-v="opts')}</h2>
    <div class="wcats">${WIKI_CATS.map(c => `<div class="wcat ${c.wide ? 'wide' : ''}" data-action="wikicat" data-c="${c.id}"><img src="${c.img}" alt="">
      <b>${c.name}</b><small>${wikiCount(c.id)}</small></div>`).join('')}</div></section>
    <section class="panel grow"><p class="small dim">Das Verzeichnis füllt sich, während du spielst. Was du noch nie gesehen hast, steht nur als Lücke darin.</p></section></div>`;

  if (cat === 'up') {
    const P = upgradePaths(); let grp = '';
    const eng = matBottleneck();
    return `<div class="col wiki"><section class="panel grow wcol"><h2>Aufwerten <span class="h2r">${P.length} Wege</span>${zurueck('wikicat', '')}</h2>
      <div class="wlist">${P.map(u => `${u.grp !== grp ? `<p class="ugrp">${grp = u.grp}</p>` : ''}
        <div class="urow"><div class="u1"><b>${u.name}</b><span class="uw">${u.where}</span></div>
        <p class="uc">${u.cost}</p>${u.limit ? `<p class="ul">${u.limit}</p>` : ''}</div>`).join('')}</div></section>
      ${eng ? `<section class="panel"><p class="uwarn"><b>${MATS[eng.k]} wird von ${eng.n.length} Wegen verlangt:</b> ${eng.n.join(', ')}. Du hast ${eng.have}.</p></section>` : ''}</div>`;
  }

  const C = WIKI_CATS.find(c => c.id === cat); if (!C) return viewWiki(null);
  const e = sel && wikiEntry(cat, sel);
  if (e) return `<div class="col wiki"><section class="panel grow wdet"><h2 class="${e.rare ? 'r-rare' : ''}">${e.name} <span class="h2r">${e.kind}</span>${zurueck('wikicat', cat)}</h2>
    <img class="big ${e.wide ? 'wide' : ''}" src="${e.img}" alt="">
    ${e.lines.map(l => `<p class="small ${l.dim ? 'dim' : ''}">${l.b ? `<b>${l.b}</b> ` : ''}${l.t}</p>`).join('')}
    ${e.tags?.length ? `<hr><p class="small wuse"><b>${e.tagLabel}</b></p><p>${e.tags.map(t => `<span class="wtag">${t}</span>`).join('')}</p>` : ''}
    ${e.foot ? `<p class="small dim wfoot">${e.foot}</p>` : ''}</section></div>`;

  const L = wikiList(cat);
  return `<div class="col wiki"><section class="panel grow wcol"><h2>${C.name} <span class="h2r">${wikiCount(cat)}</span>${zurueck('wikicat', '')}</h2>
    <div class="wlist">${L.map(r => `<div class="wrow ${r.unknown ? 'unk' : ''} ${r.rare ? 'rare' : ''}" ${r.unknown ? '' : `data-action="wikisel" data-c="${cat}" data-id="${r.id}"`}>
      <img src="${r.img}" alt=""><b>${r.unknown ? 'Noch unbekannt' : r.name}</b>${r.right === '' || r.right == null ? '' : `<i>${r.right}</i>`}<small>${r.sub}</small></div>`).join('')}</div></section></div>`;
}
// „5 von 7" - macht aus einer Liste eine Sammlung und sagt, dass es noch etwas zu finden gibt.
function wikiCount(cat) {
  if (cat === 'up') return 'Alle Wege, ein Teil besser zu machen';
  const L = wikiList(cat), u = L.filter(r => r.unknown).length;
  return u ? `${L.length - u} von ${L.length}` : `${L.length}`;
}
