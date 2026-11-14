# Drei Bots spielen Aschenkrone (30 Tage, `node tests/personas.mjs 30`)

Ohne Schummeln: nur Aktionen der App (Spur wählen, Tiefer/Heimkehren, Krypta, Grube, Kaufen/Verkaufen/Anlegen,
Punkte, Talente, Dienste, Quests). Entscheidungen nur mit Infos, die die App zeigt (Gefahr-Anzeige, Werte, Preise).
Gespielt in festen Sitzungen pro Tag; dazwischen läuft die Zeit (Glut lädt, Streifzüge laufen weiter). Zwei Durchläufe, Ergebnisse stabil.

| | Optimist (Assassine) | Realist (Paladin) | Pessimist (Grabhexe) |
|---|---|---|---|
| Sitzungen/Tag | 4 (2:40 h) | 3 (1:50 h) | 2 (1:10 h) |
| Spielstil | blutige Spur ab 55 % Siegchance, tief gehen, kauft viel, eilt immer | blutig ab 80 %, normal sonst, tief nur bei ≥ 80 % | nur normale Spur, nie tiefer, Krypta erst ab 85 % |
| Stufe Tag 7 / 14 / 30 | 18 / 26 / 34 | 19 / 26 / 35 | 13 / 17 / 25 |
| Story-Finale | Tag 13 | Tag 13 | Tag 30 |
| Niederlagen gesamt | ~8 | 2–3 | ~2 |
| Gold am Ende | ~100.000 | ~250.000 | ~15.000 |
| Aktiv gespielt / gewartet (in Sitzungen) | 212 / 4588 min | 166 / 3134 min | 206 / 1894 min |
| Sitzungen ohne jeden Fortschritt | 37 von 120 | 32 von 90 | 16 von 60 |
| Tage ohne Quest | 21 von 30 | 20 von 30 | 17 von 30 |

## Einig waren sich alle drei
1. **Man wartet fast nur.** Über 90 % der Sitzungszeit (Pessimist ~90 %, Optimist 96 %) war Warten auf Glut. Eine Sitzung = ein paar Minuten Spiel, dann nichts.
2. **Der Anfang ist zu großzügig.** Alle drei hatten an Tag 1 ein legendäres Item, zwei Bosse und den ersten Treue-Aufstieg. Die größten Momente sind sofort verbraucht.
3. **Nach der Geschichte ist es leer.** Alle 34 Quests waren bei Optimist/Realist an Tag 13 erledigt; danach 17 Tage ohne Quest, nur noch dieselben Krypten auf Albtraum.
4. **Die Gefahr-Anzeige ist fair – vielleicht zu fair.** Wer nur bei guter Chance kämpft, verliert praktisch nie. Bosse fühlten sich nie bedrohlich an.
5. **Die Zahlen explodieren.** Leben ~40.000–120.000, Schaden 300–700 ab Stufe 25–35. Passt nicht zum düsteren, bodenständigen Ton (Diablo 2: wenige tausend Leben).

## Uneinig waren sie
| Thema | Optimist | Realist | Pessimist |
|---|---|---|---|
| Risiko (Spur/Tiefe) | „Lohnt sich immer“ – 349× blutige Spur, kaum Verluste | „Blutige Spur ist fast immer die richtige Wahl → keine echte Entscheidung“ | Nie Risiko genommen, nie bestraft – nur langsamer (Stufe 25 statt 35) |
| Gold | Alles ausgegeben (300.000 in Waren) – „Händler sind spannend“ | 250.000 ungenutzt – „Gold ist ab Woche 2 bedeutungslos“ | Knapp, musste abwägen – Gold war für ihn bis zum Ende wertvoll |
| Wartezeiten | Eilen für 1 Gold (342×) macht Timer bedeutungslos | Wartet, findet Sitzungen zu kurz | Wenige Sitzungen, Wartezeit stört weniger |
| Tempo | Zu schnell durch, danach Leere | Gleich wie Optimist, trotz weniger Spielzeit | Angenehmes Tempo, Finale erst an Tag 30 |
| Finale | Krone genommen | Glocke zerbrochen | Glocke zerbrochen |

## Gemeinsames Fazit
Der Kern funktioniert für alle drei Spielertypen: Man wird stärker, kauft sinnvoll ein, schafft die Geschichte, und keiner bleibt hängen.
Aber die Kurve ist falsch geformt: **zu viel am ersten Tag, zu wenig nach Tag 13**. Dazu kommen drei Probleme:
- **Glut** begrenzt zu stark: man spielt Minuten und wartet Stunden.
- **Gold** verliert früh seinen Wert, und **Eilen** ist zu billig.
- **Risiko** wird kaum bestraft, deshalb ist die blutige Spur keine echte Entscheidung.

## Empfohlene Änderungen (Priorität)
1. **Anfang strecken**: Boss-Beute und Händlerware am Anfang höchstens selten statt legendär; Treue-Schwellen höher.
2. **Glut-Rhythmus**: mehr Glut-Regeneration oder größerer Vorrat, damit eine Sitzung 10–15 Minuten echtes Spiel hat.
3. **Gold-Senken**: Eilen kostet mit der Stufe mehr; teure Händler-Ware höherer Treue; Läuterung/Dienste skalieren.
4. **Risiko spürbar machen**: blutige Spur/Tiefe mit echten Verlusten (Zahlen anpassen, bis sie „mäßig“ statt „gering“ zeigen).
5. **Endspiel**: tägliche Kopfgelder, Albtraum-Questkette, neue Bosse – damit nach Tag 13 etwas zu tun bleibt.
6. **Zahlen zähmen**: Leben/Schaden-Formeln flacher (linear statt quadratisch), Affix-Werte begrenzen.


---

# Runde 2: nach den Änderungen (gleiche Bots, gleiche 30 Tage)

## Was geändert wurde
| Problem | Änderung |
|---|---|
| Anfang zu großzügig | Legendär erst ab Gegenstandsstufe 10, Selten ab 4; Boss-Beute der ersten Krypten nur magisch; Treue-Schwellen 200/700/1600 statt 120/400/1000; flachere Stufenkurve (90·Stufe^1,75) |
| Zahlen explodieren | Leben wächst linear (Kon × Klasse × (3 + Stufe·0,25)), Schaden × (1 + Haupt/20) statt /10, Affix-Werte halbiert |
| Gold wertlos | **Glücksgriff** bei Ysolde (wie D2-Glücksspiel, 60 + 45×Stufe Gold), **Eilen** kostet mit Restzeit × Stufe |
| Risiko ohne Folgen | Blutige Spur: Gegner ≥ deine Stufe + 4, ×1,55; jede Tiefe +3 Stufen, +15 % |
| Glut zu knapp | Vorrat 120 statt 100, +1 Glut alle 4 statt 6 Minuten (+50 % pro Tag) |
| Leere nach der Story | **Steckbriefe**: täglich 3 neue Aufträge mit Lohn; Prophet-Kette geht weiter (Albtraum, Hölle, Titel „Der Unvergängliche“) |
| (gefunden) | „Ordnen“ konnte Items verlieren · Steckbriefe konnten das Spiel einfrieren (beide behoben, mit Tests) |

## Vorher → nachher
| | Optimist | Realist | Pessimist |
|---|---|---|---|
| Story-Finale | Tag 13 → **Tag 16** | Tag 13 → **Tag 17** | Tag 30 → **nach Tag 30** (Stufe 21) |
| Erstes legendäres Item | Tag 1–2 → **Tag 2+** | Tag 1 → **Tag 2+** | Tag 1 → **Tag 5** |
| Niederlagen | ~8 → **21** (davon 18 in der Tiefe, 4.764 Gold verloren) | 2 → **7** | 2 → 0 |
| Gold am Ende | 100.000 → **9.500** | 250.000 → **22.000** | 15.000 → 30.000 |
| Gold ausgegeben | 300.000 → 600.000 (Händler, Glücksgriff, Eilen) | 140.000 → 466.000 | 74.000 → 56.000 |
| Leben auf Stufe ~34 | 113.000 → **22.500** | 123.000 → **24.000** | 41.000 → 6.600 (Stufe 21) |
| Sitzungen ohne Fortschritt | 37 → **32** /120 | 32 → **22** /90 | 16 → 19 /60 |
| Steckbriefe erfüllt | – | – | 55 / 54 / 13 |

## Neue gemeinsame Meinung
- **Einig:** Risiko hat jetzt Gewicht. Der Optimist verliert spürbar Beute in der Tiefe, der Realist gelegentlich, der Pessimist spielt sicher, aber deutlich langsamer (Stufe 21 statt 33). Das ist eine echte Entscheidung.
- **Einig:** Gold ist wieder etwas wert. Niemand sitzt mehr auf Hunderttausenden. Glücksgriff und Eilen schlucken den Überschuss.
- **Einig:** Nach der Geschichte gibt es jeden Tag etwas zu tun, nämlich Steckbriefe und die Albtraum-Kette.
- **Uneinig:** Der Pessimist schafft die Geschichte in 30 Tagen nicht mehr. Für vorsichtige Spieler mit wenig Zeit ist das Spiel jetzt lang. Die beiden anderen finden das Tempo angemessen.
- **Bleibt:** In langen Sitzungen wartet man weiter viel auf Glut. Das gehört zum Spielprinzip (kurze Sitzungen über den Tag verteilt), ist aber spürbar seltener leer.
