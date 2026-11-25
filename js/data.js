// Reine Spieldaten. Balancing nur hier.
export const CLASSES = {
  barbarian: { name: 'Barbar', main: 'str', portrait: 'barbarian', hp: 6, desc: 'Rohe Kraft. Raserei: Chance auf zweiten Hieb unter 50% Leben.', weapon: 'axe', passive: { rage: 0.3 } },
  paladin:   { name: 'Paladin', main: 'str', portrait: 'paladin', hp: 5, desc: 'Heiliger Schild. Blockt 25% aller Angriffe.', weapon: 'sword', passive: { block: 0.25 } },
  assassin:  { name: 'Assassine', main: 'dex', portrait: 'assassin', hp: 5.5, desc: 'Klingen im Schatten. Erhöhte kritische Treffer, Bluten.', weapon: 'dagger', passive: { crit: 0.12, bleed: 0.25 } },
  huntress:  { name: 'Jägerin', main: 'dex', portrait: 'huntress', hp: 4.5, desc: 'Pfeil und Geduld. Erster Schuss immer vor dem Gegner.', weapon: 'bow', passive: { first: 1 } },
  sorceress: { name: 'Zauberin', main: 'int', portrait: 'sorceress', hp: 4.6, desc: 'Arkanes Feuer. Selbst 25 % Elem.-Resi, durchdringt 15 % Elem.-Resi der Gegner.', weapon: 'staff', passive: { elemPen: 0.15, elemRes: 0.25 } },
  witch:     { name: 'Grabhexe', main: 'int', portrait: 'witch', hp: 4.6, desc: 'Totenmagie. Entzieht 20% des Schadens als Leben.', weapon: 'wand', passive: { leech: 0.2 } },
};
// Welle 1a (Besitzer 2026-11-21): nur diese drei sind wählbar. Paladin, Jägerin, Hexe bleiben im Code und kommen später wieder.
export const PLAYABLE = ['sorceress', 'assassin', 'barbarian'];

export const ATTRS = { str: 'Stärke', dex: 'Geschick', int: 'Intelligenz', con: 'Konstitution', lck: 'Glück' };

// sides = [Präfixe, Suffixe] (Welle 1a „Boni-Umbau“): Angriff = Präfix, Abwehr/Nutzen = Suffix. Fehlt auf einem Platz
// eine Seite (Stiefel haben keine Angriffs-Boni), rücken die Plätze auf die andere Seite – das Teil bleibt gleich voll.
export const RARITIES = [
  { id: 'broken',    name: 'Zerbrochen', w: 14, mult: 0.6 },
  { id: 'normal',    name: 'Gewöhnlich', w: 46, mult: 1 },
  { id: 'magic',     name: 'Magisch',    w: 28, sides: [1, 1], mult: 1.15 },
  { id: 'rare',      name: 'Selten',     w: 10, sides: [2, 2], mult: 1.3 },
  { id: 'legendary', name: 'Legendär',   w: 2,  sides: [3, 2], mult: 1.6 },
  { id: 'set',       name: 'Set',        w: 0,  mult: 1.45 },   // fällt nie zufällig – nur bei Krypta-Bossen (SETS)
];

export const SLOTS = { helm: 'Helm', chest: 'Brust', gloves: 'Handschuhe', boots: 'Stiefel', belt: 'Gürtel',
  amulet: 'Amulett', ring: 'Ring', weapon: 'Waffe', offhand: 'Nebenhand' };

// Item-Basen. w×h = Größe im Inventar-Raster (Diablo-Stil).
export const BASES = [
  { slot: 'helm', name: 'Kappe', armor: 3, w: 2, h: 2, art: 'cap', vars: ['cap_a', 'cap_b'] }, { slot: 'helm', name: 'Eisenhelm', armor: 6, w: 2, h: 2, art: 'helm', vars: ['helm_a', 'helm_b'] }, { slot: 'helm', name: 'Totenmaske', armor: 9, w: 2, h: 2, art: 'mask', vars: ['mask_a', 'mask_b'] },
  { slot: 'chest', name: 'Lederwams', armor: 8, w: 2, h: 3, art: 'leather', vars: ['leather_a', 'leather_b'] }, { slot: 'chest', name: 'Kettenhemd', armor: 14, w: 2, h: 3, art: 'mail', vars: ['mail_a'] }, { slot: 'chest', name: 'Plattenpanzer', armor: 22, w: 2, h: 3, art: 'plate', vars: ['plate_a', 'plate_b'] },
  { slot: 'gloves', name: 'Lederhandschuhe', armor: 2, w: 2, h: 2, art: 'gloves', vars: ['gloves_a', 'gloves_b'] }, { slot: 'gloves', name: 'Panzerhandschuhe', armor: 5, w: 2, h: 2, art: 'gauntlets', vars: ['gauntlets_a', 'gauntlets_b'] },
  { slot: 'boots', name: 'Stiefel', armor: 2, w: 2, h: 2, art: 'boots', vars: ['boots_a', 'boots_b'] }, { slot: 'boots', name: 'Kriegsstiefel', armor: 5, w: 2, h: 2, art: 'greaves', vars: ['greaves_a', 'greaves_b'] },
  { slot: 'belt', name: 'Schärpe', armor: 1, w: 2, h: 1, art: 'sash', vars: ['sash_a', 'sash_b'] }, { slot: 'belt', name: 'Plattengürtel', armor: 4, w: 2, h: 1, art: 'belt', vars: ['belt_a', 'belt_b'] },
  { slot: 'offhand', name: 'Rundschild', armor: 7, w: 2, h: 2, art: 'buckler', vars: ['buckler_a', 'buckler_b'] }, { slot: 'offhand', name: 'Turmschild', armor: 12, w: 2, h: 3, art: 'tower', vars: ['tower_a', 'tower_b'] },
  { slot: 'amulet', name: 'Amulett', w: 1, h: 1, art: 'amulet', vars: ['amulet_a', 'amulet_b', 'amulet_c', 'amulet_d', 'amulet_e', 'amulet_f', 'amulet_g'] }, { slot: 'ring', name: 'Ring', w: 1, h: 1, art: 'ring', vars: ['ring_a', 'ring_b', 'ring_c', 'ring_d', 'ring_e', 'ring_f', 'ring_g'] },
  { slot: 'weapon', kind: 'axe', name: 'Beil', dmg: [3, 8], w: 2, h: 3, art: 'hatchet', vars: ['hatchet_a'] }, { slot: 'weapon', kind: 'axe', name: 'Kriegsaxt', dmg: [6, 14], w: 2, h: 3, art: 'waraxe', vars: ['waraxe_a'] },
  { slot: 'weapon', kind: 'sword', name: 'Kurzschwert', dmg: [3, 7], w: 1, h: 3, art: 'sword', vars: ['sword_a'] }, { slot: 'weapon', kind: 'sword', name: 'Bastardschwert', dmg: [6, 12], w: 1, h: 4, art: 'longsword', vars: ['longsword_a'] },
  { slot: 'weapon', kind: 'dagger', name: 'Dolch', dmg: [2, 6], w: 1, h: 2, art: 'dagger', vars: ['dagger_a'] }, { slot: 'weapon', kind: 'dagger', name: 'Klauenklinge', dmg: [4, 10], w: 1, h: 3, art: 'claw', vars: ['claw_a'] },
  { slot: 'weapon', kind: 'bow', name: 'Kurzbogen', dmg: [3, 8], w: 2, h: 3, art: 'bow', vars: ['bow_a'] }, { slot: 'weapon', kind: 'bow', name: 'Langbogen', dmg: [5, 12], w: 2, h: 4, art: 'longbow', vars: ['longbow_a'] },
  { slot: 'weapon', kind: 'staff', name: 'Stab', dmg: [4, 9], w: 1, h: 4, art: 'staff', vars: ['staff_a'] }, { slot: 'weapon', kind: 'staff', name: 'Runenstab', dmg: [5, 12], w: 1, h: 4, art: 'runestaff', vars: ['runestaff_a'] },
  { slot: 'weapon', kind: 'wand', name: 'Knochenstab', dmg: [4, 8], w: 1, h: 2, art: 'wand', vars: ['wand_a'] }, { slot: 'weapon', kind: 'wand', name: 'Grabszepter', dmg: [5, 11], w: 1, h: 3, art: 'scepter', vars: ['scepter_a'] },
  // Höhere Grundgegenstände (wie "Exceptional" in D2): erst ab Gegenstandsstufe minLvl, stärkere Grundwerte
  { slot: 'helm', name: 'Dornenhelm', armor: 13, w: 2, h: 2, art: 'spikehelm', vars: ['spikehelm_a'], minLvl: 14 }, { slot: 'helm', name: 'Gehörnter Helm', armor: 17, w: 2, h: 2, art: 'hornhelm', vars: ['hornhelm_a'], minLvl: 24 },
  { slot: 'chest', name: 'Dornenpanzer', armor: 30, w: 2, h: 3, art: 'spikeplate', vars: ['spikeplate_a'], minLvl: 18 },
  { slot: 'weapon', kind: 'axe', name: 'Henkersaxt', dmg: [9, 20], w: 2, h: 3, art: 'doubleaxe', vars: ['doubleaxe_a'], minLvl: 16 },
  { slot: 'weapon', kind: 'sword', name: 'Runenklinge', dmg: [9, 18], w: 1, h: 4, art: 'runeblade', vars: ['runeblade_a'], minLvl: 16 },
  { slot: 'weapon', kind: 'dagger', name: 'Sichelklinge', dmg: [6, 15], w: 1, h: 3, art: 'sickle', vars: ['sickle_a'], minLvl: 16 },
  { slot: 'weapon', kind: 'bow', name: 'Reflexbogen', dmg: [8, 18], w: 2, h: 4, art: 'recurve', vars: ['recurve_a'], minLvl: 16 },
  { slot: 'weapon', kind: 'staff', name: 'Sternenstab', dmg: [8, 18], w: 1, h: 4, art: 'starstaff', vars: ['starstaff_a'], minLvl: 16 },
  { slot: 'weapon', kind: 'wand', name: 'Blutszepter', dmg: [8, 17], w: 1, h: 3, art: 'bloodscepter', vars: ['bloodscepter_a'], minLvl: 16 },
];
// Beutel 10x6: unter dem Beutel lagen auf JEDEM geprueften Bildschirm mindestens 111 px
// ungenutzt (auch auf dem SE) – das war reservierte Flaeche, die nie jemand gebraucht hat.
// Zwei Reihen mehr passen ueberall und lassen oben wie unten noch Luft.
export const INV_W = 10, INV_H = 6;
// Das Lager teilt sich den Platz mit dem Beutel (ein Knopf schaltet um), also dasselbe Raster.
export const STASH_W = 10, STASH_H = 6;

// Affixe (Welle 1a „Boni-Umbau“): feste Wertebereiche je Stufe (TIERS.flat/pct × per), die Gegenstandsstufe schaltet nur
// höhere Stufen frei. side: 'pre' = Angriff, 'suf' = Abwehr/Nutzen. group: höchstens ein Bonus je Gruppe und Teil (wie PoE).
// w: Würfelgewicht (Standard 1). slots: wo der Bonus vorkommt – Schaden nur auf Waffe/Handschuhen/Schmuck, Hauptattribut nicht überall, Rüstungsteile
// tragen Leben/Rüstung. Platz für Resistenzen (spätere Welle) ist in den Suffix-Listen der Rüstungsteile vorgesehen.
// Prozent-Boni: Stufe I höchstens 15–20 % je Teil (Krit-Chance unten). Ausnahmen mit eigener Einheit (Krit-Schaden,
// Dornen, Zauber-Boni wirken nur auf einen Teil des Schadens) sind gegen das Hauptattribut geeicht (tests/calib.mjs).
const ATTR_SLOTS = ['weapon', 'helm', 'chest', 'belt', 'offhand', 'amulet', 'ring'];   // nicht Handschuhe, Stiefel
const HIT_SLOTS = ['weapon', 'gloves', 'ring', 'amulet'];                               // Schaden: Waffe, Handschuhe, Schmuck
const ARMOR_SLOTS = ['helm', 'chest', 'gloves', 'boots', 'belt', 'offhand'];
const RES_SLOTS = [...ARMOR_SLOTS, 'amulet', 'ring'];                                // Resistenzen: Rüstungsteile und Schmuck
export const AFFIXES = [
  { stat: 'str', per: 1, pre: 'Starker', suf: 'des Bären', side: 'pre', group: 'attr', slots: ATTR_SLOTS },
  { stat: 'dex', per: 1, pre: 'Flinker', suf: 'des Fuchses', side: 'pre', group: 'attr', slots: ATTR_SLOTS },
  { stat: 'int', per: 1, pre: 'Kundiger', suf: 'des Gelehrten', side: 'pre', group: 'attr', slots: ATTR_SLOTS },
  { stat: 'dmg', per: 0.6, pre: 'Grausamer', suf: 'des Schlachters', side: 'pre', slots: HIT_SLOTS },
  { stat: 'haste', per: 1.6, pre: 'Rascher', suf: 'der Beschwörung', pct: 1, label: 'Zaubertempo', side: 'pre', slots: ['weapon', 'gloves', 'offhand', 'amulet'] },
  { stat: 'critc', per: 0.8, pre: 'Scharfer', suf: 'der Schärfe', pct: 1, label: 'Krit-Chance', side: 'pre', slots: HIT_SLOTS },
  { stat: 'critd', per: 6, pre: 'Brutaler', suf: 'des Gemetzels', pct: 1, label: 'Krit-Schaden', side: 'pre', slots: ['weapon', 'gloves', 'amulet'] },
  { stat: 'dmgp', per: 0.9, pre: 'Wütender', suf: 'des Zorns', pct: 1, label: 'Schaden', side: 'pre', slots: HIT_SLOTS },
  { stat: 'spellp', per: 0.95, pre: 'Arkaner', suf: 'der Zauberei', pct: 1, label: 'Zauberkraft', side: 'pre', slots: HIT_SLOTS },
  { stat: 'penp', per: 1.33, pre: 'Bohrender', suf: 'des Durchbohrens', pct: 1, label: 'Rüstung ignorieren', side: 'pre', slots: ['weapon'], notKind: ['staff'] },   // nicht auf Stäben: Feuer/Eis der Zauberin gehen ohnehin an der Rüstung vorbei
  { stat: 'con', per: 1, pre: 'Zäher', suf: 'des Ochsen', side: 'suf', w: 0.6, slots: ['helm', 'chest', 'boots', 'belt', 'amulet', 'ring'] },   // w: seltener gewürfelt – die Suffix-Listen sind klein, sonst trüge fast jedes Teil Konstitution
  { stat: 'lck', per: 1.5, pre: 'Glücklicher', suf: 'der Fortuna', side: 'suf' },
  { stat: 'armor', per: 16, pre: 'Gehärteter', suf: 'der Wacht', side: 'suf', slots: ARMOR_SLOTS },
  { stat: 'lifep', per: 1.33, pre: 'Lebendiger', suf: 'des Lebens', pct: 1, label: 'Leben', side: 'suf', slots: ['helm', 'chest', 'boots', 'belt'] },
  { stat: 'leechp', per: 0.25, pre: 'Saugender', suf: 'des Egels', pct: 1, label: 'Lebensraub', side: 'suf', slots: ['weapon', 'ring'] },
  { stat: 'blockp', per: 1.33, pre: 'Wehrhafter', suf: 'des Walls', pct: 1, label: 'Blocken', side: 'suf', slots: ['offhand'] },
  { stat: 'evadep', per: 1.33, pre: 'Schemenhafter', suf: 'des Nebels', pct: 1, label: 'Ausweichen', side: 'suf', slots: ['boots', 'gloves'] },
  { stat: 'thornsp', per: 5, pre: 'Dorniger', suf: 'der Dornen', pct: 1, label: 'Dornen', side: 'suf', slots: ['chest', 'offhand'] },
  // Resistenzen (Welle 2a): klein je Teil (Stufe I ≈ 9–10 %), Deckel CFG.resCap – beide auf 75 % zu bringen braucht fast jeden Platz.
  // Eigene Gruppen: ein Teil darf beide tragen. per geeicht gegen Konstitution (tests/calib.mjs).
  { stat: 'physr', per: 1.5, pre: 'Eherner', suf: 'des Steins', pct: 1, label: 'Phys.-Resi', side: 'suf', slots: RES_SLOTS, noDeep: 1 },   // noDeep: keine Abgrund-Stufen – sonst reichten zwei Teile für den Deckel
  // Elementar-Durchdringung (PoE): nur auf Stäben – wirkt nur auf Feuer/Eis, sonst toter Bonus für Hieb-Klassen
  { stat: 'elempenp', per: 1, pre: 'Glühender', suf: 'der Durchdringung', pct: 1, label: 'Elem.-Durchdringung', side: 'pre', slots: ['weapon'], kind: 'staff' },
  { stat: 'elemr', per: 2, pre: 'Gebannter', suf: 'der Elemente', pct: 1, label: 'Elem.-Resi', side: 'suf', slots: RES_SLOTS, noDeep: 1 },
];
// Zauber-Boni (nur auf Waffen der Klasse, die den Zauber hat): "+N % Feuerball" stärkt Schaden/Heilung/Schild/Wirkung des Zaubers.
// Werden am Dateiende aus SPELLS erzeugt (stat 'sk_<id>', cls).
export const SKILL_PER = 2.7;
// --- Schadensarten (Welle 2a): physisch, Feuer, Eis. Feuer und Eis zählen gegen dieselbe Resistenz (Elementar).
// Gegner tragen `mix` (Anteil Feuer/Eis an ihren Hieben, Rest physisch) und `res` ({ phys, elem }, Anteil 0..1).
// Zauber tragen `el` (fehlt = physisch). Helden-Hiebe sind physisch. Rüstung mindert nur den physischen Anteil (wie D2/PoE); Deckel CFG.resCap / resCapPhys.
export const ELEMENTS = { phys: { name: 'Physisch', short: 'Phys', res: 'phys' }, fire: { name: 'Feuer', short: 'Feuer', res: 'elem' }, cold: { name: 'Eis', short: 'Eis', res: 'elem' } };
export const RES_NAMES = { phys: 'Phys.-Resi', elem: 'Elem.-Resi' };
// Obergrenzen für Prozent-Boni (Summe aus allem)
export const CAPS = { crit: 0.6, critMult: 3.5, leech: 0.4, thorns: 0.6, evade: 0.5, block: 0.5, pen: 0.9 };
// Grammatisches Geschlecht der Grundgegenstände für Namen („Starke Kappe“, „Rostiges Beil“). Nicht Genanntes ist männlich. p = Mehrzahl.
export const GENUS = {
  f: ['Kappe', 'Totenmaske', 'Schärpe', 'Kriegsaxt', 'Klauenklinge', 'Henkersaxt', 'Runenklinge', 'Sichelklinge'],
  n: ['Lederwams', 'Kettenhemd', 'Amulett', 'Beil', 'Kurzschwert', 'Bastardschwert', 'Grabszepter', 'Blutszepter'],
  p: ['Lederhandschuhe', 'Panzerhandschuhe', 'Stiefel', 'Kriegsstiefel'],
};
// Eigene Namen, nie die eines Einzigartigen (sonst verwechselt man beim Aschenkern „Witwenmacher" legendär mit einzigartig).
// Der Logik-Test prüft, dass sich beide Listen nicht überschneiden.
export const LEGEND_NAMES = ['Grabesstille', 'Glutgebet', 'Der Stille Chor', 'Rabenmal', 'Beinhausfund', 'Vhals Erbe', 'Eisenpsalm', 'Kerzenruß'];

// --- Bonus-Stufen (PoE-Art, Welle 1a): I ist die beste. Jede Stufe hat einen FESTEN Wertebereich (flat: Attribute, Rüstung,
// Schaden; pct: Prozent-Boni), jeweils × per des Bonus. Die Gegenstandsstufe schaltet höhere Stufen nur frei (minLvl),
// der Wert hängt nicht mehr an ihr – Beute weit über der Heldenstufe sprengt nichts mehr. w = Würfelgewicht.
// Abgrund-Stufen über I (Welle 2B-1, wie D4 „Greater Affixes“): t 0 = I+, t −1 = I++. Sie fallen nur im Abgrund ab
// Tiefe minDepth (makeItem({ depth })), nie in Krypta/Akten/Schmiede; topTier() übergeht sie. Rot markiert (.tier.t0/.t-1).
export const TIERS = [
  { t: -1, name: 'I++', w: 4, minLvl: 1, minDepth: 22, deep: 1, flat: [34, 38], pct: [19, 21] },
  { t: 0, name: 'I+', w: 8, minLvl: 1, minDepth: 15, deep: 1, flat: [29, 32], pct: [16, 18] },
  { t: 1, name: 'I', w: 15, minLvl: 35, flat: [22, 28], pct: [13, 15] },
  { t: 2, name: 'II', w: 25, minLvl: 22, flat: [14, 18], pct: [11, 12] },
  { t: 3, name: 'III', w: 25, minLvl: 12, flat: [8, 10], pct: [8, 10] },
  { t: 4, name: 'IV', w: 20, minLvl: 5, flat: [4, 5], pct: [6, 7] },
  { t: 5, name: 'V', w: 15, minLvl: 1, flat: [1, 2], pct: [4, 5] },
];

// --- Sonderboni: selten, verändern den Kampf (Effekt-Schlüssel wie Talente). Höchstens einer je Item. ---
export const SPECIALS = [
  { id: 'leech', name: 'des Blutsaugers', eff: { leech: 0.06 } },
  { id: 'toll', name: 'der Totenglocke', eff: { toll: 1 } },
  { id: 'execute', name: 'des Henkers', eff: { execute: 0.3 } },
  { id: 'thorns', name: 'der Dornen', eff: { thorns: 0.15 } },
  { id: 'poison', name: 'des Giftmischers', eff: { poison: 0.08 } },
  { id: 'rage', name: 'der Raserei', eff: { rage: 0.15 } },
  { id: 'pen', name: 'des Durchbohrens', eff: { pen: 0.2 } },
  { id: 'regen', name: 'des Wiedergängers', eff: { regen: 0.02 } },
  { id: 'crit', name: 'der Schärfe', eff: { crit: 0.06 } },
  { id: 'evade', name: 'des Schattens', eff: { evade: 0.05 } },
  { id: 'block', name: 'des Bollwerks', eff: { block: 0.08 } },
  { id: 'echo', name: 'des Nachhalls', eff: { echo: 0.15 } },
  { id: 'ward', name: 'des Knochenwalls', eff: { ward: 0.12 } },
];
export const SPECIAL_CHANCE = { magic: 0.02, rare: 0.08, legendary: 0.3 };   // erst ab Gegenstandsstufe 8
export const SPECIAL_MIN_LVL = 8;

// --- Einzigartige Legendäre: fester Name, feste Eigenschaft, eigene Zeile Geschichte ---
// mods: Bonus → Stufe (fester Tier); eff: fester Sonderbonus
export const UNIQUES = [
  { name: 'Witwenmacher', slot: 'weapon', kind: 'dagger', mods: { dex: 2, dmg: 2 }, eff: { crit: 0.1, bleed: 0.3 }, lore: 'Jede Kerbe ein Grab.' },
  { name: 'Glockenbrecher', slot: 'weapon', kind: 'axe', mods: { str: 2, con: 3 }, eff: { toll: 1, rage: 0.1 }, lore: 'Sie läutete nie wieder.' },
  { name: 'Der Letzte Psalm', slot: 'weapon', kind: 'sword', mods: { str: 2, armor: 2 }, eff: { regen: 0.03, block: 0.1 }, lore: 'Gesungen über einem offenen Grab.' },
  { name: 'Aschenkuss', slot: 'weapon', kind: 'staff', mods: { int: 1, haste: 2 }, eff: { echo: 0.2 }, lore: 'Was sie berührt, brennt zweimal.' },
  { name: 'Grabesruh', slot: 'weapon', kind: 'wand', mods: { int: 2, con: 2 }, eff: { leech: 0.12 }, lore: 'Die Toten schlafen nicht. Sie warten.' },
  { name: 'Rabenschwur', slot: 'weapon', kind: 'bow', mods: { dex: 2, lck: 2 }, eff: { first: 1, crit: 0.08 }, lore: 'Der Rabe sieht zuerst.' },
  { name: 'Knochenkrone', slot: 'helm', mods: { con: 3, int: 3 }, eff: { ward: 0.15 }, lore: 'Gewachsen aus dem Schädel ihres Trägers.' },
  { name: 'Sünde von Vhal', slot: 'chest', mods: { armor: 2, con: 3, lifep: 2 }, eff: { thorns: 0.18 }, lore: 'Getragen vom Metzger, bis er fiel.' },
  { name: 'Blutglocke', slot: 'amulet', mods: { str: 1, dmgp: 2, con: 2 }, eff: { rage: 0.3 }, lore: 'Sie schlägt mit deinem Herzen.' },
  { name: 'Totengräbers Griff', slot: 'gloves', mods: { str: 2, dmg: 2, critd: 3 }, eff: { execute: 1.1, execHp: 0.14, dmgPct: 0.16 }, lore: 'Er hat nie jemanden lebendig begraben. Fast nie.' },
  { name: 'Pfad der Asche', slot: 'boots', mods: { dex: 1, evadep: 2 }, eff: { evade: 0.08 }, lore: 'Keine Spur bleibt zurück.' },
  { name: 'Ring der Ertrunkenen', slot: 'ring', mods: { lck: 2, int: 3 }, eff: { poison: 0.1 }, lore: 'Aus Gerlindes Brunnen gefischt.' },
  { name: 'Siegel des Kronenlosen', slot: 'ring', mods: { str: 3, dex: 3 }, eff: { pen: 0.3, crit: 0.05 }, lore: 'Die Krone fehlt. Die Macht nicht.' },
  { name: 'Gürtel der Büßer', slot: 'belt', mods: { con: 1, armor: 3 }, eff: { hpPct: 0.15 }, lore: 'Jeder Knoten eine Sünde.' },
  // Zweite Welle: jedes Stück ändert eine Regel oder handelt etwas ein, statt nur Zahlen zu erhöhen
  // Drei Stücke, die ohne den passenden Zweig schwach sind und mit ihm tragen (Synergie statt Zahlen)
  { name: 'Schartige Schneide', slot: 'weapon', kind: 'dagger', mods: { dex: 3, str: 2 }, eff: { bleed: 0.4, dmgPct: -0.15 }, lore: 'Stumpf geworden an zu vielen Rippen. Sie reißt, statt zu schneiden.' },
  { name: 'Mantel der Leere', slot: 'chest', mods: { dex: 4, con: 3 }, eff: { evade: 0.12, thorns: 0.2 }, lore: 'Wer danach greift, greift ins Dunkel – und blutet dafür.' },
  { name: 'Lotusfläschchen', slot: 'offhand', mods: { int: 3, lck: 3 }, eff: { poison: 0.18, siphon: 0.05 }, lore: 'Ein Tropfen auf die Klinge. Mehr braucht die Geduld nicht.' },
  { name: 'Scherbenschneide', slot: 'weapon', kind: 'dagger', mods: { dex: 3, lck: 3 }, eff: { dmgPct: 0.45, hpPct: -0.25 }, lore: 'Scharf genug für zwei Leben. Deins zählt mit.' },
  { name: 'Wut der Witwe', slot: 'weapon', kind: 'axe', mods: { str: 2, dmg: 3 }, eff: { vengeance: 0.8 }, lore: 'Sie schlug zu, als nichts mehr zu verlieren war.' },
  { name: 'Eiferklinge', slot: 'weapon', kind: 'sword', mods: { str: 2, dex: 2, dmgp: 3 }, eff: { zeal: 0.95 }, lore: 'Drei Schläge für den Herrn. Der dritte zählt doppelt.' },
  { name: 'Splittermal', slot: 'weapon', kind: 'staff', mods: { int: 2, con: 3 }, eff: { shred: 0.18, crit: 0.05 }, lore: 'Jeder Treffer sucht den Riss.' },
  { name: 'Aderlass', slot: 'weapon', kind: 'wand', mods: { int: 3, lck: 3 }, eff: { siphon: 0.1, crit: 0.12, critDmg: 0.3 }, lore: 'Was sie nimmt, gibt sie dir.' },
  { name: 'Die Lange Stille', slot: 'weapon', kind: 'bow', mods: { dex: 2, dmg: 3 }, eff: { pen: 0.35, nohealSelf: 1 }, lore: 'Kein Pfeil kehrt zurück. Kein Atem auch.' },
  { name: 'Haube des Pakts', slot: 'helm', mods: { int: 2, con: 3 }, eff: { dmgPct: 0.3, nohealSelf: 1 }, lore: 'Ein Handel: deine Heilung gegen seinen Zorn.' },
  { name: 'Der Letzte Atem', slot: 'chest', mods: { con: 2, armor: 3, lifep: 3 }, eff: { lastBreath: 1 }, lore: 'Einmal noch. Nur einmal noch.' },
  { name: 'Eisernes Gelübde', slot: 'chest', mods: { armor: 3, con: 3, lifep: 3 }, eff: { bulwark: 0.08, block: 0.07 }, lore: 'Jeder abgewehrte Schlag macht den Schild dicker.' },
  { name: 'Gerlindes Schwur', slot: 'amulet', mods: { con: 2, int: 3 }, eff: { siphon: 0.035, regen: 0.012 }, lore: 'Sie ertrank und kam doch zurück.' },
  { name: 'Herz der Glocke', slot: 'amulet', mods: { str: 3, haste: 3 }, eff: { toll: 1, rage: 0.12 }, lore: 'Jeder dritte Schlag ist ein Läuten.' },
  { name: 'Fäuste des Eifers', slot: 'gloves', mods: { dex: 1, dmg: 2, critc: 3 }, eff: { zeal: 0.9 }, lore: 'Sie hören nie beim ersten Mal auf.' },
  { name: 'Schritt des Verwehten', slot: 'boots', mods: { dex: 3, lck: 3 }, eff: { evade: 0.1, first: 1 }, lore: 'Er war schon fort, als der Schlag kam.' },
  { name: 'Ring der Vergeltung', slot: 'ring', mods: { str: 3, con: 3 }, eff: { vengeance: 0.5, thorns: 0.12 }, lore: 'Je tiefer die Wunde, desto schwerer die Hand.' },
  { name: 'Reif der Zuflucht', slot: 'ring', mods: { con: 4, lck: 3 }, eff: { secondWind: 0.18 }, lore: 'Einmal darfst du Luft holen.' },
  { name: 'Gurt des Bollwerks', slot: 'belt', mods: { armor: 2, con: 3 }, eff: { bulwark: 0.05, hpPct: 0.08 }, lore: 'Stehen bleiben ist auch ein Angriff.' },
  // --- Drei Stücke für das Brett der Zauberin ---
  // Ihr Brett belohnt Zauberschaden, Schild/Dornen und Nachhall – bisher griff **kein einziges**
  // Einzigartiges das auf (spellPct 0, ignite 0, echo 1). Die Assassine hatte 14. Diese drei folgen
  // demselben Muster wie ihre Synergie-Stücke: allein mittelmässig, mit dem Zweig tragend.
  // **Kein Leben als Preis** – für die Zauberin kostet −10 % hpPct gemessene 12,3 Punkte Siegchance,
  // mehr als ein ganzer Schlüsselstein gibt. **Und kein Zaubertempo als Preis:** ein Stab würfelt
  // `haste` als normalen Bonus bis über 50 %, ein Einzigartiges wirft den weg – gemessen kostete
  // ein −12 %-Aufschlag darauf 7 Punkte Siegchance. Ein Einzigartiges kämpft gegen das, was es ERSETZT.
  { name: 'Glutzehrer', slot: 'weapon', kind: 'staff', mods: { int: 3, spellp: 3 }, eff: { spellPct: 0.42 }, lore: 'Er nimmt sich Zeit. Was danach brennt, brennt lange.' },
  { name: 'Der Kalte Spiegel', slot: 'offhand', mods: { int: 2, con: 4 }, eff: { ward: 0.16, thorns: 0.2 }, lore: 'Wer hineinsieht, sieht seinen eigenen Hieb zurückkommen.' },
  { name: 'Das Zweite Wort', slot: 'amulet', mods: { int: 3, spellp: 3 }, eff: { firstEcho: 1, echo: 0.25, spellPct: 0.15 }, lore: 'Sprich es einmal. Die Gruft spricht es nach.' },
];
// --- Grab-Sets: je Krypta ein Set aus 3 Teilen (Mockup mockups/sets.html) ---
// Teile fallen nur beim Boss ihrer Krypta, ab Stufe SET.minTier. 2 Teile = ein guter Bonus (etwa Stufe III),
// 3 Teile = eine Regeländerung wie ein Sonderbonus. Set-Teile tragen nur 2 feste Boni (Stufe in `mods` wie bei UNIQUES).
export const SET = { minTier: 1, chance: 0.2, perTier: 0.05, max: 0.55, parts: 3 };
export const SETS = [
  { id: 's1', crypt: 'c1', name: 'Tracht der Wäscherinnen',
    b2: { hpPct: 0.06 }, b3: { lastStand: 1 },
    t2: '+6 % Leben', t3: 'Unter halbem Leben heilt dich alles um 40 % stärker',
    parts: [
      { name: 'Gerlindes Schleier', slot: 'helm', mods: { con: 3, lifep: 3 } },
      { name: 'Nasses Leinen', slot: 'chest', mods: { con: 3, armor: 3 } },
      { name: 'Ertränkter Ring', slot: 'ring', mods: { lck: 3, leechp: 3 } },
    ] },
  { id: 's2', crypt: 'c2', name: 'Kutte des Verseuchten',
    b2: { poison: 0.015 }, b3: { venom: 0.3 },
    t2: 'Deine Treffer vergiften', t3: 'Dein Gift heilt dich',
    parts: [
      { name: 'Aldemars Maske', slot: 'amulet', mods: { int: 3, spellp: 3 } },
      { name: 'Faulende Wicklung', slot: 'gloves', mods: { dex: 3, critc: 3 } },
      { name: 'Tritt der Seuche', slot: 'boots', mods: { con: 3, evadep: 3 } },
    ] },
  { id: 's3', crypt: 'c3', name: 'Schürze des Metzgers',
    b2: { crit: 0.05 }, b3: { execHp: 0.15, execute: 0.35 },
    t2: '+5 % Krit-Chance', t3: 'Du schlachtest Feinde schon unter 45 % Leben',
    parts: [
      { name: 'Schlachtschurz', slot: 'chest', mods: { str: 3, thornsp: 3 } },
      { name: 'Griff des Metzgers', slot: 'gloves', mods: { dmg: 3, critd: 3 } },
      { name: 'Hakengurt', slot: 'belt', mods: { con: 3, lifep: 3 } },
    ] },
  { id: 's4', crypt: 'c4', name: 'Ornat des Glöckners',
    b2: { armorPct: 0.1, block: 0.05 }, b3: { tollback: 1, ward: 0.12 },
    t2: '+10 % Rüstung, +5 % Blocken', t3: 'Knochenschild; wer dich betäubt, wird selbst betäubt',
    parts: [
      { name: 'Haube des Glöckners', slot: 'helm', mods: { armor: 3, con: 3 } },
      { name: 'Geborstene Glocke', slot: 'offhand', mods: { blockp: 3, armor: 3 } },
      { name: 'Seilertritt', slot: 'boots', mods: { dex: 3, evadep: 3 } },
    ] },
  { id: 's5', crypt: 'c5', name: 'Krone ohne Träger',
    b2: { dmgPct: 0.06 }, b3: { firstEcho: 1 },
    t2: '+6 % Schaden', t3: 'Dein erster Zauber im Kampf wirkt zweimal',
    parts: [
      { name: 'Reif des Kronenlosen', slot: 'amulet', mods: { int: 2, haste: 3 } },
      { name: 'Gurt der leeren Krone', slot: 'belt', mods: { con: 2, lifep: 3 } },
      { name: 'Ring ohne Stein', slot: 'ring', mods: { lck: 2, dmgp: 3 } },
    ] },
];

export const UNIQUE_CHANCE = 0.6;   // so viele Legendäre sind Einzigartige (sonst: zufällige Legendäre mit Namen)

// Materialien: fallen von bestimmten Monstern, werden von Händlern verlangt.
export const MATS = {
  zahn: 'Ghulzahn', staub: 'Knochenstaub', schwanz: 'Pestrattenschwanz', siegel: 'Kultistensiegel',
  blutstein: 'Blutstein', haar: 'Hexenhaar', asche: 'Höllenasche', leinen: 'Grableinen',
  kronsplitter: 'Kronsplitter',                       // nur aus dem Abgrund – siehe CRAFT.raise
  aschenkern: 'Aschenkern',                           // sehr selten, tief im Abgrund – siehe ASHCORE
};
// --- Schmiede (Halvar): Minispiel für die Wartezeit. Material bestimmt die Rune, Treffer die Güte. ---
export const RUNES = {
  zahn: { stat: 'dmg', name: 'Fangrune', per: 0.6 },        leinen: { stat: 'armor', name: 'Leinenrune', per: 1.5 },
  staub: { stat: 'int', name: 'Staubrune', per: 1 },        schwanz: { stat: 'lck', name: 'Rattenrune', per: 0.7 },
  siegel: { stat: 'haste', name: 'Siegelrune', per: 0.4 },  blutstein: { stat: 'str', name: 'Blutrune', per: 1 },
  haar: { stat: 'dex', name: 'Hexenrune', per: 1 },         asche: { stat: 'con', name: 'Aschenrune', per: 1 },
};
export const FORGE = {
  cost: 2, hits: 5, maxRunes: 2,                        // Material je Versuch, Schläge, Runen je Gegenstand
  speed: [0.9, 1.15, 1.4, 1.7, 2.0],                    // Durchläufe pro Sekunde, je Schlag schneller
  zones: [[0.035, 3, 'Perfekt'], [0.1, 2, 'Gut'], [0.2, 1, 'Ordentlich']],   // Abstand zur Mitte → Punkte
  grades: [{ min: 15, name: 'Makellos', adj: 'Makellose', q: 2.2 }, { min: 12, name: 'Meisterhaft', adj: 'Meisterhafte', q: 1.6 }, { min: 7, name: 'Solide', adj: 'Solide', q: 1 }, { min: 0, name: 'Grob', adj: 'Grobe', q: 0.5 }],
};

// --- Umschmieden (Crafting, Schritt 2): Material = Werkzeug, dazu Gold. Beliebig oft – die Schmiedeglut je Teil ist
// raus (Besitzer 2026-11-19: „nervt“); die Bremse ist das Material (→ E „Schmiedeglut raus, Verkauf gibt Material“).
// Schmiedbar sind die Seltenheiten mit Eintrag in maxAff.
export const CRAFT = {
  maxAff: Object.fromEntries(RARITIES.filter(r => r.sides).map(r => [r.id, r.sides[0] + r.sides[1]])),   // aus den Präfix/Suffix-Plätzen
  gold: [10, 5], goldValue: 0.6,                                   // Gold = a + Gegenstandsstufe × b + Wert × goldValue
  ops: [
    { id: 'seal', name: 'Versiegeln', mat: 'siegel', n: 2, text: 'Ein Bonus bleibt bei allem Folgenden unverändert (einer je Item).' },
    // Gezielt statt gewürfelt (Besitzer 2026-11-25, Mockup mockups/umschmieden.png): `stat` = wirkt nur auf den angetippten
    // Bonus; `pick` = Hinzufügen würfelt so viele Boni als Angebot, der Spieler wählt einen (bezahlt beim Würfeln, das
    // Angebot bleibt am Teil bis zur Wahl – Neuladen bringt kein neues). Preise nach tests/craftmess.mjs.
    { id: 'values', name: 'Wert würfeln', mat: 'staub', n: 3, stat: true, text: 'Der angetippte Bonus bekommt neuen Wert und neue Stufe.' },
    { id: 'chaos', name: 'Ersetzen', mat: 'asche', n: 3, stat: true, text: 'Der angetippte Bonus weicht einem anderen, gewürfelten.' },
    { id: 'add', name: 'Hinzufügen', mat: 'blutstein', n: 3, pick: 3, text: 'Drei Boni zur Wahl – einer kommt drauf.' },
    { id: 'remove', name: 'Tilgen', mat: 'leinen', n: 2, stat: true, text: 'Der angetippte Bonus verschwindet.' },
  ],
  // Erheben: „Hinzufügen" ist bei einem vollen Teil sonst tot. Mit einem Kronsplitter geht es doch –
  // das Teil bekommt einen gewürfelten Bonus und steigt eine Seltenheit auf. Der Preis ist bewusst
  // NICHT Gold (davon hat jeder genug), sondern ein Material, das nur der Abgrund hergibt.
  // Nur magisch → selten: selten → legendär bliebe sonst der kürzeste Weg zu einem Spitzenteil.
  raise: { mat: 'kronsplitter', n: 1, from: { magic: 'rare' } },
  // Fusionieren: ein Bonus wandert von einem gleichartigen Teil herüber, der Spender zerfällt.
  // `max` ist die Bremse – drei von vier Boni müssen weiter aus dem Würfel kommen, sonst baut
  // jeder binnen Tagen dasselbe perfekte Teil und Beute wird bedeutungslos.
  fuse: { max: 1 },
};
// Verkaufen (Besitzer 2026-11-19, Variante A): halber Wert in Gold; legendäre Teile geben zusätzlich 1 Schmiede-Material,
// welches hängt fest am Platz (kein Zufall – der Knopf sagt es vorher). Gemessen (Bot, 14 Tage): 7–17 Material/Tag.
export const SELL = { share: 0.5, legendMat: 1,
  mat: { weapon: 'asche', offhand: 'asche', helm: 'staub', belt: 'staub', chest: 'blutstein', ring: 'blutstein', gloves: 'leinen', boots: 'leinen', amulet: 'siegel' } };


// mix/res: Schadensart und Resistenz (siehe ELEMENTS) – vor dem Kampf sichtbar (Vorbereitung, enemyInfo)
export const MONSTERS = [
  { name: 'Verfaulter Ghul', glyph: 'ghul', mat: 'zahn' }, { name: 'Gefallener', glyph: 'fallen', mat: 'asche', mix: { fire: 0.4 } },
  { name: 'Skelettkrieger', glyph: 'skelett', mat: 'staub', mix: { cold: 0.3 }, res: { phys: 0.1 } }, { name: 'Grabräuber', glyph: 'grabraeuber', mat: 'leinen' },
  { name: 'Pestratte', glyph: 'pestratte', mat: 'schwanz' }, { name: 'Kultist der Glocke', glyph: 'kultist', mat: 'siegel', mix: { fire: 0.4 }, res: { elem: 0.1 } },
  { name: 'Blutfürst', glyph: 'blutfuerst', mat: 'blutstein', mix: { fire: 0.4 } }, { name: 'Sumpfhexe', glyph: 'sumpfhexe', mat: 'haar', mix: { cold: 0.5 }, res: { elem: 0.15 } },
  { name: 'Knochenhund', glyph: 'knochenhund', mat: 'staub', mix: { cold: 0.3 } }, { name: 'Gehäuteter', glyph: 'gehaeuteter', mat: 'blutstein' },
  { name: 'Höllenbrut', glyph: 'hoellenbrut', mat: 'asche', mix: { fire: 0.5 }, res: { elem: 0.2 } }, { name: 'Wiedergänger', glyph: 'wiedergaenger', mat: 'leinen', mix: { cold: 0.4 } },
];

// Streifzüge: Orte mit eigenen Monstern. Freigeschaltet über Stufe.
export const LOCATIONS = [
  { id: 'friedhof', name: 'Friedhof von Vhal', lvl: 1, sec: [20, 45], glut: 5, mobs: ['Verfaulter Ghul', 'Grabräuber', 'Wiedergänger'],
    text: 'Die Gräber sind offen. Nicht alle von außen.' },
  { id: 'muehle', name: 'Die Alte Mühle', lvl: 3, sec: [30, 60], glut: 7, mobs: ['Pestratte', 'Verfaulter Ghul', 'Knochenhund'],
    text: 'Das Mahlwerk dreht sich noch. Niemand weiß, wer es antreibt.' },
  { id: 'katakomben', name: 'Katakomben', lvl: 6, sec: [40, 75], glut: 9, mobs: ['Skelettkrieger', 'Knochenhund', 'Wiedergänger'],
    text: 'Knochen bis zur Decke, sortiert nach einer Ordnung, die kein Mensch erdacht hat.' },
  { id: 'moor', name: 'Moor der Gehenkten', lvl: 10, sec: [45, 90], glut: 11, mobs: ['Sumpfhexe', 'Pestratte', 'Gehäuteter'],
    text: 'An jedem Baum ein Strick. An manchem Strick noch einer.' },
  { id: 'kapelle', name: 'Eingestürzte Kapelle', lvl: 15, sec: [60, 100], glut: 13, mobs: ['Kultist der Glocke', 'Gefallener', 'Wiedergänger'],
    text: 'Die Kultisten beten noch. Nur nicht mehr zu Gott.' },
  { id: 'gruben', name: 'Die Feuergruben', lvl: 22, sec: [70, 120], glut: 15, mobs: ['Höllenbrut', 'Blutfürst', 'Gefallener'],
    text: 'Hier riecht die Luft nach Schwefel und alten Versprechen.' },
];

// --- Händler (Treue-Stufen wie bei Fraktions-Händlern) -------------------
// Treue-Stufe n braucht rep >= need[n] und Spielerstufe >= lvl[n]. Höhere Treue = bessere Ware.
export const TRADERS = {
  halvar: { name: 'Halvar', role: 'Schmied', glyph: 'halvar', lines: ['Der Stahl ist alt. Er schneidet trotzdem. Wie ich.', 'Eisen lügt nicht. Menschen schon.', 'Bring mir Zähne und Asche. Den Rest mache ich.'],
    slots: ['weapon', 'offhand'],
    quote: 'Der Stahl ist alt. Er schneidet trotzdem. Wie ich.', need: [0, 200, 700, 1600], lvl: [1, 6, 14, 22] },
  ysolde: { name: 'Mutter Ysolde', role: 'Kräuterhexe', glyph: 'ysolde', lines: ['Bring mir, was die Toten nicht mehr brauchen, Kind.', 'Alles ist Gift. Es kommt nur darauf an, wer es trinkt.', 'Du riechst nach Grab. Das vergeht nicht mehr.'],
    slots: ['amulet', 'ring', 'belt'],
    quote: 'Bring mir, was die Toten nicht mehr brauchen, Kind.', need: [0, 200, 700, 1600], lvl: [1, 7, 15, 23] },
  kaspar: { name: 'Bruder Kaspar', role: 'Totengräber', glyph: 'kaspar', lines: ['Ich grabe sie ein. Und manchmal wieder aus. Die Rüstung braucht keiner mehr.', 'Sechs Fuß tief hat früher gereicht.', 'Die Toten zahlen schlecht. Aber sie feilschen nicht.'],
    slots: ['helm', 'chest', 'gloves', 'boots'],
    quote: 'Ich grabe sie ein. Und manchmal wieder aus. Die Rüstung braucht keiner mehr.', need: [0, 200, 700, 1600], lvl: [1, 5, 12, 20] },
};
// Weitere Figuren (Portraits in assets/npcs/)
export const NPCS = {
  vargo: { name: 'Vargo', role: 'Grubenmeister', glyph: 'vargo', lines: ['Blut ist die einzige Münze, die hier zählt.', 'Steh wieder auf. Die Menge will mehr.', 'Ich hab Bessere als dich im Sand verscharrt.'] },
  ilse: { name: 'Schwester Ilse', role: 'Kryptenwächterin', glyph: 'ilse', lines: ['Ich halte das Licht. Du hältst die Klinge.', 'Unten schläft nichts mehr. Geh trotzdem.', 'Ich bete für dich. Es hilft nicht oft.'] },
  prophet: { name: 'Der Bettlerprophet', role: 'Seher', glyph: 'prophet', lines: ['Die Glocke schlägt dreimal. Beim dritten Mal stehst auch du nicht mehr auf.', 'Ich sehe dich, Kind der Asche. Ich sehe, was du wirst.', 'Gib mir Brot, und ich sage dir, wo du stirbst.', 'Der Kronenlose trägt dein Gesicht.'] },
};
export const LOYALTY = ['I', 'II', 'III', 'IV'];
// Alle, die Questketten haben (Händler + weitere Figuren)
export const GIVERS = ['halvar', 'ysolde', 'kaspar', 'vargo', 'ilse', 'prophet'];

// Questketten je Händler. Ziele: kill{mob,n} · at{loc,n} · mat{id,n} (wird abgegeben) · give{slot,rar} (Item wird abgegeben)
//   floor{crypt,n} · boss{crypt} · arena{n} · lvl{n}
export const QUESTS = {
  halvar: [
    { id: 'h1', title: 'Rost und Knochen', lvl: 1, text: 'Ghule fressen alles, sogar Eisen. Schlag ein paar tot und bring mir ihre Zähne – ich härte damit den Stahl.',
      obj: [{ kill: 'Verfaulter Ghul', n: 3 }, { mat: 'zahn', n: 3 }], rew: { gold: 40, xp: 60, rep: 40 } },
    { id: 'h2', title: 'Ein Schmied braucht Erz', lvl: 3, text: 'Die Mühle hat ein Eisengitter im Keller. Die Ratten haben es besetzt. Mach sie weg.',
      obj: [{ at: 'muehle', n: 4 }], rew: { gold: 70, xp: 120, rep: 50, item: { slot: 'weapon', rar: 2 } } },
    { id: 'h3', title: 'Prüfung der Klinge', lvl: 5, text: 'Bring mir eine magische Waffe. Ich will sehen, wer da draußen noch schmiedet.',
      obj: [{ give: 'weapon', rar: 2 }], rew: { gold: 120, xp: 200, rep: 70 } },
    { id: 'h4', title: 'Die Ertränkte', lvl: 6, text: 'Mutter Gerlinde hat meinen Lehrling in die Gruft geholt. Bring ihn nicht zurück. Bring sie um.',
      obj: [{ boss: 'c1' }], rew: { gold: 200, xp: 350, rep: 120, item: { slot: 'offhand', rar: 3 } } },
    { id: 'h5', title: 'Blut im Stahl', lvl: 10, text: 'Blutsteine. Fünf. Frag nicht, wozu.',
      obj: [{ mat: 'blutstein', n: 5 }, { kill: 'Gehäuteter', n: 4 }], rew: { gold: 300, xp: 600, rep: 150 } },
    { id: 'h6', title: 'Der Metzger', lvl: 14, text: 'Er trägt eine Klinge, die ich geschmiedet habe. Ich will sie zurück – an deiner Hand.',
      obj: [{ boss: 'c3' }], rew: { gold: 600, xp: 1200, rep: 250, item: { slot: 'weapon', rar: 4 } } },
    { id: 'h7', title: 'Feuer der Tiefe', lvl: 18, text: 'In den Feuergruben brennt eine Esse, heißer als meine. Hol mir ihre Asche.',
      obj: [{ at: 'gruben', n: 6 }, { mat: 'asche', n: 8 }], rew: { gold: 1200, xp: 3000, rep: 400, item: { slot: 'weapon', rar: 4 } } },
  ],
  ysolde: [
    { id: 'y1', title: 'Schwänze für den Kessel', lvl: 1, text: 'Pestrattenschwänze, Kind. Vier Stück. Die Suppe wird sonst dünn.',
      obj: [{ mat: 'schwanz', n: 4 }], rew: { gold: 30, xp: 70, rep: 40, item: { slot: 'ring', rar: 2 } } },
    { id: 'y2', title: 'Grableinen', lvl: 2, text: 'Die Toten tragen bessere Stoffe als die Lebenden. Bring mir welche.',
      obj: [{ mat: 'leinen', n: 4 }, { at: 'friedhof', n: 5 }], rew: { gold: 60, xp: 120, rep: 50 } },
    { id: 'y3', title: 'Was glänzt', lvl: 5, text: 'Ein Amulett mit Zauber darin. Ich will spüren, was es kann.',
      obj: [{ give: 'amulet', rar: 2 }], rew: { gold: 150, xp: 220, rep: 80 } },
    { id: 'y4', title: 'Haare einer Schwester', lvl: 10, text: 'Die Sumpfhexen waren einst meine Schülerinnen. Bring mir, was von ihnen übrig ist.',
      obj: [{ kill: 'Sumpfhexe', n: 4 }, { mat: 'haar', n: 4 }], rew: { gold: 280, xp: 600, rep: 140, item: { slot: 'amulet', rar: 3 } } },
    { id: 'y5', title: 'Der Verseuchte', lvl: 12, text: 'Bruder Aldemar trägt die Pest wie einen Mantel. Nimm sie ihm ab.',
      obj: [{ boss: 'c2' }], rew: { gold: 400, xp: 900, rep: 200 } },
    { id: 'y6', title: 'Stärker als der Tod', lvl: 16, text: 'Werd stärker, Kind. Ich kann dir nicht helfen, wenn du schwach bist.',
      obj: [{ lvl: 18 }, { mat: 'siegel', n: 6 }], rew: { gold: 700, xp: 1500, rep: 300, item: { slot: 'ring', rar: 4 } } },
  ],
  kaspar: [
    { id: 'k1', title: 'Unruhige Gräber', lvl: 1, text: 'Auf meinem Friedhof steht wieder einer auf. Leg ihn hin. Diesmal richtig.',
      obj: [{ at: 'friedhof', n: 3 }], rew: { gold: 35, xp: 60, rep: 40, item: { slot: 'helm', rar: 1 } } },
    { id: 'k2', title: 'Knochenstaub', lvl: 3, text: 'Ich streue ihn auf die Gräber. Hält die Hunde fern. Meistens.',
      obj: [{ mat: 'staub', n: 5 }], rew: { gold: 60, xp: 130, rep: 50 } },
    { id: 'k3', title: 'In die Gruft', lvl: 4, text: 'Ansgar war mein Geselle. Jetzt gräbt er für die andere Seite und versperrt den Weg zur Gruft der Wäscherinnen. Räum ihn fort.',
      obj: [{ floor: 'c1', n: 3 }], rew: { gold: 100, xp: 200, rep: 70, item: { slot: 'chest', rar: 2 } } },
    { id: 'k4', title: 'Blut im Sand', lvl: 6, text: 'In der Grube kämpfen sie um nichts. Kämpf um etwas. Gewinn dreimal.',
      obj: [{ arena: 3 }], rew: { gold: 150, xp: 300, rep: 90 } },
    { id: 'k5', title: 'Die Ordnung der Knochen', lvl: 8, text: 'Die Katakomben sind voll von Wiedergängern. Zu voll.',
      obj: [{ kill: 'Wiedergänger', n: 5 }, { at: 'katakomben', n: 6 }], rew: { gold: 250, xp: 500, rep: 130, item: { slot: 'boots', rar: 3 } } },
    { id: 'k6', title: 'Siegel der Glocke', lvl: 15, text: 'Die Kultisten tragen Siegel. Jedes ist ein Name, der nicht mehr begraben werden kann.',
      obj: [{ kill: 'Kultist der Glocke', n: 6 }, { mat: 'siegel', n: 6 }], rew: { gold: 500, xp: 1300, rep: 220 } },
    { id: 'k7', title: 'Der Glöckner', lvl: 15, text: 'Wenn die Glocke wieder schlägt, stehen alle auf. Alle. Bring ihn zum Schweigen.',
      obj: [{ boss: 'c4' }], rew: { gold: 1500, xp: 4000, rep: 500, item: { slot: 'chest', rar: 4 } } },
  ],
  // Neue Ziele: honor{n} · clear{crypt} · omen{n} · shards{n} · champ (Kampf gegen q.champ)
  vargo: [
    { id: 'v1', title: 'Frisches Fleisch', lvl: 2, text: 'Noch einer, der glaubt, er sei hart. Zeig es dem Sand. Dreimal.',
      obj: [{ arena: 3 }], rew: { gold: 60, xp: 120, rep: 0 } },
    { id: 'v2', title: 'Ein Name im Sand', lvl: 5, text: 'Die Menge kennt dich noch nicht. Hundert Ehre, dann reden wir.',
      obj: [{ honor: 100 }], rew: { gold: 120, xp: 300, rep: 0, item: { slot: 'gloves', rar: 2 } } },
    { id: 'v3', title: 'Alte Schulden', lvl: 12, text: 'Der Metzger hat mir einst ein Auge und einen Bruder genommen. Ich will, dass du ihm etwas nimmst. Alles.',
      obj: [{ boss: 'c3' }, { honor: 250 }], rew: { gold: 500, xp: 1200, rep: 0 } },
    { id: 'v4', title: 'Die Kette', lvl: 16, text: 'Mein alter Champion. Er hat nie verloren, weil er nie gestorben ist. Leg ihn in den Sand.',
      obj: [{ champ: 1 }], champ: { name: 'Die Kette', cls: 'barbarian', lvlAdd: 3 },
      rew: { gold: 900, xp: 2500, rep: 0, perk: { name: 'Champion der Grube', eff: { dmgPct: 0.06, first: 1 } } } },
  ],
  ilse: [
    { id: 'i1', title: 'Das Licht halten', lvl: 2, text: 'Meine Schwestern stiegen in die Gruft und kamen nicht zurück. Der Totengräber hält das Tor. Öffne es mir.',
      obj: [{ floor: 'c1', n: 2 }], rew: { gold: 50, xp: 100, rep: 0 } },
    { id: 'i2', title: 'Leinen für die Toten', lvl: 4, text: 'Sie sollen nicht nackt vor Gott stehen. Bring mir Grableinen.',
      obj: [{ mat: 'leinen', n: 5 }], rew: { gold: 80, xp: 180, rep: 0, item: { slot: 'amulet', rar: 2 } } },
    { id: 'i3', title: 'Die Ertränkte', lvl: 6, text: 'Gerlinde war die Älteste von uns. Erlöse sie. Und bring die Gruft zum Schweigen.',
      obj: [{ clear: 'c1' }], rew: { gold: 200, xp: 450, rep: 0 } },
    { id: 'i4', title: 'Verrat', lvl: 10, text: 'Bruder Aldemar hat uns an die Glocke verkauft. Ich will, dass er es bereut. Lange.',
      obj: [{ boss: 'c2' }, { mat: 'schwanz', n: 6 }], rew: { gold: 400, xp: 1000, rep: 0 } },
    { id: 'i5', title: 'Die Laterne', lvl: 14, text: 'Nimm meine Laterne. Sie hat meine Schwestern nicht gerettet. Vielleicht rettet sie dich.',
      obj: [{ clear: 'c3' }], rew: { gold: 600, xp: 1800, rep: 0, perk: { name: 'Ilses Laterne', eff: { crit: 0.04, hpPct: 0.06 } } } },
  ],
  prophet: [
    { id: 'p1', title: 'Das erste Omen', lvl: 3, text: 'Ich sehe Dinge, Kind. Morgen, heute, gestern. Geh dorthin, wo mein Omen fällt, und sieg.',
      obj: [{ omen: 1 }], rew: { gold: 40, xp: 80, rep: 0 } },
    { id: 'p2', title: 'Der erste Splitter', lvl: 3, text: 'Die Glocke zerbrach, als du starbst. Ihre Splitter liegen bei den Herren der Krypten. Hol mir einen.',
      obj: [{ shards: 1 }, { omen: 2 }], rew: { gold: 150, xp: 400, rep: 0 } },
    { id: 'p3', title: 'Was du warst', lvl: 10, text: 'Du warst kein Bauer, Kind. Du hast eine Krone getragen. Sammle weiter, und du wirst dich erinnern.',
      obj: [{ shards: 2 }, { omen: 4 }], rew: { gold: 400, xp: 1200, rep: 0 } },
    { id: 'p4', title: 'Die vier Splitter', lvl: 15, text: 'Vier Splitter. Vier Herren. Dann öffnet sich die Glocke – und darin wartet, wer du warst.',
      obj: [{ shards: 4 }, { omen: 6 }], rew: { gold: 800, xp: 3000, rep: 0 } },
    { id: 'p5', title: 'Der Kronenlose', lvl: 18, text: 'Er trägt dein Gesicht. Er trägt deine Krone. Fälle ihn. Dann entscheide, was aus der Glocke wird.',
      obj: [{ boss: 'c5' }], rew: { gold: 2000, xp: 6000, rep: 0 },
      choice: [
        { id: 'break', label: 'Die Glocke zerbrechen', text: 'Die Glocke schweigt für immer. Die Toten schlafen.', title: 'Glockenbrecher', perk: { name: 'Glockenbrecher', eff: { dmgPct: 0.1, crit: 0.05 } } },
        { id: 'crown', label: 'Die Krone nehmen', text: 'Du setzt sie auf. Sie passt. Sie hat immer gepasst.', title: 'Der Kronenlose', perk: { name: 'Krone der Asche', eff: { hpPct: 0.15, leech: 0.08 } } },
      ] },
    // Nach dem Finale: der zweite und dritte Schlag der Glocke (Albtraum, Hölle)
    { id: 'p6', title: 'Der zweite Schlag', lvl: 24, text: 'Die Glocke schweigt nicht lange, Kind. Die Toten stehen wieder auf – stärker. Fälle die Ertränkte und den Verseuchten ein zweites Mal.',
      obj: [{ bossd: 'c1', d: 1 }, { bossd: 'c2', d: 1 }], rew: { gold: 2500, xp: 8000, rep: 0, perk: { name: 'Zweiter Atem', eff: { hpPct: 0.08 } } } },
    { id: 'p7', title: 'Albtraum der Glocke', lvl: 34, text: 'Er ist zurück. Mit deinem Gesicht, mit deiner Krone. Und diesmal kennt er dich.',
      obj: [{ bossd: 'c5', d: 1 }], rew: { gold: 6000, xp: 20000, rep: 0, perk: { name: 'Narbe der Glocke', eff: { dmgPct: 0.1, crit: 0.03 } } } },
    { id: 'p8', title: 'Der letzte Schlag', lvl: 46, text: 'In der Hölle gibt es keine Glocke mehr. Nur dich. Und ihn.',
      obj: [{ bossd: 'c5', d: 2 }], rew: { gold: 15000, xp: 50000, rep: 0, title: 'Der Unvergängliche', perk: { name: 'Unvergänglich', eff: { hpPct: 0.15, leech: 0.05 } } } },
  ],
};

// --- Tägliches Omen des Bettlerpropheten ---
// Ein Ort pro Tag bekommt einen Effekt. Erster Sieg dort an diesem Tag = Omen erfüllt (zählt für die Questkette).
export const OMENS = [
  { id: 'elite', text: 'Ein Fürst der Toten erhebt sich. Wer ihn fällt, wird reich beschenkt.', short: 'Elite-Gegner, sichere seltene Beute', diff: 1.15, gold: 2, xp: 2, loot: 3 },
  { id: 'harvest', text: 'Die Erde gibt heute doppelt, was sie nimmt.', short: 'Doppelte Materialien', mats: 2 },
  { id: 'gold', text: 'Die Toten tragen heute Gold in den Taschen.', short: 'Doppeltes Gold', gold: 2 },
  { id: 'wisdom', text: 'Wer heute dort kämpft, erinnert sich an mehr, als er weiß.', short: '+50% Erfahrung', xp: 1.5 },
];

// --- Dienste der Händler (Materialien haben einen festen Zweck) ---
export const SERVICES = {
  halvar: [
    { id: 'sharpen', name: 'Waffe schärfen', slot: 'weapon', max: 5, per: 0.12, stat: 'dmg',
      cost: [{ zahn: 2 }, { zahn: 4 }, { blutstein: 2 }, { blutstein: 4 }, { asche: 4 }], gold: [20, 60, 150, 350, 800] },
    { id: 'order', name: 'Waffe bestellen', cost: [{ staub: 3 }], gold: [60], perLvl: 12 },
  ],
  kaspar: [
    { id: 'reinforce', name: 'Rüstung verstärken', slot: 'chest', max: 5, per: 0.15, stat: 'armor',
      cost: [{ leinen: 2 }, { leinen: 4 }, { staub: 4 }, { siegel: 3 }, { asche: 4 }], gold: [20, 60, 150, 350, 800] },
  ],
  ysolde: [
    // Glücksgriff: zufälliges, meist magisches Stück – Gold-Senke wie das Glücksspiel bei Gheed/Anya
    { id: 'gamble', name: 'Glücksgriff', cost: [{}], gold: [60], perLvl: 45 },
  ],
};

// --- Tutorial: Schritte mit Bedingung (ausgewertet in main.js) ---
export const TUTORIAL = [
  { tab: 'traders', when: 'view:traders', text: 'Du bist erwacht. Drei Gestalten warten am Friedhofstor. Tippe unten auf <b>Händler</b>.' },
  { tab: 'traders', when: 'view:kaspar', text: 'Jeder Händler hat Aufträge. Sieh dir <b>Bruder Kaspar</b> an – er will, dass du seinen Friedhof säuberst.' },
  { tab: 'trips', when: 'view:act', text: 'Öffne <b>Streifzug</b> und tippe auf <b>Akt I</b>. Jedes Gebiet ist ein Kampf – neue kosten nichts.' },
  { tab: 'trips', when: 'wins', text: 'Tippe auf das leuchtende Gebiet und dann <b>Kämpfen</b>. Ganz oben wartet der Boss des Akts.' },
  { tab: 'hero', when: 'spent', text: 'Beute landet im <b>Beutel</b>. Unter <b>Held</b> antippen und anlegen. Unter <b>Werte</b> verteilst du deine Punkte.' },
  { tab: 'traders', when: 'turnin', text: 'Erfülle den Auftrag und gib ihn beim Händler <b>ab</b>. Das bringt Ruf – mit Treue wird seine Ware besser.' },
  { tab: 'crypt', when: 'view:crypt', text: 'Jeder Akt-Boss öffnet eine <b>Krypta</b>. Ihr Boss lässt sich Stufe um Stufe schwerer bezwingen – mit immer besserer Beute.' },
  { tab: 'trips', when: 'view:npc', text: 'Der <b>Bettlerprophet</b> verkündet jeden Tag ein Omen. Tippe auf ihn, wenn du ihn siehst. Viel Glück, Verdammter.' },
];

// --- Risiko & Ertrag bei Streifzügen ---
// Spur wählen (Vorbild: selbst gewählte, schwerere Kämpfe geben bessere Beute)
export const TRACKS = [
  { id: 'safe', name: 'Leichte Spur', diff: 0.85, lvlAdd: -1, rew: 0.7, loot: 0.4, text: 'Sicher, aber mager.' },
  { id: 'norm', name: 'Spur', diff: 1.0, lvlAdd: 0, rew: 1.0, loot: 0.55, text: 'Der übliche Weg.' },
  { id: 'blood', name: 'Blutige Spur', diff: 1.55, lvlAdd: 5, atLeastPlayer: 4, rew: 1.6, loot: 0.9, minRarity: 2, text: 'Gegner über deiner Stufe. Mehr Lohn, magische Beute – wenn du überlebst.' },
];
// Tiefer gehen: Beute ist erst gesichert, wenn du heimkehrst (Vorbild: Schatz zählt erst im Hafen)
// Jede Tiefe kostet die Glut des Ortes, Gegner +2 Stufen und +12 %, Lohn +25 %. Gold, Erfahrung und Beute erst daheim.
export const DELVE = { max: 5, lvlPer: 3, diffPer: 0.15, rewPer: 0.3 };

// --- Steckbriefe: täglich 3 Aufträge (Endspiel, wiederholbar). Angeboten wird nur, was der Held schon erreichen kann (bounties() in state.js) ---
export const BOUNTIES = [
  { id: 'kill', n: 5, text: (t) => `Töte ${t}` },
  { id: 'zones', n: 8, text: () => 'Siege in den Akten' },
  { id: 'dom', n: 3, text: () => 'Gewinne Kämpfe überlegen' },
  { id: 'elite', n: 2, text: () => 'Besiege Elite-Gegner' },        // erst, wenn ein Elite-Gebiet erreicht ist
  { id: 'crypt', n: 2, text: () => 'Siege in den Krypten' },        // erst, wenn eine Krypta offen ist
  { id: 'arena', n: 2, text: () => 'Siege in der Grube' },
];

export const CFG = {
  // Vom Besitzer gebeten („ein bisschen, nicht zu viel“): schneller nochmal zurück und gezielt farmen können.
  // Gemessen (6 Klassen × 8 Läufe × 12 Tage): Farm-Kämpfe 384 → 517, Akt VI nur rund einen Tag früher.
  // Der Takt ist das Warten zwischen zwei Sitzungen, maxGlut die Kämpfe je Sitzung (Feuergruben 15: 8 → 10).
  maxGlut: 150, glutRegenMin: 3,      // 1 Glut pro x Minuten (Echtzeit)
  // --- Kurven (nach Bot-Review: Anfang strecken, Zahlen flach halten) ---
  xpBase: 90, xpExp: 1.75,            // EP für nächste Stufe = xpBase * Stufe^xpExp
  hpBase: 3, hpPerLvl: 0.25,          // Leben = Kon × Klassenfaktor × (hpBase + Stufe × hpPerLvl)  (Spieler und Monster)
  evadeStreak: 2,                     // höchstens so viele Ausweicher in Folge, dann trifft der nächste Angriff sicher (Hieb und Zauber)
  chanceN: 200,                       // Probe-Kämpfe je Siegchance (gekoppelt, → E „Siegchance gekoppelt“ in kampf.md): schlimmster Fall ~50 ms, 4× gedrosselt ~120 ms
  mainDiv: 20,                        // Schaden × (1 + Hauptattribut / mainDiv)
  affixBase: 1, affixPerLvl: 0.5,     // Runen der Schmiede: per × (affixBase + Heldenstufe × affixPerLvl) – Item-Boni haben feste Stufen (TIERS)
  lastStandMul: 1.4,                  // Set „Tracht“ (3 Teile): Heilung unter halbem Leben ×1,4 (war ×2 – mit mehr eigenen Punkten zu stark, Welle 1a)
  uniqMult: 1.5,                      // Einzigartige: Werte ihrer festen Boni × 1,5 (weniger Boni als ein seltenes Teil, dafür stärkere)
  uniqTierUp: 1,                      // Einzigartige + Set-Teile: feste Boni bis eine Stufe über dem, was die Gegenstandsstufe freischaltet
  dropMult: 1.2,                      // Welle 1a: 20 % mehr Gegenstands-Drops (Chancen × dropMult, feste Anzahlen im Mittel × dropMult; Abgrund nicht)
  rareMinLvl: 4, legendaryMinLvl: 10, // darunter keine/kaum seltene bzw. legendäre Beute
  bossHp: 2.2, bossDiff: 1.35,
  rushPerLvl: 3,                      // Eilen: 1 Gold je 20 s Restzeit × (1 + Stufe / rushPerLvl)
  attrPerLevel: 9, startPoints: 5,       // Attributpunkte pro Stufenaufstieg
  wayCostPerLvl: 6,                  // Zauber-Weg umentscheiden: Gold je Stufe (erste Wahl gratis)
  respecPerLvl: 30,                        // Läuterung: Gold je Stufe (erste gratis)
  cryptCdSec: 180, arenaCdSec: 300, arenaGlut: 4,                         // Pause nach jedem Krypta-Kampf (Prototyp)
  shopSize: 6, shopRefreshSec: 600, matChance: 0.7,
  lootChance: 0.55, critBase: 0.05,
  softKnee: 0.7,                      // Ausweichen/Krit: bis 70 % der Grenze voll, darüber weicher Deckel (combat.js softCap)
  strArmor: 0.5,                      // Stärke gibt jeder Klasse Rüstung (je Punkt)
  spellK: 60,                         // Zauberkraft = 1 + Int / (Int + spellK)  (sättigt, max. ×2)
  monHp: 1.15, monDmg: 0.9,         // Welle 2a: 1,0 → 0,9 – Feuer/Eis gehen jetzt an der Rüstung vorbei (D2/PoE), sonst +~19 % Schaden ohne Resi
  monGrow: 2.7,                       // Monster-Attribute je Stufe (3 + Stufe × monGrow); power() und die Werte-Ansicht rechnen mit demselben Wert
  hemoBleed: 0.85,                    // Ausbluten: Grundstärke des Blutens je Treffer (dafür nie kritisch)
  // Kampfkraft-Anzeige (Zahl, ▲, Vergleich, Einblendung, „+N“ an Attributen) – vom Besitzer vorerst ausgeschaltet (2026-11-24): sie überschätzt
  // Heilung (→ E „Kampfkraft überschätzt Heilung“). Die Rechnung läuft weiter (Bot, Händler-Auswahl). Wieder an: true.
  showPower: false,
  igniteTurns: 3,                     // Brand (Schlüsselstein Verbrennung): wie viele Runden der Brand des Zaubers läuft
  resCap: 0.75, resCapPhys: 0.5,      // Deckel Elementar-Resi 75 % (D2/PoE), Phys.-Resi 50 % (D2 „Schaden reduziert“, stapelt mit Rüstung)
  wpnLvlAdd: 10,                      // Waffen-Grundschaden wirkt höchstens wie Gegenstandsstufe Heldenstufe + 10 (Tooltip zeigt „wirksam“)
  offWeapon: 0.7, offWeaponSpell: 0.6,  // fremde Waffe (nicht die der Klasse): Schaden ×0,7, Zauberkraft ×0,6                // Ausgleich für Zauber (Monster-Leben/-Schaden)
};

// --- Attribute: was bringt ein Punkt? (Text für Werte-Ansicht) ---
export const ATTR_INFO = {   // ohne "Schaden" – den bringt jeweils das Hauptattribut der Klasse (wird in der Ansicht vorangestellt)
  str: 'Rüstung', dex: 'Ausweichen · Erstschlag', int: 'Zauberkraft', con: 'Leben', lck: 'Krit · bessere Beute',
};

// --- Zauber: wirken im Auto-Kampf von selbst, alle `every` eigenen Züge (statt eines normalen Hiebs) ---
// kind: hit (mult × Hieb, halbe Rüstung, nicht blockbar) | multi (hits × mult) | stun (hit + betäubt) | heal (pct Leben)
//       shield (pct Leben als Schild) | dot (Gift: mult × Hieb je Runde) | buff (Schaden +v für den Kampf) | mark (hit, doppelt unter 50 %)
export const SPELLS = {
  barbarian: [
    { id: 'schrei', fx: '#c0301e', name: 'Kriegsschrei', lvl: 1, every: 4, kind: 'buff', v: 0.2, max: 0.4, text: 'Schaden +20 % bis Kampfende (bis +40 %)' },
    { id: 'wirbel', fx: '#c0301e', name: 'Wirbelwind', lvl: 8, every: 5, kind: 'multi', hits: 3, mult: 0.7, text: '3 Hiebe zu je 70 %' },
    { id: 'blutdurst', fx: '#c0301e', name: 'Blutdurst', lvl: 18, every: 6, kind: 'heal', pct: 0.15, text: 'heilt 15 % Leben' },
  ],
  paladin: [
    { id: 'schlag', fx: '#e2c07a', name: 'Heiliger Schlag', lvl: 1, every: 3, kind: 'hit', mult: 1.6, text: '160 % Schaden, nicht blockbar' },
    { id: 'gebet', fx: '#e2c07a', name: 'Gebet', lvl: 8, every: 5, kind: 'heal', pct: 0.12, text: 'heilt 12 % Leben' },
    { id: 'hammer', fx: '#e2c07a', name: 'Gottes Hammer', lvl: 18, every: 6, kind: 'stun', mult: 2.2, text: '220 % Schaden und betäubt' },
  ],
  assassin: [
    { id: 'schatten', fx: '#9a5ad8', name: 'Schattenstich', lvl: 1, every: 3, kind: 'hit', mult: 1.7, text: '170 % Schaden, nicht blockbar' },
    { id: 'giftklinge', fx: '#7fd13a', name: 'Giftklinge', lvl: 8, every: 4, kind: 'dot', mult: 0.35, text: 'Gift: 35 % eines Hiebs je Runde' },
    { id: 'mal', fx: '#9a5ad8', name: 'Todesmal', lvl: 18, every: 5, kind: 'mark', mult: 1.6, text: '160 %, doppelt gegen Verwundete' },
  ],
  huntress: [
    { id: 'gezielt', fx: '#c9a060', name: 'Gezielter Schuss', lvl: 1, every: 3, kind: 'hit', mult: 1.6, text: '160 % Schaden, nicht blockbar' },
    { id: 'hagel', fx: '#a8b090', name: 'Pfeilhagel', lvl: 8, every: 5, kind: 'multi', hits: 4, mult: 0.5, text: '4 Pfeile zu je 50 %' },
    { id: 'falle', fx: '#a0703a', name: 'Fangeisen', lvl: 18, every: 6, kind: 'stun', mult: 1.4, text: '140 % Schaden und betäubt' },
  ],
  sorceress: [
    { id: 'feuerball', el: 'fire', fx: '#ff7a1a', name: 'Feuerball', lvl: 1, every: 3, kind: 'hit', mult: 1.7, text: '170 % Schaden, nicht blockbar' },
    { id: 'frost', el: 'cold', fx: '#9fd8ff', name: 'Frostnova', lvl: 8, every: 5, kind: 'stun', mult: 1.2, text: '120 % Schaden und betäubt' },
    { id: 'meteor', el: 'fire', fx: '#ff5a10', name: 'Meteor', lvl: 18, every: 7, kind: 'hit', mult: 3.5, text: '350 % Schaden' },
  ],
  witch: [
    { id: 'speer', fx: '#7fd13a', name: 'Knochenspeer', lvl: 1, every: 3, kind: 'hit', mult: 1.6, text: '160 % Schaden, nicht blockbar' },
    { id: 'seuche', fx: '#7fd13a', name: 'Seuche', lvl: 8, every: 4, kind: 'dot', mult: 0.35, text: 'Gift: 35 % eines Hiebs je Runde' },
    { id: 'wall', fx: '#d8c8a0', name: 'Knochenwall', lvl: 18, every: 6, kind: 'shield', pct: 0.2, text: 'Schild aus 20 % Leben' },
  ],
};

// --- Kampfbewertung: wie souverän der Sieg war (Restleben) → Bonus auf Gold und Beute-Chance (nicht EP: Tempo bleibt) ---
export const GRADES = [
  { id: 'dom', name: 'Überlegen', min: 0.7, bonus: 0.3 },
  { id: 'safe', name: 'Sicher', min: 0.35, bonus: 0.1 },
  { id: 'close', name: 'Knapp', min: 0, bonus: 0 },
];

// --- Fortschritt ---------------------------------------------------------
// Ränge: sichtbarer Aufstieg (Titel + Portraitrahmen)
export const RANKS = [
  { lvl: 1, title: 'Verdammter', frame: 'iron' },
  { lvl: 5, title: 'Grabgänger', frame: 'iron' },
  { lvl: 10, title: 'Aschenträger', frame: 'bronze' },
  { lvl: 15, title: 'Knochenbrecher', frame: 'bronze' },
  { lvl: 20, title: 'Seelenschinder', frame: 'silver' },
  { lvl: 30, title: 'Glockenbrecher', frame: 'gold' },
  { lvl: 40, title: 'Der Kronenlose', frame: 'blood' },
];

// Effekt-Schlüssel (alle in combat.js / state.stats ausgewertet):
// dmgPct, hpPct, armorPct (Multiplikator), crit, evade, block, leech, bleed, rage, pen, regen, thorns, execute, first
export const EFFECT_NAMES = { dmgPct: 'Schaden', hpPct: 'Leben', armorPct: 'Rüstung', crit: 'Krit-Chance', evade: 'Ausweichen',
  block: 'Blocken', leech: 'Lebensraub', bleed: 'Bluten bei Krit', rage: 'Raserei', pen: 'Rüstung ignorieren', regen: 'Regeneration/Runde',
  thorns: 'Dornen', execute: 'Schaden gg. Sterbende', first: 'Erstschlag', poison: 'Gift', toll: 'Betäuben', haste: 'Zaubertempo', echo: 'Zauber-Nachhall', ward: 'Knochenschild bei Kampfbeginn',
  lastStand: '+40 % Heilung unter halbem Leben', venom: 'Dein Gift heilt dich', execHp: 'Henker-Schwelle',
  vengeance: 'Mehr Schaden, je weniger Leben', zeal: 'Jeder dritte Hieb trifft zweimal', siphon: 'Krit heilt dich',
  bulwark: 'Blocken gibt Schild', shred: 'Krit bricht Rüstung', secondWind: 'Heilt einmal, wenn es eng wird', lastBreath: 'Überlebt einen tödlichen Treffer',
  nohealSelf: 'Du kannst dich nicht heilen',
  hemorrhage: 'Bluten bei jedem Treffer – dafür nie kritisch', evadeCap: 'Ausweich-Grenze', critDmg: 'Krit-Schaden',
  tollback: 'Betäubung prallt zurück', firstEcho: 'Erster Zauber wirkt zweimal',
  spellPct: 'Zauberschaden', ignite: 'Jeder Zauber setzt in Brand', physRes: 'Phys.-Resi', elemRes: 'Elem.-Resi', elemPen: 'Elementar-Durchdringung' };

// --- Das Brett (neuer Talentbaum) ---
// Drei Zweige, von unten nach oben: kleine Knoten, dazwischen zwei Notable (ändern eine Regel),
// oben ein Schlüsselstein, der etwas Großes gibt und etwas wegnimmt. Zwei Brücken verbinden
// benachbarte Zweige: man erreicht den Schlüsselstein des Nachbarn, zahlt den Weg aber mit Punkten.
// Zur Ausweich-Grenze: zwei Teile mit hohem „Ausweichen“ (gemessen 15 % + 32 %) setzen einen Helden
// schon auf CAPS.evade (0,5) – dann bringt jeder weitere Punkt null. Im Mittel über mehrere
// Ausrüstungswürfe steht er aber bei ~0,09, und Ausweichen trägt deutlich. Darum beides: kleine
// Ausweich-Knoten UND zwei Knoten, die die Grenze anheben (Verwischt, Schattenform) – die machen
// genau die Ausrüstung wertvoll, die sonst am Deckel verpufft.
// Knappheit ist Absicht: 41 Ränge gegen ~24 Punkte (der Bot beendet die Geschichte auf Stufe 24),
// also rund 60 % erreichbar. Ein Schlüsselstein kostet 10 Punkte in seiner Spalte – zwei davon sind fast alles.
// Eine Klasse ohne Eintrag hier benutzt weiter TALENTS.
const N = (id, name, max, eff, text, kind = '') => ({ id, name, max, eff, text, kind });
export const TREE = {
  assassin: {
    cols: [
      { name: 'Klinge', nodes: [
        N('ak1', 'Schärfe', 3, { dmgPct: 0.065 }, 'Mehr Schaden.'),
        N('ak2', 'Offene Wunden', 1, { bleed: 0.25 }, 'Kritische Treffer lassen tiefe Wunden.', 'nt'),
        N('ak3', 'Ätzend', 3, { pen: 0.05 }, 'Zersetzt Rüstung.'),
        N('ak4', 'Todesstoß', 1, { execute: 0.6, execHp: 0.28 }, 'Gegen Sterbende +60 % Schaden – und der Henker schlägt schon bei 58 % Leben zu.', 'nt'),
        N('ak5', 'Schnitt', 2, { dmgPct: 0.05 }, 'Mehr Schaden.'),
        N('ak6', 'Ausbluten', 1, { hemorrhage: 1 }, 'Jeder Treffer lässt bluten – 85 % des Schadens plus dein Bluten-Bonus. Dafür triffst du nie mehr kritisch.', 'key'),
      ] },
      { name: 'Schatten', nodes: [
        N('as1', 'Nebelschritt', 3, { evade: 0.045 }, 'Ausweichen.'),
        N('as2', 'Verwischt', 1, { evadeCap: 0.08, evade: 0.05, first: 1 }, 'Deine Ausweich-Grenze steigt von 50 % auf 58 % – erst damit zählt dein Ausweichen aus der Ausrüstung. Und du schlägst zuerst zu.', 'nt'),
        N('as3', 'Flinkheit', 3, { hpPct: 0.06 }, 'Mehr Leben.'),
        N('as4', 'Zweiter Atem', 1, { secondWind: 0.22 }, 'Heilt dich einmal, wenn du unter 30 % fällst.', 'nt'),
        N('as5', 'Hinterhalt', 2, { dmgPct: 0.05 }, 'Aus dem Dunkel trifft es härter.'),
        N('as6', 'Schattenform', 1, { evade: 0.3, evadeCap: 0.2, hpPct: -0.15 }, 'Du weichst viel öfter aus, und deine Grenze steigt von 50 % auf 70 % – erst damit kommt alles an. Dafür bist du nur noch ein Hauch von einem Körper.', 'key'),
      ] },
      { name: 'Gift', nodes: [
        N('ag1', 'Toxin', 3, { crit: 0.024 }, 'Krit-Chance.'),
        N('ag2', 'Ätzende Wunde', 1, { shred: 0.25 }, 'Kritische Treffer brechen Rüstung heraus.', 'nt'),
        N('ag3', 'Zersetzung', 3, { pen: 0.047 }, 'Ignoriert Rüstung.'),
        N('ag4', 'Aderlass', 1, { siphon: 0.06 }, 'Jeder Krit heilt dich.', 'nt'),
        N('ag5', 'Lotusblatt', 2, { critDmg: 0.15 }, 'Krit-Schaden.'),
        N('ag6', 'Schwarzer Lotus', 1, { venom: 1, poison: 0.17, dmgPct: 0.2, armorPct: -0.25 }, 'Jeder Treffer vergiftet, und das Gift nährt dich. Dafür zerfrisst es auch deine Rüstung.', 'key'),
      ] },
    ],
    // Brücken sitzen neben der Reihe, die sie öffnen. Voll ausgebaut gilt sie als Vorgänger für beide Seiten.
    bridges: [
      { id: 'ab1', name: 'Narbe des Schattens', a: 0, b: 1, row: 2, max: 4, eff: { dmgPct: 0.027, evade: 0.012 }, text: 'Verbindet Klinge und Schatten.' },
      { id: 'ab2', name: 'Kalter Schweiß', a: 1, b: 2, row: 3, max: 4, eff: { hpPct: 0.027, crit: 0.012 }, text: 'Verbindet Schatten und Gift.' },
    ],
  },
  // Die Zauberin kämpft über ihre Zauber, nicht über den Stab: ihre Zweige hängen deshalb an
  // Zauberschaden (spellPct), Zaubertempo (haste) und Nachhall (echo) – Werte, die beim Hieb nichts tun.
  // Feuer gibt Schaden und nimmt Rüstung, Frost gibt Panzer und nimmt Tempo, Arkan gibt Tempo und nimmt Leben.
  sorceress: {
    cols: [
      { name: 'Feuer', nodes: [
        N('sf1', 'Glut', 3, { spellPct: 0.075 }, 'Deine Zauber brennen heißer.'),
        N('sf2', 'Zündschnur', 1, { firstEcho: 1 }, 'Der erste Zauber eines Kampfs wirkt zweimal.', 'nt'),
        N('sf3', 'Flammenzunge', 3, { crit: 0.024 }, 'Krit-Chance.'),
        N('sf4', 'Schmerzrausch', 1, { vengeance: 0.4 }, 'Je weniger Leben du hast, desto wilder brennt es – bis zu 40 % mehr Schaden.', 'nt'),
        N('sf5', 'Lohe', 2, { spellPct: 0.08 }, 'Deine Zauber brennen heißer.'),
        N('sf6', 'Verbrennung', 1, { ignite: 0.7, spellPct: 0.1, nohealSelf: 1 }, 'Jeder Zauber setzt den Gegner in Brand: 70 % des Schadens noch drei Runden lang. Dafür wächst keine Wunde mehr zu – kein Trank, kein Lebensraub, keine Zuflucht heilt dich noch.', 'key'),
      ] },
      { name: 'Frost', nodes: [
        N('sk1', 'Eishaut', 3, { block: 0.045 }, 'Das Eis fängt Hiebe ab.'),
        N('sk2', 'Frostpanzer', 1, { ward: 0.2 }, 'Du beginnst jeden Kampf mit einem Schild aus 20 % deines Lebens.', 'nt'),
        N('sk3', 'Klirrende Kälte', 3, { hpPct: 0.055 }, 'Mehr Leben.'),
        N('sk4', 'Kältestarre', 1, { toll: 1 }, 'Jeder dritte Treffer von dir betäubt den Gegner.', 'nt'),
        N('sk5', 'Reif', 2, { thorns: 0.055 }, 'Wer dich trifft, schneidet sich.'),
        N('sk6', 'Eisgrab', 1, { ward: 0.15, hpPct: 0.18, block: 0.12, haste: -0.3 }, 'Du stehst wie ein Eisblock: ein Schild aus 15 % deines Lebens, mehr Leben, mehr Blocken. Dafür laden deine Zauber um ein Drittel langsamer.', 'key'),
      ] },
      { name: 'Arkan', nodes: [
        N('sa1', 'Mana', 3, { spellPct: 0.06 }, 'Deine Zauber wiegen schwerer.'),
        N('sa2', 'Manabrand', 1, { haste: 0.15 }, 'Deine Zauber laden 15 % schneller.', 'nt'),
        N('sa3', 'Fokus', 3, { haste: 0.05 }, 'Zaubertempo.'),
        N('sa4', 'Zuflucht', 1, { secondWind: 0.27 }, 'Heilt dich einmal, wenn du unter 30 % fällst.', 'nt'),
        N('sa5', 'Seelenzehrung', 2, { leech: 0.035 }, 'Lebensraub.'),
        N('sa6', 'Nachhall', 1, { echo: 0.5, haste: 0.12, spellPct: 0.15, hpPct: -0.05 }, 'Jeder zweite Zauber wirkt ein zweites Mal, alle laden schneller und wiegen schwerer. Dafür hält dein Körper etwas weniger aus.', 'key'),
      ] },
    ],
    bridges: [
      { id: 'sb1', name: 'Dampf', a: 0, b: 1, row: 2, max: 4, eff: { spellPct: 0.025, hpPct: 0.022 }, text: 'Verbindet Feuer und Frost.' },
      { id: 'sb2', name: 'Leere', a: 1, b: 2, row: 3, max: 4, eff: { hpPct: 0.02, haste: 0.0125 }, text: 'Verbindet Frost und Arkan.' },
    ],
  },
};
// Talentbaum je Klasse: 3 Pfade × 3 Stufen. Stufe n braucht 1 Rang im Talent davor + Charakterstufe TIER_LVL[n].
export const TIER_LVL = [2, 8, 16];
const T = (id, name, max, eff, desc) => ({ id, name, max, eff, desc });
export const TALENTS = {
  barbarian: [
    { name: 'Blutrausch', nodes: [T('b1', 'Zorn', 10, { dmgPct: 0.05 }, 'Mehr Schaden.'), T('b2', 'Ungebändigt', 3, { rage: 0.08 }, 'Öfter Raserei.'), T('b3', 'Schlächter', 1, { execute: 0.5 }, '+50% gegen Feinde unter 30% Leben.')] },
    { name: 'Fell & Narbe', nodes: [T('b4', 'Dickes Fell', 10, { hpPct: 0.06 }, 'Mehr Leben.'), T('b5', 'Narbengewebe', 3, { regen: 0.015 }, 'Heilt jede Runde.'), T('b6', 'Unsterblich', 1, { hpPct: 0.2, thorns: 0.15 }, 'Leben und Dornen.')] },
    { name: 'Kriegsschrei', nodes: [T('b7', 'Brüllen', 9, { evade: 0.015 }, 'Feinde zögern.'), T('b8', 'Knochenbrecher', 3, { pen: 0.1 }, 'Zerschmettert Rüstung.'), T('b9', 'Ahnenruf', 1, { crit: 0.1, dmgPct: 0.1 }, 'Die Ahnen führen die Axt.')] },
  ],
  paladin: [
    { name: 'Bollwerk', nodes: [T('p1', 'Schildwall', 5, { armorPct: 0.08 }, 'Mehr Rüstung.'), T('p2', 'Standhaft', 3, { block: 0.04 }, 'Öfter blocken.'), T('p3', 'Eiserne Buße', 1, { thorns: 0.3 }, 'Wirft 30% des Schadens zurück.')] },
    { name: 'Heiliges Licht', nodes: [T('p4', 'Gebet', 5, { hpPct: 0.06 }, 'Mehr Leben.'), T('p5', 'Segen', 3, { regen: 0.015 }, 'Heilt jede Runde.'), T('p6', 'Martyrium', 1, { leech: 0.15 }, 'Lebensraub.')] },
    { name: 'Richtschwert', nodes: [T('p7', 'Urteil', 5, { dmgPct: 0.05 }, 'Mehr Schaden.'), T('p8', 'Sonnenstahl', 3, { pen: 0.1 }, 'Ignoriert Rüstung.'), T('p9', 'Vergeltung', 1, { crit: 0.12 }, 'Kritische Urteile.')] },
  ],
  assassin: [
    { name: 'Klinge', nodes: [T('a1', 'Schärfe', 5, { dmgPct: 0.05 }, 'Mehr Schaden.'), T('a2', 'Offene Wunden', 3, { bleed: 0.12 }, 'Stärkeres Bluten.'), T('a3', 'Todesstoß', 1, { execute: 0.6 }, '+60% gegen Sterbende.')] },
    { name: 'Schatten', nodes: [T('a4', 'Nebelschritt', 5, { evade: 0.02 }, 'Ausweichen.'), T('a5', 'Lautlos', 3, { first: 1, crit: 0.02 }, 'Schlägt zuerst zu.'), T('a6', 'Schattenform', 1, { evade: 0.1 }, 'Kaum zu treffen.')] },
    { name: 'Gift', nodes: [T('a7', 'Toxin', 5, { crit: 0.015 }, 'Krit-Chance.'), T('a8', 'Ätzend', 3, { pen: 0.12 }, 'Zersetzt Rüstung.'), T('a9', 'Schwarzer Lotus', 1, { leech: 0.12, dmgPct: 0.1 }, 'Das Gift nährt dich.')] },
  ],
  huntress: [
    { name: 'Bogen', nodes: [T('h1', 'Zugkraft', 5, { dmgPct: 0.05 }, 'Mehr Schaden.'), T('h2', 'Durchschlag', 3, { pen: 0.12 }, 'Pfeile durchdringen.'), T('h3', 'Kopfschuss', 1, { crit: 0.12, execute: 0.3 }, 'Tödliche Präzision.')] },
    { name: 'Wildnis', nodes: [T('h4', 'Zähigkeit', 5, { hpPct: 0.06 }, 'Mehr Leben.'), T('h5', 'Kräuterkunde', 3, { regen: 0.015 }, 'Heilt jede Runde.'), T('h6', 'Rudel', 1, { thorns: 0.15, armorPct: 0.2 }, 'Wölfe wachen.')] },
    { name: 'Pirsch', nodes: [T('h7', 'Leichtfüßig', 5, { evade: 0.02 }, 'Ausweichen.'), T('h8', 'Fallen', 3, { bleed: 0.15 }, 'Wunden bei Krit.'), T('h9', 'Geduld', 1, { dmgPct: 0.2 }, '+20% Schaden.')] },
  ],
  sorceress: [
    { name: 'Feuer', nodes: [T('s1', 'Glut', 5, { dmgPct: 0.06 }, 'Mehr Schaden.'), T('s2', 'Flammenzunge', 3, { crit: 0.03 }, 'Krit-Chance.'), T('s3', 'Inferno', 1, { execute: 0.5, bleed: 0.2 }, 'Brennt Sterbende nieder.')] },
    { name: 'Frost', nodes: [T('s4', 'Eishaut', 5, { armorPct: 0.1 }, 'Mehr Rüstung.'), T('s5', 'Frostnova', 3, { evade: 0.03 }, 'Feinde erstarren.'), T('s6', 'Eispanzer', 1, { thorns: 0.25, hpPct: 0.1 }, 'Kälte schlägt zurück.')] },
    { name: 'Arkan', nodes: [T('s7', 'Mana', 5, { hpPct: 0.05 }, 'Mehr Leben.'), T('s8', 'Bannkreis', 3, { pen: 0.1 }, 'Ignoriert Rüstung.'), T('s9', 'Seelensiphon', 1, { leech: 0.15 }, 'Lebensraub.')] },
  ],
  witch: [
    { name: 'Grab', nodes: [T('w1', 'Totenhand', 5, { dmgPct: 0.05 }, 'Mehr Schaden.'), T('w2', 'Verwesung', 3, { pen: 0.1 }, 'Ignoriert Rüstung.'), T('w3', 'Ernte', 1, { execute: 0.6 }, '+60% gegen Sterbende.')] },
    { name: 'Blut', nodes: [T('w4', 'Aderlass', 5, { leech: 0.03 }, 'Mehr Lebensraub.'), T('w5', 'Blutpakt', 3, { hpPct: 0.08 }, 'Mehr Leben.'), T('w6', 'Unheilige Gnade', 1, { regen: 0.04 }, 'Starke Regeneration.')] },
    { name: 'Fluch', nodes: [T('w7', 'Schwäche', 5, { evade: 0.015 }, 'Feinde verfehlen.'), T('w8', 'Knochenrüstung', 3, { armorPct: 0.12 }, 'Mehr Rüstung.'), T('w9', 'Seelenfessel', 1, { crit: 0.1, thorns: 0.15 }, 'Gefesselte Seelen.')] },
  ],
};

// Krypten: 5 Ebenen, die letzte ist der Boss. Erste Bossbezwingung je Schwierigkeit = dauerhafte Trophäe.
export const DIFFICULTIES = [
  { name: 'Normal', lvlAdd: 0, mult: 1 },
  { name: 'Albtraum', lvlAdd: 18, mult: 1.15 },
  { name: 'Hölle', lvlAdd: 36, mult: 1.3 },
];
export const CRYPTS = [
  { id: 'c1', name: 'Gruft der Wäscherinnen', lvl: 1, glyph: 'skull', floors: ['Knochenhund', 'Skelettkrieger', 'Wiedergänger', 'Grabräuber'],
    boss: { name: 'Mutter Gerlinde, die Ertränkte', glyph: 'gerlinde', mech: { regen: 0.03, leech: 0.1 }, mechText: 'Zieht Leben aus dir und heilt sich', mix: { cold: 0.4 }, res: { elem: 0.1 } }, trophy: { hpPct: 0.05 } },
  { id: 'c2', name: 'Die Pestkapelle', lvl: 6, glyph: 'rat', floors: ['Pestratte', 'Verfaulter Ghul', 'Kultist der Glocke', 'Gehäuteter'],
    boss: { name: 'Bruder Aldemar, der Verseuchte', glyph: 'aldemar', mech: { poison: 0.25 }, mechText: 'Gift, das sich stapelt – kurze Kämpfe gewinnen', mix: { fire: 0.2 }, res: { phys: 0.15 } }, trophy: { dmgPct: 0.05 } },
  { id: 'c3', name: 'Das Schlachthaus', lvl: 12, glyph: 'ghoul', floors: ['Gehäuteter', 'Gefallener', 'Blutfürst', 'Höllenbrut'],
    boss: { name: 'Der Metzger von Vhal', glyph: 'butcher', mech: { execute: 0.6, rage: 0.4 }, mechText: 'Wird rasend und schlachtet Geschwächte', res: { phys: 0.2 } }, trophy: { crit: 0.03 } },
  { id: 'c4', name: 'Turm der Glocke', lvl: 20, glyph: 'horn', floors: ['Kultist der Glocke', 'Sumpfhexe', 'Blutfürst', 'Höllenbrut'],
    boss: { name: 'Der Glöckner', glyph: 'bellringer', mech: { toll: 1 }, mechText: 'Jeder dritte Schlag betäubt dich', mix: { fire: 0.25, cold: 0.15 } }, trophy: { armorPct: 0.1, hpPct: 0.05 } },
  { id: 'c5', name: 'Die Glocke', lvl: 26, shards: 4, floors: ['Kultist der Glocke', 'Wiedergänger', 'Blutfürst', 'Höllenbrut'],
    boss: { name: 'Der Kronenlose', glyph: 'self', mech: { mirror: 1 }, mechText: 'Kämpft mit deinen eigenen Talenten', mix: { fire: 0.25, cold: 0.25 }, res: { phys: 0.1, elem: 0.1 } }, trophy: { dmgPct: 0.1, hpPct: 0.1 } },
];
// Jeder erste Bosssieg (Krypta 1–4) bringt einen Glockensplitter. Vier öffnen "Die Glocke".
export const SHARD_CRYPTS = ['c1', 'c2', 'c3', 'c4'];

// Zauber-Boni aus SPELLS erzeugen (Waffe der Klasse → nur deren Zauber)
for (const [cls, list] of Object.entries(SPELLS)) for (const sp of list)
  AFFIXES.push({ stat: 'sk_' + sp.id, per: SKILL_PER, pre: 'Geweihter', suf: 'des Rituals', pct: 1, label: sp.name, side: 'pre', group: 'skill', slots: ['weapon'], cls, kind: CLASSES[cls].weapon });

// --- Zauber-Wege: je Zauber 3 Stufen, auf jeder Stufe 1 von 2 Wegen (Wahl statt Punkte, GameGene: Diablo III Runen).
// Stufe t öffnet sich ab Charakterstufe TREE_LVL[t] (und erst, wenn der Zauber gelernt ist). Bausteine `m` wirken in combat.js:
// open (sofort zu Kampfbeginn), every (± Züge), mult (± Wirkung), desperate x (lädt doppelt unter x Leben), hits (+Treffer), dotStack k (Gift stapelt bis k-fach),
// crit (+Krit-Chance), pierce x (ignoriert Anteil x der Rüstung), fresh x (+x gegen Gegner über 70 % Leben), execute (+% unter 30 % Leben), burn {v,n} (Brand: v × Treffer je Runde, n Runden),
// bleed (Bluten: v × Treffer je Runde), poison (Gift: v × Treffer, stapelt), weaken {v,n} (Gegner −v Schaden), vuln {v,n} (Gegner +v erlittener Schaden),
// lifesteal (heilt v × Schaden), shieldGain (Schild v × Schaden), healPct (heilt v × Leben), overshield (Überheilung → Schild), strike (trifft zusätzlich v × Hieb),
// buff (+v Schaden bis Kampfende), stun (Chance zu betäuben), stunTurns (Betäubung dauert n Züge), dazedCrit (gegen gerade Betäubte immer kritisch),
// noheal n (Gegner heilt n Züge nicht), cleanse (entfernt Gift/Bluten/Brand von dir), stunImmune n (n Züge unbetäubbar),
// detonate k (Gift bricht aus: k × Giftschaden sofort, Gift bleibt), poisonLeech (Gift-Ticks heilen dich v × Tick), max (+ Obergrenze Kriegsschrei).
export const TREE_LVL = [6, 14, 22];
const W = (id, name, text, m) => ({ id, name, text, m });
export const SPELL_TREE = {
  // Barbar
  schrei: [[W('bruellen', 'Brüllen', 'Wirkt sofort zu Kampfbeginn, +25 % Wirkung', { open: 1, mult: 0.25 }), W('ausdauer', 'Ausdauer', 'Obergrenze +60 %, +10 % Wirkung', { max: 0.6, mult: 0.1 })],
    [W('einschuechtern', 'Einschüchtern', 'Gegner macht 3 Züge 10 % weniger Schaden', { weaken: { v: 0.1, n: 3 } }), W('blutrausch', 'Kampfeslust', '+35 % Wirkung', { mult: 0.35 })],
    [W('schlachtruf', 'Schlachtruf', 'Heilt jedes Mal 2 % Leben', { healPct: 0.02 }), W('ahnenzorn', 'Zorn der Ahnen', 'Trifft zusätzlich für 20 % Schaden', { strike: 0.2 })]],
  wirbel: [[W('klingensturm', 'Klingensturm', '+1 Hieb', { hits: 1 }), W('wuchtig', 'Wuchtig', 'Ignoriert die halbe Rüstung', { pierce: 0.5 })],
    [W('aufreissen', 'Aufreißen', 'Treffer lassen bluten (12 % je Runde)', { bleed: 0.12 }), W('blutdurstig', 'Blutdurstig', 'Heilt 20 % des Schadens', { lifesteal: 0.2 })],
    [W('gemetzel', 'Gemetzel', '+100 % gegen Gegner unter 30 % Leben, +10 % Krit', { execute: 1, crit: 0.1 }), W('sturm', 'Sturm der Klingen', '+20 % Krit-Chance je Hieb', { crit: 0.2 })]],
  blutdurst: [[W('zaehesfleisch', 'Zähes Fleisch', '+20 % Heilung, Überheilung wird zu Schild', { overshield: 1, mult: 0.2 }), W('letztesblut', 'Letztes Blut', 'Lädt doppelt unter 30 % Leben', { desperate: 0.3 })],
    [W('raserei', 'Raserei', 'Jedes Mal +25 % Schaden bis Kampfende', { buff: 0.25 }), W('reinigen', 'Ausbrennen', 'Entfernt Gift, Bluten und Brand; +15 % Heilung', { cleanse: 1, mult: 0.15 })],
    [W('unbeugsam', 'Unbeugsam', '3 Züge nicht betäubbar; +15 % Heilung', { stunImmune: 3, mult: 0.15 }), W('lebensdurst', 'Lebensdurst', 'Heilt 20 % mehr', { mult: 0.2 })]],
  // Paladin
  schlag: [[W('richtspruch', 'Richtspruch', '+20 % Krit-Chance', { crit: 0.2 }), W('eifer', 'Eifer', 'Lädt 1 Zug schneller', { every: -1 })],
    [W('laeuterung', 'Läuterung', 'Gegner heilt 3 Züge nicht; +15 % Schaden', { noheal: 3, mult: 0.15 }), W('schildschlag', 'Schildschlag', '15 % des Schadens als Schild', { shieldGain: 0.15 })],
    [W('urteil', 'Urteil', '+150 % gegen Gegner unter 30 % Leben', { execute: 1.5 }), W('bindend', 'Bindender Schlag', '45 % Chance zu betäuben', { stun: 0.45 })]],
  gebet: [[W('schutzgebet', 'Schutzgebet', '+10 % Heilung, Überheilung wird zu Schild', { overshield: 1, mult: 0.1 }), W('kurzgebet', 'Kurzes Gebet', 'Lädt 1 Zug schneller', { every: -1 })],
    [W('reinigung', 'Reinigung', 'Entfernt Gift, Bluten und Brand; +10 % Heilung', { cleanse: 1, mult: 0.1 }), W('segen', 'Segen', 'Jedes Mal +6 % Schaden bis Kampfende', { buff: 0.06 })],
    [W('standhaft', 'Standhaft', '3 Züge nicht betäubbar; +20 % Heilung', { stunImmune: 3, mult: 0.2 }), W('maertyrer', 'Märtyrer', 'Lädt doppelt unter 30 % Leben', { desperate: 0.3 })]],
  hammer: [[W('wucht', 'Wucht', 'Ignoriert Rüstung', { pierce: 1 }), W('donner', 'Donner', 'Wirkt sofort zu Kampfbeginn', { open: 1 })],
    [W('zerschmettern', 'Zerschmettern', 'Gegner nimmt 5 Züge +35 % Schaden', { vuln: { v: 0.35, n: 5 } }), W('heiligesfeuer', 'Heiliges Feuer', 'Brand: 18 % je Runde, 3 Runden', { burn: { v: 0.18, n: 3 } })],
    [W('nachbeben', 'Nachbeben', 'Betäubt 2 Züge', { stunTurns: 2 }), W('lichtsplitter', 'Lichtsplitter', 'Heilt jedes Mal 8 % Leben', { healPct: 0.08 })]],
  // Assassine
  schatten: [[W('ausdemschatten', 'Aus dem Schatten', 'Wirkt sofort zu Kampfbeginn', { open: 1 }), W('praezision', 'Präzision', '+18 % Krit-Chance', { crit: 0.18 })],
    [W('klaffend', 'Klaffende Wunde', 'Bluten: 25 % je Runde', { bleed: 0.25 }), W('giftspitze', 'Giftspitze', 'Gift: 12 % des Treffers', { poison: 0.12 })],
    [W('hinrichtung', 'Hinrichtung', '+15 % Schaden, +180 % gegen Gegner unter 30 % Leben', { execute: 1.8, mult: 0.15 }), W('schattenblut', 'Schattenblut', 'Heilt 15 % des Schadens', { lifesteal: 0.15 })]],
  giftklinge: [[W('toedlich', 'Tödliches Gift', 'Gift +80 %, lädt 1 Zug langsamer', { mult: 0.8, every: 1 }), W('schnellgift', 'Doppelgift', 'Gift stapelt sich (bis 4-fach)', { dotStack: 4 })],
    [W('laehmend', 'Lähmendes Gift', 'Gegner macht 3 Züge 15 % weniger Schaden', { weaken: { v: 0.15, n: 3 } }), W('zersetzend', 'Zersetzend', 'Gegner nimmt 3 Züge +20 % Schaden', { vuln: { v: 0.2, n: 3 } })],
    [W('blutgift', 'Blutgift', 'Gift-Ticks heilen dich um 25 %', { poisonLeech: 0.25 }), W('lahmlegen', 'Lahmlegen', 'Gegner heilt 3 Züge nicht; Gift +20 %', { noheal: 3, mult: 0.2 })]],
  mal: [[W('gezeichnet', 'Gezeichnet', 'Gegner nimmt 4 Züge +25 % Schaden', { vuln: { v: 0.25, n: 4 } }), W('raschesmal', 'Rasches Mal', 'Lädt 1 Zug schneller, +10 % Krit', { every: -1, crit: 0.1 })],
    [W('blutzoll', 'Blutzoll', 'Heilt 25 % des Schadens', { lifesteal: 0.25 }), W('durchbohren', 'Durchbohren', 'Ignoriert Rüstung', { pierce: 1 })],
    [W('detonation', 'Detonation', 'Gift bricht aus: 3 × Giftschaden sofort', { detonate: 3 }), W('todesurteil', 'Todesurteil', '+30 % Krit-Chance', { crit: 0.3 })]],
  // Jägerin
  gezielt: [[W('ersterpfeil', 'Erster Pfeil', 'Wirkt sofort zu Kampfbeginn', { open: 1 }), W('scharfesauge', 'Scharfes Auge', '+20 % Krit-Chance', { crit: 0.2 })],
    [W('widerhaken', 'Widerhaken', 'Bluten: 6 % je Runde', { bleed: 0.06 }), W('schwachstelle', 'Schwachstelle', 'Gegner nimmt 3 Züge +12 % Schaden', { vuln: { v: 0.12, n: 3 } })],
    [W('kopfschuss', 'Kopfschuss', 'Gegen gerade Betäubte immer kritisch', { dazedCrit: 1 }), W('durchschlag', 'Durchschlag', 'Ignoriert die halbe Rüstung', { pierce: 0.5 })]],
  hagel: [[W('mehrpfeile', 'Mehr Pfeile', '+1 Pfeil', { hits: 1 }), W('brandpfeile', 'Brandpfeile', 'Brand: 30 % je Runde, 3 Runden', { burn: { v: 0.3, n: 3 } })],
    [W('giftpfeile', 'Giftpfeile', 'Gift: 4 % je Pfeil', { poison: 0.04 }), W('sperrfeuer', 'Sperrfeuer', 'Gegner macht 3 Züge 15 % weniger Schaden', { weaken: { v: 0.15, n: 3 } })],
    [W('salve', 'Salve', 'Lädt 1 Zug schneller, +10 % Krit', { every: -1, crit: 0.1 }), W('jagdglueck', 'Jagdglück', '+30 % Krit-Chance je Pfeil', { crit: 0.3 })]],
  falle: [[W('gespannt', 'Gespannt', 'Wirkt sofort zu Kampfbeginn, 30 % weniger Schaden', { open: 1, mult: -0.3 }), W('klingeneisen', 'Klingeneisen', 'Bluten: 15 % je Runde', { bleed: 0.15 })],
    [W('doppelfalle', 'Doppelte Falle', 'Betäubt 2 Züge', { stunTurns: 2 }), W('zaehne', 'Eiserne Zähne', 'Gegner nimmt 3 Züge +25 % Schaden', { vuln: { v: 0.25, n: 3 } })],
    [W('koeder', 'Köder', 'Lädt 1 Zug schneller, +10 % Krit', { every: -1, crit: 0.1 }), W('fallengift', 'Fallengift', 'Gift: 12 % des Treffers', { poison: 0.12 })]],
  // Zauberin
  feuerball: [[W('funkenflug', 'Funkenflug', 'Wirkt sofort zu Kampfbeginn', { open: 1 }), W('gluehend', 'Glühend', 'Brand: 10 % je Runde, 3 Runden', { burn: { v: 0.1, n: 3 } })],
    [W('schmelzen', 'Schmelzen', 'Gegen gerade Betäubte (Frostnova) immer kritisch, sonst +10 % Krit', { dazedCrit: 1, crit: 0.1 }), W('flammenhaut', 'Flammenhaut', '15 % des Schadens als Schild', { shieldGain: 0.15 })],
    [W('phoenix', 'Phönix', 'Heilt 20 % des Schadens', { lifesteal: 0.2 }), W('inferno', 'Inferno', '1 Zug schneller, 12 % weniger Schaden', { every: -1, mult: -0.12 })]],
  frost: [[W('frostruestung', 'Frostrüstung', '40 % des Schadens als Schild', { shieldGain: 0.4 }), W('raschekaelte', 'Rasche Kälte', 'Lädt 1 Zug schneller, +15 % Schaden', { every: -1, mult: 0.15 })],
    [W('sproede', 'Spröde', 'Gegner nimmt 4 Züge +35 % Schaden', { vuln: { v: 0.35, n: 4 } }), W('erfrierung', 'Erfrierung', 'Gegner macht 4 Züge 30 % weniger Schaden', { weaken: { v: 0.3, n: 4 } })],
    [W('ewigerwinter', 'Ewiger Winter', 'Betäubt 2 Züge', { stunTurns: 2 }), W('splittern', 'Splittern', '+100 % gegen unverwundete Gegner (über 70 % Leben)', { fresh: 1 })]],
  meteor: [[W('sternenfall', 'Sternenfall', 'Wirkt sofort zu Kampfbeginn, 35 % weniger Schaden', { open: 1, mult: -0.35 }), W('einschlag', 'Einschlag', 'Betäubt immer, +15 % Schaden', { stun: 1, mult: 0.15 })],
    [W('glutfeld', 'Glutfeld', 'Brand: 25 % je Runde, 3 Runden', { burn: { v: 0.25, n: 3 } }), W('komet', 'Kometenschweif', 'Lädt 2 Züge schneller', { every: -2 })],
    [W('weltenbrand', 'Weltenbrand', '+20 % Schaden, +150 % gegen Gegner unter 30 % Leben', { execute: 1.5, mult: 0.2 }), W('gestirn', 'Gestirn', '+45 % Krit-Chance', { crit: 0.45 })]],
  // Grabhexe
  speer: [[W('splitterspeer', 'Splitterspeer', 'Ignoriert 40 % der Rüstung', { pierce: 0.4 }), W('raschespeer', 'Rascher Speer', '1 Zug schneller, 10 % weniger Schaden', { every: -1, mult: -0.1 })],
    [W('markaussaugen', 'Mark aussaugen', 'Heilt 13 % des Schadens', { lifesteal: 0.13 }), W('knochenfluch', 'Knochenfluch', 'Gegner macht 3 Züge 15 % weniger Schaden', { weaken: { v: 0.15, n: 3 } })],
    [W('seelenernte', 'Seelenernte', '+15 % Schaden, +180 % gegen Gegner unter 30 % Leben', { execute: 1.8, mult: 0.15 }), W('faeulnis', 'Fäulnis', 'Gift: 8 % des Treffers', { poison: 0.08 })]],
  seuche: [[W('pest', 'Pest', 'Gift +60 %, lädt 1 Zug langsamer', { mult: 0.6, every: 1 }), W('ansteckend', 'Ansteckend', 'Gift stapelt sich (bis 3-fach)', { dotStack: 3 })],
    [W('siechtum', 'Siechtum', 'Gegner heilt 3 Züge nicht; Gift +20 %', { noheal: 3, mult: 0.2 }), W('verfall', 'Verfall', 'Gegner nimmt 3 Züge +25 % Schaden', { vuln: { v: 0.25, n: 3 } })],
    [W('seuchenernte', 'Ernte', 'Gift bricht aus: 2 × Giftschaden sofort', { detonate: 2 }), W('seuchenblut', 'Blutgift', 'Gift-Ticks heilen dich um 15 %', { poisonLeech: 0.15 })]],
  wall: [[W('fruehwall', 'Früher Wall', 'Wirkt sofort zu Kampfbeginn, 25 % schwächer', { open: 1, mult: -0.25 }), W('dickeknochen', 'Dicke Knochen', 'Schild +50 %, lädt 1 Zug langsamer', { mult: 0.5, every: 1 })],
    [W('knochendornen', 'Knochendornen', 'Trifft zusätzlich für 40 % Schaden', { strike: 0.4 }), W('wallreinigen', 'Totenruhe', 'Entfernt Gift, Bluten und Brand; heilt 2 % Leben', { cleanse: 1, healPct: 0.02 })],
    [W('wallunbeugsam', 'Unbeugsam', '3 Züge nicht betäubbar; Schild +15 %', { stunImmune: 3, mult: 0.15 }), W('totenwacht', 'Totenwacht', 'Heilt jedes Mal 3 % Leben', { healPct: 0.03 })]],
};

// --- Alchemie (Ysolde): Tränke wirken nur in der Krypta (dort kennt man den Gegner vorher). Gürtel mit 2 Plätzen (3 ab Treue II bei Ysolde).
// Gewöhnliche: 3 Ladungen je Brauen, Auslöser wählbar, +1 Ladung je Tag für Tränke im Gürtel. Seltene: 1 Ladung, brauchen ein Schwarzes Herz
// (Krypta-Bosse), wirken den ganzen Kampf, höchstens einer im Gürtel. Wirkung `fx` in combat.js (potion()).
// Auslöser: start (eigener 1. Zug), hp50/hp30 (eigenes Leben unter x), dot (Gift/Bluten/Brand auf dir), low (Gegner unter 50 %), heal (Gegner heilt/regeneriert).
export const HERBS = {
  rotwurz: { name: 'Rotwurz', img: 'i_rotwurz' }, grabmoos: { name: 'Grabmoos', img: 'i_grabmoos' }, silberstaub: { name: 'Silberstaub', img: 'i_silberstaub' },
  nachtschatten: { name: 'Nachtschatten', img: 'i_nachtschatten' }, schwefel: { name: 'Schwefel', img: 'i_schwefel' },
  weihrauch: { name: 'Weihrauchharz', img: 'i_weihrauch' }, herz: { name: 'Schwarzes Herz', img: 'i_herz' },
};
// Welche Zutat ein Streifzug-Ort liefert (Chance je Sieg), Herz von Krypta-Bossen
// Jeder Ort eine eigene Zutat. Die Kapelle gab bisher Grabmoos wie der Friedhof: Akt V brachte
// nichts Neues, Grabmoos steckte in 5 Rezepten – und weil Expedition und Umherziehen ihre
// Zufallszutat aus diesen Werten ziehen, kam auch dort Grabmoos mit 33 % statt 20 %.
export const HERB_LOC = { friedhof: 'grabmoos', muehle: 'rotwurz', katakomben: 'silberstaub', moor: 'nachtschatten', kapelle: 'weihrauch', gruben: 'schwefel' };
// `foreign`: Anteil der Zutaten-Funde, die eine FREMDE Zutat geben statt der des Ortes. Ohne das
// flutet der Akt, in dem man gerade farmt, seine Zutat (gemessen: 82 Grabmoos neben 3 Silberstaub)
// und alle anderen verhungern – man scheitert nie an der Menge, immer an der Sorte. Expedition
// (`herbAny`) und Umherziehen machen das längst, nur die Akt-Kämpfe nicht, wo 90 % der Siege fallen.
// `heartChance`: Herzen waren garantiert 2 je Krypta-Boss und damit die einzige ortsungebundene
// Zutat – 26 bis 68 je Woche, während jede Feldzutat bei 0 endete. Der Bossfund war der Überfluss.
export const ALCH = { herbChance: 0.15, foreign: 0.3, slots: 2, slotsLoyal: 3, loyalNeed: 2, charges: 3, maxCommon: 6, maxRare: 2,
  bossHearts: 1, heartChance: 0.7,
  // Ein Herz fällt nie allein: Krypta und Abgrund gaben NUR Herzen, Feldzutaten aber nur die
  // Akt-Gebiete. Wer die Geschichte durch hat und Krypta/Grube farmt, sammelte deshalb Herzen,
  // die allein nichts wert sind (jedes seltene Rezept will 1 Herz + 1 Feldzutat) und konnte
  // gar nichts mehr brauen. Fällt ein Herz, fällt eine Feldzutat dazu.
  bossHerb: 1, herbBuy: [26, 5], herbStock: 3,
  gold: [8, 2.5], goldRare: [30, 7] };   // Gold = a + Stufe × b, Zutat kaufen = herbBuy[0] + Stufe × herbBuy[1]
// `herbStock`: Ysolde hat je Tag nur so viele Zutaten. Ohne diese Grenze ersetzt Gold das Farmen
// vollständig – mit freiem Verkauf kaufte der Bot 400 bis 685 Zutaten je Woche und braute 350 statt
// 30 Tränke. Der Laden soll aushelfen, wenn genau ein Kraut fehlt, nicht die Streifzüge ersetzen.
export const POTIONS = [
  { id: 'rotwurz', name: 'Rotwurz-Trank', text: 'Heilt 11 % Leben.', fx: { heal: 0.11 }, trig: ['hp50', 'hp30'], cost: { rotwurz: 2 } },
  { id: 'steinhaut', name: 'Steinhaut', text: 'Schild aus 10 % Leben.', fx: { shield: 0.1 }, trig: ['start', 'hp50'], cost: { grabmoos: 2 } },
  { id: 'berserker', name: 'Berserkersud', text: '+35 % Schaden für 3 Züge.', fx: { rage: 0.35, n: 3 }, trig: ['start', 'low'], cost: { rotwurz: 1, grabmoos: 1 } },
  { id: 'gegengift', name: 'Gegengift', text: 'Entfernt Gift, Bluten, Brand. 4 Züge immun.', fx: { cure: 4 }, trig: ['dot'], cost: { grabmoos: 1, silberstaub: 1 } },
  { id: 'wachsaft', name: 'Wachsaft', text: '5 Züge nicht betäubbar.', fx: { stunImm: 5 }, trig: ['start'], cost: { nachtschatten: 2 } },
  { id: 'weihwasser', name: 'Weihwasser', text: 'Gegner kann 6 Züge nicht heilen.', fx: { noheal: 6 }, trig: ['start', 'heal'], cost: { silberstaub: 2 } },
  { id: 'falkenauge', rare: 1, name: 'Falkenauge', text: '+15 % Krit-Chance im ganzen Kampf.', fx: { crit: 0.15 }, cost: { herz: 1, silberstaub: 1 } },
  { id: 'knochenmark', rare: 1, name: 'Knochenmark-Tonikum', text: 'Gegner trifft 10 % seltener kritisch.', fx: { critRes: 0.1 }, cost: { herz: 1, weihrauch: 1 } },
  { id: 'schatten', rare: 1, name: 'Schattentrank', text: '+7 % Ausweichen im ganzen Kampf.', fx: { evade: 0.07 }, cost: { herz: 1, nachtschatten: 1 } },
  { id: 'jaegerblick', rare: 1, name: 'Jägerblick', text: 'Gegner weicht 8 % seltener aus.', fx: { acc: 0.08 }, cost: { herz: 1, silberstaub: 1 } },
  { id: 'bollwerk', rare: 1, name: 'Bollwerk-Trank', text: '+7 % Blocken im ganzen Kampf.', fx: { block: 0.07 }, cost: { herz: 1, weihrauch: 1 } },
  { id: 'rostsaeure', rare: 1, name: 'Rostsäure', text: 'Ignoriert 30 % der Rüstung.', fx: { pen: 0.3 }, cost: { herz: 1, schwefel: 1 } },
  { id: 'zaubertinte', rare: 1, name: 'Zaubertinte', text: 'Alle Zauber starten zu 40 % geladen.', fx: { charge: 0.4 }, cost: { herz: 1, nachtschatten: 1 } },
  { id: 'vampirsud', rare: 1, name: 'Vampirsud', text: '+8 % Lebensraub im ganzen Kampf.', fx: { leech: 0.08 }, cost: { herz: 1, rotwurz: 1 } },
];
export const TRIGGERS = { start: 'zu Kampfbeginn', hp50: 'Leben unter 50 %', hp30: 'Leben unter 30 %', dot: 'wenn vergiftet/blutend', low: 'Gegner unter 50 %', heal: 'wenn Gegner heilt' };

// --- Expedition: der Held zieht ohne Glut los (1–8 Std.), keine Kämpfe in der Zeit. Für die Leerlaufzeit (Nacht, Arbeit). ---
// Vor dem Aufbruch wählt man einen Weg über eine kleine Karte (Gabelungen, Stationen), bei der Heimkehr erzählt er, was geschah;
// Ereignisse („?“) entscheidet man dann. Werte je Stunde gemessen an einem Streifzug dieses Ortes (tripReward) – bewusst unter dem aktiven Spiel.
export const EXPED = {
  hours: [1, 2, 4, 8], gold: 0.5, xp: 0.6,          // Grundertrag je Stunde (× Streifzug)
  stations: { 1: 1, 2: 2, 4: 3, 8: 4 },             // Stationen je Dauer (+ Ziel)
  widths: [2, 3, 2, 3],                              // Knoten je Reihe
  longH: 8,                                          // lange Reise: Ziel bringt ein sicheres magisches Fundstück
  blessMax: 0.25, curseMax: -0.15,                   // Segen/Fluch auf den nächsten Krypta-Kampf (Leben %)
};
// Stationen: Wert je Stunde Weg (hps = Stunden je Station). w = Häufigkeit auf der Karte, max = höchstens so oft je Karte.
export const EXP_NODES = {
  herb:   { name: 'Kräuterfeld', w: 3, text: 'Zutaten des Ortes', herb: 2 },
  mats:   { name: 'Gebeinfeld', w: 3, text: 'Material des Ortes', mat: 1.6 },
  ruin:   { name: 'Ruine', w: 2, text: 'Chance auf ein Fundstück', item: 0.35, gold: 0.3 },
  event:  { name: 'Ereignis', w: 3, text: 'Du entscheidest bei der Heimkehr' },
  camp:   { name: 'Lager', w: 1, max: 1, text: 'Sicher: Ruhe und Erfahrung', xp: 0.5 },
  shrine: { name: 'Schrein', w: 1, max: 1, text: 'Segen: nächster Krypta-Kampf +10 % Leben', bless: 0.1 },
  danger: { name: 'Gefahr', w: 1, max: 1, text: 'Viel Gold und ein Fundstück – aber 1 von 3: die Hälfte der Beute ist fort', gold: 1, item: 0.5, minR: 2, risk: 1 / 3 },
};
export const EXP_GOALS = { friedhof: 'Gruft von Vhal', muehle: 'Mahlstube', katakomben: 'Grabkammer', moor: 'Galgenhügel', kapelle: 'Altarraum', gruben: 'Schlund' };
// Ereignisse: Wahl mit Hinweis (hint, was man vorher sieht) und Folge (out). Wirkungen (× Streifzug-Ertrag des Ortes):
// gold, xp, herb (Zutat des Ortes), herbAny, mat, item (Mindest-Seltenheit), heart, bless (±), glut, cache (Versteck → Ziel bringt Material),
// Kosten: pot (Trank aus dem Vorrat), pay (Gold × Streifzug). risk: { p, win, lose } – Ausgang beim Wählen.
export const EXP_EVENTS = [
  { id: 'raeuber', title: 'Der sterbende Grabräuber', img: 'expedition/ev_raeuber.webp',
    text: 'Zwischen zwei Särgen lehnt einer, der schneller war als du – und langsamer als das, was ihn erwischt hat. „Wasser“, sagt er. „Und ich sag dir, wo es liegt.“',
    ch: [{ t: 'Ihm helfen', hint: '1 Rotwurz-Trank · er verrät ein Versteck', pot: 'rotwurz', eff: { cache: 1 }, out: '„Unter dem dritten Sarg.“ Er hat nicht gelogen.' },
         { t: 'Ihn ausrauben', hint: '+Gold · ein Fluch haftet an dir', eff: { gold: 1.5, bless: -0.05 }, out: 'Seine Finger waren kalt, bevor du fertig warst.' },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Hinter dir hört das Atmen auf.' }] },
  { id: 'gruft', title: 'Die offene Gruft', img: 'expedition/ev_gruft.webp',
    text: 'Der Deckel liegt zerbrochen daneben. Unten glänzt etwas zwischen den Rippen eines, der nicht ganz still liegt.',
    ch: [{ t: 'Hineingreifen', hint: 'Fundstück – oder etwas greift zurück', risk: { p: 0.6, win: { item: 2 }, lose: { bless: -0.08 } }, out: ['Du ziehst es heraus. Die Rippen schließen sich zu spät.', 'Etwas hat zurückgegriffen. Die Kälte bleibt in der Hand.'] },
         { t: 'Versiegeln', hint: '+Erfahrung', eff: { xp: 1 }, out: 'Stein auf Stein. Was unten ist, bleibt unten.' },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Das Glänzen folgt dir noch eine Weile.' }] },
  { id: 'haendler', title: 'Händlerin im Nebel', img: 'expedition/ev_haendler.webp',
    text: 'Eine Laterne, ein Karren, kein Pferd. Sie lächelt, als hätte sie dich erwartet. „Kräuter, Wanderer? Frisch. Fast.“',
    ch: [{ t: 'Kräuter kaufen', hint: 'Gold · 3 Zutaten', pay: 0.8, eff: { herbAny: 3 }, out: 'Die Bündel riechen nach Erde und nach etwas Älterem.' },
         { t: 'Nach dem Weg fragen', hint: '+Erfahrung', eff: { xp: 0.6 }, out: '„Links. Immer links.“ Es war richtig.' },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Als du dich umdrehst, ist da nur Nebel.' }] },
  { id: 'altar', title: 'Altar aus Knochen', img: 'expedition/ev_altar.webp',
    text: 'Frisches Blut auf altem Stein. Jemand hat hier vor Kurzem gebetet – und etwas hat geantwortet.',
    ch: [{ t: 'Opfern', hint: 'vielleicht ein Schwarzes Herz', risk: { p: 0.35, win: { heart: 1 }, lose: { xp: 0.3 } }, out: ['Der Stein öffnet sich. Darin schlägt etwas Schwarzes.', 'Nichts antwortet. Nur dein eigener Herzschlag.'] },
         { t: 'Zerschlagen', hint: '+viel Erfahrung', eff: { xp: 1.5 }, out: 'Die Knochen schreien nicht. Fast nicht.' },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Das Blut ist noch warm, als du gehst.' }] },
  { id: 'nest', title: 'Das Nest', img: 'expedition/ev_nest.webp',
    text: 'Ein Hügel aus Fell, Zähnen und Lumpen. Er atmet. Darin: Dinge, die Ratten nicht fressen.',
    ch: [{ t: 'Ausräuchern', hint: '+Material', eff: { mat: 3 }, out: 'Was übrig bleibt, nimmt Halvar gern.' },
         { t: 'Hindurchwühlen', hint: 'Fundstück – oder Bisse', risk: { p: 0.5, win: { item: 1, gold: 0.5 }, lose: { bless: -0.05 } }, out: ['Zwischen den Knochen: etwas Brauchbares.', 'Die Bisse heilen. Langsam.'] },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Das Rascheln folgt dir bis zur Biegung.' }] },
  { id: 'prophet', title: 'Der Seher am Wegrand', img: 'expedition/ev_seher.webp',
    text: 'Er sitzt da, als säße er schon immer da. „Ich sehe dich, Kind der Asche. Willst du hören, was kommt?“',
    ch: [{ t: 'Zuhören', hint: 'Segen für die Krypta', eff: { bless: 0.08 }, out: '„Die dritte Tür. Nicht die zweite.“ Du wirst es dir merken.' },
         { t: 'Ihm Gold geben', hint: 'Gold · +viel Erfahrung', pay: 0.5, eff: { xp: 2 }, out: 'Er beißt auf die Münze. Dann erzählt er bis zum Morgen.' },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Er lacht dir nach. Lange.' }] },
  { id: 'hund', title: 'Der Knochenhund', img: 'expedition/ev_hund.webp',
    text: 'Er folgt dir seit einer Stunde. Er greift nicht an. Er wartet.',
    ch: [{ t: 'Füttern', hint: '1 Zutat · er führt dich zu etwas', herbCost: 1, eff: { mat: 2, item: 1 }, out: 'Er frisst, dann trottet er voraus. Zu einem Toten mit vollen Taschen.' },
         { t: 'Verjagen', hint: '+Erfahrung', eff: { xp: 0.8 }, out: 'Ein Stein, ein Knurren. Dann bist du allein.' },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Irgendwann ist er nicht mehr hinter dir.' }] },
  { id: 'lager', title: 'Verlassenes Lager', img: 'expedition/ev_lager.webp',
    text: 'Die Glut ist noch warm. Decken, ein Kessel, ein Rucksack. Niemand da.',
    ch: [{ t: 'Rasten', hint: '+10 Glut', eff: { glut: 10 }, out: 'Du schläfst. Niemand kommt zurück. Gut so.' },
         { t: 'Durchsuchen', hint: 'Gold – oder eine Falle', risk: { p: 0.55, win: { gold: 2 }, lose: { xp: 0.2 } }, out: ['Ein Beutel unter dem Kessel.', 'Der Rucksack war ein Köder. Du kommst davon.'] },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Du lässt das Feuer brennen.' }] },
  { id: 'kessel', title: 'Der Hexenkessel', img: 'expedition/ev_kessel.webp',
    text: 'Es brodelt grün, obwohl kein Feuer brennt. Daneben Flaschen, sauber aufgereiht.',
    ch: [{ t: 'Trinken', hint: 'starker Segen – oder Fluch', risk: { p: 0.5, win: { bless: 0.15 }, lose: { bless: -0.1 } }, out: ['Es brennt. Dann wird alles klar.', 'Es brennt. Dann wird alles schwarz.'] },
         { t: 'Abfüllen', hint: '+2 Zutaten', eff: { herbAny: 2 }, out: 'Ysolde wird wissen, was es ist.' },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Der Kessel blubbert lauter, als du gehst.' }] },
  { id: 'glocke', title: 'Eine Glocke läutet', img: 'expedition/ev_glocke.webp',
    text: 'Irgendwo unter der Erde schlägt eine Glocke. Einmal. Zweimal. Dann wartet sie.',
    ch: [{ t: 'Dem Klang folgen', hint: 'seltenes Fundstück – oder nichts', risk: { p: 0.4, win: { item: 3 }, lose: { xp: 0.5 } }, out: ['Unter der Glocke liegt, was sie bewacht hat.', 'Der Gang endet. Die Glocke schweigt. Du lernst daraus.'] },
         { t: 'Ohren verstopfen', hint: '+Erfahrung', eff: { xp: 0.5 }, out: 'Beim dritten Schlag bist du schon weit weg.' },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Sie läutet noch, als du heimkommst. Nur du hörst sie.' }] },
  { id: 'kniet', title: 'Der Kniende', img: 'expedition/ev_kniet.webp',
    text: 'Ein Wiedergänger kniet vor einem Grab und rührt sich nicht. An seiner Hand ein Ring.',
    ch: [{ t: 'Für ihn beten', hint: 'kleiner Segen · +Erfahrung', eff: { bless: 0.06, xp: 0.5 }, out: 'Er sinkt in sich zusammen. Endlich.' },
         { t: 'Den Ring nehmen', hint: 'magisches Fundstück · ein Fluch', eff: { item: 2, bless: -0.06 }, out: 'Er sieht dir nach. Mit leeren Augen.' },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Er kniet noch immer.' }] },
  { id: 'ghul', title: 'Der fressende Ghul', img: 'expedition/ev_ghul.webp',
    text: 'Er hockt über etwas, das einmal ein Pilger war. Er hat dich noch nicht bemerkt.',
    ch: [{ t: 'Vorbeischleichen', hint: '+Erfahrung', eff: { xp: 1 }, out: 'Ein Schritt nach dem anderen. Er schmatzt weiter.' },
         { t: 'Verscheuchen', hint: 'Material – oder Verlust', risk: { p: 0.6, win: { mat: 4 }, lose: { gold: -0.5 } }, out: ['Er flieht. Der Pilger trug Nützliches.', 'Er flieht – mit deinem Beutel.'] },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Das Schmatzen hörst du noch lange.' }] },
];
export const EXP_TALES = {
  friedhof: ['Zwischen den Gräbern brannte die ganze Nacht ein Licht. Niemand hielt es.', 'Ein Grab stand offen. Darin lag nur Erde – und etwas, das glänzte.'],
  muehle: ['Das Mühlrad drehte sich, obwohl kein Wasser floss.', 'Im Mehl fanden sich Spuren. Keine davon menschlich.'],
  katakomben: ['Tief unten zählt jemand die Knochen. Er kam nie bis zum Ende.', 'Ein Gang, der gestern noch nicht da war. Er führte zurück.'],
  moor: ['Die Gehenkten flüstern bei Nebel. Diesmal nannten sie einen Namen.', 'Der Steg trug bis zur Mitte. Weiter ging nur, wer nicht nach unten sah.'],
  kapelle: ['Die Glocke hängt im Schutt und schweigt. Fast.', 'Kultisten beteten bis zum Morgen. Zu wem, blieb ungesagt.'],
  gruben: ['Die Hitze ließ das Eisen am Gürtel glühen.', 'Aus der Tiefe kam ein Lachen. Es klang wie Feuer.'],
};

// --- Der Abstieg: Gruft als Karte mit Ausgängen (rausholen oder verlieren) ---
// Freigeschaltet je Gruft, sobald ihr Boss einmal gefallen ist. Leben und Trank-Ladungen laufen von Raum zu Raum mit.
// Beute landet im Beutesack und zählt erst an einem Ausgang. Wer fällt, verliert den Sack – nie Ausrüstung, Stufe oder EP.
export const DESCENT = {
  // Grabsiegel statt Tageszähler: ein Abstieg kostet ein Siegel. Drei Abstiege am Tag verfielen,
  // wenn man einen Tag nicht hineinsah; Siegel sammeln sich bis `sealMax`. Der Deckel ist die
  // Bremse, nicht der Preis – ohne ihn spart man zwei Wochen und macht dreissig Abstiege am
  // Stueck, womit Unruhe-Kurve und Beutesack-Druck entwertet waeren.
  sealDay: 2, sealMax: 6,           // taegliche Gutschrift (auch rueckwirkend) und Vorrat
  sealCrypt: 0.25,                  // Krypta-Boss
  sealRank: 1,                      // neuer Rang in der Grube
  sealBoss: 0.5,                    // Chance, dass der Abgrund-Boss sein Siegel erstattet (2026-11-22: 1 → 0,5; mit 1 stieg ein
                                    // Sieger endlos ab – Bot Tag 1: 40–47 Abstiege, St. 17–26, die Geschichte wurde Beiwerk)
  widths: [2, 3, 3, 3, 2],          // Räume je Reihe (Eingang unten, Boss oben)
  rope: 2, well: 3,                 // Reihe (0-basiert) mit Seil / Brunnen
  unrestLoot: 0.4,                  // Beute × (1 + Unruhe × 0,4) → bis ×3
  unrestDiff: 0.08,                 // Gegner × (1 + Unruhe × 0,08)
  // Endlose Tiefe: keine letzte Tiefe. Gegner richten sich nach der Tiefe, nie nach der Heldenstufe
  // (vorher Heldenstufe + 1 → mit Krypta-Beute zwangsläufig zu leicht). Stufe = lvlBase + Tiefe × lvlPer,
  // Stärke diff × diffGrow^(Tiefe − 1) obendrauf (Welle 2B-1, vorher linear +2 %/Tiefe: tief unten wurden die Schritte
  // klein, +6 Tiefen bei Tiefe 30 kaum schwerer). Geometrisch ist jede Tiefe um denselben Anteil schwerer, auch wenn die
  // Beute (Stufe = Gegnerstufe, nie mehr) den Helden mitwachsen lässt. Wer den Boss einer Tiefe schlägt,
  // öffnet die nächste. Gruft (Aussehen, Gegner, Boss) wechselt reihum durch die offenen Grüfte.
  // `mods` je Tiefe: Platz für Siegel/Modifikatoren (Welle 2) – heute leer.
  diff: 1.15, lvlBase: 3, lvlPer: 2, diffGrow: 1.05,
  depthMods: [],                    // Welle 2: [{ from: Tiefe, id, … }] – descAt() hängt sie an
  resMalus: { per: 10, v: 0.1, max: 0.3 },   // Fluch der Tiefe: je `per` Tiefen −v Elementar-Resi (vor dem Deckel, wie D2 Hölle/PoE), höchstens −max
  gold: 1.1, xp: 0.8,               // gegenüber einem Krypta-Kampf (xp 0,6 → 0,8 in Welle 2B-1: ein Abstieg brachte auf St. 40 nur ~5 % einer Stufe)
  // Lohn wächst mit der Tiefe (Welle 2B-1), damit es sich unten lohnt: Gold/EP × (1 + (Tiefe − 1) × goldPer/xpPer),
  // Fundstücke × (1 + (Tiefe − 1) × itemPer), Glück + Tiefe × luckPer, Mindest-Seltenheit ab Tiefe (rarAt: [Tiefe, Index
  // in RARITIES]: 2 magisch, 3 selten). Abgrund-Stufen über I: TIERS.minDepth. Alles in descReward(d), eine Stelle.
  goldPer: 0.05, xpPer: 0.05, itemPer: 0.03, luckPer: 3, rarAt: [[8, 2], [18, 3]],
  // Wochenlohn (am Montag für die Wochenbest-Tiefe der Vorwoche, abholen im Abgrund): Gold = gold × Gegnerstufe dieser
  // Tiefe, 1 Kronsplitter je `kron` Tiefen, `seals` Grabsiegel (bis sealMax), ab `itemFrom` ein seltenes Teil der Tiefe.
  week: { gold: 60, kron: 5, seals: 2, itemFrom: 5 },
  item: 0.35, eliteMinR: 2, bossMinR: 3,
  heart: 0.1, eliteHeart: 0.35,
  kronBoss: 1, kronElite: 0.12,     // Kronsplitter: sicher beim Abgrund-Boss, selten bei Elite (× Unruhe)
  heal: 0.35, trap: 0.3, trapDmg: 0.15,
  wellGold: 6,                      // Brunnen: × Gegnerstufe
  stairUnrest: 1,                   // Rückweg über die Stiege: ein Kampf mit Unruhe +1
  boss: 0.8,                        // Boss-Stärke gegenüber der Krypta (er kommt nach 5 Räumen ohne Heilung)
};
// --- Siegel des Abgrunds (Welle 2B-2, wie Skarabäen in PoE) ---
// Vor einem Abstieg legt man bis zu `max` Siegel ein, höchstens eines je Art. Jedes macht den Abstieg gefährlicher
// und die Beute größer oder gezielter; verbraucht beim Hinabsteigen (auch wenn man fällt). Fallen nur im Abgrund, liegen
// im Beutesack (Tod = weg) und werden mit der Tiefe besser: Stufe 1/2/3 (`tierAt`: ab Tiefe). Werte je Stufe [1, 2, 3].
// Bilder: die drei gemalten Abgrund-Steine aus assets/forge/ (DESIGN.md „Die vier Abgrund-Materialien").
//   foe     Gegner (auch Elite und Boss) × (1 + foe) stärker – Leben, Schaden, Werte (makeMonster-diff)
//   loot    Gold und Zahl der Fundstücke × (1 + loot)
//   eliteW  Gewicht der Elite-Räume × eliteW; eliteFoe: Elite zusätzlich × (1 + eliteFoe)
//   eliteItem  Elite trägt so viele Fundstücke mehr
//   eliteR  Elite-Funde mindestens diese Seltenheit (Index in RARITIES, 3 = selten); kronE: Kronsplitter bei Elite ×
//   res     Elementar-Resi zusätzlich −res (zum Fluch der Tiefe, eigener Deckel nicht – die Gefahr steht vorher da)
//   favor   Gewicht der Resistenz-Boni (Gruppe `favorStats`) × favor beim Würfeln; luck: Glück +luck
// Bilder der Abgrund-Funde ohne eigenes Bild: Aschenkern = der gemalte Glutstein (Stein mit glühenden Rissen)
export const MAT_ART = { aschenkern: 'glutstein' };
export const SIGILS = {
  max: 3, tierAt: [1, 8, 16], tierName: ['rissig', 'fest', 'makellos'],
  drop: { boss: 1, elite: 0.15, treasure: 0.1 },
  favorStats: ['elemr', 'physr'],
  kinds: [
    { id: 'blut', name: 'Blutsiegel', img: 'verderbtes_blut', foe: [0.1, 0.15, 0.2], loot: [0.3, 0.45, 0.6] },
    { id: 'seele', name: 'Seelensiegel', img: 'seelenstein', eliteW: [2, 2.5, 3], eliteFoe: [0, 0.05, 0.1], eliteR: [3, 3, 3], eliteItem: [1, 1, 2], kronE: [1.5, 2, 3] },
    { id: 'rune', name: 'Runensiegel', img: 'runenfassung', res: [0.1, 0.15, 0.2], favor: [3, 4, 5], luck: [15, 25, 40] },
  ],
};
// --- Aschenkern (Welle 2B-2, wie Aspekte in D4) ---
// Sehr seltener Fund beim Abgrund-Boss ab Tiefe `from`: Chance base + per × (Tiefe − from), höchstens max.
// Er zieht EINE Sonderwirkung aus einem Einzigartigen (das zerfällt) und brennt sie in ein magisches, seltenes oder
// legendäres Teil desselben Platzes – höchstens ein Kern je Teil, für immer. Positive Werte × mult (ganzzahlige
// Schalter wie „toll: 1" bleiben ganz); Nachteile (negative Werte, `curse`) und Begleiter (`tie`) wandern immer mit.
// multOf: eigene Rate je Wirkung – Henker (execute) war als Kern für alle Klassen der beste (kern.mjs), Besitzer: auf 50 %.
export const ASHCORE = { from: 12, base: 0.03, per: 0.005, max: 0.15, mult: 0.75, multOf: { execute: 0.5 },
  tie: { execute: ['execHp'] }, curse: ['nohealSelf'], helper: ['execHp'], gold: 40 };
export const DESC_ROOMS = {
  fight:    { name: 'Kampf', w: 5, img: 'mon', text: 'Ein Gegner der Gruft.' },
  elite:    { name: 'Elite', w: 2, minR: 1, img: 'mon', text: 'Stärker, mit zwei Eigenschaften. Trägt sicher ein magisches Fundstück.' },
  treasure: { name: 'Schatzkammer', w: 1.3, minR: 1, max: 2, img: 'ruin', text: 'Beute ohne Kampf. Manchmal eine Falle: −15 % Leben.' },
  shrine:   { name: 'Schrein', w: 1, minR: 1, max: 1, img: 'shrine', text: 'Heilt 35 % deines Lebens.' },
  rope:     { name: 'Seil', exit: true, img: 'camp', text: 'Ausgang. Kostet nichts.' },
  well:     { name: 'Brunnen', exit: true, img: 'goal', text: 'Ausgang. Kostet Gold (erst aus dem Sack, dann deins).' },
};
export const ELITE = { diff: 1.2, hp: 1.3, mods: [
  { id: 'flink', name: 'Flink', eff: { evade: 0.15 } }, { id: 'stein', name: 'Steinhaut', mult: { armor: 1.7 } },
  { id: 'dorn', name: 'Dornig', eff: { thorns: 0.2 } }, { id: 'vamp', name: 'Blutsauger', eff: { leech: 0.12 } },
  { id: 'wut', name: 'Rasend', eff: { rage: 0.35 } }, { id: 'gift', name: 'Giftig', eff: { poison: 0.15 } },
  { id: 'zaeh', name: 'Zäh', mult: { hp: 1.3 } },
] };

// --- Die Grube: Rangleiter gegen feste Rivalen (keine Glut, nur Pause) ---
// Platz 1 oben. Die Stufe eines Rivalen hängt an seinem Platz, nicht an deiner Stufe → hoch kommt nur, wer stärker wird.
// foeGrow (Welle 2B-1): Rivalen über Platz growFrom je Platz × foeGrow an Leben und Schaden (darunter wie bisher: dort
// trägt die Grube die Geschichte, Vargos Ehre-Aufträge). Nach Boni-Umbau und Brett schlug ein
// Held St. 20 sonst Platz 6–12 und St. 30 Platz 1. Gemessen (tests/lohn.mjs): St. 20 ≈ Platz 14–21, St. 30 ≈ 4–10, St. 40 ≈ 4–6.
// goldPerLvl/xp: Lohn je Sieg × √(Platz-Stärke), siehe pitWinGold/pitWinXp.
export const PIT = { size: 50, cdWin: 300, cdLose: 900, lvlBottom: 3, lvlTop: 42, richFrom: 20, magicFrom: 35, rareFrom: 20, legFrom: 6,
  honorBase: 6, honorPerPlace: 3, foeAfter: 2, foeMult: 2, goldPerLvl: 6, xp: 0.3, foeGrow: 1.06, growFrom: 30, weekBuys: 3, chHonor: 40, chTries: 3, chAbove: 5, look: 3 };
// Stil = feste Eigenschaft (wie Elite-Eigenschaften im Abstieg) → man sieht vorher, was hilft
export const PIT_STYLES = {
  flink: { name: 'Flink', text: 'Weicht oft aus.', eff: { evade: 0.12 } },
  stein: { name: 'Blocker', text: 'Blockt viel, schwer gepanzert.', eff: { block: 0.15 }, mult: { armor: 1.5 } },
  dorn:  { name: 'Dornen', text: 'Wer zuschlägt, blutet mit.', eff: { thorns: 0.15 } },
  vamp:  { name: 'Blutsauger', text: 'Heilt sich an deinem Blut.', eff: { leech: 0.12 } },
  wut:   { name: 'Rasend', text: 'Wird gefährlich, wenn er blutet.', eff: { rage: 0.3 } },
  gift:  { name: 'Gift', text: 'Gift, das sich stapelt.', eff: { poison: 0.12 } },
  zaeh:  { name: 'Zäh', text: 'Viel Leben, wenig Finesse.', mult: { hp: 1.25 } },
  krit:  { name: 'Krit', text: 'Trifft selten, dann aber tief.', eff: { crit: 0.15 } },
};
const PIT_NAMES = ['Morgrim', 'Asha die Blasse', 'Kel Varn', 'Ysra', 'Brann die Mauer', 'Oswin der Stumme', 'Mireth', 'Draven', 'Hagen Rotbart', 'Seline',
  'Gorm', 'Die Witwe Lenna', 'Ulrich Eisenzahn', 'Tara', 'Corvin', 'Bruder Anselm', 'Rika Schnitt', 'Vol', 'Mathis der Lange', 'Eda',
  'Sigurd', 'Nessa Graudorn', 'Falk', 'Isolde', 'Der Ochse', 'Lio', 'Wendel', 'Agna', 'Rurik', 'Silbermaske',
  'Konrad', 'Yeva', 'Thane', 'Die Zwillinge', 'Barek', 'Marla', 'Ivo der Schöne', 'Grete', 'Varg', 'Holle',
  'Jorun', 'Sabin', 'Krähe', 'Helmar', 'Dunja', 'Pater Ruprecht', 'Ilka', 'Ottokar', 'Neve', 'Der Kettenhund'];
const PIT_CLS = ['barbarian', 'witch', 'assassin', 'paladin', 'sorceress', 'huntress'], PIT_ST = Object.keys(PIT_STYLES);
export const PIT_RIVALS = PIT_NAMES.map((name, i) => ({ id: 'r' + i, name, cls: PIT_CLS[(i * 5 + 1) % 6], style: PIT_ST[(i * 3 + Math.floor(i / 8)) % PIT_ST.length] }));
export const PIT_LINES = ['„Noch einer für den Sand.“', '„Ich habe Zeit. Du nicht.“', '„Vargo zahlt mir mehr, wenn du schreist.“', '„Komm näher.“',
  '„Drei sind an mir zerbrochen.“', '„Du riechst nach Angst.“', '„Leg dich hin, dann geht es schneller.“', '„Ich kenne deinen Namen nicht. Bald auch niemand sonst.“'];
// Ränge: max = schlechtester Platz, der noch dazugehört. Erster Aufstieg → Titel + Segen (Trophäe), Laden-Stufe bleibt offen
export const PIT_RANKS = [
  { id: 'ratte', name: 'Grubenratte', max: 51 },
  { id: 'blut', name: 'Blutsand', max: 40, title: 'der Blutige', perk: { hpPct: 0.02 } },
  { id: 'kette', name: 'Kettenbrecher', max: 30, title: 'Kettenbrecher', perk: { dmgPct: 0.02 } },
  { id: 'schl', name: 'Schlächter', max: 20, title: 'Schlächter der Grube', perk: { armorPct: 0.03 } },
  { id: 'champ', name: 'Champion', max: 10, title: 'Champion von Vargo', perk: { hpPct: 0.03 } },
  { id: 'koenig', name: 'Grubenkönig', max: 1, title: 'Grubenkönig', perk: { dmgPct: 0.03 } },
];
// Vargos Laden je Rang-Stufe (Ehre). Ware höchstens auf Heldenstufe, wöchentlich neu, PIT.weekBuys Käufe je Woche.
export const PIT_SHOP = [
  { rank: 'blut', wares: [{ t: 'item', minRarity: 3, price: 60 }, { t: 'item', minRarity: 3, price: 60 }, { t: 'mat', id: 'asche', n: 3, price: 25 }] },
  { rank: 'kette', wares: [{ t: 'herb', id: 'herz', n: 2, price: 70 }, { t: 'mat', id: 'blutstein', n: 2, price: 60 }, { t: 'item', slot: 'ring', minRarity: 3, price: 90 }] },
  { rank: 'schl', wares: [{ t: 'item', minRarity: 4, price: 160 }, { t: 'mat', id: 'siegel', n: 1, price: 80 }] },
  { rank: 'champ', wares: [{ t: 'item', slot: 'weapon', own: 1, minRarity: 4, price: 220 }] },
];
// Herausforderung der Woche: ein Rivale über dir mit einer Regel; Sieg = Ehre, Platz bleibt
export const PIT_RULES = [
  { id: 'nopots', name: 'Ohne Tränke', text: 'Der Gürtel bleibt zu.' },
  { id: 'crit', name: 'Blutiger Sand', text: 'Beide treffen öfter kritisch.', both: { crit: 0.15 } },
  { id: 'thorn', name: 'Dornenring', text: 'Jeder Hieb kommt teilweise zurück.', both: { thorns: 0.15 } },
  { id: 'slow', name: 'Lange Nacht', text: 'Beide mit doppeltem Leben.', bothMult: { hp: 2 } },
];

// --- Die Akte (Streifzug): 6 Akte, je 8 Gebiete + Boss. Neue Gebiete kosten nichts, Wiederholen kostet Glut (farmen). ---
// Stufe der Gebiete steigt von lvl bis top, `diff` macht spätere Akte zäher (ohne mehr EP); der Boss öffnet den nächsten Akt und die Krypta `crypt` (deren Boss dann in Stufen wiederholbar).
export const ACT = { doneAt: [6, 9, 11, 15, 17, 19], zones: 8, elites: [3, 6], firstXp: 3, firstGold: 2, bossXp: 6, bossGold: 5, replay: 1, itemP: 0.45, eliteDiff: 1.15, eliteHp: 1.25, bossMult: 0.95, bossItems: 2, matFirst: 1 };
export const ACTS = [
  { id: 'a1', n: 'I', intro: 'Die Glocke hat sie geweckt. Ansgar gräbt nicht mehr für die Toten – er gräbt sie aus.', say: 'Jedes Grab hier habe ich geschaufelt. Deins auch.', outro: 'Ansgar fällt in die Grube, die er selbst ausgehoben hat. Das Tor zur Gruft steht offen.',
    loc: 'friedhof', lvl: 1, top: 6, diff: 1.0, eliteDiff: 0.9, eliteHp: 1.0, bossMult: 0.52, crypt: 'c1', zones: ['Das Friedhofstor', 'Die Reihen der Armen', 'Das offene Grab', 'Die Wacht am Beinhaus', 'Der Weidenhang', 'Die Gräbergasse', 'Der Mauerbruch', 'Das Leichenhaus'],
    boss: { name: 'Ansgar, der Totengräber', glyph: 'totengraeber', mech: { ward: 0.25, bleed: 0.3 }, mechText: 'Gräbt sich ein: kämpft hinter einem Wall aus Erde', mix: { cold: 0.2 } } },
  { id: 'a2', n: 'II', intro: 'Das Rad dreht sich ohne Wasser. Was die Müllerin mahlt, war einmal ein Dorf.', say: 'Alles wird Mehl. Auch du.', outro: 'Das Mahlwerk steht still. Zum ersten Mal seit dem Glockenschlag ist es leise an der Mühle.',
    loc: 'muehle', lvl: 6, top: 12, diff: 1.05, eliteDiff: 0.95, eliteHp: 1.0, bossMult: 0.72, crypt: 'c2', zones: ['Der Mühlbach', 'Das Speichertor', 'Die Kornkammer', 'Der Rattenkeller', 'Das Wasserrad', 'Der Mahlboden', 'Die Sackkammer', 'Der Mühlstein'],
    boss: { name: 'Die Müllerin', glyph: 'muellerin', mech: { rage: 0.6, armorMult: 1.3 }, mechText: 'Mahlt sich in Raserei – je länger der Kampf, desto härter', mix: { fire: 0.3 } } },
  { id: 'a3', n: 'III', intro: 'Unter Vhal liegen mehr Tote, als oben je gelebt haben. Jemand hat begonnen, sie zu zählen.', say: 'Du fehlst in meinen Büchern. Das lässt sich richten.', outro: 'Die Schädelwand bricht. Niemand zählt mehr, und die Knochen bleiben liegen.',
    loc: 'katakomben', lvl: 12, top: 18, diff: 1.12, crypt: 'c3', zones: ['Der Einstieg', 'Die Ossuarien', 'Die Schädelwand', 'Der Brunnenschacht', 'Die Knochenhalle', 'Die Kammer der Ordnung', 'Der tiefe Gang', 'Das Zählwerk'],
    boss: { name: 'Der Knochenordner', glyph: 'knochenordner', mech: { block: 0.35, armorMult: 1.4 }, mechText: 'Knochenschild: blockt viele Hiebe – Zauber treffen immer', mix: { cold: 0.4 }, res: { phys: 0.1 } } },
  { id: 'a4', n: 'IV', intro: 'Im Moor hängt man nicht, um zu sterben. Man hängt, um zu bleiben.', say: 'Komm näher, Kind. Für dich habe ich noch einen Strick.', outro: 'Die Mutterweide sinkt ins Wasser. Die Stricke lösen sich, einer nach dem anderen.',
    loc: 'moor', lvl: 18, top: 24, diff: 1.25, crypt: 'c4', zones: ['Der Bohlenweg', 'Die Galgenweiden', 'Das stille Wasser', 'Die Hütte im Schilf', 'Der Strickbaum', 'Die Irrlichter', 'Das versunkene Dorf', 'Die Mutterweide'],
    boss: { name: 'Die Mutter der Stricke', glyph: 'strickmutter', mech: { poison: 0.22, regen: 0.015 }, mechText: 'Würgt: Gift, das sich stapelt – und das Moor heilt sie', mix: { cold: 0.4 }, res: { elem: 0.1 } } },
  { id: 'a5', n: 'V', intro: 'Sie haben den Altar umgedreht und beten zur Glocke. Die Glocke antwortet.', say: 'Ich habe sie als Erster gehört. Ich werde sie als Letzter hören.', outro: 'Der Erste Kultist verstummt mitten im Gebet. Unter dem Altar führt eine Treppe nach unten.',
    loc: 'kapelle', lvl: 24, top: 30, diff: 1.45, crypt: 'c5', zones: ['Der Kirchhof', 'Das Portal', 'Das Kirchenschiff', 'Die Sakristei', 'Der Glockenturm', 'Die Krypta der Äbte', 'Der Chor', 'Der Altar'],
    boss: { name: 'Der Erste Kultist', glyph: 'kultist1', mech: { thorns: 0.3, regen: 0.02 }, mechText: 'Wer zuschlägt, trifft sich selbst – Dornen', mix: { fire: 0.3 } } },
  { id: 'a6', n: 'VI', intro: 'Hier wurde deine Krone gegossen. Die Glut hat nicht vergessen, wem sie gehört.', say: 'Du trugst sie einen Sommer. Ich trage sie, seit die Welt brennt.', outro: 'Der Aschenthron ist leer. Die Asche ist noch warm – wie eine Einladung.',
    loc: 'gruben', lvl: 30, top: 36, diff: 1.65, crypt: null, zones: ['Der Schlackenhang', 'Die Aschefelder', 'Der Schwefelsee', 'Die Brücke aus Ketten', 'Die Esse', 'Der Thronweg', 'Die Glutgruben', 'Der Aschenthron'],
    boss: { name: 'Der Aschenkönig', glyph: 'aschenkoenig', mech: { execute: 0.5, regen: 0.025, crit: 0.12 }, mechText: 'Glut: heilt sich in der Asche und schlachtet Geschwächte', mix: { fire: 0.5 }, res: { elem: 0.15 } } },
];
// (intro = Einleitung im Akt-Kopf, say = Satz des Bosses, sobald er als Nächstes wartet, outro = Nachruf nach seinem Fall)
// Krypten: nur noch der Boss, frei nach dem Akt-Boss. Jede besiegte Stufe → nächste ist schwerer, Beute besser.
// Stufe `dTier[d]` erreicht = Trophäe/Ziel der alten Schwierigkeit d (Albtraum, Hölle) für Questziele `bossd`.
export const CRYPT = { glut: 10, glutPerTier: 1, lvlAdd: 2, tierLvl: 3, tierMult: 0.06, rarAt: [0, 2, 5], items: [1, 2, 3], dTier: [0, 3, 6] };

// --- Umherziehen (Idle, nur bei offener App): der Held zieht Punkt für Punkt durch den höchsten Akt ---
// Je Punkt `sec` Sekunden, höchstens `maxSec` am Stück. Ein Kampf-Punkt ist `loot` Glut wert: Beute = loot ÷ Glut-Preis des Gebiets × ein
// Wiederholungs-Kampf (EP sofort, Rest im Sack). So bringen 2 Std. in jedem Akt etwa so viel wie die Glut derselben Zeit (30) – nicht ein Vielfaches.
// Geprüft in tests/logic.test.mjs („Umherziehen übertrifft die Glut nicht“).
// Ist die App länger als `gap` Sek. weg (zu/schläft), steht der Held still – die Zeit wird verschoben, nicht nachgeholt.
// Route: wie bei der Expedition selbst wählen – `rows` Stationen (Breiten `widths`), je Station `per` Punkte; Punkte einer Station
// sind zu `bias` von ihrer Art, sonst zufällig. rows × per × sec = maxSec.
export const WANDER_ST = {
  fight: { name: 'Jagdgrund', img: 'danger', w: 3, text: 'Kämpfe: EP, Gold, Material' },
  herb: { name: 'Kräuterfeld', img: 'herb', w: 2, text: 'Zutaten des Ortes' },
  mats: { name: 'Gebeinfeld', img: 'mats', w: 2, text: 'Material des Ortes' },
  ruin: { name: 'Ruine', img: 'ruin', w: 1.5, text: 'Gold, Chance auf Fundstücke' },
  camp: { name: 'Lager', img: 'camp', w: 0.7, max: 1, text: 'Ruhe: etwas EP, sicher' },
};
export const WANDER = { rows: 6, widths: [2, 3, 2, 3, 2, 3], per: 10, bias: 0.75, sec: 120, maxSec: 7200, gap: 90, keep: 7, loot: 0.75, matP: 0.15, herbP: 0.1, itemP: 0.03, ruinItem: 0.15, ruinGold: 2, campXp: 0.4,
  kinds: [
    { id: 'fight', w: 4, verb: 'Kämpft gegen' },
    { id: 'herb', w: 2, verb: 'Pflügt ein Kräuterfeld', name: 'Kräuterfeld', img: 'herb' },
    { id: 'mats', w: 2, verb: 'Gräbt im Gebeinfeld', name: 'Gebeinfeld', img: 'mats' },
    { id: 'ruin', w: 1.2, verb: 'Durchsucht eine Ruine', name: 'Ruine', img: 'ruin' },
    { id: 'camp', w: 0.8, verb: 'Rastet am Feuer', name: 'Rast', img: 'camp' },
  ] };
