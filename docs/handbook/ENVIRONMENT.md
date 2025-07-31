# 環境変数設定ガイド

## 必須環境変数

このガイドでは、civicship-api を実行するために必要なすべての環境変数について説明します。設定を簡単にするため、変数はカテゴリ別に整理されています。

### コアデータベース・認証

```env
# データベース接続（PostgreSQL 16.4、ポート 15432）
DATABASE_URL=postgresql://username:password@database_host:15432/civicship_dev

# 環境設定
ENV=LOCAL                    # 環境識別子（LOCAL/DEV/PRD）
NODE_ENV=development        # Node.js 環境
PORT=3000                   # サーバーポート
NODE_HTTPS=true             # 開発時の HTTPS 有効化
```

### Firebase 認証

```env
# Firebase プロジェクト設定
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----"
FIREBASE_TOKEN_API_KEY=your_firebase_web_api_key
FIREBASE_ISSUER=https://securetoken.google.com/your_project_id
FIREBASE_AUDIENCE=your_project_id
```

### Google Cloud Storage

```env
# ファイルアップロード用 GCS 設定
GCS_SERVICE_ACCOUNT_BASE64=base64_encoded_service_account_json
GCS_BUCKET_NAME=your_storage_bucket_name
GCP_PROJECT_ID=your_gcp_project_id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### セキュリティ・CORS

```env
# クロスオリジンリソース共有（CORS）
ALLOWED_ORIGINS="http://localhost:8000 https://localhost:8000"

# セッション管理
EXPRESS_SESSION_SECRET=your_session_secret_key
```

### アクティビティ予約設定

```env
# アクティビティごとの予約受付日数設定（JSON形式）
ACTIVITY_ADVANCE_BOOKING_DAYS_CONFIG={"activity-id-1":0,"activity-id-2":1,"activity-id-3":7}
```

## 環境ファイルのセットアップ

### 開発環境

1. **テンプレートをコピーする：**
   ```bash
   cp .env.example .env
   ```

2. **上記の変数を使ってすべての値を入力する**

3. **重要な注意点：**
   - Firebase の秘密鍵には正しい改行（`\n`）を含めること
   - PostgreSQL のポートは 15432 を使用する（デフォルトの 5432 ではない）
   - 開発時 HTTPS のために `NODE_HTTPS=true` を設定する

### テスト環境

1. **テスト用ファイルを作成する：**
   ```bash
   cp .env.test .env.test.local
   ```

2. **テスト専用の値を設定する：**
   - テスト用 Firebase プロジェクトを使用
   - テスト用のデータベース URL を使用
   - テスト用 API キーを設定

### 本番環境

1. **環境固有の値を使用する：**
   - 本番用 Firebase プロジェクト
   - 本番用のデータベース接続
   - 本番用の GCS バケット
   - 本番用の API エンドポイント

2. **セキュリティ上の注意点：**
   - 各環境で強力かつ一意なシークレットを使用すること
   - API キーやシークレットは定期的にローテーションすること
   - サービスアカウントには最小限の権限のみを与えること

## 環境変数カテゴリの説明

### データベース関連変数
- `DATABASE_URL`: 資格情報およびデータベース名を含む PostgreSQL 接続文字列
- Prisma ORM によるすべての DB 操作に使用される

### Firebase 関連変数
- `FIREBASE_PROJECT_ID`: Firebase プロジェクト ID
- `FIREBASE_CLIENT_EMAIL`: サーバー認証用のサービスアカウントメール
- `FIREBASE_PRIVATE_KEY`: サービスアカウント秘密鍵（改行 `\n` 含む必要あり）
- `FIREBASE_TOKEN_API_KEY`: トークン検証用の Web API キー
- `FIREBASE_ISSUER` / `FIREBASE_AUDIENCE`: JWT 検証用パラメータ

### Google Cloud Storage 関連変数
- `GCS_SERVICE_ACCOUNT_BASE64`: Base64 エンコードされたサービスアカウント JSON
- `GCS_BUCKET_NAME`: ファイルアップロード先のストレージバケット名
- `GCP_PROJECT_ID`: Google Cloud プロジェクト ID
- `GOOGLE_APPLICATION_CREDENTIALS`: サービスアカウント JSON のパス

### LINE 連携関連変数
- リッチメニュー ID はデータベースに保存され、管理画面で設定される
- LINE チャネル認証情報（LIFF、メッセージング）もデータベースで管理
- 環境変数として必要なのはリッチメニュー ID のみ

### セキュリティ関連変数
- `CIVICSHIP_ADMIN_API_KEY`: 管理者エンドポイント保護用の API キー
- `ALLOWED_ORIGINS`: Web クライアント向けの CORS 設定
- `EXPRESS_SESSION_SECRET`: セッション暗号化用の秘密鍵

## セキュリティベストプラクティス

### シークレット管理
- `.env` ファイルは **絶対にバージョン管理に含めないこと**
- 環境ごとに異なる値を使用する（dev / staging / prod）
- 本番用の秘密情報は安全なシークレット管理システムに保管する
- API キーや秘密鍵は定期的にローテーションする

### Firebase セキュリティ
- サービスアカウントは最小限の権限に制限する
- Firebase Authentication のセキュリティルールを有効にする
- Web クライアントの CORS 設定を適切に行う
- Firebase の利用状況や認証ログを監視する

### データベースセキュリティ
- 強力な DB パスワードを使用する
- DB アクセスは必要な IP 範囲に制限する
- DB 接続には SSL/TLS を使用する
- 定期的なバックアップとセキュリティアップデートを実施する

### API セキュリティ
- 管理者用 API エンドポイントは強力な API キーで保護する
- 公開エンドポイントにはレート制限を設ける
- API の利用状況や認証試行を監視する
- 外部通信には必ず HTTPS を使用する

## 環境変数に関するトラブルシューティング

### よくある問題

**データベース接続の問題：**
- `DATABASE_URL` の形式や資格情報を確認
- PostgreSQL コンテナがポート 15432 で起動しているか確認
- 対象のデータベースが存在し、アクセス可能であるか確認

**Firebase 認証エラー：**
- すべての Firebase 環境変数が設定されているか確認
- `FIREBASE_PRIVATE_KEY` に適切な改行（`\n`）が含まれているか確認
- Firebase プロジェクトに認証機能が有効か確認
- サービスアカウントの権限が適切に設定されているか確認

**GCS アップロード失敗：**
- `GCS_SERVICE_ACCOUNT_BASE64` が正しくエンコードされているか確認
- バケットが存在し、アクセス可能か確認
- サービスアカウントに Storage Object Admin 権限があるか確認
- `GCP_PROJECT_ID` が正しいか確認

**CORS 問題：**
- `ALLOWED_ORIGINS` にクライアントのドメインが含まれているか確認
- プロトコル（http / https）が一致しているか確認
- URL に末尾スラッシュが含まれていないことを確認

### バリデーション用コマンド

```bash
# データベース接続確認
pnpm db:studio

# Firebase 設定の確認
# Firebase 初期化ログをサーバー上で確認

# GCS 接続確認
# GraphQL ミューテーション経由でテストファイルをアップロード

# 環境変数の確認
node -e "console.log(process.env.DATABASE_URL ? 'DB OK' : 'DB Missing')"
```

## 関連ドキュメント

- [セットアップガイド](../SETUP.md) - インストール手順の全体
- [トラブルシューティング](../TROUBLESHOOTING.md) - 詳細な問題解決
- [開発フロー](DEVELOPMENT.md) - 日常的な開発手順
- [アーキテクチャガイド](ARCHITECTURE.md) - システム設計の概要
