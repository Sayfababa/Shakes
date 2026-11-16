// Reine Spieldaten. Balancing nur hier.
export const CLASSES = {
  barbarian: { name: 'Barbar', main: 'str', portrait: 'barbarian', hp: 6, desc: 'Rohe Kraft. Raserei: Chance auf zweiten Hieb unter 50% Leben.', weapon: 'axe', passive: { rage: 0.3 } },
  paladin:   { name: 'Paladin', main: 'str', portrait: 'paladin', hp: 5, desc: 'Heiliger Schild. Blockt 25% aller Angriffe.', weapon: 'sword', passive: { block: 0.25 } },
  assassin:  { name: 'Assassine', main: 'dex', portrait: 'assassin', hp: 5.5, desc: 'Klingen im Schatten. Erhöhte kritische Treffer, Bluten.', weapon: 'dagger', passive: { crit: 0.12, bleed: 0.25 } },
  huntress:  { name: 'Jägerin', main: 'dex', portrait: 'huntress', hp: 4.5, desc: 'Pfeil und Geduld. Erster Schuss immer vor dem Gegner.', weapon: 'bow', passive: { first: 1 } },
  sorceress: { name: 'Zauberin', main: 'int', portrait: 'sorceress', hp: 4.6, desc: 'Arkanes Feuer. Ignoriert Rüstung zur Hälfte.', weapon: 'staff', passive: { pen: 0.5 } },
  witch:     { name: 'Grabhexe', main: 'int', portrait: 'witch', hp: 4.6, desc: 'Totenmagie. Entzieht 20% des Schadens als Leben.', weapon: 'wand', passive: { leech: 0.2 } },
};

export const ATTRS = { str: 'Stärke', dex: 'Geschick', int: 'Intelligenz', con: 'Konstitution', lck: 'Glück' };

export const RARITIES = [
  { id: 'broken',    name: 'Zerbrochen', w: 14, affixes: 0, mult: 0.6 },
  { id: 'normal',    name: 'Gewöhnlich', w: 46, affixes: 0, mult: 1 },
  { id: 'magic',     name: 'Magisch',    w: 28, affixes: [1, 2], mult: 1.15 },
  { id: 'rare',      name: 'Selten',     w: 10, affixes: [3, 4], mult: 1.3 },
  { id: 'legendary', name: 'Legendär',   w: 2,  affixes: [4, 5], mult: 1.6 },
];

export const SLOTS = { helm: 'Helm', chest: 'Brust', gloves: 'Handschuhe', boots: 'Stiefel', belt: 'Gürtel',
  amulet: 'Amulett', ring: 'Ring', weapon: 'Waffe', offhand: 'Nebenhand' };

// Item-Basen. w×h = Größe im Inventar-Raster (Diablo-Stil).
export const BASES = [
  { slot: 'helm', name: 'Kappe', armor: 3, w: 2, h: 2, art: 'cap', vars: ['cap_a', 'cap_b'] }, { slot: 'helm', name: 'Eisenhelm', armor: 6, w: 2, h: 2, art: 'helm', vars: ['helm_a', 'helm_b'] }, { slot: 'helm', name: 'Totenmaske', armor: 9, w: 2, h: 2, art: 'mask', vars: ['mask_a', 'mask_b'] },
  { slot: 'chest', name: 'Lederwams', armor: 8, w: 2, h: 3, art: 'leather', vars: ['leather_a', 'leather_b'] }, { slot: 'chest', name: 'Kettenhemd', armor: 14, w: 2, h: 3, art: 'mail' }, { slot: 'chest', name: 'Plattenpanzer', armor: 22, w: 2, h: 3, art: 'plate', vars: ['plate_b'] },
  { slot: 'gloves', name: 'Lederhandschuhe', armor: 2, w: 2, h: 2, art: 'gloves', vars: ['gloves_a', 'gloves_b'] }, { slot: 'gloves', name: 'Panzerhandschuhe', armor: 5, w: 2, h: 2, art: 'gauntlets', vars: ['gauntlets_a', 'gauntlets_b'] },
  { slot: 'boots', name: 'Stiefel', armor: 2, w: 2, h: 2, art: 'boots', vars: ['boots_a', 'boots_b'] }, { slot: 'boots', name: 'Kriegsstiefel', armor: 5, w: 2, h: 2, art: 'greaves', vars: ['greaves_a', 'greaves_b'] },
  { slot: 'belt', name: 'Schärpe', armor: 1, w: 2, h: 1, art: 'sash', vars: ['sash_a', 'sash_b'] }, { slot: 'belt', name: 'Plattengürtel', armor: 4, w: 2, h: 1, art: 'belt', vars: ['belt_a', 'belt_b'] },
  { slot: 'offhand', name: 'Rundschild', armor: 7, w: 2, h: 2, art: 'buckler', vars: ['buckler_a', 'buckler_b'] }, { slot: 'offhand', name: 'Turmschild', armor: 12, w: 2, h: 3, art: 'tower', vars: ['tower_a', 'tower_b'] },
  { slot: 'amulet', name: 'Amulett', w: 1, h: 1, art: 'amulet', vars: ['amulet_a', 'amulet_b'] }, { slot: 'ring', name: 'Ring', w: 1, h: 1, art: 'ring', vars: ['ring_a', 'ring_b'] },
  { slot: 'weapon', kind: 'axe', name: 'Beil', dmg: [3, 8], w: 2, h: 3, art: 'hatchet', vars: ['hatchet_a'] }, { slot: 'weapon', kind: 'axe', name: 'Kriegsaxt', dmg: [6, 14], w: 2, h: 3, art: 'waraxe' },
  { slot: 'weapon', kind: 'sword', name: 'Kurzschwert', dmg: [3, 7], w: 1, h: 3, art: 'sword', vars: ['sword_a'] }, { slot: 'weapon', kind: 'sword', name: 'Bastardschwert', dmg: [6, 12], w: 1, h: 4, art: 'longsword' },
  { slot: 'weapon', kind: 'dagger', name: 'Dolch', dmg: [2, 6], w: 1, h: 2, art: 'dagger' }, { slot: 'weapon', kind: 'dagger', name: 'Klauenklinge', dmg: [4, 10], w: 1, h: 3, art: 'claw', vars: ['claw_a'] },
  { slot: 'weapon', kind: 'bow', name: 'Kurzbogen', dmg: [3, 8], w: 2, h: 3, art: 'bow', vars: ['bow_a'] }, { slot: 'weapon', kind: 'bow', name: 'Langbogen', dmg: [5, 12], w: 2, h: 4, art: 'longbow' },
  { slot: 'weapon', kind: 'staff', name: 'Stab', dmg: [4, 9], w: 1, h: 4, art: 'staff', vars: ['staff_a'] }, { slot: 'weapon', kind: 'staff', name: 'Runenstab', dmg: [5, 12], w: 1, h: 4, art: 'runestaff' },
  { slot: 'weapon', kind: 'wand', name: 'Knochenstab', dmg: [4, 8], w: 1, h: 2, art: 'wand', vars: ['wand_a'] }, { slot: 'weapon', kind: 'wand', name: 'Grabszepter', dmg: [5, 11], w: 1, h: 3, art: 'scepter' },
  // Höhere Grundgegenstände (wie "Exceptional" in D2): erst ab Gegenstandsstufe minLvl, stärkere Grundwerte
  { slot: 'helm', name: 'Dornenhelm', armor: 13, w: 2, h: 2, art: 'spikehelm', minLvl: 14 }, { slot: 'helm', name: 'Gehörnter Helm', armor: 17, w: 2, h: 2, art: 'hornhelm', minLvl: 24 },
  { slot: 'chest', name: 'Dornenpanzer', armor: 30, w: 2, h: 3, art: 'spikeplate', minLvl: 18 },
  { slot: 'weapon', kind: 'axe', name: 'Henkersaxt', dmg: [9, 20], w: 2, h: 3, art: 'doubleaxe', minLvl: 16 },
  { slot: 'weapon', kind: 'sword', name: 'Runenklinge', dmg: [9, 18], w: 1, h: 4, art: 'runeblade', minLvl: 16 },
  { slot: 'weapon', kind: 'dagger', name: 'Sichelklinge', dmg: [6, 15], w: 1, h: 3, art: 'sickle', minLvl: 16 },
  { slot: 'weapon', kind: 'bow', name: 'Reflexbogen', dmg: [8, 18], w: 2, h: 4, art: 'recurve', minLvl: 16 },
  { slot: 'weapon', kind: 'staff', name: 'Sternenstab', dmg: [8, 18], w: 1, h: 4, art: 'starstaff', minLvl: 16 },
  { slot: 'weapon', kind: 'wand', name: 'Blutszepter', dmg: [8, 17], w: 1, h: 3, art: 'bloodscepter', minLvl: 16 },
];
export const INV_W = 10, INV_H = 4;

// Affixe: stat, Wert pro Itemstufe, Präfix/Suffix-Namen
export const AFFIXES = [
  { stat: 'str', per: 1, pre: 'Starker', suf: 'des Bären' },
  { stat: 'dex', per: 1, pre: 'Flinker', suf: 'des Fuchses' },
  { stat: 'int', per: 1, pre: 'Kundiger', suf: 'des Gelehrten' },
  { stat: 'con', per: 1, pre: 'Zäher', suf: 'des Ochsen' },
  { stat: 'lck', per: 1.5, pre: 'Glücklicher', suf: 'der Fortuna' },
  { stat: 'armor', per: 8, pre: 'Gehärteter', suf: 'der Wacht' },
  { stat: 'dmg', per: 0.6, pre: 'Grausamer', suf: 'des Schlachters' },
  { stat: 'haste', per: 2, pre: 'Rascher', suf: 'der Beschwörung', pct: 1, label: 'Zaubertempo' },   // Zaubertempo in %: Zauber laden schneller
  // Kampf-Boni in % (nur auf passenden Teilen, `slots`). Werte sind gegen das Hauptattribut geeicht (tests/calib.mjs):
  // ein Bonus der Stufe III bringt etwa so viel Kampfkraft wie ein Hauptattribut-Bonus der Stufe III.
  { stat: 'critc', per: 1.0, pre: 'Scharfer', suf: 'der Schärfe', pct: 1, label: 'Krit-Chance', slots: ['weapon', 'gloves', 'ring', 'amulet'] },
  { stat: 'critd', per: 3.0, pre: 'Brutaler', suf: 'des Gemetzels', pct: 1, label: 'Krit-Schaden', slots: ['weapon', 'gloves', 'amulet'] },
  { stat: 'dmgp', per: 0.95, pre: 'Wütender', suf: 'des Zorns', pct: 1, label: 'Schaden', slots: ['weapon', 'gloves', 'ring'] },
  { stat: 'spellp', per: 1.2, pre: 'Arkaner', suf: 'der Zauberei', pct: 1, label: 'Zauberkraft', slots: ['weapon', 'offhand', 'helm', 'amulet'] },
  { stat: 'penp', per: 1.8, pre: 'Bohrender', suf: 'des Durchbohrens', pct: 1, label: 'Rüstung ignorieren', slots: ['weapon'] },
  { stat: 'leechp', per: 0.65, pre: 'Saugender', suf: 'des Egels', pct: 1, label: 'Lebensraub', slots: ['weapon', 'ring'] },
  { stat: 'lifep', per: 1.9, pre: 'Lebendiger', suf: 'des Lebens', pct: 1, label: 'Leben', slots: ['chest', 'helm', 'belt'] },
  { stat: 'blockp', per: 1.6, pre: 'Wehrhafter', suf: 'des Walls', pct: 1, label: 'Blocken', slots: ['offhand'] },
  { stat: 'evadep', per: 1.5, pre: 'Schemenhafter', suf: 'des Nebels', pct: 1, label: 'Ausweichen', slots: ['boots', 'gloves'] },
  { stat: 'thornsp', per: 3.5, pre: 'Dorniger', suf: 'der Dornen', pct: 1, label: 'Dornen', slots: ['chest', 'offhand'] },
];
// Zauber-Boni (nur auf Waffen der Klasse, die den Zauber hat): "+N % Feuerball" stärkt Schaden/Heilung/Schild/Wirkung des Zaubers.
// Werden am Dateiende aus SPELLS erzeugt (stat 'sk_<id>', cls).
export const SKILL_PER = 3.5;
// Obergrenzen für Prozent-Boni (Summe aus allem)
export const CAPS = { crit: 0.6, critMult: 3, leech: 0.4, thorns: 0.6, evade: 0.5, block: 0.5, pen: 0.9 };
export const LEGEND_NAMES = ['Grabesruh', 'Aschenkuss', 'Der Letzte Psalm', 'Witwenmacher', 'Knochenkrone', 'Sünde von Vhal', 'Rabenschwur', 'Blutglocke'];

// --- Bonus-Stufen (wie Affix-Tiers): I ist die beste, gibt es erst auf hoher Gegenstandsstufe ---
export const TIERS = [
  { t: 1, name: 'I', mult: 1.55, w: 5, minLvl: 20 },
  { t: 2, name: 'II', mult: 1.25, w: 12, minLvl: 12 },
  { t: 3, name: 'III', mult: 1.0, w: 23, minLvl: 6 },
  { t: 4, name: 'IV', mult: 0.8, w: 30, minLvl: 1 },
  { t: 5, name: 'V', mult: 0.6, w: 30, minLvl: 1 },
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
  { name: 'Knochenkrone', slot: 'helm', mods: { con: 2, int: 3 }, eff: { ward: 0.2 }, lore: 'Gewachsen aus dem Schädel ihres Trägers.' },
  { name: 'Sünde von Vhal', slot: 'chest', mods: { armor: 1, con: 2 }, eff: { thorns: 0.25 }, lore: 'Getragen vom Metzger, bis er fiel.' },
  { name: 'Blutglocke', slot: 'amulet', mods: { str: 2, haste: 2 }, eff: { rage: 0.25 }, lore: 'Sie schlägt mit deinem Herzen.' },
  { name: 'Totengräbers Griff', slot: 'gloves', mods: { str: 2, dmg: 3 }, eff: { execute: 0.4 }, lore: 'Er hat nie jemanden lebendig begraben. Fast nie.' },
  { name: 'Pfad der Asche', slot: 'boots', mods: { dex: 2, haste: 2 }, eff: { evade: 0.08 }, lore: 'Keine Spur bleibt zurück.' },
  { name: 'Ring der Ertrunkenen', slot: 'ring', mods: { lck: 2, int: 3 }, eff: { poison: 0.1 }, lore: 'Aus Gerlindes Brunnen gefischt.' },
  { name: 'Siegel des Kronenlosen', slot: 'ring', mods: { str: 3, dex: 3 }, eff: { pen: 0.3, crit: 0.05 }, lore: 'Die Krone fehlt. Die Macht nicht.' },
  { name: 'Gürtel der Büßer', slot: 'belt', mods: { con: 1, armor: 3 }, eff: { hpPct: 0.15 }, lore: 'Jeder Knoten eine Sünde.' },
];
export const UNIQUE_CHANCE = 0.6;   // so viele Legendäre sind Einzigartige (sonst: zufällige Legendäre mit Namen)

// Materialien: fallen von bestimmten Monstern, werden von Händlern verlangt.
export const MATS = {
  zahn: 'Ghulzahn', staub: 'Knochenstaub', schwanz: 'Pestrattenschwanz', siegel: 'Kultistensiegel',
  blutstein: 'Blutstein', haar: 'Hexenhaar', asche: 'Höllenasche', leinen: 'Grableinen',
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

// --- Umschmieden (Crafting, Schritt 2): Material = Werkzeug. Jeder Eingriff kostet Schmiedeglut des Items. ---
// Ist die Glut aufgebraucht, ist das Item vollendet und trägt den Namen seines Schmieds.
export const CRAFT = {
  glut: { magic: 16, rare: 24, legendary: 30 }, glutRand: 6,      // Startglut je Seltenheit (+0..glutRand)
  maxAff: { magic: 2, rare: 4, legendary: 5 },
  gold: [10, 4], goldValue: 0.6,                                   // Gold = a + Gegenstandsstufe × b + Wert × goldValue
  ops: [
    { id: 'seal', name: 'Versiegeln', mat: 'siegel', n: 2, glut: 4, text: 'Ein Bonus bleibt bei allem Folgenden unverändert (einer je Item).' },
    { id: 'chaos', name: 'Neu würfeln', mat: 'asche', n: 2, glut: 3, text: 'Alle unversiegelten Boni werden neu gewürfelt.' },
    { id: 'values', name: 'Werte würfeln', mat: 'staub', n: 2, glut: 2, text: 'Gleiche Boni, neue Werte und Stufen.' },
    { id: 'add', name: 'Hinzufügen', mat: 'blutstein', n: 2, glut: 5, text: 'Ein neuer Bonus, wenn Platz ist.' },
    { id: 'remove', name: 'Tilgen', mat: 'leinen', n: 2, glut: 2, text: 'Ein zufälliger unversiegelter Bonus verschwindet.' },
  ],
  glutJitter: 2,                                                   // jeder Eingriff kostet zusätzlich 0..2 Glut (Unsicherheit wie Last Epoch)
};

export const MONSTERS = [
  { name: 'Verfaulter Ghul', glyph: 'ghul', mat: 'zahn' }, { name: 'Gefallener', glyph: 'fallen', mat: 'asche' },
  { name: 'Skelettkrieger', glyph: 'skelett', mat: 'staub' }, { name: 'Grabräuber', glyph: 'grabraeuber', mat: 'leinen' },
  { name: 'Pestratte', glyph: 'pestratte', mat: 'schwanz' }, { name: 'Kultist der Glocke', glyph: 'kultist', mat: 'siegel' },
  { name: 'Blutfürst', glyph: 'blutfuerst', mat: 'blutstein' }, { name: 'Sumpfhexe', glyph: 'sumpfhexe', mat: 'haar' },
  { name: 'Knochenhund', glyph: 'knochenhund', mat: 'staub' }, { name: 'Gehäuteter', glyph: 'gehaeuteter', mat: 'blutstein' },
  { name: 'Höllenbrut', glyph: 'hoellenbrut', mat: 'asche' }, { name: 'Wiedergänger', glyph: 'wiedergaenger', mat: 'leinen' },
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
  halvar: { name: 'Halvar', role: 'Schmied', glyph: 'halvar', slots: ['weapon', 'offhand'],
    quote: 'Der Stahl ist alt. Er schneidet trotzdem. Wie ich.', need: [0, 200, 700, 1600], lvl: [1, 6, 14, 22] },
  ysolde: { name: 'Mutter Ysolde', role: 'Kräuterhexe', glyph: 'ysolde', slots: ['amulet', 'ring', 'belt'],
    quote: 'Bring mir, was die Toten nicht mehr brauchen, Kind.', need: [0, 200, 700, 1600], lvl: [1, 7, 15, 23] },
  kaspar: { name: 'Bruder Kaspar', role: 'Totengräber', glyph: 'kaspar', slots: ['helm', 'chest', 'gloves', 'boots'],
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
    { id: 'k3', title: 'In die Gruft', lvl: 4, text: 'Steig in die Gruft der Wäscherinnen. Drei Ebenen tief. Erzähl mir, was du siehst.',
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
    { id: 'i1', title: 'Das Licht halten', lvl: 2, text: 'Meine Schwestern stiegen in die Gruft und kamen nicht zurück. Steig hinab. Zwei Ebenen. Erzähl mir, was du siehst.',
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
    { id: 'reroll', name: 'Amulett neu weihen', slot: 'amulet', cost: [{ schwanz: 2 }], gold: [40], perLvl: 8 },
    // Glücksgriff: zufälliges, meist magisches Stück – Gold-Senke wie das Glücksspiel bei Gheed/Anya
    { id: 'gamble', name: 'Glücksgriff', cost: [{}], gold: [60], perLvl: 45 },
  ],
};

// --- Tutorial: Schritte mit Bedingung (ausgewertet in main.js) ---
export const TUTORIAL = [
  { tab: 'traders', when: 'view:traders', text: 'Du bist erwacht. Drei Gestalten warten am Friedhofstor. Tippe unten auf <b>Händler</b>.' },
  { tab: 'traders', when: 'view:kaspar', text: 'Jeder Händler hat Aufträge. Sieh dir <b>Bruder Kaspar</b> an – er will, dass du seinen Friedhof säuberst.' },
  { tab: 'trips', when: 'active', text: 'Öffne <b>Streifzug</b> und tippe auf <b>Akt I</b>. Jedes Gebiet ist ein Kampf – neue kosten nichts.' },
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

// --- Steckbriefe: täglich 3 Aufträge (Endspiel, wiederholbar) ---
export const BOUNTIES = [
  { id: 'kill', n: 5, text: (t) => `Töte ${t}` },
  { id: 'blood', n: 2, text: () => 'Siege auf blutiger Spur' },
  { id: 'deep', n: 1, text: () => 'Erreiche Tiefe 2 und kehre heim' },
  { id: 'crypt', n: 3, text: () => 'Siege in den Krypten' },
  { id: 'arena', n: 2, text: () => 'Siege in der Grube' },
];

export const CFG = {
  maxGlut: 120, glutRegenMin: 4,      // 1 Glut pro x Minuten (Echtzeit)
  // --- Kurven (nach Bot-Review: Anfang strecken, Zahlen flach halten) ---
  xpBase: 90, xpExp: 1.75,            // EP für nächste Stufe = xpBase * Stufe^xpExp
  hpBase: 3, hpPerLvl: 0.25,          // Leben = Kon × Klassenfaktor × (hpBase + Stufe × hpPerLvl)  (Spieler und Monster)
  mainDiv: 20,                        // Schaden × (1 + Hauptattribut / mainDiv)
  affixBase: 1, affixPerLvl: 0.5,     // Affix-Wert = per × (affixBase + iLvl × affixPerLvl)
  pctBase: 10, pctPerLvl: 0.25,       // Prozent-Boni (pct): per × (pctBase + iLvl × pctPerLvl) – wachsen flacher, sonst kippen sie spät
  rareMinLvl: 4, legendaryMinLvl: 10, // darunter keine/kaum seltene bzw. legendäre Beute
  bossHp: 2.2, bossDiff: 1.35,
  rushPerLvl: 3,                      // Eilen: 1 Gold je 20 s Restzeit × (1 + Stufe / rushPerLvl)
  attrPerLevel: 5, startPoints: 5,       // Attributpunkte pro Stufenaufstieg
  wayCostPerLvl: 6,                  // Zauber-Weg umentscheiden: Gold je Stufe (erste Wahl gratis)
  respecPerLvl: 30,                        // Läuterung: Gold je Stufe (erste gratis)
  cryptCdSec: 180, arenaCdSec: 300, arenaGlut: 4,                         // Pause nach jedem Krypta-Kampf (Prototyp)
  shopSize: 6, shopRefreshSec: 600, matChance: 0.7,
  lootChance: 0.55, critBase: 0.05,
  strArmor: 0.5,                      // Stärke gibt jeder Klasse Rüstung (je Punkt)
  spellK: 60,                         // Zauberkraft = 1 + Int / (Int + spellK)  (sättigt, max. ×2)
  monHp: 1.3, monDmg: 1.1,
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
    { id: 'feuerball', fx: '#ff7a1a', name: 'Feuerball', lvl: 1, every: 3, kind: 'hit', mult: 1.7, text: '170 % Schaden, nicht blockbar' },
    { id: 'frost', fx: '#9fd8ff', name: 'Frostnova', lvl: 8, every: 5, kind: 'stun', mult: 1.2, text: '120 % Schaden und betäubt' },
    { id: 'meteor', fx: '#ff5a10', name: 'Meteor', lvl: 18, every: 7, kind: 'hit', mult: 3.5, text: '350 % Schaden' },
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
  thorns: 'Dornen', execute: 'Schaden gg. Sterbende', first: 'Erstschlag', poison: 'Gift', toll: 'Betäuben', haste: 'Zaubertempo', echo: 'Zauber-Nachhall', ward: 'Knochenschild bei Kampfbeginn' };

// Talentbaum je Klasse: 3 Pfade × 3 Stufen. Stufe n braucht 1 Rang im Talent davor + Charakterstufe TIER_LVL[n].
export const TIER_LVL = [2, 8, 16];
const T = (id, name, max, eff, desc) => ({ id, name, max, eff, desc });
export const TALENTS = {
  barbarian: [
    { name: 'Blutrausch', nodes: [T('b1', 'Zorn', 5, { dmgPct: 0.05 }, 'Mehr Schaden.'), T('b2', 'Ungebändigt', 3, { rage: 0.08 }, 'Öfter Raserei.'), T('b3', 'Schlächter', 1, { execute: 0.5 }, '+50% gegen Feinde unter 30% Leben.')] },
    { name: 'Fell & Narbe', nodes: [T('b4', 'Dickes Fell', 5, { hpPct: 0.06 }, 'Mehr Leben.'), T('b5', 'Narbengewebe', 3, { regen: 0.015 }, 'Heilt jede Runde.'), T('b6', 'Unsterblich', 1, { hpPct: 0.2, thorns: 0.15 }, 'Leben und Dornen.')] },
    { name: 'Kriegsschrei', nodes: [T('b7', 'Brüllen', 5, { evade: 0.015 }, 'Feinde zögern.'), T('b8', 'Knochenbrecher', 3, { pen: 0.1 }, 'Zerschmettert Rüstung.'), T('b9', 'Ahnenruf', 1, { crit: 0.1, dmgPct: 0.1 }, 'Die Ahnen führen die Axt.')] },
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
    boss: { name: 'Mutter Gerlinde, die Ertränkte', glyph: 'gerlinde', mech: { regen: 0.03, leech: 0.1 }, mechText: 'Zieht Leben aus dir und heilt sich' }, trophy: { hpPct: 0.05 } },
  { id: 'c2', name: 'Die Pestkapelle', lvl: 6, glyph: 'rat', floors: ['Pestratte', 'Verfaulter Ghul', 'Kultist der Glocke', 'Gehäuteter'],
    boss: { name: 'Bruder Aldemar, der Verseuchte', glyph: 'aldemar', mech: { poison: 0.25 }, mechText: 'Gift, das sich stapelt – kurze Kämpfe gewinnen' }, trophy: { dmgPct: 0.05 } },
  { id: 'c3', name: 'Das Schlachthaus', lvl: 12, glyph: 'ghoul', floors: ['Gehäuteter', 'Gefallener', 'Blutfürst', 'Höllenbrut'],
    boss: { name: 'Der Metzger von Vhal', glyph: 'butcher', mech: { execute: 0.6, rage: 0.4 }, mechText: 'Wird rasend und schlachtet Geschwächte' }, trophy: { crit: 0.03 } },
  { id: 'c4', name: 'Turm der Glocke', lvl: 20, glyph: 'horn', floors: ['Kultist der Glocke', 'Sumpfhexe', 'Blutfürst', 'Höllenbrut'],
    boss: { name: 'Der Glöckner', glyph: 'bellringer', mech: { toll: 1 }, mechText: 'Jeder dritte Schlag betäubt dich' }, trophy: { armorPct: 0.1, hpPct: 0.05 } },
  { id: 'c5', name: 'Die Glocke', lvl: 26, shards: 4, floors: ['Kultist der Glocke', 'Wiedergänger', 'Blutfürst', 'Höllenbrut'],
    boss: { name: 'Der Kronenlose', glyph: 'self', mech: { mirror: 1 }, mechText: 'Kämpft mit deinen eigenen Talenten' }, trophy: { dmgPct: 0.1, hpPct: 0.1 } },
];
// Jeder erste Bosssieg (Krypta 1–4) bringt einen Glockensplitter. Vier öffnen "Die Glocke".
export const SHARD_CRYPTS = ['c1', 'c2', 'c3', 'c4'];

// Zauber-Boni aus SPELLS erzeugen (Waffe der Klasse → nur deren Zauber)
for (const [cls, list] of Object.entries(SPELLS)) for (const sp of list)
  AFFIXES.push({ stat: 'sk_' + sp.id, per: SKILL_PER, pre: 'Geweihter', suf: 'des Rituals', pct: 1, label: sp.name, slots: ['weapon'], cls, kind: CLASSES[cls].weapon });

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
  meteor: [[W('sternenfall', 'Sternenfall', 'Wirkt sofort zu Kampfbeginn, 25 % weniger Schaden', { open: 1, mult: -0.25 }), W('einschlag', 'Einschlag', 'Betäubt immer, +15 % Schaden', { stun: 1, mult: 0.15 })],
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
  nachtschatten: { name: 'Nachtschatten', img: 'i_nachtschatten' }, schwefel: { name: 'Schwefel', img: 'i_schwefel' }, herz: { name: 'Schwarzes Herz', img: 'i_herz' },
};
// Welche Zutat ein Streifzug-Ort liefert (Chance je Sieg), Herz von Krypta-Bossen
export const HERB_LOC = { friedhof: 'grabmoos', muehle: 'rotwurz', katakomben: 'silberstaub', moor: 'nachtschatten', kapelle: 'grabmoos', gruben: 'schwefel' };
export const ALCH = { herbChance: 0.15, slots: 2, slotsLoyal: 3, loyalNeed: 2, charges: 3, maxCommon: 6, maxRare: 2, bossHearts: 2, floorHeart: 0.12,
  gold: [8, 2.5], goldRare: [30, 7] };   // Gold = a + Stufe × b
export const POTIONS = [
  { id: 'rotwurz', name: 'Rotwurz-Trank', text: 'Heilt 11 % Leben.', fx: { heal: 0.11 }, trig: ['hp50', 'hp30'], cost: { rotwurz: 2 } },
  { id: 'steinhaut', name: 'Steinhaut', text: 'Schild aus 10 % Leben.', fx: { shield: 0.1 }, trig: ['start', 'hp50'], cost: { grabmoos: 2 } },
  { id: 'berserker', name: 'Berserkersud', text: '+35 % Schaden für 3 Züge.', fx: { rage: 0.35, n: 3 }, trig: ['start', 'low'], cost: { rotwurz: 1, grabmoos: 1 } },
  { id: 'gegengift', name: 'Gegengift', text: 'Entfernt Gift, Bluten, Brand. 4 Züge immun.', fx: { cure: 4 }, trig: ['dot'], cost: { grabmoos: 1, silberstaub: 1 } },
  { id: 'wachsaft', name: 'Wachsaft', text: '5 Züge nicht betäubbar.', fx: { stunImm: 5 }, trig: ['start'], cost: { nachtschatten: 2 } },
  { id: 'weihwasser', name: 'Weihwasser', text: 'Gegner kann 6 Züge nicht heilen.', fx: { noheal: 6 }, trig: ['start', 'heal'], cost: { silberstaub: 2 } },
  { id: 'falkenauge', rare: 1, name: 'Falkenauge', text: '+15 % Krit-Chance im ganzen Kampf.', fx: { crit: 0.15 }, cost: { herz: 1, silberstaub: 1 } },
  { id: 'knochenmark', rare: 1, name: 'Knochenmark-Tonikum', text: 'Gegner trifft 10 % seltener kritisch.', fx: { critRes: 0.1 }, cost: { herz: 1, grabmoos: 1 } },
  { id: 'schatten', rare: 1, name: 'Schattentrank', text: '+7 % Ausweichen im ganzen Kampf.', fx: { evade: 0.07 }, cost: { herz: 1, nachtschatten: 1 } },
  { id: 'jaegerblick', rare: 1, name: 'Jägerblick', text: 'Gegner weicht 8 % seltener aus.', fx: { acc: 0.08 }, cost: { herz: 1, silberstaub: 1 } },
  { id: 'bollwerk', rare: 1, name: 'Bollwerk-Trank', text: '+7 % Blocken im ganzen Kampf.', fx: { block: 0.07 }, cost: { herz: 1, grabmoos: 1 } },
  { id: 'rostsaeure', rare: 1, name: 'Rostsäure', text: 'Ignoriert 30 % der Rüstung.', fx: { pen: 0.3 }, cost: { herz: 1, schwefel: 1 } },
  { id: 'zaubertinte', rare: 1, name: 'Zaubertinte', text: 'Alle Zauber starten halb geladen.', fx: { charge: 0.5 }, cost: { herz: 1, nachtschatten: 1 } },
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
  { id: 'nest', title: 'Das Nest', img: 'monsters/pestratte.jpg',
    text: 'Ein Hügel aus Fell, Zähnen und Lumpen. Er atmet. Darin: Dinge, die Ratten nicht fressen.',
    ch: [{ t: 'Ausräuchern', hint: '+Material', eff: { mat: 3 }, out: 'Was übrig bleibt, nimmt Halvar gern.' },
         { t: 'Hindurchwühlen', hint: 'Fundstück – oder Bisse', risk: { p: 0.5, win: { item: 1, gold: 0.5 }, lose: { bless: -0.05 } }, out: ['Zwischen den Knochen: etwas Brauchbares.', 'Die Bisse heilen. Langsam.'] },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Das Rascheln folgt dir bis zur Biegung.' }] },
  { id: 'prophet', title: 'Der Seher am Wegrand', img: 'npcs/prophet.jpg',
    text: 'Er sitzt da, als säße er schon immer da. „Ich sehe dich, Kind der Asche. Willst du hören, was kommt?“',
    ch: [{ t: 'Zuhören', hint: 'Segen für die Krypta', eff: { bless: 0.08 }, out: '„Die dritte Tür. Nicht die zweite.“ Du wirst es dir merken.' },
         { t: 'Ihm Gold geben', hint: 'Gold · +viel Erfahrung', pay: 0.5, eff: { xp: 2 }, out: 'Er beißt auf die Münze. Dann erzählt er bis zum Morgen.' },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Er lacht dir nach. Lange.' }] },
  { id: 'hund', title: 'Der Knochenhund', img: 'monsters/knochenhund.jpg',
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
  { id: 'glocke', title: 'Eine Glocke läutet', img: 'monsters/bellringer.jpg',
    text: 'Irgendwo unter der Erde schlägt eine Glocke. Einmal. Zweimal. Dann wartet sie.',
    ch: [{ t: 'Dem Klang folgen', hint: 'seltenes Fundstück – oder nichts', risk: { p: 0.4, win: { item: 3 }, lose: { xp: 0.5 } }, out: ['Unter der Glocke liegt, was sie bewacht hat.', 'Der Gang endet. Die Glocke schweigt. Du lernst daraus.'] },
         { t: 'Ohren verstopfen', hint: '+Erfahrung', eff: { xp: 0.5 }, out: 'Beim dritten Schlag bist du schon weit weg.' },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Sie läutet noch, als du heimkommst. Nur du hörst sie.' }] },
  { id: 'kniet', title: 'Der Kniende', img: 'expedition/ev_kniet.webp',
    text: 'Ein Wiedergänger kniet vor einem Grab und rührt sich nicht. An seiner Hand ein Ring.',
    ch: [{ t: 'Für ihn beten', hint: 'kleiner Segen · +Erfahrung', eff: { bless: 0.06, xp: 0.5 }, out: 'Er sinkt in sich zusammen. Endlich.' },
         { t: 'Den Ring nehmen', hint: 'magisches Fundstück · ein Fluch', eff: { item: 2, bless: -0.06 }, out: 'Er sieht dir nach. Mit leeren Augen.' },
         { t: 'Weitergehen', hint: 'Nichts.', eff: {}, out: 'Er kniet noch immer.' }] },
  { id: 'ghul', title: 'Der fressende Ghul', img: 'monsters/ghul.jpg',
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
  daily: 3,                         // Abstiege je Tag (später: Grabsiegel)
  widths: [2, 3, 3, 3, 2],          // Räume je Reihe (Eingang unten, Boss oben)
  rope: 2, well: 3,                 // Reihe (0-basiert) mit Seil / Brunnen
  unrestLoot: 0.4,                  // Beute × (1 + Unruhe × 0,4) → bis ×3
  unrestDiff: 0.08,                 // Gegner × (1 + Unruhe × 0,08)
  diff: 1, lvlAdd: 1,               // Gegner: Stufe = max(Gruft-Ebene 3, Heldenstufe + lvlAdd) – wächst mit, wenn du unten aufsteigst
  gold: 1.1, xp: 0.6,               // gegenüber einem Krypta-Kampf
  item: 0.35, eliteMinR: 2, bossMinR: 3,
  heart: 0.1, eliteHeart: 0.35,
  heal: 0.35, trap: 0.3, trapDmg: 0.15,
  wellGold: 6,                      // Brunnen: × Gegnerstufe
  stairUnrest: 1,                   // Rückweg über die Stiege: ein Kampf mit Unruhe +1
  boss: 0.8,                        // Boss-Stärke gegenüber der Krypta (er kommt nach 5 Räumen ohne Heilung)
};
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
export const PIT = { size: 50, cdWin: 300, cdLose: 900, lvlBottom: 3, lvlTop: 42, richFrom: 20, magicFrom: 35, rareFrom: 20, legFrom: 6,
  honorBase: 6, honorPerPlace: 3, foeAfter: 2, foeMult: 2, goldPerLvl: 3, weekBuys: 3, chHonor: 40, chTries: 3, chAbove: 5, look: 3 };
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
export const ACT = { doneAt: [6, 9, 11, 15, 17, 19], zones: 8, elites: [3, 6], firstXp: 3, firstGold: 2, bossXp: 6, bossGold: 5, replay: 1, itemP: 0.45, eliteDiff: 1.15, eliteHp: 1.25, bossMult: 0.95, bossItems: 2 };
export const ACTS = [
  { id: 'a1', n: 'I', loc: 'friedhof', lvl: 1, top: 6, diff: 1.0, crypt: 'c1', zones: ['Das Friedhofstor', 'Die Reihen der Armen', 'Das offene Grab', 'Die Wacht am Beinhaus', 'Der Weidenhang', 'Die Gräbergasse', 'Der Mauerbruch', 'Das Leichenhaus'],
    boss: { name: 'Ansgar, der Totengräber', glyph: 'totengraeber', mech: { ward: 0.25, bleed: 0.3 }, mechText: 'Gräbt sich ein: kämpft hinter einem Wall aus Erde' } },
  { id: 'a2', n: 'II', loc: 'muehle', lvl: 6, top: 12, diff: 1.05, crypt: 'c2', zones: ['Der Mühlbach', 'Das Speichertor', 'Die Kornkammer', 'Der Rattenkeller', 'Das Wasserrad', 'Der Mahlboden', 'Die Sackkammer', 'Der Mühlstein'],
    boss: { name: 'Die Müllerin', glyph: 'muellerin', mech: { rage: 0.6, armorMult: 1.3 }, mechText: 'Mahlt sich in Raserei – je länger der Kampf, desto härter' } },
  { id: 'a3', n: 'III', loc: 'katakomben', lvl: 12, top: 18, diff: 1.12, crypt: 'c3', zones: ['Der Einstieg', 'Die Ossuarien', 'Die Schädelwand', 'Der Brunnenschacht', 'Die Knochenhalle', 'Die Kammer der Ordnung', 'Der tiefe Gang', 'Das Zählwerk'],
    boss: { name: 'Der Knochenordner', glyph: 'knochenordner', mech: { block: 0.35, armorMult: 1.4 }, mechText: 'Knochenschild: blockt viele Hiebe – Zauber treffen immer' } },
  { id: 'a4', n: 'IV', loc: 'moor', lvl: 18, top: 24, diff: 1.25, crypt: 'c4', zones: ['Der Bohlenweg', 'Die Galgenweiden', 'Das stille Wasser', 'Die Hütte im Schilf', 'Der Strickbaum', 'Die Irrlichter', 'Das versunkene Dorf', 'Die Mutterweide'],
    boss: { name: 'Die Mutter der Stricke', glyph: 'strickmutter', mech: { poison: 0.22, regen: 0.015 }, mechText: 'Würgt: Gift, das sich stapelt – und das Moor heilt sie' } },
  { id: 'a5', n: 'V', loc: 'kapelle', lvl: 24, top: 30, diff: 1.45, crypt: 'c5', zones: ['Der Kirchhof', 'Das Portal', 'Das Kirchenschiff', 'Die Sakristei', 'Der Glockenturm', 'Die Krypta der Äbte', 'Der Chor', 'Der Altar'],
    boss: { name: 'Der Erste Kultist', glyph: 'kultist1', mech: { thorns: 0.3, regen: 0.02 }, mechText: 'Wer zuschlägt, trifft sich selbst – Dornen' } },
  { id: 'a6', n: 'VI', loc: 'gruben', lvl: 30, top: 36, diff: 1.65, crypt: null, zones: ['Der Schlackenhang', 'Die Aschefelder', 'Der Schwefelsee', 'Die Brücke aus Ketten', 'Die Esse', 'Der Thronweg', 'Die Glutgruben', 'Der Aschenthron'],
    boss: { name: 'Der Aschenkönig', glyph: 'aschenkoenig', mech: { execute: 0.5, regen: 0.025, crit: 0.12 }, mechText: 'Glut: heilt sich in der Asche und schlachtet Geschwächte' } },
];
// Krypten: nur noch der Boss, frei nach dem Akt-Boss. Jede besiegte Stufe → nächste ist schwerer, Beute besser.
// Stufe `dTier[d]` erreicht = Trophäe/Ziel der alten Schwierigkeit d (Albtraum, Hölle) für Questziele `bossd`.
export const CRYPT = { glut: 10, glutPerTier: 1, lvlAdd: 2, tierLvl: 3, tierMult: 0.06, rarAt: [0, 2, 5], items: [1, 2, 3], dTier: [0, 3, 6] };
