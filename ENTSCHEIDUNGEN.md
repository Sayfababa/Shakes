# ASCHENKRONE – Entscheidungen, Messungen, Fehlergeschichten

Das Langzeitgedächtnis des Projekts. **CLAUDE.md** sagt, *was gilt*; hier steht, *warum* –
mit den Zahlen, gegen die es gemessen wurde, und den Irrtümern, die dahin geführt haben.

**Wann hier nachsehen:** bevor du ein System anfasst, das in CLAUDE.md auf einen Abschnitt hier
verweist; bevor du eine Balance-Zahl änderst; wenn eine Messung dich überrascht (sie ist
wahrscheinlich schon einmal gemacht worden); wenn du dich fragst, warum etwas umständlich aussieht.

Die Texte stehen unverändert so, wie sie beim Bauen entstanden sind – einschließlich der Stellen,
an denen eine Messung die Absicht widerlegt hat, mit der angefangen wurde. Genau die sind wertvoll.

## Wie lesen (sparsam)

Der Inhalt liegt in `entscheidungen/`, eine Datei je Bereich. **Nie alles lesen** – nur den einen
Abschnitt, um den es geht:

    grep -n '^### ' entscheidungen/*.md            # alle Abschnitte mit Zeilennummer
    grep -n '^### Fusionieren' entscheidungen/*.md # einen finden, dann mit sed -n 'a,bp' lesen

| Datei | Bereich |
|---|---|
| `kampf.md` | Kampfkraft, Kurven, Boni auf Items, Treffer-Wirkungen, Klassenwaffe, Attribute, Bewertung, Einblendungen, Siegchance gekoppelt, Serienbremse |
| `zauber.md` | Zauber, Zauber im Kampf, Zauber-Wege |
| `talente.md` | Das Brett, das Brett der Zauberin, ihre drei Einzigartigen |
| `beute.md` | Beute-Tiefe, Umschmieden, Fusionieren, Erheben, Dienste, Schmiede, Sets, Filter, Lager, Gold, Tiers aus dem Wert |
| `inhalte.md` | Akte, Krypten, Grube, Abstieg, Expedition, Umherziehen, Tränke, Steckbriefe, Omen, Glut |
| `oberflaeche.md` | Fenster, Verzeichnis, Hinweise, Vorbereitung, Texte, Bilder, Tutorial, Einstellungen, Raster |
| `tests.md` | Was die Messwerkzeuge messen und wo sie getäuscht haben |
| `sitzungen.md` | Was in früheren Sitzungen passiert ist und schiefging (aus der Übergabe) |
| `fallen.md` | Welche Falle aus welcher Fehlergeschichte stammt |
| `archiv.md` | Die alte CLAUDE.md im Wortlaut – Archiv, keine Regel |

Die Zuordnung oben ist Wegweiser; maßgeblich ist, was `grep` findet.
