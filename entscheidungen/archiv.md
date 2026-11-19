# Archiv: die alte CLAUDE.md im Wortlaut

## Anhang: die kurzen Abschnitte der alten CLAUDE.md im Wortlaut

Beim Aufteilen wurden die kurzen Abschnitte (Stil, Architektur, Konventionen, Mobile, Tests,
UI-Regeln, Navigation …) **neu und knapper formuliert**. Hier steht der alte Wortlaut unverändert,
damit buchstäblich nichts gelöscht ist. Maßgeblich ist immer die aktuelle CLAUDE.md –
dieser Anhang ist Archiv, keine Regel.

# ASCHENKRONE – Projektgedächtnis

Düsteres Browser-RPG im Stil eines Questing-/Auto-Battler-Spiels (Aufträge, Auto-Kampf, Loot, Händler),
Optik: Diablo 1/2 – dunkel, ernst, handgemalt. Sprache im Spiel: **Deutsch**.

## Stil-Regeln (verbindlich)
- **Kein "AI-Look"**: keine Neon-Gradients, keine Glassmorphism, keine runden Pill-Buttons, keine Emojis in der UI.
- Palette: fast Schwarz (#0b0907), verbranntes Braun, Eisen-Grau, Blutrot (#8a1c13), gedämpftes Gold (#b08a3e).
- Schrift: `Grenze Gotisch` (Titel), `Alegreya` (Text), `Alegreya SC` (Labels/Buttons). Kein Cinzel (wirkt generisch).
- Texturen statt Flächen: Rauschen/Stein (`--noise`, `--stonetex`), Nieten (`--rivets`) auf `.panel`, Quest-Zettel als Pergament (`.note`).
- Items: gemalte Bilder `assets/items/<art>.webp` (Basis `art` + Varianten `vars` – seltene/legendäre zeigen meist eine prächtigere Variante; höhere Grundgegenstände mit `minLvl`, z. B. Dornenhelm, Henkersaxt) (aus KI-Sheet geschnitten, Schwarz→transparent), Fallback SVG (`js/art.js`), Größe im Raster w×h wie Diablo. Boss-/Monster-Portraits in `assets/monsters/<glyph>.jpg` (Liste `MON_IMG` in ui.js). NPC-Portraits in `assets/npcs/` (halvar, ysolde, kaspar, vargo, ilse, prophet); Sprecher-Leiste `say(id)` in ui.js mit Sätzen aus `NPCS`.
- **UI-Kit** `assets/ui/` (SpriteCook-Kit „Aschenkrone UI“, Kit-ID 5b87162c-1f82-47da-86ed-5ea0f12edab0): panel, panel_s, parchment (dunkel, wenig Kontrast), btn_iron/btn_red, tab/tab_on, slot, tooltip, track/fill_gold/fill_red, orb_ring/orb_fill, coin, marker, divider. Eingebunden per `border-image` (9-Slice) am Ende von style.css. Neue Rahmen nur aus diesem Kit, keine neuen CSS-Verläufe.
- Rahmen: harte Kanten, doppelte Eisen-/Steinrahmen, Innenschatten, Vignette. Max. 2px Border-Radius.
- Loot-Farben (D2-Konvention): grau=zerbrochen, weiß=gewöhnlich, #6969ff=magisch, #ffff64=selten, #c7b377=legendär, #00c400=Set (Variablen `--r-*` in style.css; Einzigartiges zusätzlich orange `.uniq-txt`).
- **Item-Namen**: Eigenschaftswort richtet sich nach dem Geschlecht des Grundgegenstands (`GENUS` in data.js, `adj()` in loot.js: „Starke Kappe“, „Rostiges Beil“). Neuer Grundgegenstand, der nicht männlich ist → in `GENUS` eintragen (Test prüft). Nie „/r“.
- Portraits liegen in `assets/portraits/` (sorceress, assassin, barbarian, paladin, huntress, witch). Keine generierten Ersatzbilder ohne Absprache.
## Architektur
- Vanilla JS, **ES-Module**, kein Build-Step. Start: `python3 -m http.server` → http://localhost:8000
- `js/data.js`    – reine Daten (Klassen, Monster, Item-Basen, Affixe). Keine Logik.
- `js/rng.js`     – Zufall (seedbar), `pick`, `roll`, `chance`.
- `js/state.js`   – Spielstand, Save/Load (localStorage, Key `aschenkrone_v1`, Version 21; unlesbarer Stand wird nach `aschenkrone_v1_bak` gesichert und nie überschrieben), Raster-Inventar, Händler-Treue, Streifzüge, abgeleitete Werte (`stats()`).
- `js/loot.js`    – Item-Erzeugung (Seltenheit, Affixe, Wert).
- `js/quests.js`  – Questketten aller Questgeber (`GIVERS`: 3 Händler + Vargo, Ilse, Prophet): Ziele, Fortschritt (`event()`), Abgabe (`complete(tid, choice)`). Segen (`rew.perk`) landen als Trophäe in `S.trophies`.
- `js/art.js`     – SVG-Grafiken: Items, leere Slots, NPCs, Monster.
- `js/game.js`    – Spielzüge ohne DOM (`resolveTrip`, `cryptFight`, `arenaFight`, `champFight`, `makeRival`) + Gefahr-Schätzung (`tripChance`, `cryptChance`). main.js zeigt nur an.
- `js/combat.js`  – reine Kampfsimulation: `fight(a, b) -> {winner, log}`. Kein DOM. Effekte generisch (crit, evade, block, leech, bleed, rage, pen, regen, thorns, execute, first, poison, toll).
- `js/wiki.js`    – Das Verzeichnis: reine Ableitung aus data.js + Fortschritt (DOM-frei, kein eigener Zustand).
- `js/ui.js`      – Rendering (Templates als Strings), Tooltips.
- `js/main.js`    – Bootstrapping, Navigation, Event-Delegation (`data-action`).
## Konventionen
- Logik-Module sind DOM-frei und rein → testbar mit `node`.
- Zahlen/Balancing nur in `data.js` ändern, nicht in der Logik verstreuen.
- Neue Features: erst Daten, dann Logik, dann UI. Kleine Commits.
- Save-Format ändern ⇒ `SAVE_VERSION` in state.js erhöhen + Migration.
- Schnelltest Logik: `node --input-type=module -e "import('./js/combat.js')..."`
## Mobile / PWA
- Wird primär am Handy als Homescreen-App getestet: https://sayfababa.github.io/Shakes/ (Pages vom Arbeits-Branch).
- **Ab iPhone 13, nicht mehr iPhone SE** (Ansage des Besitzers: „das Spiel ist nicht für iPhone SE ausgelegt, erst ab iPhone 13, so haben wir mehr Spielraum"). SE (375×667) und „tiny" (320×568) sind aus `ui.cjs`, `uifuzz.cjs`, `trader.cjs` und `prep.cjs` entfernt. **An die Stelle des SE tritt „Browser 390×664" – und das ist kein Ersatz aus Bequemlichkeit:** das ist ein iPhone 13 **im Safari**, wo die Leisten ~180 px fressen. Wer den Link antippt, statt die App vom Homescreen zu öffnen, sitzt genau auf dieser Höhe; ließe man sie auch fallen, liefe die Browser-Ansicht über, ohne dass ein Test piept. Gewonnen sind 15 px **Breite** (375 → 390), nicht Höhe. Eigene Größen stehen in `ctxFor(dev)` in ui.cjs/uifuzz.cjs.
- **Große Bildschirme** (≥ 760 px Höhe, z. B. großes iPhone als App 430×867): eigener `@media (min-height: 760px)`-Block am Ende von style.css – größere Schrift (`html` 2,1vh), Knöpfe ≥ 42 px, Ware 3×2, große Zauber-/Crafting-Knöpfe. Tests laufen zusätzlich auf „App 430x867“.
- **Kein Scrollen**: App-Layout = HUD oben, `<main>` (overflow hidden), Tabs unten. `#app` ist `position: fixed; inset: 0` – **nicht** 100dvh/100vh; als Homescreen-App setzt `fitApp()` in main.js die Höhe auf `screen.height` (iOS meldet den Viewport dort zu kurz, unten blieb ~100 pt frei). Jede Ansicht muss auf iPhone SE (375×667) und iPhone 13 passen – mit Playwright prüfen (Elemente unter main-Unterkante zählen). Nur das Kampflog und die Werte-Ansicht (`.vscroll`) dürfen intern scrollen. Karten (Orte, Krypten) dürfen nichts abschneiden – ui.cjs prüft das.
- `manifest.json` + `sw.js` (network-first, damit Updates sofort ankommen). Alle Pfade relativ (Pages-Unterordner!).
- Touch: Item-Tap öffnet Detail-Popup mit Aktionen (`showTouchTip` in main.js), kein Hover/Rechtsklick voraussetzen. Dort auch „Schmieden“ (`forgeitem`): öffnet die Schmiede direkt mit dem Item (Umschmieden, sonst Runen für angelegte Teile). In der Umschmieden-Liste sind angelegte Teile grün umrandet (`.fslot.eq`).
## Progression (siehe DESIGN.md)
- Attribute nur über Punkte (5/Stufe), Talente 1/Stufe (`TREE` für Klassen mit Brett, sonst `TALENTS`), Läuterung kostet Gold.
- Neue Boni immer als Effekt-Schlüssel ausdrücken (`EFFECT_NAMES`) → `effects()` in state.js summiert Klasse+Talente+Trophäen.
- Balance-Änderungen mit Simulation prüfen (viele Builds × viele Kämpfe, nicht ein Wurf).
## Rendering-Regel (gegen Flackern)
- Kein Voll-Render im Sekundentakt: Countdowns als `data-until="<ts>"` markieren → Ticker in main.js ändert nur den Text, bei 0 einmal `render()`.
- Kampf-Animation über `fightStep()` (DOM-Patch), Voll-Render nur am Ende.
- Service Worker: Bilder stale-while-revalidate, Code network-first.
## Tests
- `tests/caps.mjs [klasse] [stufe] [kämpfe] [--check]` (in run.sh) – **laufen Boni ins Leere?** Für jeden gedeckelten Wert (`CAPS`): wo steht ein normal ausgerüsteter Held, wie oft sitzt er auf der Grenze, und was bringen +X wirklich an Siegchance (über 3 Ausrüstungswürfe gemittelt). Ein Wert unter ±1,5 Punkten gilt als **tot** – Talente und Items darauf wirken nicht. Stand: **kein Wert ist tot**, alle sechs Klassen haben überall Luft. **Krit-Schaden** stand lange bei `per: 3` und damit auf 0,32 statt 0,85–1,2 (`tests/calib.mjs --per` schlug 8–9,5 vor); er ist jetzt auf `per: 8` (calib 0,85–1,10). Weil dadurch 38 % der gut ausgerüsteten Helden auf `CAPS.critMult` saßen, ist die Grenze von 3 auf **3,5** gestiegen (noch 23 %). Zwei Einzigartige fielen danach durch `tests/uniques.mjs`, weil seltene Teile stärker wurden und damit die Messlatte stieg – beide nachgezogen. Der Test unterscheidet drei Fälle: **TOT** (Kopfraum da, bringt trotzdem nichts – Fehler), **am Deckel** (ab 85 % der Grenze, die Grenze arbeitet) und **wenig Krit-Chance** (Krit-Schaden hängt an der Krit-Chance; wer selten kritisch trifft, hat nichts zu vervielfachen). **Zur Entstehung, damit sich der Irrtum nicht wiederholt:** nicht eine fehlende Absicherung ließ `critd` abdriften, sondern eine **unvollständige Liste** – der Eich-Test lief die ganze Zeit mit, hatte `critd` und `thornsp` aber nicht aufgeführt. Beide stehen jetzt drin (geprüft: mit `per: 3` schlägt der Test mit „critd: 0.34" fehl).
- `sh tests/run.sh quick` (~30 s: Logik + Browser-UI) bei kleinen Änderungen (Texte, Farben, Abstände).
- `sh tests/run.sh` (~1:45, alles parallel) vor Pushes mit Logik-/Kampf-/Crafting-/Spielstand-Änderungen.
- Browser-Tests laufen mit `deviceScaleFactor: 1` und den Handys gleichzeitig (3× Auflösung kostete das Vierfache an Zeit).
- `tests/logic.test.mjs` – node:test, Logik & Daten-Konsistenz (Quest-Ziele, Bilder, Migration, Softlocks).
- `tests/personas.mjs [tage]` – Optimist/Realist/Pessimist spielen in echten Sitzungen ohne Schummeln; Auswertung in BOT-REVIEW.md.
- `tests/bot.mjs [klasse] [tage] [läufe] [risiko] [--pots]` – Bot spielt mit simulierter Uhr und zeigt Tempo pro Tag (Stufe, Quests, Splitter, Niederlagen). Für Balance-Fragen benutzen. **Klassen mit Brett brauchen die Brett-Schnittstelle** (`treeOf`/`learnNode`/`learnBridge`, gierig nach `power()`): der Bot rief lange nur `G.learn(b, t)` vom alten Baum, dessen Knoten-IDs das Brett nicht kennt – die Assassine spielte dadurch **ohne jedes wirkende Talent** und sah zwei Akte langsamer aus als alle anderen. Wer eine Klasse aufs Brett holt, muss diesen Zweig im Blick behalten.
  **Tempo je Klasse** (7 Tage, 8 Läufe, Stufe beim Akt-VI-Boss): Paladin 16,7 · Barbar 17,9 · Assassine 18,1 · Jägerin 18,3 · Grabhexe 18,4 · Zauberin 18,6. Einzelne Läufe streuen von 15 bis 21, der Paladin-Vorsprung liegt also **innerhalb der Streuung** – eine echte Klassenlücke ist derzeit nicht nachweisbar. `tests/acts.mjs` taugt dafür **nicht**: dieselbe Klasse schwankt dort zwischen zwei Läufen um bis zu 30 %. `--pots`: Bot braut (gewöhnliche bis 3 Vorrat, seltene mit Herz) und packt vor jedem Krypta-Kampf den besten Gürtel; Tabelle zeigt Zutaten/Tränke/gebraut/getrunken. Eichung Alchemie (Zutaten-Chance 15 %): nach 4 Tagen ~5–30 Zutaten übrig, ~15 Tränke getrunken, Krypta-Niederlagen etwa halbiert, Fortschritt gleich schnell.
- `tests/fuzz.mjs [züge] [läufe]` – tausende zufällige legale Spielzüge, prüft nach JEDEM Zug: kein doppeltes Item, Gold/Glut/EP/Material gültig, Beutel ohne Überlappung, Werte endlich, Siegel/Glut/Runen konsistent, Speichern=Laden.
- `tests/uifuzz.cjs [taps]` – tippt zufällig auf alles in der App (3 iPhones, früh/spät), meldet JS-Fehler, Überstand, „undefined/NaN“ im Text, Sackgassen.
- `tests/potions.mjs` – Balance jedes Tranks (je Auslöser) gegen Krypta-Ebenen und jeden Boss, gekoppelter Zufall; in run.sh mit `--check`.
- `tests/trader.cjs` – Händler-Layout: 3 Händler × alle Aufträge × offen/fertig × 8 Bildschirme (auch iOS-App, wo `vh` größer ist als die sichtbare Fläche). Kopf, Zettel, Dienste haben feste Höhe, Ware füllt den Rest → überall gleich groß.
- `tests/descent.mjs` – Abstieg: Helden steigen bis zum Boss, Tabelle Überleben je Raum, Boss erreicht/besiegt, Ø Gold.
- `tests/prep.cjs` – Krypta-Vorbereitung: 5 Lagen (Boss mit vielen Hinweisen, 3 Gürtelplätze) × 8 Bildschirme inkl. iOS-App mit fehlendem Stück unten; „Kämpfen“ muss sichtbar sein. Siegchance + Kämpfen sind eine Leiste; Gürtel als Liste, `fitPrep()` in main.js schaltet auf Reihe (`.prep.tight`), wenn die Höhe nicht reicht.
- `tests/ui.cjs` – Playwright auf iPhone SE + 13: alle Ansichten, JS-Fehler, nichts ragt heraus. Screenshots in `tests/out/` (nicht committen).
- Neue Features: Logik in game.js/state.js (DOM-frei), dann Test ergänzen.
## Design-Leitlinien (GameGene-Joseki, angewendet)
- **Kein unfairer Verlust**: Gefahr vor jedem Kampf anzeigen (Streifzug-Karte, Krypta-Ebene), Boss-Besonderheit vorher nennen.
- **Schwierigkeit durch Muster, nicht nur Zahlen**: jeder Boss hat eine eigene Mechanik (`boss.mech`).
- **Zeit des Spielers respektieren**: keine Softlocks (Boss-Ziele zählen rückwirkend), Gegner wachsen nur halb mit (`locLvl`).
## Navigation
- Untere Leiste: **6 Tabs** Held · Streifzug · Händler · Schmiede · Alchemie · Krypta (`navBar` in ui.js; mehr passen auf dem SE nicht lesbar). Im Krypta-Tab oben Reiter **Krypten | Abgrund | Grube** (`cryptTabs(on)`); `arena`/`desc`/`prep` gehören zum Krypta-Tab. Schmiede/Alchemie sind zusätzlich über Halvar/Ysolde erreichbar (dann mit „Zurück“).
## UI-Regeln (aus UX-REVIEW.md)
- Held: Name (und Titel) steht oben in der Kopfzeile, nicht unter dem Portrait. **Der Beutel ist 10×6** (war 10×4), das Lager ebenso – zusammen 120 Felder statt 40. Unter dem Beutel lagen auf **jedem** geprüften Bildschirm mindestens 111 px ungenutzt (auch auf dem SE); das war reservierte Fläche, die nie jemand gebraucht hat. **Das Padding von `.invp` braucht `!important`** wie das `flex` darüber, sonst gewinnt eine spätere `.panel`-Regel (9-Slice am Dateiende) – deshalb bewirkte ein erster Versuch, Platz zu sparen, gar nichts.
  **Die sechste Reihe kostet auf kurzen Bildschirmen ~10 px**, die im `@media (max-height: 720px)`-Block wieder hereinkommen (kleinere Material-Symbole, schmalere Stege, `--gap` 2 px). **Die letzten Pixel nicht an Rändern zusammensuchen:** vier Versuche mit Paddings und Margins endeten jedes Mal bei „+1 px", weil das Raster an `aspect-ratio` hängt und seine Höhe der Breite folgt. `.inv { width: 96% }` auf kurzen Bildschirmen macht es **proportional** flacher und rechnet sich selbst aus. Und: `.mats .matimg` hat ein **negatives** Margin, das die Zeile zusammenzieht – wer es auf `0` setzt, macht es schlimmer, nicht besser.
  **Schrift bleibt bei `max(11px, …)`:** ein Versuch, die Materialzeile auf `.72rem` zu setzen, fiel sofort durch (`10,8 px`). `.hero` ist `justify-content: center`: auf hohen Bildschirmen lag die ganze Luft **unter** dem Beutel, jetzt teilt sie sich gleichmäßig auf oben und unten (auf engen Bildschirmen gibt es nichts zu verteilen).
  **Zum Thema „der SE ist egal":** die kleine Höhe ist kein SE-Problem. `tests/trader.cjs`/`prep.cjs` prüfen **390×664** – das ist ein modernes iPhone **im Browser**, wo Safaris Leisten ~180 px fressen. Wer den Link antippt statt die App zu öffnen, sitzt auf dieser Höhe. Kein Tagebuch in der UI (nirgends; `S.journal` wird nur noch gespeichert). Ausrüstung symmetrisch: links Helm/Waffe/Handschuhe/Ring, rechts Amulett/Nebenhand/Stiefel/Ring, unter dem Portrait Brust + Gürtel. Portrait sitzt in `.pfill` (absolut) und richtet sich nach den Spalten – nie umgekehrt.
- Tab-Punkte nur für echte Handlungen (siehe `badge` in navBar), nie als Dauerzustand. **Rot** = Auftrag/Punkte/Lohn abholbar. **Grün** (`readyDots()` in ui.js, `.tabs a.ready`) = eine Wartezeit ist abgelaufen (Krypta-Erholung, Grube-Pause, Expedition zurück); verschwindet beim Hinschauen (render() setzt abgelaufene `S.crypt.cd`/`S.pit.ts` auf 0). Der Ticker in main.js zeichnet nur die Leiste neu, wenn sich die Punkte ändern. Rot geht vor Grün.
- **Jede Seltenheit muss man im Beutel sehen, ohne etwas anzutippen.** Set-Teile waren im Raster **grau wie gewöhnliche Ware** (vom Besitzer gemeldet) – die Zelle trug `r-set` längst, aber eingefärbt waren in style.css nur `r-magic`, `r-rare`, `r-legendary` und `r-broken`. Kein Fehler in der Logik, eine **fehlende Zeile im CSS**, und damit unsichtbar für jeden Test, der nur auf Überstand und Schriftgröße schaut. Set bekommt jetzt grünen Grund **und** eine grüne Kante – es ist das Seltenste im Spiel (fällt nie zufällig, nur beim Boss seiner Krypta). `tests/ui.cjs` setzt jetzt je eine Zelle pro Eintrag in `RARITIES` in den Beutel und liest die **gerenderte Farbe**: alles außer `normal` muss getönt sein. **Eine neue Seltenheit ohne CSS-Regel fällt damit sofort auf** (gegen den alten Stand schlägt die Prüfung auf allen vier Geräten an). **Einzigartige haben jetzt ebenfalls eine eigene Zellfarbe** (orange, `.uq`) – auf Nachfrage vom Besitzer bestätigt. Sie tragen die Seltenheit `legendary` und sahen im Raster deshalb aus wie jedes andere gelbbraune Teil; ihr Orange stand nur im Namen, also erst **nach** dem Antippen. `rarCls(it)` in ui.js hängt `uq` an die Seltenheitsklasse und wird an **allen** Feldern benutzt (Beutel, Lager, Laden, Körper, Schmiede, Fusion, Vargos Ware, Abgrund-Sack) – **ein Helfer statt acht Fundstellen**, sonst färbt die nächste neue Ansicht wieder nicht mit. An den **Text** kommt `uq` nie, dort trägt `.uniq-txt` das Orange schon. Der Test vergleicht zusätzlich eine `uq`-Zelle gegen eine schlichte legendäre: sie dürfen nicht gleich aussehen.
- Treffer-Feedback: Schadenszahl + kurzer Rand-Schatten/Wackeln, Portrait nie einfärben.
- Gesperrtes klein halten (Orte als Zeile, Krypten kompakt). Schrift nie unter 11 px: kleine Größen im CSS als `max(11px, …rem)` schreiben; `tests/ui.cjs` misst auf jedem Bildschirm die kleinste sichtbare Schrift. Passt ein Wort dann nicht, kürzen (`short5()`), nicht verkleinern.
