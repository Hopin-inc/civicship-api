#!/usr/bin/env bash
# PreToolUse hook — last-line defense for Bash commands.
# settings.json deny uses prefix matching; this catches regex patterns
# and substring matches that prefix rules can't express.
#
# On match: exit 2 with stderr message so Claude sees the block reason.

set -uo pipefail

if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

input=$(cat)
tool_name=$(printf "%s" "$input" | jq -r '.tool_name // empty')
[[ "$tool_name" != "Bash" ]] && exit 0

cmd=$(printf "%s" "$input" | jq -r '.tool_input.command // empty')
[[ -z "$cmd" ]] && exit 0

block() {
  printf "Blocked by .claude/hooks/pre-tool-use.sh: %s\n" "$1" >&2
  exit 2
}

# git commit / git tag bodies may legitimately mention forbidden patterns
# (e.g. discussing prd env files or push variants in a commit body), so
# this hook exempts the entire command when it starts with one of those.
# Compound commands like `git commit ... && git push --force` are NOT
# left unprotected: Claude Code evaluates each subcommand of a compound
# command independently against settings.json rules, so the chained
# push variant is still caught by the deny list.
if [[ "$cmd" =~ ^[[:space:]]*git[[:space:]]+(commit|tag) ]]; then
  exit 0
fi

# Production environment leaks (settings.json catches pnpm *:prd but not
# raw env-file references). Require .env.prd to follow a flag or known
# loader (-f, source, cat, dotenvx run -f) so commit messages and code
# search queries don't false-positive.
if [[ "$cmd" =~ (^|[[:space:]])(-f|source|cat|exec)[[:space:]]+\.env\.prd ]]; then
  block "command targets .env.prd"
fi
if [[ "$cmd" =~ dotenvx[[:space:]]+run[[:space:]]+-f[[:space:]]+\.env\.prd ]]; then
  block "dotenvx loading .env.prd"
fi
if [[ "$cmd" =~ ^[[:space:]]*DATABASE_URL=[^[:space:]]*prd ]]; then
  block "DATABASE_URL inline override points to a production-like target"
fi

# Force-pushes / hard resets even when scoped differently than settings.json
# can express (e.g. `git -C <path> push --force`, `git push origin -f branch`).
# Match in two stages: first confirm it looks like a `git ... push` invocation,
# then independently check for either `--force` (substring, also matches
# --force-with-lease) or `-f` as a standalone short flag.
if [[ "$cmd" =~ git[[:space:]].*push ]] && \
   [[ "$cmd" =~ (--force|[[:space:]]-f([[:space:]]|$)) ]]; then
  block "git push --force variant is forbidden"
fi
if [[ "$cmd" =~ git[[:space:]].*reset[[:space:]]+--hard ]]; then
  block "git reset --hard is forbidden"
fi

# Destructive rm targeting root or home.
if [[ "$cmd" =~ rm[[:space:]]+-rf?[[:space:]]+/([[:space:]]|$) ]]; then
  block "rm -rf against /"
fi
if [[ "$cmd" =~ rm[[:space:]]+-rf?[[:space:]]+~ ]]; then
  block "rm -rf against \$HOME"
fi

exit 0
