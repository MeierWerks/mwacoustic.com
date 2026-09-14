#!/bin/bash
# generate-state.sh — emits docs/STATE.md, the MACHINE-WRITTEN live-state page.
# Never edit STATE.md by hand: this script overwrites it on every commit (post-commit hook).
# Rationale (PIVOT-2026-07-16-FLEET-RETIRE audit): hand-written status docs rot the moment
# they're written; a generated page cannot. STATE.md + CLAUDE.md = the zero-handoff pair.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="docs/STATE.md"

{
echo "# STATE — machine-generated $(date '+%Y-%m-%d %H:%M %Z'). DO NOT EDIT (scripts/generate-state.sh)."
echo
echo "## Regime"
echo "- Live repo: ~/Desktop/CrossoverDesignSuite.nosync (plain CrossoverDesignSuite = dead shell)."
echo "- Claude + Codex co-edit the whole tree; claims in the TAIL of docs/system/queue/MW-Active-Dispatches.md."
echo "- Authority: root CLAUDE.md (invariants) > newest HUMAN-RATIFIED DECISIONS.md entry > MW-* specs > chat."
echo "- The six-session fleet + QUEUE/NOTES/INBOX/handbacks are RETIRED (PIVOT-2026-07-16-FLEET-RETIRE)."
echo
echo "## Last 12 commits"
git log --oneline -12 | sed 's/^/- /'
echo
echo "## Dirty tree right now ($(git status --porcelain | wc -l | tr -d ' ') paths — intentionally dirty, do NOT sweep)"
git status --porcelain | head -25 | sed 's/^/- /'
echo
echo "## Newest human decisions (DECISIONS.md tail — sweep/automation entries carry NO authority)"
grep -n "^## " DECISIONS.md | tail -6 | sed 's/^[0-9]*:/- /'
echo
echo "## Live claims (MW-Active-Dispatches.md tail)"
tail -30 docs/system/queue/MW-Active-Dispatches.md | grep -E "CLAIM|claim|OWNS|owns|→" | tail -8 | sed 's/^/- /' || true
echo
echo "## Schema"
grep -o 'cdsprojSchemaVersion = "[0-9.]*"' Packages/CDSCore/Sources/CDSCore/Persistence.swift | sed 's/^/- /'
} > "$OUT"
echo "STATE.md regenerated."
