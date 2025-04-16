# ✅ 単体テスト報告書｜WalletService ユニットテスト

## 📌 対象モジュール

- **対象クラス**：`WalletService`
- **依存モック**：
    - `WalletRepository`（query / find / create / delete / findFirstExistingMemberWallet / findCommunityWallet）
    - `WalletConverter`（filter / sort / createMemberWallet / createCommunityWallet）
- **テスト対象メソッド**：
    - `fetchWallets`
    - `findWallet`
    - `findMemberWalletOrThrow`
    - `findCommunityWalletOrThrow`
    - `checkIfMemberWalletExists`
    - `createCommunityWallet`
    - `createMemberWalletIfNeeded`
    - `deleteMemberWallet`

---

## 🧪 テスト実施内容と結果

### 1. `fetchWallets`

| 項目 | 内容 |
|------|------|
| ケース数 | 1件（正常系） |
| 主な検証内容 | Converter経由のwhere/orderBy生成と、queryの結果確認 |
| モック | `WalletConverter.filter`, `WalletConverter.sort`, `WalletRepository.query` |
| テスト内容 | フィルタ・ソートを含むウォレットの一括取得処理 |
| 結果 | ✅ 成功（期待通りのwallets配列が返る） |

---

### 2. `findWallet`

| 項目 | 内容 |
|------|------|
| ケース数 | 2件（正常系 / null返却） |
| 主な検証内容 | WalletRepository.find の戻り値による挙動分岐 |
| モック | `WalletRepository.find` |
| テスト内容 | walletId に基づく取得処理の検証 |
| 結果 | ✅ 成功（存在時はwallet返却、存在しない場合はnull） |

---

### 3. `findMemberWalletOrThrow`

| 項目 | 内容 |
|------|------|
| ケース数 | 2件（正常系 / NotFoundError） |
| 主な検証内容 | `findFirstExistingMemberWallet` の有無による成功・例外分岐 |
| モック | `WalletRepository.findFirstExistingMemberWallet` |
| テスト内容 | メンバーウォレットの取得（なければエラー） |
| 結果 | ✅ 成功（wallet返却またはエラーをスロー） |

---

### 4. `findCommunityWalletOrThrow`

| 項目 | 内容 |
|------|------|
| ケース数 | 2件（正常系 / NotFoundError） |
| 主な検証内容 | `findCommunityWallet` の結果に応じたエラー分岐 |
| モック | `WalletRepository.findCommunityWallet` |
| テスト内容 | コミュニティウォレットの取得または例外スロー |
| 結果 | ✅ 成功（存在すれば返却、なければ例外） |

---

### 5. `checkIfMemberWalletExists`

| 項目 | 内容 |
|------|------|
| ケース数 | 2件（正常系 / NotFoundError） |
| 主な検証内容 | `find` 結果に応じた処理分岐（NotFoundError） |
| モック | `WalletRepository.find` |
| テスト内容 | 指定IDのウォレットが存在するかのチェック処理 |
| 結果 | ✅ 成功（存在チェック＋例外ハンドリング） |

---

### 6. `createCommunityWallet`

| 項目 | 内容 |
|------|------|
| ケース数 | 1件（正常系） |
| 主な検証内容 | Converterからの生成 → Repository.createの流れ確認 |
| モック | `WalletConverter.createCommunityWallet`, `WalletRepository.create` |
| テスト内容 | communityId に基づくウォレット作成処理の検証 |
| 結果 | ✅ 成功（正しく生成・保存されたウォレットを返す） |

---

### 7. `createMemberWalletIfNeeded`

| 項目 | 内容 |
|------|------|
| ケース数 | 2件（すでに存在／新規作成） |
| 主な検証内容 | find → create 分岐、Converterの使用、create呼び出し有無の確認 |
| モック | `WalletRepository.findFirstExistingMemberWallet`, `WalletConverter.createMemberWallet`, `WalletRepository.create` |
| テスト内容 | メンバーウォレットがない場合の自動作成フローの確認 |
| 結果 | ✅ 成功（再作成されず／必要な場合のみ生成） |

---

### 8. `deleteMemberWallet`

| 項目 | 内容 |
|------|------|
| ケース数 | 2件（正常系：削除／異常系：NotFound） |
| 主な検証内容 | `findMemberWalletOrThrow` との連携、削除処理の実行確認 |
| モック | `WalletService.findMemberWalletOrThrow`, `WalletRepository.delete` |
| テスト内容 | ウォレットの削除と、その前提条件チェックの検証 |
| 結果 | ✅ 成功（存在確認 → 削除成功／存在しない場合は例外） |

---

## 🧪 品質チェックリスト

| 観点 | 評価 | コメント |
|------|------|----------|
| **テストカバレッジ** | ⭐️⭐️⭐️⭐️⭐️（完全） | 全メソッドに対して正常／異常パスを網羅し、ロジック分岐も明示的に確認されている。 |
| **モック戦略** | ⭐️⭐️⭐️⭐️⭐️（明確） | Converter・Repositoryの役割に応じた適切なモック設計。 |
| **検証の粒度** | ⭐️⭐️⭐️⭐️⭐️（適切） | メソッド呼び出しの有無、引数の検証、返却値の一致確認まで丁寧に記述されている。 |
| **責務の分離** | ⭐️⭐️⭐️⭐️⭐️（良好） | Domain層のモジュール設計に従った形でテストも責務が整理されている。 |
| **副作用の検証** | ⭐️⭐️⭐️⭐️⭐️（十分） | `create`, `delete`, `findOrThrow` など副作用がある処理にも確実にアサーションあり。 |

---

## ✅ 総合評価と改善点

### ✅ 評価

- **S（最高評価）**  
  ロジックの網羅性、モック設計、粒度のすべてが整っており、ウォレット系ドメインにおける理想的なユニットテストセットです。

### 🛠 改善ポイント（任意）

- `createMemberWalletIfNeeded` で「すでにWalletがあるが `type !== MEMBER` のケース」など、型整合性チェックのテストがあるとより堅牢。
- `WalletConverter.createXxx` 系が throw する場合の防御的テストも一部入れておくと◎。

---


# ✅ 単体テスト報告書｜WalletValidator ユニットテスト

## 📌 対象モジュール

- **対象クラス**：`WalletValidator`
- **依存モック**：
    - `WalletService.findCommunityWalletOrThrow`
    - `WalletService.findMemberWalletOrThrow`
    - `WalletService.createMemberWalletIfNeeded`
    - 内部メソッド：`validateTransfer`
- **テスト対象メソッド**：
    - `validateCommunityMemberTransfer`
    - `validateMemberToMemberDonation`
    - `validateTransfer`

---

## 🧪 テスト実施内容と結果

### 1. `validateCommunityMemberTransfer`

| 項目 | 内容 |
|------|------|
| ケース数 | 4件（正常系: GRANT / POINT_REWARD / TICKET_PURCHASED、異常系: DONATION） |
| 主な検証内容 | WalletServiceを通じたfrom/toのWallet方向の切り替え、および不正方向時のバリデーションエラー |
| モック | `WalletService.findCommunityWalletOrThrow`, `WalletService.findMemberWalletOrThrow`, `WalletService.createMemberWalletIfNeeded` |
| テスト内容 | `TransactionReason` に応じて送金元・送金先を動的に切り替える処理の確認 |
| 結果 | ✅ 成功（3パターンで正しいwalletIdペアを返却、不正ケースでValidationError） |

---

### 2. `validateMemberToMemberDonation`

| 項目 | 内容 |
|------|------|
| ケース数 | 2件（正常系 / 異常系: 残高不足） |
| 主な検証内容 | `validateTransfer` の内部呼び出しによる送金可否の検証、例外処理（InsufficientBalanceError） |
| モック | 内部: `validateTransfer` |
| テスト内容 | メンバー間の送金における残高検証とエラーハンドリング |
| 結果 | ✅ 成功（許可時はwalletId返却、エラー時は適切な例外をthrow） |

---

### 3. `validateTransfer`

| 項目 | 内容 |
|------|------|
| ケース数 | 5件（正常系 / 異常系: null, currentPoint不足, currentPointView欠損 等） |
| 主な検証内容 | `fromWallet` と `toWallet` のバリデーション：存在・残高・構造の整合性 |
| モック | なし（純粋関数） |
| テスト内容 | from/to 両方の存在確認と `currentPoint` による残高チェック、各種異常ケースの網羅 |
| 結果 | ✅ 成功（ValidationError / InsufficientBalanceError を適切にスロー） |

---

## 🧪 品質チェックリスト

| 観点 | 評価 | コメント |
|------|------|----------|
| **テストカバレッジ** | ⭐️⭐️⭐️⭐️⭐️（非常に高い） | 全主要メソッドに対し、正常系・異常系ともに網羅されている。 |
| **モック戦略** | ⭐️⭐️⭐️⭐️⭐️（明確） | `WalletService` のモックや内部メソッドのspy化が適切。 |
| **検証の粒度** | ⭐️⭐️⭐️⭐️⭐️（詳細） | 各メソッドの返却値、例外の型・内容まで細かく検証。 |
| **責務の分離** | ⭐️⭐️⭐️⭐️⭐️（良好） | Validatorの責務に特化したロジックとテスト構成。 |
| **副作用の検証** | ⭐️⭐️⭐️⭐️（十分） | 主にロジック検証中心。WalletService依存関係の呼び出し確認も十分。 |

---

## ✅ 総合評価と改善点

### ✅ 評価

- **S（最高評価）**  
  Walletのトランザクションバリデーションに関して、非常に堅牢かつ分かりやすいテスト構成。  
  `TransactionReason` に基づく動的なwallet directionの切替や残高検証など、実ビジネス要件に即した実装がしっかりテストされている。

### 🛠 改善ポイント（任意）

- `validateTransfer` 内の `currentPoint` チェックにて `typeof === "number"` などの **型安全性の明示** を加えるとより堅牢。
- `validateCommunityMemberTransfer` における `createIfNeeded: false` の分岐テストも追加可能（現状は常にtrue想定）。

---
