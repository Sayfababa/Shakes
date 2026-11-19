# Zauber

### Zauber

**Zauber** (`SPELLS` in data.js, `spell()` in combat.js): 3 je Klasse (Stufe 1/8/18), Symbole `assets/spells/<id>.webp` (aus 2 KI-Sheets, Prompt in assets/reference/spell_prompt.md), wirken automatisch jeden n-ten eigenen Zug statt eines Hiebs. Stärke × Zauberkraft (`amp` = 1 + Int/(Int+spellK)) → Intelligenz lohnt für alle. Ausgleich über `CFG.monHp/monDmg`.

### Zauber im Kampf

**Zauber im Kampf**: laden pro Zug (`ch`, +`haste` = Zaubertempo, Affix `haste` in %), Log trägt Ladestand `cA/cB` → Leiste `.sbar` unter dem Lebensbalken; `spellFx()` in main.js: Geschoss (`.proj`) + Einschlag (`.burst`) in Zauberfarbe `fx`. Zauber-Schritte laufen langsamer (750 ms).

### Zauber-Wege

**Zauber-Wege** (`SPELL_TREE`, `TREE_LVL` in data.js; `chooseWay`/`wayOpen`/`wayCost`/`waysPending` + `withWays()` in state.js; `S.sp = { zauberId: [i0, i1, i2] }`, Save v7): je Zauber 3 Stufen (ab Charakterstufe 6/14/22), je Stufe 1 von 2 Wegen. Erste Wahl gratis, Wechsel kostet `wayCostPerLvl` × Stufe. Wege sind Bausteine `m` (Liste oben in SPELL_TREE: open, every, mult, burn, vuln, weaken, dazedCrit, noheal, cleanse, stunImmune, detonate …) und wirken in combat.js (`ways()`, `stun()`, Zustände laufen im eigenen Zug ab). Boss-Antworten (Reinigen/Bannen/Unbeugsam) sind gegen ihren Boss sehr stark, sonst normal. Ansicht: Zauber → Zauber antippen → `viewWays`. Kampf zeigt `combo`/`status`/Brand als Einblendung. **Balance:** `node tests/ways.mjs [klasse] [stufe] [kämpfe]` misst jeden Weg in echten Kämpfen (Δ Siegchance bei ~50 %, auch gegen Bosse); Ziel ~+5…+12 Punkte, `--check` (in run.sh) schlägt außerhalb −4…+20 Alarm. power() schätzt die Wege mit ein.
