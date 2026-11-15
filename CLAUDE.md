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
- Loot-Farben (D2-Konvention): grau=zerbrochen, weiß=gewöhnlich, #6969ff=magisch, #ffff64=selten, #c7b377=legendär, #00c400=Set.
- Portraits liegen in `assets/portraits/` (sorceress, assassin, barbarian, paladin, huntress, witch). Keine generierten Ersatzbilder ohne Absprache.

## Architektur
- Vanilla JS, **ES-Module**, kein Build-Step. Start: `python3 -m http.server` → http://localhost:8000
- `js/data.js`    – reine Daten (Klassen, Monster, Item-Basen, Affixe). Keine Logik.
- `js/rng.js`     – Zufall (seedbar), `pick`, `roll`, `chance`.
- `js/state.js`   – Spielstand, Save/Load (localStorage, Key `aschenkrone_v1`, Version 7), Raster-Inventar, Händler-Treue, Streifzüge, abgeleitete Werte (`stats()`).
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
- **Große Bildschirme** (≥ 760 px Höhe, z. B. großes iPhone als App 430×867): eigener `@media (min-height: 760px)`-Block am Ende von style.css – größere Schrift (`html` 2,1vh), Knöpfe ≥ 42 px, Ware 3×2, große Zauber-/Crafting-Knöpfe. Tests laufen zusätzlich auf „App 430x867“.
- **Kein Scrollen**: App-Layout = HUD oben, `<main>` (overflow hidden), Tabs unten. `#app` ist `position: fixed; inset: 0` – **nicht** 100dvh/100vh; als Homescreen-App setzt `fitApp()` in main.js die Höhe auf `screen.height` (iOS meldet den Viewport dort zu kurz, unten blieb ~100 pt frei). Jede Ansicht muss auf iPhone SE (375×667) und iPhone 13 passen – mit Playwright prüfen (Elemente unter main-Unterkante zählen). Nur das Kampflog darf intern scrollen. Karten (Orte, Krypten) dürfen nichts abschneiden – ui.cjs prüft das.
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
- **Steckbriefe** (`BOUNTIES`, `bounties()`/`bountyEvent()`/`claimBounty()` in state.js): täglich 3, deterministisch. Endspiel-Beschäftigung.
- **Gold-Senken**: Glücksgriff (`gamble` bei Ysolde), Eilen kostet `rushCost()` (Restzeit × Stufe).
- **Kurven** in `CFG` (xpBase/xpExp, hpBase/hpPerLvl, mainDiv, affix*, rareMinLvl/legendaryMinLvl, bossHp/bossDiff). Änderungen immer mit `tests/personas.mjs` prüfen.
- **Kampfkraft** (`power()`, `powerWith(item)`, `powerAttr(k)` in state.js): eine Zahl, deterministisch gegen Gegner eigener Stufe. Grundlage für Item-Vergleich (Tooltip-Box, grünes ▲ an Beutel/Laden, Toast nach Anlegen) und „+N“ an den Attribut-Knöpfen. Neue Effekte dort mit einrechnen.
- **Zauber** (`SPELLS` in data.js, `spell()` in combat.js): 3 je Klasse (Stufe 1/8/18), Symbole `assets/spells/<id>.webp` (aus 2 KI-Sheets, Prompt in assets/reference/spell_prompt.md), wirken automatisch jeden n-ten eigenen Zug statt eines Hiebs. Stärke × Zauberkraft (`amp` = 1 + Int/(Int+spellK)) → Intelligenz lohnt für alle. Ausgleich über `CFG.monHp/monDmg`.
- **Zauber im Kampf**: laden pro Zug (`ch`, +`haste` = Zaubertempo, Affix `haste` in %), Log trägt Ladestand `cA/cB` → Leiste `.sbar` unter dem Lebensbalken; `spellFx()` in main.js: Geschoss (`.proj`) + Einschlag (`.burst`) in Zauberfarbe `fx`. Zauber-Schritte laufen langsamer (750 ms).
- **Schmiede** (Wartezeit-Beschäftigung, Knopf „Schmiede“ bei Halvar; kein Extra-Knopf im Warte-Bildschirm): `RUNES`/`FORGE` in data.js, `forge(slot, mat, score)` in state.js (Rune → `it.runes` + `it.mods`, max. `FORGE.maxRunes` je Teil). Minispiel in main.js (`startForge`/`forgeHit`, rAF-Schleife, nur DOM-Patch). Bilder `assets/forge/` (scene.jpg: Eisen liegt bei left 14,6 %/width 71 %/top ~46 % → `.iron`; `<mat>.webp` Material-Symbole, auch im Beutel; `r_<mat>.webp` Runensteine), Prompt in assets/reference/forge_prompt.md. Kostet Material, keine Glut. Vorbild-Gedanke (GameGene): Berry Bury Berry – im Warte-/Idle-Kreislauf eine Handlung selbst ausführen lassen.
- **Beute-Tiefe** (Schritt 1 von 4, siehe DESIGN.md „Crafting & Handel“): Boni haben Stufen `TIERS` (I beste, I erst ab Gegenstandsstufe 20; `it.tiers`), seltene Sonderboni `SPECIALS` (`it.fx` + `it.special`, ab Gegenstandsstufe 8), 14 Einzigartige `UNIQUES` (`it.unique`, feste Boni + `fx` + `lore`). `effects()` summiert `fx` angelegter Items. Neue Kampf-Schlüssel: `echo` (Zauber wirkt nochmal), `ward` (Schild bei Kampfbeginn). Wert über `itemValue()`.
- **Kampf-Boni auf Items** (`AFFIXES` mit `pct`/`slots`/`kind` in data.js): Krit-Chance `critc`, Krit-Schaden `critd` (Multiplikator 2 + x, max. `CAPS.critMult`), Schaden % `dmgp`, Zauberschaden `spellp`, Rüstung ignorieren `penp`, Lebensraub `leechp`, Leben % `lifep`, Blocken `blockp`, Ausweichen `evadep`, Dornen `thornsp`, Zauber-Boni `sk_<zauber>` (nur Waffe der Klasse, `boost` am Zauber). Welche Boni ein Teil tragen kann: `affixPool(it)` in loot.js – gilt für Beute, Umschmieden und Neu weihen. Prozent-Boni wachsen flacher (`CFG.pctBase/pctPerLvl`). Obergrenzen `CAPS` kürzen nie Klassen-/Talentwerte (`cap()` in stats). **Eichung:** `node tests/calib.mjs` zeigt je Bonus Stufe III ÷ Hauptattribut (Verteidigung ÷ Konstitution); Ziel ~0,85–1,2, Test prüft Stufe 20. Neue Boni immer damit eichen und in `power()` einrechnen.
- **Zauber-Wege** (`SPELL_TREE`, `TREE_LVL` in data.js; `chooseWay`/`wayOpen`/`wayCost`/`waysPending` + `withWays()` in state.js; `S.sp = { zauberId: [i0, i1, i2] }`, Save v7): je Zauber 3 Stufen (ab Charakterstufe 6/14/22), je Stufe 1 von 2 Wegen. Erste Wahl gratis, Wechsel kostet `wayCostPerLvl` × Stufe. Wege sind Bausteine `m` (Liste oben in SPELL_TREE: open, every, mult, burn, vuln, weaken, dazedCrit, noheal, cleanse, stunImmune, detonate …) und wirken in combat.js (`ways()`, `stun()`, Zustände laufen im eigenen Zug ab). Boss-Antworten (Reinigen/Bannen/Unbeugsam) sind gegen ihren Boss sehr stark, sonst normal. Ansicht: Zauber → Zauber antippen → `viewWays`. Kampf zeigt `combo`/`status`/Brand als Einblendung. **Balance:** `node tests/ways.mjs [klasse] [stufe] [kämpfe]` misst jeden Weg in echten Kämpfen (Δ Siegchance bei ~50 %, auch gegen Bosse); Ziel ~+5…+12 Punkte, `--check` (in run.sh) schlägt außerhalb −4…+20 Alarm. power() schätzt die Wege mit ein.
- **Umschmieden** (Schritt 2; Schmiede → Reiter „Umschmieden“): `CRAFT` in data.js; `craft(id, op, stat)`, `craftCheck`, `baseMods` (Boni ohne Runen) in state.js. Ops: seal (Kultistensiegel, 1 je Item), chaos (Höllenasche), values (Knochenstaub), add (Blutstein), remove (Grableinen). Jeder Eingriff kostet Schmiedeglut (`it.glut/glutMax`, +0..2 Zufall); reicht der Rest für nichts mehr → `it.crafted` = Name des Schmieds. Runen, Sonderbonus, Einzigartige bleiben unberührt. Gold = a + Stufe×b + Wert×0,6 → Craften+Verkaufen bringt nie Gold (Test).
- **Siegel gegen Bearbeiten**: `save()` schreibt Prüfsumme (`aschenkrone_v1_sig`); passt sie beim Laden nicht → `S.tampered` (bleibt für immer, Handel später gesperrt). Tests, die localStorage ändern, erzeugen das absichtlich.
- **Treffer-Wirkungen** (combat.js): `finish()` (Henker, Krit) und `onHit()` (Lebensraub, Bluten, Gift, Glocke, Dornen) gelten für Hieb **und** Zauber. Neue passive Effekte dort eintragen → wirken automatisch auf beides. Zauber sind nur nicht blockbar.
- **Klassenwaffe**: fremde Waffenart → Schaden ×`offWeapon`, Zauberkraft ×`offWeaponSpell` (Tooltip sagt es, Kampfkraft rechnet es ein).
- **Attribute** haben für jede Klasse einen Zweck (`ATTR_INFO`): Stärke → Rüstung (`strArmor`), Int → Zauber, Haupt → Schaden.
- **Kampfbewertung** (`GRADES`, `gradeOf()` in game.js): Restleben → Überlegen/Sicher/Knapp, Bonus auf Gold + Beute-Chance (nicht EP, sonst kippt das Tempo).
- **Kampf-Einblendungen** (`combatFx()` in main.js): Log-Einträge tragen Anzeige-Felder aus combat.js (`dmg`, `crit`, `hits` bei Mehrfachtreffern, `heal` = Lebensraub/Regeneration/Heilzauber, `shield`, `buff`, `tick`+`tk` Gift/Bluten, `dot`, `thorns`, `miss`, `stun`, `rage`). Schwebende Zahlen `.fnum` (Zauber in Zauberfarbe, erst beim Einschlag; Krit groß + `.quake`), Heilung grün links am eigenen Bild, beim Sieg Gold-Münze `.goldpop` über dem besiegten Gegner (grau). Neue Kampfeffekte: Feld im Log setzen, dann in `combatFx` anzeigen.
- **Tutorial** (`TUTORIAL`, `tutCheck()` in main.js): ersetzt im HUD die Balken, nie als Overlay über Buttons.

## Tests
- `sh tests/run.sh quick` (~30 s: Logik + Browser-UI) bei kleinen Änderungen (Texte, Farben, Abstände).
- `sh tests/run.sh` (~1:45, alles parallel) vor Pushes mit Logik-/Kampf-/Crafting-/Spielstand-Änderungen.
- Browser-Tests laufen mit `deviceScaleFactor: 1` und den Handys gleichzeitig (3× Auflösung kostete das Vierfache an Zeit).
- `tests/logic.test.mjs` – node:test, Logik & Daten-Konsistenz (Quest-Ziele, Bilder, Migration, Softlocks).
- `tests/personas.mjs [tage]` – Optimist/Realist/Pessimist spielen in echten Sitzungen ohne Schummeln; Auswertung in BOT-REVIEW.md.
- `tests/bot.mjs [klasse] [tage]` – Bot spielt mit simulierter Uhr und zeigt Tempo pro Tag (Stufe, Quests, Splitter, Niederlagen). Für Balance-Fragen benutzen.
- `tests/fuzz.mjs [züge] [läufe]` – tausende zufällige legale Spielzüge, prüft nach JEDEM Zug: kein doppeltes Item, Gold/Glut/EP/Material gültig, Beutel ohne Überlappung, Werte endlich, Siegel/Glut/Runen konsistent, Speichern=Laden.
- `tests/uifuzz.cjs [taps]` – tippt zufällig auf alles in der App (3 iPhones, früh/spät), meldet JS-Fehler, Überstand, „undefined/NaN“ im Text, Sackgassen.
- `tests/ui.cjs` – Playwright auf iPhone SE + 13: alle Ansichten, JS-Fehler, nichts ragt heraus. Screenshots in `tests/out/` (nicht committen).
- Neue Features: Logik in game.js/state.js (DOM-frei), dann Test ergänzen.

## Design-Leitlinien (GameGene-Joseki, angewendet)
- **Kein unfairer Verlust**: Gefahr vor jedem Kampf anzeigen (Streifzug-Karte, Krypta-Ebene), Boss-Besonderheit vorher nennen.
- **Schwierigkeit durch Muster, nicht nur Zahlen**: jeder Boss hat eine eigene Mechanik (`boss.mech`).
- **Zeit des Spielers respektieren**: keine Softlocks (Boss-Ziele zählen rückwirkend), Gegner wachsen nur halb mit (`locLvl`).

## UI-Regeln (aus UX-REVIEW.md)
- Held: Name (und Titel) steht oben in der Kopfzeile, nicht unter dem Portrait. Unter dem Beutel bleibt Platz für spätere Quest-Knöpfe. Kein Tagebuch in der UI (nirgends; `S.journal` wird nur noch gespeichert). Ausrüstung symmetrisch: links Helm/Waffe/Handschuhe/Ring, rechts Amulett/Nebenhand/Stiefel/Ring, unter dem Portrait Brust + Gürtel. Portrait sitzt in `.pfill` (absolut) und richtet sich nach den Spalten – nie umgekehrt.
- Tab-Punkte nur für echte Handlungen (siehe `badge` in navBar), nie als Dauerzustand.
- Treffer-Feedback: Schadenszahl + kurzer Rand-Schatten/Wackeln, Portrait nie einfärben.
- Gesperrtes klein halten (Orte als Zeile, Krypten kompakt). Schrift nie unter ~11px.
