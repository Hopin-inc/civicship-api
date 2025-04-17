# ✅ インテグレーションテスト報告書｜Communityドメイン

## 📌 対象シナリオ

- **対象処理**：`communityCreate` Mutation（GraphQL経由）
- **目的**：
    - コミュニティの作成フローをリゾルバ経由で実行
    - 付随するメンバーウォレット／コミュニティウォレットの自動生成を確認

---

## 🧪 テスト構成と検証内容

### 🧪 テストケース：create community

| 項目 | 内容 |
|------|------|
| データソース初期化 | `TestDataSourceHelper.deleteAll()` によるDB初期化（beforeEach） |
| 実行コンテキスト | `ctx.currentUser.id` を指定した疑似ログイン状態 |
| 入力 | `GqlCommunityCreateInput` を使用した `communityCreate` Mutation |
| アサーション | Community作成結果の検証、およびWalletの存在確認 |
| タイムアウト設定 | `jest.setTimeout(30_000)` による長時間処理対応 |

#### 📋 具体的な流れ

1. **ユーザーの事前作成**
    - `createUser()` によりユーザーを作成
    - `ctx.currentUser.id` に設定

2. **コミュニティ作成の実行**
    - GraphQL Mutation `communityCreate()` を直接呼び出し

3. **結果検証**
    - `findAllCommunity()` により、1件のCommunityが存在することを確認
    - `findCommunityWallet()` により、Community用Walletが作成されていることを検証

---

## ✅ 結果

| 項目 | 結果 |
|------|------|
| コミュニティ作成 | ✅ 作成された（1件存在） |
| コミュニティウォレット作成 | ✅ 正常に作成された（nullではない） |

---

## 🧪 品質チェックリスト

| 観点 | 評価 | コメント |
|------|------|----------|
| **フロー網羅性** | ⭐️⭐️⭐️⭐️⭐️ | コミュニティ作成 → Wallet生成 までをフルカバー |
| **依存関係の明示性** | ⭐️⭐️⭐️⭐️⭐️ | `ctx.currentUser.id` の明示的セットとDB初期化が明確 |
| **副作用の確認** | ⭐️⭐️⭐️⭐️⭐️ | 実際の永続化を `findXxx()` 系で確認しており信頼性が高い |
| **再現性** | ⭐️⭐️⭐️⭐️⭐️ | 毎回DB初期化＆再接続を行っており、環境依存性が少ない |
| **GraphQLレイヤー経由か** | ⭐️⭐️⭐️⭐️⭐️ | Resolverを直接呼び出しており、GraphQL Mutation単位のE2E的保証あり |

---

## ✅ 総合評価と改善点

### ✅ 評価

- **S（最高品質）**  
  ドメイン横断処理（Community作成時にWalletが生成される）を実際のGraphQLリゾルバ経由で確認できており、システム全体としての整合性が非常に高く担保されている。

### 🛠 改善ポイント（任意）

- `member wallet`（ユーザー側）の生成が自動で行われるケースが仕様上存在する場合は、**同時にその存在確認も入れるとさらに堅牢**。
- `TestDataSourceHelper.disconnect()` の2回呼び出し（beforeEachとafterAll）があるが、意図を明示したコメントがあるとより明確。

---

# ✅ インテグレーションテスト報告書｜Reservationドメイン

## 📌 対象シナリオ

- **対象処理**：
    - `reservationAccept` Mutation（参加申請の承認）
    - `reservationCreate` Mutation（新規予約申請）

- **目的**：
    - GraphQL 経由での予約操作を通じて、関連モデル（Reservation / Wallet）の状態遷移を検証
    - Member Wallet の自動生成／再利用ロジックを保証

---

## 🧪 テスト構成と検証内容

### 🧪 シナリオ1：参加申請を承認する（`reservationAccept`）

#### ケース1. メンバーウォレット未作成 → 新規作成

| 項目 | 内容 |
|------|------|
| 入力状態 | Reservation: `APPLIED`（未承認）<br>Wallet: 未作成 |
| 実行処理 | `reservationAccept()` |
| 検証内容 |
- Reservation の status が `ACCEPTED` に更新される
- Member Wallet が新規に作成される
- Wallet 作成直後は `currentPointView` が生成されていないことを確認
  | 結果 | ✅ 成功（status更新 + wallet生成 + 初期状態検証） |

#### ケース2. メンバーウォレットが既に存在 → 再利用される

| 項目 | 内容 |
|------|------|
| 入力状態 | Reservation: `APPLIED`<br>Wallet: 事前に作成済み |
| 実行処理 | `reservationAccept()` |
| 検証内容 |
- Reservation の status が `ACCEPTED`
- 既存の Wallet ID が再利用されている（新規作成されない）
  | 結果 | ✅ 成功（既存walletが再利用された） |

---

### 🧪 シナリオ2：新規予約申請を行う（`reservationCreate`）

#### ケース1. メンバーウォレット未作成 → 新規作成される

| 項目 | 内容 |
|------|------|
| 入力状態 | Reservation: 無（初回申請）<br>Wallet: 未作成 |
| 実行処理 | `reservationCreate()` |
| 検証内容 |
- Reservation が1件作成されていること
- Member Wallet が新規作成されていること
- `currentPointView` は未生成のままであること
  | 結果 | ✅ 成功（全ての副作用を検証済） |

#### ケース2. メンバーウォレットが既に存在 → 再利用される

| 項目 | 内容 |
|------|------|
| 入力状態 | Reservation: 無<br>Wallet: 既に作成済み |
| 実行処理 | `reservationCreate()` |
| 検証内容 |
- Reservation が1件作成される
- Wallet は新規作成されず、既存のIDが使用されている
  | 結果 | ✅ 成功（Walletの再利用ロジックが期待通り動作） |

---

## 🧪 品質チェックリスト

| 観点 | 評価 | コメント |
|------|------|----------|
| **テストカバレッジ** | ⭐️⭐️⭐️⭐️⭐️ | status遷移・wallet生成の有無・初期状態の全てをカバー |
| **GraphQL経由検証** | ⭐️⭐️⭐️⭐️⭐️ | Resolverレイヤーを通じて実行されており、APIレベルの保証も得られている |
| **副作用の検証** | ⭐️⭐️⭐️⭐️⭐️ | DB状態変化（Reservation / Wallet / currentPointView）をすべて明示的に確認 |
| **再現性** | ⭐️⭐️⭐️⭐️⭐️ | `beforeEach` でDB初期化されており、他テストへの影響も排除されている |
| **分岐検証** | ⭐️⭐️⭐️⭐️⭐️ | Wallet未作成／既存あり 両パターンに対応。ロジックの健全性を保障できている。 |

---

## ✅ 総合評価と改善点

### ✅ 評価

- **S（最高品質）**  
  予約申請に関連する主要フローをすべて網羅し、Wallet自動生成や状態遷移の整合性が高い精度で検証されている。GraphQLレイヤーを通じた統合的な動作保証が得られており、極めて実用的なインテグレーションテスト構成。

### 🛠 改善ポイント（任意）

- `reservationCreate()` において、複数人数申請（`totalParticipantCount > 1`）やチケット枚数といった関連ロジックが存在する場合、それらの **派生処理の副作用確認** も追加可能。
- `reservationAccept()` の `requireApproval = false` の分岐（自動参加）も別途明示しておくとより安心。

---

# ✅ インテグレーションテスト報告書｜Transactionドメイン

## 📌 対象シナリオ

- **対象処理**：
    - `transactionDonateSelfPoint` Mutation（メンバー間ポイント寄付）
    - `transactionGrantCommunityPoint` Mutation（コミュニティからメンバーへのポイント付与）

- **目的**：
    - GraphQLリゾルバを経由して、Wallet生成・Transaction記録の正確な実行を保証
    - Wallet未作成時の自動生成、および残高移動先の整合性を検証

---

## 🧪 テスト構成と検証内容

### 🧪 シナリオ1：メンバー間ポイント寄付（`transactionDonateSelfPoint`）

#### ケース：寄付先のユーザーがWalletを持っていない場合

| 項目 | 内容 |
|------|------|
| 入力状態 | fromUser: Walletあり<br>toUser: Walletなし |
| 実行処理 | `transactionDonateSelfPoint()` |
| 検証内容 |
- toUserのMember Walletが自動生成されていること
- 寄付によって生成されたTransactionの `to` が、生成されたWallet IDと一致していること
  | 結果 | ✅ 成功（Wallet生成 + ポイント移動の両方を検証） |

---

### 🧪 シナリオ2：コミュニティからメンバーへのポイント付与（`transactionGrantCommunityPoint`）

#### ケース：対象ユーザーがWalletを持っていない場合

| 項目 | 内容 |
|------|------|
| 入力状態 | from: Community Walletあり（残高あり）<br>to: Walletなし |
| 実行処理 | `transactionGrantCommunityPoint()` |
| 検証内容 |
- toUserのMember Walletが自動生成されていること
- GRANT理由で登録されたTransactionの `to` が、そのWallet IDと一致していること
  | 結果 | ✅ 成功（Wallet生成 + Transaction理由含めた整合性確認済） |

---

## 🧪 品質チェックリスト

| 観点 | 評価 | コメント |
|------|------|----------|
| **GraphQLレイヤー経由の検証** | ⭐️⭐️⭐️⭐️⭐️ | Mutationレイヤーを通して、ユースケース実行全体を検証している |
| **副作用の検証** | ⭐️⭐️⭐️⭐️⭐️ | Walletの自動生成・Transaction記録といった永続化処理を確認 |
| **再現性・データ初期化** | ⭐️⭐️⭐️⭐️⭐️ | `beforeEach` によるデータ削除と `afterAll` のクリーンアップ処理で安定性確保 |
| **状態遷移の整合性** | ⭐️⭐️⭐️⭐️⭐️ | currentPointViewやwallet構造など、ドメイン固有の整合性も確認されている |
| **変数設計の分離性** | ⭐️⭐️⭐️⭐️⭐️ | User, Wallet, Transaction 各エンティティが明示的に管理され、テストが読みやすい |

---

## ✅ 総合評価と改善点

### ✅ 評価

- **S（最高品質）**  
  Wallet自動生成とポイント送受信ロジックにおけるフルサイクルが検証されており、GraphQL経由での動作保証として極めて実用的。エッジケース（Walletなし）も網羅しており、実運用を想定した堅牢なテスト設計。

### 🛠 改善ポイント（任意）

- `currentPointView` の初期値（未生成または0）に対する明示的な検証も加えると、ポイントビューの自動更新まわりの挙動も追いやすくなる。
- `toUser がすでに Wallet を持っている場合の skipパス（再利用）` も補完すると、網羅性がさらに向上。

---
