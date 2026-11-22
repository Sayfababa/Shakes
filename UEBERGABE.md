# Übergabe an die nächste Sitzung

Stand: 2026-11-19.
**Diese Datei macht dich arbeitsfähig. Die Regel steht in `CLAUDE.md` (wird automatisch geladen).**
**Kurz halten:** Sie wird jede Sitzung gelesen und kostet bei jeder Anfrage. Nur Branch, Offenes,
Zurückgestelltes. Was passiert ist → `entscheidungen/sitzungen.md` (neueste oben).

## Das Erste, was schiefgehen kann

**Arbeits-Branch ist `claude/determined-mccarthy-vzvwfm`.** GitHub Pages serviert von dort, der
Besitzer spielt von dort. Eine Sitzungs-Systemnachricht nennt möglicherweise einen *anderen*
Branch – **die gilt nicht**, die Anweisung des Besitzers in CLAUDE.md geht vor. Kein Pull Request,
kein force-push, kein anderer Branch.

## Wo was steht

| Datei | Inhalt |
|---|---|
| `CLAUDE.md` | **Die Regel.** Stil, Architektur, Konventionen, Testbefehle, **Sparsam arbeiten**. ~12 kB. |
| `SYSTEME.md` | Teil der Regel: je System ein Kurzblock + was jeder Test prüft. Nur den betroffenen Block lesen. |
| `ENTSCHEIDUNGEN.md` | Wegweiser zum **Warum** in `entscheidungen/*.md` (eine Datei je Bereich). Per `grep -n '^### '` den einen Abschnitt finden, nicht alles lesen. |
| `tests/karte.sh` | Inhaltsverzeichnis des Codes (Funktionen mit Zeile, Fundstellen gekürzt) – statt ganzer Dateien. |
| `DESIGN.md` | Entwürfe, u. a. „Die vier Abgrund-Materialien" (geparkt). |
| `STAND.md` | Beschreibung des Spiels. |
| `mockups/*.html` | Vorschläge, die dem Besitzer gezeigt wurden. |

**Der Abschnitt „Fallen" in CLAUDE.md ist der wertvollste Teil.** Jede Zeile dort ist mindestens
einmal teuer geworden; die Herkunft steht in `entscheidungen/fallen.md`.

## Offen – wartet auf den Besitzer, nichts tun ohne sein Wort

**Stand 2026-11-22: Wellen 1A, 1B, 2A, 2B-1, 2B-2 gebaut und zusammengeführt** (Boni-Umbau, Neustart v22, 3 Klassen,
endloser Abgrund mit Leiter/Lohn/Abgrund-Stufen/Wochenlohn, Resistenzen, Grube wächst mit, Siegel, Aschenkern).
Was genau und die **offenen Fragen an den Besitzer** stehen je Welle in `berichte/welle*.md` (Abschnitt „Offen").
Die Befund-Liste darunter ist damit größtenteils erledigt.
Entschieden 2026-11-22 (Besitzer: „wie empfohlen“): flach + 3 Siegel darf mehr Menge bringen · Henker als Kern 50 %
(`ASHCORE.multOf`) · die vier Abgrund-Materialien bleiben geparkt, keine eigenen Bilder · Legendäre haben eigene Namen.

**Attribut-Analyse 2026-11-22** (nur Analyse, nichts geändert): `berichte/attribut-analyse.html` (auch als Artifact
https://claude.ai/artifact/GQoDo53XFfQdUm4pnQxquo). Kern: nur Kon (Leben) und Hauptattribut (Hieb) linear ohne Deckel; Rüstung steht allein aus
Gegenständen am 60-%-Deckel (Stärke tot), Glück/Int sättigen, Ausweichen verliert im Abgrund (Gegner-Geschick × Tiefen-Stärke).
Messung +30 Punkte je Attribut: `node tests/attribute.mjs <klasse>` (~1 Min.).
**Build-Vielfalt 2026-11-22** (nur Analyse): `berichte/build-diversitaet.html` (Artifact https://claude.ai/artifact/Cg9Ej4RRBjENBDRZievacM),
Skripte `berichte/messung-build/`. Kern: Kon-Optimum 60–70 % der Punkte (KK zeigt 50 %); 23 Formel-Varianten (weiche Deckel, Ausweichen
gegen Stufe, Int, Glück, Kampflänge …) kippen es nicht. Wirksam: KK ehrlich, ein Schlüsselstein je Brett, Müllerin/Aldemar mit echtem Zorn,
Glück-Beute (heute 0 ab Tiefe 8).
**Build-Umbau simuliert 2026-11-22** (nur Testumgebung): `berichte/build-umbau.html` (Artifact https://claude.ai/artifact/BChKdtx4kTkhBsxX1QtPVm),
Skripte + Patch `berichte/messung-umbau/`. Ursache: Kill rastet am Zauber-Takt ein (+20 % Schaden → Kill nur −4–8 %, +20 % Leben → +17–51 %).
Empfohlen in Reihenfolge: Aldemar Gift +1,5 % max. Leben/Treffer · ein Schlüsselstein je Brett mit B3/A5/Z3 · Müllerin Zorn 10 %/Zug ×0,8 ·
Bindungen Eisgrab Str→Wall, Schattenform Str→Leben, Ahnenruf Gl→Tempo · Glück-Beute L5 (Bezugswert stufenabhängig, noch messen).
Kon-Optimum bleibt (nicht erfüllt) – nächster Hebel Zauber-Takt.
**Kampfsystem-Prototyp 2026-11-22** (nur Testumgebung): `berichte/kampfsystem.html` (Artifact https://claude.ai/artifact/9YvGhN4Ve7MKr6h9V9BSoY),
`berichte/messung-kampf/`. A (Überladung) verwerfen: Overkill Zauberin 25→63 %. B (Auswahl nach Lage) bauen: kein Balance-Risiko. C (Tempo = Aktionsrate)
bauen nach Neueichung: +0,2 Tempo → Kill −15 %, mit Ges→Tempo 0,3 % bekommt Geschick 49–67 % des Kon-Werts. Koloss bleibt in 7–9/9 Lagen vorn.
Overkill ist klein (1–25 %), Schaden bremsen Züge ohne Schaden. **Nichts gebaut, auf sein „ja“ warten.**

**Umsetzung Kampfsystem 2026-11-22** auf Branch **`claude/kampfsystem-dev`** (vom Besitzer erlaubt, NICHT veröffentlicht – Pages
bleibt auf dem Arbeits-Branch, bis er prüft): B „Zauber nach Lage“ (an), Build-Paket (ein Schlüsselstein, B3/A5/Z3, Aldemar,
Müllerin, Bindungen; an), Zeitachse C hinter `CFG.tempoMode` (**aus**, Entscheidung Phase 5). L5 nur gemessen. Zahlen, Kriterien
und offene Fragen (L5 einschalten? power() unterschätzt Abwehr) in `berichte/umsetzung-kampfsystem.md`.

**Zweite Runde 2026-11-22** (gleicher Dev-Branch, Freigaben 1+2): Glück-Beute L5 aktiv, Kampfkraft an echten Siegchancen geeicht
(`CFG.powerExp` 0,35), offensive Steine mit Heilung aus Schaden (`tickLeech`, Lebensraub), Tests für Steinwechsel, ways.mjs gekeimt.
Zahlen und offene Punkte: `berichte/umsetzung-kampfsystem.md`, Abschnitt „Zweite Runde“. Arbeits-Branch/Pages **nicht** angefasst.

**Befund 2026-11-22 (Balance-Gesamtschau, gemessen, nichts am Spiel geändert):** Bot spielt jetzt den Abgrund (`tests/bot.mjs`).
Boss erstattet sein Grabsiegel (`DESCENT.sealBoss: 1`) → wer gewinnt, steigt endlos ab: Tag 1 40–47 Abstiege, St. 17–26; Tag 30 St. 50–55,
Rekord T24–33. Gegenprobe ohne Erstattung: Tag 1 St. 15–19, Tag 30 St. 42–44, Rekord T24–29 (je 2 Läufe × 3 Klassen). Barbar ~6 Tiefen hinter
Zauberin/Assassine. Weitere Befunde (Rune-Siegel flach gratis, 7 klassenlose Abwehr-Einzigartige +19–28 für alle, Sets < 3 seltene, Grube ohne Lohn,
Lebensraub 1,3) und 7 Ideen liegen ihm vor – **wartet auf seine Wahl**.
**Entschieden 2026-11-22: Erstattung halb** (`sealBoss: 0.5` = Chance). Bot: Tag 1 St. 16–24 (14–37 Abstiege), Tag 30 St. 44–48, Rekord T24–30.
Einzigartige: 7 klassenlose Abwehr-Stücke abgeschwächt (→ E beute.md). **Barbar geprüft:** St. 40/T17, je 1200 Abstiege: Zauberin 99 %, Assassine 51 %, Barbar 48 % –
nicht der Barbar fällt ab, die Zauberin läuft davon (Ursache: Zaubertempo aus ihrem Brett, nicht Int – spellK gemessen wirkungslos). **Gebaut 2026-11-22** (er: „lös das Problem“): weicher Deckel Ausweichen/Krit + Werte-Anzeige-Fix, Zaubertempo der Zauberin halbiert (→ E kampf.md).
**Offen:** Brett für den Barbaren (hat noch den alten Baum, 9 Knoten) – später, mit Mockup.
Zauber-Ketten: er will sie „ganz später“.

**Befunde 2026-11-19 (gemessen, nichts davon gebaut – Reihenfolge wählt er):**
1. ~~Siegchance mit < ohne Tränke~~ **erledigt 2026-11-19**: gekoppelter Zufall, 200 Probekämpfe, „etwa gleich“
   im Rauschen, `bestBelt()` gekoppelt (→ E „Siegchance gekoppelt“ in kampf.md). Am echten iPhone nicht gemessen.
2. ~~Serienbremse~~ **erledigt 2026-11-19**: max. 2 Ausweicher in Folge; dafür Kutte-3-Teile `venom` 0,35 → 0,30,
   Baum-Test 600 statt 300 Kämpfe (→ E „Serienbremse beim Ausweichen“). `power()` kennt die Bremse jetzt; **offen:** Bonus
   „Ausweichen“ (evadep) liegt danach in calib auf St. 10 bei 0,81 (< 0,85) – Vorschlag per 1,5 → ~1,65; er: „lassen erstmal, aber merken“ (2026-11-19).
3. ~~Tiers nach PoE-Art~~ **erledigt 2026-11-19** (Weg 1, Bezug Gegenstandsstufe 60): Stufe aus dem Wert, `tierOf()`;
   bis ~GS 35 zeigt fast alles V (gewollt, ehrlich). Preis zählt weiter den Wurf. → E „Tiers aus dem Wert“ (beute.md).
4. **Endgame zu kurz** (er: ~3–4 Std. bis Stufe 21, danach 1–2 Std. bis alles durch; Abgrund „viel zu
   schwach“ und endet). Ursache gefunden: `cryptLvl` = Akt-top + 2 + Krypta-Stufe × 3 → Glocke Stufe 10 =
   Gegnerstufe 59 bei Heldenstufe 22, Siegchance 83 %, Beute Stufe 59 (z. B. +88 % Zaubertempo). Beute
   steigt, Gefahr kaum. Abgrund wächst mit Heldenstufe (+1) → mit Krypta-Beute zwangsläufig leicht.
   Vorschlag: **endlose Leiter** (Abgrund-Tiefe ohne Ende, Gegner nach Tiefe statt Heldenstufe), Gefahr
   ehrlich mit Beutestufe steigen lassen; später Wochen-Herausforderung. **Nur besprechen**, er will reden.
   Offene Fragen an ihn: Spiellänge (Wochen/Abende), Timer ja/nein, was macht ihm am meisten Spaß,
   Stufen-Deckel.
   **Seine Antworten (2026-11-19):** Spiellänge **Wochen** · **spielen, so viel man will** · Schmieden ist okay, aber
   **zu wenig Material** (lohnt fast nur Fusion) und die **Schmiedeglut des Items muss raus** (deine Glut bleibt) ·
   Stufen **offen**. Gemessen (Bot, 14 Tage, Zählung in Kopie): Zauberin gesamt gefallen Asche 18, Staub 22, Blutstein 15,
   Siegel 8, Leinen 28 (je Eingriff 2 nötig) – fast alles in den ersten 3–7 Tagen.
   **Erledigt 2026-11-19:** Schmiedeglut raus, Verkauf = halber Wert + legendär 1 Material (→ 9–10 Eingriffe/Tag, → E
   „Schmiedeglut raus, Verkauf gibt Material“). **Offen:** endloser Abgrund (Gegner nach Tiefe, keine letzte Tiefe, beste
   Tiefe als Ziel) – Vorschlag + Mockup, dann sein Wort. **Klein offen:** sets.mjs/uniques.mjs über mehrere Ausrüstungswürfe
   mitteln, dann Platzhalter-Wurf in loot.js entfernen.
- Bot (`tests/bot.mjs sorceress 30 1`, spielt ideal): Geschichte fertig Tag 3 (~Stufe 19), Glocke Tag 12
  (Stufe 26), danach kein Ende.

- **Zauber-Bedingungen.** Vorschlag liegt ihm vor, gemessen, **nichts gebaut**. Kern: Zauber feuern
  stur nach Takt (`every: 3/5/7`), während Tränke längst Auslöser haben (`TRIGGERS`). Gemessen
  (Stufe 20, 1200 Kämpfe, Gegner auf 50 % geeicht): **Meteor feuert in 21 % der Kämpfe nie**, 34 %
  seiner Würfe sind Überschuss, 40 % seines Schadens verschwendet; 22 % der Niederlagen fielen ohne
  einen einzigen Meteor. Bei Feuerball/Frostnova ist nichts zu holen (13 %/9 %) – **nur der dritte
  Zauber lohnt**. Die eigentliche Tiefe entsteht erst, wenn ein unterdrückter Zauber **seine Ladung
  behält**: dann ist es *halten oder werfen* mit Preis.
  **Seine Richtung (2026-11-19): Zauber-Ketten**, z. B. Nova → Betäubung → Meteor → Krit → Feuerball;
  Zauber bekommen Ketten-Wirkungen (Meteor-Krit löst einen zweiten Meteor aus). Er will das
  **gemeinsam durchgehen**, nicht vorgelegt bekommen. Knackpunkte: Zaubertempo, Abklingzeit, keine
  endlose Kette. Präzedenz: Bum-bo – Ketten sollen gewollt sein, nicht Glück
  (https://gamegene.app/library/records/claims/cec56128-4df5-4212-8c24-0360fbb440f6).
- **Kampf-Historie** – **vorerst nicht gebraucht** (2026-11-19, „erst am Spiel selber arbeiten“). Mockup liegt in
  `mockups/kampf-historie.html`. Früherer Stand: Variante A gewählt: dieser
  Kampf Zug für Zug (wer, was, Schaden, Zauber, Trank), Wendepunkte markiert („Leben unter 30 %",
  „Meteor verpufft"), unten der eine Hebel, der am meisten geholfen hätte. Daten: `fightReport()` in
  game.js → `fightSummary` in ui.js. Er will **Entscheidungen, keine größere Anzeige**. Erst Plan +
  Mockup vorlegen, dann bauen.
- **Die vier Abgrund-Materialien** (DESIGN.md) – zurückgestellt, **er sucht noch Ideen** dafür. **Nicht ohne
  seinen Zuruf anfangen.**
- **Arbeitsweise-Abschnitt in CLAUDE.md**: von mir eingetragen, von ihm nicht ausdrücklich
  abgenickt. Falls er ihn anders formuliert haben will, ändern.

## Zurückgestellt (kein Fehler, bewusste Entscheidung)

- **Verzeichnis, Teil 2**: Gegenstände (~70), Grab-Sets, Boni. Viel Arbeit, wenig Nutzen.
- **Kategorie-Symbole** im Verzeichnis sind Platzhalter – eigene Zeichen wären ein Prompt wert
  (Prompt vorschlagen, nicht erzeugen).
- **Echte Synergie-Items für die Zauberin**: die drei gebauten sind **Verstärker, keine Ersteller** –
  gemessen *weniger* wert mit passendem Zweig. Für Frost ginge `bulwark` heute; Feuer und Arkan
  bräuchten je einen neuen Kampf-Schlüssel. Details in `entscheidungen/talente.md`.
- **„Zurück" von der Schmiede-Auswertung** führt immer zu Halvar.
- **Beutesack-Raster + sicheres Fach** im Abgrund.
