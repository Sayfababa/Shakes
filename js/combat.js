// Reine Kampfsimulation, kein DOM.
// Kämpfer: { name, cls?, str,dex,int,con,lck, armor, dmg:[a,b], hp, main, lvl }
import { CFG } from './data.js';
import { roll, chance } from './rng.js';

const MAX_ROUNDS = 40;

export function fight(A, B) {
  const a = { ...A, cur: A.hp, side: 'a' }, b = { ...B, cur: B.hp, side: 'b' };
  const log = [];
  let first = a.cls === 'huntress' || (b.cls !== 'huntress' && a.dex + roll(0, 10) >= b.dex + roll(0, 10)) ? a : b;
  let atk = first, def = first === a ? b : a;
  for (let r = 0; r < MAX_ROUNDS && a.cur > 0 && b.cur > 0; r++) {
    strike(atk, def, log);
    if (atk.cls === 'barbarian' && def.cur > 0 && atk.cur < atk.hp / 2 && chance(0.3)) { log.push({ who: atk.side, t: `${atk.name} rast vor Wut!` }); strike(atk, def, log); }
    if (def.bleed && def.cur > 0) { def.cur -= def.bleed; log.push({ who: atk.side, t: `${def.name} blutet (${def.bleed}).`, hpA: a.cur, hpB: b.cur }); }
    [atk, def] = [def, atk];
  }
  const winner = a.cur > 0 && (b.cur <= 0 || a.cur / a.hp >= b.cur / b.hp) ? 'a' : 'b';
  return { winner, log, hpA: a.hp, hpB: b.hp };

  function strike(x, y, log) {
    const evade = Math.min(0.35, y.dex / (y.dex + x.dex * 3 + 40));
    if (chance(evade)) return log.push({ who: x.side, t: `${y.name} weicht aus.`, hpA: a.cur, hpB: b.cur });
    if (y.cls === 'paladin' && chance(0.25)) return log.push({ who: x.side, t: `${y.name} blockt mit dem Schild.`, hpA: a.cur, hpB: b.cur });
    let d = roll(x.dmg[0], x.dmg[1]) * (1 + x[x.main] / 10);
    const armorRed = Math.min(0.5, y.armor / (y.armor + 20 + x.lvl * 8)) * (x.cls === 'sorceress' ? 0.5 : 1);
    d *= 1 - armorRed;
    const crit = chance(Math.min(0.5, CFG.critBase + x.lck / (x.lck + 100 + y.lvl * 5) + (x.cls === 'assassin' ? 0.12 : 0)));
    if (crit) d *= 2;
    d = Math.max(1, Math.round(d));
    y.cur -= d;
    let t = `${x.name} trifft ${crit ? 'KRITISCH ' : ''}für ${d}.`;
    if (x.cls === 'witch') { const h = Math.round(d * 0.2); x.cur = Math.min(x.hp, x.cur + h); t += ` Entzieht ${h} Leben.`; }
    if (x.cls === 'assassin' && crit) { y.bleed = Math.max(y.bleed || 0, Math.round(d * 0.25)); }
    log.push({ who: x.side, t, crit, hpA: a.cur, hpB: b.cur });
  }
}
