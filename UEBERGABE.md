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

**Befunde 2026-11-19 (gemessen, nichts davon gebaut – Reihenfolge wählt er):**
1. ~~Siegchance mit < ohne Tränke~~ **erledigt 2026-11-19**: gekoppelter Zufall, 200 Probekämpfe, „etwa gleich“
   im Rauschen, `bestBelt()` gekoppelt (→ E „Siegchance gekoppelt“ in kampf.md). Am echten iPhone nicht gemessen.
2. ~~Serienbremse~~ **erledigt 2026-11-19**: max. 2 Ausweicher in Folge; dafür Kutte-3-Teile `venom` 0,35 → 0,30,
   Baum-Test 600 statt 300 Kämpfe (→ E „Serienbremse beim Ausweichen“). `power()` kennt die Bremse jetzt; **offen:** Bonus
   „Ausweichen“ (evadep) liegt danach in calib auf St. 10 bei 0,81 (< 0,85) – Vorschlag per 1,5 → ~1,65, wartet auf ihn.
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
