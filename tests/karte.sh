#!/bin/sh
# Karte des Codes – damit man Ausschnitte liest statt ganzer Dateien.
# Wird jedes Mal neu aus dem Code erzeugt, kann also nicht veralten.
#   sh tests/karte.sh              – alle Dateien mit Größe
#   sh tests/karte.sh ui           – Funktionen/Konstanten in js/ui.js mit Zeilennummer
#   sh tests/karte.sh css          – Abschnitte in css/style.css
#   sh tests/karte.sh such <wort>  – Fundstellen in js/ + css/, Zeilen auf 160 Zeichen gekürzt
# Danach gezielt lesen: sed -n '120,160p' js/ui.js
cd "$(dirname "$0")/.."
case "$1" in
  "")
    wc -c js/*.js css/*.css | sort -n | awk '{printf "%7.1f kB  %s\n", $1/1024, $2}'
    echo "(sh tests/karte.sh <datei> für die Funktionen, ... such <wort> für Fundstellen)" ;;
  css)
    grep -nE '^/\*' css/style.css | cut -c1-110 ;;
  such)
    shift; grep -rnE "$*" js css | cut -c1-160 ;;
  *)
    f="js/$1.js"; [ -f "$f" ] || { echo "keine Datei $f"; exit 1; }
    grep -nE '^(export )?(async )?function |^(export )?(const|let) |^/\* |^// ==' "$f" \
      | sed -E 's/^([0-9]+):(export )?(async )?/\1  /; s/^([0-9]+  function [^{]*\)) *\{.*$/\1/; s/^([0-9]+  (const|let) [^ =]+) *=.*$/\1/' | cut -c1-110 ;;
esac
