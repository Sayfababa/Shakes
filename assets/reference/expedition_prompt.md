# Prompt: Expedition – Stationen + Ereignisse (2 Sheets)

Zuschnitt später wie bei Items/Tränken: Schwarz → transparent (nur Sheet A), Ablage `assets/expedition/<id>.webp`.
Mitschicken: ein Item-Bild aus `assets/items/` und ein Monster-Bild aus `assets/monsters/` (Stil).

## Sheet A – 8 Stations-Symbole (4×2, 1024×512)

```
Create ONE image, 1024x512 px: a grid of 4 columns x 2 rows = 8 separate small icon paintings for a dark fantasy RPG map,
each object centered in its own cell with generous empty space around it.
Pure black background (#000000) everywhere, no floor, no frames, no cell borders, no grid lines, no text, no letters.
Style: hand-painted in the spirit of Diablo II inventory items, painterly, gritty, dark and muted, dramatic top light,
strong silhouette, must read clearly at 40 px. Matching the attached item for style and lighting.
1 herb field: a small clump of dark grave herbs and roots growing from a mound of black soil (id: herb)
2 bone field: a small heap of old bones, a skull and a broken rib cage (id: mats)
3 ruin: a broken stone arch with a crumbling pillar (id: ruin)
4 event: a wax seal stamped with an unreadable sigil, dark red wax, a torn ribbon (id: event) – no question mark, no letters
5 camp: a tiny campfire with three stones and a bedroll (id: camp)
6 shrine: a small weathered stone shrine with a single lit candle (id: shrine)
7 danger: a rusted iron bear trap with dark stains, open jaws (id: danger)
8 goal: a sealed crypt door in a hill, iron rings, faint light in the cracks (id: goal)
Grim, realistic, not cartoon, not glossy, no bright saturated colors except the candle and fire glow.
```

## Sheet B – 6 Ereignis-Bilder (3×2, 1536×768, je 512×384)

Diese sind Szenen (kein Freistellen). Bis sie da sind, nutzt das Spiel Monster-Portraits.

```
Create ONE image, 1536x768 px: a grid of 3 columns x 2 rows = 6 separate dark fantasy scene paintings, each 512x384,
separated by thin pure black gutters. No text, no letters, no frames.
Style: painterly, gritty, Diablo II loading-screen mood, muted browns and greys, single warm light source, heavy vignette.
Matching the attached monster portrait for style.
1 a dying grave robber slumped between two stone coffins in a crypt, a lantern beside him (raeuber)
2 an open grave with a broken lid, something glinting between old ribs (gruft)
3 a pale woman with a lantern beside a horseless cart in thick fog (haendler)
4 an altar made of bones with fresh blood on old stone, candles (altar)
5 a witch's cauldron bubbling green without fire, bottles lined up beside it, swamp (kessel)
6 a kneeling revenant in front of a grave, a ring on its bony hand, moonlight (kniet)
```

## Sheet C – die letzten 5 Ereignis-Bilder (3×2, je 512×512) — **erledigt**

Damit haben **alle 12 Ereignisse eine eigene Szene**. Vorher liehen sich diese fünf ein Monster-
oder NPC-Porträt: ein Porträt zeigt *wen* man trifft, eine Szene zeigt *was geschieht* – und bei
dreien von ihnen ist genau das der Reiz („er wartet", „sie wartet", „hat dich noch nicht bemerkt").

**Beim Nachbauen beachten:** die Szenen werden im Spiel **nicht quadratisch** gezeigt, sondern als
breites Band (`.evt .pic`: `object-fit: cover`, `object-position: center 30 %`, etwa 2,4 : 1). Das
Motiv gehört deshalb ins **obere Mittelfeld**, sonst schneidet das Band es weg.
**Szenen, kein Freistellen** – Zuschnitt mit `python3 tools/cut_sheet.py --plain`.

| Zelle | Ablage | Ereignis | geliehen von |
|---|---|---|---|
| 1 | `assets/expedition/ev_nest.webp` | Das Nest | `monsters/pestratte.jpg` |
| 2 | `assets/expedition/ev_seher.webp` | Der Seher am Wegrand | `npcs/prophet.jpg` |
| 3 | `assets/expedition/ev_hund.webp` | Der Knochenhund | `monsters/knochenhund.jpg` |
| 4 | `assets/expedition/ev_glocke.webp` | Eine Glocke läutet | `monsters/bellringer.jpg` |
| 5 | `assets/expedition/ev_ghul.webp` | Der fressende Ghul | `monsters/ghul.jpg` |
| 6 | – | bleibt leer | |

Mitschicken: ein vorhandenes Ereignis-Bild aus `assets/expedition/` (z. B. `ev_altar.webp`) als
Stilvorlage. Danach nur noch `img` des Ereignisses in `EXP_EVENTS` umstellen – sonst kein Code.

```
Create ONE image, 1536x768 px: a grid of 3 columns x 2 rows = 6 cells of 512x384, separated by thin
pure black gutters. Five separate dark fantasy scene paintings; the sixth cell (bottom right) stays
completely empty black.
Style: painterly, gritty, Diablo II loading-screen mood, muted browns and greys, single warm light
source, heavy vignette, no people's faces in close-up. Matching the attached scene for style.
No text, no letters, no frames, no borders inside the cells.

1 THE NEST: a huge breathing mound of matted fur, rat tails, splintered bone and torn rags filling
  the corner of a stone cellar; dozens of tiny eyes glinting inside it; a few coins and a dagger hilt
  caught in the matted hair; the viewer stands back in the dark
2 THE SEER AT THE ROADSIDE: an old blind seer sitting cross-legged on a fallen milestone where two
  foggy paths cross, cloth bound over his eyes, grey ash settled on his shoulders like snow, a bone
  staff across his knees; seen from a few steps away, small in the frame
3 THE BONE HOUND: a gaunt hound of bone and dried sinew standing still on a ridge of a misty moor
  path, head low, watching the viewer, not charging; distance between it and the viewer; cold blue
  fog, the only warm light from behind the viewer
4 A BELL TOLLS: a narrow stone stairwell going down into black earth inside a graveyard, a thick
  frayed bell rope hanging down the shaft and pulled taut, dust and grit shaken loose and drifting
  in the air; nothing visible at the bottom
5 THE FEEDING GHOUL: seen from behind and to one side, a hunched grey ghoul crouched over a dead
  pilgrim in a dark wood, the pilgrim's staff and scattered bundle on the ground, the ghoul has not
  noticed the viewer; branches frame the view
```

**Negativ:** text, letters, numbers, watermark, labels, grid lines, frames, cartoon, flat vector,
3d render, plastic, glossy, bright saturated colors, modern objects.

---

**Sheet A und B sind fertig und brauchen keine Neuauflage.** Eine zweite Generation beider Blätter
wurde gegen den Bestand gestellt: gleiche Bildaufbauten, gleiche Stimmung, kein Gewinn. Wer hier
Zeit investiert, investiert sie besser in Ortsbilder für die Akte – die fehlen wirklich.
