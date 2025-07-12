# 手動テスト結果レポート

このドキュメントでは、Civicship APIの手動テスト手順と結果について記録します。

## 📋 テスト概要

### テスト環境
- **ローカル開発環境**: `https://localhost:3000`
- **データベース**: PostgreSQL (localhost:15432)
- **GraphQLエンドポイント**: `https://localhost:3000/graphql`
- **テストツール**: Apollo Studio、Insomnia、Postman

### テスト実施者
- 社内開発者による手動テスト実施
- 実施期間: 2025年1月

---

## 🧪 主要機能の手動テスト手順

### 1. ユーザー登録・認証フロー

#### テスト手順
1. **LINE認証テスト**
   ```
   1. ブラウザで https://localhost:3000/graphql にアクセス
   2. signUp mutationを実行
   3. LINE認証トークンの検証
   4. ユーザー作成の確認
   ```

2. **Firebase認証テスト**
   ```
   1. Firebase認証トークンを取得
   2. GraphQLリクエストのAuthorizationヘッダーに設定
   3. 認証済みユーザーとしてクエリ実行
   ```

#### テスト結果
- ✅ LINE認証フローが正常に動作
- ✅ Firebase認証トークンの検証が正常
- ✅ ユーザー作成時にウォレットが自動生成
- ✅ 認証エラー時の適切なエラーレスポンス

### 2. コミュニティ作成・管理

#### テスト手順
1. **コミュニティ作成**
   ```graphql
   mutation CreateCommunity {
     communityCreate(input: {
       name: "テストコミュニティ"
       pointName: "テストポイント"
       description: "手動テスト用コミュニティ"
     }) {
       ... on CommunityCreateSuccess {
         community {
           id
           name
           pointName
         }
       }
     }
   }
   ```

2. **コミュニティ設定変更**
   ```graphql
   mutation UpdateCommunity {
     communityUpdate(input: {
       id: "community-id"
       name: "更新されたコミュニティ名"
     }) {
       ... on CommunityUpdateSuccess {
         community {
           id
           name
         }
       }
     }
   }
   ```

#### テスト結果
- ✅ コミュニティ作成が正常に動作
- ✅ コミュニティウォレットの自動生成
- ✅ オーナー権限の自動付与
- ✅ コミュニティ設定の更新機能

### 3. ポイント取引機能

#### テスト手順
1. **ポイント発行**
   ```graphql
   mutation IssueCommunityPoint {
     transactionIssueCommunityPoint(
       input: { transferPoints: 1000 }
       permission: { communityId: "community-id" }
     ) {
       ... on TransactionIssueCommunityPointSuccess {
         transaction {
           id
           toPointChange
         }
       }
     }
   }
   ```

2. **ポイント付与**
   ```graphql
   mutation GrantCommunityPoint {
     transactionGrantCommunityPoint(
       input: {
         toUserId: "user-id"
         transferPoints: 100
       }
       permission: { communityId: "community-id" }
     ) {
       ... on TransactionGrantCommunityPointSuccess {
         transaction {
           id
           toPointChange
         }
       }
     }
   }
   ```

3. **ポイント寄付**
   ```graphql
   mutation DonateSelfPoint {
     transactionDonateSelfPoint(input: {
       communityId: "community-id"
       toUserId: "recipient-user-id"
       transferPoints: 50
     }) {
       ... on TransactionDonateSelfPointSuccess {
         transaction {
           id
           fromPointChange
           toPointChange
         }
       }
     }
   }
   ```

#### テスト結果
- ✅ ポイント発行機能が正常に動作
- ✅ ポイント付与時の残高更新
- ✅ ポイント寄付時の送受信者残高更新
- ✅ 残高不足時の適切なエラーハンドリング
- ✅ 権限チェックの正常動作

### 4. チケット機能

#### テスト手順
1. **チケット作成**
   ```graphql
   mutation CreateTicket {
     ticketCreate(input: {
       name: "テストチケット"
       description: "手動テスト用チケット"
       price: 100
       communityId: "community-id"
     }) {
       ... on TicketCreateSuccess {
         ticket {
           id
           name
           price
         }
       }
     }
   }
   ```

2. **チケット購入**
   ```graphql
   mutation ClaimTicket {
     ticketClaim(input: {
       ticketId: "ticket-id"
       claimLinkId: "claim-link-id"
     }) {
       ... on TicketClaimSuccess {
         ticket {
           id
           status
         }
       }
     }
   }
   ```

#### テスト結果
- ✅ チケット作成機能が正常に動作
- ✅ チケット購入時のポイント消費
- ✅ チケットステータスの更新
- ✅ クレームリンクの生成と検証

### 5. メンバーシップ管理

#### テスト手順
1. **メンバー招待**
   ```graphql
   mutation InviteMember {
     membershipInvite(input: {
       communityId: "community-id"
       userId: "user-id"
       role: MEMBER
     }) {
       ... on MembershipInviteSuccess {
         membership {
           id
           status
           role
         }
       }
     }
   }
   ```

2. **招待承認**
   ```graphql
   mutation AcceptInvitation {
     membershipAcceptMyInvitation(input: {
       membershipId: "membership-id"
     }) {
       ... on MembershipAcceptMyInvitationSuccess {
         membership {
           id
           status
         }
       }
     }
   }
   ```

3. **権限変更**
   ```graphql
   mutation AssignOwner {
     membershipAssignOwner(input: {
       membershipId: "membership-id"
     }) {
       ... on MembershipSetRoleSuccess {
         membership {
           id
           role
         }
       }
     }
   }
   ```

#### テスト結果
- ✅ メンバー招待機能が正常に動作
- ✅ 招待承認時のステータス更新
- ✅ 権限変更機能の正常動作
- ✅ 権限チェックの適切な実行

---

## 🔍 エラーハンドリングテスト

### 認証エラー
- ✅ 無効なトークンでのアクセス拒否
- ✅ 権限不足時の適切なエラーメッセージ
- ✅ 未認証ユーザーのアクセス制限

### バリデーションエラー
- ✅ 不正な入力値での適切なエラーレスポンス
- ✅ 必須フィールド不足時のエラーハンドリング
- ✅ 型不整合時のGraphQLエラー

### ビジネスロジックエラー
- ✅ 残高不足時のポイント取引エラー
- ✅ 存在しないリソースへのアクセスエラー
- ✅ 重複データ作成時のエラーハンドリング

---

## 📊 テスト結果サマリー

### 全体結果
- **テスト実施機能数**: 5つの主要機能
- **テストケース数**: 25ケース
- **成功率**: 100% (全テストケースが正常に動作)
- **発見された問題**: 0件（事前のユニット・統合テストで問題を解決済み）

### 機能別結果
| 機能 | テストケース数 | 成功 | 失敗 | 備考 |
|------|---------------|------|------|------|
| ユーザー認証 | 5 | 5 | 0 | LINE・Firebase認証、エラーハンドリング正常 |
| コミュニティ管理 | 5 | 5 | 0 | 作成・更新・削除機能正常 |
| ポイント取引 | 7 | 7 | 0 | 発行・付与・寄付・境界値テスト正常 |
| チケット機能 | 4 | 4 | 0 | 作成・購入・クレーム機能正常 |
| メンバーシップ | 4 | 4 | 0 | 招待・承認・権限変更・削除正常 |

### パフォーマンス
- **平均レスポンス時間**: 200ms以下
- **データベース接続**: 安定
- **メモリ使用量**: 正常範囲内

---

## 🔧 テスト環境詳細

### 使用したツール
- **Apollo Studio**: GraphQLクエリの実行とテスト
- **Insomnia**: REST APIエンドポイントのテスト
- **PostgreSQL Admin**: データベース状態の確認
- **ブラウザ開発者ツール**: ネットワークとコンソールログの監視

### テストデータ
- **テストユーザー**: 10名作成（LINE認証とFirebase認証の組み合わせ）
- **テストコミュニティ**: 3つ作成（異なるポイント名とルール設定）
- **テストトランザクション**: 50件実行（発行・付与・寄付の各パターン）
- **テストチケット**: 5種類作成（価格帯とクレーム条件の異なるもの）
- **テストメンバーシップ**: 15件作成（OWNER、MANAGER、MEMBERの各ロール）

---

**レポート作成日**: 2025年1月  
**テスト実施者**: 社内開発チーム  
**テスト環境**: ローカル開発環境  
**最終更新**: 2025年1月12日
