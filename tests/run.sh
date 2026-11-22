#!/bin/sh
# Tests. Aufruf:
#   sh tests/run.sh         – alles, parallel (Logik, Bot, Fuzz, Browser-UI, UI-Fuzz) – bei Logik/Zahlen
#   sh tests/run.sh quick   – nur Logik + Browser-UI (~1:20) – reicht, wenn nur Aussehen geändert wurde
#   sh tests/run.sh logic ui – nur diese Teile (Namen siehe case unten) – während der Arbeit
cd "$(dirname "$0")/.."
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT

ways() { node tests/ways.mjs all all 1500 --check > "$T/ways.full"; rc=$?; grep -E '^!!|Rahmen' "$T/ways.full"; return $rc; }
pots() { for c in barbarian assassin sorceress; do node tests/potions.mjs $c all 600 --check > "$T/pot.$c" 2>&1 & done; wait
  grep -h '^!!' "$T"/pot.*; n=$(grep -l 'im Rahmen' "$T"/pot.* | wc -l); echo "Tränke im Rahmen: $n/3 Klassen"; [ "$n" -eq 3 ]; }
acts() { node tests/acts.mjs all 3 --check > "$T/acts.full"; rc=$?; cat "$T/acts.full"; return $rc; }
sets() { node tests/sets.mjs all all 400 --check > "$T/sets.full"; rc=$?; grep -E '^!!|Rahmen' "$T/sets.full"; return $rc; }
caps() { node tests/caps.mjs all 24 250 --check > "$T/caps.full"; rc=$?; grep -E '^!!|TOT|kommen an|tote' "$T/caps.full"; return $rc; }
tree() { node tests/tree.mjs all all 600 --check > "$T/tree.full"; rc=$?; grep -E '^!!|Rahmen' "$T/tree.full"; return $rc; }
uniq() { node tests/uniques.mjs all all 300 --check > "$T/uniq.full"; rc=$?; grep -E '^!!|Rahmen' "$T/uniq.full"; return $rc; }
desc() { node tests/descent.mjs all 10 120 --check --deep > "$T/desc.full"; rc=$?; grep -E '⚠|Stufe 10' "$T/desc.full"; return $rc; }
lohn() { node tests/lohn.mjs all 30 --check > "$T/lohn.full"; rc=$?; grep -E '⚠' "$T/lohn.full"; [ $rc -eq 0 ] && echo "Lohn neben dem Abgrund im Rahmen"; return $rc; }
bot() { for c in barbarian assassin sorceress; do node tests/bot.mjs $c 3 1 | grep -E "Kämpfe" | sed "s/^/$c: /" & done; wait; }

if [ "$1" = "quick" ]; then
  set -- logic ui trader prep
elif [ -n "$1" ]; then
  :  # einzelne Teile, z. B. sh tests/run.sh logic ui
else
  set -- logic bot fuzz ways potions descent lohn acts sets uniques tree caps ui trader prep uifuzz
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
    descent) desc ;;
    lohn) lohn ;;
    acts) acts ;;
    sets) sets ;;
    uniques) uniq ;;
    tree) tree ;;
    caps) caps ;;
    uifuzz) node tests/uifuzz.cjs 120 ;;
    *) echo "unbekannter Teil: $t"; false ;;
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
