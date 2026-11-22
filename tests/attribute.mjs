// Aufruf: node tests/attribute.mjs <klasse>  (Messung zur Attribut-Analyse, berichte/attribut-analyse.html)
// Was bringen +30 Punkte in jedem Attribut? Kampfkraft (power, = grüne Zahl im Spiel) und echte Siegchance gegen
// Gegner, die der Held ohne die Punkte zu ~50 % schlägt. 4 Ausrüstungswürfe gemittelt (Falle: ein Wurf entscheidet alles).
const G = await import('../js/state.js'), C = await import('../js/combat.js'), D = await import('../js/data.js');
const { hero } = await import('./held.mjs');
const cls = process.argv[2], PTS = 30, ROLLS = 4, N = 700, AT = ['str', 'dex', 'int', 'con', 'lck'];
const fighter = () => { const A = { ...G.stats(), belt: [] }; A.cur0 = A.hp; return A; };
const pool = (L, diff) => Array.from({ length: N }, () => G.makeMonster(L, diff));
const rate = (mobs) => { let w = 0; for (const m of mobs) if (C.fight(fighter(), { ...m }).winner === 'a') w++; return w / mobs.length; };
for (const L of [10, 20, 30, 40]) {
  const acc = Object.fromEntries(AT.map(k => [k, { p: 0, w: 0 }])); let info = '';
  for (let r = 0; r < ROLLS; r++) {
    hero(cls, L); const snap = JSON.stringify(G.S);
    let lo = 0.3, hi = 8, diff = 1; for (let i = 0; i < 9; i++) { diff = (lo + hi) / 2; if (rate(pool(L, diff).slice(0, 200)) > 0.5) lo = diff; else hi = diff; }
    const mobs = pool(L, diff), p0 = G.power(), w0 = rate(mobs);
    if (r === 0) { const s = G.stats(), en = 3 + L * D.CFG.monGrow; info = `Attr ${AT.map(k => k + ' ' + s[k]).join(' ')} | Rüstung ${s.armor} → Minderung ${Math.round(C.armorRed(s.armor, L) * 100)} % | Ausw. ${Math.round(C.evadeChance(s, en) * 100)} % | Krit ${Math.round(C.critChance(s, L) * 100)} % | Zauber ×${s.amp.toFixed(2)} | Leben ${s.hp}`; }
    for (const k of AT) { G.S.attrs[k] += PTS; acc[k].p += (G.power() / p0 - 1) / ROLLS; acc[k].w += (rate(mobs) - w0) / ROLLS; G.S.attrs[k] -= PTS; }
    Object.assign(G.S, JSON.parse(snap));
  }
  console.log(`${cls} St.${L}  ${info}`);
  console.log('   +30 Punkte →  ' + AT.map(k => `${k}: KK ${(acc[k].p * 100).toFixed(1).padStart(5)} % / Sieg ${(acc[k].w * 100 >= 0 ? '+' : '') + (acc[k].w * 100).toFixed(1)}`).join('  ·  '));
}
