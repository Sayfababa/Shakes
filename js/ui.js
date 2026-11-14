// Rendering: reine String-Templates. Keine Spiellogik.
import { CLASSES, ATTRS, SLOTS, RARITIES, CFG, TALENTS, EFFECT_NAMES, CRYPTS, DIFFICULTIES } from './data.js';
import { S, stats, xpNeed, rank, talentPoints, talentState, respecCost, cryptFloor, cryptOpen, cryptLvl } from './state.js';

const P = (cls) => `assets/portraits/${CLASSES[cls].portrait}.jpg`;
const rarName = id => RARITIES.find(r => r.id === id)?.name || '';
const fmtT = s => `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, '0')}`;
const pct = (a, b) => Math.max(0, Math.min(100, (a / b) * 100));

// --- Icons (handgezeichnete, schlichte Silhouetten) ---
const ICON = {
  helm: 'M12 3c-5 0-8 4-8 9v6h4v-5h8v5h4v-6c0-5-3-9-8-9z',
  chest: 'M7 3l-4 3 2 6 2-1v10h10V11l2 1 2-6-4-3-3 2h-4z',
  gloves: 'M7 21V10l-2-4 2-1 2 4V3h2v6V2h2v7V3h2v7l2-2 1 1-3 6v6z',
  boots: 'M8 2h6v12l6 3v4H5v-4l3-3z',
  belt: 'M2 9h20v6H2zM10 8h4v8h-4z',
  amulet: 'M6 2l6 9 6-9M12 12a4 4 0 100 8 4 4 0 000-8z',
  ring: 'M12 6a7 7 0 100 14 7 7 0 000-14zm0 3a4 4 0 110 8 4 4 0 010-8zM10 2h4l1 4H9z',
  offhand: 'M12 2l8 3v6c0 6-4 9-8 11-4-2-8-5-8-11V5z',
  axe: 'M10 2h2v20h-2zM12 3c5 0 8 3 8 7s-3 6-8 6z',
  sword: 'M11 2h2l1 14h-4zM7 16h10v2H7zM11 18h2v4h-2z',
  dagger: 'M12 2l2 11h-4zM8 13h8v2H8zM11 15h2v6h-2z',
  bow: 'M6 2c8 3 8 17 0 20M6 2v20M4 12h16l-3-2m3 2l-3 2',
  staff: 'M11 6h2v16h-2zM12 1a3 3 0 100 6 3 3 0 000-6z',
  wand: 'M11 8h2v14h-2zM12 2l3 3-3 3-3-3z',
};
export function icon(it) {
  const k = it.slot === 'weapon' ? it.kind : it.slot;
  const stroke = ['amulet', 'bow'].includes(k);
  return `<svg viewBox="0 0 24 24"><path d="${ICON[k] || ICON.ring}" fill="${stroke ? 'none' : 'currentColor'}" stroke="currentColor" stroke-width="${stroke ? 1.6 : .4}" fill-rule="evenodd"/></svg>`;
}
const MON = {
  skull: '<path d="M50 12c-22 0-34 15-34 33 0 12 6 20 12 24v14h44V69c6-4 12-12 12-24 0-18-12-33-34-33z" fill="#2b241c"/><path d="M33 44a8 9 0 1016 0 8 9 0 10-16 0zM51 44a8 9 0 1016 0 8 9 0 10-16 0zM46 60l4-8 4 8z" fill="#000"/><path d="M36 74v9M44 74v9M52 74v9M60 74v9" stroke="#000" stroke-width="2"/>',
  horn: '<path d="M18 10c4 18 10 26 20 28M82 10c-4 18-10 26-20 28" stroke="#3a2a1c" stroke-width="7" fill="none"/><path d="M50 26c-17 0-27 13-27 30 0 18 12 34 27 34s27-16 27-34c0-17-10-30-27-30z" fill="#2b1a14"/><path d="M34 52l12 4-10 3zM66 52l-12 4 10 3z" fill="#b3271a"/><path d="M40 74q10 6 20 0" stroke="#000" stroke-width="3" fill="none"/>',
  hood: '<path d="M50 8C26 8 16 34 14 92h72C84 34 74 8 50 8z" fill="#221b15"/><path d="M50 30c-12 0-18 12-18 26 0 10 8 20 18 20s18-10 18-20c0-14-6-26-18-26z" fill="#000"/><circle cx="43" cy="52" r="2.5" fill="#c46a1e"/><circle cx="57" cy="52" r="2.5" fill="#c46a1e"/>',
  ghoul: '<path d="M50 14c-18 0-28 14-28 30 0 10 4 16 6 22l-4 24h52l-4-24c2-6 6-12 6-22 0-16-10-30-28-30z" fill="#2a2a1c"/><path d="M36 42l10 4-10 3zM64 42l-10 4 10 3z" fill="#9a9a3a"/><path d="M38 66h24l-4 8h-16z" fill="#000"/><path d="M41 66v5M47 66v6M53 66v6M59 66v5" stroke="#6a624a" stroke-width="2"/>',
  rat: '<path d="M14 70c4-24 22-40 44-40 14 0 24 8 28 20l8 6-8 4c-4 10-14 14-28 14H14z" fill="#2a221b"/><circle cx="72" cy="50" r="3" fill="#b3271a"/><path d="M50 32c-2-10 4-16 10-12" stroke="#2a221b" stroke-width="6" fill="none"/><path d="M14 70c-8 4-10 12-2 16" stroke="#3a2a22" stroke-width="3" fill="none"/>',
  imp: '<path d="M30 20l8 18M70 20l-8 18" stroke="#3a1d14" stroke-width="5"/><path d="M50 32c-14 0-22 10-22 24 0 16 10 30 22 30s22-14 22-30c0-14-8-24-22-24z" fill="#3a1d14"/><circle cx="42" cy="54" r="3.5" fill="#ffb02e"/><circle cx="58" cy="54" r="3.5" fill="#ffb02e"/><path d="M42 72l4-4 4 4 4-4 4 4" stroke="#000" stroke-width="2" fill="none"/>',
};
export const monsterArt = g => `<div class="portrait monster"><svg viewBox="0 0 100 100"><rect width="100" height="100" fill="url(#mg)"/><defs><radialGradient id="mg" cx=".5" cy=".4"><stop offset="0" stop-color="#2a1610"/><stop offset="1" stop-color="#050302"/></radialGradient></defs>${MON[g] || MON.skull}</svg></div>`;

export function slotBox(it, { action = '', label = '', price = false } = {}) {
  if (!it) return `<div class="slot" ${action}>${label}</div>`;
  return `<div class="slot r-${it.rarity} ${price ? 'price' : ''}" data-price="${it.price ?? ''}" data-tip="${it.id}" ${action}>${icon(it)}<span class="lv">${it.lvl}</span></div>`;
}

export function itemTip(it, cmp) {
  const lines = [`<div class="n r-${it.rarity}">${it.name}</div><div class="muted">${rarName(it.rarity)} · ${SLOTS[it.slot]} · Stufe ${it.lvl}</div>`];
  if (it.dmg) lines.push(`Schaden: ${it.dmg[0]}–${it.dmg[1]}`);
  if (it.armor) lines.push(`Rüstung: ${it.armor}`);
  for (const [k, v] of Object.entries(it.mods)) lines.push(`<span class="m">+${v} ${k === 'armor' ? 'Rüstung' : k === 'dmg' ? 'Schaden' : ATTRS[k]}</span>`);
  lines.push(`<span class="muted">Wert: ${it.price ?? it.value} Gold</span>`);
  if (cmp && cmp !== it) {
    const sc = x => (x.dmg ? (x.dmg[0] + x.dmg[1]) : 0) + (x.armor || 0) + Object.values(x.mods).reduce((a, b) => a + b, 0) * 1.5;
    const d = Math.round(sc(it) - sc(cmp));
    lines.push(`<span class="cmp ${d >= 0 ? 'up' : 'down'}">${d >= 0 ? '▲ besser' : '▼ schlechter'} als ${cmp.name}</span>`);
  }
  return lines[0] + lines.slice(1).join('<br>');
}

export function hud() {
  return `<header class="hud">
    <div class="hud-row"><span class="cinzel ttl">Aschenkrone</span>
      <span class="res"><span>Gold <b>${S.gold}</b></span><span>Stufe <b>${S.lvl}</b></span><span>Ehre <b>${S.honor}</b></span></span></div>
    <div class="hud-row bars">
      <div><small>EP ${S.xp}/${xpNeed(S.lvl)}</small><div class="bar xp"><i style="width:${pct(S.xp, xpNeed(S.lvl))}%"></i></div></div>
      <div><small>Glut ${S.glut}/${CFG.maxGlut}</small><div class="bar glut"><i style="width:${pct(S.glut, CFG.maxGlut)}%"></i></div></div>
    </div></header>`;
}

export function navBar(view) {
  const tabs = [['char', 'Held'], ['quests', 'Aufträge'], ['crypt', 'Krypta'], ['shop', 'Schmied'], ['arena', 'Grube']];
  const badge = { char: S.points + talentPoints() > 0, crypt: Date.now() >= S.crypt.cd };
  const on = view === 'talents' ? 'char' : view;
  return `<nav class="tabs">${tabs.map(([k, n]) => `<a class="${on === k ? 'on' : ''} ${badge[k] ? 'badge' : ''}" data-action="go" data-v="${k}">${n}</a>`).join('')}</nav>`;
}

export function viewCreate(sel) {
  return `<div class="create"><h1>Aschenkrone</h1><div class="sub">Die Glocke hat geschlagen. Die Toten stehen auf.</div>
  <div class="classes">${Object.entries(CLASSES).map(([k, c]) =>
    `<div class="cls ${sel === k ? 'on' : ''}" data-action="pick" data-c="${k}"><img class="portrait" src="${P(k)}" alt=""><div class="cinzel">${c.name}</div></div>`).join('')}</div>
  ${sel ? `<p class="cdesc"><b class="cinzel">${CLASSES[sel].name}</b> – ${CLASSES[sel].desc} <span class="muted">(${ATTRS[CLASSES[sel].main]})</span></p>
  <div class="cname"><input id="nm" maxlength="16" placeholder="Name des Verdammten"><button class="red" data-action="create">Erwachen</button></div>` : '<p class="sub">Wähle dein Schicksal.</p>'}</div>`;
}

const effLine = e => Object.entries(e).map(([k, v]) => `${EFFECT_NAMES[k]} ${k === 'first' ? '' : '+' + Math.round(v * 100) + '%'}`).join(', ');

export function viewChar() {
  const st = stats(), c = CLASSES[S.cls], rk = rank(), tp = talentPoints();
  const eq = ['helm', 'amulet', 'chest', 'ring1', 'weapon', 'gloves', 'belt', 'ring2', 'offhand', 'boots'];
  const lbl = { ring1: 'Ring', ring2: 'Ring' };
  return `<div class="char">
    <section class="frame head">
      <img class="portrait fr-${rk.frame}" src="${P(S.cls)}" alt="">
      <div class="attrs"><div class="who cinzel">${S.name}<small>${rk.title} · ${c.name} · Stufe ${S.lvl}</small></div>
        ${Object.entries(ATTRS).map(([k, n]) => `<div class="stat"><span>${n}${k === c.main ? ' ✦' : ''}</span><span><b>${st[k]}</b>${S.points ? ` <button data-action="attr" data-k="${k}">+</button>` : ''}</span></div>`).join('')}
        <div class="pts">${S.points ? `<b>${S.points}</b> Attributpunkte` : ''}<button class="tiny ${tp ? 'red' : ''}" data-action="go" data-v="talents">Talente${tp ? ` (${tp})` : ''}</button></div>
      </div>
      <div class="derived"><span>Leben <b>${st.hp}</b></span><span>Schaden <b>${st.dmg[0]}–${st.dmg[1]}</b></span><span>Rüstung <b>${st.armor}</b></span><span>Trophäen <b>${S.trophies.length}</b></span></div>
    </section>
    <section class="frame"><div class="equip">${eq.map(s => slotBox(S.equip[s], { action: `data-action="unequip" data-s="${s}"`, label: lbl[s] || SLOTS[s] })).join('')}</div></section>
    <section class="frame grow"><h2>Beutel <small class="muted">${S.bag.length}/20</small><button class="tiny" data-action="wipe">Neu beginnen</button></h2>
      <div class="bag">${Array.from({ length: 20 }, (_, i) => S.bag[i] ? slotBox(S.bag[i], { action: `data-action="equip" data-id="${S.bag[i].id}"` }) : '<div class="slot"></div>').join('')}</div></section>
  </div>`;
}

export function viewTalents() {
  const tp = talentPoints(), rc = respecCost();
  return `<div class="col"><section class="frame"><h2>Talente – ${CLASSES[S.cls].name} <small class="muted">${tp} Punkte</small>
      <button class="tiny" data-action="respec" ${S.gold < rc ? 'disabled' : ''}>Läutern ${rc ? rc + 'g' : '(gratis)'}</button></h2>
      <p class="muted quote">Ein Punkt je Stufe. Läutern setzt Attribute und Talente zurück – das erste Mal gratis, danach teuer.</p></section>
    <div class="tree">${TALENTS[S.cls].map((br, bi) => `<section class="frame branch"><h3 class="cinzel">${br.name}</h3>
      ${br.nodes.map((_, ti) => { const t = talentState(S.cls, bi, ti);
        return `<div class="tal ${t.r ? 'has' : ''} ${t.locked ? 'locked' : ''} ${t.can ? 'can' : ''}" data-action="learn" data-b="${bi}" data-t="${ti}">
          <div class="tn">${t.node.name}</div><div class="tr">${t.locked && S.lvl < t.needLvl ? `ab Stufe ${t.needLvl}` : `${t.r}/${t.node.max}`}</div>
          <div class="td">${t.node.desc}</div>
          <div class="te">${effLine(t.node.eff)}${t.node.max > 1 ? ' je Rang' : ''}</div></div>`; }).join('<div class="link"></div>')}
    </section>`).join('')}</div></div>`;
}

export function viewCrypts() {
  const d = DIFFICULTIES[S.crypt.diff], cd = Math.max(0, Math.ceil((S.crypt.cd - Date.now()) / 1000));
  return `<div class="col"><section class="frame"><h2>Die Krypten <small class="muted">${d.name}</small>
      <span class="tiny-txt">${cd ? `Erholung ${fmtT(cd)}` : 'Bereit'}</span></h2>
      <p class="muted quote">5 Ebenen, am Ende ein Boss. Jeder erste Bosssieg bringt eine dauerhafte Trophäe. Alle Krypten bezwungen: nächste Schwierigkeit.</p></section>
    ${CRYPTS.map(c => { const f = cryptFloor(c), open = cryptOpen(c), done = f >= 5;
      const troph = S.trophies.some(t => t.key === c.id + ':' + S.crypt.diff);
      return `<section class="frame crypt ${!open ? 'locked' : ''} ${done ? 'done' : ''}" ${open && !done && !cd ? `data-action="crypt" data-id="${c.id}"` : ''}>
        ${monsterArt(f === 4 || done ? c.boss.glyph : c.glyph)}
        <div class="qtxt"><h3 class="cinzel">${c.name}</h3>
          <p>${!open ? `Versiegelt bis Stufe ${c.lvl + d.lvlAdd - 2}` : done ? `${c.boss.name} ist gefallen.` : f === 4 ? `<span class="down">Boss: ${c.boss.name}</span>` : `Ebene ${f + 1}: ${c.floors[f]} (Stufe ${cryptLvl(c, f)})`}</p>
          <div class="floors">${[0, 1, 2, 3, 4].map(i => `<i class="${i < f ? 'on' : ''} ${i === 4 ? 'boss' : ''}"></i>`).join('')}</div>
          <div class="muted tiny-txt">Trophäe: ${effLine(c.trophy)} ${troph ? '✓' : ''}</div></div></section>`; }).join('')}</div>`;
}

export function viewQuests() {
  if (S.active) {
    const left = Math.ceil((S.active.end - Date.now()) / 1000), q = S.active.q;
    return `<div class="col"><section class="frame waiting">${monsterArt(q.monster.glyph)}<h2>${q.title}</h2><p class="muted"><i>Du ziehst ${q.place} umher…</i></p>
      ${left > 0 ? `<div class="big" id="cd">${fmtT(left)}</div><button data-action="rush" ${S.gold < 1 ? 'disabled' : ''}>Eilen (1 Gold)</button>`
                 : `<button class="red" data-action="resolve">Zum Kampf</button>`}</section>
      <section class="frame grow journal"><h2>Tagebuch</h2>${S.journal.slice(0, 6).map(j => `<div>${j.t}</div>`).join('')}</section></div>`;
  }
  return `<div class="col">${S.quests.map(q => `<section class="frame quest" data-action="quest" data-id="${q.id}" ${S.glut < q.glut ? 'aria-disabled="true"' : ''}>
    ${monsterArt(q.monster.glyph)}
    <div class="qtxt"><h3 class="cinzel">${q.title}</h3>
    <p>${q.place[0].toUpperCase() + q.place.slice(1)}. ${q.diff > 1.1 ? '<span class="down">Gefährlich.</span>' : q.diff < 0.9 ? 'Leichte Beute.' : ''}</p>
    <div class="rw"><span><b>${q.gold}</b> Gold</span><span><b>${q.xp}</b> EP</span><span>${fmtT(q.sec)}</span><span>${q.glut} Glut</span></div></div>
  </section>`).join('')}</div>`;
}

export function viewShop() {
  const left = Math.max(0, Math.ceil((S.shopTs + CFG.shopRefreshSec * 1000 - Date.now()) / 1000));
  return `<div class="col"><section class="frame"><h2>Schmied Halvar <button class="tiny" data-action="reroll" ${S.gold < 5 ? 'disabled' : ''}>Neue Ware 5g</button></h2>
    <p class="muted quote"><i>„Der Stahl ist alt, aber er schneidet noch.“</i> · neu in ${fmtT(left)}</p>
    <div class="bag shop">${S.shop.map(it => slotBox(it, { price: true, action: `data-action="buy" data-id="${it.id}"` })).join('') || '<span class="muted">Ausverkauft.</span>'}</div></section>
    <section class="frame grow"><h2>Verkaufen <small class="muted">${S.bag.length}/20</small></h2>
    <div class="bag">${Array.from({ length: 20 }, (_, i) => S.bag[i] ? slotBox(S.bag[i], { action: `data-action="sell" data-id="${S.bag[i].id}"` }) : '<div class="slot"></div>').join('')}</div></section></div>`;
}

export function viewArena(rival) {
  const cd = Math.max(0, Math.ceil((S.arenaTs - Date.now()) / 1000));
  return `<div class="col"><section class="frame arena"><img class="portrait" src="${P(rival.cls)}" alt="">
    <h2>${rival.name}<br><small class="muted">${CLASSES[rival.cls].name} · Stufe ${rival.lvl}</small></h2>
    <p><i>Im Sand liegen die Zähne der Verlierer.</i></p>
    <p class="muted">Sieg: +${rival.lvl * 3} Gold, +10 Ehre · Niederlage: −5 Ehre</p>
    <div class="btns"><button class="red" data-action="arena" ${cd ? 'disabled' : ''}>${cd ? `Erschöpft ${fmtT(cd)}` : 'Herausfordern'}</button>
    <button data-action="rival">Anderer Gegner</button></div></section></div>`;
}

export function viewFight(F) {
  const side = (f, hp, max, cls) => `<div class="fighter ${cls}">${f.cls ? `<img class="portrait" src="${P(f.cls)}" alt="">` : monsterArt(f.glyph)}
    <div class="nm">${f.name}</div><div class="bar"><i style="width:${pct(hp, max)}%"></i></div><div class="hp">${Math.max(0, hp)} / ${max}</div></div>`;
  const shown = F.log.slice(0, F.step);
  const last = shown[shown.length - 1] || {};
  const hpA = last.hpA ?? F.hpA, hpB = last.hpB ?? F.hpB;
  const done = F.step >= F.log.length;
  return `<div class="frame fightwrap"><div class="fight">
    ${side(F.A, hpA, F.hpA, last.who === 'b' ? 'hit' : '')}
    <div><div class="log" id="log">${shown.map(l => `<div class="${l.who} ${l.crit ? 'crit' : ''}">${l.t}</div>`).join('')}</div>
      ${done ? `<div class="result ${F.winner === 'a' ? 'win' : 'lose'}">${F.winner === 'a' ? 'Sieg' : 'Du bist gefallen'}</div>
        <div class="loot-drop">${F.reward || ''}</div><div style="text-align:center"><button class="red" data-action="go" data-v="${F.back}">Weiter</button></div>`
        : `<div style="text-align:center;margin-top:8px"><button data-action="skip">Überspringen</button></div>`}</div>
    ${side(F.B, hpB, F.hpB, last.who === 'a' ? 'hit' : '')}
  </div></div>`;
}
