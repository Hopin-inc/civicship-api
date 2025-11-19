#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ENV_PATH="$SCRIPT_DIR/../../../.env"

if [ ! -f "$ENV_PATH" ]; then
  echo "❌ .env file not found at $ENV_PATH"
  exit 1
fi

set -a
# shellcheck source=../../../.env
source "$ENV_PATH"
set +a

# tee で複製するための FD 準備（元の stdout を FD3 に保持）
exec 3>&1

# ------------ helpers ------------
pick_image() {
  local base="$1"
  local dir="$2"
  for ext in png jpg jpeg PNG JPG JPEG; do
    local path="${SCRIPT_DIR}/${dir}/${base}.${ext}"
    if [ -f "$path" ]; then
      echo "$path"
      return 0
    fi
  done
  return 1
}

mime_type() {
  case "$1" in
    *.png|*.PNG)  echo "image/png" ;;
    *.jpg|*.JPG)  echo "image/jpeg" ;;
    *.jpeg|*.JPEG) echo "image/jpeg" ;;
    *) echo "application/octet-stream" ;;
  esac
}

create_and_bind() {
  local alias="$1"
  local json="$2"
  local img="$3"

  # ① 先に alias が指している古い richmenu を取得
  local oldId
  oldId=$(curl -s \
    -H "Authorization: Bearer $LINE_MESSAGING_CHANNEL_ACCESS_TOKEN" \
    "https://api.line.me/v2/bot/richmenu/alias/${alias}" 2>/dev/null \
    | jq -r '.richMenuId' || echo "null")

  # ② alias を先に削除（oldIdとの参照を断つ）
  curl -s -X DELETE "https://api.line.me/v2/bot/richmenu/alias/${alias}" \
    -H "Authorization: Bearer $LINE_MESSAGING_CHANNEL_ACCESS_TOKEN" >/dev/null || true
  echo "🔻 Alias deleted: ${alias}"

  # ③ 古い richmenu 本体を削除（ここが重要）
  if [ -n "$oldId" ] && [ "$oldId" != "null" ]; then
    curl -s -X DELETE "https://api.line.me/v2/bot/richmenu/${oldId}" \
      -H "Authorization: Bearer $LINE_MESSAGING_CHANNEL_ACCESS_TOKEN" >/dev/null || true
    echo "🗑️ Deleted old rich menu: ${oldId}"
  fi

  # ④ JSON を一時ファイルに展開
  tmp_json=$(mktemp "$SCRIPT_DIR/tmp_XXXXXX.json")
  if grep -q '\${LIFF_BASE_URL}' "$json"; then
    envsubst '${LIFF_BASE_URL}' < "$json" > "$tmp_json"
  else
    cp "$json" "$tmp_json"
  fi

  if ! jq . "$tmp_json" >/dev/null 2>&1; then
    echo "❌ JSON構文エラー: $json"
    rm "$tmp_json"
    return
  fi

  # ⑤ 新しい richmenu 作成（ここで初めて作る！）
  richMenuId=$(curl -s -X POST "https://api.line.me/v2/bot/richmenu" \
    -H "Authorization: Bearer $LINE_MESSAGING_CHANNEL_ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d @"$tmp_json" | jq -r '.richMenuId')
  rm "$tmp_json"

  if [ -z "$richMenuId" ] || [ "$richMenuId" = "null" ]; then
    echo "❌ Failed to create rich menu for alias=${alias} (json=${json})"
    return
  fi

  echo "✅ Created: ${alias} → ${richMenuId}"

  # ⑥ 画像アップロード
  if [ -n "$img" ] && [ -f "$img" ]; then
    mt=$(mime_type "$img")
    curl -s -X POST "https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content" \
      -H "Authorization: Bearer $LINE_MESSAGING_CHANNEL_ACCESS_TOKEN" \
      -H "Content-Type: ${mt}" \
      --data-binary @"$img" >/dev/null
    echo "🖼️ Uploaded: $(basename "$img")"
  fi

  # ⑦ alias を新 richmenu に張り直す
  curl -s -X POST "https://api.line.me/v2/bot/richmenu/alias" \
    -H "Authorization: Bearer $LINE_MESSAGING_CHANNEL_ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"richMenuAliasId\":\"${alias}\",\"richMenuId\":\"${richMenuId}\"}" >/dev/null
  echo "🔗 Alias created: ${alias}"

  echo "__ID__ ${richMenuId}"
}

CONSTANT_FILE_PATH="$SCRIPT_DIR/../../../.generated/richmenu.txt"
mkdir -p "$(dirname "$CONSTANT_FILE_PATH")"
touch "$CONSTANT_FILE_PATH"
echo "-------- $(date) --------" >> "$CONSTANT_FILE_PATH"

# ------------ user tabs (REQUIRED 3 files) ------------
if [ -f "$SCRIPT_DIR/user/user_menu_use.json" ]; then
  echo "🚀 Deploy USER tab menus"
  for suffix in use earn join; do
    base="user_menu_${suffix}"
    alias="user-${suffix}"
    json="$SCRIPT_DIR/user/${base}.json"
    if [ ! -f "$json" ]; then
      echo "❌ Missing required user json: $json"
      exit 1
    fi
    img="$(pick_image "$base" "user" || true)"
    id=$(create_and_bind "$alias" "$json" "${img:-}" \
        | tee >(cat >&3) \
        | awk '/^__ID__/ {print $2}')
    if [ -n "${id:-}" ]; then
      echo "RICH_MENU_ID_$(echo "$alias" | tr 'a-z-' 'A-Z_')=${id}" >> "$CONSTANT_FILE_PATH"
    fi
    echo "-----------------------------"
  done
fi

# ------------ public tabs (REQUIRED 3 files; user と同一構造) ------------
echo "🚀 Deploy PUBLIC tab menus"
for suffix in use earn join; do
  base="public_menu_${suffix}"
  alias="public-${suffix}"
  json="$SCRIPT_DIR/public/${base}.json"
  if [ ! -f "$json" ]; then
    echo "❌ Missing required public json: $json"
    exit 1
  fi
  img="$(pick_image "$base" "public" || true)"
  id=$(create_and_bind "$alias" "$json" "${img:-}" \
      | tee >(cat >&3) \
      | awk '/^__ID__/ {print $2}')
  if [ -n "${id:-}" ]; then
    echo "RICH_MENU_ID_$(echo "$alias" | tr 'a-z-' 'A-Z_')=${id}" >> "$CONSTANT_FILE_PATH"
  fi
  echo "-----------------------------"
done

# ------------ admin (単一想定) ------------
if [ -f "$SCRIPT_DIR/admin/admin_menu.json" ]; then
  echo "🚀 Deploy ADMIN menu"
  base="admin_menu"
  alias="admin-menu"
  json="$SCRIPT_DIR/admin/${base}.json"
  img="$(pick_image "$base" "admin" || true)"
  id=$(create_and_bind "$alias" "$json" "${img:-}" \
      | tee >(cat >&3) \
      | awk '/^__ID__/ {print $2}')
  if [ -n "${id:-}" ]; then
    echo "RICH_MENU_ID_ADMIN_MENU=${id}" >> "$CONSTANT_FILE_PATH"
  fi
  echo "-----------------------------"
fi

echo "" >> "$CONSTANT_FILE_PATH"

# デフォルトメニュー設定（環境変数 DEFAULT_ALIAS があればそれを、無ければ user-use）
DEFAULT_ALIAS="${DEFAULT_ALIAS:-public-use}"
KEY=$(echo "$DEFAULT_ALIAS" | tr 'a-z-' 'A-Z_')
defaultRichMenuId=$(grep "RICH_MENU_ID_${KEY}=" "$CONSTANT_FILE_PATH" | tail -n1 | cut -d '=' -f2)

if [ -n "$defaultRichMenuId" ]; then
  curl -s -X POST "https://api.line.me/v2/bot/user/all/richmenu/${defaultRichMenuId}" \
    -H "Authorization: Bearer $LINE_MESSAGING_CHANNEL_ACCESS_TOKEN" >/dev/null
  echo "🌟 set default rich menu: ${DEFAULT_ALIAS} → ${defaultRichMenuId}"
else
  echo "⚠️ Could not find richMenuId for DEFAULT_ALIAS=${DEFAULT_ALIAS}"
fi

echo ""
echo "📦 全ユーザーに設定されているデフォルトリッチメニュー:"
curl -s -X GET "https://api.line.me/v2/bot/user/all/richmenu" \
  -H "Authorization: Bearer $LINE_MESSAGING_CHANNEL_ACCESS_TOKEN" | jq
