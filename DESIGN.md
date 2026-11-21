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


## Crafting & Handel (Fahrplan)
Ziel: seltene, sehr starke Items, die wertvoll bleiben; Crafting mit Kontrolle (Siegel); später Handel zwischen Spielern.
Quellen (GameGene): Dungeon Defenders – Name des Schmieds bleibt auf gehandelten Items (https://gamegene.app/library/records/claims/7737939f-9813-4ec8-a80d-095c4fd4be3c);
Last Epoch – Handel und Selbstfinden als Fraktionswahl, beide belohnt (https://gamegene.app/library/records/claims/2a97e010-7b15-464b-a723-901743ed69de);
Pillars of Eternity – Crafting nicht als Pflichtpflege (https://gamegene.app/library/records/trivia/d0c3cce6-ebec-4558-be1f-1f110c4c6f2f).
Ohne GameGene-Beleg, aus Genre-Wissen: D2 (Uniques, Runen als Währung), PoE (Material = Geld, „Präfixe gesperrt“), Last Epoch (Schmiedepotenzial), D3/D4 (einen Bonus neu würfeln).

1. **Erledigt:** Bonus-Stufen I–V, Sonderboni (13), Einzigartige (14), Wert nach Stufe/Sonderbonus, Siegel gegen Bearbeiten.
2. **Erledigt:** Crafting: Kultistensiegel versiegelt einen Bonus, Höllenasche würfelt unversiegelte neu, Knochenstaub nur Werte, Blutstein fügt hinzu, Grableinen tilgt. Jedes Item hat Schmiedeglut (Budget) → kein perfektes Craften, Funde bleiben wertvoll. Schmiedezeichen (Name) auf fertigen Items.
3. Basar mit NPC-Käufern (Preise, Gebühren, Item-Format für später).
4. Server + Konten + echter Handel (Items serverseitig erzeugen; `S.tampered` → kein Handel).

## Gear & Boni – Ausbau (Vorschlag, noch nicht gebaut)

Leitfrage: Was macht ein Item **spannend**, ohne das Spiel komplizierter zu machen? Leitlinie aus GameGene
([Tiefe mit möglichst wenig Komplexität](https://gamegene.app/joseki/depth-with-least-complexity)): keine neuen Regeln stapeln,
sondern vorhandene Systeme (Zauber, Krypten, Schmiede, Runen) über das Gear miteinander verknüpfen.
Und ([Diablo IV](https://gamegene.app/library/records/claims/9aa91ee7-9d21-4d39-81dd-bebb8455692f)): Wenn **alle** Stärke aus dem Gear kommt, fehlt der Bezug zum eigenen Helden – Gear soll den Build *formen*, nicht nur Zahlen erhöhen
([Monster Slayers](https://gamegene.app/library/records/claims/cf549596-a490-41ad-ab7a-5cf7ce5d64c7): zufällige Beute formt die Spielweise).

Passt zum Stil nur, was **düster, kurz lesbar, ohne Verwaltungsaufwand** ist. Bewusst NICHT: Haltbarkeit/Reparatur
(Zeit des Spielers), Elementar-Resistenzen gegen 6 Elemente (zu viel Text am Handy), Sockel+Edelsteine (doppelt zu Runen).

| # | Idee | Was es tut | Warum es passt | Aufwand |
|---|------|-----------|----------------|---------|
| 1 | **Verfluchte Gegenstände** | Seltene Items mit starkem Bonus + spürbarem Makel („+35 % Schaden · −15 % Leben“). Lila-schwarzer Rand, Fluch-Zeile in Rot. Ysolde kann Flüche (teuer) bannen – dann verliert das Item auch die Hälfte des Bonus. | Echtes Abwägen statt „größere Zahl gewinnt“; Diablo-1-Gefühl (negative Affixe); Kampfkraft zeigt sofort, ob es sich lohnt | klein |
| 2 | **Zauber-Boni auf Gear** | Affixe wie „Feuerball +20 % Stärke“, „Frostnova lädt 1 Zug schneller“, „Heilzauber wirkt doppelt bei < 30 % Leben“ – nur für Zauber der eigenen Klasse. | Verbindet Gear mit den Zaubern (sichtbar im Kampf), bereitet den passiven Zauberbaum vor; Klassenwaffe zählt mehr | mittel |
| 3 | **Grab-Sets (grün)** | Je Krypta ein Set aus 3 Teilen (Boss lässt ein Teil fallen). 2 Teile: Bonus, 3 Teile: Set-Fähigkeit (z. B. „Wäscherinnen-Tracht: Gift heilt dich“). Grün ist als Lootfarbe schon vorgesehen. | Gibt Krypten einen Grund zum Wiederholen (Endspiel), Sammelziel mit Geschichte | mittel |
| 4 | **Erwachen (Blutzoll)** | Legendäre/einzigartige Items tragen eine verborgene Zeile „???“. Nach N Siegen mit dem Item angelegt erwacht sie (eigener Sonderbonus). | Lieblingsitem wird über Zeit besser – Spannung im Idle-Kreislauf ohne neue Handlung; Bindung an den Helden | klein |
| 5 | **Runenwörter** | Bestimmte 3 Runen in richtiger Reihenfolge in einem Teil (Schmiede gibt es schon) ergeben einen Namen + Zusatzeffekt. Hinweise als Rätselzeilen bei Prophet/Ilse. | Nutzt die bestehende Schmiede, Entdeckerfreude, D2-Gefühl ohne Kopie | mittel |
| 6 | **Gegnertypen-Boni** | „+25 % gegen Untote / Bestien / Kultisten“ – Gegner bekommen eine Familie. Streifzug-Karte zeigt die Familie. | Gear-Wechsel je Ort wird sinnvoll | mittel, braucht Daten für alle Monster |

**Empfohlene Reihenfolge:** 1 → 4 → 2 → 3 → 5 (6 nur, wenn Gear-Wechsel gewünscht ist).
1 und 4 sind klein, sofort spürbar und berühren keine bestehende Balance stark. 2 braucht den Zauberbaum im Hinterkopf.

**Balance-Schutz für alle Punkte:**
- Jede neue Bonusart bekommt ein „Machtbudget“ je Gegenstandsstufe (wie `TIERS`), Kampfkraft rechnet sie ein.
- Bots/Personas vor und nach dem Einbau: Finale weiterhin ~Tag 16–17, Niederlagen nicht deutlich anders.
- Fuzz-Test erweitert um die neuen Felder (Fluch, Set, Erwachen), Speichern=Laden.

### Umgesetzt: Kampf-Boni auf Items (statt Flüchen als erstem Schritt – Wunsch: Crafting soll Spaß machen)
- Eigene Bonus-Pools je Teil: Waffe = Angriff (Krit-Chance, Krit-Schaden, Schaden %, Zauberschaden, Durchbohren, Lebensraub, Zauber-Bonus der Klasse), Nebenhand = Blocken/Zauber/Dornen, Rüstung = Leben %/Ausweichen/Dornen, Schmuck = Krit/Schaden/Zauber. Attribute überall.
- Geeicht gegen das Hauptattribut (tests/calib.mjs): jeder Bonus der Stufe III bringt ~0,85–1,2× so viel Kampfkraft. Krit-Schaden allein ~0,35 (lohnt erst mit Krit-Chance – Absicht: Kombinieren beim Crafting).
- Dabei aufgefallen und angeglichen: Zaubertempo (vorher ~0,1×) und Rüstung (~0,15×) waren fast wertlos; Glück leicht angehoben (bleibt wegen Beute-Glück darunter).
- Gegenprobe mit echten Kämpfen (1500 je Bonus): Kampfkraft sagt die Siegchance gut voraus; Lebensraub wird leicht unterschätzt, Zaubertempo beim Barbaren leicht überschätzt.
- Bots 6 Klassen × 14 Tage und Personas 20 Tage: Tempo unverändert (Finale Tag 16–17), Krypta-Niederlagen nicht höher.

## Zauber-Wege (umgesetzt)
- Idee: im Zug-Kampf eins gegen eins bringen „mehr Projektile“ nichts – Tiefe kommt aus **Zeitpunkt, Reihenfolge, Zuständen**. Je Zauber 3 Stufen × 2 Wege, **Wahl statt Punkte** ([GameGene: Diablo III Runen](https://gamegene.app/library/records/claims/dd5a6831-498c-47e0-8486-1cfbc32b791c)); Umentscheiden günstig, aber nicht gratis ([Diablo IV: Mittelweg beim Umskillen](https://gamegene.app/library/records/claims/a4bf96a3-f4be-405b-b655-9704d4bac9ec)).
- Wegarten: Kombos (Schmelzen nach Frostnova, Detonation des Gifts, Kopfschuss nach Fangeisen), Zeitpunkt (sofort, doppelt laden bei wenig Leben), Verwandlung/Preis (schneller aber schwächer, stärker aber langsamer), Zustände (Brand, Bluten, Gift, Verwundbar, Geschwächt), Boss-Antworten (Reinigen vs. Aldemars Gift, Bannen vs. Gerlindes Heilung, Unbeugsam vs. Glöckner).
- Balance (tests/ways.mjs, 3000 Kämpfe je Weg, Stufe 14 und 24, alle Klassen): fast alle Wege +4…+12 Prozentpunkte Siegchance bei 50 %-Gegnern; Boss-Antworten gegen ihren Boss +25…+48. Bots/Personas: Tempo unverändert (Finale Tag 16–17), Niederlagen nicht höher.
- Offen: Jägerin und Zauberin haben keine eigene Boss-Antwort (Ausgleich über stärkere Kontrolle: Betäubung/Schwächen).

## Die vier Abgrund-Materialien (Vorschlag, zurueckgestellt – echtes Endspiel)
**Stand:** Bilder liegen in `assets/forge/` (glutstein, runenfassung, seelenstein, verderbtes_blut), Code gibt es keinen. Der Besitzer hat den Vorschlag gelesen und **bewusst zurueckgestellt**: „Das ist schon wirklich Endgame, Endgame – wir sollten vorher noch ein paar Sachen aendern, die problematischer sind." Also **nicht anfangen, bevor er es wieder aufruft.**

**Der Gedanke: jedes der vier bricht genau eine harte Grenze des Umschmiedens.** Jede Grenze ist gut begruendet und jede ist eine Sackgasse, an der ein Spieler irgendwann steht.

| Material | Bild | Grenze heute | Was es taete |
|---|---|---|---|
| **Glutstein** | Stein mit gluehenden Rissen | Glut leer → `it.crafted`, nie wieder bearbeitbar | Facht die Glut wieder an |
| **Runenfassung** | Metallfassung mit Stein | `FORGE.maxRunes: 2` | Ein dritter Runenplatz |
| **Seelenstein** | Stein mit eingedruecktem Gesicht | Sonderboni (`it.fx`) fallen nur, machen kann man sie nie | Die Seele des Besiegten als Sonderbonus |
| **Verderbtes Blut** | Flaeschchen mit Rest | `CRAFT.raise.from` nur magisch → selten | Selten → legendaer, mit echtem Risiko |

Die Bilder sind so gemalt – ein Gesicht im Stein *ist* eine gefangene Seele, eine Fassung *ist* ein leerer Platz.

**Alle vier kommen aus dem Abgrund**, wie der Kronsplitter. Das ist der Kern: das einzige Material, das eine Regel bricht, kommt aus dem einzigen Ort, wo man seine Beute verlieren kann. Damit bekommt der Abgrund erstmals eine eigene Antwort auf „warum soll ich da runter" – nicht mehr Gold, sondern Dinge, die es oben nicht gibt. Sie liegen im Sack; wer unten stirbt, verliert sie. Grobe Verteilung: Glutstein aus Schatzkammern, Runenfassung von Elite-Raeumen, Seelenstein vom Abgrund-Boss, Verderbtes Blut steigend mit der Unruhe.

**Die Sorgen, in der Reihenfolge ihres Gewichts:**
- **Der Glutstein ist der gefaehrlichste.** Die Glut ist *die* Bremse gegen „ich wuerfle dieses Teil perfekt". Unbegrenzt nachlegen heisst: jeder baut in Ruhe das ideale Stueck und Beute wird bedeutungslos – derselbe Grund, aus dem `CRAFT.fuse.max` auf 1 steht. Vorschlag: **einer je Teil, fuer immer** (`it.glutAgain`), und nur bis zur Haelfte. Der Moment „Vollendet von <Name>" bleibt dann ein Moment.
- **Der Seelenstein darf nicht frei waehlbar sein.** Freie Wahl des Sonderbonus heisst: jeder nimmt denselben besten, die Entscheidung ist weg (GameGene-Problem „[one-dominant-strategy](https://gamegene.app/joseki/interesting-decisions)"). Deshalb **traegt der Stein die Seele des Bosses, der ihn fallen liess** – wer „des Henkers" will, muss den Richtigen toeten. Nebenbei werden verschiedene Gruefte dadurch erstmals unterschiedlich wertvoll.
- **Verderbtes Blut braucht zwingend die Zwei-Tipp-Sicherung** (`ask()`). Wir haben die Vorgeschichte: „Amulett neu weihen" ist rausgeflogen, nachdem *ein* Tipp dem Besitzer ein Amulett gekostet hat, und Dienste feuern bis heute beim ersten Antippen. Ohne Risiko waere es nur „gratis legendaer“ – ein Mittel ohne Gegenwert wird zum Patentrezept ([GameGene: Risk and return](https://gamegene.app/joseki/risk-and-return), Hamaguchi zu den Beschwoerungen in FF VII Remake). Entwurf, **sichtbar bevor man tippt**: ~45 % steigt auf und bekommt einen gewuerfelten Bonus, ~35 % nichts passiert und das Teil ist verdorben (kein Umschmieden mehr), ~20 % ein Bonus zerfaellt. **Wie hart, ist die Entscheidung des Besitzers – Geschmacksfrage, keine Messfrage.**
- **Die Runenfassung ist die langweiligste und deshalb die beste zum Anfangen.** Ein dritter Runenplatz ist eine gerade Linie, mit `power()` und der Methodik aus `tests/tree.mjs` sauber messbar, und kann nichts kaputtmachen.

**Vorgeschlagene Reihenfolge, wenn es drankommt:** Runenfassung (klein, messbar, baut das Geruest Abgrund-Material → Schmiede-Eingriff) → Glutstein (eine Zeile Logik, aber die Zahl muss gemessen werden) → Seelenstein (meiste Arbeit: Verknuepfung Boss → Seele) → Verderbtes Blut (zuletzt, verdient eine Mockup-Runde).


## Boni-Umbau & endloser Abgrund (Vorschlag 2026-11-21, nichts gebaut, wartet auf Entscheidungen)

**Befund (gemessen am Code, Spiel des Besitzers: Zauberin Stufe 22 schlägt alles mit einem Treffer):**
- Jeder Bonus wächst linear mit der Gegenstandsstufe, auch die %-Boni (`pctBase + iLvl × pctPerLvl`). Krypta Glocke
  Stufe 10 gibt Beute der Stufe 59: ein legendäres Teil mit Krit-Chance I hat ~57 %, Zaubertempo ~90 %. Die Deckel
  erreicht man schon mit Ausrüstung, danach lohnen nur noch Konstitution + Schaden.
- Hauptattribute und Schaden passen auf fast jeden Platz; Abwehr ist nur Leben/Rüstung. Ohne Schadensarten gibt
  es keine Resistenzen und damit keinen Grund, Platz auf Abwehr zu „verschwenden“.
- Beutestufe läuft der Gefahr davon (`cryptLvl` = Akt-top + 2 + Stufe × 3), Abgrund wächst nur mit Heldenstufe.

**Vorbilder:** D2 (feste Affix-Bereiche, iLvl schaltet nur frei; Hölle −100 % Resis zwingt Affixe auf Resis),
PoE (3 Präfix + 3 Suffix, eine Mod je Gruppe, feste Tiers je iLvl, Resi-Deckel 75 % mit Akt-Malus; Karten +
Skarabäen als endloses, selbst eingestelltes Risiko), PoE2 (weniger Affixe, Einzigartige nur über seltene
Währung veränderbar), D4 Season 4 „Loot Reborn“ (Affixe auf 3 gekürzt, Unsinn gestrichen; Aspekte aus Legendären
auf andere Teile übertragen; die Grube als endlose Stufenleiter; Resi-Malus je Qual-Stufe).

**Vorschlag in vier Stufen:**
1. **Feste Tiers (Weg 2 aus UEBERGABE):** jeder Bonus hat je Tier einen festen Wertebereich, die Gegenstandsstufe
   schaltet nur höhere Tiers frei. %-Boni klein und flach (Richtwert Krit-Chance I = 5–6 % je Teil).
   **Präfix/Suffix:** Angriff = Präfix, Abwehr/Nutzen = Suffix; magisch 1+1, selten 2+2, legendär 3+2.
   **Strengere Platz-Pools:** Schaden nur auf Waffe/Handschuhe/Schmuck, Hauptattribut nicht überall.
2. **Drei Schadensarten + Resistenzen:** Körper, Feuer, Gift (Frost optional als vierte). Zauber und Gegner
   bekommen eine Art; Resi-Deckel 75 %. Früher abgelehnt wegen „6 Elemente = zu viel Text“ → darum nur 3.
3. **Abgrund endlos** (Tiefe ohne Deckel, Gegner nach Tiefe statt Heldenstufe, Resi-Malus je 10 Tiefen) mit
   **Siegeln wie Skarabäen:** vor dem Abstieg bis zu 3 Siegel einlegen (mehr Gefahr ↔ mehr/gezieltere Beute).
   Die vier Abgrund-Materialien könnten genau diese Siegel sein.
4. **Sehr seltenes Abgrund-Teil „Aschenkern“ (Arbeitsname):** zieht **einen** Bonus aus einem Einzigartigen
   (das zerfällt) und fusioniert ihn auf ein nicht-einzigartiges Teil (wie D4-Aspekte); höchstens einer je Teil.

**Reihenfolge:** 1 zuerst (beendet das One-Shotten), dann 2, dann 3+4 zusammen. Jede Stufe: Kalibrierung
(`tests/calib.mjs`, `tree.mjs`, `uniques.mjs`), Bots vorher/nachher.
**Offen beim Besitzer:** alte Teile umrechnen (werden schwächer) oder Neustart? 3 oder 4 Schadensarten?
Was heißt „mehr Würfel“ (mehr Zufall beim Fund, oder mehr Würfel-Werkzeuge in der Schmiede)?
