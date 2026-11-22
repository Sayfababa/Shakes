# Zauber

### Zauber

**Zauber** (`SPELLS` in data.js, `spell()` in combat.js): 3 je Klasse (Stufe 1/8/18), Symbole `assets/spells/<id>.webp` (aus 2 KI-Sheets, Prompt in assets/reference/spell_prompt.md), wirken automatisch jeden n-ten eigenen Zug statt eines Hiebs. Stärke × Zauberkraft (`amp` = 1 + Int/(Int+spellK)) → Intelligenz lohnt für alle. Ausgleich über `CFG.monHp/monDmg`.

### Zauber im Kampf

**Zauber im Kampf**: laden pro Zug (`ch`, +`haste` = Zaubertempo, Affix `haste` in %), Log trägt Ladestand `cA/cB` → Leiste `.sbar` unter dem Lebensbalken; `spellFx()` in main.js: Geschoss (`.proj`) + Einschlag (`.burst`) in Zauberfarbe `fx`. Zauber-Schritte laufen langsamer (750 ms).

### Zauber-Wege

**Zauber-Wege** (`SPELL_TREE`, `TREE_LVL` in data.js; `chooseWay`/`wayOpen`/`wayCost`/`waysPending` + `withWays()` in state.js; `S.sp = { zauberId: [i0, i1, i2] }`, Save v7): je Zauber 3 Stufen (ab Charakterstufe 6/14/22), je Stufe 1 von 2 Wegen. Erste Wahl gratis, Wechsel kostet `wayCostPerLvl` × Stufe. Wege sind Bausteine `m` (Liste oben in SPELL_TREE: open, every, mult, burn, vuln, weaken, dazedCrit, noheal, cleanse, stunImmune, detonate …) und wirken in combat.js (`ways()`, `stun()`, Zustände laufen im eigenen Zug ab). Boss-Antworten (Reinigen/Bannen/Unbeugsam) sind gegen ihren Boss sehr stark, sonst normal. Ansicht: Zauber → Zauber antippen → `viewWays`. Kampf zeigt `combo`/`status`/Brand als Einblendung. **Balance:** `node tests/ways.mjs [klasse] [stufe] [kämpfe]` misst jeden Weg in echten Kämpfen (Δ Siegchance bei ~50 %, auch gegen Bosse); Ziel ~+5…+12 Punkte, `--check` (in run.sh) schlägt außerhalb −4…+20 Alarm. power() schätzt die Wege mit ein.

### Zauber nach Lage
**Gebaut 2026-11-22** (System B aus `berichte/kampfsystem.html`, Schalter `CFG.spellPick`, Standard an). Nur der Held
(Seite mit `cls`) wählt unter seinen *vollen* Zaubern (`pickSpell` in combat.js); Monster wirken weiter keine Zauber.
Reihenfolge: (1) Heilung/Schild unter 50 % Leben **oder** wenn der nächste gegnerische Zug tödlich sein kann (Höchstwurf ×
Krit, Raserei-Doppelhieb, Eifer, Zorn, dazu die Ticks auf dem Helden; nach Rüstung/Resi) – nie, wenn Heilung gebannt ist
(außer Ausbrennen bei laufendem Gift) · (2) der **geringste** Hiebwurf tötet sicher und der Gegner blockt nicht → alle halten ·
(3) kleinster tötender Schadenszauber · (4) Betäubung, wenn sie greift (nicht auf Betäubte/`stunImm`; dann wird die Nova
auch nicht als Schadenszauber verschossen) · (5) Gift nur, wenn das laufende < 80 % des neuen ist (Doppelgift: gestapelter
Wert) · (6) Buff, solange er wachsen kann oder seine Schwächung (Einschüchtern) abgelaufen ist · (7) höchster erwarteter
Schaden · sonst Heilung mit Nebenwirkung (Raserei-Weg, Ausbrennen, Unbeugsam) · sonst halten.
Schätzung über `scale()` (der zufallsfreie Teil von `finish()`), also dieselbe Rüstung/Resi/Henker-Regel wie im Treffer;
ohne Krit und Ausweichen. „Letzter Atem“ des Gegners: kein sicherer Kill.
**Eigene Entscheidung, nicht im Prototyp:** gehaltene Zauber behalten höchstens **einen Zug Vorrat über voll**
(`every + Ladung je Zug`). Ohne Deckel sammelt eine 20 Züge gehaltene Heilung 3 Würfe und feuert sie nacheinander.
Nachhall/„Krone ohne Träger“ laufen in `spell()` und berühren die Wahl nicht (Test: höchstens 3 Würfe am Stück).
Gemessen (sys.mjs, 3 Würfe × 500 Kämpfe, St. 10/20/40, gemeinsame Würfel): Sieg gegen heute geeichte Gegner −4…+3 Punkte
(Assassine St. 20 53 → 49, sonst ±2), Aktionen gleich, Overkill Zauberin St. 40 46 → 26 %, St. 20 26 → 22 %.
Elastizitäten (+20 % Leben/Schaden/Tempo) unverändert im Rauschen. Test: logic „Zauber nach Lage“.
