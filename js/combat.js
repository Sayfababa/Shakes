// Reine Kampfsimulation, kein DOM.
// Kämpfer: { name, cls?, str,dex,int,con,lck, armor, dmg:[a,b], hp, main, lvl,
//            crit, evade, block, leech, bleed, rage, pen, regen, thorns, execute, first }  (Effekte optional, 0..1)
import { CFG } from './data.js';
import { roll, chance } from './rng.js';

const MAX_ROUNDS = 50;

export function fight(A, B) {
  const a = { ...A, cur: A.hp, side: 'a' }, b = { ...B, cur: B.hp, side: 'b' };
  const log = [];
  const say = (who, t, extra = {}) => log.push({ who, t, hpA: Math.max(0, Math.round(a.cur)), hpB: Math.max(0, Math.round(b.cur)), ...extra });
  const ini = f => (f.first ? 1000 : 0) + f.dex + roll(0, 10);
  let atk = ini(a) >= ini(b) ? a : b, def = atk === a ? b : a;

  for (let r = 0; r < MAX_ROUNDS && a.cur > 0 && b.cur > 0; r++) {
    if (atk.regen && atk.cur < atk.hp) { const h = Math.round(atk.hp * atk.regen); atk.cur = Math.min(atk.hp, atk.cur + h); say(atk.side, `${atk.name} regeneriert ${h}.`); }
    strike(atk, def);
    if (atk.rage && def.cur > 0 && atk.cur < atk.hp / 2 && chance(atk.rage)) { say(atk.side, `${atk.name} rast vor Wut!`); strike(atk, def); }
    if (def.bleedDmg && def.cur > 0) { def.cur -= def.bleedDmg; say(atk.side, `${def.name} blutet (${def.bleedDmg}).`); }
    [atk, def] = [def, atk];
  }
  const winner = a.cur > 0 && (b.cur <= 0 || a.cur / a.hp >= b.cur / b.hp) ? 'a' : 'b';
  return { winner, log, hpA: A.hp, hpB: B.hp };

  function strike(x, y) {
    const evade = Math.min(0.5, y.dex / (y.dex + x.dex * 3 + 40) + (y.evade || 0));
    if (chance(evade)) return say(x.side, `${y.name} weicht aus.`);
    if (y.block && chance(Math.min(0.5, y.block))) return say(x.side, `${y.name} blockt.`);
    let d = roll(x.dmg[0], x.dmg[1]) * (1 + x[x.main] / 10);
    d *= 1 - Math.min(0.6, y.armor / (y.armor + 20 + x.lvl * 8)) * (1 - Math.min(0.9, x.pen || 0));
    if (x.execute && y.cur < y.hp * 0.3) d *= 1 + x.execute;
    const crit = chance(Math.min(0.6, CFG.critBase + x.lck / (x.lck + 100 + y.lvl * 5) + (x.crit || 0)));
    if (crit) d *= 2;
    d = Math.max(1, Math.round(d));
    y.cur -= d;
    let t = `${x.name} trifft ${crit ? 'KRITISCH ' : ''}für ${d}.`;
    if (x.leech) { const h = Math.round(d * x.leech); x.cur = Math.min(x.hp, x.cur + h); if (h) t += ` +${h} Leben.`; }
    if (crit && x.bleed) y.bleedDmg = Math.max(y.bleedDmg || 0, Math.round(d * x.bleed));
    if (y.thorns && y.cur > 0) { const r = Math.round(d * y.thorns); x.cur -= r; if (r) t += ` Dornen: ${r}.`; }
    say(x.side, t, { crit });
  }
}
