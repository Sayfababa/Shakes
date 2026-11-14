// Reine Spieldaten. Balancing nur hier.
export const CLASSES = {
  barbarian: { name: 'Barbar', main: 'str', portrait: 'barbarian', hp: 6, desc: 'Rohe Kraft. Raserei: Chance auf zweiten Hieb unter 50% Leben.', weapon: 'axe' },
  paladin:   { name: 'Paladin', main: 'str', portrait: 'paladin', hp: 5, desc: 'Heiliger Schild. Blockt 25% aller Angriffe.', weapon: 'sword' },
  assassin:  { name: 'Assassine', main: 'dex', portrait: 'assassin', hp: 5.5, desc: 'Klingen im Schatten. Erhöhte kritische Treffer, Bluten.', weapon: 'dagger' },
  huntress:  { name: 'Jägerin', main: 'dex', portrait: 'huntress', hp: 4.5, desc: 'Pfeil und Geduld. Erster Schuss immer vor dem Gegner.', weapon: 'bow' },
  sorceress: { name: 'Zauberin', main: 'int', portrait: 'sorceress', hp: 4, desc: 'Arkanes Feuer. Ignoriert Rüstung zur Hälfte.', weapon: 'staff' },
  witch:     { name: 'Grabhexe', main: 'int', portrait: 'witch', hp: 4, desc: 'Totenmagie. Entzieht 20% des Schadens als Leben.', weapon: 'wand' },
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

// type: armor (Rüstungswert) | weapon (Schaden) | jewel (nur Affixe)
export const BASES = [
  { slot: 'helm', name: 'Kappe', armor: 3 }, { slot: 'helm', name: 'Eisenhelm', armor: 6 }, { slot: 'helm', name: 'Totenmaske', armor: 9 },
  { slot: 'chest', name: 'Lederwams', armor: 8 }, { slot: 'chest', name: 'Kettenhemd', armor: 14 }, { slot: 'chest', name: 'Plattenpanzer', armor: 22 },
  { slot: 'gloves', name: 'Lederhandschuhe', armor: 2 }, { slot: 'gloves', name: 'Panzerhandschuhe', armor: 5 },
  { slot: 'boots', name: 'Stiefel', armor: 2 }, { slot: 'boots', name: 'Kriegsstiefel', armor: 5 },
  { slot: 'belt', name: 'Schärpe', armor: 1 }, { slot: 'belt', name: 'Plattengürtel', armor: 4 },
  { slot: 'offhand', name: 'Rundschild', armor: 7 }, { slot: 'offhand', name: 'Turmschild', armor: 12 },
  { slot: 'amulet', name: 'Amulett' }, { slot: 'ring', name: 'Ring' },
  { slot: 'weapon', kind: 'axe', name: 'Beil', dmg: [3, 8] }, { slot: 'weapon', kind: 'axe', name: 'Kriegsaxt', dmg: [6, 14] },
  { slot: 'weapon', kind: 'sword', name: 'Kurzschwert', dmg: [3, 7] }, { slot: 'weapon', kind: 'sword', name: 'Bastardschwert', dmg: [6, 12] },
  { slot: 'weapon', kind: 'dagger', name: 'Dolch', dmg: [2, 6] }, { slot: 'weapon', kind: 'dagger', name: 'Klauenklinge', dmg: [4, 10] },
  { slot: 'weapon', kind: 'bow', name: 'Kurzbogen', dmg: [3, 8] }, { slot: 'weapon', kind: 'bow', name: 'Langbogen', dmg: [5, 12] },
  { slot: 'weapon', kind: 'staff', name: 'Stab', dmg: [4, 9] }, { slot: 'weapon', kind: 'staff', name: 'Runenstab', dmg: [5, 12] },
  { slot: 'weapon', kind: 'wand', name: 'Knochenstab', dmg: [4, 8] }, { slot: 'weapon', kind: 'wand', name: 'Grabszepter', dmg: [5, 11] },
];

// Affixe: stat, Wert pro Itemstufe, Präfix/Suffix-Namen
export const AFFIXES = [
  { stat: 'str', per: 1, pre: 'Starker', suf: 'des Bären' },
  { stat: 'dex', per: 1, pre: 'Flinker', suf: 'des Fuchses' },
  { stat: 'int', per: 1, pre: 'Kundiger', suf: 'des Gelehrten' },
  { stat: 'con', per: 1, pre: 'Zäher', suf: 'des Ochsen' },
  { stat: 'lck', per: 0.7, pre: 'Glücklicher', suf: 'der Fortuna' },
  { stat: 'armor', per: 1.5, pre: 'Gehärteter', suf: 'der Wacht' },
  { stat: 'dmg', per: 0.6, pre: 'Grausamer', suf: 'des Schlachters' },
];
export const LEGEND_NAMES = ['Grabesruh', 'Aschenkuss', 'Der Letzte Psalm', 'Witwenmacher', 'Knochenkrone', 'Sünde von Vhal', 'Rabenschwur', 'Blutglocke'];

export const MONSTERS = [
  { name: 'Verfaulter Ghul', glyph: 'ghoul' }, { name: 'Gefallener', glyph: 'imp' }, { name: 'Skelettkrieger', glyph: 'skull' },
  { name: 'Grabräuber', glyph: 'hood' }, { name: 'Pestratte', glyph: 'rat' }, { name: 'Kultist der Glocke', glyph: 'hood' },
  { name: 'Blutfürst', glyph: 'horn' }, { name: 'Sumpfhexe', glyph: 'hood' }, { name: 'Knochenhund', glyph: 'skull' },
  { name: 'Gehäuteter', glyph: 'ghoul' }, { name: 'Höllenbrut', glyph: 'horn' }, { name: 'Wiedergänger', glyph: 'skull' },
];
export const PLACES = ['in den Katakomben', 'auf dem Friedhof von Vhal', 'im Moor der Gehenkten', 'in der eingestürzten Kapelle',
  'im Schlachthaus', 'an der Alten Mühle', 'im Turm der Glocke', 'in den Gruben'];
export const QUEST_VERBS = ['Vernichte', 'Jage', 'Banne', 'Erschlage', 'Treibe aus'];

export const CFG = {
  maxGlut: 100, glutRegenMin: 6,      // 1 Glut pro x Minuten (Echtzeit)
  questCount: 3, questMinSec: 20, questMaxSec: 90,  // Prototyp: kurze Zeiten
  attrBaseCost: 10, attrCostGrowth: 1.12,
  shopSize: 6, shopRefreshSec: 600,
  lootChance: 0.55, critBase: 0.05,
};
