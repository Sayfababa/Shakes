# Welle 2a – Resistenzen, Schadensarten, Waffen-Deckel (2026-11-22, Branch `claude/resistenzen`)
Zweiter Schritt auf Zuruf „wie bei Diablo und PoE, sinnvoll fürs Spiel“ (beantwortet die offenen Fragen 1–3 der ersten Fassung).

**Gebaut**
- Schadensarten physisch/Feuer/Eis; Feuer+Eis → **Elementar**. Eine Regel (`resMul`/`resOf`/`armorRed`, combat.js) in `finish()`.
- **Wie D2/PoE: Rüstung mindert nur den physischen Anteil.** Feuer und Eis gehen an ihr vorbei – dagegen hilft nur Elem.-Resi.
  Gilt in beide Richtungen: Feuerball/Frostnova/Meteor ignorieren die Rüstung des Gegners (Zauber-Ansicht: „Feuer · ignoriert Rüstung“).
- Deckel: **Elementar 75 %** (D2/PoE), **Phys. 50 %** (D2 „Schaden reduziert um“ – stapelt mit Rüstung, darum niedriger).
- Affixe (Suffix, Rüstungsteile + Schmuck, beide auf einem Teil möglich): Elem.-Resi Stufe I 26–30 % · V 8–10 % (wie D2-Einzelresi),
  Phys.-Resi I 20–23 % · V 6–8 %. 75 % Elementar = drei Teile Stufe I oder sechs mittlere; der Druck kommt später mit dem Abgrund-Malus
  (`DESCENT.resMalus`, Eintrag vorhanden, **aus**) – wie D2 Hölle / PoE Akt-Malus.
- Gegner `mix`/`res`: Monster Ø 33 % Elementar, Resi nur bei wenigen; jeder Boss eine erkennbare Mischung (Gerlinde Eis 40 %,
  Aschenkönig Feuer 50 % + Elem.-Resi 15 % …). Vorbereitung: „Schaden Phys 60 · Eis 40 %“, „Resi Elem 10 %“, „Trifft dich“ mit deiner Resi.
- Werte-Ansicht „Phys.-Resi x % / 50“, „Elem.-Resi x % / 75“ (darüber in Klammern). Waffen-Deckel: Grundschaden wirkt höchstens wie
  Heldenstufe + 10, Tooltip „wirksam …“ + „voll ab Heldenstufe N“. Screenshots (iPhone 13): `welle2a-vorbereitung/werte/zauber.png`.

**Folge-Ausgleich (gemessen, nicht geschätzt)**
- Ohne Resi kommt laut Kampfkraft-Modell ~19 % mehr Schaden an → `monDmg` 1,0 → 0,9.
- Rüstung schützt nur noch ~⅔ des Schadens: Bonus Rüstung `per` 8 → 16 (Eichung wieder 0,69/1,13/0,79 wie vorher).
- Zaubertempo fiel 0,76 → 0,59 (Barbar) → `per` 1,33 → 1,6 (Stufe I 21–24 %, Ausnahme wie Krit-Schaden: wirkt nur auf Zauber).
- „Rüstung ignorieren“ nicht mehr auf Stäben; „Lohe“ 6 → 8 % (fiel unter den Rahmen). Glöckner (Krypta 4) hielt die Zauberin in 2/8 Bot-Läufen
  auf: jetzt Feuer 25 % + Eis 15 %, Phys.- statt Elem.-Resi. Erster Kultist Feuer 30 %, keine Resi. Bosse mit Elem.-Resi höchstens 15 % (die Zauberin hat nur Feuer/Eis).

**Messwerte vor Welle 2a → jetzt**
- Erster Treffer gewinnt (St. 22, GS 59): Zauberin 18,3 → 1,8 % · Assassine 7,7 → 0 · Barbar 8,9 → 0,3 %.
- Akt VI Stufe (6 Läufe): 21/21/21 → 20–21 / 20–22 / 22–23 (Zauberin/Assassine/Barbar; acts.mjs schwankt ±2).
- Bots 3 Tage: Zauberin 8/8, Barbar 4/4 wie vorher; Assassine 9/10 (einmal Krypta 4 nicht versucht, Geschichte trotzdem fertig).
- Eichung St. 20: Elem.-Resi **0,67** erstes Teil, **1,13** gestapelt (vorher 0,15/0,20); Phys.-Resi 0,44 / 0,33 (Deckel 50 %).
- Abgrund `--deep` St. 20/30/40: Zauberin T8/12/16 → T7/12/16 · Assassine T9/14/18 → T8/13/17 · Barbar T14/19/24 → T13/18/23.
  Stufe-10-Boss 38 → 22 % (Rahmen 10–60): ohne Resi ist der Abgrund spürbar härter – gewollt, dort soll Resi zählen.

**Tests:** voller `sh tests/run.sh` grün. Logic 105: Feuer/Eis vs. Elementar, Hieb vs. Phys., Feuerball ignoriert Rüstung, Hieb nicht,
Rüstung nur auf phys. Anteil, Deckel 75/50, Malus vor Deckel (aus), Waffen-Deckel. calib.mjs: fester Keim + 4 Würfe, Klassen-Ansicht
repariert; caps.mjs: „Rüstung ignorieren“ bei reinen Feuer/Eis-Klassen als Regel ausgewiesen (abgeleitet aus `SPELLS`).

**Offene Fragen**
1. Passiv der Zauberin („Ignoriert Rüstung zur Hälfte“) hilft nur noch ihren Hieben. Etwas anderes geben (z. B. Elem.-Resi oder Brand)?
2. Phys.-Resi bleibt unter dem Hauptattribut (0,44) – wie in D2 eine Nebensache neben Rüstung. Recht so?
3. Malus je Abgrund-Tiefe einschalten (Vorschlag: −10 % je 10 Tiefen, wie PoE)? Erst dann wird 75 % zum Ziel.
4. descent.mjs „Glocken-Beute“ zeigt für die Zauberin T0 – schon vor dieser Welle; vermutlich Messfehler im Test.
