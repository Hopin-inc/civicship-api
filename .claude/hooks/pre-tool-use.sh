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
# (e.g. discussing prd env files or `git push --force` in a commit body).
# The command itself is recording text, not executing anything dangerous,
# so skip pattern checks for these.
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
# can express (e.g. `git -C <path> push --force`). These are real command
# invocations, not text bodies, so the substring match is safe.
if [[ "$cmd" =~ git[[:space:]].*push[[:space:]].*--force ]]; then
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
