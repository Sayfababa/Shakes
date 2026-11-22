// Laufen Boni ins Leere? Jeder gedeckelte Wert (CAPS in data.js, dazu die Deckel in combat.js)
// wird zweimal geprüft:
//   1. Kopfraum  – wo steht ein normal ausgerüsteter Held, und wie oft sitzt er schon auf der Grenze?
//   2. Grenznutzen – was bringen +X dieses Werts wirklich an Siegchance (gekoppelter Zufall)?
// Ein Wert mit ~0 Grenznutzen ist für diese Klasse tot: Talente und Items darauf wirken nicht.
// Aufruf: node tests/caps.mjs [klasse|all] [stufe|all] [kämpfe] [--check]
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
let seed = 0x5eed; const mul = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
Math.random = () => mul();
const D = await import('../js/data.js');
const G = await import('../js/state.js');
const { makeItem } = await import('../js/loot.js');
const { fight } = await import('../js/combat.js');

const only = process.argv[2] && process.argv[2] !== 'all' ? [process.argv[2]] : D.PLAYABLE;
const LV = +process.argv[3] ? [+process.argv[3]] : [14, 24];
const N = +process.argv[4] || 300, CHECK = process.argv.includes('--check');
const SLOTS = ['helm', 'chest', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand'];

// Die geprüften Werte: Name, Grenze, und wie viel wir zum Messen draufgeben
const WERTE = [
  { k: 'crit', cap: D.CAPS.crit, add: 0.15, name: 'Krit-Chance' },
  { k: 'evade', cap: D.CAPS.evade, add: 0.15, name: 'Ausweichen' },
  { k: 'block', cap: D.CAPS.block, add: 0.15, name: 'Blocken' },
  { k: 'thorns', cap: D.CAPS.thorns, add: 0.2, name: 'Dornen' },
  { k: 'leech', cap: D.CAPS.leech, add: 0.12, name: 'Lebensraub' },
  { k: 'pen', cap: D.CAPS.pen, add: 0.2, name: 'Rüstung ignorieren' },
  { k: 'critMult', cap: D.CAPS.critMult, add: 0.4, name: 'Krit-Schaden' },
];
// Unter diesem Grenznutzen gilt ein Wert als tot – der Bonus kommt im Kampf nicht an.
const TOT = 1.5;
let bad = 0;

function hero(cls, L, minRarity) {
  G.newChar('Deckel', cls); const S = G.S; S.lvl = L; S.tut = 99;
  const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, main = D.CLASSES[cls].main;
  S.attrs[main] += Math.round(pts * 0.55); S.attrs.con += Math.round(pts * 0.3); S.attrs.int += Math.round(pts * 0.05); S.attrs.lck += Math.round(pts * 0.1);
  const wb = D.BASES.filter(b => b.kind === D.CLASSES[cls].weapon && (!b.minLvl || L >= b.minLvl)).pop();
  S.equip.weapon = { id: 'w', slot: 'weapon', kind: wb.kind, mods: {}, dmg: wb.dmg.map(x => Math.round(x * (1 + L * 0.18) * 1.15)) };
  for (const s of SLOTS) { const it = makeItem(L, { slot: s.startsWith('ring') ? 'ring' : s, minRarity }); delete it.fx; delete it.special; S.equip[s] = it; }
  return S;
}
const mobs = (L, diff) => Array.from({ length: N }, (_, i) => G.makeMonster(L, diff, D.MONSTERS[i % D.MONSTERS.length]));
const rateA = (A, list) => { let w = 0; list.forEach((m, i) => { seed = 7919 * (i + 1); if (fight(A, m).winner === 'a') w++; }); seed = 0x5eed; return w / list.length; };
const pad = (x, n) => String(x).padStart(n);

for (const cls of only) for (const L of LV) {
  // Kopfraum über mehrere Ausrüstungswürfe mitteln (ein einzelner Wurf sagt wenig)
  const roh = {}, amCap = {};
  const WUERFE = 12;
  for (let j = 0; j < WUERFE; j++) { seed = 0xC0FFEE * (j + 1) + 7; hero(cls, L, 2); const A = G.stats();
    for (const w of WERTE) { roh[w.k] = (roh[w.k] || 0) + (A[w.k] || 0) / WUERFE;
      if ((A[w.k] || 0) >= w.cap - 1e-9) amCap[w.k] = (amCap[w.k] || 0) + 1; } }

  // Grenznutzen über mehrere Ausrüstungswürfe mitteln – ein einzelner Wurf kann einen Wert
  // tot aussehen lassen (zwei Teile mit „Ausweichen“ reichen, um die Grenze zu füllen).
  const GEAR = 3, saetze = [];
  for (let g = 0; g < GEAR; g++) { seed = 0xBEEF * (g + 1) + 13; hero(cls, L, 2);   // rate() setzt den Keim zurück – sonst dreimal dieselbe Ausrüstung
    let lo = 0.5, hi = 4, diff = 1;
    for (let i = 0; i < 9; i++) { diff = (lo + hi) / 2; if (rateA(G.stats(), mobs(L, diff).slice(0, 220)) > 0.5) lo = diff; else hi = diff; }
    const M = mobs(L, diff), A0 = G.stats(); saetze.push({ M, A0, r0: rateA(A0, M) }); }
  const r0 = saetze.reduce((a, x) => a + x.r0, 0) / GEAR;

  console.log(`\n${D.CLASSES[cls].name} Stufe ${L}  (Sieg ${(r0 * 100).toFixed(0)} %, magische Ausrüstung)`);
  console.log('Wert'.padEnd(20) + 'steht bei'.padStart(10) + 'Grenze'.padStart(8) + 'am Deckel'.padStart(11) + 'Δ Sieg je Bonus'.padStart(17));
  for (const w of WERTE) {
    // Den Bonus so geben, wie ihn ein Item gäbe: über die Grenze hinaus wird er beschnitten
    let d = 0;
    for (const { M, A0, r0: o } of saetze) { const A = { ...A0 };
      A[w.k] = Math.min(w.cap, (A0[w.k] || (w.k === 'critMult' ? 2 : 0)) + w.add);
      d += (rateA(A, M) - o) / GEAR; }
    // „Sitzt schon am Deckel“ ist kein Fehler, sondern die Grenze bei der Arbeit – nur ein Wert
    // mit Kopfraum, der trotzdem nichts bringt, ist tot.
    const amDeckel = (roh[w.k] || 0) >= w.cap * 0.85;
    // Krit-Schaden hängt an der Krit-Chance: wer selten kritisch trifft, hat wenig zu vervielfachen.
    // Das ist der Entwurf, kein toter Wert – darum hier nicht als Fehler werten.
    const ohneKrit = w.k === 'critMult' && (roh.crit || 0) < 0.1;
    // Welle 2a (D2/PoE): Feuer/Eis gehen an der Rüstung vorbei – wer nur solche Zauber hat, braucht „Rüstung ignorieren“ nur
    // für Hiebe. Das ist die Regel, kein Fehler (offene Frage im Bericht: Passiv der Zauberin). Abgeleitet, nicht abgetippt.
    const elemOnly = w.k === 'pen' && D.SPELLS[cls].every(s => s.el && D.ELEMENTS[s.el].res !== 'phys');
    const tot = Math.abs(d * 100) < TOT && !amDeckel && !ohneKrit && !elemOnly;
    console.log(w.name.padEnd(20) + pad((roh[w.k] || 0).toFixed(2), 10) + pad(w.cap, 8)
      + pad(`${amCap[w.k] || 0}/${WUERFE}`, 11) + pad(((d >= 0 ? '+' : '') + (d * 100).toFixed(1)), 13) + (tot ? '  TOT' : amDeckel ? '  am Deckel' : ohneKrit ? '  (wenig Krit-Chance)' : elemOnly ? '  (Zauber ignorieren Rüstung)' : ''));
    if (CHECK && tot) { bad++; console.log(`!! ${D.CLASSES[cls].name} Stufe ${L}: „${w.name}“ bringt nichts (+${w.add} → ${(d * 100).toFixed(1)} Pkt)`); }
  }
}
if (CHECK) { if (bad) { console.log(`\n${bad} tote Werte – Talente und Items darauf wirken nicht.`); process.exit(1); } console.log('\nAlle gedeckelten Werte kommen an.'); }
