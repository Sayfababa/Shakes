// Reine Kampfsimulation, kein DOM.
// Kämpfer: { name, cls?, str,dex,int,con,lck, armor, dmg:[a,b], hp, main, lvl,
//            crit, evade, block, leech, bleed, rage, pen, regen, thorns, execute, first,
//            poison (Gift je Treffer, stapelt), toll (jeder 3. Treffer betäubt) }  (Effekte optional, 0..1)
import { CFG, ELEMENTS } from './data.js';
import { roll, chance, rand } from './rng.js';

const MAX_ROUNDS = 50;
// Anteil ausgewichener Angriffe auf Dauer bei Ausweichchance p mit Serienbremse (höchstens k in Folge):
// Kette über die Serienlänge 0..k → (p + p² + … + p^k) / (1 + p + … + p^k). Für power(), damit die Schätzung die Regel kennt.
export function evadeShare(p, k = CFG.evadeStreak) { let num = 0, t = 1; for (let i = 1; i <= k; i++) { t *= p; num += t; } return num / (1 + num); }

// Schadensarten (Welle 2a, nach Diablo 2 / PoE): Rüstung wirkt nur gegen den PHYSISCHEN Anteil, Feuer und Eis gehen an ihr
// vorbei – dagegen hilft nur Elementar-Resi (Deckel CFG.resCap 75 %). Phys.-Resi ist „Schaden reduziert um“ (D2) mit eigenem,
// kleinerem Deckel CFG.resCapPhys 50 %, weil sie mit der Rüstung stapelt.
// resPen: Malus vor dem Deckel, nur Elementar (Abgrund-Tiefe, DESCENT.resMalus – wie D2 Hölle / PoE-Akte).
// pen: Elementar-Durchdringung des Angreifers (PoE): zieht NACH dem Deckel feste Punkte ab, darf unter 0 gehen (mehr Schaden).
// Untergrenze −100 % (doppelter Schaden).
export const resCapOf = k => k === 'phys' ? CFG.resCapPhys : CFG.resCap;
export const resOf = (f, k, pen = 0) => Math.max(-1, Math.min(resCapOf(k), (f.res?.[k] || 0) - (k === 'elem' ? f.resPen || 0 : 0)) - (k === 'elem' ? pen : 0));
// Rüstungs-Minderung (nur physisch): Rüstung des Ziels gegen die Stufe des Angreifers, Durchbohren zieht ab
// Weicher Deckel (2026-11-22): bis zum Knie (CFG.softKnee × Grenze) zählt jeder Punkt voll, darüber immer weniger – nie gar nichts.
// Vorher harter Deckel: eine Assassine stand auf Stufe 8 an der Grenze, danach war jeder Ausweich-/Krit-Bonus wertlos.
export const softCap = (x, cap) => { const k = cap * CFG.softKnee; return x <= k ? x : k + (cap - k) * (1 - Math.exp(-(x - k) / (cap - k))); };
// Ausweichchance von y gegen einen Angreifer mit Geschick atkDex; Krit-Chance von x gegen Stufe defLvl (extra: Zauber-Krit hebt auch die Grenze).
// Kampf, power(), Gefahr-Anzeige und Werte-Ansicht rufen diese beiden – nie die Formel abtippen.
export const evadeChance = (y, atkDex) => softCap(Math.max(0, y.dex / (y.dex + atkDex * 3 + 40) + (y.evade || 0)), 0.5 + (y.evadeCap || 0));
export const critChance = (x, defLvl, extra = 0) => softCap(Math.max(0, CFG.critBase + x.lck / (x.lck + 100 + defLvl * 5) + (x.crit || 0) + extra), 0.6 + extra);
export const armorRed = (armor, atkLvl, pen = 0) => Math.min(0.6, armor / (armor + 20 + atkLvl * 8)) * (1 - Math.min(0.9, pen));
// Anteile eines Hiebs: mix = { fire, cold } (Rest physisch). Für Anzeige und power() dieselbe Regel wie im Kampf.
export const mixOf = mix => { const fire = mix?.fire || 0, cold = mix?.cold || 0; return { phys: Math.max(0, 1 - fire - cold), fire, cold }; };
// Schadensfaktor gegen y: el = Art eines Zaubers (fehlt bei Hieben → mix des Angreifers); arm = Rüstungs-Minderung,
// wirkt nur auf den physischen Anteil; pen = Elementar-Durchdringung des Angreifers
export function resMul(mix, y, el, arm = 0, pen = 0) {
  const ph = (1 - arm) * (1 - resOf(y, 'phys')), em = 1 - resOf(y, 'elem', pen);
  if (el) return ELEMENTS[el].res === 'phys' ? ph : em;
  const m = mixOf(mix); return m.phys * ph + (m.fire + m.cold) * em;
}

export function fight(A, B) {
  const a = { ...A, cur: Math.min(A.hp, A.cur0 ?? A.hp), side: 'a', turn: 0, buff: 1, shield: 0, ch: [] }, b = { ...B, cur: B.hp, side: 'b', turn: 0, buff: 1, shield: 0, ch: [] };
  const chg = f => (f.spells || []).map((x, i) => Math.min(1, Math.round((f.ch[i] || 0) / x.every * 100) / 100));
  const cast = [];
  for (const f of [a, b]) {
    if (f.ward) f.shield = Math.round(f.hp * f.ward);   // Knochenschild zu Beginn
    if (f.nohealSelf) f.noheal = Infinity;   // Pakt: dieser Kämpfer kann sich nie heilen
    (f.spells || []).forEach((x, i) => { if (x.m?.open) f.ch[i] = x.every; });   // Zauber-Weg „sofort zu Kampfbeginn“
    f.poisonLeech = Math.max(0, f.venom || 0, ...(f.spells || []).map(x => x.m?.poisonLeech || 0));   // Set „Kutte des Verseuchten“: dein Gift heilt dich
    f.belt = (f.belt || []).map(p => ({ ...p, used: false }));
  }
  const curA0 = Math.round(a.cur);   // Startleben (Abstieg: Leben läuft von Raum zu Raum mit)
  const log = [];
  let ev = {};   // was die Anzeige zusätzlich zeigen soll (Heilung, Dornen, Einzeltreffer) – wird mit der nächsten Zeile geschrieben
  const say = (who, t, extra = {}) => { log.push({ who, t, hpA: Math.max(0, Math.round(a.cur)), hpB: Math.max(0, Math.round(b.cur)), cA: chg(a), cB: chg(b), iB: intent(b, a), ...ev, ...extra }); ev = {}; };
  // Was der Gegner als Nächstes vorhat / was ihn ausmacht (Anzeige über seinem Bild)
  const intent = (f, o) => { if (f.cur <= 0 || o.cur <= 0) return null; if (f.stunned) return 'Betäubt';
    if (f.toll) { const n = 3 - ((f.hits || 0) % 3); return n === 1 ? 'Betäubung jetzt!' : `Betäubung in ${n}`; }
    if (f.execute && o.cur < o.hp * (0.3 + (f.execHp || 0))) return 'Schlachtet!'; if (f.ramp) return `Zorn +${Math.round((f.buff - 1 + f.ramp) * 100)} %`; if (f.rage > 0.2 && f.cur < f.hp / 2) return 'Rasend';
    if (f.noheal > 0 && (f.regen || f.leech)) return 'Gebannt'; if (f.regen) return `Heilt ${Math.round(f.regen * 100)} %/Zug`;
    if (f.poisonPct) return o.poisonDmg ? `Gift ${o.poisonDmg} je Zug, steigt` : 'Gift stapelt ohne Ende'; if (f.poison) return 'Gift je Treffer'; if (f.leech) return 'Saugt Leben'; return null; };
  const ini = f => (f.first ? 1000 : 0) + f.dex + roll(0, 10);
  let atk = ini(a) >= ini(b) ? a : b, def = atk === a ? b : a;
  for (const [x, y] of [[a, b], [b, a]]) for (const p of x.belt) if (p.rare) potion(x, y, p);   // seltene Tränke: wirken den ganzen Kampf

  for (let r = 0; r < MAX_ROUNDS && a.cur > 0 && b.cur > 0; r++) {
    for (const k of ['weakN', 'vulnN', 'noheal', 'stunImm', 'dazed', 'cureN']) if (atk[k] > 0) atk[k]--;   // Zustände laufen im eigenen Zug ab
    if (atk.rageN > 0) atk.rageN--;   // Berserkersud läuft ab (eigener Faktor, stört Zauber-Stärkung nicht)
    for (const p of atk.belt) if (!p.used && trig(atk, def, p.trig)) potion(atk, def, p);
    def.didHeal = false;
    // Zuflucht: einmal je Kampf, sobald es eng wird
    if (atk.secondWind && !atk.swUsed && atk.cur > 0 && atk.cur < atk.hp * 0.3 && !(atk.noheal > 0)) {
      atk.swUsed = true; const h = healSelf(atk, Math.round(atk.hp * atk.secondWind));
      if (h) say(atk.side, `${atk.name} schöpft Atem (+${h}).`, { heal: h, status: 'Zuflucht' }); }
    if (atk.regen && atk.cur < atk.hp && !(atk.noheal > 0)) { const h = Math.round(atk.hp * atk.regen * healMul(atk)); atk.cur = Math.min(atk.hp, atk.cur + h); atk.didHeal = true; say(atk.side, `${atk.name} regeneriert ${h}.`, { heal: h }); }
    if (atk.stunned) { atk.stunned = atk.stunned === true ? 0 : atk.stunned - 1; say(def.side, `${atk.name} ist betäubt und taumelt.`); [atk, def] = [def, atk]; continue; }
    atk.turn++; if (atk.ramp) atk.buff += atk.ramp;   // Zorn (Müllerin): jeder eigene Zug macht sie härter
    // Zauber laden pro eigenem Zug um 1 (+ Zaubertempo); der stärkste geladene wird gewirkt
    const sps = atk.spells || []; let sp = null;
    const inc = x => (1 + (atk.haste || 0)) * (x.m?.desperate && atk.cur < atk.hp * x.m.desperate ? 2 : 1);
    sps.forEach((x, i) => { atk.ch[i] = (atk.ch[i] || 0) + inc(x); if (atk.ch[i] >= x.every) sp = i; });
    // Held (Seite mit Klasse): Zauber nach Lage statt nach Rang; -1 = halten und hauen. Gehaltenes behält höchstens einen Zug Vorrat über voll.
    if (CFG.spellPick && atk.cls && sp !== null) { sp = pickSpell(atk, def, sps);
      sps.forEach((x, i) => { if (i !== sp) atk.ch[i] = Math.min(atk.ch[i], x.every + inc(x)); }); }
    if (sp !== null && sp >= 0) { atk.ch[sp] -= sps[sp].every; spell(atk, def, sps[sp]); } else strike(atk, def);
    if (atk.rage && def.cur > 0 && atk.cur < atk.hp / 2 && chance(atk.rage)) { say(atk.side, `${atk.name} rast vor Wut!`, { rage: true }); strike(atk, def); }
    if (def.bleedDmg && def.cur > 0) { def.cur -= def.bleedDmg; say(atk.side, `${def.name} blutet (${def.bleedDmg}).`, { tick: def.bleedDmg, tk: 'bleed' }); }
    if (def.poisonDmg && def.cur > 0) { def.cur -= def.poisonDmg;
      const h = atk.poisonLeech && !(atk.noheal > 0) ? Math.round(def.poisonDmg * atk.poisonLeech) : 0; if (h) atk.cur = Math.min(atk.hp, atk.cur + h);
      say(atk.side, `Gift zerfrisst ${def.name} (${def.poisonDmg}).${h ? ` +${h} Leben.` : ''}`, { tick: def.poisonDmg, tk: 'poison', heal: h || undefined }); }
    if (def.burn?.n > 0 && def.cur > 0) { def.cur -= def.burn.d; def.burn.n--; say(atk.side, `${def.name} brennt (${def.burn.d}).`, { tick: def.burn.d, tk: 'burn' }); }
    [atk, def] = [def, atk];
  }
  const winner = a.cur > 0 && (b.cur <= 0 || a.cur / a.hp >= b.cur / b.hp) ? 'a' : 'b';
  return { winner, log, hpA: A.hp, hpB: B.hp, left: Math.max(0, a.cur) / a.hp, curA0, endA: Math.max(0, Math.round(a.cur)), cast, used: a.belt.filter(p => p.used).map(p => p.id) };

  // Tränke (data.js POTIONS): Auslöser prüfen und wirken. Trinken kostet keinen Zug.
  function trig(x, y, t) {
    return t === 'start' ? x.turn === 0 : t === 'hp50' ? x.cur < x.hp * 0.5 : t === 'hp30' ? x.cur < x.hp * 0.3
      : t === 'dot' ? !!(x.poisonDmg || x.bleedDmg || x.burn?.n) : t === 'low' ? y.cur < y.hp * 0.5 : t === 'heal' ? !!y.didHeal : false;
  }
  function potion(x, y, p) {
    const f = p.fx, ex = {}; let t = `${x.name} trinkt ${p.name}`; p.used = true;
    if (f.heal) { const h = healSelf(x, Math.round(x.hp * f.heal)); t += x.noheal > 0 ? ' – die Heilung versagt.' : `: +${h} Leben.`; if (h) ev.heal = (ev.heal || 0) + h; }
    if (f.shield) { const h = Math.round(x.hp * f.shield); x.shield += h; t += `: Schild ${h}.`; ev.shield = h; }
    if (f.rage) { x.potRage = f.rage; x.rageN = f.n + 1; t += `: Schaden +${Math.round(f.rage * 100)} %.`; ev.buff = Math.round(f.rage * 100); }
    if (f.cure) { x.poisonDmg = 0; x.bleedDmg = 0; x.burn = null; x.cureN = f.cure + 1; t += ': gereinigt.'; ev.status = 'Gereinigt'; }
    if (f.stunImm) { x.stunImm = Math.max(x.stunImm || 0, f.stunImm + 1); t += ': unbeugsam.'; }
    if (f.noheal) { y.noheal = Math.max(y.noheal || 0, f.noheal + 1); t += `: ${y.name} kann nicht heilen.`; ev.status = 'Gebannt'; }
    for (const k of ['crit', 'critRes', 'evade', 'acc', 'block', 'pen', 'leech']) if (f[k]) x[k] = (x[k] || 0) + f[k];
    if (f.charge) (x.spells || []).forEach((s, i) => { x.ch[i] = Math.max(x.ch[i] || 0, s.every * f.charge); });
    say(x.side, t.endsWith('.') ? t : t + '.', { pot: p.id, potName: p.name, ...ex });
  }

  // Normaler Hieb ohne Zufall (Grundlage für Zauber)
  function base(x) { return (x.dmg[0] + x.dmg[1]) / 2 * (1 + x[x.main] / CFG.mainDiv) * x.buff * pb(x); }
  function pb(x) { return x.rageN > 0 ? 1 + x.potRage : 1; }

  // --- Zauber nach Lage (System B) – Schätzungen ohne Krit und ohne Ausweichen, mit Rüstung/Resi/Henker wie im Treffer ---
  // Rüstungs-Faktor eines Zaubers wie in spell(): physisch → Rüstung (minus Durchbohren), sonst ganz vorbei
  function spellRed(x, y, s) { return s.el && ELEMENTS[s.el].res !== 'phys' ? 1 : 1 - armorRed(y.armor, x.lvl, x.pen || 0) * (1 - Math.min(1, s.m?.pierce || 0)); }
  // erwarteter Sofortschaden eines Zaubers (Grundwirkung + Weg „trifft zusätzlich“ + Detonation)
  function spellEst(x, y, s) {
    const m = s.m || {}, amp = (x.amp || 1) * (s.boost || 1), red = spellRed(x, y, s), o = { execute: m.execute, el: s.el || 'phys' };
    const sh = m.fresh && y.cur > y.hp * 0.7 ? 1 + m.fresh : 1, one = k => scale(x, y, base(x) * k * amp * red * sh, o);
    let d = s.kind === 'multi' ? s.hits * one(s.mult) : ['hit', 'stun', 'mark'].includes(s.kind) ? one(s.mult * (s.kind === 'mark' && y.cur < y.hp / 2 ? 2 : 1)) : 0;
    if (d && m.strike) d += one(m.strike);
    if (m.detonate && y.poisonDmg) d += y.poisonDmg * m.detonate;
    return d;
  }
  // höchster Schaden, den y mit seinem nächsten Zug anrichten kann (Krit, Raserei-Doppelhieb, Eifer, Zorn) + die Ticks auf x
  function threat(y, x) {
    let hit = y.dmg[1] * (1 + y[y.main] / CFG.mainDiv) * (y.buff + (y.ramp || 0)) * pb(y);
    hit = scale(y, x, hit, { arm: armorRed(x.armor, y.lvl, y.pen || 0) });
    if (critChance(y, x.lvl) - (x.critRes || 0) > 0 && !y.hemorrhage) hit *= y.critMult || 2;
    const n = (y.rage && y.cur < y.hp / 2 ? 2 : 1) + (y.zeal ? y.zeal : 0);
    return hit * n + (x.poisonDmg || 0) + (x.bleedDmg || 0) + (x.burn?.n > 0 ? x.burn.d : 0);
  }
  // Wahl unter den vollen Zaubern: Index oder -1 (halten, normaler Hieb). Reihenfolge → E „Zauber nach Lage“.
  function pickSpell(x, y, sps) {
    const full = sps.map((s, i) => [s, i]).filter(([s, i]) => (x.ch[i] || 0) >= s.every); if (!full.length) return -1;
    const ehp = y.cur + (y.shield || 0), sure = !y.lastBreath || y.lbUsed;   // „Letzter Atem“ überlebt den ersten tödlichen Treffer
    const canStun = !y.stunned && !(y.stunImm > 0), dmgK = s => ['hit', 'multi', 'mark'].includes(s.kind) || (s.kind === 'stun' && canStun);
    const dots = !!(x.poisonDmg || x.bleedDmg || x.burn?.n);
    // 1 Heilung/Schild: unter halbem Leben oder wenn der nächste gegnerische Zug tödlich sein kann; nicht, wenn Heilung gebannt ist
    const heal = full.filter(([s]) => (s.kind === 'shield' || (s.kind === 'heal' && (!(x.noheal > 0) || s.m?.cleanse && dots))));
    if (heal.length && (x.cur < x.hp * 0.5 || threat(y, x) >= x.cur + (x.shield || 0))) return heal[0][1];
    // 2 der Hieb tötet sicher (geringster Wurf, nicht blockbar) → alle Zauber halten
    const low = scale(x, y, x.dmg[0] * (1 + x[x.main] / CFG.mainDiv) * x.buff * pb(x), { arm: armorRed(y.armor, x.lvl, x.pen || 0) });
    if (sure && !y.block && low >= ehp) return -1;
    // 3 der kleinste Schadenszauber, der tötet
    const kill = sure ? full.filter(([s]) => dmgK(s) && spellEst(x, y, s) >= ehp).sort((p, q) => p[0].every - q[0].every) : [];
    if (kill.length) return kill[0][1];
    // 4 Betäubung, wenn sie greift
    const st = full.find(([s]) => s.kind === 'stun' && canStun); if (st) return st[1];
    // 5 Gift, wenn das neue deutlich stärker wäre als das laufende (nicht, solange der Gegner gereinigt ist)
    const dot = full.find(([s]) => { if (s.kind !== 'dot' || y.cureN > 0) return false; const d = scale(x, y, base(x) * s.mult * (x.amp || 1) * (s.boost || 1) * spellRed(x, y, s), { el: s.el || 'phys' }), cur = y.poisonDmg || 0;
      return cur < 0.8 * (s.m?.dotStack ? Math.min(d * s.m.dotStack, cur + d) : Math.max(cur, d)); });
    if (dot) return dot[1];
    // 6 Buff, solange er wachsen kann (oder seine Schwächung abgelaufen ist)
    const bf = full.find(([s]) => s.kind === 'buff' && (x.buff < 1 + (s.max || 9) * (s.boost || 1) - 1e-6 || s.m?.weaken && !(y.weakN > 0))); if (bf) return bf[1];
    // 7 der Schadenszauber mit dem höchsten erwarteten Schaden; Heilung mit Nebenwirkung (Raserei-Weg, Ausbrennen) zählt auch
    const dm = full.filter(([s]) => dmgK(s)).sort((p, q) => spellEst(x, y, q[0]) - spellEst(x, y, p[0]));
    if (dm.length) return dm[0][1];
    const side = full.find(([s]) => s.kind === 'heal' && (s.m?.buff && x.buff < 2.5 || s.m?.cleanse && dots || s.m?.stunImmune && !(x.stunImm > 0)));
    return side ? side[1] : -1;
  }
  // Betäuben (Glocke, Zauber): nicht wenn unbetäubbar; danach ist der Gegner kurz „erschüttert“ (für Kombos)
  // Set „Tracht der Wäscherinnen“: unter halbem Leben heilt dich alles doppelt
  function healMul(x) { return x.lastStand && x.cur < x.hp * 0.5 ? CFG.lastStandMul : 1; }
  function stun(y, n = 1, by = null) { if (y.stunImm > 0) { ev.status = 'Widersteht'; return false; }
    y.stunned = Math.max(+y.stunned || 0, n); y.dazed = 2;
    // Set „Ornat des Glöckners“: wer dich betäubt, wird selbst betäubt
    if (by && y.tollback && !(by.stunImm > 0) && !by.stunned) { by.stunned = 1; by.dazed = 2; ev.status = 'Zurückgeläutet'; }
    return true; }
  function healSelf(x, h) { if (x.noheal > 0) return 0; h = Math.round(h * healMul(x)); const room = x.hp - x.cur; x.cur = Math.min(x.hp, x.cur + h); if (h > 0 && room > 0) x.didHeal = true; return Math.min(h, room); }
  function hurt(y, d) { if (y.shield) { const s = Math.min(y.shield, d); y.shield -= s; d -= s; } y.cur -= d;
    // Einzigartig „Letzter Atem“: der erste tödliche Treffer lässt 1 Leben übrig (einmal je Kampf)
    if (y.cur <= 0 && y.lastBreath && !y.lbUsed) { y.lbUsed = true; y.cur = 1; ev.status = 'Letzter Atem'; } }
  function spell(x, y, s) {
    const m = s.m || {}, amp = (x.amp || 1) * (s.boost || 1);
    // Rüstung nur gegen physische Zauber; Feuer/Eis gehen vorbei (Welle 2a)
    const red = s.el && ELEMENTS[s.el].res !== 'phys' ? 1 : 1 - armorRed(y.armor, x.lvl, x.pen || 0) * (1 - Math.min(1, m.pierce || 0));
    const dmgKind = !['heal', 'shield', 'buff'].includes(s.kind);
    if (dmgKind && dodged(x, y)) return say(x.side, `${x.name} wirkt ${s.name} – ${y.name} weicht aus.`, { spell: s.name, sid: s.id, miss: 'Ausgewichen' });
    let t = `${x.name} wirkt ${s.name}`, d = 0, anyCrit = false, extra = '';
    // Ein Zauber-Treffer läuft durch dieselben Werte wie ein Hieb (Henker, Krit, Lebensraub, Bluten, Gift, Glocke, Dornen)
    const hits = [];
    const fo = { crit: m.crit, execute: m.execute, force: m.dazedCrit && y.dazed > 0, el: s.el || 'phys' };
    if (fo.force) ev.combo = s.wn?.dazedCrit;
    let sh = 1; if (m.fresh && dmgKind && y.cur > y.hp * 0.7) { sh = 1 + m.fresh; ev.combo = s.wn?.fresh; }
    const zap = raw => { const r = finish(x, y, raw * sh, fo); hurt(y, r.d); d += r.d; hits.push(r.d); anyCrit ||= r.crit; extra += onHit(x, y, r.d, r.crit); return r; };
    if (s.kind === 'hit' || s.kind === 'stun' || s.kind === 'mark') {
      const r = zap(base(x) * s.mult * (s.kind === 'mark' && y.cur < y.hp / 2 ? 2 : 1) * amp * red); t += `: ${r.crit ? 'KRITISCH ' : ''}${r.d}.`;
      if (s.kind === 'stun' && stun(y, m.stunTurns || 1, x)) t += ` ${y.name} ist betäubt${m.stunTurns > 1 ? ` (${m.stunTurns} Züge)` : ''}.`;
    } else if (s.kind === 'multi') {
      let n = 0; for (let i = 0; i < s.hits && y.cur > 0; i++, n++) zap(base(x) * s.mult * amp * red * (0.8 + rand() * 0.4));
      t += `: ${n} Treffer, ${d}${anyCrit ? ' (kritisch)' : ''}.`;
    } else if (s.kind === 'dot') {
      const r = finish(x, y, base(x) * s.mult * amp * red, fo); anyCrit = r.crit;   // Giftstärke: auch Henker/Krit zählen
      if (!(y.cureN > 0)) y.poisonDmg = m.dotStack ? Math.min(r.d * m.dotStack, (y.poisonDmg || 0) + r.d) : Math.max(y.poisonDmg || 0, r.d); t += `. ${r.crit ? 'Kritisches ' : ''}Gift: ${y.poisonDmg} je Runde.`; ev.dot = y.poisonDmg;
    } else if (s.kind === 'heal') {
      const h = Math.round(x.hp * s.pct * amp), got = healSelf(x, h);
      if (m.overshield && h > got && !(x.noheal > 0)) { x.shield += h - got; ev.shield = h - got; }
      t += x.noheal > 0 ? ': die Heilung versagt.' : `: +${got} Leben${h > got && m.overshield ? `, Schild ${h - got}` : ''}.`; if (got) ev.heal = (ev.heal || 0) + got;
    } else if (s.kind === 'shield') {
      const h = Math.round(x.hp * s.pct * amp); x.shield += h; t += `: Schild ${h}.`; ev.shield = h;
    } else if (s.kind === 'buff') {
      x.buff = Math.max(x.buff, Math.min(1 + (s.max || 9) * (s.boost || 1), x.buff + s.v * (s.boost || 1))); t += `: Schaden +${Math.round((x.buff - 1) * 100)} %.`; ev.buff = Math.round((x.buff - 1) * 100);
    }
    t += ways(x, y, s, m, d, amp, red, zap);
    // Verbrennung (Schlüsselstein der Zauberin): jeder Zauber, der trifft, lässt den Gegner brennen.
    // Läuft über dasselbe y.burn wie der Zauber-Weg „Brand“, überschreibt also den schwächeren.
    if (x.ignite && d > 0 && !(y.cureN > 0)) {
      const bd = Math.max(1, Math.round(d * x.ignite / (s.hits || 1)));
      if (!(y.burn?.n > 0) || bd >= y.burn.d) { y.burn = { d: bd, n: CFG.igniteTurns }; t += ` ${y.name} brennt.`; }
      if (x.igniteBan) { y.noheal = Math.max(y.noheal || 0, CFG.igniteTurns + 1); ev.status ||= 'Gebannt'; }   // Verbrennung: wer brennt, heilt nicht
    }
    if (x.side === 'a') cast.push(s.name);
    say(x.side, t + extra, { spell: s.name, sid: s.id, dmg: d || undefined, crit: anyCrit, hits: hits.length > 1 ? hits : undefined, stun: s.kind === 'stun' || undefined });
    // Nachhall: der Zauber wirkt ein zweites Mal (nie öfter)
    if (x.echo && !x.echoing && y.cur > 0 && chance(x.echo)) { x.echoing = true; say(x.side, `${s.name} hallt nach!`, {}); spell(x, y, s); x.echoing = false; }
    // Set „Krone ohne Träger“: der erste Zauber des Kampfs wirkt zweimal
    if (x.firstEcho && !x.firstDone && !x.echoing && y.cur > 0) { x.firstDone = x.echoing = true; say(x.side, `${s.name} wirkt zweimal!`, {}); spell(x, y, s); x.echoing = false; }
  }

  // Was die gewählten Zauber-Wege zusätzlich tun (nach der Grundwirkung). Gibt Logtext zurück.
  function ways(x, y, s, m, d, amp, red, zap) {
    let t = '';
    if (m.strike && y.cur > 0) { const r = zap(base(x) * m.strike * amp * red); t += ` Trifft für ${r.d}.`; d += r.d; }
    if (d > 0) {
      if (m.lifesteal) { const h = healSelf(x, Math.round(d * m.lifesteal)); if (h) { t += ` +${h} Leben.`; ev.heal = (ev.heal || 0) + h; } }
      if (m.shieldGain) { const g = Math.round(d * m.shieldGain); x.shield += g; t += ` Schild ${g}.`; ev.shield = (ev.shield || 0) + g; }
      if (m.bleed && !(y.cureN > 0)) y.bleedDmg = Math.max(y.bleedDmg || 0, Math.round(d * m.bleed / (s.hits || 1)));
      if (m.poison && !(y.cureN > 0)) y.poisonDmg = Math.min(Math.round(y.hp * 0.12), (y.poisonDmg || 0) + Math.max(1, Math.round(d * m.poison)));
      if (m.burn && !(y.cureN > 0)) { y.burn = { d: Math.max(1, Math.round(d * m.burn.v / (s.hits || 1))), n: m.burn.n }; t += ` ${y.name} brennt.`; }
      if (m.stun && y.cur > 0 && chance(m.stun) && stun(y, 1, x)) { t += ` ${y.name} ist betäubt.`; ev.stun = true; }
    }
    const landed = d > 0 || !['hit', 'stun', 'mark', 'multi'].includes(s.kind);
    if (landed) {
      if (m.detonate && y.poisonDmg) { const b = Math.round(y.poisonDmg * m.detonate); hurt(y, b); t += ` Das Gift bricht aus: ${b}.`; ev.combo = `${s.wn?.detonate} ${b}`; }
      if (m.weaken) { y.weak = m.weaken.v; y.weakN = m.weaken.n + 1; ev.status = 'Geschwächt'; }
      if (m.vuln) { y.vuln = m.vuln.v; y.vulnN = m.vuln.n + 1; ev.status = 'Verwundbar'; }
      if (m.noheal) { y.noheal = m.noheal + 1; ev.status = 'Gebannt'; t += ` ${y.name} kann nicht heilen.`; }
    }
    if (m.healPct) { const h = healSelf(x, Math.round(x.hp * m.healPct * (x.amp || 1))); if (h) { t += ` +${h} Leben.`; ev.heal = (ev.heal || 0) + h; } }
    if (m.cleanse && (x.poisonDmg || x.bleedDmg || x.burn?.n)) { x.poisonDmg = 0; x.bleedDmg = 0; x.burn = null; t += ' Gereinigt.'; ev.status = 'Gereinigt'; }
    if (m.stunImmune) { x.stunImm = m.stunImmune + 1; }
    if (m.buff) { x.buff = Math.min(2.5, x.buff + m.buff); t += ` Schaden +${Math.round((x.buff - 1) * 100)} %.`; }
    return t;
  }

  // Henker und Krit auf rohen Schaden (für Hieb und Zauber); o: Zusatz-Krit/Henker eines Zauber-Wegs, force = sicherer Krit (Kombo),
  // o.el = Schadensart des Zaubers (sonst Hieb-Mischung des Angreifers) gegen die Resistenz des Ziels
  // Der Teil ohne Zufall (auch für die Zauberwahl): Resistenz, Henker, Vergeltung, geschwächt/verwundbar
  function scale(x, y, raw, o = {}) {
    let d = raw * resMul(x.mix, y, o.el, o.arm || 0, x.elemPen || 0); const ex = (x.execute || 0) + (o.execute || 0); if (ex && y.cur < y.hp * (0.3 + (x.execHp || 0))) d *= 1 + ex;   // Set „Schürze des Metzgers“ hebt die Schwelle
    if (x.vengeance) d *= 1 + x.vengeance * (1 - Math.max(0, x.cur) / x.hp);   // Vergeltung: je weniger eigenes Leben, desto härter
    if (x.weakN > 0) d *= 1 - x.weak;                  // geschwächt: macht weniger Schaden
    if (y.vulnN > 0) d *= 1 + y.vuln;                  // verwundbar: nimmt mehr Schaden
    return d;
  }
  function finish(x, y, raw, o = {}) {
    let d = scale(x, y, raw, o);
    // Ausbluten (Schlüsselstein): nie ein kritischer Treffer – dafür blutet jeder Hieb (siehe onHit)
    const crit = x.hemorrhage ? false : (o.force || chance(critChance(x, y.lvl, o.crit || 0) - (y.critRes || 0)));
    if (crit) d *= x.critMult || 2;
    return { d: Math.max(1, Math.round(d)), crit };
  }
  // Was ein Treffer zusätzlich auslöst (für Hieb und Zauber) – neue Effekte hier eintragen, dann gelten sie für beides
  function onHit(x, y, d, crit) {
    let t = '';
    if (x.leech) { const h = healSelf(x, Math.round(d * x.leech)); if (h) { t += ` +${h} Leben.`; ev.heal = (ev.heal || 0) + h; } }
    // Splittern: jeder Krit bricht ein Stück der gegnerischen Rüstung heraus (bis zur Hälfte)
    if (crit && x.shred) { const a0 = y.armor0 ??= y.armor; y.armor = Math.max(Math.round(a0 * 0.5), Math.round(y.armor * (1 - x.shred)));
      t += ` Die Rüstung splittert (${y.armor}).`; ev.status = 'Rüstung bricht'; }
    if (crit && x.siphon) { const h = healSelf(x, Math.round(x.hp * x.siphon)); if (h) { t += ` +${h} Leben.`; ev.heal = (ev.heal || 0) + h; } }
    // Bluten: sonst nur bei Krit, mit Ausbluten bei jedem Treffer und mit 20 % Grundstärke obendrauf
    const bl = x.hemorrhage ? CFG.hemoBleed + (x.bleed || 0) : (crit ? x.bleed || 0 : 0);
    if (bl && !(y.cureN > 0)) y.bleedDmg = Math.max(y.bleedDmg || 0, Math.round(d * bl));
    // Aldemar (poisonPct): jeder Treffer legt einen Anteil des MAXIMALEN Lebens des Ziels drauf, ohne Deckel – Leben schützt nicht, nur kurze Kämpfe, Ausweichen, Blocken, Gegengift
    if (x.poison && !(y.cureN > 0)) y.poisonDmg = x.poisonPct ? (y.poisonDmg || 0) + Math.max(1, Math.round(y.hp * x.poisonPct))
      : Math.min(Math.round(y.hp * 0.08), (y.poisonDmg || 0) + Math.max(1, Math.round(d * x.poison)));
    if (x.toll && (x.hits = (x.hits || 0) + 1) % 3 === 0) { if (stun(y, 1, x)) { t += ' Die Glocke dröhnt!'; ev.stun = true; } else t += ` ${y.name} widersteht der Glocke.`; }
    if (y.thorns && y.cur > 0) { const r = Math.round(d * y.thorns); hurt(x, r); if (r) { t += ` Dornen: ${r}.`; ev.thorns = (ev.thorns || 0) + r; } }
    return t;
  }

  // Weicht y dem Angriff von x aus? Schattenform hebt die Ausweich-Grenze (sonst stapelt der Schatten-Zweig in einen Deckel).
  // Serienbremse: nach CFG.evadeStreak Ausweichern in Folge trifft der nächste Angriff sicher – ein Zähler je Angreifer
  // für Hiebe und Zauber (sonst Fehlschlag-Serien bis 13 bei Klassen ohne Geschick, → E „Serienbremse beim Ausweichen“)
  function dodged(x, y) {
    if ((x.evN || 0) >= CFG.evadeStreak) { x.evN = 0; return false; }
    const evade = Math.max(0, evadeChance(y, x.dex) - (x.acc || 0));
    if (chance(evade)) { x.evN = (x.evN || 0) + 1; return true; }
    x.evN = 0; return false;
  }
  function strike(x, y) {
    if (dodged(x, y)) return say(x.side, `${y.name} weicht aus.`, { miss: 'Ausgewichen' });
    if (y.block && chance(Math.min(0.5, y.block))) {
      if (y.bulwark) { const sh = Math.round(y.hp * y.bulwark); y.shield = (y.shield || 0) + sh; ev.shield = sh; }   // Bollwerk: Blocken baut einen Schild auf
      return say(x.side, `${y.name} blockt.`, { miss: 'Geblockt' }); }
    // Rüstung wirkt in finish() nur auf den physischen Teil der Hieb-Mischung
    const raw = roll(x.dmg[0], x.dmg[1]) * (1 + x[x.main] / CFG.mainDiv) * x.buff * pb(x), arm = armorRed(y.armor, x.lvl, x.pen || 0);
    const { d, crit } = finish(x, y, raw, { arm });
    hurt(y, d);
    let t = `${x.name} trifft ${crit ? 'KRITISCH ' : ''}für ${d}.` + onHit(x, y, d, crit);
    // Eifer: jeder dritte eigene Hieb trifft ein zweites Mal
    const hits = [d];
    if (x.zeal && (x.zealN = (x.zealN || 0) + 1) % 3 === 0 && y.cur > 0) {
      const z = finish(x, y, raw * x.zeal, { arm }); hurt(y, z.d); hits.push(z.d);
      t += ` Und noch einmal${z.crit ? ' KRITISCH' : ''}: ${z.d}.` + onHit(x, y, z.d, z.crit); }
    say(x.side, t, { crit, dmg: hits.reduce((p, q) => p + q, 0), hits: hits.length > 1 ? hits : undefined });
  }
}
