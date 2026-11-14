# ASCHENKRONE – Projektgedächtnis

Düsteres Browser-RPG im Stil eines Questing-/Auto-Battler-Spiels (Aufträge, Auto-Kampf, Loot, Händler),
Optik: Diablo 1/2 – dunkel, ernst, handgemalt. Sprache im Spiel: **Deutsch**.

## Stil-Regeln (verbindlich)
- **Kein "AI-Look"**: keine Neon-Gradients, keine Glassmorphism, keine runden Pill-Buttons, keine Emojis in der UI.
- Palette: fast Schwarz (#0b0907), verbranntes Braun, Eisen-Grau, Blutrot (#8a1c13), gedämpftes Gold (#b08a3e).
- Schrift: `Cinzel` (Titel), `IM Fell English` (Fließtext) – via Google Fonts.
- Rahmen: harte Kanten, doppelte Eisen-/Steinrahmen, Innenschatten, Vignette. Max. 2px Border-Radius.
- Loot-Farben (D2-Konvention): grau=zerbrochen, weiß=gewöhnlich, #6969ff=magisch, #ffff64=selten, #c7b377=legendär, #00c400=Set.
- Portraits liegen in `assets/portraits/` (sorceress, assassin, barbarian, paladin, huntress, witch). Keine generierten Ersatzbilder ohne Absprache.

## Architektur
- Vanilla JS, **ES-Module**, kein Build-Step. Start: `python3 -m http.server` → http://localhost:8000
- `js/data.js`    – reine Daten (Klassen, Monster, Item-Basen, Affixe). Keine Logik.
- `js/rng.js`     – Zufall (seedbar), `pick`, `roll`, `chance`.
- `js/state.js`   – Spielstand, Save/Load (localStorage, Key `aschenkrone_v1`), abgeleitete Werte (`stats()`).
- `js/loot.js`    – Item-Erzeugung (Seltenheit, Affixe, Wert).
- `js/combat.js`  – reine Kampfsimulation: `fight(a, b) -> {winner, log}`. Kein DOM. Effekte generisch (crit, evade, block, leech, bleed, rage, pen, regen, thorns, execute, first).
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
