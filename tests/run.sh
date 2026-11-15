#!/bin/sh
# Tests. Aufruf:
#   sh tests/run.sh         – alles, parallel (Logik, Bot, Fuzz, Browser-UI, UI-Fuzz) – vor größeren Änderungen
#   sh tests/run.sh quick   – nur Logik + Browser-UI (~1 min) – für Texte, Farben, Abstände
cd "$(dirname "$0")/.."
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT

ways() { node tests/ways.mjs all all 1500 --check > "$T/ways.full"; rc=$?; grep -E '^!!|Rahmen' "$T/ways.full"; return $rc; }
pots() { for c in barbarian paladin assassin huntress sorceress witch; do node tests/potions.mjs $c all 300 --check > "$T/pot.$c" 2>&1 & done; wait
  grep -h '^!!' "$T"/pot.*; n=$(grep -l 'im Rahmen' "$T"/pot.* | wc -l); echo "Tränke im Rahmen: $n/6 Klassen"; [ "$n" -eq 6 ]; }
bot() { for c in barbarian paladin assassin huntress sorceress witch; do node tests/bot.mjs $c 3 1 | grep -E "Kämpfe" | sed "s/^/$c: /" & done; wait; }

if [ "$1" = "quick" ]; then
  set -- logic ui trader prep
else
  set -- logic bot fuzz ways potions ui trader prep uifuzz
fi
for t in "$@"; do
  case $t in
    logic)  node --test tests/logic.test.mjs ;;
    bot)    bot ;;
    fuzz)   node tests/fuzz.mjs 1500 6 | tail -1 ;;
    ways)   ways ;;
    potions) pots ;;
    ui)     node tests/ui.cjs ;;
    trader) node tests/trader.cjs ;;
    prep) node tests/prep.cjs ;;
    uifuzz) node tests/uifuzz.cjs 120 ;;
  esac > "$T/$t.out" 2>&1 &
  echo $! > "$T/$t.pid"
done

fail=0
for t in "$@"; do
  wait "$(cat "$T/$t.pid")"; rc=$?
  echo "== $t =="
  if [ "$t" = logic ] && [ $rc -eq 0 ]; then grep -E "^# (pass|fail)" "$T/$t.out"; else cat "$T/$t.out"; fi
  [ $rc -ne 0 ] && { echo "!! $t FEHLGESCHLAGEN"; fail=1; }
done
[ $fail -eq 0 ] && echo "== Alles grün ==" || echo "== Fehler, siehe oben =="
exit $fail
