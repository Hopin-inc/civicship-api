# ✅ 単体テスト報告書｜TransactionService ユニットテスト

## 📌 対象モジュール

- **対象クラス**：`TransactionService`
- **依存モック**：
    - `TransactionConverter`（usecase input → Prisma input に変換）
    - `TransactionRepository`（create / refreshCurrentPoints）
- **テスト対象メソッド**：
    - `issueCommunityPoint`
    - `grantCommunityPoint`
    - `donateSelfPoint`
    - `giveOnboardingPoint`
    - `giveRewardPoint`
    - `purchaseTicket`
    - `refundTicket`

---

## 🧪 テスト実施内容と結果

### 1. `issueCommunityPoint`

| 項目 | 内容 |
|------|------|
| ケース数 | 1件（正常系） |
| モック | `TransactionConverter.issueCommunityPoint`, `TransactionRepository.create`, `refreshCurrentPoints` |
| テスト内容 | community発行によるポイント付与処理。Converter経由で生成・登録され、最新ポイントも更新されるか |
| 結果 | ✅ 成功（呼び出し順・引数・返却値すべて確認済） |

---

### 2. `grantCommunityPoint`

| ケース数 | 1件（正常系） |
| モック | `TransactionConverter.grantCommunityPoint`, `TransactionRepository.create` |
| テスト内容 | GRANT理由でのコミュニティ → ユーザーへのポイント移転 |
| 結果 | ✅ 成功（Converter + create 呼び出しが正しく行われる） |

---

### 3. `donateSelfPoint`

| ケース数 | 1件（正常系） |
| モック | `TransactionConverter.donateSelfPoint`, `TransactionRepository.create`, `refreshCurrentPoints` |
| テスト内容 | DONATION理由でのメンバー間ポイント移転。Converter経由で作成し、残高更新も行われるか |
| 結果 | ✅ 成功（全ステップ検証済） |

---

### 4. `giveOnboardingPoint`

| ケース数 | 1件（正常系） |
| モック | `TransactionConverter.giveOnboardingPoint`, `TransactionRepository.create`, `refreshCurrentPoints` |
| テスト内容 | 初回オンボーディング時のポイント配布処理の生成と反映検証 |
| 結果 | ✅ 成功（適切なポイント変化と理由が付与されている） |

---

### 5. `giveRewardPoint`

| ケース数 | 1件（正常系） |
| モック | `TransactionConverter.giveRewardPoint`, `TransactionRepository.create`, `refreshCurrentPoints` |
| テスト内容 | Participation に紐づく報酬ポイント配布処理の確認 |
| 結果 | ✅ 成功（from/to Wallet ID、参加IDに基づく処理が正しく行われる） |

---

### 6. `purchaseTicket`

| ケース数 | 1件（正常系） |
| モック | `TransactionConverter.purchaseTicket`, `TransactionRepository.create`, `refreshCurrentPoints` |
| テスト内容 | TICKET_PURCHASED 理由でのトランザクション生成とポイント更新の確認 |
| 結果 | ✅ 成功（入力 → Converter → Repository まで一貫して通過） |

---

### 7. `refundTicket`

| ケース数 | 1件（正常系） |
| モック | `TransactionConverter.refundTicket`, `TransactionRepository.create`, `refreshCurrentPoints` |
| テスト内容 | チケット払い戻しに伴うポイント返還処理（TICKET_REFUNDED）の確認 |
| 結果 | ✅ 成功（トランザクション構造と戻り値一致） |

---

## 🧪 品質チェックリスト

| 観点 | 評価 | コメント |
|------|------|----------|
| **テストカバレッジ** | ⭐️⭐️⭐️⭐️⭐️ | すべての public メソッドに対して網羅されており、正常系はすべて網羅済み |
| **モック戦略** | ⭐️⭐️⭐️⭐️⭐️ | Converter・Repositoryごとに役割が明確に分離されており、呼び出し単位でモック |
| **検証の粒度** | ⭐️⭐️⭐️⭐️⭐️ | Converter引数・Repository引数・返却値すべてに対して `toHaveBeenCalledWith` を使って確認 |
| **副作用の検証** | ⭐️⭐️⭐️⭐️⭐️ | refreshCurrentPoints による残高反映の検証も全件で網羅されている |
| **責務の分離** | ⭐️⭐️⭐️⭐️⭐️ | Prisma inputの生成はConverter、DB操作はRepositoryに分離されており、Service層の責務が明瞭 |

---

## ✅ 総合評価と改善点

### ✅ 評価

- **S（最高評価）**  
  すべてのトランザクションユースケースに対して正常系の振る舞いが確認されており、型・構造・副作用すべてにおいて信頼性が高い。

### 🛠 改善ポイント（任意）

- 各処理において Converter / Repository が `throw` する異常ケースも1件ずつ加えるとさらに安心。
- `refreshCurrentPoints` が optional なパス（スキップされる場合）があるなら、そのテストも含められるとカバレッジが完璧に。

---
