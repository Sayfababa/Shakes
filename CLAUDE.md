# ASCHENKRONE – Projektgedächtnis

Düsteres Browser-RPG (Aufträge, Auto-Kampf, Loot, Händler), Optik Diablo 1/2 – dunkel, ernst,
handgemalt. Sprache im Spiel: **Deutsch**.

**Neue Sitzung? Zuerst `UEBERGABE.md` lesen** – Branch, offene Fragen, Stand.

**Diese Datei sagt, was gilt. Das *Warum* steht in `ENTSCHEIDUNGEN.md`** – Messergebnisse,
verworfene Entwürfe, Fehlergeschichten. **`→ E`** heißt: dort steht ein Abschnitt gleichen Namens.
Vor dem Anfassen eines Systems dort nachlesen, besonders vor Balance-Zahlen.

## Arbeitsweise (Ansage des Besitzers)
- **Nichts bauen ohne seine Erlaubnis.** Vorher sagen: was genau gebaut wird, was nicht angefasst
  wird, **wie und wie oft getestet** wird (welcher Test, welche Geräte, wie viele Läufe/Kämpfe, ob
  gegengetestet), und was sich nicht beweisen lässt. Dann auf sein „ja" warten.
- Lesen und Messen ist immer erlaubt – daraus Befund und Vorschlag vorlegen.
- Bei großen Änderungen am Spielgefühl erst Vorschlag + Mockup (`mockups/*.html`, Screenshot).
- Nach jedem größeren Schritt eine kurze Zusammenfassung. Antworten an den Besitzer auf **Deutsch**.
- Keine neuen KI-Bilder/Sounds, keine bezahlten Dienste ohne Rückfrage. Fehlt ein Bild: **Prompt
  vorschlagen**, nicht selbst erzeugen.
- Kleine, thematische Commits mit deutscher Beschreibung, häufig pushen auf **genau den Arbeits-Branch**.
  Keine Pull Requests, kein force-push, kein anderer Branch.
- **Vor jedem Push `sh tests/run.sh` – alles grün.** Neue Features bekommen Tests.

## Fallen (jede ist schon mindestens einmal zugeschlagen) → E
- **Ein einzelner Ausrüstungswurf entscheidet alles.** Knoten, Einzigartige, Boni nie über *einen*
  Wurf messen – `tests/tree.mjs` nimmt 3, für Einzigartige waren 8 nötig. (3× dokumentiert, 3× passiert.)
- **Gegner je Messfall neu auf ~50 % eichen**, sonst misst man Rauschen.
- **Ein Test darf die Regel nicht nachbauen, er muss sie aufrufen** – sonst driften Test und System.
- **Kampf-Tests ohne Zufallskeim brauchen gleich lange Messkämpfe**, sonst misst man die Stichprobe.
- **Eine Schranke setzt man nach gemessener Verteilung, nicht nach Gefühl.**
- **Ein Panel kann Inhalt verschlucken, ohne herauszuragen** (`scrollHeight > clientHeight`) – und
  `nth-of-type`-Regeln blenden still aus. Screenshot ansehen, nicht nur Tests lesen.
- **Eine Marke ohne CSS-Regel ist unsichtbar** – gerenderte Farbe prüfen, nicht die Klasse.
- **Ein Prozent-Bonus auf eine kleine Grundzahl ist ein toter Knoten** (Rüstung bei der Zauberin: 3).
- **Ein Hinweis, der lügt, ist schlimmer als keiner.**
- **Eine Beschränkung, die stillschweigend überschreibt, ist ein Fehlerbericht in Wartestellung.**
- **Über zwei Tipps hinweg darf Zustand nur im DOM stehen**, nie in einer Variablen, die `hideTip()`
  löscht – das gilt für die Aktion **und** für das, was gezeichnet wird.
- **Alles Nachschlagbare ableiten, nie abtippen** – ein handgeschriebener Ort lügt beim ersten Umzug.
- **Ein neuer Prozent-Bonus muss in die Liste des Eich-Tests**, sonst ist er unbewacht.
- **Neue Belohnung an eine bestehende Zeile hängen, nicht `L.push()`** (Überstand im Beute-Fenster).
- **Der Rückweg eines Fensters mit mehreren Türen ist die Ansicht, aus der man kam** – nie gegen
  eine Namensliste prüfen.

## Stil-Regeln (verbindlich)
- **Kein „AI-Look"**: keine Neon-Gradients, kein Glassmorphism, keine runden Pill-Buttons, keine Emojis.
- Palette: fast Schwarz (#0b0907), verbranntes Braun, Eisen-Grau, Blutrot (#8a1c13), gedämpftes Gold (#b08a3e).
- Schrift: `Grenze Gotisch` (Titel), `Alegreya` (Text), `Alegreya SC` (Labels/Buttons). Kein Cinzel.
- Texturen statt Flächen (`--noise`, `--stonetex`, `--rivets`), Quest-Zettel als Pergament (`.note`).
- Rahmen: harte Kanten, doppelte Eisen-/Steinrahmen, Innenschatten, Vignette. Max. 2 px Border-Radius.
- **UI-Kit** `assets/ui/` (SpriteCook „Aschenkrone UI", Kit-ID 5b87162c-1f82-47da-86ed-5ea0f12edab0):
  panel, panel_s, parchment, btn_iron/btn_red, tab/tab_on, slot, tooltip, track/fill_gold/fill_red,
  orb_ring/orb_fill, coin, marker, divider – per `border-image` (9-Slice) am Ende von style.css.
  **Neue Rahmen nur aus diesem Kit, keine neuen CSS-Verläufe.**
- Loot-Farben (D2): grau=zerbrochen, weiß=gewöhnlich, #6969ff=magisch, #ffff64=selten,
  #c7b377=legendär, #00c400=Set (`--r-*`); Einzigartiges zusätzlich orange (`.uniq-txt`, Zelle `.uq`).
- Bilder: Items `assets/items/<art>.webp` (Basis `art` + `vars`, höhere Basen mit `minLvl`), Fallback
  SVG (`js/art.js`), Raster w×h wie Diablo. Monster `assets/monsters/<glyph>.jpg` (`MON_IMG` in ui.js),
  NPCs `assets/npcs/`, Portraits `assets/portraits/`. Prompts in `assets/reference/`.
  **Keine generierten Ersatzbilder ohne Absprache.**
- **Item-Namen** richten sich nach dem Geschlecht des Grundgegenstands (`GENUS` in data.js, `adj()`
  in loot.js). Neuer Grundgegenstand, der nicht männlich ist → in `GENUS` eintragen (Test prüft). Nie „/r".

## Architektur
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

## Konventionen
- Logik-Module sind DOM-frei und rein → mit `node` testbar.
- Zahlen/Balancing nur in `data.js`, nicht in der Logik verstreuen.
- Neue Features: erst Daten, dann Logik, dann UI. Kleine Commits.
- Save-Format ändern ⇒ `SAVE_VERSION` erhöhen + Migration.
- Neue Boni als Effekt-Schlüssel (`EFFECT_NAMES`) → `effects()` summiert Klasse+Talente+Trophäen.
- Neue Effekte in `power()` einrechnen und eichen (`tests/calib.mjs`, Ziel ~0,85–1,2).
- Neue Treffer-Wirkungen in `finish()`/`onHit()` in combat.js → wirken auf Hieb **und** Zauber.

## Mobile / PWA
- Primär am Handy als Homescreen-App: https://sayfababa.github.io/Shakes/ (Pages vom Arbeits-Branch).
- **Ab iPhone 13, nicht mehr SE** (Ansage des Besitzers). Geräte in den Tests: `Browser 390x664`
  (iPhone 13 **im Safari**, Leisten fressen ~180 px – **nicht streichen**, wer den Link antippt sitzt
  dort), `iPhone 13`, `iPhone 15 Pro Max`, `App 430x867`. Eigene Größen in `ctxFor(dev)`.
- **Kein Scrollen**: HUD oben, `<main>` (overflow hidden), Tabs unten. `#app` ist `position: fixed;
  inset: 0` – **nicht** 100dvh/100vh; als App setzt `fitApp()` die Höhe auf `screen.height`.
  Ausnahmen, die scrollen dürfen: Kampflog, Werte-Ansicht (`.vscroll`), `.wlist`.
- **Große Bildschirme** (≥ 760 px Höhe): eigener `@media (min-height: 760px)`-Block – größere Schrift
  (`html` 2,1vh), Knöpfe ≥ 42 px, Ware 3×2, große Zauber-/Crafting-Knöpfe. **Dort wird es eng, nicht auf dem kleinen Gerät** – beim Hinzufügen dort nachmessen.
- Schrift nie unter 11 px: kleine Größen als `max(11px, …rem)`. Passt ein Wort nicht, kürzen
  (`short5()`), nicht verkleinern.
- `manifest.json` + `sw.js` (network-first). **Alle Pfade relativ** (Pages-Unterordner).
- Touch: Item-Tap öffnet Detail-Popup (`showTouchTip` in main.js), kein Hover/Rechtsklick voraussetzen.
  Dort auch **„Schmieden"** (`forgeitem`): öffnet die Schmiede direkt mit dem Item (Umschmieden,
  sonst Runen für angelegte Teile). In der Umschmieden-Liste sind angelegte Teile grün umrandet
  (`.fslot.eq`).
- **Eigene Fenster statt Systemdialoge**: `ask(text, knopf, fn, rot)`, `note(text)`. Nie `alert`/`confirm`.

## Rendering-Regel (gegen Flackern)
- Kein Voll-Render im Sekundentakt: Countdowns als `data-until="<ts>"` → Ticker ändert nur den Text.
- Kampf-Animation über `fightStep()` (DOM-Patch), Voll-Render nur am Ende.
- Service Worker: Bilder stale-while-revalidate, Code network-first.

## Progression (siehe DESIGN.md)
- Attribute nur über Punkte (5/Stufe), Talente 1/Stufe (`TREE` mit Brett, sonst `TALENTS`),
  Läuterung kostet Gold.
- Balance-Änderungen mit Simulation prüfen: viele Builds × viele Kämpfe, **nie ein Wurf**.

## Systeme
Je System: wo der Code liegt und die harten Grenzen. **Alles Weitere → E.**

**Kampf & Werte**
- **Kampfkraft** `power()`/`powerWith()`/`powerAttr()` in state.js – eine Zahl, deterministisch.
  Grundlage für Item-Vergleich und „+N" an Attributen. Neue Effekte dort einrechnen. → E
- **Kampf-Boni auf Items** `AFFIXES` (`pct`/`slots`/`kind`), Obergrenzen `CAPS` (critMult 3,5).
  `affixPool(it)` entscheidet, was ein Teil tragen kann. **Neuer Prozent-Bonus → in die Liste des
  Eich-Tests.** Flache Werte bewusst ohne Wache. → E
- **Treffer-Wirkungen** combat.js: `finish()` (Henker, Krit), `onHit()` (Leech, Bluten, Gift, Dornen).
  Zauber sind nur nicht blockbar. → E
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
  chaos, values, add, remove. Kostet Schmiedeglut (`it.glut/glutMax`), dann `it.crafted`.
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
  Save v12. Keine Glut, nur Pause. Rivale hängt am **Platz**, nicht an der Heldenstufe.
  **Vargo steht bei den Händlern** (vierter Reiter); zwei Türen → `pitBack`, `titleBack`. → E
- **Der Abstieg / Der Abgrund** `DESCENT`/`DESC_ROOMS`/`ELITE`; `descStart`/`descNext`/`descEnter`/
  `descStair`, Save v11. Leben und Trank-Ladungen laufen mit, Unruhe +1 je Raum, Beute zählt erst am
  Ausgang, Tod = Sack weg. Kostet ein **Grabsiegel** (`S.seals`, Save v19; 2/Tag, max 6).
  `node tests/descent.mjs … --check`. **Die vier Abgrund-Materialien stehen in DESIGN.md und sind
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

## Tests
- `sh tests/run.sh quick` (~30 s: Logik + Browser-UI) bei kleinen Änderungen (Texte, Farben, Abstände).
- `sh tests/run.sh` (~1:45, parallel) **vor jedem Push**.
- `tests/logic.test.mjs` – node:test, Logik & Daten-Konsistenz (Quest-Ziele, Bilder, Migration, Softlocks).
- `tests/fuzz.mjs [züge] [läufe]` – zufällige legale Spielzüge; prüft nach JEDEM Zug: kein doppeltes
  Item, Werte gültig, Raster ohne Überlappung, Speichern=Laden. **Kennt Beutel und Lager.**
- `tests/ui.cjs` – Playwright auf 4 Geräten: alle Ansichten, JS-Fehler, nichts ragt heraus,
  kleinste Schrift. Screenshots in `tests/out/` (nicht committen).
- `tests/uifuzz.cjs [taps]` – tippt zufällig auf alles; meldet JS-Fehler, Überstand, „undefined/NaN",
  Sackgassen, **jeden Systemdialog**.
- `tests/trader.cjs` – Händler-Layout: 3 Händler × alle Aufträge + Vargo + Ilse/Prophet × 8 Bildschirme.
- `tests/prep.cjs` – Vorbereitung (Krypta **und** Akt-Gebiet) auf 9 Bildschirmen; „Kämpfen" sichtbar.
- Balance (alle mit gekoppeltem Zufall, `--check` in run.sh): `caps.mjs` (laufen Boni ins Leere?),
  `calib.mjs` (Eichung), `tree.mjs`, `ways.mjs`, `uniques.mjs`, `sets.mjs`, `potions.mjs`,
  `descent.mjs`, `acts.mjs`.
- `tests/bot.mjs [klasse] [tage] [läufe] [risiko] [--pots]` – Bot mit simulierter Uhr, für
  Balance-Fragen. **Deckt den Spieler *nach* der Geschichte kaum ab.** → E
- `tests/personas.mjs [tage]` – Optimist/Realist/Pessimist, Auswertung in BOT-REVIEW.md.
- Browser-Tests laufen mit `deviceScaleFactor: 1` und allen Geräten gleichzeitig.
- Neue Features: Logik in game.js/state.js (DOM-frei), dann Test ergänzen.

## Navigation
- Untere Leiste: **6 Tabs** Held · Streifzug · Händler · Schmiede · Alchemie · Krypta (`navBar`).
- Im Krypta-Tab oben Reiter **Krypten | Abgrund | Grube** (`cryptTabs(on)`).
- Schmiede/Alchemie zusätzlich über Halvar/Ysolde (dann mit „Zurück").
- **Fenster mit mehreren Türen merken sich die Tür**: `pitBack`, `titleBack`, `alchBack`.

## UI-Regeln
- Held: Name (und Titel) oben in der Kopfzeile. **Beutel und Lager sind 10×6.** `.invp` braucht
  `!important` beim Padding, sonst gewinnt die spätere `.panel`-Regel. → E
- **Jede Seltenheit muss man im Beutel sehen, ohne etwas anzutippen.** `rarCls(it)` ist **ein**
  Helfer für **alle** Felder – Beutel, Lager, Laden, Körper, Schmiede, Fusion, Vargo, Abgrund-Sack. → E
- Tab-Punkte nur für echte Handlungen. **Rot** = abholbar, **grün** (`readyDots()`) = Wartezeit
  abgelaufen; verschwindet beim Hinschauen. Rot geht vor Grün.
- Treffer-Feedback: Schadenszahl + kurzer Rand-Schatten/Wackeln, **Portrait nie einfärben**.
- Gesperrtes klein halten (Orte als Zeile, Krypten kompakt).
- Kein Tagebuch in der UI (`S.journal` wird nur gespeichert).

## Design-Leitlinien (GameGene-Joseki, angewendet)
- **Kein unfairer Verlust**: Gefahr vor jedem Kampf anzeigen, Boss-Besonderheit vorher nennen.
- **Schwierigkeit durch Muster, nicht nur Zahlen**: jeder Boss hat eine eigene Mechanik (`boss.mech`).
- **Zeit des Spielers respektieren**: keine Softlocks (Boss-Ziele zählen rückwirkend), Gegner wachsen
  nur halb mit (`locLvl`).
