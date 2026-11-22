# Welle 2B-1 – Abgrund-Leiter, Lohn, Grube, Klassen (2026-11-22, Branch `claude/abgrund-leiter`)

**Wichtigster Befund vorab:** Der Abgrund-Test baute seine Helden falsch – Zauberin/Assassine lernten alte Talent-Knoten
statt ihres Bretts, keine Zauber-Wege; die Waffe war handgebaut. Mit echten Talenten (Bot-Logik, jetzt `tests/held.mjs`)
war nicht der Barbar vorn, sondern die **Zauberin** (alte Leiter: T15/23/33 · Assassine 12/19/26 · Barbar 13/19/24), und die
Beute lief der Gefahr davon (+6 Tiefen bei T20 kaum schwerer, Stufe-10-Boss 84 %). Alle Zahlen unten mit echtem Helden.

**Gebaut**
- **Leiter geometrisch:** Stärke `1,15 × 1,05^(Tiefe−1)` statt `1 + 0,02·(T−1)`. Boss-Sieg mit eigener Beute, gleiche/+3/+6 Tiefen:
  T10 100/99/84 → 87/59/17 % · T15 100/100/96 → 74/45/4 % · T20 99/99/98 → 55/28/3 % (vorher-Werte mit echtem Helden).
- **Lohn je Tiefe** (`descReward`): Gold/EP ×(1+0,05·(T−1)), Funde ×(1+0,03·(T−1)), Glück +3/Tiefe, ab T8 mind. magisch, ab T18 selten.
  Abgrund-EP 0,6 → 0,8 (Abstieg St. 40 brachte ~5 % einer Stufe, jetzt 8–10 %). Bildschirm zeigt den Lohn der gewählten Tiefe.
- **Abgrund-Stufen I+ (ab T15) / I++ (ab T22)** über I, nur aus dem Abgrund, blutrot (I++ fett/unterstrichen, Farbe im UI-Test
  gerendert geprüft). Nicht auf Resistenzen (sonst zwei Teile = Deckel). Eichung St. 40 auf I++ = wie Stufe I (±0,05).
- **Wochenlohn:** am Montag für die Wochenbest-Tiefe: 60 Gold × Gegnerstufe, 1 Kronsplitter je 5 Tiefen, +2 Siegel (max. 6),
  ab T5 ein seltenes Teil der Tiefe. Vorher angezeigt, roter Punkt am Krypta-Tab, Beutel voll → nichts geht verloren.
- **Grube:** über Platz 30 je Platz ×1,06 Leben/Schaden (vorher schlug St. 20 Platz 6–12, St. 30 Platz 1). Jetzt St. 20 → ~21,
  St. 30 → 12–14, St. 40 → 7. Sieg gibt Gold+EP (vorher Stufe×3 Gold, 0 EP), z. B. St. 40: 434 Gold, ~1 % Stufe. Unten unverändert,
  weil Vargos Ehre-Aufträge die Geschichte tragen (erster Versuch ab Platz 51 ließ Barbar-Bots 6/12 hängen).
- **Steckbriefe** (= tägliche Herausforderungen): Lohn bleibt (relativ zur Stufe, 12 % EP je Auftrag; Gold 3/Tag < 1 Abstieg).
  „Siege in der Grube" wird auf Platz 1 nicht mehr angeboten (dort unlösbar).
- **Klassen:** Barbar-Talente Zorn/Dickes Fell 5→10, Brüllen 5→9 Ränge (Punkte verfielen ab St. 28), Eisgrab-Schild 35→15 %
  (lädt jeden Raum neu – hob die Abnutzung im Abgrund aus). Abgrund-Tiefe St. 20/30/40: Zauberin T10/14/20 · Assassine 8/13/17 ·
  Barbar 9/13/16 (Abstand ≤ 4; Schranke ≤ 5 in descent.mjs). Akte unverändert (Akt VI 21/3216 · 21/3702 · 22/4178).

**Tests:** voller `sh tests/run.sh` grün. Logik 109 (+3: Leiter, Lohn, Abgrund-Stufen inkl. CSS, Wochenlohn, Grube/Steckbrief).
Neu `tests/lohn.mjs` (in run.sh), descent.mjs mit Klassen-Band, calib-Spalte I++, ui.cjs: I+/I++-Farbe, Wochenlohn abholen.
Bots 3 Tage: Zauberin 0/8, Assassine 0/8 hängen, Barbar 4/12 (vorher 2–3/12, siehe Frage 1). Screenshots: `welle2b1-abgrund.png`,
`welle2b1-abgrund-stufe.png` (iPhone 13). Platz für Welle 2B-2: `DESCENT.depthMods` unangetastet.

**Offene Fragen**
1. Barbar-Bots hängen am Kultisten (Akt V, Dornen 30 %) mit St. 16–17 und < 6.000 Leben. Gemessen ist das keine Klassenfrage
   (Testhelden St. 17: Zauberin 3 %, Barbar 0 %; St. 19 alle 7–18 %) – eine Stufen-Hürde, ehrlich angezeigt. Lassen oder entschärfen?
2. Bei T25–30 steht eine Wand (St. 62 mit eigener Beute schafft T30 zu 1 %). Gewollt (Leiter mit Ende durch Kraft) oder 1,04?
3. Umschmieden würfelt nie Abgrund-Stufen (ein I++-Bonus geht dabei verloren). Recht so?
4. Akte: Zauberin bleibt die schnellste (3216 Glut gegen 4178 Barbar) – nicht in dieser Welle angefasst.
