#!/bin/bash

# 第一引数を取得
NAME=$1

# 引数チェック: 名前が空（未指定）の場合はエラーを表示して終了
if [ -z "$NAME" ]; then
  echo "❌ Error: マイグレーション名が指定されていません。"
  echo "Usage: pnpm db:migrate-diff <migration_name>"
  echo "Example: pnpm db:migrate-diff add_user_table"
  exit 1
fi

TIMESTAMP=$(date +%Y%m%d%H%M%S)
DIR_NAME="${TIMESTAMP}_${NAME}"
SCHEMA_PATH="src/infrastructure/prisma/schema.prisma"
MIGRATIONS_DIR="src/infrastructure/prisma/migrations/${DIR_NAME}"

echo "🚀 Creating migration: ${DIR_NAME}..."

# フォルダ作成
mkdir -p "$MIGRATIONS_DIR"

# diffの実行と保存
npx prisma migrate diff \
  --from-schema-datasource "$SCHEMA_PATH" \
  --to-schema-datamodel "$SCHEMA_PATH" \
  --script > "$MIGRATIONS_DIR/migration.sql"

# 実行結果の確認
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