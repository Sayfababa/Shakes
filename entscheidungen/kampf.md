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
