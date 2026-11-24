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
  `sh tests/run.sh logic ui`). Vor dem Push **einmal** der passende Lauf (siehe Tests).
- **Screenshots nur von der geänderten Ansicht, ein Gerät**, außer es geht ums Layout auf allen.
- Keine Unteragenten für Suchen, die ein `grep` erledigt.

## Arbeitsweise (Ansage des Besitzers)
- **Nichts bauen ohne seine Erlaubnis.** Vorher sagen: was genau gebaut wird, was nicht angefasst
  wird, **wie und wie oft getestet** wird (welcher Test, welche Geräte, wie viele Läufe/Kämpfe, ob
  gegengetestet), und was sich nicht beweisen lässt. Dann auf sein „ja" warten.
- Lesen und Messen ist immer erlaubt – daraus Befund und Vorschlag vorlegen. Bei einem Fehlerbericht:
  Ursache suchen, nicht sofort reparieren. Was er knapp meldet, ist fast immer ein echter Fehler,
  auch wenn er sich nicht gleich nachstellen lässt.
- Bei großen Änderungen am Spielgefühl erst Vorschlag + Mockup (`mockups/*.html`, Screenshot).
- Nach jedem größeren Schritt eine kurze Zusammenfassung. Antworten an den Besitzer auf **Deutsch**.
- Keine neuen KI-Bilder/Sounds, keine bezahlten Dienste ohne Rückfrage. Fehlt ein Bild: **Prompt
  vorschlagen**, nicht selbst erzeugen.
- Kleine, thematische Commits mit deutscher Beschreibung, häufig pushen auf **genau den Arbeits-Branch**.
  Keine Pull Requests, kein force-push, kein anderer Branch.
- **Vor dem Push grün – mit dem passenden Lauf** (Abschnitt Tests). Neue Features bekommen Tests.

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
- **Ein Hinweis, der lügt, ist schlimmer als keiner.**
- **Eine Beschränkung, die stillschweigend überschreibt, ist ein Fehlerbericht in Wartestellung.**
- **Über zwei Tipps hinweg darf Zustand nur im DOM stehen**, nie in einer Variablen, die `hideTip()`
  löscht – das gilt für die Aktion **und** für das, was gezeichnet wird.
- **Alles Nachschlagbare ableiten, nie abtippen** – ein handgeschriebener Ort lügt beim ersten Umzug.
- **Ein neuer Effekt muss in `power()` und in die Liste des Eich-Tests** (`tests/calib.mjs`, Ziel
  ~0,85–1,2), sonst ist er unbewacht.

## Stil-Regeln (verbindlich)
- **Kein „AI-Look"**: keine Neon-Gradients, kein Glassmorphism, keine runden Pill-Buttons, keine Emojis.
- Palette: fast Schwarz (#0b0907), verbranntes Braun, Eisen-Grau, Blutrot (#8a1c13), gedämpftes Gold (#b08a3e).
- Schrift: `Grenze Gotisch` (Titel), `Alegreya` (Text), `Alegreya SC` (Labels/Buttons). Kein Cinzel.
- Texturen statt Flächen (`--noise`, `--stonetex`, `--rivets`), Quest-Zettel als Pergament (`.note`).
- Rahmen: harte Kanten, doppelte Eisen-/Steinrahmen, Innenschatten, Vignette. Max. 2 px Border-Radius.
- **Neue Rahmen nur aus dem UI-Kit** `assets/ui/` (9-Slice am Ende von style.css), keine neuen CSS-Verläufe.
- Loot-Farben (D2): grau=zerbrochen, weiß=gewöhnlich, #6969ff=magisch, #ffff64=selten,
  #c7b377=legendär, #00c400=Set (`--r-*`); Einzigartiges zusätzlich orange (`.uniq-txt`, Zelle `.uq`).
- **Keine generierten Ersatzbilder ohne Absprache.** Pfade und Item-Namen (`GENUS`): `SYSTEME.md`.

## Architektur
- Vanilla JS, **ES-Module**, kein Build-Step. Start: `python3 -m http.server` → http://localhost:8000
- Logik DOM-frei: `data.js` (nur Daten), `rng.js`, `state.js` (Spielstand, `stats()`, `power()`),
  `loot.js`, `quests.js`, `game.js` (Spielzüge), `combat.js` (`fight(a,b)`), `wiki.js`.
  Anzeige: `ui.js` (Templates, Tooltips), `main.js` (Navigation, `data-action`), `art.js` (SVG).
- Save: localStorage `aschenkrone_v1`, **Version 22** (Neustart: ältere Stände → `_bak`, kein Umrechnen); Unlesbares → `aschenkrone_v1_bak`, nie überschrieben.
- **Wählbar nur `PLAYABLE`** (Zauberin, Assassine, Barbar); die anderen Klassen bleiben als Daten.
- Wo was steht: `sh tests/karte.sh <datei>`.

## Konventionen
- Logik-Module sind DOM-frei und rein → mit `node` testbar.
- Zahlen/Balancing nur in `data.js`, nicht in der Logik verstreuen.
- Neue Features: erst Daten, dann Logik, dann UI. Kleine Commits.
- Save-Format ändern ⇒ `SAVE_VERSION` erhöhen + Migration.
- Neue Boni als Effekt-Schlüssel (`EFFECT_NAMES`) → `effects()` summiert Klasse+Talente+Trophäen.
- Neue Treffer-Wirkungen in `finish()`/`onHit()` in combat.js → wirken auf Hieb **und** Zauber.

## Mobile / PWA
- Primär am Handy als Homescreen-App: https://sayfababa.github.io/Shakes/ (Pages vom Arbeits-Branch).
- **Maßstab: ein Gerät, iPhone 13 als App, 390×844** (Ansage des Besitzers, 2026-11-19). Schmalstes
  Gerät im großen Layout (≥ 760 px), dort wird es eng. **Browser/Safari (< 760 px) wird bewusst nicht
  mehr geprüft** („im Browser ist es eh zu klein"). Größe in `ctxFor()`, Händler/Vorbereitung in `SCR`.
- **Kein Scrollen**: HUD oben, `<main>` (overflow hidden), Tabs unten. `#app` ist `position: fixed;
  inset: 0` – **nicht** 100dvh/100vh; als App setzt `fitApp()` die Höhe auf `screen.height`.
  Ausnahmen, die scrollen dürfen: Kampflog, Werte-Ansicht (`.vscroll`), `.wlist`.
- **Große Bildschirme** (≥ 760 px Höhe): eigener Block – **dort wird es eng**, beim Hinzufügen nachmessen.
- Schrift nie unter 11 px: kleine Größen als `max(11px, …rem)`. Passt ein Wort nicht, kürzen
  (`short5()`), nicht verkleinern.
- `manifest.json` + `sw.js` (network-first). **Alle Pfade relativ** (Pages-Unterordner).
- Touch: kein Hover/Rechtsklick voraussetzen (Item-Tap → `showTouchTip`).
- **Eigene Fenster statt Systemdialoge**: `ask(text, knopf, fn, rot)`, `note(text)`. Nie `alert`/`confirm`.

## Rendering-Regel (gegen Flackern)
- Kein Voll-Render im Sekundentakt: Countdowns als `data-until="<ts>"` → Ticker ändert nur den Text.
- Kampf-Animation über `fightStep()` (DOM-Patch), Voll-Render nur am Ende.
- Service Worker: Bilder stale-while-revalidate, Code network-first.

## Systeme
Die Blöcke je System (wo der Code liegt, harte Grenzen) stehen in **`SYSTEME.md`** – sie sind Regel.
**Vor dem Anfassen eines Systems dessen Block dort lesen**, nicht die ganze Datei.

## Tests
**Welcher Lauf vor dem Push** (Ansage des Besitzers – nicht mehr „vor jedem Push alles"):
- **Nur Aussehen** (CSS, Bilder/Sprites, Texte, Anordnung im HTML): `sh tests/run.sh quick` (~1:20,
  Logik + UI auf dem iPhone 13 + Händler + Vorbereitung) **plus Screenshot der geänderten Ansicht**.
- **Logik oder Zahlen** (`js/` über reine Texte hinaus, `data.js`): voller `sh tests/run.sh` (~2:45).
- **Unsicher:** voll.
- Einzelne Teile während der Arbeit: `sh tests/run.sh <name> …`
  (logic bot fuzz ways potions descent lohn acts sets uniques kern tree caps ui trader prep uifuzz).
- Was jeder Test prüft (logic, fuzz, ui, uifuzz, trader, prep, Balance, bot, personas): **`SYSTEME.md`**,
  Abschnitt „Tests im Einzelnen". Browser-Tests: `deviceScaleFactor: 1`.
- Neue Features: Logik in game.js/state.js (DOM-frei), dann Test ergänzen.

## Navigation
- Untere Leiste: **6 Tabs** Held · Händler · Schmiede · Alchemie · Streifzug · Krypta (`navBar`, Reihenfolge vom Besitzer 2026-11-24).
- Im Krypta-Tab oben Reiter **Krypten | Abgrund | Grube** (`cryptTabs(on)`).
- Schmiede/Alchemie zusätzlich über Halvar/Ysolde (dann mit „Zurück").
- **Fenster mit mehreren Türen merken sich die Tür**: `pitBack`, `titleBack`, `alchBack`.

## UI-Regeln
- **Jede Seltenheit muss man im Beutel sehen, ohne etwas anzutippen.** `rarCls(it)` ist **ein**
  Helfer für **alle** Felder – Beutel, Lager, Laden, Körper, Schmiede, Fusion, Vargo, Abgrund-Sack. → E
- Tab-Punkte nur für echte Handlungen. **Rot** = abholbar, **grün** (`readyDots()`) = Wartezeit
  abgelaufen; verschwindet beim Hinschauen. Rot geht vor Grün.
- Treffer-Feedback: Schadenszahl + kurzer Rand-Schatten/Wackeln, **Portrait nie einfärben**.
- Gesperrtes klein halten (Orte als Zeile, Krypten kompakt).

## Design-Leitlinien (GameGene-Joseki, angewendet)
- **Kein unfairer Verlust**: Gefahr vor jedem Kampf anzeigen, Boss-Besonderheit vorher nennen.
- **Schwierigkeit durch Muster, nicht nur Zahlen**: jeder Boss hat eine eigene Mechanik (`boss.mech`).
- **Zeit des Spielers respektieren**: keine Softlocks (Boss-Ziele zählen rückwirkend).
