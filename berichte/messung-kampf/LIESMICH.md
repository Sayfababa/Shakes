# Messskripte zu kampfsystem.html
Wie berichte/messung-umbau/LIESMICH.md: Kopie von js/ und tests/, Patch anwenden, Skripte nach tests/ kopieren.

    node sys.mjs <klasse> 500 10,20,40 ,A,B,C,AB,BC,ABC   # Elastizitäten, Overkill, Frühspiel
    V='{"sys":"C","dexH":0.003}' node marg.mjs <klasse> 400 20,40                     # Kon-Optimum unter einem System
    MODE=paket V='{"sys":"BC","dexH":0.003}' KS=… SYN=… node reg.mjs <klasse> 240 10,20,40   # Build-Lagen
