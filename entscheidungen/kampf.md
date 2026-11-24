# Kampf & Werte

### Kurven

**Kurven** in `CFG` (xpBase/xpExp, hpBase/hpPerLvl, mainDiv, affix*, rareMinLvl/legendaryMinLvl, bossHp/bossDiff). Änderungen immer mit `tests/personas.mjs` prüfen.

### `power()` mittelt über die Gegner-Streuung

**`power()` mittelt über die Gegner-Streuung** (`spread()` in state.js): Die Schätzung rechnete gegen **einen** Vertreter-Gegner mit Geschick `en = 3 + Stufe × 2,7`. Auf Stufe 20 landete der genau auf der Ausweich-Grenze (0,509 → gekappt auf 0,5), während ein Held mit 10 Geschick mehr knapp darunter lag – ein Geschick-Bonus sah dadurch **doppelt so gut** aus wie im Kampf (Schätzung 2,07, Kämpfe 1,00). Im Spiel wäscht die Monstervielfalt (Geschick 47–80 auf Stufe 20) die Kante aus, deshalb mittelt `power()` die beiden Ausweich-Terme jetzt über 0,72× / 1× / 1,28× `en`. **Ehrlich gesagt ist das eine kleine Verbesserung, keine Reparatur:** der Gesamtfehler gegen 2000 Kämpfe je Punkt fiel nur von 2,68 auf 2,57, und für den Paladin steht die Spitze weiter bei 2,04. Flaches Geschick bleibt für Fremdklassen schlecht geschätzt. Wer das weiter verfolgt: der Rest des Fehlers steckt darin, dass `power()` gegen einen Gegner rechnet, das Spiel aber über viele Gegner **und** Kampflängen mittelt.

### Kampfkraft

**Kampfkraft** (`power()`, `powerWith(item)`, `powerAttr(k)` in state.js): eine Zahl, deterministisch gegen Gegner eigener Stufe. Grundlage für Item-Vergleich (Tooltip-Box, grünes ▲ an Beutel/Laden, Toast nach Anlegen) und „+N“ an den Attribut-Knöpfen. Neue Effekte dort mit einrechnen.

### Kampf-Boni auf Items

**Kampf-Boni auf Items** (`AFFIXES` mit `pct`/`slots`/`kind` in data.js): Krit-Chance `critc`, Krit-Schaden `critd` (Multiplikator 2 + x, max. `CAPS.critMult` = 3,5), Schaden % `dmgp`, Zauberschaden `spellp`, Rüstung ignorieren `penp`, Lebensraub `leechp`, Leben % `lifep`, Blocken `blockp`, Ausweichen `evadep`, Dornen `thornsp`, Zauber-Boni `sk_<zauber>` (nur Waffe der Klasse, `boost` am Zauber). Welche Boni ein Teil tragen kann: `affixPool(it)` in loot.js – gilt für Beute, Umschmieden und Neu weihen. Prozent-Boni wachsen flacher (`CFG.pctBase/pctPerLvl`). Obergrenzen `CAPS` kürzen nie Klassen-/Talentwerte (`cap()` in stats). **Eichung:** `node tests/calib.mjs` zeigt je Bonus Stufe III ÷ Hauptattribut (Verteidigung ÷ Konstitution); Ziel ~0,85–1,2. **Abgesichert ist das nicht über ein `--check`, sondern über den Logik-Test „Eichung: jeder Prozent-Bonus …" in `tests/logic.test.mjs`**, der calib.mjs aufruft und Stufe 20 gegen 0,7–1,4 prüft – er läuft also in jedem Testlauf mit. Er prüft aber nur die Boni, die **namentlich in seiner Liste stehen**: genau deshalb konnte `critd` auf 0,32 absacken, ohne dass etwas piepte. **Neuer Prozent-Bonus → unbedingt in diese Liste eintragen**, sonst ist er unbewacht. Neue Boni immer eichen und in `power()` einrechnen. **Flache Werte** (str, dex, int, lck, armor, dmg) misst calib.mjs mit, aber **bewusst ohne Wache** – ihr „richtiger" Wert ist klassen- und stufenabhängig und damit nicht auf eine Schranke zu bringen. `node tests/calib.mjs --cls` zeigt sie je Klasse; der Schnitt über sechs Klassen versteckt den Entwurf (für die eigene Klasse steht das Hauptattribut immer auf 1,00, für fremde Klassen soll `+str` wenig bringen). Gemessen (2000 Kämpfe je Punkt): **flaches Geschick ist für Nicht-Geschick-Klassen früh besser als das Hauptattribut (×1,45 auf Stufe 10) und spät deutlich schlechter (×0,40 auf Stufe 40)** – das ist echtes Spielverhalten, kein Fehler. `lck` liegt für alle Klassen bei 0,27–0,52, ist also durchweg ein schwacher Wert (nie festgelegt, ob gewollt).

### Treffer-Wirkungen

**Treffer-Wirkungen** (combat.js): `finish()` (Henker, Krit) und `onHit()` (Lebensraub, Bluten, Gift, Glocke, Dornen) gelten für Hieb **und** Zauber. Neue passive Effekte dort eintragen → wirken automatisch auf beides. Zauber sind nur nicht blockbar.

### Klassenwaffe

**Klassenwaffe**: fremde Waffenart → Schaden ×`offWeapon`, Zauberkraft ×`offWeaponSpell` (Tooltip sagt es, Kampfkraft rechnet es ein).

### Attribute

**Attribute** haben für jede Klasse einen Zweck (`ATTR_INFO`): Stärke → Rüstung (`strArmor`), Int → Zauber, Haupt → Schaden.

### Kampfbewertung

**Kampfbewertung** (`GRADES`, `gradeOf()` in game.js): Restleben → Überlegen/Sicher/Knapp, Bonus auf Gold + Beute-Chance (nicht EP, sonst kippt das Tempo).

### Kampf-Einblendungen

**Kampf-Einblendungen** (`combatFx()` in main.js): Log-Einträge tragen Anzeige-Felder aus combat.js (`dmg`, `crit`, `hits` bei Mehrfachtreffern, `heal` = Lebensraub/Regeneration/Heilzauber, `shield`, `buff`, `tick`+`tk` Gift/Bluten, `dot`, `thorns`, `miss`, `stun`, `rage`). Schwebende Zahlen `.fnum` (Zauber in Zauberfarbe, erst beim Einschlag; Krit groß + `.quake`), Heilung grün links am eigenen Bild, beim Sieg Gold-Münze `.goldpop` über dem besiegten Gegner (grau). Neue Kampfeffekte: Feld im Log setzen, dann in `combatFx` anzeigen.

### Siegchance gekoppelt
Gebaut 2026-11-19 (Befund: Screenshot „mit Tränken 75 %, ohne 83 %" – kein Trank-Fehler, Rauschen aus je 24
ungekoppelten Kämpfen, ±8 Punkte). Jetzt: `seeded()` in rng.js gibt jedem Probekampf einen festen Würfel (Keim
aus der Kampfnummer), „mit" und „ohne" treffen auf dieselben Gegner mit denselben Würfeln; `bestBelt()` ebenso
(jede Kombination dieselben Würfel). `CFG.chanceN` = 200 Kämpfe. **Tempo gemessen** (Chromium, schlimmster Fall:
Spiegelkampf über volle 50 Runden mit vollem Gürtel): 0,13 ms/Kampf → 51 ms je Paar; bei 4-facher CPU-Drossel
0,30 ms → 120 ms. Typischer Bosskampf in Node: 16 ms je Paar, schlimmster 31 ms. Am echten iPhone nicht gemessen.
**„etwa gleich"**: `chancePair()` zählt b = nur mit Tränken gewonnen, c = nur ohne; liegt |b−c| ≤ 2·√(b+c), zeigt die
Vorbereitung „ohne Tränke etwa gleich" statt einer Zahl, die eine falsche Rangfolge behaupten könnte.
Gegenprobe (6 Klassen × 4 Gürtel, Stufe 24, Boss auf ~50 %): Rangfolge mit/ohne in 24 von 24 Fällen richtig
(Wahrheit aus je 3000 ungekoppelten Kämpfen); die absolute Zahl schwankt weiter um ±3–6 Punkte.

### Serienbremse beim Ausweichen
**Gebaut 2026-11-19** (zuerst zurückgehalten, dann nach seiner Wahl „1a“ eingebaut, siehe unten). Regel: in `combat.js` eine Hilfe
`dodged(x, y)` statt der zwei Ausweich-Würfe in `strike()` und `spell()`; Zähler `x.evN` je Angreifer, gemeinsam für
Hiebe und Zauber; nach `CFG.evadeStreak` (2) Ausweichern trifft der nächste Angriff sicher (Blocken bleibt möglich),
jeder Nicht-Ausweicher setzt den Zähler auf 0. Gegenprobe (Stufe 24, 600 Kämpfe, gleiche Würfel, Gegner ohne Bremse
auf ~50 % geeicht): Barbar 48→63, Paladin 50→59, Zauberin 52→66, Hexe 53→65, Assassine 51→50, Jägerin 53→52;
Serien ≥3 vorher in 30–44 % der Kämpfe (Nicht-Geschick-Klassen), nachher nie. `tests/calib.mjs` unverändert
(misst `power()` analytisch, nicht Kämpfe) – aber `power()` kennt die Bremse nicht (überschätzt Ausweichen am
50-%-Deckel um bis zu ~14 %: effektiv (p+p²)/(1+p+p²) = 43 % statt 50 %).
**Warum nicht gepusht:** der volle Lauf kippt `tests/sets.mjs`: Kutte des Verseuchten, Hexe Stufe 14, 3 Teile
+23,3 Punkte (Grenze −2…22). Gegenprobe mit 1600 Kämpfen: vorher +19,6, mit Bremse +21,9 – echt, nicht Rauschen
(mehr Treffer = mehr Gift-Auslösungen), lag aber schon vorher knapp unter der Grenze. Der zweite Ausreißer im Lauf
(Fokus, Zauberin Stufe 14, 0,4 < 1) war Rauschen: bei 1200 Kämpfen alt wie neu +2,1.
Wege (Besitzer entscheidet): Kutte-3-Teile-Bonus (`venom` 0,35) etwas senken; oder die Schranke nach gemessener
Verteilung neu setzen; oder die Bremse auf 3 in Folge lockern. Der Code (in `fight()`, `strike()`/`spell()` rufen
`if (dodged(x, y)) return say(…)` bzw. `if (dmgKind && dodged(x, y))`, dazu `evadeStreak: 2` in `CFG`):
```js
function dodged(x, y) {
  if ((x.evN || 0) >= CFG.evadeStreak) { x.evN = 0; return false; }
  const evade = Math.max(0, Math.min(0.5 + (y.evadeCap || 0), y.dex / (y.dex + x.dex * 3 + 40) + (y.evade || 0)) - (x.acc || 0));
  if (chance(evade)) { x.evN = (x.evN || 0) + 1; return true; }
  x.evN = 0; return false;
}
```
Logik-Test dazu: Zauberin Stufe 20 gegen Gegner mit `evade: 1, evadeCap: 0.5` (weicht immer aus), Leben 1e6, 20 Kämpfe;
im Log nie mehr als `evadeStreak` Ausweicher in Folge, und es gibt Zauber-Treffer direkt nach Hieb-Ausweichern
(beweist den gemeinsamen Zähler).
**Lösung (Besitzer wählte 1a):** Kutte-3-Teile `venom` 0,35 → 0,30. Hexe St. 14, 1600 Kämpfe, mit Bremse:
0,35 → +21,9 · 0,30 → +18,6 · 0,25 → +16,2 · 0,20 → +12,8 (ohne Bremse vorher +19,6) – 0,30 ist der alte Bereich.
Der Baum-Test (`tree.mjs`) läuft im vollen Lauf jetzt mit 600 statt 300 Kämpfen: „Fokus" (Zauberin St. 14) fiel bei 300
auf 0,4 (< 1) – Stichprobe, bei 1200 Kämpfen mit und ohne Bremse +2,1; 600 kostet ~2 s mehr. Grenzen unverändert.
**`power()` nachgezogen (2026-11-19):** `evadeShare(p)` in combat.js = (p+…+p^k)/(1+p+…+p^k), k = `evadeStreak`; power()
nutzt es für eigenes und gegnerisches Ausweichen. Logik-Test vergleicht die Formel mit echten Kämpfen (p = 0,2/0,35/0,5,
nur Hiebe, ±0,03). **Befund calib** (St. 5/10/20/30/40, je 2–3 Läufe): evadep 0,95/0,89/0,97/1,10/1,25 → 0,86/0,81/0,88/1,00/1,12
– auf St. 10 unter dem Ziel 0,85; dex 0,86/1,14/1,46/1,10/0,76 → 0,83/1,00/1,19/0,92/0,72 (näher an 1). Nicht nachgezogen –
der Besitzer entscheidet (Vorschlag: `evadep` per 1,5 → ~1,65 hebt St. 10 auf ~0,9, St. 40 auf ~1,23).

### Weicher Deckel für Ausweichen und Krit (2026-11-22)
Fehlerbericht: Assassine Stufe 8 stand schon an der Ausweich-Grenze (50 %, mit „Verwischt“ 58 %) und fast an der Krit-Grenze (60 %).
Ursache: Ausweichen aus Geschick ist verhältnisgleich (~31–35 % gegen gleichstufige Gegner auf jeder Stufe), dazu kamen früh
+17–24 % aus Brett/Ausrüstung; Krit 5 % Grund + 12 % Klasse + Glück. Harter Deckel → danach jeder Bonus wertlos. Dazu log die
Werte-Ansicht (rechnete immer mit 50 %, auch mit angehobener Grenze). Lösung: `softCap` in combat.js – bis `CFG.softKnee` (70 %)
der Grenze voll, darüber exponentiell weicher, nie ganz die Grenze. Eine Regel (`evadeChance`, `critChance`) für Kampf, power(),
Gefahr-Anzeige und Werte-Ansicht. Gemessen: Assassine St. 40/T17 51 → 45 % (je 1200 Abstiege), Eichung evadep 0,92 → 0,84,
critc 0,84 → 0,85, voller Lauf grün. Der Berichts-Fall (roh 55 %, Grenze 58 %) zeigt jetzt 50 % und wächst weiter.

### Zaubertempo der Zauberin halbiert (2026-11-22)
An der eigenen 50-%-Tiefe gemessen (St. 20/T11, St. 40/T20, je 500 Abstiege): Zauberin lag ~3 Tiefen vor Assassine/Barbar.
Zauberkraft langsamer (spellK 150–600) wirkte kaum (−6 bis −14 Pkt.), Tempo-Knoten halbieren am meisten (→ 24 %/33 %).
Gebaut: Manabrand 0,3 → 0,15, Fokus 0,1 → 0,05 je Rang, Nachhall 0,25 → 0,12, Brücke Leere 0,025 → 0,0125. Danach Grenz-Tiefe
St. 20 T10 (vorher T11), St. 40 ~T19,5 (vorher T20+). Ein Viertel brachte kaum mehr (das Brett holt es über andere Knoten zurück).
Fallen: auf T17 gemessen sah jeder Hebel wirkungslos aus (99 % → 95 %) – Gegner auf ~50 % eichen.

### Aldemar und Müllerin (2026-11-22)
**Gebaut** (Bericht 3). Aldemar `mech: { poison: 0.25, poisonPct: 0.015 }`: jeder Treffer legt 1,5 % des **maximalen** Lebens
des Ziels als Gift drauf, ohne Deckel (andere Gift-Gegner, Elite „Giftig“, Mutter der Stricke, Lotus: unverändert, Deckel 8 %).
Gefahr-Anzeige: „Gift +1,5 % Leben je Treffer“ mit Gegengift; Absicht zeigt das laufende Gift. Müllerin `mech: { ramp: 0.1 }`
(Zorn: `buff += ramp` je eigenem Zug), `bossMult` 0,72 → 0,58 (×0,8), Absicht „Zorn +X %“.
Gemessen (boss3.mjs, 3 Würfe × 300): Aldemar St. 20 Barbar-Koloss 97 → 38 % (mit Gegengift 82), Schatten-Assassine 64 → 79,
Feuer-Zauberin 48 → 62. Müllerin St. 12: Feuer-Zauberin 55 → 80, Barbar-Koloss 92 → 72, Berserker 0 → 3 (bleibt schwer).

### Zeitachse (System C, 2026-11-22) – gebaut, AUS
`CFG.tempoMode` (false). Rate Held `max(0,5; 1 + Tempo)`, darüber `tempoCap` 1,6 nur halb; Gegner 1. Wer auf der Zeitachse
vorn liegt, handelt; ohne Schalter ist das strenges Abwechseln **Wurf für Wurf wie vorher** (Hash über 2700 Kämpfe gleich).
Ladung je Aktion 1 (`chargeStep`), Krit-Schwung +0,34 höchstens einmal je Aktion, 50 Aktionen je Kampf (beide Seiten).
**Je Effekt entschieden (Zeit oder Aktion):**
- **Je Zeit** (sonst tickt ein doppelt so schneller Held doppelt): Gift, Bluten, Brand auf dem Gegner (Tick × dt, Brand-Dauer
  − dt), eigene Regeneration. Gegner-Zorn läuft im Gegnerzug (Rate 1) und ist damit schon zeitgleich.
- **Je Aktion** (gewollt – das ist der Tempo-Gewinn): Hiebe, Zauberladung, Lebensraub, Kältestarre (jeder dritte Treffer),
  Dornen (je erlittenem Treffer).
- **Zustände** (`weakN`, `vulnN`, `noheal`, `stunImm`, `dazed`, `cureN`, Trank-Raserei) zählen weiter im eigenen Zug des
  Trägers. Auf dem Gegner ist das Zeit; auf dem schnellen Helden laufen eigene Schutzwirkungen in Zeit gemessen schneller ab –
  bewusst, sonst würde Tempo auch Abwehr kaufen.
**Eisgrab**: `haste −0,3` → `slowCast 0,3` (bremst nur die Ladung; ohne Zeitachse rechnerisch identisch).
**Geschick → Tempo**: `CFG.dexHaste` (0) nur zum Messen, nicht eingeschaltet.
Gemessen (sys.mjs mit Paket, 3 Würfe × 400): +0,2 Tempo → Kill −7 bis −15 % (ohne C −2 bis −10 %); gegen heute geeichte
Gegner +6 bis +24 Punkte (Barbar St. 20 48 → 72, Zauberin St. 40 51 → 71), Assassine St. 40 −3. Zauberin St. 40: Tempo
bringt 0 Punkte (Kampf ist nach 4,5 Aktionen vorbei). **Einschalten nur mit Neueichung** (Gegner-Schaden/-Leben oder Tempo-Werte).

### Zeitachse bleibt aus (Entscheidung Phase 5, 2026-11-22)
Vergleich heute / nur B / Paket / B+Paket / Paket+C / alles (reg.mjs, 9 Lagen, robuste Zählung): C hebt die Build-Vielfalt
nicht (Zauberin St. 40 3 → 2 Strategien), der Koloss bleibt in 7–9/9 Lagen vorn, Helden werden ohne Neueichung bis +24 Punkte
stärker (Bot-Rekord T13–14 → T17–18). Damit gilt die Auftragsregel: `CFG.tempoMode` bleibt aus; vor einem neuen Anlauf erst
Gegnermechaniken, defensive Synergien und Schaden/Leben (3–5 Gegnertreffer bis zum Tod) untersuchen.
Volle Zahlen: `berichte/umsetzung-kampfsystem.md`.

### Kampfkraft geeicht (2026-11-22)
Datensatz: 3 Klassen × St. 20/30/40 × 2 Würfe × 27 Builds (6 Kon-Anteile × 3 Steine + Nebenattribut-Verteilungen), Talente gierig,
Siegchance gegen denselben Gegnersatz (normal + 5 Krypta-Bosse). Maß: Rangkorrelation Kampfkraft ↔ Siegchance je Gruppe und
„Build mit höchster Kampfkraft ist unter den echten Besten (≤ 3 Punkte)“. Vorher 0,37 / 44 %.
Gesucht über Exponent, Ausweichen, Blocken, Dornen, Zauber, Heilung, Kältestarre, Brand, Ausbluten; **übernommen nur, was auf
der zurückgehaltenen Hälfte (Wurf 1) hält**: `CFG.powerExp` 0,35 (Schaden^0,35 × Haltbarkeit^0,65) – das ist fast der ganze
Gewinn, keine frei gewählte Gewichtung, sondern das gemessene Verhältnis. Dazu Lebensraub ×0,45 (Item-Bonus im Kampf = 1,0–1,2 ×
Hauptattribut; ungedämpft 2,4), Ausbluten 0,6, Brand 0,5, Kältestarre-Abschlag gestrichen (verschlechterte die Vorhersage).
**Verworfen:** Ausweichen/Blocken ×0,6 (am Build-Datensatz besser, aber Item-Boni im Kampf = Konstitution, affsim.mjs) und
Dornen ×2–3 (hält auf der Kontrollhälfte nicht). Ergebnis: Rangkorrelation 0,80 / 0,79, Bot-Wahl 67–78 % unter den Besten.
**Offen:** Zauberin – die Kampfkraft wählt Verbrennung, im Kampf ist Koloss·Eisgrab überall vorn (Eisgrab unterschätzt);
Assassine St. 20 Rangkorrelation 0,46–0,59 (Ausweichen streut stark). Eich-Test `calib.mjs` unverändert im Rahmen.

### Kampfkraft überschätzt Heilung (Befund 2026-11-24, NICHT behoben – Besitzer: „erstmal so lassen“)
Fall des Besitzers: Zauberin St. 17, Haube des Pakts (Fluch: keine Heilung) gegen nackten Eisenhelm. Kampfkraft: Eisenhelm +38 %,
im Kampf aber 25 % gegen 48 % Sieg (Krypta-Bosse 33/61, Abgrund-Boss 78/85). Ursache: power() rechnet Heilung als Dauerrate –
5 % Lebensraub bei hohem Zauberschaden zählt fast wie doppeltes Leben (Haube ohne Fluch: Kampfkraft +83 %, Sieg +3 Punkte).
Vorschlag liegt vor: Heilung × Züge bis zum Kill statt Dauerrate; Schilde vom Fluch ausnehmen (der Kampf blockiert sie nicht).
Folge, solange es so bleibt: ▲ und Kampfkraft-Vergleich können bei Lebensraub-/Fluch-Teilen in die falsche Richtung zeigen.
