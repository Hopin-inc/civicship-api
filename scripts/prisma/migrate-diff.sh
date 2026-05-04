#!/bin/bash

# scripts/prisma/migrate-diff.sh
#
# Two modes:
#
# 1. Developer mode (positional NAME argument):
#      pnpm db:migrate-diff <migration_name>
#    Generates a new migration directory by diffing schema.prisma against
#    itself (datasource → datamodel). Used locally to scaffold a migration.
#
# 2. CI scan mode (no arguments, or `--ci` / CI=true):
#      pnpm db:migrate-diff
#    Scans Prisma migration .sql files added vs the base branch (default
#    `origin/develop`) for destructive DDL patterns (DROP TABLE, DROP COLUMN,
#    ALTER COLUMN ... TYPE, RENAME, non-CONCURRENTLY DROP INDEX, ...).
#    Detected hits are emitted as `::warning::` GitHub Actions annotations on
#    stdout. Exit code is always 0 — this check informs reviewers, it does
#    not block merge.
#
# The two modes are mutually exclusive. If the first argument is `--ci` or no
# argument is supplied, CI mode runs; otherwise developer mode runs.

# `set -e` を加える: pipeline 直外の単独コマンドが失敗した時点で即停止し、
# 後続を中途半端に走らせない。grep の "no match" は exit 1 を返すが、明示的に
# `|| true` を付けている呼び出し箇所があるので bare grep が止める動作にしない。
set -euo pipefail

MODE="${1:-}"

run_developer_mode() {
  local NAME="$1"

  if [ -z "$NAME" ]; then
    echo "❌ Error: マイグレーション名が指定されていません。"
    echo "Usage: pnpm db:migrate-diff <migration_name>"
    echo "Example: pnpm db:migrate-diff add_user_table"
    exit 1
  fi

  local TIMESTAMP DIR_NAME SCHEMA_PATH MIGRATIONS_DIR
  TIMESTAMP=$(date +%Y%m%d%H%M%S)
  DIR_NAME="${TIMESTAMP}_${NAME}"
  SCHEMA_PATH="src/infrastructure/prisma/schema.prisma"
  MIGRATIONS_DIR="src/infrastructure/prisma/migrations/${DIR_NAME}"

  echo "🚀 Creating migration: ${DIR_NAME}..."

  mkdir -p "$MIGRATIONS_DIR"

  npx prisma migrate diff \
    --from-schema-datasource "$SCHEMA_PATH" \
    --to-schema-datamodel "$SCHEMA_PATH" \
    --script > "$MIGRATIONS_DIR/migration.sql"

  if [ $? -eq 0 ]; then
    echo "✅ Success! Migration file created at: $MIGRATIONS_DIR/migration.sql"
    echo "---------------------------------------------------"
    echo "Next steps:"
    echo "1. SQLの内容を確認してください。"
    echo "2. npx prisma db push --schema $SCHEMA_PATH でDBに反映します。"
    echo "3. npx prisma migrate resolve --applied ${DIR_NAME} --schema ${SCHEMA_PATH} で履歴を同期します。"
  else
    echo "❌ Error: SQLの生成に失敗しました。スキーマファイルの設定を確認してください。"
    exit 1
  fi
}

run_ci_mode() {
  local BASE_REF="${MIGRATE_DIFF_BASE_REF:-origin/develop}"
  local MIGRATIONS_PATH="src/infrastructure/prisma/migrations"

  echo "🔍 Scanning Prisma migrations added vs ${BASE_REF} for destructive DDL..."

  # Resolve the merge-base so we look only at commits introduced by this PR.
  # If BASE_REF is unavailable (e.g. shallow clone without develop fetched),
  # fall back to comparing the working tree against HEAD's parent.
  local MERGE_BASE=""
  if git rev-parse --verify --quiet "$BASE_REF" >/dev/null; then
    MERGE_BASE=$(git merge-base "$BASE_REF" HEAD 2>/dev/null || true)
  fi

  if [ -z "$MERGE_BASE" ]; then
    echo "::warning::base ref '${BASE_REF}' not found locally; skipping destructive-migration scan"
    exit 0
  fi

  # Collect added migration .sql files (status=A) plus modified ones (M),
  # since edits to historical migrations are themselves suspicious.
  local CHANGED_FILES
  CHANGED_FILES=$(git diff --name-only --diff-filter=AM "$MERGE_BASE"...HEAD -- \
    "${MIGRATIONS_PATH}/*/migration.sql" 2>/dev/null || true)

  if [ -z "$CHANGED_FILES" ]; then
    echo "✅ No new or modified Prisma migration .sql files in this PR."
    exit 0
  fi

  echo "Found migration file(s) to inspect:"
  while IFS= read -r f; do
    [ -n "$f" ] && echo "  - $f"
  done <<< "$CHANGED_FILES"

  # Destructive DDL patterns. Each entry: <regex>:::<label>.
  # Patterns are POSIX ERE (grep -E), case-insensitive. The `:::` separator
  # is used (instead of `|`) because some regexes themselves contain `|`
  # for alternation (e.g. RENAME (TABLE|COLUMN|TO)), which would otherwise
  # be split mid-regex by the `${entry%%|*}` parameter expansion.
  local PATTERNS=(
    'DROP[[:space:]]+TABLE:::DROP TABLE (data loss)'
    'DROP[[:space:]]+COLUMN:::DROP COLUMN (data loss)'
    'ALTER[[:space:]]+COLUMN[[:space:]]+[^;]*[[:space:]]+TYPE[[:space:]]:::ALTER COLUMN ... TYPE (rewrite + potential cast failure)'
    'ALTER[[:space:]]+TABLE[[:space:]]+[^;]*[[:space:]]+DROP[[:space:]]+:::ALTER TABLE ... DROP (data loss)'
    'RENAME[[:space:]]+(TABLE|COLUMN|TO):::RENAME (breaks live readers)'
    'DROP[[:space:]]+(MATERIALIZED[[:space:]]+)?VIEW:::DROP VIEW / MATERIALIZED VIEW'
    'TRUNCATE[[:space:]]:::TRUNCATE (data loss)'
  )

  # DROP INDEX is destructive only when not CONCURRENTLY (production-safe form).
  # Match "DROP INDEX" *not* immediately followed by CONCURRENTLY.
  local DROP_INDEX_PATTERN='DROP[[:space:]]+INDEX(?![[:space:]]+CONCURRENTLY)'

  local TOTAL_HITS=0

  while IFS= read -r file; do
    [ -z "$file" ] && continue
    [ ! -f "$file" ] && continue

    local file_hits=0

    for entry in "${PATTERNS[@]}"; do
      local regex="${entry%%:::*}"
      local label="${entry#*:::}"

      # grep -n: line numbers; -E: ERE; -i: case-insensitive.
      # || true so that "no match" (exit 1) doesn't kill the script under set -e.
      local matches
      matches=$(grep -nEi "$regex" "$file" 2>/dev/null || true)
      if [ -n "$matches" ]; then
        while IFS= read -r match_line; do
          [ -z "$match_line" ] && continue
          # bash parameter expansion で `lineno:content` を 0 fork で分解
          # (旧 `echo | cut` 形式は match 1 件あたり 3 fork)。`echo` 系は内容
          # 先頭が `-e/-n/-E` だと flag 解釈される shell があるため、annotation
          # 出力には printf を使う。
          local lineno="${match_line%%:*}"
          local content="${match_line#*:}"
          # Trim leading whitespace from content for the annotation.
          content=$(printf '%s' "$content" | sed 's/^[[:space:]]*//')
          printf '::warning file=%s,line=%s::Destructive DDL detected (%s): %s\n' \
            "$file" "$lineno" "$label" "$content"
          file_hits=$((file_hits + 1))
        done <<< "$matches"
      fi
    done

    # DROP INDEX without CONCURRENTLY (PCRE via grep -P; fall back to ERE
    # heuristic if -P isn't available, e.g. on BusyBox grep).
    local drop_index_matches=""
    if echo "" | grep -P "" >/dev/null 2>&1; then
      drop_index_matches=$(grep -nPi "$DROP_INDEX_PATTERN" "$file" 2>/dev/null || true)
    else
      drop_index_matches=$(grep -nEi 'DROP[[:space:]]+INDEX' "$file" 2>/dev/null \
        | grep -viE 'DROP[[:space:]]+INDEX[[:space:]]+CONCURRENTLY' || true)
    fi
    if [ -n "$drop_index_matches" ]; then
      while IFS= read -r match_line; do
        [ -z "$match_line" ] && continue
        # 上のループと同じ理由 (fork 削減 + echo の flag 解釈回避)。
        local lineno="${match_line%%:*}"
        local content="${match_line#*:}"
        content=$(printf '%s' "$content" | sed 's/^[[:space:]]*//')
        printf '::warning file=%s,line=%s::Destructive DDL detected (DROP INDEX without CONCURRENTLY locks readers): %s\n' \
          "$file" "$lineno" "$content"
        file_hits=$((file_hits + 1))
      done <<< "$drop_index_matches"
    fi

    if [ "$file_hits" -gt 0 ]; then
      echo "  ⚠️  ${file}: ${file_hits} destructive pattern(s)"
      TOTAL_HITS=$((TOTAL_HITS + file_hits))
    fi
  done <<< "$CHANGED_FILES"

  if [ "$TOTAL_HITS" -eq 0 ]; then
    echo "✅ No destructive DDL patterns detected in changed migrations."
  else
    echo ""
    echo "::warning::Detected ${TOTAL_HITS} destructive DDL pattern(s) across changed migrations. See docs/handbook/DB_MIGRATION.md for the safe-migration playbook (2-step migrations, backfill, view-based replacement)."
  fi

  # Always succeed — this check informs reviewers, it does not block merge.
  exit 0
}

if [ "$MODE" = "--ci" ] || [ -z "$MODE" ]; then
  run_ci_mode
else
  run_developer_mode "$MODE"
fi
