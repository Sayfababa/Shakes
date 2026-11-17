# Aschenkrone — Stand der Dinge

Düsteres Browser-RPG im Stil eines Questing-/Auto-Battler-Spiels: Aufträge, automatischer
Kampf, Beute, Händler. Optik Diablo 1/2 — dunkel, ernst, handgemalt. Spielsprache Deutsch.
Vanilla JS, ES-Module, kein Build-Step; Spielstand in localStorage. Wird vor allem am Handy
als Homescreen-App gespielt, deshalb gilt überall: **kein Scrollen**, jede Ansicht muss auf
iPhone SE (375×667) passen.

## Klassen und Zauber

Sechs Klassen, jede mit einem Hauptattribut und einer passiven Eigenschaft, die sie allein
trägt: **Barbar** (Stärke, Raserei), **Paladin** (Stärke, blockt 25 %), **Assassine**
(Geschick, Krit + Bluten), **Jägerin** (Geschick, schlägt immer zuerst), **Zauberin**
(Intelligenz, ignoriert halbe Rüstung), **Grabhexe** (Intelligenz, Lebensraub 20 %).

Je Klasse drei Zauber, freigeschaltet auf Stufe 1, 8 und 18. Sie wirken automatisch jeden
n-ten eigenen Zug statt eines Hiebs; ihre Stärke steigt mit Intelligenz, weshalb Intelligenz
für alle Klassen etwas wert ist.

Jeder Zauber hat **drei Wege-Stufen** (ab Charakterstufe 6/14/22), auf jeder wählt man einen
von zwei Wegen — insgesamt also 9 Entscheidungen je Zauber-Satz. Die Wege sind echte
Bausteine, nicht nur Zahlen: sofort zu Kampfbeginn wirken, Gift stapeln, den Gegner
verwundbar machen, ihn am Heilen hindern, Betäubung, Gift zur Detonation bringen und so
weiter. Erste Wahl gratis, Wechsel kostet Gold.

## Kampfsystem

Der Kampf ist eine reine Simulation ohne Spielereingriff: zwei Seiten, abwechselnd Züge, bis
einer fällt. Der Spieler sieht ihn als Animation und kann während des Kampfs nichts tun — die
Entscheidungen liegen **davor** (Ausrüstung, Talente, Zauber-Wege, Tränke).

Alle Effekte sind generisch und gelten für Hieb **und** Zauber: Krit, Ausweichen, Blocken,
Lebensraub, Bluten, Gift, Rüstung ignorieren, Regeneration, Dornen, Henker (Bonus gegen
Geschwächte), Erstschlag, Betäubung. Zauber sind nur nicht blockbar. **Es gibt genau eine
Schadensart** — keine Elemente, keine Widerstände, keine Verwundbarkeiten. Monster wirken
keine Zauber.

Vor jedem Kampf steht die Siegchance; Bosse nennen ihre Besonderheit vorher (jeder Boss hat
eine eigene Mechanik, z. B. Raserei, Dornen, jeder dritte Schlag betäubt). Nach dem Kampf
gibt es eine Bewertung nach Restleben (Überlegen/Sicher/Knapp), die Gold und Beutechance
beeinflusst, nicht die EP.

**Kampfkraft** ist eine einzelne analytische Schätzzahl, mit der Items verglichen werden —
grünes ▲ heißt „besser".

## Ausrüstung

- **37 Grundgegenstände** über 10 Plätze (Helm, Brust, Handschuhe, Stiefel, Gürtel, Amulett,
  Nebenhand, zwei Ringe, Waffe), Rasterinventar wie Diablo.
- **Seltenheiten**: zerbrochen, gewöhnlich, magisch (2 Affixe), selten (bis 4), legendär
  (bis 5). Selten erst ab Gegenstandsstufe 4, legendär ab 10.
- **18 Affixe** plus 18 automatisch erzeugte Zauber-Boni (nur auf der Klassenwaffe): Attribute,
  Schaden, Rüstung, Leben %, Krit-Chance, Krit-Schaden, Schaden %, Zauberschaden, Rüstung
  ignorieren, Lebensraub, Blocken, Ausweichen, Dornen, Zaubertempo. Jeder Bonus hat eine
  **Stufe I–V** (I am besten, erst ab Gegenstandsstufe 20).
- **13 Sonderboni** als seltene Draufgabe ab Gegenstandsstufe 8: Zauber-Echo, Schild bei
  Kampfbeginn, mehr Schaden bei wenig Leben, jeder dritte Hieb trifft doppelt, Krit heilt,
  Blocken gibt Schild, Krit bricht Rüstung, überlebt einen tödlichen Treffer, heilt einmal
  unter 30 % Leben, kann sich nie heilen.
- **33 Einzigartige** mit festen Boni, Sonderbonus und eigenem Spruch. Die zweite Welle
  verändert jeweils eine Regel oder handelt etwas ein (Glaskanone: viel Schaden, weniger
  Leben; ein Pakt, der Heilung ganz verbietet). Sie fallen zufällig aus legendärer Beute —
  **ohne feste Herkunft**.
- **5 Grab-Sets** à 3 Teile, je Krypta eines, grün, fallen nur beim Boss ihrer Krypta. Zwei
  Teile geben einen guten Bonus, drei Teile eine **Regeländerung** (unter halbem Leben heilt
  alles doppelt, dein Gift heilt dich, erster Zauber wirkt zweimal).

Fremde Waffenart (nicht die der Klasse) kostet 30 % Schaden und 40 % Zauberkraft.

## Handwerk

Zwei getrennte Dinge in der Schmiede:

**Runen** (8 Stück) werden über ein Minispiel ins Item geschlagen und geben feste Boni;
begrenzte Zahl je Teil. Dazu **Dienste** bei den Händlern: Schärfen (Waffenplatz),
Verstärken (Brustplatz), Neu weihen (Amulett), Bestellen beim Schmied. Schärfen und
Verstärken gehören dem **Platz**, nicht dem Teil — die Stufe bleibt, wenn die Waffe wechselt.

**Umschmieden** arbeitet mit Materialien und einem Vorrat „Schmiedeglut" je Item (16–30 +
Zufall, jeder Eingriff verbraucht etwas plus 0–2 unvorhersehbar). Fünf Eingriffe:
Versiegeln (ein Bonus wird eingefroren, einer je Item), Neu würfeln, Werte würfeln,
Hinzufügen, Tilgen. Ist die Glut verbraucht, ist das Teil endgültig. Runen, Sonderboni,
Einzigartige und Set-Teile bleiben unberührt. Craften und Verkaufen bringt nie Gold.

## Das Brett (Talente)

Ein Talentpunkt je Stufe. Es gibt **zwei Systeme parallel**:

Der **alte Baum** (noch für fünf Klassen): 3 Zweige, 27 Ränge — bei etwa 24 Punkten am Ende
der Geschichte also praktisch voll. Es gibt keine Wahl, nur eine Reihenfolge.

Das **Brett** (bisher nur die Assassine, nach PoE-Vorbild): 3 Spalten × 6 Reihen von unten
nach oben, dazu 2 Brücken zwischen benachbarten Spalten. Kleine Knoten, zwei **Notable**
(ändern eine Regel), oben ein **Schlüsselstein**, der viel gibt und etwas wegnimmt
(Ausbluten: jeder Treffer lässt bluten, dafür nie mehr kritisch; Schattenform: viel
Ausweichen, dafür 15 % weniger Leben). Ein Knoten öffnet sich, wenn der darunter voll ist
oder eine voll ausgebaute Brücke dort endet. **Knappheit ist der Kern**: 41 Ränge gegen
~24 Punkte, ein Schlüsselstein kostet 11 Punkte in seiner Spalte. Läuterung kostet Gold,
die erste ist gratis.

## Alchemie

14 Tränke (6 gewöhnliche, 8 seltene) aus 6 Kräuterarten, die je Ort fallen. Tränke wirken
**nur in der Krypta und im Abgrund**, wo der Gegner vorher bekannt ist. Gürtel mit 2 Plätzen
(3 ab Händlertreue III). Gewöhnliche haben 3 Ladungen und einen wählbaren Auslöser (bei
Kampfbeginn, unter 50/30 % Leben, bei Gift, wenn der Gegner heilt). Seltene haben eine
Ladung, wirken den ganzen Kampf und sind **Konter gegen Gegnerwerte** — gegen viel Krit,
gegen Ausweichen, gegen Blocken.

Die Vorbereitungsansicht zeigt die Werte des Gegners, was er vorhat, und ein Hinweiskärtchen,
das den passenden Trank mit einem Tippen packt oder braut. Dazu „Bester Gürtel", der alle
Kombinationen gegen genau diesen Gegner durchprobiert.

## Akte (Hauptspiel)

Sechs Akte, je ein Ort und ein eigener Boss, je 8 Gebiete auf einem Weg von unten nach oben.
Neue Gebiete kosten nichts und haben keine Wartezeit; eine Niederlage kostet nichts.
Geschaffte Gebiete **wiederholen** kostet Glut (die Energiewährung, 120 Höchststand, 1 pro
4 Minuten). Zwei Gebiete je Akt sind Elite-Gebiete mit zwei Zusatzeigenschaften. Der Akt-Boss
öffnet den nächsten Akt und eine Krypta.

Fünf **Krypten** sind reine Boss-Kämpfe mit Stufen: jede besiegte Stufe macht die nächste
härter (+3 Gegnerstufen, +6 %) und die Beute besser. Die ersten vier Bosse geben je einen
Glockensplitter, vier Splitter öffnen die fünfte Krypta — dort kämpft der Held gegen sich
selbst, mit seinen eigenen Talenten.

Dazu als Nebenbeschäftigung: **Expedition** (1–8 Stunden Leerlauf, Karte mit Gabelungen, 12
Ereignisse mit je drei Wahlen), **Umherziehen** (Idle bei offener App, selbst gewählte Route,
höchstens 2 Stunden am Stück), **Die Grube** (Rangleiter gegen 50 feste Rivalen mit festen
Kampfstilen; Stufe hängt am Platz, nicht am Helden — Titel und einen Laden als Belohnung),
sowie Aufträge von sechs Questgebern, täglich drei Steckbriefe und ein tägliches Omen.

Der Bot erreicht Akt VI nach etwa 3–7 Tagen auf Stufe 16–20; die Geschichte endet um Stufe 24.

## Endspiel: Der Abgrund

Roguelike-Karte plus Extraktion nach dem Vorbild von Tarkov. Drei Abstiege am Tag, je Gruft
frei, sobald ihr Boss gefallen ist. Fünf Reihen (Kampf / Elite mit zwei Eigenschaften /
Schatzkammer / Schrein), oben der Boss. **Leben und Trankladungen laufen über die Räume
mit** — es gibt keine Heilung zwischen den Kämpfen außer über Schreine.

Jeder Raum erhöht die **Unruhe** um 1: Gegner werden 8 % stärker, Beute 40 % besser, bis zum
Dreifachen. Gold, Items und Material landen in einem Sack und zählen erst, wenn man
hinauskommt: über ein Seil (Reihe 2, gratis), einen Brunnen (Reihe 3), die Stiege (jederzeit,
kostet einen Kampf) oder den Bosssieg. **Stirbt der Held, ist der Sack weg** — Ausrüstung,
Stufe und EP bleiben.

Geplant, aber nicht gebaut: Beutesack-Raster mit sicherem Fach, 24 Ereignisse mit Folgen,
Grabsiegel, Aufwertungsmaterialien, Einzigartige nur von hier, ein Atlas.

## Wichtige Zahlen und Kappen

- Obergrenzen: Krit-Chance 60 %, Krit-Schaden ×3,5, Lebensraub 40 %, Dornen 60 %, Ausweichen
  50 %, Blocken 50 %, Rüstung ignorieren 90 %. Sie kürzen **nur** Item-Boni, nie Klassen- oder
  Talentwerte. Der Schlüsselstein Schattenform hebt die Ausweich-Grenze.
- EP für die nächste Stufe = 90 × Stufe^1,75. 5 Attributpunkte und 1 Talentpunkt je Stufe.
- Grundkrit 5 %, Rüstung sättigt (höchstens 60 % Schadensminderung), Zauberkraft sättigt bei
  ×2.
- Beutechance 55 %, 60 % der Legendären sind Einzigartige, Set-Teil beim Krypta-Boss 20 % +
  5 % je Stufe (höchstens 55 %).
- Bosse: 2,2-faches Leben, 1,35-fache Schwierigkeit. Akt-Boss-Faktoren steigen bewusst:
  Akt I 0,52 → Akt II 0,72 → ab Akt III 0,95.
- Inhalt in Zahlen: 12 Monsterarten, 37 Grundgegenstände, 36 Affixe, 13 Sonderboni, 33
  Einzigartige, 5 Sets, 14 Tränke, 8 Runen, 50 Grubenrivalen, 6 Akte mit je 8 Gebieten,
  5 Krypten.
- Balance wird nicht geschätzt, sondern gemessen: eigene Simulationsskripte mit gekoppeltem
  Zufall messen für jeden Trank, jeden Zauber-Weg, jedes Einzigartige, jedes Set und jeden
  Talentknoten die Änderung der Siegchance in Prozentpunkten gegen eine ~50-%-Basis. Ein
  Durchlauf aller Tests (Logik, Browser-UI auf vier Handys, Zufalls-Tipp-Tests, alle
  Balance-Messungen) dauert knapp zwei Minuten und muss vor jedem Push grün sein.

## Bekannte Probleme

1. **Nur eine Achse.** Eine Schadenszahl, eine Rüstungszahl. Damit ist jedes Fundstück
   schlicht besser oder schlechter als das getragene, und die Kampfkraft-Zahl sagt es einem
   sogar. Keine Elemente, keine Widerstände, keine Gegner-Verwundbarkeit — also kein Grund,
   ein Teil im Beutel zu behalten. Das ist die Wurzel der meisten anderen Punkte.
2. **Handwerk ist fast reines Glücksspiel.** Vier der fünf Umschmieden-Eingriffe sind Zufall,
   der fünfte friert Zufall nur ein. Es gibt keinen Schritt, der einen *bestimmten* Bonus
   setzt — kein Gegengewicht wie PoEs Essenzen oder Werkbank. Zusammen mit der endlichen
   Schmiedeglut heißt das: ein guter Wurf kann nicht ausgebaut, nur eingefroren werden.
3. **Kein Gegenstand, auf den man zuarbeitet.** Die 33 Einzigartigen haben keine Herkunft.
   Nur die Grab-Sets machen es richtig.
4. **Zwei Talentsysteme parallel.** Das Brett gibt es nur für die Assassine; fünf Klassen
   laufen noch auf dem alten, faktisch vollen Baum. Das fühlt sich schief an und hält zwei
   Codepfade offen.
5. **Die Vorbereitung nimmt ihre eigenen Entscheidungen weg.** „Bester Gürtel" und die
   Hinweiskärtchen rechnen dem Spieler die Antwort aus, statt ihm eine Frage zu stellen.
6. **Klassenlücke.** Jägerin und Grabhexe sind in den späten Akten rund 30 % langsamer als
   die übrigen. Offener Balancefehler.
7. **Endspiel ohne gewählte Gefahr.** Die Unruhe im Abgrund steigt automatisch. Es fehlt die
   Karten-Idee von PoE: Gegnerboni, die der Spieler selbst dazuwählt, gegen mehr Beute.
   Entsprechend gibt es kaum Grund, die sechs Akte zweimal zu sehen.
8. **Eine Messlücke im Werkzeug.** Die Eichung der Affix-Werte läuft nicht im Testlauf mit,
   sondern muss von Hand angesehen werden. Deshalb stand Krit-Schaden lange auf einem Drittel
   seines Zielwerts, ohne dass es auffiel.
9. **Atmosphäre fehlt.** Keine Ortsbilder, kein Ton. Der Diablo-1-Eindruck lebt zu großen
   Teilen von Licht und Geräusch; davon hat das Spiel nichts.
