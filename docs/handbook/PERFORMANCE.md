# パフォーマンスガイド

このドキュメントでは、civicship-apiのパフォーマンス最適化戦略、クエリ最適化、キャッシュ戦略、および監視・可観測性について説明します。

## パフォーマンス最適化戦略

### 1. DataLoaderパターン

**目的:** GraphQLでのN+1クエリ問題の防止

詳細な実装については、[実装パターン](PATTERNS.md) の「DataLoaderパターン」セクションを参照してください。

#### 主要な最適化ポイント

```typescript
// 効率的なバッチ処理
export const createUserDataLoader = (issuer: PrismaClientIssuer) => {
  return new DataLoader<string, PrismaUser | null>(
    async (userIds: readonly string[]) => {
      // 単一クエリで複数ユーザーを取得
      const users = await issuer.internal((tx) =>
        tx.user.findMany({
          where: { id: { in: [...userIds] } },
          include: {
            memberships: {
              include: { community: true }
            }
          }
        }),
      );
      
      // IDの順序を保持してマッピング
      return userIds.map(id => users.find(user => user.id === id) || null);
    },
    {
      // リクエストライフサイクル内でのキャッシュ
      cache: true,
      maxBatchSize: 100,
      batchScheduleFn: callback => setTimeout(callback, 10)
    }
  );
};
```

**パフォーマンス向上効果:**
- N+1クエリを単一クエリに削減
- リクエスト内でのデータ重複排除
- データベース負荷の大幅軽減

### 2. データベースビュー

**目的:** 複雑な集計クエリの事前計算

**注意:** 一部のマテリアライズドビューは通常のビューに変換されています（`20250403080546_convert_mv_to_view`マイグレーション参照）。現在のポイント残高ビューは通常のビューとして実装されています。

#### 現在のポイント残高ビュー

```sql
-- current_point_view: リアルタイムポイント残高（通常のビューに変換済み）
CREATE VIEW current_point_view AS
SELECT 
  wallet_id,
  SUM(
    CASE 
      WHEN transaction_type = 'CREDIT' THEN amount
      WHEN transaction_type = 'DEBIT' THEN -amount
      ELSE 0
    END
  ) as current_balance,
  COUNT(*) as transaction_count,
  MAX(created_at) as last_transaction_at
FROM transactions
WHERE status = 'COMPLETED'
GROUP BY wallet_id;
```

#### スロット残り容量ビュー

```sql
-- mv_accumulated_points: 累積獲得ポイント
CREATE MATERIALIZED VIEW mv_accumulated_points AS
SELECT 
  wallet_id,
  SUM(amount) as total_earned,
  COUNT(*) as earning_transactions,
  MIN(created_at) as first_earned_at,
  MAX(created_at) as last_earned_at
FROM transactions
WHERE transaction_type = 'CREDIT' 
  AND status = 'COMPLETED'
  AND reason IN ('POINT_ISSUED', 'GRANT', 'REWARD')
GROUP BY wallet_id;
```

#### 機会参加統計ビュー

```sql
-- mv_opportunity_participation_stats: 機会参加統計
CREATE MATERIALIZED VIEW mv_opportunity_participation_stats AS
SELECT 
  opportunity_id,
  COUNT(DISTINCT user_id) as total_participants,
  COUNT(CASE WHEN status = 'PARTICIPATING' THEN 1 END) as active_participants,
  COUNT(CASE WHEN evaluation_status = 'PASSED' THEN 1 END) as passed_participants,
  AVG(CASE WHEN evaluation_score IS NOT NULL THEN evaluation_score END) as average_score
FROM participations
GROUP BY opportunity_id;
```

#### ビューの特徴

**通常のビューの利点:**
- リアルタイムデータ反映
- 自動更新（手動リフレッシュ不要）
- ストレージ使用量削減

**注意点:**
- クエリ実行時に計算処理が発生
- 複雑なクエリの場合はパフォーマンス影響あり
- 適切なインデックス設計が重要

### 3. データベースインデックス最適化

#### 主要インデックス

```prisma
// schema.prisma でのインデックス定義
model User {
  id        String   @id
  email     String   @unique
  createdAt DateTime @default(now())
  
  // パフォーマンス最適化インデックス
  @@index([email])
  @@index([createdAt])
  @@index([email, createdAt])
}

model Transaction {
  id            String   @id
  walletId      String
  amount        Int
  transactionType TransactionType
  status        TransactionStatus
  createdAt     DateTime @default(now())
  
  // 高頻度クエリ用インデックス
  @@index([walletId])
  @@index([walletId, status])
  @@index([walletId, createdAt])
  @@index([status, createdAt])
  @@index([transactionType, status])
}

model Participation {
  id            String   @id
  userId        String
  opportunityId String
  status        ParticipationStatus
  createdAt     DateTime @default(now())
  
  // 参加統計用インデックス
  @@index([opportunityId])
  @@index([userId, status])
  @@index([opportunityId, status])
  @@index([createdAt])
}
```

#### インデックス使用状況の監視

```sql
-- インデックス使用統計の確認
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 未使用インデックスの特定
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

## クエリ最適化

### 1. 効率的なデータ取得

```typescript
// 悪い例: N+1クエリ
const communities = await prisma.community.findMany();
for (const community of communities) {
  const members = await prisma.membership.findMany({
    where: { communityId: community.id }
  });
}

// 良い例: 関連データを含める
const communities = await prisma.community.findMany({
  include: {
    memberships: {
      include: {
        user: true
      }
    }
  }
});
```

### 2. 選択的フィールド取得

```typescript
// 必要なフィールドのみ選択
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // 不要な大きなフィールドは除外
  }
});
```

### 3. ページネーション

```typescript
// カーソルベースページネーション
const getOpportunities = async (cursor?: string, limit = 20) => {
  return prisma.opportunity.findMany({
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' }
  });
};
```

## キャッシュ戦略

### 1. リクエストレベルキャッシュ

```typescript
// DataLoaderによるリクエスト内キャッシュ
export const createDataLoaders = (issuer: PrismaClientIssuer) => ({
  user: createUserDataLoader(issuer),
  community: createCommunityDataLoader(issuer),
  wallet: createWalletDataLoader(issuer),
  // リクエストライフサイクル内で自動キャッシュ
});
```

### 2. アプリケーションレベルキャッシュ

```typescript
// Redis を使用したセッションキャッシュ
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

export const cacheUserSession = async (userId: string, sessionData: any) => {
  await redis.setex(`session:${userId}`, 3600, JSON.stringify(sessionData));
};

export const getUserSession = async (userId: string) => {
  const cached = await redis.get(`session:${userId}`);
  return cached ? JSON.parse(cached) : null;
};
```

### 3. データベースレベルキャッシュ

```sql
-- PostgreSQL クエリ結果キャッシュ設定
SET shared_preload_libraries = 'pg_stat_statements';
SET track_activity_query_size = 2048;
SET pg_stat_statements.track = all;
```

### 4. CDNキャッシュ

```typescript
// Google Cloud Storage での静的アセット配信
export const uploadWithCacheHeaders = async (file: Buffer, fileName: string) => {
  const fileUpload = bucket.file(fileName);
  
  await fileUpload.save(file, {
    metadata: {
      cacheControl: 'public, max-age=31536000', // 1年間キャッシュ
      contentType: 'image/jpeg'
    }
  });
  
  return fileUpload.publicUrl();
};
```

## 監視と可観測性

### 1. アプリケーションメトリクス

```typescript
// カスタムメトリクス収集
export const trackBusinessMetrics = {
  communityCreated: () => {
    logger.info('Business metric: Community created', {
      metric: 'community_created',
      timestamp: new Date().toISOString()
    });
  },
  
  opportunityParticipation: (opportunityId: string, userId: string) => {
    logger.info('Business metric: Opportunity participation', {
      metric: 'opportunity_participation',
      opportunityId,
      userId,
      timestamp: new Date().toISOString()
    });
  },
  
  pointsTransferred: (amount: number, fromWallet: string, toWallet: string) => {
    logger.info('Business metric: Points transferred', {
      metric: 'points_transferred',
      amount,
      fromWallet,
      toWallet,
      timestamp: new Date().toISOString()
    });
  }
};
```

### 2. データベース監視

```typescript
// データベースクエリパフォーマンス監視
const queryMiddleware = async (params: any, next: any) => {
  const start = Date.now();
  const result = await next(params);
  const duration = Date.now() - start;
  
  if (duration > 1000) {
    logger.warn('Slow query detected', {
      model: params.model,
      action: params.action,
      duration,
      args: JSON.stringify(params.args)
    });
  }
  
  // メトリクス収集
  logger.info('Database query executed', {
    model: params.model,
    action: params.action,
    duration
  });
  
  return result;
};

// Prisma ミドルウェア登録
prisma.$use(queryMiddleware);
```

### 3. エラー追跡

```typescript
// 包括的なエラーログとアラート
export const errorTracker = {
  logError: (error: Error, context: any) => {
    logger.error('Application error', {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      severity: 'error'
    });
  },
  
  logWarning: (message: string, context: any) => {
    logger.warn('Application warning', {
      message,
      context,
      timestamp: new Date().toISOString(),
      severity: 'warning'
    });
  }
};
```

### 4. パフォーマンス監視

```typescript
// リクエスト遅延とスループット追跡
export const performanceTracker = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    // 遅いリクエストのアラート
    if (duration > 5000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration
      });
    }
  });
  
  next();
};
```

## パフォーマンステスト

### 1. 負荷テスト

```typescript
// Jest でのパフォーマンステスト例
describe('Performance Tests', () => {
  it('should handle concurrent user creation', async () => {
    const startTime = Date.now();
    
    const promises = Array.from({ length: 100 }, () =>
      UserFactory.create()
    );
    
    await Promise.all(promises);
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // 5秒以内
  });
  
  it('should efficiently load community members', async () => {
    const community = await CommunityFactory.create();
    await Promise.all(
      Array.from({ length: 50 }, () =>
        MembershipFactory.create({ transientCommunity: community })
      )
    );
    
    const startTime = Date.now();
    const members = await prisma.membership.findMany({
      where: { communityId: community.id },
      include: { user: true }
    });
    const duration = Date.now() - startTime;
    
    expect(members).toHaveLength(50);
    expect(duration).toBeLessThan(1000); // 1秒以内
  });
});
```

### 2. メモリ使用量監視

```bash
# Node.js メモリ使用量の監視
node --inspect --max-old-space-size=4096 dist/index.js

# Chrome DevTools でメモリプロファイリング
# chrome://inspect を開いてプロファイリング実行
```

## 最適化のベストプラクティス

### 1. データベース最適化

- **適切なインデックス設計**
- **クエリプランの定期的な確認**
- **不要なデータの定期的なクリーンアップ**
- **データベースビューの活用**

### 2. アプリケーション最適化

- **DataLoaderパターンの一貫した使用**
- **効率的なGraphQLクエリ設計**
- **適切なキャッシュ戦略**
- **非同期処理の活用**

### 3. インフラ最適化

- **適切なリソース割り当て**
- **自動スケーリング設定**
- **CDN活用**
- **データベース接続プーリング**

## 関連ドキュメント

- [アーキテクチャガイド](./ARCHITECTURE.md) - システム設計概要
- [実装パターン](PATTERNS.md) - DataLoaderとパフォーマンスパターン
- [インフラストラクチャガイド](INFRASTRUCTURE.md) - データベースとキャッシュ設定
- [デプロイメントガイド](./DEPLOYMENT.md) - 本番環境最適化
- [トラブルシューティング](TROUBLESHOOTING.md) - パフォーマンス問題の解決
