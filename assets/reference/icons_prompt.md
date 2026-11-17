# Prompt: Nachzügler-Symbole (1 Sheet, 4×2, 1024×512)

Stand: **von den 165 Bildern, die der Code heute anfordert, fehlt keines.** Dieses Blatt deckt nur
Geplantes ab — eine neue Zutat (wird jetzt gebraucht) und sechs Abgrund-Gegenstände (Code folgt später).

Mitschicken: `forge_layout.png` (nur für die Anordnung) und ein vorhandenes Material-Symbol aus
`assets/forge/` als Stilvorlage (z. B. `blutstein.webp`).
Zuschnitt wie immer: Schwarz → transparent.

| Feld | Ablage | wofür |
|---|---|---|
| 1 | `assets/potions/i_weihrauch.webp` | **Zutat der Kapelle (Akt V)** – damit jeder Akt eine eigene hat |
| 2 | `assets/forge/glutstein.webp` | Abgrund-Material |
| 3 | `assets/forge/kronsplitter.webp` | Abgrund-Material |
| 4 | `assets/forge/runenfassung.webp` | Abgrund-Material |
| 5 | `assets/forge/seelenstein.webp` | Abgrund-Material |
| 6 | `assets/forge/verderbtes_blut.webp` | Abgrund-Material |
| 7 | `assets/forge/grabsiegel.webp` | Abgrund: Zugang zu einem Abstieg |
| 8 | – | bleibt leer (oder Reserve) |

```
Create ONE image, 1024x512 px: a grid of 4 columns x 2 rows = 8 cells of 256x256 px.
Seven separate inventory item paintings for a dark fantasy RPG, one object per cell, centered,
with generous empty space around it. The eighth cell (bottom right) stays completely empty black.
Pure black background (#000000) everywhere, no floor, no table, no shadow on the background,
no frames, no cell borders, no grid lines.
Style: hand-painted item art in the spirit of Diablo II inventory items, painterly, gritty, dark and
muted, worn and old, light from the upper left, strong silhouette, readable at small size.
Match the attached material icon for style, scale and color grading.

1 a knot of dark amber incense resin, half-burnt, grey ash crusted on one side, a thin charred
  wick embedded in it, faint warm glow deep inside (chapel incense resin, an alchemy ingredient)
2 a fist-sized dull black stone, deep cracks running through it glowing dull orange like cooling
  lava, thin smoke rising (ember stone)
3 a broken shard of a tarnished iron crown, one dark red gem still set in it, edges bent and scarred
  (crown shard)
4 an empty circular iron setting on a short chain, the socket hollow and waiting, hammer marks on
  the rim (rune setting)
5 a smooth pale grey stone, slightly translucent, a faint human face pressing outward from inside
  (soul stone)
6 a small corked vial of thick almost-black blood, the glass clouded, dark red streaks clinging to
  the inside (corrupted blood)
7 a heavy round wax seal, black-green wax on a frayed cord, stamped with an abstract angular grave
  mark, the wax cracked across the middle (grave seal)

No text, no letters, no numbers, no labels, no runes that look like letters of any alphabet.
Use the attached layout only for positions; do not copy its flat look or its labels.
```

**Negativ:** text, letters, numbers, watermark, labels, grid lines, frames, cartoon, flat vector,
3d render, plastic, glossy, bright saturated colors, people, hands.

---

## Nicht auf diesem Blatt: fünf Expeditions-Szenen

Diese Ereignisse leihen sich heute ein Monster- oder NPC-Porträt. Das fällt kaum auf, ist aber eine
Lücke. Sie sind **Szenen, keine Symbole** (anderes Format, anderer Bildaufbau) und gehören deshalb
auf ein eigenes Blatt zusammen mit den vorhandenen `ev_*.webp` – siehe `expedition_prompt.md`.

| geliehen von | sollte werden | Ereignis |
|---|---|---|
| `monsters/pestratte.jpg` | `expedition/ev_nest.webp` | Das Nest |
| `npcs/prophet.jpg` | `expedition/ev_seher.webp` | Der Seher am Wegrand |
| `monsters/knochenhund.jpg` | `expedition/ev_hund.webp` | Der Knochenhund |
| `monsters/bellringer.jpg` | `expedition/ev_glocke.webp` | Eine Glocke läutet |
| `monsters/ghul.jpg` | `expedition/ev_ghul.webp` | Der fressende Ghul |

(CLAUDE.md sagt „6 eigene, 6 geliehen“ – gezählt sind es **7 eigene und 5 geliehene**.)
