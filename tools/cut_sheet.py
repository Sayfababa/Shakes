#!/usr/bin/env python3
"""Schneidet ein KI-Sheet in einzelne Symbole: Schwarz wird transparent.

Die Sheets kommen als Raster auf reinem Schwarz (siehe assets/reference/*_prompt.md).
Das Alpha entsteht aus der Helligkeit mit weicher Kante – harte Schwellen reissen
Rauch und dunkle Kanten ab, und genau die machen bei diesen Bildern die Stimmung.

Aufruf:
  python3 tools/cut_sheet.py [--plain] <sheet.png> <spalten> <reihen> <ziel.webp:zelle> ...

--plain: Szenen statt Symbole. Kein Freistellen, kein Beschneiden – die Zelle wird nur
herausgeschnitten (Ereignis-Bilder der Expedition sind Szenen, kein Inventar).

Beispiel (4x2-Blatt, Zellen von links oben nach rechts unten gezaehlt, ab 0):
  python3 tools/cut_sheet.py blatt.png 4 2 \\
      assets/potions/i_weihrauch.webp:0:192 assets/forge/glutstein.webp:1:128
Je Ziel: <pfad>:<zelle>[:<kantenlaenge>]  (Kantenlaenge sonst 128).
"""
import sys
from PIL import Image

LO, HI = 6, 48          # darunter ganz durchsichtig, darueber ganz deckend
KEEP = 5                # ab diesem Alpha zaehlt ein Pixel zum Gegenstand (Rauch mitnehmen)
PAD = 0.06              # Rand um den Gegenstand, Anteil der Kantenlaenge


def alpha_from_black(cell):
    """Reines Schwarz -> durchsichtig, mit weichem Uebergang. RGB bleibt unveraendert."""
    rgb = cell.convert('RGB')
    lum = rgb.convert('L')
    a = lum.point(lambda v: 0 if v <= LO else (255 if v >= HI else int((v - LO) * 255 / (HI - LO))))
    out = rgb.convert('RGBA')
    out.putalpha(a)
    return out


def trim_square(img, size):
    """Auf den Gegenstand beschneiden, quadratisch mit Rand zentrieren, skalieren."""
    mask = img.getchannel('A').point(lambda v: 255 if v >= KEEP else 0)
    box = mask.getbbox()
    if not box:
        raise SystemExit('Zelle ist leer – stimmen Spalten und Reihen?')
    cut = img.crop(box)
    side = int(max(cut.size) * (1 + 2 * PAD))
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(cut, ((side - cut.width) // 2, (side - cut.height) // 2))
    return canvas.resize((size, size), Image.LANCZOS)


def main(argv):
    plain = '--plain' in argv
    argv = [a for a in argv if a != '--plain']
    if len(argv) < 4:
        raise SystemExit(__doc__)
    sheet = Image.open(argv[0])
    cols, rows = int(argv[1]), int(argv[2])
    cw, ch = sheet.width // cols, sheet.height // rows
    for spec in argv[3:]:
        parts = spec.split(':')
        path, idx = parts[0], int(parts[1])
        size = int(parts[2]) if len(parts) > 2 else 128
        x, y = (idx % cols) * cw, (idx // cols) * ch
        cell = sheet.crop((x, y, x + cw, y + ch))
        if plain:
            img = cell.convert('RGB')
            print(f'{path}  {img.width}x{img.height}  aus Zelle {idx} (Szene)')
        else:
            img = trim_square(alpha_from_black(cell), size)
            print(f'{path}  {size}x{size}  aus Zelle {idx}')
        img.save(path, 'WEBP', quality=92, method=6)


if __name__ == '__main__':
    main(sys.argv[1:])
