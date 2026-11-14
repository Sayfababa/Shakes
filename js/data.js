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
  attrPerLevel: 5, startPoints: 5,       // Attributpunkte pro Stufenaufstieg
  respecPerLvl: 30,                        // Läuterung: Gold je Stufe (erste gratis)
  cryptCdSec: 180,                         // Pause nach jedem Krypta-Kampf (Prototyp)
  shopSize: 6, shopRefreshSec: 600,
  lootChance: 0.55, critBase: 0.05,
};

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
  thorns: 'Dornen', execute: 'Schaden gg. Sterbende', first: 'Erstschlag' };

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
    boss: { name: 'Mutter Gerlinde, die Ertränkte', glyph: 'hood' }, trophy: { hpPct: 0.05 } },
  { id: 'c2', name: 'Die Pestkapelle', lvl: 6, glyph: 'rat', floors: ['Pestratte', 'Verfaulter Ghul', 'Kultist der Glocke', 'Gehäuteter'],
    boss: { name: 'Bruder Aldemar, der Verseuchte', glyph: 'ghoul' }, trophy: { dmgPct: 0.05 } },
  { id: 'c3', name: 'Das Schlachthaus', lvl: 12, glyph: 'ghoul', floors: ['Gehäuteter', 'Gefallener', 'Blutfürst', 'Höllenbrut'],
    boss: { name: 'Der Metzger von Vhal', glyph: 'horn' }, trophy: { crit: 0.03 } },
  { id: 'c4', name: 'Turm der Glocke', lvl: 20, glyph: 'horn', floors: ['Kultist der Glocke', 'Sumpfhexe', 'Blutfürst', 'Höllenbrut'],
    boss: { name: 'Der Glöckner', glyph: 'horn' }, trophy: { armorPct: 0.1, hpPct: 0.05 } },
];
