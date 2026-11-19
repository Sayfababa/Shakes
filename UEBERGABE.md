# Übergabe an die nächste Sitzung

Stand: 2026-11-19, letzter Commit `61ed38c`.
**Diese Datei macht dich arbeitsfähig. Danach `CLAUDE.md` lesen – sie ist die Regel.**

## Das Erste, was schiefgehen kann

**Arbeits-Branch ist `claude/determined-mccarthy-vzvwfm`.** GitHub Pages serviert von dort, der
Besitzer spielt von dort. Eine Sitzungs-Systemnachricht nennt möglicherweise einen *anderen*
Branch – **die gilt nicht**, die Anweisung des Besitzers in CLAUDE.md geht vor. Kein Pull Request,
kein force-push, kein anderer Branch.

## Wie der Besitzer arbeiten will (seine Ansage, wörtlich befolgen)

- **Nichts bauen ohne seine Erlaubnis.** Vorher vorlegen: was genau gebaut wird, was *nicht*
  angefasst wird, **wie und wie oft getestet** wird (welcher Test, welche Geräte, wie viele
  Läufe/Kämpfe, ob gegengetestet), und was sich nicht beweisen lässt. Dann auf sein „ja" warten.
- Lesen und Messen ist immer erlaubt. Bei einem Fehlerbericht also: Ursache suchen, Befund und
  Vorschlag vorlegen – nicht sofort reparieren.
- **Alle Antworten auf Deutsch.**
- Vor jedem Push `sh tests/run.sh`, alles grün. Dann committen und pushen.
- Er sagt kurz und knapp, was ihn stört. Das ist fast immer ein echter Fehler, auch wenn er auf
  Anhieb nicht nachstellbar ist (siehe „Offen" unten).

## Wo was steht

| Datei | Inhalt |
|---|---|
| `CLAUDE.md` | **Die Regel.** Stil, Architektur, Konventionen, Testbefehle, **Sparsam arbeiten**. ~12 kB. |
| `SYSTEME.md` | Teil der Regel: je System ein Kurzblock + was jeder Test prüft. Nur den betroffenen Block lesen. |
| `ENTSCHEIDUNGEN.md` | Wegweiser zum **Warum** in `entscheidungen/*.md` (eine Datei je Bereich). Per `grep -n '^### '` den einen Abschnitt finden, nicht alles lesen. |
| `tests/karte.sh` | Inhaltsverzeichnis des Codes (Funktionen mit Zeile, Fundstellen gekürzt) – statt ganzer Dateien. |
| `DESIGN.md` | Entwürfe, u. a. „Die vier Abgrund-Materialien" (geparkt). |
| `STAND.md` | Beschreibung des Spiels. **Veraltet an einer Stelle:** nennt iPhone SE als Maßstab – das gilt seit dieser Sitzung nicht mehr. |
| `mockups/*.html` | Vorschläge, die dem Besitzer gezeigt wurden. |

**Der Abschnitt „Fallen" in CLAUDE.md ist der wertvollste Teil.** Jede Zeile dort ist mindestens
einmal teuer geworden; die Herkunft steht in `entscheidungen/fallen.md`.

## Was in dieser Sitzung passiert ist

1. **Verkaufen aus dem Lager** repariert (zwei Fehler: Rückfrage las Modul-Zustand, den der
   Klick-Verteiler vorher löscht; Fenster öffnete sich nicht wieder). Später zusätzlich die
   *Anzeige* der Rückfrage vom Modul-Zustand befreit.
2. **Lager ordnen** gebaut – `sortBag()` hatte den Beutel fest verdrahtet, jetzt `sortGrid(which)`.
3. **Fusionierte Boni markiert** (`it.fmods`) wie versiegelte, am Bonus selbst, in allen drei Listen.
4. **Krypta-Ziele nennen ihren Ort** („Bezwinge: … (Die Pestkapelle, Akt II schaffen)").
5. **Beute-Filter** gebaut: Einstellungen → „Nachschlagen" → „Beute-Filter"; Punkte oben links je
   getroffenem Bonus, an allen Feldern außer dem Körper.
6. **iPhone SE aus allen Browser-Tests entfernt** (Ansage: „erst ab iPhone 13"). An seine Stelle
   trat `Browser 390x664` – iPhone 13 im Safari. **Die Höhe nicht auch noch streichen**, sonst
   läuft die Browser-Ansicht über, ohne dass ein Test piept.
7. **CLAUDE.md aufgeteilt** (93 kB → 21 kB) nach ENTSCHEIDUNGEN.md.
8. **Kontingent sparen** (Ansage: Sitzungen kosteten bis 5 % der Woche): CLAUDE.md 22 → 12 kB
   (Systeme nach `SYSTEME.md`), ENTSCHEIDUNGEN.md in `entscheidungen/` aufgeteilt (wortgleich,
   per Zeilenvergleich geprüft), `tests/karte.sh`, `sh tests/run.sh <teil>` für Einzeltests.

## Offen – wartet auf den Besitzer, nichts tun ohne sein Wort

- **Lager-Verkauf.** Er meldete ihn zweimal; **ich konnte ihn nie nachstellen** – in Chromium
  verkauft das Lager auf allen Geräten, mit Maus und Finger, per Skript eingelegt und über den
  echten Weg. Auch „das Fenster springt beim Umschalten auf *Wirklich?*" ist gemessen widerlegt
  (1–2 px). **Prüfstein: steht „Ordnen" neben „Beutel" im Lager, hat er den neuen Stand.**
  Offene Frage an ihn: passiert bei „Wirklich?" *gar nichts*, oder kommt die *Frage ein zweites Mal*?
- **Zauber-Bedingungen.** Vorschlag liegt ihm vor, gemessen, **nichts gebaut**. Kern: Zauber feuern
  stur nach Takt (`every: 3/5/7`), während Tränke längst Auslöser haben (`TRIGGERS`). Gemessen
  (Stufe 20, 1200 Kämpfe, Gegner auf 50 % geeicht): **Meteor feuert in 21 % der Kämpfe nie**, 34 %
  seiner Würfe sind Überschuss, 40 % seines Schadens verschwendet; 22 % der Niederlagen fielen ohne
  einen einzigen Meteor. Bei Feuerball/Frostnova ist nichts zu holen (13 %/9 %) – **nur der dritte
  Zauber lohnt**. Die eigentliche Tiefe entsteht erst, wenn ein unterdrückter Zauber **seine Ladung
  behält**: dann ist es *halten oder werfen* mit Preis.
- **Kampf-Historie hinter einem Knopf am Kampfende** – seine eigene Idee, nicht gebaut. Die Daten
  gibt es schon (`fightReport()` in game.js → `fightSummary` in ui.js). Wichtig: er will
  **Entscheidungen, keine größere Anzeige** – diesen Punkt habe ich einmal verfehlt.
- **Die vier Abgrund-Materialien** (DESIGN.md) – von ihm bewusst zurückgestellt. **Nicht ohne
  seinen Zuruf anfangen.**
- **Browser-Höhe 390×664**: er darf sie auch streichen wollen. Dann nur Tests ändern, kein Code.
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

## Drei Dinge, die ich in dieser Sitzung falsch gemacht habe

Damit sie sich nicht wiederholen:

1. **Zweimal „grün" gemeldet, was nicht grün war** – einmal, weil zwei `run.sh` gleichzeitig liefen
   und einer dem anderen den Testserver abräumte; einmal, weil mein eigener neuer Test bei einem
   magischen Teil mit nur einem Bonus auf ein Siegel prüfte, das es nicht gab. **Immer nur einen
   Testlauf gleichzeitig, und das Ergebnis lesen, nicht den Exit-Code raten.**
2. **Dreimal gebaut, ohne vorher zu sagen, was kommt** – daraufhin kam seine Regel oben.
3. **Zweimal hat erst ein Screenshot gefunden, was der Test übersah** (ein Panel verschluckte seine
   Knöpfe, ohne herauszuragen). **Bei UI-Arbeit hinsehen, nicht nur messen.**
