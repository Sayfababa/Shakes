# ASCHENKRONE – Systeme

Je System: wo der Code liegt und die harten Grenzen. Teil der Regel wie CLAUDE.md – **vor dem Anfassen
eines Systems seinen Block hier lesen** (`grep -n '^\*\*' SYSTEME.md` zeigt die Bereiche).


**Kampf & Werte**
- **Kampfkraft** `power()`/`powerWith()`/`powerAttr()` in state.js – eine Zahl, deterministisch.
  Grundlage für Item-Vergleich und „+N" an Attributen. Neue Effekte dort einrechnen. → E
- **Kampf-Boni auf Items** `AFFIXES` (`pct`/`slots`/`kind`/`side`/`group`/`w`), Obergrenzen `CAPS` (critMult 3,5).
  **Feste Stufen (Welle 1a):** Wert = `tierBand(stat, t)` aus `TIERS.flat/pct × per`, GS schaltet nur frei (`minLvl`).
  **Präfix = Angriff, Suffix = Abwehr/Nutzen**, `RARITIES.sides` (1+1/2+2/3+2), eine je `group`; `affixRoom(it)` ist
  die EINE Regel für Beute, Umschmieden, Fusion. `affixPool(it)` entscheidet, was ein Platz tragen kann. **Neuer Prozent-Bonus → in die Liste des
  Eich-Tests.** Flache Werte bewusst ohne Wache. → E
- **Treffer-Wirkungen** combat.js: `finish()` (Henker, Krit), `onHit()` (Leech, Bluten, Gift, Dornen).
  Zauber sind nur nicht blockbar. → E
- **Schadensarten & Resistenzen** (Welle 2a, nach D2/PoE) `ELEMENTS`/`RES_NAMES`, Gegner `mix`/`res` (MONSTERS, Bosse), Zauber `el`;
  `resOf`/`resMul`/`mixOf`/`armorRed` in combat.js, angewandt in `finish()` (Hieb und Zauber). **Rüstung mindert nur den physischen
  Anteil**, Feuer/Eis gehen vorbei (auch Zauber der Zauberin → „Rüstung ignorieren“ ist für sie fast wertlos, `penp` nicht auf Stäben).
  Deckel Elementar `CFG.resCap` 75 %, Phys. `CFG.resCapPhys` 50 % (D2). `stats().res` ist roh (Werte-Ansicht zeigt beides).
  Affixe `physr`/`elemr` (Suffix, Rüstung+Schmuck, Stufe I 20–23 / 26–30 %). **Elementar-Durchdringung** `elemPen` (PoE):
  zieht nach dem Deckel ab, darf unter 0 (Zauberin-Passiv 15 % + 25 % Elem.-Resi; Bonus `elempenp` nur auf Stäben).
  **Fluch der Tiefe** `DESCENT.resMalus` −10 % Elem.-Resi je 10 Tiefen, höchstens −30 % (`descResPen`, Anzeige im Abgrund).
  `power()` rechnet gegen den gemittelten Gegner (`FOE_MIX`/`FOE_RES`, aus den Daten). Abgrund-Malus `DESCENT.resMalus` (heute v: 0).
- **Waffen-Deckel** `wpnDmg(it, heldenstufe)` in loot.js: Grundschaden wirkt höchstens wie GS Heldenstufe + `CFG.wpnLvlAdd`;
  Tooltip zeigt „wirksam …“ + „voll ab Heldenstufe N“.
- **Klassenwaffe**: fremde Art → ×`offWeapon`, Zauberkraft ×`offWeaponSpell`. → E
- **Attribute** haben je Klasse einen Zweck (`ATTR_INFO`): Stärke → Rüstung, Int → Zauber. → E
- **Kampfbewertung** `GRADES`/`gradeOf()` in game.js – Restleben → Bonus auf Gold/Beute, **nicht EP**. → E
- **Kampf-Einblendungen** `combatFx()` in main.js; Log-Felder aus combat.js. Neuer Effekt: Feld im
  Log setzen, dann dort anzeigen. → E
- **Kurven** in `CFG`. Änderungen mit `tests/personas.mjs` prüfen. → E

**Zauber**
- **Zauber** `SPELLS` in data.js, `spell()` in combat.js – 3 je Klasse (Stufe 1/8/18), wirken jeden
  n-ten eigenen Zug. Symbole `assets/spells/<id>.webp`. **Monster wirken keine Zauber.** → E
- **Zauber im Kampf**: laden pro Zug (`ch` + `haste`), Log trägt `cA`/`cB`, `spellFx()` in main.js. → E
- **Zauber-Wege** `SPELL_TREE`/`TREE_LVL`, `chooseWay`/`wayOpen`/`wayCost`, `S.sp`, Save v7.
  Je Zauber 3 Stufen (ab 6/14/22), je 1 von 2 Wegen; erste Wahl gratis.
  Balance: `node tests/ways.mjs [klasse] [stufe] [kämpfe] --check`. → E

**Talente**
- **Das Brett** `TREE` in data.js; `treeOf`/`nodeState`/`bridgeState`/`learnNode`/`learnBridge`,
  Save v18. Bisher **Assassine** und **Zauberin**; Klassen ohne Eintrag nutzen `TALENTS`.
  3×6, zwei Notable, ein Schlüsselstein, 2 Brücken, 41 Ränge gegen ~24 Punkte.
  Balance: `node tests/tree.mjs [klasse] [stufe] [kämpfe] --check` – **kein Knoten darf bei 0 stehen**.
  Rahmen: klein +1…+24, Notable +1…+28, Schlüsselstein +2…+52, Brücke +1…+22. → E
- **Das Brett der Zauberin** `TREE.sorceress`, Save **v21**; `spellPct`, `haste`, `echo`, `ignite`
  (`CFG.igniteTurns` 3, stapelt nicht). **Kein Leben als Preis** – Überleben ist bei ihr doppelt so
  viel wert wie Schaden. → E
- **Wer eine Klasse aufs Brett holt**, muss die Brett-Schnittstelle in `tests/bot.mjs` mitziehen. → E

**Beute & Aufwerten**
- **Beute-Tiefe** `TIERS` (I beste), `SPECIALS` (`it.fx`), 30 `UNIQUES`. Kampf-Schlüssel: echo, ward,
  vengeance, zeal, siphon, bulwark, shred, lastBreath, secondWind, nohealSelf.
  Balance: `node tests/uniques.mjs … --check` (≥ +6 für die beste Klasse, nie > +55). → E
- **Umschmieden** `CRAFT` in data.js; `craft(id, op, stat)`, `craftCheck`, `baseMods`. Ops: seal,
  chaos, values, add, remove. Kostet Material + Gold, **beliebig oft** (Schmiedeglut seit 2026-11-19 raus; alte Felder `glut`/`crafted` ungenutzt).
  **Verkaufen:** ein Weg für alles – `sellOff()`/`sellPrice()`/`sellMat()` in state.js (`SELL` in data.js): halber Wert,
  legendär + 1 Material je Platz. Nie `S.gold += it.value` schreiben. → E
  Runen, Sonderbonus, Einzigartige bleiben unberührt. **Craften+Verkaufen bringt nie Gold** (Test). → E
- **Fusionieren** `CRAFT.fuse`; `fuseForm`/`fuseMains`/`fuseFoods`/`fuseFull`/`fusePromote`/`fuseCheck`/
  `fuse`. Gleiche Grundform **und** Seltenheit; ein Bonus wandert **mit seiner Stufe**, Futter zerfällt.
  **`CRAFT.fuse.max` = 1 – eine Fusion je Teil, für immer.** Futter nur aus dem Beutel.
  Voll ⇒ eigener Bonus weicht **oder** Aufstieg (nur magisch→selten, `it.risen`); Grundwerte bleiben. → E
- **Fusionierte Boni sind markiert** (`it.fmods`, `fusedMods`) – gedämpftes Gold am Bonus, wie
  Blutrot für versiegelt. `values`/`chaos` löschen die Marke (Stufe neu gewürfelt). **Neue Operation
  in `CRAFT.ops` → entscheiden, ob sie die Marke mitnimmt.** → E
- **Erheben** `CRAFT.raise` – Kronsplitter macht ein volles **magisches** Teil selten (gewürfelter
  Bonus). Splitter nur aus dem Abgrund. **Eine Aufwertung je Teil über alle Wege** (`it.risen`). → E
- **Dienste** `SERVICES`: Schärfen (Halvar), Verstärken (Kaspar), Bestellen, Glücksgriff (Ysolde).
  Gehören dem **Platz**, nicht dem Teil (`S.temper`, Save v17). **Dienste feuern beim ersten Antippen –
  wer einen zerstörerischen Dienst hinzufügt, muss die Rückfrage dort nachrüsten.** → E
- **Schmiede** `RUNES`/`FORGE`, `forge(slot, mat, score)` – Rune → `it.runes`, max `FORGE.maxRunes`.
  Minispiel in main.js. Kostet Material, keine Glut. → E
- **Grab-Sets** `SETS`/`SET`; `setCount`/`setOwned`/`setsWorn`, `makeSetItem`, `setDrop`. Je Krypta
  3 Teile, Seltenheit `set` (grün), fallen **nur beim Boss ihrer Krypta**. 2 Teile = Bonus, 3 = Regel.
  Boni müssen Schlüssel aus `EFFECT_NAMES` sein. `node tests/sets.mjs … --check`. → E
- **Beute-Moment** `lootCards()` in ui.js – Kärtchen je Fundstück, ab 4 verdichtet (`.many`). → E
- **Beute-Filter** `S.filter`, `filterOf`/`filterOn`/`filterHits`/`setFilterMod`/`setFilterTier`;
  `hitDots(it)` + `viewFilter()` in ui.js. Punkte oben links je Treffer, an **allen** Feldern außer
  dem Körper. Zählt über `baseMods` (Runen zählen nicht). Keine Save-Version nötig. → E
- **Verkaufsschutz**: Seltenes, Legendäres, Einzigartiges, Sonderbonus- und Runen-Teile brauchen den
  zweiten Tipp (`precious()` in main.js). Kein Rückkauf. → E
- **Lager** `STASH_W`/`STASH_H` 10×6; `grid()`/`addToGrid`/`keep`/`stashPut`/`stashTake`/`sellStash`/
  `sortGrid`, Save **v20**. Beutel und Lager am selben Platz, ein Knopf schaltet um.
  **`keep(it)` statt `addToBag(it)` an allen Beute-Stellen.** Gelagertes zählt **nicht** fürs
  Schmieden und nicht als Fusions-Futter. **Die Rasterlogik nimmt das Behältnis als Argument.** → E

**Inhalte**
- **Die Akte** (Tab Streifzug) `ACT`/`ACTS`; `actProg`/`actDone`/`actOpen`, `actEnemy`/`actFight`,
  Save v13. 6 Akte × 8 Gebiete + Boss. Neue Gebiete kosten keine Glut, Niederlage kostet nichts;
  Wiederholen kostet `loc.glut`. Boss öffnet nächsten Akt + Krypta.
  `node tests/acts.mjs [klasse] [läufe] --check`. → E
- **Krypten** nur der Boss (`cryptEnemy` = `makeBoss`), frei nach dem Boss ihres Akts; Stufen
  `S.crypt.prog`. Jeder Versuch kostet Glut. → E
- **Die Grube** `PIT`/`PIT_RIVALS`/`PIT_RANKS`/`PIT_SHOP`/`PIT_RULES`; `pitFoes`/`pitFight`/`pitShop`,
  Save v12. Keine Glut, nur Pause. Rivale hängt am **Platz**, nicht an der Heldenstufe. Über Platz `growFrom` je Platz
  ×`foeGrow` (`pitGrowAt`); Lohn je Sieg `pitWinGold`/`pitWinXp`. `node tests/lohn.mjs` vergleicht Abgrund/Grube/Steckbriefe.
  **Vargo steht bei den Händlern** (vierter Reiter); zwei Türen → `pitBack`, `titleBack`. → E
- **Der Abstieg / Der Abgrund** `DESCENT`/`DESC_ROOMS`/`ELITE`; `descStart`/`descNext`/`descEnter`/
  `descStair`, Save v11. Leben und Trank-Ladungen laufen mit, Unruhe +1 je Raum, Beute zählt erst am
  Ausgang, Tod = Sack weg. Kostet ein **Grabsiegel** (`S.seals`, Save v19; 2/Tag, max 6).
  **Endlos:** Tiefe 1…∞ (`descAt(d)`: Gruft reihum aus den offenen, Gegnerstufe `lvlBase + d·lvlPer`, Stärke
  `diff · diffGrow^(d−1)` (geometrisch, Welle 2B-1), `mods` für Welle 2) – **nie nach Heldenstufe**. Lohn je Tiefe nur über
  `descReward(d)` (Gold/EP/Funde/Glück/Mindest-Seltenheit); **Abgrund-Stufen I+/I++** (`TIERS.minDepth`, t 0/−1) nur über
  `makeItem({ depth })`, nie auf `noDeep`-Boni (Resistenzen), `topTier()` übergeht sie. **Wochenlohn** `S.deep.due` beim
  Wochenwechsel (`descWeekReward`/`descClaimWeek`, roter Punkt am Krypta-Tab). Beutestufe = Gegnerstufe. Boss schlagen
  hebt `S.deep.best` (Rekord) und `wBest` (Woche, Wochenziel); Ausgänge nicht. Start bis `best + 1`.
  `node tests/descent.mjs … --check [--deep]` (--deep: Tiefe je Stufe 20/30/40, Kurve Gefahr vs. Beute). **Die vier Abgrund-Materialien stehen in DESIGN.md und sind
  vom Besitzer zurückgestellt – nicht ohne seinen Zuruf anfangen.** → E
- **Expedition** `EXPED`/`EXP_NODES`/`EXP_EVENTS`; `expedMap`/`startExped`/`expAdvance`/`claimExped`,
  Save v10. Kostet keine Glut, 1/2/4/8 Std., Weg mit Gabelungen. Ø EP < 50 % der Glut derselben Zeit. → E
- **Umherziehen** `WANDER`; `wanderStart`/`wanderTick`/`wanderClaim`, Save v14. Idle nur bei offener
  App; **Uhrzeit statt Takt**, Lücke > `gap` wird verschoben, nicht nachgeholt. → E
- **Alchemie & Tränke** `POTIONS`/`HERBS`/`HERB_LOC`/`ALCH`/`TRIGGERS`; `brew`/`setBelt`/`setTrig`/
  `usePotions`, Save v8. Wirken **nur in der Krypta**. Gürtel 2 Plätze (3 ab Treue III).
  **Höchstens ein seltener Trank im Gürtel** – und das muss dastehen. Je Akt genau eine Feldzutat;
  **ein Herz fällt nie allein**. `node tests/potions.mjs … --check`. → E
- **Steckbriefe** `BOUNTIES`; `bounties()`/`bountyEvent()`/`claimBounty()` – täglich 3, deterministisch.
  Neue Art = Zeile in `BOUNTIES` + Ereignis im Kampf. → E
- **Omen** `OMENS`/`omen()` – täglich ein Ort + Effekt, deterministisch aus dem Datum, ab Stufe 3. → E
- **Glockensplitter / Finale**: erster Bosssieg in Krypta 1–4 → `S.shards`; 4 öffnen Krypta 5.
  Prophet-Quest p5 hat `choice` → Titel + Segen. → E
- **Glut** `CFG.maxGlut` 150, `CFG.glutRegenMin` 3. Takt = Warten zwischen Sitzungen, `maxGlut` =
  Kämpfe je Sitzung. → E
- **Material / Gold-Senken**: erster Sieg in einem Akt-Gebiet gibt sicher Material; Glücksgriff und
  `rushCost()` ziehen Gold. → E
- **Spuren & Tiefe** `TRACKS`/`DELVE` – nur noch für fuzz/personas/Logik-Tests, Oberfläche entfernt. → E

**Auskunft & Oberfläche**
- **Das Verzeichnis** `js/wiki.js` (DOM-frei, reine Ableitung), `viewWiki(cat, sel)`; Einstellungen →
  „Nachschlagen". Sechs Kategorien. **Alles abgeleitet, nichts abgetippt.** `.wlist` darf scrollen.
  **Noch nicht drin:** Gegenstände, Grab-Sets, Boni (bewusst). → E
- **„Wo kriege ich das her?"** `herbSource(k)` – fehlende Zutat nennt ihren Ort. → E
- **Jedes Krypta-Ziel sagt, wo die Krypta ist** `wo(c)` in `objectives()` in quests.js. `cryptOpen`
  prüft **zwei** Dinge: Akt **und** Glockensplitter. → E
- **Rat bei schlechter Siegchance** `weakAdvice(p)` in game.js – unter 35 % die naheliegendste Abhilfe. → E
- **Die Vorbereitung** `viewPrep`/`viewZonePrep` (`prepCore`), Gegnerwerte aus `enemyInfo()`,
  `fightReport()` → `fightSummary`. **Zwei Sparschritte** in `fitPrep()` (`.prep.tight` → `.tighter`).
  Absicht des Gegners (`iB`) steht über dem Porträt. → E
- **Akt-Texte**: `intro`, `say`, `outro` je Akt; Händler-`lines`. Kurz halten (< 110 Zeichen, Test). → E
- **Ortsbilder** `assets/places/<ortId>.webp` hinter dem Kopf der Akt-Ansicht; nur das mittlere
  Drittel ist sichtbar. **`url()` in einer Custom Property wird gegen das Stylesheet aufgelöst.** → E
- **Tutorial** `TUTORIAL`/`tutCheck()` – ersetzt im HUD die Balken, nie Overlay über Buttons. → E
- **Einstellungen** (Zahnrad): Ton, „Nachschlagen" (Verzeichnis + Beute-Filter), Anzeige-Maße,
  „Held vernichten". → E
- **Siegel gegen Bearbeiten**: `save()` schreibt eine Prüfsumme; passt sie nicht → `S.tampered`. → E

## Tests im Einzelnen
- `tests/logic.test.mjs` – node:test, Logik & Daten-Konsistenz (Quest-Ziele, Bilder, Migration, Softlocks).
- `tests/fuzz.mjs [züge] [läufe]` – zufällige legale Spielzüge; prüft nach JEDEM Zug: kein doppeltes
  Item, Werte gültig, Raster ohne Überlappung, Speichern=Laden. **Kennt Beutel und Lager.**
- `tests/ui.cjs` – Playwright auf dem iPhone 13 (App, 390×844): alle Ansichten, JS-Fehler, nichts ragt heraus,
  kleinste Schrift. Screenshots in `tests/out/` (nicht committen).
- `tests/uifuzz.cjs [taps]` – tippt zufällig auf alles; meldet JS-Fehler, Überstand, „undefined/NaN",
  Sackgassen, **jeden Systemdialog**.
- `tests/trader.cjs` – Händler-Layout: 3 Händler × alle Aufträge + Vargo + Ilse/Prophet × 390×844 ohne/mit Band (60 px).
- `tests/prep.cjs` – Vorbereitung (Krypta **und** Akt-Gebiet) auf 390×844 ohne Band, 60 px und 180 px Band;
  „Kämpfen" sichtbar, der zweite Sparschritt (`.tighter`) muss mindestens einmal greifen.
- Balance (alle mit gekoppeltem Zufall, `--check` in run.sh): `caps.mjs` (laufen Boni ins Leere?),
  `calib.mjs` (Eichung), `tree.mjs`, `ways.mjs`, `uniques.mjs`, `sets.mjs`, `potions.mjs`,
  `descent.mjs` (Held aus `tests/held.mjs`: echte Talente/Brett wie der Bot), `lohn.mjs`, `acts.mjs`.
- `tests/oneshot.mjs [klasse] [heldenstufe] [GS]` – Anteil Krypta-Boss-Siege mit dem ersten Treffer (Welle 1a).
- `tests/bot.mjs [klasse] [tage] [läufe] [risiko] [--pots]` – Bot mit simulierter Uhr, für
  Balance-Fragen. **Deckt den Spieler *nach* der Geschichte kaum ab.** → E
- `tests/personas.mjs [tage]` – Optimist/Realist/Pessimist, Auswertung in BOT-REVIEW.md.
- Browser-Tests laufen mit `deviceScaleFactor: 1`.
- Neue Features: Logik in game.js/state.js (DOM-frei), dann Test ergänzen.

## Einzelregeln (aus CLAUDE.md hierher verschoben, gelten weiter)

**Fallen, die an einem System hängen**
- **Ein Prozent-Bonus auf eine kleine Grundzahl ist ein toter Knoten** (Rüstung bei der Zauberin: 3).
- **Neue Belohnung an eine bestehende Zeile hängen, nicht `L.push()`** (Überstand im Beute-Fenster).
- **Der Rückweg eines Fensters mit mehreren Türen ist die Ansicht, aus der man kam** – nie gegen
  eine Namensliste prüfen.

**Stil im Einzelnen**
- **UI-Kit** `assets/ui/` (SpriteCook „Aschenkrone UI", Kit-ID 5b87162c-1f82-47da-86ed-5ea0f12edab0):
  panel, panel_s, parchment, btn_iron/btn_red, tab/tab_on, slot, tooltip, track/fill_gold/fill_red,
  orb_ring/orb_fill, coin, marker, divider – per `border-image` (9-Slice) am Ende von style.css.
  **Neue Rahmen nur aus diesem Kit, keine neuen CSS-Verläufe.**
- Bilder: Items `assets/items/<art>.webp` (Basis `art` + `vars`, höhere Basen mit `minLvl`), Fallback
  SVG (`js/art.js`), Raster w×h wie Diablo. Monster `assets/monsters/<glyph>.jpg` (`MON_IMG` in ui.js),
  NPCs `assets/npcs/`, Portraits `assets/portraits/`. Prompts in `assets/reference/`.
  **Keine generierten Ersatzbilder ohne Absprache.**
- **Item-Namen** richten sich nach dem Geschlecht des Grundgegenstands (`GENUS` in data.js, `adj()`
  in loot.js). Neuer Grundgegenstand, der nicht männlich ist → in `GENUS` eintragen (Test prüft). Nie „/r".

**Architektur im Einzelnen**
- Vanilla JS, **ES-Module**, kein Build-Step. Start: `python3 -m http.server` → http://localhost:8000
- `js/data.js` – reine Daten (Klassen, Monster, Item-Basen, Affixe). Keine Logik.
- `js/rng.js` – Zufall (seedbar), `pick`, `roll`, `chance`.
- `js/state.js` – Spielstand, Save/Load (localStorage `aschenkrone_v1`, **Version 21**; unlesbarer
  Stand wird nach `aschenkrone_v1_bak` gesichert und nie überschrieben), Raster-Inventar, Treue,
  abgeleitete Werte (`stats()`).
- `js/loot.js` – Item-Erzeugung (Seltenheit, Affixe, Wert).
- `js/quests.js` – Questketten aller Questgeber (`GIVERS`), Ziele, Fortschritt, Abgabe.
- `js/art.js` – SVG-Grafiken. `js/wiki.js` – Verzeichnis (reine Ableitung, DOM-frei).
- `js/game.js` – Spielzüge ohne DOM + Gefahr-Schätzung. main.js zeigt nur an.
- `js/combat.js` – reine Kampfsimulation `fight(a, b) -> {winner, log}`. Kein DOM.
- `js/ui.js` – Rendering (Templates als Strings), Tooltips. `js/main.js` – Navigation, `data-action`.

**Handy im Einzelnen**
- **Große Bildschirme** (≥ 760 px Höhe): eigener `@media (min-height: 760px)`-Block – größere Schrift
  (`html` 2,1vh), Knöpfe ≥ 42 px, Ware 3×2, große Zauber-/Crafting-Knöpfe. **Dort wird es eng, nicht auf dem kleinen Gerät** – beim Hinzufügen dort nachmessen.
- Touch: Item-Tap öffnet Detail-Popup (`showTouchTip` in main.js), kein Hover/Rechtsklick voraussetzen.
  Dort auch **„Schmieden"** (`forgeitem`): öffnet die Schmiede direkt mit dem Item (Umschmieden,
  sonst Runen für angelegte Teile). In der Umschmieden-Liste sind angelegte Teile grün umrandet
  (`.fslot.eq`).

**Progression**
- Attribute nur über Punkte (5/Stufe), Talente 1/Stufe (`TREE` mit Brett, sonst `TALENTS`),
  Läuterung kostet Gold.
- Gegner wachsen nur halb mit (`locLvl`).

**Oberfläche im Einzelnen**
- Held: Name (und Titel) oben in der Kopfzeile. **Beutel und Lager sind 10×6.** `.invp` braucht
  `!important` beim Padding, sonst gewinnt die spätere `.panel`-Regel. → E
- Kein Tagebuch in der UI (`S.journal` wird nur gespeichert).
