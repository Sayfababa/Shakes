# Welle 1a – Boni-Umbau (Branch `claude/boni-umbau`, 2026-11-21)

**Gebaut:** SAVE_VERSION 22, alte Stände → `_bak` + Hinweis „Die Welt ist neu geschmiedet“ (kein Umrechnen, Migrationen v1–21
entfernt). Nur Zauberin/Assassine/Barbar wählbar (`PLAYABLE`). Feste Wertebereiche je Stufe (`TIERS.flat/pct`, GS schaltet frei:
V 1 · IV 5 · III 12 · II 22 · I 35), %-Boni Stufe I ≤ 20 % (Krit 10–12 %, Zaubertempo 17–20 %). Präfix (Angriff) / Suffix
(Abwehr/Nutzen) 1+1 · 2+2 · 3+2, eine je Gruppe, strenge Plätze (Schaden nur Waffe/Handschuhe/Schmuck, Hauptattribut nicht auf
Handschuhen/Stiefeln, Rüstungsteile Leben/Rüstung). Eine Regel `affixRoom()` für Beute, Umschmieden, Fusion. +20 % Drops
(`CFG.dropMult`, Abgrund nicht angefasst). Einzigartige/Sets mitgezogen. Screenshots: `klassenwahl.png`, `tooltip-legendaer.png`.

**Messwerte vorher → nachher**
- Erster Treffer gewinnt (Zauberin St. 22 vs. Krypta-Bosse St. 22, beste von 8 seltenen Teilen, 5 Würfe × 300 Kämpfe,
  `tests/oneshot.mjs`): GS 59: **61,7 % → 23,7 %** · GS 24: 0 → 0 · St. 30/GS 40: 24,3 → 1,5 %.
  Assassine GS 59: 52,1 → 2,6 % · Barbar GS 59: 35,4 → 8,1 %. Ø Krit 31 → 11 %, Ø Zaubertempo 236 → 13 %.
- Boni-Anteil an der Kampfkraft (Rüstung magisch+, St. 20): ×3,7–4,5 → ×2,1–2,4.
- Eichung (Bonus ÷ Hauptattribut gleicher Stufe, St. 20/30/40): Krit, Schaden, Krit-Schaden, Zauberkraft, Zauber-Boni,
  Blocken, Ausweichen 0,8–1,2; Leben/Rüstung ignorieren ~0,8; Lebensraub ~1,6; Dornen ~0,6 (Deckel).
- Akte (acts.mjs, Akt VI Stufe/Glut) vorher → nachher: Zauberin 20/3182 → 20/3265 · Assassine 21/3782 → 22/4029 ·
  Barbar 19/2820 → 22/3852. Bot 3 Tage: ähnlich viele Kämpfe/Niederlagen (Zauberin Krypta −3 → −0).

**Tests:** voller `sh tests/run.sh` grün (logic 101, fuzz, ways, Tränke 3/3, Abgrund 34 %, Akte, Sets, Einzigartige, Brett,
Deckel, ui, trader, prep, uifuzz). Neu: Neustart-Test, PLAYABLE-Test, Stufen-/Präfix-Test, Klassenwahl in ui.cjs.
uniques.mjs mittelt 8, sets.mjs 4 Ausrüstungswürfe (vorher 1); Gegner-Eichung bis ×5 statt ×2,5.

**Nicht in der Freigabe, aber nötig (bitte bestätigen):**
1. Ausgleich, sonst kam Akt VI erst auf St. 27–28: **Attributpunkte je Stufe 5 → 9**, Monster Leben ×1,3 → ×1,15,
   Schaden ×1,1 → ×1,0. Betrifft auch Grube und Abgrund (Abgrund-Sitzung muss neu eichen).
2. Konstitution seltener gewürfelt (Gewicht 0,6) und nicht auf Waffe/Handschuhen/Nebenhand – sonst trug fast jedes Teil Kon.
3. Folgeänderungen: Tracht 3 Teile Heilung ×1,4 statt ×2, Tracht 2 Teile 6 % statt 8 % Leben, Zaubertinte 40 % statt halb,
   Lotusblatt Krit-Schaden statt Krit-Chance, Zweiter Atem 0,22, Zuflucht 0,27, Fokus 0,1; Blutglocke, Pfad der Asche,
   Sünde von Vhal, Letzter Atem, Eisernes Gelübde, Haube des Glöckners mit anderen Boni. Schmiedegold je GS 4 → 5.

**Offene Fragen**
- Rest-One-Shot (23,7 % bei GS 59) kommt vom **Grundschaden der Waffe**, der weiter mit der GS wächst (×2,2 von GS 24 auf 59).
  Deckeln (z. B. an Heldenstufe) oder lassen?
- Krit-Schaden (I 79–90 %), Dornen (I 70–80 %), Zauber-Boni (I 35–40 %) liegen über 20 % – andere Einheit, geeicht statt gedeckelt. Recht so?
- Lebensraub ist ganzzahlig 1–5 % und trotzdem ~1,6× zu stark; Kommastellen oder lassen?
- Seltene Helme/Brüste/Gürtel/Stiefel tragen fast alle Suffixe ihrer kleinen Liste – wird mit Resistenzen besser.
- Legendär = nur mehr Boni (kein ×1,5 mehr). Einzigartige behalten ×1,5. Recht so?
- Stufe I liegt bei GS 35 – für den endlosen Abgrund braucht es später mehr Stufen über I.
