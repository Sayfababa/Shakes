// Händler-Questketten. DOM-frei. Fortschritt zählt nur, solange die Quest aktiv ist.
import { QUESTS, TRADERS, MATS, LOCATIONS, CRYPTS, SLOTS, RARITIES, CLASSES, GIVERS, NPCS, DIFFICULTIES } from './data.js';
import { S, setQuestMatCheck, loyalty, removeFromBag, addToBag, gainXp, cryptFloor, journal } from './state.js';
const giverName = id => (TRADERS[id] || NPCS[id]).name;
import { makeItem } from './loot.js';

const rarIdx = id => RARITIES.findIndex(r => r.id === id);
export const current = tid => QUESTS[tid][S.traders[tid].q] || null;           // null = Kette beendet
export const available = tid => { const q = current(tid); return q && S.lvl >= q.lvl; };

// Ereignisse aus Kampf/Spiel: {type:'kill', mob, loc} | {type:'arena'} | {type:'boss', crypt} | {type:'omen'} | {type:'champ'}
export function event(ev) {
  for (const tid of GIVERS) {
    if (!available(tid)) continue;
    const q = current(tid), pr = S.traders[tid].prog;
    q.obj.forEach((o, i) => {
      const hit = (o.kill && ev.type === 'kill' && ev.mob === o.kill) || (o.at && ev.type === 'kill' && ev.loc === o.at)
        || (o.arena && ev.type === 'arena') || (o.boss && ev.type === 'boss' && ev.crypt === o.boss)
        || (o.omen && ev.type === 'omen') || (o.champ && ev.type === 'champ' && ev.tid === tid);
      if (hit) pr[i] = Math.min(need(o), (pr[i] || 0) + 1);
    });
  }
}

const need = o => o.n || o.arena || o.honor || o.omen || o.shards || 1;
const giveItem = o => S.bag.filter(it => it.slot === o.give && rarIdx(it.rarity) >= o.rar).sort((a, b) => a.value - b.value)[0];

export function objectives(tid) {
  const q = current(tid); if (!q) return [];
  const pr = S.traders[tid].prog;
  return q.obj.map((o, i) => {
    let label, cur, n = need(o);
    if (o.kill) { label = `Töte: ${o.kill}`; cur = pr[i] || 0; }
    else if (o.at) { label = `Siege: ${LOCATIONS.find(l => l.id === o.at).name}`; cur = pr[i] || 0; }
    else if (o.mat) { label = `Bring: ${MATS[o.mat]}`; cur = Math.min(n, S.mats[o.mat] || 0); }
    else if (o.give) { label = `Bring: ${SLOTS[o.give]} (${RARITIES[o.rar].name} oder besser)`; cur = giveItem(o) ? 1 : 0; }
    else if (o.floor) { const c = CRYPTS.find(c => c.id === o.floor); label = `${c.name}: Ebene ${o.n}`; cur = Math.min(n, cryptFloor(c)); }
    // Boss zählt auch, wenn er schon vor der Quest besiegt wurde (sonst wäre die Quest unlösbar – Krypten bleiben geräumt)
    else if (o.boss) { const c = CRYPTS.find(c => c.id === o.boss); label = `Bezwinge: ${c.boss.name}`; cur = (pr[i] || S.trophies.some(t => t.key.startsWith(c.id + ':'))) ? 1 : 0; }
    else if (o.arena) { label = 'Siege in der Grube'; cur = pr[i] || 0; }
    else if (o.bossd) { const c = CRYPTS.find(c => c.id === o.bossd); label = `Bezwinge: ${c.boss.name} (${DIFFICULTIES[o.d].name})`; cur = S.trophies.some(t => t.key === `${c.id}:${o.d}`) ? 1 : 0; n = 1; }
    else if (o.honor) { label = 'Ehre in der Grube'; cur = Math.min(o.honor, S.honor); }
    else if (o.clear) { const c = CRYPTS.find(c => c.id === o.clear); label = `Räume: ${c.name}`; cur = cryptFloor(c) >= 5 ? 1 : 0; n = 1; }
    else if (o.omen) { label = 'Erfülle Omen des Propheten'; cur = pr[i] || 0; }
    else if (o.shards) { label = 'Glockensplitter'; cur = Math.min(o.shards, S.shards.length); }
    else if (o.champ) { const q = current(tid); label = `Besiege: ${q.champ.name}`; cur = pr[i] || 0; }
    else if (o.lvl) { label = `Erreiche Stufe ${o.lvl}`; cur = S.lvl >= o.lvl ? 1 : 0; n = 1; }
    return { label, cur, n, done: cur >= n };
  });
}
export const canComplete = tid => available(tid) && objectives(tid).every(o => o.done);

// Abgeben: verbraucht Material/Items, gibt Belohnung. Rückgabe: Text-Zeilen oder null.
export function complete(tid, choiceId) {
  if (!canComplete(tid)) return null;
  if (current(tid).choice && !choiceId) return null;
  const q = current(tid), st = S.traders[tid], r = q.rew, before = TRADERS[tid] ? loyalty(tid) : 0;
  for (const o of q.obj) {
    if (o.mat) S.mats[o.mat] -= o.n;
    if (o.give) removeFromBag(giveItem(o).id);
  }
  S.gold += r.gold; st.rep += r.rep; const up = gainXp(r.xp);
  let item = null;
  if (r.item) { item = makeItem(S.lvl, { slot: r.item.slot, cls: CLASSES[S.cls], minRarity: r.item.rar, luck: 50 }); if (!addToBag(item)) { S.gold += item.value * 2; item = { ...item, sold: true }; } }
  const perks = [];
  if (r.perk) perks.push(r.perk);
  let choice = null;
  if (q.choice) { choice = q.choice.find(c => c.id === choiceId); perks.push(choice.perk); S.title = choice.title; }
  if (r.title) S.title = r.title;
  for (const p of perks) S.trophies.push({ key: 'perk:' + p.name, name: p.name, diff: 'Segen', eff: p.eff });
  st.q++; st.prog = []; st.shop = (st.shop || []).filter(x => x.lock);
  journal(`${giverName(tid)}: „${q.title}“ erledigt.`);
  return { q, gold: r.gold, xp: r.xp, rep: r.rep, item, up, perks, choice, loyaltyUp: TRADERS[tid] ? loyalty(tid) > before : false };
}

// Dienste sollen warnen, wenn sie Material verbrauchen, das ein offener Auftrag braucht
setQuestMatCheck(k => GIVERS.some(t => available(t) && current(t).obj.some(o => o.mat === k)));
