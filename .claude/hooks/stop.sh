#!/usr/bin/env bash
# Stop hook — runs a quality gate before Claude is allowed to stop.
# On failure: exit 2 + stderr message so Claude treats it as blocking
# and goes back to fix the issue.
#
# IMPORTANT: respects stop_hook_active to avoid infinite stop loops.
#
# Escape hatch: set CLAUDE_STOP_HOOK_SKIP=1 to bypass (e.g. mid-refactor WIPs).
# Opt-in heavy check: set CLAUDE_STOP_HOOK_RUN_TESTS=1 to also run `pnpm test`.

set -uo pipefail

# Manual bypass
if [[ "${CLAUDE_STOP_HOOK_SKIP:-0}" == "1" ]]; then
  exit 0
fi

if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

input=$(cat)

# Avoid infinite loops: when Claude is already in forced-continuation
# from a previous block, let it stop.
stop_hook_active=$(printf "%s" "$input" | jq -r '.stop_hook_active // false')
if [[ "$stop_hook_active" == "true" ]]; then
  exit 0
fi

errors=()

if ! pnpm exec tsc --noEmit >/dev/null 2>&1; then
  errors+=("typecheck failed (run: pnpm exec tsc --noEmit)")
fi

if ! pnpm exec eslint src/ >/dev/null 2>&1; then
  errors+=("eslint failed (run: pnpm lint)")
fi

if [[ "${CLAUDE_STOP_HOOK_RUN_TESTS:-0}" == "1" ]]; then
  if ! pnpm test >/dev/null 2>&1; then
    errors+=("tests failed (run: pnpm test)")
  fi
fi

if [ ${#errors[@]} -gt 0 ]; then
  printf "Quality gate failed before stop:\n" >&2
  for e in "${errors[@]}"; do
    printf "  - %s\n" "$e" >&2
  done
  printf "\nFix the issues above, or set CLAUDE_STOP_HOOK_SKIP=1 to bypass.\n" >&2
  exit 2
fi

exit 0
