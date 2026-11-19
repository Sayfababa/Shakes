# Sitzungen – was passiert ist und was schiefging

Aus UEBERGABE.md hierher verschoben, damit die Übergabe kurz bleibt. Neueste oben.

## 2026-11-19, Punkt 1 und 2 der Befunde

- **Siegchance gekoppelt** gebaut und gepusht (voller Lauf grün). Messung, Tempo: → E „Siegchance gekoppelt“.
- **Serienbremse** gebaut, wirkt wie erwartet, aber `sets.mjs` kippt (Kutte des Verseuchten) → nicht gepusht,
  nicht still nachgezogen; Befund und Code in → E „Serienbremse beim Ausweichen“.

## 2026-11-19, Nachtrag

- **Lager-Verkauf erledigt**: der Besitzer bestätigt „klappt". Der alte offene Punkt lautete:

  - **Lager-Verkauf.** Er meldete ihn zweimal; **ich konnte ihn nie nachstellen** – in Chromium
    verkauft das Lager auf allen Geräten, mit Maus und Finger, per Skript eingelegt und über den
    echten Weg. Auch „das Fenster springt beim Umschalten auf *Wirklich?*" ist gemessen widerlegt
    (1–2 px). **Prüfstein: steht „Ordnen" neben „Beutel" im Lager, hat er den neuen Stand.**
    Offene Frage an ihn: passiert bei „Wirklich?" *gar nichts*, oder kommt die *Frage ein zweites Mal*?

## Sitzung bis 2026-11-19 (Commit 61ed38c)

### Was passiert ist

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


### Drei Dinge, die falsch liefen

Damit sie sich nicht wiederholen:

1. **Zweimal „grün" gemeldet, was nicht grün war** – einmal, weil zwei `run.sh` gleichzeitig liefen
   und einer dem anderen den Testserver abräumte; einmal, weil mein eigener neuer Test bei einem
   magischen Teil mit nur einem Bonus auf ein Siegel prüfte, das es nicht gab. **Immer nur einen
   Testlauf gleichzeitig, und das Ergebnis lesen, nicht den Exit-Code raten.**
2. **Dreimal gebaut, ohne vorher zu sagen, was kommt** – daraufhin kam seine Regel oben.
3. **Zweimal hat erst ein Screenshot gefunden, was der Test übersah** (ein Panel verschluckte seine
   Knöpfe, ohne herauszuragen). **Bei UI-Arbeit hinsehen, nicht nur messen.**
