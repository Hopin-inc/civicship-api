#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ENV_PATH="$SCRIPT_DIR/../../../../../../.env"

if [ ! -f "$ENV_PATH" ]; then
  echo "❌ .env file not found at $ENV_PATH"
  exit 1
fi

set -a
# shellcheck source=../../../../../../.env
source "$ENV_PATH"
set +a

DEFAULT_ALIAS="public-menu"

# alias名 → ディレクトリとファイルベース名のマップ
ALIASES=("admin-menu" "user-menu" "public-menu")
BASE_NAMES=("admin_menu" "user_menu" "public_menu")
DIRS=("admin" "admin" "user")

# 書き出し用 const.ts 初期化
CONSTANT_FILE_PATH="$SCRIPT_DIR/const.ts"
echo "export const LINE_RICHMENU = {" > "$CONSTANT_FILE_PATH"

for i in "${!ALIASES[@]}"; do
  alias="${ALIASES[$i]}"
  baseName="${BASE_NAMES[$i]}"
  dir="${DIRS[$i]}"

  json_path="${SCRIPT_DIR}/${dir}/${baseName}.json"
  tmp_json="$SCRIPT_DIR/tmp_${baseName}.json"

  # 環境変数の埋め込み（envsubst）
  envsubst '${LIFF_BASE_URL}' < "$json_path" > "$tmp_json"

  # JSON構文チェック（任意だが推奨）
  jq . "$tmp_json" > /dev/null || {
    echo "❌ JSON構文エラー: $tmp_json"
    continue
  }

  # リッチメニュー作成（変換済みテンポラリJSONを使用）
  richMenuId=$(curl -s -X POST https://api.line.me/v2/bot/richmenu \
    -H "Authorization: Bearer $LINE_MESSAGING_CHANNEL_ACCESS_TOKEN" \
    -H 'Content-Type: application/json' \
    -d @"$tmp_json" | jq -r '.richMenuId')

  # テンポラリJSON削除
  rm "$tmp_json"

  echo "✅ Created: alias=${alias}, id=${richMenuId}"

  # 画像アップロード
  curl -s -X POST https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content \
    -H "Authorization: Bearer $LINE_MESSAGING_CHANNEL_ACCESS_TOKEN" \
    -H "Content-Type: image/png" \
    -T "${SCRIPT_DIR}/${dir}/${baseName}.png"

  echo "🖼️ Uploaded image: ${baseName}.png"

  # エイリアス削除
  curl -s -X DELETE https://api.line.me/v2/bot/richmenu/alias/${alias} \
    -H "Authorization: Bearer $LINE_MESSAGING_CHANNEL_ACCESS_TOKEN"
  echo "🧹 Removed old alias if existed: ${alias}"

  # エイリアス作成
  curl -s -X POST https://api.line.me/v2/bot/richmenu/alias \
    -H "Authorization: Bearer $LINE_MESSAGING_CHANNEL_ACCESS_TOKEN" \
    -H 'Content-Type: application/json' \
    -d "{
      \"richMenuAliasId\": \"${alias}\",
      \"richMenuId\": \"${richMenuId}\"
    }"
  echo "🔗 Alias created: ${alias}"

  # const.ts に追記（明示的に命名マッピング）
  if [ "$alias" = "admin-menu" ]; then
    key="ADMIN_MANAGE"
  elif [ "$alias" = "user-menu" ]; then
    key="ADMIN_USER"
  elif [ "$alias" = "public-menu" ]; then
      key="PUBLIC"
  else
    key=$(echo "$alias" | tr 'a-z-' 'A-Z_')
  fi

  echo "  $key: '$richMenuId'," >> "$CONSTANT_FILE_PATH"
  echo "-----------------------------"
done

echo "};" >> "$CONSTANT_FILE_PATH"

# 再取得してデフォルト設定（const.ts から取得して再設定）
defaultKey=""
if [ "$DEFAULT_ALIAS" = "admin-menu" ]; then
  defaultKey="ADMIN_MANAGE"
elif [ "$DEFAULT_ALIAS" = "user-menu" ]; then
  defaultKey="ADMIN_USER"
  elif [ "$DEFAULT_ALIAS" = "public-menu" ]; then
    defaultKey="PUBLIC"
fi

if [ -n "$defaultKey" ]; then
  defaultRichMenuId=$(grep "$defaultKey" "$CONSTANT_FILE_PATH" | cut -d "'" -f2)

  if [ -n "$defaultRichMenuId" ]; then
    curl -s -X POST "https://api.line.me/v2/bot/user/all/richmenu/${defaultRichMenuId}" \
      -H "Authorization: Bearer $LINE_MESSAGING_CHANNEL_ACCESS_TOKEN"
    echo "🌟 set default rich menu: $DEFAULT_ALIAS → $defaultRichMenuId"
  else
    echo "⚠️ Could not find richMenuId for key=$defaultKey in const.ts"
  fi
else
  echo "⚠️ DEFAULT_ALIAS=$DEFAULT_ALIAS に対応する const key が不明です"
fi
