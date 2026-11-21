# Welle 1b – Der Abgrund wird endlos (2026-11-21, Branch `claude/abgrund-endlos`)

**Gebaut**
- Keine letzte Tiefe. `descAt(d)` (game.js) bündelt eine Tiefe: Gruft reihum aus den offenen Grüften, Gegnerstufe
  `3 + 2·d`, Stärke `×(1 + 0,02·(d−1))`, `mods: []` als Platz für Siegel/Modifikatoren (Welle 2, `DESCENT.depthMods`).
- Gegner hängen **nur an der Tiefe**, nicht mehr an der Heldenstufe (auch nicht beim Aufstieg unten) und nicht mehr an der
  Krypta-Schwierigkeit (Normal/Albtraum/Hölle) – sonst wäre der Rekord nicht vergleichbar. Beutestufe = Gegnerstufe.
- Rekord je Held `S.deep = { best, week, wBest }`, faul angelegt (`descRec()`), kein Absturz ohne Feld, auch nicht mit
  einem alten laufenden Abstieg ohne Tiefe. Nur der **Boss** hebt Rekord/Wochenbest, Seil/Brunnen/Stiege nicht.
  Wählbar: Tiefe 1 … Rekord + 1. Wochenbest setzt sich Montags (wie die Grube) zurück.
- Ansicht: „‹ Tiefe N ›" statt Gruft-Wahl, Zeile „Rekord Tiefe X · diese Woche Y", Lauf zeigt „Tiefe N · Raum …",
  Ergebnis nennt „Neuer Rekord: Tiefe N – Tiefe N+1 ist offen". Screenshot: `welle1b-abgrund.jpg` (iPhone 13, passt ohne Überlauf).
- Siegel-Bremse bleibt unverändert: der Boss erstattet sein Siegel, Weiterklettern kostet netto nichts – blockiert nicht.
- Nicht angefasst: loot.js, AFFIXES/TIERS/RARITIES, Klassenwahl, SAVE_VERSION, state.js.

**Messwerte** (`node tests/descent.mjs all 10 120 --deep`, 60 Abstiege je Tiefe, magisch, Gegenstandsstufe = Heldenstufe)
| Klasse | St. 20 | St. 30 | St. 40 | St. 22 + Glocken-Beute 59 (selten) |
|---|---|---|---|---|
| Zauberin | T7 (Gegner 17) | T11 (25) | T14 (31) | T20 (43) |
| Assassine | T7 (17) | T11 (25) | T14 (31) | T18 (39) |
| Barbar | T11 (25) | T18 (39) | T23 (49) | T26 (55) |

Kurve (Held mit Beute *dieser* Tiefe, selten, Heldenstufe = Gegner − 1; Boss-Sieg gleiche Tiefe / +3 / +6):
T5 80/9/0 · T10 89/49/27 · T15 74/53/34 · T20 61/54/35 · T30 57/49/31 · T40 42/44/38 %.
→ Die Beute läuft der Gefahr nicht davon (mit eigener Beute sinkt die Siegchance von 89 % auf 42 %); es gibt immer eine Wand.
Räume-Tabelle Stufe 10: Ø Boss-Sieg 28 % (vorher 13 %, Rahmen 10–60 %) – vorher stieg die Gegnerstufe mit, wenn der Held unten aufstieg; der Boss ist jetzt ein anderer (Gruft reihum).

**Tests** – voller `sh tests/run.sh` grün (1:38). Neu: Logik-Test „Abgrund endlos" (Rekord, Sperre, Heldenstufe egal,
jede Tiefe schwerer bis 60, Woche, Seil zählt nicht, Altstand); descent.mjs prüft mit `--check --deep`: Gegnerstufe
unabhängig von der Heldenstufe, jede Tiefe bis 200 schwerer, Stufe 40 tiefer als Stufe 20, +6 Tiefen im Mittel ≥ 15 Punkte
schwerer, tief unten mit eigener Beute nicht leichter als oben (Schranken aus der Messung oben). run.sh nutzt jetzt `--deep` (+7 s).

**Offene Fragen**
1. Tief unten werden die Schritte relativ kleiner (+3 Tiefen: T5 −71 Punkte, T40 ≈ 0). Soll die Stärke schneller steigen
   (z. B. `diffPer` 0,03) – oder ist ein sanftes Ende der Leiter gewollt? Nach dem Boni-Umbau neu messen.
2. Zauberin/Assassine kommen mit stufengleicher Ausrüstung weniger tief als der Barbar (Klassen-Balance, nicht hier gelöst).
3. Die Gruft wechselt reihum aus den *offenen*: wird eine neue Gruft frei, wechseln Aussehen/Boss der Tiefen (Gegner bleiben gleich stark).
4. Wochenziel ist nur Anzeige (kein Lohn). Belohnung dafür? (Welle 2)
