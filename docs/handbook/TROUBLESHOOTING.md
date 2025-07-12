# トラブルシューティングガイド

civicship-api の開発中に遭遇する可能性のある一般的な問題とその解決方法について説明します。

## データベース関連の問題

### PostgreSQL コンテナが起動しない

**症状:**
- `pnpm container:up` が失敗する
- "Port already in use" エラー
- コンテナがすぐに終了する

**解決方法:**

1. **ポート 15432 が使用中かチェック:**
   ```bash
   lsof -i :15432
   # または
   netstat -tulpn | grep 15432
   ```

2. **ポートを使用しているプロセスを終了:**
   ```bash
   # PID を確認して終了
   kill -9 <PID>
   ```

3. **既存のコンテナを削除:**
   ```bash
   docker ps -a | grep postgres
   docker rm -f <container_name>
   ```

4. **Docker リソースをクリーンアップ:**
   ```bash
   docker system prune -f
   docker volume prune -f
   ```

### データベース接続エラー

**症状:**
- "Connection refused" エラー
- "Database does not exist" エラー
- Prisma クライアント接続タイムアウト

**解決方法:**

1. **DATABASE_URL の形式を確認:**
   ```env
   # 正しい形式（ポート 15432 に注意、5432 ではない）
   DATABASE_URL=postgresql://postgres:password@host:15432/civicship_dev
   ```

2. **コンテナの状態を確認:**
   ```bash
   docker ps | grep postgres
   docker logs <container_name>
   ```

3. **直接接続をテスト:**
   ```bash
   docker exec -it <container_name> psql -U postgres -d civicship_dev
   ```

4. **データベースを再作成:**
   ```bash
   pnpm db:reset
   pnpm db:seed-master
   pnpm db:seed-domain
   ```

### マイグレーション問題

**症状:**
- "Migration failed" エラー
- スキーマドリフト警告
- Prisma generate 失敗

**解決方法:**

1. **データベースとマイグレーションをリセット:**
   ```bash
   pnpm db:reset
   pnpm db:generate
   ```

2. **マイグレーション状態を確認:**
   ```bash
   pnpm db:migrate status
   ```

3. **マイグレーションを強制実行:**
   ```bash
   pnpm db:migrate deploy
   ```

## 認証関連の問題

### Firebase 認証エラー

**症状:**
- "Firebase Admin SDK initialization failed"
- "Invalid private key" エラー
- 認証ミドルウェアの失敗

**解決方法:**

1. **Firebase 環境変数を確認:**
   ```bash
   # 必要な変数が設定されているか確認
   echo $FIREBASE_PROJECT_ID
   echo $FIREBASE_CLIENT_EMAIL
   # セキュリティのため秘密鍵は echo しない
   ```

2. **秘密鍵の形式を確認:**
   ```env
   # 適切な改行文字 \n を含める
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----"
   ```

3. **Firebase プロジェクト設定を確認:**
   - プロジェクト ID が Firebase コンソールと一致するか確認
   - Authentication が有効になっているか確認
   - サービスアカウントの権限を確認

4. **Firebase 接続をテスト:**
   ```bash
   # サーバーログで Firebase 初期化メッセージを確認
   pnpm dev:https | grep -i firebase
   ```

### JWT トークン検証エラー

**症状:**
- "Invalid token" エラー
- "Token expired" エラー
- 認証コンテキストが作成されない

**解決方法:**

1. **トークン形式を確認:**
   ```javascript
   // トークンは Authorization ヘッダーに含める
   Authorization: Bearer <firebase_jwt_token>
   ```

## Google Cloud Storage 問題

### ファイルアップロード失敗

**症状:**
- ファイルアップロード時の "Access denied" エラー
- "Bucket not found" エラー
- "Invalid credentials" エラー

**解決方法:**

1. **GCS 環境変数を確認:**
   ```bash
   echo $GCS_BUCKET_NAME
   echo $GCP_PROJECT_ID
   # セキュリティのためサービスアカウントは echo しない
   ```

2. **サービスアカウントの権限を確認:**
   - サービスアカウントに "Storage Object Admin" ロールがあるか確認
   - バケットレベルの IAM 権限を確認
   - プロジェクトレベルの権限を確認

3. **GCS 接続をテスト:**
   ```bash
   # gcloud CLI でアクセスをテスト
   gcloud auth activate-service-account --key-file=path/to/service-account.json
   gsutil ls gs://your-bucket-name
   ```

## 開発サーバー問題

### ポート競合

**症状:**
- "Port 3000 already in use" エラー
- サーバー起動失敗
- EADDRINUSE エラー

**解決方法:**

1. **ポートを使用しているプロセスを確認:**
   ```bash
   lsof -i :3000
   netstat -tulpn | grep 3000
   ```

2. **プロセスを終了:**
   ```bash
   kill -9 <PID>
   # または
   pkill -f "node.*3000"
   ```

3. **別のポートを使用:**
   ```env
   PORT=3001
   ```

### HTTPS 証明書問題

**症状:**
- "Certificate not trusted" 警告
- SSL/TLS 接続エラー
- ブラウザのセキュリティ警告

**解決方法:**

1. **自己署名証明書を受け入れ:**
   - ブラウザの警告で「詳細設定」をクリック
   - 「サイトに進む」を選択
   - セキュリティ例外を追加

2. **開発時は HTTP を使用:**
   ```bash
   # HTTPS の代わりに HTTP を使用
   pnpm dev
   ```

3. **証明書が機能しない場合の再生成手順：**
   - 以下の Qiita 記事を参考に自己署名証明書を生成  
     [自己認証局の作成と証明書リストへの追加 - Qiita](https://qiita.com/k_kind/items/b87777efa3d29dcc4467#%E8%87%AA%E5%B7%B1%E8%AA%8D%E8%A8%BC%E5%B1%80%E3%81%AE%E4%BD%9C%E6%88%90%E8%A8%BC%E6%98%8E%E6%9B%B8%E3%83%AA%E3%82%B9%E3%83%88%E3%81%B8%E3%81%AE%E8%BF%BD%E5%8A%A0)
   - 生成された 2 つの鍵ファイル：
     - `-----BEGIN CERTIFICATE-----` を含むファイル → `localhost.pem`
     - `-----BEGIN PRIVATE KEY-----` を含むファイル → `localhost-key.pem`
   - 上記 2 ファイルを `.certificates/` 配下に設置し直す
   - サーバーを再起動し、HTTPS が正しく動作するか確認


## GraphQL 問題

### スキーマ生成エラー

**症状:**
- "GraphQL schema generation failed"
- 型定義の競合
- Codegen エラー

**解決方法:**

1. **生成されたファイルをクリア:**
   ```bash
   rm -rf src/types/graphql.ts
   pnpm gql:generate
   ```

2. **スキーマ構文を確認:**
   ```bash
   # GraphQL スキーマファイルを検証
   find src -name "*.graphql" -exec graphql-schema-linter {} \;
   ```

## テスト関連の問題

### テストデータベース問題

**症状:**
- データベース接続エラーでテストが失敗
- テストで "Database not found" エラー
- テストデータの競合

**解決方法:**

1. **テスト環境を確認:**
   ```bash
   # .env.test.local が存在するか確認
   ls -la .env.test*
   ```

2. **テストデータベースをリセット:**
   ```bash
   NODE_ENV=TEST pnpm db:reset
   NODE_ENV=TEST pnpm db:seed-master
   ```

## パフォーマンス問題

### クエリ実行が遅い

**症状:**
- GraphQL クエリに時間がかかる
- データベースタイムアウト
- 高いメモリ使用量

**解決方法:**

1. **DataLoader の使用を確認:**
   ```typescript
   // 関連データに DataLoader を使用
   const users = await context.dataloaders.user.loadMany(userIds);
   ```

2. **データベースクエリを分析:**
   ```bash
   # Prisma クエリログを有効化
   DEBUG=prisma:query pnpm dev:https
   ```

## 環境固有の問題

### 開発環境と本番環境の違い

**症状:**
- 開発環境では動作するが本番環境で失敗
- 環境変数の問題
- 環境間での動作の違い

**解決方法:**

1. **環境変数を比較:**
   ```bash
   # 環境変数を比較
   env | grep -E "(FIREBASE|GCS|DATABASE)" | sort
   ```

2. **本番ビルドをローカルでテスト:**
   ```bash
   NODE_ENV=production pnpm build
   NODE_ENV=production node dist/index.js
   ```

## 追加サポートの取得

### デバッグ手順

1. **デバッグログを有効化:**
   ```bash
   DEBUG=* pnpm dev:https
   ```

2. **サーバーログを確認:**
   ```bash
   # ログをリアルタイムで監視
   tail -f logs/app.log
   ```

3. **GraphQL Playground を使用:**
   - ブラウザで GraphQL エンドポイントを開く
   - クエリとミューテーションをテスト
   - ネットワークタブでエラーを確認

### よくあるログパターン

**正常な起動:**
```
🚀 Server ready at: https://localhost:3000/graphql
Firebase Admin initialized successfully
Database connected successfully
```

**認証問題:**
```
Firebase initialization failed: Invalid private key
Authentication middleware error: Token validation failed
```

**データベース問題:**
```
Prisma connection error: Connection refused
Migration failed: Schema drift detected
```

## 関連ドキュメント

- [セットアップガイド](SETUP.md) - 初期環境構築
- [環境変数設定](./ENVIRONMENT.md) - 設定リファレンス
- [開発ワークフロー](./DEVELOPMENT.md) - 日常的な開発手順
- [アーキテクチャガイド](./ARCHITECTURE.md) - システム設計概要
