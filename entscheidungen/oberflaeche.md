# Auskunft & Oberfläche

### Eigene Fenster statt Systemdialoge

**Eigene Fenster statt Systemdialoge** (main.js): `ask(text, knopf, fn, rot)` = Frage im Tooltip-Rahmen (`#tip.touch`, Aktion `dlgok`), `note(text)` = kurze Einblendung (`.toast.note`). Nie `alert`/`confirm` – uifuzz meldet jeden Systemdialog als Fehler.

### Siegel gegen Bearbeiten

**Siegel gegen Bearbeiten**: `save()` schreibt Prüfsumme (`aschenkrone_v1_sig`); passt sie beim Laden nicht → `S.tampered` (bleibt für immer, Handel später gesperrt). Tests, die localStorage ändern, erzeugen das absichtlich.

### Tutorial

**Tutorial** (`TUTORIAL`, `tutCheck()` in main.js): ersetzt im HUD die Balken, nie als Overlay über Buttons.

### Ortsbilder

**Ortsbilder** (`assets/places/<ortId>.webp`, 768×384; `.actv .ahead.pic` in style.css, ein `<i class="bg">` in `viewAct`): je Akt eine Szene **hinter dem Kopf** der Akt-Ansicht – kostet keine Höhe, und auf dem SE ist keine übrig. Sichtbar ist nur ein schmales Band aus der Bildmitte (`center 45 %`), deshalb gehört alles Wichtige ins mittlere Drittel (Prompt: `assets/reference/places_prompt.md`). Das Bild liegt **9 px innerhalb** des Panels, damit der Eisenrahmen steht.
**Drei Dinge, die beim Einbau nötig waren:** (1) Eine `url()` in einer **Custom Property** wird gegen das **Stylesheet** aufgelöst, nicht gegen die Seite – `--pic` ergab `css/assets/places/…` und 404. Deshalb ein echtes Element mit `style="background-image:…"`; alle Pfade bleiben relativ (Pages-Unterordner). (2) Ein Schleier, der dick genug für lesbare Schrift ist, lässt vom Bild nichts übrig – die Lesbarkeit trägt die **Schriftkante** (`text-shadow`), der Schleier verläuft nur von links (0,9) nach rechts (0,14). (3) Die Vorlagen sind sehr dunkel und sichtbar ist nur ein Band: ohne `filter: brightness(1.45)` bleibt auf dem Handy schwarz. **Zuschnitt:** das Blatt kam als 2×3 mit ungleichen Zellen – `tools/cut_sheet.py` teilt gleichmäßig und taugt dafür nicht; die Rinnen messen (dunkle Spalten/Zeilen) und mit genauen Kanten schneiden.

### Akt-Texte

**Akt-Texte**: jeder Akt hat `intro` (Kopf der Akt-Ansicht), `say` (Satz des Bosses, sobald er als Nächstes wartet) und `outro` (Nachruf im Ergebnis und im Kopf des geschafften Akts). Händler haben `lines` (wechseln minütlich wie bei `NPCS`). Kurz halten (< 110 Zeichen, Test prüft).

### Die Vorbereitung hat zwei Sparschritte

**Die Vorbereitung hat zwei Sparschritte** (`fitPrep()` in main.js, `.prep.tight` → `.prep.tighter`): die Panels der Vorbereitung sind `flex: none !important`, sie schrumpfen also nicht, sondern laufen unten aus dem Bild – dann ist die Siegchance samt „Kämpfen“ weg. Bisher gab es nur **einen** Schritt (Gürtel als Reihe); reichte der nicht, passierte nichts mehr. `fitPrep` misst jetzt nach dem ersten Schritt erneut und nimmt im zweiten zwei der vier Hinweis-Kärtchen weg, verkleinert das Ortsbild und schluckt die Zeile „ohne Tränke“.
**Kein harter Zeilen-Deckel mehr auf den Hinweisen.** `.prep .etags .etag` hatte `-webkit-line-clamp: 3` – das kappte den Hinweis auch dann, wenn darunter Platz frei war, und weg war der **Ort** („Knochenmark-Tonikum · fehlt Schwarzes Herz **(Bosse)**“), also genau die Auskunft, für die das Kärtchen da ist. **Lieber zwei ganze Hinweise als vier abgeschnittene.**
**Die Gebiets-Vorbereitung war nie geprüft.** `tests/prep.cjs` deckte nur die **Krypta** ab; `viewZonePrep` hat aber den höheren Kopf (Ortsbild, Akt-/Gebietszeile, bei Elite-Gebieten eine rote Zeile, die umbricht) – und genau die hat der Besitzer gemeldet. Jetzt läuft jede Lage zusätzlich als Akt-IV-Elite-Gebiet, und der Test prüft auch, ob ein Hinweis **seinen eigenen Text verschluckt** (`scrollHeight > clientHeight`) – das ragt nirgends heraus und war deshalb unsichtbar, dieselbe blinde Stelle wie beim Grabsiegel. Dazu ein Bildschirm `band` (402 × 874, unten 180 px abgeschnitten): auf dem iPhone frisst ein Band oben (Karten-Navigation, Telefonat) gezeichnete Höhe, **`vh` bleibt aber auf der vollen Bildschirmhöhe** – die Schrift ist dann für einen Bildschirm gerechnet, den es gerade nicht gibt. Nur dort greift der zweite Schritt.
**Ehrlich:** den Überlauf des Besitzers konnte ich in Chromium **nicht** nachstellen – über alle Breiten und Höhen von 320 × 568 bis 440 × 956 passte die Ansicht immer (gemessen: unten stets 4 px Luft). Der zweite Schritt ist deshalb eine Notbremse, die auf dem Gerät greift, wo wirklich überläuft; geprüft ist nur, **dass** sie greift (main künstlich um 180 px gekürzt → zwei Hinweise, „Kämpfen“ sichtbar). Ob sie auf dem iPhone reicht, muss der Besitzer sagen.

### „Zurück" muss dorthin führen, wo man herkam

**„Zurück" muss dorthin führen, wo man herkam** – mehrfach vom Besitzer gemeldet („meistens bringt der Zurück-Knopf mich nicht zurück, sondern woanders hin"). Fenster mit **mehreren Türen** merken sich die Tür: `pitBack` (Vargos Laden), `titleBack` (Titel), `alchBack` (Alchemie). Der Knopf der Alchemie prüfte aber `back === 'prep' || back === 'desc'` und schickte **alles andere zu Ysolde in den Laden** – `actions.alch` in main.js setzt jedoch auch `'pitprep'` und `'zoneprep'`. Aus der Gruben- und der Gebiets-Vorbereitung landete man deshalb beim Händler statt wieder vor dem Kampf, mit verlorenem Gürtel-Zustand. Jetzt gilt: **`'traders'` heißt Ysolde, jeder andere Wert ist eine Ansicht** (`go v=<back>`) – eine neue Tür funktioniert damit von selbst.
**Regel:** wer einem Fenster eine weitere Tür baut, darf den Rückweg nicht gegen eine Liste von Namen prüfen; der Rückweg ist die Ansicht, aus der man kam. `tests/ui.cjs` geht jetzt aus der Gebiets- und der Gruben-Vorbereitung in die Alchemie und wieder zurück und prüft, wo man landet (gegen den alten Stand schlägt die Prüfung an).

### „Wo kriege ich das her?"

**„Wo kriege ich das her?"** (`herbSource(k)` in state.js): der Besitzer stand in der Alchemie vor „Fehlt: Schwefel" und wusste, **was** fehlt, aber nicht **wo** es fällt. Die Antwort stand die ganze Zeit in `HERB_LOC`, nur nie auf dem Schirm. Jetzt steht der Ort in der Kostenzeile, sobald eine Zutat fehlt („Schwefel ×1 (0 – Die Feuergruben)"), und im Tooltip der Zutatenleiste. Der Knopf bleibt kurz („Fehlt: Schwefel") – die Zeile darüber trägt es, und auf dem SE ist kein Platz.
**Regel für alles Nachschlagbare – auch fürs geplante Wiki: ableiten, nie abtippen.** Ein handgeschriebenes „fällt im Moor" lügt in dem Moment, in dem eine Zutat den Ort wechselt; die Kapelle hat ihren schon einmal gewechselt (Grabmoos → Weihrauchharz). Der Logik-Test „Jede Zutat sagt, wo sie fällt" prüft, dass die Auskunft `HERB_LOC` folgt und dass jeder Ort genau eine Zutat liefert.

### Jedes Krypta-Ziel sagt, wo die Krypta ist

**Jedes Krypta-Ziel sagt, wo die Krypta ist** (`wo(c)` in `objectives()` in quests.js): vom Besitzer gefragt – „Quest Bruder Aldemar bei Ysolde, wo soll der sein?". Auf dem Zettel stand nur „Bezwinge: Bruder Aldemar, der Verseuchte"; **die Krypta stand nirgends**, obwohl sie in `CRYPTS`/`ACTS` steht. Jetzt steht sie dahinter – ist sie offen, nur ihr Name („Die Pestkapelle"), ist sie zu, dazu **was fehlt**. Gilt für `boss`, `bossd` und `clear`.
**`cryptOpen` prüft ZWEI Dinge, und der erste Entwurf hat eines davon unterschlagen:** Akt **und** Glockensplitter. Für „Die Glocke" (4 Splitter) stand damit „Akt V schaffen", obwohl der Akt gar nicht die Hürde ist – **ein Hinweis, der lügt, ist schlimmer als keiner.** Der Logik-Test „Jedes Krypta-Ziel sagt, wo die Krypta ist" hat das beim ersten Lauf gefunden, nicht ich. Er prüft jedes Ziel jedes Questgebers in **beiden** Lagen (Akte zu / alle offen) gegen `cryptAct` und ist damit die Wache gegen abgetippte Orte – gleiche Regel wie bei den Zutaten: **ableiten, nie abtippen.**
**Ilse und der Prophet standen in keinem Layout-Test** – `tests/trader.cjs` deckte nur „3 Händler + Vargo" ab, und genau die beiden tragen die **längsten** Zielzeilen (Prophet p6: 90 Zeichen). Sie laufen jetzt mit, mit **zugesperrten Akten** (dann ist die Zeile am längsten) und mit der Prüfung, ob ein Ziel **seinen eigenen Text verschluckt** (`scrollHeight > clientHeight`) – das ragt nirgends heraus und wäre sonst unsichtbar, dieselbe blinde Stelle wie beim Grabsiegel. Gegengetestet: mit künstlich auf 9 px gekappten Zeilen schlägt die Prüfung 88-mal an. Gemessen passt die 90-Zeichen-Zeile auf allen 8 Bildschirmen.

### Das Verzeichnis

**Das Verzeichnis** (`js/wiki.js`; `viewWiki(cat, sel)` in ui.js; `wikicat`/`wikisel` in main.js; Einstellungen → „Verzeichnis öffnen“): Nachschlagewerk in sechs Kategorien – Zutaten, Tränke, Materialien, Orte, Gegner, **Aufwerten**. Vom Besitzer gewünscht, weil er beim Brauen zwar wusste, *was* fehlt, aber nicht *wo* es fällt. Drei Lagen: Kacheln → Liste → Eintrag; Mockup `mockups/wiki.html`.
**`js/wiki.js` ist ein neues DOM-freies Modul** (wie game.js/combat.js, nur reine Ableitung). Es gehört bewusst nicht in state.js: es hält keinen Zustand, es liest nur `data.js` und den Fortschritt. **Alles ist abgeleitet, nichts abgetippt** – Fundort aus `HERB_LOC`, Material aus `MONSTERS[].mat`, Rezepte rückwärts aus `POTIONS`, die Aufwertungs-Wege aus `SERVICES` + `CRAFT.ops` + `CRAFT.fuse` + `CRAFT.raise` + `RUNES`/`FORGE`.
**Es braucht keinen eigenen Spielstand – das war der Punkt, an dem der erste Entwurf fiel.** Ich hatte `S.seen` samt Save v22 schon gebaut, bevor auffiel: **verborgen werden darf nur, was das Spiel selbst verbirgt.** Zutaten und Tränke stehen in der Alchemie ohnehin alle offen – sie im Verzeichnis zu verstecken wäre ein Rückschritt. Orte und Gegner hängen am Akt-Fortschritt, und der steht bereits im Stand. Also: `locKnown`/`mobKnown` leiten ab, die Save-Version blieb bei 21. **Regel: bevor eine neue Ansicht Spielstand bekommt, prüfen, ob die Auskunft schon im Fortschritt steckt.**
**Ein Eintrag verschweigt nur den Verweis, nicht sich selbst** (`herbWhere`/`matWhere`): Schwefel steht in der Liste, aber solange Akt VI zu ist, fällt er „an einem Ort, den du noch nicht kennst“. So bleibt das Verzeichnis vollständig und verrät trotzdem nichts.
**Die Kachel „Aufwerten“ ist die wertvollste** und kam vom Besitzer („Upgrade items?“): **zehn** Wege, ein Teil besser zu machen, verteilt auf drei Händler und zwei Reiter der Schmiede – nirgends sonst stehen sie zusammen, und **jeder hat eine eigene Grenze, von der man heute erst beim Scheitern erfährt** (2 Runen je Teil, Fusion einmal für immer, Siegel einer je Teil). Die Grenze steht deshalb in Blutrot als eigene Zeile.
**`matBottleneck()`**: beim Zusammenschreiben fiel auf, dass **vier Systeme nach derselben Höllenasche greifen** (Schärfen Stufe 5, Verstärken Stufe 5, „Neu würfeln“, Aschenrune) – wer sie für Runen hortet, kommt beim Schärfen nie auf Stufe 5 und merkt nie, warum. Der Hinweis zeigt **genau ein** Material: das mehrfach verlangte, von dem man am wenigsten hat. Der erste Bau zeigte alle fünf – **fünf Warnkästen nebeneinander sind kein Hinweis mehr, sondern Tapete**, und sie drückten die Liste aus dem Bild.
**`.wlist` darf scrollen** – die dritte Ausnahme nach Kampflog und Werte-Ansicht, vom Besitzer ausdrücklich freigegeben („Ja darf scrollen“). Zehn Aufwertungs-Wege und vierzehn Tränke passen auf kein iPhone, und Blättern wäre beim Suchen schlechter. Das Panel darum braucht `min-height: 0` (`.wiki .wcol`), sonst wächst es statt zu scrollen; `tests/ui.cjs` nimmt `.wlist` deshalb von der Überstands-Prüfung aus.
**Tests:** `tests/logic.test.mjs` „Das Verzeichnis leitet ab und vergisst keinen Weg“ prüft, dass jede Zeile aus den Daten kommt (ein abgetippter Ort fällt durch), dass nichts aus einem verschlossenen Akt durchsickert und dass **jeder** Aufwertungs-Weg aufgeführt ist (`CRAFT.ops.length + 5`) – wer eine Operation ergänzt und das Verzeichnis vergisst, baut eine Auskunft, die stillschweigend unvollständig ist. Beide Prüfungen gegengetestet. `tests/ui.cjs` geht jede Kategorie und je einen Eintrag durch.
**Noch nicht drin:** Gegenstände (~70 Basen/Einzigartige), Grab-Sets, Boni. Bewusst zurückgestellt – die meiste Arbeit, der kleinste Nutzen (Gegenstände fallen überall, da stünde meist nur „ab Stufe 14, selten“). Die Kategorie-Symbole sind Platzhalter aus vorhandenen Bildern; eigene Zeichen wären ein Prompt wert.

### Rat bei schlechter Siegchance

**Rat bei schlechter Siegchance** (`weakAdvice(p)` in game.js): unter 35 % steht in der Vorbereitung statt „ohne Tränke“ die naheliegendste Abhilfe (Punkte, Talent, Zauber-Weg, Besseres im Beutel, sonst farmen/Händler).

### Einstellungen

**Einstellungen** (Zahnrad): Ton, „Anzeige-Maße“ (Fehlersuche am Handy), „Held vernichten“.

### Beutel und Lager 10×6: wo die Pixel herkamen

Held: Name (und Titel) steht oben in der Kopfzeile, nicht unter dem Portrait. **Der Beutel ist 10×6** (war 10×4), das Lager ebenso – zusammen 120 Felder statt 40. Unter dem Beutel lagen auf **jedem** geprüften Bildschirm mindestens 111 px ungenutzt (auch auf dem SE); das war reservierte Fläche, die nie jemand gebraucht hat. **Das Padding von `.invp` braucht `!important`** wie das `flex` darüber, sonst gewinnt eine spätere `.panel`-Regel (9-Slice am Dateiende) – deshalb bewirkte ein erster Versuch, Platz zu sparen, gar nichts.
**Die sechste Reihe kostet auf kurzen Bildschirmen ~10 px**, die im `@media (max-height: 720px)`-Block wieder hereinkommen (kleinere Material-Symbole, schmalere Stege, `--gap` 2 px). **Die letzten Pixel nicht an Rändern zusammensuchen:** vier Versuche mit Paddings und Margins endeten jedes Mal bei „+1 px", weil das Raster an `aspect-ratio` hängt und seine Höhe der Breite folgt. `.inv { width: 96% }` auf kurzen Bildschirmen macht es **proportional** flacher und rechnet sich selbst aus. Und: `.mats .matimg` hat ein **negatives** Margin, das die Zeile zusammenzieht – wer es auf `0` setzt, macht es schlimmer, nicht besser.
**Schrift bleibt bei `max(11px, …)`:** ein Versuch, die Materialzeile auf `.72rem` zu setzen, fiel sofort durch (`10,8 px`). `.hero` ist `justify-content: center`: auf hohen Bildschirmen lag die ganze Luft **unter** dem Beutel, jetzt teilt sie sich gleichmäßig auf oben und unten (auf engen Bildschirmen gibt es nichts zu verteilen).
**Zum Thema „der SE ist egal":** die kleine Höhe ist kein SE-Problem. `tests/trader.cjs`/`prep.cjs` prüfen **390×664** – das ist ein modernes iPhone **im Browser**, wo Safaris Leisten ~180 px fressen. Wer den Link antippt statt die App zu öffnen, sitzt auf dieser Höhe. Kein Tagebuch in der UI (nirgends; `S.journal` wird nur noch gespeichert). Ausrüstung symmetrisch: links Helm/Waffe/Handschuhe/Ring, rechts Amulett/Nebenhand/Stiefel/Ring, unter dem Portrait Brust + Gürtel. Portrait sitzt in `.pfill` (absolut) und richtet sich nach den Spalten – nie umgekehrt.

### Jede Seltenheit muss man im Beutel sehen

**Jede Seltenheit muss man im Beutel sehen, ohne etwas anzutippen.** Set-Teile waren im Raster **grau wie gewöhnliche Ware** (vom Besitzer gemeldet) – die Zelle trug `r-set` längst, aber eingefärbt waren in style.css nur `r-magic`, `r-rare`, `r-legendary` und `r-broken`. Kein Fehler in der Logik, eine **fehlende Zeile im CSS**, und damit unsichtbar für jeden Test, der nur auf Überstand und Schriftgröße schaut. Set bekommt jetzt grünen Grund **und** eine grüne Kante – es ist das Seltenste im Spiel (fällt nie zufällig, nur beim Boss seiner Krypta). `tests/ui.cjs` setzt jetzt je eine Zelle pro Eintrag in `RARITIES` in den Beutel und liest die **gerenderte Farbe**: alles außer `normal` muss getönt sein. **Eine neue Seltenheit ohne CSS-Regel fällt damit sofort auf** (gegen den alten Stand schlägt die Prüfung auf allen vier Geräten an). **Einzigartige haben jetzt ebenfalls eine eigene Zellfarbe** (orange, `.uq`) – auf Nachfrage vom Besitzer bestätigt. Sie tragen die Seltenheit `legendary` und sahen im Raster deshalb aus wie jedes andere gelbbraune Teil; ihr Orange stand nur im Namen, also erst **nach** dem Antippen. `rarCls(it)` in ui.js hängt `uq` an die Seltenheitsklasse und wird an **allen** Feldern benutzt (Beutel, Lager, Laden, Körper, Schmiede, Fusion, Vargos Ware, Abgrund-Sack) – **ein Helfer statt acht Fundstellen**, sonst färbt die nächste neue Ansicht wieder nicht mit. An den **Text** kommt `uq` nie, dort trägt `.uniq-txt` das Orange schon. Der Test vergleicht zusätzlich eine `uq`-Zelle gegen eine schlichte legendäre: sie dürfen nicht gleich aussehen.

### Tipp daneben schließt nur (2026-11-23)
Ist ein Fenster offen (Teil-Detail, Rückfrage), schließt ein Tipp außerhalb nur das Fenster und löst nichts aus (vorher öffnete er
sofort das andere Teil). Ein zweiter Tipp öffnet es. Gilt für alle `tip.className === touch`-Fenster (main.js, Klick-Handler).

### Held in ganzer Gestalt (2026-11-24)
Helden-Bildschirm Variante A (Mockup `held-ganzkoerper`): Ganzkörper-Figur (`assets/heroes/<klasse>.webp`, 512×1024, Besitzer-Bild),
daneben Leben, Schaden, Zauberkraft, Rüstung, Ausweichen (gegen Gegner der eigenen Stufe), Blocken, Krit, Resi, Zaubertempo, Kampfkraft –
über dieselben Funktionen wie Kampf/Werte-Ansicht. Ausrüstung links (Helm, Waffe, Handschuhe, Ring) und als Reihe darunter.
**Im Kampf bleibt das quadratische Porträt** (Gegner sind auch Kopfbilder, Zahlen/Effekte sind darauf ausgelegt).
Figur-Höhe 5 × --s: mit Tutorial-Leiste ragte der Beutel bei 5,4 um 6 px heraus (ui.cjs).
