# REVIEW-FABLE – Bestandsaufnahme Aschenkrone

Stand: Branch `claude/determined-mccarthy-vzvwfm`, Commit `a380572`, Save-Version 14.

## Wie geprüft wurde
- `sh tests/run.sh`: **alles grün** (2:40 min). Logik 75/75, Fuzz 9000 Züge ohne Befund, Zauber-Wege und Tränke im Rahmen,
  Abgrund Stufe 10 Ø Boss-Sieg 12 %, UI/Händler/Vorbereitung/UI-Fuzz ohne Fehler.
- Im Browser gespielt (Playwright, iPhone SE 375×667 und App 430×867): neuer Barbar per Tippen durch Akt I,
  danach ein Stufe-26-Stand durch alle Ansichten (Held, Werte, Talente, Zauber-Wege, Händler, Schmiede, Umschmieden,
  Alchemie, Krypta-Vorbereitung, Grube, Abgrund, Expedition, Umherziehen). Keine JS-Fehler.
- Zusätzlich drei eigene Simulationen (Akt I Gebiet für Gebiet, Umherziehen gegen Glut, kleinste Schrift je Ansicht).

Schweregrade: **kritisch** = Spielstand/Spielfluss kaputt · **hoch** = trifft fast jeden Spieler spürbar ·
**mittel** = stört, aber umgehbar · **klein** = Politur.

---

## 1. Bugs & Softlocks

| # | Befund | Stelle | Schwere | Lösung |
|---|---|---|---|---|
| B1 | **Steckbrief „Erreiche Tiefe 2 und kehre heim“ ist unlösbar.** Seit den Akten gibt es weder Spuren noch Tiefe; `bank()` wird nie mehr gerufen. An 3 von 5 Tagen hängt damit ein Zettel, der nie fertig wird. | `js/data.js:361`, `js/state.js:488` | hoch | Durch einen Steckbrief ersetzen, den es gibt (Akt-Boss besiegen). Laufende Tagesliste per Migration erneuern. |
| B2 | **Steckbrief „Siege auf blutiger Spur“** zählt in Wahrheit Elite-Gebiete – der Text nennt eine Mechanik, die es nicht mehr gibt. | `js/data.js:360`, `js/game.js` (`actFight`) | mittel | Text „Besiege Elite-Gegner“, Ereignis in `elite` umbenennen. |
| B3 | **Steckbriefe für Gesperrtes.** „Siege in den Krypten“ erscheint auf Stufe 4, obwohl die erste Krypta erst nach dem Boss von Akt I aufgeht; Tötungsziele werden aus Orten nach *Stufe* gezogen, nicht nach offenem *Akt*. | `js/state.js:488` | hoch | Nur anbieten, was offen ist (Krypta offen? Akt offen?). |
| B4 | **Omen an gesperrtem Ort.** `omen()` wählt aus `LOCATIONS.filter(locOpen)` (Stufe), gespielt wird aber nach Akten. Auf Stufe 3–5 fällt das Omen an jedem zweiten Tag auf die Mühle, die noch zu ist → Prophet-Auftrag „Das erste Omen“ und der letzte Tutorial-Schritt stehen einen Tag still. | `js/state.js:375` | hoch | Omen nur über Orte offener Akte. |
| B5 | **Spielstand kann verloren gehen.** Kennt der Code die Save-Version nicht (alter Code aus dem Offline-Cache trifft neueren Spielstand), liefert `migrate()` `null` → Erstell-Bildschirm → „Erwachen“ überschreibt den Stand ohne Rückfrage. | `js/state.js:66` | hoch | Nicht lesbaren Stand vor dem Überschreiben als Sicherung ablegen (`aschenkrone_v1_bak`). |
| B6 | **Tutorial-Schritt 3 und 4 fallen zusammen.** Bedingung `active` stammt vom alten Streifzug (`S.active`), wird jetzt erst mit dem ersten Sieg wahr – Schritt 4 („tippe auf das leuchtende Gebiet“) sieht niemand. | `js/data.js:338`, `js/main.js:63` | klein | Schritt 3 endet beim Öffnen des Akts (`view:act`). |
| B7 | **Auftragstexte nennen Ebenen**, die es nicht mehr gibt („Drei Ebenen tief“, „Gruft: Ebene 3 0/3“, „(Albtraum)“). Die Ziele funktionieren, sind aber unverständlich. | `js/data.js:248`, `js/quests.js:37`, `js/quests.js:41` | mittel | Texte und Ziel-Beschriftung an Krypta-Stufen anpassen. |

## 2. Balance & Tempo

| # | Befund | Stelle | Schwere | Lösung |
|---|---|---|---|---|
| T1 | **Akt I ist eine Wand.** Simulation (20 Helden je Klasse, kaufen beim Händler): vor dem ersten Elite-Gebiet (Gebiet 4) im Schnitt 6–17 Farm-Kämpfe, vor dem Boss 27–55. Das sind **170–370 Glut** – bei 120 Glut Vorrat und 15 Glut/Std. also **mehrere Wartetage im ersten Akt**. Im Browser-Durchlauf stand der Barbar nach 24 Kämpfen bei 0 % Siegchance. CLAUDE.md nennt als Ziel „Akt I fast ohne Farmen“. | `js/data.js:798`, `js/data.js:800` | **kritisch** | Elite und Boss von Akt I entschärfen (eigene Werte je Akt), Ziel ≤ ~60 Glut. Mit `tests/acts.mjs` belegen und Grenze in den Test aufnehmen. |
| T2 | **Umherziehen übertrifft die Glut.** 2 Std. Umherziehen bringen 2–3× so viel EP und Gold wie die Glut derselben Zeit, bei Material und Zutaten 5–8× (Akt I: 23 Material + 8 Zutaten gegen 4 + 1). Wer die App offen lässt, braucht Glut und Expedition kaum noch. | `js/data.js:829`, `js/game.js:656` | hoch | Ertrag senken (`loot`, `matP`, `herbP`), Ziel: höchstens etwa so viel wie die Glut derselben Zeit. |
| T3 | **Klassen sind ungleich schnell.** `tests/acts.mjs all 6`: Akt I kostet die Assassine 100 Glut, den Barbaren 255; Akt VI den Paladin 2500, die Jägerin 5250. | `js/data.js` (`CLASSES`, `SPELLS`) | mittel | Nach T1 neu messen; dann Jägerin (spät) und Barbar (früh) gezielt anheben. |
| T4 | **Stufenaufstiege beim Umherziehen bleiben stumm** – EP werden sofort gutgeschrieben, aber nichts sagt „Stufe!“. | `js/game.js:660` | klein | Aufstiege mitzählen und in der Bilanz zeigen. |

## 3. UI/UX auf dem Handy

| # | Befund | Stelle | Schwere | Lösung |
|---|---|---|---|---|
| U1 | **Schrift bis 7,5 px auf dem iPhone SE** in der Schmiede: Material-Namen, Kosten der Eingriffe beim Umschmieden, Zähler an den Feldern (7,5–9 px). Dazu Karten-Beschriftung beim Umherziehen 9 px, Händler-Preise und EP-Zeile 9,9 px. Regel ist ≥ 11 px. | `css/style.css:416`, `:424`, `:446`, `:458`, `:795` | hoch | Untergrenze im CSS anheben; UI-Test misst künftig die kleinste Schrift. |
| U2 | **Systemdialoge** (`alert`/`confirm`) für Dienste, Wegwechsel, Läuterung, volle Beutel: weißes iOS-Fenster mitten im dunklen Spiel. | `js/main.js:244` u. a. | mittel | Eigene Meldung/Rückfrage im Tooltip-Rahmen des UI-Kits. |
| U3 | **Verkaufen ohne Sicherung.** Ein Tipp auf den roten Knopf verkauft auch Legendäres und Einzigartiges sofort, kein Rückkauf. | `js/main.js:232` | mittel | Zweiter Tipp bei selten und besser (wie beim Heimrufen). |
| U4 | **Fehlersuch-Fenster im Spiel.** Tipp auf den Heldennamen öffnet ein `alert` mit Bildschirmmaßen. | `js/main.js:425` | klein | In die Einstellungen verlegen. |
| U5 | **„Neu“ neben „Läutern“** in den Werten löscht den Helden – der Knopf sagt das nicht. | `js/ui.js:159` | klein | In die Einstellungen, Beschriftung „Held vernichten“. |

## 4. Verständlichkeit für Neue

| # | Befund | Stelle | Schwere | Lösung |
|---|---|---|---|---|
| V1 | **Gegenstandsnamen mit Schrägstrich:** „Rostige/r Beil“, „Schartige/r Helm“ – das erste Item, das ein neuer Spieler sieht. | `js/state.js:78`, `js/loot.js:81` | mittel | Geschlechtsneutrale Form („Rostiges Beil“ braucht Genus → besser „Beil, rostig“ vermeiden: Genus je Grundgegenstand in `BASES`). |
| V2 | **Wand ohne Rat.** Steht ein Gebiet bei 0 % Siegchance, sagt die Vorbereitung nicht, was hilft (Punkte verteilen, Händler, ein Gebiet darunter farmen). | `js/ui.js` (`prepCore`) | mittel | Eine Hinweiszeile bei < 35 %: die naheliegendste Abhilfe. |
| V3 | **Steckbriefe erklären sich nicht** (siehe B1–B3): drei Zettel, von denen ein Neuling keinen erfüllen kann. | `js/state.js:488` | hoch | Mit B1–B3 erledigt. |

## 5. Diablo-2-Gefühl

| # | Befund | Stelle | Schwere | Lösung |
|---|---|---|---|---|
| D1 | **Kein Beute-Moment.** Ein seltenes oder einzigartiges Fundstück steht als eine Textzeile unter „+26 Gold“. Kein Bild, kein Aufleuchten. | `js/main.js:129`, `js/ui.js:410` | hoch | Fundstück als Kärtchen mit Bild und Name in Seltenheitsfarbe; selten/legendär/einzigartig mit Lichtsäule (nur CSS, keine neuen Bilder). |
| D2 | **Akte haben keine Stimme.** Kein Einleitungstext beim Betreten, kein Satz des Bosses, kein Wort nach seinem Fall. | `js/data.js:799`, `js/ui.js:698` | mittel | Je Akt Einleitung + Boss-Spruch + Nachruf in `ACTS`. |
| D3 | **Tod des Gegners ist unscheinbar** (Bild wird grau). | `css/style.css` (`.fighter.dead`) | klein | Kurzes Zusammensacken + Blutrand aus vorhandenen Effekten. |
| D4 | **Sets (grün) fehlen**, die Farbe ist reserviert. | `DESIGN.md` „Grab-Sets“ | mittel | Neues System → erst Vorschlag + Mockup, dann Freigabe. |
| D5 | Tooltip ist schon nah an D2 (Name in Seltenheitsfarbe, Grundwerte, blaue Boni, „Fremde Waffe“ in Rot). Es fehlt nur die Zeile der Grundart unter dem Eigennamen bei Legendärem („Runenstab“). | `js/ui.js:53` | klein | Grundart in die Unterzeile. |

## 6. Code-Qualität

| # | Befund | Stelle | Schwere | Lösung |
|---|---|---|---|---|
| C1 | **Alte Streifzug-Logik lebt weiter**: `startTrip`, `resolveTrip`, `delve`, `bank`, `tripLoot`, `arenaFight`, `viewTripPick`, `haulRewText`, `haulActions`, Aktionen `trip/tripgo/bank/delve/rush/resolve`, `TRACKS`, `DELVE`. Im Spiel nicht mehr erreichbar, aber von `fuzz.mjs`, `personas.mjs` und 8 Logik-Tests benutzt. | `js/game.js:52`, `js/state.js:248`, `js/ui.js:344`, `js/main.js:97` | mittel | UI-Teile (nicht erreichbar, ungetestet) sofort entfernen. Logik erst, wenn Fuzz/Personas auf Akte umgestellt sind. |
| C2 | **Feste Zahl im Text:** „15 Minuten Pause“ statt `PIT.cdLose`. | `js/main.js:122` | klein | Aus den Daten rechnen. |
| C3 | **Tagebuch wird geschrieben, aber nie gezeigt** (24 Aufrufe von `journal()`). | `js/state.js` | klein | Belassen (billig), bis über eine Chronik entschieden ist. |

---

## Reihenfolge für Phase 2
1. B1–B7 (Steckbriefe, Omen, Sicherung des Spielstands, Tutorial, Auftragstexte) – Save-Version 15.
2. T1 (Akt I), T2 (Umherziehen), danach T3 neu messen.
3. U1 (Schrift), U3–U5, V1, V2.
4. D1 (Beute-Moment), D2 (Akt-Texte), D3, D5. D4 (Sets) nur als Vorschlag mit Mockup.
5. C1 (UI-Teile), C2.

---

# Phase 2 – was erledigt ist

Alle Änderungen liegen auf `claude/determined-mccarthy-vzvwfm`; `sh tests/run.sh` ist nach jedem Schritt grün (zuletzt 84 Logik-Tests).
Save-Version 14 → 16, mit Migration und Tests dafür.

| Befund | Stand | Was getan wurde | Beleg |
|---|---|---|---|
| B1–B3, V3 Steckbriefe | **erledigt** | Unlösbare Zettel ersetzt (Siege in den Akten, überlegen gewinnen, Elite). Angeboten wird nur Erreichbares; alte Zettel werden umgeschrieben. | Logik-Test über 40 Tage |
| B4 Omen | **erledigt** | Omen nur noch an Orten offener Akte (`openLocs()`). | Logik-Test über 40 Tage |
| B5 Spielstand | **erledigt** | Unlesbarer Stand → `aschenkrone_v1_bak`, wird nie überschrieben, kommt zurück, wenn der Stand fehlt. Hinweis auf dem Startbildschirm. | Logik-Test |
| B6 Tutorial | **erledigt** | Schritt 3 endet beim Öffnen des Akts. | – |
| B7 Auftragstexte | **erledigt** | Keine „Ebenen“ mehr; Ziele heißen „Öffne: Gruft (Akt I schaffen)“, „Krypta-Stufe 4“. | Logik-Test über alle Aufträge |
| T1 Akt I | **erledigt** | Akt I: Elite ×0,9, Boss ×0,52 (eigene Werte je Akt). Akt II: Elite milder, die Mühe liegt jetzt beim Boss. | Akt I 25–55 Glut statt 170–370 (20 Helden je Klasse, nur Beute + Händler). `acts.mjs --check` schlägt Alarm über 120 Glut. Bot: Akt VI weiter nach ~7 Tagen bei Stufe 18–19. |
| T2 Umherziehen | **erledigt** | Ein Kampf-Punkt ist 0,75 Glut wert; Material-/Zutaten-Chance gesenkt. | Jagd-Route 1,3× Glut-Ertrag in jedem Akt (vorher 2–3×), ~8 Material oder ~5 Zutaten je 2 Std. (vorher 23 / 8). Logik-Test hält den Rahmen. |
| T3 Klassen | **besser, offen** | Durch T1 rücken die Klassen zusammen: Akt VI kostet 3300–4500 Glut (vorher 2500–5250). | `acts.mjs all 6` |
| T4 Aufstieg beim Umherziehen | **erledigt** | Bilanz zeigt „Stufe N!“. | – |
| U1 Schrift | **erledigt** | Untergrenze 11 px im CSS; Schmiede-Kacheln, Eingriffe und Kartenbeschriftung dafür umgebaut. | `ui.cjs` misst auf 4 Bildschirmen jede Ansicht |
| U3 Verkaufen | **erledigt** | Wertvolles erst beim zweiten Tipp. | – |
| U4, U5 | **erledigt** | Anzeige-Maße und „Held vernichten“ liegen in den Einstellungen. | – |
| V1 Namen | **erledigt** | „Rostiges Beil“, „Starke Kappe“; alte Namen werden gerichtet. | Logik-Test über 400 Items |
| V2 Rat | **erledigt** | Unter 35 % Siegchance steht in der Vorbereitung, was hilft. | Logik-Test |
| D1 Beute-Moment | **erledigt** | Kärtchen mit Bild und Seltenheitsfarbe, Lichtsäule ab selten. Nebenbei: zweites Boss-Teil und „Akt geschafft“ wurden vorher gar nicht angezeigt. | Screenshots |
| D2 Akt-Texte | **erledigt** | Einleitung, Boss-Satz, Nachruf je Akt; drei Sätze je Händler. | Logik-Test |
| D3 Gegner-Tod | **erledigt** | Sackt zusammen, kurzer Blutrand. | – |
| D5 Tooltip | **erledigt** | Grundart in der Unterzeile; Farben auf die D2-Werte gesetzt. | – |
| C1 Alte Streifzug-Oberfläche | **teilweise** | Ansichten und Aktionen entfernt (≈ 60 Zeilen). Die Logik bleibt, weil Fuzz, Personas und 8 Logik-Tests sie benutzen. | – |
| C2 Feste Zahl | **erledigt** | Pause aus `PIT.cdLose`. | – |

## Offen
- **D4 Grab-Sets** – neues System, deshalb nur Vorschlag: `mockups/sets.html` / `mockups/sets.png`. Wartet auf Freigabe.
- **U2 Systemdialoge** (`alert`/`confirm`) – eigener Dialog im UI-Kit-Rahmen; berührt ~15 Stellen, eigener Schritt.
- **T3 Klassen** – Jägerin und Hexe bleiben in den späten Akten die langsamsten (etwa +30 % Glut gegenüber dem Paladin).
- **Akt II** kostet ohne Gratis-Ausrüstung ~350 Glut (ein Tag Warten), Akt III nur ~250 – die Kurve hat dort einen Buckel.
- **C1 Rest** – `tests/fuzz.mjs` und `tests/personas.mjs` auf die Akte umstellen, dann `startTrip`/`resolveTrip`/`delve`/`bank`/`TRACKS`/`DELVE` löschen.
- **C3 Tagebuch** – wird geschrieben, nie gezeigt.
- Akt-Einleitungen stehen nur im Kopf der Akt-Ansicht; ein eigener Moment beim ersten Betreten (Bild + Text) bräuchte Ortsbilder.

## Empfohlene nächste Schritte
1. Am Handy prüfen: neuer Held durch Akt I (sollte in einer Sitzung gehen), Beute-Moment beim Boss, Umherziehen fühlt sich mit dem kleineren Ertrag noch lohnend an?
2. Grab-Sets freigeben oder verwerfen (Mockup).
3. Akt II glätten (Boss ×0,85 wäre der kleinste Eingriff) und danach die Klassen angleichen.
4. Eigener Dialog statt Systemfenster.
5. Fuzz/Personas auf Akte umstellen und die alte Streifzug-Logik löschen.
6. Ortsbilder für die sechs Akte (Prompt-Vorschlag folgt auf Wunsch) – dann lohnt ein Akt-Auftakt mit Bild.

## Nachtrag (Rückmeldung des Besitzers)
- **Erledigt:** Systemdialoge (`alert`/`confirm`, 14 Stellen) durch eigenes Fenster `ask()` und Einblendung `note()` ersetzt; uifuzz meldet jeden Systemdialog.
- **Erledigt:** Schärfen/Verstärken hängen am Platz statt am Teil (Save v17) – Material ist nie verschwendet.
- **Erledigt:** Erster Sieg in einem Akt-Gebiet gibt sicher 2 Material (Elite 3, Boss 4).
- **Erledigt:** Grab-Sets gebaut – 5 Sets à 3 Teile, nur beim Krypta-Boss, 2 Teile Bonus / 3 Teile Regeländerung (`tests/sets.mjs` eicht sie).
- **Erledigt:** 16 neue Einzigartige (jetzt 30), jedes mit Regeländerung oder Tauschgeschäft; 9 neue Kampf-Schlüssel; `tests/uniques.mjs` eicht sie.
- **Als Nächstes:** Akt II glätten (~350 Glut gegen 250 in Akt III) und die Klassen angleichen (Jägerin/Hexe spät ~30 % langsamer).
