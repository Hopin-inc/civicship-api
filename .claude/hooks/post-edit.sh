#!/usr/bin/env bash
# PostToolUse hook for Edit|Write|MultiEdit.
# Routes edited files to the right post-processing step:
#   - *.ts / *.tsx          -> per-file eslint --fix + prettier --write
#   - */schema.prisma       -> pnpm db:generate:local (only if local DB is up)
#   - *.graphql             -> pnpm gql:generate
#
# Failures are non-blocking: stderr only, exit 0 always.

set -uo pipefail

# Need jq to parse the tool_input JSON Claude Code passes via stdin.
if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

input=$(cat)
file_path=$(printf "%s" "$input" | jq -r '.tool_input.file_path // empty')

[[ -z "$file_path" ]] && exit 0
[[ -f "$file_path" ]] || exit 0

# Limit scope to files under src/ to avoid acting on docs/configs.
case "$file_path" in
  */src/*) ;;
  *) exit 0 ;;
esac

case "$file_path" in
  *.ts|*.tsx)
    pnpm exec eslint --fix "$file_path" >/dev/null 2>&1 || true
    pnpm exec prettier --write "$file_path" --log-level=silent >/dev/null 2>&1 || true
    ;;

  */schema.prisma)
    echo "[hook] schema.prisma edit detected" >&2

    # Local Postgres container must be running because `prisma generate --sql`
    # validates TypedSQL queries against the live DB.
    if ! docker ps --format '{{.Names}}' 2>/dev/null \
         | grep -qE '^civicship-api[-_](db|postgres)([-_]|$)'; then
      echo "[hook] Local DB is not running. Start it first:" >&2
      echo "[hook]   pnpm container:up" >&2
      echo "[hook] Then regenerate types:" >&2
      echo "[hook]   pnpm db:generate:local" >&2
      exit 0
    fi

    if pnpm db:generate:local >/dev/null 2>&1; then
      echo "[hook] Regenerated Prisma client + TypedSQL types" >&2
    else
      echo "[hook] db:generate:local failed. Run manually: pnpm db:generate:local" >&2
    fi
    ;;

  *.graphql)
    if pnpm gql:generate >/dev/null 2>&1; then
      echo "[hook] Regenerated GraphQL types" >&2
    else
      echo "[hook] gql:generate failed. Run manually: pnpm gql:generate" >&2
    fi
    ;;
esac

exit 0
