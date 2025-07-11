# デプロイメントガイド

このドキュメントでは、civicship-apiのデプロイメントアーキテクチャ、CI/CDパイプライン、インフラストラクチャコンポーネント、および本番環境の設定について説明します。

## デプロイメントアーキテクチャ

### マルチサービスデプロイメント

civicship-apiは複数のデプロイメント構成をサポートし、異なる責務を持つサービスに分離されています：

#### 1. 内部API（メインサービス）

**設定:**
- **エントリーポイント:** `src/index.ts`
- **目的:** メインGraphQL APIサーバー
- **Dockerfile:** `Dockerfile`
- **デプロイメント:** Google Cloud Run
- **ポート:** 3000 (HTTPS)

**機能:**
- GraphQL API エンドポイント
- 認証・認可処理
- ビジネスロジック実行
- データベースアクセス

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile --prod

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

#### 2. 外部API（パブリックウォレット操作）

**設定:**
- **エントリーポイント:** `src/external-api.ts`
- **目的:** パブリックウォレット操作と外部統合
- **Dockerfile:** `Dockerfile.external`
- **デプロイメント:** Google Cloud Run（別サービス）
- **ポート:** 8080

**機能:**
- 外部システムからのウォレット操作
- パブリックAPI エンドポイント
- 外部パートナー統合
- 軽量認証

```dockerfile
# Dockerfile.external
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile --prod

COPY . .
RUN pnpm build

EXPOSE 8080
CMD ["node", "dist/external-api.js"]
```

#### 3. バッチ処理（バックグラウンドジョブ）

**設定:**
- **エントリーポイント:** `src/batch.ts`
- **目的:** バックグラウンドジョブ処理
- **Dockerfile:** `Dockerfile.batch`
- **デプロイメント:** Google Cloud Run Jobs
- **実行:** スケジュール実行

**機能:**
- マテリアライズドビューの更新
- データ集計処理
- 定期的なクリーンアップ
- 通知送信

```dockerfile
# Dockerfile.batch
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile --prod

COPY . .
RUN pnpm build

CMD ["node", "dist/batch.js"]
```

## Google Cloud Run設定

### サービス設定

#### 内部API設定

```yaml
# cloud-run-internal.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: civicship-api-internal
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/cpu-throttling: "false"
        run.googleapis.com/memory: "2Gi"
        run.googleapis.com/cpu: "1000m"
    spec:
      containerConcurrency: 100
      containers:
      - image: asia-northeast1-docker.pkg.dev/PROJECT_ID/civicship-api/civicship-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-url
              key: url
```

#### 外部API設定

```yaml
# cloud-run-external.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: civicship-api-external
spec:
  template:
    spec:
      containers:
      - image: asia-northeast1-docker.pkg.dev/PROJECT_ID/civicship-api/civicship-api-external:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
```

### 自動スケーリング

```yaml
# スケーリング設定
metadata:
  annotations:
    run.googleapis.com/execution-environment: gen2
    autoscaling.knative.dev/minScale: "1"
    autoscaling.knative.dev/maxScale: "100"
    run.googleapis.com/cpu-throttling: "false"
```

**特徴:**
- **リクエスト量に基づく自動スケーリング**
- **最小1インスタンス、最大100インスタンス**
- **コールドスタート最適化**
- **CPU スロットリング無効化**

## CI/CDパイプライン

### GitHub Actions ワークフロー

**設定ファイル:** `.github/workflows/deploy-to-cloud-run-dev.yml`

```yaml
name: Deploy to Cloud Run (Development)

on:
  push:
    branches: [ develop ]
  pull_request:
    branches: [ develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js 20
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run tests
      run: pnpm test
    
    - name: Run lint
      run: pnpm lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Google Cloud CLI
      uses: google-github-actions/setup-gcloud@v1
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT_ID }}
    
    - name: Configure Docker
      run: gcloud auth configure-docker asia-northeast1-docker.pkg.dev
    
    - name: Build Docker images
      run: |
        docker build -t asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/civicship-api/civicship-api:${{ github.sha }} .
        docker build -f Dockerfile.external -t asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/civicship-api/civicship-api-external:${{ github.sha }} .
        docker build -f Dockerfile.batch -t asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/civicship-api/civicship-api-batch:${{ github.sha }} .
    
    - name: Push to Container Registry
      run: |
        docker push asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/civicship-api/civicship-api:${{ github.sha }}
        docker push asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/civicship-api/civicship-api-external:${{ github.sha }}
        docker push asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/civicship-api/civicship-api-batch:${{ github.sha }}
    
    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy civicship-api-internal \
          --image asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/civicship-api/civicship-api:${{ github.sha }} \
          --platform managed \
          --region asia-northeast1 \
          --allow-unauthenticated
```

### マルチ環境デプロイメント

#### 開発環境 (Development)
- **ブランチ:** `develop`
- **自動デプロイ:** プッシュ時
- **データベース:** 開発用PostgreSQL
- **ドメイン:** `dev-api.civicship.com`

#### ステージング環境 (Staging)
- **ブランチ:** `staging`
- **手動承認:** 必要
- **データベース:** ステージング用PostgreSQL
- **ドメイン:** `staging-api.civicship.com`

#### 本番環境 (Production)
- **ブランチ:** `main`
- **手動承認:** 必要
- **データベース:** 本番用PostgreSQL
- **ドメイン:** `api.civicship.com`

## インフラストラクチャコンポーネント

### Artifact Registry

```bash
# コンテナレジストリ設定
gcloud artifacts repositories create civicship-api \
  --repository-format=docker \
  --location=asia-northeast1 \
  --description="Civicship API container images"
```

**機能:**
- **Dockerイメージの安全な保存**
- **バージョン管理とタグ付け**
- **脆弱性スキャン**
- **アクセス制御**

### データベースアクセス

#### SSHトンネル（ビルド時）

```yaml
# GitHub Actions でのセキュアデータベースアクセス
- name: Setup SSH tunnel
  run: |
    echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
    ssh -f -N -L 5432:localhost:5432 user@jumpbox.example.com
    
- name: Run database migrations
  run: pnpm db:migrate deploy
  env:
    DATABASE_URL: postgresql://user:pass@localhost:5432/civicship
```

#### 本番データベース接続

```typescript
// 本番環境でのコネクションプーリング
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});

// 接続プール設定
// DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20
```

### 環境変数管理

#### Google Secret Manager

```bash
# シークレット作成
gcloud secrets create database-url --data-file=database-url.txt
gcloud secrets create firebase-private-key --data-file=firebase-key.json

# Cloud Run でのシークレット使用
gcloud run deploy civicship-api \
  --set-secrets="DATABASE_URL=database-url:latest,FIREBASE_PRIVATE_KEY=firebase-private-key:latest"
```

#### 環境別設定

```yaml
# 開発環境
env:
  - name: NODE_ENV
    value: "development"
  - name: LOG_LEVEL
    value: "debug"

# 本番環境
env:
  - name: NODE_ENV
    value: "production"
  - name: LOG_LEVEL
    value: "info"
```

## 監視とヘルスチェック

### ヘルスチェックエンドポイント

```typescript
// src/presentation/router/health.ts
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV
  });
});

// データベース接続チェック
app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});
```

### Cloud Run ヘルス監視

```yaml
# ヘルスチェック設定
spec:
  template:
    spec:
      containers:
      - image: asia-northeast1-docker.pkg.dev/PROJECT_ID/civicship-api/civicship-api:latest
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/db
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### ログ監視

```typescript
// 構造化ログ出力
import { logger } from '../infrastructure/logger';

logger.info('Service started', {
  service: 'civicship-api',
  version: process.env.npm_package_version,
  environment: process.env.NODE_ENV,
  port: process.env.PORT || 3000
});

// エラー追跡
logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  service: 'civicship-api'
});
```

## セキュリティ考慮事項

### コンテナセキュリティ

```dockerfile
# セキュリティ強化されたDockerfile
FROM node:20-alpine

# 非rootユーザーの作成
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 依存関係のインストール
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# アプリケーションファイルのコピー
COPY --chown=nextjs:nodejs . .

# 非rootユーザーに切り替え
USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
```

### ネットワークセキュリティ

```yaml
# VPC設定
metadata:
  annotations:
    run.googleapis.com/vpc-access-connector: projects/PROJECT_ID/locations/REGION/connectors/CONNECTOR_NAME
    run.googleapis.com/vpc-access-egress: private-ranges-only
```

## トラブルシューティング

### デプロイメント問題

```bash
# Cloud Run ログ確認
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=civicship-api" --limit=50

# サービス状態確認
gcloud run services describe civicship-api --region=asia-northeast1

# リビジョン履歴確認
gcloud run revisions list --service=civicship-api --region=asia-northeast1
```

### パフォーマンス監視

```bash
# メトリクス確認
gcloud monitoring metrics list --filter="resource.type=cloud_run_revision"

# アラート設定
gcloud alpha monitoring policies create --policy-from-file=alerting-policy.yaml
```

## 関連ドキュメント

- [アーキテクチャガイド](./ARCHITECTURE.md) - システム設計概要
- [インフラストラクチャガイド](./INFRASTRUCTURE.md) - 外部システム統合
- [セキュリティガイド](./SECURITY.md) - セキュリティアーキテクチャ
- [パフォーマンスガイド](./PERFORMANCE.md) - 最適化戦略
- [環境変数ガイド](./ENVIRONMENT.md) - 環境設定
- [トラブルシューティング](./TROUBLESHOOTING.md) - 問題解決ガイド
