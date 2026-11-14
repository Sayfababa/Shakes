#!/bin/sh
# Alle Tests: Logik, kurzer Bot-Lauf (Balance-Rauchtest), Browser-UI.
set -e
cd "$(dirname "$0")/.."
echo "== Logik ==";   node --test tests/logic.test.mjs
echo "== Bot (3 Tage, alle Klassen) =="
for c in barbarian paladin assassin huntress sorceress witch; do node tests/bot.mjs $c 3 1 | grep -E "Kämpfe" | sed "s/^/$c: /"; done
echo "== UI ==";      node tests/ui.cjs
