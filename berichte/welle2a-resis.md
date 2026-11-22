# Welle 2a – Resistenzen, Schadensarten, Waffen-Deckel (2026-11-22, Branch `claude/resistenzen`)

**Gebaut**
- Schadensarten physisch/Feuer/Eis (`ELEMENTS`); Feuer+Eis zählen gegen **Elementar**. Eine Regel `resMul`/`resOf` (combat.js) in
  `finish()` → gilt für Hieb und Zauber; Brand/Gift/Bluten rechnen vom schon gekürzten Treffer. Helden-Hiebe physisch, Zauber
  mit `el` (Feuerball/Meteor Feuer, Frostnova Eis, Rest physisch). Deckel `CFG.resCap` 0,75 im Kampf; `stats().res` bleibt roh.
- Gegner: `mix` (Anteil Feuer/Eis, Rest physisch) + `res` in MONSTERS (Ø 33 % Elementar; Resi nur bei Skelett, Kultist,
  Sumpfhexe, Höllenbrut) und **jedem** Akt-/Krypta-Boss (z. B. Aschenkönig Feuer 60 % / Elem.-Resi 15 %).
- Affixe `physr` „Phys.-Resi“ und `elemr` „Elem.-Resi“: Suffix, Rüstungsteile + Schmuck (9 Plätze), eigene Gruppen (beide auf
  einem Teil möglich), Stufe I 9–10 %, V 3 %. 75 % auf beiden braucht ~8 Plätze mit Stufe I je Art.
- Abgrund: `DESCENT.resMalus { per: 10, v: 0 }` + `descResPen()` → Malus wirkt vor dem Deckel, heute **aus**.
- Waffen-Deckel `wpnDmg()` (loot.js): Grundschaden wirkt höchstens wie GS Heldenstufe + 10 (`CFG.wpnLvlAdd`). Tooltip:
  „Schaden 40–90 · wirksam 23–52“ + „Wirkt wie Stufe 32 – voll ab Heldenstufe 49“.
- Anzeige: Vorbereitung „Schaden Phys 60 · Eis 40 %“ und „Resi Elem 10 %“; „Trifft dich“ rechnet deine Resi ein. Werte-Ansicht
  „Phys.-Resi 0 % / 75“ (über dem Deckel in Klammern). Screenshots: `welle2a-vorbereitung.png`, `welle2a-werte.png` (iPhone 13).
- `power()` rechnet gegen den gemittelten Gegner (`FOE_MIX`/`FOE_RES`, aus den Daten abgeleitet); Siegchance-Caches kennen `res`.

**Messwerte vorher → nachher**
- Erster Treffer gewinnt (oneshot.mjs, St. 22, GS 59, 5 Würfe × 1500): Zauberin **18,3 → 1,1 %** (Bericht 1A: 23,7 % vor dem
  Zusammenführen) · Assassine 7,7 → 0,0 · Barbar 8,9 → 1,2. ≤ 2 Treffer: Zauberin 47 → 17 %.
- Akt VI Stufe (acts.mjs, 6 Läufe): Zauberin 21 → 22 · Assassine 21 → 22 · Barbar 21 → 23 (Glut +15–30 %). acts.mjs selbst
  schwankt ±2 (vorher mit 3 Läufen 22/20/23).
- Bots 3 Tage: Zauberin 6/6 Läufe wie vorher (120–139 gefarmt, Krypta 22–27), Assassine/Barbar je 3 Läufe wie vorher.
- Abgrund `--deep` (St. 20/30/40): Zauberin T8/T12/T16 → T8/T11/T14 · Assassine T9/T14/T18 → T9/T13/T18 · Barbar T14/T19/T24
  → T13/T19/T24; Barbar mit Glocken-Beute T21 → T19 (Waffen-Deckel). Stufe-10-Boss 38 → 31 %.
- Eichung (calib, jetzt fester Keim + 4 Würfe – vorher schwankte Zaubertempo zwischen Läufen 0,61–0,88): alle alten Boni
  unverändert (Zaubertempo 0,77 → 0,76). Neu, St. 20: Phys.-Resi **0,31** (bei schon 45 % Resi: 0,64), Elem.-Resi **0,15** (0,20).

**Tests:** voller `sh tests/run.sh` grün. Neu in logic (105): Schadensarten (Feuer/Eis vs. Elementar, Hieb vs. Phys., Mischung,
Daten, enemyInfo), Resi-Deckel 75 % + Malus vor Deckel + Malus aus, Waffen-Deckel (Wert, voll ab GS − 10, nie gekürzt darunter).

**Unterwegs gefunden und gelöst:** Phys.-Resi auf gewöhnlichen Monstern machte Barbar-Kämpfe länger → Heiltränke/Tracht über
den Rahmen; Elem.-Resi 20 % am Ersten Kultisten ließ die Zauberin in 4 von 5 Bot-Läufen an Akt V hängen. Beides gesenkt.

**Offene Fragen**
1. **Klein je Teil vs. Eich-Regel:** Resi-Teile liegen bei 0,15–0,31 statt 0,85–1,2 – ein Teil zählt kaum, erst gestapelt.
   Kampfkraft-Vergleiche (grüne Pfeile, Bots) bevorzugen darum fast immer Kon/Leben. Lassen (Resi zählt im Abgrund mit Malus),
   größere Werte (Stufe I ~25 %), oder **Elementarschaden ignoriert Rüstung** (D2-Art – dann trägt Elem.-Resi von selbst)?
2. Phys.-Resi stapelt mit Rüstung (max. 60 % + 75 %). Gewollt, oder Phys.-Resi niedriger deckeln (z. B. 50 %)?
3. Zauberin hat nur Elementar-Zauber: jede Elem.-Resi eines Bosses kürzt ihren ganzen Schaden. Bosse deshalb ≤ 15 %.
4. descent.mjs-Spalte „St. 22 + Glocken-Beute“ zeigt für Zauberin/Assassine T0 – auch schon vor dieser Welle; Messfehler?
