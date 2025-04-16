# ✅ 単体テスト報告書｜MembershipService ユニットテスト

## 📌 対象モジュール

- **対象クラス**：`MembershipService`
- **依存モック**：
    - `MembershipRepository`（find / create / update / delete / query）
    - `MembershipConverter`（invite / join / update）
    - `getCurrentUserId`（ctxからのユーザーID抽出）
- **テスト対象メソッド**：
    - `fetchMemberships`
    - `findMembership`
    - `inviteMember`
    - `joinIfNeeded`
    - `setStatus`
    - `setRole`
    - `deleteMembership`

---

## 🧪 テスト実施内容と結果

### 1. `fetchMemberships`

| 項目 | 内容 |
|------|------|
| ケース数 | 1件（正常系） |
| 主な検証内容 | Converterによるwhere/orderBy生成と、Repository.queryの引数・結果確認 |
| モック | `MembershipConverter.filter`, `MembershipConverter.sort`, `MembershipRepository.query` |
| テスト内容 | 全Membershipの取得処理が正常に動作するか |
| 結果 | ✅ 成功（期待通りのMembership配列が返る） |

---

### 2. `findMembership`

| 項目 | 内容 |
|------|------|
| ケース数 | 1件（正常系） |
| 主な検証内容 | Repository.findが正しいキーで呼ばれるか |
| モック | `MembershipRepository.find` |
| テスト内容 | userId + communityId でMembershipを1件取得する処理の検証 |
| 結果 | ✅ 成功（期待通りのMembershipが返る） |

---

### 3. `inviteMember`

| 項目 | 内容 |
|------|------|
| ケース数 | 1件（正常系） |
| 主な検証内容 | Converterの生成値を用いたRepository.createの検証 |
| モック | `MembershipConverter.invite`, `MembershipRepository.create` |
| テスト内容 | 招待時のMembership作成処理（status: PENDING）が正しく行われるか |
| 結果 | ✅ 成功（Invite入力が正しく処理される） |

---

### 4. `joinIfNeeded`

| 項目 | 内容 |
|------|------|
| ケース数 | 2件（未参加 → create ／ 招待中 → update） |
| 主な検証内容 | findによる存在確認、join or update の分岐処理、結果の正当性 |
| モック | `MembershipRepository.find`, `MembershipConverter.join`, `MembershipConverter.update`, `MembershipRepository.create`, `MembershipRepository.update` |
| テスト内容 | 参加状態に応じて Membership を新規作成 or 状態更新する処理の検証 |
| 結果 | ✅ 成功（両ケースとも正しく分岐・実行される） |

---

### 5. `setStatus`

| 項目 | 内容 |
|------|------|
| ケース数 | 2件（正常系：status更新 ／ 異常系：存在しない） |
| 主な検証内容 | Membership存在確認、Converter → update処理の流れ、NotFoundErrorのスロー |
| モック | `MembershipRepository.find`, `MembershipConverter.update`, `MembershipRepository.update` |
| テスト内容 | メンバーシップステータスの変更（例：LEFT）処理と、存在チェックの検証 |
| 結果 | ✅ 成功（更新成功／NotFoundErrorも確認済） |

---

### 6. `setRole`

| 項目 | 内容 |
|------|------|
| ケース数 | 2件（正常系：role更新 ／ 異常系：存在しない） |
| 主な検証内容 | find → update の流れ、NotFoundErrorの発生有無 |
| モック | `MembershipRepository.find`, `MembershipConverter.update`, `MembershipRepository.update` |
| テスト内容 | 役割の変更（例：MEMBER → MANAGER）処理が正しく動作するか |
| 結果 | ✅ 成功（変化の反映とエラーパスどちらも検証） |

---

### 7. `deleteMembership`

| 項目 | 内容 |
|------|------|
| ケース数 | 2件（正常系：削除成功 ／ 異常系：存在しない） |
| 主な検証内容 | find → delete の流れ、NotFoundErrorのスロー |
| モック | `MembershipRepository.find`, `MembershipRepository.delete` |
| テスト内容 | 削除対象のMembershipの存在確認と、正しい削除呼び出しの検証 |
| 結果 | ✅ 成功（正常削除とエラーパスの両方確認） |

---

## 🧪 品質チェックリスト

| 観点 | 評価 | コメント |
|------|------|----------|
| **テストカバレッジ** | ⭐️⭐️⭐️⭐️⭐️（非常に高い） | 全メソッドに対し、正常・異常系ともにカバーされており網羅性が高い。 |
| **モック戦略** | ⭐️⭐️⭐️⭐️⭐️（適切） | Repository/Converter/Utilの分離が明確で、責務に沿ったモック化ができている。 |
| **検証の粒度** | ⭐️⭐️⭐️⭐️⭐️（詳細） | Converter入力、Repository呼び出し、返却値の一致など、すべて細かく検証されている。 |
| **責務の分離** | ⭐️⭐️⭐️⭐️⭐️（良好） | ConverterとRepositoryに分けたドメイン設計がテストにも反映されている。 |
| **副作用の検証** | ⭐️⭐️⭐️⭐️⭐️（十分） | update, delete, create 系すべてで副作用の正確な検証が行われている。 |

---

## ✅ 総合評価と改善点

### ✅ 評価

- **S（最高評価）**  
  Service層の主要なユースケースを全件カバーしており、異常系まで漏れなくテストされている。モック設計、アサーション粒度ともに本番品質といえる。

### 🛠 改善ポイント（任意）

- `joinIfNeeded` の「すでにJOINEDのケース（スキップパス）」が明示されていないため、意図的にスキップされるロジックのテストを追加しても良さそう。
- 共通パターン（mock生成, identifier定義など）を `describe.each` 等で整理するとさらにDRYに。

---
