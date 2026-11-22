# Welle 2B-2 – Siegel des Abgrunds und Aschenkern (2026-11-22, Branch `claude/abgrund-siegel`)

**Gebaut**
- **Siegel (wie Skarabäen):** vor dem Abstieg bis zu 3 einlegen, eines je Art, Stufe rissig/fest/makellos (ab Tiefe 1/8/16).
  **Blutsiegel** Gegner +10/15/20 % → Gold und Funde +30/45/60 %. **Seelensiegel** Elite ×2/2,5/3 (+0/5/10 %) → Elite-Funde
  mind. selten, +1/1/2 Fundstücke, Kronsplitter ×1,5/2/3. **Runensiegel** Elem.-Resi −10/15/20 % (zum Fluch) → Resi-Boni
  ×3/4/5, Glück +15/25/40. Verbraucht beim Hinabsteigen; Umkehren vor Raum 1 gibt sie zurück. Fallen in den Sack (Boss sicher,
  Elite 15 %, Schatzkammer 10 %), Tod = weg. Alles über `sigFx()` – Kampf, Karte, Beute und die Zeile vorher aus einer Rechnung.
- **Gefahr vorher sichtbar:** Siegel-Platz auf dem Abgrund-Bildschirm, darunter „Gegner +15 % · Elite ×2,5 … → Gold/Funde +45 % …“
  (rot → grün); Siegchance je Raum rechnet sie mit. Passt am iPhone 13 ohne Scrollen auch mit Wochenlohn + 3 Gürtelplätzen
  (dritter Sparschritt `.tightest`: Sack-Zeile weg, Gürtel als Reihe).
- **Aschenkern:** nur beim Abgrund-Boss ab Tiefe 12 (3 % + 0,5 %/Tiefe, höchstens 15 %), liegt im Sack. Schmiede-Reiter „Kern“
  (erst mit Kern): Einzigartiges **aus dem Beutel** wählen, eine Wirkung antippen, Ziel (magisch/selten/legendär, **gleicher Platz**)
  → Rückfrage → Einzigartiges zerfällt. Positive Werte zu 75 %, Begleiter (Henker-Schwelle) und **Nachteile/Flüche ganz** (sonst
  wäre „Scherbenschneide ohne −25 % Leben“ ein Geschenk). **Einer je Teil**, abgewiesen statt überschrieben, nie Futter, Umschmieden
  lässt ihn stehen. Marke: glühender Splitter oben links an jedem Feld (`rarCls` → `.kern`, CSS-Farbe im UI-Test gerendert geprüft),
  Tooltip-Zeile in Glutrot. Wirkt über `effects()` → `power()`; keine neuen Effekt-Schlüssel, darum nichts Neues in calib.mjs.
- **Rohstoff:** die vier Abgrund-Materialien nicht erzwungen (ihre Schmiede-Idee bliebe sonst weg) – nur ihre **Bilder** genutzt.

**Gemessen** (`descent.mjs --sig`, Stufe 30, 60 Abstiege je Zeile, gekoppelter Zufall; heim = am Ausgang, Tod = 0)
| Klasse (Grenz-Tiefe) | Boss ohne → alle 3, Grenz-Tiefe | Gold heim 6 Tiefen flacher: ohne → alle 3 | Funde | Resi-Boni (Rune) | Seltene (Seele) |
|---|---|---|---|---|---|
| Zauberin (T14) | 78 → 15 % | 4257 → 6591 (+55 %) | +99 % | +73 % | +64 % |
| Assassine (T13) | 52 → 13 % | 3667 → 5572 (+52 %) | +84 % | +56 % | +59 % |
| Barbar (T13) | 65 → 12 % | 3703 → 5764 (+56 %) | +100 % | +67 % | +69 % |
- 3 Tiefen flacher ist es eine echte Wahl: alle 3 bringen der Zauberin +40 % Gold bei 95 % Boss, Assassine/Barbar −14/−9 % Gold
  (Boss 53/60 %). Ein einzelnes Siegel kostet an der Grenze 10–50 Punkte. Schranken (in run.sh): Grenz-Tiefe alle 3 ≥ 20 Punkte
  schwerer; 6 flacher Gold ×1,25, Rune Resi ×1,3, Seele Selten ×1,3. Erster Entwurf (Blut +25 %) war an der Grenze tödlich (13 %).
- **Aschenkern** (`tests/kern.mjs`, St. 40, 3 Würfe): Kern aufs eigene seltene Teil 0–21 % Kampfkraft (Spitze: Henker aus Totengräbers
  Griff), Waffen-Einzigartige getragen +44…68 % gegen Kern ≤ 8 %; Haube des Pakts −40 % (Fluch wandert mit). Schranke ≤ 30 %.

**Tests:** voller `sh tests/run.sh` grün. Logik +2 (Siegel einlegen/bereinigen/verbrauchen/Umkehren, kein Absturz ohne Feld,
Boss stärker, mehr Elite, Ausgang, Laden; Aschenkern: einer je Teil, zerfällt, nur Beutel, Nachteile, Futter-Sperre, Neu würfeln,
Laden, Marke). ui.cjs: Siegel einlegen ohne Scrollen + verbraucht, Kern mit Rückfrage + Marke. Neu `tests/kern.mjs`,
`descent.mjs --sig`. Screenshots `welle2b2-siegel.png`, `-aschenkern.png` (iPhone 13). Keine Save-Version (Felder lazy).

**Offene Fragen**
1. Flach + 3 Siegel schlägt tief ohne Siegel an Menge (Beute ist dafür 12 Stufen niedriger). So gewollt (PoE: Skarabäen auf bequemen Karten)?
2. Aschenkern aus Totengräbers Griff ist für alle Klassen der beste Kern (Handschuhe). Lassen oder Henker auf 50 % dämpfen?
3. Die Bilder der vier Abgrund-Materialien sind jetzt vergeben – brauchen Glutstein/Fassung/Seele/Blut später eigene, oder fällt die Idee?
4. Legendäre heißen teils wie Einzigartige („Witwenmacher“ als Ziel im Screenshot) – alt, beim Aschenkern verwirrend.
