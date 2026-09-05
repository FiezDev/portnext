#!/bin/bash
# visual-diff.sh — the zero-pixel gate for the perf-upgrade pack (T1).
#
# Usage:
#   ./scripts/visual-diff.sh --capture   # write the baseline (pack baseline/)
#   ./scripts/visual-diff.sh --check     # fresh capture + diff vs baseline
#
# Captures, per route x viewport: a PNG screenshot (pixel diff, Pillow) and
# the a11y-tree snapshot as .txt (structural diff). Exit 0 = no meaningful
# change. Deterministic by construction: a freeze init-script (seeded
# Math.random, reduced-motion, animations off, eager images) is registered
# before any page JS, and the server SHOULD be a production build
# (`bun run build && bun run start`) — the dev overlay/react-scan paints
# non-deterministically and breaks the pixel gate.
set -euo pipefail

ORIGIN="${ORIGIN:-http://localhost:3000}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACK_DIR="$REPO_ROOT/docs/spec/2026-09-05-task-perf-upgrade"
BASELINE="$PACK_DIR/baseline"
SETTLE_MS=3000
SEED="?__seed=1337"   # activates the app-side visual freeze (inert without it)
ROUTES=(/ /portfolio /work /blog /admin)
# (/portfolio/v1 307-redirects to /portfolio and drops __seed — same page,
#  captured once; the app's redirect itself is untouched)
# "width height label"
VIEWPORTS=("1280 800 desktop" "390 844 mobile")

capture() {
  local dir="$1"
  mkdir -p "$dir"
  # register the freeze hook before any page JS (persists for the session)
  agent-browser open about:blank --init-script "$REPO_ROOT/scripts/freeze-init.js" >/dev/null 2>&1
  local vp w h label route name
  for vp in "${VIEWPORTS[@]}"; do
    read -r w h label <<< "$vp"
    agent-browser set viewport "$w" "$h" >/dev/null
    for route in "${ROUTES[@]}"; do
      if [ "$route" = "/" ]; then name="root"; else name="${route//\//_}"; name="${name#_}"; fi
      agent-browser open "$ORIGIN$route$SEED" >/dev/null 2>&1
      agent-browser wait "$SETTLE_MS" >/dev/null 2>&1
      agent-browser screenshot "$dir/${name}-${label}.png" >/dev/null 2>&1
      agent-browser snapshot > "$dir/${name}-${label}.txt" 2>/dev/null
    done
  done
  echo "captured $(ls "$dir" | wc -l) files into $dir"
}

case "${1:-}" in
  --capture)
    capture "$BASELINE"
    ;;
  --check)
    if [ ! -d "$BASELINE" ]; then
      echo "no baseline at $BASELINE — run --capture first" >&2
      exit 1
    fi
    CURRENT="$(mktemp -d)/shots"
    capture "$CURRENT"
    python3 "$REPO_ROOT/tools/visual_diff.py" diff "$BASELINE" "$CURRENT"
    ;;
  *)
    echo "usage: $0 --capture|--check" >&2
    exit 64
    ;;
esac
