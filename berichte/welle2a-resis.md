# Welle 2a – Resistenzen, Schadensarten, Waffen-Deckel (2026-11-22, Branch `claude/resistenzen`)
Drei Schritte: (1) Resis + Waffen-Deckel, (2) „wie D2/PoE“, (3) Antworten des Besitzers: Durchdringung, Fluch der Tiefe mit Deckel.

**Wie es jetzt ist**
- Schadensarten physisch/Feuer/Eis, Feuer+Eis → Elementar. **Rüstung mindert nur den physischen Teil** (D2/PoE), Feuer/Eis
  gehen vorbei – auch Feuerball/Frostnova/Meteor durch die Rüstung der Gegner. Deckel Elementar 75 %, Phys. 50 % (D2).
- Resi-Boni (Suffix, Rüstung + Schmuck): Elem. Stufe I 26–30 %, Phys. 20–23 %. Gegner haben `mix`/`res`, vorher sichtbar.
- **Elementar-Durchdringung** (PoE, feste Punkte, nicht „halb“): zieht nach dem Deckel ab, darf unter 0 gehen (mehr Schaden).
  Zauberin-Passiv: **15 % Durchdringung + 25 % eigene Elem.-Resi** (statt „ignoriert Rüstung zur Hälfte“). Bonus
  „Elem.-Durchdringung“ nur auf Stäben (Stufe I 13–15 %, geeicht 0,91).
- **Fluch der Tiefe** im Abgrund: −10 % Elem.-Resi je 10 Tiefen, **höchstens −30 %** (nie −200), nur Elementar (wie D2/PoE),
  vor dem Deckel. Steht auf dem Tiefen-Bildschirm („Elem.-Resi −10 %“, `welle2a-abgrund.png`).
- Waffen-Grundschaden wirkt höchstens wie Heldenstufe + 10, Tooltip zeigt „wirksam …“ und „voll ab Heldenstufe N“.

**Gemessen und ausgeglichen (Grund → Änderung)**
- Ohne Resi kommt mehr Schaden an → Monsterschaden ×0,9. Rüstung deckt nur ~⅔ → Bonus Rüstung `per` 8 → 16.
- Zaubertempo fiel unter die Eich-Schranke → `per` 1,6 (Stufe I 21–24 %, Ausnahme „wirkt nur auf Zauber“).
- **Zauberin-Bots hingen in ~30 % der Läufe** (vorher 1/40) – Suche mit je 20 Läufen: nicht Glöckner, Waffen-Deckel, Passiv
  oder Resi-Boni, sondern **Feuer/Eis der Monster an ihrer Rüstung vorbei** (ohne Gegner-Mischung 0/20). Sie hat wenig Leben
  und lebt von Rüstung. Lösung: 25 % eigene Elem.-Resi im Passiv (→ 1–2/20), Monster-Spitzen 70 % → höchstens 50 %.
- Sternenfall (Meteor sofort) +9 → +19 Pkt (Meteor geht durch Rüstung) → Preis −25 → −35 % (jetzt +12…16).
- „Lohe“ 6 → 8 %, „Rüstung ignorieren“ nicht auf Stäben, Glöckner/Kultist/Aschenkönig weniger Elementar/Resi.

**Messwerte vor Welle 2a → jetzt**
- Erster Treffer gewinnt (St. 22, GS 59): Zauberin 18,3 → 0,0 % · Assassine 7,7 → 0 · Barbar 8,9 → 0,5 %.
- Akt VI Stufe/Glut (6 Läufe): Zauberin 21/3543 → 21/3216 · Assassine 21/3495 → 21/3702 · Barbar 21/3503 → 22/4178.
- Bots 3 Tage (je 12–20 Läufe): hängend Zauberin 1/40 → 2/20, Assassine 2/12 → 2/12, Barbar 1/12 → 3/12.
- Abgrund `--deep` mit Fluch (St. 20/30/40): Zauberin T8/12/16 → T8/12/16 · Assassine T9/14/18 → T9/13/17 · Barbar
  T14/19/24 → T13/18/23. Stufe-10-Boss 38 → 28 %.
- Eichung St. 20: Elem.-Resi 0,59 (gestapelt 0,76), Phys.-Resi 0,54, Durchdringung 0,91, Rüstung 0,85, Zaubertempo 0,80.

**Tests:** voller `sh tests/run.sh` grün (1:43). Logic 106: Schadensarten, Rüstung nur physisch, Deckel 75/50, Fluch gedeckelt
(Tiefe 9/10/25/30/5000), Durchdringung nach dem Deckel und unter 0, Passiv + Stab-Bonus, Waffen-Deckel. Trank-Test im Gesamtlauf
600 statt 300 Kämpfe (Bollwerk −2,0 war Rauschen, bei 600 +1,5…+9,3). bot.mjs: `BOTDIAG=1` zeigt, wo ein Lauf steht.

**Offen**
1. Barbar-Bots hängen etwas öfter (3/12 statt 1/12, Glöckner/Kultist) – im Rauschen, beim nächsten Schritt nachmessen.
2. Der Fluch beginnt bei Tiefe 10; ob −30 % ab Tiefe 30 zum Farmen passt, zeigt erst echtes Spiel.
