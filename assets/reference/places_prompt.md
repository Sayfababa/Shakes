# Prompt: Ortsbilder der sechs Akte (1 Sheet, 2×3, 1536×1152, je 768×384)

Ablage `assets/places/<ortId>.webp`. **Szenen, kein Freistellen** – Zuschnitt mit
`python3 tools/cut_sheet.py --plain`. Mitschicken: eine vorhandene Szene aus
`assets/expedition/` (z. B. `ev_kniet.webp`) als Stilvorlage.

## Wo die Bilder landen – und warum das die Bildkomposition bestimmt

Das Ortsbild liegt **hinter dem Kopf der Akt-Ansicht**, unter Titel und Einleitungssatz
(Mockup: `mockups/ortsbild.html`). Das kostet keine Höhe – und auf dem iPhone SE ist keine übrig.

Daraus folgen drei harte Vorgaben, die wichtiger sind als jedes Motivdetail:

1. **Das sichtbare Feld ist 4,6 : 1**, also ein schmales Band. Gemalt wird trotzdem **2 : 1**, weil
   ein so extremes Format schlechtere Bilder gibt; das Spiel schneidet das Band aus der Mitte
   (`background-position: center 45 %`). **Alles Wichtige gehört in das mittlere waagerechte
   Drittel.** Was oben oder unten sitzt, sieht niemand.
2. **Die linke Hälfte bleibt dunkel und leer** – dort stehen Titel und Satz, darüber liegt ein
   Schleier. Das Motiv gehört nach **rechts der Mitte**.
3. **Keine Figuren im Vordergrund, kein Boss.** Das Bild zeigt den *Ort*, nicht die Begegnung; die
   Bosse haben eigene Porträts. Menschenleer, nur Bauwerk, Landschaft, Spuren.

| Zelle | Ablage | Akt |
|---|---|---|
| 1 | `assets/places/friedhof.webp` | I · Friedhof von Vhal |
| 2 | `assets/places/muehle.webp` | II · Die Alte Mühle |
| 3 | `assets/places/katakomben.webp` | III · Katakomben |
| 4 | `assets/places/moor.webp` | IV · Moor der Gehenkten |
| 5 | `assets/places/kapelle.webp` | V · Eingestürzte Kapelle |
| 6 | `assets/places/gruben.webp` | VI · Die Feuergruben |

```
Create ONE image, 1536x1152 px: a grid of 2 columns x 3 rows = 6 cells of 768x384, separated by thin
pure black gutters. Six wide dark fantasy landscape paintings, one per cell. No people, no creatures
in the foreground, no text, no letters, no frames, no borders inside the cells.
Style: painterly, gritty, Diablo II loading-screen mood, muted browns greys and cold blues, a single
weak light source, heavy vignette, deep black shadows. Matching the attached scene for style.
COMPOSITION, same for all six and more important than any detail:
- the main subject sits in the RIGHT half of the cell
- the LEFT third is dark and almost empty: deep shadow, fog or plain darkness, nothing to read
- everything that matters sits in the MIDDLE horizontal third; top and bottom edges stay empty
  (sky, fog, ground) because they get cropped away
- a wide, calm, horizontal view, as if standing at the edge of the place and looking across it

1 A GRAVEYARD AT NIGHT: crooked rows of old headstones running to the right, a leaning iron gate,
  freshly dug open graves with mounded earth and a spade left standing, bare willows, low mist,
  a cold moon behind cloud
2 AN OLD WATERMILL: a huge wooden mill wheel standing still in a dry stony streambed on the right,
  the mill house dark and sagging behind it, torn grain sacks spilling grey flour, dust in the air
3 CATACOMBS: a long vaulted stone corridor on the right, its walls stacked floor to ceiling with
  skulls and long bones in neat ordered rows, a single guttering candle, dust, darkness swallowing
  the far end
4 A HANGING MOOR: still black water with a plank walkway, gnarled willows on the right with frayed
  ropes and empty nooses hanging from the branches, pale will-o'-wisps low over the water, cold fog
5 A COLLAPSED CHAPEL: the broken shell of a stone chapel on the right, the roof fallen in, the bell
  tower cracked and leaning, burnt-out candles everywhere on the steps, an overturned altar slab,
  thin smoke of incense
6 FIRE PITS: a black slag slope falling to pits of glowing embers and cracked lava on the right,
  a bridge of heavy iron chains spanning them, sulphur haze, ash falling like snow, the silhouette
  of a forge chimney against a dull orange sky
```

**Negativ:** text, letters, numbers, watermark, labels, grid lines, frames, people, faces, monsters,
cartoon, flat vector, 3d render, plastic, glossy, bright saturated colors, modern objects.

---

**Danach:** sechs Dateien schneiden, `assets/places/` anlegen, im Kopf der Akt-Ansicht einhängen
(eine Zeile in `viewAct`, dazu `.ahead.pic` im CSS – das Bild liegt **9 px innerhalb** des Panels,
damit der Eisenrahmen stehen bleibt). Keine weitere Logik.
