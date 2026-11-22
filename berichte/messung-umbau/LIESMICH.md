# Messskripte zum Bericht build-umbau.html (nur Analyse)

Die Skripte laufen **nicht** gegen das Spiel, sondern gegen eine Kopie von `js/` mit schaltbaren Varianten:

    cp -r js tests /tmp/var/ && cd /tmp/var && patch -p0 < berichte/messung-umbau/varianten.patch   # Pfade ggf. anpassen
    cp berichte/messung-umbau/*.mjs /tmp/var/tests/ && cd /tmp/var/tests
    node cause.mjs barbarian 1000 20,40          # Schritt 1: Ursache Leben vs. Schaden
    node ttk.mjs sorceress 40 [ohne]             # Züge bis Kill / bis Tod
    KS='{…}' node keys2.mjs assassin 240 20,30,40  # Schritt 2: Schlüsselsteine einzeln
    node boss3.mjs 300                           # Schritt 3: Müllerin / Aldemar
    node loot4.mjs 5                             # Schritt 4: Seltenheiten (100 000 je Fall)
    node farm.mjs                                # Schritt 4: Farm-Effizienz
    KS='{…}' SYN='{…}' node syn.mjs sorceress 400 30,40   # Schritt 5: Bindungen
    MODE=paket KS='{…}' SYN='{…}' node reg.mjs barbarian 240 10,20,30,40   # Schritt 6

Alle Skripte setzen einen festen Zufallskeim (reproduzierbar). Die genauen KS/SYN-Werte stehen im Bericht.
