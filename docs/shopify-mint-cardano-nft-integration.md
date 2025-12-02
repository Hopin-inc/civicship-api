# Shopify Mint Cardano NFT 連携設計書

## 概要

MintService（外部サービス）と連携し、Shopify経由でのCardano NFT購入・発行をCivicshipに統合する。

### 責務分担

| システム | 責務 |
|---------|------|
| MintService | Shopify連携、NFTミント処理、Webhook送信 |
| Civicship API | Webhook受信、NFT情報のDB登録 |
| Civicship Portal | Shopifyへの遷移（Firebase UID付与） |

### フロー図

```
┌─────────────────────────────────────────────────────────────────────┐
│ Shopify購入フロー                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User → Portal → Shopify(?firebase_uid=xxx) → MintService           │
│                                                    ↓                │
│                                              NFTミント実行           │
│                                                    ↓                │
│  Civicship API ← mint.completed Webhook ← MintService               │
│       ↓                                                             │
│  NftWallet/NftToken/NftInstance upsert                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ローカルスクリプト発行フロー（過去分含む）                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  scripts/mint.ts → MintService /api/mint                            │
│                          ↓                                          │
│                    NFTミント実行                                     │
│                          ↓                                          │
│  Civicship API ← mint.completed Webhook ← MintService               │
│       ↓                                                             │
│  NftWallet/NftToken/NftInstance upsert                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## civicship-api 実装

### 1. ディレクトリ構成

```
src/
├── infrastructure/
│   └── libs/
│       └── shopifyMintCardanoNft/
│           ├── api/
│           │   ├── http.ts           # HTTPクライアント（認証・リトライ）
│           │   ├── endpoints.ts      # エンドポイント定義
│           │   └── client.ts         # ShopifyMintCardanoNftClient
│           └── type.ts               # 型定義
│
├── presentation/
│   └── router/
│       └── shopifyMintCardanoNft.ts  # Webhookエンドポイント
│
├── application/
│   └── domain/
│       └── account/
│           └── nft-instance/
│               └── service.ts        # upsertFromMintCompleted 追加
│
scripts/
└── shopifyMintCardanoNft/
    ├── setup.ts                      # 商品登録
    ├── mint.ts                       # NFT発行
    └── backfillRegister.ts           # 既存NFT登録
```

### 2. Webhookエンドポイント

**ファイル**: `src/presentation/router/shopifyMintCardanoNft.ts`

```typescript
// POST /webhooks/shopify-mint-cardano-nft/completed
router.post("/completed", async (req, res) => {
  // 1. HMAC署名検証
  const signature = req.headers["x-webhook-signature"];
  if (!verifyHmacSignature(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // 2. ペイロード取得
  const payload: MintCompletedPayload = req.body;

  // 3. NFT登録サービス呼び出し
  await nftInstanceService.upsertFromMintCompleted(payload);

  // 4. 成功レスポンス
  return res.status(200).json({ success: true });
});
```

**マウント**: `src/external-api.ts`

```typescript
import { shopifyMintCardanoNftRouter } from "./presentation/router/shopifyMintCardanoNft";

app.use("/webhooks/shopify-mint-cardano-nft", shopifyMintCardanoNftRouter);
```

### 3. Webhook ペイロード型定義

**ファイル**: `src/infrastructure/libs/shopifyMintCardanoNft/type.ts`

```typescript
export interface MintCompletedPayload {
  orderId: string;
  firebaseUid?: string;
  walletAddress: string;
  policyId: string;
  assetNameHex: string;
  txHash: string;
  nftMetadata721: {
    name: string;
    description?: string;
    image: string;
    [key: string]: unknown;
  };
  productId?: string;
  mintedAt: string;
}
```

### 4. NFT登録サービス

**ファイル**: `src/application/domain/account/nft-instance/service.ts`

```typescript
async upsertFromMintCompleted(
  payload: MintCompletedPayload
): Promise<void> {
  const { firebaseUid, walletAddress, policyId, assetNameHex, txHash, nftMetadata721 } = payload;

  await this.issuer.internal(async (tx) => {
    // 1. ユーザー特定（firebaseUid → Identity → User）
    let userId: string | null = null;
    if (firebaseUid) {
      const identity = await tx.identity.findFirst({
        where: { uid: firebaseUid },
        select: { userId: true },
      });
      userId = identity?.userId ?? null;
    }

    // 2. NftWallet upsert
    const nftWallet = await tx.nftWallet.upsert({
      where: { walletAddress },
      update: {
        ...(userId && { userId }),
      },
      create: {
        walletAddress,
        type: userId ? "INTERNAL" : "EXTERNAL",
        userId: userId ?? "system", // 要検討: userIdが必須の場合の対応
      },
    });

    // 3. NftToken upsert
    const nftToken = await tx.nftToken.upsert({
      where: { address: policyId },
      update: {},
      create: {
        address: policyId,
        type: "CIP-25",
        name: nftMetadata721.name,
        json: { policyId },
      },
    });

    // 4. NftInstance upsert
    await tx.nftInstance.upsert({
      where: {
        nftTokenId_instanceId: {
          nftTokenId: nftToken.id,
          instanceId: assetNameHex,
        },
      },
      update: {
        nftWalletId: nftWallet.id,
        status: "OWNED",
        json: {
          ...nftMetadata721,
          txHash,
          mintedAt: payload.mintedAt,
        },
      },
      create: {
        instanceId: assetNameHex,
        nftTokenId: nftToken.id,
        nftWalletId: nftWallet.id,
        status: "OWNED",
        name: nftMetadata721.name,
        description: nftMetadata721.description,
        imageUrl: nftMetadata721.image,
        json: {
          ...nftMetadata721,
          txHash,
          mintedAt: payload.mintedAt,
        },
      },
    });
  });
}
```

### 5. MintServiceクライアント

**ファイル**: `src/infrastructure/libs/shopifyMintCardanoNft/api/client.ts`

```typescript
@injectable()
export class ShopifyMintCardanoNftClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = process.env.SHOPIFY_MINT_CARDANO_NFT_BASE_URL!;
    this.apiKey = process.env.SHOPIFY_MINT_CARDANO_NFT_API_KEY!;
  }

  // 商品登録
  async createProduct(payload: CreateProductRequest): Promise<CreateProductResponse> {
    return this.request("POST", "/api/products", payload);
  }

  // NFT発行（直接）
  async mint(payload: MintRequest): Promise<MintResponse> {
    return this.request("POST", "/api/mint", payload);
  }

  // 注文作成
  async createMintOrder(payload: CreateMintOrderRequest): Promise<CreateMintOrderResponse> {
    return this.request("POST", "/api/mint/orders", payload);
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`MintService API error: ${response.status}`);
    }

    return response.json();
  }
}
```

### 6. ローカルスクリプト

#### setup.ts - 商品登録

```typescript
// scripts/shopifyMintCardanoNft/setup.ts
import { ShopifyMintCardanoNftClient } from "../../src/infrastructure/libs/shopifyMintCardanoNft/api/client";

async function main() {
  const client = new ShopifyMintCardanoNftClient();

  const product = await client.createProduct({
    name: "Community NFT",
    description: "コミュニティメンバー証",
    price: 1000,
    // ... その他設定
  });

  console.log("Product created:", product);
}
```

#### mint.ts - NFT発行

```typescript
// scripts/shopifyMintCardanoNft/mint.ts
import { ShopifyMintCardanoNftClient } from "../../src/infrastructure/libs/shopifyMintCardanoNft/api/client";
import { PrismaClientIssuer } from "../../src/infrastructure/prisma/client";

async function main() {
  const client = new ShopifyMintCardanoNftClient();
  const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");

  // CSVから対象ユーザーを読み込み
  const targets = loadTargetsFromCsv("./targets.csv");

  for (const target of targets) {
    // Identity から firebaseUid を取得
    const identity = await issuer.internal((tx) =>
      tx.identity.findFirst({
        where: { userId: target.userId, platform: "LINE" },
      })
    );

    if (!identity) {
      console.log(`Skip: No identity for user ${target.userId}`);
      continue;
    }

    // MintService に発行リクエスト
    const result = await client.mint({
      nftProductId: target.productId,
      firebaseUid: identity.uid,
    });

    console.log(`Minted: ${result.orderId}`);
  }
}
```

#### backfillRegister.ts - 既存NFT登録

```typescript
// scripts/shopifyMintCardanoNft/backfillRegister.ts
// 既にミント済みだがCivicship未登録のNFTを直接登録

import { NftInstanceService } from "../../src/application/domain/account/nft-instance/service";

async function main() {
  const service = container.resolve(NftInstanceService);

  // CSVから既存NFT情報を読み込み
  const records = loadRecordsFromCsv("./existing-nfts.csv");

  for (const record of records) {
    await service.upsertFromMintCompleted({
      orderId: record.orderId,
      firebaseUid: record.firebaseUid,
      walletAddress: record.walletAddress,
      policyId: record.policyId,
      assetNameHex: record.assetNameHex,
      txHash: record.txHash,
      nftMetadata721: JSON.parse(record.metadata),
      mintedAt: record.mintedAt,
    });

    console.log(`Registered: ${record.assetNameHex}`);
  }
}
```

---

## civicship-portal 実装

### 1. Shopify購入ボタンコンポーネント

**ファイル**: `src/components/domains/nfts/ShopifyPurchaseButton.tsx`

```typescript
"use client";

import { useAuthStore } from "@/lib/auth/core/auth-store";
import { Button } from "@/components/ui/button";

interface ShopifyPurchaseButtonProps {
  shopifyProductUrl: string;
}

export function ShopifyPurchaseButton({ shopifyProductUrl }: ShopifyPurchaseButtonProps) {
  const { firebaseUser } = useAuthStore((state) => state.state);

  const handleClick = () => {
    if (!firebaseUser?.uid) {
      // ログインが必要
      return;
    }

    const url = new URL(shopifyProductUrl);
    url.searchParams.set("firebase_uid", firebaseUser.uid);
    
    window.location.href = url.toString();
  };

  return (
    <Button onClick={handleClick} disabled={!firebaseUser}>
      Shopifyで購入
    </Button>
  );
}
```

### 2. 環境変数

```env
# .env.local
NEXT_PUBLIC_SHOPIFY_PRODUCT_URL=https://shop.myshopify.com/products/community-nft
```

---

## MintService側への前提・依頼事項

### 1. URLパラメータ対応

Shopify商品ページへのアクセス時、URLパラメータ `firebase_uid` を読み取り、Cart Attributeに設定する実装が必要。

```
https://shop.myshopify.com/products/xxx?firebase_uid=abc123
→ Cart Attribute: { "firebase_uid": "abc123" }
```

### 2. mint.completed Webhook

以下のフィールドを含むWebhookを送信:

```json
{
  "orderId": "order_xxx",
  "firebaseUid": "abc123",
  "walletAddress": "addr1...",
  "policyId": "policy_xxx",
  "assetNameHex": "asset_xxx",
  "txHash": "tx_xxx",
  "nftMetadata721": {
    "name": "Community NFT #1",
    "description": "...",
    "image": "ipfs://..."
  },
  "productId": "product_xxx",
  "mintedAt": "2025-01-01T00:00:00Z"
}
```

### 3. 認証

- Webhook: HMAC署名（共有シークレット）
- API: Bearer Token（API Key）

### 4. API エンドポイント

| エンドポイント | 用途 |
|---------------|------|
| `POST /api/products` | 商品登録 |
| `POST /api/mint` | 直接NFT発行 |
| `POST /api/mint/orders` | 注文作成 |

---

## 環境変数

### civicship-api

```env
# MintService連携
SHOPIFY_MINT_CARDANO_NFT_BASE_URL=https://mint-service.example.com
SHOPIFY_MINT_CARDANO_NFT_API_KEY=xxx
SHOPIFY_MINT_CARDANO_NFT_WEBHOOK_SECRET=xxx
```

### civicship-portal

```env
NEXT_PUBLIC_SHOPIFY_PRODUCT_URL=https://shop.myshopify.com/products/community-nft
```

---

## 注意事項

### 1. Firebase UID の一致

CivicshipとMintServiceで同じFirebaseプロジェクトを使用している前提。異なる場合はUID変換ロジックが必要。

### 2. 冪等性

Webhookは複数回送信される可能性があるため、`txHash` または `orderId` + `assetNameHex` の組み合わせで重複を防ぐ。

### 3. Cardanoアドレスの同期除外

既存の `NFTWalletService.fetchMetadata` はBase Sepolia専用のため、Cardanoアドレス（`addr1...`）に対しては実行しないガードが必要。

```typescript
// Cardanoアドレスの場合はスキップ
if (walletAddress.startsWith("addr1") || walletAddress.startsWith("addr_test1")) {
  return; // Cardano address, skip Base Sepolia sync
}
```
