# Aschenkrone – Design: Progression & Grind

Ziel: Der Spieler **identifiziert sich mit seinem Helden** und hat immer ein nächstes Ziel, für das sich Grinden lohnt.

## Kern-Schleife
Aufträge (Gold, EP, Beute) → stärker werden (Punkte, Talente, Ausrüstung) → Krypta-Ebene/Boss schaffen → Trophäe & bessere Beute → nächste Krypta / höhere Schwierigkeit.

## Systeme
| System | Wie | Warum (Vorbild, GameGene) |
|---|---|---|
| Attributpunkte | 5 pro Stufe, frei verteilbar, nicht mit Gold | Entscheidungen gehören dem Spieler |
| Talentbaum | 3 Pfade × 3 Stufen je Klasse, 1 Punkt pro Stufe, Stufen ab Lv 2/8/16, Voraussetzungen sichtbar | Diablo II: Voraussetzungs-Kette sichtbar machen, damit man sieht, wohin die Klasse wächst ([GG](https://gamegene.app/library/records/claims/4e4a0e66-c802-4d22-8d1f-abe5ed281f6a)) |
| Läuterung (Respec) | Erstes Mal gratis, danach Stufe × 30 Gold | Path of Exile: Festlegen erzeugt Bindung ([GG](https://gamegene.app/library/records/claims/fbc9f66e-55f1-4503-9f50-e7cb7ad92d81)); Diablo IV: Mittelweg, früh billig ([GG](https://gamegene.app/library/records/claims/a4bf96a3-f4be-405b-b655-9704d4bac9ec)) |
| Krypten | 4 Krypten × 5 Ebenen, letzte = Boss; Pause nach jedem Kampf; Fortschritt bleibt bei Niederlage | Ein festes Ziel neben den zufälligen Aufträgen |
| Schwierigkeiten | Normal → Albtraum → Hölle (+18/+36 Stufen), nach allen Bossen | Diablo: Gleicher Inhalt auf höherer Schwierigkeit verlängert die Spielzeit ([GG](https://gamegene.app/library/records/claims/558f819d-2ac0-4b27-9fae-9de17ce4acc0)) |
| Trophäen | Erster Bosssieg je Schwierigkeit = dauerhafter Bonus | Permanenter, sichtbarer Fortschritt |
| Ränge | Titel + Portraitrahmen (Eisen → Bronze → Silber → Gold → Blut) | Far Cry 3: Fortschritt auf dem Körper sichtbar machen ([GG](https://gamegene.app/library/records/claims/61cfcb6d-bf38-4154-97c3-faa3d72dfd93)) |

## Händler & Questketten (Vorbild: Fraktions-Händler)
- 3 NPCs: **Halvar** (Schmied – Waffen/Schilde), **Mutter Ysolde** (Kräuterhexe – Schmuck/Gürtel), **Bruder Kaspar** (Totengräber – Rüstung).
- Jeder hat eine handgeschriebene Questkette (6–7 Aufträge) mit Story-Text. Ziele: Monster töten, an Orten siegen, Materialien bringen, Items abgeben, Krypta-Ebenen, Bosse, Grube, Stufe.
- Ruf aus Quests → **Treue I–IV** (braucht Ruf + Spielerstufe) → bessere Ware (Seltenheit, Stufe, Preis).
- Streifzüge: 6 Orte mit eigenen Monstern & Materialien; „!“ zeigt, wo ein Auftrag wartet.

## Erweiterung nach GameGene-Recherche
| System | Umsetzung | Vorbild |
|---|---|---|
| Persönliche Questketten | Vargo (Grube, Champion „Die Kette“), Ilse (Krypten, Laterne), Prophet (Hauptgeschichte) | Granblue Fantasy – Fate Episodes ([GG](https://gamegene.app/library/records/claims/6afc4b30-af01-40e0-91f8-4884103be058)) |
| Tägliches Omen | Ein Ort pro Tag verändert sich (Elite, Ernte, Gold, Erfahrung) | Pokémon Schwert/Schild – täglich wechselnde Wildnis ([GG](https://gamegene.app/library/records/claims/60080490-cef5-48cc-9012-61cd0720607b)) |
| Bestellung statt nur Zufallsladen | Halvar schmiedet eine Klassenwaffe gegen Material | Marvel Snap – Zufallsladen frustrierte ([GG](https://gamegene.app/library/records/claims/dd184cad-0214-40d5-aced-42f3e3667908)) |
| Materialien mit festem Zweck | Schärfen, Verstärken, Neu weihen | Hades – Währungen je Zweck ([GG](https://gamegene.app/library/records/claims/8dbcece3-e56e-44a0-ae22-a9c38501477f)) |
| Splitter öffnen Endgebiet | 4 Glockensplitter → „Die Glocke“, Boss trägt dein Gesicht, Entscheidung am Ende | Dragon Quest VII – Fragmente öffnen Land ([GG](https://gamegene.app/library/records/claims/e1853a66-fde0-4d18-88a6-4d555db86584)) |
| Tutorial | 8 kurze Schritte, rücken automatisch vor, überspringbar | – |

## Test-Erkenntnisse (Bot, 14–21 simulierte Tage Dauerspiel)
- Grube war Gold-Endlosquelle (1 Kampf/Minute, kein Preis) → kostet jetzt 4 Glut, 5 Min. Pause.
- Softlock: Boss-Quests unlösbar, wenn Boss vorher schon fiel → zählt jetzt rückwirkend.
- Dienste fraßen Quest-Material → Warnung „für Auftrag!“.
- Ein Stufenaufstieg ohne verteilte Punkte machte den Startort tödlich → Gegner wachsen nur halb mit, Hinweis „Verteile deine Punkte!“.
- Tempo jetzt: Stufe ~8 nach Tag 1, ~15 nach Tag 6, alle 4 Splitter ~Tag 8–10, Finale ~Tag 18 (bei Dauerspiel; echte Spieler deutlich langsamer).
- Risiko & Ertrag eingebaut (siehe unten). Erste Version war kaputt (Tiefer gehen kostenlos → Stufe 21 an Tag 1, 380k Gold) → jetzt kostet jede Tiefe Glut, auch EP sind erst daheim sicher.

## Risiko & Ertrag (GameGene: [Risk and return](https://gamegene.app/joseki/risk-and-return))
- **Spur wählen** (Vorbild TWEWY: Spieler wählt Schwierigkeit, schwerer = bessere Beute, [GG](https://gamegene.app/library/records/claims/0eaa36eb-38b1-4a55-afb9-c1471a415aad)):
  leichte Spur (sicher, ×0.7), Spur (×1), blutige Spur (Gegner über deiner Stufe, ×1.6, magische Beute). Gefahr steht vor der Wahl (Informationen für eine echte Entscheidung).
- **Tiefer gehen** (Vorbild Sea of Thieves: Schatz zählt erst im Hafen, [GG](https://gamegene.app/library/records/claims/dee0651a-df5e-43e3-9de4-065edd4ab5ce)):
  nach dem Sieg ist Gold/EP/Beute „ungesichert“. Heimkehren sichert, Tiefer (kostet Glut, Gegner +2 Stufen/+12 %, Lohn +25 %, bis Tiefe 5) vermehrt – Niederlage kostet alles Ungesicherte.
- Bot-Ergebnis: Tempo bleibt im Rahmen (Stufe ~20 nach 9 Tagen Dauerspiel), vorsichtiger Bot verliert nichts, riskanter Bot verliert gelegentlich Beute.

## Offen / Ideen
- Kopfgelder pro Ort, zufällig aus dem Ortskontext erzeugt (Caves of Qud).
- Ortsbilder für Streifzug-Karten; Bild für „Die Kette“.
- Balance der neuen Belohnungen (Segen, Omen) per Simulation.

## Balance-Ziel (Simulation, `node` Script)
- Wenig Ausrüstung: Aufträge normal ~90 %, gefährlich ~60 %, Boss ~25–50 % → man muss farmen.
- Volle magische Ausrüstung: Boss fast sicher → Beute ist der stärkste Hebel.
- Schwach: Zauberin/Grabhexe um Stufe 10 (zu prüfen).

## Nächste Ideen
- Runen & Sockel, unidentifizierte Items (Hexe), Sets.
- Talent-Knoten mit echten Spielwechslern (z. B. „Kettenblitz“: zweiter Treffer), nicht nur Prozente.
- Tagesziele / Glut-Rhythmus, Grube mit Rangliste.
