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
  { slot: 'helm', name: 'Kappe', armor: 3, w: 2, h: 2, art: 'cap' }, { slot: 'helm', name: 'Eisenhelm', armor: 6, w: 2, h: 2, art: 'helm' }, { slot: 'helm', name: 'Totenmaske', armor: 9, w: 2, h: 2, art: 'mask' },
  { slot: 'chest', name: 'Lederwams', armor: 8, w: 2, h: 3, art: 'leather' }, { slot: 'chest', name: 'Kettenhemd', armor: 14, w: 2, h: 3, art: 'mail' }, { slot: 'chest', name: 'Plattenpanzer', armor: 22, w: 2, h: 3, art: 'plate' },
  { slot: 'gloves', name: 'Lederhandschuhe', armor: 2, w: 2, h: 2, art: 'gloves' }, { slot: 'gloves', name: 'Panzerhandschuhe', armor: 5, w: 2, h: 2, art: 'gauntlets' },
  { slot: 'boots', name: 'Stiefel', armor: 2, w: 2, h: 2, art: 'boots' }, { slot: 'boots', name: 'Kriegsstiefel', armor: 5, w: 2, h: 2, art: 'greaves' },
  { slot: 'belt', name: 'Schärpe', armor: 1, w: 2, h: 1, art: 'sash' }, { slot: 'belt', name: 'Plattengürtel', armor: 4, w: 2, h: 1, art: 'belt' },
  { slot: 'offhand', name: 'Rundschild', armor: 7, w: 2, h: 2, art: 'buckler' }, { slot: 'offhand', name: 'Turmschild', armor: 12, w: 2, h: 3, art: 'tower' },
  { slot: 'amulet', name: 'Amulett', w: 1, h: 1, art: 'amulet' }, { slot: 'ring', name: 'Ring', w: 1, h: 1, art: 'ring' },
  { slot: 'weapon', kind: 'axe', name: 'Beil', dmg: [3, 8], w: 2, h: 3, art: 'hatchet' }, { slot: 'weapon', kind: 'axe', name: 'Kriegsaxt', dmg: [6, 14], w: 2, h: 3, art: 'waraxe' },
  { slot: 'weapon', kind: 'sword', name: 'Kurzschwert', dmg: [3, 7], w: 1, h: 3, art: 'sword' }, { slot: 'weapon', kind: 'sword', name: 'Bastardschwert', dmg: [6, 12], w: 1, h: 4, art: 'longsword' },
  { slot: 'weapon', kind: 'dagger', name: 'Dolch', dmg: [2, 6], w: 1, h: 2, art: 'dagger' }, { slot: 'weapon', kind: 'dagger', name: 'Klauenklinge', dmg: [4, 10], w: 1, h: 3, art: 'claw' },
  { slot: 'weapon', kind: 'bow', name: 'Kurzbogen', dmg: [3, 8], w: 2, h: 3, art: 'bow' }, { slot: 'weapon', kind: 'bow', name: 'Langbogen', dmg: [5, 12], w: 2, h: 4, art: 'longbow' },
  { slot: 'weapon', kind: 'staff', name: 'Stab', dmg: [4, 9], w: 1, h: 4, art: 'staff' }, { slot: 'weapon', kind: 'staff', name: 'Runenstab', dmg: [5, 12], w: 1, h: 4, art: 'runestaff' },
  { slot: 'weapon', kind: 'wand', name: 'Knochenstab', dmg: [4, 8], w: 1, h: 2, art: 'wand' }, { slot: 'weapon', kind: 'wand', name: 'Grabszepter', dmg: [5, 11], w: 1, h: 3, art: 'scepter' },
];
export const INV_W = 10, INV_H = 4;

// Affixe: stat, Wert pro Itemstufe, Präfix/Suffix-Namen
export const AFFIXES = [
  { stat: 'str', per: 1, pre: 'Starker', suf: 'des Bären' },
  { stat: 'dex', per: 1, pre: 'Flinker', suf: 'des Fuchses' },
  { stat: 'int', per: 1, pre: 'Kundiger', suf: 'des Gelehrten' },
  { stat: 'con', per: 1, pre: 'Zäher', suf: 'des Ochsen' },
  { stat: 'lck', per: 0.7, pre: 'Glücklicher', suf: 'der Fortuna' },
  { stat: 'armor', per: 1.5, pre: 'Gehärteter', suf: 'der Wacht' },
  { stat: 'dmg', per: 0.6, pre: 'Grausamer', suf: 'des Schlachters' },
  { stat: 'haste', per: 0.4, pre: 'Rascher', suf: 'der Beschwörung' },   // Zaubertempo in %: Zauber laden schneller
];
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
    { id: 'h7', title: 'Feuer der Tiefe', lvl: 22, text: 'In den Feuergruben brennt eine Esse, heißer als meine. Hol mir ihre Asche.',
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
    { id: 'k7', title: 'Der Glöckner', lvl: 22, text: 'Wenn die Glocke wieder schlägt, stehen alle auf. Alle. Bring ihn zum Schweigen.',
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
    { id: 'p4', title: 'Die vier Splitter', lvl: 18, text: 'Vier Splitter. Vier Herren. Dann öffnet sich die Glocke – und darin wartet, wer du warst.',
      obj: [{ shards: 4 }, { omen: 6 }], rew: { gold: 800, xp: 3000, rep: 0 } },
    { id: 'p5', title: 'Der Kronenlose', lvl: 24, text: 'Er trägt dein Gesicht. Er trägt deine Krone. Fälle ihn. Dann entscheide, was aus der Glocke wird.',
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
  { tab: 'trips', when: 'active', text: 'Öffne <b>Streifzug</b>, wähle den <b>Friedhof</b> und eine <b>Spur</b>. Die Gefahr steht dabei – die leichte Spur ist sicher.' },
  { tab: 'trips', when: 'wins', text: 'Warte oder <b>eile</b> für 1 Gold, dann <b>Stellen</b>. Nach dem Sieg: <b>Heimkehren</b> sichert die Beute, <b>Tiefer</b> vermehrt sie – oder du verlierst sie.' },
  { tab: 'hero', when: 'spent', text: 'Beute landet im <b>Beutel</b>. Unter <b>Held</b> antippen und anlegen. Unter <b>Werte</b> verteilst du deine Punkte.' },
  { tab: 'traders', when: 'turnin', text: 'Erfülle den Auftrag und gib ihn beim Händler <b>ab</b>. Das bringt Ruf – mit Treue wird seine Ware besser.' },
  { tab: 'crypt', when: 'view:crypt', text: 'In den <b>Krypten</b> warten Bosse. Jeder bringt eine Trophäe und einen <b>Glockensplitter</b>.' },
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
  rareMinLvl: 4, legendaryMinLvl: 10, // darunter keine/kaum seltene bzw. legendäre Beute
  bossHp: 2.2, bossDiff: 1.35,
  rushPerLvl: 3,                      // Eilen: 1 Gold je 20 s Restzeit × (1 + Stufe / rushPerLvl)
  attrPerLevel: 5, startPoints: 5,       // Attributpunkte pro Stufenaufstieg
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
