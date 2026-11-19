# ASCHENKRONE – Projektgedächtnis

Düsteres Browser-RPG (Aufträge, Auto-Kampf, Loot, Händler), Optik Diablo 1/2 – dunkel, ernst,
handgemalt. Sprache im Spiel: **Deutsch**.

**Neue Sitzung? Zuerst `UEBERGABE.md` lesen** – Branch, offene Fragen, Stand.

**Diese Datei sagt, was gilt** (dazu `SYSTEME.md` je System). **Das *Warum* steht in
`entscheidungen/`** (Wegweiser: `ENTSCHEIDUNGEN.md`) – Messergebnisse, verworfene Entwürfe,
Fehlergeschichten. **`→ E`** heißt: dort steht ein Abschnitt gleichen Namens –
`grep -n '^### Name' entscheidungen/*.md`, dann nur diesen Abschnitt lesen. Vor dem Anfassen eines
Systems dort nachlesen, besonders vor Balance-Zahlen.

## Sparsam arbeiten (Ansage des Besitzers – jede Sitzung kostet sein Kontingent)
- **Nie eine große Datei ganz lesen** (ui.js, data.js, state.js, game.js, style.css sind 57–123 kB).
  Erst `sh tests/karte.sh <datei>` (Funktionen + Zeilen) oder `sh tests/karte.sh such <wort>`,
  dann gezielt `sed -n 'a,bp'`. Dasselbe für `entscheidungen/` und `SYSTEME.md`.
- **Befehlsausgaben klein halten**: `| head`, `| cut -c1-160`, nie ein ganzes `diff` großer Dateien.
- **Während der Arbeit nur den betroffenen Test**: `sh tests/run.sh logic` (auch mehrere:
  `sh tests/run.sh logic ui`). Der volle `sh tests/run.sh` **einmal** vor dem Push.
- **Screenshots nur von der geänderten Ansicht, ein Gerät**, außer es geht ums Layout auf allen.
- Keine Unteragenten für Suchen, die ein `grep` erledigt.

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
Die Blöcke je System (wo der Code liegt, harte Grenzen) stehen in **`SYSTEME.md`** – sie sind Regel.
**Vor dem Anfassen eines Systems dessen Block dort lesen**, nicht die ganze Datei.

## Tests
- `sh tests/run.sh quick` (~30 s: Logik + Browser-UI) bei kleinen Änderungen (Texte, Farben, Abstände).
- `sh tests/run.sh` (~2:45, parallel) **vor jedem Push**. Einzelne Teile: `sh tests/run.sh <name> …`
  (logic bot fuzz ways potions descent acts sets uniques tree caps ui trader prep uifuzz).
- Was jeder Test prüft (logic, fuzz, ui, uifuzz, trader, prep, Balance, bot, personas): **`SYSTEME.md`**,
  Abschnitt „Tests im Einzelnen". Browser-Tests: `deviceScaleFactor: 1`, alle Geräte gleichzeitig.
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
