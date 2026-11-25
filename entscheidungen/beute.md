# Beute & Aufwerten

### Dienste

**Dienste** (`SERVICES`): Schärfen (Halvar, Waffe), Verstärken (Kaspar, Brust), Bestellen (Halvar), Glücksgriff (Ysolde).
**„Amulett neu weihen" ist entfernt** (nach einem Fehlgriff des Besitzers: ein Tipp, alle Boni des Amuletts neu gewürfelt, nichts rückgängig zu machen). Zwei Gründe: (1) Der Dienst war ein **Überbleibsel aus der Zeit vor dem Umschmieden** – er tat dasselbe wie die Operation `chaos`, nur ohne dass man vorher sieht, was passiert, und ohne die Möglichkeit, vorher zu versiegeln. (2) **Dienste feuern beim ersten Antippen** (`service:` in main.js, kein `ask()`), während Verkaufen von Wertvollem längst zwei Tipps braucht (`precious()`/`sellSure`). Diese Schutzschicht fehlt den Diensten bis heute – **wer einen zerstörerischen Dienst hinzufügt, muss sie dort nachrüsten.** Schärfen und Verstärken sind geblieben, weil sie nur aufbauen und nichts wegnehmen. Die beiden Tests dazu sind ersatzlos entfallen: Siegel, Runen, Sonderbonus und Glut-Verbrauch prüft der Umschmieden-Test ohnehin. Materialien haben damit einen festen Zweck. **Schärfen/Verstärken gehören dem Platz, nicht dem Teil** (`S.temper = {weapon, chest}`, `slotUp()`/`tempered()` in state.js, wirkt in `stats()`): die Stufe bleibt, wenn die Waffe wechselt – sonst lohnt sich Material nie, solange Besseres fallen kann. Tooltips zeigen den Wert inkl. Platz-Stufe („geschärft +2“). Save v17 verschiebt alte `it.up`.

### Material

**Material**: erster Sieg in einem Akt-Gebiet gibt sicher Material (1 + `ACT.matFirst`, Elite +1); Wiederholungen wie bisher `CFG.matChance`.

### Gold-Senken

**Gold-Senken**: Glücksgriff (`gamble` bei Ysolde), Eilen kostet `rushCost()` (Restzeit × Stufe).

### Schmiede

**Schmiede** (Wartezeit-Beschäftigung, Knopf „Schmiede“ bei Halvar; kein Extra-Knopf im Warte-Bildschirm): `RUNES`/`FORGE` in data.js, `forge(slot, mat, score)` in state.js (Rune → `it.runes` + `it.mods`, max. `FORGE.maxRunes` je Teil). Minispiel in main.js (`startForge`/`forgeHit`, rAF-Schleife, nur DOM-Patch). Bilder `assets/forge/` (scene.jpg: Eisen liegt bei left 14,6 %/width 71 %/top ~46 % → `.iron`; `<mat>.webp` Material-Symbole, auch im Beutel; `r_<mat>.webp` Runensteine), Prompt in assets/reference/forge_prompt.md. Kostet Material, keine Glut. Vorbild-Gedanke (GameGene): Berry Bury Berry – im Warte-/Idle-Kreislauf eine Handlung selbst ausführen lassen.

### Beute-Tiefe

**Beute-Tiefe** (Schritt 1 von 4, siehe DESIGN.md „Crafting & Handel“): Boni haben Stufen `TIERS` (I beste, I erst ab Gegenstandsstufe 20; `it.tiers`), seltene Sonderboni `SPECIALS` (`it.fx` + `it.special`, ab Gegenstandsstufe 8), 30 Einzigartige `UNIQUES` (`it.unique`, feste Boni + `fx` + `lore`; die zweite Welle ändert jeweils eine Regel oder handelt etwas ein – Glaskanone `dmgPct`+negatives `hpPct`, Pakt `nohealSelf`). `effects()` summiert `fx` angelegter Items. Neue Kampf-Schlüssel: `echo` (Zauber wirkt nochmal), `ward` (Schild bei Kampfbeginn), `vengeance` (mehr Schaden, je weniger eigenes Leben), `zeal` (jeder dritte Hieb trifft zweimal), `siphon` (Krit heilt % vom Maximalleben), `bulwark` (Blocken gibt Schild), `shred` (Krit bricht Gegner-Rüstung, höchstens auf die Hälfte), `lastBreath` (ein tödlicher Treffer lässt 1 Leben, einmal je Kampf), `secondWind` (heilt einmal unter 30 % Leben), `nohealSelf` (kann sich nie heilen). Wert über `itemValue()`. **Monster wirken keine Zauber** – Effekte, die nur gegen Zauber helfen, sind wirkungslos (deshalb gibt es kein „Frost“).
**Balance:** `node tests/uniques.mjs [klasse] [stufe] [kämpfe] [--check]` (gekoppelter Zufall, in run.sh) tauscht jedes Stück gegen ein gutes seltenes Teil desselben Platzes; fremde Waffenarten werden übersprungen. Jedes Stück muss für seine beste Klasse ≥ +6 Punkte Siegchance bringen und darf nirgends über +55 liegen – dass ein Stück zur falschen Klasse nicht passt, ist gewollt.

### Umschmieden

**Umschmieden** (Schritt 2; Schmiede → Reiter „Umschmieden“): `CRAFT` in data.js; `craft(id, op, stat)`, `craftCheck`, `baseMods` (Boni ohne Runen) in state.js. Ops: seal (Kultistensiegel, 1 je Item), chaos (Höllenasche), values (Knochenstaub), add (Blutstein), remove (Grableinen). Jeder Eingriff kostet Schmiedeglut (`it.glut/glutMax`, +0..2 Zufall); reicht der Rest für nichts mehr → `it.crafted` = Name des Schmieds. Runen, Sonderbonus, Einzigartige bleiben unberührt. Gold = a + Stufe×b + Wert×0,6 → Craften+Verkaufen bringt nie Gold (Test).

### Fusionieren

**Fusionieren** (Schmiede → Reiter „Fusionieren"; der *bestimmte* Gegenpol zum Umschmieden, wo alles würfelt): `CRAFT.fuse` in data.js (`glut`, `max`); `fuseForm`/`fuseMains`/`fuseFoods`/`fuseFull`/`fusePromote`/`fuseCheck`/`fuse` in state.js; `viewFuse(sel)` in ui.js; Aktionen `fusepick`/`fusefood`/`fusemain`/`fusego` in main.js. Zwei Teile **gleicher Grundform** (`slot` + `kind`: Dolch zu Dolch, Gürtel zu Gürtel) und **gleicher Seltenheit**; ein gewählter Bonus wandert vom Futter ins Hauptteil, **mit seiner Stufe**, das Futter zerfällt. Futter nur aus dem Beutel, nie vom Körper (sonst zerstört man aus Versehen, was man anhat). Kostet `CRAFT.fuse.glut` Schmiedeglut und `craftGold(it)` wie jeder Eingriff. Kein `SAVE_VERSION`-Sprung nötig: `it.fused` fehlt bei alten Teilen und zählt dann als 0.
**Die Bremse ist `CRAFT.fuse.max` = 1 – je Teil nur eine Fusion, für immer.** Ohne sie baut jeder binnen Tagen dasselbe perfekte Teil, weil ein Platz bei uns nur eine Handvoll Boni tragen darf (`affixPool`, siehe Tabelle der `slots` in AFFIXES) – der Zufall wäre dann nicht verschoben, sondern gelöscht. Mit der Bremse kommen drei von vier Boni weiter aus dem Würfel, und weil die **Stufe mitwandert**, lohnt das Warten auf einen Spender mit Stufe I. Eine Stufen-Strafe beim Umzug braucht es deshalb nicht.
**Hat das Hauptteil noch Platz** (unter `CRAFT.maxAff[rarity]`), kommt der Bonus einfach dazu. **Ist es voll**, entscheidet der Spieler: einen eigenen Bonus weichen lassen (`mainStat`) **oder** das Teil steigt eine Seltenheit auf (magisch → selten → legendär). Der Aufstieg ändert **nur** die Bonus-Zahl und die Farbe – `dmg`/`armor` des Grundgegenstands bleiben, sonst bekäme man durch zwei magische Teile heimlich einen seltenen Grundwert geschenkt (Test prüft das).
**Versiegeln bekommt damit erstmals einen echten Zweck**: ein versiegelter Bonus kann nicht überschrieben werden. Einzigartige und Set-Teile bleiben draußen (`craftItems()` filtert sie schon). Sonderboni (`fx`) und Runen wandern nie mit – nur Affixe.
**Hinweise statt Schweigen** (nach Spieler-Rückmeldung „blaue Items kann man immer noch keine Boni hinzufügen"): die Mechanik war in Ordnung, die Auskunft nicht. Gemessen (12 Teile, Stufe 20, 3000 Beutel): in nur **33 %** geht überhaupt eine Fusion, in **21 %** der Aufstieg blau → gelb – vier von fünf Mal steht da nichts, ohne dass gesagt wird warum. Dazu hat die Hälfte aller magischen Teile nur **einen** Bonus; eine Fusion füllt den zweiten Platz und das Teil **bleibt blau**, was wie „nichts passiert" aussieht. Deshalb: ohne Hauptteil steht in Gold da, wenn heute ein Paar im Beutel zusammenpasst; bei einem halbvollen Hauptteil steht da, dass der Bonus dazukommt und die Farbe bleibt, und dass nur ein **volles** Teil aufsteigen kann.
**UI-Regel:** Futter-Boni, die nicht wandern können (das Hauptteil hat sie schon, oder sie gehören laut `affixPool` nicht auf diesen Platz), sind `.no` und gar nicht erst antippbar – sonst tippt man drei Mal, bevor unten steht, warum es nicht geht. Richtung überall ablesbar: links Gold „bleibt", rechts Blutrot „zerfällt", Pfeil nach links. Mockup `mockups/fusion.html`.
**Fusionierte Boni sind markiert wie versiegelte** (`it.fmods`, Helfer `fusedMods(it)`; vom Besitzer gewünscht: „damit man weiß, welche Items fusionierte Boni haben"). Bisher stand am Teil nur `it.fused` – ein **Zähler**, der sagt, *dass* fusioniert wurde, nicht *welcher* Bonus eingewandert ist. Die Marke steht jetzt am Bonus selbst, in allen drei Listen (Item-Fenster, Umschmieden, Fusionieren): gedämpftes Gold für „fusioniert", Blutrot für „versiegelt". Keine Save-Version nötig – fehlt das Feld, ist die Liste leer. **Ehrlich: alte Teile, die vor dieser Änderung fusioniert wurden, tragen keine Marke** (`fused: 1` allein sagt nicht, welcher Bonus es war; nachträglich zu raten wäre eine Erfindung).
**Dabei fiel auf, dass das Item-Fenster auch beim Versiegelten nur „1 Bonus versiegelt" sagte – nicht welcher.** Das stand in der Schmiedeglut-Zeile und ist dorthin gewandert, wo es hingehört: an den Bonus. Eine Regel statt zwei Sonderfälle.
**Die Marke muss dem Bonus folgen, sonst lügt sie.** `values` und `chaos` würfeln über `roll1()` auch die **Stufe** neu – und die Stufe ist genau das, was bei der Fusion mitwandert. Deshalb fallen bei diesen beiden Operationen alle angefassten (`free`) Boni aus der Liste; `keepFused()` filtert danach auf Boni, die es überhaupt noch gibt (`remove` nimmt seine Marke mit). **Wer eine neue Operation in `CRAFT.ops` ergänzt, muss entscheiden, ob sie die Marke mitnimmt** – der Logik-Test „Die Marke am fusionierten Bonus folgt dem Bonus" prüft `values` und `remove`, eine dritte Operation steht dort nicht von selbst. Der UI-Test prüft den **Text und die Farbe** im Item-Fenster: eine Marke, die das CSS nicht einfärbt, wäre wieder unsichtbar – dieselbe Lücke wie bei der fehlenden Set-Farbe. Beide gegengetestet (ohne die Marke schlagen sie an, der UI-Test auf allen vier Geräten).
**Tests:** `tests/logic.test.mjs` (drei Fälle: Umzug mit Stufe, alle Regeln, „Fusionieren bringt nie Gold"), `tests/ui.cjs` (Fall `fuse0`–`fuse4`). **Der Umzug-Test war flockig** (etwa jeder 25. Lauf, „Bonus im Futter antippen"): er baute die Regel, welcher Bonus wandern darf, mit einer eigenen `AFFIXES`-Abfrage **nach** statt `fuseCheck` zu fragen. Jetzt würfelt er Paare, bis `fuseCheck` eines durchlässt – 75 Läufe ohne Ausfall. **Regel daraus: ein Test darf die Regel nicht nachbauen, er muss sie aufrufen**; sonst driften Test und System auseinander, ohne dass es jemand merkt.
**Dieselbe Krankheit beim Krit-Schaden-Test** („höherer Multiplikator → mehr Schaden pro Krit"): der Messheld hatte normales Leben und starb unterschiedlich schnell, also schwankte die **Zahl der Krit-Proben**. Er bekommt jetzt dasselbe Riesenleben wie der Messgegner – gemessen wird Schaden je Krit, nicht Überleben. **Faustregel für Kampf-Tests ohne Zufallskeim: der Messkampf muss immer gleich lang sein**, sonst misst man die Stichprobengröße mit.
**Dritter Fall, „Letzter Atem verlängert den Kampf nicht":** der Test mittelte schon über 60 Kämpfe, aber das reichte nicht. Über 120 Versuche gemessen lag das **kleinste Verhältnis bei 1,156**, die Schranke steht bei **1,15** – die Luft war 0,006 breit. Bei 250 Kämpfen liegt das Minimum bei 1,192. **Wer eine solche Schranke setzt, muss die Verteilung messen, nicht schätzen** – „ich mittle ja schon" sagt nichts über den Abstand zur Schranke.
**Messlatte in `tests/uniques.mjs`:** seit es das Fusionieren gibt, ist erwürfelte Beute nicht mehr der Maßstab für ein Einzigartiges. `fuseSlot()` baut je Platz dasselbe Teil **einmal optimal fusioniert** (bester Bonus laut `power()`, Stufe I, über den echten `G.fuse()` – der Test folgt damit den Regeln, wenn sie sich ändern); die Spalte „Δ vs. fus." zeigt das Einzigartige gegen dieses selbst gebaute Teil. `LIM.fused` = **−12**, gesetzt aus der gemessenen Verteilung: drei Ausreißer lagen bei −17 bis −21, das nächstbeste Stück bei −8,7 – die Grenze liegt in dieser Lücke.
**Was die Messung über das Fusionieren selbst sagte:** eine einzige Fusion ist **+18 bis +34 Punkte** wert (gute Einzigartige liegen bei +30 bis +42, die Untergrenze für ein Einzigartiges bei +6). Die Zerlegung (Stufe I/II/III × „steigt auf" gegen „Bonus weicht") zeigte: **der Aufstieg magisch→selten ist unter 2 Punkte wert** – die Kraft steckt fast vollständig in der Güte des einen Bonus, nicht im gewonnenen Bonus-Platz. Der Aufstieg darf deshalb bleiben, wie er ist; eine Stufen-Strafe beim Umzug ist nicht nötig. **Vorsicht beim Nachbauen der Messung:** `affixValue(..., legend)` nur für legendäre Spender setzen (sonst 6,5 Punkte zu viel), und Spender brauchen je Platz eine eigene ID – sonst findet `fuse()` nach dem ersten Fehlschlag immer den alten Spender und alle folgenden Plätze messen 0.

### Erheben

**Erheben** (Kronsplitter; `CRAFT.raise` in data.js, `craftRaises`/`craftMat` in state.js, `craftHint` + Knopf-Umbenennung in ui.js, `DESCENT.kronBoss/kronElite` in game.js): „Hinzufügen" war an einem **vollen** Teil tot – der Knopf sagte nur „Kein Platz für weitere Boni." und das las sich wie das Ende des Spiels für dieses Teil. Mit einem **Kronsplitter** geht es doch: ein **gewürfelter** Bonus kommt dazu und das Teil steigt **magisch → selten** auf. Der Knopf heißt dann „Erheben", zeigt das andere Material und steht in Gold.
**Der Preis ist bewusst kein Gold.** Gold bremst niemanden (ein Spieler auf Stufe 17 hatte 25 815 bei 312 Gold je Eingriff) – dann wäre jedes volle blaue Teil für Kleingeld ein gelbes und die Seltenheitsleiter bricht zusammen. Der Splitter kommt **nur aus dem Abgrund** (`kronBoss: 1` sicher beim Boss, `kronElite: 0.12` × Unruhe) und liegt bis zum Ausgang im Sack – wer unten stirbt, verliert ihn.
**Eine Aufwertung je Teil, über alle Wege** (`it.risen`): Fusion und Erheben teilen sich dieselbe eine Stufe, `fusePromote` prüft `risen` mit. **Nur magisch → selten**: selten → legendär wäre sonst der kürzeste Weg zu einem Spitzenteil. Grundwerte (`dmg`/`armor`) bleiben wie beim Fusionieren – sonst bekäme man einen seltenen Grundwert geschenkt (Test prüft beides).
**Gemessen** (Stufe 20, voll magische Ausrüstung, 1200 Kämpfe je Teil, gekoppelter Zufall, 3 Klassen): ein Erheben bringt **Ø 6,6–12,4 Punkte** Siegchance (Median 5–9). Eine Fusion bringt +18 bis +34 – das Verhältnis ist gewollt: **gewählt schlägt gewürfelt**, dafür braucht die Fusion ein zweites passendes Teil.
**Offen und ehrlich:** Der Splitter kann **Ziele verlieren**. Er wirkt nur auf volle *magische* Teile; wer so tief im Abgrund steht, trägt oft schon Seltenes. `tests/descent.mjs` misst auf Stufe 20 einen Boss-Sieg in 33 % der Abstiege, bei `DESCENT.daily` = 3 also grob einen Splitter je Tag – gegen höchstens ~9 Plätze, die je erhoben werden können. Läuft das Material leer, ist der nächste Schritt `raise.from` um `rare: 'legendary'` zu erweitern (dann mit höherem `n`) – **nicht gemessen, bewusst noch nicht gebaut.**

### Lager

**Lager** (`STASH_W`/`STASH_H` = 10×6 in data.js; `grid()`/`fitsIn`/`findSpotIn`/`addToGrid`/`keep`/`stashPut`/`stashTake`/`sellStash`/`stashLeft` in state.js; `invPanel()` in ui.js; `invmode`/`stashput`/`stashtip`/`sellstash` in main.js; `S.stash`, Save **v20**): **Beutel und Lager liegen am selben Platz** im Helden-Bildschirm, ein Knopf neben „Ordnen" schaltet um. Im Item-Fenster heißt die Aktion „Lagern" bzw. „In den Beutel".
**Die Rasterlogik nimmt jetzt das Behältnis als Argument** statt `S.bag` und die Maße fest zu verdrahten – `grid('bag')`/`grid('stash')` ist die einzige Stelle, die das weiß. Wer ein drittes Raster braucht, erweitert nur diese Funktion.
**`keep(it)` statt `addToBag(it)` an allen Beute-Stellen** (game.js: Akte, Krypta, Set-Drop, Expedition, Umherziehen, Abgrund-Ausgang): erst der Beutel, dann das Lager, verkauft wird erst, wenn **beides** voll ist. Vorher rutschte ein legendäres Stück still durch, nur weil kein Platz war. Käufe (`pitBuy`) bleiben beim Beutel – dort soll der Spieler selbst Platz schaffen.
**Gelagertes zählt nicht fürs Schmieden und nicht als Fusions-Futter** – `craftItems()` und `fuseFoods()` lesen `S.bag`, das stimmt also von selbst. Das ist Absicht: sonst wäre das Lager nur ein größerer Beutel und Fusionieren beliebig, weil man jedes Futter ewig aufhebt.
**Verkaufen aus dem Lager ging nicht** (vom Besitzer gemeldet). Zwei Fehler in `actions.sellstash`, beide nur bei **wertvollen** Teilen – und genau die lagert man ein:
(1) Die Rückfrage prüfte die Modul-Variable `sellSure`, aber **`hideTip()` läuft im Klick-Verteiler VOR der Aktion** und setzt sie auf `null` – die Bedingung war damit immer wahr, der zweite Tipp fragte wieder, und das Teil blieb für immer liegen. `actions.sell` (Beutel) macht es richtig: es liest **`d.sure`** aus dem Attribut des Knopfs, nicht aus dem Modul-Zustand. **Regel: über zwei Tipps hinweg darf der Zustand nur im DOM stehen, nie in einer Variablen, die `hideTip()` löscht.**
(2) Zum Wiederöffnen des Fensters suchte es sein Element mit `document.querySelector('[data-id=…]')` – und fand den **Knopf im noch gefüllten `#tip`**, der kein `data-tip` trägt; `showTouchTip` stieg sofort aus und es passierte sichtbar gar nichts. Der Beutel baut sich sein Element als Objektliteral (`{ dataset: { tip, action, id } }`); das Lager tut es jetzt auch.
**Am Rechner gab es überhaupt keinen Weg:** das Kontextmenü hing nur an `[data-action="equip"]`, also am Beutel. Es nimmt jetzt auch `stashtip`.
`tests/ui.cjs` legt ein seltenes Teil ins Lager und verkauft es über beide Tipps; gemessen wird **Gold und Bestand**, nicht der Knopf. Gegen den alten Stand schlägt es auf allen vier Geräten an.
**Das Lager konnte man nicht ordnen** (vom Besitzer gemeldet), und zwar aus zwei Gründen: `sortBag()` hatte `S.bag` fest verdrahtet, und `invPanel` zeigte den Knopf „Ordnen" nur im Beutel. Jetzt `sortGrid(which)` – dieselbe Regel wie bei `grid()`: **das Behältnis ist ein Argument, nicht eine Annahme.** `sortBag()` bleibt als Kurzform für den Beutel. Beim Fehlschlag (neu sortiert passt nicht) wird die alte Ordnung in **demselben Array** wiederhergestellt (`splice`), nicht durch ein neues ersetzt – sonst zeigt `grid('stash').list` auf eine Liste, die niemand mehr sieht. Der Test prüft Lücken **und** Bestand: ein Ordnen, das ein Teil verliert, wäre schlimmer als keines.
**Die Rückfrage lebt jetzt ganz im Aufruf, nicht mehr im Modul.** Der Verkauf war repariert, aber nur halb: die **Aktion** las `d.sure` aus dem Knopf, der **Knopf selbst** wurde weiter aus der Modul-Variablen `sellSure` gezeichnet, die `hideTip()` löscht. Das funktionierte nur, weil die Reihenfolge günstig war – jedes zusätzliche `render()` oder jeder Tipp dazwischen hätte es wieder gebrochen. `showTouchTip(el, sure)` nimmt die Rückfrage jetzt als Argument; `sellSure` ist ersatzlos entfallen. **Die Regel von oben gilt also doppelt: nicht nur die Aktion, auch die Anzeige darf über zwei Tipps hinweg keinen Modul-Zustand lesen.**
**Ehrlich zum gemeldeten Verkauf:** nachstellen konnte ich ihn nicht. In Chromium verkauft das Lager auf allen vier Geräten, mit Maus **und** mit echten Finger-Ereignissen, sowohl bei einem per Skript eingelegten Teil als auch über den echten Weg (Beutel → „Lagern" → verkaufen). Auch die naheliegende Vermutung, das Fenster springe beim Umschalten auf „Wirklich?" und der Knopf wandere unter dem Finger weg, ist **gemessen widerlegt**: es wandert 1–2 px, und ein Tipp auf dieselbe Stelle trifft weiter den richtigen Knopf. Der Ordnen-Knopf im Lager taugt deshalb als **Prüfstein für die Fassung**: ist er da, ist der neue Stand angekommen.
**`tests/fuzz.mjs` kennt das Lager** (Doppel-Prüfung, Überlappung, Lagern/Zurückholen/Verkaufen als Zufallszüge) – ohne das merkt niemand, wenn ein Teil beim Lagern geklont wird.

### Beute-Moment

**Beute-Moment** (`lootCards()` in ui.js, `F.loot` aus `showFight`): jedes Fundstück eines Kampfs als Kärtchen `.drop` (Bild, Name in Seltenheitsfarbe, ▲ Kampfkraft), antippbar wie im Beutel. Selten/legendär/einzigartig/Set: Lichtsäule `.drop.beam` (einmalige CSS-Animation, Farbe `--dc`). Ab 4 Fundstücken bekommt die Liste `.many` und das Ergebnis wird verdichtet (`.fightwrap.done`: Log weg, kleine Portraits, ohne Lebensbalken) – sonst rutscht „Weiter“ auf dem SE unter den Rand; `tests/ui.cjs` prüft genau diesen Fall (`cryptloot`).
**`rewText` darf keine Zeilen dazugewinnen.** Das Grabsiegel bekam zuerst eine eigene Zeile – und weil Krypta-Bosse es nur in **25 %** der Fälle geben, schlug `cryptloot` mal fehl und mal nicht. Ein Fehler, der kommt und geht, sieht aus wie ein flockiger Test, ist aber ein echter Überstand. Jetzt hängt es als Suffix an der Gold-Zeile. **Neue Belohnung → an eine bestehende Zeile hängen, nicht `L.push()`** – und wenn doch, den Fall mit vier Fundstücken auf dem kleinsten Bildschirm ansehen. Abgrund zeigt keine Kärtchen (Beute liegt im Sack). Meldungen „Akt geschafft“, Krypta-Stufe, neuer Rang stehen in `rewText`.

### Beute-Filter

**Beute-Filter** (`S.filter`, `filterOf`/`filterOn`/`filterHits`/`setFilterMod`/`setFilterTier` in state.js; `hitDots(it)` + `viewFilter()` in ui.js; `filmod`/`filtier`/`filclear` in main.js; Einstellungen → „Nachschlagen" → „Beute-Filter"): vom Besitzer gewünscht – gesuchte Boni und eine Mindeststufe einstellen, jedes Teil zeigt dann **oben links je Treffer einen gelben Punkt**. Keine Save-Version nötig: fehlt `S.filter`, ist der Filter aus.
**Gezählt wird über `baseMods`, nicht `it.mods`** – ein Runen-Bonus ist kein erwürfelter Bonus, sonst leuchtete jedes Runen-Teil für etwas, das beim nächsten Teil nicht wieder herauskommt. Die **Stufe** muss mindestens die gesuchte sein (1 = I ist die beste).
**`hitDots` ist EIN Helfer für alle Felder** (Beutel, Lager, Laden, Vargos Ware, Schmiede, Fusion, Beute-Kärtchen, Abgrund-Sack) – dieselbe Lehre wie bei `rarCls`: acht einzelne Fundstellen heißen, dass die neunte Ansicht es wieder vergisst. **Der Körper bekommt bewusst keine Punkte** – was man trägt, muss man nicht finden.
**Drei Dinge, die erst die Messung bzw. der Screenshot gefunden hat:**
(1) **Fünf Punkte sind 33 px, ein Ring im Browser ist 34 px breit** – mit dem linken Rand ragte der letzte Punkt 1 px heraus. `.fdots` bricht jetzt um (`flex-wrap`, `max-width: calc(100% - 4px)`) und hält damit auch, wenn ein Teil später mehr Boni tragen darf.
(2) **36 Bonus-Knöpfe passen in kein Panel.** Der Filter ist deshalb eine **eigene Seite** (wie Verzeichnis/Titel/Grab-Sets), und die **fremden Klassen-Zauber sind draußen** (`a.cls === S.cls`) – „% Kriegsschrei" kann eine Zauberin nie gebrauchen, und die 15 toten Knöpfe drückten die Liste aus dem Panel. Übrig bleiben 21.
(3) **Ein zusätzliches Panel in den Einstellungen ließ den „Zurück"-Knopf auf dem iPhone 13 um 20 px herauslaufen** – auf dem *größeren* Gerät, weil der `min-height: 760px`-Block die Schrift vergrößert. Verzeichnis und Filter teilen sich jetzt ein Panel („Nachschlagen"), das spart das ganze Panel-Gerüst. **Wer den Einstellungen ein Panel hinzufügt, muss auf dem hohen Bildschirm nachmessen, nicht auf dem kleinen.**
**Gefunden hat (2) und (3) nicht der Test, sondern ein Screenshot** – der Test maß das Panel und meldete „passt", während das Panel seine Knöpfe verschluckte. `tests/ui.cjs` prüft jetzt beides (`scrollHeight > clientHeight` **und** ob die Knöpfe unter die Panel-Kante rutschen), dazu Zahl, Farbe und Überstand der Punkte in Beutel und Lager; `tests/logic.test.mjs` prüft Zählung, Stufe, Runen und den leeren Filter. Beide gegengetestet.

### Verkaufsschutz

**Verkaufsschutz**: Seltenes, Legendäres, Einzigartiges, Sonderbonus- und Runen-Teile verkauft erst der zweite Tipp (`precious()`/`sellSure` in main.js). Kein Rückkauf.

### Grab-Sets

**Grab-Sets** (`SETS`, `SET` in data.js; `setCount`/`setOwned`/`setsWorn` + Boni in `effects()` in state.js; `makeSetItem` in loot.js; `setDrop` in game.js; `setBox`/`viewSets` in ui.js): je Krypta ein Set aus 3 Teilen, Seltenheit `set` (grün, `--r-set`, fällt nie zufällig). Teile fallen **nur beim Boss ihrer Krypta**, ab Stufe `SET.minTier`, Chance `SET.chance` + `perTier` je Stufe (max `SET.max`) – bevorzugt ein Teil, das noch fehlt. 2 Teile = ein guter Bonus, 3 Teile = eine **Regeländerung**; `t2`/`t3` sind die Kurztexte für die Anzeige (< 60 Zeichen, Test prüft). Boni müssen Effekt-Schlüssel aus `EFFECT_NAMES` sein (ein Affix-Name wie `critc` wirkt **nicht**), Teil-Boni Affix-Namen mit Stufe wie bei `UNIQUES`. Set-Teile sind vom Umschmieden und Neu weihen ausgenommen und brauchen zum Verkaufen zwei Tipps. Übersicht: Krypta-Tab → Ilse → „Grab-Sets“ (`viewSets`), Details im Item-Fenster (`setBox`). **Balance:** `node tests/sets.mjs [klasse] [stufe] [kämpfe] [--check]` (gekoppelter Zufall, in run.sh): 2 Teile −1…+10, 3 Teile −2…+22 Punkte Siegchance; die Spalte „statt 3 seltenen“ ist nur ein grobes Geländer. Neue Kampf-Schlüssel: `lastStand` (unter halbem Leben heilt alles doppelt), `venom` (Gift heilt dich), `execHp` (Henker-Schwelle), `tollback` (Betäubung prallt zurück), `firstEcho` (erster Zauber wirkt zweimal).

### Tiers aus dem Wert
**Ersetzt 2026-11-21 durch „Feste Stufen (Welle 1a)“** – Folgendes ist Geschichte.
Gebaut 2026-11-19 (Besitzer: „V muss auf jedem Teil gleich sein“, Weg 1, Bezugsstufe 60). Vorher hing die Stufe am Wurf
und damit an der Gegenstandsstufe – ein V auf Stufe 49 schlug ein I auf Stufe 22. Jetzt: `tierOf(stat, wert)` in loot.js liest
die Stufe aus dem Wert, feste Schwellen je Bonus, geeicht auf `CFG.tierRefLvl` = 60 (dort zeigt jeder Wert die gewürfelte
Stufe; Schwelle = Mitte der Lücke zwischen schwächstem Wurf der besseren und stärkstem der schlechteren Stufe). Würfeln,
Werte, Balance unverändert. `it.tiers` (gewürfelt) bleibt gespeichert – kein neues Save-Format – und zählt nur noch für den
Preis (`itemValue`, absichtlich, sonst verschiebt sich die Gold-Wirtschaft). Anzeige (Tooltip, Schmiede, Fusion) und Beute-Filter
nutzen `tierOf`; Fusion „Stufe wandert mit“ ergibt sich von selbst, Einzigartige/Sets zeigen ihre echte Stärke.
Gemessen (20 000 Teile je Gegenstandsstufe, Anteil I/II/III/IV/V): GS 22 heute 5/12/23/30/30 → neu 0/0/2/5/92;
GS 40 → 0/3/10/17/70; GS 60 → 7/13/23/28/30; GS 70 → 14/18/28/18/22. I möglich ab GS 42 (Prozent) bzw. 49 (flach),
legendär (×1,5) ab 15 bzw. 32. Verworfen: Bezug 40 (GS 22 zeigt 79 % V, aber auf GS 60 schon 31 % I, 3 % V – oben sagt die
Anzeige nichts mehr). Bekannt: bei kleinen Werten überlappen zwei Stufen nach dem Runden (Lebensraub 18 % auf GS 60 kann
II oder III gewürfelt sein) – gleicher Wert zeigt dann gleiche Stufe, gewollt.

### Schmiedeglut raus, Verkauf gibt Material
Gebaut 2026-11-19. Besitzer: Schmieden ist okay, aber „es droppt so wenig“ (lohnt fast nur Fusion), die Schmiedeglut je Teil
„nervt“ – raus; Verkauf soll weiter etwas Gold geben, „nicht so viel wie momentan“. Gemessen vorher (Bot, 14 Tage, Zählung in
Kopie): Zauberin gesamt ~93 Schmiede-Material (Asche 18, Staub 22, Blutstein 15, Siegel 8, Leinen 28) ≈ 3–4 Eingriffe/Tag,
fast alles in Tag 1–7. Der Bot verkaufte dabei ~3400 Teile (Magisch 1980, Selten 1196, Legendär 236) für 2,1 Mio. Gold.
**Gewählt (Variante A):** Verkauf = halber Wert (`SELL.share`), legendär + 1 Material fest nach Platz (`SELL.mat`, kein
Zufall – der Knopf sagt es vorher: „Verkaufen · 1520 · 1 Blutstein“). Verworfen B: Chance auf jedes Teil (gleichmäßiger
über Klassen, aber der Knopf könnte nur „vielleicht“ sagen). Nachher (14 Tage): Zauberin 258, Paladin 274 Material ≈
9–10 Eingriffe/Tag; beide erreichen Stufe 27 wie vorher – halbes Verkaufsgold bremst den Fortschritt nicht.
Ein Helfer `sellOff()` für alle Verkäufe (Knopf, Lager, Beute-Schutz, volle Taschen) – vorher 8 Stellen mit `S.gold += it.value`.
Die Bremse gegen „jeder hat das perfekte Teil“ ist jetzt nur Material + Gold (`craftGold` wächst mit dem Wert) und
`CRAFT.fuse.max` = 1.
**Befund:** `sets.mjs` und `uniques.mjs` kippten allein dadurch, dass `makeItem` einen Würfelwurf weniger macht (Startglut):
Tracht der Wäscherinnen 3 Teile +60,5 statt ~+20, fünf Einzigartige unter ihrer Grenze. Mit dem Wurf als leerem Platzhalter
wieder im Rahmen → beide Tests würfeln die Ausrüstung nur **einmal** (Falle „Ein einzelner Ausrüstungswurf entscheidet alles“).
Der Platzhalter steht in loot.js; richtig wäre, beide Tests über mehrere Ausrüstungswürfe mitteln zu lassen (wie tree.mjs).

### Feste Stufen (Welle 1a)
Gebaut 2026-11-21 (Besitzer-Freigabe über die Koordination). Befund vorher: Zauberin St. 22 mit GS-59-Beute gewann 62 % der
Krypta-Bosskämpfe mit dem ersten Treffer (`tests/oneshot.mjs`), Teile mit 57 % Krit / 90 % Zaubertempo. Jetzt: `TIERS` mit festen
Bereichen (`flat`, `pct`, × `per`), GS schaltet frei (V 1, IV 5, III 12, II 22, I 35); %-Boni Stufe I ≤ 15–20 % (Krit 10–12);
Präfix/Suffix je Seltenheit, eine je Gruppe (Hauptattribute = eine Gruppe), strenge Platz-Listen, Legendär-×1,5 weg (nur
Einzigartige behalten ×1,5, `CFG.uniqMult`; Einzigartige/Sets höchstens eine Stufe über der GS, `uniqTierUp`).
**Ausgleich**, sonst kippt die Geschichte (Akt VI erst St. 27–28): `attrPerLevel` 5 → 9, Monster `monHp` 1,3 → 1,15,
`monDmg` 1,1 → 1,0, Konstitution seltener (`w` 0,6, nicht auf Waffe/Handschuhen/Nebenhand – sonst trug fast jedes Teil Kon).
Verworfen: nur Attributpunkte (×11: Assassine sitzt allein durch Glück am Krit-Deckel), nur Monster (späte Akte hingen an
Beute über Heldenstufe). Eichung jetzt „Bonus ÷ Hauptattribut derselben Stufe“. Folgeänderungen: Tracht-Set 3 Teile ×1,4 statt
×2 (`lastStandMul`), Zaubertinte 0,4, Lotusblatt Krit-Schaden statt Krit-Chance, Zweiter Atem/Zuflucht 0,22/0,27, Fokus 0,1,
4 Einzigartige + 1 Set-Teil angepasst. uniques/sets mitteln jetzt über 8/4 Ausrüstungswürfe; Platzhalter-Wurf in loot.js raus.

### Klassenlose Abwehr-Einzigartige abgeschwächt (2026-11-22)
Gemessen (uniques.mjs, 300 Kämpfe × 3 Würfe, St. 14/24): sieben Stücke ohne Klassenbindung lagen für **jede** Klasse
+19 bis +28 Punkte über einem fusionierten Teil (Sünde von Vhal, Der Kalte Spiegel, Der Letzte Atem, Mantel der Leere,
Reif der Zuflucht, Eisernes Gelübde, Knochenkrone) – die Antwort für alle, keine Wahl. Je Stück eine Bonus-Stufe schwächer und
die Sonderwirkung um ~⅓ kleiner (Dornen, Schutz, Block, zweiter Atem). Danach schwächste Klasse +6 bis +16, im Feld der
übrigen Einzigartigen; Test im Rahmen. Besitzer: „abschwächen“. Der Letzte Atem bleibt für eine Klasse bei +28 (Wirkung unverändert).

### Glück-Beute
**Aktiv seit 2026-11-22** (Besitzer: Freigabe 1, nur Dev-Branch). `CFG.lootLuck`: Gewichte wie bisher (Gesamtglück = eigenes +
Umfeld) × (eigenes Glück / Bezug)^0,75 für selten, ^1,5 für legendär; Bezug = 2 × Heldenstufe + 10. Aufrufer geben `own`/`hl` mit
(`myLuck()` in game.js); Händler-, Quest- und Bestell-Teile ohne `own` bleiben wie vorher.
Gemessen (loot6.mjs, echtes makeItem, 100 000 Teile je Fall): bei typischem Glück neutral in jeder Phase (St. 10 Akt selten
11,5 → 11,3 %; St. 20 Krypta identisch; St. 40 legendär 4,9 → 4,5 %), halbes Glück etwas weniger, doppeltes mehr (St. 40 Krypta
legendär 7,1 %). Keine Inflation (Ø-Seltenheit ±0,01). Abstiege (farm6.mjs, 2 × 150 echte Abstiege je Fall): „Glück statt Haupt“
bringt Zauberin/Barbar +21–25 % legendär heim ohne Siegverlust. **Assassine:** Glück-Build verliert den Boss (St. 40 T19 39 → 14 %),
heim 0,14 statt 0,31 legendär je Abstieg. Ursache: Geschick ist bei ihr Hauptattribut **und** Ausweichen/Erstschlag; im Abstieg
läuft das Leben von Raum zu Raum mit, verlorenes Ausweichen summiert sich. Bei Zauberin/Barbar kostet Glück nur Hieb-Schaden,
der dort wenig zählt. Nicht gelöst (keine pauschale Änderung): die Assassine farmt mit dem Standard-Build.

### Fusion: angetippter Bonus weicht seitenunabhängig (2026-11-23)
Besitzer: „das Futter geht eh kaputt, das soll den Schmiedeprozess nicht stoppen“. Ein angetippter Bonus darf weichen, auch wenn er
auf der anderen Seite steht (Suffixe voll, Präfix weicht) – das Teil darf danach z. B. 4 Suffixe und 0 Präfixe tragen. Es bleiben:
Gesamtzahl (`CRAFT.maxAff`) und Gruppe (nie zwei Boni derselben Gruppe, z. B. zwei Attribute). Test: logic „Fusion: angetippter Bonus …“.

### Ramsch verkaufen (2026-11-24)
Knopf „Ramsch“ im Beutel (Besitzer: mehrere Teile auf einmal, ohne etwas kaputt zu machen). `junkItems`/`sellJunk` in state.js:
nur Beutel, nur zerbrochen/gewöhnlich/magisch; geschützt sind Beute-Filter-Treffer, Runen, Sonderbonus, Aschenkern, Einzigartige/Sets
und Verbesserungen (▲, dieselbe Regel `itemGain` wie die Anzeige). Rückfrage mit Anzahl und Gold. Tests: logic, fuzz (Aktion sellJunk).

### Auswahl-Modus im Beutel/Lager (2026-11-24)
Knopf „Wählen“: Tipp hakt an statt ein Fenster zu öffnen; unten „Verkaufen · Gold“ und „Ins Lager“ / „In den Beutel“.
`sellMany`/`moveMany` in state.js laufen über die Einzelfunktionen (sell, sellStash, stashPut, stashTake); was nicht passt, bleibt liegen
und die Meldung sagt „3 von 5 verschoben“. Rückfrage beim Verkauf nennt wertvolle Teile beim Namen. Angelegtes ist nie wählbar.
**Falle, die zugeschlagen hat:** die Aktion hieß zuerst `pick` – die Heldenwahl heißt schon so, das Objekt-Literal überschrieb sie
still (Browser-Test fing es). Neue `data-action`-Namen vorher mit grep prüfen. Tests: logic, fuzz (sellMany/moveMany), Browser.

### Umschmieden gezielt (2026-11-25)
Besitzer: „Crafting noch irgendwie langweilig, besteht fast nur aus Fusionieren, Rest viel zu random." Vier von fünf Eingriffen
würfelten das Ergebnis *nach* dem Klick (GameGene-Joseki „Zufall im Ergebnis abbauen", https://gamegene.app/joseki/reduce-output-randomness).
Mockup `mockups/umschmieden.png`, gewählt 1+2+3 (Chancen-Anzeige nicht).
**Gebaut:** `CRAFT.ops[].stat` = wirkt nur auf den angetippten Bonus (Wert würfeln `values`, Ersetzen `chaos`, Tilgen `remove`); ohne
Antippen gesperrt, der versiegelte nicht antippbar. Ersetzen würfelt aus `craftSwapRoom(it, k)` (was ohne ihn passt, nie er selbst).
`CRAFT.ops[].pick` = Hinzufügen würfelt ein **Angebot** von 3 verschiedenen Boni (`it.offer = [{k, t, v}]`, bei Erheben `it.offerRise`).
**Bezahlt wird beim Würfeln**, das Angebot steht am Teil (im Spielstand) bis `craftPick(id, i)` – Neuladen bringt kein neues. Solange es
steht, sperrt `craftCheck` jeden anderen Eingriff. Erheben (Kronsplitter) bietet genauso drei an; der Splitter ist sofort weg, das Teil
steigt erst bei der Wahl auf. Kein neues Save-Feld nötig (ein Teil ohne `offer` ist einfach eins ohne Angebot).
**Gemessen** (`node tests/craftmess.mjs <klasse> 20 1000`, dieselbe Spielweise alt/neu: besten Bonus versiegeln, Platz → hinzufügen,
sonst den schwächsten ersetzen oder seinen Wert würfeln; Maß = Kampfkraft-Gewinn des Amuletts nach 8/16/32 Material):
| | alt 16 Mat | neu, alle Preise 2 | neu, gewählte Preise |
|---|---|---|---|
| Zauberin selten | Ø 656 | Ø 1912 | Ø 1633 |
| Assassine selten | Ø 392 | – | Ø 1034 |
| Barbar selten | Ø 457 | – | Ø 1128 |
| Zauberin magisch | Ø 669 | Ø 775 | Ø 693 |
Selbst bei doppeltem Preis (4) blieb Selten ~2× stärker – der Großteil kommt aus der Wahl beim Hinzufügen. **Gewählt: 3 für Wert
würfeln/Ersetzen/Hinzufügen, 2 für Tilgen/Versiegeln.** Bewusst: gezielt soll sich lohnen (Besitzer-Wunsch); die Bremse gegen „jeder
hat das perfekte Teil" bleibt Material + Fusion max. 1 + Beute, die mit der Stufe veraltet. Magisch ändert sich kaum (2 Plätze, über
2 nur mit Kronsplitter). **Offen:** ob 3 auf Dauer zu großzügig ist, zeigt erst Spielen – Stellschraube ist `n` in `CRAFT.ops`.
**Testfalle:** `values` würfelte früher alle Boni – Tests, die darüber Stufen sammelten (Abgrund-Leiter), sahen jetzt nur noch einen
Bonus, und war der ein `noDeep`-Bonus, nie Abgrund-Stufen (1 von 6 Läufen rot). Jetzt reihum alle Boni. Tests: logic (drei neue Fälle:
nur der angetippte; Angebot bezahlt/verschieden/übersteht Neuladen/Wahl; Erheben), ui (`craftoffer`, Neuladen), fuzz nimmt Angebote an.

### Schmiede ruhig: festes Raster (2026-11-25)
Besitzer: „Beim Schmieden verschiebt sich das UI, Anzeigen werden größer, kleiner." Gemessen (100 Eingriffe Umschmieden, 100 Tipps
Fusion, iPhone 13 als App): 6 bzw. 7 verschiedene Lagen der Kästen, Sparschritt `tight` in jedem zweiten Schritt (fitPrep schaltete
je nach Bonuszahl und Meldungslänge um – **das** war das Größer/Kleiner), Teile 34 px, Bonus-Zeilen 26–35 px. Ursachen: Angebot höher
als die Knöpfe (+100 px), Meldung 1 oder 2 Zeilen, Teile-Leiste eine oder zwei Reihen.
**Gebaut:** `.umv`/`.fusev` – Leisten je eine Reihe (48 px, seitlich wischen, Lage bleibt über das Neuzeichnen, Gewähltes wird ins
Bild gerollt), Mitte füllt den Rest (rollt nur im Notfall), unten ein Kasten fester Höhe; das Angebot sind drei Kacheln **im** Knopf-
Raster, „Nehmen" in der festen Fußzeile. fitPrep lässt beide aus. **Regel:** in einem Fenster, in dem man wiederholt tippt, darf
sich nichts nach dem Inhalt richten – feste Höhen, Text kurz genug für seine Zeile.
**Test:** `tests/forge.cjs` (in quick und voll) – eine Lage, kein Sparschritt, Tippziele ≥ 40×36, nichts abgeschnitten. Auf dem alten
Stand rot (Gegenprobe). `ui.cjs`/`uifuzz.cjs` nehmen die Wisch-Leisten von „ragt heraus" aus.
**Nebenbefund:** die 27 neuen Item-Bilder kippten `tests/sets.mjs` (fester Keim, 4 Würfe): Grundformen ohne Variante verbrauchten
vorher keinen Wurf in `artOf`. Bildwahl würfelt jetzt mit `Math.random` (Optik darf den Spiel-Zufall nicht verschieben), die
Set-Messung mittelt über 16 Würfe (Streuung je Wurf 6–8 Pkt; Ø 48 Würfe vorher/nachher 17,2/19,4, beide im Rahmen bis 22).
