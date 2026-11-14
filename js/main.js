import { CLASSES, CFG, ATTRS } from './data.js';
import * as G from './state.js';
import { fight } from './combat.js';
import { makeItem } from './loot.js';
import { pick, roll, chance } from './rng.js';
import * as UI from './ui.js';

const app = document.getElementById('app'), tip = document.getElementById('tip');
let view = 'char', pickCls = null, F = null, rival = null, fightTimer = null;

function render() {
  const S = G.S;
  if (!S) { app.innerHTML = UI.viewCreate(pickCls); return; }
  G.tickGlut();
  let body;
  if (view === 'fight' && F) body = UI.viewFight(F);
  else if (view === 'quests') body = UI.viewQuests();
  else if (view === 'shop') { if (Date.now() > S.shopTs + CFG.shopRefreshSec * 1000) G.rollShop(); body = UI.viewShop(); }
  else if (view === 'arena') { rival ||= makeRival(); body = UI.viewArena(rival); }
  else body = UI.viewChar();
  app.innerHTML = UI.header(view === 'fight' ? F?.back : view) + body;
  const log = document.getElementById('log'); if (log) log.scrollTop = log.scrollHeight;
  G.save();
}

// Gegnerischer "Verdammter" für die Grube
function makeRival() {
  const S = G.S, cls = pick(Object.keys(CLASSES)), c = CLASSES[cls], lvl = Math.max(1, S.lvl + roll(-1, 1));
  const p = { name: pick(['Morgrim', 'Asha die Blasse', 'Kel Varn', 'Ysolde', 'Brann', 'Oswin der Stumme', 'Mireth', 'Draven']), cls, lvl,
    attrs: { str: 5, dex: 5, int: 5, con: 6, lck: 3 }, equip: {} };
  for (const k in p.attrs) p.attrs[k] += Math.round(lvl * (k === c.main ? 2.5 : 1.2));
  for (const s of ['weapon', 'chest', 'helm', 'boots']) p.equip[s] = makeItem(lvl, { slot: s, cls: c });
  return p;
}

function startFight(A, B, back, onEnd) {
  const r = fight(A, B);
  let hA = r.hpA, hB = r.hpB; // HP fortschreiben für Einträge ohne Werte
  for (const l of r.log) { l.hpA ??= hA; l.hpB ??= hB; hA = l.hpA; hB = l.hpB; }
  F = { A, B, ...r, step: 0, back };
  F.reward = onEnd(r.winner === 'a');
  view = 'fight'; G.save();
  clearInterval(fightTimer);
  fightTimer = setInterval(() => { F.step++; if (F.step >= F.log.length) clearInterval(fightTimer); render(); }, 420);
  render();
}

function lootLine(it) { return it ? `Beute: <span class="r-${it.rarity}">${it.name}</span>` : ''; }

const actions = {
  pick: d => { pickCls = d.c; render(); setTimeout(() => document.getElementById('nm')?.focus()); },
  create: () => { const n = document.getElementById('nm').value.trim() || 'Namenloser'; G.newChar(n, pickCls);
    G.journal(`${n} erwacht im Grab. Die Glocke schweigt noch.`); view = 'char'; render(); },
  wipe: () => { if (confirm('Charakter wirklich vernichten?')) { G.wipe(); pickCls = null; render(); } },
  go: d => { view = d.v; F = view === 'fight' ? F : null; clearInterval(fightTimer); render(); },
  attr: d => { const c = G.attrCost(d.k); if (G.S.gold >= c) { G.S.gold -= c; G.S.attrs[d.k]++; G.S.bought[d.k]++; } render(); },
  equip: d => { G.equip(d.id); hideTip(); render(); },
  unequip: d => { G.unequip(d.s); hideTip(); render(); },
  sell: d => { G.sell(d.id); hideTip(); render(); },
  buy: d => { const S = G.S, i = S.shop.findIndex(x => x.id === d.id), it = S.shop[i];
    if (it && S.gold >= it.price && S.bag.length < 20) { S.gold -= it.price; delete it.price; S.shop.splice(i, 1); S.bag.push(it); }
    hideTip(); render(); },
  reroll: () => { if (G.S.gold >= 5) { G.S.gold -= 5; G.rollShop(); } render(); },
  quest: d => { const S = G.S, q = S.quests.find(x => x.id === d.id); if (!q || S.glut < q.glut) return;
    S.glut -= q.glut; S.active = { q, end: Date.now() + q.sec * 1000 }; render(); },
  rush: () => { const S = G.S; if (S.gold >= 1) { S.gold -= 1; S.active.end = Date.now(); } render(); },
  resolve: () => {
    const S = G.S, q = S.active.q, m = G.makeMonster(S.lvl, q.diff, q.monster);
    startFight(G.stats(), m, 'quests', win => {
      S.active = null; G.rollQuests();
      if (!win) { S.deaths++; G.journal(`${m.name} ${q.place} hat mich zerrissen. Ich bin wieder erwacht.`); return 'Die Asche nimmt dich auf … und spuckt dich wieder aus.'; }
      S.wins++; S.gold += q.gold; const up = G.gainXp(q.xp);
      let it = null; if (chance(CFG.lootChance + G.stats().lck / 400)) { it = makeItem(S.lvl, { luck: G.stats().lck, cls: CLASSES[S.cls] }); if (!G.addToBag(it)) it = null; }
      G.journal(`${m.name} ${q.place} erschlagen.${it ? ' Fand ' + it.name + '.' : ''}`);
      return `+${q.gold} Gold · +${q.xp} EP${up ? ` · <b style="color:var(--gold)">Stufe ${S.lvl}!</b>` : ''}<br>${lootLine(it)}`;
    });
  },
  rival: () => { rival = makeRival(); render(); },
  arena: () => {
    const S = G.S; if (Date.now() < S.arenaTs) return;
    const R = rival; rival = null; S.arenaTs = Date.now() + 60000;
    startFight(G.stats(), G.stats(R), 'arena', win => {
      if (win) { S.gold += R.lvl * 3; S.honor += 10; S.wins++; G.journal(`${R.name} in der Grube besiegt.`); return `+${R.lvl * 3} Gold · +10 Ehre`; }
      S.honor = Math.max(0, S.honor - 5); S.deaths++; return '−5 Ehre';
    });
  },
  skip: () => { F.step = F.log.length; clearInterval(fightTimer); render(); },
};

app.addEventListener('click', e => {
  const el = e.target.closest('[data-action]'); if (!el) return;
  actions[el.dataset.action]?.(el.dataset);
});
// Rechtsklick im Beutel = verkaufen
app.addEventListener('contextmenu', e => {
  const el = e.target.closest('[data-action="equip"]'); if (!el) return;
  e.preventDefault(); actions.sell(el.dataset);
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && document.getElementById('nm') && pickCls) actions.create(); });

// Tooltips
function findItem(id) {
  const S = G.S; if (!S) return null;
  return [...S.bag, ...S.shop, ...Object.values(S.equip).filter(Boolean), ...(rival ? Object.values(rival.equip) : [])].find(x => x.id === id);
}
function hideTip() { tip.hidden = true; }
app.addEventListener('mousemove', e => {
  const el = e.target.closest('[data-tip]'); if (!el) return hideTip();
  const it = findItem(el.dataset.tip); if (!it) return hideTip();
  const S = G.S, slot = it.slot === 'ring' ? 'ring1' : it.slot;
  const inEquip = Object.values(S.equip).includes(it);
  tip.innerHTML = UI.itemTip(it, inEquip ? null : S.equip[slot]);
  tip.hidden = false;
  const x = Math.min(e.clientX + 16, innerWidth - tip.offsetWidth - 8), y = Math.min(e.clientY + 16, innerHeight - tip.offsetHeight - 8);
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
});
app.addEventListener('mouseleave', hideTip);

// Countdown-Takt (nur Warten neu zeichnen)
setInterval(() => { if (G.S && (view === 'quests' && G.S.active || view === 'arena' && Date.now() < G.S.arenaTs + 1000)) render(); }, 1000);

G.load(); render();
