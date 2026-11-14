# ASCHENKRONE – Projektgedächtnis

Düsteres Browser-RPG im Stil eines Questing-/Auto-Battler-Spiels (Aufträge, Auto-Kampf, Loot, Händler),
Optik: Diablo 1/2 – dunkel, ernst, handgemalt. Sprache im Spiel: **Deutsch**.

## Stil-Regeln (verbindlich)
- **Kein "AI-Look"**: keine Neon-Gradients, keine Glassmorphism, keine runden Pill-Buttons, keine Emojis in der UI.
- Palette: fast Schwarz (#0b0907), verbranntes Braun, Eisen-Grau, Blutrot (#8a1c13), gedämpftes Gold (#b08a3e).
- Schrift: `Grenze Gotisch` (Titel), `Alegreya` (Text), `Alegreya SC` (Labels/Buttons). Kein Cinzel (wirkt generisch).
- Texturen statt Flächen: Rauschen/Stein (`--noise`, `--stonetex`), Nieten (`--rivets`) auf `.panel`, Quest-Zettel als Pergament (`.note`).
- Items: gemalte Bilder `assets/items/<art>.webp` (aus KI-Sheet geschnitten, Schwarz→transparent), Fallback SVG (`js/art.js`), Größe im Raster w×h wie Diablo. Boss-/Monster-Portraits in `assets/monsters/<glyph>.jpg` (Liste `MON_IMG` in ui.js). NPC-Portraits in `assets/npcs/` (halvar, ysolde, kaspar, vargo, ilse, prophet); Sprecher-Leiste `say(id)` in ui.js mit Sätzen aus `NPCS`.
- Rahmen: harte Kanten, doppelte Eisen-/Steinrahmen, Innenschatten, Vignette. Max. 2px Border-Radius.
- Loot-Farben (D2-Konvention): grau=zerbrochen, weiß=gewöhnlich, #6969ff=magisch, #ffff64=selten, #c7b377=legendär, #00c400=Set.
- Portraits liegen in `assets/portraits/` (sorceress, assassin, barbarian, paladin, huntress, witch). Keine generierten Ersatzbilder ohne Absprache.

## Architektur
- Vanilla JS, **ES-Module**, kein Build-Step. Start: `python3 -m http.server` → http://localhost:8000
- `js/data.js`    – reine Daten (Klassen, Monster, Item-Basen, Affixe). Keine Logik.
- `js/rng.js`     – Zufall (seedbar), `pick`, `roll`, `chance`.
- `js/state.js`   – Spielstand, Save/Load (localStorage, Key `aschenkrone_v1`, Version 5), Raster-Inventar, Händler-Treue, Streifzüge, abgeleitete Werte (`stats()`).
- `js/loot.js`    – Item-Erzeugung (Seltenheit, Affixe, Wert).
- `js/quests.js`  – Questketten aller Questgeber (`GIVERS`: 3 Händler + Vargo, Ilse, Prophet): Ziele, Fortschritt (`event()`), Abgabe (`complete(tid, choice)`). Segen (`rew.perk`) landen als Trophäe in `S.trophies`.
- `js/art.js`     – SVG-Grafiken: Items, leere Slots, NPCs, Monster.
- `js/game.js`    – Spielzüge ohne DOM (`resolveTrip`, `cryptFight`, `arenaFight`, `champFight`, `makeRival`) + Gefahr-Schätzung (`tripChance`, `cryptChance`). main.js zeigt nur an.
- `js/combat.js`  – reine Kampfsimulation: `fight(a, b) -> {winner, log}`. Kein DOM. Effekte generisch (crit, evade, block, leech, bleed, rage, pen, regen, thorns, execute, first, poison, toll).
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
- **Kein Scrollen**: App-Layout = HUD oben, `<main>` (100dvh, overflow hidden), Tabs unten. Jede Ansicht muss auf iPhone SE (375×667) und iPhone 13 passen – mit Playwright prüfen (Elemente unter main-Unterkante zählen). Nur Kampflog darf intern scrollen.
- `manifest.json` + `sw.js` (network-first, damit Updates sofort ankommen). Alle Pfade relativ (Pages-Unterordner!).
- Touch: Item-Tap öffnet Detail-Popup mit Aktionen (`showTouchTip` in main.js), kein Hover/Rechtsklick voraussetzen.

## Progression (siehe DESIGN.md)
- Attribute nur über Punkte (5/Stufe), Talente 1/Stufe (`TALENTS` in data.js), Läuterung kostet Gold.
- Neue Boni immer als Effekt-Schlüssel ausdrücken (`EFFECT_NAMES`) → `effects()` in state.js summiert Klasse+Talente+Trophäen.
- Balance-Änderungen mit Simulation prüfen (viele Builds × viele Kämpfe, nicht ein Wurf).

## Rendering-Regel (gegen Flackern)
- Kein Voll-Render im Sekundentakt: Countdowns als `data-until="<ts>"` markieren → Ticker in main.js ändert nur den Text, bei 0 einmal `render()`.
- Kampf-Animation über `fightStep()` (DOM-Patch), Voll-Render nur am Ende.
- Service Worker: Bilder stale-while-revalidate, Code network-first.

## Systeme (Stand)
- **Omen** (`OMENS`, `omen()` in state.js): täglich ein Ort + Effekt, deterministisch aus dem Datum. Erst ab Stufe 3 aktiv. Erster Sieg dort = erfüllt (`S.omens`).
- **Dienste** (`SERVICES`): Schärfen (Halvar, Waffe), Verstärken (Kaspar, Brust), Neu weihen (Ysolde, Amulett), Bestellen (Halvar). Materialien haben damit einen festen Zweck.
- **Glockensplitter**: erster Bosssieg in Krypta 1–4 → `S.shards`. 4 Splitter öffnen Krypta 5 „Die Glocke“, Boss „Der Kronenlose“ = eigenes Portrait (`glyph: 'self'`).
- **Finale**: Prophet-Quest p5 hat `choice` → Titel (`S.title`) + Segen.
- **Spuren & Tiefe** (`TRACKS`, `DELVE`; `resolveTrip`/`delve`/`bank` in game.js): Beute landet erst in `S.haul`, Heimkehren sichert. Save-Version 5.
- **Tutorial** (`TUTORIAL`, `tutCheck()` in main.js): ersetzt im HUD die Balken, nie als Overlay über Buttons.

## Tests (vor jedem Push: `sh tests/run.sh`)
- `tests/logic.test.mjs` – node:test, Logik & Daten-Konsistenz (Quest-Ziele, Bilder, Migration, Softlocks).
- `tests/bot.mjs [klasse] [tage]` – Bot spielt mit simulierter Uhr und zeigt Tempo pro Tag (Stufe, Quests, Splitter, Niederlagen). Für Balance-Fragen benutzen.
- `tests/ui.cjs` – Playwright auf iPhone SE + 13: alle Ansichten, JS-Fehler, nichts ragt heraus. Screenshots in `tests/out/` (nicht committen).
- Neue Features: Logik in game.js/state.js (DOM-frei), dann Test ergänzen.

## Design-Leitlinien (GameGene-Joseki, angewendet)
- **Kein unfairer Verlust**: Gefahr vor jedem Kampf anzeigen (Streifzug-Karte, Krypta-Ebene), Boss-Besonderheit vorher nennen.
- **Schwierigkeit durch Muster, nicht nur Zahlen**: jeder Boss hat eine eigene Mechanik (`boss.mech`).
- **Zeit des Spielers respektieren**: keine Softlocks (Boss-Ziele zählen rückwirkend), Gegner wachsen nur halb mit (`locLvl`).

## UI-Regeln (aus UX-REVIEW.md)
- Tab-Punkte nur für echte Handlungen (siehe `badge` in navBar), nie als Dauerzustand.
- Treffer-Feedback: Schadenszahl + kurzer Rand-Schatten/Wackeln, Portrait nie einfärben.
- Gesperrtes klein halten (Orte als Zeile, Krypten kompakt). Schrift nie unter ~11px.
