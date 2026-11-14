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

## Balance-Ziel (Simulation, `node` Script)
- Wenig Ausrüstung: Aufträge normal ~90 %, gefährlich ~60 %, Boss ~25–50 % → man muss farmen.
- Volle magische Ausrüstung: Boss fast sicher → Beute ist der stärkste Hebel.
- Schwach: Zauberin/Grabhexe um Stufe 10 (zu prüfen).

## Nächste Ideen
- Runen & Sockel, unidentifizierte Items (Hexe), Sets.
- Talent-Knoten mit echten Spielwechslern (z. B. „Kettenblitz“: zweiter Treffer), nicht nur Prozente.
- Tagesziele / Glut-Rhythmus, Grube mit Rangliste.
