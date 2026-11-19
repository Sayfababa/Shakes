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
