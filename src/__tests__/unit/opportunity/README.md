# ✅ 単体テスト報告書｜OpportunityService ユニットテスト

## 📌 対象モジュール

- **対象クラス**：`OpportunityService`
- **依存モック**：
    - `OpportunityRepository`（find / create / update / delete / setPublishStatus）
    - `OpportunityConverter`（create / update）
    - `getCurrentUserId`（ユーザーID取得）
- **テスト対象メソッド**：
    - `createOpportunity`
    - `updateOpportunityContent`
    - `setOpportunityPublishStatus`
    - `deleteOpportunity`

---

## 🧪 テスト実施内容と結果

### 1. `createOpportunity`

| 項目 | 内容 |
|------|------|
| ケース数 | 3件（通常create／placeのwhere+createのバリデーション／新規place付きcreate） |
| 主な検証内容 | ConverterとRepositoryの呼び出し検証／ValidationErrorのスロー確認 |
| モック | `OpportunityConverter.create`, `OpportunityRepository.create` |
| テスト内容 | placeに `where` または `create` を含む場合の分岐、必要項目の変換と保存処理の正当性 |
| 結果 | ✅ 成功（正常createおよびValidationErrorのスロー確認済） |

---

### 2. `updateOpportunityContent`

| 項目 | 内容 |
|------|------|
| ケース数 | 2件（正常更新／ValidationError） |
| 主な検証内容 | Repository.find → Converter.update → Repository.update の一連の流れ |
| モック | `OpportunityRepository.find`, `OpportunityConverter.update`, `OpportunityRepository.update` |
| テスト内容 | contentの更新処理が、place入力の整合性とともに正しく行われるか |
| 結果 | ✅ 成功（正常更新と不正入力に対するバリデーション通過） |

---

### 3. `setOpportunityPublishStatus`

| 項目 | 内容 |
|------|------|
| ケース数 | 1件（正常系） |
| 主な検証内容 | Repository.findの結果に対する公開ステータス更新処理 |
| モック | `OpportunityRepository.find`, `OpportunityRepository.setPublishStatus` |
| テスト内容 | 公開ステータス（PublishStatus）の変更が正しく反映されるか |
| 結果 | ✅ 成功（期待されたステータスで更新される） |

---

### 4. `deleteOpportunity`

| 項目 | 内容 |
|------|------|
| ケース数 | 2件（正常削除／NotFoundError） |
| 主な検証内容 | Repository.find 結果に応じた削除または例外スロー |
| モック | `OpportunityRepository.find`, `OpportunityRepository.delete` |
| テスト内容 | 対象Opportunityの存在確認と削除の実行可否 |
| 結果 | ✅ 成功（正常削除・例外ケースともに確認済） |

---

## 🧪 品質チェックリスト

| 観点 | 評価 | コメント |
|------|------|----------|
| **テストカバレッジ** | ⭐️⭐️⭐️⭐️⭐️（高） | 正常・異常パスともに網羅され、特にplace入力の整合性に注目した設計がよくできている。 |
| **モック戦略** | ⭐️⭐️⭐️⭐️⭐️（適切） | Converter, Repository, Utilの責務を守ってモック化。spyOnとjest.mockを適切に使い分けている。 |
| **検証の粒度** | ⭐️⭐️⭐️⭐️⭐️（詳細） | Repository引数の `expect.objectContaining` による柔軟な検証も良い。 |
| **責務の分離** | ⭐️⭐️⭐️⭐️⭐️（明瞭） | createやupdateロジックをConverterに任せ、Service層では流れの検証に専念。 |
| **副作用の検証** | ⭐️⭐️⭐️⭐️（良好） | 削除・更新系処理に対しても呼び出し・結果の確認がされている。 |

---

## ✅ 総合評価と改善点

### ✅ 評価

- **S（最高評価）**  
  ConverterとRepositoryの役割を厳密に分離しつつ、place入力や公開ステータスといった細かいドメインルールもテスト対象に含めており、高い水準のユニットテスト群です。

### 🛠 改善ポイント（任意）

- `createOpportunity` における **place: create のケース** が `where` 付きになっていた点だけが小さなブレ。ここを補完するとより明瞭。
- `updateOpportunityContent` にて **画像（images）付きの更新ケース** も追加されるとベター。

---
