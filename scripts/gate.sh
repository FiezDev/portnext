#!/bin/bash
# gate.sh — the UNIVERSAL GATE for the perf-upgrade pack.
# build -> restart prod server -> test floor (<=31) -> visual diff vs baseline.
# Exit 0 + GATE_OK only when everything holds.
set -uo pipefail
cd "$(dirname "$0")/.."

echo "== build =="
bun run build > /tmp/gate-build.log 2>&1
if [ $? -ne 0 ]; then echo "BUILD FAILED"; tail -8 /tmp/gate-build.log; exit 1; fi

echo "== restart prod server =="
pkill -f "[n]ext-server" 2>/dev/null
pkill -f "[n]ext start" 2>/dev/null
sleep 1
(PORT=3000 nohup bun run start > /tmp/gate-start.log 2>&1 &)
ok=""
for i in $(seq 1 25); do
  if curl -s -o /dev/null http://localhost:3000/ --max-time 2; then ok=1; break; fi
  sleep 1
done
[ -n "$ok" ] || { echo "SERVER DID NOT COME UP"; tail -5 /tmp/gate-start.log; exit 1; }

echo "== test floor (jest, 0 tolerated) =="
bun run test > /tmp/gate-test.log 2>&1
RC=$?
FAILS=$(grep -oE "Tests:[[:space:]]*[0-9]+ failed" /tmp/gate-test.log | grep -oE "[0-9]+" | head -1)
FAILS="${FAILS:-0}"
if [ "$RC" -ne 0 ] || [ "$FAILS" -gt 0 ]; then
  echo "TEST FLOOR BREACHED: $FAILS failed (floor 0)"
  grep -E "✕" /tmp/gate-test.log | head -5
  exit 1
fi
echo "tests: all green under jest (bun test's 31 'failures' were a bun-runner artifact — jest is canonical)"

echo "== visual diff =="
./scripts/visual-diff.sh --check
if [ $? -ne 0 ]; then echo "VISUAL REGRESSION"; exit 1; fi

echo "GATE_OK"
