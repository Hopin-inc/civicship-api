# feature/nmkr-mint-only マイグレーションガイド

このドキュメントは、`feature/nmkr-mint-only`ブランチをmasterにマージする際の注意事項、作業手順、必要な環境変数をまとめたものです。

---

## 📋 目次

1. [変更概要](#変更概要)
2. [必要な環境変数](#必要な環境変数)
3. [NMKRへのADAデポジット](#nmkrへのadaデポジット)
4. [データベースマイグレーション](#データベースマイグレーション)
5. [既存データの移行作業](#既存データの移行作業)
6. [セットアップスクリプトの実行手順](#セットアップスクリプトの実行手順)
7. [フロントエンド対応が必要な項目](#フロントエンド対応が必要な項目)
8. [バッチジョブの設定](#バッチジョブの設定)
9. [トラブルシューティング](#トラブルシューティング)

---

## 変更概要

このブランチでは、以下の変更が含まれています：

### 追加された機能
- **NMKR統合**: CardanoベースのNFTミント機能
- **NFTミント管理**: `NftMint`テーブルによるミント状態管理
- **NFTインスタンス状態管理**: `NftInstanceStatus` enum追加
- **ローカルスクリプト**: NFTセットアップとミント割り当てスクリプト

### 主要な変更点
1. `NftInstance`に`status`フィールド追加（STOCK, RESERVED, MINTING, OWNED, RETIRED）
2. `NftMint`テーブル追加（QUEUED, SUBMITTED, MINTED, FAILED）
3. `NftWallet`に`type`フィールド追加（INTERNAL, EXTERNAL）

---

## 必要な環境変数

### NMKR API関連（必須）

```bash
# NMKR API Base URL
NMKR_BASE_URL=https://studio-api.nmkr.io/v2

# NMKR API Key（NMKRダッシュボードから取得）
NMKR_API_KEY=your_nmkr_api_key_here

# NMKR Customer ID（NMKRダッシュボードから取得）
NMKR_CUSTOMER_ID=your_customer_id_here
```

### 取得方法
1. [NMKR Studio](https://studio.nmkr.io/)にログイン
2. Settings > API Keysから新しいAPI Keyを作成
3. Customer IDはダッシュボードのAccount Settingsから確認

**⚠️ 重要**: 既存の`nftInstances`は全て`kibotcha`コミュニティに接続する必要があります（後述の「既存データの移行作業」を参照）。

---

## データベースマイグレーション

### ⚠️ 破壊的変更

#### 1. `t_nft_wallets`テーブル
- `wallet_address`に`UNIQUE`制約追加
- `type`カラム追加（INTERNAL/EXTERNAL）
- **影響**: 既存のウォレットアドレスが重複している場合、マイグレーションが失敗します

**対処方法**:
```sql
-- マイグレーション前に重複チェック
SELECT wallet_address, COUNT(*) 
FROM t_nft_wallets 
GROUP BY wallet_address 
HAVING COUNT(*) > 1;

-- 重複がある場合は手動で解決
```

#### 2. `t_nft_instances`テーブル
- `status`カラム追加（デフォルト: STOCK）
- `nft_wallet_id`が`NULL`許容に変更
- `nft_token_id`が`NOT NULL`に変更
- **影響**: `nft_token_id`がNULLの既存レコードがある場合、マイグレーションが失敗します

**対処方法**:
```sql
-- マイグレーション前にNULLチェック
SELECT COUNT(*) FROM t_nft_instances WHERE nft_token_id IS NULL;

-- NULLがある場合は手動でデータ修正
```

---

## 既存データの移行作業

### ⚠️ 必須作業: 既存nftInstancesのコミュニティ接続

既存の`nftInstances`は全て`kibotcha`コミュニティに接続する必要があります。

```sql
-- kibotchaコミュニティIDを確認
SELECT id FROM t_communities WHERE slug = 'kibotcha';

-- 既存のnftInstancesを全てkibotchaに接続
UPDATE t_nft_instances 
SET community_id = (SELECT id FROM t_communities WHERE slug = 'kibotcha')
WHERE community_id IS NULL;
```

### 既存nftWalletsのtype設定

既存のウォレットは全て`EXTERNAL`タイプとして扱います。

```sql
-- 既存のnftWalletsにtypeを設定（マイグレーションで自動的に行われる）
-- 確認のみ
SELECT type, COUNT(*) FROM t_nft_wallets GROUP BY type;
```

---

## セットアップスクリプトの実行手順

### 1. NFTプロジェクト初期化とアップロード

```bash
# NFT画像を配置
# scripts/salesNft/nfts/ ディレクトリに画像ファイル（*.jpg）を配置

# セットアップスクリプト実行
cd /path/to/civicship-api
pnpm tsx scripts/salesNft/setup.ts
```

**このスクリプトの処理内容**:
1. NMKRプロジェクト作成
2. NFT画像のアップロード
3. `t_nft_tokens`テーブルにプロジェクト情報登録
4. `t_nft_instances`テーブルにNFT情報登録（status=STOCK）

### 2. ユーザーへのNFT割り当てとミントキュー作成

```bash
# member.csvを準備
# scripts/salesNft/member.csv に以下の形式でデータを記載
# nft_number,phone_number
# 1,+819012345678
# 2,+819087654321

# 割り当てスクリプト実行
pnpm tsx scripts/salesNft/assignAndMint.ts
```

**このスクリプトの処理内容**:
1. member.csvを読み込み
2. NFT在庫チェック（sequenceNumで検索、STOCK状態のみ）
3. ユーザー検索（電話番号で検索）
4. NMKRウォレット作成（INTERNAL type）
5. NFTインスタンスにウォレット割り当て
6. ミントキュー作成（NftMint QUEUED状態）

**ログ出力例**:
```
📊 Processing Summary:
  Total records in CSV: 50
  Successfully processed: 45
  Skipped (NFT not found): 3
  Skipped (User not found): 2
  Skipped (Already assigned): 0
  Failed (Wallet creation error): 0
```

### 3. ミント実行（バッチジョブ）

```bash
# QUEUEDステータスのミントを実行
pnpm tsx src/presentation/batch/syncNmkr/requestMintNft.ts
```

**このバッチジョブの処理内容**:
1. `status=QUEUED`のnftMintsを取得
2. NMKR APIでミント実行
3. `status=SUBMITTED`に更新
4. `external_request_id`を記録

### 4. ミント完了確認（バッチジョブ）

```bash
# MINTINGステータスのインスタンスを確認
pnpm tsx src/presentation/batch/syncNmkr/syncNftInstance.ts
```

**このバッチジョブの処理内容**:
1. `status=MINTING`のnftInstancesを取得
2. NMKR APIでミント状態確認
3. 完了している場合、`status=OWNED`に更新
4. `tx_hash`を記録

---

## バッチジョブの設定

### Cron設定例

本番環境では、以下のバッチジョブを定期実行する必要があります。

```bash
# crontab -e

# ミント実行（5分ごと）
*/5 * * * * cd /path/to/civicship-api && pnpm tsx src/presentation/batch/syncNmkr/requestMintNft.ts >> /var/log/nmkr-mint.log 2>&1

# ミント完了確認（10分ごと）
*/10 * * * * cd /path/to/civicship-api && pnpm tsx src/presentation/batch/syncNmkr/syncNftInstance.ts >> /var/log/nmkr-sync.log 2>&1
```
---

## チェックリスト

マージ前に以下の項目を確認してください：

### 環境変数
- [ ] `NMKR_API_KEY`を設定
- [ ] `NMKR_BASE_URL`を設定
- [ ] `NMKR_CUSTOMER_ID`を設定

### NMKRアカウント
- [ ] NMKRアカウント作成済み
- [ ] API Key発行済み
- [ ] ADAをデポジット済み（ミント予定数 × 3 ADA以上推奨）

### データベース
- [ ] 既存nftWalletsの重複チェック完了
- [ ] 既存nftInstancesのnft_token_id NULLチェック完了
- [ ] 既存nftInstancesをkibotchaコミュニティに接続完了
- [ ] マイグレーション実行完了

### スクリプト
- [ ] NFT画像を`scripts/salesNft/nfts/`に配置
- [ ] `member.csv`を準備
- [ ] `setup.ts`実行テスト完了
- [ ] `assignAndMint.ts`実行テスト完了

### バッチジョブ
- [ ] `requestMintNft.ts`の動作確認完了
- [ ] `syncNftInstance.ts`の動作確認完了
- [ ] Cron設定完了（本番環境）

### フロントエンド
- [ ] NftInstanceStatusの表示対応計画作成
- [ ] Cardano仕様への変更箇所リストアップ
- [ ] エラーメッセージの多言語対応計画作成

---

## 参考リンク

- [NMKR Studio](https://studio.nmkr.io/)
- [NMKR API Documentation](https://docs.nmkr.io/)
- [Cardano Explorer](https://cardanoscan.io/)
- [Cardano Developer Portal](https://developers.cardano.org/)

---

## 更新履歴

- 2025-10-24: 初版作成
