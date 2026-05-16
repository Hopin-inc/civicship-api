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
# 3. Strict CI scan mode (`--strict` or MIGRATE_DIFF_STRICT=true):
#      pnpm db:migrate-diff --strict
#    Same scan as CI mode, but hits are emitted as `::error::` and the script
#    exits 1 on any hit. Used at the prd deploy entry point to **block**
#    destructive migrations from reaching production unreviewed. The pre-merge
#    PR check stays advisory (mode 2) so reviewers see warnings; the deploy
#    gate (mode 3) is the actual fail-closed guard.

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

  # `set -e` 下では bare コマンドが失敗した時点で即終了する。`if cmd; then`
  # 形式に置くと set -e が無効化されるので、エラーパスで cleanup + 専用メッセ
  # ージを出せる (Gemini review on #1012 指摘)。
  if npx prisma migrate diff \
       --from-schema-datasource "$SCHEMA_PATH" \
       --to-schema-datamodel "$SCHEMA_PATH" \
       --script > "$MIGRATIONS_DIR/migration.sql"; then
    echo "✅ Success! Migration file created at: $MIGRATIONS_DIR/migration.sql"
    echo "---------------------------------------------------"
    echo "Next steps:"
    echo "1. SQLの内容を確認してください。"
    echo "2. npx prisma db push --schema $SCHEMA_PATH でDBに反映します。"
    echo "3. npx prisma migrate resolve --applied ${DIR_NAME} --schema ${SCHEMA_PATH} で履歴を同期します。"
  else
    echo "❌ Error: SQLの生成に失敗しました。スキーマファイルの設定を確認してください。"
    # 中途半端に作られた空 migration ディレクトリを残さない (Gemini #999 既出)。
    rm -rf "$MIGRATIONS_DIR"
    exit 1
  fi
}

run_ci_mode() {
  local strict="${MIGRATE_DIFF_STRICT:-false}"
  local BASE_REF="${MIGRATE_DIFF_BASE_REF:-origin/develop}"
  local MIGRATIONS_PATH="src/infrastructure/prisma/migrations"

  # In strict mode, hits become GHA `::error::` annotations and the script
  # exits 1. Used at the prd deploy entry point to block destructive
  # migrations. Non-strict mode (default) keeps annotations as `::warning::`
  # and always exits 0 (advisory, pre-merge PR check).
  local annotation_level="warning"
  if [[ "$strict" == "true" ]]; then
    annotation_level="error"
    echo "🚨 strict mode: destructive DDL will fail the job"
  fi

  echo "🔍 Scanning Prisma migrations added vs ${BASE_REF} for destructive DDL..."

  # Resolve the merge-base so we look only at commits introduced by this PR.
  # If BASE_REF is unavailable (e.g. shallow clone without the target branch
  # fetched), strict mode fails closed (cannot verify → block deploy);
  # non-strict mode skips with a warning (advisory PR check, not load-bearing).
  local MERGE_BASE=""
  if git rev-parse --verify --quiet "$BASE_REF" >/dev/null; then
    MERGE_BASE=$(git merge-base "$BASE_REF" HEAD 2>/dev/null || true)
  fi

  if [[ -z "$MERGE_BASE" ]]; then
    if [[ "$strict" == "true" ]]; then
      echo "::error::base ref '${BASE_REF}' not found locally; cannot run destructive-migration scan in strict mode. Ensure the checkout has enough history (fetch-depth: 0) and that '${BASE_REF}' is reachable." >&2
      exit 1
    fi
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
          # bash parameter expansion + builtin regex で 0 fork (旧 `echo | cut
          # | sed` は match 1 件あたり 4 fork)。`echo` 系は内容先頭が
          # `-e/-n/-E` だと flag 解釈される shell があるため、annotation 出力
          # には printf を使う。
          local lineno="${match_line%%:*}"
          local content="${match_line#*:}"
          # Trim leading whitespace using bash builtin regex.
          [[ "$content" =~ ^[[:space:]]*(.*) ]] && content="${BASH_REMATCH[1]}"
          printf '::%s file=%s,line=%s::Destructive DDL detected (%s): %s\n' \
            "$annotation_level" "$file" "$lineno" "$label" "$content"
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
        # 上のループと同じ理由 (0 fork + echo の flag 解釈回避)。
        local lineno="${match_line%%:*}"
        local content="${match_line#*:}"
        [[ "$content" =~ ^[[:space:]]*(.*) ]] && content="${BASH_REMATCH[1]}"
        printf '::%s file=%s,line=%s::Destructive DDL detected (DROP INDEX without CONCURRENTLY locks readers): %s\n' \
          "$annotation_level" "$file" "$lineno" "$content"
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
    exit 0
  fi

  echo ""
  if [[ "$strict" == "true" ]]; then
    echo "::error::Detected ${TOTAL_HITS} destructive DDL pattern(s) across changed migrations. Deploy blocked. See docs/handbook/DB_MIGRATION.md for the safe-migration playbook (2-step migrations, backfill, view-based replacement)." >&2
    exit 1
  fi

  echo "::warning::Detected ${TOTAL_HITS} destructive DDL pattern(s) across changed migrations. See docs/handbook/DB_MIGRATION.md for the safe-migration playbook (2-step migrations, backfill, view-based replacement)."
  exit 0
}

# `export` is intentional: `run_ci_mode` reads MIGRATE_DIFF_STRICT via
# `${MIGRATE_DIFF_STRICT:-false}`. A bare assignment would also work for the
# same shell, but exporting makes the intent explicit and overrides any
# pre-set env value (e.g. `MIGRATE_DIFF_STRICT=false` in caller env) — Gemini
# review on this PR flagged the ambiguity, fix it once and forget it.
if [[ "$MODE" == "--strict" ]]; then
  export MIGRATE_DIFF_STRICT=true
  run_ci_mode
elif [[ "$MODE" == "--ci" || -z "$MODE" ]]; then
  run_ci_mode
else
  run_developer_mode "$MODE"
fi
