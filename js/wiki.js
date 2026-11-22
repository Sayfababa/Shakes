// Das Verzeichnis (Einstellungen -> Verzeichnis): Nachschlagewerk ueber alles, was fallen kann.
//
// **Alles hier ist ABGELEITET, nichts abgetippt.** Ein handgeschriebenes „faellt im Moor" luegt in
// dem Moment, in dem eine Zutat den Ort wechselt – die Kapelle hat ihren schon einmal gewechselt
// (Grabmoos -> Weihrauchharz), und niemand haette den Text nachgezogen. Jede Zeile unten liest
// deshalb aus data.js. Wer eine Zahl dort aendert, aendert das Verzeichnis mit.
//
// **Was verborgen bleibt, richtet sich danach, was das Spiel selbst verbirgt** – nicht nach einer
// eigenen Liste. Zutaten und Traenke stehen in der Alchemie ohnehin alle offen, also stehen sie
// auch hier. Orte und Gegner sind hinter dem Akt-Fortschritt, also hier auch. Und ein Eintrag, der
// auf etwas Unentdecktes zeigt, verschweigt nur diesen Verweis („faellt an einem Ort, den du noch
// nicht kennst"), nicht sich selbst. Dadurch braucht das Verzeichnis **keinen eigenen Spielstand**:
// es gibt nichts zu merken, was nicht schon im Fortschritt steht.
import { MAT_ART, ASHCORE, HERBS, HERB_LOC, POTIONS, MATS, RUNES, FORGE, CRAFT, SERVICES, MONSTERS, LOCATIONS, ACTS, ACT, ALCH, TRIGGERS } from './data.js';
import { S, actProg, actOpen, actDone, herbSource, herbPrice } from './state.js';

const pct = x => `${Math.round(x * 100)} %`;
const zahl = (n, ein, viele) => `${n} ${n === 1 ? ein : viele}`;
const actOf = locId => ACTS.find(a => a.loc === locId);
const locOf = id => LOCATIONS.find(l => l.id === id);

// --- Was kennt der Held schon? ---
// Ein Ort gilt als bekannt, sobald sein Akt offen ist – genau wie in der Akt-Liste.
export const locKnown = id => { const a = actOf(id); return !!(a && actOpen(a)); };
// Ein Gegner gilt als getroffen, sobald man in seinem Akt gekaempft hat. Genauer ginge es nur mit
// einer Trefferliste im Spielstand; der Gewinn waere klein und der Preis eine Save-Version.
export const mobKnown = name => LOCATIONS.some(l => l.mobs.includes(name) && locKnown(l.id) && actProg(actOf(l.id)) > 0);
const bossKnown = a => actOpen(a) && actProg(a) >= ACT.zones;

// Quelle einer Zutat, aber verschwiegen, solange der Ort unbekannt ist.
export function herbWhere(k) {
  if (k === 'herz') return 'Krypta-Bosse und der Abgrund';
  const id = Object.keys(HERB_LOC).find(x => HERB_LOC[x] === k);
  return id && !locKnown(id) ? 'an einem Ort, den du noch nicht kennst' : herbSource(k);
}
// Welche Monster ein Material fallen lassen – und wo die stehen.
export function matWhere(k) {
  if (k === 'kronsplitter') return 'Nur im Abgrund: sicher beim Boss, sonst bei Elite-Räumen.';
  if (k === 'aschenkern') return `Sehr selten, nur beim Abgrund-Boss ab Tiefe ${ASHCORE.from}. Brennt eine Wirkung eines Einzigartigen in ein anderes Teil (Schmiede).`;
  const mo = MONSTERS.filter(m => m.mat === k);
  const bek = mo.filter(m => mobKnown(m.name));
  if (!bek.length) return 'Von Gegnern, die du noch nicht getroffen hast.';
  const orte = [...new Set(bek.flatMap(m => LOCATIONS.filter(l => l.mobs.includes(m.name) && locKnown(l.id)).map(l => l.name)))];
  return `${bek.map(m => m.name).join(', ')}${orte.length ? ` · ${orte.join(', ')}` : ''}`;
}

// --- Die zehn Wege, ein Teil besser zu machen ---
// Zehn Wege auf drei Haendler und zwei Reiter der Schmiede verteilt; nirgends sonst im Spiel
// stehen sie zusammen, und jeder hat eine eigene Grenze, von der man heute erst beim Scheitern
// erfaehrt („einmal je Teil, für immer").
const matList = o => Object.entries(o).map(([k, n]) => `${MATS[k]} ×${n}`).join(', ');
export function upgradePaths() {
  const L = [];
  const dienst = (wer, id, grenze) => { const s = (SERVICES[wer] || []).find(x => x.id === id); if (!s) return;
    L.push({ grp: 'Bei den Händlern', name: s.name, where: wer === 'halvar' ? 'Halvar' : wer === 'kaspar' ? 'Kaspar' : 'Ysolde',
      cost: `${[...new Set(s.cost.map(c => MATS[Object.keys(c)[0]]))].join(', dann ')} · ${s.gold[0]}–${s.gold[s.gold.length - 1]} Gold`,
      limit: `${s.max} Stufen · ${grenze}` }); };
  dienst('halvar', 'sharpen', 'gehört dem Platz, nicht der Waffe');
  dienst('kaspar', 'reinforce', 'gehört dem Platz, nicht dem Teil');
  L.push({ grp: 'In der Schmiede', name: 'Rune schmieden', where: 'Schmiede',
    cost: `${FORGE.cost} Material · das Material bestimmt den Bonus`, limit: `höchstens ${FORGE.maxRunes} Runen je Teil` });
  L.push({ grp: 'In der Schmiede', name: 'Fusionieren', where: 'Schmiede',
    cost: `Gold · ein Bonus wandert mit seiner Stufe herüber`,
    limit: `${CRAFT.fuse.max === 1 ? 'einmal' : CRAFT.fuse.max + '-mal'} je Teil, für immer · das Futter zerfällt` });
  for (const o of CRAFT.ops) L.push({ grp: 'Umschmieden', name: o.name, where: `${matList({ [o.mat]: o.n })} + Gold`,
    cost: o.text.replace(/\s*\(einer je Item\)\./, '.'), limit: o.id === 'seal' ? 'einer je Teil' : '' });
  const r = CRAFT.raise, von = Object.keys(r.from)[0];
  L.push({ grp: 'Umschmieden', name: 'Erheben', where: `${matList({ [r.mat]: r.n })} + Gold`,
    cost: `Ein gewürfelter Bonus, und das Teil steigt ${von === 'magic' ? 'magisch → selten' : von} auf.`,
    limit: 'einmal je Teil · der Splitter kommt nur aus dem Abgrund' });
  return L;
}
// Welche Wege nach demselben Material greifen. Vier Systeme wollen Hoellenasche – wer sie fuer
// Runen hortet, kommt beim Schaerfen nie auf Stufe 5 und merkt nie, warum.
// Welches Material gerade am ehesten beisst: mehrfach verlangt und am wenigsten davon da.
// **Nur eines** – fuenf Warnkaesten nebeneinander sind kein Hinweis mehr, sondern Tapete.
export function matBottleneck() {
  const C = Object.keys(MATS).map(k => ({ k, n: matNeeds(k), have: S.mats?.[k] || 0 })).filter(x => x.n.length >= 3);
  if (!C.length) return null;
  C.sort((a, b) => a.have - b.have || b.n.length - a.n.length);
  return C[0];
}
export function matNeeds(k) {
  const n = [];
  for (const [wer, ds] of Object.entries(SERVICES)) for (const s of ds)
    if ((s.cost || []).some((c, i) => c[k] && n.push(`${s.name} Stufe ${i + 1}`))) {}
  for (const o of CRAFT.ops) if (o.mat === k) n.push(`„${o.name}"`);
  if (CRAFT.raise.mat === k) n.push('„Erheben"');
  if (RUNES[k]) n.push(RUNES[k].name);
  return n;
}

// --- Die Kategorien ---
export const WIKI_CATS = [
  { id: 'herbs', name: 'Zutaten', img: 'assets/potions/i_schwefel.webp' },
  { id: 'pots', name: 'Tränke', img: 'assets/potions/rostsaeure.webp' },
  { id: 'mats', name: 'Materialien', img: 'assets/forge/blutstein.webp' },
  { id: 'locs', name: 'Orte', img: 'assets/places/friedhof.webp' },
  { id: 'mobs', name: 'Gegner', img: 'assets/forge/siegel.webp' },
  { id: 'up', name: 'Aufwerten', img: 'assets/forge/r_blutstein.webp', wide: 1 },
];

// Eine Liste je Kategorie. `unknown` heisst: Zeile bleibt eine Luecke (Name und Bild verborgen).
export function wikiList(cat) {
  if (cat === 'herbs') return Object.keys(HERBS).map(k => ({ id: k, img: `assets/potions/${HERBS[k].img}.webp`, name: HERBS[k].name,
    sub: `${herbWhere(k)} · ${zahl(POTIONS.filter(p => p.cost?.[k]).length, 'Rezept', 'Rezepte')}`, right: S.herbs?.[k] || 0 }));
  if (cat === 'pots') return POTIONS.map(p => ({ id: p.id, img: `assets/potions/${p.id}.webp`, name: p.name,
    sub: `${p.rare ? 'selten' : 'gewöhnlich'} · ${p.text}`, right: S.pots?.[p.id] || 0, rare: p.rare }));
  if (cat === 'mats') return Object.keys(MATS).map(k => ({ id: k, img: `assets/forge/${MAT_ART[k] || k}.webp`, name: MATS[k],
    sub: matWhere(k), right: S.mats?.[k] || 0 }));
  if (cat === 'locs') return ACTS.map(a => { const l = locOf(a.loc), auf = actOpen(a);
    return { id: a.loc, img: `assets/places/${a.loc}.webp`, name: auf ? `Akt ${a.n} · ${l.name}` : '',
      sub: auf ? `Stufe ${l.lvl}+ · ${l.glut} Glut je Wiederholung · ${HERBS[HERB_LOC[a.loc]]?.name || ''}` : 'Noch verschlossen',
      right: auf ? (actDone(a) ? '✓' : `${Math.min(actProg(a), ACT.zones)}/${ACT.zones}`) : '', unknown: !auf }; });
  if (cat === 'mobs') { const R = [];
    for (const m of MONSTERS) { const bek = mobKnown(m.name), orte = LOCATIONS.filter(l => l.mobs.includes(m.name) && locKnown(l.id));
      R.push({ id: m.name, img: `assets/monsters/${m.glyph}.jpg`, name: m.name, unknown: !bek,
        sub: bek ? `${orte.map(l => l.name).join(', ')}${m.mat ? ` · ${MATS[m.mat]}` : ''}` : 'Noch nicht getroffen' }); }
    for (const a of ACTS) { const bek = bossKnown(a);
      R.push({ id: a.boss.name, img: `assets/monsters/${a.boss.glyph}.jpg`, name: a.boss.name.split(',')[0], unknown: !bek, boss: 1,
        sub: bek ? `Akt ${a.n} · ${a.boss.mechText || 'Boss'}` : 'Noch nicht getroffen' }); }
    return R; }
  return [];
}

// Ein einzelner Eintrag. `lines` sind Absaetze, `tags` die Rueckwaerts-Suche („Gebraucht fuer").
export function wikiEntry(cat, id) {
  if (cat === 'herbs') { const h = HERBS[id]; if (!h) return null;
    const rez = POTIONS.filter(p => p.cost?.[id]);
    return { name: h.name, kind: 'Zutat', img: `assets/potions/${h.img}.webp`,
      lines: [{ b: id === 'herz' ? 'Fällt bei:' : 'Fällt in:', t: herbWhere(id) },
        { t: id === 'herz' ? `${pct(ALCH.heartChance)} je Krypta-Boss. Jedes Herz bringt eine Feldzutat mit. Nicht käuflich.`
          : `${pct(ALCH.herbChance)} je Sieg, auf Elite-Gebieten doppelt. Seltener auch auf Expeditionen und beim Umherziehen.`, dim: 1 },
        ...(id === 'herz' ? [] : [{ t: `Bei Mutter Ysolde für ${herbPrice()} Gold zu kaufen, ${ALCH.herbStock} Stück je Tag.`, dim: 1 }])],
      tagLabel: 'Gebraucht für:', tags: rez.map(p => p.name),
      foot: `Du hast ${S.herbs?.[id] || 0}.` }; }

  if (cat === 'pots') { const p = POTIONS.find(x => x.id === id); if (!p) return null;
    return { name: p.name, kind: p.rare ? 'selten · 1 Ladung' : `gewöhnlich · ${ALCH.charges} Ladungen`, img: `assets/potions/${p.id}.webp`, rare: p.rare,
      lines: [{ t: p.text }, { t: p.rare ? 'Wirkt den ganzen Kampf. Nur ein seltener Trank passt in den Gürtel.'
          : `Zündet: ${p.trig.map(t => TRIGGERS[t]).join(' oder ')}.`, dim: 1 },
        { b: 'Tränke wirken nur', t: 'in der Krypta, im Abgrund und in der Grube – nicht auf Streifzügen.', dim: 1 }],
      tagLabel: 'Braucht:', tags: Object.entries(p.cost || {}).map(([k, n]) => `${HERBS[k].name} ×${n} (${herbWhere(k)})`),
      foot: `Du hast ${S.pots?.[id] || 0}.` }; }

  if (cat === 'mats') { const n = MATS[id]; if (!n) return null;
    const r = RUNES[id];
    return { name: n, kind: 'Material', img: `assets/forge/${MAT_ART[id] || id}.webp`,
      lines: [{ b: 'Fällt bei:', t: matWhere(id) },
        ...(r ? [{ b: r.name + ':', t: `beim Schmieden einer Rune · +${r.per} je Punkt` }] : [])],
      tagLabel: 'Verlangt von:', tags: matNeeds(id),
      foot: `Du hast ${S.mats?.[id] || 0}.` }; }

  if (cat === 'locs') { const a = actOf(id), l = locOf(id); if (!a || !l || !actOpen(a)) return null;
    const k = HERB_LOC[id];
    return { name: l.name, kind: `Akt ${a.n}`, img: `assets/places/${id}.webp`, wide: 1,
      lines: [{ b: 'Gegnerstufe:', t: `ab ${l.lvl} · ${l.glut} Glut je wiederholtem Kampf` },
        { b: 'Zutat:', t: k ? `${HERBS[k].name} (${pct(ALCH.herbChance)} je Sieg, Elite doppelt)` : '–' },
        { b: 'Gegner:', t: l.mobs.join(', ') },
        { b: 'Boss:', t: bossKnown(a) ? a.boss.name.split(',')[0] : 'noch nicht getroffen' }],
      tagLabel: 'Material von hier:', tags: [...new Set(MONSTERS.filter(m => l.mobs.includes(m.name) && m.mat).map(m => MATS[m.mat]))],
      foot: actDone(a) ? 'Akt geschafft.' : `${Math.min(actProg(a), ACT.zones)} von ${ACT.zones} Gebieten.` }; }

  if (cat === 'mobs') { const m = MONSTERS.find(x => x.name === id); if (!m || !mobKnown(id)) return null;
    const orte = LOCATIONS.filter(l => l.mobs.includes(id) && locKnown(l.id));
    return { name: m.name, kind: 'Gegner', img: `assets/monsters/${m.glyph}.jpg`,
      lines: [{ b: 'Steht in:', t: orte.map(l => l.name).join(', ') || '–' },
        { b: 'Lässt fallen:', t: m.mat ? MATS[m.mat] : 'kein eigenes Material' }],
      tagLabel: m.mat ? 'Das Material taugt für:' : '', tags: m.mat ? matNeeds(m.mat) : [],
      foot: '' }; }
  return null;
}
