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
| `STAND.md` | Beschreibung des Spiels. **Veraltet an einer Stelle:** nennt iPhone SE als Maßstab – das gilt seit dieser Sitzung nicht mehr. |
| `mockups/*.html` | Vorschläge, die dem Besitzer gezeigt wurden. |

**Der Abschnitt „Fallen" in CLAUDE.md ist der wertvollste Teil.** Jede Zeile dort ist mindestens
einmal teuer geworden; die Herkunft steht in `entscheidungen/fallen.md`.

## Offen – wartet auf den Besitzer, nichts tun ohne sein Wort

- **Zauber-Bedingungen.** Vorschlag liegt ihm vor, gemessen, **nichts gebaut**. Kern: Zauber feuern
  stur nach Takt (`every: 3/5/7`), während Tränke längst Auslöser haben (`TRIGGERS`). Gemessen
  (Stufe 20, 1200 Kämpfe, Gegner auf 50 % geeicht): **Meteor feuert in 21 % der Kämpfe nie**, 34 %
  seiner Würfe sind Überschuss, 40 % seines Schadens verschwendet; 22 % der Niederlagen fielen ohne
  einen einzigen Meteor. Bei Feuerball/Frostnova ist nichts zu holen (13 %/9 %) – **nur der dritte
  Zauber lohnt**. Die eigentliche Tiefe entsteht erst, wenn ein unterdrückter Zauber **seine Ladung
  behält**: dann ist es *halten oder werfen* mit Preis.
- **Kampf-Historie hinter einem Knopf am Kampfende** – seine Idee, **er will sie eingebaut** (2026-11-19);
  offen ist, *was* sie zeigen soll. Ihm vorgelegt: **A** Verlauf des Kampfes Zug für Zug mit markierten
  Wendepunkten + dem einen Hebel; **B** die letzten ~10 Kämpfe als Liste. Seine Wahl abwarten. Die Daten
  gibt es schon (`fightReport()` in game.js → `fightSummary` in ui.js). Wichtig: er will
  **Entscheidungen, keine größere Anzeige** – diesen Punkt habe ich einmal verfehlt.
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
