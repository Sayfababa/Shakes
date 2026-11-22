// Gemeinsamer Test-Held für Abgrund- und Lohn-Messungen (tests/descent.mjs, tests/lohn.mjs): Punkte wie ein Spieler
// (55 % Hauptattribut, 30 % Konstitution), Ausrüstung über makeItem, Talente/Brett/Zauber-Wege wie der Bot (learnAll).
const D = await import('../js/data.js');
const G = await import('../js/state.js');
const { makeItem } = await import('../js/loot.js');
const { learnAll } = await import('./bot.mjs');
// gear = Gegenstandsstufe der Ausrüstung, minR = Mindest-Seltenheit
export function hero(cls, L, gear = L, minR = 2, depth = 0) {   // depth: Beute aus dieser Tiefe (Abgrund-Stufen über I)
  G.newChar('Abstieg', cls); const S = G.S; S.lvl = L; S.tut = 99;
  const pts = D.CFG.startPoints + (L - 1) * D.CFG.attrPerLevel, main = D.CLASSES[cls].main;
  S.attrs[main] += Math.round(pts * 0.55); S.attrs.con += Math.round(pts * 0.3); S.attrs.int += Math.round(pts * 0.05); S.attrs.lck += Math.round(pts * 0.1);
  // Waffe und Talente über die Regeln des Spiels (makeItem, Brett/Zauber-Wege wie der Bot) – vorher handgebaut,
  // Zauberin/Assassine lernten dabei alte Knoten ohne Brett und sahen im Abgrund 5–7 Tiefen schwächer aus als der Barbar.
  S.equip.weapon = makeItem(gear, { slot: 'weapon', kind: D.CLASSES[cls].weapon, cls: D.CLASSES[cls], minRarity: minR, depth });
  for (const s of ['helm', 'chest', 'gloves', 'boots', 'belt', 'amulet', 'ring1', 'ring2', 'offhand']) S.equip[s] = makeItem(gear, { slot: s.startsWith('ring') ? 'ring' : s, minRarity: minR, depth });
  learnAll();
  // alle Grüfte offen (die Tiefe wählt die Gruft reihum), Rekord so, dass jede Tiefe startbar ist
  for (const c of D.CRYPTS) S.trophies.push({ key: c.id + ':0', eff: c.trophy });
  S.deep = { best: 9999, week: -1, wBest: 0 };
}
